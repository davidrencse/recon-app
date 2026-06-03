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
function IconSettings() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
function SettingRow({ label, sublabel, last=false, onClick }: { label: string; sublabel?: string; last?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", background:"none", border:"none", cursor:"pointer", borderBottom: last ? "none" : `1px solid ${LINE}`, textAlign:"left" as const, fontFamily:"inherit" }}
    >
      <div>
        <div style={{ fontSize:14, color:T1, fontWeight:400 }}>{label}</div>
        {sublabel && <div style={{ fontSize:12, color:T3, marginTop:2 }}>{sublabel}</div>}
      </div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T4} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  );
}

/* ══ Notification controls ════════════════════════════════════════ */
function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onClick}
      style={{
        width:44, height:26, borderRadius:13, padding:2, flexShrink:0,
        background: on ? T1 : SURFACE2, border:`1px solid ${on ? T1 : BORDER}`,
        cursor:"pointer", display:"flex", alignItems:"center",
        justifyContent: on ? "flex-end" : "flex-start", transition:"background 0.15s, border-color 0.15s",
      }}
    >
      <span style={{ width:20, height:20, borderRadius:"50%", background: on ? "#0d0d0d" : "#6a6a6a", transition:"background 0.15s" }}/>
    </button>
  );
}

function ChipGroup({ options, value, onChange, multi=false }: { options: string[]; value: string[]; onChange: (v: string[]) => void; multi?: boolean }) {
  const toggle = (opt: string) => {
    if (multi) onChange(value.includes(opt) ? value.filter(o => o !== opt) : [...value, opt]);
    else onChange([opt]);
  };
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            style={{
              padding:"7px 13px", borderRadius:999, fontSize:12.5, fontWeight:500, cursor:"pointer", fontFamily:"inherit",
              background: active ? T1 : SURFACE2, color: active ? "#0d0d0d" : T2,
              border:`1px solid ${active ? T1 : BORDER}`, transition:"all 0.12s",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function NotifType({ title, desc, on, onToggle, children }: { title: string; desc: string; on: boolean; onToggle: () => void; children?: React.ReactNode }) {
  return (
    <div style={{ background:SURFACE, borderRadius:16, border:`1px solid ${BORDER}`, padding:16, marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:600, color:T1 }}>{title}</div>
          <div style={{ fontSize:12.5, color:T3, marginTop:4, lineHeight:1.5 }}>{desc}</div>
        </div>
        <Switch on={on} onClick={onToggle}/>
      </div>
      {on && children && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${LINE}` }}>{children}</div>
      )}
    </div>
  );
}

function NotifSection({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:10, color:T3, letterSpacing:1.8, textTransform:"uppercase" as const, fontWeight:600, margin:"26px 0 10px" }}>{children}</div>;
}

function CtrlLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:11.5, color:T2, fontWeight:500, marginBottom:9 }}>{children}</div>;
}

/* ══ Notifications panel ══════════════════════════════════════════ */
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [enabled, setEnabled]   = useState(true);
  const [nearby, setNearby]     = useState(true);
  const [events, setEvents]     = useState(true);
  const [weather, setWeather]   = useState(true);
  const [safety, setSafety]     = useState(true);
  const [transit, setTransit]   = useState(false);
  const [savedEv, setSavedEv]   = useState(true);
  const [savedPl, setSavedPl]   = useState(true);

  const [nearbyRange, setNearbyRange]   = useState<string[]>(["Nearby"]);
  const [eventsLead, setEventsLead]     = useState<string[]>(["1 hour before"]);
  const [weatherKinds, setWeatherKinds] = useState<string[]>(["Rain", "Outdoor event changes"]);
  const [safetyKinds, setSafetyKinds]   = useState<string[]>(["Road closures", "Large crowds"]);
  const [transitKinds, setTransitKinds] = useState<string[]>(["Delays"]);
  const [savedEvLead, setSavedEvLead]   = useState<string[]>(["1 hour before"]);
  const [savedPlKinds, setSavedPlKinds] = useState<string[]>(["Events", "Closures"]);

  const [area, setArea]       = useState<string[]>(["Current location"]);
  const [radius, setRadius]   = useState<string[]>(["3 km"]);

  const [quiet, setQuiet]           = useState(true);
  const [quietStart, setQuietStart] = useState("23:00");
  const [quietEnd, setQuietEnd]     = useState("08:00");
  const [quietSafety, setQuietSafety] = useState(true);

  const [frequency, setFrequency] = useState<string[]>(["Balanced"]);
  const [sources, setSources] = useState<string[]>(["Public posts", "Venue updates", "City alerts", "Transit alerts", "Weather updates"]);

  const FREQ = [
    { label:"Important only", desc:"Only safety cautions, saved event reminders, and major disruptions." },
    { label:"Balanced",       desc:"Events, weather impact, saved places, and major nearby activity." },
    { label:"All updates",    desc:"More frequent alerts across selected categories." },
  ];

  const timeField: React.CSSProperties = {
    flex:1, background:SURFACE2, border:`1px solid ${BORDER}`, borderRadius:12,
    color:T1, fontSize:13, fontFamily:"inherit", padding:"11px 12px", colorScheme:"dark" as const,
  };

  return (
    <div style={{ position:"fixed", inset:0, background:BG, zIndex:2000, overflowY:"auto", scrollbarWidth:"none", paddingTop:"max(env(safe-area-inset-top), 20px)" }}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"16px 20px 0" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"20px 20px 48px" }}>
        <div style={{ fontSize:24, fontWeight:800, color:T1, marginBottom:22, letterSpacing:-0.5 }}>Notifications</div>

        {/* Main switch */}
        <div style={{ background:SURFACE, borderRadius:16, border:`1px solid ${BORDER}`, padding:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:600, color:T1 }}>Enable notifications</div>
              <div style={{ fontSize:12.5, color:T3, marginTop:4, lineHeight:1.5 }}>Allow Recon to send alerts about places, events, and conditions near you.</div>
            </div>
            <Switch on={enabled} onClick={() => setEnabled(v => !v)}/>
          </div>
        </div>

        <div style={{ opacity: enabled ? 1 : 0.4, pointerEvents: enabled ? "auto" : "none", transition:"opacity 0.2s" }}>
          <NotifSection>Notification types</NotifSection>

          <NotifType title="Nearby activity" desc="Get notified when something notable is happening near your selected area." on={nearby} onToggle={() => setNearby(v => !v)}>
            <CtrlLabel>Use this for general Recon activity.</CtrlLabel>
            <ChipGroup options={["Walking distance", "Nearby", "Citywide"]} value={nearbyRange} onChange={setNearbyRange}/>
          </NotifType>

          <NotifType title="Events" desc="Get notified about events starting soon near you." on={events} onToggle={() => setEvents(v => !v)}>
            <CtrlLabel>Good for concerts, pop-ups, markets, nightlife, campus events.</CtrlLabel>
            <ChipGroup options={["1 hour before", "3 hours before", "Same day only", "Tonight only"]} value={eventsLead} onChange={setEventsLead}/>
          </NotifType>

          <NotifType title="Weather impact" desc="Get notified when weather affects outdoor plans, transit, or active areas." on={weather} onToggle={() => setWeather(v => !v)}>
            <ChipGroup multi options={["Rain", "Snow", "Wind", "Poor visibility", "Outdoor event changes"]} value={weatherKinds} onChange={setWeatherKinds}/>
          </NotifType>

          <NotifType title="Safety cautions" desc="Get practical alerts about closures, large crowds, road incidents, and caution areas." on={safety} onToggle={() => setSafety(v => !v)}>
            <ChipGroup multi options={["Road closures", "Large crowds", "Police activity", "Event congestion", "Transit entrance issues"]} value={safetyKinds} onChange={setSafetyKinds}/>
          </NotifType>

          <NotifType title="Transit issues" desc="Get notified when transit issues affect areas you follow." on={transit} onToggle={() => setTransit(v => !v)}>
            <ChipGroup multi options={["Delays", "Station issues", "Route changes", "Event congestion"]} value={transitKinds} onChange={setTransitKinds}/>
          </NotifType>

          <NotifType title="Saved events" desc="Reminders for events you saved." on={savedEv} onToggle={() => setSavedEv(v => !v)}>
            <ChipGroup multi options={["1 hour before", "3 hours before", "Morning of", "When details change"]} value={savedEvLead} onChange={setSavedEvLead}/>
          </NotifType>

          <NotifType title="Saved places" desc="Notify me when places I saved have new activity." on={savedPl} onToggle={() => setSavedPl(v => !v)}>
            <ChipGroup multi options={["Events", "Crowds", "Weather impact", "Closures", "New posts", "Quiet hours"]} value={savedPlKinds} onChange={setSavedPlKinds}/>
          </NotifType>

          <NotifSection>Notification area</NotifSection>
          <div style={{ background:SURFACE, borderRadius:16, border:`1px solid ${BORDER}`, padding:16 }}>
            <div style={{ fontSize:12.5, color:T3, marginBottom:12, lineHeight:1.5 }}>Choose where Recon should watch for updates.</div>
            <CtrlLabel>Watch area</CtrlLabel>
            <ChipGroup options={["Current location", "Selected neighborhood", "Saved places only"]} value={area} onChange={setArea}/>
            <div style={{ height:14 }}/>
            <CtrlLabel>Radius</CtrlLabel>
            <ChipGroup options={["1 km", "3 km", "5 km", "Citywide"]} value={radius} onChange={setRadius}/>
          </div>

          <NotifSection>Quiet hours</NotifSection>
          <div style={{ background:SURFACE, borderRadius:16, border:`1px solid ${BORDER}`, padding:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:600, color:T1 }}>Quiet hours</div>
                <div style={{ fontSize:12.5, color:T3, marginTop:4, lineHeight:1.5 }}>Pause non-urgent notifications during selected hours.</div>
              </div>
              <Switch on={quiet} onClick={() => setQuiet(v => !v)}/>
            </div>
            {quiet && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${LINE}` }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                  <div style={{ flex:1 }}>
                    <CtrlLabel>Start</CtrlLabel>
                    <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} style={timeField}/>
                  </div>
                  <div style={{ paddingBottom:11, color:T3, fontSize:13 }}>→</div>
                  <div style={{ flex:1 }}>
                    <CtrlLabel>End</CtrlLabel>
                    <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} style={timeField}/>
                  </div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginTop:16 }}>
                  <div style={{ fontSize:13, color:T1 }}>Allow safety cautions during quiet hours</div>
                  <Switch on={quietSafety} onClick={() => setQuietSafety(v => !v)}/>
                </div>
              </div>
            )}
          </div>

          <NotifSection>Notification frequency</NotifSection>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {FREQ.map((f) => {
              const active = frequency[0] === f.label;
              return (
                <button
                  key={f.label}
                  onClick={() => setFrequency([f.label])}
                  style={{
                    textAlign:"left" as const, fontFamily:"inherit", cursor:"pointer",
                    background:SURFACE, borderRadius:16, padding:16,
                    border:`1px solid ${active ? T1 : BORDER}`, transition:"border-color 0.12s",
                    display:"flex", alignItems:"flex-start", gap:12,
                  }}
                >
                  <span style={{ width:18, height:18, borderRadius:"50%", marginTop:1, flexShrink:0, border:`2px solid ${active ? T1 : BORDER_M}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {active && <span style={{ width:8, height:8, borderRadius:"50%", background:T1 }}/>}
                  </span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:T1 }}>{f.label}</div>
                    <div style={{ fontSize:12.5, color:T3, marginTop:3, lineHeight:1.5 }}>{f.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <NotifSection>Source preferences</NotifSection>
          <div style={{ background:SURFACE, borderRadius:16, border:`1px solid ${BORDER}`, padding:"4px 16px" }}>
            {["Public posts", "Venue updates", "City alerts", "Transit alerts", "Weather updates"].map((src, i, arr) => {
              const on = sources.includes(src);
              return (
                <div key={src} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${LINE}` }}>
                  <span style={{ fontSize:14, color:T1 }}>{src}</span>
                  <Switch on={on} onClick={() => setSources(on ? sources.filter(s => s !== src) : [...sources, src])}/>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign:"center", fontSize:12, color:T4, paddingTop:32 }}>Recon Beta · Vancouver · v0.1</div>
      </div>
    </div>
  );
}

