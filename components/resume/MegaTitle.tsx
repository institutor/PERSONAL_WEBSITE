interface MegaTitleProps {
  text: string;
  index?: string;
  /** "solid" leads with filled text, "outline" leads hollow. */
  lead?: "solid" | "outline";
  className?: string;
}

/**
 * Section title, v5: one MASSIVE single line — far wider than the viewport —
 * traveling straight across the screen as the band scrolls ([data-mega]
 * scrub). A hollow echo trails the filled word; a bone square separates.
 */
export function MegaTitle({ text, index, lead = "solid", className }: MegaTitleProps) {
  const first = lead === "solid" ? "" : "outline-text";
  const second = lead === "solid" ? "outline-text" : "";
  return (
    <div
      className={`relative -mx-4 overflow-hidden py-2 sm:-mx-6 ${className ?? ""}`}
      role="img"
      aria-label={text}
    >
      <p
        data-mega
        aria-hidden="true"
        className="display whitespace-nowrap text-[clamp(7rem,27vw,25rem)] will-change-transform"
      >
        {index && (
          <sup className="lbl relative -top-[2.2em] mr-8 inline-block align-baseline opacity-60">
            ( {index} )
          </sup>
        )}
        <span className={first}>{text}</span>
        <span aria-hidden="true" className="mx-[0.3em] inline-block h-[0.5em] w-[0.5em] -translate-y-[0.05em] bg-bone align-baseline" />
        <span className={second}>{text}</span>
      </p>
    </div>
  );
}
