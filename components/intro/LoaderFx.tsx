"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { useIntroStore } from "@/lib/intro-store";
import { orchestrator } from "@/lib/load-orchestrator";

/**
 * Drives the loader: writes orchestrator display progress onto the signature
 * strokes (pathLength-normalized, sequential), updates the % readout, then
 * plays checkmark → fade → hands off to the intro phase machine.
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

    const paths = gsap.utils.toArray<SVGPathElement>("[data-sig-path]");
    const pctEl = root.querySelector<HTMLElement>("[data-loader-pct]");
    const n = paths.length;
    let lastPct = -1;
    let finished = false;

    // The loader owns the font task (rAF-wrapped so preloads actually started).
    requestAnimationFrame(() => {
      document.fonts.ready.then(() => orchestrator.set("fonts", 1));
    });

    const finishSeq = () => {
      gsap.ticker.remove(tick);
      for (const p of paths) p.style.strokeDashoffset = "0";
      if (pctEl) pctEl.textContent = "100";
      root.setAttribute("aria-valuenow", "100");
      const skipping = orchestrator.skipped;
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(root, { display: "none" });
            useIntroStore.getState().setPhase(skipping ? "skipped" : "reveal");
          },
        })
        .to("[data-check-path]", {
          strokeDashoffset: 0,
          duration: skipping ? 0.15 : 0.45,
          ease: "power2.inOut",
        })
        .to(root, { autoAlpha: 0, duration: skipping ? 0.2 : 0.55, ease: "power2.inOut" }, skipping ? "+=0.05" : "+=0.3");
    };

    const tick = (_time: number, deltaMS: number) => {
      const d = orchestrator.display(deltaMS / 1000);
      for (let i = 0; i < n; i++) {
        const local = Math.min(1, Math.max(0, d * n - i));
        paths[i].style.strokeDashoffset = String(1 - local);
      }
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