/* ══ Security panel ═══════════════════════════════════════════════ */
function ActionRow({ title, desc, action, danger=false, last=false, onAction }: { title: string; desc: string; action: string; danger?: boolean; last?: boolean; onAction?: () => void }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, padding:"15px 0", borderBottom: last ? "none" : `1px solid ${LINE}` }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color: danger ? "#e96a6a" : T1 }}>{title}</div>
        <div style={{ fontSize:12.5, color:T3, marginTop:3, lineHeight:1.5 }}>{desc}</div>
      </div>
      <button
        onClick={onAction}
        style={{
          flexShrink:0, padding:"8px 14px", borderRadius:10, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
          background: danger ? "rgba(233,106,106,0.08)" : SURFACE2,
          color: danger ? "#e96a6a" : T1,
          border:`1px solid ${danger ? "rgba(233,106,106,0.35)" : BORDER_M}`,
        }}
      >
        {action}
      </button>
    </div>
  );
}

function SecurityPanel({ onClose }: { onClose: () => void }) {
  const [twoFA, setTwoFA]           = useState(false);
  const [locAccess, setLocAccess]   = useState<string[]>(["Approximate area"]);
  const [hideHome, setHideHome]     = useState(false);
  const [sensitive, setSensitive]   = useState(true);

  const card: React.CSSProperties = { background:SURFACE, borderRadius:16, border:`1px solid ${BORDER}`, padding:"4px 16px" };
  const cardPad: React.CSSProperties = { background:SURFACE, borderRadius:16, border:`1px solid ${BORDER}`, padding:16 };

  const SESSIONS = [
    { device:"iPhone",            meta:"Current device",       current:true },
    { device:"Chrome on Linux",   meta:"Last active today",    current:false },
    { device:"Safari on iPhone",  meta:"Last active yesterday", current:false },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:BG, zIndex:2000, overflowY:"auto", scrollbarWidth:"none", paddingTop:"max(env(safe-area-inset-top), 20px)" }}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"16px 20px 0" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"20px 20px 48px" }}>
        <div style={{ fontSize:24, fontWeight:800, color:T1, marginBottom:6, letterSpacing:-0.5 }}>Security</div>
        <div style={{ fontSize:13, color:T3, lineHeight:1.5, marginBottom:8 }}>Control account access, sessions, and sensitive app settings.</div>

        <NotifSection>Account access</NotifSection>
        <div style={card}>
          <ActionRow title="Password" desc="Change your account password." action="Change"/>
          <ActionRow title="Email" desc="Manage the email used for login and recovery." action="Update"/>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, padding:"15px 0" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:T1 }}>Two-factor authentication</div>
              <div style={{ fontSize:12.5, color:T3, marginTop:3, lineHeight:1.5 }}>Add another step when signing in.</div>
            </div>
            {twoFA
              ? <Switch on={twoFA} onClick={() => setTwoFA(false)}/>
              : <button onClick={() => setTwoFA(true)} style={{ flexShrink:0, padding:"8px 14px", borderRadius:10, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit", background:T1, color:"#0d0d0d", border:"none" }}>Set up 2FA</button>}
          </div>
        </div>

        <NotifSection>Login sessions</NotifSection>
        <div style={{ fontSize:12.5, color:T3, marginBottom:10, lineHeight:1.5 }}>See where your account is signed in.</div>
        <div style={card}>
          {SESSIONS.map((s, i) => (
            <div key={s.device} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 0", borderBottom: i === SESSIONS.length - 1 ? "none" : `1px solid ${LINE}` }}>
              <div style={{ width:34, height:34, borderRadius:10, background:SURFACE2, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <IconDevice/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:T1, fontWeight:500 }}>{s.device}</div>
                <div style={{ fontSize:12, color:T3, marginTop:2 }}>{s.meta}</div>
              </div>
              {s.current
                ? <span style={{ fontSize:10.5, fontWeight:600, color:"#5fbf7f", background:"rgba(95,191,127,0.1)", border:"1px solid rgba(95,191,127,0.3)", padding:"3px 9px", borderRadius:999 }}>Active</span>
                : <button style={{ background:"none", border:"none", cursor:"pointer", color:T2, fontFamily:"inherit", fontSize:12.5, fontWeight:500 }}>Log out</button>}
            </div>
          ))}
        </div>
        <button style={{ width:"100%", height:48, marginTop:12, borderRadius:14, background:"none", border:`1px solid ${BORDER_M}`, color:T1, fontSize:13.5, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>Log out of all other devices</button>

        <NotifSection>Location security</NotifSection>
        <div style={cardPad}>
          <div style={{ fontSize:14, fontWeight:600, color:T1 }}>Location access</div>
          <div style={{ fontSize:12.5, color:T3, margin:"4px 0 12px", lineHeight:1.5 }}>Control how Recon uses your location.</div>
          <ChipGroup options={["Off", "Approximate area", "Precise location"]} value={locAccess} onChange={setLocAccess}/>
          <div style={{ height:1, background:LINE, margin:"16px 0" }}/>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:T1 }}>Hide home area</div>
              <div style={{ fontSize:12.5, color:T3, marginTop:3, lineHeight:1.5 }}>Recon will avoid showing or saving your exact home location.</div>
            </div>
            <Switch on={hideHome} onClick={() => setHideHome(v => !v)}/>
          </div>
          <div style={{ height:1, background:LINE, margin:"16px 0" }}/>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:T1 }}>Sensitive location protection</div>
              <div style={{ fontSize:12.5, color:T3, marginTop:3, lineHeight:1.5 }}>Hide exact coordinates for homes, schools, hospitals, and private addresses.</div>
            </div>
            <Switch on={sensitive} onClick={() => setSensitive(v => !v)}/>
          </div>
        </div>

        <NotifSection>Privacy controls</NotifSection>
        <div style={card}>
          <ActionRow title="Download my data" desc="Export saved places, events, alerts, and account activity." action="Export"/>
          <ActionRow title="Delete account" desc="Permanently delete your account and saved data." action="Delete" danger last/>
        </div>

        <div style={{ textAlign:"center", fontSize:12, color:T4, paddingTop:32 }}>Recon Beta · Vancouver · v0.1</div>
      </div>
    </div>
  );
}

