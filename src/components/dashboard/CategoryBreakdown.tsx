"use client";

import { useState } from "react";
import type { CategoryStat, CategoryKey } from "../../types/dashboard";

/* ── Design tokens ────────────────────────────────────────────── */
const T_PRIMARY = "#f2f2f2";
const T_MUTED   = "#9a9a9a";
const T_DIM     = "#4e4e4e";

/* ── Category colors (monochrome shades) ──────────────────────── */
const CAT_COLORS: Record<CategoryKey, string> = {
  trending:  "#e0e0e0",
  nightlife: "#a0a0a0",
  cafes:     "#606060",
  popups:    "#303030",
};

/* ── Donut chart ─────────────────────────────────────────────── */
function DonutChart({
  stats,
  size,
  strokeWidth,
  selectedKey,
  onSelect,
}: {
  stats: CategoryStat[];
  size: number;
  strokeWidth: number;
  selectedKey: CategoryKey | null;
  onSelect?: (key: CategoryKey) => void;
}) {
  const total = stats.reduce((s, c) => s + c.count, 0);
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 2;

  const polarToCartesian = (angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle);
    const end = polarToCartesian(endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y,
    ].join(" ");
  };

  let startAngle = -90;
  const slices = stats.map((cat) => {
    const sweep = total > 0 ? (cat.count / total) * 360 : 0;
    const slice = {
      ...cat,
      pct: total > 0 ? Math.round((cat.count / total) * 100) : 0,
      start: startAngle,
      end: startAngle + sweep,
    };
    startAngle += sweep;
    return slice;
  });

  const selectedStat = selectedKey ? stats.find((s) => s.key === selectedKey) : null;
  const pct = selectedStat && total > 0 ? Math.round((selectedStat.count / total) * 100) : null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Category breakdown chart"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Track ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={strokeWidth}
      />

      {/* Segments */}
      {slices.map((slice) => (
        <path
          key={slice.key}
          d={describeArc(slice.start, slice.end)}
          fill="none"
          stroke={CAT_COLORS[slice.key]}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          opacity={selectedKey && selectedKey !== slice.key ? 0.25 : 1}
          style={{ cursor: onSelect ? "pointer" : "default", transition: "opacity 120ms" }}
          onClick={() => onSelect?.(slice.key)}
          role={onSelect ? "button" : undefined}
          aria-label={onSelect ? `${slice.label}: ${slice.pct}%` : undefined}
        />
      ))}

      {/* Inner circle */}
      <circle
        cx={center}
        cy={center}
        r={radius - strokeWidth / 2 - 4}
        fill="#080808"
      />

      {/* Center text */}
      {selectedKey && pct !== null ? (
        <>
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            fill={T_PRIMARY}
            fontSize={size > 100 ? 18 : 13}
            fontWeight="700"
            fontFamily="inherit"
          >
            {pct}%
          </text>
          <text
            x={center}
            y={center + (size > 100 ? 14 : 10)}
            textAnchor="middle"
            fill={T_MUTED}
            fontSize={size > 100 ? 9 : 7.5}
            fontFamily="inherit"
          >
            {selectedStat?.label?.toLowerCase()}
          </text>
        </>
      ) : (
        <>
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            fill={T_PRIMARY}
            fontSize={size > 100 ? 18 : 13}
            fontWeight="700"
            fontFamily="inherit"
          >
            {total}
          </text>
          <text
            x={center}
            y={center + (size > 100 ? 14 : 10)}
            textAnchor="middle"
            fill={T_MUTED}
            fontSize={size > 100 ? 9 : 7.5}
            fontFamily="inherit"
          >
            total
          </text>
        </>
      )}
    </svg>
  );
}

