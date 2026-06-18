import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { geocodePlace, _testInternals, type GeoResult, type GeoBadBounds } from "../geocoder";
import { getCachedPlace, setCachedPlace } from "../cachedPlaces";
import { getActiveCooldown, recordFailure, clearFailure } from "../geocodingFailures";

vi.mock("../cachedPlaces", () => ({
  getCachedPlace: vi.fn(),
  setCachedPlace: vi.fn(),
}));

vi.mock("../geocodingFailures", () => ({
  getActiveCooldown: vi.fn(),
  recordFailure:     vi.fn(),
  clearFailure:      vi.fn(),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VANCOUVER_HIT = {
  lat:          "49.3017",
  lon:          "-123.1417",
  display_name: "Stanley Park, Vancouver, BC, Canada",
  importance:   0.9,
};

const TORONTO_HIT = {
  lat:          "43.6426",
  lon:          "-79.3871",
  display_name: "CN Tower, Toronto, ON, Canada",
  importance:   0.8,
};

const MOCK_CACHED = {
  id:                  "uuid-1",
  placeQuery:          "stanley park",
  normalizedPlaceName: "Stanley Park",
  displayName:         "Stanley Park, Vancouver",
  lat:                 49.3017,
  lng:                 -123.1417,
  provider:            "nominatim",
  confidence:          0.9,
  manualOverride:      false,
  createdAt:           new Date().toISOString(),
  updatedAt:           new Date().toISOString(),
  lastUsedAt:          null,
};

const ACTIVE_FAILURE_ROW = {
  normalizedQuery: "yaletown",
  originalQuery:   "Yaletown",
  reason:          "nominatim_empty",
  failureCount:    1,
  lastFailedAt:    new Date().toISOString(),
  cooldownUntil:   new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1h from now
  createdAt:       new Date().toISOString(),
  updatedAt:       new Date().toISOString(),
};

function mockNominatim(hits: object[] = []) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok:   true,
    json: async () => hits,
  }));
}

// ─── Reset between tests ──────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  _testInternals.resetDailyCount();
  _testInternals.clearAllFailed();
  _testInternals.resetThrottle();
  // Default: no cached place, no active cooldown, no DB failures
  vi.mocked(getCachedPlace).mockResolvedValue(null);
  vi.mocked(setCachedPlace).mockResolvedValue(null);
  vi.mocked(getActiveCooldown).mockResolvedValue(null);
  vi.mocked(recordFailure).mockResolvedValue(undefined);
  vi.mocked(clearFailure).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ─── g38: Cache-first behavior ───────────────────────────────────────────────

describe("g38 — cache-first behavior", () => {
  it("returns fromCache=true without calling Nominatim when cache hits", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce(MOCK_CACHED);
    mockNominatim([VANCOUVER_HIT]);

    const result = await geocodePlace("Stanley Park");

    expect(result).not.toBeNull();
    expect((result as GeoResult).fromCache).toBe(true);
    expect((result as GeoResult).lat).toBe(49.3017);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls Nominatim and returns fromCache=false on cache miss", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([VANCOUVER_HIT]);

    const result = await geocodePlace("Gastown", 0);

    expect((result as GeoResult).fromCache).toBe(false);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("calls setCachedPlace on Nominatim success", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([VANCOUVER_HIT]);

    await geocodePlace("Gastown", 0);

    expect(setCachedPlace).toHaveBeenCalledOnce();
  });

  it("does not call setCachedPlace on cache hit", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce(MOCK_CACHED);
    mockNominatim([]);

    await geocodePlace("Stanley Park");

    expect(setCachedPlace).not.toHaveBeenCalled();
  });
});

// ─── g39: manual_override rows ───────────────────────────────────────────────

describe("g39 — manual_override rows", () => {
  it("serves manual_override cached place without calling Nominatim", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce({ ...MOCK_CACHED, manualOverride: true });
    mockNominatim([]);

    const result = await geocodePlace("Stanley Park");

    expect((result as GeoResult).fromCache).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not call setCachedPlace when serving any cache hit", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce({ ...MOCK_CACHED, manualOverride: true });
    mockNominatim([]);

    await geocodePlace("Stanley Park");

    expect(setCachedPlace).not.toHaveBeenCalled();
  });

  it("getCachedPlace is called before fetch — manual rows are respected first", async () => {
    const getCalled: string[] = [];
    vi.mocked(getCachedPlace).mockImplementationOnce(async (q) => {
      getCalled.push(q);
      return MOCK_CACHED;
    });
    vi.stubGlobal("fetch", vi.fn());

    await geocodePlace("Stanley Park");

    expect(getCalled).toHaveLength(1);
    expect(fetch).not.toHaveBeenCalled();
  });
});

// ─── g40: Daily cap ───────────────────────────────────────────────────────────

