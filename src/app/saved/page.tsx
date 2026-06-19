"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Pin, PinCategory } from "../../types/pin";
import { readSavedPins, removeSavedPin, SAVED_EVENT } from "../../lib/savedPins";

/* ── Filters (category-based) ─────────────────────────────────── */
type SavedFilterKey = "all" | PinCategory;
const FILTERS: { key: SavedFilterKey; label: string }[] = [
  { key: "all",          label: "All"       },
  { key: "trending",     label: "Trending"  },
  { key: "cafes",        label: "Cafes"     },
  { key: "nightlife",    label: "Nightlife" },
  { key: "pop",          label: "Pop-ups"   },
  { key: "crime_safety", label: "Safety"    },
];

const CATEGORY_LABEL: Record<PinCategory, string> = {
  trending: "Trending",
  cafes: "Cafes",
  nightlife: "Nightlife",
  pop: "Pop-up",
  crime_safety: "Safety",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function cleanText(text: string): string {
  return text.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "56px 24px 24px" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--t1)", marginBottom: 8 }}>Nothing saved yet</p>
      <p style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.6, marginBottom: 24 }}>Tap a pin on the map and save places you want to check later.</p>
      <Link href="/discover" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--bg-deep)", background: "var(--t1)", borderRadius: 9999, padding: "10px 24px", textDecoration: "none" }}>Open map</Link>
    </div>
  );
}

/* ── Saved row ────────────────────────────────────────────────── */
function SavedRow({ pin, onRemove }: { pin: Pin; onRemove: (id: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.3, color: "var(--t1)", background: "var(--border)", padding: "2px 8px", borderRadius: 9999 }}>
            {CATEGORY_LABEL[pin.category]}
          </span>
          <span style={{ fontSize: 11, color: "var(--t3)" }}>{relativeTime(pin.createdAt)}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)", lineHeight: 1.3, marginBottom: 4 }}>
          {cleanText(pin.text).slice(0, 110) || pin.placeName}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style={{ fontSize: 12, color: "var(--t3)" }}>{pin.placeName}{pin.neighborhood ? ` · ${pin.neighborhood}` : ""}</span>
        </div>
        {pin.postUrl && (
          <a href={pin.postUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--t3)", textDecoration: "underline", textDecorationColor: "var(--t4)" }}>
            View post
          </a>
        )}
      </div>
      <button
        onClick={() => onRemove(pin.postId)}
        aria-label="Remove from saved"
        style={{ alignSelf: "flex-start", width: 30, height: 30, borderRadius: "50%", background: "var(--line)", border: "1px solid var(--border)", color: "var(--t2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </button>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function SavedPage() {
  const [activeFilter, setActiveFilter] = useState<SavedFilterKey>("all");
  const [saved, setSaved] = useState<Pin[]>([]);

  const refresh = useCallback(() => setSaved(readSavedPins()), []);

  useEffect(() => {
    refresh();
    window.addEventListener(SAVED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SAVED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const handleRemove = (id: string) => {
    removeSavedPin(id);
    refresh();
  };

  const visible = activeFilter === "all" ? saved : saved.filter((p) => p.category === activeFilter);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, position: "relative", width: "100%" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px 12px", flexShrink: 0, borderBottom: "1px solid var(--line)" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--t1)", letterSpacing: -0.3, marginBottom: 2 }}>Saved</div>
        <div style={{ fontSize: 12, color: "var(--t3)" }}>
          {saved.length === 0 ? "Places, posts, and plans you marked" : `${saved.length} saved pin${saved.length !== 1 ? "s" : ""}`}
        </div>
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
                background: active ? "var(--chip-bg)" : "var(--surface-2)", color: active ? "var(--bg-deep)" : "var(--t3)",
                border: active ? "none" : "1px solid var(--border)", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
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
        {saved.length === 0 ? (
          <EmptyState />
        ) : visible.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--t3)", padding: "40px 0", textAlign: "center" }}>No saved pins in this category.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {visible.map((pin) => <SavedRow key={pin.postId} pin={pin} onRemove={handleRemove} />)}
          </div>
        )}
      </main>
    </div>
  );
}
