import { LETTERING, type LetteringName } from "@/lib/generated/lettering-paths";

interface LetteringProps {
  name: LetteringName;
  /** Real text for screen readers / SEO. Omit only for pure decoration. */
  label?: string;
  className?: string;
  /** "width" (default): svg fills wrapper width. "height": sized by height. */
  fit?: "width" | "height";
  boil?: boolean;
  /** Mark letters for the Phase-2 staggered DrawSVG draw-on. */
  draw?: boolean;
}

/**
 * REAL hand-drawn lettering — not a font. Each letter is stroke artwork
 * generated at build time (Hershey single-stroke skeleton → seeded rough.js
 * jitter × 3 boil frames). Server component: paths render as static HTML.
 */
export function Lettering({ name, label, className, fit = "width", boil = true, draw }: LetteringProps) {
  const art = LETTERING[name];
  const svgClass = fit === "width" ? "block w-full h-auto overflow-visible" : "block h-full w-auto overflow-visible";
  return (
    <span className={className ? `inline-block ${className}` : "inline-block"}>
      {label && <span className="sr-only">{label}</span>}
      <svg
        viewBox={`0 0 ${art.w} ${art.h}`}
        className={svgClass}
        aria-hidden="true"
        focusable="false"
        data-lettering={name}
        data-draw-group={draw ? "" : undefined}
      >
        {art.letters.map((letter, li) => (
          <g key={li} data-letter="">
            {letter.frames.map((framePaths, fi) => {
              if (!boil && fi > 0) return null;
              return (
                <g key={fi} className={boil ? `boil boil-f${fi}` : undefined}>
                  {framePaths.map((d, pi) => (
                    <path
                      key={pi}
                      d={d}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={art.sw}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </span>
  );
}
