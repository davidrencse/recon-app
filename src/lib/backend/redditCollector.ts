import type { IngestBatch, IngestPost } from "@/types/ingest";

/**
 * Reddit collector — pulls recent posts from Metro Vancouver subreddits and
 * maps them into the standard {@link IngestBatch} shape consumed by
 * `processIngestBatch`. Place names are left for the backend pipeline to
 * extract from text (no place_hint / raw_geo provided), so only posts that
 * mention a recognizable Vancouver place become pins.
 *
 * Auth: application-only OAuth (`client_credentials`) with a confidential
 * Reddit app (type "script" or "web app"). Needs only a client id + secret —
 * no Reddit account password is stored.
 *
 * Env:
 *   REDDIT_CLIENT_ID      (required)
 *   REDDIT_CLIENT_SECRET  (required)
 *   REDDIT_SUBREDDITS     (optional, comma-separated; default "vancouver")
 *   REDDIT_USER_AGENT     (optional; Reddit requires a descriptive UA)
 */

const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const API_BASE  = "https://oauth.reddit.com";
const DEFAULT_SUBREDDITS = ["vancouver"];
const DEFAULT_USER_AGENT = "web:recon-app:v1.0 (by /u/recon-collector)";
const PER_SUB_LIMIT = 50;
const MAX_TEXT_LEN = 2000;

type RedditListingChild = {
  kind: string;
  data: {
    id: string;
    title: string;
    selftext?: string;
    permalink: string;
    author?: string;
    created_utc: number;
    subreddit?: string;
    over_18?: boolean;
    stickied?: boolean;
  };
};

type RedditListing = {
  data?: { children?: RedditListingChild[] };
};

function getUserAgent(): string {
  return process.env.REDDIT_USER_AGENT?.trim() || DEFAULT_USER_AGENT;
}

function getSubreddits(): string[] {
  const raw = process.env.REDDIT_SUBREDDITS?.trim();
  if (!raw) return DEFAULT_SUBREDDITS;
  return raw
    .split(",")
    .map((s) => s.trim().replace(/^r\//i, ""))
    .filter(Boolean);
}

/**
 * Infer a raw category string from post text. The backend `normalizeCategory`
 * maps these to valid PinCategories; anything unmatched falls back to
 * "trending" so the post still has a chance to be geocoded.
 */
function inferCategory(text: string): string {
  const t = text.toLowerCase();
  if (/\b(stabb|shoot|robber|assault|police|rcmp|vpd|theft|break.?in|fire|collision|crash|missing|amber alert|suspicious|overdose)\b/.test(t)) {
    return "crime_safety";
  }
  if (/\b(coffee|cafe|café|restaurant|brunch|bakery|eatery|dim sum|ramen|sushi|food|menu)\b/.test(t)) {
    return "cafes";
  }
  if (/\b(bar|pub|club|nightlife|cocktail|brewery|patio|drinks|dj|rave)\b/.test(t)) {
    return "nightlife";
  }
  if (/\b(festival|market|pop.?up|event|fair|parade|concert|show|exhibit|night market)\b/.test(t)) {
    return "pop";
  }
  return "trending";
}

/** Exchange client id/secret for an application-only access token. */
async function fetchAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": getUserAgent(),
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Reddit token request failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("Reddit token response missing access_token");
  }
  return json.access_token;
}

/** Fetch the newest posts from a single subreddit. */
async function fetchSubredditNew(subreddit: string, token: string): Promise<RedditListingChild[]> {
  const url = `${API_BASE}/r/${encodeURIComponent(subreddit)}/new?limit=${PER_SUB_LIMIT}&raw_json=1`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": getUserAgent(),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Reddit fetch r/${subreddit} failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as RedditListing;
  return json.data?.children ?? [];
}

function toIngestPost(child: RedditListingChild): IngestPost | null {
  const d = child.data;
  if (!d?.id || !d.title || !d.permalink) return null;

  const bodyParts = [d.title, d.selftext?.trim() || ""].filter(Boolean);
  const text = bodyParts.join("\n\n").slice(0, MAX_TEXT_LEN);

  return {
    source_post_id:    d.id, // base36 id; permalink contains it (validation requires this)
    source_url:        `https://www.reddit.com${d.permalink}`,
    text,
    category:          inferCategory(text),
    source_created_at: new Date(d.created_utc * 1000).toISOString(),
    creator_handle:    d.author ? `u/${d.author}` : null,
    place_hint:        null,
    raw_geo:           null,
    raw_source:        { subreddit: d.subreddit ?? null, platform: "reddit" },
  };
}

/**
 * Collect recent Reddit posts and build an IngestBatch.
 * Throws if Reddit credentials are missing or the token request fails.
 * Per-subreddit fetch errors are tolerated (collected into `errors`).
 */
export async function collectRedditBatch(): Promise<{ batch: IngestBatch; errors: string[] }> {
  const clientId     = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are required");
  }

  const token = await fetchAccessToken(clientId, clientSecret);
  const subreddits = getSubreddits();
  const errors: string[] = [];
  const posts: IngestPost[] = [];

  for (const sub of subreddits) {
    try {
      const children = await fetchSubredditNew(sub, token);
      for (const child of children) {
        if (child.data?.stickied || child.data?.over_18) continue;
        const post = toIngestPost(child);
        if (post) posts.push(post);
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  const now = new Date().toISOString();
  const batch: IngestBatch = {
    source:     "reddit",
    run_id:     `reddit-${Date.now()}`,
    fetched_at: now,
    region:     "metro_vancouver",
    categories: ["trending", "cafes", "nightlife", "pop", "crime_safety"],
    posts,
  };

  return { batch, errors };
}
