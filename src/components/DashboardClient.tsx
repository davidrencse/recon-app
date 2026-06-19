"use client";

import { useState, useEffect, useMemo } from "react";
import type { DashboardFilter, WeatherData, TransitRoute, HourlyPost, AreaStats } from "../types/dashboard";
import type { Pin, PinCategory } from "../types/pin";
import { getPins } from "../lib/getPins";
import { readSavedPins } from "../lib/savedPins";
import {
  filterPins,
  buildTimeBlocks,
  buildEvents,
  buildCategoryStats,
  buildSafetyItems,
  buildPostsByHour,
  buildAreaStats,
} from "../lib/dashboardData";
import DashboardModal from "./DashboardModal";
import { EventsByTimePreview, EventsByTimeModal } from "./dashboard/EventsByTime";
import { CategoryBreakdownPreview, CategoryBreakdownModal } from "./dashboard/CategoryBreakdown";
import { WeatherImpactPreview, WeatherImpactModal } from "./dashboard/WeatherImpact";
import { SafetyCautionPreview, SafetyCautionModal } from "./dashboard/SafetyCaution";
import { TransitDisruptionPreview, TransitDisruptionModal } from "./dashboard/TransitDisruption";

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const BG        = "var(--bg)";
const SURFACE   = "var(--surface)";
const SURFACE2  = "var(--surface-3)";
const SURFACE3  = "var(--surface-3)";

const LINE      = "var(--line)";
const BORDER    = "var(--border)";
const BORDER_M  = "var(--border-strong)";

const T1        = "var(--t1)";
const T2        = "var(--t2)";
const T3        = "var(--t3)";

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
    <img
      src="/logo.png"
      alt="R"
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   CALENDAR (live — events derived from pins)
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
  id: string; day: number; month: number; year: number;
  time: string; title: string; subtitle: string; cat: CalCat;
}

const PIN_TO_CALCAT: Record<PinCategory, CalCat> = {
  trending: "live",
  cafes: "food",
  nightlife: "nightlife",
  pop: "popups",
  crime_safety: "spots",
};

function buildCalEvents(pins: Pin[]): CalEvent[] {
  return pins.map((p) => {
    const d = new Date(p.createdAt);
    let h = d.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return {
      id: p.postId,
      day: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      time: `${h}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`,
      title: p.text.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim().slice(0, 60) || p.placeName,
      subtitle: `${p.placeName}${p.neighborhood ? ` · ${p.neighborhood}` : ""}`,
      cat: PIN_TO_CALCAT[p.category],
    };
  });
}

