"use client";

import { useState } from "react";
import Link from "next/link";
import {
  mockSavedPlaces,
  mockSavedPosts,
  mockCollections,
} from "../../lib/mockSaved";
import type {
  SavedFilter,
  SavedItemStatus,
  SavedPlace,
  SavedPost,
  SavedCollection,
} from "../../types/saved";

/* ── Status badge ─────────────────────────────────────────────── */
const STATUS_STYLE: Record<SavedItemStatus, React.CSSProperties> = {
  active_now:     { background: "#fff", color: "#000", fontWeight: 700 },
  active_tonight: { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)" },
  updated_recently: { background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.18)" },
  closing_soon:   { background: "transparent", color: "#ccc", border: "1px solid rgba(255,255,255,0.3)" },
  expired:        { background: "transparent", color: "#444", border: "1px solid rgba(255,255,255,0.08)" },
};

function StatusBadge({ status, label }: { status: SavedItemStatus; label: string }) {
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 9999, flexShrink: 0, ...STATUS_STYLE[status] }}>
      {label}
    </span>
  );
}

/* ── Saved place card ─────────────────────────────────────────── */
function PlaceCard({ item, onRemove }: { item: SavedPlace; onRemove: (id: string) => void }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.name + " " + item.neighborhood + " Vancouver")}`;

  return (
    <article style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16 }}>
      {/* name + status */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f0", lineHeight: 1.3 }}>{item.name}</span>
        <StatusBadge status={item.status} label={item.statusLabel} />
      </div>

      {/* category · neighborhood · distance */}
      <p style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>
        {item.category}
        <span style={{ margin: "0 5px", color: "#333" }}>·</span>
        {item.neighborhood}
        <span style={{ margin: "0 5px", color: "#333" }}>·</span>
        {item.distance}
      </p>

      {/* post preview */}
      <p style={{ fontSize: 13, color: "#777", lineHeight: 1.55, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
        &ldquo;{item.latestPost}&rdquo;
      </p>
      <p style={{ fontSize: 11, color: "#444", marginBottom: 14 }}>{item.freshness}</p>

      {/* actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link
          href="/discover"
          style={{
            flex: 1, textAlign: "center", fontSize: 12.5, fontWeight: 600,
            color: "#000", background: "#fff", borderRadius: 9999,
            padding: "9px 0", textDecoration: "none", display: "block",
          }}
        >
          View on map
        </Link>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, textAlign: "center", fontSize: 12.5, fontWeight: 500,
            color: "#e0e0e0", background: "#1c1c1c",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9999,
            padding: "9px 0", textDecoration: "none", display: "block",
          }}
        >
          Directions
        </a>
        <button
          onClick={() => onRemove(item.id)}
          style={{ fontSize: 12, color: "#444", background: "none", border: "none", cursor: "pointer", padding: "9px 6px" }}
          aria-label={`Remove ${item.name} from saved`}
        >
          Remove
        </button>
      </div>
    </article>
  );
}

/* ── Saved post card ──────────────────────────────────────────── */
function PostCard({ item, onRemove }: { item: SavedPost; onRemove: (id: string) => void }) {
  return (
    <article style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16 }}>
      {/* handle + expiry */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0" }}>{item.creatorHandle}</span>
        <span style={{ fontSize: 10, color: "#555", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9999, padding: "2px 8px", flexShrink: 0 }}>
          Expires {item.expiresIn}
        </span>
      </div>

      {/* source · place */}
      <p style={{ fontSize: 11, color: "#555", marginBottom: 10 }}>
        {item.source}
        <span style={{ margin: "0 5px", color: "#333" }}>·</span>
        {item.attachedPlace}
        <span style={{ margin: "0 5px", color: "#333" }}>·</span>
        {item.neighborhood}
      </p>

      {/* post text */}
      <p style={{ fontSize: 13, color: "#777", lineHeight: 1.55, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
        {item.text}
      </p>
      <p style={{ fontSize: 11, color: "#444", marginBottom: 14 }}>{item.freshness}</p>

      {/* actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <a
          href={item.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, textAlign: "center", fontSize: 12.5, fontWeight: 600,
            color: "#000", background: "#fff", borderRadius: 9999,
            padding: "9px 0", textDecoration: "none", display: "block",
          }}
        >
          Open post
        </a>
        <button
          onClick={() => onRemove(item.id)}
          style={{ fontSize: 12, color: "#444", background: "none", border: "none", cursor: "pointer", padding: "9px 6px" }}
          aria-label={`Remove saved post by ${item.creatorHandle}`}
        >
          Remove
        </button>
      </div>
    </article>
  );
}

/* ── Collection row ───────────────────────────────────────────── */
function CollectionRow({ item }: { item: SavedCollection }) {
  return (
    <button
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "none", border: "none",
        cursor: "pointer", textAlign: "left",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0", marginBottom: 3 }}>{item.label}</div>
        <div style={{ fontSize: 12, color: "#555" }}>
          {item.count} saved
          <span style={{ margin: "0 5px", color: "#333" }}>·</span>
          <span style={{ color: item.activeToday > 0 ? "#aaa" : "#555" }}>
            {item.activeToday} active today
          </span>
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </button>
  );
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "56px 24px 24px" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f0", marginBottom: 8 }}>Nothing saved yet</p>
      <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 24 }}>
        Tap a pin on the map and save places you want to check later.
      </p>
      <Link
        href="/discover"
        style={{
          fontSize: 13.5, fontWeight: 600, color: "#000", background: "#fff",
          borderRadius: 9999, padding: "10px 24px", textDecoration: "none",
        }}
      >
        Open map
      </Link>
    </div>
  );
}

/* ── Filter labels ────────────────────────────────────────────── */
const FILTERS: { key: SavedFilter; label: string }[] = [
  { key: "all",        label: "All"        },
  { key: "want_to_go", label: "Want to go" },
  { key: "been_here",  label: "Been here"  },
  { key: "events",     label: "Events"     },
  { key: "food",       label: "Food"       },
  { key: "alerts",     label: "Alerts"     },
];

/* ── Page ─────────────────────────────────────────────────────── */
export default function SavedPage() {
  const [activeFilter, setActiveFilter] = useState<SavedFilter>("all");
  const [removedPlaces, setRemovedPlaces] = useState<Set<string>>(new Set());
  const [removedPosts, setRemovedPosts] = useState<Set<string>>(new Set());

  const removePlace = (id: string) => setRemovedPlaces((prev) => new Set([...prev, id]));
  const removePost  = (id: string) => setRemovedPosts((prev)  => new Set([...prev, id]));

  const visiblePlaces = mockSavedPlaces.filter(
    (p) => !removedPlaces.has(p.id) && p.filterTags.includes(activeFilter)
  );
  const visiblePosts =
    activeFilter === "all"
      ? mockSavedPosts.filter((p) => !removedPosts.has(p.id))
      : [];

  const activePlaceCount = mockSavedPlaces.filter(
    (p) => !removedPlaces.has(p.id) && (p.status === "active_now" || p.status === "active_tonight")
  ).length;

  const isEmpty = visiblePlaces.length === 0 && visiblePosts.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, position: "relative" }}>
        {/* Header */}
        <div style={{ padding: "14px 20px 12px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f0f0f0", letterSpacing: -0.3, marginBottom: 2 }}>Saved</div>
          <div style={{ fontSize: 12, color: "#555" }}>Places, posts, and plans you marked</div>
        </div>

        {/* Filter chips */}
        <div
          style={{ display: "flex", gap: 7, padding: "12px 20px", flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }}
          role="group"
          aria-label="Filter saved items"
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  flexShrink: 0, padding: "7px 13px", borderRadius: 9999,
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  background: active ? "#e8e8e8" : "rgba(18,18,18,0.9)",
                  color: active ? "#0a0a0a" : "#666",
                  border: active ? "none" : "1px solid rgba(255,255,255,0.07)",
                  cursor: "pointer", whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable body */}
        <main
          style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 20px", scrollbarWidth: "none" }}
          aria-label="Saved items"
        >
          {/* Activity summary */}
          {activePlaceCount > 0 && !isEmpty && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", flexShrink: 0, display: "inline-block" }} />
              <p style={{ fontSize: 12.5, color: "#aaa" }}>
                <span style={{ fontWeight: 600, color: "#fff" }}>{activePlaceCount}</span>
                {" "}of your saved places {activePlaceCount === 1 ? "is" : "are"} active right now
              </p>
            </div>
          )}

          {isEmpty ? (
            <EmptyState />
          ) : (
            <>
              {/* Saved places */}
              {visiblePlaces.length > 0 && (
                <section style={{ paddingTop: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                    Saved places
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {visiblePlaces.map((place) => (
                      <PlaceCard key={place.id} item={place} onRemove={removePlace} />
                    ))}
                  </div>
                </section>
              )}

              {/* Saved posts */}
              {visiblePosts.length > 0 && (
                <section style={{ paddingTop: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                    Saved posts
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {visiblePosts.map((post) => (
                      <PostCard key={post.id} item={post} onRemove={removePost} />
                    ))}
                  </div>
                </section>
              )}

              {/* Collections */}
              {activeFilter === "all" && (
                <section style={{ paddingTop: 20, paddingBottom: 24 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                    Collections
                  </div>
                  {mockCollections.map((col) => <CollectionRow key={col.id} item={col} />)}
                </section>
              )}
            </>
          )}
        </main>
    </div>
  );
}
