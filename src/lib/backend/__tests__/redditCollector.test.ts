import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { collectRedditBatch } from "../redditCollector";
import { normalizeCategory } from "../normalize";

// Real-shaped Reddit listing payload (trimmed to fields the collector reads).
const TOKEN_RESPONSE = { access_token: "fake-token", token_type: "bearer", expires_in: 3600 };

const LISTING = {
  data: {
    children: [
      {
        kind: "t3",
        data: {
          id: "1abc234",
          title: "Stabbing reported near Granville Station tonight",
          selftext: "Heavy police presence on Granville St.",
          permalink: "/r/vancouver/comments/1abc234/stabbing_reported/",
          author: "someuser",
          created_utc: 1_700_000_000,
          subreddit: "vancouver",
          over_18: false,
          stickied: false,
        },
      },
      {
        kind: "t3",
        data: {
          id: "1def567",
          title: "Best new ramen spot on Robson?",
          selftext: "",
          permalink: "/r/vancouver/comments/1def567/best_ramen/",
          author: "foodie",
          created_utc: 1_700_000_100,
          subreddit: "vancouver",
          over_18: false,
          stickied: false,
        },
      },
      {
        kind: "t3",
        data: {
          id: "1ggg999",
          title: "Pinned: weekly thread",
          selftext: "mod stuff",
          permalink: "/r/vancouver/comments/1ggg999/weekly/",
          author: "automod",
          created_utc: 1_700_000_200,
          subreddit: "vancouver",
          over_18: false,
          stickied: true, // must be skipped
        },
      },
    ],
  },
};

describe("collectRedditBatch", () => {
  beforeEach(() => {
    process.env.REDDIT_CLIENT_ID = "id";
    process.env.REDDIT_CLIENT_SECRET = "secret";
    process.env.REDDIT_SUBREDDITS = "vancouver";

    vi.stubGlobal("fetch", vi.fn(async (url: string | URL) => {
      const u = url.toString();
      if (u.includes("access_token")) {
        return new Response(JSON.stringify(TOKEN_RESPONSE), { status: 200 });
      }
      if (u.includes("/r/vancouver/new")) {
        return new Response(JSON.stringify(LISTING), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.REDDIT_CLIENT_ID;
    delete process.env.REDDIT_CLIENT_SECRET;
    delete process.env.REDDIT_SUBREDDITS;
  });

  it("builds a valid metro_vancouver batch from a Reddit listing", async () => {
    const { batch, errors } = await collectRedditBatch();

    expect(errors).toEqual([]);
    expect(batch.source).toBe("reddit");
    expect(batch.region).toBe("metro_vancouver");
    // stickied post dropped → 2 of 3
    expect(batch.posts).toHaveLength(2);
  });

  it("maps each post to a valid IngestPost (URL contains id, ISO date, normalizable category)", async () => {
    const { batch } = await collectRedditBatch();

    for (const p of batch.posts) {
      // validation.ts requires source_url to contain source_post_id
      expect(p.source_url).toContain(p.source_post_id);
      expect(p.source_url.startsWith("https://www.reddit.com/")).toBe(true);
      // source_created_at must be a valid ISO date
      expect(Number.isNaN(Date.parse(p.source_created_at))).toBe(false);
      // text non-empty, creator prefixed
      expect(p.text.length).toBeGreaterThan(5);
      expect(p.creator_handle?.startsWith("u/")).toBe(true);
      // category must normalize to a real PinCategory (not null)
      expect(normalizeCategory(p.category)).not.toBeNull();
    }
  });

  it("infers crime_safety and cafes categories from text", async () => {
    const { batch } = await collectRedditBatch();
    const byId = Object.fromEntries(batch.posts.map((p) => [p.source_post_id, p.category]));
    expect(normalizeCategory(byId["1abc234"])).toBe("crime_safety");
    expect(normalizeCategory(byId["1def567"])).toBe("cafes");
  });

  it("throws when credentials are missing", async () => {
    delete process.env.REDDIT_CLIENT_ID;
    await expect(collectRedditBatch()).rejects.toThrow(/REDDIT_CLIENT_ID/);
  });
});
