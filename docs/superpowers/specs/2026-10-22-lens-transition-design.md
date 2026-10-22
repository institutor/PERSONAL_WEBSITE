# Lens transition (hero → TRAJECTORY) — design spec, v2

v1 (this morning) pinned Trajectory for 160 svh and grew four evenly staged
circles toward the O at the top of the section. Jiewen's review: the page
must keep scrolling while the lens plays; the final dot must land on
TRAJECTORY's O with the word near the centre of the screen; the effect must be
shorter; the circles must not be evenly spaced — an exponential, nested look
where the outer circles are always substantially bigger; and the lens itself
sat too high. This spec replaces the v1 design. Quoted words are the brief.

## Goal

The SHIPPING / SUNSET PARK sweeps band stays deleted. In its place, a
scroll-driven lens: "as the square becomes a circle … get larger and larger,
and as it gets larger smaller circles of the exact inverted color will appear
within the circle and those will get larger too" — bone, ink inside, bone
inside, ink inside — then it "gives way to the next portion of the page
(trajectory), as if it were some sort of lens, with one more white circle
centered on the O in trajectory", which "should be near the center of the
screen". "The page should continue scrolling while the circle lens animation
is playing."

Bone `#e8e3d8` is "white"; ink `#0a0a0c` is "black".

## Structure

```
<main>
  <Hero/>                                sticky z-0, 100svh in flow, fades over 0.85svh (unchanged)
  <div class="relative">                 (unchanged wrapper, no z-index)
    <div data-lens-gap aria-hidden style="height: var(--lens-gap)"/>   empty room for the lens to play
    <section id="trajectory" data-band class="relative z-[2] overflow-hidden text-bone …">   NOT sticky; transparent bg
      <div data-lens-window class="relative bg-ink …">   all Trajectory content; clip-path circle in local coords
    </section>
    <ExperienceHorizontal/> <CardDeck/> <Contact/>   unchanged
  </div>
</main>
<LensFx/>   fixed inset-0 z-[1] pointer-events-none: three disks (A bone, B ink, C bone)
```

`--lens-gap: 85svh`. No sticky stage, no spacer, no `lensShift`; the
`#trajectory` anchor is back on the section. The section keeps a transparent
background while the window is closed; the window carries the ink background,
so after the lens it looks exactly like the old band.

## Geometry

- **Lens centre** `(cx, cy)`: `cx` = the O slot's live viewport x centre
  (constant across scroll); `cy = viewportHeight / 2`. Fixed in the viewport:
  the page scrolls beneath the lens.
- **End of the lens** `S1` = the scroll at which the O's centre reaches `cy`:
  `S1 = oCentreDocY − viewportHeight / 2` (`oCentreDocY` = slot centre's
  document y, measured at refresh). **Start** `S0 = 0.2 × viewportHeight`.
  `p = clamp((scrollY − S0) / (S1 − S0), 0, 1)`.
  At 1024 × 768 with the 85 svh gap: O centre ≈ 768 + 653 + 196 = 1617 →
  S1 ≈ 1233, S0 = 154, length ≈ 1.4 viewports (v1 was 2.4).
- **Cover** = farthest viewport corner from the centre + 2 px.
- **Ratio** `K = 0.5`: each inner circle's radius is half the next outer one's
  once it has appeared, so the outer circle is always at least 2× (area 4×)
  the inner. **Exponential growth**: the outer radius
  `R(p) = rT · (REnd / rT) ^ ((p − 0.15) / 0.85)` for `p ≥ 0.15`, with
  `rT = 0.08 × min(vw, vh)` (disk A at the end of travel) and
  `REnd = cover / K³` (so the window reaches `cover` at `p = 1`).
- **Appearance ramps**: inner ring *i* is `R · K^i · ramp((p − a_i) / 0.12)`
  with smoothstep `ramp` and `a_b = 0.25`, `a_c = 0.42`, `a_window = 0.60`
  — each appears as a dot and catches up to its ratio. Nesting
  `a ≥ b ≥ c ≥ window` holds for every `p` because `K < 1` and the ramps are
  ordered; a test pins it.
