"use client";

import { useState } from "react";
import { mockDashboard } from "../lib/mockDashboard";
import type { DashboardFilter } from "../types/dashboard";
import DashboardModal from "./DashboardModal";
import { EventsByTimePreview, EventsByTimeModal } from "./dashboard/EventsByTime";
import { CategoryBreakdownPreview, CategoryBreakdownModal } from "./dashboard/CategoryBreakdown";
import { WeatherImpactPreview, WeatherImpactModal } from "./dashboard/WeatherImpact";
import { SafetyCautionPreview, SafetyCautionModal } from "./dashboard/SafetyCaution";
import { TransitDisruptionPreview, TransitDisruptionModal } from "./dashboard/TransitDisruption";

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const BG        = "#131313";
const SURFACE   = "#1c1c1c";
const SURFACE2  = "#222222";
const SURFACE3  = "#2a2a2a";

const LINE      = "rgba(255,255,255,0.05)";
const BORDER    = "rgba(255,255,255,0.08)";
const BORDER_M  = "rgba(255,255,255,0.11)";

const T1        = "#f2f2f2";
const T2        = "#9a9a9a";
const T3        = "#4e4e4e";
const T4        = "#2e2e2e";

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
function IconTrendUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}
function ReconLogo() {
  return (
    <svg width="19" height="19" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
      <line x1="24" y1="78" x2="24" y2="24"/>
      <path d="M 24 24 C 24 18 72 18 72 40 C 72 58 48 60 38 60"/>
      <line x1="38" y1="60" x2="74" y2="80"/>
    </svg>
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

function MiniCalendar({ onOpen }: { onOpen: () => void }) {
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2026);
  const todayDate = month === 5 && year === 2026 ? 2 : -1;

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
  const btnStyle: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: T3, fontSize: 15, padding: "0 4px", lineHeight: 1 };

  return (
    <div
      onClick={onOpen}
      style={{ background: SURFACE, borderRadius: 18, border: `1px solid ${BORDER}`, padding: "13px 11px", flex: 1, minWidth: 0, cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: T1, letterSpacing: -0.2 }}>{monthNames[month]} {year}</span>
        <div style={{ display: "flex" }}>
          <button onClick={(e) => { e.stopPropagation(); if (month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }} style={btnStyle}>‹</button>
          <button onClick={(e) => { e.stopPropagation(); if (month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }} style={btnStyle}>›</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 2 }}>
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 9, fontWeight: 600, color: T3, paddingBottom: 3, letterSpacing: 0.5 }}>{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {week.map((d, di) => (
            <div key={di} style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 1 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: d === todayDate ? T1 : "transparent", fontSize: 9.5, fontWeight: d === todayDate ? 700 : 400, color: d === todayDate ? "#0d0d0d" : d ? "#7a7a7a" : "transparent" }}>
                {d ?? ""}
              </div>
              <div style={{ height: 5 }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function LiveCard({ filter }: { filter: DashboardFilter }) {
  const data = mockDashboard[filter];
  const total = data.categoryStats.reduce((s, c) => s + c.count, 0);

  return (
    <div style={{ background: SURFACE, borderRadius: 18, border: `1px solid ${BORDER}`, padding: "15px 15px 12px", flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: T3, letterSpacing: 1.5, textTransform: "uppercase" }}>Live right now</span>
      </div>
      <div style={{ fontSize: 46, fontWeight: 800, color: T1, lineHeight: 1, marginBottom: 6, letterSpacing: -2.5 }}>{total}</div>
      <div style={{ fontSize: 12, color: T2, marginBottom: "auto" }}>+9 in the last 15 min</div>
    </div>
  );
}

function StatChip({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "14px 13px 12px", flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 500, color: T3, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: T1, lineHeight: 1, letterSpacing: -1.2 }}>{value}</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: up ? T2 : T3, paddingBottom: 2 }}>{delta}</span>
      </div>
    </div>
  );
}

