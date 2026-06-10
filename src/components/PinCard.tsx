"use client";

import { memo } from "react";
import type { Pin, PinCategory } from "../types/pin";

interface PinCardProps {
  pin: Pin;
  onClose: () => void;
}

const CATEGORY_LABEL: Record<PinCategory, string> = {
  trending: "Trending",
  cafes: "Cafés",
  nightlife: "Nightlife",
  pop: "Pop-up",
  crime_safety: "Crime & Safety",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function PinCard({ pin, onClose }: PinCardProps) {
  const openPost = () => window.open(pin.postUrl, "_blank", "noopener,noreferrer");
  const openDirections = () =>
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`,
      "_blank",
      "noopener,noreferrer"
    );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "#111",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "14px 14px 0 0",
        padding: "12px 16px 20px",
      }}
    >
      {/* drag handle */}
      <div
        style={{
          width: 36,
          height: 4,
          background: "#333",
          borderRadius: 2,
          margin: "0 auto 12px",
        }}
      />

      {/* close */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#222",
          border: "1px solid #333",
          color: "#aaa",
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ✕
      </button>

      {/* meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: "#000",
            background: "#fff",
            padding: "2px 7px",
            borderRadius: 4,
          }}
        >
          {CATEGORY_LABEL[pin.category].toUpperCase()}
        </span>
        <span style={{ fontSize: 12, color: "#666" }}>{relativeTime(pin.createdAt)}</span>
      </div>

      {/* place name */}
      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
        {pin.placeName}
      </div>

      {/* post text */}
      <div
        style={{
          fontSize: 14,
          color: "#bbb",
          lineHeight: 1.55,
          marginBottom: 10,
        }}
      >
        {pin.text}
      </div>

      {/* creator + confidence */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 12, color: "#777" }}>{pin.creatorHandle}</span>
        <span style={{ fontSize: 12, color: "#555" }}>
          {Math.round(pin.locationConfidence * 100)}% location confidence
        </span>
      </div>

      {/* actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={openPost}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            background: "#fff",
            color: "#000",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Open post
        </button>
        <button
          onClick={openDirections}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            background: "#1c1c1c",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            border: "1px solid #333",
            cursor: "pointer",
          }}
        >
          Directions
        </button>
      </div>
    </div>
  );
}

export default memo(PinCard);
