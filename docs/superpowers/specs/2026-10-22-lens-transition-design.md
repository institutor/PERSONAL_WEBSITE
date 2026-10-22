# Lens transition (hero → TRAJECTORY) — design spec

Written 2026-10-22 from Jiewen's brief, on top of the block-letter hero that
landed earlier today (commits d928f87…596402c). Quoted words are the brief;
the rest are decisions made to carry it out and are open to correction.

## Goal

1. Delete the SHIPPING / SUNSET PARK → MORNINGSIDE HEIGHTS sweeps band and the
   rule between them. "It looks not very good."
2. In its place, a scroll-driven **lens**: "as the square becomes a circle,
   we're actually going to have a morph and get larger and larger, and as it
   gets larger smaller circles of the exact inverted color will appear within
   the circle and those will get larger too — a white circle, then a black
   circle inside the white circle, then a white circle inside the black circle
   inside the white circle, then a black circle inside the white circle inside
   the black circle inside the white circle." Then it "gives way to the next
   portion of the page (trajectory), as if it were some sort of lens, with one
   more white circle centered on the O in trajectory."

"White" is bone `#e8e3d8`, "black" is ink `#0a0a0c` (the site's two colours).

## What exists today (measured at 1024 × 768)

- Hero: sticky z-0 layer, 100 svh in flow, lockup fading to nothing over the
  first 0.85 svh of scroll (`HeroIntro`).
- Sweeps: a transparent 687 px band scrolling over the fading hero.
- Trajectory: `Band` section (ink), natural top at hero + sweeps = 1455 px,
  height 851 px. Its `GapTitle` TRAJECTORY has the O knocked out; that
  `[data-sq-slot]` centre sits at x = 64 % of the viewport width and 196 px
  below the section's top (23 % of the section), slot width 96 px. A second
  hidden-on-phones slot (36 vh square) sits at right 8 % / top 74 %.
- Square actor (`SquareActor`): one fixed 24 px element at z-8, lerped toward
  the current slot; born a square at the hero's full stop; `squareMorph` spins
  it into a circle across the first flight (full stop → TRAJECTORY's O) and
  back into a square on the last (→ BU■LD). Marks are measured from each slot's
  natural document position (plus `heroShift` for the sticky hero).

## Design

### Structure

```
<main>
  <Hero/>                                   sticky z-0, 100svh in flow
  <div class="relative">                    (unchanged wrapper, no z-index)
    <div data-lens-wrap data-band class="relative">          natural top = 100svh
      <span id="trajectory" style="top: var(--lens-length)"/> nav anchor at the lens end
      <section data-lens-stage class="sticky top-0 z-[2] …">  Trajectory, transparent bg
        <div data-lens-window class="bg-ink …">               all Trajectory content; clip-path circle
      </section>
      <div data-lens-spacer style="height: var(--lens-length)"/>   the extra scroll the section stays stuck
    </div>
    <ExperienceHorizontal/> <CardDeck/> <Contact/>              unchanged
  </div>
</main>
<LensFx/>   fixed inset-0 z-[1] pointer-events-none: three disks (A bone, B ink, C bone)
```

`--lens-length: 160svh`. Trajectory sticks at the top for that much scroll;
during it the lens opens. The `data-band` moves from the section to the
wrapper so ScrollFx's title/ticker triggers measure a normal-flow element, not
the sticky one. The section loses `band-ink` (transparent while the window is
closed); the window carries the ink background inside the clip, so after the
lens it looks exactly like today's band.

### Progress

`p = clamp((scrollY − S0) / (S1 − S0), 0, 1)` with
`S0 = 0.2 × viewportHeight` (the actor is still dwelling at the full stop and
JIEWEN is only 24 % faded, so the growing circle overlaps the name) and
`S1 = wrapTop + lensLength` (the scroll at which Trajectory unsticks). At
1024 × 768: S0 = 154 px, S1 = 768 + 1229 = 1997 px, range ≈ 2.4 viewports.

### Lens centre and cover radius

Centre `(cx, cy)` = the O slot's centre in the stuck frame: `cx` = the slot's
viewport x; `cy` = the slot's offset from the section's top + half its height
(constant whether or not the section is stuck). `cover` = the largest distance
from the centre to a viewport corner + 2 px, so a disk of that radius hides the
whole viewport. Both re-measure on resize / ScrollTrigger refresh.

### Choreography (all pure functions of `p`)

| p            | what                                                                 |
| ------------ | -------------------------------------------------------------------- |
| ≤ 0          | nothing: actor dwelling at the full stop, window `circle(0)`, disks hidden |
| 0 → 0.18     | **disk A** (bone) takes over from the actor: starts exactly at the actor's live box (a square), travels to the centre (power2.inOut), morphs square → circle (`border-radius 0 → 50%` with the same curve) and grows to diameter `0.16 × min(vw, vh)`. The actor is hidden from the first frame p > 0. |
| 0.18 → 0.86  | disk A grows from that radius to `cover`                             |
| 0.38 → 0.92  | **disk B** (ink) appears at the centre and grows to `cover`          |
| 0.56 → 0.97  | **disk C** (bone) appears and grows to `cover`                       |
| 0.72 → 1.00  | **window** opens: Trajectory's content `clip-path: circle(r at cx cy)` grows to `cover` — the fourth, ink, circle *is* the page |
| ≥ 0.86       | **one more bone circle on the O**: the actor becomes visible again at the O slot, growing in from 15 % of the slot size (its own damping does the growth) |
| 1            | disks hidden, `clip-path: none`; Trajectory unsticks and scrolls normally |

Growth curve for every radius: `u^1.6` of the normalised time inside its own
start→reach range (ease-in: each circle appears as a dot and accelerates).
Because every start and every reach is ordered A < B < C < window, the radii
stay nested (`a ≥ b ≥ c ≥ window`) for all `p`; a unit test pins this.

Everything is reversible: scrolling back closes the window, shrinks the rings,
shows the actor at the full stop again.

### The actor's route

- `SquareActor.measure` adds `lensShift(slot)` = the spacer height for slots
  inside `[data-lens-wrap]`, because those slots' effective document position
  is their natural position plus the stuck length. With that, TRAJECTORY's O
  mark arrives at ≈ p 0.72 (while hidden) and departs just after the section
  unsticks; the 36 vh slot follows as before.
- `GapTitle` gains `dwell?: number` → `data-sq-dwell` (viewport heights added
  to `depart`); TRAJECTORY uses `0.3` so the circle rests in the O for ≈ 0.7
  viewports of scroll after it appears.
- `LensFx` toggles `data-lens-hidden="1"` on `[data-square-actor]` while
  `0 < p < 0.86`. `SquareActor` honours it: hidden → `autoAlpha 0`; on
  becoming visible → snap `x, y` to the target and set `scale` to 15 % of the
  target so it grows in place. A page loaded mid-lens starts hidden.
- `squareMorph` is unchanged (the first flight still rounds the actor; it is
  simply unseen now). The visible square→circle morph is disk A's.

### Rendering details

- Disks are three `div`s sized `2 × cover` px, `border-radius: 50%`, placed with
  `transform: translate(cx − cover, cy − cover) scale(r / cover)` (scale ≤ 1,
  so edges stay crisp); `will-change: transform`; `display: none` outside
  `0 < p < 1`. Disk A's border-radius is `50% × morph` during travel.
- Window: `clip-path: circle(r px at cx px cy px)` on `[data-lens-window]`;
  `circle(0px …)` while p < 0.72 (including p ≤ 0, since Trajectory's top edge
  enters the viewport at scroll 0); `none` at p ≥ 1.
- Z-order: hero 0 < disks 1 < Trajectory 2 < actor 8 < chrome 40. The disks are
  above every other band too, but they only exist mid-lens.
- Reduced motion: no lens — spacer `display: none`, stage `position: static`,
  window `clip-path: none`, `LensFx` does nothing (the actor already bails).
- Nav: `#trajectory` is an absolutely positioned anchor at `top: var(--lens-length)`
  inside the wrapper, i.e. at S1: clicking TRAJECTORY lands on the fully open
  section with the circle in the O.

## Code that goes away

- `Sweeps()` in `components/resume/Sections.tsx`, its sr-only text, and the
  `[data-sweep]` block in `components/fx/ScrollFx.tsx` (nothing else uses it).
- Trajectory no longer uses `Band` (it needs the sticky/window structure); `Band`
  stays for Contact.

## Non-goals

- No changes to the hero, the loader, EXPERIENCE, the deck or Contact.
- No change to the actor's shape logic beyond hide/show and the lens shift.
- Itinerary `data-scrub-rise` items keep their existing triggers (they finish
  rising behind the closed window; when it opens they are in place).

## Verification

- `node --test lib/*.test.ts` (lens math: progress clamp, cover radius, growth
  ease, nesting over p, actor visibility windows).
- `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Browser replay at 1440 × 900 and 390 × 844: scroll slowly from the hero —
  the square leaves the full stop, rounds and swells over the fading JIEWEN;
  ink, bone, then the page open inside it in turn; TRAJECTORY appears inside
  the lens with its O empty; a bone circle grows into the O; the rings leave
  the screen; Trajectory scrolls on; the circle later flies to the 36 vh slot
  and the rest of the journey is unchanged. Scroll back: all of it reverses.
  Nav → TRAJECTORY lands on the open section.
