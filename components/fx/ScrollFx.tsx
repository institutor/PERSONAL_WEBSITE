"use client";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

/**
 * The scroll instrument, v2 — built around the reference's actual motion:
 *
 *  - [data-scrub-rise] — large text rises WITH the scroll (scrubbed, not
 *    triggered), each element in its own timing window: "early" moves the
 *    moment it's visible, "mid"/"late" only start partway up the viewport.
 *  - [data-sweep] — huge lines crossing the screen in opposite directions.
 *  - [data-travel] — broken-word rows drifting against each other.
 *  - [data-hsection]/[data-htrack] — the pinned horizontal chapter: vertical
 *    scroll becomes sideways travel, then releases back to vertical.
 *  - [data-knock]/[data-knock-letter] — the BUILD "I" slides up out of the
 *    word (the square actor slots into the gap).
 *  - [data-driftx] — ledger rows sliding in from the right at staggered
 *    windows; [data-depth] parallax; sawtooth marquees with velocity.
 */
const WINDOWS: Record<string, [string, string]> = {
  early: ["top bottom", "top 35%"],
  mid: ["top 80%", "top 25%"],
  late: ["top 55%", "top 8%"],
};

export function ScrollFx() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* ---- pinned horizontal chapter (first: it owns layout).
             Enters ZOOMED OUT (overview of the panels), zooms to full,
             then vertical scroll becomes sideways travel. ---- */
      const hs = document.querySelector<HTMLElement>("[data-hsection]");
      const track = hs?.querySelector<HTMLElement>("[data-htrack]");
      if (hs && track) {
        const dist = () => track.scrollWidth - window.innerWidth;
        gsap
          .timeline({
            scrollTrigger: {
              trigger: hs,
              start: "top top",
              end: () => "+=" + (dist() + window.innerHeight * 0.45),
              scrub: 0.4,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: 10,
            },
          })
          .fromTo(
            track,
            { scale: 0.78, transformOrigin: "18% 50%" },
            { scale: 1, duration: 0.16, ease: "power1.inOut" }
          )
          .to(track, { x: () => -dist(), duration: 0.84, ease: "none" });
      }
      const inTrack = (el: Element) => !!el.closest("[data-htrack]");

      /* ---- mega titles: massive lines traveling straight across ---- */
      for (const el of gsap.utils.toArray<HTMLElement>("[data-mega]")) {
        const band = el.closest<HTMLElement>("[data-band]") ?? el;
        gsap.fromTo(
          el,
          { x: () => window.innerWidth * 0.1 },
          {
            x: () => -(el.scrollWidth - window.innerWidth * 0.92),
            ease: "none",
            scrollTrigger: {
              trigger: band,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      /* ---- zoom choreography: bands breathe in as they arrive ---- */
      for (const el of gsap.utils.toArray<HTMLElement>("[data-zoom-in]")) {
        const from = parseFloat(el.dataset.zoomIn || "0.88");
        gsap.fromTo(
          el,
          { scale: from, y: from < 1 ? 44 : -24, transformOrigin: "50% 18%" },
          {
            scale: 1,
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 30%", scrub: 0.35 },
          }
        );
      }

      /* ---- gap-titles: invisible → letters slide up from their own spots
             at varying speeds, assembling as you scroll (scrubbed) ---- */
      for (const t of gsap.utils.toArray<HTMLElement>("[data-title]")) {
        const [start, end] = WINDOWS[t.dataset.window ?? "early"];
        const letters = t.querySelectorAll<HTMLElement>("[data-tl]");
        letters.forEach((el, i) => {
          el.classList.add("tl-live"); // disarm the pre-hydration CSS gate
          const dist = 108 + ((i * 53) % 70); // deterministic per-letter speed
          gsap.fromTo(
            el,
            { yPercent: dist }, // fully opaque — clipped by the title's own box
            {
              yPercent: 0,
              ease: "none",
              scrollTrigger: {
                trigger: t.closest("[data-band]") ?? t,
                start,
                end,
                scrub: 0.35,
              },
            }
          );
        });
      }

      /* ---- scrubbed rises with staggered timing windows ---- */
      for (const el of gsap.utils.toArray<HTMLElement>("[data-scrub-rise]")) {
        if (inTrack(el)) continue;
        const [start, end] = WINDOWS[el.dataset.window ?? "early"];
        gsap.fromTo(
          el,
          { yPercent: 65, autoAlpha: 0.001 },
          {
            yPercent: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start, end, scrub: 0.35 },
          }
        );
      }

      /* ---- opposing full-screen sweeps ---- */
      for (const el of gsap.utils.toArray<HTMLElement>("[data-sweep]")) {
        const amp = parseFloat(el.dataset.sweep ?? "0");
        if (!amp) continue;
        gsap.fromTo(
          el,
          { xPercent: amp },
          {
            xPercent: -amp,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("[data-band]") ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.35,
            },
          }
        );
      }

      /* ---- broken-word masked rises + differential travel ---- */
      for (const el of gsap.utils.toArray<HTMLElement>("[data-rise]")) {
        if (el.closest('[data-section="hero"]') || inTrack(el)) continue;
        gsap.set(el, { yPercent: 108 });
        ScrollTrigger.create({
          trigger: el.parentElement,
          start: "top 86%",
          once: true,
          onEnter: () => gsap.to(el, { yPercent: 0, duration: 0.95, ease: "power4.out" }),
        });
      }
      for (const el of gsap.utils.toArray<HTMLElement>("[data-travel]")) {
        const t = parseFloat(el.dataset.travel ?? "0");
        if (!t || inTrack(el)) continue;
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

      /* ---- ledger rows drifting in from the right, staggered ---- */
      gsap.utils.toArray<HTMLElement>("[data-driftx]").forEach((el, i) => {
        const [start, end] = WINDOWS[el.dataset.window ?? (i % 3 === 0 ? "early" : i % 3 === 1 ? "mid" : "late")];
        gsap.fromTo(
          el,
          { x: () => window.innerWidth * 0.3, autoAlpha: 0.001 },
          {
            x: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start, end, scrub: 0.35 },
          }
        );
      });

      /* ---- depth parallax ---- */
      for (const el of gsap.utils.toArray<HTMLElement>("[data-depth]")) {
        const d = parseFloat(el.dataset.depth ?? "0");
        if (!d || inTrack(el)) continue;
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

      /* ---- the knockout: BUILD's "I" slides up past the others ---- */
      const knock = document.querySelector<HTMLElement>("[data-knock]");
      const knockLetter = document.querySelector<HTMLElement>("[data-knock-letter]");
      if (knock && knockLetter) {
        gsap.fromTo(
          knockLetter,
          { yPercent: 0, autoAlpha: 1 },
          {
            yPercent: -165,
            autoAlpha: 0,
            ease: "power1.in",
            scrollTrigger: { trigger: knock, start: "top 78%", end: "top 42%", scrub: 0.35 },
          }
        );
      }

      /* ---- quiet fades for small matter ---- */
      const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]").filter((el) => !inTrack(el));
      if (reveals.length) {
        gsap.set(reveals, { autoAlpha: 0, y: 16 });
        ScrollTrigger.batch(reveals, {
          start: "top 88%",
          once: true,
          onEnter: (els) =>
            gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 }),
        });
      }

      document.fonts.ready.then(() => ScrollTrigger.refresh());
    });
  });

  return null;
}
