"use client";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { REST_INSET_PX, bottomRestOffset } from "@/lib/hero-intro-math";
import { type IntroPhase, useIntroStore } from "@/lib/intro-store";
import { orchestrator } from "@/lib/load-orchestrator";

/**
 * Hero controller: takes the handoff from the loader and plays the intro
 * (spec §3.1): I'M rises, JIEWEN climbs letter by letter out of the bottom
 * edge with the lockup resting low, the bars fade in and their lines rise,
 * then the lockup floats to centre. Skip, reduced motion, a mid-page reload
 * and already-finished phases all share finalState() instead.
 *
 * Scroll: the hero is a sticky z-0 layer; while the sections slide over it,
 * the lockup and I'M scrub to nothing across the first 85% of a viewport.
 */
export function HeroIntro() {
  useGSAP(() => {
    const hero = document.querySelector<HTMLElement>('[data-section="hero"]');
    if (!hero) return;
    const imLetters = gsap.utils.toArray<HTMLElement>("[data-hero-im] [data-block-letter]", hero);
    const nameLetters = gsap.utils.toArray<HTMLElement>("[data-hero-lockup] [data-block-letter]", hero);
    const lockup = hero.querySelector<HTMLElement>("[data-hero-lockup]");
    const im = hero.querySelector<HTMLElement>("[data-hero-im]");
    const bars = gsap.utils.toArray<HTMLElement>("[data-hero-bar]", hero);
    const lines = gsap.utils.toArray<HTMLElement>("[data-hero-lockup] [data-hero-line]", hero);
    if (!lockup || !im) return;

    const docEl = document.documentElement;
    let unsubPhase: (() => void) | null = null;
    let intro: gsap.core.Timeline | null = null;

    const done = () => {
      docEl.dataset.intro = "done";
      useIntroStore.getState().setPhase("done");
      ScrollTrigger.refresh();
    };

    // GSAP parses the CSS gate's translateY(115%) into px `y` on first
    // touch, so every yPercent set also zeroes y.
    const finalState = () => {
      gsap.set([...imLetters, ...nameLetters, ...lines], { y: 0, yPercent: 0 });
      gsap.set(bars, { autoAlpha: 1 });
      gsap.set(lockup, { y: 0 });
      done();
    };

    const playIntro = () => {
      if (window.scrollY > window.innerHeight * 0.4) {
        finalState();
        return;
      }
      gsap.set(imLetters, { y: 0, yPercent: 110 });
      gsap.set(nameLetters, { y: 0, yPercent: 110 });
      gsap.set(bars, { autoAlpha: 0 });
      gsap.set(lines, { y: 0, yPercent: 110 });
      // measured at home (the lockup itself is never gated); resize mid-intro is ignored
      const r = lockup.getBoundingClientRect();
      const rest = bottomRestOffset({
        viewportHeight: window.innerHeight,
        lockupTop: r.top,
        lockupHeight: r.height,
        inset: REST_INSET_PX,
      });
      gsap.set(lockup, { y: rest });

      intro = gsap
        .timeline({ onComplete: done })
        .to(imLetters, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0)
        .to(nameLetters, { yPercent: 0, duration: 0.95, ease: "power3.out", stagger: 0.085 }, 0.25)
        .to(bars, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.75)
        .to(lines, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 }, 0.92)
        .to(lockup, { y: 0, duration: 1.05, ease: "power3.inOut" }, 1.65);
    };

    // Registered regardless of intro phase, so a mid-page reload is already
    // faded (the matchMedia belongs to the useGSAP context and reverts with it).
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        [lockup, im],
        { autoAlpha: 1 },
        {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            start: 0,
            end: () => window.innerHeight * 0.85,
            scrub: 0.3,
            invalidateOnRefresh: true,
          },
        },
      );
    });

    // The hero is pure markup: once fonts settle, its display is measured.
    document.fonts.ready.then(() => orchestrator.set("hero", 1));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || docEl.dataset.intro === "skip") {
      orchestrator.completeAll();
      finalState();
      return;
    }

    const handoff = (phase: IntroPhase) => (phase === "reveal" ? playIntro() : finalState());

    const { phase } = useIntroStore.getState();
    if (phase !== "loading") {
      handoff(phase);
    } else {
      unsubPhase = useIntroStore.subscribe((state) => {
        if (state.phase === "loading") return;
        // unsubscribe first: the handoff sets the phase itself
        unsubPhase?.();
        unsubPhase = null;
        handoff(state.phase);
      });
    }

    return () => {
      unsubPhase?.();
      intro?.kill();
    };
  });

  return null;
}
