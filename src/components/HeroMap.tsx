"use client";

import React from "react";
import Link from "next/link";

/* ─── SVG Icons ─────────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
  </svg>
);
const IconTrendingUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const IconCoffee = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>
  </svg>
);
const IconMartini = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8Z"/>
  </svg>
);
const IconRadio = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
  </svg>
);
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconDiscover = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconBookmark = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
  </svg>
);
const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>
);
const IconUsers = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ─── Recon "R" Logo ─────────────────────────────────────────── */
const ReconLogo = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
    {/* Left stem */}
    <line x1="24" y1="78" x2="24" y2="24"/>
    {/* Arch / bowl of R */}
    <path d="M 24 24 C 24 18 72 18 72 40 C 72 58 48 60 38 60"/>
    {/* Diagonal leg */}
    <line x1="38" y1="60" x2="74" y2="80"/>
  </svg>
);

/* ─── Dark Map SVG ───────────────────────────────────────────── */
const DarkMapBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 390 700"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="390" height="700" fill="#0d0d0d"/>

    {/* ── Water bodies ── */}
    <ellipse cx="340" cy="230" rx="90" ry="55" fill="#111518" opacity="0.9"/>
    <rect x="100" y="490" width="290" height="80" rx="4" fill="#111518" opacity="0.7"/>

    {/* ── Major blocks / city grid ── */}
    {/* West End grid */}
    {[0,1,2,3,4,5].map(i => (
      <line key={`we-h${i}`} x1="60" y1={200+i*28} x2="260" y2={200+i*28} stroke="#1e1e1e" strokeWidth="1"/>
    ))}
    {[0,1,2,3,4,5,6].map(i => (
      <line key={`we-v${i}`} x1={80+i*28} y1="170" x2={80+i*28} y2="340" stroke="#1e1e1e" strokeWidth="1"/>
    ))}

    {/* Yaletown / Downtown grid (denser) */}
    {[0,1,2,3,4,5,6,7].map(i => (
      <line key={`yt-h${i}`} x1="200" y1={180+i*22} x2="390" y2={180+i*22} stroke="#1e1e1e" strokeWidth="0.8"/>
    ))}
    {[0,1,2,3,4,5,6].map(i => (
      <line key={`yt-v${i}`} x1={220+i*24} y1="160" x2={220+i*24} y2="360" stroke="#1e1e1e" strokeWidth="0.8"/>
    ))}

    {/* Kitsilano / south */}
    {[0,1,2,3].map(i => (
      <line key={`kit-h${i}`} x1="0" y1={510+i*28} x2="180" y2={510+i*28} stroke="#1e1e1e" strokeWidth="1"/>
    ))}
    {[0,1,2,3,4].map(i => (
      <line key={`kit-v${i}`} x1={20+i*36} y1="490" x2={20+i*36} y2="620" stroke="#1e1e1e" strokeWidth="1"/>
    ))}

    {/* Mount Pleasant */}
    {[0,1,2,3].map(i => (
      <line key={`mp-h${i}`} x1="200" y1={540+i*28} x2="390" y2={540+i*28} stroke="#1e1e1e" strokeWidth="1"/>
    ))}
    {[0,1,2,3].map(i => (
      <line key={`mp-v${i}`} x1={230+i*40} y1="520" x2={230+i*40} y2="660" stroke="#1e1e1e" strokeWidth="1"/>
    ))}

    {/* ── Major roads (slightly brighter) ── */}
    <line x1="0" y1="310" x2="390" y2="310" stroke="#252525" strokeWidth="2.5"/>
    <line x1="0" y1="480" x2="390" y2="480" stroke="#252525" strokeWidth="2"/>
    <line x1="195" y1="160" x2="195" y2="700" stroke="#252525" strokeWidth="2.5"/>
    <line x1="100" y1="160" x2="80" y2="700" stroke="#252525" strokeWidth="1.5"/>
    <line x1="290" y1="160" x2="300" y2="500" stroke="#252525" strokeWidth="1.5"/>
    {/* diagonal road (Granville bridge-ish) */}
    <line x1="150" y1="480" x2="195" y2="380" stroke="#252525" strokeWidth="2"/>
    <line x1="240" y1="480" x2="195" y2="380" stroke="#252525" strokeWidth="2"/>

    {/* ── Parks (very subtle) ── */}
    <rect x="30" y="195" width="44" height="60" rx="4" fill="#141a14" opacity="0.8"/>
    <rect x="240" y="510" width="50" height="40" rx="4" fill="#141a14" opacity="0.6"/>

    {/* ── Neighborhood labels ── */}
    <text x="148" y="240" fill="#2e2e2e" fontSize="10" fontWeight="700" letterSpacing="2" textAnchor="middle" fontFamily="system-ui, sans-serif">WEST END</text>
    <text x="320" y="222" fill="#2e2e2e" fontSize="10" fontWeight="700" letterSpacing="2" textAnchor="middle" fontFamily="system-ui, sans-serif">YALETOWN</text>
    <text x="82" y="545" fill="#2a2a2a" fontSize="10" fontWeight="700" letterSpacing="2" textAnchor="middle" fontFamily="system-ui, sans-serif">KITSILANO</text>
    <text x="218" y="502" fill="#2a2a2a" fontSize="10" fontWeight="700" letterSpacing="2" textAnchor="middle" fontFamily="system-ui, sans-serif">FALSE CREEK</text>
    <text x="320" y="618" fill="#2a2a2a" fontSize="10" fontWeight="700" letterSpacing="2" textAnchor="middle" fontFamily="system-ui, sans-serif">MOUNT</text>
    <text x="320" y="632" fill="#2a2a2a" fontSize="10" fontWeight="700" letterSpacing="2" textAnchor="middle" fontFamily="system-ui, sans-serif">PLEASANT</text>
  </svg>
);

