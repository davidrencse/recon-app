"use client";

import { useEffect, useRef } from "react";

interface DashboardModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function DashboardModal({ title, children, onClose }: DashboardModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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
        position: "absolute",
        inset: 0,
        zIndex: 60,
        background: "#080808",
        display: "flex",
        flexDirection: "column",
        outline: "none",
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      {/* Drag handle */}
      <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 8px", flexShrink: 0 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0", letterSpacing: -0.3 }}>
          {title}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, padding: "18px 18px 48px", overflowY: "auto", scrollbarWidth: "none" }}>
        {children}
      </div>
    </div>
  );
}
