import { supabaseServer } from "@/lib/supabase/server";
import type { ProcessedPost, ProcessedPostInsert } from "@/types/backend";

function rowToPost(row: Record<string, unknown>): ProcessedPost {
  return {
    id:               row.id as string,
    source:           row.source as string,
    postId:           row.post_id as string,
    postUrl:          (row.post_url as string)          ?? null,
    creatorHandle:    (row.creator_handle as string)    ?? null,
    category:         (row.category as ProcessedPost["category"]) ?? null,
    text:             (row.text as string)              ?? null,
    firstSeenAt:      row.first_seen_at as string,
    lastSeenAt:       row.last_seen_at as string,
    processingStatus: row.processing_status as ProcessedPost["processingStatus"],
    rejectionReason:  (row.rejection_reason as string)  ?? null,
    rawSource:        (row.raw_source as Record<string, unknown>) ?? null,
    createdAt:        row.created_at as string,
    updatedAt:        row.updated_at as string,
  };
}

/**
 * Check whether a source post has already been processed.
 * Returns the existing record if found, null otherwise.
 */
export async function isPostProcessed(
  source: string,
  postId: string
): Promise<ProcessedPost | null> {
  const { data, error } = await supabaseServer
    .from("processed_posts")
    .select("*")
    .eq("source", source)
    .eq("post_id", postId)
    .maybeSingle();

  if (error) {
    console.error("[processedPosts] isPostProcessed failed:", error.message);
    return null;
  }

  return data ? rowToPost(data as Record<string, unknown>) : null;
}

/**
 * Record a processed post. If (source, post_id) already exists, bump last_seen_at
 * and update processing_status. Otherwise insert.
 */
export async function recordProcessedPost(
  input: ProcessedPostInsert
): Promise<ProcessedPost | null> {
  const { data, error } = await supabaseServer
    .from("processed_posts")
    .upsert(
      {
        source:            input.source,
        post_id:           input.post_id,
        post_url:          input.post_url          ?? null,
        creator_handle:    input.creator_handle    ?? null,
        category:          input.category          ?? null,
        text:              input.text              ?? null,
        processing_status: input.processing_status,
        rejection_reason:  input.rejection_reason  ?? null,
        raw_source:        input.raw_source        ?? null,
        last_seen_at:      new Date().toISOString(),
        updated_at:        new Date().toISOString(),
      },
      { onConflict: "source,post_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    console.error("[processedPosts] recordProcessedPost failed:", error.message);
    return null;
  }

  return rowToPost(data as Record<string, unknown>);
}

/** Fetch recent processed posts for debugging / monitoring. */
export async function getRecentProcessedPosts(
  limit = 50,
  status?: ProcessedPost["processingStatus"]
): Promise<ProcessedPost[]> {
  let query = supabaseServer
    .from("processed_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("processing_status", status);

  const { data, error } = await query;

  if (error) {
    console.error("[processedPosts] getRecentProcessedPosts failed:", error.message);
    return [];
  }

  return (data ?? []).map(rowToPost);
}
