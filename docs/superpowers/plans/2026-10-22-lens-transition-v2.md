# Lens Transition v2 (rework) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Intended executor:** the Opus 5.5 (extra-high) session that built lens v1 on
> branch `claude/lens-transition-91036c`. This is a delta plan on top of that
> implementation. Read the v2 spec first.

**Goal:** Rework the lens so the page keeps scrolling while it plays, the lens sits at mid-screen where TRAJECTORY's O lands, the circles grow exponentially with a fixed 2:1 nesting ratio, and the whole thing runs ~1.4 viewports instead of 2.4.

**Architecture:** Drop the sticky stage and spacer; put an 85 svh empty gap before a normal-flow Trajectory. `LensFx` keeps its three fixed disks but centres them at (O's x, viewport mid-height), ends the lens exactly when the O's centre reaches mid-height, drives radii from an exponential outer radius with K = 0.5 ratios and short appearance ramps, clamps rendered radii to the cover radius, and rewrites the window clip in the window's own (scrolling) coordinates every frame. `SquareActor` loses the sticky-shift logic; the hide/grow-in protocol stays.

**Tech Stack:** unchanged (Next.js 16.2.12, React 19.2, TypeScript, Tailwind v4, GSAP 3.15, Lenis, Node 24 test runner).

**Spec:** `docs/superpowers/specs/2026-10-22-lens-transition-design.md` (v2). v1 plan for history: `docs/superpowers/plans/2026-10-22-lens-transition.md`.

## Global Constraints

- Constants exactly: `S0 = 0.2 × vh`; `--lens-gap: 85svh`; travel 0 → 0.15; `K = 0.5`; `rT = 0.08 × min(vw, vh)`; `REnd = cover / K³`; ramps start b 0.25 / c 0.42 / window 0.60, width 0.12, smoothstep; `actorReturn = 0.72`; `dwell = 0.12`.
- Lens centre y is `vh / 2`; S1 is derived from the O slot's document position, never hard-coded.
- Rendered disk radius never exceeds `cover` (scale ≤ 1).
- Nothing in the hero, EXPERIENCE, deck or Contact changes. Z-order unchanged.
- Before any edit: sync the branch with `main` (the hero session added commits there) using the harness's `sync_with_base_branch`; resolve nothing by hand unless it reports conflicts.
- Copy the v2 spec and this plan from the main checkout (`/Users/jiewenhuang/PERSONAL_WEBSITE/docs/superpowers/{specs/2026-10-22-lens-transition-design.md,plans/2026-10-22-lens-transition-v2.md}`) into the worktree and commit them with Task 1. Do not edit the main checkout.
- Commit style as before; never push or merge — the planning session merges.

## Environment

Same as v1: `/bin/zsh -lc '…'` for node commands; your dev server on port 3002; `node --test lib/*.test.ts`; drive scroll with `window.scrollTo` + ~900 ms settle.

## Review Focus

1. **Window clip follows the scrolling section**: at p = 0.8, `clip-path`'s `at … y` must equal `vh/2 − windowRect.top` (changes every frame). → Task 3 step 4 check.
2. **S1 lands the O at mid-height**: at `scrollY = S1` the O slot's viewport centre y is within 2 px of `vh / 2` at 1440 × 900 and 390 × 844. → Task 3 step 4; `lensEnd` test, Task 2.
3. **Ratios hold after the ramps and never cross**: `b/a = 0.5` for p ≥ 0.37, `c/b = 0.5` for p ≥ 0.54, `window/c = 0.5` for p ≥ 0.72; nested and monotone for all p. → Task 2 tests.
4. **Hero fade vs disk A**: the disk must start on the actor's square at the full stop (which does not move: the hero is sticky) and cover mid-screen before the hero is gone. → Task 3 step 4 screenshots at 0.3 and 0.6 svh.
5. **Reduced motion / no-JS**: gap collapsed, Trajectory directly after the hero, no clip. → Task 1 CSS; code-read check.

---

### Task 1: Un-pin Trajectory; gap instead of stage

**Files:**
- Modify: `components/resume/Sections.tsx` (Trajectory markup)
- Modify: `components/fx/SquareActor.tsx` (remove `lensShift` and the stuck-shift measurement added in v1; keep `data-sq-dwell` and the hide/grow-in protocol)
- Modify: `app/globals.css` (replace the v1 lens-stage block)
- Copy in + add: the two docs named in Global Constraints

**Interfaces (DOM contract for Task 3):**

```html
<div data-lens-gap aria-hidden="true" style="height: var(--lens-gap)"></div>
<section id="trajectory" data-band class="relative z-[2] min-h-svh overflow-hidden text-bone">
  <div data-lens-window class="relative min-h-svh bg-ink px-4 py-24 sm:px-6 sm:py-28">
    <!-- TrajectoryContent, unchanged; GapTitle dwell={0.12} -->
  </div>
</section>
```

CSS (replaces the v1 `[data-lens-wrap]` / `[data-lens-stage]` / `[data-lens-spacer]` rules):

```css
/* ------------------------------------------------------- lens ---------- */
:root { --lens-gap: 85svh; }
[data-lens-window] { clip-path: none; }     /* LensFx drives it */
@media (prefers-reduced-motion: reduce) {
  [data-lens-gap] { display: none; }
  [data-lens-window] { clip-path: none !important; }
}
```

- [ ] **Step 1:** `sync_with_base_branch`; then `git log --oneline -3` shows main's latest hero commits on your branch.
- [ ] **Step 2:** Rewrite Trajectory to the DOM above (delete wrapper, anchor span, sticky section, spacer; `id` and `data-band` back on the section; gap div before it in `Resume()`); set `dwell={0.12}`.
- [ ] **Step 3:** `SquareActor`: delete `lensShift` and the v1 "subtract how far Trajectory is stuck" code; `measure()` is back to `top = rect.top + scrollY − heroShift(el)` plus the `dwell` term.
- [ ] **Step 4:** CSS swap as above; remove `--lens-length` everywhere (`grep -rn "lens-length\|lens-wrap\|lens-stage\|lens-spacer\|lensShift" app components lib` → nothing).
- [ ] **Step 5:** `/bin/zsh -lc 'npm run lint && npx tsc --noEmit && node --test lib/*.test.ts'` → clean (v1 lens-math tests may still pass; Task 2 replaces them).
- [ ] **Step 6:** Browser: Trajectory scrolls normally, appearing 0.85 svh after the hero's end; TopBar → TRAJECTORY lands on the section top. (The v1 LensFx will misbehave until Task 3 — ignore it here.)
- [ ] **Step 7:** Commit: `git add -A docs components/resume/Sections.tsx components/fx/SquareActor.tsx app/globals.css && git commit -m "Lens v2: Trajectory scrolls freely behind an 85svh gap; sticky stage removed"`

---

### Task 2: Lens math v2

**Files:**
- Modify: `lib/lens-math.ts`, `lib/lens-math.test.ts` (replace v1 contents)

**Interfaces (used by Task 3):**

```ts
export const LENS = {
  startVh: 0.2, travelEnd: 0.15, K: 0.5, rTravelFrac: 0.08,
  ramp: { b: 0.25, c: 0.42, window: 0.6 }, rampWidth: 0.12, actorReturn: 0.72,
} as const;
export function lensProgress(scrollY: number, s0: number, s1: number): number;      // as v1
export function lensEnd(oCentreDocY: number, viewportHeight: number): number;      // oCentreDocY − viewportHeight / 2
export function coverRadius(cx: number, cy: number, vw: number, vh: number): number; // as v1
export function smoothstep(x: number): number;                                      // clamp, 3x² − 2x³
export function outerRadius(p: number, rTravel: number, cover: number): number;     // p ≤ travelEnd → rTravel; else rTravel·(REnd/rTravel)^((p−0.15)/0.85), REnd = cover / K³
export interface LensRadii { a: number; b: number; c: number; window: number; }
export function lensRadii(p: number, rTravel: number, cover: number): LensRadii;    // a = outerRadius; b = a·K·ramp_b; c = a·K²·ramp_c; window = a·K³·ramp_window; ramp_x = smoothstep((p − LENS.ramp.x) / rampWidth)
export function renderRadius(r: number, cover: number): number;                     // min(r, cover)
export function diskATravel(p: number): { u: number; round: number };              // as v1 but over travelEnd 0.15
export function actorVisible(p: number): boolean;                                   // p ≤ 0 || p ≥ 0.72
```

- [ ] **Step 1: Replace the tests** with:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { LENS, actorVisible, coverRadius, diskATravel, lensEnd, lensProgress, lensRadii, outerRadius, renderRadius, smoothstep } from "./lens-math.ts";

const close = (x: number, y: number, eps = 1e-6) => Math.abs(x - y) < eps;

test("progress and end of lens", () => {
  assert.equal(lensProgress(100, 154, 1233), 0);
  assert.equal(lensProgress(1233, 154, 1233), 1);
  assert.equal(lensProgress(500, 1000, 1000), 0);
  assert.equal(lensEnd(1617, 768), 1233);
});

test("cover radius reaches the farthest corner", () => {
  assert.ok(close(coverRadius(655, 384, 1024, 768), Math.hypot(655, 384) + 2));
});

test("smoothstep", () => {
  assert.equal(smoothstep(-1), 0); assert.equal(smoothstep(0), 0); assert.equal(smoothstep(0.5), 0.5); assert.equal(smoothstep(1), 1); assert.equal(smoothstep(2), 1);
});

test("outer radius: holds at rTravel, then grows exponentially to cover / K^3", () => {
  assert.equal(outerRadius(0.1, 61, 1300), 61);
  assert.equal(outerRadius(LENS.travelEnd, 61, 1300), 61);
  assert.ok(close(outerRadius(1, 61, 1300), 1300 / LENS.K ** 3, 1e-6));
  const mid = outerRadius(0.575, 61, 1300);            // halfway in p → geometric mean in radius
  assert.ok(close(mid, Math.sqrt(61 * (1300 / LENS.K ** 3)), 1e-6));
});

test("ratios hold after the ramps", () => {
  for (const p of [0.37, 0.5, 0.8, 1]) { const r = lensRadii(p, 61, 1300); assert.ok(close(r.b / r.a, LENS.K), `b/a at ${p}`); }
  for (const p of [0.54, 0.8, 1]) { const r = lensRadii(p, 61, 1300); assert.ok(close(r.c / r.b, LENS.K), `c/b at ${p}`); }
  for (const p of [0.72, 0.9, 1]) { const r = lensRadii(p, 61, 1300); assert.ok(close(r.window / r.c, LENS.K), `window/c at ${p}`); }
});

test("inner circles are absent before their ramps and the window covers at 1", () => {
  const r = lensRadii(0.2, 61, 1300);
  assert.deepEqual([r.b, r.c, r.window], [0, 0, 0]);
  assert.equal(lensRadii(0.5, 61, 1300).window, 0);
  assert.ok(close(lensRadii(1, 61, 1300).window, 1300, 1e-6));
});

test("nested and monotone for every p", () => {
  let prev = lensRadii(0, 61, 1300);
  for (let i = 1; i <= 200; i++) {
    const p = i / 200; const r = lensRadii(p, 61, 1300);
    assert.ok(r.a >= r.b && r.b >= r.c && r.c >= r.window, `crossed at ${p}`);
    assert.ok(r.a >= prev.a && r.b >= prev.b && r.c >= prev.c && r.window >= prev.window, `shrank at ${p}`);
    prev = r;
  }
});

test("rendered radius is clamped to cover", () => {
  assert.equal(renderRadius(5000, 1300), 1300);
  assert.equal(renderRadius(300, 1300), 300);
});

test("disk A travel and actor visibility", () => {
  assert.deepEqual(diskATravel(0), { u: 0, round: 0 });
  assert.deepEqual(diskATravel(LENS.travelEnd), { u: 1, round: 1 });
  assert.equal(diskATravel(LENS.travelEnd / 2).u, 0.5);
  assert.equal(actorVisible(0), true); assert.equal(actorVisible(0.3), false); assert.equal(actorVisible(LENS.actorReturn), true);
});
```

- [ ] **Step 2:** Run → FAIL (missing exports). **Step 3:** Implement. **Step 4:** `/bin/zsh -lc 'node --test lib/*.test.ts && npx tsc --noEmit'` → PASS. Note: `lensRadii` at `p ≤ travelEnd` returns `a = rTravel` and zeros — during travel Task 3 overrides disk A's radius with the travel interpolation.
- [ ] **Step 5:** Commit: `git commit -am "Lens math v2: exponential outer radius, 2:1 nested rings, mid-screen end"`

---

### Task 3: LensFx v2

**Files:**
- Modify: `components/fx/LensFx.tsx`

Changes to the v1 controller:
- **measure()**: `oSlot` = first `[data-sq-slot]` inside `[data-lens-window]`; `cx = oRect.left + oRect.width / 2`; `cy = vh / 2`; `oCentreDocY = oRect.top + oRect.height / 2 + scrollY`; `s0 = LENS.startVh * vh`; `s1 = lensEnd(oCentreDocY, vh)`; `cover = coverRadius(cx, cy, vw, vh)`; `rTravel = LENS.rTravelFrac * Math.min(vw, vh)`; size disks to `2 × cover`. Drop every reference to wrap/stage/spacer.
- **tick()**: `p = lensProgress(scrollY, s0, s1)`; outside `(0, 1)` → disks hidden, actor attribute cleared, clip `circle(0px at cx cyLocal)` for p ≤ 0 and `none` for p ≥ 1. Inside: `radii = lensRadii(p, rTravel, cover)`; disk A during travel as v1 (handoff box → centre, square → circle, radius slot/2 → rTravel) else at centre with `renderRadius(radii.a, cover)`; B, C at centre with `renderRadius` of their radii (hidden while 0); window clip `circle(${renderRadius(radii.window, cover)}px at ${cx}px ${cy − windowRect.top}px)` where `windowRect = windowEl.getBoundingClientRect()` read this frame (skip identical writes); actor attribute per `actorVisible(p)`.
- Keep v1's rulings that still apply: handoff box only when entered from the hero side; update once at mount and first thing each frame; no lens within 0.4 vh of the top while the intro plays.

- [ ] **Step 1:** Implement. **Step 2:** `/bin/zsh -lc 'npm run lint && npx tsc --noEmit'` → clean.
- [ ] **Step 3: Replay (1024 × 768 and 1440 × 900)** at `innerHeight × {0.3, 0.6, 0.9, 1.1, 1.3, 1.5, 1.65, 1.9, 2.3}`: the page visibly moves between every frame (Trajectory content position changes); disk A starts on the square at the right end of JIEWEN and swells at mid-height; ink dot → bone dot → page open, each clearly smaller than the one outside; TRAJECTORY arrives inside the lens; at ≈ S1 the O is at mid-screen and the rings are gone; a bone circle grows into the O; later the actor flies to the 36 vh slot.
- [ ] **Step 4: Numbers** via `javascript_tool`: at `scrollY = S1` (read `s1` by scrolling until the clip becomes `none`): `document.querySelector('[data-lens-window] [data-sq-slot]').getBoundingClientRect()` centre y within 2 px of `innerHeight / 2` (Review Focus 2). At p ≈ 0.8: the clip's `at … y` equals `innerHeight / 2 − windowRect.top` ± 1 (Review Focus 1). Phone (390 × 844): same two checks.
- [ ] **Step 5:** Reverse scroll, reload at ≈ 1.0 svh, resize mid-lens: all as v1's criteria. Nav → TRAJECTORY: lens finished, circle in the O.
- [ ] **Step 6:** Commit: `git commit -am "Lens v2: fixed mid-screen lens, exponential rings, the page keeps scrolling"`

---

### Task 4: Verification and hand-back

- [ ] **Step 1:** `/bin/zsh -lc 'node --test lib/*.test.ts && npm run lint && npx tsc --noEmit && npm run build 2>&1 | tail -8'` → all pass.
- [ ] **Step 2:** Update the one-liner in `docs/motion-study.md` if it mentions pinning; commit `"Motion study: lens v2"`.
- [ ] **Step 3:** Report: branch name, commits, the measured S1 and lens length at 1440 × 900 and 390 × 844, anything deviating from the spec. Do not merge; the planning session merges into main.
