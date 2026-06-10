import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getRecentIngestionJobs } from "@/lib/backend/ingestionJobs";

export const dynamic = "force-dynamic";

/** COUNT(*) with an optional single equality filter. Returns null on error. */
async function countRows(
  table: string,
  filter?: { column: string; value: string }
): Promise<number | null> {
  const base = supabaseServer
    .from(table)
    .select("*", { count: "exact", head: true });

  const query = filter ? base.eq(filter.column, filter.value) : base;

  const { count, error } = await query;
  if (error) {
    console.error(`[health/detailed] count ${table} failed:`, error.message);
    return null;
  }
  return count ?? 0;
}

export async function GET(request: NextRequest) {
  // e15: Protect with CRON_SECRET
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // e16-e21: Parallel stat queries — each fails independently
  const [
    activePinCount,
    expiredPinCount,
    processedPostCount,
    cachedPlaceCount,
    failedJobCount,
    recentJobs,
  ] = await Promise.all([
    countRows("pins", { column: "status", value: "active" }),         // e17
    countRows("pins", { column: "status", value: "expired" }),        // e18
    countRows("processed_posts"),                                       // e19
    countRows("cached_places"),                                         // e20
    countRows("ingestion_jobs", { column: "status", value: "failed" }), // e21
    getRecentIngestionJobs(1),                                          // e16
  ]);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    pins: {
      active: activePinCount,
      expired: expiredPinCount,
    },
    tables: {
      processedPosts: processedPostCount,
      cachedPlaces: cachedPlaceCount,
    },
    ingestion: {
      lastJob: recentJobs[0] ?? null,    // e16
      failedJobCount,                     // e21
    },
    env: {
      cronSecret: !!process.env.CRON_SECRET,
      ingestSecret: !!process.env.INGEST_SECRET,
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });
}
