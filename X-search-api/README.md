## X-Search Black Box — Comprehensive Handoff Summary

---

### Cookie management — Oracle server workflow

#### First-time setup or after manual cookie export

If you exported cookies from a browser or ran `npm run cookies`, sync them into `.env`:

```bash
# 1. Place the exported cookie JSON file at x-cookies.json in the project root
# 2. Sync it into .env as X_COOKIE_JSON
npm run cookies:sync-env

# 3. Run ingestion once to confirm everything works
npm run run:once
```

#### Routine refresh (runs automatically via crontab)

`cookies:refresh` checks whether the session is still valid, re-logs in if needed,
writes fresh cookies to `x-cookies.json`, **and** syncs them back into `.env`.
Both the cookie file and `.env` are always updated together.

```bash
npm run cookies:refresh
```

Refresh is incomplete if only `x-cookies.json` is updated — `.env` must also be updated.
`cookies:refresh` handles both steps automatically.

#### Crontab (Oracle server — every 12 hours)

```
0 */12 * * * cd /home/ubuntu/x-search && npm run cookies:refresh >> /var/log/x-search-cookies.log 2>&1
```

#### Manual one-shot ingestion run

```bash
npm run run:once
```

---

---

### What it is

A standalone Node.js ingestion service that searches X (Twitter) for Vancouver posts, filters them, geolocates them, and returns clean **map pins** ready to write to a database. It is **not** a web server, not a frontend, not a database. It is a single function: **tweets in → map pins out.**

It lives at: `C:\Users\david\Desktop\X-search` / GitHub: `https://github.com/davidrencse/X-search-api`

---

### Does it work?

**Yes, validated today.** All 5 categories tested and producing real pins:

| Category | Result |
|---|---|
| `weather` | ✅ BC Place weather pin |
| `crime_safety` | ✅ UBC area pins |
| `daily_life` | ✅ Granville Island, Rocky Mountaineer |
| `locations` | ✅ Victoria Drive, BC Place pins |
| `special_events` | ✅ works — just needs more posts in the window |

Runs against a real X account (`Reconappsearch`) via cookie session auth. No paid API key required.

---

### How it works (pipeline)

```
X account session (cookies)
        ↓
scraper.searchTweets(query, 10, SearchMode.Latest)   ← @the-convocation/twitter-scraper
        ↓
normalizePost()        raw scraper Tweet → internal RawPost shape
        ↓
applyFilters()         reject: no media, not Vancouver, text too short
        ↓
extractPlace()         geo field → known-place dict → regex patterns
        ↓
geocodePlace()         Nominatim → lat/lng, validated inside Vancouver bbox
        ↓
Pin object             ready for Supabase
```

5 categories run sequentially. Each fetches 10–20 posts. Total runtime: ~30–60 seconds.

---

### The one function the production app calls

```js
// In the production Recon backend (Next.js route handler):
const { runIngestion } = require('./lib/x-search/searchRunner');

const { pins, stats } = await runIngestion({
  cacheStore: {
    read:  (key) => supabase.from('cached_places').select().eq('key', key).single(),
    write: (key, val) => supabase.from('cached_places').upsert({ key, ...val }),
  }
});

// pins is an array ready to upsert into your `pins` Supabase table
await supabase.from('pins').upsert(pins, { onConflict: 'post_id' });
```

`runIngestion()` returns:
```js
{
  pins: [
    {
      post_id, post_url, creator_handle, text,
      category,           // 'weather' | 'crime_safety' | 'daily_life' | 'locations' | 'special_events'
      place_name,         // full Nominatim display name
      lat, lng,           // validated inside Vancouver bbox
      location_confidence, extraction_method,
      media_type,         // 'photo' | 'video' | null
      media_thumbnail,    // preview URL
      engagement,         // { like_count, retweet_count, reply_count, view_count }
      created_at, fetched_at, expires_at,
      status: 'active'
    },
    ...
  ],
  stats: {
    categories: { weather: { accepted: 1 }, ... },
    totalAccepted: 10,
    startedAt: Date,
    finishedAt: Date
  }
}
```

---

### Vancouver bounding box (hardcoded)

```
lat: 49.198 – 49.316
lng: -123.265 – -123.023
```

