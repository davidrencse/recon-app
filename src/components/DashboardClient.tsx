"use client";

import { useState } from "react";
import Link from "next/link";
import { mockDashboard } from "../lib/mockDashboard";
import type { DashboardFilter, AreaFilter } from "../types/dashboard";
import DashboardModal from "./DashboardModal";
import { EventsByTimePreview, EventsByTimeModal } from "./dashboard/EventsByTime";
import { CategoryBreakdownPreview, CategoryBreakdownModal } from "./dashboard/CategoryBreakdown";
import { WeatherImpactPreview, WeatherImpactModal } from "./dashboard/WeatherImpact";
import { SafetyCautionPreview, SafetyCautionModal } from "./dashboard/SafetyCaution";
import { TransitDisruptionPreview, TransitDisruptionModal } from "./dashboard/TransitDisruption";

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const T_PRIMARY  = "#f0f0f0";
const T_MUTED    = "#888";
const T_DIM      = "#444";
const T_BAR_FILL = "#f0f0f0";
const T_BAR_REST = "#1e1e1e";
const T_DOT      = "#555";

/* ══════════════════════════════════════════════════════════════
   NAV ICONS
══════════════════════════════════════════════════════════════ */
function IconMap() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}
function IconDashboard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconBookmark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function IconChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconTrendUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T_MUTED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   RECON LOGO (R mark SVG)
══════════════════════════════════════════════════════════════ */
function ReconLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
      <line x1="24" y1="78" x2="24" y2="24" />
      <path d="M 24 24 C 24 18 72 18 72 40 C 72 58 48 60 38 60" />
      <line x1="38" y1="60" x2="74" y2="80" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   FILTER PILL
══════════════════════════════════════════════════════════════ */
function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        flexShrink: 0,
        padding: "6px 14px",
        borderRadius: 9999,
        fontSize: 12.5,
        fontWeight: active ? 700 : 500,
        background: active ? "#e8e8e8" : "rgba(18,18,18,0.9)",
        color: active ? "#0a0a0a" : "#666",
        border: active ? "none" : "1px solid rgba(255,255,255,0.07)",
        cursor: "pointer",
        transition: "background 100ms",
      }}
    >
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   CALENDAR DATA (for MiniCalendar + CalendarModal)
══════════════════════════════════════════════════════════════ */
const CAT_COLORS = {
  live:      "#ef4444",
  food:      "#6366f1",
  spots:     "#22c55e",
  popups:    "#f59e0b",
  nightlife: "#ec4899",
} as const;
type CalCat = keyof typeof CAT_COLORS;

interface CalEvent {
  id: string; date: number; time: string; title: string;
  subtitle: string; cat: CalCat; count: number;
}
const CAL_EVENTS: CalEvent[] = [
  { id: "c1",  date: 2,  time: "18:00", title: "Alex G + Slow Pulp",        subtitle: "Commodore Ballroom · Granville", cat: "live",      count: 48 },
  { id: "c2",  date: 2,  time: "19:30", title: "Granville Island market",   subtitle: "Public Market · Kitsilano",      cat: "food",      count: 12 },
  { id: "c3",  date: 2,  time: "22:00", title: "Granville Strip peaks",     subtitle: "Multiple venues · Granville",    cat: "nightlife", count: 31 },
  { id: "c4",  date: 3,  time: "11:00", title: "Sunday brunch pop-up",      subtitle: "Fable · Kitsilano",              cat: "food",      count: 14 },
  { id: "c5",  date: 3,  time: "12:00", title: "Trout Lake farmers market", subtitle: "Trout Lake Park · East Van",     cat: "spots",     count: 19 },
  { id: "c6",  date: 3,  time: "20:00", title: "Jazz residency",            subtitle: "Guilt & Co · Gastown",          cat: "live",      count: 22 },
  { id: "c7",  date: 5,  time: "10:00", title: "Stanley Park sunrise hike", subtitle: "Stanley Park Pavilion",          cat: "spots",     count: 8  },
  { id: "c8",  date: 7,  time: "21:00", title: "DJ night at The Biltmore",  subtitle: "The Biltmore · Mt Pleasant",     cat: "nightlife", count: 27 },
  { id: "c9",  date: 10, time: "18:00", title: "Tofino oysters, 50 dozen",  subtitle: "Pier 7 back · Coal Harbour",     cat: "food",      count: 22 },
  { id: "c10", date: 12, time: "20:00", title: "Rooftop cinema",            subtitle: "Cineplex Odeon · Granville",     cat: "live",      count: 33 },
  { id: "c11", date: 12, time: "22:30", title: "Late set at Fox Cabaret",   subtitle: "Fox Cabaret · Mt Pleasant",      cat: "nightlife", count: 19 },
  { id: "c12", date: 14, time: "11:00", title: "Vintage clothing market",   subtitle: "Main & 20th · Mt Pleasant",      cat: "popups",    count: 16 },
  { id: "c13", date: 14, time: "14:00", title: "Kits Beach volleyball open",subtitle: "Kitsilano Beach",                cat: "spots",     count: 9  },
  { id: "c14", date: 18, time: "19:00", title: "Yuno b2b Sansibar",         subtitle: "Open Studios · Strathcona",      cat: "live",      count: 31 },
  { id: "c15", date: 21, time: "10:00", title: "Solstice sunrise walk",     subtitle: "Spanish Banks Beach",            cat: "spots",     count: 11 },
  { id: "c16", date: 24, time: "16:00", title: "Street food pop-up",        subtitle: "Robson Square · Downtown",       cat: "popups",    count: 28 },
];

