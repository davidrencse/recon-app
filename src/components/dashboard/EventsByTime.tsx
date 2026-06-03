"use client";

import { useState } from "react";
import type { EventTimeBlock, EventItem, TimeBlock, DashboardFilter } from "../../types/dashboard";

/* ── Design tokens ────────────────────────────────────────────── */
const T_PRIMARY = "#f0f0f0";
const T_MUTED   = "#888";
const T_DIM     = "#444";
const BAR_PEAK  = "#e8e8e8";
const BAR_MID   = "#2c2c2c";
const BAR_REST  = "#1a1a1a";

/* ── Bar inner content (shared between interactive and static bars) ── */
function BarContent({
  b,
  barH,
  fill,
  isSelected,
  isPeak,
  compact,
}: {
  b: EventTimeBlock;
  barH: number;
  fill: string;
  isSelected: boolean;
  isPeak: boolean;
  compact: boolean;
}) {
  const ABBREV: Record<string, string> = {
    Morning: "Morn",
    Afternoon: "Aftn",
    Evening: "Eve",
    "Late night": "Late",
  };
  return (
    <>
      <span
        style={{
          fontSize: compact ? 9 : 10,
          color: isSelected ? T_PRIMARY : isPeak ? T_MUTED : T_DIM,
          fontWeight: isSelected || isPeak ? 600 : 400,
          minHeight: compact ? 12 : 14,
          lineHeight: 1,
        }}
      >
        {b.count > 0 ? b.count : ""}
      </span>
      <div
        style={{
          width: "100%",
          height: barH,
          background: fill,
          borderRadius: 4,
          opacity: b.count > 0 ? 1 : 0.3,
          transition: "background 120ms",
        }}
      />
      <span
        style={{
          fontSize: compact ? 9 : 9.5,
          color: isSelected ? T_PRIMARY : isPeak ? T_MUTED : T_DIM,
          fontWeight: isSelected || isPeak ? 600 : 400,
          letterSpacing: 0.2,
        }}
      >
        {compact ? ABBREV[b.label] ?? b.label : b.label.split(" ")[0]}
      </span>
    </>
  );
}

