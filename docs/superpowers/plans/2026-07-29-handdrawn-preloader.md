# Hand-drawn Preloader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the segmented vector write-on with a fluid pen-mask reveal of the exact original handmade `by Jiewen` artwork.

**Architecture:** Keep the existing loader, progress orchestrator, skip behavior, and handoff. Render the original WebP through a two-stage SVG mask: a narrow rounded tip leads and a wide butt-capped coverage stroke follows, while a pure timeline mapper applies one global ease and explicit pen-lift gaps instead of restarting easing on every path.

**Tech Stack:** Next.js 16.2.12, React 19.2.4, TypeScript, SVG masks, GSAP ticker, Node test runner.

## Global Constraints

- Preserve the exact original artwork at `public/loader/by-jiewen-loader.webp`.
- Preserve the current dark atmospheric field, corner UI, progress semantics, Skip behavior, responsive scale, reduced-motion behavior, and scale/fade exit.
- Add no dependencies and do not redesign the page beyond the preloader motion.
- Keep verification light: one focused timeline test, one visual replay, and one production build.

## Frontend-design direction

- **Subject / audience / job:** Jiewen's personal portfolio for collaborators and reviewers; the loader's only job is to establish authorship while real page assets become ready.
- **Palette:** Ink `#0a0a0c`; bone `#e8e3d8`; chalk white from the original artwork; quiet bone at 60–70% opacity; the existing two low-opacity bone atmosphere fields.
- **Type roles:** the handwritten artwork is the display voice; Inter remains the interface/body face; Geist Mono remains the numeric utility face.
- **Layout:**

  ```text
  ┌──────────────────────────────────────────┐
  │                                  SKIP →  │
  │                                          │
  │           [ by Jiewen, written ]         │
  │                                          │
  │ DRAWING THE PAGE…                 042%   │
  └──────────────────────────────────────────┘
  ```

- **Signature:** the creator's real chalk-textured mark writing itself in authentic stroke order.
- **Distinctiveness check:** no handwriting font, generic vector substitute, decorative flourish, or new color is introduced. The aesthetic risk is allowing the imperfect original texture to remain the only luminous focal object; this is specific to Jiewen and cannot be reused as a generic portfolio treatment.

---

### Task 1: Continuous handwriting timeline and textured SVG reveal

**Files:**
- Create: `lib/handwriting-timeline.ts`
- Create: `lib/handwriting-timeline.test.ts`
- Modify: `components/intro/LoaderOverlay.tsx`
- Modify: `components/intro/LoaderFx.tsx`
- Read before editing: `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`

**Interfaces:**
- Consumes: `orchestrator.display(dtSeconds): number`, the existing loader DOM hooks, and the existing WebP asset.
- Produces: `mapHandwritingProgress(progress: number, segments: HandwritingSegment[]): number[]`, plus matching `[data-pen-tip]` and `[data-pen-fill]` paths in stroke order.

- [ ] **Step 1: Write the failing timeline test**

  Create `lib/handwriting-timeline.test.ts`:

  ```ts
  import assert from "node:assert/strict";
  import test from "node:test";
  import {
    mapHandwritingProgress,
    type HandwritingSegment,
  } from "./handwriting-timeline.ts";

  const segments: HandwritingSegment[] = [
    { draw: 100, lift: 20 },
    { draw: 100, lift: 0 },
  ];

  test("draws one continuous timeline with a real pen-lift gap", () => {
    assert.deepEqual(mapHandwritingProgress(0, segments), [0, 0]);
    assert.deepEqual(mapHandwritingProgress(1, segments), [1, 1]);

    const duringFirstStroke = mapHandwritingProgress(0.25, segments);
    assert.ok(duringFirstStroke[0] > 0);
    assert.equal(duringFirstStroke[1], 0);

    const duringLift = mapHandwritingProgress(0.5, segments);
    assert.equal(duringLift[0], 1);
    assert.equal(duringLift[1], 0);

    const duringSecondStroke = mapHandwritingProgress(0.75, segments);
    assert.equal(duringSecondStroke[0], 1);
    assert.ok(duringSecondStroke[1] > 0);
  });
  ```

