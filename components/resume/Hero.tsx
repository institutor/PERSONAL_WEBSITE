import { BlockWord } from "@/components/hero/BlockWord";
import { HeroIntro } from "@/components/hero/HeroIntro";
import { identity } from "@/lib/resume-data";

/**
 * Title screen in the reference's block letterforms: a small I'M top-left,
 * "( jee-WEN )" top-right (and, on phones, a best-on-desktop note bottom-left), then the JIEWEN. lockup centred across the
 * gutters — the word, a bone bar (shape only: no copy, sized like the
 * reference's ~7% of cap height), and the school line on a tab hanging off
 * the bar's right end (45° cut on its left, like the letters' chamfers;
 * straight and flush on the right).
 * The square actor is born as the full stop: "I'M JIEWEN."
 *
 * Sticky z-0 layer: the sections scroll up over it while HeroIntro fades
 * the lockup and I'M out (reduced motion: a normal in-flow section).
 */
export function Hero() {
  return (
    <section
      id="hero"
      data-section="hero"
      className="sticky top-0 z-0 h-svh overflow-hidden bg-ink text-bone"
    >
      <h1 className="sr-only">I&apos;m Jiewen Huang</h1>

      <div
        data-hero-im
        aria-hidden="true"
        className="absolute left-4 top-[3.25rem] w-[clamp(96px,11vw,180px)] sm:left-6 sm:top-14"
      >
        <BlockWord text="I'M" />
      </div>

      <div
        data-hero-say
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-[3.25rem] text-right sm:right-6 sm:top-14"
      >
        <span className="line-mask">
          <span data-hero-line className="paren block">
            ( jee-WEN )
          </span>
        </span>
      </div>

      {/* phones: the site is built for a wide screen; say so quietly. Rises
          with ( jee-WEN ) and fades with the hero (data-hero-say). */}
      <div
        data-hero-say
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 left-4 md:hidden"
      >
        <span className="line-mask">
          <span data-hero-line className="lbl block opacity-60">
            BEST EXPERIENCED ON DESKTOP
          </span>
        </span>
      </div>

      {/* centring wrapper; GSAP never touches it */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-6">
        <div data-hero-lockup className="will-change-transform">
          <BlockWord text="JIEWEN" trailingSlot label="JIEWEN" />
          <div
            data-hero-bar="quote"
            aria-hidden="true"
            className="hero-bar hero-bar-blank mt-[clamp(2px,0.55vw,9px)] w-full"
          />
          <div data-hero-bar="school" className="hero-bar hero-tab -mt-px ml-auto w-fit min-w-[20%] max-w-full">
            {/* starts 4/5 across; on phones it widens to fit its line */}
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