Any geocoded result outside this box is rejected. Guarantees no pins land outside Vancouver.

---

### Credentials & session

- Account: `Reconappsearch` / `Van@123123`
- Auth: cookies stored in `X_COOKIE_JSON` env var
- **Auto-refresh**: if cookies expire, it falls back to username/password login automatically — no manual intervention needed
- On Vercel: cookies are re-cached to `/tmp` within the same function instance

---

### What the production Recon backend needs to integrate this

**Step 1 — Copy the pipeline files into the Recon Next.js project**
```
lib/x-search/
  xClient.js
  queryBuilder.js
  normalizer.js
  searchRunner.js
  pipeline/
    filter.js
    placeExtractor.js
    geocoder.js
```
*(These already exist in `C:\Users\david\Desktop\Recon\lib\x-search\` from today's work — already committed to the landing page repo. For the production app, copy the same folder in.)*

**Step 2 — Install the one dependency**
```bash
npm install @the-convocation/twitter-scraper
```

**Step 3 — Create the cron route** `app/api/cron/fetch-x/route.js`
```js
export const runtime     = 'nodejs';   // required — scraper needs Node.js
export const maxDuration = 60;         // seconds, Hobby limit
export const dynamic     = 'force-dynamic';

import { NextResponse } from 'next/server';
import { runIngestion } from '@/lib/x-search/searchRunner';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
             || request.headers.get('x-cron-secret');

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const cacheStore = {
    read:  async (key) => {
      const { data } = await supabase.from('cached_places').select('*').eq('place_query', key).single();
      return data || null;
    },
    write: async (key, val) => {
      await supabase.from('cached_places').upsert({ place_query: key, ...val });
    },
  };

  const { pins, stats } = await runIngestion({ cacheStore });

  if (pins.length > 0) {
    await supabase.from('pins').upsert(pins, { onConflict: 'post_id' });
  }

  return NextResponse.json({ ok: true, pinsReady: pins.length, stats });
}

export const GET = POST;
```

**Step 4 — `vercel.json`** in root of the production Recon app
```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-x",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Step 5 — Vercel environment variables** (set in Vercel dashboard, not in code)

| Variable | Value |
|---|---|
| `X_USERNAME` | `Reconappsearch` |
| `X_PASSWORD` | `Van@123123` |
| `X_EMAIL` | `reconnaissance.21gunsalute@gmail.com` |
| `X_COOKIE_JSON` | *(full JSON array from `X-search/.env`)* |
| `CRON_SECRET` | any strong random string |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | service role key (not anon) |

**Step 6 — Supabase tables needed** (minimum)

```sql
-- pins table
create table pins (
  id            uuid default gen_random_uuid() primary key,
  post_id       text unique not null,
  post_url      text,
  creator_handle text,
  text          text,
  category      text,
  place_name    text,
  lat           float,
  lng           float,
  location_confidence float,
  extraction_method   text,
  media_type    text,
  media_thumbnail     text,
  engagement    jsonb,
  created_at    timestamptz,
  fetched_at    timestamptz,
  expires_at    timestamptz,
  status        text default 'active'
);

-- geocoding cache (avoids hitting Nominatim for the same place twice)
create table cached_places (
  place_query   text primary key,
  display_name  text,
  lat           float,
  lng           float,
  confidence    float,
  provider      text,
  created_at    timestamptz
);
```

---

### Limitations to be aware of

| Constraint | Detail |
|---|---|
| **No geo operators** | `point_radius` is API-only. Geo bias is text-based Vancouver terms only. |
| **Media filter is post-fetch** | `has:media` not supported by scraper — filtered in code after fetching |
| **Nominatim rate limit** | 1 req/s enforced by 1100ms sleep — don't parallelize geocoding |
| **Cookie expiry** | Sessions last 2–4 weeks. Auto-refresh handles it — credentials must stay in env vars |
| **Vercel Hobby = 60s max** | Fetches 10 posts/category. Pro plan allows 300s and larger batches |
| **Scraper can break** | `@the-convocation/twitter-scraper` scrapes X's internal GraphQL. X changes it ~every few weeks. If it breaks, `npm update @the-convocation/twitter-scraper` |
