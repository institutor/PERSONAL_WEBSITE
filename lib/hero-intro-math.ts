/**
 * Where the JIEWEN lockup rests before it floats to centre: low enough
 * that its bottom edge sits `inset` px above the viewport bottom (clear of
 * the fixed bottom bar), so the letters read as rising out of the screen
 * edge. Measured with the lockup at its home position; never negative, so
 * a short viewport simply plays the rise in place.
 */

export const REST_INSET_PX = 56;

/** The loader's clock unrolls into a line this thick; the quote bar starts as it. */
export const HANDOFF_LINE_PX = 2;
/** The clock ring's radius in px (its viewBox is 1:1); unrolled it is 2πr long. */
export const CLOCK_R = 20;

export interface RestArgs {
  viewportHeight: number;
  lockupTop: number;
  lockupHeight: number;
  inset: number;
}

export function bottomRestOffset(a: RestArgs): number {
  return Math.max(0, a.viewportHeight - a.inset - (a.lockupTop + a.lockupHeight));
}