function IconDevice() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2.5"/><line x1="12" y1="18" x2="12" y2="18"/>
    </svg>
  );
}

/* ══ Settings panel ═══════════════════════════════════════════════ */
function SettingsPanel({ onClose, onEditProfile, onPrivacy, onAbout, onNotifications, onSecurity }: { onClose: () => void; onEditProfile: () => void; onPrivacy: () => void; onAbout: () => void; onNotifications: () => void; onSecurity: () => void }) {
  return (
    <div style={{ position:"fixed", inset:0, background:BG, zIndex:2000, overflowY:"auto", scrollbarWidth:"none", paddingTop:"max(env(safe-area-inset-top), 20px)" }}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"16px 20px 0" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"20px 20px 0" }}>
        <div style={{ fontSize:24, fontWeight:800, color:T1, marginBottom:22, letterSpacing:-0.5 }}>Settings</div>
        {[
          { group:"Preferences", rows:[{ label:"Notifications", onClick: onNotifications },{ label:"Security", onClick: onSecurity },{ label:"Data & activity", last:true }] },
          { group:"Account",     rows:[{ label:"Edit profile", onClick: onEditProfile },{ label:"Change city", sublabel:"Vancouver, BC", last:true }] },
          { group:"About",       rows:[{ label:"About Recon", onClick: onAbout },{ label:"Help & feedback" },{ label:"Terms of service" },{ label:"Privacy policy", last:true, onClick: onPrivacy }] },
        ].map((section) => (
          <div key={section.group} style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, color:T3, letterSpacing:1.8, textTransform:"uppercase" as const, fontWeight:600, marginBottom:6 }}>{section.group}</div>
            <div style={{ background:SURFACE, borderRadius:16, padding:"0 16px", border:`1px solid ${BORDER}` }}>
              {section.rows.map((r) => <SettingRow key={r.label} {...(r as any)}/>)}
            </div>
          </div>
        ))}
        <button style={{ width:"100%", height:50, borderRadius:14, background:"none", border:`1px solid ${BORDER}`, color:T1, fontSize:14, fontWeight:500, cursor:"pointer", marginBottom:28, fontFamily:"inherit" }}>Log out</button>
        <div style={{ textAlign:"center", fontSize:12, color:T4, paddingBottom:32 }}>Recon Beta · Vancouver · v0.1</div>
      </div>
    </div>
  );
}

