"use client";

import { useState } from "react";
import Link from "next/link";
import type { SavedFilter } from "../../types/saved";

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "56px 24px 24px" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f0", marginBottom: 8 }}>Nothing saved yet</p>
      <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 24 }}>Tap a pin on the map and save places you want to check later.</p>
      <Link href="/discover" style={{ fontSize: 13.5, fontWeight: 600, color: "#000", background: "#fff", borderRadius: 9999, padding: "10px 24px", textDecoration: "none" }}>Open map</Link>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
const FILTERS: { key: SavedFilter; label: string }[] = [
  { key: "all",        label: "All"        },
  { key: "want_to_go", label: "Want to go" },
  { key: "been_here",  label: "Been here"  },
  { key: "events",     label: "Events"     },
  { key: "food",       label: "Food"       },
  { key: "alerts",     label: "Alerts"     },
];

export default function SavedPage() {
  const [activeFilter, setActiveFilter] = useState<SavedFilter>("all");

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
        <div style={{ padding: "14px 20px 12px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f0f0f0", letterSpacing: -0.3, marginBottom: 2 }}>Saved</div>
          <div style={{ fontSize: 12, color: "#555" }}>Places, posts, and plans you marked</div>
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 7, padding: "12px 20px", flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }} role="group">
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  flexShrink: 0, padding: "7px 13px", borderRadius: 9999, fontSize: 13, fontWeight: active ? 600 : 500,
                  background: active ? "#e8e8e8" : "rgba(18,18,18,0.9)", color: active ? "#0a0a0a" : "#666",
                  border: active ? "none" : "1px solid rgba(255,255,255,0.07)", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
                }}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable body */}
        <main style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px", scrollbarWidth: "none" }}>
          <EmptyState />
        </main>
    </div>
  );
}