- **Rendered radius** = `min(radius, cover)`: once a disk covers the viewport
  nothing larger looks different, and clamping keeps every disk at
  `scale ≤ 1` (crisp edges).

## Choreography

| p         | what                                                                  |
| --------- | --------------------------------------------------------------------- |
| ≤ 0       | nothing: actor dwelling at the full stop, window `circle(0)`, disks hidden |
| 0 → 0.15  | **disk A** takes over from the actor's live box (a square), travels to `(cx, cy)` (power2.inOut), morphs square → circle, grows to radius `rT`; actor hidden from the first frame p > 0 |
| 0.15 → 1  | disk A grows exponentially (`R(p)`), covering the viewport at p ≈ 0.66 |
| 0.25 →    | **disk B** (ink) appears at the centre and settles to `R/2`            |
| 0.42 →    | **disk C** (bone) appears and settles to `R/4`                         |
| 0.60 →    | **window** opens on Trajectory's content, settling to `R/8`, = `cover` at p = 1 |
| ≥ 0.72    | **one more bone circle on the O**: the actor shows again at the O, growing in from 15 % of the slot (its own damping) |
| 1         | disks hidden, `clip-path: none`; the O is at mid-screen; Trajectory just keeps scrolling |

Meanwhile the page scrolls normally: the hero fades under disk A; Trajectory's
top enters the viewport around 0.85 svh (p ≈ 0.46) but is invisible until the
window opens; TRAJECTORY's letters assemble inside the lens as the page moves;
the O slides up into the centre exactly as the window finishes opening.

Everything is a pure function of `p`; scrolling back reverses it.

## The actor's route

- No sticky shift. Marks use natural positions as before. With the gap, the O
  mark arrives at ≈ p 0.66 (while hidden) and the actor reappears at 0.72
  already settled in the O.
- `GapTitle dwell={0.12}` on TRAJECTORY (v1's 0.3 over-held: the O had left
  the screen before the actor moved on).
- Hide/grow-in protocol unchanged: `data-lens-hidden="1"` while
  `0 < p < 0.72`; on return at the O, snap to target and scale 15 %; back at
  the full stop, full size, square, upright.

## Rendering

- Disks: three `div`s sized `2 × cover`, `border-radius: 50%`,
  `transform: translate(cx − cover, cy − cover) scale(rendered / cover)`,
  `will-change: transform`; disk A's border-radius is `50% × morph` during
  travel; hidden when rendered radius is 0 or outside `0 < p < 1`.
- Window: `clip-path: circle(r px at cx px cyLocal px)` on `[data-lens-window]`
  with `cyLocal = cy − windowRect.top` recomputed every frame (the window is
  scrolling); `circle(0px …)` for p < 0.60 including p ≤ 0; `none` at p ≥ 1.
  Skip writes that would not change the value.
- Z-order unchanged: hero 0 < disks 1 < Trajectory 2 < actor 8 < chrome 40.
- Reduced motion: `[data-lens-gap] { display: none }`, window `clip-path:
  none !important`, `LensFx` does nothing.
- Re-measure (centre, cover, S1, disk sizes) on resize (debounced) and
  ScrollTrigger refresh.

## Code that goes away (relative to v1)

- `[data-lens-wrap]`, `[data-lens-stage]`, `[data-lens-spacer]`, the anchor
  span, `--lens-length`, the sticky/stuck-shift logic in `SquareActor`, the
  `lensShift` helper, and the reduced-motion `position: static` rule.

## Verification

- `node --test lib/*.test.ts` (v2 lens math: progress, end-of-lens, exponential
  outer radius, K ratios after ramps, nesting/monotonic over p, window = cover
  at 1, actor visibility).
- `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Browser replay at 1440 × 900 and 390 × 844: scroll steadily from the hero —
  the page never stops; the square rounds and swells over the fading JIEWEN at
  mid-height; ink, bone, then the page open inside it, each clearly smaller
  than the one outside at every moment; TRAJECTORY arrives inside the lens and
  its O reaches mid-screen as the rings leave; a bone circle grows into the O;
  the actor later flies on to the 36 vh slot. Scroll back: it reverses. Nav →
  TRAJECTORY lands with the lens finished.