/* ══════════════════════════════════════════════════════════════
   MINI CALENDAR (dashboard preview tile)
══════════════════════════════════════════════════════════════ */
function MiniCalendar({ onOpen }: { onOpen: () => void }) {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2026);
  const todayDate = month === 5 && year === 2026 ? 2 : -1;

  const dotsByDate: Record<number, string[]> = {};
  if (month === 5 && year === 2026) {
    CAL_EVENTS.forEach((e) => {
      if (!dotsByDate[e.date]) dotsByDate[e.date] = [];
      const col = CAT_COLORS[e.cat];
      if (!dotsByDate[e.date].includes(col)) dotsByDate[e.date].push(col);
    });
  }

  const firstDayJS = new Date(year, month, 1).getDay();
  const offset = firstDayJS === 0 ? 6 : firstDayJS - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const btnStyle: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 14, padding: "0 4px", lineHeight: 1 };

  return (
    <div onClick={onOpen} style={{ background: "#141414", borderRadius: 14, padding: "12px 10px", flex: 1, minWidth: 0, cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: T_PRIMARY }}>{monthNames[month]} {year}</span>
        <div style={{ display: "flex", gap: 0 }}>
          <button onClick={(e) => { e.stopPropagation(); if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m=>m-1); }} style={btnStyle}>‹</button>
          <button onClick={(e) => { e.stopPropagation(); if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m=>m+1); }} style={btnStyle}>›</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 2 }}>
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 9, fontWeight: 600, color: T_DIM, paddingBottom: 3 }}>{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {week.map((d, di) => {
            const dots = d ? (dotsByDate[d] ?? []).slice(0, 3) : [];
            return (
              <div key={di} style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 1 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: d === todayDate ? "#fff" : "transparent", fontSize: 9.5, fontWeight: d === todayDate ? 700 : 400, color: d === todayDate ? "#000" : d ? "#aaa" : "transparent" }}>
                  {d ?? ""}
                </div>
                <div style={{ height: 5, display: "flex", alignItems: "center", gap: 1.5, justifyContent: "center" }}>
                  {dots.map((col, ci) => <div key={ci} style={{ width: 3, height: 3, borderRadius: "50%", background: col }} />)}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LIVE CARD
══════════════════════════════════════════════════════════════ */
function LiveCard({ filter }: { filter: DashboardFilter }) {
  const data = mockDashboard[filter];
  const total = data.categoryStats.reduce((s, c) => s + c.count, 0);

  const allHours = mockDashboard.postsByHour["today"];
  const sparkData = allHours.slice(3, 10).map((h) => h.count);
  const sMin = Math.min(...sparkData), sMax = Math.max(...sparkData);
  const sRange = sMax - sMin || 1;
  const sW = 118, sH = 28;
  const pts = sparkData.map((v, i) => ({
    x: (i / (sparkData.length - 1)) * sW,
    y: sH - ((v - sMin) / sRange) * sH,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <div style={{ background: "#141414", borderRadius: 14, padding: "14px 14px 12px", flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.35)", flexShrink: 0, display: "inline-block" }} />
        <span style={{ fontSize: 9.5, fontWeight: 700, color: T_MUTED, letterSpacing: 1.5, textTransform: "uppercase" }}>Live right now</span>
      </div>
      <div style={{ fontSize: 44, fontWeight: 800, color: T_PRIMARY, lineHeight: 1, marginBottom: 6, letterSpacing: -2 }}>{total}</div>
      <div style={{ fontSize: 11, color: T_MUTED, marginBottom: "auto" }}>+9 in the last 15 min</div>
      <div style={{ marginTop: 14 }}>
        <svg width={sW + 2} height={sH + 2} style={{ display: "block" }}>
          <path d={path} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STAT CHIPS (row of 3)
══════════════════════════════════════════════════════════════ */
function StatChip({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <div style={{ background: "#141414", borderRadius: 12, padding: "11px 11px 9px", flex: 1 }}>
      <div style={{ fontSize: 8.5, fontWeight: 700, color: T_DIM, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 5 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: T_PRIMARY, lineHeight: 1, letterSpacing: -1 }}>{value}</span>
        <span style={{ fontSize: 10.5, fontWeight: 500, color: up ? T_MUTED : T_DIM, paddingBottom: 2 }}>{delta}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NIGHTLY PULSE
══════════════════════════════════════════════════════════════ */
function NightlyPulse({ filter }: { filter: DashboardFilter }) {
  const allHours = mockDashboard.postsByHour[filter];
  const showHours = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1];
  const barData = showHours.map((h) => ({ hour: h, count: allHours[h]?.count ?? 0 }));
  const maxCount = Math.max(...barData.map((b) => b.count), 1);
  const peakBar = barData.reduce((best, b) => (b.count > best.count ? b : best), barData[0]);
  const chartW = 318, chartH = 68, barW = 20;
  const gap = Math.floor((chartW - barW * showHours.length) / (showHours.length - 1));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Tonight&apos;s pulse</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginTop: 3 }}>
            Peak at {peakBar.hour < 10 ? `0${peakBar.hour}` : peakBar.hour}:00
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: T_MUTED }}>
          <IconTrendUp />+18%
        </div>
      </div>
      <svg width={chartW} height={chartH + 18} style={{ display: "block", overflow: "visible" }}>
        {barData.map((b, i) => {
          const barH = Math.max(3, Math.round((b.count / maxCount) * chartH));
          const x = i * (barW + gap);
          const y = chartH - barH;
          const isPeak = b.hour === peakBar.hour;
          const label = b.hour === 0 ? "00" : b.hour === 1 ? "01" : `${b.hour}`;
          return (
            <g key={b.hour}>
              <rect x={x} y={y} width={barW} height={barH} rx={4} fill={isPeak ? T_BAR_FILL : T_BAR_REST} />
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fill={isPeak ? T_PRIMARY : T_DIM} fontSize={9} fontFamily="inherit" fontWeight={isPeak ? 700 : 400}>{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TOP NEIGHBORHOODS
══════════════════════════════════════════════════════════════ */
const AREA_DELTAS: Partial<Record<AreaFilter, string>> = {
  downtown: "+12%", granville: "+8%", gastown: "+5%", robson: "-3%",
  kitsilano: "+15%", "mount-pleasant": "+9%", ubc: "-1%", "stanley-park": "+2%",
};

function TopNeighborhoods() {
  const all = mockDashboard.areaStats;
  const list = all.slice(0, 5);
  const maxTotal = all[0]?.total ?? 1;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {list.map((a, idx) => {
        const delta = AREA_DELTAS[a.key];
        const barPct = Math.round((a.total / maxTotal) * 100);
        return (
          <div key={a.key} style={{ paddingTop: idx === 0 ? 0 : 9, paddingBottom: 9, borderBottom: idx < list.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: T_DIM, width: 16, textAlign: "right", fontWeight: 600 }}>{String(idx + 1).padStart(2, "0")}</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T_DOT, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: T_PRIMARY }}>{a.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T_PRIMARY }}>{a.total}</span>
              {delta && <span style={{ fontSize: 10.5, fontWeight: 500, color: T_MUTED, width: 38, textAlign: "right" }}>{delta}</span>}
            </div>
            <div style={{ marginLeft: 32, height: 2, background: "#1a1a1a", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${barPct}%`, background: "#3a3a3a", borderRadius: 9999 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION HEADER (collapsible-style label row)
══════════════════════════════════════════════════════════════ */
function SH({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <p style={{ fontSize: 9.5, fontWeight: 700, color: T_DIM, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>{label}</p>
      {right && <div style={{ fontSize: 10, color: T_DIM }}>{right}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CALENDAR MODAL
══════════════════════════════════════════════════════════════ */
function CalendarModal({ onClose }: { onClose: () => void }) {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2026);
  const [selected, setSelected] = useState(2);
  const TODAY_DATE = 2, TODAY_MONTH = 5;
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const shortMonth = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const prev = () => { if (month === 0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1); };

  const firstDayJS = new Date(year, month, 1).getDay();
  const offset = firstDayJS === 0 ? 6 : firstDayJS - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const monthEvents = month === TODAY_MONTH && year === 2026 ? CAL_EVENTS : [];
  const dotsByDate: Record<number, string[]> = {};
  monthEvents.forEach((e) => {
    if (!dotsByDate[e.date]) dotsByDate[e.date] = [];
    const col = CAT_COLORS[e.cat];
    if (!dotsByDate[e.date].includes(col)) dotsByDate[e.date].push(col);
  });
  const selectedEvents = monthEvents.filter((e) => e.date === selected).sort((a, b) => a.time.localeCompare(b.time));
  const isToday = (d: number) => d === TODAY_DATE && month === TODAY_MONTH && year === 2026;
  const navBtn: React.CSSProperties = { width: 34, height: 34, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", color: "#888", cursor: "pointer", fontSize: 16, flexShrink: 0 };
  const LEGEND: { key: CalCat; label: string }[] = [
    { key: "live", label: "Live" }, { key: "food", label: "Food" }, { key: "spots", label: "Spots" }, { key: "popups", label: "Pop-ups" }, { key: "nightlife", label: "Nightlife" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, background: "#080808", zIndex: 60, display: "flex", flexDirection: "column", overflowY: "auto", scrollbarWidth: "none" }}>
      <div style={{ padding: "18px 20px 10px", flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: "#555", marginBottom: 4, letterSpacing: 0.5 }}>{monthNames[month]} {year}</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: T_PRIMARY, lineHeight: 1, letterSpacing: -2 }}>{monthEvents.length}</span>
            <span style={{ fontSize: 14, color: "#555" }}>events on the radar</span>
          </div>
          <div style={{ display: "flex", gap: 6, paddingBottom: 6 }}>
            <button onClick={prev} style={navBtn}>‹</button>
            <button onClick={next} style={navBtn}>›</button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 14px", flexShrink: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: T_DIM, padding: "4px 0" }}>{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 2 }}>
            {week.map((d, di) => {
              const sel = d === selected && month === TODAY_MONTH && year === 2026;
              const today = d !== null && isToday(d);
              const dots = (d && dotsByDate[d]) ? dotsByDate[d].slice(0, 3) : [];
              return (
                <div key={di} onClick={() => d && setSelected(d)} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: d ? "pointer" : "default" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? "#1e1e1e" : "transparent", border: sel ? "1px solid rgba(255,255,255,0.15)" : today ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
                    <span style={{ fontSize: 15, fontWeight: sel || today ? 700 : 400, color: d ? (sel || today ? T_PRIMARY : "#666") : "transparent" }}>{d ?? ""}</span>
                  </div>
                  <div style={{ height: 8, display: "flex", alignItems: "center", gap: 2, justifyContent: "center", marginTop: 1 }}>
                    {dots.map((col, ci) => <div key={ci} style={{ width: 5, height: 5, borderRadius: "50%", background: col }} />)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 14, padding: "10px 20px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }}>
        {LEGEND.map((l) => (
          <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: CAT_COLORS[l.key] }} />
            <span style={{ fontSize: 12, color: "#888" }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: "4px 20px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "14px 0 10px" }}>
          {isToday(selected) ? (
            <span style={{ fontSize: 18, fontWeight: 700, color: T_PRIMARY }}><strong>Today</strong>, {shortMonth[month]} {selected}</span>
          ) : (
            <span style={{ fontSize: 18, fontWeight: 700, color: T_PRIMARY }}>{shortMonth[month]} {selected}</span>
          )}
          <span style={{ fontSize: 12, color: "#555" }}>{selectedEvents.length} events</span>
        </div>
        {selectedEvents.length === 0 ? (
          <p style={{ fontSize: 13, color: T_DIM, padding: "12px 0" }}>Nothing on the radar for this date.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {selectedEvents.map((ev, idx) => (
              <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: idx < selectedEvents.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#666", width: 46, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{ev.time}</span>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[ev.cat], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T_PRIMARY, marginBottom: 3 }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: "#555" }}>{ev.subtitle}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span style={{ fontSize: 12, color: "#555" }}>{ev.count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "14px 20px 24px", flexShrink: 0 }}>
        <button onClick={onClose} style={{ width: "100%", height: 46, borderRadius: 12, background: "#141414", border: "1px solid rgba(255,255,255,0.08)", color: "#888", fontSize: 14, cursor: "pointer" }}>Close</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MOCK QR (decorative)
══════════════════════════════════════════════════════════════ */
function MockQR() {
  const SZ = 3;
  const pattern = [
    "1111111010110","1000001001010","1011101110000","1011101000101",
    "1011101010011","1000001011010","1111111001100","0000000100101",
    "1101100110100","0100110101011","1001001011100","0110100100110","1010011010010",
  ];
  const rows = pattern.length, cols = pattern[0].length;
  return (
    <svg width={cols * SZ} height={rows * SZ} viewBox={`0 0 ${cols * SZ} ${rows * SZ}`} style={{ display: "block" }}>
      {pattern.map((row, ri) => [...row].map((cell, ci) =>
        cell === "1" ? <rect key={`${ri}-${ci}`} x={ci * SZ} y={ri * SZ} width={SZ} height={SZ} fill="rgba(255,255,255,0.65)" /> : null
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   SETTINGS ROW
══════════════════════════════════════════════════════════════ */
function SettingRow({ label, sublabel, last = false }: { label: string; sublabel?: string; last?: boolean }) {
  return (
    <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", background: "none", border: "none", cursor: "pointer", borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.04)", textAlign: "left" as const }}>
      <div>
        <div style={{ fontSize: 14, color: "#d0d0d0", fontWeight: 400 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: T_DIM, marginTop: 1 }}>{sublabel}</div>}
      </div>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   SETTINGS PANEL (preferences + app settings)
══════════════════════════════════════════════════════════════ */
function SettingsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#080808", zIndex: 60, overflowY: "auto", scrollbarWidth: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px 0" }}>
        <span style={{ fontSize: 10, color: T_DIM, letterSpacing: 1.5, textTransform: "uppercase" }}>Settings</span>
        <button aria-label="Close" onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "#888", width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconClose />
        </button>
      </div>
      <div style={{ padding: "22px 18px 0" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: T_PRIMARY, marginBottom: 20, letterSpacing: -0.3 }}>Settings</div>

        <div style={{ fontSize: 9, color: "#383838", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 4 }}>Preferences</div>
        <div style={{ background: "#0f0f0f", borderRadius: 12, padding: "0 14px", marginBottom: 18, border: "1px solid rgba(255,255,255,0.05)" }}>
          <SettingRow label="Notifications" />
          <SettingRow label="Privacy" />
          <SettingRow label="Data & activity" last />
        </div>

        <div style={{ fontSize: 9, color: "#383838", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 4 }}>Account</div>
        <div style={{ background: "#0f0f0f", borderRadius: 12, padding: "0 14px", marginBottom: 18, border: "1px solid rgba(255,255,255,0.05)" }}>
          <SettingRow label="Edit profile" />
          <SettingRow label="Change city" sublabel="Vancouver, BC" last />
        </div>

        <div style={{ fontSize: 9, color: "#383838", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 4 }}>About</div>
        <div style={{ background: "#0f0f0f", borderRadius: 12, padding: "0 14px", marginBottom: 18, border: "1px solid rgba(255,255,255,0.05)" }}>
          <SettingRow label="About Recon" />
          <SettingRow label="Help & feedback" />
          <SettingRow label="Terms of service" />
          <SettingRow label="Privacy policy" last />
        </div>

        <button style={{ width: "100%", height: 48, borderRadius: 12, background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#d0d0d0", fontSize: 14, cursor: "pointer", marginBottom: 24 }}>Log out</button>
        <div style={{ textAlign: "center", fontSize: 11, color: "#2a2a2a", paddingBottom: 32 }}>Recon Beta · Vancouver · v0.1</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ACCOUNT PANEL (membership ID card + handle)
══════════════════════════════════════════════════════════════ */
function AccountPanel({ onClose }: { onClose: () => void }) {
  const R_LOGO = (
    <svg width="22" height="22" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
      <line x1="24" y1="78" x2="24" y2="24" />
      <path d="M 24 24 C 24 18 72 18 72 40 C 72 58 48 60 38 60" />
      <line x1="38" y1="60" x2="74" y2="80" />
    </svg>
  );
  return (
    <div style={{ position: "absolute", inset: 0, background: "#080808", zIndex: 60, overflowY: "auto", scrollbarWidth: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px 0" }}>
        <span style={{ fontSize: 10, color: T_DIM, letterSpacing: 1.5, textTransform: "uppercase" }}>Account</span>
        <button aria-label="Close" onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "#888", width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconClose />
        </button>
      </div>

      <div style={{ margin: "14px 18px 0", background: "#000", borderRadius: 18, padding: "22px 20px", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>{R_LOGO}</div>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 3, textTransform: "uppercase" as const, fontWeight: 600, paddingTop: 4 }}>RECON™</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: T_PRIMARY, letterSpacing: 0.5, textTransform: "uppercase" as const, marginBottom: 16, lineHeight: 1.2 }}>Member —<br/>All Access</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          {[{ label: "CITY", value: "Vancouver, BC" }, { label: "SINCE", value: "Jun 2026" }].map((f) => (
            <div key={f.label}>
              <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.28)", letterSpacing: 2.5, textTransform: "uppercase" as const, marginBottom: 3, fontWeight: 600 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 16 }} />
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 5, letterSpacing: 0.5 }}>@davidren</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: T_PRIMARY, textTransform: "uppercase" as const, letterSpacing: 1, lineHeight: 1 }}>David Ren</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
          <div style={{ flexShrink: 0 }}><MockQR /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.28)", letterSpacing: 2.5, textTransform: "uppercase" as const, marginBottom: 3, fontWeight: 600 }}>REFERENCE ID</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontVariantNumeric: "tabular-nums", marginBottom: 10 }}>RC-20381930</div>
            <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" as const, letterSpacing: 1.5, lineHeight: 1.6 }}>Recon Beta<br/>Vancouver · v0.1</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 18px 32px" }}>
        <button style={{ width: "100%", height: 48, borderRadius: 12, background: "#f0f0f0", border: "none", color: "#000", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Edit profile</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   YOU POPUP BUBBLE
══════════════════════════════════════════════════════════════ */
function YouPopup({ onDashboard, onSettings, onAccount, onClose }: {
  onDashboard: () => void;
  onSettings: () => void;
  onAccount: () => void;
  onClose: () => void;
}) {
  const rowStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "13px 14px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left" as const,
    color: T_PRIMARY,
  };

  return (
    <>
      {/* Invisible backdrop to close popup on outside tap */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 55 }} />

      {/* Bubble card */}
      <div style={{
        position: "absolute",
        bottom: 72,
        right: 10,
        width: 196,
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.11)",
        borderRadius: 14,
        zIndex: 56,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
      }}>
        {/* Dashboard row */}
        <button onClick={() => { onDashboard(); onClose(); }} style={rowStyle}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#222", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconDashboard />
          </div>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Dashboard</span>
          <IconChevronRight />
        </button>

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 14px" }} />

        {/* Settings row */}
        <button onClick={() => { onSettings(); onClose(); }} style={rowStyle}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#222", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconSettings />
          </div>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Settings</span>
          <IconChevronRight />
        </button>

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 14px" }} />

        {/* Account row */}
        <button onClick={() => { onAccount(); onClose(); }} style={rowStyle}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#222", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IconUser />
          </div>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Account</span>
          <IconChevronRight />
        </button>

        {/* Arrow notch pointing down toward the You button */}
        <div style={{
          position: "absolute",
          bottom: -6,
          right: 22,
          width: 12,
          height: 12,
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.11)",
          transform: "rotate(45deg)",
          borderTop: "none",
          borderLeft: "none",
        }} />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD CLIENT
══════════════════════════════════════════════════════════════ */
type ModalId = "events" | "categories" | "weather" | "safety" | "transit" | null;

export default function DashboardClient() {
  const [filter, setFilter] = useState<DashboardFilter>("today");
  const [openModal, setOpenModal] = useState<ModalId>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [youPopupOpen, setYouPopupOpen] = useState(false);

  const data = mockDashboard[filter];
  const close = () => setOpenModal(null);

  return (
    <div style={{
      width: "100%",
      maxWidth: 430,
      height: "100dvh",
      margin: "0 auto",
      background: "#080808",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* ── TOP BAR (matches reference structure: logo | city | bell) ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px 10px",
        flexShrink: 0,
      }}>
        {/* R logo */}
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: "#111",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <ReconLogo />
        </div>

        {/* City selector (center) */}
        <button style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px 10px",
          borderRadius: 9999,
        }}>
          <span style={{ color: "#888" }}><IconPin /></span>
          <span style={{ fontSize: 16, fontWeight: 700, color: T_PRIMARY, letterSpacing: -0.3 }}>Vancouver</span>
          <span style={{ color: "#666" }}><IconChevronDown /></span>
        </button>

        {/* Bell icon */}
        <div style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "#111",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          position: "relative",
          flexShrink: 0,
        }}>
          <IconBell />
          {/* Subtle notification dot */}
          <span style={{ position: "absolute", top: 8, right: 9, width: 6, height: 6, borderRadius: "50%", background: T_PRIMARY, border: "1.5px solid #111" }} />
        </div>
      </div>

      {/* ── FILTER PILLS (Today / Tonight / Weekend) ── */}
      <div style={{
        display: "flex",
        gap: 7,
        padding: "2px 16px 10px",
        flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <Pill label="Today"   active={filter === "today"}   onClick={() => setFilter("today")} />
        <Pill label="Tonight" active={filter === "tonight"} onClick={() => setFilter("tonight")} />
        <Pill label="Weekend" active={filter === "weekend"} onClick={() => setFilter("weekend")} />
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <main style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>

        {/* ── ROW 1: Live card + Mini Calendar ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "14px 18px 10px" }}>
          <LiveCard filter={filter} />
          <MiniCalendar onOpen={() => setCalendarOpen(true)} />
        </div>

        {/* ── ROW 2: 3 stat chips ── */}
        <div style={{ display: "flex", gap: 8, padding: "0 18px 14px" }}>
          <StatChip label="Within 1km"  value="18"  delta="+24%" up={true}  />
          <StatChip label="Posts today" value="312" delta="+41"  up={true}  />
          <StatChip label="Saves"       value="58"  delta="-6%"  up={false} />
        </div>

        {/* ── TONIGHT'S PULSE ── */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <NightlyPulse filter={filter} />
        </div>

        {/* ── TOP NEIGHBORHOODS ── */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <SH label="Top neighborhoods" right="Map ↗" />
          <TopNeighborhoods />
        </div>

        {/* ── SEPARATOR between legacy and new modules ── */}
        <div style={{ padding: "10px 18px 4px" }}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />
          <p style={{ fontSize: 9.5, fontWeight: 700, color: "#2a2a2a", letterSpacing: 2, textTransform: "uppercase", margin: "10px 0 4px" }}>
            City dashboard
          </p>
        </div>

        {/* ── NEW DASHBOARD MODULES ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 18px 20px" }}>
          <EventsByTimePreview
            filter={filter}
            blocks={data.timeBlocks}
            onOpen={() => setOpenModal("events")}
          />
          <CategoryBreakdownPreview
            stats={data.categoryStats}
            onOpen={() => setOpenModal("categories")}
          />
          <WeatherImpactPreview
            weather={data.weather}
            onOpen={() => setOpenModal("weather")}
          />
          <SafetyCautionPreview
            items={data.safetyItems}
            onOpen={() => setOpenModal("safety")}
          />
          <TransitDisruptionPreview
            routes={mockDashboard.transitRoutes}
            onOpen={() => setOpenModal("transit")}
          />
        </div>

      </main>

      {/* ── BOTTOM NAV ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
        background: "rgba(8,8,8,0.98)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        {[
          { label: "Map",       icon: <IconMap />,       href: "/discover",  active: false, isBtn: false },
          { label: "Dashboard", icon: <IconDashboard />, href: "/dashboard", active: true,  isBtn: false },
          { label: "Saved",     icon: <IconBookmark />,  href: "/saved",     active: false, isBtn: false },
        ].map((item) => (
          <Link key={item.label} href={item.href} aria-current={item.active ? "page" : undefined}
            style={{ textDecoration: "none", color: item.active ? T_PRIMARY : "#383838" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 14px" }}>
              {item.icon}
              <span style={{ fontSize: 10.5, fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
            </div>
          </Link>
        ))}

        {/* You button — opens popup bubble */}
        <button
          onClick={() => setYouPopupOpen(v => !v)}
          aria-expanded={youPopupOpen}
          aria-label="You"
          style={{ background: "none", border: "none", cursor: "pointer", color: youPopupOpen ? T_PRIMARY : "#383838", padding: "4px 14px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <IconUser />
            <span style={{ fontSize: 10.5, fontWeight: youPopupOpen ? 600 : 400 }}>You</span>
          </div>
        </button>
      </div>

      {/* ── YOU POPUP ── */}
      {youPopupOpen && (
        <YouPopup
          onDashboard={() => {}}
          onSettings={() => setSettingsOpen(true)}
          onAccount={() => setAccountOpen(true)}
          onClose={() => setYouPopupOpen(false)}
        />
      )}

      {/* ── OVERLAYS ── */}
      {calendarOpen && <CalendarModal onClose={() => setCalendarOpen(false)} />}
      {settingsOpen  && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      {accountOpen   && <AccountPanel  onClose={() => setAccountOpen(false)} />}

      {openModal === "events" && (
        <DashboardModal title="Events by time" onClose={close}>
          <EventsByTimeModal filter={filter} blocks={data.timeBlocks} events={data.events} />
        </DashboardModal>
      )}
      {openModal === "categories" && (
        <DashboardModal title="Category breakdown" onClose={close}>
          <CategoryBreakdownModal stats={data.categoryStats} />
        </DashboardModal>
      )}
      {openModal === "weather" && (
        <DashboardModal title="Weather impact" onClose={close}>
          <WeatherImpactModal weather={data.weather} />
        </DashboardModal>
      )}
      {openModal === "safety" && (
        <DashboardModal title="Safety caution" onClose={close}>
          <SafetyCautionModal items={data.safetyItems} />
        </DashboardModal>
      )}
      {openModal === "transit" && (
        <DashboardModal title="Transit disruption" onClose={close}>
          <TransitDisruptionModal routes={mockDashboard.transitRoutes} />
        </DashboardModal>
      )}

    </div>
  );
}
