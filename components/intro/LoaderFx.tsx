"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { useIntroStore } from "@/lib/intro-store";
import { orchestrator } from "@/lib/load-orchestrator";

/**
 * Drives the handwritten Inkfield loader: the orchestrator's smoothed
 * display value becomes pen distance along the calibrated stroke masks —
 * constant pen speed, letter by letter, swoosh-check last. The final 4%
 * fades in the mop-up layer so the artwork lands complete, then the
 * prototype's scale-and-fade exit hands off to the intro machine.
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

    const pens = Array.from(root.querySelectorAll<SVGPathElement>("[data-pen]"));
    const mop = root.querySelector<SVGRectElement>("[data-pen-mop]");
    const pctEl = root.querySelector<HTMLElement>("[data-loader-pct]");

    // Constant pen speed: weight each stroke by its true length.
    const lens = pens.map((p) => p.getTotalLength());
    const total = lens.reduce((a, b) => a + b, 0) || 1;
    const starts: number[] = [];
    lens.reduce((acc, l, i) => {
      starts[i] = acc;
      return acc + l;
    }, 0);

    let lastPct = -1;
    let finished = false;

    requestAnimationFrame(() => {
      document.fonts.ready.then(() => orchestrator.set("fonts", 1));
    });
    // the artwork itself gates the 'textures' task
    const artImg = new Image();
    artImg.onload = () => orchestrator.set("textures", 1);
    artImg.onerror = () => orchestrator.set("textures", 1);
    artImg.src = "/loader/by-jiewen-loader.webp";

    const paint = (d: number) => {
      const penDist = d * total;
      for (let i = 0; i < pens.length; i++) {
        const local = Math.min(1, Math.max(0, (penDist - starts[i]) / lens[i]));
        pens[i].style.strokeDashoffset = String(1 - local);
      }
      if (mop) mop.setAttribute("opacity", String(d > 0.92 ? (d - 0.92) / 0.08 : 0));
    };

    const finishSeq = () => {
      gsap.ticker.remove(tick);
      paint(1);
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
