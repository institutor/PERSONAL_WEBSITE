import { SLIT, SLOT_W, glyphOf, pointsAttr, wordUnits } from "@/lib/block-letters";

interface BlockWordProps {
  text: string;
  /** Append the full-stop cell that holds the square actor's slot. */
  trailingSlot?: boolean;
  label?: string;
  className?: string;
}

/**
 * A word drawn in the block alphabet, as wide as its container. Each letter
 * sits in its own overflow-hidden cell so the intro can rise it from below
 * its baseline (the reference's per-letter SVG mask). Widths and the slit
 * are percentages of the word's own unit width, so every cell is exactly
 * w : 100 and preserveAspectRatio="none" never distorts a glyph.
 */
export function BlockWord({ text, trailingSlot = false, label, className }: BlockWordProps) {
  const units = wordUnits(text, { trailingSlot });
  const pct = (u: number) => `${(u / units) * 100}%`;

  return (
    <span
      data-block-word
      role="img"
      aria-label={label ?? text}
      className={`block w-full ${className ?? ""}`}
      style={{ aspectRatio: `${units} / 100` }}
    >
      <span className="flex h-full w-full" style={{ gap: pct(SLIT) }}>
        {Array.from(text, (ch, i) => {
          const g = glyphOf(ch);
          return (
            <span
              key={i}
              data-block-cell
              className="relative block h-full shrink-0 overflow-hidden"
              style={{ width: pct(g.w) }}
            >
              <span data-block-letter className="block h-full w-full will-change-transform">
                <svg
                  viewBox={`0 0 ${g.w} 100`}
                  preserveAspectRatio="none"
                  className="block h-full w-full"
                  aria-hidden="true"
                  focusable="false"
                >
                  {g.polys.map((poly, j) => (
                    <polygon key={j} points={pointsAttr(poly)} fill="currentColor" />
                  ))}
                </svg>
              </span>
            </span>
          );
        })}
        {trailingSlot && (
          <span data-block-cell className="relative block h-full shrink-0" style={{ width: pct(SLOT_W) }}>
            <span
              data-sq-slot
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 w-full"
              style={{ aspectRatio: "1 / 1" }}
            />
          </span>
        )}
      </span>
    </span>
  );
}