/* ── Bar chart ───────────────────────────────────────────────── */
function BarChart({
  blocks,
  selectedBlock,
  onSelect,
  chartHeight,
  compact = false,
}: {
  blocks: EventTimeBlock[];
  selectedBlock: TimeBlock | null;
  onSelect?: (b: TimeBlock) => void;
  chartHeight: number;
  compact?: boolean;
}) {
  const max = Math.max(...blocks.map((b) => b.count), 1);
  const sharedStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: compact ? 8 : 10,
        height: chartHeight + (compact ? 28 : 36),
        paddingTop: compact ? 12 : 16,
      }}
    >
      {blocks.map((b) => {
        const pct = b.count / max;
        const barH = Math.max(3, Math.round(pct * chartHeight));
        const isPeak = b.count === max;
        const isSelected = b.block === selectedBlock;
        const isActive = b.count > 0;

        let fill = BAR_REST;
        if (isSelected) fill = BAR_PEAK;
        else if (isPeak) fill = BAR_MID;

        const content = (
          <BarContent
            b={b}
            barH={barH}
            fill={fill}
            isSelected={isSelected}
            isPeak={isPeak}
            compact={compact}
          />
        );

        /* Interactive bars (modal): render as <button> */
        if (onSelect) {
          return (
            <button
              key={b.block}
              onClick={() => onSelect(b.block)}
              aria-label={`${b.label}: ${b.count} events`}
              aria-pressed={isSelected}
              style={{
                ...sharedStyle,
                background: "none",
                border: "none",
                padding: 0,
                cursor: isActive ? "pointer" : "default",
              }}
            >
              {content}
            </button>
          );
        }

        /* Static bars (preview): render as <div> to avoid nested-button violation */
        return (
          <div key={b.block} style={sharedStyle}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

/* ── Event list ──────────────────────────────────────────────── */
function EventList({
  events,
  selectedBlock,
}: {
  events: EventItem[];
  selectedBlock: TimeBlock | null;
}) {
  const filtered = selectedBlock
    ? events.filter((e) => e.timeBlock === selectedBlock)
    : [];

  if (!selectedBlock || filtered.length === 0) {
    return (
      <p style={{ fontSize: 12, color: T_DIM, paddingTop: 4 }}>
        Tap a bar to see events for that time.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {filtered.map((ev, idx) => (
        <div
          key={ev.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "11px 0",
            borderBottom:
              idx < filtered.length - 1
                ? "1px solid rgba(255,255,255,0.05)"
                : "none",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: T_DIM,
              width: 52,
              flexShrink: 0,
              fontVariantNumeric: "tabular-nums",
              paddingTop: 1,
            }}
          >
            {ev.time}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: T_PRIMARY,
                marginBottom: 2,
                lineHeight: 1.3,
              }}
            >
              {ev.title}
            </div>
            <div style={{ fontSize: 11, color: "#555" }}>
              {ev.venue}
              <span style={{ margin: "0 4px", color: "#333" }}>·</span>
              {ev.area}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Preview card ────────────────────────────────────────────── */
export function EventsByTimePreview({
  filter,
  blocks,
  onOpen,
}: {
  filter: DashboardFilter;
  blocks: EventTimeBlock[];
  onOpen: () => void;
}) {
  const total = blocks.reduce((s, b) => s + b.count, 0);
  const filterLabel: Record<DashboardFilter, string> = {
    today: "today",
    tonight: "tonight",
    weekend: "this weekend",
  };

  return (
    /* Preview card: div (not button) because BarChart contains interactive elements in modal context;
       here bars are static divs, but keeping this as a div avoids any future nesting issues */
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      aria-label={`Events by time — ${total} events ${filterLabel[filter]}. Tap to expand.`}
      style={{
        width: "100%",
        background: "#111",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "14px 14px 12px",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 2,
        }}
      >
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            color: "#555",
            letterSpacing: 1.8,
            textTransform: "uppercase" as const,
          }}
        >
          Events by time
        </span>
        <span style={{ fontSize: 11, color: T_DIM }}>
          {total} {filterLabel[filter]}
        </span>
      </div>

      {/* Mini bar chart — static bars (divs) */}
      <BarChart
        blocks={blocks}
        selectedBlock={null}
        chartHeight={52}
        compact
      />
    </div>
  );
}

/* ── Modal content ───────────────────────────────────────────── */
export function EventsByTimeModal({
  filter,
  blocks,
  events,
}: {
  filter: DashboardFilter;
  blocks: EventTimeBlock[];
  events: EventItem[];
}) {
  const peakBlock = blocks.reduce((best, b) => (b.count > best.count ? b : best), blocks[0]);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock>(peakBlock.block);
  const total = blocks.reduce((s, b) => s + b.count, 0);
  const filterLabel: Record<DashboardFilter, string> = {
    today: "today",
    tonight: "tonight",
    weekend: "this weekend",
  };
  const selectedData = blocks.find((b) => b.block === selectedBlock);

  return (
    <div>
      {/* Summary line */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: T_PRIMARY, letterSpacing: -1 }}>
          {total}
        </span>
        <span style={{ fontSize: 14, color: T_MUTED, marginLeft: 8 }}>
          events {filterLabel[filter]}
        </span>
      </div>

      {/* Interactive bar chart */}
      <BarChart
        blocks={blocks}
        selectedBlock={selectedBlock}
        onSelect={setSelectedBlock}
        chartHeight={88}
      />

      {/* Selected block info */}
      {selectedData && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 0 10px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            marginTop: 8,
          }}
        >
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: T_PRIMARY }}>
              {selectedData.label}
            </span>
            <span style={{ fontSize: 12, color: T_DIM, marginLeft: 8 }}>
              {selectedData.hours}
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: T_MUTED,
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 9999,
              padding: "3px 10px",
            }}
          >
            {selectedData.count} events
          </span>
        </div>
      )}

      {/* Event list */}
      <EventList events={events} selectedBlock={selectedBlock} />
    </div>
  );
}
