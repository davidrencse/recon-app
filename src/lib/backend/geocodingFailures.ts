import { supabaseServer } from "@/lib/supabase/server";

export type GeoFailureReason =
  | "nominatim_empty"
  | "nominatim_error"
  | "outside_bounds";

export type GeoFailureRow = {
  normalizedQuery: string;
  originalQuery:   string;
  reason:          string;
  failureCount:    number;
  lastFailedAt:    string;
  cooldownUntil:   string;
  createdAt:       string;
  updatedAt:       string;
};

const COOLDOWN_HOURS = 24;

function rowToFailure(row: Record<string, unknown>): GeoFailureRow {
  return {
    normalizedQuery: row.normalized_query as string,
    originalQuery:   row.original_query   as string,
    reason:          row.reason           as string,
    failureCount:    row.failure_count    as number,
    lastFailedAt:    row.last_failed_at   as string,
    cooldownUntil:   row.cooldown_until   as string,
    createdAt:       row.created_at       as string,
    updatedAt:       row.updated_at       as string,
  };
}

/**
 * Returns the failure row if the query is currently within its cooldown window,
 * null otherwise. Never throws — errors are logged and treated as no cooldown.
 */
export async function getActiveCooldown(normalizedQuery: string): Promise<GeoFailureRow | null> {
  const { data, error } = await supabaseServer
    .from("geocoding_failures")
    .select("*")
    .eq("normalized_query", normalizedQuery)
    .gt("cooldown_until", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("[geocodingFailures] getActiveCooldown failed:", error.message);
    return null;
  }

  return data ? rowToFailure(data as Record<string, unknown>) : null;
}

/**
 * Upsert a failure record. Increments failure_count and extends cooldown by COOLDOWN_HOURS.
 * Never throws.
 */
export async function recordFailure(
  normalizedQuery: string,
  originalQuery:   string,
  reason:          GeoFailureReason,
): Promise<void> {
  const now          = new Date();
  const cooldownUntil = new Date(now.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000);

  // Fetch existing count so we can increment it atomically in the upsert payload.
  const { data: existing } = await supabaseServer
    .from("geocoding_failures")
    .select("failure_count")
    .eq("normalized_query", normalizedQuery)
    .maybeSingle();

  const prevCount = (existing as { failure_count: number } | null)?.failure_count ?? 0;

  const { error } = await supabaseServer
    .from("geocoding_failures")
    .upsert(
      {
        normalized_query: normalizedQuery,
        original_query:   originalQuery,
        reason,
        failure_count:    prevCount + 1,
        last_failed_at:   now.toISOString(),
        cooldown_until:   cooldownUntil.toISOString(),
        updated_at:       now.toISOString(),
      },
      { onConflict: "normalized_query", ignoreDuplicates: false },
    );

  if (error) {
    console.error("[geocodingFailures] recordFailure failed:", error.message);
  }
}

/**
 * Delete the failure row for a query (called after successful geocoding).
 * Never throws.
 */
export async function clearFailure(normalizedQuery: string): Promise<void> {
  const { error } = await supabaseServer
    .from("geocoding_failures")
    .delete()
    .eq("normalized_query", normalizedQuery);

  if (error) {
    console.error("[geocodingFailures] clearFailure failed:", error.message);
  }
}
