"use client";

import type { WeatherData, WeatherConditionCode, ImpactLevel } from "../../types/dashboard";

/* ── Design tokens ────────────────────────────────────────────── */
const T_PRIMARY = "#f0f0f0";
const T_MUTED   = "#888";
const T_DIM     = "#444";

/* ── Weather icons (SVG) ──────────────────────────────────────── */
function CloudRainIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* Cloud body */}
      <circle cx="16" cy="16" r="7" fill="currentColor" />
      <circle cx="24" cy="17" r="6" fill="currentColor" />
      <circle cx="10" cy="18" r="5.5" fill="currentColor" />
      <rect x="10" y="15" width="20" height="9" fill="currentColor" />
      {/* Rain drops */}
      <line x1="12" y1="27" x2="10" y2="34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="19" y1="28" x2="17" y2="35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="26" y1="27" x2="24" y2="34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function HeavyRainIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="16" cy="14" r="7" fill="currentColor" />
      <circle cx="24" cy="15" r="6" fill="currentColor" />
      <circle cx="10" cy="16" r="5.5" fill="currentColor" />
      <rect x="10" y="13" width="20" height="9" fill="currentColor" />
      <line x1="10" y1="27" x2="7"  y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="26" x2="13" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="27" x2="19" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="26" x2="25" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function OvercastIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="16" cy="18" r="8" fill="currentColor" />
      <circle cx="25" cy="19" r="7" fill="currentColor" />
      <circle cx="10" cy="20" r="6" fill="currentColor" />
      <rect x="10" y="17" width="22" height="10" fill="currentColor" />
    </svg>
  );
}

function PartlyCloudyIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* Sun */}
      <circle cx="14" cy="13" r="6" fill="currentColor" />
      <line x1="14" y1="4"  x2="14" y2="2"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="24" x2="14" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="5"  y1="13" x2="3"  y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="13" x2="23" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Cloud (partial overlay) */}
      <circle cx="22" cy="23" r="6" fill="currentColor" />
      <circle cx="29" cy="24" r="5" fill="currentColor" />
      <circle cx="16" cy="25" r="5" fill="currentColor" />
      <rect x="16" y="22" width="18" height="8" fill="currentColor" />
    </svg>
  );
}

function ClearIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="8" fill="currentColor" />
      <line x1="20" y1="5"  x2="20" y2="2"  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="38" x2="20" y2="35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="5"  y1="20" x2="2"  y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="38" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="9"  y1="9"  x2="7"  y2="7"  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="33" y1="33" x2="31" y2="31" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="31" y1="9"  x2="33" y2="7"  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="7"  y1="33" x2="9"  y2="31" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* Small icon for hourly row */
function SmallWeatherIcon({ code, size = 18 }: { code: WeatherConditionCode; size?: number }) {
  const scale = size / 40;
  const icons: Record<WeatherConditionCode, React.ReactNode> = {
    "rain":          <CloudRainIcon size={40} />,
    "heavy-rain":    <HeavyRainIcon size={40} />,
    "drizzle":       <CloudRainIcon size={40} />,
    "overcast":      <OvercastIcon size={40} />,
    "fog":           <OvercastIcon size={40} />,
    "clear":         <ClearIcon size={40} />,
    "partly-cloudy": <PartlyCloudyIcon size={40} />,
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        flexShrink: 0,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
      aria-hidden="true"
    >
      {icons[code]}
    </div>
  );
}

function WeatherIconLarge({ code, size = 44 }: { code: WeatherConditionCode; size?: number }) {
  if (code === "rain")          return <CloudRainIcon size={size} />;
  if (code === "heavy-rain")    return <HeavyRainIcon size={size} />;
  if (code === "drizzle")       return <CloudRainIcon size={size} />;
  if (code === "clear")         return <ClearIcon size={size} />;
  if (code === "partly-cloudy") return <PartlyCloudyIcon size={size} />;
  return <OvercastIcon size={size} />;
}

/* ── Hourly forecast row (matches reference image structure) ──── */
function HourlyRow({ forecast }: { forecast: WeatherData["hourlyForecast"] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingTop: 12,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {forecast.map((f) => (
        <div
          key={f.hour}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span style={{ fontSize: 10, color: T_MUTED, whiteSpace: "nowrap" as const }}>{f.hour}</span>
          <div style={{ width: 20, height: 20, position: "relative" as const }}>
            <div style={{ position: "absolute" as const, top: 0, left: 0 }}>
              <SmallWeatherIcon code={f.conditionCode} size={20} />
            </div>
          </div>
          <span style={{ fontSize: 10, color: T_PRIMARY, fontWeight: 500 }}>{f.temp}°</span>
        </div>
      ))}
    </div>
  );
}

