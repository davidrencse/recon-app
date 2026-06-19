"use client";

import { useEffect, useMemo, memo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, CircleMarker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Pin, PinCategory } from "../types/pin";
import { useTheme } from "../lib/theme";

interface LeafletMapProps {
  pins: Pin[];
  selectedPin: Pin | null;
  onPinSelect: (pin: Pin) => void;
}

// SVG icon HTML strings per category — rendered inside a white circle divIcon.
const CATEGORY_ICON: Record<PinCategory, string> = {
  trending: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  cafes: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/></svg>`,
  nightlife: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 3-7 8-7-8Z"/><path d="M12 11v11"/><path d="M8 22h8"/></svg>`,
  pop: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  crime_safety: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
};

function buildIcon(category: PinCategory, selected: boolean): L.DivIcon {
  const size = selected ? 34 : 28;
  const half = size / 2;
  const bg = selected ? "#ffffff" : "rgba(14,14,14,0.88)";
  const fg = selected ? "#000000" : "#ffffff";
  const border = selected ? "2px solid #000" : "2px solid rgba(255,255,255,0.3)";
  const shadow = selected
    ? "0 0 0 3px rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.8)"
    : "0 2px 10px rgba(0,0,0,0.8)";

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};border:${border};
      display:flex;align-items:center;justify-content:center;
      color:${fg};box-shadow:${shadow};
      cursor:pointer;backdrop-filter:blur(4px);
    ">${CATEGORY_ICON[category]}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

// Cache icons to avoid rebuilding identical DivIcons repeatedly.
const ICON_CACHE: Map<string, L.DivIcon> = new Map();

function getCachedIcon(category: PinCategory, selected: boolean) {
  const key = `${category}:${selected ? "1" : "0"}`;
  const existing = ICON_CACHE.get(key);
  if (existing) return existing;
  const icon = buildIcon(category, selected);
  ICON_CACHE.set(key, icon);
  return icon;
}

function SizeInvalidator() {
  const map = useMap();
  useEffect(() => { map.invalidateSize(); }, [map]);
  return null;
}

function ZoomHandler({ onZooming }: { onZooming: (v: boolean) => void }) {
  useMapEvents({
    zoomstart: () => onZooming(true),
    zoomend: () => onZooming(false),
  });
  return null;
}

function LeafletMap({ pins, selectedPin, onPinSelect }: LeafletMapProps) {
  const [isZooming, setIsZooming] = useState(false);
  const { theme } = useTheme();
  const tileUrl =
    theme === "light"
      ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  const markers = useMemo(() => {
    return pins.map((pin) => (
      <Marker
        key={pin.postId}
        position={[pin.lat, pin.lng]}
        icon={getCachedIcon(pin.category, selectedPin?.postId === pin.postId)}
        eventHandlers={{ click: () => onPinSelect(pin) }}
      />
    ));
  }, [pins, selectedPin?.postId, onPinSelect]);

  const canvasMarkers = useMemo(() => {
    return pins.map((pin) => (
      <CircleMarker
        key={pin.postId}
        center={[pin.lat, pin.lng]}
        radius={selectedPin?.postId === pin.postId ? 6 : 4}
        pathOptions={{
          color: selectedPin?.postId === pin.postId ? "#fff" : "#999",
          fillColor: selectedPin?.postId === pin.postId ? "#fff" : "#999",
          weight: 1,
          fillOpacity: 1,
        }}
        eventHandlers={{ click: () => onPinSelect(pin) }}
      />
    ));
  }, [pins, selectedPin?.postId, onPinSelect]);

  return (
    <MapContainer
      preferCanvas
      center={[49.2827, -123.1207]}
      zoom={15}
      scrollWheelZoom
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <SizeInvalidator />
      <ZoomHandler onZooming={setIsZooming} />
      <TileLayer
        key={theme}
        url={tileUrl}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
        subdomains="abcd"
        keepBuffer={2}
        updateWhenZooming={false}
        updateWhenIdle={true}
      />
      {isZooming ? canvasMarkers : markers}
    </MapContainer>
  );
}

export default memo(LeafletMap);