/* ══════════════════════════════════════════════════════════════
   UI COMPONENTS
══════════════════════════════════════════════════════════════ */
function SegmentedFilter({
  options, active, onChange,
}: {
  options: { value: DashboardFilter; label: string }[];
  active: DashboardFilter;
  onChange: (v: DashboardFilter) => void;
}) {
  return (
    <div style={{ display: "inline-flex", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 9999, padding: 3, gap: 1 }}>
      {options.map((o) => {
        const isActive = o.value === active;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={isActive}
            style={{
              padding: "6px 16px", borderRadius: 9999, fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              background: isActive ? "var(--chip-bg)" : "transparent",
              color: isActive ? "var(--chip-text)" : T3,
              border: "none", cursor: "pointer",
              letterSpacing: isActive ? -0.1 : 0,
              transition: "background 120ms, color 120ms",
              whiteSpace: "nowrap" as const, fontFamily: "inherit",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function MiniCalendar({ events, onOpen }: { events: CalEvent[]; onOpen: () => void }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const todayDate = month === today.getMonth() && year === today.getFullYear() ? today.getDate() : -1;

  const dotsByDate: Record<number, string[]> = {};
  events.filter((e) => e.month === month && e.year === year).forEach((e) => {
    if (!dotsByDate[e.day]) dotsByDate[e.day] = [];
    const col = CAT_COLORS[e.cat];
    if (!dotsByDate[e.day].includes(col)) dotsByDate[e.day].push(col);
  });

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
    <div onClick={onOpen} style={{ background: SURFACE, borderRadius: 18, border: `1px solid ${BORDER}`, padding: "13px 11px", flex: 1, minWidth: 0, cursor: "pointer" }}>
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
          {week.map((d, di) => {
            const dots = d ? (dotsByDate[d] ?? []).slice(0, 3) : [];
            return (
              <div key={di} style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 1 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: d === todayDate ? T1 : "transparent", fontSize: 9.5, fontWeight: d === todayDate ? 700 : 400, color: d === todayDate ? "var(--chip-text)" : d ? "var(--t3)" : "transparent" }}>
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

function LiveCard({ total, recent }: { total: number; recent: number }) {
  return (
    <div style={{ background: SURFACE, borderRadius: 18, border: `1px solid ${BORDER}`, padding: "15px 15px 12px", flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--border-strong)", flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: T3, letterSpacing: 1.5, textTransform: "uppercase" }}>Live right now</span>
      </div>
      <div style={{ fontSize: 46, fontWeight: 800, color: T1, lineHeight: 1, marginBottom: 6, letterSpacing: -2.5 }}>{total}</div>
      <div style={{ fontSize: 12, color: T2, marginBottom: "auto" }}>
        {recent > 0 ? `+${recent} in the last 15 min` : "No new pins in 15 min"}
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "14px 13px 12px", flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 500, color: T3, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: T1, lineHeight: 1, letterSpacing: -1.2 }}>{value}</span>
      </div>
    </div>
  );
}

function NightlyPulse({ hours }: { hours: HourlyPost[] }) {
  const showHours = [14,15,16,17,18,19,20,21,22,23,0,1];
  const barData = showHours.map((h) => ({ hour: h, count: hours[h]?.count ?? 0 }));
  const maxCount = Math.max(...barData.map((b) => b.count), 1);
  const peakBar = barData.reduce((best, b) => (b.count > best.count ? b : best), barData[0]);
  const total = barData.reduce((s, b) => s + b.count, 0);
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
          <IconTrendUp />{total} posts
        </div>
      </div>
      <svg width={chartW} height={chartH + 18} style={{ display: "block", overflow: "visible" }}>
        {barData.map((b, i) => {
          const barH = Math.max(3, Math.round((b.count / maxCount) * chartH));
          const x = i * (barW + gap);
          const y = chartH - barH;
          const isPeak = b.hour === peakBar.hour && b.count > 0;
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

function TopNeighborhoods({ areas }: { areas: AreaStats[] }) {
  const all = areas.slice(0, 5);
  const maxTotal = all[0]?.total ?? 1;
  if (all.length === 0) {
    return <p style={{ fontSize: 13, color: T3, padding: "8px 0" }}>No neighborhood activity yet.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {all.map((a, idx) => {
        const barPct = Math.round((a.total / maxTotal) * 100);
        return (
          <div key={a.label} style={{ paddingTop: idx === 0 ? 0 : 10, paddingBottom: 10, borderBottom: idx < all.length - 1 ? `1px solid ${LINE}` : "none" }}>
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
   CALENDAR MODAL
══════════════════════════════════════════════════════════════ */
function CalendarModal({ events, onClose }: { events: CalEvent[]; onClose: () => void }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(today.getDate());
  const mNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const sNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const prev = () => { if (month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const next = () => { if (month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  const firstDayJS = new Date(year, month, 1).getDay();
  const offset = firstDayJS === 0 ? 6 : firstDayJS - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i=0;i<offset;i++) cells.push(null);
  for (let d=1;d<=daysInMonth;d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7));

  const monthEvents = events.filter((e) => e.month === month && e.year === year);
  const dotsByDate: Record<number, string[]> = {};
  monthEvents.forEach((e) => {
    if (!dotsByDate[e.day]) dotsByDate[e.day] = [];
    const col = CAT_COLORS[e.cat];
    if (!dotsByDate[e.day].includes(col)) dotsByDate[e.day].push(col);
  });
  const selectedEvents = monthEvents.filter((e) => e.day === selected).sort((a,b) => a.time.localeCompare(b.time));
  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const navBtnStyle: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center",
    background: SURFACE2, border: `1px solid ${BORDER}`, color: T2, cursor: "pointer", fontSize: 16, flexShrink: 0,
  };
  const LEGEND: { key: CalCat; label: string }[] = [
    { key:"live", label:"Trending" }, { key:"food", label:"Cafes" }, { key:"spots", label:"Safety" }, { key:"popups", label:"Pop-ups" }, { key:"nightlife", label:"Nightlife" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, background: BG, zIndex: 60, display: "flex", flexDirection: "column", overflowY: "auto", scrollbarWidth: "none" }}>
      <div style={{ padding: "20px 20px 10px", flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: T3, marginBottom: 5, letterSpacing: 0.5 }}>{mNames[month]} {year}</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: T1, lineHeight: 1, letterSpacing: -3 }}>{monthEvents.length}</span>
            <span style={{ fontSize: 14, color: T3 }}>pins on the radar</span>
          </div>
          <div style={{ display: "flex", gap: 6, paddingBottom: 6 }}>
            <button onClick={prev} style={navBtnStyle}>‹</button>
            <button onClick={next} style={navBtnStyle}>›</button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 14px", flexShrink: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: T3, padding: "4px 0", letterSpacing: 0.5 }}>{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 2 }}>
            {week.map((d, di) => {
              const sel = d === selected;
              const todayCell = d !== null && isToday(d);
              const dots = (d && dotsByDate[d]) ? dotsByDate[d].slice(0, 3) : [];
              return (
                <div key={di} onClick={() => d && setSelected(d)} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: d ? "pointer" : "default" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? SURFACE2 : "transparent", border: sel ? `1px solid ${BORDER_M}` : todayCell ? `1px solid var(--border-strong)` : "none" }}>
                    <span style={{ fontSize: 15, fontWeight: sel || todayCell ? 700 : 400, color: d ? (sel || todayCell ? T1 : "var(--t3)") : "transparent" }}>{d ?? ""}</span>
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

      <div style={{ display: "flex", gap: 14, padding: "10px 20px 12px", borderTop: `1px solid ${LINE}`, flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }}>
        {LEGEND.map((l) => (
          <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: CAT_COLORS[l.key] }} />
            <span style={{ fontSize: 12, color: T2 }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: "4px 20px 0", borderTop: `1px solid ${LINE}` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "16px 0 10px" }}>
          {isToday(selected) ? (
            <span style={{ fontSize: 18, fontWeight: 700, color: T1 }}><strong>Today</strong>, {sNames[month]} {selected}</span>
          ) : (
            <span style={{ fontSize: 18, fontWeight: 700, color: T1 }}>{sNames[month]} {selected}</span>
          )}
          <span style={{ fontSize: 12, color: T3 }}>{selectedEvents.length} pins</span>
        </div>
        {selectedEvents.length === 0 ? (
          <p style={{ fontSize: 13, color: T3, padding: "12px 0" }}>Nothing on the radar for this date.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {selectedEvents.map((ev, idx) => (
              <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: idx < selectedEvents.length - 1 ? `1px solid ${LINE}` : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: T3, width: 64, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{ev.time}</span>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: CAT_COLORS[ev.cat], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T1, marginBottom: 3 }}>{ev.title}</div>
                  <div style={{ fontSize: 11.5, color: T3 }}>{ev.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "16px 20px 28px", flexShrink: 0 }}>
        <button onClick={onClose} style={{ width: "100%", height: 48, borderRadius: 14, background: SURFACE, border: `1px solid ${BORDER}`, color: T2, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
      </div>
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

  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [transit, setTransit] = useState<TransitRoute[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    getPins({ limit: 200 }).then(setPins).catch(() => setPins([])).finally(() => setLoading(false));
    fetch("/api/weather").then((r) => r.json()).then(setWeather).catch(() => setWeather(null));
    fetch("/api/transit").then((r) => r.json()).then((d) => setTransit(d.routes ?? [])).catch(() => setTransit([]));
    setSavedCount(readSavedPins().length);
  }, []);

  const close = () => setOpenModal(null);

  const filtered = useMemo(() => filterPins(pins, filter), [pins, filter]);
  const timeBlocks = useMemo(() => buildTimeBlocks(filtered), [filtered]);
  const events = useMemo(() => buildEvents(filtered), [filtered]);
  const categoryStats = useMemo(() => buildCategoryStats(filtered), [filtered]);
  const safetyItems = useMemo(() => buildSafetyItems(filtered), [filtered]);
  const postsByHour = useMemo(() => buildPostsByHour(filtered), [filtered]);
  const areaStats = useMemo(() => buildAreaStats(filtered), [filtered]);
  const calEvents = useMemo(() => buildCalEvents(pins), [pins]);

  const total = categoryStats.reduce((s, c) => s + c.count, 0) + safetyItems.length;
  const recent = useMemo(() => {
    const cutoff = Date.now() - 15 * 60_000;
    return pins.filter((p) => new Date(p.createdAt).getTime() >= cutoff).length;
  }, [pins]);
  const todayCount = useMemo(() => filterPins(pins, "today").length, [pins]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, position: "relative", width: "100%" }}>
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
          {recent > 0 && <span style={{ position: "absolute", top: 9, right: 10, width: 5.5, height: 5.5, borderRadius: "50%", background: T1, border: `1.5px solid ${BG}` }} />}
        </div>
      </div>

      {/* ── SEGMENTED FILTER ── */}
      <div style={{ padding: "4px 18px 10px", flexShrink: 0, borderBottom: `1px solid ${LINE}` }}>
        <SegmentedFilter options={FILTER_OPTIONS} active={filter} onChange={setFilter} />
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <main style={{ flex: 1, minHeight: 0, overflowY: "auto", scrollbarWidth: "none" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <span style={{ color: T3, fontSize: 13 }}>Loading…</span>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "14px 18px 10px" }}>
              <LiveCard total={total} recent={recent} />
              <MiniCalendar events={calEvents} onOpen={() => setCalendarOpen(true)} />
            </div>

            <div style={{ display: "flex", gap: 8, padding: "0 18px 14px" }}>
              <StatChip label="Active now"  value={filtered.length} />
              <StatChip label="Posts today" value={todayCount} />
              <StatChip label="Saved"       value={savedCount} />
            </div>

            <div style={{ padding: "14px 18px 16px", borderBottom: `1px solid ${LINE}` }}>
              <NightlyPulse hours={postsByHour} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 18px 24px" }}>
              <EventsByTimePreview      filter={filter} blocks={timeBlocks} onOpen={() => setOpenModal("events")} />
              <CategoryBreakdownPreview stats={categoryStats}               onOpen={() => setOpenModal("categories")} />
              {weather && <WeatherImpactPreview weather={weather}           onOpen={() => setOpenModal("weather")} />}
              <SafetyCautionPreview     items={safetyItems}                 onOpen={() => setOpenModal("safety")} />
              <TransitDisruptionPreview routes={transit}                    onOpen={() => setOpenModal("transit")} />
            </div>

            <div style={{ padding: "16px 18px 32px", borderTop: `1px solid ${LINE}` }}>
              <SectionLabel text="Top neighborhoods" right="Map ↗" />
              <TopNeighborhoods areas={areaStats} />
            </div>
          </>
        )}
      </main>

      {/* ── MODALS ── */}
      {calendarOpen && <CalendarModal events={calEvents} onClose={() => setCalendarOpen(false)} />}

      {openModal === "events"     && <DashboardModal title="Events by time"     onClose={close}><EventsByTimeModal filter={filter} blocks={timeBlocks} events={events} /></DashboardModal>}
      {openModal === "categories" && <DashboardModal title="Category breakdown" onClose={close}><CategoryBreakdownModal stats={categoryStats} /></DashboardModal>}
      {openModal === "weather" && weather && <DashboardModal title="Weather impact" onClose={close}><WeatherImpactModal weather={weather} /></DashboardModal>}
      {openModal === "safety"     && <DashboardModal title="Safety caution"     onClose={close}><SafetyCautionModal items={safetyItems} /></DashboardModal>}
      {openModal === "transit"    && <DashboardModal title="Transit disruption" onClose={close}><TransitDisruptionModal routes={transit} /></DashboardModal>}
    </div>
  );
}
