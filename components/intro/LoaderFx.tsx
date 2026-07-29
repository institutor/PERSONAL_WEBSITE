"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { mapHandwritingProgress } from "@/lib/handwriting-timeline";
import { useIntroStore } from "@/lib/intro-store";
import { orchestrator } from "@/lib/load-orchestrator";

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
    const pctEl = root.querySelector<HTMLElement>("[data-loader-pct]");

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

    const finishSeq = () => {
      gsap.ticker.remove(tick);
      if (pctEl) pctEl.textContent = "100";
      root.setAttribute("aria-valuenow", "100");
      const skipping = orchestrator.skipped;
      // the prototype's exit: slight scale up + fade
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(root, { display: "none" });
            useIntroStore.getState().setPhase(skipping ? "skipped" : "reveal");
          },
        })
        .to(root, {
          scale: 1.035,
          autoAlpha: 0,
          duration: skipping ? 0.2 : 0.6,
          ease: "power2.inOut",
          delay: skipping ? 0 : 0.35,
          transformOrigin: "50% 50%",
        });
    };

    const tick = (_time: number, deltaMS: number) => {
      const d = orchestrator.display(deltaMS / 1000);
      paint(d);
      const p100 = Math.min(100, Math.round(d * 100));
      if (p100 !== lastPct && pctEl) {
        pctEl.textContent = String(p100).padStart(3, "0");
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
    const skipBtn = root.querySelector<HTMLElement>("[data-loader-skip]");
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
