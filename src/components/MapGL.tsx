"use client";

import { useEffect, useRef, useCallback, memo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Pin, PinCategory } from "../types/pin";
import { useTheme } from "../lib/theme";

interface MapGLProps {
  pins: Pin[];
  selectedPin: Pin | null;
  onPinSelect: (pin: Pin) => void;
}

// Free, no-key CARTO vector GL styles — GPU-rendered, match the existing CARTO
// raster aesthetic, and ship building geometry we extrude in 3D at high zoom.
const STYLE_URL: Record<"dark" | "light", string> = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

const VANCOUVER: [number, number] = [-123.1207, 49.2827]; // [lng, lat]
const BUILDINGS_LAYER = "recon-3d-buildings";
const PIN_SOURCE = "recon-pins";
const PIN_LAYER = "recon-pin-markers";
// Loosely bound the camera to Metro Vancouver so the map never loads tiles for
// the whole planet — fewer requests, less GPU work.
const MAX_BOUNDS: maplibregl.LngLatBoundsLike = [
  [-123.9, 48.9],
  [-122.3, 49.6],
];

const CATEGORIES: PinCategory[] = ["trending", "cafes", "nightlife", "pop", "crime_safety"];

// Inner SVG glyph per category (drawn inside the circular marker).
const CATEGORY_GLYPH: Record<PinCategory, string> = {
  trending: `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
  cafes: `<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>`,
  nightlife: `<path d="m19 3-7 8-7-8Z"/><path d="M12 11v11"/><path d="M8 22h8"/>`,
  pop: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  crime_safety: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>`,
};

const RENDER_SCALE = 2; // bake icons at 2x for retina crispness

/** Full marker SVG (circle + glyph) for one category/selected state. */
function markerSVG(category: PinCategory, selected: boolean): string {
  const size = selected ? 34 : 28;
  const c = size / 2;
  const r = c - 2;
  const bg = selected ? "#ffffff" : "rgba(14,14,14,0.92)";
  const fg = selected ? "#000000" : "#ffffff";
  const stroke = selected ? "#000000" : "rgba(255,255,255,0.32)";
  const filled = category === "pop";
  const g = 12; // glyph viewport size
  const off = (size - g) / 2;
  const glyphAttrs = filled
    ? `fill="${fg}" stroke="none"`
    : `fill="none" stroke="${fg}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<circle cx="${c}" cy="${c}" r="${r}" fill="${bg}" stroke="${stroke}" stroke-width="2"/>` +
    `<g transform="translate(${off} ${off}) scale(${g / 24})" ${glyphAttrs}>${CATEGORY_GLYPH[category]}</g>` +
    `</svg>`
  );
}

function iconKey(category: PinCategory, selected: boolean): string {
  return selected ? `${category}-sel` : category;
}

/** Rasterize an SVG string to ImageData at RENDER_SCALE. */
async function svgToImageData(svg: string, cssSize: number): Promise<ImageData> {
  const px = cssSize * RENDER_SCALE;
  const img = new Image();
  img.decoding = "async";
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, px, px);
  return ctx.getImageData(0, 0, px, px);
}

/** Bake all category × state icons once into ImageData. */
async function bakeIcons(): Promise<Map<string, ImageData>> {
  const out = new Map<string, ImageData>();
  await Promise.all(
    CATEGORIES.flatMap((cat) =>
      [false, true].map(async (sel) => {
        const size = sel ? 34 : 28;
        out.set(iconKey(cat, sel), await svgToImageData(markerSVG(cat, sel), size));
      }),
    ),
  );
  return out;
}

// Module-level cache so the icon set is rasterized once per session, not on
// every map mount (e.g. navigating away from and back to the map).
let iconPromise: Promise<Map<string, ImageData>> | null = null;
function getIcons(): Promise<Map<string, ImageData>> {
  if (!iconPromise) iconPromise = bakeIcons();
  return iconPromise;
}

function pinsToGeoJSON(
  pins: Pin[],
  selectedId: string | null,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: pins.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: {
        postId: p.postId,
        // Selected last-ish via sort below; icon chosen here.
        icon: iconKey(p.category, p.postId === selectedId),
      },
    })),
  };
}

/** Add the 3D building extrusion layer beneath map labels (idempotent). */
function addBuildings(map: maplibregl.Map, theme: "dark" | "light") {
  if (map.getLayer(BUILDINGS_LAYER) || !map.getSource("carto")) return;
  let beforeId: string | undefined;
  for (const l of map.getStyle().layers ?? []) {
    if (l.type === "symbol") { beforeId = l.id; break; }
  }
  try {
    map.addLayer(
      {
        id: BUILDINGS_LAYER,
        source: "carto",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 15, // only extrude geometry once genuinely zoomed in — less GPU
        paint: {
          "fill-extrusion-color": theme === "light" ? "#c9ced8" : "#26262c",
          "fill-extrusion-height": [
            "interpolate", ["linear"], ["zoom"],
            15, 0,
            16.5, ["coalesce", ["get", "render_height"], 14],
          ],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
          "fill-extrusion-opacity": 0.82,
        },
      },
      beforeId,
    );
  } catch {
    /* schema unavailable — non-fatal */
  }
}