- [ ] **Step 2: Run the test and confirm the missing module fails**

  Run:

  ```powershell
  node --experimental-strip-types --test lib/handwriting-timeline.test.ts
  ```

  Expected: FAIL because `lib/handwriting-timeline.ts` does not exist.

- [ ] **Step 3: Implement the pure global timeline mapper**

  Create `lib/handwriting-timeline.ts` with:

  ```ts
  export interface HandwritingSegment {
    draw: number;
    lift: number;
  }

  const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

  export function mapHandwritingProgress(
    progress: number,
    segments: HandwritingSegment[],
  ): number[] {
    const total = segments.reduce(
      (sum, segment) => sum + segment.draw + segment.lift,
      0,
    );
    if (total <= 0) return segments.map(() => 1);

    const clamped = clamp01(progress);
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * clamped);
    const pen = eased * total;
    let cursor = 0;

    return segments.map((segment) => {
      const local = clamp01((pen - cursor) / Math.max(segment.draw, 1));
      cursor += segment.draw + segment.lift;
      return local;
    });
  }
  ```

- [ ] **Step 4: Run the timeline test and confirm it passes**

  Run:

  ```powershell
  node --experimental-strip-types --test lib/handwriting-timeline.test.ts
  ```

  Expected: PASS with one test.

- [ ] **Step 5: Restore the original artwork as a progressive two-stage mask**

  In `components/intro/LoaderOverlay.tsx`:

  - Replace the current directly visible `data-ink` and `data-ink-glow` paths.
  - Restore the calibrated ten-path artwork coverage data from the current
    `HEAD` version, retaining its generous final widths and special round
    treatment for the `i` dot.
  - Give each path `speed` and `lift` metadata. Keep connected cursive runs
    fast, use 18–42 SVG-distance units for pen lifts, and give the dot a
    minimum draw duration rather than allowing it to appear in one frame.
  - Inside one mask, render a narrow `data-pen-tip` copy at roughly 45% of the
    final width with a round cap, followed by a full-width
    `data-pen-fill` copy with a butt cap. Both start at dash offset `1`.
  - Render `<image href="/loader/by-jiewen-loader.webp">` through that mask.
  - Do not add a mop-up rectangle, filter, glow, or unmasked crossfade.

- [ ] **Step 6: Drive both mask passes from the continuous timeline**

  In `components/intro/LoaderFx.tsx`:

  - Import `mapHandwritingProgress`.
  - Read the tip paths, matching fill paths, `data-pen-speed`, and
    `data-pen-lift`.
  - Build timeline segments from each real SVG path length:

    ```ts
    const segments = tips.map((path) => ({
      draw: Math.max(
        path.getTotalLength() / Number(path.dataset.penSpeed ?? 1),
        42,
      ),
      lift: Number(path.dataset.penLift ?? 0),
    }));
    ```

  - For every tick, call the mapper once. Set each tip dash offset to
    `1 - local`.
  - Let the full-width fill trail the tip without a new ease:

    ```ts
    const coverage = Math.min(1, Math.max(0, (local - 0.055) / 0.945));
    fill.style.strokeDashoffset = String(1 - coverage);
    ```

  - Restore image preload gating for the `textures` task. Preserve the
    existing failure completion, progress label, ARIA update, skip listeners,
    cleanup, and exit sequence.

- [ ] **Step 7: Run focused verification**

  Run:

  ```powershell
  node --experimental-strip-types --test lib/handwriting-timeline.test.ts
  npm run build
  ```

  Expected: the timeline test and the Next.js production build both pass.

- [ ] **Step 8: Replay once in the existing local browser**

  Reload `http://localhost:3000/` once and visually confirm:

  - the final mark matches the original textured artwork;
  - motion progresses in authentic stroke order;
  - transitions between strokes read as brief pen lifts, not stutters;
  - no large circular chunks appear at stroke starts;
  - the final check flourish and scale/fade handoff remain smooth.

- [ ] **Step 9: Commit the implementation**

  ```powershell
  git add -- lib/handwriting-timeline.ts lib/handwriting-timeline.test.ts components/intro/LoaderOverlay.tsx components/intro/LoaderFx.tsx docs/superpowers/plans/2026-07-29-handdrawn-preloader.md
  git commit -m "feat: smooth the hand-drawn preloader"
  ```
