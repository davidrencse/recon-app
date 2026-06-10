import { describe, it, expect } from "vitest";
import { calculateExpiry } from "../expiry";

const BASE = new Date("2026-01-01T12:00:00.000Z");

function hoursLater(h: number): string {
  return new Date(BASE.getTime() + h * 60 * 60 * 1000).toISOString();
}

describe("calculateExpiry — correct durations", () => {
  it("trending: 6 hours", () => {
    expect(calculateExpiry("trending", { fromDate: BASE })).toBe(hoursLater(6));
  });
  it("cafes: 720 hours (30 days)", () => {
    expect(calculateExpiry("cafes", { fromDate: BASE })).toBe(hoursLater(720));
  });
  it("nightlife: 24 hours", () => {
    expect(calculateExpiry("nightlife", { fromDate: BASE })).toBe(hoursLater(24));
  });
  it("pop: 168 hours (7 days)", () => {
    expect(calculateExpiry("pop", { fromDate: BASE })).toBe(hoursLater(168));
  });
  it("crime_safety: 72 hours", () => {
    expect(calculateExpiry("crime_safety", { fromDate: BASE })).toBe(hoursLater(72));
  });
});

describe("calculateExpiry — return format", () => {
  it("returns ISO 8601 string", () => {
    const result = calculateExpiry("trending", { fromDate: BASE });
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
  it("expiry is after base date", () => {
    const result = calculateExpiry("trending", { fromDate: BASE });
    expect(new Date(result!).getTime()).toBeGreaterThan(BASE.getTime());
  });
});

describe("calculateExpiry — schema safety (d8)", () => {
  it("returns null when schemaHasExpiresAt is false", () => {
    expect(calculateExpiry("trending", { schemaHasExpiresAt: false })).toBeNull();
  });
  it("returns null for any category when schema missing", () => {
    expect(calculateExpiry("crime_safety", { schemaHasExpiresAt: false })).toBeNull();
    expect(calculateExpiry("cafes", { schemaHasExpiresAt: false })).toBeNull();
  });
  it("calculates normally when schemaHasExpiresAt is true", () => {
    const result = calculateExpiry("trending", { fromDate: BASE, schemaHasExpiresAt: true });
    expect(result).toBe(hoursLater(6));
  });
  it("calculates normally when schemaHasExpiresAt is undefined", () => {
    const result = calculateExpiry("trending", { fromDate: BASE });
    expect(result).toBe(hoursLater(6));
  });
  it("uses current time when fromDate not provided", () => {
    const before = Date.now();
    const result = calculateExpiry("trending");
    const after = Date.now();
    const expiry = new Date(result!).getTime();
    const sixHours = 6 * 60 * 60 * 1000;
    expect(expiry).toBeGreaterThanOrEqual(before + sixHours);
    expect(expiry).toBeLessThanOrEqual(after + sixHours);
  });
});
