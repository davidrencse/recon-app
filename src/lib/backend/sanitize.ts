import type { DbPin, Pin } from "@/types/pin";

/** Map a raw DB row to a client-safe Pin. Returns null for non-active pins. */
export function sanitizePinForClient(row: DbPin): Pin | null {
  if (row.status !== "active") return null;

  return {
    postId:            row.post_id,
    source:            row.source,
    postUrl:           row.post_url ?? "",
    creatorHandle:     row.creator_handle ?? "",
    text:              row.text,
    category:          row.category,
    placeName:         row.place_name,
    neighborhood:      row.neighborhood,
    lat:               row.lat,
    lng:               row.lng,
    createdAt:         row.created_at,
    fetchedAt:         row.fetched_at,
    expiresAt:         row.expires_at,
    locationConfidence: 1,
    status:            row.status,
    activityScore:     row.activity_score,
    crowdLevel:        row.crowd_level,
    tags:              row.tags,
  };
}
