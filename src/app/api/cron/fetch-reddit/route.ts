import { NextRequest, NextResponse } from "next/server";
import { collectRedditBatch } from "@/lib/backend/redditCollector";
import { processIngestBatch } from "@/lib/backend/ingestBatch";
import { safeError } from "@/lib/backend/safeLog";
import { checkRateLimit, getClientIp } from "@/lib/backend/rateLimit";

export const dynamic = "force-dynamic";

/** Vercel cron sends GET with Authorization: Bearer <CRON_SECRET>;
 *  manual triggers may send x-cron-secret. */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (request.headers.get("authorization") === `Bearer ${secret}`) return true;
  if (request.headers.get("x-cron-secret") === secret) return true;
  return false;
}

async function run(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Rate limit — 5 invocations per minute per IP (Vercel cron is one IP).
  const ip = getClientIp(request);
  const rl = checkRateLimit(`cron-reddit:${ip}`, 5, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  try {
    const { batch, errors } = await collectRedditBatch();
    const summary = await processIngestBatch(batch);
    return NextResponse.json({ ...summary, collectorErrors: errors }, { status: 200 });
  } catch (err) {
    safeError("fetch-reddit", err);
    const msg = err instanceof Error ? err.message : "Reddit collection failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return run(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return run(request);
}
