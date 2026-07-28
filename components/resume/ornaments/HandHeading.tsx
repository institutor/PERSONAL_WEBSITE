interface HandHeadingProps {
  eyebrow?: string;
  children: React.ReactNode;
}

/**
 * Section heading in Shantell Sans. Phase 1 replaces the plain underline with
 * a generated rough.js stroke; Phase 2 adds the SplitText line-mask reveal
 * (hook: [data-heading] / [data-underline]).
 */
export function HandHeading({ eyebrow, children }: HandHeadingProps) {
  return (
    <header className="mb-12">
      {eyebrow && (
        <p className="font-note text-2xl text-accent mb-1" aria-hidden="true">
          {eyebrow}
        </p>
      )}
      <h2 className="font-hand text-4xl sm:text-5xl font-semibold" data-heading>
        {children}
      </h2>
      <div
        className="mt-4 h-[3px] w-28 rounded-full bg-ink-faint"
        data-underline
        aria-hidden="true"
      />
    </header>
  );
}
