import type { PinCategory } from "@/types/pin";

export const VALID_CATEGORIES: readonly PinCategory[] = [
  "trending",
  "cafes",
  "nightlife",
  "pop",
  "crime_safety",
] as const;

const CATEGORY_MAP: Record<string, PinCategory> = {
  trending: "trending",
  trend: "trending",
  viral: "trending",
  hot: "trending",
  buzz: "trending",

  cafe: "cafes",
  cafes: "cafes",
  coffee: "cafes",
  restaurant: "cafes",
  restaurants: "cafes",
  food: "cafes",
  brunch: "cafes",
  lunch: "cafes",
  dinner: "cafes",
  eatery: "cafes",
  bakery: "cafes",
  bakeries: "cafes",

  nightlife: "nightlife",
  bar: "nightlife",
  bars: "nightlife",
  club: "nightlife",
  clubs: "nightlife",
  pub: "nightlife",
  pubs: "nightlife",
  drinks: "nightlife",
  party: "nightlife",
  lounge: "nightlife",
  nightclub: "nightlife",

  pop: "pop",
  popup: "pop",
  pop_up: "pop",
  event: "pop",
  events: "pop",
  market: "pop",
  festival: "pop",
  fair: "pop",

  crime: "crime_safety",
  crime_safety: "crime_safety",
  safety: "crime_safety",
  alert: "crime_safety",
  warning: "crime_safety",
  incident: "crime_safety",
  emergency: "crime_safety",
};

export function normalizeCategory(raw: string): PinCategory | null {
  const lower = raw.trim().toLowerCase();
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];
  // Normalize hyphens and spaces to underscores (e.g. "pop-up" → "pop_up")
  const normalized = lower.replace(/[\s-]+/g, "_");
  return CATEGORY_MAP[normalized] ?? null;
}
