# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The line above is intentional: this project pins **Next.js 16.2.7** (App Router) with **React 19**. APIs may differ from older Next.js. Before writing Next.js code, read the relevant guide under `node_modules/next/dist/docs/`.

## Commands

```bash
npm run dev      # dev server (PWA disabled in development)
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint (flat config, eslint-config-next core-web-vitals + typescript)
npm test         # vitest run — backend unit tests in src/lib/backend/__tests__/
```

Tests run on **Vitest** (`npm test`). The suite lives in `src/lib/backend/__tests__/` and covers the ingestion/geocoding pipeline (normalize, geo, places, sanitize, validation, geocoder, expiry). There are no UI/component tests; `playwright` is an unused devDependency.

## Architecture

Recon is a **mobile-first PWA** that shows a city's real-time activity as map pins and dashboards. It is **full-stack**: a Next.js frontend backed by **Supabase** (Postgres) and a set of App Router API routes. Live pins come from an external collector that POSTs scraped X posts into an ingestion pipeline; the frontend reads them back via `GET /api/pins`. There are **no mock data files anymore** — `src/lib/mock*.ts` is gone.

### Data flow (end to end)
1. An **external collector** (out of this repo) scrapes X and POSTs batches to `POST /api/ingest/source-batch` (auth: `x-ingest-secret`/`INGEST_SECRET`, falls back to `x-cron-secret`/`CRON_SECRET`).
2. `src/lib/backend/ingestBatch.ts` validates → normalizes category → extracts place name → geocodes (Nominatim) → dedupes → inserts rows into the Supabase `pins` table.
3. `GET /api/pins` reads the table with `category` / `neighborhood` / `bbox` / `limit` filters (max 200) and returns `PinsApiResponse`.
4. `src/lib/getPins.ts` (client) fetches `/api/pins` (`cache: "no-store"`) and maps `DbPin` (snake_case rows) → `Pin` (camelCase UI type). Consumed by `ReconMap`, `HomeScreen`, `DashboardClient`.

### Backend (`src/lib/backend/` + `src/app/api/`)
- **`POST /api/ingest/source-batch`** — ingestion entrypoint. Auth-guarded, rate-limited (20 req / 5 min / IP), rejects bodies > 1 MB. Delegates to `validateIngestBatch` + `processIngestBatch`.
- **`GET /api/cron/fetch-x`** — Vercel cron (auth: `Authorization: Bearer $CRON_SECRET`). **Does NOT fetch X** (despite the name) — ingestion moved to the external collector. It only runs expiry cleanup (`expirePins`), table pruning (`pruneOldRows`), and job-health monitoring (`ingestionJobs`).
- **`GET /api/pins`** — read API (see data flow). `GET /api/health` + `/api/health/detailed` — health checks.
- **`src/lib/backend/` helpers**: `geocoder.ts` (Nominatim + failed-geocode cooldown, ambiguous-term rejection), `places.ts` (place-name extraction, 80+ known places + blocklist), `normalize.ts` (`VALID_CATEGORIES`, category mapping), `geo.ts` (`isInsideMetroVancouver` bbox), `expiry.ts`/`expirePins.ts`, `validation.ts`, `sanitize.ts`, `rateLimit.ts` (in-memory), `processedPosts.ts` (dedup), `cachedPlaces.ts`, `geocodingFailures.ts`, `pinAuditLog.ts`, `pruneOldRows.ts`, `safeLog.ts`.
- **Supabase client**: `src/lib/supabase/server.ts` — service-role client (server-only, `persistSession: false`). Throws at import if env missing.
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `INGEST_SECRET`.

### App shell & routing (App Router)
- `src/app/layout.tsx` — root layout. Sets aggressive mobile viewport (`userScalable` off, `viewport-fit: cover`), PWA metadata/manifest, DM Sans font, and wraps everything in `AppShell` + `GlobalErrorHandler`.
- `src/components/AppShell.tsx` (`"use client"`) — full-height flex shell using `usePathname()`. Renders `BottomNav` on every route **except** the landing route `/`.
- Routes: `/` (landing), `/home`, `/discover`, `/saved`, `/dashboard`. Each `src/app/<route>/page.tsx` is a thin server component that renders a client component from `src/components/`.

### The map (most complex subsystem)
- `ReconMap.tsx` — header, search, filter pills, and the selected-pin popup. Fetches live pins from `getPins()` into state (`pins`, `loading`, `fetchError`) via `useEffect`; filtering/search over that is `useMemo`-derived.
- `LeafletMap.tsx` — the actual Leaflet map, **dynamically imported with `ssr: false`** (Leaflet touches `window`). Centered on Vancouver, CARTO dark tiles. Renders full DivIcon markers normally but swaps to lightweight `CircleMarker`s while zooming (`isZooming`) for perf; DivIcons are cached in `ICON_CACHE`.
- Always import `LeafletMap` via `next/dynamic` with `ssr:false` — never render Leaflet on the server.
- `HomeScreen.tsx` and `DashboardClient.tsx` also pull from `getPins()`. `saved/page.tsx` is currently a static empty-state shell (no data wired yet).

### Data & types
- `src/types/` — `pin.ts` (`Pin` UI type, `DbPin` row type, `PinCategory`, `PinCreateInput`, `PinsApiResponse`), `ingest.ts` (`IngestBatch`/`IngestPost`/`PostRejection`/`BatchSummary`), `backend.ts`, `dashboard.ts`, `saved.ts`.
- The DB↔UI contract: snake_case `DbPin` rows are mapped to camelCase `Pin` in `getPins.ts`.
- Path alias `@/*` → `./src/*`.

### PWA / build constraint
- PWA is configured in `next.config.mjs` via `@ducanh2912/next-pwa` (service worker output to `public/`). It is **disabled in development** (`disable: NODE_ENV === "development"`), so `npm run dev` runs on Turbopack normally.
- next-pwa relies on **Webpack**. Next 16 defaults to Turbopack, under which the plugin's SW hooks never fire. `npm run build` therefore passes **`--webpack`** (`next build --webpack`) — without it the build "succeeds" but emits **no `sw.js`** and the PWA silently breaks. Keep the flag.
- The generated `public/sw.js` + `public/workbox-*.js` are build artifacts (gitignored, regenerated each build) — do not commit them.

### Styling
- Components use **inline `style={{}}` objects**, not CSS modules. Tailwind v4 (`@tailwindcss/postcss`) is installed and `globals.css` is loaded, but the UI is overwhelmingly inline-styled with a dark theme (`#131313` / near-black). Match the existing inline-style convention when editing components.

### Notes
- `BottomNav.tsx` is large: besides the nav bar it contains a full Terms of Service / legal modal and the `/dashboard` entry link.
- TypeScript is `strict`. SVG icons are hand-inlined throughout (no icon library).