/* ══ About panel ══════════════════════════════════════════════════ */
function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position:"fixed", inset:0, background:BG, zIndex:2000, overflowY:"auto", scrollbarWidth:"none", paddingTop:"max(env(safe-area-inset-top), 20px)" }}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"16px 20px 0" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"20px 20px 48px" }}>
        <div style={{ fontSize:24, fontWeight:800, color:T1, marginBottom:22, letterSpacing:-0.5 }}>About Recon</div>
        
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Recon helps you see what is happening around your city right now.
        </p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Most local information is scattered across social posts, event pages, group chats, maps, news alerts, and creator recommendations. Recon puts that activity into one city view so you can find places, events, crowds, weather updates, pop-ups, nightlife, cafes, and local alerts without digging through five different apps.
        </p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Recon is built around the map. Open the app, choose a category, tap a pin, and see what is happening at that place. Each post, event, or alert is tied to a real location so the city feels easier to read.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>What Recon shows</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>Recon organizes local activity into clear categories:</p>
        <ul style={{ fontSize:14, color:T2, lineHeight:1.8, marginBottom:16, paddingLeft:20 }}>
          <li>Trending city activity</li>
          <li>Cafes and study spots</li>
          <li>Nightlife and late food</li>
          <li>Pop-ups and temporary events</li>
          <li>Weather impact</li>
          <li>Safety cautions</li>
          <li>Local events</li>
          <li>Places people are talking about</li>
        </ul>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          The goal is simple: help you decide where to go, what to check, and what to avoid.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>How Recon works</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>
          Recon collects and organizes public city activity from supported sources. When a post, event, or update is connected to a place, Recon can display it as a city item with location, category, time, source, and basic context.
        </p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Recon does not replace original creators, venues, or sources. When possible, Recon links back to the original post or source so users can check the full context.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Why Recon exists</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>Cities move faster than traditional search.</p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>
          A restaurant can get busy before it shows up on Google. A pop-up can be over before most people hear about it. A street can flood, a venue can fill up, or a neighborhood can become active before the news catches it.
        </p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>Recon is built for those moments.</p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>It gives you a practical view of the city as it changes throughout the day.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>What you can do with Recon</h3>
        <ul style={{ fontSize:14, color:T2, lineHeight:1.8, marginBottom:16, paddingLeft:20 }}>
          <li>Find things happening near you</li>
          <li>Check what areas are active</li>
          <li>Discover cafes, events, nightlife, and pop-ups</li>
          <li>See weather-related activity</li>
          <li>Review safety cautions before heading out</li>
          <li>Save places and events</li>
          <li>Open directions</li>
          <li>Return to posts and places later</li>
        </ul>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Recon is not built to keep you scrolling forever. It is built to help you make a decision and move.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Our approach</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:8 }}>Recon keeps the interface simple, direct, and location-first.</p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:4 }}>No cluttered feed.</p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:4 }}>No endless recommendation wall.</p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>No random content detached from place.</p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Everything should answer one question: <strong>What is happening here?</strong>
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Current focus</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>Recon is starting with Vancouver.</p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          The first version focuses on a mobile map, dashboard, saved page, alerts, and realistic local categories. The product will expand as the system gets better at organizing real city activity and connecting posts to places.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>The promise</h3>
        <p style={{ fontSize:14, color:T1, lineHeight:1.6, fontWeight:600 }}>Recon helps you read the city faster.</p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6 }}>See what is happening.</p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6 }}>Check the context.</p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6 }}>Choose where to go.</p>
      </div>
    </div>
  );
}

