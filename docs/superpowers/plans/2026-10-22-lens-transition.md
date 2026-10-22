# Lens Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Intended executor:** Claude Opus 5.5 at extra-high effort. Read the spec,
> then this whole plan, then re-read `components/fx/SquareActor.tsx` and
> `components/fx/ScrollFx.tsx` in full before writing code.

**Goal:** Replace the SHIPPING / SUNSET PARK sweeps band with a scroll-driven lens: the square actor rounds and swells into a bone disk over the fading hero, alternating ink/bone circles grow inside it, the page (TRAJECTORY) opens inside the innermost circle, and a bone circle grows into TRAJECTORY's O.

**Architecture:** Trajectory becomes a sticky stage inside a wrapper with a 160 svh spacer; its content sits in a window whose `clip-path` circle opens with scroll. A new fixed `LensFx` controller draws three disks from a pure `lib/lens-math.ts` (progress, radii, visibility) on the GSAP ticker, hands off from the actor (which it hides via a data attribute) and hands back at the O. `SquareActor` learns the sticky shift for slots inside the lens wrapper and the hide/grow-in protocol.

**Tech Stack:** Next.js 16.2.12 (App Router, static export, Turbopack), React 19.2, TypeScript, Tailwind v4, GSAP 3.15 + ScrollTrigger via `lib/gsap.ts`, Lenis, Node 24 test runner.

**Spec:** `docs/superpowers/specs/2026-10-22-lens-transition-design.md` — read it first; this plan argues from it.

## Global Constraints

- Colours: bone `#e8e3d8` (`var(--bone)`, "white"), ink `#0a0a0c` (`var(--ink)`, "black"). Disks A and C are bone, B is ink, the window shows the ink page.
- Keyframes exactly as the spec's table: travel 0→0.18; A 0.18→0.86; B 0.38→0.92; C 0.56→0.97; window 0.72→1.0; actor back at 0.86; `S0 = 0.2 × viewportHeight`; `--lens-length: 160svh`; disk A diameter at travel end `0.16 × min(vw, vh)`; growth ease `u^1.6`.
- Z-order: hero 0 < disks 1 < Trajectory 2 < actor 8 < chrome 40. Never add a z-index to the `relative` wrapper in `Resume()` (it would bury the fixed actor).
- No new dependencies. Reduced motion → no lens, plain in-flow Trajectory.
- Nothing above the hero or below Trajectory changes.
- Commit style: one short imperative sentence (see `git log`), ending with the attribution trailer your harness gives you.

## Environment

