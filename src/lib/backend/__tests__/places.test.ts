import { describe, it, expect } from "vitest";
import { extractPlaceName, METRO_VANCOUVER_PLACES } from "../places";

describe("extractPlaceName — dictionary matches", () => {
  it("Gastown", () => {
    expect(extractPlaceName("Big event happening in Gastown tonight")).toBe("Gastown");
  });
  it("Stanley Park", () => {
    expect(extractPlaceName("Concert at Stanley Park this weekend")).toBe("Stanley Park");
  });
  it("Granville Island", () => {
    expect(extractPlaceName("Farmers market at Granville Island")).toBe("Granville Island");
  });
  it("Metrotown (standalone)", () => {
    expect(extractPlaceName("Big sale near Metrotown today")).toBe("Metrotown");
  });
  it("Kitsilano", () => {
    expect(extractPlaceName("Beach day at Kitsilano")).toBe("Kitsilano");
  });
  it("Richmond", () => {
    expect(extractPlaceName("New restaurant opened in Richmond")).toBe("Richmond");
  });
  it("Burnaby", () => {
    expect(extractPlaceName("Event happening in Burnaby")).toBe("Burnaby");
  });
  it("case-insensitive: gastown", () => {
    expect(extractPlaceName("party at gastown")).toBe("Gastown");
  });
  it("case-insensitive: YALETOWN", () => {
    expect(extractPlaceName("dinner at YALETOWN")).toBe("Yaletown");
  });
  it("New Westminster", () => {
    expect(extractPlaceName("Something happening in New Westminster")).toBe("New Westminster");
  });
  it("North Vancouver", () => {
    expect(extractPlaceName("Spotted in North Vancouver")).toBe("North Vancouver");
  });
});

describe("extractPlaceName — preposition patterns", () => {
  it("extracts after 'near'", () => {
    const result = extractPlaceName("Spotted near Maple Tree Square");
    expect(result).toBeTruthy();
    expect(result).toContain("Maple");
  });
  it("extracts after 'at'", () => {
    const result = extractPlaceName("Meet at Waterfront Station");
    expect(result).toBeTruthy();
  });
  it("extracts after 'outside'", () => {
    const result = extractPlaceName("Crowd outside Commodore Ballroom");
    expect(result).toBeTruthy();
  });
  it("extracts after 'on'", () => {
    const result = extractPlaceName("Accident on Clark Drive");
    expect(result).toBeTruthy();
  });
  it("extracts after 'by'", () => {
    const result = extractPlaceName("Parked by Mountain View Cemetery");
    expect(result).toBeTruthy();
  });
  it("extracts after 'in'", () => {
    const result = extractPlaceName("Live music in Thornton Park");
    expect(result).toBeTruthy();
  });
});

describe("extractPlaceName — no match", () => {
  it("empty string", () => {
    expect(extractPlaceName("")).toBeNull();
  });
  it("text with no place or preposition", () => {
    expect(extractPlaceName("Something happened today")).toBeNull();
  });
  it("just a number", () => {
    expect(extractPlaceName("123456")).toBeNull();
  });
});

describe("METRO_VANCOUVER_PLACES", () => {
  it("is non-empty", () => {
    expect(METRO_VANCOUVER_PLACES.length).toBeGreaterThan(20);
  });
  it("contains Gastown", () => {
    expect(METRO_VANCOUVER_PLACES).toContain("Gastown");
  });
  it("contains Stanley Park", () => {
    expect(METRO_VANCOUVER_PLACES).toContain("Stanley Park");
  });
  it("contains Metro Vancouver cities", () => {
    expect(METRO_VANCOUVER_PLACES).toContain("Burnaby");
    expect(METRO_VANCOUVER_PLACES).toContain("Richmond");
    expect(METRO_VANCOUVER_PLACES).toContain("Surrey");
    expect(METRO_VANCOUVER_PLACES).toContain("Coquitlam");
  });
  it("Metropolis at Metrotown comes before Metrotown", () => {
    const fullIdx = METRO_VANCOUVER_PLACES.indexOf("Metropolis at Metrotown");
    const shortIdx = METRO_VANCOUVER_PLACES.indexOf("Metrotown");
    expect(fullIdx).toBeLessThan(shortIdx);
  });
});