function NightlyPulse({ filter }: { filter: DashboardFilter }) {
  const allHours = mockDashboard.postsByHour[filter];
  const showHours = [14,15,16,17,18,19,20,21,22,23,0,1];
  const barData = showHours.map((h) => ({ hour: h, count: allHours[h]?.count ?? 0 }));
  const maxCount = Math.max(...barData.map((b) => b.count), 1);
  const peakBar = barData.reduce((best, b) => (b.count > best.count ? b : best), barData[0]);
  const chartW = 318, chartH = 64, barW = 19;
  const gap = Math.floor((chartW - barW * showHours.length) / (showHours.length - 1));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: T3, letterSpacing: 1.8, textTransform: "uppercase" }}>Tonight&apos;s pulse</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T2, marginTop: 4 }}>
            Peak at {peakBar.hour < 10 ? `0${peakBar.hour}` : peakBar.hour}:00
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: T2 }}>
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
              <rect x={x} y={y} width={barW} height={barH} rx={5} fill={isPeak ? T1 : SURFACE2} />
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fill={isPeak ? T1 : T3} fontSize={9} fontFamily="inherit" fontWeight={isPeak ? 700 : 400}>{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TopNeighborhoods() {
  const all = mockDashboard.areaStats.slice(0, 5);
  const maxTotal = mockDashboard.areaStats[0]?.total ?? 1;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {all.map((a, idx) => {
        const barPct = Math.round((a.total / maxTotal) * 100);
        return (
          <div key={a.key} style={{ paddingTop: idx === 0 ? 0 : 10, paddingBottom: 10, borderBottom: idx < all.length - 1 ? `1px solid ${LINE}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: T3, width: 16, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{String(idx + 1).padStart(2, "0")}</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: SURFACE3, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: T1, letterSpacing: -0.2 }}>{a.label}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: T1 }}>{a.total}</span>
            </div>
            <div style={{ marginLeft: 32, height: 2, background: SURFACE2, borderRadius: 9999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${barPct}%`, background: SURFACE3, borderRadius: 9999 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionLabel({ text, right }: { text: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: T3, letterSpacing: 1.8, textTransform: "uppercase", margin: 0 }}>{text}</p>
      {right && <div style={{ fontSize: 10.5, color: T3 }}>{right}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════════ */
type ModalId = "events" | "categories" | "weather" | "safety" | "transit" | null;

const FILTER_OPTIONS: { value: DashboardFilter; label: string }[] = [
  { value: "today",   label: "Today"   },
  { value: "tonight", label: "Tonight" },
  { value: "weekend", label: "Weekend" },
];

export default function DashboardClient() {
  const [filter, setFilter] = useState<DashboardFilter>("today");
  const [openModal, setOpenModal] = useState<ModalId>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const data = mockDashboard[filter];
  const close = () => setOpenModal(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, position: "relative" }}>
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
          <span style={{ position: "absolute", top: 9, right: 10, width: 5.5, height: 5.5, borderRadius: "50%", background: T1, border: `1.5px solid ${BG}` }} />
        </div>
      </div>

      {/* ── SEGMENTED FILTER ── */}
      <div style={{ padding: "4px 18px 10px", flexShrink: 0, borderBottom: `1px solid ${LINE}` }}>
        <SegmentedFilter options={FILTER_OPTIONS} active={filter} onChange={setFilter} />
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <main style={{ flex: 1, minHeight: 0, overflowY: "auto", scrollbarWidth: "none" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "14px 18px 10px" }}>
          <LiveCard filter={filter} />
          <MiniCalendar onOpen={() => setCalendarOpen(true)} />
        </div>

        <div style={{ display: "flex", gap: 8, padding: "0 18px 14px" }}>
          <StatChip label="Within 1km"  value="18"  delta="+24%" up={true}  />
          <StatChip label="Posts today" value="312" delta="+41"  up={true}  />
          <StatChip label="Saves"       value="58"  delta="-6%"  up={false} />
        </div>

        <div style={{ padding: "14px 18px 16px", borderBottom: `1px solid ${LINE}` }}>
          <NightlyPulse filter={filter} />
        </div>

        <div style={{ padding: "16px 18px 16px", borderBottom: `1px solid ${LINE}` }}>
          <SectionLabel text="Top neighborhoods" right="Map ↗" />
          <TopNeighborhoods />
        </div>

        <div style={{ padding: "12px 18px 4px" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: T4, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 6px" }}>City dashboard</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 18px 24px" }}>
          <EventsByTimePreview      filter={filter} blocks={data.timeBlocks} onOpen={() => setOpenModal("events")} />
          <CategoryBreakdownPreview stats={data.categoryStats}              onOpen={() => setOpenModal("categories")} />
          <WeatherImpactPreview     weather={data.weather}                  onOpen={() => setOpenModal("weather")} />
          <SafetyCautionPreview     items={data.safetyItems}                onOpen={() => setOpenModal("safety")} />
          <TransitDisruptionPreview routes={mockDashboard.transitRoutes}   onOpen={() => setOpenModal("transit")} />
        </div>
      </main>

      {/* ── MODALS ── */}
      {calendarOpen && (
        <div style={{ position: "absolute", inset: 0, background: BG, zIndex: 60, display: "flex", flexDirection: "column", overflowY: "auto", scrollbarWidth: "none" }}>
          <div style={{ padding: "20px 20px 28px", flex: 1 }}>
             <p style={{ color: T1 }}>Calendar coming soon...</p>
             <button onClick={() => setCalendarOpen(false)} style={{ padding: "10px 20px", background: SURFACE, border: `1px solid ${BORDER}`, color: T1, cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}

      {openModal === "events"     && <DashboardModal title="Events by time"     onClose={close}><EventsByTimeModal filter={filter} blocks={data.timeBlocks} events={data.events} /></DashboardModal>}
      {openModal === "categories" && <DashboardModal title="Category breakdown" onClose={close}><CategoryBreakdownModal stats={data.categoryStats} /></DashboardModal>}
      {openModal === "weather"    && <DashboardModal title="Weather impact"     onClose={close}><WeatherImpactModal weather={data.weather} /></DashboardModal>}
      {openModal === "safety"     && <DashboardModal title="Safety caution"     onClose={close}><SafetyCautionModal items={data.safetyItems} /></DashboardModal>}
      {openModal === "transit"    && <DashboardModal title="Transit disruption" onClose={close}><TransitDisruptionModal routes={mockDashboard.transitRoutes} /></DashboardModal>}
    </div>
  );
}
