"use client";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

/**
 * The page's protagonist: ONE voltage square that journeys through the site.
 *
 * Slots ([data-sq-slot]) are invisible geometry markers placed in the
 * sections. The square interpolates between consecutive slots as you scroll —
 * growing, shrinking, riding the horizontal chapter (live rects track pinned
 * transforms), spinning with travel velocity — and finally lands in the gap
 * where BUILD's "I" used to be (the letter is knocked out by ScrollFx).
 *
 * Position is damped (lerped toward target) so the square feels alive, not
 * bolted to the scrollbar.
 */
const BASE = 24; // px — element's natural size; scale = slotWidth / BASE

export function SquareActor() {
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sq = document.querySelector<HTMLElement>("[data-square-actor]");
    const slotEls = gsap.utils.toArray<HTMLElement>("[data-sq-slot]");
    if (!sq || slotEls.length < 2) return;

    interface Mark {
      el: HTMLElement;
      /** Scroll range [arrive..depart] during which the actor DWELLS here
          (slot sits roughly in the 18%–78% viewport reading zone). */
      arrive: number;
      depart: number;
    }
    let marks: Mark[] = [];

    const measure = () => {
      const vh = window.innerHeight;
      // shorter dwell → longer, lazier transits between letters
      marks = slotEls
        .map((el) => {
          const top = el.getBoundingClientRect().top + window.scrollY;
          return { el, arrive: top - vh * 0.68, depart: top - vh * 0.34 };
        })
        .sort((a, b) => a.arrive - b.arrive);
      // ranges must never overlap or the piecewise walk breaks
      for (let i = 1; i < marks.length; i++) {
        marks[i].arrive = Math.max(marks[i].arrive, marks[i - 1].depart + 1);
        marks[i].depart = Math.max(marks[i].depart, marks[i].arrive + 1);
      }
    };
    measure();
    ScrollTrigger.addEventListener("refresh", measure);

    // NOTE: quickSetter doesn't support the "scale" alias — write all four
    // transform components in one gsap.set per frame instead.

    const smooth = (t: number) => t * t * (3 - 2 * t);
    const state = { x: 0, y: 0, s: 1, r: 0, init: false };

    const update = (time: number) => {
      if (marks.length < 2) return;
      const y = window.scrollY;

      // piecewise: DWELL inside a mark's [arrive..depart], transit between
      let i = 0;
      while (i < marks.length - 1 && y > marks[i].depart) i++;
      const ai = Math.max(0, y > marks[i].arrive ? i : i - 1);
      const a = marks[ai];
      const b = marks[Math.min(marks.length - 1, y > marks[i].arrive ? i : i)];
      let t: number;
      if (y <= a.depart) {
        t = 0; // dwelling at a
      } else {
        const span = Math.max(1, b.arrive - a.depart);
        t = smooth(gsap.utils.clamp(0, 1, (y - a.depart) / span));
      }

      const ra = a.el.getBoundingClientRect();
      const rb = b.el.getBoundingClientRect();
      let cx = gsap.utils.interpolate(ra.left + ra.width / 2, rb.left + rb.width / 2, t);
      let cy = gsap.utils.interpolate(ra.top + ra.height / 2, rb.top + rb.height / 2, t);
      const size = gsap.utils.interpolate(ra.width, rb.width, t);

      // free-floating transit: drift along a curved path, not a straight line
      if (t > 0 && t < 1) {
        const dx = rb.left - ra.left;
        const dy = rb.top - ra.top;
        const dist = Math.hypot(dx, dy) || 1;
        const amp = Math.min(120, dist * 0.22) * (ai % 2 === 0 ? 1 : -1);
        const arc = Math.sin(t * Math.PI);
        cx += (-dy / dist) * amp * arc;
        cy += (dx / dist) * amp * arc;
      }

      // gentle idle bob so it always feels afloat
      const bob = Math.sin(time * 1.4 + ai * 1.7);
      cy += bob * 5;
      cx += Math.cos(time * 0.9 + ai) * 3;

      const tx = cx - BASE / 2;
      const ty = cy - BASE / 2;
      const ts = Math.max(0.2, size / BASE);

      if (!state.init) {
        state.x = tx;
        state.y = ty;
        state.s = ts;
        state.init = true;
      }
      const k = 0.075; // soft damping — lazy, fluid follow
      const prevX = state.x;
      state.x += (tx - state.x) * k;
      state.y += (ty - state.y) * k;
      state.s += (ts - state.s) * k;
      // spin with horizontal travel, settle back to square
      const vel = state.x - prevX;
      state.r += vel * 0.18;
      state.r *= 0.94;

      gsap.set(sq, { x: state.x, y: state.y, scale: state.s, rotation: state.r });
    };

    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      ScrollTrigger.removeEventListener("refresh", measure);
    };
  });

  return (
    <div
      data-square-actor
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[8] h-6 w-6 bg-bone will-change-transform"
    />
  );
}
