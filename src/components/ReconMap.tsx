"use client";

import { useState, useMemo, memo, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Pin, PinCategory } from "../types/pin";
import { mockPins, PIN_META } from "../lib/mockPins";
import { mockCityData } from "../lib/mockCity";
import type { MockCityItem, ReconCategory } from "../lib/mockCity";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#333", fontSize: 13 }}>Loading map…</span>
    </div>
  ),
});

type FilterKey = "all" | PinCategory;

const HOME_CATEGORY_TO_PIN: Record<ReconCategory, PinCategory> = {
  trending: "locations",
  cafes: "daily_life",
  nightlife: "special_events",
  pop: "special_events",
};

const HOME_META: Record<string, { street: string; attendees: number }> = {};

for (const item of mockCityData) {
  HOME_META[`home-${item.id}`] = {
    street: `${item.placeName} · ${item.neighborhood}`,
    attendees: item.postCount,
  };
}

const FILTER_ICON: Record<string, React.ReactNode> = {
  all: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  daily_life: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
    </svg>
  ),
  special_events: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 3-7 8-7-8Z"/><path d="M12 11v11"/><path d="M8 22h8"/>
    </svg>
  ),
  locations: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
    </svg>
  ),
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",            label: "Trending" },
  { key: "daily_life",     label: "Cafés"    },
  { key: "special_events", label: "Nightlife" },
  { key: "locations",      label: "Live"     },
];

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
}

function cardTitle(text: string): string {
  const s = text.split(".")[0].split(",")[0].trim();
  return s.length > 36 ? s.slice(0, 34) + "…" : s;
}

/* ── Pin popup — same visual as the concept LIVE cards ───────── */
interface PinPopupProps {
  pin: Pin;
  onClose: () => void;
}

