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

// Short-lived client cache so navigating between /home, /dashboard, and the map
// (or re-mounting components) reuses a recent response instead of re-hitting the
// DB on every mount. In-flight requests for the same query are also deduped so
// concurrent callers share one network round-trip.
const TTL_MS = 15_000;
type CacheEntry = { at: number; pins: Pin[] };
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<Pin[]>>();

export async function getPins(opts: GetPinsOptions = {}): Promise<Pin[]> {
  const params = new URLSearchParams();
  if (opts.category) params.set("category", opts.category);
  if (opts.neighborhood) params.set("neighborhood", opts.neighborhood);
  params.set("limit", String(opts.limit ?? 200));
  const key = params.toString();

  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.pins;

  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const res = await fetch(`/api/pins?${key}`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`GET /api/pins failed: ${res.status}`);
    }
    const json: PinsApiResponse = await res.json();
    const pins = json.pins.map(dbPinToPin);
    cache.set(key, { at: Date.now(), pins });
    return pins;
  })();

  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}
