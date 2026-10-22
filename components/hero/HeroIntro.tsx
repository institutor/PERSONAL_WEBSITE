"use client";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { HANDOFF_LINE_PX, REST_INSET_PX, bottomRestOffset } from "@/lib/hero-intro-math";
import { type IntroPhase, useIntroStore } from "@/lib/intro-store";
import { orchestrator } from "@/lib/load-orchestrator";

/**
 * Hero controller: takes the handoff from the loader and plays the intro.
 * On "handoff" it stages the pre-intro pose — lockup resting low, the bar
 * shown as the loader's 2px line (the loader flies its ink line onto it),
 * the school tab folded up. On "reveal": I'M rises, JIEWEN climbs letter by
 * letter out of the bottom edge, the line thickens into the bar (shape
 * only), the tab unfolds and its line rises, then the lockup floats to centre. Skip, reduced motion, a mid-page reload
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
    const sayBox = hero.querySelector<HTMLElement>("[data-hero-say]");
    const say = gsap.utils.toArray<HTMLElement>("[data-hero-say] [data-hero-line]", hero);
    const bars = gsap.utils.toArray<HTMLElement>("[data-hero-bar]", hero);
    const lines = gsap.utils.toArray<HTMLElement>("[data-hero-lockup] [data-hero-line]", hero);
    const quoteBar = hero.querySelector<HTMLElement>('[data-hero-bar="quote"]');
    const tab = hero.querySelector<HTMLElement>('[data-hero-bar="school"]');
    const tabLine = hero.querySelector<HTMLElement>('[data-hero-bar="school"] [data-hero-line]');
    if (!lockup || !im || !sayBox || !quoteBar || !tab || !tabLine) return;

    const docEl = document.documentElement;
    let unsubPhase: (() => void) | null = null;
    let intro: gsap.core.Timeline | null = null;

    const done = () => {
      docEl.dataset.intro = "done";
      docEl.dataset.square = "in";
      useIntroStore.getState().setPhase("done");
      ScrollTrigger.refresh();
    };

    // GSAP parses the CSS gate's translateY(115%) into px `y` on first
    // touch, so every yPercent set also zeroes y.
    const finalState = () => {
      gsap.set([...imLetters, ...nameLetters, ...lines, ...say], { y: 0, yPercent: 0 });
      gsap.set(bars, { autoAlpha: 1, scaleY: 1 });
      gsap.set(lockup, { y: 0 });
      done();
    };

    let staged = false;
    const stage = () => {
      if (staged) return;
      staged = true;
      gsap.set([...imLetters, ...nameLetters, ...lines, ...say], { y: 0, yPercent: 110 });
      gsap.set(quoteBar, {
        autoAlpha: 1,
        scaleY: HANDOFF_LINE_PX / quoteBar.offsetHeight,
        transformOrigin: "50% 50%",
      });
      gsap.set(tab, { autoAlpha: 1, scaleY: 0, transformOrigin: "50% 0%" });
      // measured at home (the lockup itself is never gated); resize mid-intro is ignored
      gsap.set(lockup, { y: 0 });
      const r = lockup.getBoundingClientRect();
      const rest = bottomRestOffset({
        viewportHeight: window.innerHeight,
        lockupTop: r.top,
        lockupHeight: r.height,
        inset: REST_INSET_PX,
      });
      gsap.set(lockup, { y: rest });
    };

    const playIntro = () => {
      if (window.scrollY > window.innerHeight * 0.4) {
        finalState();
        return;
      }
      stage();

      intro = gsap
        .timeline({ onComplete: done })
        .to(imLetters, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0)
        .to(say, { yPercent: 0, duration: 0.7, ease: "power3.out" }, 0.12)
        .to(nameLetters, { yPercent: 0, duration: 0.95, ease: "power3.out", stagger: 0.085 }, 0.25)
        // the loader's line thickens into the bar; the tab unfolds off it
        .to(quoteBar, { scaleY: 1, duration: 0.6, ease: "power3.inOut" }, 0.75)
        .to(tab, { scaleY: 1, duration: 0.45, ease: "power3.out" }, 1.2)
        .to(tabLine, { yPercent: 0, duration: 0.6, ease: "power3.out" }, 1.38)
        // the period pops in as JIEWEN's last letters land (SquareActor)
        .call(() => {
          docEl.dataset.square = "in";
        }, [], 1.3)
        .to(lockup, { y: 0, duration: 1.05, ease: "power3.inOut" }, 1.65);
    };

    // Registered regardless of intro phase, so a mid-page reload is already
    // faded (the matchMedia belongs to the useGSAP context and reverts with it).
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        [lockup, im, sayBox],
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

    // "handoff" stages and keeps listening; reveal/skipped/done settle it
    const settles = (phase: IntroPhase) => phase === "reveal" || phase === "skipped" || phase === "done";
    const onPhase = (phase: IntroPhase) => {
      if (phase === "handoff") stage();
      else if (phase === "reveal") playIntro();
      else if (settles(phase)) finalState();
    };

    const { phase } = useIntroStore.getState();
    onPhase(phase);
    if (!settles(phase)) {
      unsubPhase = useIntroStore.subscribe((state) => {
        // unsubscribe first: settling sets the phase itself
        if (settles(state.phase)) {
          unsubPhase?.();
          unsubPhase = null;
        }
        onPhase(state.phase);
      });
    }

    return () => {
      unsubPhase?.();
      intro?.kill();
    };
  });

  return null;
}
