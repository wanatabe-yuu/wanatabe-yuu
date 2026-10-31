import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { PUZZLES, Puzzle } from "./puzzles";

export const FPS = 30;
const INTRO = 15;          // tiles pop in
const REVEAL = 45;         // answer shown
const HOOK = 45;           // hook text over round 1
const END = 90;            // end card

const roundLength = (p: Puzzle) => INTRO + p.seconds * FPS + REVEAL;
const roundStarts = PUZZLES.reduce<number[]>((acc, p, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + roundLength(PUZZLES[i - 1]));
  return acc;
}, []);
const ROUNDS_TOTAL = roundStarts[PUZZLES.length - 1] + roundLength(PUZZLES[PUZZLES.length - 1]);
export const TOTAL_FRAMES = ROUNDS_TOTAL + END;

const FONT = "'DejaVu Sans', 'Liberation Sans', sans-serif";

const Sfx: React.FC<{ name: string; at: number; volume?: number }> = ({ name, at, volume = 1 }) => (
  <Sequence from={at} durationInFrames={FPS * 2} name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx-${name}.wav`)} volume={volume} />
  </Sequence>
);

/* ---------- background ---------- */
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const x = 50 + Math.sin(frame / 60) * 20;
  const y = 40 + Math.cos(frame / 80) * 15;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, #1f2a55 0%, #0b1020 55%, #05070f 100%)`,
      }}
    />
  );
};

/* ---------- progress bar across the top ---------- */
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [0, TOTAL_FRAMES], [0, 100], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 14, background: "rgba(255,255,255,0.08)" }}>
      <div style={{ width: `${w}%`, height: "100%", background: "linear-gradient(90deg,#22d3ee,#a78bfa)" }} />
    </div>
  );
};

/* ---------- countdown ring ---------- */
const Timer: React.FC<{ seconds: number; frame: number }> = ({ seconds, frame }) => {
  const total = seconds * FPS;
  const left = Math.max(0, Math.ceil((total - frame) / FPS));
  const pct = interpolate(frame, [0, total], [1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const r = 70;
  const c = 2 * Math.PI * r;
  const urgent = left <= 2;
  const pulse = urgent ? 1 + Math.sin((frame / FPS) * Math.PI * 4) * 0.06 : 1;
  return (
    <div style={{ position: "absolute", bottom: 210, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 170, height: 170, transform: `scale(${pulse})` }}>
        <svg width={170} height={170} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={85} cy={85} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={14} fill="none" />
          <circle
            cx={85} cy={85} r={r}
            stroke={urgent ? "#f43f5e" : "#22d3ee"}
            strokeWidth={14} fill="none" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontFamily: FONT, fontWeight: 800, fontSize: 84,
        }}>
          {left}
        </div>
      </div>
    </div>
  );
};

