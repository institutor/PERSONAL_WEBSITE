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
const PEN: Array<{ w: number; d: string }> = [
  // the b's approach flourish — the artwork's leftmost chalk
  { w: 64, d: "M 190 310 C 200 370, 222 435, 258 472" },
  { w: 96, d: "M 246 210 C 266 330, 288 490, 304 585 C 300 505, 296 450, 308 432 C 354 410, 402 455, 376 540 C 356 598, 310 604, 306 560" },
  { w: 80, d: "M 440 420 C 438 476, 458 510, 497 498 C 532 486, 548 436, 554 412 C 558 496, 550 606, 500 686 C 448 756, 372 748, 380 672" },
  { w: 62, d: "M 632 232 C 682 208, 744 220, 790 302" },
  { w: 76, d: "M 734 292 C 744 380, 732 470, 696 532 C 664 578, 618 562, 628 510" },
  { w: 46, d: "M 820 272 L 836 290" },
  { w: 74, d: "M 812 340 C 806 413, 814 468, 844 466 C 872 460, 884 398, 888 370 C 902 340, 920 340, 930 366 C 920 408, 916 456, 942 468 C 972 476, 998 440, 1006 398 C 1012 436, 1020 470, 1044 470 C 1068 468, 1080 402, 1086 374 C 1092 420, 1100 468, 1124 468 C 1150 464, 1162 398, 1168 370 C 1190 336, 1208 336, 1216 362 C 1206 402, 1202 456, 1226 468 C 1254 478, 1282 440, 1290 402 C 1298 366, 1312 352, 1326 368 C 1322 402, 1320 448, 1334 466 C 1342 428, 1358 376, 1386 370 C 1412 368, 1408 430, 1418 456 C 1428 476, 1446 452, 1456 424" },
  { w: 70, d: "M 716 508 C 910 492, 1140 442, 1320 404 C 1388 390, 1424 404, 1442 436 C 1454 466, 1466 492, 1480 462 C 1566 348, 1706 228, 1834 140" },
  { w: 48, d: "M 736 556 C 900 542, 1030 528, 1160 505" },
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
          {/* Soft pen edge WITHOUT dimming: blur softens the stroke boundary,
              then a steep transfer pushes the mask back to full white — the
              luminance mask stays 100% opaque everywhere but a ~2px edge.
              (Plain blur alone made mid-write art translucent, which then
              "popped" to full opacity when the mop-up landed.) */}
          <filter id="penblur" x="-5%" y="-12%" width="110%" height="124%">
            <feGaussianBlur stdDeviation="4" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="4" intercept="-1" />
              <feFuncG type="linear" slope="4" intercept="-1" />
              <feFuncB type="linear" slope="4" intercept="-1" />
              <feFuncA type="linear" slope="4" intercept="-1" />
            </feComponentTransfer>
          </filter>
          <mask id="penmask" maskUnits="userSpaceOnUse" x="0" y="0" width="1904" height="826">
            <g filter="url(#penblur)">
              {PEN.map((p, i) => (
                <path
                  key={i}
                  d={p.d}
                  pathLength={1}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={p.w}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ strokeDasharray: "1 1.06", strokeDashoffset: 1 }}
                  data-pen
                />
              ))}
            </g>
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