- Node 24 lives at `~/.local/node/bin` and is **not** on PATH in non-login shells: run every node/npm/npx command as `/bin/zsh -lc '<command>'`.
- A dev server may already be running on port 3001 from the previous session (`pgrep -fl "next dev"`); reuse it or start `npx next dev -p 3001` in a background shell. Open `http://localhost:3001` in the browser pane (do not use the app's launch-config preview; it panics in Turbopack here).
- Tests: `node --test lib/*.test.ts` (test files import `./x.ts` with the extension).
- Baseline: lint 0 errors / 1 warning (`scripts/gen-sketch.mjs`), tsc clean, tests pass, build passes.
- **If this runs in a git worktree** (own branch): `node_modules` is not shared — run `/bin/zsh -lc 'npm ci --no-audit --no-fund'` first; start your own dev server on a free port (`npx next dev -p 3002`) because 3001 serves the main checkout; and copy this plan and its spec from the main checkout (`/Users/jiewenhuang/PERSONAL_WEBSITE/docs/superpowers/{plans,specs}/2026-10-22-lens-transition*.md`) into the worktree's `docs/superpowers/` and include them in Task 1's commit. Do not touch the main checkout.
- Driving scroll in the browser pane: `window.scrollTo(0, y)` then `await new Promise(r => setTimeout(r, 900))` (Lenis is in use; the native scroll still lands). Read state with `javascript_tool`.

## Review Focus

Inputs the spec implies that the happy-path replay does not exercise; each has its test or step pinned to the owning task.

1. **Reverse scroll through the whole lens** (p 1 → 0): window closes, rings shrink, actor reappears at the full stop; no element left hidden or clipped. → Task 5 step 4; `actorVisible` test, Task 2.
2. **Reload mid-lens** (scroll restored to p ≈ 0.5): actor must start hidden, disks visible, window closed — no flash of the actor or of TRAJECTORY. → Task 4 step 3 (init while hidden), Task 5 step 4.
3. **Nesting under every viewport ratio**: the radii must never cross (an ink ring poking outside a bone one). → `lensRadii` nesting test over p ∈ [0, 1] step 0.01, Task 2.
4. **Resize mid-lens**: centre and cover re-measure; disks re-size; nothing stays stale. → Task 3 re-measure on resize + ScrollTrigger refresh; manual check Task 5.
5. **Nav click on TRAJECTORY**: must land on the open section with the circle in the O, not inside a half-open lens. → Task 1 anchor position; Task 5 step 5.

---

### Task 1: Remove the sweeps; restructure Trajectory as the lens stage (static)

**Files:**
- Modify: `components/resume/Sections.tsx` (`Sweeps()` deleted; `Trajectory()` rewritten; `Resume()` loses `<Sweeps />`)
- Modify: `components/fx/ScrollFx.tsx:246-262` (delete the `[data-sweep]` block and the `[data-sweep]` line in the header comment)
- Modify: `components/resume/Titles.tsx` (`GapTitle` gains `dwell?: number` → `data-sq-dwell`)
- Modify: `app/globals.css` (lens CSS, reduced-motion fallback)

**Interfaces:**
- Produces (DOM contract for Tasks 3–4):

```html
<div data-lens-wrap data-band class="relative" style="--lens-length: 160svh">
  <span id="trajectory" aria-hidden="true" class="pointer-events-none absolute left-0 h-px w-px" style="top: var(--lens-length)"></span>
  <section data-lens-stage class="sticky top-0 z-[2] min-h-svh overflow-hidden text-bone">
    <div data-lens-window class="relative min-h-svh bg-ink px-4 py-24 sm:px-6 sm:py-28">
      <!-- exactly today's Trajectory children: BackTicker, GapTitle (dwell={0.3}), the 36vh slot, the itinerary -->
    </div>
  </section>
  <div data-lens-spacer aria-hidden="true" style="height: var(--lens-length)"></div>
</div>
```

- `GapTitle` prop `dwell?: number` renders `data-sq-dwell={dwell}` on the slot (next to `data-sq-hold`).

CSS to add to `app/globals.css`:

```css
/* ------------------------------------------------------- lens stage ---- */
[data-lens-wrap] { --lens-length: 160svh; }
[data-lens-window] { clip-path: none; }            /* LensFx drives it; no-JS/no-lens shows the page */
@media (prefers-reduced-motion: reduce) {
  [data-lens-spacer] { display: none; }
  [data-lens-stage] { position: static; }
  [data-lens-window] { clip-path: none !important; }
}
```

- [ ] **Step 1: Delete `Sweeps()`** and its `<Sweeps />` in `Resume()`; delete the `[data-sweep]` loop in `ScrollFx` and its comment line. Grep check:

Run: `grep -rn "data-sweep\|Sweeps\|SUNSET PARK\|SHIPPING" --include='*.ts' --include='*.tsx' app components lib; echo "exit=$?"`
Expected: `exit=1`.

- [ ] **Step 2: Add `dwell` to `GapTitle`** (prop + `data-sq-dwell` attribute). Type: `dwell?: number`.

- [ ] **Step 3: Rewrite `Trajectory()`** to the DOM above. Keep every existing child (BackTicker, GapTitle with `dwell={0.3}`, the hidden-on-phones 36 vh slot, the itinerary) inside `[data-lens-window]`, unchanged. `Band` is no longer used here (keep the component; Contact uses it). `id="trajectory"` moves to the anchor span; `data-band` is on the wrapper, not the section.

- [ ] **Step 4: Add the CSS** block above (place it after the block-letter hero block).

- [ ] **Step 5: Static checks**

Run: `/bin/zsh -lc 'npm run lint && npx tsc --noEmit && node --test lib/*.test.ts'`
Expected: clean (lint keeps only the gen-sketch warning).

- [ ] **Step 6: Browser check**

Load `http://localhost:3001`, finish the intro, scroll to `innerHeight * 1.2`: Trajectory is visible at the top and *stays stuck* while you scroll on for ~1.6 viewports (read `document.querySelector('[data-lens-stage]').getBoundingClientRect().top` → `0` across that range), then scrolls away; no SHIPPING band anywhere; EXPERIENCE, the deck and Contact look as before. Click TRAJECTORY in the TopBar → the page lands with Trajectory's top at the viewport top.

- [ ] **Step 7: Commit**

```bash
git add components/resume/Sections.tsx components/fx/ScrollFx.tsx components/resume/Titles.tsx app/globals.css
git commit -m "Sweeps band removed; Trajectory becomes a sticky lens stage"
```

---

### Task 2: Lens math module

**Files:**
- Create: `lib/lens-math.ts`
- Create: `lib/lens-math.test.ts`

**Interfaces:**
- Produces (used by Tasks 3–4):

```ts
export const LENS = {
  startVh: 0.2,                 // S0 = startVh × viewportHeight
  travelEnd: 0.18,              // disk A reaches the centre, fully round
  start: { a: 0.18, b: 0.38, c: 0.56, window: 0.72 },   // p at which each radius starts growing
  reach: { a: 0.86, b: 0.92, c: 0.97, window: 1.0 },    // p at which each reaches `cover`
  actorReturn: 0.86,            // actor visible again (grows in at the O)
  startDiameterFrac: 0.16,      // disk A's diameter at travelEnd, × min(vw, vh)
  growthPower: 1.6,
} as const;

export function lensProgress(scrollY: number, s0: number, s1: number): number;   // clamp((scrollY − s0) / (s1 − s0), 0, 1); s1 ≤ s0 → 0
export function coverRadius(cx: number, cy: number, vw: number, vh: number): number; // max distance to a corner + 2
export function growth(p: number, start: number, reach: number): number;         // 0 before start, 1 at/after reach, else ((p − start)/(reach − start)) ** growthPower
export interface LensRadii { a: number; b: number; c: number; window: number; }
export function lensRadii(p: number, startRadius: number, cover: number): LensRadii;
   // a = startRadius + (cover − startRadius) × growth(p, start.a, reach.a); b, c, window = cover × growth(p, start.x, reach.x)
export function diskATravel(p: number): { u: number; round: number };            // u = easeInOutQuad(clamp(p / travelEnd)); round = u
export function actorVisible(p: number): boolean;                                 // p <= 0 || p >= actorReturn
```

- [ ] **Step 1: Write the failing tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { LENS, actorVisible, coverRadius, diskATravel, growth, lensProgress, lensRadii } from "./lens-math.ts";

test("progress clamps to the lens range", () => {
  assert.equal(lensProgress(100, 154, 1997), 0);
  assert.equal(lensProgress(154 + (1997 - 154) / 2, 154, 1997), 0.5);
  assert.equal(lensProgress(5000, 154, 1997), 1);
  assert.equal(lensProgress(500, 1000, 1000), 0);
});

test("cover radius reaches the farthest corner", () => {
  assert.ok(Math.abs(coverRadius(0, 0, 100, 100) - (Math.hypot(100, 100) + 2)) < 1e-9);
  assert.ok(Math.abs(coverRadius(50, 50, 100, 100) - (Math.hypot(50, 50) + 2)) < 1e-9);
  assert.ok(Math.abs(coverRadius(655, 196, 1024, 768) - (Math.hypot(655, 572) + 2)) < 1e-9);
});

test("growth is an ease-in inside its own range", () => {
  assert.equal(growth(0.1, 0.18, 0.86), 0);
  assert.equal(growth(0.18, 0.18, 0.86), 0);
  assert.equal(growth(0.86, 0.18, 0.86), 1);
  assert.equal(growth(0.99, 0.18, 0.86), 1);
  const mid = growth(0.52, 0.18, 0.86);
  assert.ok(mid > 0 && mid < 0.5, `ease-in: ${mid}`);
});

test("radii start and end where the spec says", () => {
  const r0 = lensRadii(0.18, 61, 1300);
  assert.deepEqual(r0, { a: 61, b: 0, c: 0, window: 0 });
  assert.equal(lensRadii(0.5, 61, 1300).window, 0);
  assert.deepEqual(lensRadii(1, 61, 1300), { a: 1300, b: 1300, c: 1300, window: 1300 });
});

test("radii stay nested and never shrink as p grows", () => {
  let prev = lensRadii(0, 61, 1300);
  for (let i = 1; i <= 100; i++) {
    const p = i / 100;
    const r = lensRadii(p, 61, 1300);
    assert.ok(r.a >= r.b && r.b >= r.c && r.c >= r.window, `crossed at p=${p}: ${JSON.stringify(r)}`);
    assert.ok(r.a >= prev.a && r.b >= prev.b && r.c >= prev.c && r.window >= prev.window, `shrank at p=${p}`);
    prev = r;
  }
});

test("disk A travels and rounds out by travelEnd", () => {
  assert.deepEqual(diskATravel(0), { u: 0, round: 0 });
  assert.deepEqual(diskATravel(LENS.travelEnd), { u: 1, round: 1 });
  assert.equal(diskATravel(LENS.travelEnd / 2).u, 0.5);
  assert.deepEqual(diskATravel(0.5), { u: 1, round: 1 });
});

test("the actor is seen only at the full stop and at the O", () => {
  assert.equal(actorVisible(-0.1), true);
  assert.equal(actorVisible(0), true);
  assert.equal(actorVisible(0.001), false);
  assert.equal(actorVisible(0.5), false);
  assert.equal(actorVisible(LENS.actorReturn), true);
  assert.equal(actorVisible(1), true);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `/bin/zsh -lc 'node --test lib/lens-math.test.ts'`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `lib/lens-math.ts`** per the interfaces. `easeInOutQuad(x) = x < 0.5 ? 2x² : 1 − (−2x + 2)² / 2`. Header comment: what the lens is and that every function is a pure function of `p`.

- [ ] **Step 4: Run tests + types**

Run: `/bin/zsh -lc 'node --test lib/*.test.ts && npx tsc --noEmit'`
Expected: all PASS, tsc clean.

- [ ] **Step 5: Commit**

```bash
git add lib/lens-math.ts lib/lens-math.test.ts
git commit -m "Lens math: progress, nested ring radii, disk travel, actor visibility"
```

---

### Task 3: `LensFx` — disks, window clip, progress

**Files:**
- Create: `components/fx/LensFx.tsx` (`"use client"`)
- Modify: `app/page.tsx` (render `<LensFx />` after `<SquareActor />`)
- Modify: `app/globals.css` (disk styles)

**Interfaces:**
- Consumes: Task 1 DOM (`[data-lens-wrap]`, `[data-lens-stage]`, `[data-lens-window]`, `[data-lens-spacer]`, the O slot = first `[data-sq-slot]` inside `[data-lens-window]`), Task 2 math, `[data-square-actor]` (for the handoff start box) and the hero's full-stop slot (`[data-section="hero"] [data-sq-slot]`) as fallback.
- Produces: `[data-square-actor]` gets `data-lens-hidden="1"` while `!actorVisible(p)` and the attribute removed otherwise (Task 4 consumes it). Renders:

```html
<div data-lens aria-hidden="true" class="pointer-events-none fixed inset-0 z-[1] hidden">
  <div data-lens-disk="a" class="lens-disk bg-bone"></div>
  <div data-lens-disk="b" class="lens-disk bg-ink"></div>
  <div data-lens-disk="c" class="lens-disk bg-bone"></div>
</div>
```

CSS:

```css
.lens-disk { position: absolute; left: 0; top: 0; border-radius: 50%; transform-origin: 50% 50%; will-change: transform; }
```

Controller (`useGSAP`), signature `export function LensFx(): JSX.Element`:

```ts
// bail: prefers-reduced-motion, or any of wrap/stage/window/spacer/oSlot missing
// measure(): vh, vw; wrapTop = wrap.getBoundingClientRect().top + scrollY (wrap is normal flow);
//   s0 = LENS.startVh * vh; s1 = wrapTop + spacer.offsetHeight;
//   cx = oRect.left + oRect.width / 2;  cy = oRect.top - stage.getBoundingClientRect().top + oRect.height / 2;
//   cover = coverRadius(cx, cy, vw, vh); startRadius = LENS.startDiameterFrac * Math.min(vw, vh) / 2;
//   size every .lens-disk to 2*cover (width/height px)
// on resize (debounced 160ms) and ScrollTrigger "refresh": measure()
// tick (gsap.ticker): p = lensProgress(scrollY, s0, s1)
//   if p <= 0 || p >= 1: root hidden; window clip = p >= 1 ? "none" : "circle(0px at cx cy)"; actor attr removed; handoffBox = null; return
//   root visible
//   if handoffBox == null: handoffBox = the actor's getBoundingClientRect() when it is positioned (width > 0 and not sitting untransformed at left 0 / top 0), else fullStopSlot.getBoundingClientRect()
//   travel = diskATravel(p); radii = lensRadii(p, startRadius, cover)
//   disk A: if p < travelEnd: centre = lerp(handoff centre, (cx, cy), travel.u); radius = lerp(handoffBox.width/2, startRadius, travel.u); borderRadius = `${50 * travel.round}%`
//           else centre = (cx, cy); radius = radii.a; borderRadius 50%
//   place(disk, centreX, centreY, radius): transform = translate(centreX − cover, centreY − cover) scale(radius / cover); display none when radius <= 0
//   disks B, C at (cx, cy) with radii.b, radii.c
//   window.style.clipPath = `circle(${radii.window}px at ${cx}px ${cy}px)`
//   actor attr: actorVisible(p) ? remove data-lens-hidden : set "1"
```

Write disk transforms with `gsap.set(el, { x, y, scale, borderRadius, display })` so they go through GSAP's transform cache like the actor.

- [ ] **Step 1: Create `LensFx.tsx`** per the pseudo-code and add the CSS. Register it in `app/page.tsx` after `<SquareActor />`.

- [ ] **Step 2: Static checks**

Run: `/bin/zsh -lc 'npm run lint && npx tsc --noEmit'`
Expected: clean.

- [ ] **Step 3: Browser replay (desktop)**

Load, finish the intro, then step `window.scrollTo` through `innerHeight × {0.15, 0.4, 0.7, 1.0, 1.3, 1.6, 1.9, 2.2, 2.5, 2.7}` with a screenshot each (0.9 s settle). Expected, in order: nothing (actor at the full stop); a bone disk travelling from the full stop toward 64 % / upper-left of centre over the fading JIEWEN, already round and growing; disk covering most of the screen; an ink dot at the centre growing; a bone dot inside it; the ink page opening inside with TRAJECTORY readable and its O empty; rings sliding off the edges; Trajectory alone, unstuck. The actor is *not yet* hidden (Task 4), so it will still be visible over the disks — ignore that here.

- [ ] **Step 4: Window state checks**

With `javascript_tool` at `innerHeight × 0.5`: `getComputedStyle(document.querySelector('[data-lens-window]')).clipPath` starts with `circle(0px`; at `× 2.7`: equals `none`; `document.querySelector('[data-lens]').classList.contains('hidden')` or `display === 'none'` is true at × 0.1 and × 2.7, false at × 1.5.

- [ ] **Step 5: Commit**

```bash
git add components/fx/LensFx.tsx app/page.tsx app/globals.css
git commit -m "Lens: bone and ink circles swell from the full stop and open onto TRAJECTORY"
```

---

### Task 4: Square actor — lens shift, hide, grow back in

**Files:**
- Modify: `components/fx/SquareActor.tsx`

**Interfaces:**
- Consumes: `data-lens-hidden` on its own element (Task 3); `[data-lens-wrap]` / `[data-lens-spacer]` (Task 1); `data-sq-dwell` (Task 1).
- Produces: nothing new.

- [ ] **Step 1: `lensShift(el)`** next to `heroShift`: `const wrap = el.closest<HTMLElement>("[data-lens-wrap]"); const spacer = wrap?.querySelector<HTMLElement>("[data-lens-spacer]"); return spacer ? spacer.offsetHeight : 0;` Apply in `measure()` for the generic branch: `const top = rect.top + scrollY - heroShift(el) + lensShift(el)`. Then `const dwell = Number(el.dataset.sqDwell) || 0; depart: top - exit + dwell * vh`.

- [ ] **Step 2: Hide/show protocol in `update`**:

```ts
const hidden = sq.dataset.lensHidden === "1";
// … after tx/ty/ts are computed …
if (!state.init) { /* existing birth code */ ; gsap.set(sq, { autoAlpha: hidden ? 0 : 1 }); state.hidden = hidden; }
if (hidden !== state.hidden) {
  state.hidden = hidden;
  if (hidden) gsap.set(sq, { autoAlpha: 0 });
  else { state.x = tx; state.y = ty; state.s = ts * 0.15; gsap.set(sq, { autoAlpha: 1 }); }   // grows in place at the O
}
```

(`state` gains `hidden: false`.) Keep everything else as is.

- [ ] **Step 3: Static checks**

Run: `/bin/zsh -lc 'npm run lint && npx tsc --noEmit && node --test lib/*.test.ts'`
Expected: clean.

- [ ] **Step 4: Browser replay**

Same scroll steps as Task 3. Expected now: the actor vanishes the instant disk A appears (no double shape; disk A starts exactly on the actor's box); nothing of the actor during the rings; at `× 2.3` a small bone circle grows into TRAJECTORY's O within ~0.7 s; at `× 2.8` it is still in the O; by `× 3.4` it has left for the 36 vh slot at the right. Reload at `× 1.4` (scroll restoration): actor hidden from the first frame (`getComputedStyle(document.querySelector('[data-square-actor]')).visibility === 'hidden'`).

- [ ] **Step 5: Commit**

```bash
git add components/fx/SquareActor.tsx
git commit -m "Square actor hands off to the lens and grows back into TRAJECTORY's O"
```

---

### Task 5: Verification pass

**Files:**
- Modify: `docs/motion-study.md` (append one line: sweeps retired; the hero→TRAJECTORY handoff is the lens; link the spec)

- [ ] **Step 1: Full checks**

Run: `/bin/zsh -lc 'node --test lib/*.test.ts && npm run lint && npx tsc --noEmit && npm run build 2>&1 | tail -8'`
Expected: all pass; build lists `/`, `/_not-found`, `/icon.svg`, `/resume-print`.

- [ ] **Step 2: Desktop replay (1440 × 900)** — the spec's Verification paragraph, end to end, including the rest of the journey (EXPERIENCE ride, deck, BU■LD).

- [ ] **Step 3: Phone replay (390 × 844 via `resize_window` mobile, reload)** — same sequence; the 36 vh slot is hidden there, so after the O the actor flies to EXPERIENCE.

- [ ] **Step 4: Reverse and reload** — from `× 2.8` scroll back in the same steps to 0: window closes, rings shrink, actor reappears at the full stop (Review Focus 1). Reload at `× 1.4`: hidden actor, closed window, rings visible (Review Focus 2). Resize the pane width by ~200 px mid-lens: rings and window re-centre on the O (Review Focus 4).

- [ ] **Step 5: Nav** — click TRAJECTORY in the TopBar from the hero: lands with the open section at the top and the circle in (or growing into) the O (Review Focus 5).

- [ ] **Step 6: Leftovers**

Run: `grep -rn "data-sweep\|Sweeps\|band-ink relative overflow-hidden px-4 py-24\" *id=\"trajectory\"" --include='*.ts' --include='*.tsx' app components lib; echo "exit=$?"`
Expected: `exit=1`.

- [ ] **Step 7: Commit**

```bash
git add docs/motion-study.md
git commit -m "Motion study: the lens replaces the sweeps"
```
