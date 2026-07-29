# Hand-drawn preloader redesign

## Goal

Keep the existing Volumetric Inkfield preloader composition and the exact
original `by Jiewen` artwork, but make the write-on feel like one confident
human gesture instead of a sequence of eased vector segments.

## Design

- Render the original textured WebP as the visible artwork.
- Reveal it through calibrated SVG pen masks that follow the actual stroke
  order: `b`, `y`, `J`, `i`, `ewen`, underline, and check flourish.
- Drive the complete drawing with one continuous progress curve. Pen lifts use
  short explicit gaps; individual strokes do not restart their easing.
- Keep the current dark atmospheric field, corner caption, percentage, Skip
  control, responsive scale, accessibility semantics, reduced-motion behavior,
  and subtle scale-and-fade handoff.
- Remove the clean vector reconstruction and its glow pass so the final frame
  is the original handmade mark, not an approximation.

## Motion and loading

The loading orchestrator remains the source of monotonic progress. A small
timeline mapper translates progress into writing segments and pen-lift gaps,
while preserving continuous perceived velocity. The image load continues to
gate completion so the mask never reveals an unavailable asset. Skip completes
the artwork and uses the existing short exit.

## Failure handling

If the artwork fails to load, the loader completes rather than trapping the
visitor. Reduced-motion visitors bypass the loader exactly as they do now.

## Verification

Keep validation intentionally light: run one local replay to confirm the
textured artwork writes in the intended order without visible jumps, then run
the production build.
