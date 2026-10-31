export type Puzzle = {
  size: number;          // grid is size x size
  oddIndex: number;      // which tile is different
  seconds: number;       // how long the viewer gets
  label: string;         // on-screen instruction
  render: (odd: boolean) => { text?: string; color: string; textColor?: string };
};

// Tiny deterministic PRNG so renders are reproducible.
const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

const pick = (size: number, seed: number) =>
  Math.floor(seeded(seed)() * size * size);

export const PUZZLES: Puzzle[] = [
  {
    size: 5,
    oddIndex: pick(5, 7),
    seconds: 5,
    label: "Find the 6",
    render: (odd) => ({
      text: odd ? "6" : "9",
      color: "#1e293b",
      textColor: "#f8fafc",
    }),
  },
  {
    size: 7,
    oddIndex: pick(7, 42),
    seconds: 5,
    label: "Find the Q",
    render: (odd) => ({
      text: odd ? "Q" : "O",
      color: "#312e81",
      textColor: "#fde68a",
    }),
  },
  {
    size: 9,
    oddIndex: pick(9, 99),
    seconds: 6,
    label: "Find the different color",
    render: (odd) => ({
      color: odd ? "hsl(152 70% 43%)" : "hsl(152 70% 40%)",
    }),
  },
];
