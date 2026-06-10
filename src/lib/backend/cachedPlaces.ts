import { supabaseServer } from "@/lib/supabase/server";
import type { CachedPlace, CachedPlaceInsert } from "@/types/backend";

function rowToPlace(row: Record<string, unknown>): CachedPlace {
  return {
    id:                   row.id as string,
    placeQuery:           row.place_query as string,
    normalizedPlaceName:  (row.normalized_place_name as string) ?? null,
    displayName:          (row.display_name as string)          ?? null,
    lat:                  row.lat as number,
    lng:                  row.lng as number,
    provider:             row.provider as string,
    confidence:           (row.confidence as number)            ?? null,
    manualOverride:       row.manual_override as boolean,
    createdAt:            row.created_at as string,
    updatedAt:            row.updated_at as string,
    lastUsedAt:           (row.last_used_at as string)          ?? null,
  };
}

/**
 * Look up a cached geocode result by the normalized query string.
 * Bumps last_used_at on a hit.
 */
export async function getCachedPlace(placeQuery: string): Promise<CachedPlace | null> {
  const normalized = placeQuery.trim().toLowerCase();

  const { data, error } = await supabaseServer
    .from("cached_places")
    .select("*")
    .eq("place_query", normalized)
    .maybeSingle();

  if (error) {
    console.error("[cachedPlaces] getCachedPlace failed:", error.message);
    return null;
  }

  if (!data) return null;

  // Update last_used_at without awaiting — fire-and-forget, don't block the caller.
  supabaseServer
    .from("cached_places")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", (data as { id: string }).id)
    .then(({ error: e }) => {
      if (e) console.error("[cachedPlaces] last_used_at update failed:", e.message);
    });

  return rowToPlace(data as Record<string, unknown>);
}

/**
 * Store a geocode result. Upserts on place_query.
 * manual_override rows cannot be overwritten by this function.
 */
export async function setCachedPlace(input: CachedPlaceInsert): Promise<CachedPlace | null> {
  const normalized = input.place_query.trim().toLowerCase();

  // Don't overwrite manual_override rows.
  const existing = await getCachedPlace(normalized);
  if (existing?.manualOverride) return existing;

  const { data, error } = await supabaseServer
    .from("cached_places")
    .upsert(
      {
        place_query:           normalized,
        normalized_place_name: input.normalized_place_name ?? null,
        display_name:          input.display_name          ?? null,
        lat:                   input.lat,
        lng:                   input.lng,
        provider:              input.provider              ?? "nominatim",
        confidence:            input.confidence            ?? null,
        manual_override:       input.manual_override       ?? false,
        updated_at:            new Date().toISOString(),
        last_used_at:          new Date().toISOString(),
      },
      { onConflict: "place_query", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    console.error("[cachedPlaces] setCachedPlace failed:", error.message);
    return null;
  }

  return rowToPlace(data as Record<string, unknown>);
}
