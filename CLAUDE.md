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
```

No test runner is wired up. `playwright` is a devDependency but there is no test script or test directory yet.

## Architecture

Recon is a **mobile-first PWA** that shows a city's real-time activity as map pins and dashboards. It is **frontend-only** — there is no backend or API; all data comes from static mocks in `src/lib/`.

### App shell & routing (App Router)
- `src/app/layout.tsx` — root layout. Sets aggressive mobile viewport (`userScalable` off, `viewport-fit: cover`), PWA metadata/manifest, DM Sans font, and wraps everything in `AppShell` + `GlobalErrorHandler`.
- `src/components/AppShell.tsx` (`"use client"`) — full-height flex shell using `usePathname()`. Renders `BottomNav` on every route **except** the landing route `/`.
- Routes: `/` (landing), `/home`, `/discover`, `/saved`, `/dashboard`. Each `src/app/<route>/page.tsx` is a thin server component that renders a client component from `src/components/`.

### The map (most complex subsystem)
- `ReconMap.tsx` — header, search, filter pills, and the selected-pin popup. Merges `mockPins` with pins derived from `mockCity` (`HOME_CATEGORY_TO_PIN` maps `ReconCategory` → `PinCategory`). Filtering/search is `useMemo`-derived.
- `LeafletMap.tsx` — the actual Leaflet map, **dynamically imported with `ssr: false`** (Leaflet touches `window`). Centered on Vancouver, CARTO dark tiles. Renders full DivIcon markers normally but swaps to lightweight `CircleMarker`s while zooming (`isZooming`) for perf; DivIcons are cached in `ICON_CACHE`.
- Always import `LeafletMap` via `next/dynamic` with `ssr:false` — never render Leaflet on the server.

### Data & types
- `src/types/` — `pin.ts` (`Pin`, `PinCategory`), `dashboard.ts`, `saved.ts`. These are the contracts the mocks fulfill.
- `src/lib/mock*.ts` — `mockPins`, `mockCity` (large generated dataset), `mockSaved`, `mockDashboard`. Treat these as the stand-in data layer.
- Path alias `@/*` → `./src/*`.

### PWA / build constraint
- PWA is configured in `next.config.mjs` via `@ducanh2912/next-pwa` (service worker output to `public/`). It is **disabled in development** (`disable: NODE_ENV === "development"`).
- next-pwa relies on Webpack. The `turbopack: {}` entry and the in-file comment exist to keep the plugin compatible with Next 16's Turbopack default — keep this in mind if build behavior around the service worker changes.

### Styling
- Components use **inline `style={{}}` objects**, not CSS modules. Tailwind v4 (`@tailwindcss/postcss`) is installed and `globals.css` is loaded, but the UI is overwhelmingly inline-styled with a dark theme (`#131313` / near-black). Match the existing inline-style convention when editing components.

### Notes
- `BottomNav.tsx` is large: besides the nav bar it contains a full Terms of Service / legal modal and the `/dashboard` entry link.
- TypeScript is `strict`. SVG icons are hand-inlined throughout (no icon library).
