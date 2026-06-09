"use client";

import { useState, useRef } from "react";
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

/* ══ Draggable Panel ══════════════════════════════════════════════ */
function DraggablePanel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const [translateY, setTranslateY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
      setIsAnimating(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsAnimating(true);
    if (translateY > 120) {
      onClose();
    } else {
      setTranslateY(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        background: BG,
        zIndex: 2000,
        overflowY: "auto",
        scrollbarWidth: "none",
        transform: `translateY(${translateY}px)`,
        transition: isAnimating ? "transform 0.3s cubic-bezier(0.2, 0, 0, 1)" : "none",
        touchAction: "pan-y"
      }}
    >
      {/* Background extension above top edge */}
      <div style={{ position: "absolute", top: -1000, left: 0, right: 0, height: 1000, background: BG }} />
      
      <div style={{ position: "sticky", top: 0, background: BG, zIndex: 10, paddingTop: "max(env(safe-area-inset-top), 20px)" }} />
      <div style={{ minHeight: "100%", paddingBottom: 60 }}>
        {children}
      </div>
    </div>
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
    <DraggablePanel onClose={onClose}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"0 20px" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"0 20px 48px" }}>
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
    </DraggablePanel>
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
    <DraggablePanel onClose={onClose}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"0 20px" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"0 20px 48px" }}>
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
    </DraggablePanel>
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
function SettingsPanel({ onClose, onEditProfile, onPrivacy, onAbout, onHelp, onTerms, onNotifications, onSecurity, onDataActivity }: { onClose: () => void; onEditProfile: () => void; onPrivacy: () => void; onAbout: () => void; onHelp: () => void; onTerms: () => void; onNotifications: () => void; onSecurity: () => void; onDataActivity: () => void }) {
  return (
    <DraggablePanel onClose={onClose}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"0 20px" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"0 20px 0" }}>
        <div style={{ fontSize:24, fontWeight:800, color:T1, marginBottom:22, letterSpacing:-0.5 }}>Settings</div>
        {([
          { group:"Preferences", rows:[{ label:"Notifications", onClick: onNotifications },{ label:"Security", onClick: onSecurity },{ label:"Data & activity", last:true, onClick: onDataActivity }] },
          { group:"Account",     rows:[{ label:"Edit profile", onClick: onEditProfile },{ label:"Change city", sublabel:"Vancouver, BC", last:true }] },
          { group:"About",       rows:[{ label:"About Recon", onClick: onAbout },{ label:"Help & feedback", onClick: onHelp },{ label:"Terms of service", onClick: onTerms },{ label:"Privacy policy", last:true, onClick: onPrivacy }] },
        ] as { group: string; rows: { label: string; sublabel?: string; last?: boolean; onClick?: () => void }[] }[]).map((section) => (
          <div key={section.group} style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, color:T3, letterSpacing:1.8, textTransform:"uppercase" as const, fontWeight:600, marginBottom:6 }}>{section.group}</div>
            <div style={{ background:SURFACE, borderRadius:16, padding:"0 16px", border:`1px solid ${BORDER}` }}>
              {section.rows.map((r) => (
                <SettingRow 
                  key={r.label} 
                  label={r.label} 
                  sublabel={r.sublabel}
                  last={r.last}
                  onClick={r.onClick}
                />
              ))}
            </div>
          </div>
        ))}
        <button style={{ width:"100%", height:50, borderRadius:14, background:"none", border:`1px solid ${BORDER}`, color:T1, fontSize:14, fontWeight:500, cursor:"pointer", marginBottom:28, fontFamily:"inherit" }}>Log out</button>
        <div style={{ textAlign:"center", fontSize:12, color:T4, paddingBottom:32 }}>Recon Beta · Vancouver · v0.1</div>
      </div>
    </DraggablePanel>
  );
}

