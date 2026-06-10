import { NextRequest, NextResponse } from "next/server";
import { validateIngestBatch, processIngestBatch } from "@/lib/backend/ingestBatch";

export const dynamic = "force-dynamic";

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

  // f18: Parse JSON body
  let body: unknown;
  try {
    body = await request.json();
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
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[source-batch] Unhandled error:", msg);
    return NextResponse.json(
      { error: "Batch processing failed.", detail: msg },
      { status: 500 }
    );
  }
}
