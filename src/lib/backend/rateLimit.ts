/**
 * In-memory sliding-window rate limiter.
 *
 * State resets on each serverless cold start — acceptable for MVP.
 * All write routes are already auth-gated; this adds a secondary defense
 * against a caller with a valid secret flooding the endpoint.
 */

interface Window {
  timestamps: number[];
}

const store = new Map<string, Window>();

/**
 * Returns the client IP from standard Vercel/proxy headers.
 * Falls back to a fixed key so the limiter still works without IP info.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * @param key      Rate-limit bucket key (typically IP + route).
 * @param maxReqs  Max requests allowed within the window.
 * @param windowMs Window size in milliseconds.
 * @returns `{ allowed: true }` or `{ allowed: false, retryAfterMs: number }`.
 */
export function checkRateLimit(
  key: string,
  maxReqs: number,
  windowMs: number
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Evict timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxReqs) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + windowMs - now;
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
  }

  entry.timestamps.push(now);
  return { allowed: true };
}

// Periodically purge stale keys to avoid memory growth on long-lived instances
setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [key, entry] of store) {
    if (entry.timestamps.every((t) => t <= cutoff)) {
      store.delete(key);
    }
  }
}, 60_000);
