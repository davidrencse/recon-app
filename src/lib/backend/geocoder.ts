import { isInsideMetroVancouver } from "./geo";
import { getCachedPlace, setCachedPlace } from "./cachedPlaces";
import {
  getActiveCooldown,
  recordFailure,
  clearFailure,
  type GeoFailureReason,
} from "./geocodingFailures";

// ─── Config ───────────────────────────────────────────────────────────────────

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_UA  = "Recon-App/1.0 (cs.davidren@gmail.com)";
const THROTTLE_MS   = 1100;
const DAILY_CAP     = 100;
const PER_JOB_CAP   = 20;
// 24h — matches geocoding_failures.cooldown_until in DB
const COOLDOWN_MS   = 24 * 60 * 60 * 1000;

// ─── L1 in-memory cooldown cache (process lifetime) ──────────────────────────
//
// Key:   normalized query string
// Value: cooldown-until timestamp (ms since epoch)
//
// This avoids a DB round-trip for the same failing query within a single batch
// job. The DB (geocoding_failures) is the persistent source of truth.

const failedPlaces = new Map<string, number>();

async function isInCooldown(normalized: string): Promise<boolean> {
  // L1: check in-memory cache first
  const cachedUntil = failedPlaces.get(normalized);
  if (cachedUntil !== undefined) {
    if (Date.now() < cachedUntil) return true;
    failedPlaces.delete(normalized); // expired — evict
  }
  // L2: check DB for cross-invocation persistence
  const dbRow = await getActiveCooldown(normalized).catch(() => null);
  if (dbRow) {
    const dbUntil = new Date(dbRow.cooldownUntil).getTime();
    failedPlaces.set(normalized, dbUntil); // warm L1
    return true;
  }
  return false;
}

async function setCooldown(
  normalized: string,
  original:   string,
  reason:     GeoFailureReason,
): Promise<void> {
  failedPlaces.set(normalized, Date.now() + COOLDOWN_MS);       // L1
  await recordFailure(normalized, original, reason).catch(() => {}); // L2
}

async function removeCooldown(normalized: string): Promise<void> {
  failedPlaces.delete(normalized);                    // L1
  await clearFailure(normalized).catch(() => {});     // L2
}

// ─── Ambiguous / vague terms (g28/g29) ───────────────────────────────────────

const AMBIGUOUS_TERMS = new Set([
  "downtown", "downtown core", "uptown", "midtown",
  "main street", "the beach", "beach", "the park", "park",
  "station", "the station", "mall", "the mall", "street",
  "the waterfront", "waterfront", "road", "lane", "ave", "blvd",
  "drive", "court", "place", "way", "walk", "path",
]);

