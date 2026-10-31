import React from "react";
import { AbsoluteFill } from "remotion";

const FONT = "'DejaVu Sans', 'Liberation Sans', sans-serif";
export const TC_SIZE = 800;

// Regular hexagon points (flat top) centered at cx,cy with radius r.
const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 })
    .map((_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    })
    .join(" ");

export const ToughnessAvatar: React.FC<{ variant?: "full" | "monogram"; showCircleGuide?: boolean }> = ({
  variant = "full",
  showCircleGuide = false,
}) => {
  const c = TC_SIZE / 2;
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 35%, #26336b 0%, #0b1020 60%, #05070f 100%)",
        fontFamily: FONT,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={TC_SIZE} height={TC_SIZE} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="22" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde047" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {/* glow halo */}
        <polygon points={hex(c, c, 300)} fill="rgba(250,204,21,0.35)" filter="url(#glow)" />
        {/* outer gold hexagon */}
        <polygon points={hex(c, c, 300)} fill="url(#gold)" />
        {/* inner dark hexagon */}
        <polygon points={hex(c, c, 262)} fill="#0f172a" />
        {/* thin inner gold ring */}
        <polygon points={hex(c, c, 240)} fill="none" stroke="#facc15" strokeWidth={4} opacity={0.55} />
      </svg>

      {variant === "full" ? (
        <div style={{ position: "relative", textAlign: "center", color: "white", lineHeight: 1 }}>
          <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: 2, color: "#facc15" }}>TOUGHNESS</div>
          <div
            style={{
              marginTop: 10,
              fontSize: 46,
              fontWeight: 900,
              letterSpacing: 2,
              background: "#facc15",
              color: "#0f172a",
              padding: "10px 24px",
              borderRadius: 12,
              display: "inline-block",
            }}
          >
            CHALLENGE
          </div>
          <div style={{ marginTop: 24, fontSize: 22, fontWeight: 700, letterSpacing: 3, color: "rgba(255,255,255,0.75)" }}>
            ARE YOU TOUGH ENOUGH?
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", textAlign: "center", color: "white", lineHeight: 1 }}>
          <div style={{ fontSize: 230, fontWeight: 900, letterSpacing: -12, color: "#facc15", textShadow: "0 12px 0 #92400e" }}>
            TC
          </div>
          <div style={{ marginTop: 4, fontSize: 24, fontWeight: 800, letterSpacing: 4, color: "rgba(255,255,255,0.85)" }}>
            TOUGHNESS CHALLENGE
          </div>
        </div>
      )}

      {showCircleGuide && (
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", boxShadow: `0 0 0 ${TC_SIZE}px rgba(0,0,0,0.6)` }} />
      )}
    </AbsoluteFill>
  );
};
