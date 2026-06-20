"use client";

import type { TransitRoute, DelayLevel } from "../../types/dashboard";

/* ── Design tokens ────────────────────────────────────────────── */
const T_PRIMARY = "var(--t1)";
const T_MUTED   = "var(--t2)";
const T_DIM     = "var(--t3)";

/* ── Delay level styles ───────────────────────────────────────── */
const DELAY_CONFIG: Record<DelayLevel, { label: string; dotColor: string; textColor: string }> = {
  none:     { label: "On time",     dotColor: "var(--t4)",  textColor: "var(--t3)" },
  minor:    { label: "Minor",       dotColor: "var(--t3)",  textColor: "var(--t3)" },
  moderate: { label: "Moderate",    dotColor: "var(--t2)",  textColor: "var(--t2)" },
  severe:   { label: "Disrupted",   dotColor: "var(--t1)", textColor: "var(--t1)" },
};

/* ── Route line SVG ───────────────────────────────────────────── */
function RouteLine({
  route,
  width = 180,
  compact = false,
}: {
  route: TransitRoute;
  width?: number;
  compact?: boolean;
}) {
  const LINE_Y     = compact ? 12 : 14;
  const SVG_H      = compact ? 26 : 30;
  const DOT_R      = compact ? 3 : 3.5;
  const AFF_R      = compact ? 5 : 6;

  // Build stations array (before affected + affected + after)
  const total = route.stationsBefore + route.stationsAfter + 1;
  const stations = Array.from({ length: Math.max(total, 1) }, (_, i) => ({
    x: total <= 1 ? width / 2 : (i / (total - 1)) * width,
    isAffected: i === route.stationsBefore,
  }));

  const cfg = DELAY_CONFIG[route.delayLevel];

  return (
    <svg
      width={width}
      height={SVG_H}
      viewBox={`0 0 ${width} ${SVG_H}`}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      {/* Route line */}
      <line
        x1={0}
        y1={LINE_Y}
        x2={width}
        y2={LINE_Y}
        stroke={route.delayLevel === "severe" ? "var(--t3)" : "var(--surface-3)"}
        strokeWidth={compact ? 1.5 : 2}
        strokeDasharray={route.delayLevel === "severe" ? "6 3" : "none"}
      />

      {/* Station dots */}
      {stations.map((s, i) => (
        <g key={i}>
          {s.isAffected ? (
            <>
              {/* Outer ring */}
              <circle
                cx={s.x}
                cy={LINE_Y}
                r={AFF_R + 3}
                fill="none"
                stroke={cfg.dotColor}
                strokeWidth={1}
                opacity={0.3}
              />
              {/* Main dot */}
              <circle
                cx={s.x}
                cy={LINE_Y}
                r={AFF_R}
                style={{ fill: "var(--surface-2)" }}
                stroke={cfg.dotColor}
                strokeWidth={1.5}
              />
              {/* Inner dot */}
              <circle
                cx={s.x}
                cy={LINE_Y}
                r={AFF_R - 3}
                fill={cfg.dotColor}
              />
            </>
          ) : (
            <circle
              cx={s.x}
              cy={LINE_Y}
              r={DOT_R}
              style={{ fill: "var(--surface-2)", stroke: "var(--t4)" }}
              strokeWidth={1}
            />
          )}
        </g>
      ))}
    </svg>
  );
}

/* ── Preview card ────────────────────────────────────────────── */
export function TransitDisruptionPreview({
  routes,
  onOpen,
}: {
  routes: TransitRoute[];
  onOpen: () => void;
}) {
  const active = routes.filter((r) => r.delayLevel !== "none");
  const severe = routes.filter((r) => r.delayLevel === "severe");

  return (
    <button
      onClick={onOpen}
      aria-label={`Transit disruption — ${active.length} affected routes. Tap to expand.`}
      style={{
        width: "100%",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        padding: "14px 14px 12px",
        cursor: "pointer",
        textAlign: "left" as const,
        display: "block",
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
            color: "var(--t3)",
            letterSpacing: 1.8,
            textTransform: "uppercase" as const,
          }}
        >
          Transit disruption
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: severe.length > 0 ? "var(--t2)" : T_DIM,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 9999,
            padding: "2px 9px",
          }}
        >
          {active.length} affected
        </span>
      </div>

      {/* Route lines preview */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {active.slice(0, 3).map((route) => {
          const cfg = DELAY_CONFIG[route.delayLevel];
          return (
            <div key={route.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: T_MUTED }}>
                  {route.shortName}
                </span>
                <span style={{ fontSize: 10, color: cfg.textColor }}>
                  {route.delayMinutes > 0 ? `+${route.delayMinutes} min` : cfg.label}
                </span>
              </div>
              <RouteLine route={route} width={280} compact />
            </div>
          );
        })}
      </div>
    </button>
  );
}

/* ── Modal content ───────────────────────────────────────────── */
export function TransitDisruptionModal({ routes }: { routes: TransitRoute[] }) {
  const active = routes.filter((r) => r.delayLevel !== "none");

  return (
    <div>
      {/* Summary */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: T_PRIMARY, letterSpacing: -1 }}>
          {active.length}
        </span>
        <span style={{ fontSize: 14, color: T_MUTED, marginLeft: 8 }}>
          routes with delays or closures
        </span>
      </div>

      {/* Route cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {routes.map((route, idx) => {
          const cfg = DELAY_CONFIG[route.delayLevel];
          const isLast = idx === routes.length - 1;

          return (
            <div
              key={route.id}
              style={{
                padding: "16px 0",
                borderBottom: isLast ? "none" : "1px solid var(--line)",
              }}
            >
              {/* Route name + delay badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: T_PRIMARY }}>
                  {route.name}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: cfg.textColor,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 9999,
                    padding: "3px 10px",
                    flexShrink: 0,
                  }}
                >
                  {route.delayMinutes > 0
                    ? `+${route.delayMinutes} min`
                    : cfg.label}
                </span>
              </div>

              {/* Route line graphic */}
              <div style={{ margin: "10px 0 6px" }}>
                <RouteLine route={route} width={320} compact={false} />
              </div>

              {/* Affected station label */}
              {(route.stationsBefore > 0 || route.stationsAfter > 0) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: cfg.dotColor,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 11, color: T_MUTED }}>
                    {route.affectedStation}
                  </span>
                </div>
              )}

              {/* Disruption details */}
              <p style={{ fontSize: 12, color: T_DIM, lineHeight: 1.5, margin: "0 0 6px" }}>
                {route.disruptionType}
                <span style={{ margin: "0 5px", color: "var(--surface-3)" }}>·</span>
                {route.affectedArea}
              </p>
              <span style={{ fontSize: 11, color: "var(--t3)" }}>Until {route.until}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