function isAmbiguous(normalized: string): boolean {
  return AMBIGUOUS_TERMS.has(normalized);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type GeoResult = {
  lat:         number;
  lng:         number;
  displayName: string | null;
  confidence:  number;
  fromCache:   boolean;
};

/** Returned when Nominatim resolved coordinates that fall outside Metro Vancouver. */
export type GeoBadBounds = { badBounds: true; lat: number; lng: number };

/**
 * null        = no result (ambiguous, cooldown, cap hit, Nominatim empty/error)
 * GeoBadBounds = resolved but outside Metro Vancouver bbox
 * GeoResult   = success (fromCache tells whether Nominatim was called)
 */
export type GeoResponse = GeoResult | GeoBadBounds | null;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

let lastCallAt     = 0;
let dailyCallCount = 0;
let dailyResetDate = "";

async function throttle(): Promise<void> {
  const elapsed = Date.now() - lastCallAt;
  if (elapsed < THROTTLE_MS) {
    await new Promise<void>((r) => setTimeout(r, THROTTLE_MS - elapsed));
  }
  lastCallAt = Date.now();
}

type NominatimHit = {
  lat:          string;
  lon:          string;
  display_name: string;
  importance:   number;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * Resolve a place name to coordinates.
 *
 * Pipeline:
 *   normalize → ambiguity gate → cooldown gate (L1 → DB) →
 *   cache lookup → daily-cap gate → per-job-cap gate →
 *   throttle → Nominatim → bounds validation → cache write
 *
 * @param placeName    Human-readable place name.
 * @param jobCallCount Nominatim calls already made this batch job (for per-job cap).
 */
export async function geocodePlace(
  placeName:    string,
  jobCallCount  = 0,
): Promise<GeoResponse> {
  const normalized = placeName.trim().toLowerCase();

  // g28/g29: Reject ambiguous / vague terms before any DB or Nominatim call.
  if (isAmbiguous(normalized)) {
    console.warn(`[geocoder] g36 ambiguous — skipped: "${normalized}"`);
    return null;
  }

  // g25/g35: Cooldown — check L1 cache then DB.
  if (await isInCooldown(normalized)) {
    console.warn(`[geocoder] g35 cooldown active — skipped: "${normalized}"`);
    return null;
  }

  // g17: Cache-first lookup.
  try {
    const cached = await getCachedPlace(normalized);
    if (cached) {
      if (!isInsideMetroVancouver(cached.lat, cached.lng)) {
        console.warn(`[geocoder] g37 cached place outside bounds (${cached.lat}, ${cached.lng}): "${normalized}"`);
        return { badBounds: true, lat: cached.lat, lng: cached.lng };
      }
      return {
        lat:         cached.lat,
        lng:         cached.lng,
        displayName: cached.displayName ?? cached.normalizedPlaceName ?? null,
        confidence:  cached.confidence ?? 0.9,
        fromCache:   true,
      };
    }
  } catch (err) {
    console.error("[geocoder] cache lookup failed:", err);
  }

  // g21/g33: Daily cap.
  const today = todayString();
  if (dailyResetDate !== today) {
    dailyCallCount = 0;
    dailyResetDate = today;
  }
  if (dailyCallCount >= DAILY_CAP) {
    console.warn(`[geocoder] g33 daily cap ${DAILY_CAP} reached — skipped: "${normalized}"`);
    return null;
  }

  // g22/g34: Per-job cap.
  if (jobCallCount >= PER_JOB_CAP) {
    console.warn(`[geocoder] g34 per-job cap ${PER_JOB_CAP} reached — skipped: "${normalized}"`);
    return null;
  }

  // g23: Global 1 req/sec throttle.
  await throttle();
  dailyCallCount++;

  try {
    // g27: Metro Vancouver context suffix; g24: custom User-Agent + Referer.
    const params = new URLSearchParams({
      q:            `${placeName}, Metro Vancouver, BC, Canada`,
      format:       "json",
      limit:        "1",
      countrycodes: "ca",
    });

    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        "User-Agent":      NOMINATIM_UA,
        "Accept-Language": "en",
        "Referer":         "https://recon.app",
      },
    });

    if (!res.ok) {
      console.error(`[geocoder] Nominatim HTTP ${res.status} for "${normalized}"`);
      await setCooldown(normalized, placeName, "nominatim_error");
      return null;
    }

    const data = (await res.json()) as NominatimHit[];

    if (!data.length) {
      console.warn(`[geocoder] Nominatim no result for "${normalized}"`);
      await setCooldown(normalized, placeName, "nominatim_empty");
      return null;
    }

    const hit         = data[0];
    const lat         = parseFloat(hit.lat);
    const lng         = parseFloat(hit.lon);
    const confidence  = Math.max(hit.importance ?? 0, 0.1);
    const displayName = hit.display_name ?? null;

    // g30/g37: Validate bounds.
    if (!isInsideMetroVancouver(lat, lng)) {
      console.warn(`[geocoder] g37 outside Metro Vancouver (${lat}, ${lng}) for "${normalized}"`);
      await setCooldown(normalized, placeName, "outside_bounds");
      return { badBounds: true, lat, lng };
    }

    // g31: Cache successful result (g32: setCachedPlace guards manual_override internally).
    await setCachedPlace({
      place_query:           normalized,
      normalized_place_name: placeName,
      display_name:          displayName,
      lat,
      lng,
      provider:              "nominatim",
      confidence,
    });

    // Clear any existing failure record for this query.
    await removeCooldown(normalized);

    return { lat, lng, displayName, confidence, fromCache: false };
  } catch (err) {
    console.error("[geocoder] geocodePlace error:", err);
    await setCooldown(normalized, placeName, "nominatim_error");
    return null;
  }
}

// ─── Test helpers (not for production use) ───────────────────────────────────

export const _testInternals = {
  /** Set an active cooldown (expires COOLDOWN_MS from now). */
  setActiveCooldown:  (place: string) =>
    failedPlaces.set(place.trim().toLowerCase(), Date.now() + COOLDOWN_MS),
  /** Set an expired cooldown (for testing retry behavior). */
  setExpiredCooldown: (place: string) =>
    failedPlaces.set(place.trim().toLowerCase(), Date.now() - 1000),
  clearFailedPlace:   (place: string)  => failedPlaces.delete(place.trim().toLowerCase()),
  clearAllFailed:     ()               => failedPlaces.clear(),
  resetThrottle:      ()               => { lastCallAt = 0; },
  resetDailyCount:    ()               => { dailyCallCount = 0; dailyResetDate = ""; },
  setDailyCount:      (n: number)      => { dailyCallCount = n; dailyResetDate = todayString(); },
  DAILY_CAP,
  PER_JOB_CAP,
  COOLDOWN_MS,
  THROTTLE_MS,
};