/* ══ Privacy panel ════════════════════════════════════════════════ */
function PrivacyPanel({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position:"fixed", inset:0, background:BG, zIndex:2000, overflowY:"auto", scrollbarWidth:"none", paddingTop:"max(env(safe-area-inset-top), 20px)" }}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"16px 20px 0" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"20px 20px 48px" }}>
        <div style={{ fontSize:24, fontWeight:800, color:T1, marginBottom:24, letterSpacing:-0.5 }}>Privacy</div>
        
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Recon is built to help you see what is happening around your city without collecting more information than the app needs to work.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Information we collect</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>
          Recon may collect basic information you provide, such as your name, email address, profile details, saved places, saved events, alerts, and app preferences.
        </p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Recon may also collect app activity, such as the places you view, categories you filter, events you save, posts you open, and actions you take inside the app. This helps the app remember your preferences and improve the way city activity is organized.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Location</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>
          Recon may ask for access to your location so the app can show nearby places, events, posts, alerts, and directions. You can use Recon without sharing precise location, but some nearby features may not work as well.
        </p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          You can change or remove location permission at any time in your device settings.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Public posts and third-party content</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>
          Recon may display public posts, links, media previews, creator handles, venue information, map data, and other public information from third-party sources. Recon does not claim ownership of third-party posts or creator content.
        </p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          When available, Recon shows the original source so users can open the original post or page.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>How we use information</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:8 }}>Recon uses information to:</p>
        <ul style={{ fontSize:14, color:T2, lineHeight:1.8, marginBottom:24, paddingLeft:20 }}>
          <li>Show relevant city activity</li>
          <li>Display nearby places, events, and alerts</li>
          <li>Save places and events to your account</li>
          <li>Improve search, filters, and dashboard views</li>
          <li>Provide directions and location-based features</li>
          <li>Keep the app secure and working properly</li>
          <li>Understand app performance and fix bugs</li>
        </ul>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Sharing information</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>
          Recon does not sell your personal information.
        </p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>
          Recon may share limited information with service providers that help operate the app, such as hosting providers, database providers, analytics tools, map services, crash reporting tools, and authentication providers. These services are used only to run, secure, measure, and improve the app.
        </p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Recon may also share information if required by law, to protect users, or to prevent abuse of the app.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Data safety</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Recon uses reasonable technical and organizational measures to protect user information. No app or online service can guarantee perfect security, but Recon is designed to limit unnecessary data collection and protect the information needed to operate the app.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Data retention</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 }}>
          Recon keeps personal information only as long as needed to provide the app, maintain your account, improve the service, comply with legal obligations, or prevent abuse.
        </p>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Saved places, saved events, preferences, and account information may remain until you delete them or request deletion of your account.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Your choices</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:8 }}>You can:</p>
        <ul style={{ fontSize:14, color:T2, lineHeight:1.8, marginBottom:24, paddingLeft:20 }}>
          <li>Change location permissions in your device settings</li>
          <li>Remove saved places and events inside the app</li>
          <li>Turn off notifications in your device settings</li>
          <li>Request access to your information</li>
          <li>Request correction or deletion of your information</li>
          <li>Stop using the app at any time</li>
        </ul>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Children’s privacy</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Recon is not designed to knowingly collect personal information from children under the age required by applicable law. If we learn that we have collected personal information from a child without proper consent, we will take steps to delete it.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Changes to this policy</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          Recon may update this privacy statement as the app changes. If the changes are important, we may notify users through the app or another reasonable method.
        </p>

        <h3 style={{ fontSize:16, fontWeight:700, color:T1, marginBottom:12 }}>Contact</h3>
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:4 }}>For privacy questions or deletion requests, contact:</p>
        <div style={{ fontSize:14, color:T1, lineHeight:1.6, fontWeight:500 }}>
          Recon<br/>
          david.ren@wya.tech<br/>
          wya.tech
        </div>
      </div>
    </div>
  );
}

