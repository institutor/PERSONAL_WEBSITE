"use client";

import { useRef } from "react";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { useIntroStore } from "@/lib/intro-store";
import { orchestrator } from "@/lib/load-orchestrator";
import { DissolveScene } from "./space-scene";

/**
 * Hero orchestrator:
 *  intro (post-loader): letters rise masked bottom-up ("I'm" then JIEWEN),
 *  the sawtooth divider wipes in, corner matter fades.
 *  scroll: uScroll scrub → DOM text hands off to the WebGL mosaic, cells
 *  dissipate right-edge-first carrying nothing but good typography.
 */
export default function HeroSpace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    const hero = document.querySelector<HTMLElement>('[data-section="hero"]');
    const words = gsap.utils.toArray<HTMLElement>("[data-hero-word]");
    const letters = gsap.utils.toArray<HTMLElement>("[data-hero-letter]");
    const divider = document.querySelector<HTMLElement>("[data-hero-divider]");
    const fades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");
    if (!canvas || !hero || letters.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let webgl2 = false;
    try {
      webgl2 = !!document.createElement("canvas").getContext("webgl2");
    } catch {
      webgl2 = false;
    }

    if (reduced) {
      canvas.style.display = "none";
      gsap.set(fades, { autoAlpha: 1 });
      orchestrator.completeAll();
      document.documentElement.dataset.intro = "done";
      return;
    }

    orchestrator.set("chunk", 1); // 'textures' now belongs to the loader artwork

    let killed = false;
    let active = true;
    let scene: DissolveScene | null = null;
    let scrollScrub: ScrollTrigger | null = null;
    let introTl: gsap.core.Timeline | null = null;
    let unsubPhase: (() => void) | null = null;
    let domHidden = false;

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
      await document.fonts.load(
        `640 100px "${getComputedStyle(letters[0]).fontFamily.split(",")[0].replace(/"/g, "")}"`
      );
      await document.fonts.ready;
      if (killed) return;

      if (webgl2) {
        const s = new DissolveScene(canvas, letters);
        scene = s;
        s.layout();
        orchestrator.set("compile", 1);
        if (killed) {
          s.dispose();
          return;
        }
        gsap.ticker.add(tick);
      } else {
        // no GL: words simply stay DOM text; loader must not strand
        canvas.style.display = "none";
        orchestrator.completeAll();
      }

      const docEl = document.documentElement;

      // Scroll scrub: DOM → mosaic handoff + dissipation.
      if (scene) {
        const u = scene.uniforms;
        scrollScrub = ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom 15%",
          scrub: 0.3,
          onUpdate: (self) => {
            u.uScroll.value = self.progress;
            // hand the words off between DOM (crisp) and GL (mosaic)
            const wantHidden = self.progress > 0.012;
            if (wantHidden !== domHidden) {
              domHidden = wantHidden;
              gsap.set(words, { autoAlpha: wantHidden ? 0 : 1 });
            }
          },
        });
      }

      const finalState = () => {
        gsap.set(letters, { yPercent: 0 });
        gsap.set(fades, { autoAlpha: 1 });
        if (divider) gsap.set(divider, { scaleX: 1 });
        docEl.dataset.intro = "done";
        ScrollTrigger.refresh();
      };

      const playIntro = () => {
        if (window.scrollY > window.innerHeight * 0.4) {
          finalState();
          return;
        }
        const tl = gsap.timeline({
          defaults: { ease: "power4.out" },
          onComplete: () => {
            docEl.dataset.intro = "done";
            ScrollTrigger.refresh();
          },
        });
        introTl = tl;

        const imLetters = letters.slice(0, 3);
        const nameLetters = letters.slice(3);
        if (divider) gsap.set(divider, { scaleX: 0, transformOrigin: "0 50%" });

        tl.to(imLetters, { yPercent: 0, duration: 0.7, stagger: 0.07 })
          .to(divider, { scaleX: 1, duration: 0.85, ease: "power3.inOut" }, "-=0.35")
          .to(nameLetters, { yPercent: 0, duration: 0.75, ease: "back.out(1.25)", stagger: 0.065 }, "-=0.45")
          .to(fades, { autoAlpha: 1, duration: 0.55, ease: "power2.out", stagger: 0.1 }, "-=0.3");
      };

      // Letters start hidden below their line boxes (masked by overflow).
      gsap.set(letters, { yPercent: 112 });

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
      className="pointer-events-none absolute left-0 top-0 z-[5] h-[150svh] w-full"
      aria-hidden="true"
    />
  );
}
