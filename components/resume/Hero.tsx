import { BlockWord } from "@/components/hero/BlockWord";
import { HeroIntro } from "@/components/hero/HeroIntro";
import { QuoteBar } from "@/components/hero/QuoteBar";
import { identity } from "@/lib/resume-data";

/**
 * Title screen in the reference's block letterforms: a small I'M top-left,
 * then the JIEWEN. lockup centred across the gutters — the word, a bone
 * bar carrying the cycling quote, and a shorter bar with the school line.
 * The square actor is born as the full stop: "I'M JIEWEN."
 */
export function Hero() {
  return (
    <section
      id="hero"
      data-section="hero"
      className="relative z-0 h-svh overflow-hidden bg-ink text-bone"
    >
      <h1 className="sr-only">I&apos;m Jiewen Huang</h1>

      <div
        data-hero-im
        aria-hidden="true"
        className="absolute left-4 top-[3.25rem] w-[clamp(96px,11vw,180px)] sm:left-6 sm:top-14"
      >
        <BlockWord text="I'M" />
      </div>

      {/* centring wrapper; GSAP never touches it */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-6">
        <div data-hero-lockup className="will-change-transform">
          <BlockWord text="JIEWEN" trailingSlot label="JIEWEN" />
          <div data-hero-bar="quote" className="hero-bar mt-[clamp(2px,0.55vw,9px)] w-full">
            <QuoteBar />
          </div>
          <div
            data-hero-bar="school"
            className="hero-bar ml-auto mt-[clamp(2px,0.55vw,9px)] w-fit min-w-[26%] max-w-full sm:ml-[50%] sm:max-w-[50%]"
          >
            {/* phones: right-aligned (starts ≈ at centre) so the line never clips */}
            <span className="line-mask">
              <span data-hero-line className="block whitespace-nowrap">
                {identity.heroLine}
              </span>
            </span>
          </div>
        </div>
      </div>

      <HeroIntro />
    </section>
  );
}
