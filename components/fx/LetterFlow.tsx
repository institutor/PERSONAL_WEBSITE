"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { FLOW, repel, settle } from "@/lib/letter-flow";

/**
 * Letters that part for the square actor. Every [data-flow-letter] inside a
 * [data-flow] block is pushed straight out from the actor's centre until it
 * clears the shape (by a third of its own height) and eases back as the
 * shape moves on — "Columbia University" makes way for it and closes again.
 *
 * Runs on the ticker after SquareActor (added later in the same frame) and
 * reads the shape from GSAP's transform cache: a rotated square's bounding
 * rect over-reads. Letters far off-screen are skipped.
 */
export function LetterFlow() {
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const actor = document.querySelector<HTMLElement>("[data-square-actor]");
    const letters = gsap.utils
      .toArray<HTMLElement>("[data-flow] [data-flow-letter]")
      .map((el) => ({ el, x: 0, y: 0 }));
    if (!actor || letters.length === 0) return;
    const half = actor.offsetWidth / 2;
    const prop = (k: string) => Number(gsap.getProperty(actor, k)) || 0;

    const update = () => {
      const scale = prop("scale");
      const shown = actor.style.visibility !== "hidden" && Number(actor.style.opacity) > 0 && scale > 0;
      const round = Math.min(1, (parseFloat(actor.style.borderRadius) || 0) / 50);
      const shape = {
        x: prop("x") + half,
        y: prop("y") + half,
        r: half * scale * (1 + (FLOW.squareBoost - 1) * (1 - round)),
      };
      const vh = window.innerHeight;
      for (const L of letters) {
        const r = L.el.getBoundingClientRect();
        const near = r.bottom > -vh * 0.5 && r.top < vh * 1.5;
        let tx = 0;
        let ty = 0;
        if (shown && near) {
          const pad = r.height * FLOW.padEm;
          const t = repel({ x: r.left + r.width / 2 - L.x, y: r.top + r.height / 2 - L.y }, shape, pad);
          tx = t.x;
          ty = t.y;
        }
        const nx = settle(L.x, tx, FLOW.ease);
        const ny = settle(L.y, ty, FLOW.ease);
        if (Math.abs(nx - L.x) < FLOW.epsilon && Math.abs(ny - L.y) < FLOW.epsilon) {
          if (L.x !== 0 || L.y !== 0) continue; // still settling the last pixels
          continue;
        }
        L.x = nx;
        L.y = ny;
        gsap.set(L.el, { x: nx, y: ny });
      }
    };

    gsap.ticker.add(update);
    return () => {
      gsap.ticker.remove(update);
      gsap.set(
        letters.map((l) => l.el),
        { clearProps: "transform" },
      );
    };
  });

  return null;
}