/* ══ Help panel ═══════════════════════════════════════════════════ */
function HelpPanel({ onClose }: { onClose: () => void }) {
  const h3: React.CSSProperties = { fontSize:16, fontWeight:700, color:T1, margin:"28px 0 12px" };
  const p:  React.CSSProperties = { fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 };
  return (
    <DraggablePanel onClose={onClose}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"0 20px" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"0 20px 48px" }}>
        <div style={{ fontSize:24, fontWeight:800, color:T1, marginBottom:22, letterSpacing:-0.5 }}>Help & feedback</div>
        
        <p style={{ fontSize:14, color:T2, lineHeight:1.6, marginBottom:24 }}>
          We are currently in Beta. Your feedback helps us improve how Recon understands and organizes the city.
        </p>

        <h3 style={{ ...h3, marginTop:0 }}>Frequently Asked Questions</h3>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize:14, fontWeight:600, color:T1, marginBottom:4 }}>How does Recon find places and events?</div>
          <p style={{ ...p, marginBottom:16 }}>Recon aggregates public posts, event listings, and community updates to show you what is happening locally.</p>
          
          <div style={{ fontSize:14, fontWeight:600, color:T1, marginBottom:4 }}>Why isn&apos;t my favorite spot on the map?</div>
          <p style={{ ...p, marginBottom:16 }}>We only map places that have recent activity or upcoming events. If a place has no current buzz, it might not show up right now.</p>
          
          <div style={{ fontSize:14, fontWeight:600, color:T1, marginBottom:4 }}>How do I change my city?</div>
          <p style={{ ...p, marginBottom:0 }}>Recon is currently only available for Vancouver during our Beta testing phase. More cities will be added soon.</p>
        </div>

        <h3 style={h3}>Report an issue</h3>
        <p style={{ ...p, marginBottom:16 }}>
          Notice a bug, an incorrect map pin, or a miscategorized event? Let us know so we can fix it.
        </p>
        <button style={{ width:"100%", height:50, borderRadius:14, background:SURFACE, border:`1px solid ${BORDER}`, color:T1, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:24, fontFamily:"inherit" }}>
          Report an issue
        </button>

        <h3 style={h3}>Send feedback</h3>
        <p style={{ ...p, marginBottom:16 }}>
          Have an idea for a new feature or ways we can improve the app? We read every message.
        </p>
        <button style={{ width:"100%", height:50, borderRadius:14, background:T1, border:"none", color:"#0d0d0d", fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:24, fontFamily:"inherit" }}>
          Send feedback
        </button>

        <h3 style={h3}>Contact Support</h3>
        <p style={{ ...p, marginBottom:4 }}>For urgent support or account issues, contact us at:</p>
        <div style={{ fontSize:14, color:T1, lineHeight:1.6, fontWeight:500 }}>
          support@wya.tech
        </div>
      </div>
    </DraggablePanel>
  );
}

/* ══ Data & Activity panel ════════════════════════════════════════ */
function DataActivityPanel({ onClose }: { onClose: () => void }) {
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  
  const card: React.CSSProperties = { background:SURFACE, borderRadius:16, border:`1px solid ${BORDER}`, padding:"4px 16px" };

  return (
    <DraggablePanel onClose={onClose}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"0 20px" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"0 20px 48px" }}>
        <div style={{ fontSize:24, fontWeight:800, color:T1, marginBottom:6, letterSpacing:-0.5 }}>Data & activity</div>
        <div style={{ fontSize:13, color:T3, lineHeight:1.5, marginBottom:22 }}>Manage how your data is used and clear your app history.</div>

        <NotifSection>Data usage</NotifSection>
        <div style={card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, padding:"15px 0", borderBottom:`1px solid ${LINE}` }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:T1 }}>App analytics</div>
              <div style={{ fontSize:12.5, color:T3, marginTop:3, lineHeight:1.5 }}>Share anonymous usage data to help us improve Recon.</div>
            </div>
            <Switch on={analytics} onClick={() => setAnalytics(v => !v)}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, padding:"15px 0" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, color:T1 }}>Personalization</div>
              <div style={{ fontSize:12.5, color:T3, marginTop:3, lineHeight:1.5 }}>Allow Recon to use your activity to recommend better places and events.</div>
            </div>
            <Switch on={personalization} onClick={() => setPersonalization(v => !v)}/>
          </div>
        </div>

        <NotifSection>Manage history</NotifSection>
        <div style={card}>
          <ActionRow title="Clear search history" desc="Remove all your past search queries." action="Clear" />
          <ActionRow title="Clear recently viewed" desc="Remove history of places and events you've viewed." action="Clear" />
          <ActionRow title="Clear cache" desc="Free up storage space used by the app." action="Clear" danger last/>
        </div>
      </div>
    </DraggablePanel>
  );
}

/* ══ About panel ══════════════════════════════════════════════════ */
function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <DraggablePanel onClose={onClose}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"0 20px" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"0 20px 48px" }}>
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
    </DraggablePanel>
  );
}

