import type { PinCategory } from "@/types/pin";

const EXPIRY_HOURS: Record<PinCategory, number> = {
  trending: 6,
  cafes: 720,      // 30 days
  nightlife: 24,
  pop: 168,        // 7 days
  crime_safety: 72,
};

export type ExpiryOptions = {
  /** Pass false when the schema audit reports expires_at is missing (d8). */
  schemaHasExpiresAt?: boolean;
  fromDate?: Date;
};

export function calculateExpiry(
  category: PinCategory,
  options: ExpiryOptions = {}
): string | null {
  if (options.schemaHasExpiresAt === false) return null;

  const base = options.fromDate ?? new Date();
  const ms = EXPIRY_HOURS[category] * 60 * 60 * 1000;
  return new Date(base.getTime() + ms).toISOString();
}