function MapGL({ pins, selectedPin, onPinSelect }: MapGLProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const iconsRef = useRef<Map<string, ImageData> | null>(null);

  const pinsRef = useRef<Pin[]>(pins);
  const pinsByIdRef = useRef<Map<string, Pin>>(new Map());
  const selectedRef = useRef<string | null>(null);
  const onSelectRef = useRef(onPinSelect);
  const themeRef = useRef<"dark" | "light">(theme === "light" ? "light" : "dark");

  useEffect(() => { onSelectRef.current = onPinSelect; }, [onPinSelect]);
  useEffect(() => { themeRef.current = theme === "light" ? "light" : "dark"; }, [theme]);

  // Build current GeoJSON, ordering the selected feature last so it draws on top.
  const currentGeoJSON = useCallback(() => {
    const fc = pinsToGeoJSON(pinsRef.current, selectedRef.current);
    fc.features.sort((a, b) =>
      Number(a.properties!.postId === selectedRef.current) -
      Number(b.properties!.postId === selectedRef.current),
    );
    return fc;
  }, []);

  // (Re)install pin icons + source + layer + buildings. Safe to call repeatedly
  // and after setStyle (which drops images/sources/custom layers).
  const installLayers = useCallback((map: maplibregl.Map) => {
    const icons = iconsRef.current;
    if (!icons) return;
    for (const [key, data] of icons) {
      if (!map.hasImage(key)) map.addImage(key, data, { pixelRatio: RENDER_SCALE });
    }
    if (!map.getSource(PIN_SOURCE)) {
      map.addSource(PIN_SOURCE, { type: "geojson", data: currentGeoJSON() });
    }
    if (!map.getLayer(PIN_LAYER)) {
      map.addLayer({
        id: PIN_LAYER,
        type: "symbol",
        source: PIN_SOURCE,
        layout: {
          "icon-image": ["get", "icon"],
          "icon-size": 1,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "symbol-z-order": "source",
        },
      });
    }
    addBuildings(map, themeRef.current);
  }, [currentGeoJSON]);

  const refreshData = useCallback(() => {
    const map = mapRef.current;
    const src = map?.getSource(PIN_SOURCE) as maplibregl.GeoJSONSource | undefined;
    src?.setData(currentGeoJSON());
  }, [currentGeoJSON]);

  // ── Init map once ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Mobile GPUs shade fragments = canvasPx². At devicePixelRatio 3 a phone
    // renders ~9× a 1× canvas. Cap the ratio (lower on coarse-pointer/mobile)
    // for big fill-rate savings — the dominant cost on phones — with negligible
    // visual softening. maxCanvasSize bounds absolute buffer size too.
    const dpr = window.devicePixelRatio || 1;
    const coarse = window.matchMedia("(pointer: coarse), (max-width: 768px)").matches;
    const pixelRatio = Math.min(dpr, coarse ? 1.75 : 2);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL[themeRef.current],
      center: VANCOUVER,
      zoom: 15,
      maxBounds: MAX_BOUNDS,
      attributionControl: false,
      pixelRatio,                    // cap GPU fill-rate (esp. mobile retina)
      maxCanvasSize: [2048, 2048],   // bound absolute drawing-buffer size
      renderWorldCopies: false,      // single world copy — less to render/fetch
      fadeDuration: 0,               // no tile cross-fade — snappier
      refreshExpiredTiles: false,    // don't re-fetch basemap tiles mid-session
      crossSourceCollisions: false,  // markers use allow-overlap — skip collision passes
      localIdeographFontFamily: "sans-serif", // render CJK labels locally, skip glyph PBF fetches
      maxTileCacheSize: 256,         // bound tile memory
      maxPitch: 60,
    });
    mapRef.current = map;

    let cancelled = false;
    map.on("load", async () => {
      iconsRef.current = await getIcons();
      if (cancelled) return;
      installLayers(map);
    });
    // Re-install after a style swap (setStyle drops images/sources/layers).
    map.on("styledata", () => installLayers(map));

    // Native GPU click hit-testing on the symbol layer.
    map.on("click", PIN_LAYER, (e) => {
      const id = e.features?.[0]?.properties?.postId as string | undefined;
      if (!id) return;
      const pin = pinsByIdRef.current.get(id);
      if (pin) onSelectRef.current(pin);
    });
    map.on("mouseenter", PIN_LAYER, () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", PIN_LAYER, () => { map.getCanvas().style.cursor = ""; });

    // Ease into 3D pitch once zoomed into building range, flatten when out.
    map.on("zoomend", () => {
      const want = map.getZoom() >= 16 ? 45 : 0;
      if (Math.abs(map.getPitch() - want) > 4) map.easeTo({ pitch: want, duration: 600 });
    });

    // Debounce to one resize per frame — mobile browser chrome (address bar)
    // show/hide otherwise spams resize events, each reprojecting the map.
    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => map.resize());
    });
    ro.observe(containerRef.current);

    return () => {
      cancelled = true;
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [installLayers]);

  // ── Theme swap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(STYLE_URL[themeRef.current]); // layers re-added via styledata
  }, [theme]);

  // ── Pins changed → update source data (no DOM churn) ─────────────────────────
  useEffect(() => {
    pinsRef.current = pins;
    pinsByIdRef.current = new Map(pins.map((p) => [p.postId, p]));
    refreshData();
  }, [pins, refreshData]);

  // ── Selection changed → recolor via cheap setData ────────────────────────────
  useEffect(() => {
    selectedRef.current = selectedPin?.postId ?? null;
    refreshData();
  }, [selectedPin, refreshData]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

export default memo(MapGL);
