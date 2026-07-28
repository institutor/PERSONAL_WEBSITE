import { Sawtooth } from "@/components/fx/Sawtooth";

interface Row {
  text: string;
  /** Which viewport edge this row bleeds off (motion-study #8). */
  bleed: "left" | "right";
  /** Scroll-linked horizontal travel in xPercent (sign = direction). */
  travel: number;
  /** Replace this 0-based char with the pixel-square brand glyph (■). */
  glyphAt?: number;
}

interface BrokenWordProps {
  rows: [Row, Row];
  /** Real word for screen readers (visual rows are aria-hidden). */
  label: string;
  /** Sawtooth strip color between the rows. */
  saw?: "volt" | "ink" | "bone";
  sizeClass?: string;
}

/**
 * The reference's centerpiece typography: a word broken across two rows,
 * offset to opposite edges, rising from behind the sawtooth strip and
 * traveling horizontally with scroll (motion-study #8, #11, #12, #16).
 */
export function BrokenWord({ rows, label, saw = "volt", sizeClass = "text-[clamp(5rem,17vw,15rem)]" }: BrokenWordProps) {
  return (
    <div className="relative -mx-4 sm:-mx-6" role="img" aria-label={label}>
      {rows.map((row, i) => (
        <div key={i}>
          <div className="rise-mask" data-rise-fallback="">
            <p
              aria-hidden="true"
              className={`display whitespace-nowrap ${sizeClass} ${
                row.bleed === "left" ? "-ml-[0.06em] text-left" : "-mr-[0.06em] text-right"
              }`}
              data-rise=""
              data-travel={row.travel}
            >
              {row.glyphAt === undefined
                ? row.text
                : row.text.split("").map((ch, ci) =>
                    ci === row.glyphAt ? (
                      <span key={ci} className="mx-[0.045em] inline-block h-[0.62em] w-[0.62em] -translate-y-[0.03em] bg-volt align-baseline" />
                    ) : (
                      <span key={ci}>{ch}</span>
                    )
                  )}
            </p>
          </div>
          {i === 0 && <Sawtooth color={saw} height={18} />}
        </div>
      ))}
    </div>
  );
}
