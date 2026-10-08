/** Words of a heading, for per-word reveal. Whitespace is collapsed; punctuation stays its own token. */
export function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export type OdoCol = { digit: number } | { static: string };

/** Odometer columns for a display stat: digits roll, everything else (+ % , . M K) stays put. */
export function digitColumns(value: string): OdoCol[] {
  return [...value].map((ch) => (/[0-9]/.test(ch) ? { digit: Number(ch) } : { static: ch }));
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
// avoid -0 leaking into results (and into toEqual)
const z = (n: number) => (n === 0 ? 0 : n);

/** 3D tilt toward the pointer: rx/ry in degrees within ±max, gx/gy the shine centre in %. */
export function tiltFor(
  px: number,
  py: number,
  rect: { left: number; top: number; width: number; height: number },
  max: number,
): { rx: number; ry: number; gx: number; gy: number } {
  const nx = clamp(((px - rect.left) / rect.width) * 2 - 1, -1, 1);
  const ny = clamp(((py - rect.top) / rect.height) * 2 - 1, -1, 1);
  return {
    rx: z(-ny * max),
    ry: z(nx * max),
    gx: ((nx + 1) / 2) * 100,
    gy: ((ny + 1) / 2) * 100,
  };
}

/** Magnetic pull toward a pointer offset (dx, dy) from the element's centre; nothing beyond `radius`. */
export function magnetOffset(dx: number, dy: number, radius: number, max: number): { x: number; y: number } {
  const d = Math.hypot(dx, dy);
  if (d === 0 || d >= radius) return { x: 0, y: 0 };
  const pull = Math.min(max, d) * (1 - d / radius);
  return { x: z((dx / d) * pull), y: z((dy / d) * pull) };
}
