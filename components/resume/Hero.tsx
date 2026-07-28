import { identity } from "@/lib/resume-data";

/**
 * "The desk" — what the 3D monitor screen becomes. Phase 6 pixel-matches
 * screen-placeholder.webp to this section, so keep its first paint stable.
 */
export function Hero() {
  return (
    <section
      id="hero"
      data-section="hero"
      className="relative flex min-h-svh flex-col items-center justify-center px-6 text-center"
    >
      {/* Signature lockup — Phase 4 swaps in the animated SVG artwork */}
      <p className="font-note text-3xl text-ink-muted -rotate-2" data-signature>
        {identity.signature}
      </p>

      <h1 className="font-hand mt-4 text-6xl font-bold tracking-tight sm:text-8xl">
        {identity.name}
      </h1>

      <p className="mt-6 max-w-xl text-lg text-ink-muted">{identity.tagline}</p>

      <p className="mt-2 text-sm text-ink-muted">
        {identity.location} · {identity.scholar}
      </p>

      <nav
        aria-label="Primary links"
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <a
          href={identity.links.resumePdf}
          className="rounded-md border-2 border-ink px-5 py-2.5 font-hand text-lg font-medium transition-transform hover:-translate-y-0.5"
          data-rough-box
        >
          Download resume
        </a>
        <a
          href={identity.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border-2 border-ink px-5 py-2.5 font-hand text-lg font-medium transition-transform hover:-translate-y-0.5"
          data-rough-box
        >
          GitHub
        </a>
        <a
          href={`mailto:${identity.links.email}`}
          className="rounded-md border-2 border-ink px-5 py-2.5 font-hand text-lg font-medium transition-transform hover:-translate-y-0.5"
          data-rough-box
        >
          Email me
        </a>
      </nav>

      {/* Scroll cue — Phase 1 swaps in the boiling hand-drawn arrow */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-muted"
        data-scroll-cue
        aria-hidden="true"
      >
        <span className="font-note text-xl">scroll</span>
        <span className="ml-2 inline-block animate-bounce">↓</span>
      </div>
    </section>
  );
}
