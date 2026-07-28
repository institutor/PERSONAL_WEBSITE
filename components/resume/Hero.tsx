import { HeroSpaceClient } from "@/components/hero/HeroSpaceClient";
import { identity } from "@/lib/resume-data";

const LETTERS = ["J", "I", "E", "W", "E", "N"] as const;

/**
 * The title screen. JIEWEN sits at the bottom-left screen edge — barely not
 * clipped — as individual letter spans (the intro floats them up one by one;
 * the WebGL layer later knocks the space scene out inside them).
 */
export function Hero() {
  return (
    <section
      id="hero"
      data-section="hero"
      className="relative flex min-h-svh flex-col"
    >
      <HeroSpaceClient />

      <p className="microlabel absolute left-6 top-6">
        JH — Portfolio / 2026
      </p>

      <nav
        aria-label="Primary links"
        className="absolute right-6 top-6 flex gap-6 font-mono text-xs tracking-wider"
      >
        <a className="text-muted transition-colors hover:text-ion" href={identity.links.github} target="_blank" rel="noopener noreferrer">
          GITHUB
        </a>
        <a className="text-muted transition-colors hover:text-ion" href={identity.links.linkedin} target="_blank" rel="noopener noreferrer">
          LINKEDIN
        </a>
        <a className="text-muted transition-colors hover:text-ion" href={`mailto:${identity.links.email}`}>
          EMAIL
        </a>
        <a className="text-muted transition-colors hover:text-ion" href={identity.links.resumePdf}>
          RESUME.PDF
        </a>
      </nav>

      <div className="absolute bottom-10 right-6 hidden max-w-xs text-right sm:block">
        <p className="text-sm text-muted">{identity.tagline}</p>
        <p className="microlabel mt-3">
          {identity.location} · QuestBridge Match Scholar
        </p>
      </div>

      {/* The name — hugging the bottom-left edge by design */}
      <h1
        aria-label="I'm Jiewen — Jiewen Huang"
        className="absolute -bottom-[0.035em] left-0 select-none"
        data-hero-name
      >
        <span aria-hidden="true" className="mb-1 ml-[0.08em] block font-body text-xl italic text-muted sm:text-2xl" data-hero-im>
          I&rsquo;m
        </span>
        <span
          aria-hidden="true"
          className="block overflow-hidden font-display text-[clamp(5.5rem,21vw,19rem)] font-bold uppercase leading-[0.78] tracking-[-0.02em]"
          data-hero-letters
        >
          {LETTERS.map((ch, i) => (
            <span key={i} className="inline-block will-change-transform" data-hero-letter>
              {ch}
            </span>
          ))}
        </span>
      </h1>
    </section>
  );
}
