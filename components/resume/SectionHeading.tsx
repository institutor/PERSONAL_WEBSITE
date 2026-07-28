interface SectionHeadingProps {
  index: string;
  label: string;
  title: string;
  /** Nebula pan position for this heading's knockout — varies per section. */
  kx?: string;
  ky?: string;
}

/**
 * Section heading with the site's signature: space imagery knocked out
 * inside the glyphs (same texture the WebGL hero collapses into).
 */
export function SectionHeading({ index, label, title, kx = "50%", ky = "50%" }: SectionHeadingProps) {
  return (
    <header className="mb-14">
      <p className="microlabel mb-3">
        {index} <span aria-hidden="true">/</span> {label}
      </p>
      <h2
        className="knockout font-display text-5xl font-bold tracking-tight sm:text-7xl"
        style={{ "--kx": kx, "--ky": ky } as React.CSSProperties}
        data-heading
      >
        {title}
      </h2>
    </header>
  );
}
