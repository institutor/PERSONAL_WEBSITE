"use client";

import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

/**
 * The whole scroll/reveal choreography, in ONE gsap.matchMedia block.
 *
 * Draw-on mechanics: every [data-draw-group] svg has 3 boil frames. While
 * drawing, .is-drawing pins frame 0 visible (CSS) and DrawSVG animates its
 * paths at roughly constant pen speed; on complete the class is removed and
 * the boil resumes. Hero groups draw on load; the rest draw once on enter.
 *
 * Two-channel rule: appearance is time-based (once-triggers); only the
 * journey line is scrubbed — kept short by design.
 */
export function ScrollFx() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const annotations: RoughAnnotation[] = [];

      /**
       * Hide a stroke completely via dash geometry (user units, so it works
       * at any rendered scale). Manual dashoffset instead of DrawSVGPlugin:
       * the plugin mis-measures these scaled-viewBox paths. Margins absorb
       * getTotalLength() vs rendered-length flattening error (the source of
       * ghost dashes at stroke starts).
       */
      const hideStroke = (p: SVGPathElement) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len + 10} ${len + 60}`;
        p.style.strokeDashoffset = `${len + 10}`;
        if (process.env.NODE_ENV !== "production") {
          p.dataset.hidelen = String(Math.round(len));
        }
        return len;
      };

      /** Build a paused pen-speed timeline for one draw-group svg. */
      const buildDraw = (svg: SVGSVGElement, penSpeed = 500) => {
        let paths = Array.from(
          svg.querySelectorAll<SVGPathElement>("g.boil-f0 path")
        );
        if (paths.length === 0) {
          paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
        }
        const lens = paths.map(hideStroke);
        svg.classList.remove("draw-pending");
        svg.classList.add("is-drawing");
        const tl = gsap.timeline({
          paused: true,
          onComplete: () => svg.classList.remove("is-drawing"),
        });
        paths.forEach((p, i) => {
          tl.to(
            p,
            {
              strokeDashoffset: 0,
              duration: gsap.utils.clamp(0.05, 0.6, lens[i] / penSpeed),
              ease: "none",
            },
            ">-0.03" // slight overlap ≈ pen lift between strokes
          );
        });
        return tl;
      };

      const allGroups = gsap.utils.toArray<SVGSVGElement>("[data-draw-group]");
      const heroGroups: SVGSVGElement[] = [];
      let journeyLine: SVGSVGElement | null = null;
      const scrollGroups: SVGSVGElement[] = [];

      for (const svg of allGroups) {
        if (svg.closest('[data-section="hero"]')) heroGroups.push(svg);
        else if (svg.dataset.sketch === "journeyLine") journeyLine = svg;
        else scrollGroups.push(svg);
      }

      /* ---- Hero: draw the massive title on load, then the underline ---- */
      const heroTl = gsap.timeline({ delay: 0.15 });
      const heroFade = gsap.utils.toArray<HTMLElement>(
        '[data-section="hero"] > p, [data-section="hero"] > nav, [data-section="hero"] [data-scroll-cue]'
      );
      gsap.set(heroFade, { autoAlpha: 0, y: 14 });
      // Explicit absolute positions — nesting pre-built timelines with
      // relative ">" positions resolves unreliably when children were live.
      let cursor = 0;
      for (const svg of heroGroups) {
        // Name first (slower, ceremonial), underline snappier after.
        const isName = svg.dataset.lettering === "name";
        const tl = buildDraw(svg, isName ? 700 : 450);
        tl.paused(false);
        heroTl.add(tl, cursor);
        cursor += tl.duration() - 0.1;
      }
      heroTl.to(
        heroFade,
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.12 },
        Math.max(0, cursor - 0.15)
      );

      /* ---- Scroll-triggered draw-ons (once, time-based) ---- */
      for (const svg of scrollGroups) {
        const tl = buildDraw(svg);
        ScrollTrigger.create({
          trigger: svg,
          start: "top 85%",
          once: true,
          onEnter: () => tl.play(),
        });
      }

      /* ---- The ONE scrubbed draw: the journey scrawl line ---- */
      if (journeyLine) {
        const paths = Array.from(
          journeyLine.querySelectorAll<SVGPathElement>("g.boil-f0 path")
        );
        paths.forEach(hideStroke);
        journeyLine.classList.remove("draw-pending");
        journeyLine.classList.add("is-drawing");
        gsap.to(paths, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: '[data-section="journey"]',
            start: "top 70%",
            end: "top 20%",
            scrub: 0.6,
            onLeave: () => journeyLine!.classList.remove("is-drawing"),
          },
        });
      }

      /* ---- Stat callouts: stamped in, never scrubbed ---- */
      gsap.utils.toArray<HTMLElement>("dl").forEach((dl) => {
        const stats = dl.querySelectorAll("[data-stat]");
        if (!stats.length) return;
        gsap.from(stats, {
          scale: 1.18,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: dl, start: "top 85%", once: true },
        });
      });

      /* ---- Cards / pin-board / list entries: gentle fade-up batches ---- */
      const batchTargets = gsap.utils.toArray<HTMLElement>(
        "[data-section] article, [data-pin-card]"
      );
      gsap.set(batchTargets, { autoAlpha: 0, y: 22 });
      ScrollTrigger.batch(batchTargets, {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            stagger: 0.08,
          }),
      });

      /* ---- Medal shelf: pop in like they're being pinned up ---- */
      const medals = gsap.utils.toArray<HTMLElement>("[data-medal-shelf] svg");
      if (medals.length) {
        gsap.set(medals, { scale: 0, rotation: -18, transformOrigin: "50% 20%" });
        ScrollTrigger.create({
          trigger: "[data-medal-shelf]",
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(medals, {
              scale: 1,
              rotation: 0,
              duration: 0.4,
              ease: "back.out(2.2)",
              stagger: 0.07,
            }),
        });
      }

      /* ---- rough-notation: live annotations, fired once on enter ---- */
      const annotateOnEnter = (
        el: Element | null,
        type: "circle" | "underline" | "highlight",
        color: string,
        pad = 4
      ) => {
        if (!el) return;
        const a = annotate(el as HTMLElement, {
          type,
          color,
          padding: pad,
          strokeWidth: 2,
          animationDuration: 700,
          multiline: true,
        });
        annotations.push(a);
        ScrollTrigger.create({
          trigger: el,
          start: "top 82%",
          once: true,
          onEnter: () => a.show(),
        });
      };

      const accent = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
      annotateOnEnter(
        document.querySelectorAll('[data-section="journey"] [data-station]')[1] ?? null,
        "circle",
        accent,
        8
      );
      annotateOnEnter(
        document.querySelector('[data-rough-card="featured"] [data-role-circle]'),
        "underline",
        accent,
        2
      );
      annotateOnEnter(
        document.querySelector("[data-margin-note]"),
        "underline",
        accent,
        2
      );

      /* ---- fonts settle → measurements refresh ---- */
      document.fonts.ready.then(() => ScrollTrigger.refresh());

      if (process.env.NODE_ENV !== "production") {
        // Dev-only introspection for Playwright verification runs.
        (window as unknown as Record<string, unknown>).__ST = ScrollTrigger;
        (window as unknown as Record<string, unknown>).__gsap = gsap;
      }

      return () => {
        for (const a of annotations) a.remove();
      };
    });

    // Reduced motion: no branch needed — everything is visible by default
    // and CSS pins boil frame 0. matchMedia just never hides anything.
  });

  return null;
}
