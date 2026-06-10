import { describe, it, expect } from "vitest";
import {
  validatePinInput,
  validateUrl,
  validateSource,
  validateText,
  validateTags,
} from "../validation";

const VALID_INPUT = {
  post_id: "post_123",
  source: "x",
  text: "Great coffee spot opened in Gastown",
  category: "cafes",
  place_name: "Gastown",
  lat: 49.2837,
  lng: -123.1088,
};

describe("validatePinInput — valid inputs", () => {
  it("accepts minimal valid pin", () => {
    const r = validatePinInput(VALID_INPUT);
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });
  it("accepts pin with optional fields", () => {
    const r = validatePinInput({
      ...VALID_INPUT,
      post_url: "https://x.com/post/123",
      tags: ["coffee", "gastown"],
    });
    expect(r.valid).toBe(true);
  });
  it("accepts crime_safety category", () => {
    expect(validatePinInput({ ...VALID_INPUT, category: "crime_safety" }).valid).toBe(true);
  });
  it("accepts coordinates on Metro Vancouver boundary", () => {
    expect(validatePinInput({ ...VALID_INPUT, lat: 49.000, lng: -123.350 }).valid).toBe(true);
  });
  it("accepts all five valid categories", () => {
    for (const cat of ["trending", "cafes", "nightlife", "pop", "crime_safety"]) {
      expect(validatePinInput({ ...VALID_INPUT, category: cat }).valid).toBe(true);
    }
  });
});

describe("validatePinInput — invalid inputs", () => {
  it("rejects null", () => {
    expect(validatePinInput(null).valid).toBe(false);
  });
  it("rejects non-object", () => {
    expect(validatePinInput("string").valid).toBe(false);
  });
  it("rejects missing post_id", () => {
    const rest = { source: VALID_INPUT.source, text: VALID_INPUT.text, category: VALID_INPUT.category, place_name: VALID_INPUT.place_name, lat: VALID_INPUT.lat, lng: VALID_INPUT.lng };
    expect(validatePinInput(rest).valid).toBe(false);
  });
  it("rejects empty text", () => {
    expect(validatePinInput({ ...VALID_INPUT, text: "" }).valid).toBe(false);
  });
  it("rejects invalid category", () => {
    const r = validatePinInput({ ...VALID_INPUT, category: "food" });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes("category"))).toBe(true);
  });
  it("rejects unknown category", () => {
    expect(validatePinInput({ ...VALID_INPUT, category: "sports" }).valid).toBe(false);
  });
  it("rejects coords outside Metro Vancouver", () => {
    const r = validatePinInput({ ...VALID_INPUT, lat: 47.6, lng: -122.3 });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes("Metro Vancouver"))).toBe(true);
  });
  it("rejects string lat", () => {
    expect(validatePinInput({ ...VALID_INPUT, lat: "49.28" as unknown as number }).valid).toBe(false);
  });
  it("rejects missing place_name", () => {
    const rest = { post_id: VALID_INPUT.post_id, source: VALID_INPUT.source, text: VALID_INPUT.text, category: VALID_INPUT.category, lat: VALID_INPUT.lat, lng: VALID_INPUT.lng };
    expect(validatePinInput(rest).valid).toBe(false);
  });
  it("rejects invalid post_url", () => {
    const r = validatePinInput({ ...VALID_INPUT, post_url: "not-a-url" });
    expect(r.valid).toBe(false);
  });
  it("rejects ftp post_url", () => {
    const r = validatePinInput({ ...VALID_INPUT, post_url: "ftp://example.com" });
    expect(r.valid).toBe(false);
  });
});

describe("validateUrl", () => {
  it("accepts http", () => expect(validateUrl("http://example.com")).toBeNull());
  it("accepts https", () => expect(validateUrl("https://x.com/post/123")).toBeNull());
  it("accepts URL with path and query", () => {
    expect(validateUrl("https://x.com/user/status/123?s=20")).toBeNull();
  });
  it("rejects plain string", () => expect(validateUrl("not a url")).not.toBeNull());
  it("rejects ftp", () => expect(validateUrl("ftp://example.com")).not.toBeNull());
  it("rejects no protocol", () => expect(validateUrl("example.com")).not.toBeNull());
  it("rejects empty string", () => expect(validateUrl("")).not.toBeNull());
});

describe("validateSource", () => {
  it("accepts 'x'", () => expect(validateSource("x")).toBeNull());
  it("accepts 'reddit-bot'", () => expect(validateSource("reddit-bot")).toBeNull());
  it("accepts 'instagram_feed'", () => expect(validateSource("instagram_feed")).toBeNull());
  it("accepts alphanumeric", () => expect(validateSource("source123")).toBeNull());
  it("rejects empty string", () => expect(validateSource("")).not.toBeNull());
  it("rejects source with spaces", () => expect(validateSource("my source")).not.toBeNull());
  it("rejects source over 64 chars", () => expect(validateSource("a".repeat(65))).not.toBeNull());
  it("accepts source exactly 64 chars", () => expect(validateSource("a".repeat(64))).toBeNull());
});

describe("validateText", () => {
  it("accepts normal text", () => expect(validateText("Great coffee spot here")).toBeNull());
  it("accepts exactly 5 chars", () => expect(validateText("Hello")).toBeNull());
  it("accepts 2000 chars", () => expect(validateText("a".repeat(2000))).toBeNull());
  it("rejects empty", () => expect(validateText("")).not.toBeNull());
  it("rejects 4 chars", () => expect(validateText("Hi!")).not.toBeNull());
  it("rejects 2001 chars", () => expect(validateText("a".repeat(2001))).not.toBeNull());
  it("rejects whitespace only", () => expect(validateText("   ")).not.toBeNull());
});

describe("validateTags", () => {
  it("accepts empty array", () => expect(validateTags([])).toBeNull());
  it("accepts valid tags", () => expect(validateTags(["coffee", "gastown"])).toBeNull());
  it("accepts 20 tags", () => expect(validateTags(Array(20).fill("tag"))).toBeNull());
  it("rejects non-array", () => expect(validateTags("not-array")).not.toBeNull());
  it("rejects 21 tags", () => expect(validateTags(Array(21).fill("tag"))).not.toBeNull());
  it("rejects tag over 64 chars", () => expect(validateTags(["a".repeat(65)])).not.toBeNull());
  it("accepts tag exactly 64 chars", () => expect(validateTags(["a".repeat(64)])).toBeNull());
  it("rejects non-string tag", () => expect(validateTags([123])).not.toBeNull());
  it("rejects empty string tag", () => expect(validateTags([""])).not.toBeNull());
});
