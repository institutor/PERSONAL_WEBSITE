/**
 * The hero → TRAJECTORY lens, v2. A fixed lens at mid-screen while the page
 * keeps scrolling beneath it: leaving the full stop, the square becomes a
 * bone disk (A) that travels to the lens centre and grows exponentially; an
 * ink disk (B), a bone disk (C) and finally the page itself (the window
 * onto Trajectory) appear inside it in turn, each settling to half the
 * radius of the one outside (K = 0.5), so the window covers the viewport
 * exactly when TRAJECTORY's O reaches the centre (p = 1). The actor grows
 * back into the O as one more bone circle.
 *
 * Every function here is a pure function of the lens progress `p` (0..1 over
 * the scroll from S0 to that moment), so the whole thing scrubs and reverses
 * with the scrollbar.
 */

export const LENS = {
  startVh: 0.2, // S0 = startVh × viewportHeight
  travelEnd: 0.15, // disk A reaches the centre, fully round, radius rTravel
  K: 0.5, // each inner circle settles to K × the one outside
  rTravelFrac: 0.08, // rTravel = rTravelFrac × min(vw, vh)
  ramp: { b: 0.25, c: 0.42, window: 0.6 }, // p at which each inner circle appears
  rampWidth: 0.12, // p it takes to catch up to its ratio
  actorReturn: 0.72, // actor visible again (grows in at the O)
} as const;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function lensProgress(scrollY: number, s0: number, s1: number): number {
  if (s1 <= s0) return 0;
  return clamp01((scrollY - s0) / (s1 - s0));
}

/** S1: the scroll at which the O's centre reaches mid-screen. */
export function lensEnd(oCentreDocY: number, viewportHeight: number): number {
  return oCentreDocY - viewportHeight / 2;
}

/** Radius of a disk centred at (cx, cy) that hides the whole viewport. */
export function coverRadius(cx: number, cy: number, vw: number, vh: number): number {
  const dx = Math.max(cx, vw - cx);
  const dy = Math.max(cy, vh - cy);
  return Math.hypot(dx, dy) + 2;
}

export function smoothstep(x: number): number {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
}

/** Disk A: rTravel through the handoff, then exponential growth to cover / K³
    (so the window, K³ of it, is exactly `cover` at p = 1). */
export function outerRadius(p: number, rTravel: number, cover: number): number {
  if (p <= LENS.travelEnd) return rTravel;
  const end = cover / LENS.K ** 3;
  return rTravel * (end / rTravel) ** ((p - LENS.travelEnd) / (1 - LENS.travelEnd));
}

export interface LensRadii {
  a: number;
  b: number;
  c: number;
  window: number;
}

/** Nested radii: a ≥ b ≥ c ≥ window for every p (K < 1, ramps ≤ 1). */
export function lensRadii(p: number, rTravel: number, cover: number): LensRadii {
  const { K, ramp, rampWidth } = LENS;
  const a = outerRadius(p, rTravel, cover);
  const grown = (start: number) => smoothstep((p - start) / rampWidth);
  return {
    a,
    b: a * K * grown(ramp.b),
    c: a * K ** 2 * grown(ramp.c),
    window: a * K ** 3 * grown(ramp.window),
  };
}

/** Once a disk covers the viewport nothing larger looks different; clamping
    keeps every disk at scale ≤ 1 (crisp edges). */
export function renderRadius(r: number, cover: number): number {
  return Math.min(r, cover);
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

/** Whether the whole O slot lies inside the open window (its centre `oOffset`
    px from the lens centre on the same column): the actor reappears only
    there, so it never pops up on a ring outside the page. */
export function oInWindow(oOffset: number, slotHalf: number, rWindow: number): boolean {
  return rWindow > 0 && Math.abs(oOffset) + slotHalf <= rWindow;
}
