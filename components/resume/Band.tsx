import { Shapes } from "@/components/fx/Shapes";

interface BandProps {
  id: string;
  /** Minimalist v3: every band is black. */
  tone?: "bone" | "ink";
  /** Giant corner numeral, e.g. "02". */
  index?: string;
  /** Parenthetical micro-label, e.g. "( shipped )". */
  paren?: string;
  /** Three-part label row at the band top: [left, center, right]. */
  topRow?: [string, string, string];
  shapes?: "a" | "b" | "c";
  className?: string;
  children: React.ReactNode;
}

/** Section band (motion-study #1, #4, #5, #6) — all-ink in the v3 direction. */
export function Band({ id, tone = "ink", index, paren, topRow, shapes, className, children }: BandProps) {
  return (
    <section
      id={id}
      data-band
      className={`band-${tone} relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 ${className ?? ""}`}
    >
      {shapes && <Shapes variant={shapes} />}

      {topRow && (
        <div className="lbl mb-16 flex items-baseline justify-between gap-4 opacity-90">
          <span>{topRow[0]}</span>
          <span className="hidden sm:inline">{topRow[1]}</span>
          <span>{topRow[2]}</span>
        </div>
      )}

      {index && (
        <p className="numeral absolute right-4 top-36 sm:right-8" aria-hidden="true" data-depth="0.18">
          {index}
        </p>
      )}

      {paren && <p className="paren mb-10">{paren}</p>}

      {children}
    </section>
  );
}