/* ── Impact indicator ─────────────────────────────────────────── */
function ImpactArrow({ impact }: { impact: ImpactLevel }) {
  if (impact === "positive") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8c8c8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Increases">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    );
  }
  if (impact === "negative") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Reduces">
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="No change">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/* ── Outdoor impact meter ─────────────────────────────────────── */
function OutdoorMeter({ level }: { level: "low" | "moderate" | "high" }) {
  const steps = 10;
  const filled = level === "low" ? 3 : level === "moderate" ? 6 : 9;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 3, flex: 1 }}>
        {Array.from({ length: steps }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i < filled ? (level === "high" ? "#aaa" : level === "moderate" ? "#777" : "#555") : "#1a1a1a",
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: level === "high" ? "#c0c0c0" : level === "moderate" ? "#888" : "#666",
          textTransform: "uppercase" as const,
          letterSpacing: 0.5,
          flexShrink: 0,
          width: 56,
          textAlign: "right" as const,
        }}
      >
        {level}
      </span>
    </div>
  );
}

/* ── Preview card ────────────────────────────────────────────── */
export function WeatherImpactPreview({
  weather,
  onOpen,
}: {
  weather: WeatherData;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      aria-label={`Weather impact — ${weather.condition}, ${weather.temperature}°C. Tap to expand.`}
      style={{
        width: "100%",
        background: "#111",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "14px 14px 14px",
        cursor: "pointer",
        textAlign: "left" as const,
        display: "block",
        color: T_PRIMARY,
      }}
    >
      {/* Header label */}
      <div style={{ marginBottom: 12 }}>
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            color: "#555",
            letterSpacing: 1.8,
            textTransform: "uppercase" as const,
          }}
        >
          Weather impact
        </span>
      </div>

      {/* Reference-image style: icon + temp on left, condition + city on right */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        {/* Left: icon + temperature */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <WeatherIconLarge code={weather.conditionCode} size={44} />
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: T_PRIMARY,
              letterSpacing: -1.5,
              lineHeight: 1,
            }}
          >
            {weather.temperature}°
          </span>
        </div>

        {/* Right: condition + location */}
        <div style={{ textAlign: "right" as const, paddingTop: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T_PRIMARY, lineHeight: 1.2 }}>
            {weather.condition}
          </div>
          <div style={{ fontSize: 11, color: T_MUTED, marginTop: 2 }}>Vancouver</div>
          <div style={{ fontSize: 10, color: T_DIM, marginTop: 3 }}>
            {weather.rainChance}% rain
          </div>
        </div>
      </div>

      {/* Hourly forecast row */}
      <HourlyRow forecast={weather.hourlyForecast} />
    </button>
  );
}

/* ── Modal content ───────────────────────────────────────────── */
export function WeatherImpactModal({ weather }: { weather: WeatherData }) {
  return (
    <div>
      {/* Reference-image style header */}
      <div
        style={{
          background: "#0f0f0f",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: "16px 16px 14px",
          marginBottom: 16,
          color: T_PRIMARY,
        }}
      >
        {/* Icon + temp + condition */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <WeatherIconLarge code={weather.conditionCode} size={48} />
            <span
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: T_PRIMARY,
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              {weather.temperature}°
            </span>
          </div>
          <div style={{ textAlign: "right" as const, paddingTop: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T_PRIMARY, lineHeight: 1.2 }}>
              {weather.condition}
            </div>
            <div style={{ fontSize: 12, color: T_MUTED, marginTop: 3 }}>Vancouver</div>
          </div>
        </div>

        {/* Hourly forecast */}
        <HourlyRow forecast={weather.hourlyForecast} />
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 16,
          background: "#0f0f0f",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {[
          { label: "Rain",    value: `${weather.rainChance}%` },
          { label: "Wind",    value: `${weather.windSpeed} km/h` },
          { label: "Visibility", value: weather.visibility },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              padding: "12px 12px 11px",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            <div style={{ fontSize: 8.5, color: T_DIM, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 4 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T_PRIMARY, letterSpacing: -0.3 }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Outdoor impact meter */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T_DIM, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 8 }}>
          Outdoor event impact
        </div>
        <OutdoorMeter level={weather.outdoorEventImpact} />
      </div>

      {/* Category impact rows */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T_DIM, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 2 }}>
          Category impact
        </div>
        {weather.categoryImpacts.map((cat, idx) => (
          <div
            key={cat.key}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 0",
              borderBottom:
                idx < weather.categoryImpacts.length - 1
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "none",
            }}
          >
            {/* Impact indicator */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <ImpactArrow impact={cat.impact} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T_PRIMARY, marginBottom: 3 }}>
                {cat.label}
              </div>
              <p style={{ fontSize: 12, color: T_MUTED, lineHeight: 1.5, margin: 0 }}>
                {cat.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Affected areas */}
      {weather.affectedAreas.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T_DIM, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 8 }}>
            Affected areas
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
            {weather.affectedAreas.map((area) => (
              <span
                key={area}
                style={{
                  fontSize: 11,
                  color: T_MUTED,
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 9999,
                  padding: "4px 10px",
                }}
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
