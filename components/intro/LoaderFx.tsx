"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { mapHandwritingProgress } from "@/lib/handwriting-timeline";
import { CLOCK_R, HANDOFF_LINE_PX } from "@/lib/hero-intro-math";
import { useIntroStore } from "@/lib/intro-store";
import { orchestrator } from "@/lib/load-orchestrator";
import { unrollPath } from "@/lib/unroll";

/**
 * Drives the original textured artwork through one continuous handwriting
 * timeline. The narrow pen tip leads a full-width coverage pass, with real
 * pen-lift gaps between the calibrated strokes.
 */
export function LoaderFx() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>("[data-loader]");
    if (!root) return;

    // Reduced motion resolved pre-paint: no loader, no cinematic.
    if (document.documentElement.dataset.intro === "skip") {
      gsap.set(root, { display: "none" });
      orchestrator.completeAll();
      document.documentElement.dataset.intro = "done";
      useIntroStore.getState().setPhase("done");
      return;
    }

    const tips = Array.from(
      root.querySelectorAll<SVGPathElement>("[data-pen-tip]"),
    );
    const fills = Array.from(
      root.querySelectorAll<SVGPathElement>("[data-pen-fill]"),
    );
    const art = root.querySelector<SVGSVGElement>("[data-loader-art]");
    const clock = root.querySelector<SVGSVGElement>("[data-loader-clock]");
    const track = root.querySelector<SVGCircleElement>("[data-clock-track]");
    const arc = root.querySelector<SVGCircleElement>("[data-clock-arc]");
    const hand = root.querySelector<SVGLineElement>("[data-clock-hand]");
    const hub = root.querySelector<SVGCircleElement>("[data-clock-hub]");
    const unroll = root.querySelector<SVGPathElement>("[data-clock-unroll]");
    const line = root.querySelector<HTMLElement>("[data-loader-line]");
    const skipBtn = root.querySelector<HTMLElement>("[data-loader-skip]");

    const segments = tips.map((path) => ({
      draw: Math.max(
        path.getTotalLength() / Number(path.dataset.penSpeed ?? 1),
        42,
      ),
      lift: Number(path.dataset.penLift ?? 0),
    }));

    let lastPct = -1;
    let finished = false;

    requestAnimationFrame(() => {
      document.fonts.ready.then(() => orchestrator.set("fonts", 1));
    });
    // The revealed artwork itself gates the textures task.
    const artImg = new Image();
    artImg.onload = () => orchestrator.set("textures", 1);
    artImg.onerror = () => orchestrator.set("textures", 1);
    artImg.src = "/loader/by-jiewen-loader.webp";

    const paint = (d: number) => {
      const localProgress = mapHandwritingProgress(d, segments);
      for (let i = 0; i < tips.length; i++) {
        const local = localProgress[i];
        tips[i].style.strokeDashoffset = String(1 - local);

        const coverage = Math.min(
          1,
          Math.max(0, (local - 0.055) / 0.945),
        );
        const fill = fills[i];
        if (fill) fill.style.strokeDashoffset = String(1 - coverage);
      }
    };

    // the clock: the ring draws itself clockwise from 12 behind the hand
    const paintClock = (d: number) => {
      if (arc) arc.style.strokeDashoffset = String(1 - d);
      hand?.setAttribute("transform", `rotate(${d * 360} 24 24)`);
    };

    const finishSeq = () => {
      gsap.ticker.remove(tick);
      paintClock(1);
      root.setAttribute("aria-valuenow", "100");
      const skipping = orchestrator.skipped;
      const bar = document.querySelector<HTMLElement>('[data-hero-bar="quote"]');
      // the line can only land on the bar while the hero is on screen
      const handing =
        !skipping && window.scrollY <= window.innerHeight * 0.4 && bar && clock && arc && unroll && line;

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(root, { display: "none" });
        },
      });
      let wipeAt: number;

      if (handing) {
        // The clock closes, the hand folds into the hub, the ring unrolls
        // along its bottom into a line of the same length, and the line
        // glides onto the quote bar (staged by the hero as a 2px bone line
        // underneath, so the ink line turns bone as the black rises past).
        useIntroStore.getState().setPhase("handoff");
        const b = bar.getBoundingClientRect(); // staged: a 2px line, centred
        const c = clock.getBoundingClientRect(); // 48px, 1:1 viewBox
        const L = 2 * Math.PI * CLOCK_R;
        const u = { v: 0 };
        tl.to([hand, hub], { scale: 0, svgOrigin: "24 24", duration: 0.3, ease: "power2.in" }, 0.15)
          .to(track, { opacity: 0, duration: 0.25, ease: "power1.out" }, 0.15)
          .call(
            () => {
              arc.style.visibility = "hidden";
              unroll.setAttribute("d", unrollPath(0, CLOCK_R, 24, 24));
              unroll.setAttribute("visibility", "visible");
            },
            [],
            0.42,
          )
          .to(
            u,
            {
              v: 1,
              duration: 0.65,
              ease: "power2.inOut",
              onUpdate: () => unroll.setAttribute("d", unrollPath(u.v, CLOCK_R, 24, 24)),
            },
            0.42,
          )
          .call(
            () => {
              unroll.setAttribute("visibility", "hidden");
              line.style.width = `${L}px`; // exact: gsap would round px widths
              gsap.set(line, {
                x: c.left + 24 - L / 2,
                y: c.top + 24 + CLOCK_R - HANDOFF_LINE_PX / 2,
                opacity: 1,
              });
            },
            [],
            1.07,
          )
          .to(
            line,
            {
              x: b.left,
              y: b.top + b.height / 2 - HANDOFF_LINE_PX / 2,
              scaleX: b.width / L,
              duration: 0.8,
              ease: "power3.inOut",
            },
            1.07,
          )
          .to([art, skipBtn], { autoAlpha: 0, duration: 0.45, ease: "power2.out" }, 1.07);
        wipeAt = 1.95;
      } else {
        tl.to(clock, { autoAlpha: 0, duration: 0.25, ease: "power1.out" }, 0);
        wipeAt = skipping ? 0 : 0.35;
      }

      // The reference's exit: the bone field wipes away upward, so the black
      // site rises in from the bottom; the hero's text follows 0.34 s in.
      // A skip lands the final hero first and wipes faster.
      tl.fromTo(
        root,
        { clipPath: "inset(0% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: skipping ? 0.45 : 0.9,
          ease: "power3.inOut",
        },
        wipeAt,
      ).call(
        () => useIntroStore.getState().setPhase(skipping ? "skipped" : "reveal"),
        [],
        skipping ? wipeAt : wipeAt + 0.34,
      );
    };

    const tick = (_time: number, deltaMS: number) => {
      const d = orchestrator.display(deltaMS / 1000);
      paint(d);
      paintClock(d);
      const p100 = Math.min(100, Math.round(d * 100));
      if (p100 !== lastPct) {
        lastPct = p100;
        if (p100 % 5 === 0) root.setAttribute("aria-valuenow", String(p100));
      }
      if (!finished && d >= 1) {
        finished = true;
        finishSeq();
      }
    };
    gsap.ticker.add(tick);

    const skip = () => {
      orchestrator.skipped = true;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    skipBtn?.addEventListener("click", skip);
    window.addEventListener("keydown", onKey);

    return () => {
      gsap.ticker.remove(tick);
      skipBtn?.removeEventListener("click", skip);
      window.removeEventListener("keydown", onKey);
    };
  });

  return null;
}