describe("g40 — daily cap", () => {
  it("returns null when daily cap is reached", async () => {
    _testInternals.setDailyCount(_testInternals.DAILY_CAP);
    mockNominatim([VANCOUVER_HIT]);

    const result = await geocodePlace("Gastown");

    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("allows call when one under daily cap", async () => {
    _testInternals.setDailyCount(_testInternals.DAILY_CAP - 1);
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([VANCOUVER_HIT]);

    const result = await geocodePlace("Gastown", 0);

    expect(fetch).toHaveBeenCalledOnce();
    expect(result).not.toBeNull();
  }, 3000);

  it("resets after resetDailyCount", async () => {
    _testInternals.setDailyCount(_testInternals.DAILY_CAP);
    _testInternals.resetDailyCount();
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([VANCOUVER_HIT]);

    const result = await geocodePlace("Gastown", 0);

    expect(fetch).toHaveBeenCalled();
    expect(result).not.toBeNull();
  }, 3000);
});

// ─── g41: Per-job cap ────────────────────────────────────────────────────────

describe("g41 — per-job cap", () => {
  it("returns null when per-job cap is reached", async () => {
    mockNominatim([VANCOUVER_HIT]);

    const result = await geocodePlace("Gastown", _testInternals.PER_JOB_CAP);

    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("allows call when one under per-job cap", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([VANCOUVER_HIT]);

    const result = await geocodePlace("Gastown", _testInternals.PER_JOB_CAP - 1);

    expect(fetch).toHaveBeenCalledOnce();
    expect(result).not.toBeNull();
  }, 3000);

  it("cache hit bypasses per-job cap entirely", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce(MOCK_CACHED);
    mockNominatim([]);

    const result = await geocodePlace("Stanley Park", _testInternals.PER_JOB_CAP + 100);

    expect((result as GeoResult).fromCache).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });
});

// ─── g42: Throttle ───────────────────────────────────────────────────────────

describe("g42 — 1 req/sec throttle", () => {
  it("THROTTLE_MS constant is 1100", () => {
    expect(_testInternals.THROTTLE_MS).toBe(1100);
  });

  it("enforces minimum THROTTLE_MS between Nominatim calls", async () => {
    vi.mocked(getCachedPlace).mockResolvedValue(null);
    mockNominatim([VANCOUVER_HIT]);

    const t0 = Date.now();
    await geocodePlace("Gastown",  0);
    await geocodePlace("Yaletown", 1);
    const elapsed = Date.now() - t0;

    expect(elapsed).toBeGreaterThanOrEqual(_testInternals.THROTTLE_MS);
  }, 5000);
});

// ─── g43: Ambiguous place rejection ──────────────────────────────────────────

describe("g43 — ambiguous place rejection", () => {
  // NOTE: "downtown" and "waterfront" are intentionally NOT ambiguous — they
  // resolve to real Vancouver places (Downtown Vancouver / Waterfront Station).
  const ambiguous = [
    "park", "beach", "the beach", "mall",
    "station", "street",
    "the park", "the mall", "the station",
  ];

  it.each(ambiguous)("rejects '%s' before DB or Nominatim", async (place) => {
    mockNominatim([VANCOUVER_HIT]);

    const result = await geocodePlace(place);

    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    // Ambiguity rejects before cooldown check — no DB call
    expect(getActiveCooldown).not.toHaveBeenCalled();
  });

  it("accepts specific qualified names", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce(MOCK_CACHED);
    const result = await geocodePlace("Stanley Park");
    expect(result).not.toBeNull();
  });

  it("rejects case-insensitive variants", async () => {
    mockNominatim([VANCOUVER_HIT]);
    expect(await geocodePlace("PARK")).toBeNull();
    expect(await geocodePlace("Mall")).toBeNull();
    expect(await geocodePlace("The Beach")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});

// ─── g44: Cooldown — L1 in-memory path ───────────────────────────────────────

describe("g44 — failed-geocode cooldown (L1 in-memory)", () => {
  it("skips place with active L1 cooldown without calling DB or Nominatim", async () => {
    _testInternals.setActiveCooldown("yaletown");
    mockNominatim([VANCOUVER_HIT]);

    const result = await geocodePlace("Yaletown");

    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    expect(getActiveCooldown).not.toHaveBeenCalled(); // L1 hit, no DB call
  });

  it("retries place after L1 cooldown expires", async () => {
    _testInternals.setExpiredCooldown("yaletown");
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([VANCOUVER_HIT]);

    const result = await geocodePlace("Yaletown", 0);

    expect(fetch).toHaveBeenCalledOnce();
    expect(result).not.toBeNull();
  }, 3000);

  it("successful geocode clears L1 cooldown", async () => {
    _testInternals.setExpiredCooldown("gastown");
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([{ lat: "49.2839", lon: "-123.1089", display_name: "Gastown", importance: 0.85 }]);

    await geocodePlace("Gastown", 0);

    // After success, same place served from cache
    vi.mocked(getCachedPlace).mockResolvedValueOnce({
      ...MOCK_CACHED, placeQuery: "gastown", lat: 49.2839, lng: -123.1089,
    });
    const result2 = await geocodePlace("Gastown");
    expect((result2 as GeoResult).fromCache).toBe(true);
  }, 3000);
});

// ─── g44 (continued): Cooldown — DB persistent path ──────────────────────────

describe("g44 — failed-geocode cooldown (DB persistent path)", () => {
  it("skips when DB has active cooldown even with empty L1 cache", async () => {
    // L1 is empty (cleared in beforeEach)
    vi.mocked(getActiveCooldown).mockResolvedValueOnce(ACTIVE_FAILURE_ROW);
    mockNominatim([VANCOUVER_HIT]);

    const result = await geocodePlace("Yaletown", 0);

    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    expect(getActiveCooldown).toHaveBeenCalledWith("yaletown");
  });

  it("warms L1 cache from DB on first miss", async () => {
    vi.mocked(getActiveCooldown).mockResolvedValueOnce(ACTIVE_FAILURE_ROW);
    mockNominatim([VANCOUVER_HIT]);

    // First call — DB consulted
    await geocodePlace("Yaletown", 0);
    expect(getActiveCooldown).toHaveBeenCalledTimes(1);

    // Second call — L1 now warm, DB should NOT be consulted again
    vi.clearAllMocks();
    vi.mocked(getCachedPlace).mockResolvedValue(null);
    vi.mocked(getActiveCooldown).mockResolvedValue(null); // would return null but shouldn't be called
    mockNominatim([VANCOUVER_HIT]);

    await geocodePlace("Yaletown", 0);

    expect(getActiveCooldown).not.toHaveBeenCalled(); // served from L1
  });

  it("calls recordFailure on Nominatim empty result", async () => {
    vi.mocked(getActiveCooldown).mockResolvedValueOnce(null);
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([]); // empty → failure

    await geocodePlace("Yaletown", 0);

    expect(recordFailure).toHaveBeenCalledWith("yaletown", "Yaletown", "nominatim_empty");
  }, 3000);

  it("calls recordFailure with nominatim_error on HTTP failure", async () => {
    vi.mocked(getActiveCooldown).mockResolvedValueOnce(null);
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    await geocodePlace("Yaletown", 0);

    expect(recordFailure).toHaveBeenCalledWith("yaletown", "Yaletown", "nominatim_error");
  }, 3000);

  it("calls recordFailure with outside_bounds when coords are outside Metro Vancouver", async () => {
    vi.mocked(getActiveCooldown).mockResolvedValueOnce(null);
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([TORONTO_HIT]);

    await geocodePlace("CN Tower", 0);

    expect(recordFailure).toHaveBeenCalledWith("cn tower", "CN Tower", "outside_bounds");
  }, 3000);

  it("calls clearFailure on successful geocoding", async () => {
    vi.mocked(getActiveCooldown).mockResolvedValueOnce(null);
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([VANCOUVER_HIT]);

    await geocodePlace("Gastown", 0);

    expect(clearFailure).toHaveBeenCalledWith("gastown");
  }, 3000);

  it("does not call recordFailure for ambiguous terms", async () => {
    mockNominatim([]);

    await geocodePlace("park");

    expect(recordFailure).not.toHaveBeenCalled();
    expect(getActiveCooldown).not.toHaveBeenCalled();
  });
});

// ─── g45: Outside-boundary rejection ─────────────────────────────────────────

describe("g45 — outside Metro Vancouver bounds rejection", () => {
  it("returns GeoBadBounds when Nominatim returns coords outside Metro Vancouver", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([TORONTO_HIT]);

    const result = await geocodePlace("CN Tower", 0);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("badBounds", true);
    expect((result as GeoBadBounds).lat).toBeCloseTo(43.6426, 3);
  }, 3000);

  it("does not save outside-bounds result to cached_places", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([TORONTO_HIT]);

    await geocodePlace("CN Tower", 0);

    expect(setCachedPlace).not.toHaveBeenCalled();
  }, 3000);

  it("records failure for outside-bounds result", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([TORONTO_HIT]);

    await geocodePlace("CN Tower", 0);

    expect(recordFailure).toHaveBeenCalledWith("cn tower", "CN Tower", "outside_bounds");
  }, 3000);

  it("returns GeoBadBounds for a cached place with outside-bounds coordinates", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce({ ...MOCK_CACHED, lat: 47.6062, lng: -122.3321 });
    mockNominatim([]);

    const result = await geocodePlace("Mystery Place");

    expect(result).toHaveProperty("badBounds", true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("accepts coordinates on Metro Vancouver boundary", async () => {
    vi.mocked(getCachedPlace).mockResolvedValueOnce(null);
    mockNominatim([{
      lat: "49.000", lon: "-123.350",
      display_name: "Delta, BC", importance: 0.7,
    }]);

    const result = await geocodePlace("Delta", 0);

    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty("badBounds");
  }, 3000);
});
