import { NextRequest, NextResponse } from "next/server";
import { validateIngestBatch, processIngestBatch } from "@/lib/backend/ingestBatch";
import { safeError } from "@/lib/backend/safeLog";
import { checkRateLimit, getClientIp } from "@/lib/backend/rateLimit";

export const dynamic = "force-dynamic";

// i17: Reject bodies larger than 1 MB before JSON parse.
const MAX_BODY_BYTES = 1_048_576;

/** Accept x-ingest-secret (INGEST_SECRET) or fall back to x-cron-secret (CRON_SECRET). */
function isAuthorized(request: NextRequest): boolean {
  const ingestSecret = process.env.INGEST_SECRET;
  const cronSecret   = process.env.CRON_SECRET;

  if (ingestSecret && request.headers.get("x-ingest-secret") === ingestSecret) return true;
  if (cronSecret   && request.headers.get("x-cron-secret")   === cronSecret)   return true;
  return false;
}

export async function POST(request: NextRequest) {
  // f16/f17: Auth guard
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // i16: Rate limit — 20 requests per 5 minutes per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(`ingest:${ip}`, 20, 5 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    );
  }

  // i17: Payload size guard — check Content-Length first, then byte count
  const contentLength = Number(request.headers.get("content-length") ?? NaN);
  if (!Number.isNaN(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  // f18: Parse JSON body — buffer the body to enforce byte cap even if no Content-Length
  let body: unknown;
  try {
    const buf = new Uint8Array(await request.arrayBuffer());
    if (buf.byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }
    body = JSON.parse(new TextDecoder().decode(buf));
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // f19: Validate batch-level fields
  const batchCheck = validateIngestBatch(body);
  if (!batchCheck.valid) {
    return NextResponse.json({ error: batchCheck.error }, { status: 400 });
  }

  // f20–f33: Process the batch
  try {
    const summary = await processIngestBatch(batchCheck.batch);
    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    safeError("source-batch", err);
    return NextResponse.json(
      { error: "Batch processing failed." },
      { status: 500 }
    );
  }
}
