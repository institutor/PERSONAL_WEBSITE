/**
 * Build-time hand-drawn asset generator.
 *
 * Every ornament on the site is produced HERE, with seeded rough.js
 * (deterministic → zero hydration risk, zero runtime rough.js cost).
 * Each ornament gets 3 seed-variant frames; swapping them at ~7fps
 * (steps-style keyframes) creates the "boil" that makes strokes feel alive.
 *
 * Outputs:
 *   lib/generated/sketch-paths.ts   — typed path data for <Sketch/>
 *   lib/generated/rough-boxes.css   — 9-slice border-image data URIs
 *                                     (per shape × color × theme × 2 boil seeds)
 *
 * Run: npm run gen
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import rough from "roughjs";

const require = createRequire(import.meta.url);
const hershey = require("hersheytext");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "lib", "generated");
mkdirSync(outDir, { recursive: true });

/** Round path-data numbers (fewer decimals ≈ halves output size). */
const roundTo = (d, places) =>
  d.replace(/-?\d+\.\d+/g, (n) => {
    const r = Number(n).toFixed(places);
    return String(Number(r)); // strips trailing zeros: "7.10" -> "7.1", "7.00" -> "7"
  });
const round = (d) => roundTo(d, 2);
const round1 = (d) => roundTo(d, 1);

const FRAME_COUNT = 3;

/**
 * Catalog. Each entry: [width, height, build(gen) -> Drawable[], options?]
 * Coordinates are hand-authored in small viewBoxes; keep shapes box-friendly.
 */
const CATALOG = {
  // — rules & underlines —
  underline1: [240, 16, (g) => [g.curve([[4, 10], [70, 6], [150, 10], [236, 7]])]],
  underline2: [240, 20, (g) => [
    g.curve([[4, 8], [90, 5], [180, 9], [236, 6]]),
    g.curve([[110, 15], [180, 12], [234, 14]]),
  ]],
  divider: [320, 24, (g) => [
    g.curve([[4, 14], [100, 10], [220, 15], [316, 11]]),
    g.line(152, 6, 168, 20),
    g.line(168, 6, 152, 20),
  ]],
  journeyLine: [600, 40, (g) => [
    g.curve([[4, 24], [150, 10], [300, 28], [450, 12], [596, 22]]),
  ], { strokeWidth: 1.6 }],

  // — arrows —
  arrowDown: [32, 52, (g) => [
    g.line(16, 4, 16, 42),
    g.line(7, 31, 16, 44),
    g.line(25, 31, 16, 44),
  ]],
  arrowRight: [72, 40, (g) => [
    g.curve([[4, 28], [30, 14], [64, 20]]),
    g.line(52, 10, 66, 20),
    g.line(54, 30, 66, 20),
  ]],
  arrowLoop: [80, 64, (g) => [
    g.curve([[8, 54], [20, 18], [54, 10], [72, 26]]),
    g.line(74, 12, 73, 28),
    g.line(60, 24, 73, 28),
  ]],

  // — marks —
  checkmark: [140, 90, (g) => [
    g.linearPath([[14, 50], [52, 78], [126, 12]]),
  ], { strokeWidth: 5, roughness: 1.8 }],
  strike: [220, 28, (g) => [
    g.curve([[6, 20], [80, 14], [150, 16], [214, 8]]),
  ], { strokeWidth: 4 }],
  star: [24, 24, (g) => [
    g.line(12, 2, 12, 22),
    g.line(2, 12, 22, 12),
    g.line(5, 5, 19, 19),
    g.line(19, 5, 5, 19),
  ], { strokeWidth: 1.6 }],

  // — pictograms —
  medal: [30, 46, (g) => [
    g.circle(15, 16, 21),
    g.line(9, 26, 5, 42),
    g.line(21, 26, 25, 42),
  ]],
  station: [28, 28, (g) => [g.circle(14, 14, 19)]],
  pencil: [44, 44, (g) => [
    g.polygon([[7, 33], [29, 11], [37, 19], [15, 41]]),
    g.polygon([[7, 33], [15, 41], [4, 44]]),
    g.line(25, 15, 33, 23),
  ], { strokeWidth: 1.6 }],
  terminal: [48, 40, (g) => [
    g.rectangle(4, 5, 40, 30),
    g.linearPath([[11, 14], [18, 20], [11, 26]]),
    g.line(22, 27, 35, 27),
  ], { strokeWidth: 1.6 }],
  musicNote: [28, 40, (g) => [
    g.line(20, 6, 20, 29),
    g.ellipse(14, 32, 14, 10),
    g.curve([[20, 6], [27, 9], [25, 16]]),
  ], { strokeWidth: 1.6 }],

  // — theme toggle icons —
  sun: [40, 40, (g) => {
    const rays = [];
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i;
      rays.push(g.line(20 + Math.cos(a) * 13, 20 + Math.sin(a) * 13, 20 + Math.cos(a) * 18, 20 + Math.sin(a) * 18));
    }
    return [g.circle(20, 20, 18), ...rays];
  }, { strokeWidth: 1.6 }],
  moon: [40, 40, (g) => [
    g.path("M27 5 A15.5 15.5 0 1 0 27 35 A12 12 0 1 1 27 5 Z"),
  ], { strokeWidth: 1.6 }],
};

