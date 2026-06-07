import { describe, it, expect } from "vitest";
import { sanitizePinForClient } from "../sanitize";
import type { DbPin } from "@/types/pin";

const BASE_PIN: DbPin = {
  post_id: "p1",
  source: "x",
  post_url: "https://x.com/post/1",
  creator_handle: "@user",
  text: "Cool event at Gastown tonight",
  category: "pop",
  place_name: "Gastown",
  neighborhood: "Gastown",
  lat: 49.2837,
  lng: -123.1088,
  created_at: "2026-01-01T12:00:00Z",
  fetched_at: "2026-01-01T12:00:00Z",
  expires_at: "2026-01-08T12:00:00Z",
  status: "active",
  activity_score: 80,
  crowd_level: "high",
  tags: ["event", "gastown"],
};

describe("sanitizePinForClient — active pin", () => {
  it("returns non-null for active status", () => {
    expect(sanitizePinForClient(BASE_PIN)).not.toBeNull();
  });
  it("maps post_id → postId", () => {
    expect(sanitizePinForClient(BASE_PIN)?.postId).toBe("p1");
  });
  it("maps place_name → placeName", () => {
    expect(sanitizePinForClient(BASE_PIN)?.placeName).toBe("Gastown");
  });
  it("maps activity_score → activityScore", () => {
    expect(sanitizePinForClient(BASE_PIN)?.activityScore).toBe(80);
  });
  it("maps crowd_level → crowdLevel", () => {
    expect(sanitizePinForClient(BASE_PIN)?.crowdLevel).toBe("high");
  });
  it("passes tags through", () => {
    expect(sanitizePinForClient(BASE_PIN)?.tags).toEqual(["event", "gastown"]);
  });
  it("sets locationConfidence to 1", () => {
    expect(sanitizePinForClient(BASE_PIN)?.locationConfidence).toBe(1);
  });
  it("maps all camelCase fields correctly", () => {
    const result = sanitizePinForClient(BASE_PIN)!;
    expect(result.postId).toBe(BASE_PIN.post_id);
    expect(result.source).toBe(BASE_PIN.source);
    expect(result.postUrl).toBe(BASE_PIN.post_url);
    expect(result.creatorHandle).toBe(BASE_PIN.creator_handle);
    expect(result.text).toBe(BASE_PIN.text);
    expect(result.category).toBe(BASE_PIN.category);
    expect(result.neighborhood).toBe(BASE_PIN.neighborhood);
    expect(result.lat).toBe(BASE_PIN.lat);
    expect(result.lng).toBe(BASE_PIN.lng);
    expect(result.createdAt).toBe(BASE_PIN.created_at);
    expect(result.fetchedAt).toBe(BASE_PIN.fetched_at);
    expect(result.expiresAt).toBe(BASE_PIN.expires_at);
    expect(result.status).toBe("active");
  });
});

describe("sanitizePinForClient — non-active statuses return null", () => {
  it("expired", () => {
    expect(sanitizePinForClient({ ...BASE_PIN, status: "expired" })).toBeNull();
  });
  it("hidden", () => {
    expect(sanitizePinForClient({ ...BASE_PIN, status: "hidden" })).toBeNull();
  });
  it("deleted", () => {
    expect(sanitizePinForClient({ ...BASE_PIN, status: "deleted" })).toBeNull();
  });
  it("rejected", () => {
    expect(sanitizePinForClient({ ...BASE_PIN, status: "rejected" })).toBeNull();
  });
});

describe("sanitizePinForClient — null field defaults", () => {
  it("null post_url → empty string", () => {
    expect(sanitizePinForClient({ ...BASE_PIN, post_url: null })?.postUrl).toBe("");
  });
  it("null creator_handle → empty string", () => {
    expect(sanitizePinForClient({ ...BASE_PIN, creator_handle: null })?.creatorHandle).toBe("");
  });
});
