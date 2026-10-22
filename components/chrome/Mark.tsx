import { GLYPHS, pointsAttr } from "@/lib/block-letters";

/**
 * The site's mark: the block-letter J from the hero alphabet, as an inline
 * SVG in currentColor (the chrome's blend-difference inverts it over bone).
 * The favicon set in app/ is the same glyph on an ink tile.
 */
export function Mark({ className }: { className?: string }) {
  const j = GLYPHS.J;
  return (
    <svg
      viewBox={`0 0 ${j.w} 100`}
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      {j.polys.map((poly, i) => (
        <polygon key={i} points={pointsAttr(poly)} />
      ))}
    </svg>
  );
}