/* ─── Map Pin Bubble ─────────────────────────────────────────── */
function MapPin({ icon, style }: { icon: React.ReactNode; style: React.CSSProperties }) {
  return (
    <div
      className="absolute flex items-center justify-center rounded-full border border-white/15 text-white/70 cursor-pointer hover:border-white/40 hover:text-white transition-all duration-200"
      style={{ width: 40, height: 40, background: "rgba(20,20,20,0.85)", backdropFilter: "blur(8px)", ...style }}
    >
      {icon}
    </div>
  );
}

/* ─── Live Event Card ────────────────────────────────────────── */
function LiveCard({
  title,
  venue,
  street,
  count,
  ago,
  imgUrl,
  style,
}: {
  title: string;
  venue: string;
  street: string;
  count: number;
  ago: string;
  imgUrl: string;
  style: React.CSSProperties;
}) {
  return (
    <div
      className="absolute flex gap-3 cursor-pointer hover:scale-[1.01] transition-transform duration-200"
      style={{
        background: "rgba(16,16,16,0.92)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "12px",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        width: 270,
        ...style,
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
        <img src={imgUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.85)" }} />
      </div>
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="flex items-center gap-1 text-white font-semibold"
            style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "2px 7px", borderRadius: 9999 }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block", flexShrink: 0 }} />
            LIVE
          </span>
          <span style={{ fontSize: 11, color: "#6b6b6b" }}>{ago}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f0", lineHeight: 1.25, marginBottom: 6 }}>{title}</div>
        <div className="flex items-center gap-1" style={{ color: "#5a5a5a", fontSize: 11, marginBottom: 3 }}>
          <IconMapPin />
          <span style={{ color: "#6b6b6b" }}>{venue}</span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 11, color: "#4a4a4a" }}>{street}</span>
          <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#5a5a5a" }}>
            <IconUsers />
            {count}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function HeroMap() {
  const filters = [
    { label: "Trending", icon: <IconTrendingUp />, active: true },
    { label: "Cafés", icon: <IconCoffee />, active: false },
    { label: "Nightlife", icon: <IconMartini />, active: false },
    { label: "Live", icon: <IconRadio />, active: false },
  ];

  const navItems = [
    { label: "Home",     icon: <IconHome />,     active: false, href: "/home"      },
    { label: "Discover", icon: <IconDiscover />, active: true,  href: "/discover"  },
    { label: "Saved",    icon: <IconBookmark />, active: false, href: "/saved"     },
    { label: "You",      icon: <IconUser />,     active: false, href: "/dashboard" },
  ];

  return (
    <div className="relative overflow-hidden" style={{ width: "100%", height: "100vh", background: "#080808" }}>
        {/* Map fills entire phone */}
        <DarkMapBackground />

        {/* ── Top bar ── */}
        <div className="relative z-10 flex items-center gap-3 px-5 py-3">
          {/* Logo */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(22,22,22,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <ReconLogo />
          </div>

          {/* Location */}
          <div className="flex-1 flex justify-center">
            <button
              className="flex items-center gap-1.5 text-white font-semibold cursor-pointer"
              style={{ fontSize: 16 }}
            >
              <IconMapPin />
              Vancouver
              <IconChevronDown />
            </button>
          </div>

          {/* Bell */}
          <button
            className="flex items-center justify-center flex-shrink-0 cursor-pointer text-white/80 hover:text-white transition-colors"
            style={{ width: 40, height: 40, borderRadius: 9999, background: "rgba(22,22,22,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Notifications"
          >
            <IconBell />
          </button>
        </div>

        {/* ── Search ── */}
        <div className="relative z-10 px-5 mb-4">
          <div
            className="flex items-center gap-3 px-4"
            style={{ height: 46, borderRadius: 9999, background: "rgba(18,18,18,0.92)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="text-zinc-500"><IconSearch /></span>
            <span style={{ fontSize: 14, color: "#555" }}>Search places, people, events...</span>
          </div>
        </div>

        {/* ── Filter pills ── */}
        <div className="relative z-10 flex gap-2 px-5 mb-2">
          {filters.map(f => (
            <button
              key={f.label}
              className="flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all duration-200 flex-shrink-0"
              style={{
                padding: "7px 12px",
                borderRadius: 9999,
                fontSize: 12.5,
                fontWeight: f.active ? 600 : 500,
                background: f.active ? "#e8e8e8" : "rgba(18,18,18,0.88)",
                color: f.active ? "#0a0a0a" : "#888",
                border: f.active ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ opacity: f.active ? 1 : 0.7 }}>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Map pins ── */}
        <MapPin icon={<IconCoffee />} style={{ left: 82, top: 310 }} />
        <MapPin icon={<IconMartini />} style={{ left: 290, top: 262 }} />
        <MapPin icon={<IconRadio />} style={{ left: 238, top: 468 }} />
        <MapPin icon={<IconStar />} style={{ left: 88, top: 598 }} />

        {/* ── Live cards ── */}
        <LiveCard
          title="Late-night ramen line just dropped"
          venue="Jinya Ramen Bar"
          street="Robson St"
          count={23}
          ago="2m ago"
          imgUrl="https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=200&q=80"
          style={{ left: 20, top: 360 }}
        />
        <LiveCard
          title="Rooftop set starting now"
          venue="The Roof at Lumen"
          street="Gastown"
          count={47}
          ago="1m ago"
          imgUrl="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&q=80"
          style={{ right: 20, top: 548 }}
        />

        {/* ── Bottom nav ── */}
        <div
          className="absolute bottom-8 left-4 right-4 z-20 flex items-center justify-around"
          style={{
            height: 76,
            borderRadius: 28,
            background: "rgba(12,12,12,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
          }}
        >
          {navItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              style={{ textDecoration: "none", color: item.active ? "#ffffff" : "#404040" }}
              aria-label={item.label}
              aria-current={item.active ? "page" : undefined}
            >
              <div className="flex flex-col items-center gap-1">
                {item.icon}
                <span style={{ fontSize: 11, fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>

    </div>
  );
}
