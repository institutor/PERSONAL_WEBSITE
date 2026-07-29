"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { useIntroStore } from "@/lib/intro-store";
import { orchestrator } from "@/lib/load-orchestrator";

/**
 * Drives the Volumetric Inkfield loader: the handmade artwork's left→right
 * clip reveal is written from the orchestrator's smoothed display value
 * (the built-in check-swoosh lands exactly at 100%), then the prototype's
 * scale-and-fade exit hands off to the intro phase machine.
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

    const art = root.querySelector<HTMLImageElement>("[data-loader-art]");
    const pctEl = root.querySelector<HTMLElement>("[data-loader-pct]");
    let lastPct = -1;
    let finished = false;

    // The loader owns fonts + its own artwork ('textures' task).
    requestAnimationFrame(() => {
      document.fonts.ready.then(() => orchestrator.set("fonts", 1));
    });
    if (art) {
      const artDone = () => orchestrator.set("textures", 1);
      if (art.complete) {
        art.decode().then(artDone, artDone);
      } else {
        art.addEventListener("load", artDone, { once: true });
        art.addEventListener("error", artDone, { once: true });
      }
    } else {
      orchestrator.set("textures", 1);
    }

    const finishSeq = () => {
      gsap.ticker.remove(tick);
      if (art) art.style.clipPath = "inset(0 0% 0 0)";
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
      if (art) art.style.clipPath = `inset(0 ${((1 - d) * 100).toFixed(2)}% 0 0)`;
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
