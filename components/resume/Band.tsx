interface BandProps {
  id: string;
  /** Giant corner numeral, e.g. "06". */
  index?: string;
  /** Parenthetical micro-label, e.g. "( say hi )". */
  paren?: string;
  className?: string;
  children: React.ReactNode;
}

/** Section band — v5: pure ink, no ornament. Motion carries the design. */
export function Band({ id, index, paren, className, children }: BandProps) {
  return (
    <section
      id={id}
      data-band
      className={`band-ink relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 ${className ?? ""}`}
    >
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
