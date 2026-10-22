/**
 * The hero → TRAJECTORY lens. Leaving the full stop, the square becomes a
 * bone disk (A) that travels to TRAJECTORY's O and swells; an ink disk (B)
 * and a bone disk (C) grow inside it in turn, then the page itself (the ink
 * window) opens inside C, and the actor grows back into the O as one more
 * bone circle.
 *
 * Every function here is a pure function of the lens progress `p` (0..1 over
 * the scroll from S0 to the moment Trajectory unsticks), so the whole thing
 * scrubs and reverses with the scrollbar.
 */

export const LENS = {
  startVh: 0.2, // S0 = startVh × viewportHeight
  travelEnd: 0.18, // disk A reaches the centre, fully round
  start: { a: 0.18, b: 0.38, c: 0.56, window: 0.72 }, // p at which each radius starts growing
  reach: { a: 0.86, b: 0.92, c: 0.97, window: 1.0 }, // p at which each reaches `cover`
  actorReturn: 0.86, // actor visible again (grows in at the O)
  startDiameterFrac: 0.16, // disk A's diameter at travelEnd, × min(vw, vh)
  growthPower: 1.6,
} as const;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function lensProgress(scrollY: number, s0: number, s1: number): number {
  if (s1 <= s0) return 0;
  return clamp01((scrollY - s0) / (s1 - s0));
}

/** Radius of a disk centred at (cx, cy) that hides the whole viewport. */
export function coverRadius(cx: number, cy: number, vw: number, vh: number): number {
  const dx = Math.max(cx, vw - cx);
  const dy = Math.max(cy, vh - cy);
  return Math.hypot(dx, dy) + 2;
}

/** Ease-in growth inside [start..reach]: appears as a dot and accelerates. */
export function growth(p: number, start: number, reach: number): number {
  if (p <= start) return 0;
  if (p >= reach) return 1;
  return ((p - start) / (reach - start)) ** LENS.growthPower;
}

export interface LensRadii {
  a: number;
  b: number;
  c: number;
  window: number;
}

/** Nested radii (a ≥ b ≥ c ≥ window for every p: starts and reaches are ordered). */
export function lensRadii(p: number, startRadius: number, cover: number): LensRadii {
  const { start, reach } = LENS;
  return {
    a: startRadius + (cover - startRadius) * growth(p, start.a, reach.a),
    b: cover * growth(p, start.b, reach.b),
    c: cover * growth(p, start.c, reach.c),
    window: cover * growth(p, start.window, reach.window),
  };
}

const easeInOutQuad = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

/** Disk A's handoff flight: `u` along the path from the actor to the centre,
    `round` 0 (the actor's square) .. 1 (circle). */
export function diskATravel(p: number): { u: number; round: number } {
  const u = easeInOutQuad(clamp01(p / LENS.travelEnd));
  return { u, round: u };
}

/** The actor shows at the full stop (before the lens) and at the O (from actorReturn). */
export function actorVisible(p: number): boolean {
  return p <= 0 || p >= LENS.actorReturn;
}