/* ── Legend row ──────────────────────────────────────────────── */
function LegendRow({
  stat,
  total,
  selected,
  compact,
  onSelect,
}: {
  stat: CategoryStat;
  total: number;
  selected: boolean;
  compact: boolean;
  onSelect?: () => void;
}) {
  const pct = total > 0 ? Math.round((stat.count / total) * 100) : 0;
  return (
    <button
      onClick={onSelect}
      disabled={!onSelect}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "none",
        border: "none",
        cursor: onSelect ? "pointer" : "default",
        padding: compact ? "3px 0" : "8px 0",
        opacity: selected ? 1 : onSelect ? 0.55 : 1,
        transition: "opacity 120ms",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: compact ? 7 : 8,
            height: compact ? 7 : 8,
            borderRadius: "50%",
            background: CAT_COLORS[stat.key],
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: compact ? 11 : 13,
            color: T_MUTED,
            fontWeight: selected ? 600 : 400,
          }}
        >
          {stat.label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: compact ? 6 : 10 }}>
        <span style={{ fontSize: compact ? 9.5 : 11, color: T_DIM }}>{pct}%</span>
        <span
          style={{
            fontSize: compact ? 11 : 13,
            fontWeight: 600,
            color: selected ? T_PRIMARY : T_MUTED,
            width: compact ? 20 : 24,
            textAlign: "right" as const,
          }}
        >
          {stat.count}
        </span>
      </div>
    </button>
  );
}

/* ── Category detail row ─────────────────────────────────────── */
function CategoryDetail({ stat }: { stat: CategoryStat }) {
  return (
    <div
      style={{
        padding: "14px 0",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: CAT_COLORS[stat.key],
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 14, fontWeight: 700, color: T_PRIMARY }}>
          {stat.label}
        </span>
        <span
          style={{
            fontSize: 11,
            color: T_DIM,
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 9999,
            padding: "2px 8px",
            marginLeft: "auto",
          }}
        >
          {stat.count} pins
        </span>
      </div>
      <p
        style={{
          fontSize: 13,
          color: T_MUTED,
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {stat.description}
      </p>
    </div>
  );
}

/* ── Preview card ────────────────────────────────────────────── */
export function CategoryBreakdownPreview({
  stats,
  onOpen,
}: {
  stats: CategoryStat[];
  onOpen: () => void;
}) {
  const total = stats.reduce((s, c) => s + c.count, 0);
  const top = [...stats].sort((a, b) => b.count - a.count)[0];

  return (
    /* div wrapper to avoid nested-button HTML violation (donut paths + legend are interactive in modal only) */
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      aria-label={`Category breakdown — ${total} total pins. Tap to expand.`}
      style={{
        width: "100%",
        background: "#1c1c1c",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: "14px 14px 12px",
        cursor: "pointer",
        textAlign: "left" as const,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#555",
            letterSpacing: 1.8,
            textTransform: "uppercase" as const,
          }}
        >
          Category breakdown
        </span>
        <span style={{ fontSize: 11, color: T_DIM }}>
          {top.label} leading
        </span>
      </div>

      {/* Donut + legend (legend rows are divs here, not buttons) */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <DonutChart
          stats={stats}
          size={80}
          strokeWidth={18}
          selectedKey={null}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          {stats.map((s) => (
            <LegendRow
              key={s.key}
              stat={s}
              total={total}
              selected={false}
              compact
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Modal content ───────────────────────────────────────────── */
export function CategoryBreakdownModal({ stats }: { stats: CategoryStat[] }) {
  const sorted = [...stats].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((s, c) => s + c.count, 0);
  const [selectedKey, setSelectedKey] = useState<CategoryKey>(sorted[0].key);

  const handleSelect = (key: CategoryKey) => {
    setSelectedKey(key);
  };

  const selectedStat = sorted.find((s) => s.key === selectedKey);

  return (
    <div>
      {/* Summary */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: T_PRIMARY, letterSpacing: -1 }}>
          {total}
        </span>
        <span style={{ fontSize: 14, color: T_MUTED, marginLeft: 8 }}>pins across 4 categories</span>
      </div>

      {/* Donut + legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 6 }}>
        <DonutChart
          stats={sorted}
          size={120}
          strokeWidth={24}
          selectedKey={selectedKey}
          onSelect={handleSelect}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          {sorted.map((s) => (
            <LegendRow
              key={s.key}
              stat={s}
              total={total}
              selected={s.key === selectedKey}
              compact={false}
              onSelect={() => handleSelect(s.key)}
            />
          ))}
        </div>
      </div>

      {/* Selected category detail */}
      {selectedStat && <CategoryDetail stat={selectedStat} />}
    </div>
  );
}
