"use client";

import { useState, useEffect } from "react";
import type { DashboardFilter } from "../types/dashboard";
import type { Pin, PinCategory } from "../types/pin";
import { getPins } from "../lib/getPins";

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const SURFACE  = "#1c1c1c";
const LINE     = "rgba(255,255,255,0.05)";
const BORDER   = "rgba(255,255,255,0.08)";
const T1       = "#f2f2f2";
const T2       = "#9a9a9a";
const T3       = "#4e4e4e";

const CATEGORY_COLOR: Record<PinCategory, string> = {
  trending:     "#f97316",
  cafes:        "#84cc16",
  nightlife:    "#a855f7",
  pop:          "#06b6d4",
  crime_safety: "#ef4444",
};

const CATEGORY_LABEL: Record<PinCategory, string> = {
  trending:     "Trending",
  cafes:        "Cafés",
  nightlife:    "Nightlife",
  pop:          "Pop-up",
  crime_safety: "Safety",
};

/* ══════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════ */
function IconBell() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
function ReconLogo() {
  return (
    <img
      src="/logo.png"
      alt="R"
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   UI COMPONENTS
══════════════════════════════════════════════════════════════ */
function SegmentedFilter({
  options,
  active,
  onChange,
}: {
  options: { value: DashboardFilter; label: string }[];
  active: DashboardFilter;
  onChange: (v: DashboardFilter) => void;
}) {
  return (
    <div style={{
      display: "inline-flex",
      background: SURFACE,
      border: `1px solid ${BORDER}`,
      borderRadius: 9999,
      padding: 3,
      gap: 1,
    }}>
      {options.map((o) => {
        const isActive = o.value === active;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={isActive}
            style={{
              padding: "6px 16px",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              background: isActive ? "#e8e8e8" : "transparent",
              color: isActive ? "#0d0d0d" : T3,
              border: "none",
              cursor: "pointer",
              letterSpacing: isActive ? -0.1 : 0,
              transition: "background 120ms, color 120ms",
              whiteSpace: "nowrap" as const,
              fontFamily: "inherit",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: SURFACE,
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      flex: 1,
      minWidth: 0,
    }}>
      <span style={{ fontSize: 11, color: T3, fontWeight: 500, letterSpacing: 0.3 }}>{label.toUpperCase()}</span>
      <span style={{ fontSize: 26, fontWeight: 800, color: T1, letterSpacing: -0.5 }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: T3 }}>{sub}</span>}
    </div>
  );
}

function CategoryBar({ category, count, total }: { category: PinCategory; count: number; total: number }) {
  const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = CATEGORY_COLOR[category];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: T2 }}>{CATEGORY_LABEL[category]}</span>
        <span style={{ fontSize: 12, color: T3 }}>{count} · {pct}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)" }}>
        <div style={{ height: "100%", borderRadius: 2, background: color, width: `${pct}%`, transition: "width 400ms ease" }} />
      </div>
    </div>
  );
}

function filterPins(pins: Pin[], filter: DashboardFilter): Pin[] {
  const now  = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay   = new Date(now); endOfDay.setHours(23, 59, 59, 999);

  if (filter === "today") {
    return pins.filter(p => new Date(p.createdAt) >= startOfDay);
  }
  if (filter === "tonight") {
    const evening = new Date(now); evening.setHours(18, 0, 0, 0);
    return pins.filter(p => {
      const t = new Date(p.createdAt);
      return t >= evening && t <= endOfDay;
    });
  }
  // weekend: sat + sun of current week
  if (filter === "weekend") {
    const day    = now.getDay();
    const toSat  = (6 - day + 7) % 7;
    const satStart = new Date(now); satStart.setDate(now.getDate() + toSat); satStart.setHours(0,0,0,0);
    const sunEnd   = new Date(satStart); sunEnd.setDate(satStart.getDate() + 1); sunEnd.setHours(23,59,59,999);
    return pins.filter(p => {
      const t = new Date(p.createdAt);
      return t >= satStart && t <= sunEnd;
    });
  }
  return pins;
}

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════════ */
const FILTER_OPTIONS: { value: DashboardFilter; label: string }[] = [
  { value: "today",   label: "Today"   },
  { value: "tonight", label: "Tonight" },
  { value: "weekend", label: "Weekend" },
];

const ALL_CATEGORIES: PinCategory[] = ["trending", "cafes", "nightlife", "pop", "crime_safety"];

export default function DashboardClient() {
  const [filter, setFilter]   = useState<DashboardFilter>("today");
  const [pins, setPins]       = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPins({ limit: 200 })
      .then(setPins)
      .catch(() => setPins([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterPins(pins, filter);
  const total    = filtered.length;

  const categoryCounts = ALL_CATEGORIES.reduce<Record<PinCategory, number>>(
    (acc, cat) => {
      acc[cat] = filtered.filter(p => p.category === cat).length;
      return acc;
    },
    {} as Record<PinCategory, number>
  );

  const uniquePlaces = new Set(filtered.map(p => p.placeName)).size;
  const newestPin    = filtered[0];

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      position: "relative",
      width: "100%",
    }}>
      {/* ── TOP BAR ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px 8px", flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: 13, background: SURFACE, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ReconLogo />
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 9999, fontFamily: "inherit" }}>
          <span style={{ color: T3 }}><IconPin /></span>
          <span style={{ fontSize: 16, fontWeight: 700, color: T1, letterSpacing: -0.4 }}>Vancouver</span>
          <span style={{ color: T3 }}><IconChevronDown /></span>
        </button>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: SURFACE, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: T2, position: "relative", flexShrink: 0 }}>
          <IconBell />
        </div>
      </div>

      {/* ── SEGMENTED FILTER ── */}
      <div style={{ padding: "4px 18px 10px", flexShrink: 0, borderBottom: `1px solid ${LINE}` }}>
        <SegmentedFilter options={FILTER_OPTIONS} active={filter} onChange={setFilter} />
      </div>

      {/* ── CONTENT ── */}
      <main style={{ flex: 1, minHeight: 0, overflowY: "auto", scrollbarWidth: "none", padding: "16px 18px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
            <span style={{ color: T3, fontSize: 13 }}>Loading…</span>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div style={{ display: "flex", gap: 10 }}>
              <StatCard label="Active pins" value={total} sub={`${uniquePlaces} location${uniquePlaces !== 1 ? "s" : ""}`} />
              <StatCard
                label="Latest"
                value={newestPin ? `${Math.floor((Date.now() - new Date(newestPin.createdAt).getTime()) / 60_000)}m` : "—"}
                sub="since last pin"
              />
            </div>

            {/* Category breakdown */}
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T2 }}>By category</span>
              {total === 0 ? (
                <span style={{ fontSize: 13, color: T3 }}>No pins for this period.</span>
              ) : (
                ALL_CATEGORIES.map(cat => (
                  <CategoryBar key={cat} category={cat} count={categoryCounts[cat]} total={total} />
                ))
              )}
            </div>

            {total === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "20px 0" }}>
                <span style={{ color: "#444", fontSize: 13, fontWeight: 500 }}>No data for this period.</span>
                <span style={{ color: "#2e2e2e", fontSize: 12 }}>Backend connected. Waiting for city activity.</span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