/* ══ Account panel ════════════════════════════════════════════════ */
function AccountPanel({ onClose }: { onClose: () => void }) {
  const LOGO_IMG = (
    <img 
      src="/logo.png" 
      alt="R" 
      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} 
    />
  );
  return (
    /* Use position: fixed and extremely high z-index to stay above the map */
    <div style={{ position:"fixed", inset:0, background:BG, zIndex:2000, overflowY:"auto", scrollbarWidth:"none", paddingTop:"max(env(safe-area-inset-top), 20px)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 0" }}>
        <span style={{ fontSize:10, color:T3, letterSpacing:1.8, textTransform:"uppercase", fontWeight:600 }}>Account</span>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ margin:"16px 20px 0", background:"#111", borderRadius:22, padding:"24px 22px", border:`1px solid ${BORDER_M}` }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:SURFACE2, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", overflow: "hidden" }}>
            {LOGO_IMG}
          </div>
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
function YouPopup({ onSettings, onClose }: {
  onSettings: () => void;
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
      {/* Backdrop covers everything, sits above map */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:1000 }}/>
      <div style={{
        position:"fixed",
        bottom:`calc(74px + env(safe-area-inset-bottom, 0px))`,
        right:16,
        width:200,
        background:SURFACE,
        border:`1px solid ${BORDER_M}`,
        borderRadius:18,
        zIndex:1001,
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
        {/* Arrow notch */}
        <div style={{ position:"absolute", bottom:-6, right:23, width:12, height:12, background:SURFACE, border:`1px solid ${BORDER_M}`, transform:"rotate(45deg)", borderTop:"none", borderLeft:"none" }}/>
      </div>
    </>
  );
}

function IconDashGrid() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
}

