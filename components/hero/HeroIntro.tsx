"use client";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { type IntroPhase, useIntroStore } from "@/lib/intro-store";
import { orchestrator } from "@/lib/load-orchestrator";

/**
 * Hero controller: takes the handoff from the loader and lands the
 * block-letter lockup in its final state (skip, reduced motion and
 * already-finished phases all share finalState()).
 */
export function HeroIntro() {
  useGSAP(() => {
    const hero = document.querySelector<HTMLElement>('[data-section="hero"]');
    if (!hero) return;
    const imLetters = gsap.utils.toArray<HTMLElement>("[data-hero-im] [data-block-letter]", hero);
    const nameLetters = gsap.utils.toArray<HTMLElement>("[data-hero-lockup] [data-block-letter]", hero);
    const lockup = hero.querySelector<HTMLElement>("[data-hero-lockup]");
    const bars = gsap.utils.toArray<HTMLElement>("[data-hero-bar]", hero);
    const lines = gsap.utils.toArray<HTMLElement>("[data-hero-lockup] [data-hero-line]", hero);
    if (!lockup) return;

    const docEl = document.documentElement;
    let unsubPhase: (() => void) | null = null;

    // GSAP parses the CSS gate's translateY(115%) into px `y` on first
    // touch, so every yPercent set also zeroes y.
    const finalState = () => {
      gsap.set([...imLetters, ...nameLetters, ...lines], { y: 0, yPercent: 0 });
      gsap.set(bars, { autoAlpha: 1 });
      gsap.set(lockup, { y: 0 });
      docEl.dataset.intro = "done";
      useIntroStore.getState().setPhase("done");
      ScrollTrigger.refresh();
    };

    // The hero is pure markup: once fonts settle, its display is measured.
    document.fonts.ready.then(() => orchestrator.set("hero", 1));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || docEl.dataset.intro === "skip") {
      orchestrator.completeAll();
      finalState();
      return;
    }

    const released = (phase: IntroPhase) => phase === "reveal" || phase === "skipped" || phase === "done";

    if (released(useIntroStore.getState().phase)) {
      finalState();
    } else {
      unsubPhase = useIntroStore.subscribe((state) => {
        if (!released(state.phase)) return;
        // unsubscribe first: finalState() sets the phase itself
        unsubPhase?.();
        unsubPhase = null;
        finalState();
      });
    }

    return () => {
      unsubPhase?.();
    };
  });

  return null;
}
