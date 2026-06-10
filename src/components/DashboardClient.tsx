"use client";

import { useState } from "react";
import type { DashboardFilter } from "../types/dashboard";

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const SURFACE  = "#1c1c1c";
const LINE     = "rgba(255,255,255,0.05)";
const BORDER   = "rgba(255,255,255,0.08)";
const T1       = "#f2f2f2";
const T2       = "#9a9a9a";
const T3       = "#4e4e4e";

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

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════════ */
const FILTER_OPTIONS: { value: DashboardFilter; label: string }[] = [
  { value: "today",   label: "Today"   },
  { value: "tonight", label: "Tonight" },
  { value: "weekend", label: "Weekend" },
];

export default function DashboardClient() {
  const [filter, setFilter] = useState<DashboardFilter>("today");

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

      {/* ── EMPTY STATE ── */}
      <main style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ color: "#444", fontSize: 13, fontWeight: 500 }}>No dashboard data yet.</span>
        <span style={{ color: "#2e2e2e", fontSize: 12 }}>Backend connected. Waiting for city activity.</span>
      </main>
    </div>
  );
}
