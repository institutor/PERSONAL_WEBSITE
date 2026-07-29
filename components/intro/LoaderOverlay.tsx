import { LoaderFx } from "./LoaderFx";

/**
 * Volumetric Inkfield preloader — handwritten edition.
 *
 * The ORIGINAL handmade artwork is revealed through a pen mask: fat
 * round-cap strokes traced along the real writing path (calibrated against
 * the artwork), so the signature writes itself letter by letter — b, y,
 * J, i-dot, iewen, then the swoosh-check — in sync with REAL progress.
 * A mop-up layer fades in over the last 4% so every chalky pixel lands.
 *
 * SSR-hidden: every mask stroke ships with dashoffset 1 → mask is black →
 * nothing flashes before hydration.
 */
/**
 * Generous full-opacity widths: the union of these strokes must cover
 * EVERY chalk pixel by the time the pen finishes, so the safety mop-up
 * has zero visible delta — what you see mid-write is the final state.
 */
const PEN: Array<{ w: number; d: string }> = [
  // faint dust at the far left — the true first pixels of the artwork
  { w: 100, d: "M 96 466 C 116 494, 142 514, 174 528" },
  // the b's approach flourish
  { w: 106, d: "M 188 306 C 198 372, 224 442, 262 500" },
  { w: 128, d: "M 246 210 C 266 330, 288 490, 304 585 C 300 505, 296 450, 308 432 C 354 410, 402 455, 376 540 C 356 598, 310 604, 306 560" },
  { w: 112, d: "M 426 398 C 430 470, 452 512, 497 500 C 534 488, 552 440, 558 402 C 562 350, 564 305, 566 264 C 566 372, 560 482, 556 522 C 556 602, 546 642, 500 690 C 448 756, 372 748, 380 672" },
  { w: 112, d: "M 632 232 C 682 208, 744 220, 790 302" },
  { w: 106, d: "M 734 292 C 744 380, 732 470, 696 532 C 664 578, 618 562, 628 510" },
  { w: 76, d: "M 820 272 L 836 290" },
  { w: 106, d: "M 812 340 C 806 413, 814 468, 844 466 C 872 460, 884 398, 888 370 C 902 340, 920 340, 930 366 C 920 408, 916 456, 942 468 C 972 476, 998 440, 1006 398 C 1012 436, 1020 470, 1044 470 C 1068 468, 1080 402, 1086 374 C 1092 420, 1100 468, 1124 468 C 1150 464, 1162 398, 1168 370 C 1190 336, 1208 336, 1216 362 C 1206 402, 1202 456, 1226 468 C 1254 478, 1282 440, 1290 402 C 1298 366, 1312 352, 1326 368 C 1322 402, 1320 448, 1334 466 C 1342 428, 1358 376, 1386 370 C 1412 368, 1408 430, 1418 456 C 1430 470, 1452 428, 1464 384" },
  { w: 106, d: "M 716 508 C 910 492, 1140 442, 1320 404 C 1388 390, 1424 404, 1442 436 C 1454 466, 1466 492, 1480 462 C 1566 348, 1706 228, 1834 140" },
  { w: 88, d: "M 736 556 C 900 542, 1110 520, 1330 482" },
];

export function LoaderOverlay() {
  return (
    <div
      data-loader
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      aria-label="Loading portfolio"
      className="fixed inset-0 z-[80] flex items-center justify-center text-bone"
      style={{
        background:
          "radial-gradient(circle at 30% 25%, rgba(232,227,216,0.13), transparent 32%), radial-gradient(circle at 72% 66%, rgba(232,227,216,0.07), transparent 36%), var(--ink)",
      }}
    >
      <svg
        viewBox="0 0 1904 826"
        className="h-auto w-[min(72%,620px)] select-none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* Two-pass pen, both FULL opacity (no filters, no alpha layers):
              a narrow tip leads — the visible handwriting — and the wide
              coverage stroke trails ~10% behind along the same path, so
              fringes fill just after the tip passes instead of popping as
              giant start-caps. Both converge at each stroke's end, keeping
              the finished frame identical to the last written frame. */}
          <mask id="penmask" maskUnits="userSpaceOnUse" x="0" y="0" width="1904" height="826">
            {PEN.map((p, i) => (
              <path
                key={`w${i}`}
                d={p.d}
                pathLength={1}
                fill="none"
                stroke="#fff"
                strokeWidth={p.w}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: "1 1.06", strokeDashoffset: 1 }}
                data-pen-wide
              />
            ))}
            {PEN.map((p, i) => (
              <path
                key={i}
                d={p.d}
                pathLength={1}
                fill="none"
                stroke="#fff"
                strokeWidth={Math.max(48, Math.round(p.w * 0.55))}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: "1 1.06", strokeDashoffset: 1 }}
                data-pen
              />
            ))}
            <rect width="1904" height="826" fill="#fff" opacity={0} data-pen-mop />
          </mask>
        </defs>
        <image
          href="/loader/by-jiewen-loader.webp"
          width="1904"
          height="826"
          mask="url(#penmask)"
        />
      </svg>

      <p className="lbl absolute bottom-8 left-6 opacity-60" data-loader-label>
        Drawing the page / preparing the work
      </p>
      <p className="absolute bottom-8 right-6 font-mono text-xs tracking-[0.3em] opacity-70">
        <span data-loader-pct style={{ fontVariantNumeric: "tabular-nums" }}>
          000
        </span>
        %
      </p>
      <button
        type="button"
        data-loader-skip
        className="lbl absolute right-6 top-6 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
      >
        Skip →
      </button>

      <LoaderFx />
    </div>
  );
}
