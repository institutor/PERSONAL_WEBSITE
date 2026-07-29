/**
 * v6 title system (per the reference's motion):
 *
 *  - GapTitle: the section title — big, rises bottom-up from behind the band
 *    edge (masked, [data-rise]), with ONE letter absent. The absence is a
 *    letter-sized [data-sq-slot]: the page's single traveling square arrives
 *    and becomes that letter while you're in the section, then moves on.
 *
 *  - BackTicker: the colossal type now lives in the BACKGROUND — a hollow,
 *    faint, viewport-tall line traveling across the band ([data-mega]).
 */

interface GapTitleProps {
  text: string;
  /** 0-based index of the letter the square replaces. */
  gapIndex: number;
  index?: string;
  className?: string;
  sizeClass?: string;
}

export function GapTitle({
  text,
  gapIndex,
  index,
  className,
  sizeClass = "text-[clamp(3.8rem,13vw,12rem)]",
}: GapTitleProps) {
  return (
    <div className={className} role="img" aria-label={text}>
      {index && (
        <p className="lbl mb-3 opacity-60" aria-hidden="true">
          ( {index} )
        </p>
      )}
      <div className="rise-mask" data-rise-fallback="">
        <p aria-hidden="true" className={`display whitespace-nowrap ${sizeClass}`} data-rise="">
          {text.split("").map((ch, i) =>
            i === gapIndex ? (
              <span key={i} className="relative inline-block w-[0.62em]">
                <span
                  data-sq-slot
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[0.58em] w-[0.58em] -translate-x-1/2 -translate-y-[54%]"
                  aria-hidden="true"
                />
              </span>
            ) : (
              <span key={i} className="inline-block">
                {ch}
              </span>
            )
          )}
        </p>
      </div>
    </div>
  );
}

interface BackTickerProps {
  word: string;
  /** Vertical placement inside the band, e.g. "top-[8%]". */
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
