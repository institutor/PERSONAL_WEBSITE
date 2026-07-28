"use client";

import { useRef } from "react";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { useIntroStore } from "@/lib/intro-store";
import { orchestrator } from "@/lib/load-orchestrator";
import { SpaceScene } from "./space-scene";

/**
 * Orchestrates the hero choreography on top of SpaceScene:
 *
 *  1. Letters J-I-E-W-E-N float up one by one (L→R), overshoot, settle.
 *  2. Space scene: aperture opens from center → slight blur → covers screen
 *     (letters punch dark out of it) → noise-dissolve collapse until space
 *     survives only inside the letterforms.
 *  3. Scroll: mosaic morph + right-first cell dissipation (uScroll scrub).
 *
 * All mutation goes through gsap (StrictMode-safe revert); everything else
 * is torn down in the effect cleanup.
 */
export default function HeroSpace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    const hero = document.querySelector<HTMLElement>('[data-section="hero"]');
    const lettersWrap = document.querySelector<HTMLElement>("[data-hero-letters]");
    const letters = gsap.utils.toArray<HTMLElement>("[data-hero-letter]");
    const im = document.querySelector<HTMLElement>("[data-hero-im]");
    if (!canvas || !hero || !lettersWrap || letters.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let webgl2 = false;
    try {
      webgl2 = !!document.createElement("canvas").getContext("webgl2");
    } catch {
      webgl2 = false;
    }

    if (reduced || !webgl2) {
      // Static fallback: CSS knockout on the letters, no motion, no GL.
      lettersWrap.classList.add("knockout");
      canvas.style.display = "none";
      orchestrator.completeAll(); // never strand the loader on GL tasks
      document.documentElement.dataset.intro = "done"; // never strand scroll
      return;
    }

    orchestrator.set("chunk", 1); // this module (three.js chunk) is loaded

    let killed = false;
    let active = true;
    let scene: SpaceScene | null = null;
    // Created after awaits → outside the useGSAP context; killed manually.
    let scrollScrub: ScrollTrigger | null = null;
    let introTl: gsap.core.Timeline | null = null;
    let unsubPhase: (() => void) | null = null;

    const tick = (time: number) => {
      if (active) scene?.render(time);
    };

    const io = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
    });
    io.observe(canvas);

    let resizeT: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => scene?.layout(), 160);
    };
    window.addEventListener("resize", onResize);

    (async () => {
      // The mask is rasterized from the real font — wait for it.
      await document.fonts.load(`700 100px "${getComputedStyle(lettersWrap).fontFamily.split(",")[0].replace(/"/g, "")}"`);
      await document.fonts.ready;
      if (killed) return;

      const s = new SpaceScene(canvas, letters);
      scene = s;
      await s.load();
      orchestrator.set("textures", 1);
      if (killed) {
        // cleanup may have already disposed + nulled the shared ref
        s.dispose();
        return;
      }
      s.layout();
      orchestrator.set("compile", 1);
      gsap.ticker.add(tick);

      const u = s.uniforms;

      // Scroll scrub: mosaic morph + dissipation as the hero leaves.
      scrollScrub = ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: "bottom 20%",
        scrub: 0.35,
        onUpdate: (self) => {
          u.uScroll.value = self.progress;
        },
      });

      const docEl = document.documentElement;

      const finalState = () => {
        gsap.set(letters, { yPercent: 0 });
        gsap.set(im, { autoAlpha: 1 });
        gsap.set(lettersWrap, { color: "transparent" });
        u.uAlpha.value = 1;
        u.uCover.value = 1.8;
        u.uBlurMix.value = 0.45;
        u.uReveal.value = 1;
        u.uPunch.value = 0;
        u.uTexZoom.value = 1;
        docEl.dataset.intro = "done"; // unlocks scroll (CSS)
        ScrollTrigger.refresh();
      };

      const playIntro = () => {
        // Refresh / deep-link mid-page: skip the cinematic.
        if (window.scrollY > window.innerHeight * 0.4) {
          finalState();
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            docEl.dataset.intro = "done";
            ScrollTrigger.refresh();
          },
        });
        introTl = tl;

        tl
        // 1. letters float up one by one, overshoot, settle
        .to(letters, {
          yPercent: 0,
          duration: 0.62,
          ease: "back.out(1.7)",
          stagger: 0.085,
        })
        .to(im, { autoAlpha: 1, duration: 0.45 }, "-=0.35")
        // 2. aperture opens from the middle
        .set(u.uAlpha, { value: 1 }, "+=0.25")
        .to(u.uCover, { value: 0.48, duration: 0.95, ease: "power2.inOut" }, "<")
        // ...blurs slightly...
        .to(u.uBlurMix, { value: 0.55, duration: 0.6 }, "<+0.45")
        // letters begin punching dark out of the nebula
        .to(u.uPunch, { value: 1, duration: 0.7 }, "<")
        .add(() => gsap.set(lettersWrap, { color: "transparent" }), "<+0.2")
        // ...enlarges until it covers the whole screen
        .to(u.uCover, { value: 1.8, duration: 1.05, ease: "power3.inOut" }, "-=0.1")
        .to(u.uTexZoom, { value: 1.02, duration: 1.05 }, "<")
        // 3. the collapse: everything dissolves except inside the letters
        .to(u.uReveal, { value: 1, duration: 1.35, ease: "power3.inOut" }, "+=0.3")
        .to(u.uPunch, { value: 0, duration: 0.9 }, "<+0.15")
        .to(u.uBlurMix, { value: 0.45, duration: 0.9 }, "<")
        .to(u.uTexZoom, { value: 1.0, duration: 0.9 }, "<");
      };

      // Loader gates the show: hidden state set NOW (pre-reveal, covered by
      // the opaque overlay), then play/skip per the intro phase machine.
      gsap.set(letters, { yPercent: 115 });
      gsap.set(im, { autoAlpha: 0 });

      const { phase } = useIntroStore.getState();
      if (phase === "reveal") {
        playIntro();
      } else if (phase === "skipped" || phase === "done") {
        finalState();
      } else {
        unsubPhase = useIntroStore.subscribe((state) => {
          if (state.phase === "reveal") {
            unsubPhase?.();
            unsubPhase = null;
            playIntro();
          } else if (state.phase === "skipped" || state.phase === "done") {
            unsubPhase?.();
            unsubPhase = null;
            finalState();
          }
        });
      }
    })();

    return () => {
      killed = true;
      io.disconnect();
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeT);
      gsap.ticker.remove(tick);
      unsubPhase?.();
      introTl?.kill();
      scrollScrub?.kill();
      scene?.dispose();
      scene = null;
    };
  });

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute left-0 top-0 z-[5] h-[160svh] w-full"
      aria-hidden="true"
    />
  );
}
