"use client";

import { useState, useMemo } from "react";
import type { MockCityItem, ReconCategory } from "../lib/mockCity";
import mockCityData from "../lib/mockCity";

/* ── Icons ────────────────────────────────────────────────────── */
function ReconSmall() {
  return (
    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="16" height="16" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
        <line x1="24" y1="78" x2="24" y2="24"/>
        <path d="M 24 24 C 24 18 72 18 72 40 C 72 58 48 60 38 60"/>
        <line x1="38" y1="60" x2="74" y2="80"/>
      </svg>
    </div>
  );
}

function IconBell() {
  return (
    <div style={{ position: "relative" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </svg>
      <span style={{ position: "absolute", top: 0, right: 0, width: 7, height: 7, borderRadius: "50%", background: "#ef4444", border: "1.5px solid #080808" }} />
    </div>
  );
}

function IconSearch() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}

function IconTrendUp() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
}

function IconCoffee() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/></svg>;
}

function IconMartini() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 3-7 8-7-8Z"/><path d="M12 11v11"/><path d="M8 22h8"/></svg>;
}

function IconStar() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}

function IconArrow() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>;
}

/* ── FeedCard ─────────────────────────────────────────────────── */
function FeedCard({ item }: { item: MockCityItem }) {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        padding: "14px 14px 13px",
        position: "relative",
        background: "linear-gradient(to right, rgba(20,20,20,0.6), rgba(14,14,14,0)), #111",
        border: "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: "#e0e0e0",
            background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 6,
          }}>
            {item.category.toUpperCase()}
          </span>
          <span style={{ fontSize: 11, color: "#555" }}>· {item.timeWindow}</span>
        </div>
        <span style={{ color: "#555" }}><IconArrow /></span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f0", lineHeight: 1.3, marginBottom: 4 }}>
        {item.title}
      </div>
      <div style={{ fontSize: 12, color: "#555" }}>{item.placeName} · {item.neighborhood}</div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function HomeScreen() {
  const FILTERS = [
    { key: "trending" as ReconCategory, label: "Trending", icon: <IconTrendUp /> },
    { key: "cafes" as ReconCategory,    label: "Cafés",    icon: <IconCoffee /> },
    { key: "nightlife" as ReconCategory,label: "Nightlife", icon: <IconMartini /> },
    { key: "pop" as ReconCategory,      label: "Pop",      icon: <IconStar /> },
  ];

  const [active, setActive] = useState<ReconCategory>("trending");
  const [searchQuery, setSearchQuery] = useState("");

  const uniqueData = useMemo(() => {
    const map = new Map<string, MockCityItem>();
    for (const d of mockCityData) map.set(d.id, d);
    return Array.from(map.values());
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return uniqueData
      .filter((d) => d.category === active)
      .filter((d) => {
        if (!query) return true;

        const haystack = [
          d.title,
          d.placeName,
          d.neighborhood,
          d.description,
          d.timeWindow,
          ...d.tags,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .slice(0, 12);
  }, [active, searchQuery, uniqueData]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 20px 0", gap: 10, flexShrink: 0 }}>
          <ReconSmall />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 1 }}>Good evening</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e8e8e8" }}>Vancouver</div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#888" }}>
            <IconBell />
          </button>
        </div>

        {/* Headline */}
        <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: -0.5 }}>
            What&apos;s{" "}
            <span style={{ fontStyle: "italic", fontWeight: 400, color: "#888" }}>moving</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: -0.5, marginBottom: 0 }}>
            tonight.
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            height: 44, padding: "0 14px",
            borderRadius: 9999,
            background: "rgba(22,22,22,0.9)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "#444",
          }}>
            <IconSearch />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a place, vibe, or street"
              aria-label="Search home feed"
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                color: "#f0f0f0",
                fontSize: 13.5,
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
                  fontSize: 18,
                  lineHeight: 1,
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 7, padding: "12px 20px 0", flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }}>
          {FILTERS.map((f) => (
            <button
              key={String(f.key)}
              onClick={() => setActive(f.key)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 13px", borderRadius: 9999,
                fontSize: 13, fontWeight: active === f.key ? 600 : 500,
                background: active === f.key ? "#e8e8e8" : "rgba(18,18,18,0.9)",
                color: active === f.key ? "#0a0a0a" : "#666",
                border: active === f.key ? "none" : "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                fontFamily: "inherit",
              }}
            >
              {f.icon}{f.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", scrollbarWidth: "none", padding: "16px 20px 0" }}>
          {/* Section header */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              Live · updated seconds ago
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Happening now</span>
              <span style={{ fontSize: 12, color: "#555", cursor: "pointer" }}>{filtered.length} shown</span>
            </div>
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16 }}>
            {filtered.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
            {filtered.length === 0 && (
              <div style={{ color: "#666", fontSize: 13 }}>No items for this category.</div>
            )}
          </div>
        </div>
    </div>
  );
}
