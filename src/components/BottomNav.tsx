"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── Icons ────────────────────────────────────────────────────── */
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      {active && <polyline points="9 22 9 12 15 12 15 22" />}
    </svg>
  );
}

function IconDiscover({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 3 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function IconBookmark({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "rgba(255,255,255,0.2)" : "none"} stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
    </svg>
  );
}

/* ── Component ────────────────────────────────────────────────── */
export default function BottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "Home",     href: "/home",      icon: IconHome     },
    { label: "Discover", href: "/discover",  icon: IconDiscover },
    { label: "Saved",    href: "/saved",     icon: IconBookmark },
    { label: "You",      href: "/dashboard", icon: IconUser     },
  ];

  return (
    <div style={{
      display: "flex", justifyContent: "space-around", alignItems: "center",
      height: "calc(64px + env(safe-area-inset-bottom, 0px))",
      paddingTop: 8,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      background: "rgba(8,8,8,0.98)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      flexShrink: 0,
      width: "100%",
      zIndex: 1000,
    }}>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: active ? "#ffffff" : "#383838",
              padding: "4px 14px",
            }}>
              <Icon active={active} />
              <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
