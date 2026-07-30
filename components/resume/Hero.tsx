import { HeroSpaceClient } from "@/components/hero/HeroSpaceClient";
import { identity } from "@/lib/resume-data";

const IM = ["I", "'", "m"] as const;
const NAME = ["J", "I", "E", "W", "E", "N"] as const;

/**
 * Title screen per the reference layout: "I'm" massive top-left, "JIEWEN"
 * massive bottom-right (bleeding off the edge), split by the animated
 * sawtooth divider. Both words pixel-dissipate on scroll (WebGL).
 */
export function Hero() {
  return (
    <section
      id="hero"
      data-section="hero"
      className="band-ink relative flex min-h-svh flex-col justify-center overflow-hidden py-16"
    >
      <HeroSpaceClient />

      {/* I'm — top-left, kissing the edge */}
      <h1 className="relative z-10" aria-label="I'm Jiewen — Jiewen Huang">
        <span aria-hidden="true" className="block" data-hero-word="im">
          <span className="display -ml-[0.045em] block overflow-hidden whitespace-nowrap normal-case text-[clamp(7rem,24vw,22rem)]">
            {IM.map((ch, i) => (
              <span key={i} className="inline-block will-change-transform" data-hero-letter>
                {ch}
              </span>
            ))}
          </span>
        </span>

        {/* the divider — one clean rule. The square actor is born on it. */}
        <span className="relative my-6 block sm:my-8" data-hero-divider>
          <span className="block h-[3px] w-full bg-bone" />
          <span
            data-sq-slot
            className="pointer-events-none absolute -top-8 right-[7%] h-6 w-6"
            aria-hidden="true"
          />
        </span>

        {/* JIEWEN — bottom-right, bigger, bleeding off the right edge */}
        <span aria-hidden="true" className="block text-right" data-hero-word="name">
          <span className="display -mr-[0.05em] block overflow-hidden whitespace-nowrap text-[clamp(6rem,26.5vw,26rem)]">
            {NAME.map((ch, i) => (
              <span key={i} className="inline-block will-change-transform" data-hero-letter>
                {ch}
              </span>
            ))}
          </span>
        </span>
      </h1>

      {/* corner matter */}
      <div className="pointer-events-none absolute right-4 top-12 z-10 text-right sm:right-6" aria-hidden="true">
        <p className="paren opacity-0" data-hero-fade>
          ( software engineer )
        </p>
        <div className="bodycol mt-4 hidden text-right opacity-0 sm:block" data-hero-fade>
          <strong>The short version</strong>
          Ships things that matter: a K-8 reading platform live for 190 students, an agent-native
          100k-line backend at a YC startup. Next: Columbia CS &amp; Math, class of &rsquo;30.
        </div>
      </div>

      <p className="lbl pointer-events-none absolute bottom-12 left-4 z-10 opacity-0 sm:left-6" data-hero-fade>
        BROOKLYN, NEW YORK
      </p>
    </section>
  );
}
