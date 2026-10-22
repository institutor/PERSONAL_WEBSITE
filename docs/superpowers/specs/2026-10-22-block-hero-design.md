# Block-letter hero + quote bar — design spec

Written 2026-10-22 from Jiewen's brief and a frame-by-frame study of the
reference recording (`Screen Recording 2026-10-21 at 11.44.46 PM.mov`, a
5.5 s capture of format.obys.agency reloading). The brief is quoted where it
pins a decision; everything else here is a design decision made to carry it
out and is open to correction.

## Goal

1. Loader: remove the two soft light spots that glow (and grow during the exit
   scale) in the preloader background.
2. Hero: replace the Inter "I'm / divider / JIEWEN" title screen and its WebGL
   pixel-dissolve with a lockup drawn in the reference's modular block
   letterforms: a small **I'M** top-left, then **JIEWEN** rising letter by letter
   from the bottom, a bone "underline" bar fading in beneath it carrying a
   cycling quote, a shorter second bar beneath that carrying
   `Columbia University, Co'2030`, and the whole JIEWEN lockup floating up to the
   middle of the screen. The old full-width divider rule is deleted.
3. Scroll: the hero no longer dissolves. It stays put while the next sections
   slide up over it, and it fades to nothing as they do.

## 1 · What the reference does (measured)

Source: the live page's inline SVG (`viewBox 0 0 1401 215`) and its GSAP intro.

**Letterforms.** Every glyph is a set of 1–3 solid blocks separated by thin
slits; no block ever touches another. Curves and stroke terminals are 45°
chamfers. Per 100 units of cap height:

| part                            | units |
| ------------------------------- | ----- |
| slit between blocks AND between letters | 3.7 |
| half-block (stem) width         | 51.0  |
| standard letter width (2 blocks + slit) | 105.7 |
| chamfer (terminals, curves)     | 21.5  |
| arm block height (F arms)       | 37.2  |
| R's leg diagonal cut            | 33    |

Construction logic observed: F = chamfered stem + two stacked arm blocks, with
the bottom-right of the cell left empty. O = two mirrored half-octagons. M = two
blocks with chamfers on the *inner-top* corners (a shallow V notch). A = the
same two blocks with chamfers on the *outer-top* corners. T = two narrow stems
each with a half-height outer ear. The word is one continuous bar of light with
dark slits; letter cells are near-square (1.056 : 1).

