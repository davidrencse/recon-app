"use client";

import { useState } from "react";
import type { PinCategory } from "../types/pin";

/* ── Icons ────────────────────────────────────────────────────── */
function ReconSmall() {
  return (
    <div style={{ 
      width: 30, height: 30, borderRadius: 8, 
      background: "#000", border: "1px solid rgba(255,255,255,0.08)", 
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden"
    }}>
      <img src="/logo.png" alt="R" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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


/* ── Main ─────────────────────────────────────────────────────── */
export default function HomeScreen() {
  const FILTERS = [
    { key: "trending" as PinCategory, label: "Trending", icon: <IconTrendUp /> },
    { key: "cafes" as PinCategory,    label: "Cafés",    icon: <IconCoffee /> },
    { key: "nightlife" as PinCategory,label: "Nightlife", icon: <IconMartini /> },
    { key: "pop" as PinCategory,      label: "Pop",      icon: <IconStar /> },
  ];

  const [active, setActive] = useState<PinCategory>("trending");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div style={{ 
      flex: 1, 
      display: "flex", 
      flexDirection: "column", 
      minHeight: 0, 
      position: "relative",
      width: "100%",
    }}>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Happening now</span>
              <span style={{ fontSize: 12, color: "#555" }}>0 shown</span>
            </div>
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "40px 0", pointerEvents: "none" }}>
              <span style={{ color: "#444", fontSize: 13, fontWeight: 500 }}>No live activity yet.</span>
              <span style={{ color: "#2e2e2e", fontSize: 12 }}>Backend connected. Waiting for city activity.</span>
            </div>
          </div>
        </div>
    </div>
  );
}
