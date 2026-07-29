/**
 * v6.1 title system:
 *
 *  - GapTitle: letters are FULLY OPAQUE always — they emerge upward through
 *    the bottom edge of the title's own line box (the paragraph clips its
 *    overflow, so each letter "appears from the bottom of where it's
 *    supposed to be"), each at a slightly different speed, scrubbed to
 *    scroll ([data-title]/[data-tl] in ScrollFx). One letter is absent:
 *    a cap-height, baseline-aligned [data-sq-slot] the traveling square
 *    arrives to fill.
 *
 *  - BackTicker: colossal hollow line traveling across the band background.
 */

interface GapTitleProps {
  text: string;
  /** 0-based index of the letter the square replaces. */
  gapIndex: number;
  index?: string;
  /** Scrub timing window: early | mid | late (varying speeds per title). */
  window?: "early" | "mid" | "late";
  className?: string;
  sizeClass?: string;
}

export function GapTitle({
  text,
  gapIndex,
  index,
  window: win = "early",
  className,
  sizeClass = "text-[clamp(3.8rem,13vw,12rem)]",
}: GapTitleProps) {
  return (
    <div className={className} role="img" aria-label={text} data-title data-window={win}>
      {index && (
        <p className="lbl mb-3 opacity-60" aria-hidden="true">
          ( {index} )
        </p>
      )}
      <p aria-hidden="true" className={`display overflow-hidden whitespace-nowrap ${sizeClass}`}>
        {text.split("").map((ch, i) =>
          i === gapIndex ? (
            /* the absent letter: cap-height square slot on the baseline */
            <span key={i} className="relative inline-block w-[0.74em]">
              &#8203;
              <span
                data-sq-slot
                className="pointer-events-none absolute bottom-[0.05em] left-1/2 h-[0.72em] w-[0.72em] -translate-x-1/2"
                aria-hidden="true"
              />
            </span>
          ) : (
            <span key={i} data-tl className="inline-block will-change-transform">
              {ch}
            </span>
          )
        )}
      </p>
    </div>
  );
}

interface BackTickerProps {
  word: string;
  posClass?: string;
}

export function BackTicker({ word, posClass = "top-[8%]" }: BackTickerProps) {
  const line = `${word} — ${word} — ${word}`;
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-0 overflow-hidden ${posClass}`}
      aria-hidden="true"
    >
      <p
        data-mega
        className="display outline-text whitespace-nowrap text-[clamp(9rem,26vw,24rem)] opacity-20 will-change-transform"
      >
        {line}
      </p>
    </div>
  );
}
