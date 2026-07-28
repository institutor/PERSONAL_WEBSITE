import { SKETCHES, type SketchName } from "@/lib/generated/sketch-paths";

interface SketchProps {
  name: SketchName;
  className?: string;
  /** Continuous 3-frame boil (default). Set false for a static frame. */
  boil?: boolean;
  /** Mark paths for the Phase-2 DrawSVG draw-on. */
  draw?: boolean;
  strokeWidth?: number;
}

/**
 * Renders a build-time-generated rough.js ornament. Stroke = currentColor,
 * so color comes from text-* utilities. Server component: path data never
 * enters the client bundle.
 */
export function Sketch({ name, className, boil = true, draw, strokeWidth }: SketchProps) {
  const art = SKETCHES[name];
  return (
    <svg
      viewBox={`0 0 ${art.w} ${art.h}`}
      className={`block${draw ? " draw-pending" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      focusable="false"
      data-sketch={name}
      data-draw-group={draw ? "" : undefined}
    >
      {art.frames.map((framePaths, fi) => {
        if (!boil && fi > 0) return null;
        return (
          <g key={fi} className={boil ? `boil boil-f${fi}` : undefined}>
            {framePaths.map((p, pi) => (
              <path
                key={pi}
                d={p.d}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth ?? p.sw}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
