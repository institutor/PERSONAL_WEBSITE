interface BandProps {
  id: string;
  /** Parenthetical micro-label, e.g. "( say hi )". */
  paren?: string;
  className?: string;
  children: React.ReactNode;
}

/** Section band — v5: pure ink, no ornament, no numbering. Motion carries the design. */
export function Band({ id, paren, className, children }: BandProps) {
  return (
    <section
      id={id}
      data-band
      className={`band-ink relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 ${className ?? ""}`}
    >
      {paren && <p className="paren mb-10">{paren}</p>}

      {children}
    </section>
  );
}
