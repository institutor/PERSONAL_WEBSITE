import type { LetteringName } from "@/lib/generated/lettering-paths";
import { Lettering } from "./Lettering";
import { Sketch } from "./Sketch";

interface HandHeadingProps {
  /** Which generated lettering artwork to render. */
  art: LetteringName;
  /** Real heading text (sr-only, for SEO/a11y). */
  text: string;
  eyebrow?: string;
  /** Tailwind height classes controlling the lettering size. */
  sizeClass?: string;
}

/**
 * Section heading as REAL drawn stroke lettering (not a font), with a rough
 * underline. Phase 2 adds the staggered DrawSVG draw-on via [data-draw-group].
 */
export function HandHeading({ art, text, eyebrow, sizeClass = "h-12 sm:h-16" }: HandHeadingProps) {
  return (
    <header className="mb-12">
      {eyebrow && (
        <p className="font-note text-2xl text-accent mb-2" aria-hidden="true">
          {eyebrow}
        </p>
      )}
      <h2 data-heading>
        <Lettering name={art} label={text} fit="height" className={`${sizeClass} max-w-full text-ink`} draw />
      </h2>
      <Sketch name="underline1" className="mt-3 w-36 text-accent" draw />
    </header>
  );
}
