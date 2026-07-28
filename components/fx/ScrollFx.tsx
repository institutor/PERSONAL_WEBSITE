"use client";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

/**
 * The scroll instrument (motion-study #11-15):
 *  - masked rises: display rows surface from behind band/divider edges
 *  - differential horizontal travel on broken-word rows (scrubbed)
 *  - depth parallax on numerals + pinned shapes
 *  - sawtooth marquees run continuously; scroll velocity spins them faster
 * Everything is created synchronously inside useGSAP → StrictMode-safe.
 */
export function ScrollFx() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* ---- sawtooth marquees + velocity coupling ---- */
      const sawTweens: gsap.core.Tween[] = [];
      for (const el of gsap.utils.toArray<HTMLElement>("[data-saw]")) {
        const dir = el.dataset.saw === "r" ? 44 : -44;
        sawTweens.push(gsap.to(el, { x: dir, duration: 2.8, ease: "none", repeat: -1 }));
      }
      const speed = { target: 1 };
      if (sawTweens.length) {
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            speed.target = Math.min(4, 1 + Math.abs(self.getVelocity()) / 900);
          },
        });
        const decay = () => {
          speed.target = Math.max(1, speed.target * 0.96);
          const current = sawTweens[0].timeScale();
          const next = current + (speed.target - current) * 0.12;
          for (const t of sawTweens) t.timeScale(next);
        };
        gsap.ticker.add(decay);
        // ticker cleanup rides on the matchMedia context
        return () => gsap.ticker.remove(decay);
      }
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* ---- masked rises (hero letters handled by HeroSpace) ---- */
      for (const el of gsap.utils.toArray<HTMLElement>("[data-rise]")) {
        if (el.closest('[data-section="hero"]')) continue;
        gsap.set(el, { yPercent: 108 });
        ScrollTrigger.create({
          trigger: el.parentElement,
          start: "top 86%",
          once: true,
          onEnter: () => gsap.to(el, { yPercent: 0, duration: 0.95, ease: "power4.out" }),
        });
      }

      /* ---- differential horizontal travel ---- */
      for (const el of gsap.utils.toArray<HTMLElement>("[data-travel]")) {
        const t = parseFloat(el.dataset.travel ?? "0");
        if (!t) continue;
        gsap.fromTo(
          el,
          { xPercent: t },
          {
            xPercent: -t,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("[data-band]") ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          }
        );
      }

      /* ---- depth parallax (numerals, shapes) ---- */
      for (const el of gsap.utils.toArray<HTMLElement>("[data-depth]")) {
        const d = parseFloat(el.dataset.depth ?? "0");
        if (!d) continue;
        gsap.fromTo(
          el,
          { y: d * 110 },
          {
            y: -d * 110,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("[data-band]") ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      }

      /* ---- quiet fade-ups for content blocks ---- */
      const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      gsap.set(reveals, { autoAlpha: 0, y: 16 });
      ScrollTrigger.batch(reveals, {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 }),
      });

      document.fonts.ready.then(() => ScrollTrigger.refresh());
    });
  });

  return null;
}
