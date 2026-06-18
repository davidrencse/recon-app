import type { Pin, DbPin, PinCategory, PinsApiResponse } from "@/types/pin";

function dbPinToPin(row: DbPin): Pin {
  return {
    postId: row.post_id,
    source: row.source,
    postUrl: row.post_url ?? "",
    creatorHandle: row.creator_handle ?? "",
    text: row.text,
    category: row.category,
    placeName: row.place_name,
    neighborhood: row.neighborhood,
    lat: row.lat,
    lng: row.lng,
    createdAt: row.created_at,
    fetchedAt: row.fetched_at,
    expiresAt: row.expires_at,
    locationConfidence: 1,
    status: row.status,
    activityScore: row.activity_score,
    crowdLevel: row.crowd_level,
    tags: row.tags ?? [],
  };
}

export type GetPinsOptions = {
  category?: PinCategory;
  neighborhood?: string;
  limit?: number;
};

export async function getPins(opts: GetPinsOptions = {}): Promise<Pin[]> {
  const params = new URLSearchParams();
  if (opts.category) params.set("category", opts.category);
  if (opts.neighborhood) params.set("neighborhood", opts.neighborhood);
  params.set("limit", String(opts.limit ?? 200));

  const res = await fetch(`/api/pins?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GET /api/pins failed: ${res.status}`);
  }

  const json: PinsApiResponse = await res.json();
  return json.pins.map(dbPinToPin);
}
