type ShapeKind = "sq" | "osq" | "plus" | "tri";

interface ShapeSpec {
  kind: ShapeKind;
  /** Position as % of the band. */
  x: number;
  y: number;
  size: number;
  volt?: boolean;
  /** Parallax depth for ScrollFx ([data-depth]); 0 = static. */
  depth?: number;
  rotate?: number;
}

/**
 * Random-feeling (but deterministic — hydration-safe) small shapes pinned
 * against the rigid grid, some drifting on scroll (motion-study #18).
 */
const VARIANTS: Record<string, ShapeSpec[]> = {
  a: [
    { kind: "sq", x: 72, y: 14, size: 10, volt: true, depth: 0.35 },
    { kind: "osq", x: 8, y: 62, size: 16, depth: 0.2, rotate: 12 },
    { kind: "plus", x: 88, y: 74, size: 14, volt: true, depth: 0.5 },
    { kind: "sq", x: 46, y: 30, size: 6, depth: 0.15 },
  ],
  b: [
    { kind: "plus", x: 12, y: 22, size: 15, volt: true, depth: 0.4 },
    { kind: "sq", x: 90, y: 30, size: 8, depth: 0.25 },
    { kind: "tri", x: 64, y: 80, size: 14, volt: true, depth: 0.3, rotate: 180 },
    { kind: "osq", x: 30, y: 88, size: 12, depth: 0.5, rotate: 30 },
  ],
  c: [
    { kind: "osq", x: 82, y: 18, size: 14, volt: true, depth: 0.3, rotate: 20 },
    { kind: "sq", x: 6, y: 40, size: 9, depth: 0.45 },
    { kind: "plus", x: 52, y: 12, size: 12, depth: 0.2 },
    { kind: "tri", x: 16, y: 84, size: 12, volt: true, depth: 0.35 },
  ],
};

function Glyph({ s }: { s: ShapeSpec }) {
  const c = s.volt ? "var(--volt)" : "currentColor";
  const common = {
    width: s.size,
    height: s.size,
  };
  switch (s.kind) {
    case "sq":
      return <rect {...common} fill={c} />;
    case "osq":
      return <rect x={0.75} y={0.75} width={s.size - 1.5} height={s.size - 1.5} fill="none" stroke={c} strokeWidth={1.5} />;
    case "plus":
      return (
        <path
          d={`M${s.size / 2 - 1.25} 0 h2.5 v${s.size / 2 - 1.25} h${s.size / 2 - 1.25} v2.5 h-${s.size / 2 - 1.25} v${s.size / 2 - 1.25} h-2.5 v-${s.size / 2 - 1.25} h-${s.size / 2 - 1.25} v-2.5 h${s.size / 2 - 1.25} z`}
          fill={c}
        />
      );
    case "tri":
      return <path d={`M0 0 H${s.size} L${s.size / 2} ${s.size} Z`} fill={c} />;
  }
}

export function Shapes({ variant }: { variant: keyof typeof VARIANTS }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {VARIANTS[variant].map((s, i) => (
        <svg
          key={i}
          viewBox={`0 0 ${s.size} ${s.size}`}
          width={s.size}
          height={s.size}
          className="absolute opacity-90"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: s.rotate ? `rotate(${s.rotate}deg)` : undefined,
          }}
          data-depth={s.depth || undefined}
        >
          <Glyph s={s} />
        </svg>
      ))}
    </div>
  );
}
