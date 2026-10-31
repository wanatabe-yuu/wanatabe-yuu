import React from "react";
import { AbsoluteFill } from "remotion";

const FONT = "'DejaVu Sans', 'Liberation Sans', sans-serif";
const SIZE = 800;

// 3x3 grid of "9" tiles, one glowing "6": the channel's visual signature.
export const Avatar: React.FC<{ showCircleGuide?: boolean }> = ({ showCircleGuide = false }) => {
  const n = 3;
  const gap = 22;
  const grid = 480;
  const tile = (grid - gap * (n - 1)) / n;
  const odd = 4; // center tile
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 35%, #26336b 0%, #0b1020 60%, #05070f 100%)",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
      }}
    >
      {/* soft glow behind the grid */}
      <div
        style={{
          position: "absolute",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(250,204,21,0.22) 0%, rgba(250,204,21,0) 65%)",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${n}, ${tile}px)`,
          gap,
          transform: "rotate(-6deg)",
        }}
      >
        {Array.from({ length: n * n }).map((_, i) => {
          const isOdd = i === odd;
          return (
            <div
              key={i}
              style={{
                width: tile,
                height: tile,
                borderRadius: tile * 0.2,
                background: isOdd ? "#facc15" : "#1e293b",
                color: isOdd ? "#111827" : "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: tile * 0.66,
                lineHeight: 1,
                boxShadow: isOdd
                  ? "0 0 40px 14px rgba(250,204,21,0.75), 0 10px 0 rgba(0,0,0,0.35)"
                  : "0 10px 0 rgba(0,0,0,0.4)",
                transform: isOdd ? "scale(1.12)" : "none",
                zIndex: isOdd ? 2 : 1,
              }}
            >
              {isOdd ? "6" : "9"}
            </div>
          );
        })}
      </div>
      {showCircleGuide && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            boxShadow: `0 0 0 ${SIZE}px rgba(0,0,0,0.6)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const AVATAR_SIZE = SIZE;
