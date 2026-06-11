import { supabaseServer } from "@/lib/supabase/server";

/**
 * Required columns per table. Extend this map as the schema evolves.
 * The audit queries each table with exactly these columns and reports any that
 * are missing before ingestion features rely on them.
 */
const REQUIRED_COLUMNS: Record<string, string[]> = {
  pins: [
    "id", "post_id", "source", "post_url", "creator_handle", "text", "category",
    "place_name", "neighborhood", "lat", "lng",
    "status", "expires_at", "created_at", "fetched_at",
    "activity_score", "crowd_level", "tags",
  ],
  processed_posts: [
    "id", "source", "post_id", "post_url", "creator_handle", "category", "text",
    "processing_status", "first_seen_at", "last_seen_at", "rejection_reason", "raw_source",
  ],
  cached_places: [
    "id", "place_query", "normalized_place_name", "display_name", "lat", "lng",
    "provider", "confidence", "manual_override", "created_at", "updated_at", "last_used_at",
  ],
  ingestion_jobs: [
    "id", "source", "status", "started_at", "finished_at",
    "posts_fetched", "posts_rejected", "posts_accepted",
    "pins_inserted", "geocode_calls_made", "error_message",
  ],
  pin_audit_log: [
    "id", "pin_id", "post_id", "event_type",
    "previous_status", "new_status", "reason", "source", "created_at",
  ],
  geocoding_failures: [
    "normalized_query", "original_query", "reason",
    "failure_count", "last_failed_at", "cooldown_until",
    "created_at", "updated_at",
  ],
};

export type SchemaAuditResult = {
  ok: boolean;
  checked: string[];
  missing: { table: string; column: string }[];
  errors: { table: string; message: string }[];
};

/**
 * Verify that all required columns exist in each table by running a
 * zero-row SELECT. Postgres will error on any unknown column name.
 * Call this at startup or in /api/health before enabling ingestion.
 */
export async function auditSchema(): Promise<SchemaAuditResult> {
  const missing: { table: string; column: string }[] = [];
  const errors:  { table: string; message: string }[] = [];
  const checked: string[] = [];

  for (const [table, columns] of Object.entries(REQUIRED_COLUMNS)) {
    const selectStr = columns.join(", ");

    const { error } = await supabaseServer
      .from(table)
      .select(selectStr)
      .limit(0);

    checked.push(table);

    if (!error) continue;

    // Postgres reports missing columns as:
    // 'column "xyz" does not exist'
    const match = error.message.match(/column "([^"]+)" does not exist/);
    if (match) {
      missing.push({ table, column: match[1] });
    } else {
      errors.push({ table, message: error.message });
    }
  }

  return {
    ok:      missing.length === 0 && errors.length === 0,
    checked,
    missing,
    errors,
  };
}

/**
 * Throws if the schema audit fails. Use this as a guard at the top of
 * ingestion handlers before any pipeline logic runs.
 */
export async function requireSchema(): Promise<void> {
  const result = await auditSchema();
  if (!result.ok) {
    const detail = [
      ...result.missing.map((m) => `missing column "${m.column}" on ${m.table}`),
      ...result.errors.map((e) => `error on ${e.table}: ${e.message}`),
    ].join("; ");
    throw new Error(`Schema audit failed: ${detail}`);
  }
}
