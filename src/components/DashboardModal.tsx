"use client";

import { useEffect, useRef } from "react";

const BG      = "#131313";
const SURFACE = "#1c1c1c";
const LINE    = "rgba(255,255,255,0.05)";
const BORDER  = "rgba(255,255,255,0.09)";
const T1      = "#f2f2f2";
const T2      = "#9a9a9a";

interface DashboardModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function DashboardModal({ title, children, onClose }: DashboardModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    containerRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      ref={containerRef}
      tabIndex={-1}
      style={{
        position: "absolute", inset: 0, zIndex: 60,
        background: BG, display: "flex", flexDirection: "column",
        outline: "none", overflowY: "auto", scrollbarWidth: "none",
        paddingTop: "max(env(safe-area-inset-top), 20px)"
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px 14px", borderBottom: `1px solid ${LINE}`, flexShrink: 0,
      }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: T1, letterSpacing: -0.4 }}>{title}</span>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: SURFACE, border: `1px solid ${BORDER}`,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", color: T2, flexShrink: 0, fontFamily: "inherit",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "18px 20px 48px", overflowY: "auto", scrollbarWidth: "none" }}>
        {children}
      </div>
    </div>
  );
}