const gen = rough.generator();
const baseOptions = {
  roughness: 1.4,
  bowing: 1.2,
  strokeWidth: 2,
  preserveVertices: true,
};

function drawFrames(name, [w, h, build, extra = {}]) {
  const frames = [];
  for (let f = 0; f < FRAME_COUNT; f++) {
    // Stable, name-scoped seeds: same output on every run, unique per frame.
    const seed = 100 + [...name].reduce((a, c) => a + c.charCodeAt(0), 0) * 7 + f * 131;
    const g = {
      _o: { ...baseOptions, ...extra, seed },
      curve: (pts) => gen.curve(pts, g._o),
      line: (...a) => gen.line(...a, g._o),
      linearPath: (pts) => gen.linearPath(pts, g._o),
      circle: (...a) => gen.circle(...a, g._o),
      ellipse: (...a) => gen.ellipse(...a, g._o),
      rectangle: (...a) => gen.rectangle(...a, g._o),
      polygon: (pts) => gen.polygon(pts, g._o),
      path: (d) => gen.path(d, g._o),
    };
    const drawables = build(g);
    const paths = drawables.flatMap((dr) =>
      gen.toPaths(dr).map((p) => ({ d: round(p.d), sw: p.strokeWidth }))
    );
    frames.push(paths);
  }
  return { w, h, frames };
}

const sketches = {};
for (const [name, spec] of Object.entries(CATALOG)) {
  sketches[name] = drawFrames(name, spec);
}

const ts = `/* AUTO-GENERATED by scripts/gen-sketch.mjs — do not edit by hand. Run \`npm run gen\`. */

export interface SketchPath {
  d: string;
  sw: number;
}

export interface SketchArt {
  w: number;
  h: number;
  /** ${FRAME_COUNT} seed-variant frames; swapped at ~7fps for the boil effect. */
  frames: SketchPath[][];
}

export const SKETCHES = ${JSON.stringify(sketches)} as const satisfies Record<string, SketchArt>;

export type SketchName = keyof typeof SKETCHES;
`;
writeFileSync(join(outDir, "sketch-paths.ts"), ts);

/* ----------------------------------------------------------------------- */
/* 9-slice border-image assets for boxes/chips (buttons, cards, pills).     */
/* border-image can't use currentColor, so bake per-theme color variants.   */
/* ----------------------------------------------------------------------- */

const COLORS = {
  light: { ink: "#2a2d3a", accent: "#2f55b8" },
  dark: { ink: "#e9e4d6", accent: "#e0b04f" },
};

const BOX_SHAPES = {
  box: { w: 120, h: 72, inset: 5, sw: 2.4 },
  chip: { w: 72, h: 44, inset: 4, sw: 2 },
};

