"use client";

import Link from "next/link";

function ReconRLogo() {
  return (
    <div style={{
      width: 96, height: 96, borderRadius: 22,
      background: "#1c1c1c",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="52" height="52" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="24" y1="78" x2="24" y2="24"/>
        <path d="M 24 24 C 24 18 72 18 72 40 C 72 58 48 60 38 60"/>
        <line x1="38" y1="60" x2="74" y2="80"/>
      </svg>
    </div>
  );
}

function IconMapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function IconRadio() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
    </svg>
  );
}

export default function LandingScreen() {
  return (
    <>
        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 28px 0", overflowY: "auto", scrollbarWidth: "none" }}>

          {/* Logo */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 52, marginBottom: 36 }}>
            <ReconRLogo />
          </div>

          {/* Headline */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: -0.5 }}>
              See your city,
            </div>
            <div style={{ fontSize: 34, fontWeight: 400, fontStyle: "italic", color: "#bbb", lineHeight: 1.15, letterSpacing: -0.3 }}>
              as it is,
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: -0.5 }}>
              right now.
            </div>
          </div>

          {/* Description */}
          <p style={{
            textAlign: "center",
            fontSize: 13.5,
            color: "#666",
            lineHeight: 1.65,
            margin: "0 0 36px",
          }}>
            Recon maps what&apos;s happening in your city—{" "}
            date spots, pop-ups, weather, sightings—{" "}
            pinned to a live, browsable map.
          </p>

          {/* Feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 44 }}>
            {[
              { icon: <IconMapPin />, label: "Geo-pinned", sub: "real posts, real places" },
              { icon: <IconRadio />, label: "Happening now", sub: "fresh in <5 min" },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: "#0f0f0f",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: "16px 14px",
                }}
              >
                <div style={{ color: "#666", marginBottom: 10 }}>{card.icon}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#e0e0e0", marginBottom: 4 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 11.5, color: "#444" }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/home" style={{ textDecoration: "none" }}>
              <div style={{
                width: "100%",
                height: 54,
                borderRadius: 12,
                background: "#fff",
                color: "#000",
                fontSize: 15,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
              }}>
                Get early access →
              </div>
            </Link>
            <Link href="/discover" style={{ textDecoration: "none" }}>
              <div style={{
                width: "100%",
                height: 54,
                borderRadius: 12,
                background: "transparent",
                color: "#ccc",
                fontSize: 15,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}>
                Explore the map
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 0 28px", textAlign: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "#333" }}>Vancouver · v0.1 MVP</span>
        </div>
    </>
  );
}
