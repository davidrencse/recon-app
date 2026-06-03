"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ══ Tokens ═══════════════════════════════════════════════════════ */
const BG      = "#131313";
const SURFACE = "#1c1c1c";
const SURFACE2= "#222222";
const LINE    = "rgba(255,255,255,0.05)";
const BORDER  = "rgba(255,255,255,0.08)";
const BORDER_M= "rgba(255,255,255,0.11)";
const T1      = "#f2f2f2";
const T2      = "#9a9a9a";
const T3      = "#4e4e4e";
const T4      = "#2e2e2e";

/* ══ Nav icons ════════════════════════════════════════════════════ */
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      {active && <polyline points="9 22 9 12 15 12 15 22"/>}
    </svg>
  );
}
function IconDiscover({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}
function IconBookmark({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
    </svg>
  );
}
function IconUser({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
    </svg>
  );
}
function IconDashGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

/* ══ Mock QR ══════════════════════════════════════════════════════ */
function MockQR() {
  const SZ = 3;
  const pattern = [
    "1111111010110","1000001001010","1011101110000","1011101000101",
    "1011101010011","1000001011010","1111111001100","0000000100101",
    "1101100110100","0100110101011","1001001011100","0110100100110","1010011010010",
  ];
  const rows = pattern.length, cols = pattern[0].length;
  return (
    <svg width={cols*SZ} height={rows*SZ} viewBox={`0 0 ${cols*SZ} ${rows*SZ}`} style={{ display:"block" }}>
      {pattern.map((row, ri) => [...row].map((cell, ci) =>
        cell === "1" ? <rect key={`${ri}-${ci}`} x={ci*SZ} y={ri*SZ} width={SZ} height={SZ} fill="rgba(255,255,255,0.6)"/> : null
      ))}
    </svg>
  );
}

/* ══ Setting row ══════════════════════════════════════════════════ */
function SettingRow({ label, sublabel, last=false }: { label: string; sublabel?: string; last?: boolean }) {
  return (
    <button style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", background:"none", border:"none", cursor:"pointer", borderBottom: last ? "none" : `1px solid ${LINE}`, textAlign:"left" as const, fontFamily:"inherit" }}>
      <div>
        <div style={{ fontSize:14, color:T1, fontWeight:400 }}>{label}</div>
        {sublabel && <div style={{ fontSize:12, color:T3, marginTop:2 }}>{sublabel}</div>}
      </div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T4} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  );
}

/* ══ Settings panel ═══════════════════════════════════════════════ */
function SettingsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position:"absolute", inset:0, background:BG, zIndex:70, overflowY:"auto", scrollbarWidth:"none" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 0" }}>
        <span style={{ fontSize:10, color:T3, letterSpacing:1.8, textTransform:"uppercase", fontWeight:600 }}>Settings</span>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"20px 20px 0" }}>
        <div style={{ fontSize:24, fontWeight:800, color:T1, marginBottom:22, letterSpacing:-0.5 }}>Settings</div>
        {[
          { group:"Preferences", rows:[{ label:"Notifications" },{ label:"Privacy" },{ label:"Data & activity", last:true }] },
          { group:"Account",     rows:[{ label:"Edit profile" },{ label:"Change city", sublabel:"Vancouver, BC", last:true }] },
          { group:"About",       rows:[{ label:"About Recon" },{ label:"Help & feedback" },{ label:"Terms of service" },{ label:"Privacy policy", last:true }] },
        ].map((section) => (
          <div key={section.group} style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, color:T3, letterSpacing:1.8, textTransform:"uppercase" as const, fontWeight:600, marginBottom:6 }}>{section.group}</div>
            <div style={{ background:SURFACE, borderRadius:16, padding:"0 16px", border:`1px solid ${BORDER}` }}>
              {section.rows.map((r) => <SettingRow key={r.label} {...r}/>)}
            </div>
          </div>
        ))}
        <button style={{ width:"100%", height:50, borderRadius:14, background:"none", border:`1px solid ${BORDER}`, color:T1, fontSize:14, fontWeight:500, cursor:"pointer", marginBottom:28, fontFamily:"inherit" }}>Log out</button>
        <div style={{ textAlign:"center", fontSize:12, color:T4, paddingBottom:32 }}>Recon Beta · Vancouver · v0.1</div>
      </div>
    </div>
  );
}

