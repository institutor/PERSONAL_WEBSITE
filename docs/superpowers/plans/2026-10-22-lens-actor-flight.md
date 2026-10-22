# Lens v2.1 — Actor Flies the First Leg — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Intended executor:** the Opus 5.5 (extra-high) session that built lens v1/v2
> on branch `claude/lens-transition-91036c`. Delta plan on top of v2. Read the
> spec's new **v2.1** section first.

**Goal:** Replace disk A's straight glide with the actor's own flight: the period leaves the full stop on its damped, meandering path, spins three turns while rounding into a circle, arrives at mid-screen, and only then does the lens take over; scrolling back hands the shape back to the actor seamlessly.

**Architecture:** `LensFx` adds a hidden fixed `[data-sq-slot][data-sq-lens]` at the lens centre so the actor's existing mark/flight system carries it there; both controllers derive the slot's dwell window from the same pure function; the handoff at p 0.15 starts disk A on the actor's live box and blends to the exact centre; a reverse handoff snaps the actor onto disk A's current geometry.

**Spec:** `docs/superpowers/specs/2026-10-22-lens-transition-design.md` (§ v2.1).

## Global Constraints

- Constants: first-leg spin `1080°`; handoff at `LENS.travelEnd = 0.15`; blend width `LENS.handoffEase = 0.07`; lens-slot depart `LENS.lensSlotDepart = 0.4`; `actorVisible(p) = p < travelEnd || p ≥ actorReturn`. Everything else from v2 unchanged.
- The lens slot is measurable but never painted (`visibility: hidden`, `pointer-events: none`, no background).
- No new dependencies. Sync the branch with `main` first (it has two new commits: the hero bar is shape only; docs). Copy the updated spec and this plan from the main checkout (`/Users/jiewenhuang/PERSONAL_WEBSITE/docs/superpowers/…`) into the worktree and commit them with Task 1. Do not edit the main checkout, push, or merge.

## Environment

As v2: `/bin/zsh -lc '…'`, dev server on 3002, `node --test lib/*.test.ts`, drive scroll with `window.scrollTo` + settle.

## Review Focus

