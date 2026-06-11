import { supabaseServer } from "@/lib/supabase/server";

export type PruneResult = {
  processedPostsPruned: number;
  ingestionJobsPruned:  number;
  geocodingFailuresPruned: number;
  errors: string[];
};

const PROCESSED_POSTS_KEEP_DAYS = 30;
const INGESTION_JOBS_KEEP_DAYS  = 14;
const GEOCODING_FAILURES_KEEP_DAYS = 2; // cooldown_until already expired

export async function pruneOldRows(): Promise<PruneResult> {
  const errors: string[] = [];
  let processedPostsPruned   = 0;
  let ingestionJobsPruned    = 0;
  let geocodingFailuresPruned = 0;

  const now = new Date();

  // processed_posts older than 30 days
  const ppCutoff = new Date(now.getTime() - PROCESSED_POSTS_KEEP_DAYS * 86_400_000).toISOString();
  const { error: ppErr, count: ppCount } = await supabaseServer
    .from("processed_posts")
    .delete({ count: "exact" })
    .lt("first_seen_at", ppCutoff);
  if (ppErr) {
    errors.push(`processed_posts prune failed: ${ppErr.message}`);
  } else {
    processedPostsPruned = ppCount ?? 0;
  }

  // ingestion_jobs older than 14 days
  const ijCutoff = new Date(now.getTime() - INGESTION_JOBS_KEEP_DAYS * 86_400_000).toISOString();
  const { error: ijErr, count: ijCount } = await supabaseServer
    .from("ingestion_jobs")
    .delete({ count: "exact" })
    .lt("started_at", ijCutoff);
  if (ijErr) {
    errors.push(`ingestion_jobs prune failed: ${ijErr.message}`);
  } else {
    ingestionJobsPruned = ijCount ?? 0;
  }

  // geocoding_failures where cooldown_until is already past (fully expired, no longer useful)
  const gfCutoff = new Date(now.getTime() - GEOCODING_FAILURES_KEEP_DAYS * 86_400_000).toISOString();
  const { error: gfErr, count: gfCount } = await supabaseServer
    .from("geocoding_failures")
    .delete({ count: "exact" })
    .lt("cooldown_until", gfCutoff);
  if (gfErr) {
    errors.push(`geocoding_failures prune failed: ${gfErr.message}`);
  } else {
    geocodingFailuresPruned = gfCount ?? 0;
  }

  console.log(
    `[pruneOldRows] processed_posts=${processedPostsPruned} ` +
    `ingestion_jobs=${ingestionJobsPruned} ` +
    `geocoding_failures=${geocodingFailuresPruned}`
  );

  return { processedPostsPruned, ingestionJobsPruned, geocodingFailuresPruned, errors };
}
