# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**X-search** is the X API ingestion black box for the Recon app — a Vancouver live city map. This module fetches, filters, geolocates, and returns clean map pins from X posts. It is consumed by the Vercel Next.js backend (`POST /api/cron/fetch-x`).

Uses **`@the-convocation/twitter-scraper`** (no paid API key — authenticates with a real X account via username/password/cookies).

## Setup

```bash
cp .env.example .env
# Fill in X_USERNAME, X_PASSWORD, X_EMAIL

# On first run: log in and export cookies to avoid re-login on cold starts
npm run cookies
# Paste the output into X_COOKIE_JSON in .env / Vercel env vars
```

## Commands

```bash
npm run test:weather     # test weather category
npm run test:crime       # test crime_safety
npm run test:daily       # test daily_life
npm run test:locations   # test locations
npm run test:events      # test special_events
npm test                 # defaults to weather
npm run cookies          # export session cookies
```

## Architecture

```
src/
  lib/
    xClient.js          — Scraper singleton; login via username/password or saved cookies
    queryBuilder.js     — buildGeoQuery(category) → search query string
    normalizer.js       — scraper Tweet → RawPost
  pipeline/
    filter.js           — Vancouver relevance + media + text quality gates
    placeExtractor.js   — known-place dictionary + regex → ExtractedPlace
    geocoder.js         — Nominatim → {lat,lng} + Vancouver bbox validation + cache
  searchRunner.js       — orchestrates full ingestion across all 5 categories
  fetchX.js             — handleFetchX(req) — the route handler entry point
scripts/
  exportCookies.js      — one-time login → print session JSON for X_COOKIE_JSON
test.js                 — per-category smoke test
```

## Pipeline flow (per post)

```
scraper.searchTweets(query, n, SearchMode.Latest)
  → normalizePost()       scraper Tweet → RawPost
  → applyFilters()        reject: no media, not Vancouver, too short
  → extractPlace()        geo field → known dict → regex
  → geocodePlace()        Nominatim + cached_places + bbox validation
  → Pin object            ready for Supabase pins table
```

## Key constraints

- **Credentials in env only.** `X_USERNAME`, `X_PASSWORD`, `X_COOKIE_JSON` never in source.
- **Nominatim rate limit:** 1 req/s — `searchRunner.js` sleeps 1100ms between geocode calls.
- **No media download/rehost.** Only metadata and original X links stored.
- **Vancouver bounding box:** lat 49.198–49.316, lng -123.265–-123.023.
- **`has:media` operator not supported by scraper** — media filter is applied post-fetch in `filter.js`.
- **`point_radius` geo operator is API-only** — geo bias comes from Vancouver text terms in the query.

## Integration contract

`handleFetchX(req, options)` returns:
```js
{
  status: 200,
  body: {
    ok: true,
    pinsReady: number,
    stats: { categories, totalAccepted, startedAt, finishedAt },
    pins: Pin[]   // caller writes these to Supabase
  }
}
```

`cacheStore` option: `{ read(key): Promise<object|null>, write(key, val): Promise<void> }` — inject Supabase-backed geocoding cache.
