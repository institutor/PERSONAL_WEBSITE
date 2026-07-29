"use client";

import { useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useIntroStore } from "@/lib/intro-store";
import { orchestrator } from "@/lib/load-orchestrator";
import { SignatureLoader } from "./v1/SignatureLoader";

/**
 * Wires the v1 preload animation to the real loading pipeline:
 *  - orchestrator task states feed the animation's ready flags
 *  - the % readout tracks the orchestrator's smoothed display value
 *  - completion (animation done OR skip) fades the overlay and hands off
 *    to the intro phase machine
 */
export function LoaderFx() {
  const [flags, setFlags] = useState({ fonts: false, chunk: false, compile: false });
  const [mounted, setMounted] = useState(false);

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

    setMounted(true);

    const pctEl = root.querySelector<HTMLElement>("[data-loader-pct]");
    let lastPct = -1;
    let finished = false;

    requestAnimationFrame(() => {
      document.fonts.ready.then(() => orchestrator.set("fonts", 1));
    });

    const finishSeq = (viaSkip: boolean) => {
      if (finished) return;
      finished = true;
      gsap.ticker.remove(tick);
      if (pctEl) pctEl.textContent = "100";
      root.setAttribute("aria-valuenow", "100");
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(root, { display: "none" });
            useIntroStore.getState().setPhase(viaSkip ? "skipped" : "reveal");
          },
        })
        .to(root, {
          autoAlpha: 0,
          duration: viaSkip ? 0.2 : 0.55,
          ease: "power2.inOut",
          delay: viaSkip ? 0 : 0.25,
        });
    };
    (root as HTMLElement & { __finish?: (s: boolean) => void }).__finish = finishSeq;

    const tick = (_time: number, deltaMS: number) => {
      const d = orchestrator.display(deltaMS / 1000);
      const p100 = Math.min(100, Math.round(d * 100));
      if (p100 !== lastPct && pctEl) {
        pctEl.textContent = String(p100).padStart(3, "0");
        lastPct = p100;
        if (p100 % 5 === 0) root.setAttribute("aria-valuenow", String(p100));
      }
      // poll task states into the animation's ready flags
      setFlags((prev) => {
        const next = {
          fonts: orchestrator.isDone("fonts"),
          chunk: orchestrator.isDone("chunk"),
          compile: orchestrator.isDone("compile"),
        };
        return prev.fonts === next.fonts && prev.chunk === next.chunk && prev.compile === next.compile
          ? prev
          : next;
      });
      if (orchestrator.skipped) finishSeq(true);
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

  if (!mounted) return null;

  return (
    <SignatureLoader
      fontsReady={flags.fonts}
      imageReady={flags.chunk}
      rendererReady={flags.compile}
      onComplete={() => {
        const root = document.querySelector<HTMLElement>("[data-loader]") as
          | (HTMLElement & { __finish?: (s: boolean) => void })
          | null;
        root?.__finish?.(false);
      }}
    />
  );
}