function boxUri(shape, color, seed) {
  const { w, h, inset, sw } = BOX_SHAPES[shape];
  const dr = gen.rectangle(inset, inset, w - inset * 2, h - inset * 2, {
    ...baseOptions,
    strokeWidth: sw,
    roughness: 1.6,
    seed,
  });
  const d = gen.toPaths(dr).map((p) => round(p.d)).join(" ");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><path d='${d}' fill='none' stroke='${color}' stroke-width='${sw}' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
  return `url("data:image/svg+xml,${svg
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/"/g, "'")}")`;
}

function themeVars(theme) {
  const c = COLORS[theme];
  const lines = [];
  for (const shape of Object.keys(BOX_SHAPES)) {
    for (const [tone, hex] of Object.entries(c)) {
      const s1 = 500 + shape.length * 17 + tone.length * 3;
      lines.push(`  --rb-${shape}-${tone}: ${boxUri(shape, hex, s1)};`);
      lines.push(`  --rb-${shape}-${tone}-b: ${boxUri(shape, hex, s1 + 61)};`);
    }
  }
  return lines.join("\n");
}

const css = `/* AUTO-GENERATED by scripts/gen-sketch.mjs — do not edit by hand. */

html[data-theme="light"],
.theme-light {
${themeVars("light")}
}

html[data-theme="dark"],
.theme-dark {
${themeVars("dark")}
}

.rough-box {
  border: 10px solid transparent;
  border-image: var(--rb-box-ink) 18 / 12px round;
}

.rough-box-accent {
  border: 10px solid transparent;
  border-image: var(--rb-box-accent) 18 / 12px round;
}

.rough-chip {
  border: 7px solid transparent;
  border-image: var(--rb-chip-ink) 12 / 9px round;
}

.rough-chip-accent {
  border: 7px solid transparent;
  border-image: var(--rb-chip-accent) 12 / 9px round;
}

/* Hover boil: flick between the two baked seeds. */
@media (prefers-reduced-motion: no-preference) {
  .rough-box:hover,
  a.rough-box:focus-visible {
    animation: rb-boil-box 0.3s step-end infinite;
  }
  .rough-box-accent:hover {
    animation: rb-boil-box-accent 0.3s step-end infinite;
  }
}

@keyframes rb-boil-box {
  0%, 100% { border-image-source: var(--rb-box-ink); }
  50% { border-image-source: var(--rb-box-ink-b); }
}

@keyframes rb-boil-box-accent {
  0%, 100% { border-image-source: var(--rb-box-accent); }
  50% { border-image-source: var(--rb-box-accent-b); }
}
`;
writeFileSync(join(outDir, "rough-boxes.css"), css);

/* ----------------------------------------------------------------------- */
/* Hand-drawn LETTERING: real stroke artwork for every big title.           */
/* text → Hershey single-stroke glyphs → seeded rough.js jitter → paths.    */
/* Not a font at runtime: each letter is genuine animatable stroke art.     */
/* ----------------------------------------------------------------------- */

/** Parse a Hershey glyph `d` ("M x,y L x,y x,y M ...") into polylines. */
function parseGlyph(d) {
  const polylines = [];
  let current = null;
  const tokens = d.match(/[ML]|-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) ?? [];
  let mode = "M";
  for (const t of tokens) {
    if (t === "M" || t === "L") {
      mode = t;
      continue;
    }
    const [x, y] = t.split(",").map(Number);
    if (mode === "M") {
      current = [[x, y]];
      polylines.push(current);
      mode = "L";
    } else {
      current.push([x, y]);
    }
  }
  return polylines.filter((p) => p.length > 1);
}

