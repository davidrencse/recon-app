"use client";

import type { SafetyItem, CautionType } from "../../types/dashboard";

/* ── Design tokens ────────────────────────────────────────────── */
const T_PRIMARY = "#f2f2f2";
const T_MUTED   = "#9a9a9a";
const T_DIM     = "#4e4e4e";

/* ── Caution type icons ───────────────────────────────────────── */
function CautionIcon({ type }: { type: CautionType }) {
  const icons: Record<CautionType, React.ReactNode> = {
    "road-closure": (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <line x1="8" y1="15" x2="16" y2="15" />
      </svg>
    ),
    "large-crowd": (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    "police-activity": (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    "transit-entrance": (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    "event-congestion": (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };
  return <>{icons[type]}</>;
}

/* ── Severity dot ─────────────────────────────────────────────── */
const SEVERITY_DOT: Record<string, string> = {
  high:   "#c0c0c0",
  medium: "#666",
  low:    "#333",
};

/* ── Single caution row (full modal version) ──────────────────── */
function CautionRow({ item, last }: { item: SafetyItem; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "13px 0",
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Icon container */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: T_MUTED,
        }}
      >
        <CautionIcon type={item.type} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 3,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {/* Severity dot */}
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: SEVERITY_DOT[item.severity],
                flexShrink: 0,
                marginTop: 1,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: T_PRIMARY }}>
              {item.typeLabel}
            </span>
          </div>
          <span style={{ fontSize: 11, color: T_DIM, flexShrink: 0, paddingTop: 1 }}>
            {item.time}
          </span>
        </div>

        <div style={{ fontSize: 11, color: T_DIM, marginBottom: 4 }}>
          {item.area}
        </div>

        <p
          style={{
            fontSize: 12,
            color: T_MUTED,
            lineHeight: 1.5,
            margin: "0 0 10px",
          }}
        >
          {item.description}
        </p>

        <button
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: T_DIM,
            background: "none",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6,
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          View details
        </button>
      </div>
    </div>
  );
}

/* ── Preview card ────────────────────────────────────────────── */
export function SafetyCautionPreview({
  items,
  onOpen,
}: {
  items: SafetyItem[];
  onOpen: () => void;
}) {
  const activeItems = items.filter((i) => i.severity !== "low" || true); // show all
  const highCount = items.filter((i) => i.severity === "high").length;
  const topArea = items[0]?.area ?? "—";

  return (
    <button
      onClick={onOpen}
      aria-label={`Safety caution — ${items.length} active items. Tap to expand.`}
      style={{
        width: "100%",
        background: "#1c1c1c",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: "14px 14px 12px",
        cursor: "pointer",
        textAlign: "left" as const,
        display: "block",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#555",
              letterSpacing: 1.8,
              textTransform: "uppercase" as const,
            }}
          >
            Safety caution
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: highCount > 0 ? "#aaa" : T_DIM,
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 9999,
            padding: "2px 9px",
          }}
        >
          {items.length} active
        </span>
      </div>

      {/* Compact item list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {activeItems.slice(0, 3).map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: SEVERITY_DOT[item.severity],
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T_MUTED,
                minWidth: 120,
              }}
            >
              {item.typeLabel}
            </span>
            <span style={{ fontSize: 11, color: T_DIM, flex: 1, textAlign: "right" as const }}>
              {item.area}
            </span>
          </div>
        ))}
        {activeItems.length > 3 && (
          <span style={{ fontSize: 11, color: T_DIM, paddingLeft: 13 }}>
            +{activeItems.length - 3} more
          </span>
        )}
      </div>
    </button>
  );
}

/* ── Modal content ───────────────────────────────────────────── */
export function SafetyCautionModal({ items }: { items: SafetyItem[] }) {
  const highCount  = items.filter((i) => i.severity === "high").length;
  const topArea    = items[0]?.area ?? "City-wide";

  return (
    <div>
      {/* Summary */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: T_PRIMARY, letterSpacing: -1, lineHeight: 1 }}>
            {items.length}
          </div>
          <div style={{ fontSize: 12, color: T_MUTED, marginTop: 2 }}>active cautions</div>
        </div>
        <div
          style={{
            width: 1,
            height: 36,
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T_MUTED }}>Most affected</div>
          <div style={{ fontSize: 13, color: T_PRIMARY }}>{topArea}</div>
        </div>
        {highCount > 0 && (
          <>
            <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#aaa" }}>{highCount} high</div>
              <div style={{ fontSize: 12, color: T_DIM }}>priority</div>
            </div>
          </>
        )}
      </div>

      {/* Note */}
      <p style={{ fontSize: 12, color: T_DIM, lineHeight: 1.5, marginBottom: 16, fontStyle: "italic" }}>
        Information updates as conditions change. Plan accordingly.
      </p>

      {/* Caution rows */}
      <div>
        {items.map((item, idx) => (
          <CautionRow key={item.id} item={item} last={idx === items.length - 1} />
        ))}
      </div>
    </div>
  );
}
