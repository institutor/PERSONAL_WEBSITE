/**
 * The hero → TRAJECTORY lens, v2.1. A fixed lens at mid-screen while the page
 * keeps scrolling beneath it: the period flies there itself (the lens slot is
 * one of its marks), spinning into a circle; at p = travelEnd it hands over to
 * a bone disk (A) that blends onto the lens centre and grows exponentially; an
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
  travelEnd: 0.15, // the actor reaches the lens slot; disk A takes over
  handoffEase: 0.07, // p over which disk A blends from the actor's box to the centre
  handoffTime: 0.12, // s: the fastest that blend may go (time constant), however hard the flick
  lensSlotDepart: 0.4, // the (hidden) actor leaves the lens slot for the O
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

/** The lens slot's dwell window, in scroll px (the actor's mark at the centre). */
export function lensSlotRange(s0: number, s1: number): { arrive: number; depart: number } {
  return { arrive: s0 + (s1 - s0) * LENS.travelEnd, depart: s0 + (s1 - s0) * LENS.lensSlotDepart };
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

/** Disk A: rTravel at the handoff, then exponential growth to cover / K³
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

/** 0 → 1 as disk A moves from the actor's live box onto the lens centre. */
export function handoffBlend(p: number): number {
  return smoothstep((p - LENS.travelEnd) / LENS.handoffEase);
}

/** How far disk A has blended from the actor's captured shape onto the lens
    centre: the scroll blend restarted from the p at which the shape was taken
    (`blendAtCapture` = handoffBlend there), but never faster than an ease of
    time constant handoffTime since the capture — a strong flick crosses the
    whole 0.15 → 0.22 window in a frame or two. 1 once (nearly) settled. */
export function handoffMix(p: number, blendAtCapture: number, elapsed: number): number {
  const byScroll =
    blendAtCapture >= 1 ? 1 : Math.max(0, (handoffBlend(p) - blendAtCapture) / (1 - blendAtCapture));
  const byTime = 1 - Math.exp(-Math.max(0, elapsed) / LENS.handoffTime);
  const mix = Math.min(byScroll, byTime);
  return mix > 0.995 ? 1 : mix;
}

/** The actor flies the first leg itself, then reappears at the O (from actorReturn). */
export function actorVisible(p: number): boolean {
  return p < LENS.travelEnd || p >= LENS.actorReturn;
}

/** Whether the whole O slot lies inside the open window (its centre `oOffset`
    px from the lens centre on the same column): the actor reappears only
    there, so it never pops up on a ring outside the page. */
export function oInWindow(oOffset: number, slotHalf: number, rWindow: number): boolean {
  return rWindow > 0 && Math.abs(oOffset) + slotHalf <= rWindow;
}

/** An angle folded into [−45°, 45°): a rounded square looks the same every 90°. */
export function wrap90(deg: number): number {
  return ((((deg + 45) % 90) + 90) % 90) - 45;
}