/* ══ Account panel ════════════════════════════════════════════════ */
function AccountPanel({ onClose }: { onClose: () => void }) {
  const R_LOGO = (
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
      <line x1="24" y1="78" x2="24" y2="24"/>
      <path d="M 24 24 C 24 18 72 18 72 40 C 72 58 48 60 38 60"/>
      <line x1="38" y1="60" x2="74" y2="80"/>
    </svg>
  );
  return (
    <div style={{ position:"absolute", inset:0, background:BG, zIndex:70, overflowY:"auto", scrollbarWidth:"none" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 0" }}>
        <span style={{ fontSize:10, color:T3, letterSpacing:1.8, textTransform:"uppercase", fontWeight:600 }}>Account</span>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ margin:"16px 20px 0", background:"#111", borderRadius:22, padding:"24px 22px", border:`1px solid ${BORDER_M}` }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:SURFACE2, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center" }}>{R_LOGO}</div>
          <span style={{ fontSize:8, color:"rgba(255,255,255,0.25)", letterSpacing:3, textTransform:"uppercase" as const, fontWeight:700, paddingTop:4 }}>RECON™</span>
        </div>
        <div style={{ fontSize:22, fontWeight:800, color:T1, letterSpacing:-0.3, textTransform:"uppercase" as const, marginBottom:18, lineHeight:1.2 }}>Member —<br/>All Access</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:18 }}>
          {[{ label:"CITY", value:"Vancouver, BC" },{ label:"SINCE", value:"Jun 2026" }].map((f) => (
            <div key={f.label}>
              <div style={{ fontSize:8, color:"rgba(255,255,255,0.22)", letterSpacing:2.5, textTransform:"uppercase" as const, marginBottom:4, fontWeight:600 }}>{f.label}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)" }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ height:1, background:"rgba(255,255,255,0.1)", marginBottom:18 }}/>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.3)", marginBottom:5 }}>@davidren</div>
          <div style={{ fontSize:26, fontWeight:800, color:T1, textTransform:"uppercase" as const, letterSpacing:-0.5, lineHeight:1 }}>David Ren</div>
        </div>
        <div style={{ display:"flex", gap:18, alignItems:"flex-end" }}>
          <div style={{ flexShrink:0 }}><MockQR/></div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:8, color:"rgba(255,255,255,0.22)", letterSpacing:2.5, textTransform:"uppercase" as const, marginBottom:4, fontWeight:600 }}>REFERENCE ID</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", fontVariantNumeric:"tabular-nums", marginBottom:12 }}>RC-20381930</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", textTransform:"uppercase" as const, letterSpacing:1.5, lineHeight:1.7 }}>Recon Beta<br/>Vancouver · v0.1</div>
          </div>
        </div>
      </div>
      <div style={{ padding:"22px 20px 32px" }}>
        <button style={{ width:"100%", height:50, borderRadius:14, background:T1, border:"none", color:"#0d0d0d", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Edit profile</button>
      </div>
    </div>
  );
}