/* ══ Bottom nav ═══════════════════════════════════════════════════ */
export default function BottomNav() {
  const pathname = usePathname();
  const [youPopupOpen, setYouPopupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen,  setAccountOpen]  = useState(false);
  const [privacyOpen,  setPrivacyOpen]  = useState(false);
  const [aboutOpen,    setAboutOpen]    = useState(false);
  const [notifsOpen,   setNotifsOpen]   = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  const NAV_ITEMS = [
    { label:"Home",     href:"/home",     icon:IconHome     },
    { label:"Discover", href:"/discover", icon:IconDiscover },
    { label:"Saved",    href:"/saved",    icon:IconBookmark },
  ];

  return (
    <>
      <div style={{
        display:"flex", justifyContent:"space-around", alignItems:"center",
        paddingTop: 10,
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 14px)",
        background:BG,
        borderTop:`1px solid ${LINE}`,
        flexShrink:0, width:"100%", 
        /* Ensure navbar itself is always above map layers */
        position: "relative",
        zIndex:999, 
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
      </div>

      {youPopupOpen && (
        <YouPopup
          onSettings={() => setSettingsOpen(true)}
          onClose={() => setYouPopupOpen(false)}
        />
      )}

      {settingsOpen && (
        <SettingsPanel 
          onClose={() => setSettingsOpen(false)} 
          onEditProfile={() => {
            setSettingsOpen(false);
            setAccountOpen(true);
          }}
          onPrivacy={() => {
            setSettingsOpen(false);
            setPrivacyOpen(true);
          }}
          onAbout={() => {
            setSettingsOpen(false);
            setAboutOpen(true);
          }}
          onNotifications={() => {
            setSettingsOpen(false);
            setNotifsOpen(true);
          }}
          onSecurity={() => {
            setSettingsOpen(false);
            setSecurityOpen(true);
          }}
        />
      )}
      {accountOpen  && <AccountPanel  onClose={() => setAccountOpen(false)}/>}
      {privacyOpen  && <PrivacyPanel  onClose={() => setPrivacyOpen(false)}/>}
      {aboutOpen    && <AboutPanel    onClose={() => setAboutOpen(false)}/>}
      {notifsOpen   && <NotificationsPanel onClose={() => setNotifsOpen(false)}/>}
      {securityOpen && <SecurityPanel onClose={() => setSecurityOpen(false)}/>}
    </>
  );
}
