import { LoaderFx } from "./LoaderFx";

/**
 * Volumetric Inkfield preloader — handwritten edition.
 *
 * The original textured artwork is revealed through one continuous
 * handwriting mask. A narrow round pen tip leads a full-width butt-capped
 * fill, preserving the handmade final mark without large circular starts.
 *
 * SSR-hidden: every mask stroke ships with dashoffset 1, so nothing flashes
 * before hydration.
 */
const PEN: Array<{
  w: number;
  d: string;
  speed: number;
  lift: number;
  cap?: "round";
}> = [
  // faint dust at the far left — the true first pixels of the artwork
  {
    w: 100,
    speed: 1.15,
    lift: 22,
    d: "M 78 442 C 102 480, 138 512, 196 538",
  },
  // the b's approach flourish
  {
    w: 106,
    speed: 1.2,
    lift: 24,
    d: "M 182 272 C 194 360, 224 442, 274 532",
  },
  {
    w: 128,
    speed: 1.45,
    lift: 30,
    d: "M 240 178 C 262 320, 288 490, 304 585 C 300 505, 296 450, 308 432 C 354 410, 402 455, 376 540 C 356 598, 306 606, 303 532",
  },
  {
    w: 112,
    speed: 1.55,
    lift: 38,
    d: "M 424 366 C 428 462, 452 512, 497 500 C 534 488, 552 440, 558 402 C 562 350, 564 305, 566 264 C 566 372, 560 482, 556 522 C 556 602, 546 642, 500 690 C 448 756, 370 750, 384 642",
  },
  {
    w: 112,
    speed: 1.25,
    lift: 18,
    d: "M 606 246 C 660 212, 744 220, 802 320",
  },
  {
    w: 106,
    speed: 1.45,
    lift: 34,
    d: "M 730 262 C 746 372, 732 470, 696 532 C 664 578, 616 564, 634 484",
  },
  {
    w: 76,
    speed: 1,
    lift: 20,
    cap: "round",
    d: "M 820 272 L 836 290",
  },
  {
    w: 106,
    speed: 1.8,
    lift: 42,
    d: "M 813 308 C 806 413, 814 468, 844 466 C 872 460, 884 398, 888 370 C 902 340, 920 340, 930 366 C 920 408, 916 456, 942 468 C 972 476, 998 440, 1006 398 C 1012 436, 1020 470, 1044 470 C 1068 468, 1080 402, 1086 374 C 1092 420, 1100 468, 1124 468 C 1150 464, 1162 398, 1168 370 C 1190 336, 1208 336, 1216 362 C 1206 402, 1202 456, 1226 468 C 1254 478, 1282 440, 1290 402 C 1298 366, 1312 352, 1326 368 C 1322 402, 1320 448, 1334 466 C 1342 428, 1358 376, 1386 370 C 1412 368, 1408 430, 1418 456 C 1430 470, 1454 424, 1471 352",
  },
  {
    w: 106,
    speed: 2.1,
    lift: 26,
    d: "M 688 511 C 890 494, 1140 442, 1320 404 C 1388 390, 1424 404, 1442 436 C 1454 466, 1466 492, 1480 462 C 1566 348, 1706 228, 1856 124",
  },
  {
    w: 88,
    speed: 1.9,
    lift: 0,
    d: "M 708 559 C 890 544, 1110 520, 1356 477",
  },
];

const HIDDEN = { strokeDasharray: "1 1.06", strokeDashoffset: 1 } as const;

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
          "radial-gradient(circle at 30% 25%, rgba(237,232,220,0.13), transparent 32%), radial-gradient(circle at 72% 66%, rgba(237,232,220,0.07), transparent 36%), var(--ink)",
      }}
    >
      <svg
        viewBox="0 0 1904 826"
        className="h-auto w-[min(72%,620px)] select-none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <mask
            id="penmask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1904"
            height="826"
          >
            {PEN.map((pen, index) => (
              <path
                key={`tip-${index}`}
                d={pen.d}
                pathLength={1}
                fill="none"
                stroke="#fff"
                strokeWidth={pen.w * 0.45}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={HIDDEN}
                data-pen-tip
                data-pen-speed={pen.speed}
                data-pen-lift={pen.lift}
              />
            ))}
            {PEN.map((pen, index) => (
              <path
                key={`fill-${index}`}
                d={pen.d}
                pathLength={1}
                fill="none"
                stroke="#fff"
                strokeWidth={pen.w}
                strokeLinecap={pen.cap ?? "butt"}
                strokeLinejoin="round"
                style={HIDDEN}
                data-pen-fill
              />
            ))}
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
