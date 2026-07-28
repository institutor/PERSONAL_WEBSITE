import { identity } from "@/lib/resume-data";
import { Lettering } from "./ornaments/Lettering";
import { Sketch } from "./ornaments/Sketch";

/**
 * "The desk" — what the 3D monitor screen becomes. The name is REAL drawn
 * stroke artwork (massive, boiling, draw-on animated in Phase 2). Phase 6
 * pixel-matches screen-placeholder.webp to this section.
 */
export function Hero() {
  return (
    <section
      id="hero"
      data-section="hero"
      className="relative flex min-h-svh flex-col items-center justify-center px-6 text-center"
    >
      {/* The signature — same artwork the loader draws (continuity trick) */}
      <p aria-hidden="true" data-signature>
        <Lettering name="signature" className="w-40 -rotate-3 text-ink-muted sm:w-48" />
      </p>

      {/* The massive hand-drawn title */}
      <h1 className="mt-6 w-full">
        <Lettering
          name="name"
          label={identity.name}
          className="mx-auto w-[min(92vw,1000px)] text-ink"
          draw
        />
      </h1>

      <Sketch name="underline2" className="mt-4 w-[min(60vw,420px)] text-accent" draw />

      <p className="mt-8 max-w-xl text-lg text-ink-muted">{identity.tagline}</p>

      <p className="mt-2 text-sm text-ink-muted">
        {identity.location} · {identity.scholar}
      </p>

      <nav
        aria-label="Primary links"
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <a
          href={identity.links.resumePdf}
          className="rough-box bg-paper-2 px-4 py-1.5 font-hand text-lg font-medium transition-transform hover:-translate-y-0.5"
        >
          Download resume
        </a>
        <a
          href={identity.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="rough-box bg-paper-2 px-4 py-1.5 font-hand text-lg font-medium transition-transform hover:-translate-y-0.5"
        >
          GitHub
        </a>
        <a
          href={`mailto:${identity.links.email}`}
          className="rough-box bg-paper-2 px-4 py-1.5 font-hand text-lg font-medium transition-transform hover:-translate-y-0.5"
        >
          Email me
        </a>
      </nav>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-muted"
        data-scroll-cue
        aria-hidden="true"
      >
        <span className="font-note text-xl">scroll</span>
        <Sketch name="arrowDown" className="mx-auto mt-1 w-4" />
      </div>
    </section>
  );
}