**Intro choreography** (GSAP, times in seconds from the curtain's start):

| t    | what                                                        | ease / duration |
| ---- | ----------------------------------------------------------- | --------------- |
| 0.00 | white curtain collapses upward (`scaleY → 0`)               | power3.inOut · 0.90 |
| 0.34 | letters `y: +1.08×cap → 0`, left to right                   | power3.out · 0.95 · stagger 0.085 |
| 0.75 | bar + box `scaleY 0 → 1` from the top                       | power2.out · 0.50 |
| 0.92 | bar text lines rise inside their own line masks             | power3.out · 0.70 · stagger 0.06 |
| 1.65 | whole lockup floats from its bottom rest to its home        | power3.inOut · 1.05 |

The lockup rests with its bottom ~20 px above the viewport bottom before the
float. Letters are clipped by the SVG viewport while rising (a mask at the
word's own box, which at bottom-rest reads as rising out of the screen edge).

**Bar system** (per 1440 px viewport): bar = full lockup width, 16 px tall,
white with 12 px black grotesk text; gap of 9 px between word and bar (≈ the
slit); box = second bar starting at the lockup's horizontal centre, 25 % of the
lockup width, 29 px tall, holding a two-line note. Text sits in masks and rises.

On phones the reference keeps a single full-width row (~58 px tall) and
shows a "designed for desktop" note. We keep the single row too.

## 2 · Our lockup

### 2.1 Glyph alphabet (`lib/block-letters.ts`)

Cap height 100 units; `SLIT = 3.7`, `CHAMFER = 21.5`, `BLOCK = 51`,
`LETTER = 105.7`, `ARM = 30.87` (three arms + two slits = 100), `N_CUT = 36`.
Polygons are listed as `[x, y]` with y down. Each glyph: `{ w, polys }`.

- **J** (w 105.7): stem `(54.7,0)(105.7,0)(105.7,78.5)(84.2,100)(54.7,100)`;
  hook `(0,62.8)(51,62.8)(51,100)(21.5,100)(0,78.5)`. Both bottom corners
  chamfered: the curve of the J.
- **I** (w 51): `(0,21.5)(21.5,0)(51,0)(51,100)(0,100)` — the reference F stem.
- **E** (w 105.7): stem `(0,21.5)(21.5,0)(51,0)(51,100)(0,100)`; top arm
  `(54.7,0)(84.2,0)(105.7,21.5)(105.7,30.87)(54.7,30.87)`; middle arm, shorter,
  `(54.7,34.57)(92,34.57)(92,65.43)(54.7,65.43)`; bottom arm
  `(54.7,69.13)(105.7,69.13)(105.7,78.5)(84.2,100)(54.7,100)`.
- **W** (w 160.4, three blocks): left tooth `(0,0)(51,0)(51,100)(21.5,100)(0,78.5)`;
  middle tooth, lower and peaked,
  `(54.7,52.37)(76.2,30.87)(84.2,30.87)(105.7,52.37)(105.7,100)(54.7,100)`;
  right tooth `(109.4,0)(160.4,0)(160.4,78.5)(138.9,100)(109.4,100)`.
- **N** (w 105.7): left block with a big top-right cut
  `(0,0)(15,0)(51,36)(51,100)(0,100)`; right block with a big bottom-left cut
  `(54.7,0)(105.7,0)(105.7,100)(90.7,100)(54.7,64)`. The two cuts plus the slit
  read as the diagonal.
- **M** (w 105.7, the reference's M): `(0,0)(29.5,0)(51,21.5)(51,100)(0,100)` and
  `(54.7,21.5)(76.2,0)(105.7,0)(105.7,100)(54.7,100)`.
- **'** (w 29.5, apostrophe): `(0,0)(29.5,0)(29.5,21.5)(8,43)(0,43)`.
- **Full stop** (w 29.5): not a polygon — a `[data-sq-slot]` square 29.5 × 29.5
  on the baseline. The square actor is still born as the full stop of
  `I'M JIEWEN.` (commit e74274f's idea survives).

Word widths: `JIEWEN.` = 685.9 units (aspect 6.859 : 1); `I'M` = 193.6.
A rendering of this alphabet was reviewed during planning and reads as
JIEWEN at a glance; the N is the only glyph with any ambiguity and is
accepted as the "abstract choice" the brief asks for.

### 2.2 Composition (desktop, 1440 × 900 reference)

```
┌────────────────────────────────────────────────────────────────┐
│ TRAJECTORY  EXPERIENCE  …                              (chrome) │
│ ▮'▮▮  ← I'M, width clamp(96px, 11vw, 180px), left gutter, y 52px│
│                                                                 │
│                                                                 │
│ ▐██▌▐█▌▐███▌▐█████▌▐███▌▐██▌ ■      ← JIEWEN. full width,       │
│ ▐██▌▐█▌▐███▌▐█████▌▐███▌▐██▌        vertically centred, ~211px │
│ ▌ The most important step a man can take… — BRANDON SANDERSON ▐│ bar 1
│                        ▌ Columbia University, Co'2030 ▐         │ bar 2
│                                                                 │
│ (GH) (IN) (@)                                     00:00:00 (chrome) │
└────────────────────────────────────────────────────────────────┘
```

- Gutters: 16 px (phones) / 24 px (≥ sm) — the TopBar's own gutters.
- **I'M**: `BlockWord` text `I'M`, absolutely positioned top-left under the
  TopBar (`top: 3.25rem`, sm `3.5rem`). It stays there; it does not float.
- **JIEWEN. lockup** (`[data-hero-lockup]`): `BlockWord` text `JIEWEN` with the
  trailing full-stop slot cell, width 100 % of the gutter box, then bar 1,
  then bar 2. Its outer wrapper is centred with `top: 50%; translateY(-50%)`;
  the inner element is what GSAP moves.
- **Bar 1** (`[data-hero-bar="quote"]`): width 100 %; background bone, text
  ink; `margin-top: clamp(2px, 0.55vw, 9px)` (the slit); padding
  `0.35em 0.75em`; Inter 500 `clamp(0.72rem, 0.95vw, 0.9rem)`, line-height 1.3;
  flex row, baseline-aligned: quote text left, attribution right as caps
  (`.lbl` size, 0.7 opacity) prefixed with an em dash. Below 640 px the
  attribution wraps under the quote and the bar reserves two lines.
- **Bar 2** (`[data-hero-bar="school"]`): `margin-left: 50%; width: fit-content;
  min-width: 26%; max-width: 50%`; same gap, padding and type; text exactly
  `Columbia University, Co'2030` (editable copy in `lib/resume-data.ts`
  as `identity.heroLine`).
- Nothing else in the hero: the `( jee-WEN )` and `BROOKLYN, NEW YORK` corner
  matter and the divider rule are removed with the old hero.

### 2.3 Quotes (`lib/quotes.ts`)

Shown one at a time in bar 1, in this order, 7 s each, looping. Swap =
old line fades out and drifts up 6 px (0.35 s), new line fades in rising 6 px
(0.45 s, power3.out). Cycling starts only once the intro reports `done`.

1. Brandon Sanderson — "The most important step a man can take. It's not the
   first one, is it? It's the next one. Always the next step…" (verbatim from
   the brief)
2. Samuel Beckett — "My mistakes are my life."
3. Samuel Beckett, *Worstward Ho* — "Ever tried. Ever failed. No matter. Try
   again. Fail again. Fail better."
4. Pierce Brown, *Red Rising* — "I would have lived in peace. But my enemies
   brought me war."
5. Pierce Brown, *Red Rising* — "A man thinks he can fly, but he is afraid to
   jump. A poor friend pushes him from behind. A good friend jumps with."
6. Albert Camus, *The Myth of Sisyphus* — "One must imagine Sisyphus happy."
7. Marcus Aurelius, *Meditations* — "What stands in the way becomes the way."
8. Friedrich Nietzsche — "He who has a why to live can bear almost any how."
9. Søren Kierkegaard — "Life can only be understood backwards; but it must be
   lived forwards."
10. Rainer Maria Rilke — "Let everything happen to you: beauty and terror. Just
    keep going. No feeling is final."
11. Fyodor Dostoevsky, *The Brothers Karamazov* — "The mystery of human
    existence lies not in just staying alive, but in finding something to live
    for."
12. Brandon Sanderson, *The Way of Kings* — "Life before death. Strength before
    weakness. Journey before destination."

The list is data; Jiewen edits it freely.

## 3 · Motion

### 3.1 Intro (after the loader's exit sets phase `reveal`)

All letters are masked at their own cell (`overflow: hidden` on each letter
cell), exactly like the reference's SVG viewport. Times from the start of the
hero timeline:

| t    | element                     | from → to                       | ease · dur · stagger |
| ---- | --------------------------- | ------------------------------- | -------------------- |
| 0.00 | I'M letters (3 cells)       | `yPercent 110 → 0`              | power3.out · 0.70 · 0.08 |
| 0.25 | JIEWEN letters (6 cells)    | `yPercent 110 → 0`, L → R       | power3.out · 0.95 · 0.085 |
| 0.75 | bar 1, bar 2                | `autoAlpha 0 → 1`               | power2.out · 0.50 |
| 0.92 | bar text lines (quote, attribution, school) | `yPercent 110 → 0` inside line masks | power3.out · 0.70 · 0.06 |
| 1.65 | `[data-hero-lockup]`        | `y: restOffset → 0`             | power3.inOut · 1.05 |

`restOffset` = how far down the lockup must sit so its bottom edge is
`inset` px above the viewport bottom: `viewportHeight − inset − (lockupTop +
lockupHeight)` measured with the lockup at its home position (inset = 56 px,
clear of the fixed bottom bar). Computed once at intro start; a resize during
the ~2.7 s intro is ignored.

While the lockup is at bottom-rest the letters rise inside their cells, which
at that position reads as rising out of the bottom of the screen — the
reference's exact look — and the full-stop slot is already in place for the
square actor to float into.

On complete: `html[data-intro] = "done"`, intro store phase `done`,
`ScrollTrigger.refresh()`.

**Skip / already scrolled / reduced motion**: jump straight to the final state
(all visible, lockup at home) with no tweens, then the same handoff.

**Before hydration** (`html[data-intro="play"]`): letters sit at
`translateY(115%)` and bars at `opacity: 0` via CSS so nothing flashes; GSAP's
inline styles take over on the first tween (the existing `[data-tl]` pattern).
`data-intro="skip"` and no-JS render the final state.

### 3.2 Scroll

- The hero section becomes `position: sticky; top: 0; height: 100svh;
  overflow: hidden; z-index: 0` with its own ink background.
- Everything after it is wrapped in a `relative z-10` block so the following
  sections slide over the pinned hero. The first of them, the SHIPPING /
  SUNSET PARK sweeps band, loses its opaque band background so its lines
  visibly overlap JIEWEN; later bands keep theirs.
- A scrubbed ScrollTrigger (scrub 0.3) over the first 85 % of a viewport of
  scroll takes `[data-hero-lockup]` and the I'M mark from `autoAlpha 1 → 0`.
  At 0 they are `visibility: hidden`. Scrolling back restores them.
- The square actor is untouched: its first slot is still in the hero; it reads
  slot rects live each frame, so it leaves the fading word and flies to
  TRAJECTORY as before.
- Reduced motion: the hero is a normal in-flow section (no sticky, no fade),
  matching the rest of ScrollFx.

### 3.3 Loader

`components/intro/LoaderOverlay.tsx`: the overlay background becomes plain
`var(--ink)`; the two `radial-gradient` glows are deleted. Nothing else about
the loader changes (artwork, percentage, Skip, exit scale/fade).

## 4 · Code that goes away

- `components/hero/HeroSpace.tsx`, `HeroSpaceClient.tsx`, `space-scene.ts`
  (WebGL dissolve) and the `three` dependency. `@react-three/drei`,
  `@react-three/fiber`, `@react-three/postprocessing`, `postprocessing`,
  `maath` are not imported anywhere and go in the same commit.
- `[data-hero-divider]` markup and its CSS gate; `[data-hero-fade]` corner
  matter.
- `LoadTask` loses `chunk` and `compile` (the dissolve's chunk + shader
  compile) and gains `hero` (hero intro mounted and the display measured):
  weights `fonts 0.3 · textures 0.45 · hero 0.25`.

## 5 · Non-goals

- No new font. The block letters are SVG polygons; bar text stays Inter.
- No change to the loader artwork, TopBar/BottomBar, Sweeps content, the
  square actor's journey, or any section below the hero.
- No two-row phone layout; the single row scales down like the reference.

## 6 · Verification

- `node --test lib/*.test.ts` (block-letters bounds/widths, quotes, rest offset).
- `npm run lint`, `npx tsc --noEmit`, `npm run build` (static export).
- Browser replay at 1440 × 900 and 390 × 844: loader without glows → I'M rises →
  JIEWEN rises L→R at the bottom → bars fade in → lockup floats to centre →
  scroll: SHIPPING slides over a fading JIEWEN; square actor still lands in
  TRAJECTORY's O. Skip, reload-mid-page, and reduced-motion each land on the
  final state.
