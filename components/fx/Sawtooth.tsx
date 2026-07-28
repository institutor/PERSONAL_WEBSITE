const COLORS = {
  volt: "%231e32e8",
  ink: "%23101014",
  bone: "%23e5ded2",
} as const;

interface SawtoothProps {
  color?: keyof typeof COLORS;
  /** Strip height in px (teeth scale to it). */
  height?: number;
  className?: string;
  /** Marquee direction; ScrollFx animates [data-saw] by exactly one tooth. */
  reverse?: boolean;
}

/**
 * The signature divider: repeating solid triangles pointing down
 * (motion-study #16), continuously marqueeing — velocity couples to scroll.
 * Seamless: inner layer is one tooth wider and translates exactly one pitch.
 */
export function Sawtooth({ color = "volt", height = 20, className, reverse }: SawtoothProps) {
  const tile = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 20' preserveAspectRatio='none'%3E%3Cpath d='M0 0 H44 L22 20 Z' fill='${COLORS[color]}'/%3E%3C/svg%3E")`;
  return (
    <div
      className={`overflow-hidden ${className ?? ""}`}
      style={{ height }}
      aria-hidden="true"
    >
      <div
        data-saw={reverse ? "r" : "l"}
        className="h-full will-change-transform"
        style={{
          width: "calc(100% + 88px)",
          marginLeft: "-44px",
          backgroundImage: tile,
          backgroundSize: "44px 100%",
          backgroundRepeat: "repeat-x",
        }}
      />
    </div>
  );
}