/* ══ Privacy panel ════════════════════════════════════════════════ */
function PrivacyPanel({ onClose }: { onClose: () => void }) {
  return (
    <DraggablePanel onClose={onClose}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"0 20px" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"0 20px 48px" }}>
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
    </DraggablePanel>
  );
}

/* ══ Terms of service panel ═══════════════════════════════════════ */
function TermsPanel({ onClose }: { onClose: () => void }) {
  const h3: React.CSSProperties = { fontSize:16, fontWeight:700, color:T1, margin:"28px 0 12px" };
  const p:  React.CSSProperties = { fontSize:14, color:T2, lineHeight:1.6, marginBottom:16 };
  return (
    <DraggablePanel onClose={onClose}>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", padding:"0 20px" }}>
        <button aria-label="Close" onClick={onClose} style={{ background:SURFACE2, border:`1px solid ${BORDER}`, cursor:"pointer", color:T2, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}>
          <IconClose/>
        </button>
      </div>
      <div style={{ padding:"0 20px 48px" }}>
        <div style={{ fontSize:24, fontWeight:800, color:T1, marginBottom:6, letterSpacing:-0.5 }}>Terms of Service</div>
        <div style={{ fontSize:12, color:T4, marginBottom:20 }}>Last updated June 2026</div>

        <h3 style={{ ...h3, marginTop:0 }}>Overview</h3>
        <p style={p}>
          This mobile app and website are operated by Recon. Throughout the app and site, the terms “we”, “us” and “our” refer to Recon. Recon offers this mobile app, website, information, tools and Services available through the app or site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
        </p>
        <p style={p}>
          By accessing our app, visiting our site, creating an account, saving a place, viewing a map pin, opening a post, using directions, receiving an alert, or otherwise using our Service, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the Service, including without limitation users who are browsers, registered users, creators, venues, businesses, contributors of content, and users who view, save, submit, report, or interact with city activity.
        </p>
        <p style={p}>
          Please read these Terms of Service carefully before accessing or using our app or website. By accessing or using any part of the Service, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the app, website, or use any Services. If these Terms of Service are considered an offer, acceptance is expressly limited to these Terms of Service.
        </p>
        <p style={p}>
          Any new features, tools, pages, alerts, maps, categories, dashboards, or mobile app functions which are added to the current Service shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our app or website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the app, website, or Service following the posting of any changes constitutes acceptance of those changes.
        </p>
        <p style={p}>
          Recon is a mobile-first city discovery service. Recon may display maps, city activity, public posts, events, weather-related information, safety cautions, nightlife, cafes, pop-ups, venue information, creator content, and third-party links. Recon is not an emergency service, public safety authority, official weather authority, official transit authority, or official news source.
        </p>

        <h3 style={h3}>Section 1 — App Terms</h3>
        <p style={p}>
          By agreeing to these Terms of Service, you represent that you are at least the age required to use the Service in your state, province, or country of residence, or that you have permission from a parent or legal guardian where required by law.
        </p>
        <p style={p}>
          You may not use our Service for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction, including but not limited to copyright laws, privacy laws, location data laws, platform rules, and laws relating to harassment, trespass, public safety, or misuse of third-party content.
        </p>
        <p style={p}>You must not transmit any worms or viruses or any code of a destructive nature.</p>
        <p style={p}>
          You must not use Recon to create, share, report, save, or promote false, harmful, unlawful, misleading, threatening, abusive, private, or unsafe information.
        </p>
        <p style={p}>A breach or violation of any of the Terms will result in an immediate termination of your Services.</p>

        <h3 style={h3}>Section 2 — General Conditions</h3>
        <p style={p}>We reserve the right to refuse service to anyone for any reason at any time.</p>
        <p style={p}>
          You understand that your content, location-related information, device information, saved places, saved events, alert preferences, app usage, and other non-payment information may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks, devices, maps, databases, hosting providers, or third-party services. Payment information, if any paid features are added in the future, is handled by the applicable payment provider or app store and is encrypted during transfer where required.
        </p>
        <p style={p}>
          You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, map data, pin data, source data, user interface, app content, or access to the Service or any contact through which the Service is provided, without express written permission by us.
        </p>
        <p style={p}>
          You agree not to scrape, harvest, crawl, copy, bulk download, reverse engineer, or otherwise collect data from Recon without our express written permission.
        </p>
        <p style={p}>The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.</p>

        <h3 style={h3}>Section 3 — Accuracy, Completeness and Timeliness of Information</h3>
        <p style={p}>
          We are not responsible if information made available through the Service is not accurate, complete, current, available, safe, or reliable. The material in the app and on the website is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete, more timely, or official sources of information. Any reliance on the material in the Service is at your own risk.
        </p>
        <p style={p}>
          Recon may display public posts, city activity, events, weather-related information, safety cautions, transit-related information, venue details, creator content, and map pins. Such information may be delayed, incomplete, outdated, inaccurate, miscategorized, unavailable, or based on third-party sources outside our control.
        </p>
        <p style={p}>
          The Service may contain certain historical information. Historical information, necessarily, is not current and is provided for your reference only. Saved events, past activity, expired pins, old posts, previous alerts, and archived dashboard information may not reflect current conditions. We reserve the right to modify the contents of the Service at any time, but we have no obligation to update any information in the Service. You agree that it is your responsibility to monitor changes to the app, website, places, events, routes, alerts, and any other information you rely upon.
        </p>
        <p style={p}>
          Recon is not a substitute for emergency services, official public alerts, government notices, transit authority updates, weather warnings, venue announcements, or direct confirmation from a business, creator, or event organizer.
        </p>

        <h3 style={h3}>Section 4 — Modifications to the Service and Prices</h3>
        <p style={p}>
          Prices for any future paid features, subscriptions, venue tools, creator tools, promoted placements, or premium Services are subject to change without notice.
        </p>
        <p style={p}>We reserve the right at any time to modify or discontinue the Service, or any part or content thereof, without notice at any time.</p>
        <p style={p}>
          We shall not be liable to you or to any third-party for any modification, price change, suspension, removal of features, change in categories, limitation of alerts, map changes, data source changes, or discontinuance of the Service.
        </p>

        <h3 style={h3}>Section 5 — Products or Services (if applicable)</h3>
        <p style={p}>
          Certain products or Services may be available exclusively online through the app or website. These products or Services may have limited availability and are subject to cancellation, refund, or account rules only according to the applicable policy shown at the time of purchase or subscription.
        </p>
        <p style={p}>
          We have made every effort to display as accurately as possible the locations, categories, maps, pins, events, alerts, images, descriptions, and other information that appear in the Service. We cannot guarantee that your device screen, browser, operating system, network connection, location settings, or map provider will display any information accurately or consistently.
        </p>
        <p style={p}>
          We reserve the right, but are not obligated, to limit access to our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the availability, quantity, visibility, or access to any features or Services that we offer. All descriptions of products, Services, features, subscriptions, categories, alerts, or pricing are subject to change at any time without notice, at the sole discretion of us. We reserve the right to discontinue any product, Service, feature, category, alert, map layer, or source at any time. Any offer for any product or Service made through the app or website is void where prohibited.
        </p>
        <p style={p}>
          We do not warrant that the quality of any products, Services, information, location data, city activity, events, alerts, posts, map pins, or other material purchased, accessed, viewed, saved, or obtained by you will meet your expectations, or that any errors in the Service will be corrected.
        </p>

        <h3 style={h3}>Section 6 — Accuracy of Billing and Account Information</h3>
        <p style={p}>
          We reserve the right to refuse any account, purchase, subscription, venue claim, creator profile, promoted placement, or other request you place with us. We may, in our sole discretion, limit or cancel access, purchases, accounts, claims, subscriptions, or requests placed by or under the same user account, email address, device, payment method, billing address, or other identifying information. In the event that we make a change to or cancel a purchase, account, subscription, claim, or request, we may attempt to notify you by contacting the e-mail and/or account information provided at the time the request was made. We reserve the right to limit or prohibit accounts, claims, purchases, or requests that, in our sole judgment, appear to be fraudulent, abusive, automated, inaccurate, misleading, or made by unauthorized parties.
        </p>
        <p style={p}>
          You agree to provide current, complete and accurate account and purchase information for all accounts, purchases, subscriptions, venue claims, creator tools, or other transactions made through the Service. You agree to promptly update your account and other information, including your email address, payment information where applicable, location preferences, notification preferences, and contact details, so that we can complete your transactions and contact you as needed.
        </p>
        <p style={p}>For more detail, please review our Privacy Policy and any applicable refund, subscription, or app store policies.</p>

        <h3 style={h3}>Section 7 — Optional Tools</h3>
        <p style={p}>
          We may provide you with access to third-party tools, platforms, services, maps, links, embedded content, post viewers, direction providers, analytics tools, payment processors, weather services, transit services, or other tools over which we neither monitor nor have any control nor input.
        </p>
        <p style={p}>
          You acknowledge and agree that we provide access to such tools “as is” and “as available” without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.
        </p>
        <p style={p}>
          Any use by you of the optional tools offered through the Service is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).
        </p>
        <p style={p}>
          We may also, in the future, offer new Services and/or features through the app or website, including new map layers, alerts, dashboards, venue tools, creator tools, paid features, reports, accounts, saved places, city categories, or other resources. Such new features and/or Services shall also be subject to these Terms of Service.
        </p>

        <h3 style={h3}>Section 8 — Third-Party Links</h3>
        <p style={p}>Certain content, products and Services available via our Service may include materials from third-parties.</p>
        <p style={p}>
          Third-party links in the app or on the website may direct you to third-party websites, apps, platforms, posts, maps, venue pages, event pages, creator pages, social media platforms, transit providers, weather providers, payment providers, or other services that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials, websites, apps, platforms, posts, maps, events, alerts, products, or Services of third-parties.
        </p>
        <p style={p}>
          We are not liable for any harm or damages related to the purchase or use of goods, Services, resources, content, directions, events, places, or any other transactions made in connection with any third-party websites or services. Please review carefully the third-party’s policies and practices and make sure you understand them before you engage in any transaction, visit any location, attend any event, follow any direction, or rely on any third-party information. Complaints, claims, concerns, or questions regarding third-party products, posts, creators, venues, events, maps, alerts, or services should be directed to the third-party.
        </p>

        <h3 style={h3}>Section 9 — User Comments, Feedback and Other Submissions</h3>
        <p style={p}>
          If, at our request, you send certain specific submissions, reports, feedback, corrections, venue details, event information, creator information, bug reports, or without a request from us you send creative ideas, suggestions, proposals, plans, reports, corrections, comments, or other materials, whether online, by email, through the app, by postal mail, or otherwise (collectively, “comments”), you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate, display, process, moderate, and otherwise use in any medium any comments that you forward to us. We are and shall be under no obligation (1) to maintain any comments in confidence; (2) to pay compensation for any comments; or (3) to respond to any comments.
        </p>
        <p style={p}>
          We may, but have no obligation to, monitor, edit or remove content that we determine in our sole discretion to be unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene, misleading, unsafe, private, inaccurate, harmful, abusive, spam, or otherwise objectionable or violates any party’s intellectual property, privacy rights, platform rights, or these Terms of Service.
        </p>
        <p style={p}>
          You agree that your comments, reports, submissions, posts, corrections, or other content will not violate any right of any third-party, including copyright, trademark, privacy, personality, publicity, safety, or other personal or proprietary right. You further agree that your comments will not contain libelous or otherwise unlawful, abusive, obscene, misleading, private, dangerous, or harmful material, or contain any computer virus or other malware that could in any way affect the operation of the Service or any related website, app, platform, or third-party service. You may not use a false e-mail address, pretend to be someone other than yourself, falsely represent a venue, creator, business, event, or source, or otherwise mislead us or third-parties as to the origin of any comments. You are solely responsible for any comments you make and their accuracy. We take no responsibility and assume no liability for any comments, reports, corrections, submissions, or content posted by you or any third-party.
        </p>

        <h3 style={h3}>Section 10 — Personal Information</h3>
        <p style={p}>
          Your submission of personal information through the app, website, account, location features, saved places, alerts, dashboard, settings, or any related Service is governed by our Privacy Policy. To view our Privacy Policy, please see [LINK TO PRIVACY POLICY].
        </p>

        <h3 style={h3}>Section 11 — Errors, Inaccuracies and Omissions</h3>
        <p style={p}>
          Occasionally there may be information in the app, website, or Service that contains typographical errors, inaccuracies or omissions that may relate to place names, categories, event descriptions, times, creator handles, post links, source labels, map pins, directions, location data, weather-related information, safety cautions, transit information, pricing, promotions, offers, subscription terms, availability, or other city activity. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel accounts, purchases, subscriptions, claims, posts, pins, events, alerts, or orders if any information in the Service or on any related website is inaccurate at any time without prior notice, including after you have submitted a request, account information, saved event, report, purchase, or other action.
        </p>
        <p style={p}>
          We undertake no obligation to update, amend or clarify information in the Service or on any related website, including without limitation, place information, event information, pricing information, map information, public posts, source links, alerts, or availability, except as required by law. No specified update or refresh date applied in the Service or on any related website should be taken to indicate that all information in the Service or on any related website has been modified or updated.
        </p>

        <h3 style={h3}>Section 12 — Prohibited Uses</h3>
        <p style={p}>In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the app, website, Service, or its content:</p>
        <ul style={{ fontSize:14, color:T2, lineHeight:1.8, marginBottom:16, paddingLeft:20 }}>
          <li>(a) for any unlawful purpose;</li>
          <li>(b) to solicit others to perform or participate in any unlawful acts;</li>
          <li>(c) to violate any international, federal, provincial, state, local, or municipal regulations, rules, laws, or ordinances;</li>
          <li>(d) to infringe upon or violate our intellectual property rights or the intellectual property rights of others;</li>
          <li>(e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, threaten, stalk, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, disability, or any protected status;</li>
          <li>(f) to submit false or misleading information;</li>
          <li>(g) to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or of any related app, website, other websites, platforms, services, or the Internet;</li>
          <li>(h) to collect or track the personal information, location, identity, account information, or private activity of others;</li>
          <li>(i) to spam, phish, pharm, pretext, spider, crawl, scrape, bulk download, automate, or harvest data;</li>
          <li>(j) for any obscene, harmful, exploitative, abusive, or immoral purpose;</li>
          <li>(k) to interfere with or circumvent the security features of the Service or any related app, website, other websites, platforms, services, or the Internet;</li>
          <li>(l) to expose private addresses, sensitive locations, private personal information, or information that may put a person at risk;</li>
          <li>(m) to submit false safety reports, false event information, false venue claims, or misleading public activity; or</li>
          <li>(n) to use Recon to encourage trespassing, unsafe activity, violence, vandalism, harassment, or illegal conduct.</li>
        </ul>
        <p style={p}>We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses.</p>

        <h3 style={h3}>Section 13 — Disclaimer of Warranties; Limitation of Liability</h3>
        <p style={p}>We do not guarantee, represent or warrant that your use of our Service will be uninterrupted, timely, secure or error-free.</p>
        <p style={p}>We do not warrant that the results that may be obtained from the use of the Service will be accurate or reliable.</p>
        <p style={p}>You agree that from time to time we may remove the Service for indefinite periods of time or cancel the Service at any time, without notice to you.</p>
        <p style={p}>
          You expressly agree that your use of, or inability to use, the Service is at your sole risk. The Service and all products, Services, information, content, map pins, events, alerts, directions, location data, dashboards, posts, and other materials delivered to you through the Service are, except as expressly stated by us, provided “as is” and “as available” for your use, without any representation, warranties or conditions of any kind, either express or implied, including all implied warranties or conditions of merchantability, merchantable quality, fitness for a particular purpose, durability, title, accuracy, availability, safety, and non-infringement.
        </p>
        <p style={p}>
          In no case shall Recon, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, personal injury, property damage, travel issue, missed event, incorrect direction, inaccurate alert, unsafe condition, lost data, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, lost opportunity, missed booking, missed event, travel costs, or any similar damages, whether based in contract, tort, including negligence, strict liability or otherwise, arising from your use of any of the Service or any products procured using the Service, or for any other claim related in any way to your use of the Service or any product, including, but not limited to, any errors or omissions in any content, map pin, event, alert, source, post, route, category, or location information, or any loss or damage of any kind incurred as a result of the use of the Service or any content posted, transmitted, displayed, linked, embedded, mapped, saved, or otherwise made available via the Service, even if advised of their possibility.
        </p>
        <p style={p}>
          Because some states, provinces, countries, or jurisdictions do not allow the exclusion or the limitation of liability for consequential or incidental damages, in such states, provinces, countries, or jurisdictions, our liability shall be limited to the maximum extent permitted by law.
        </p>

        <h3 style={h3}>Section 14 — Indemnification</h3>
        <p style={p}>
          You agree to indemnify, defend and hold harmless Recon and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees, harmless from any claim or demand, including reasonable attorneys’ fees, made by any third-party due to or arising out of your breach of these Terms of Service or the documents they incorporate by reference, your use of the Service, your content, your reports, your submissions, your violation of any law, your misuse of third-party content, your violation of platform rules, or your violation of the rights of a third-party.
        </p>

        <h3 style={h3}>Section 15 — Severability</h3>
        <p style={p}>
          In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service. Such determination shall not affect the validity and enforceability of any other remaining provisions.
        </p>

        <h3 style={h3}>Section 16 — Termination</h3>
        <p style={p}>The obligations and liabilities of the parties incurred prior to the termination date shall survive the termination of this agreement for all purposes.</p>
        <p style={p}>
          These Terms of Service are effective unless and until terminated by either you or us. You may terminate these Terms of Service at any time by notifying us that you no longer wish to use our Services, deleting your account where available, or when you cease using our app or site.
        </p>
        <p style={p}>
          If in our sole judgment you fail, or we suspect that you have failed, to comply with any term or provision of these Terms of Service, we also may terminate this agreement at any time without notice and you will remain liable for all amounts due up to and including the date of termination, and/or accordingly may deny you access to our Services, accounts, saved items, app features, website, or any part thereof.
        </p>

        <h3 style={h3}>Section 17 — Entire Agreement</h3>
        <p style={p}>The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision.</p>
        <p style={p}>
          These Terms of Service and any policies or operating rules posted by us in the app, on this site, or in respect to the Service constitute the entire agreement and understanding between you and us and govern your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us, including but not limited to any prior versions of the Terms of Service.
        </p>
        <p style={p}>Any ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party.</p>

        <h3 style={h3}>Section 18 — Governing Law</h3>
        <p style={p}>
          These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of Canada.
        </p>

        <h3 style={h3}>Section 19 — Changes to Terms of Service</h3>
        <p style={p}>You can review the most current version of the Terms of Service at any time at this page.</p>
        <p style={p}>
          We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our app or website. It is your responsibility to check our app or website periodically for changes. Your continued use of or access to the app, website, or the Service following the posting of any changes to these Terms of Service constitutes acceptance of those changes.
        </p>

        <h3 style={h3}>Section 20 — Contact Information</h3>
        <p style={{ ...p, marginBottom:4 }}>Questions about the Terms of Service should be sent to us at <a href="mailto:david.ren@nyu.edu" style={{ color:T1, textDecoration:"none" }}>david.ren@nyu.edu</a>.</p>
        <p style={{ ...p, marginBottom:4 }}>Our contact information is posted below:</p>
        <div style={{ fontSize:14, color:T1, lineHeight:1.6, fontWeight:500 }}>
          Recon<br/>
          david.ren@nyu.edu<br/>
          [INSERT BUSINESS ADDRESS]<br/>
          [INSERT BUSINESS PHONE NUMBER]<br/>
          [INSERT BUSINESS REGISTRATION NUMBER]<br/>
          [INSERT VAT NUMBER, IF APPLICABLE]
        </div>
      </div>
    </DraggablePanel>
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
    <DraggablePanel onClose={onClose}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 20px" }}>
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
    </DraggablePanel>
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
  const [helpOpen,     setHelpOpen]     = useState(false);
  const [dataActivityOpen, setDataActivityOpen] = useState(false);
  const [termsOpen,    setTermsOpen]    = useState(false);
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
          onEditProfile={() => setAccountOpen(true)}
          onPrivacy={() => setPrivacyOpen(true)}
          onAbout={() => setAboutOpen(true)}
          onHelp={() => setHelpOpen(true)}
          onTerms={() => setTermsOpen(true)}
          onNotifications={() => setNotifsOpen(true)}
          onSecurity={() => setSecurityOpen(true)}
          onDataActivity={() => setDataActivityOpen(true)}
        />
      )}
      {accountOpen  && <AccountPanel  onClose={() => setAccountOpen(false)}/>}
      {privacyOpen  && <PrivacyPanel  onClose={() => setPrivacyOpen(false)}/>}
      {aboutOpen    && <AboutPanel    onClose={() => setAboutOpen(false)}/>}
      {helpOpen     && <HelpPanel     onClose={() => setHelpOpen(false)}/>}
      {dataActivityOpen && <DataActivityPanel onClose={() => setDataActivityOpen(false)}/>}
      {termsOpen    && <TermsPanel    onClose={() => setTermsOpen(false)}/>}
      {notifsOpen   && <NotificationsPanel onClose={() => setNotifsOpen(false)}/>}
      {securityOpen && <SecurityPanel onClose={() => setSecurityOpen(false)}/>}
    </>
  );
}