/* ══ You popup bubble ═════════════════════════════════════════════ */
function YouPopup({ onSettings, onAccount, onClose }: {
  onSettings: () => void;
  onAccount: () => void;
  onClose: () => void;
}) {
  const rowStyle: React.CSSProperties = {
    width:"100%", display:"flex", alignItems:"center", gap:11,
    padding:"13px 14px", background:"none", border:"none",
    cursor:"pointer", textAlign:"left" as const, color:T1, fontFamily:"inherit",
  };
  const iconBox: React.CSSProperties = {
    width:30, height:30, borderRadius:9, background:SURFACE2,
    border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"absolute", inset:0, zIndex:65 }}/>
      <div style={{
        position:"absolute",
        bottom:`calc(64px + env(safe-area-inset-bottom, 0px))`,
        right:10,
        width:200,
        background:SURFACE,
        border:`1px solid ${BORDER_M}`,
        borderRadius:18,
        zIndex:66,
        overflow:"hidden",
        boxShadow:"0 16px 48px rgba(0,0,0,0.65)",
      }}>
        <Link href="/dashboard" onClick={onClose} style={{ textDecoration:"none" }}>
          <div style={{ ...rowStyle, display:"flex" as const }}>
            <div style={iconBox}><IconDashGrid/></div>
            <span style={{ flex:1, fontSize:14, fontWeight:500 }}>Dashboard</span>
            <IconChevronRight/>
          </div>
        </Link>
        <div style={{ height:1, background:LINE, margin:"0 14px" }}/>
        <button onClick={() => { onSettings(); onClose(); }} style={rowStyle}>
          <div style={iconBox}><IconSettings/></div>
          <span style={{ flex:1, fontSize:14, fontWeight:500 }}>Settings</span>
          <IconChevronRight/>
        </button>
        <div style={{ height:1, background:LINE, margin:"0 14px" }}/>
        <button onClick={() => { onAccount(); onClose(); }} style={rowStyle}>
          <div style={iconBox}><IconUser active={false}/></div>
          <span style={{ flex:1, fontSize:14, fontWeight:500 }}>Account</span>
          <IconChevronRight/>
        </button>
        {/* Arrow notch */}
        <div style={{ position:"absolute", bottom:-6, right:23, width:12, height:12, background:SURFACE, border:`1px solid ${BORDER_M}`, transform:"rotate(45deg)", borderTop:"none", borderLeft:"none" }}/>
      </div>
    </>
  );
}

/* ══ Bottom nav ═══════════════════════════════════════════════════ */
export default function BottomNav() {
  const pathname = usePathname();
  const [youPopupOpen, setYouPopupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen,  setAccountOpen]  = useState(false);

  const onDashboard = pathname === "/dashboard";

  const NAV_ITEMS = [
    { label:"Home",     href:"/home",     icon:IconHome     },
    { label:"Discover", href:"/discover", icon:IconDiscover },
    { label:"Saved",    href:"/saved",    icon:IconBookmark },
  ];

  return (
    <>
      <div style={{
        display:"flex", justifyContent:"space-around", alignItems:"center",
        paddingTop: 12,
        paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        background:"rgba(19,19,19,0.98)",
        borderTop:`1px solid ${LINE}`,
        flexShrink:0, width:"100%", zIndex:40,
      }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} style={{ textDecoration:"none" }}>
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                color: active ? T1 : "#3a3a3a",
                padding:"4px 16px",
              }}>
                <Icon active={active}/>
                <span style={{ fontSize:10.5, fontWeight: active ? 600 : 400, letterSpacing:0.1 }}>{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* You tab — on /dashboard opens popup, elsewhere navigates */}
        {onDashboard ? (
          <button
            onClick={() => setYouPopupOpen(v => !v)}
            aria-expanded={youPopupOpen}
            style={{ background:"none", border:"none", cursor:"pointer", color: youPopupOpen ? T1 : "#3a3a3a", padding:"4px 16px", fontFamily:"inherit" }}
          >
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <IconUser active={youPopupOpen}/>
              <span style={{ fontSize:10.5, fontWeight: youPopupOpen ? 600 : 400, letterSpacing:0.1 }}>You</span>
            </div>
          </button>
        ) : (
          <Link href="/dashboard" style={{ textDecoration:"none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, color:"#3a3a3a", padding:"4px 16px" }}>
              <IconUser active={false}/>
              <span style={{ fontSize:10.5, fontWeight:400, letterSpacing:0.1 }}>You</span>
            </div>
          </Link>
        )}
      </div>

      {/* Overlays — position absolute, scoped to AppShell's outer container */}
      {youPopupOpen && (
        <YouPopup
          onSettings={() => setSettingsOpen(true)}
          onAccount={() => setAccountOpen(true)}
          onClose={() => setYouPopupOpen(false)}
        />
      )}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)}/>}
      {accountOpen  && <AccountPanel  onClose={() => setAccountOpen(false)}/>}
    </>
  );
}