/* ---------- one round ---------- */
const Round: React.FC<{ puzzle: Puzzle; index: number }> = ({ puzzle, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const countdownStart = INTRO;
  const revealStart = INTRO + puzzle.seconds * FPS;
  const revealed = frame >= revealStart;

  const gridPx = 960;
  const gap = puzzle.size > 6 ? 10 : 16;
  const tile = (gridPx - gap * (puzzle.size - 1)) / puzzle.size;
  const fontSize = tile * 0.62;

  const revealT = spring({ frame: frame - revealStart, fps, config: { damping: 12, stiffness: 160 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      {/* sound: whoosh on grid entry, ticks per second (urgent for last 2), ding on reveal */}
      <Sfx name="whoosh" at={0} volume={0.65} />
      {Array.from({ length: puzzle.seconds }).map((_, i) => (
        <Sfx
          key={i}
          name={i >= puzzle.seconds - 2 ? "tick-urgent" : "tick"}
          at={countdownStart + i * FPS}
          volume={i >= puzzle.seconds - 2 ? 1 : 0.7}
        />
      ))}
      <Sfx name="ding" at={revealStart} volume={1} />

      {/* header */}
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 36, letterSpacing: 6 }}>
          ROUND {index + 1} / {PUZZLES.length}
        </div>
        <div style={{ color: "white", fontWeight: 900, fontSize: 72, marginTop: 10 }}>
          {revealed ? "Did you see it?" : puzzle.label}
        </div>
      </div>

      {/* grid */}
      <div style={{
        position: "absolute", top: 440, left: (1080 - gridPx) / 2, width: gridPx,
        display: "grid", gridTemplateColumns: `repeat(${puzzle.size}, ${tile}px)`, gap,
      }}>
        {Array.from({ length: puzzle.size * puzzle.size }).map((_, i) => {
          const odd = i === puzzle.oddIndex;
          const look = puzzle.render(odd);
          // staggered pop-in, diagonal wave
          const row = Math.floor(i / puzzle.size), col = i % puzzle.size;
          const delay = (row + col) * 1.2;
          const pop = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 200 } });
          const scale = odd && revealed ? 1 + revealT * 0.25 : pop;
          const dim = revealed && !odd ? interpolate(revealT, [0, 1], [1, 0.25]) : 1;
          return (
            <div key={i} style={{
              width: tile, height: tile, borderRadius: tile * 0.18,
              background: look.color, color: look.textColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize, lineHeight: 1,
              transform: `scale(${scale})`, opacity: dim,
              boxShadow: odd && revealed
                ? `0 0 ${30 * revealT}px ${12 * revealT}px rgba(250,204,21,0.9)`
                : "0 6px 0 rgba(0,0,0,0.35)",
              outline: odd && revealed ? `${6 * revealT}px solid #facc15` : "none",
              zIndex: odd ? 2 : 1,
            }}>
              {look.text}
            </div>
          );
        })}
      </div>

      {/* timer */}
      {!revealed && frame >= countdownStart && <Timer seconds={puzzle.seconds} frame={frame - countdownStart} />}
    </AbsoluteFill>
  );
};

/* ---------- hook (first 1.5s) ---------- */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 10, stiffness: 180 } });
  const out = interpolate(frame, [HOOK - 10, HOOK], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 318, opacity: out, zIndex: 10 }}>
      <Sfx name="thud" at={2} volume={1} />
      <div style={{
        transform: `scale(${inS}) rotate(-2deg)`,
        background: "#facc15", color: "#111827", fontFamily: FONT, fontWeight: 900,
        fontSize: 54, padding: "16px 40px", borderRadius: 22, textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      }}>
        Only 1% spot all 3
      </div>
    </AbsoluteFill>
  );
};

/* ---------- end card ---------- */
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const bob = Math.sin((frame / fps) * Math.PI * 2) * 10;
  const rows = [
    ["3 / 3", "Genius", "#22c55e"],
    ["2 / 3", "Sharp eyes", "#38bdf8"],
    ["0-1 / 3", "Watch again", "#f43f5e"],
  ];
  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center", justifyContent: "center", color: "white" }}>
      <Sfx name="riser" at={0} volume={0.8} />
      <Sfx name="ding" at={26} volume={0.9} />
      <div style={{ fontSize: 90, fontWeight: 900, transform: `scale(${s})` }}>Your score?</div>
      <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 24 }}>
        {rows.map(([score, label, color], i) => {
          const t = spring({ frame: frame - 8 * (i + 1), fps, config: { damping: 14 } });
          return (
            <div key={score} style={{
              display: "flex", alignItems: "center", gap: 30, width: 760, padding: "26px 40px",
              borderRadius: 28, background: "rgba(255,255,255,0.08)",
              transform: `translateX(${(1 - t) * 300}px)`, opacity: t,
            }}>
              <div style={{ fontSize: 56, fontWeight: 900, color, width: 240 }}>{score}</div>
              <div style={{ fontSize: 48, fontWeight: 700 }}>{label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 90, fontSize: 52, fontWeight: 800, color: "#facc15", transform: `translateY(${bob}px)` }}>
        Comment your score ↓
      </div>
      <div style={{ marginTop: 30, fontSize: 40, color: "rgba(255,255,255,0.7)" }}>Part 2 tomorrow</div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const OddOneOut: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile("music.mp3")} volume={0.5} />
    <Background />
    {PUZZLES.map((p, i) => (
      <Sequence key={i} from={roundStarts[i]} durationInFrames={roundLength(p)}>
        <Round puzzle={p} index={i} />
      </Sequence>
    ))}
    <Sequence from={0} durationInFrames={HOOK}>
      <Hook />
    </Sequence>
    <Sequence from={ROUNDS_TOTAL} durationInFrames={END}>
      <EndCard />
    </Sequence>
    <Progress />
  </AbsoluteFill>
);
