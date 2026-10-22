/**
 * Modular block alphabet for the hero wordmark.
 *
 * The system was measured from the reference wordmark's SVG
 * (format.obys.agency), not copied from a font. Per 100 units of cap
 * height: slit 3.7 (between blocks AND between letters), chamfer 21.5
 * (terminals and curves are 45° cuts), half-block stem 51, standard
 * letter 105.7 (two blocks + one slit). Every glyph is 1–3 solid blocks
 * that never touch. Polygons are [x, y] with y down, inside a w × 100 box.
 *
 * Only the letters the site spells exist; anything else throws, so a typo
 * fails the build instead of rendering a blank cell.
 */

export const CAP = 100;
export const SLIT = 3.7;
/** Width of the trailing full-stop cell that holds the square actor's slot. */
export const SLOT_W = 29.5;

export type BlockChar = "J" | "I" | "E" | "W" | "N" | "M" | "'";
export type Point = readonly [number, number];

export interface Glyph {
  readonly w: number;
  readonly polys: ReadonlyArray<ReadonlyArray<Point>>;
}

export const GLYPHS: Readonly<Record<BlockChar, Glyph>> = {
  // stem + hook, both bottom corners chamfered: the curve of the J
  J: {
    w: 105.7,
    polys: [
      [[54.7, 0], [105.7, 0], [105.7, 78.5], [84.2, 100], [54.7, 100]],
      [[0, 62.8], [51, 62.8], [51, 100], [21.5, 100], [0, 78.5]],
    ],
  },
  // the reference F's stem
  I: {
    w: 51,
    polys: [[[0, 21.5], [21.5, 0], [51, 0], [51, 100], [0, 100]]],
  },
  // stem + three arms (the middle one shorter)
  E: {
    w: 105.7,
    polys: [
      [[0, 21.5], [21.5, 0], [51, 0], [51, 100], [0, 100]],
      [[54.7, 0], [84.2, 0], [105.7, 21.5], [105.7, 30.87], [54.7, 30.87]],
      [[54.7, 34.57], [92, 34.57], [92, 65.43], [54.7, 65.43]],
      [[54.7, 69.13], [105.7, 69.13], [105.7, 78.5], [84.2, 100], [54.7, 100]],
    ],
  },
  // three teeth; the middle one lower and peaked
  W: {
    w: 160.4,
    polys: [
      [[0, 0], [51, 0], [51, 100], [21.5, 100], [0, 78.5]],
      [[54.7, 52.37], [76.2, 30.87], [84.2, 30.87], [105.7, 52.37], [105.7, 100], [54.7, 100]],
      [[109.4, 0], [160.4, 0], [160.4, 78.5], [138.9, 100], [109.4, 100]],
    ],
  },
  // two big opposing cuts + the slit read as the diagonal
  N: {
    w: 105.7,
    polys: [
      [[0, 0], [15, 0], [51, 36], [51, 100], [0, 100]],
      [[54.7, 0], [105.7, 0], [105.7, 100], [90.7, 100], [54.7, 64]],
    ],
  },
  // the reference's M: inner-top chamfers make a shallow V notch
  M: {
    w: 105.7,
    polys: [
      [[0, 0], [29.5, 0], [51, 21.5], [51, 100], [0, 100]],
      [[54.7, 21.5], [76.2, 0], [105.7, 0], [105.7, 100], [54.7, 100]],
    ],
  },
  "'": {
    w: 29.5,
    polys: [[[0, 0], [29.5, 0], [29.5, 21.5], [8, 43], [0, 43]]],
  },
};

export function isBlockChar(ch: string): ch is BlockChar {
  return Object.prototype.hasOwnProperty.call(GLYPHS, ch);
}

export function glyphOf(ch: string): Glyph {
  if (!isBlockChar(ch)) throw new RangeError(`No block glyph for "${ch}"`);
  return GLYPHS[ch];
}

/** Width of a word in units: glyphs + one slit between cells (+ the slot cell). */
export function wordUnits(text: string, opts: { trailingSlot?: boolean } = {}): number {
  const widths = Array.from(text, (ch) => glyphOf(ch).w);
  if (opts.trailingSlot) widths.push(SLOT_W);
  const sum = widths.reduce((a, b) => a + b, 0);
  return sum + SLIT * Math.max(0, widths.length - 1);
}

/** SVG `points` attribute: "x,y x,y …". */
export function pointsAttr(poly: ReadonlyArray<Point>): string {
  return poly.map(([x, y]) => `${x},${y}`).join(" ");
}