const PinPopup = memo(function PinPopup({ pin, onClose }: PinPopupProps) {
  const meta = PIN_META[pin.postId] ?? HOME_META[pin.postId];

  const openPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pin.postUrl) return;
    window.open(pin.postUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 800,
        display: "flex",
        overflow: "hidden",
        borderRadius: 14,
        background: "rgba(14,14,14,0.96)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 12px 48px rgba(0,0,0,0.85)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* thumbnail */}
      {meta?.imageUrl && (
        <div style={{ width: 96, flexShrink: 0, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.imageUrl}
            alt={pin.placeName}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.72)" }}
          />
        </div>
      )}

      {/* content */}
      <div style={{ flex: 1, padding: "12px 40px 12px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
        {/* badge + time */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
            color: "#fff",
            background: "rgba(255,255,255,0.1)",
            padding: "2px 8px", borderRadius: 9999,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0, display: "inline-block" }} />
            LIVE
          </span>
          <span style={{ fontSize: 11, color: "#555" }}>{relativeTime(pin.createdAt)}</span>
        </div>

        {/* title */}
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f0", lineHeight: 1.25, marginBottom: 7 }}>
          {cardTitle(pin.text)}
        </div>

        {/* venue */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span style={{ fontSize: 12, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {pin.placeName}
          </span>
        </div>

        {/* street + count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            onClick={openPost}
            style={{ fontSize: 11, color: "#444", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#333" }}
          >
            {meta?.street ?? ""}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#555" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {meta?.attendees ?? 0}
          </span>
        </div>
      </div>

      {/* close button */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#777",
          fontSize: 12,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
});

/* ── SVG icons ────────────────────────────────────────────────── */
function IconSearch() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function IconMapPin() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function IconChevron() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
}
function IconBell() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
}
function ReconLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
      <line x1="24" y1="78" x2="24" y2="24"/>
      <path d="M 24 24 C 24 18 72 18 72 40 C 72 58 48 60 38 60"/>
      <line x1="38" y1="60" x2="74" y2="80"/>
    </svg>
  );
}

/* ── Main ──────────────────────────────────────────────────────── */
export default function ReconMap() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [loadMap] = useState(true);

  const uniqueHomeCityData = useMemo(() => {
    const byId = new Map<string, MockCityItem>();
    for (const item of mockCityData) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
    return Array.from(byId.values());
  }, []);

  const homePins = useMemo<Pin[]>(() => {
    return uniqueHomeCityData.map((item) => ({
      postId: `home-${item.id}`,
      source: "X",
      postUrl: "",
      creatorHandle: "@ReconHome",
      text: `${item.title}. ${item.description}`,
      category: HOME_CATEGORY_TO_PIN[item.category],
      placeName: item.placeName,
      lat: item.lat,
      lng: item.lng,
      createdAt: new Date(Date.now() - item.postCount * 60_000).toISOString(),
      fetchedAt: new Date(Date.now() - item.postCount * 60_000).toISOString(),
      expiresAt: new Date(Date.now() + 6 * 60 * 60_000).toISOString(),
      locationConfidence: Math.min(0.99, 0.7 + item.activityScore / 300),
      status: "active",
    }));
  }, [uniqueHomeCityData]);

  const visiblePins = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const pins = Array.from(
      new Map([...mockPins, ...homePins].map((pin) => [pin.postId, pin])).values()
    );

    return pins.filter((pin) => {
      const matchesCategory = activeFilter === "all" || pin.category === activeFilter;
      if (!matchesCategory) return false;

      if (!query) return true;

      const haystack = [
        pin.creatorHandle,
        pin.placeName,
        pin.text,
        PIN_META[pin.postId]?.street ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [activeFilter, searchQuery, homePins]);

  useEffect(() => {
    if (selectedPin && !visiblePins.some((pin) => pin.postId === selectedPin.postId)) {
      setSelectedPin(null);
    }
  }, [selectedPin, visiblePins]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 16px 10px", flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(22,22,22,0.95)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ReconLogo />
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <button style={{ display: "flex", alignItems: "center", gap: 5, color: "#fff", fontSize: 16, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <IconMapPin />Vancouver<IconChevron />
            </button>
          </div>
          <button aria-label="Notifications" style={{ width: 40, height: 40, borderRadius: 9999, background: "rgba(22,22,22,0.95)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <IconBell />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "0 16px 10px", flexShrink: 0 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, height: 46, padding: "0 16px", borderRadius: 9999, background: "rgba(18,18,18,0.95)", border: "1px solid rgba(255,255,255,0.07)", color: "#555" }}>
            <IconSearch />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, people, events…"
              aria-label="Search live map"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f0f0f0",
                fontSize: 14,
                fontFamily: "inherit",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                style={{
                  background: "none",
                  border: "none",
                  color: "#777",
                  cursor: "pointer",
                  flexShrink: 0,
                  fontSize: 18,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </label>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, padding: "0 16px 8px", flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }}>
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => { setActiveFilter(f.key); setSelectedPin(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 12px", borderRadius: 9999,
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  background: active ? "#e8e8e8" : "rgba(18,18,18,0.9)",
                  color: active ? "#0a0a0a" : "#888",
                  border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  fontFamily: "inherit",
                }}
              >
                {FILTER_ICON[f.key]}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Map + overlays */}
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {(searchQuery.trim() || activeFilter !== "all") && (
            <div style={{ position: "absolute", top: 12, left: 12, zIndex: 500, background: "rgba(8,8,8,0.88)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, padding: "6px 10px", color: "#aaa", fontSize: 11 }}>
              {visiblePins.length} result{visiblePins.length === 1 ? "" : "s"}
            </div>
          )}
          {loadMap ? (
            <LeafletMap
              pins={visiblePins}
              selectedPin={selectedPin}
              onPinSelect={setSelectedPin}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#333", fontSize: 13 }}>Loading map…</span>
            </div>
          )}

          {/* Pin popup — shown only after a marker is tapped */}
          {selectedPin && (
            <PinPopup pin={selectedPin} onClose={() => setSelectedPin(null)} />
          )}
        </div>
    </div>
  );
}
