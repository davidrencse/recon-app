import { describe, it, expect } from "vitest";
import { normalizeCategory, VALID_CATEGORIES } from "../normalize";

describe("normalizeCategory — valid category passthrough", () => {
  it("trending", () => expect(normalizeCategory("trending")).toBe("trending"));
  it("cafes", () => expect(normalizeCategory("cafes")).toBe("cafes"));
  it("nightlife", () => expect(normalizeCategory("nightlife")).toBe("nightlife"));
  it("pop", () => expect(normalizeCategory("pop")).toBe("pop"));
  it("crime_safety", () => expect(normalizeCategory("crime_safety")).toBe("crime_safety"));
});

describe("normalizeCategory — synonym mapping", () => {
  it("coffee → cafes", () => expect(normalizeCategory("coffee")).toBe("cafes"));
  it("restaurant → cafes", () => expect(normalizeCategory("restaurant")).toBe("cafes"));
  it("brunch → cafes", () => expect(normalizeCategory("brunch")).toBe("cafes"));
  it("bar → nightlife", () => expect(normalizeCategory("bar")).toBe("nightlife"));
  it("club → nightlife", () => expect(normalizeCategory("club")).toBe("nightlife"));
  it("pub → nightlife", () => expect(normalizeCategory("pub")).toBe("nightlife"));
  it("event → pop", () => expect(normalizeCategory("event")).toBe("pop"));
  it("popup → pop", () => expect(normalizeCategory("popup")).toBe("pop"));
  it("festival → pop", () => expect(normalizeCategory("festival")).toBe("pop"));
  it("safety → crime_safety", () => expect(normalizeCategory("safety")).toBe("crime_safety"));
  it("alert → crime_safety", () => expect(normalizeCategory("alert")).toBe("crime_safety"));
  it("incident → crime_safety", () => expect(normalizeCategory("incident")).toBe("crime_safety"));
});

describe("normalizeCategory — case insensitivity", () => {
  it("TRENDING", () => expect(normalizeCategory("TRENDING")).toBe("trending"));
  it("NightLife", () => expect(normalizeCategory("NightLife")).toBe("nightlife"));
  it("CAFES", () => expect(normalizeCategory("CAFES")).toBe("cafes"));
  it("Crime_Safety", () => expect(normalizeCategory("Crime_Safety")).toBe("crime_safety"));
});

describe("normalizeCategory — hyphen/space normalization", () => {
  it("pop-up → pop", () => expect(normalizeCategory("pop-up")).toBe("pop"));
  it("crime safety → crime_safety", () => expect(normalizeCategory("crime safety")).toBe("crime_safety"));
});

describe("normalizeCategory — invalid inputs", () => {
  it("empty string", () => expect(normalizeCategory("")).toBeNull());
  it("unknown word", () => expect(normalizeCategory("sports")).toBeNull());
  it("random string", () => expect(normalizeCategory("xyzabc")).toBeNull());
  it("whitespace only", () => expect(normalizeCategory("   ")).toBeNull());
  it("numeric string", () => expect(normalizeCategory("123")).toBeNull());
  it("emoji", () => expect(normalizeCategory("🎉")).toBeNull());
});

describe("VALID_CATEGORIES", () => {
  it("has exactly 5 categories", () => {
    expect(VALID_CATEGORIES.length).toBe(5);
  });
  it("includes crime_safety", () => {
    expect(VALID_CATEGORIES).toContain("crime_safety");
  });
  it("includes all expected values", () => {
    expect(VALID_CATEGORIES).toContain("trending");
    expect(VALID_CATEGORIES).toContain("cafes");
    expect(VALID_CATEGORIES).toContain("nightlife");
    expect(VALID_CATEGORIES).toContain("pop");
  });
});
