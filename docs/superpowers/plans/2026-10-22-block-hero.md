# Block-letter Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Intended executor:** Claude Opus 5.5 at extra-high effort. Read the spec
> first, then this whole plan, then the Next.js docs listed under
> *Environment* before writing code (this Next.js differs from training data).

**Goal:** Replace the hero with a reference-faithful block-letter lockup (small I'M top-left; JIEWEN rising from the bottom with a bone quote bar and a shorter school bar; the lockup floating to centre; the hero fading under the sections that scroll over it) and strip the two light glows from the preloader.

**Architecture:** The letters are SVG polygons generated from a tiny glyph table (`lib/block-letters.ts`) and rendered by one server component (`BlockWord`); each letter sits in its own overflow-hidden cell so GSAP can rise it. One client controller (`HeroIntro`) owns the intro timeline, the skip/reduced/mid-page fallbacks, the loader handoff and the scroll fade; the WebGL dissolve and its three.js chunk are deleted. The hero becomes a sticky, z-0 layer and everything after it scrolls over it in a z-10 wrapper.

**Tech Stack:** Next.js 16.2.12 (App Router, `output: "export"`, Turbopack), React 19.2, TypeScript, Tailwind v4, GSAP 3.15 + ScrollTrigger via `lib/gsap.ts`, Lenis, zustand, Node 24 test runner.

**Spec:** `docs/superpowers/specs/2026-10-22-block-hero-design.md` — the plan argues from it; read both.

## Global Constraints

- Copy verbatim: bar 2 reads `Columbia University, Co'2030`; quote 1 reads `The most important step a man can take. It's not the first one, is it? It's the next one. Always the next step…` attributed to `Brandon Sanderson`.
- Palette unchanged: bone `#e8e3d8`, ink `#0a0a0c`; bars are bone with ink text.
- No new runtime dependencies and no new fonts (letters are SVG polygons; bar text is Inter via the existing `--font-inter`).
- Glyph geometry is exactly the spec's §2.1 table (cap 100, slit 3.7, chamfer 21.5, block 51); do not restyle it.
- Intro timing is exactly the spec's §3.1 table; scroll fade spans the first 85 % of a viewport.
- The square actor keeps a `[data-sq-slot]` in the hero (the full stop after JIEWEN) and is otherwise untouched.
- `npm run build` (static export) must pass; `html[data-intro]` gating, Skip, reduced motion and no-JS paths must all land on the final state.
- Commit style: one short imperative sentence like the existing log (`Square approaches EXPERIENCE from the right`), ending with the attribution trailer your harness gives you.

## Environment

- Node 24.22 lives at `~/.local/node/bin` and is **not** on PATH in non-login shells. Run every node/npm/npx command as `/bin/zsh -lc '<command>'` (or `export PATH="$HOME/.local/node/bin:$PATH"` first).
- Dev server: run `npx next dev -p 3001` from a background shell and open `http://localhost:3001` in the browser pane. The desktop app's launch-config preview harness panicked in Turbopack here (`spawning node pooled process: No such file or directory`); plain Bash works. If a stale panic ever repeats, `rm -rf .next` and restart.
- Tests: `node --test lib/*.test.ts` (Node type-stripping; test files import `./x.ts` *with* the extension, as `lib/handwriting-timeline.test.ts` does).
- Baseline before this plan: `npm run lint` → 0 errors, 2 warnings (`Hero.tsx` unused `identity` import — disappears in Task 4; `scripts/gen-sketch.mjs` unused `l` — leave it). `npx tsc --noEmit` → one pre-existing TS5097 on the `.ts` test import; Task 2 fixes it with `allowImportingTsExtensions`.
- Read before editing (Next docs, local): `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`; `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md` (we remove a `next/dynamic` boundary); `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`.
- Verifying motion: use the browser pane (`navigate` + `screenshot` batches; `javascript_tool` to read `document.documentElement.dataset.intro`, computed transforms and `getBoundingClientRect()`s). Reduced motion cannot be emulated from the pane, so verify that branch by code reading plus the Skip click (same `finalState()` path). Reload-mid-page is verified by scrolling, then `navigate` to the same URL.

## Review Focus

Inputs the spec implies but no happy-path replay exercises; each has its test pinned to the owning task.

1. **Short viewport** (landscape phone, 740 × 360): the lockup at home already sits lower than `viewportHeight − 56`; the rest offset must clamp to 0 and the intro still plays (letters rise in place). → `bottomRestOffset` clamp test, Task 3.
2. **Unknown character** handed to `BlockWord` (someone later types `HUANG`): must throw at render/SSR, never render blank cells. → `wordUnits` RangeError test, Task 2.
3. **Skip pressed** during the loader, and **reload mid-page** (`scrollY > 0.4 × innerHeight`): no intro, final state, scroll fade already applied. → manual steps in Task 5; `finalState` path reads the same code as the reduced-motion path.
4. **Quote cycling before the intro ends** (slow network makes the loader last 6 s): the first swap must not fire mid-intro. → QuoteBar starts its interval only on store phase `done`, Task 6 step 4 check.
5. **Scroll back up** after the hero has faded to `visibility: hidden`: it must come back (scrub, not `once`). → Task 7 manual step.

---

### Task 1: Loader — delete the background glows

**Files:**
- Modify: `components/intro/LoaderOverlay.tsx:104-120` (the `[data-loader]` root `<div>`)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing; `[data-loader]`, `[data-loader-pct]`, `[data-loader-skip]`, `[data-pen-tip]`, `[data-pen-fill]` hooks stay exactly as they are for `LoaderFx`.

- [ ] **Step 1: Remove the inline `style` prop** from the root `<div data-loader …>` (the one whose `background` is two `radial-gradient(...)` layers over `var(--ink)`) and add `bg-ink` to its `className`. Update the file's doc comment: the field is flat ink, no atmosphere.

- [ ] **Step 2: Verify the glows are gone in source**

Run: `grep -n "radial-gradient" components/intro/LoaderOverlay.tsx; echo "exit=$?"`
Expected: no matching lines, `exit=1`.

- [ ] **Step 3: Verify in the browser**

Run the dev server (see Environment), load `http://localhost:3001`, screenshot within the first second. Expected: flat ink background, the handwriting artwork, `000%`-style counter and `Skip →` exactly as before; no bright patches top-left or bottom-right.

- [ ] **Step 4: Commit**

```bash
git add components/intro/LoaderOverlay.tsx
git commit -m "Loader: flat ink field, no background glows"
```

---

### Task 2: Block alphabet module

**Files:**
- Create: `lib/block-letters.ts`
- Create: `lib/block-letters.test.ts`
- Modify: `tsconfig.json` (add `"allowImportingTsExtensions": true` under `compilerOptions`; valid because `noEmit` is already true — this also clears the pre-existing TS5097)

**Interfaces:**
- Produces (used by Tasks 4–5):

```ts
export const CAP = 100;          // cap height, units
export const SLIT = 3.7;         // gap between blocks and between letters, units
export const SLOT_W = 29.5;      // width of the trailing full-stop slot cell
export type BlockChar = "J" | "I" | "E" | "W" | "N" | "M" | "'";
export type Point = readonly [number, number];
export interface Glyph { readonly w: number; readonly polys: ReadonlyArray<ReadonlyArray<Point>>; }
export const GLYPHS: Readonly<Record<BlockChar, Glyph>>;
export function isBlockChar(ch: string): ch is BlockChar;
export function glyphOf(ch: string): Glyph;                     // throws RangeError(`No block glyph for "${ch}"`)
export function wordUnits(text: string, opts?: { trailingSlot?: boolean }): number;
export function pointsAttr(poly: ReadonlyArray<Point>): string;  // "x,y x,y …", numbers as-is (no trailing zeros)
```

- [ ] **Step 1: Write the failing tests**

Create `lib/block-letters.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { CAP, GLYPHS, SLIT, SLOT_W, glyphOf, isBlockChar, pointsAttr, wordUnits } from "./block-letters.ts";

const r1 = (n: number) => Math.round(n * 10) / 10;

test("constants match the reference system", () => {
  assert.equal(CAP, 100);
  assert.equal(SLIT, 3.7);
  assert.equal(SLOT_W, 29.5);
});

test("every polygon stays inside its glyph box", () => {
  for (const [ch, g] of Object.entries(GLYPHS)) {
    assert.ok(g.polys.length >= 1, ch);
    for (const poly of g.polys) {
      assert.ok(poly.length >= 4, `${ch}: a block needs at least 4 points`);
      for (const [x, y] of poly) {
        assert.ok(x >= 0 && x <= g.w, `${ch}: x ${x} outside 0..${g.w}`);
        assert.ok(y >= 0 && y <= CAP, `${ch}: y ${y} outside 0..${CAP}`);
      }
    }
  }
});

test("glyph widths", () => {
  assert.equal(GLYPHS.J.w, 105.7);
  assert.equal(GLYPHS.I.w, 51);
  assert.equal(GLYPHS.E.w, 105.7);
  assert.equal(GLYPHS.W.w, 160.4);
  assert.equal(GLYPHS.N.w, 105.7);
  assert.equal(GLYPHS.M.w, 105.7);
  assert.equal(GLYPHS["'"].w, 29.5);
});

test("word widths include slits and the optional slot", () => {
  assert.equal(r1(wordUnits("JIEWEN")), 652.7);
  assert.equal(r1(wordUnits("JIEWEN", { trailingSlot: true })), 685.9);
  assert.equal(r1(wordUnits("I'M")), 193.6);
});

test("unknown characters fail loudly", () => {
  assert.equal(isBlockChar("H"), false);
  assert.throws(() => glyphOf("H"), RangeError);
  assert.throws(() => wordUnits("JIEWEN HUANG"), RangeError);
});

test("pointsAttr formats an SVG points list", () => {
  assert.equal(pointsAttr([[0, 21.5], [21.5, 0], [51, 0]]), "0,21.5 21.5,0 51,0");
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `/bin/zsh -lc 'node --test lib/block-letters.test.ts'`
Expected: FAIL — cannot find module `./block-letters.ts`.

- [ ] **Step 3: Implement `lib/block-letters.ts`** with the exported names above and the glyph table copied *exactly* from spec §2.1 (J, I, E, W, N, M, apostrophe). `wordUnits` = sum of glyph widths + `SLIT × (cells − 1)`, where the trailing slot adds one more cell of `SLOT_W`. Add a file comment stating the system (cap 100 / slit 3.7 / chamfer 21.5 / block 51) and that the geometry was measured from the reference wordmark, not copied from a font.

- [ ] **Step 4: Add `allowImportingTsExtensions` to `tsconfig.json`**, then run the tests and the type check**

Run: `/bin/zsh -lc 'node --test lib/*.test.ts && npx tsc --noEmit'`
Expected: all tests PASS (the existing handwriting test included); `tsc` prints nothing.

- [ ] **Step 5: Commit**

```bash
git add lib/block-letters.ts lib/block-letters.test.ts tsconfig.json
git commit -m "Block alphabet: J I E W N M as chamfered block polygons"
```

---

### Task 3: Quotes, hero copy, and the rest-offset math

**Files:**
- Create: `lib/quotes.ts`, `lib/quotes.test.ts`
- Create: `lib/hero-intro-math.ts`, `lib/hero-intro-math.test.ts`
- Modify: `lib/resume-data.ts:7-20` (`identity`): add `heroLine: "Columbia University, Co'2030"`

**Interfaces:**
- Produces (used by Tasks 4–6):

```ts
// lib/quotes.ts
export interface Quote { readonly text: string; readonly author: string; readonly work?: string; }
export const QUOTES: readonly Quote[];            // spec §2.3, in that order, 12 entries
export const QUOTE_INTERVAL_MS = 7000;
export function nextQuoteIndex(current: number, count: number): number;   // (current + 1) % count

// lib/hero-intro-math.ts
export const REST_INSET_PX = 56;                  // clearance above the fixed bottom bar
export interface RestArgs { viewportHeight: number; lockupTop: number; lockupHeight: number; inset: number; }
export function bottomRestOffset(a: RestArgs): number;   // max(0, viewportHeight − inset − (lockupTop + lockupHeight))
```

- [ ] **Step 1: Write the failing tests**

`lib/quotes.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { QUOTES, QUOTE_INTERVAL_MS, nextQuoteIndex } from "./quotes.ts";

test("Sanderson opens, verbatim", () => {
  assert.equal(
    QUOTES[0].text,
    "The most important step a man can take. It's not the first one, is it? It's the next one. Always the next step…",
  );
  assert.equal(QUOTES[0].author, "Brandon Sanderson");
});

test("every quote is attributed", () => {
  assert.ok(QUOTES.length >= 10);
  for (const q of QUOTES) {
    assert.ok(q.text.trim().length > 0);
    assert.ok(q.author.trim().length > 0);
  }
});

test("cycle wraps", () => {
  assert.equal(QUOTE_INTERVAL_MS, 7000);
  assert.equal(nextQuoteIndex(0, 12), 1);
  assert.equal(nextQuoteIndex(11, 12), 0);
});
```

`lib/hero-intro-math.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { REST_INSET_PX, bottomRestOffset } from "./hero-intro-math.ts";

test("lockup drops to rest just above the bottom bar", () => {
  assert.equal(REST_INSET_PX, 56);
  assert.equal(bottomRestOffset({ viewportHeight: 900, lockupTop: 344, lockupHeight: 260, inset: 56 }), 240);
});

test("never negative on a short viewport", () => {
  assert.equal(bottomRestOffset({ viewportHeight: 360, lockupTop: 110, lockupHeight: 220, inset: 56 }), 0);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `/bin/zsh -lc 'node --test lib/quotes.test.ts lib/hero-intro-math.test.ts'`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement both modules and the `heroLine` field.** `QUOTES` is spec §2.3 verbatim (text, author, optional work). Keep the list a plain exported array with a comment that it is editable copy.

- [ ] **Step 4: Run tests + type check**

Run: `/bin/zsh -lc 'node --test lib/*.test.ts && npx tsc --noEmit'`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add lib/quotes.ts lib/quotes.test.ts lib/hero-intro-math.ts lib/hero-intro-math.test.ts lib/resume-data.ts
git commit -m "Hero copy: quote cycle data, school line, rest-offset math"
```

---

### Task 4: Replace the WebGL hero with the static block lockup

**Files:**
- Delete: `components/hero/HeroSpace.tsx`, `components/hero/HeroSpaceClient.tsx`, `components/hero/space-scene.ts`
- Create: `components/hero/BlockWord.tsx` (server component, no hooks)
- Create: `components/hero/QuoteBar.tsx` (`"use client"`; this task renders `QUOTES[0]` only)
- Create: `components/hero/HeroIntro.tsx` (`"use client"`; this task: handoff + final state only)
- Modify: `components/resume/Hero.tsx` (full rewrite)
- Modify: `app/globals.css` (delete the `[data-hero-divider]` rule at the end of the file; add the hero rules below)
- Modify: `lib/load-orchestrator.ts:14-21` (`LoadTask`, `WEIGHTS`)
- Modify: `package.json` + lockfile via `npm uninstall`
- Read before editing: the three Next docs in *Environment*

**Interfaces:**
- Consumes: `GLYPHS`, `SLIT`, `SLOT_W`, `wordUnits`, `pointsAttr`, `glyphOf` (Task 2); `QUOTES` (Task 3); `identity.heroLine` (Task 3); `orchestrator`, `useIntroStore`, `gsap/useGSAP/ScrollTrigger` from `@/lib/gsap`.
- Produces (DOM contract for Tasks 5–7 and the square actor):

```tsx
// components/hero/BlockWord.tsx
interface BlockWordProps { text: string; trailingSlot?: boolean; label?: string; className?: string; }
export function BlockWord(props: BlockWordProps): JSX.Element;
```

Rendered structure (attribute names are the contract):

```html
<span data-block-word role="img" aria-label="{label ?? text}" class="block w-full {className}" style="aspect-ratio: {units} / 100">
  <span class="flex h-full w-full" style="gap: {SLIT / units * 100}%">
    <!-- one per character -->
    <span data-block-cell class="relative block h-full shrink-0 overflow-hidden" style="width: {w / units * 100}%">
      <span data-block-letter class="block h-full w-full will-change-transform">
        <svg viewBox="0 0 {w} 100" preserveAspectRatio="none" class="block h-full w-full" aria-hidden="true" focusable="false">
          <polygon points="{pointsAttr(poly)}" fill="currentColor" />  <!-- one per poly -->
        </svg>
      </span>
    </span>
    <!-- only when trailingSlot -->
    <span data-block-cell class="relative block h-full shrink-0" style="width: {SLOT_W / units * 100}%">
      <span data-sq-slot aria-hidden="true" class="pointer-events-none absolute bottom-0 left-0 w-full" style="aspect-ratio: 1 / 1"></span>
    </span>
  </span>
</span>
```

`preserveAspectRatio="none"` is safe because each cell's box is w : 100 by construction (container aspect = units / 100, cell width = w / units of it).

Hero DOM (`components/resume/Hero.tsx`):

```html
<section id="hero" data-section="hero" class="relative z-0 h-svh overflow-hidden bg-ink text-bone">
  <h1 class="sr-only">I'm Jiewen Huang</h1>
  <div data-hero-im aria-hidden="true" class="absolute left-4 top-[3.25rem] w-[clamp(96px,11vw,180px)] sm:left-6 sm:top-14">
    <BlockWord text="I'M" />
  </div>
  <div class="absolute inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-6">   <!-- centring wrapper; GSAP never touches it -->
    <div data-hero-lockup class="will-change-transform">
      <BlockWord text="JIEWEN" trailingSlot label="JIEWEN" />
      <div data-hero-bar="quote" class="hero-bar mt-[clamp(2px,0.55vw,9px)] w-full"> <QuoteBar /> </div>
      <div data-hero-bar="school" class="hero-bar ml-[50%] mt-[clamp(2px,0.55vw,9px)] w-fit min-w-[26%] max-w-[50%]">
        <span class="line-mask"><span data-hero-line class="block whitespace-nowrap">{identity.heroLine}</span></span>
      </div>
    </div>
  </div>
  <HeroIntro />
</section>
```

`QuoteBar` renders (Task 6 adds cycling, same markup):

```html
<span class="line-mask">
  <span data-hero-line data-quote-swap class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0">
    <q data-quote-text class="[quotes:none]">{text}</q>
    <span data-quote-author class="lbl opacity-70">— {author}</span>
  </span>
</span>
```

CSS added to `app/globals.css` (replace the deleted divider block):

```css
/* --------------------------------------------------- block-letter hero -- */
.hero-bar {
  background: var(--bone);
  color: var(--ink);
  padding: 0.35em 0.75em;
  font-weight: 500;
  font-size: clamp(0.72rem, 0.95vw, 0.9rem);
  line-height: 1.3;
}
@media (max-width: 639px) {
  [data-hero-bar="quote"] { min-height: calc(2 * 1.3em + 0.7em); }   /* two lines + padding: no jump between quotes */
}
.line-mask { display: block; overflow: hidden; }

/* Pre-hydration gate: nothing in the hero may flash while the loader is up.
   GSAP's inline styles win the moment the intro (or finalState) runs. */
html[data-intro="play"] [data-section="hero"] [data-block-letter],
html[data-intro="play"] [data-section="hero"] [data-hero-line] { transform: translateY(115%); }
html[data-intro="play"] [data-hero-bar] { opacity: 0; }
```

`HeroIntro` (this task) — signature and behaviour:

```ts
export function HeroIntro(): null
// useGSAP(() => {
//   query: hero, im letters = '[data-hero-im] [data-block-letter]', name letters = '[data-hero-lockup] [data-block-letter]',
//          lockup = '[data-hero-lockup]', bars = '[data-hero-bar]', lines = '[data-hero-lockup] [data-hero-line]'
//   finalState(): gsap.set([...imLetters, ...nameLetters, ...lines], { yPercent: 0 }); gsap.set(bars, { autoAlpha: 1 });
//                 gsap.set(lockup, { y: 0 }); docEl.dataset.intro = "done"; useIntroStore.getState().setPhase("done"); ScrollTrigger.refresh();
//   document.fonts.ready.then(() => orchestrator.set("hero", 1));
//   if (reduced motion || docEl.dataset.intro === "skip") { orchestrator.completeAll(); finalState(); return; }
//   phase === "reveal" | "skipped" | "done" → finalState()   (Task 5 swaps the "reveal" branch for playIntro)
//   else subscribe to useIntroStore until one of those phases arrives; unsubscribe in cleanup.
// })
```

`lib/load-orchestrator.ts`: `export type LoadTask = "fonts" | "textures" | "hero";` with `WEIGHTS = { fonts: 0.3, textures: 0.45, hero: 0.25 }`; update the doc comment (the dissolve's `chunk`/`compile` are gone).

- [ ] **Step 1: Delete the WebGL hero and its dependencies**

```bash
git rm components/hero/HeroSpace.tsx components/hero/HeroSpaceClient.tsx components/hero/space-scene.ts
/bin/zsh -lc 'npm uninstall three @react-three/drei @react-three/fiber @react-three/postprocessing postprocessing maath'
grep -rn "three\|HeroSpace\|space-scene" --include='*.ts' --include='*.tsx' app components lib
```
Expected: the grep prints nothing.

- [ ] **Step 2: Narrow `LoadTask`** in `lib/load-orchestrator.ts` as specified. `LoaderFx` only sets `fonts`/`textures`, so it compiles unchanged.

- [ ] **Step 3: Create `BlockWord.tsx`** per the contract. It is a server component: no `"use client"`, no hooks, pure markup from `GLYPHS`. Throw (via `glyphOf`) on unknown characters.

- [ ] **Step 4: Create `QuoteBar.tsx`** (`"use client"`) rendering `QUOTES[0]` with the markup above. No state yet.

- [ ] **Step 5: Create `HeroIntro.tsx`** with the handoff/final-state behaviour above (no timeline yet).

- [ ] **Step 6: Rewrite `Hero.tsx`** to the DOM above (drop `IM`/`NAME` arrays, divider, corner matter, `HeroSpaceClient`, the unused `identity` import becomes used for `heroLine`).

- [ ] **Step 7: Update `globals.css`**: delete the `html[data-intro="play"] [data-hero-divider]` rule and its comment; append the block above.

- [ ] **Step 8: Static checks**

Run: `/bin/zsh -lc 'npm run lint && npx tsc --noEmit && node --test lib/*.test.ts'`
Expected: lint 0 errors (only the gen-sketch warning remains), tsc clean, tests pass.

- [ ] **Step 9: Build**

Run: `/bin/zsh -lc 'npm run build 2>&1 | tail -20'`
Expected: `✓` static export of `/`, `/resume-print`, `/_not-found`; no errors.

- [ ] **Step 10: Browser check (final state only)**

Load `http://localhost:3001` at ~1440 × 900 and at 390 × 844 (`resize_window` mobile). After the loader exits, expected: I'M small top-left under the nav; JIEWEN. spanning the gutters, vertically centred; bar 1 full width with the Sanderson quote and `— BRANDON SANDERSON` right-aligned (wrapping under on the phone); bar 2 starting at the horizontal centre with `Columbia University, Co'2030`; the square actor floats in and lands as the full stop. Read `document.documentElement.dataset.intro` → `"done"`. No divider, no `( jee-WEN )`, no `BROOKLYN`.

- [ ] **Step 11: Commit**

```bash
git add -A components/hero components/resume/Hero.tsx app/globals.css lib/load-orchestrator.ts package.json package-lock.json
git commit -m "Hero: block-letter JIEWEN lockup with quote and school bars; WebGL dissolve removed"
```

---

### Task 5: Intro choreography

**Files:**
- Modify: `components/hero/HeroIntro.tsx` (add `playIntro`)

**Interfaces:**
- Consumes: `bottomRestOffset`, `REST_INSET_PX` (Task 3); the DOM contract of Task 4.
- Produces: `html[data-intro]` → `"done"` and store phase `"done"` after the timeline; `ScrollTrigger.refresh()` after.

- [ ] **Step 1: Implement `playIntro()`** and wire it to the `"reveal"` phase (both the immediate check and the subscription). Fallbacks stay on `finalState()`: `"skipped"`, `"done"`, and `window.scrollY > window.innerHeight * 0.4` at reveal time.

Setup before the timeline (one `gsap.set` each): im letters `yPercent: 110`; name letters `yPercent: 110`; bars `autoAlpha: 0`; lines `yPercent: 110`; lockup `y: rest` where

```ts
const r = lockup.getBoundingClientRect();
const rest = bottomRestOffset({ viewportHeight: window.innerHeight, lockupTop: r.top, lockupHeight: r.height, inset: REST_INSET_PX });
```

Timeline (`gsap.timeline({ onComplete })`, absolute positions, spec §3.1 verbatim):

```ts
tl.to(imLetters,   { yPercent: 0, duration: 0.70, ease: "power3.out",   stagger: 0.08  }, 0.00)
  .to(nameLetters, { yPercent: 0, duration: 0.95, ease: "power3.out",   stagger: 0.085 }, 0.25)
  .to(bars,        { autoAlpha: 1, duration: 0.50, ease: "power2.out"                   }, 0.75)
  .to(lines,       { yPercent: 0, duration: 0.70, ease: "power3.out",   stagger: 0.06  }, 0.92)
  .to(lockup,      { y: 0, duration: 1.05, ease: "power3.inOut"                          }, 1.65);
```

`onComplete`: `docEl.dataset.intro = "done"; useIntroStore.getState().setPhase("done"); ScrollTrigger.refresh();`. Kill the timeline in the `useGSAP` cleanup.

- [ ] **Step 2: Static checks**

Run: `/bin/zsh -lc 'npm run lint && npx tsc --noEmit'`
Expected: clean.

- [ ] **Step 3: Browser replay at 1440 × 900**

Load, let the loader finish, screenshot at ~0.3 s intervals for 3 s (batch `screenshot`/`wait` pairs). Expected sequence: I'M rises first; JIEWEN letters climb out of the bottom of the screen left→right with the lockup resting ~56 px above the bottom; both bars fade in and their text rises; the lockup floats up and settles centred at ≈1.65–2.7 s. Confirm with `javascript_tool`: `[...document.querySelectorAll('[data-hero-lockup] [data-block-letter]')].every(e => getComputedStyle(e).transform === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(getComputedStyle(e).transform))` → `true`, and `dataset.intro === "done"`.

- [ ] **Step 4: Skip and mid-page fallbacks**

Reload, click `Skip →` during the loader → final state immediately (no rise). Then scroll ~1 viewport down and reload → no intro, page stays where it was (scroll restoration) and the hero is already faded (after Task 7) or at least in final state now.

- [ ] **Step 5: Pre-hydration gate**

Immediately after `navigate` (while the loader is still up and `dataset.intro === "play"`), run with `javascript_tool`:

```js
const el = document.querySelector('[data-hero-lockup] [data-block-letter]');
const bar = document.querySelector('[data-hero-bar]');
({ intro: document.documentElement.dataset.intro, letter: getComputedStyle(el).transform, bar: getComputedStyle(bar).opacity })
```

Expected: `intro: "play"`, `letter` a matrix whose last value (ty) is positive (the CSS `translateY(115%)` gate, or GSAP's `yPercent: 110` once set), `bar: "0"`. Then screenshot every 0.2 s across the loader's exit: no frame shows JIEWEN standing still before the rise begins.

- [ ] **Step 6: Commit**

```bash
git add components/hero/HeroIntro.tsx
git commit -m "Hero intro: letters rise out of the bottom edge, bars fade in, lockup floats to centre"
```

---

### Task 6: Quote cycling

**Files:**
- Modify: `components/hero/QuoteBar.tsx`

**Interfaces:**
- Consumes: `QUOTES`, `QUOTE_INTERVAL_MS`, `nextQuoteIndex` (Task 3); `useIntroStore` phase; `gsap`.
- Produces: same markup as Task 4; `[data-quote-swap]` is the element whose opacity/y the swap animates.

- [ ] **Step 1: Implement cycling.** `const [index, setIndex] = useState(0)`; a `useEffect` keyed on the store phase: when phase is `"done"`, start `setInterval(QUOTE_INTERVAL_MS)`; each tick runs the swap: `gsap.to(swapEl, { autoAlpha: 0, y: -6, duration: 0.35, ease: "power2.in", onComplete: () => { setIndex(i => nextQuoteIndex(i, QUOTES.length)); gsap.fromTo(swapEl, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }); } })`. Under `prefers-reduced-motion: reduce`, swap instantly (`setIndex` only). Clear the interval and kill tweens on cleanup. Guard: no interval while phase is not `"done"` (Review Focus 4).

- [ ] **Step 2: Static checks**

Run: `/bin/zsh -lc 'npm run lint && npx tsc --noEmit'`
Expected: clean.

- [ ] **Step 3: Browser check**

Load, wait for the intro to finish, then `wait 7` + screenshot twice. Expected: bar 1 shows Beckett (`My mistakes are my life.`) after the first swap and `Ever tried. Ever failed…` after the second; the swap is a fade with a 6 px drift, the bar height does not jump at ≥ 640 px. Also read `document.querySelector('[data-quote-text]').textContent` right after the loader exits and 3 s later: unchanged (no swap during the intro).

- [ ] **Step 4: Commit**

```bash
git add components/hero/QuoteBar.tsx
git commit -m "Quote bar cycles Sanderson, Beckett, Brown and company every seven seconds"
```

---

### Task 7: Pin the hero and fade it under the scrolling sections

**Files:**
- Modify: `components/resume/Hero.tsx` (section classes)
- Modify: `components/resume/Sections.tsx` (`Sweeps` + `Resume`)
- Modify: `components/hero/HeroIntro.tsx` (scroll fade)
- Modify: `app/globals.css` (reduced-motion fallback)

**Interfaces:**
- Consumes: Task 4 DOM; `ScrollTrigger`.
- Produces: the hero as a `sticky top-0 z-0` layer; all following sections inside `<div class="relative z-10">`.

- [ ] **Step 1: Hero section classes** → `sticky top-0 z-0 h-svh overflow-hidden bg-ink text-bone` (replace `relative`).

- [ ] **Step 2: `Sections.tsx`**: in `Resume()`, wrap `<Sweeps/>…<Contact/>` (everything except `<Hero/>`) in `<div className="relative z-10">`. In `Sweeps()`, replace `band-ink` on the section with `text-bone` (transparent background so SHIPPING / SUNSET PARK overlap the fading name); keep `data-band`.

- [ ] **Step 3: Scroll fade in `HeroIntro`** inside `gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", …)`:

```ts
gsap.fromTo([lockup, im], { autoAlpha: 1 }, {
  autoAlpha: 0, ease: "none",
  scrollTrigger: { start: 0, end: () => window.innerHeight * 0.85, scrub: 0.3, invalidateOnRefresh: true },
});
```
(`im` = `[data-hero-im]`.) Numeric `start`/`end` need no trigger element. Register it regardless of intro phase so a mid-page reload is already faded.

- [ ] **Step 4: Reduced-motion CSS** in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  [data-section="hero"] { position: relative; }
}
```

- [ ] **Step 5: Static checks + build**

Run: `/bin/zsh -lc 'npm run lint && npx tsc --noEmit && npm run build 2>&1 | tail -8'`
Expected: clean, build succeeds.

- [ ] **Step 6: Browser replay**

At 1440 × 900 after the intro: scroll 300 px → JIEWEN still in place, partially transparent, SHIPPING sliding up over it; scroll to 1 viewport → `getComputedStyle(document.querySelector('[data-hero-lockup]')).visibility === 'hidden'`; TRAJECTORY band fully opaque above it; the square actor lands in TRAJECTORY's missing O as before. Scroll back to 0 → JIEWEN fully visible again (Review Focus 5). Click `EXPERIENCE` in the TopBar → lands on the horizontal chapter as before. Repeat the scroll at 390 × 844.

- [ ] **Step 7: Commit**

```bash
git add components/resume/Hero.tsx components/resume/Sections.tsx components/hero/HeroIntro.tsx app/globals.css
git commit -m "Hero stays pinned and fades as the sections scroll over it"
```

---

### Task 8: Final verification and notes

**Files:**
- Modify: `docs/motion-study.md` (append two lines under *Mapping to the overhaul*: the hero is now the block-letter lockup; the pixel-dissolve is retired; link the spec)

- [ ] **Step 1: Full check**

Run: `/bin/zsh -lc 'node --test lib/*.test.ts && npm run lint && npx tsc --noEmit && npm run build 2>&1 | tail -8'`
Expected: all pass.

- [ ] **Step 2: End-to-end replay** (desktop and phone): loader without glows → intro → quote swap → scroll fade → square actor through TRAJECTORY → EXPERIENCE pin → deck → contact. Nothing below the hero changed.

- [ ] **Step 3: Grep for leftovers**

Run: `grep -rn "hero-divider\|hero-fade\|hero-word\|HeroSpace\|uScroll" --include='*.ts' --include='*.tsx' --include='*.css' app components lib; echo "exit=$?"`
Expected: `exit=1`.

- [ ] **Step 4: Commit**

```bash
git add docs/motion-study.md
git commit -m "Motion study: note the block-letter hero"
```