1. **Fast scroll past 0.15** (one wheel flick from the top to p ≈ 0.3): the actor's damped position may still be near the full stop when the handoff fires; disk A must start there and blend to centre — no pop, no second shape. → Task 3 step 4.
2. **Reverse across 0.15**: the actor must reappear exactly on disk A (position and size), full size, then fly home. → Task 2 step 3, Task 3 step 4.
3. **Refresh order**: `SquareActor.measure` and `LensFx.measure` must agree on S0/S1 whichever runs first (both compute from the O slot's document position via `lensEnd`). → `lensSlotRange` test, Task 1; code-read.
4. **Reload at p ≈ 0.1** (actor mid-flight): no handoff box exists yet; the actor must be visible and flying; at 0.15 the handoff takes its live box as usual. → Task 3 step 4.
5. **Reduced motion**: no lens, no lens slot in the route (the slot must not be in the DOM, or must be `display: none`, when `LensFx` bails). → Task 3 step 1.

---

### Task 1: Math and morph

**Files:**
- Modify: `lib/lens-math.ts`, `lib/lens-math.test.ts`
- Modify: `lib/square-morph.ts`, `lib/square-morph.test.ts`
- Copy in: the updated spec + this plan

**Interfaces (used by Tasks 2–3):**

```ts
// lens-math additions / changes
export const LENS = { …v2 fields…, travelEnd: 0.15, handoffEase: 0.07, lensSlotDepart: 0.4, actorReturn: <v2 value> } as const;
export function lensSlotRange(s0: number, s1: number): { arrive: number; depart: number }; // s0 + (s1−s0)·travelEnd, s0 + (s1−s0)·lensSlotDepart
export function handoffBlend(p: number): number;                                           // smoothstep((p − travelEnd) / handoffEase)
export function actorVisible(p: number): boolean;                                         // p < travelEnd || p ≥ actorReturn
// remove diskATravel (no longer used)

// square-morph: first leg spins three turns
export function squareMorph(ai: number, t: number, count: number): SquareMorph;           // ai === 0 → { round: t, spin: 1080·t }; later legs keep spin 1080 until the final leg adds its 360
```

- [ ] **Step 1: Tests.** In `lens-math.test.ts`: replace the `diskATravel` test with `lensSlotRange(154, 1233)` → `{ arrive: 154 + 1079 × 0.15, depart: 154 + 1079 × 0.4 }` (use `close`); `handoffBlend(0.15) = 0`, `handoffBlend(0.185) = 0.5`, `handoffBlend(0.22) = 1`, `handoffBlend(0.5) = 1`; `actorVisible`: `0 → true`, `0.1 → true`, `0.15 → false`, `0.5 → false`, `actorReturn → true`. In `square-morph.test.ts`: first-leg expectations become `spin: 540` at `t 0.5` and `spin: 1080` at `t 1`; the "stays a circle" leg holds `spin: 1080`; the final leg goes `1080 → 1440`; keep the monotone test. Run → FAIL.
- [ ] **Step 2: Implement** both modules. Run `/bin/zsh -lc 'node --test lib/*.test.ts && npx tsc --noEmit'` → PASS.
- [ ] **Step 3: Commit** `"Lens v2.1 math: lens-slot dwell window, handoff blend, three-turn first leg"`.

---

### Task 2: Square actor — lens slot mark and reverse handoff

**Files:**
- Modify: `components/fx/SquareActor.tsx`

- [ ] **Step 1: Lens-slot marks.** In `measure()`, before the generic branch: if `el.dataset.sqLens !== undefined`: compute `oSlot = document.querySelector('[data-lens-window] [data-sq-slot]')`; if missing, skip the slot; else `s0 = LENS.startVh × vh`, `s1 = lensEnd(oRect.top + scrollY + oRect.height / 2, vh)`, `{ arrive, depart } = lensSlotRange(s0, s1)` → `{ el, arrive, depart }`. Keep the `width > 0` filter (the slot is `visibility: hidden`, not `display: none`, so it passes).
- [ ] **Step 2: Reverse handoff.** On the hidden → visible transition: if `sq.dataset.lensX` is present (LensFx wrote it) and the actor is *not* returning at the O (i.e. the current mark is the lens slot or earlier), snap `state.x = lensX − BASE/2`, `state.y = lensY − BASE/2`, `state.s = lensR × 2 / BASE`, `state.round = 1`, keep `state.spin`; otherwise the existing O grow-in (15 %). Clear nothing; LensFx owns the attributes.
- [ ] **Step 3: Checks + replay.** Lint/tsc/tests clean. Browser: scroll to p ≈ 0.1 (`S0 + 0.1 × (S1 − S0)`): the actor is airborne between the full stop and mid-screen, rotated, partly rounded; at p ≈ 0.14 it is near `(cx, cy)`, round, about `2 × rT` wide. (LensFx still runs v2 until Task 3 — ignore its disk here.)
- [ ] **Step 4: Commit** `"Square actor flies to the lens centre and takes the shape back on reverse"`.

---

### Task 3: LensFx — slot, handoff from the live actor, reverse attributes

**Files:**
- Modify: `components/fx/LensFx.tsx`

- [ ] **Step 1: Lens slot element.** Render, as a sibling of the disk root (never inside the `display: none` root), `<span data-sq-slot data-sq-lens aria-hidden="true" class="pointer-events-none fixed left-0 top-0 invisible" />`; in `measure()` set its `left/top/width/height` to `(cx − rT, cy − rT, 2rT, 2rT)`. When `LensFx` bails (reduced motion / missing DOM), do not render it (or `display: none`), so it drops out of the actor's route.
- [ ] **Step 2: Handoff.** Draw nothing for `p < LENS.travelEnd`. On the first frame with `p ≥ travelEnd` entered from below, store `handoff = { x, y, r }` from the actor's live `getBoundingClientRect()` (centre and half-width); if entered any other way (reload, jump), `handoff = { cx, cy, rT }`. Disk A for `travelEnd ≤ p`: `centre = lerp(handoff, (cx, cy), handoffBlend(p))`, `radius = lerp(handoff.r, R(p), handoffBlend(p))` (then `renderRadius`), `border-radius 50%` always. Release `handoff` when `p < travelEnd`.
- [ ] **Step 3: Reverse attributes.** While `!actorVisible(p)` and `p < actorReturn`, write `data-lens-x`, `data-lens-y` (disk A's current centre, viewport px) and `data-lens-r` (its current rendered radius) on `[data-square-actor]` each frame; remove them when the actor is visible.
- [ ] **Step 4: Replay** (1024 × 768, 1440 × 900, 390 × 844): steady scroll — the period lifts off, spins three turns while rounding, arrives at mid-screen, and the rings grow from it without any visible jump; fast flick from the top to p ≈ 0.3 — no second shape, disk A visibly blends to centre; reverse across 0.15 — the circle shrinks onto the actor and flies home; reload at p ≈ 0.1 — actor visible mid-flight; reload at p ≈ 0.5 — actor hidden, rings centred. Numbers: at the first frame after the handoff, `[data-lens-disk="a"]` centre equals the actor's last visible centre ± 1 px.
- [ ] **Step 5: Commit** `"Lens v2.1: the period flies and spins into the circle; the lens takes over at mid-screen"`.

---

### Task 4: Verification and hand-back

- [ ] `/bin/zsh -lc 'node --test lib/*.test.ts && npm run lint && npx tsc --noEmit && npm run build 2>&1 | tail -8'` → all pass.
- [ ] One-line update in `docs/motion-study.md`; commit `"Motion study: lens v2.1"`.
- [ ] Report: branch, commits, what you saw at each replay step, deviations. The planning session merges into main.