/** Lay out text in Hershey units; returns per-letter polylines + bounds. */
function layoutText(text, fontName, letterSpacing = 2) {
  const font = hershey.fonts[fontName];
  const letters = [];
  let cursor = 0;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const ch of text) {
    if (ch === " ") {
      cursor += 10;
      continue;
    }
    const glyph = font.chars[ch.charCodeAt(0) - 33];
    if (!glyph) continue;
    const polys = parseGlyph(glyph.d);
    const xs = polys.flat().map((p) => p[0]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    for (const [, y] of polys.flat()) {
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    const shifted = polys.map((poly) => poly.map(([x, y]) => [x - minX + cursor, y]));
    letters.push({ char: ch, polys: shifted, x: cursor, w: maxX - minX });
    cursor += maxX - minX + letterSpacing;
  }
  return { letters, width: cursor - letterSpacing, minY, maxY };
}

/**
 * Roughen a laid-out text into FRAME_COUNT frames of per-letter stroke paths.
 * Options tuned per use: titles need low roughness or letterforms melt.
 */
function roughLettering(name, text, fontName, opts = {}) {
  const { roughness = 0.9, bowing = 0.8, strokeWidth = 1.4, multiStroke = false, letterSpacing = 2 } = opts;
  const { letters, width, minY, maxY } = layoutText(text, fontName, letterSpacing);
  const pad = 3;
  const out = {
    w: Math.ceil(width + pad * 2),
    h: Math.ceil(maxY - minY + pad * 2),
    sw: strokeWidth,
    letters: letters.map((l) => ({ frames: [] })),
  };
  for (let f = 0; f < FRAME_COUNT; f++) {
    letters.forEach((letter, li) => {
      const seed = 1000 + [...name].reduce((a, c) => a + c.charCodeAt(0), 0) * 13 + li * 37 + f * 211;
      const o = {
        seed,
        roughness,
        bowing,
        strokeWidth,
        preserveVertices: true,
        disableMultiStroke: !multiStroke,
      };
      const ds = letter.polys.flatMap((poly) => {
        const moved = poly.map(([x, y]) => [x + pad, y - minY + pad]);
        const dr = gen.linearPath(moved, o);
        return gen.toPaths(dr).map((p) => round1(p.d));
      });
      out.letters[li].frames.push(ds);
    });
  }
  return out;
}

const LETTERING_CATALOG = {
  // The massive hero title — medium script, multi-stroke for ink richness.
  name: ["Jiewen Huang", "scriptc", { roughness: 0.7, strokeWidth: 1.5, multiStroke: true, letterSpacing: 3 }],
  // The signature that the loader draws and the footer bookends.
  signature: ["by Jiewen", "scripts", { roughness: 0.6, strokeWidth: 1.3 }],
  // Section headings — sans 1-stroke, jittered like quick marker capitals.
  journey: ["Journey", "futural", { roughness: 1.0, strokeWidth: 1.5 }],
  experience: ["Experience", "futural", { roughness: 1.0, strokeWidth: 1.5 }],
  leadership: ["Leadership", "futural", { roughness: 1.0, strokeWidth: 1.5 }],
  awards: ["Programs & Awards", "futural", { roughness: 1.0, strokeWidth: 1.5 }],
  skills: ["Skills", "futural", { roughness: 1.0, strokeWidth: 1.5 }],
  teaching: ["Teaching & Community", "futural", { roughness: 1.0, strokeWidth: 1.5 }],
};

const lettering = {};
for (const [key, [text, font, opts]] of Object.entries(LETTERING_CATALOG)) {
  lettering[key] = roughLettering(key, text, font, opts);
}

const letteringTs = `/* AUTO-GENERATED by scripts/gen-sketch.mjs — do not edit by hand. Run \`npm run gen\`. */

export interface LetterFrames {
  /** ${FRAME_COUNT} boil frames; each frame is the stroke paths of one letter. */
  frames: string[][];
}

export interface LetteringArt {
  w: number;
  h: number;
  /** Stroke width in viewBox units (scales with rendered size). */
  sw: number;
  letters: LetterFrames[];
}

export const LETTERING = ${JSON.stringify(lettering)} as const satisfies Record<string, LetteringArt>;

export type LetteringName = keyof typeof LETTERING;
`;
writeFileSync(join(outDir, "lettering-paths.ts"), letteringTs);

const tsSize = Buffer.byteLength(ts);
const cssSize = Buffer.byteLength(css);
const letSize = Buffer.byteLength(letteringTs);
console.log(
  `gen-sketch: ${Object.keys(sketches).length} ornaments + ${Object.keys(lettering).length} letterings × ${FRAME_COUNT} frames → sketch-paths.ts (${(tsSize / 1024).toFixed(1)}KB), lettering-paths.ts (${(letSize / 1024).toFixed(1)}KB), rough-boxes.css (${(cssSize / 1024).toFixed(1)}KB)`
);
