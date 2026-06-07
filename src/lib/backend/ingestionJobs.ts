import { supabaseServer } from "@/lib/supabase/server";
import type { IngestionJob, IngestionJobStart, IngestionJobFinish } from "@/types/backend";

function rowToJob(row: Record<string, unknown>): IngestionJob {
  return {
    id:                row.id as string,
    source:            row.source as string,
    status:            row.status as IngestionJob["status"],
    startedAt:         row.started_at as string,
    finishedAt:        (row.finished_at as string) ?? null,
    category:          (row.category as IngestionJob["category"]) ?? null,
    queryUsed:         (row.query_used as string) ?? null,
    postsFetched:      (row.posts_fetched as number) ?? 0,
    postsRejected:     (row.posts_rejected as number) ?? 0,
    postsAccepted:     (row.posts_accepted as number) ?? 0,
    pinsInserted:      (row.pins_inserted as number) ?? 0,
    geocodeCallsMade:  (row.geocode_calls_made as number) ?? 0,
    errorMessage:      (row.error_message as string) ?? null,
    metadata:          (row.metadata as Record<string, unknown>) ?? null,
    createdAt:         row.created_at as string,
  };
}

/** Create a job row at the start of an ingestion run. Returns the job id. */
export async function startIngestionJob(input: IngestionJobStart): Promise<string | null> {
  const { data, error } = await supabaseServer
    .from("ingestion_jobs")
    .insert({
      source:     input.source,
      status:     "running",
      category:   input.category ?? null,
      query_used: input.query_used ?? null,
      metadata:   input.metadata ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[ingestionJobs] startIngestionJob failed:", error.message);
    return null;
  }

  return (data as { id: string }).id;
}

/** Update a running job with final stats and status. */
export async function finishIngestionJob(
  jobId: string,
  finish: IngestionJobFinish
): Promise<boolean> {
  const { error } = await supabaseServer
    .from("ingestion_jobs")
    .update({
      status:             finish.status,
      finished_at:        new Date().toISOString(),
      posts_fetched:      finish.posts_fetched      ?? 0,
      posts_rejected:     finish.posts_rejected     ?? 0,
      posts_accepted:     finish.posts_accepted     ?? 0,
      pins_inserted:      finish.pins_inserted      ?? 0,
      geocode_calls_made: finish.geocode_calls_made ?? 0,
      error_message:      finish.error_message      ?? null,
      metadata:           finish.metadata           ?? null,
    })
    .eq("id", jobId);

  if (error) {
    console.error("[ingestionJobs] finishIngestionJob failed:", error.message);
    return false;
  }

  return true;
}

/** Mark a running job as failed with an error message. */
export async function failIngestionJob(jobId: string, errorMessage: string): Promise<boolean> {
  return finishIngestionJob(jobId, { status: "failed", error_message: errorMessage });
}

/** Fetch the most recent N ingestion jobs. */
export async function getRecentIngestionJobs(limit = 20): Promise<IngestionJob[]> {
  const { data, error } = await supabaseServer
    .from("ingestion_jobs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[ingestionJobs] getRecentIngestionJobs failed:", error.message);
    return [];
  }

  return (data ?? []).map(rowToJob);
}
