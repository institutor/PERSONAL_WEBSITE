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

    // A pinned section's stable scroll anchor is its pin-spacer, not the
    // section itself (which sits viewport-fixed while pinned).
    const spacerTop = (sec: HTMLElement) => {
      const sp = sec.parentElement?.classList.contains("pin-spacer") ? sec.parentElement : sec;
      return sp.getBoundingClientRect().top + window.scrollY;
    };

    const measure = () => {
      const vh = window.innerHeight;
      const deck = document.querySelector<HTMLElement>("[data-deck]");
      const deckTop = deck ? spacerTop(deck) : 0;
      const hs = document.querySelector<HTMLElement>("[data-hsection]");
      const htrack = hs?.querySelector<HTMLElement>("[data-htrack]");
      // A slot's dwell is [arrive..depart] in scroll units; the space between
      // consecutive dwells is transit. data-sq-hold stretches a dwell in both
      // directions (1 = default). Deck slots map to their card's pin segment;
      // a data-sq-ride slot dwells across the WHOLE horizontal pin, so the
      // square floats passively in the word while the page moves sideways.
      marks = slotEls
        .filter((el) => el.getBoundingClientRect().width > 0) // skip display:none slots
        .map((el) => {
          if (deck?.classList.contains("deck-live") && el.dataset.sqSeg !== undefined) {
            const seg = Number(el.dataset.sqSeg);
            return { el, arrive: deckTop + (seg + 0.58) * vh, depart: deckTop + (seg + 0.94) * vh };
          }
          if (el.dataset.sqRide !== undefined && hs && htrack) {
            const top = spacerTop(hs);
            const pinLen = Math.max(0, htrack.scrollWidth - window.innerWidth) + vh * 0.45;
            return { el, arrive: top - vh * 0.5, depart: top + pinLen - vh * 0.2 };
          }
          const top = el.getBoundingClientRect().top + window.scrollY;
          const hold = Math.max(1, Number(el.dataset.sqHold) || 1);
          const lead = vh * (0.68 + 0.3 * (hold - 1));
          const exit = vh * Math.max(0.08, 0.34 - 0.18 * (hold - 1));
          return { el, arrive: top - lead, depart: top - exit };
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
    let entryAt = -1; // ticker time the entrance flight began

    const update = (time: number) => {
      if (marks.length < 2) return;
      // hold until the intro releases the page — the square then FLOATS in
      if (!state.init && document.documentElement.dataset.intro === "play") return;
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

      // bone by default; ink while the dominant slot sits on a bone card
      const tone = (t < 0.5 ? a : b).el.dataset.sqTone;
      sq.style.backgroundColor = tone === "ink" ? "var(--ink)" : "var(--bone)";

      const ra = a.el.getBoundingClientRect();
      const rb = b.el.getBoundingClientRect();
      let cx = gsap.utils.interpolate(ra.left + ra.width / 2, rb.left + rb.width / 2, t);
      let cy = gsap.utils.interpolate(ra.top + ra.height / 2, rb.top + rb.height / 2, t);
      const size = gsap.utils.interpolate(ra.width, rb.width, t);

      // free-floating transit: a meandering flight, not a straight line.
      // Layers: primary arc + two slower counter-waves across the path,
      // a sway along the travel direction, and a live time-based drift so
      // the square keeps wandering even if the scroll pauses mid-flight.
      // Every layer is gated by arc = sin(t*PI), so arrivals stay exact.
      let flight = 0;
      if (t > 0 && t < 1) {
        const dx = rb.left - ra.left;
        const dy = rb.top - ra.top;
        const dist = Math.hypot(dx, dy) || 1;
        const nx = -dy / dist;
        const ny = dx / dist;
        const ux = dx / dist;
        const uy = dy / dist;
        const arc = Math.sin(t * Math.PI);
        flight = arc;
        const amp = Math.min(170, dist * 0.3) * (ai % 2 === 0 ? 1 : -1);
        const meander =
          1 +
          Math.sin(t * Math.PI * 2.3 + ai * 2.1) * 0.45 +
          Math.sin(t * Math.PI * 4.7 + time * 0.9) * 0.22;
        const sway = Math.sin(t * Math.PI * 1.7 + ai + time * 0.6) * Math.min(80, dist * 0.14);
        cx += nx * amp * arc * meander + ux * sway * arc;
        cy += ny * amp * arc * meander + uy * sway * arc;

        // flying INTO the ride word (EXPERIENCE): detour wide through the
        // right side of the viewport, hanging there mid-flight before
        // curling in — arc-gated, so the landing stays exact
        if (b.el.dataset.sqRide !== undefined) {
          const straight = gsap.utils.interpolate(ra.left + ra.width / 2, rb.left + rb.width / 2, t);
          cx += (window.innerWidth * 0.84 - straight) * arc * 0.85;
        }
      }

      // gentle idle bob, swelling to a real float mid-flight
      const drift = 1 + flight * 2.2;
      cy += Math.sin(time * 1.4 + ai * 1.7) * 5 * drift;
      cx += Math.cos(time * 0.9 + ai) * 3 * drift;

      // entrance: a decaying curl on the target so the approach is a float,
      // not a beeline; fades to nothing within ~2.6s
      if (entryAt >= 0) {
        const age = time - entryAt;
        if (age < 2.6) {
          const env = Math.pow(1 - age / 2.6, 1.6);
          cx += Math.sin(age * 2.4 + 1) * 90 * env;
          cy += Math.cos(age * 1.7) * 60 * env;
        } else {
          entryAt = -1;
        }
      }

      const tx = cx - BASE / 2;
      const ty = cy - BASE / 2;
      const ts = Math.max(0.2, size / BASE);

      if (!state.init) {
        // born offscreen above-right, small — drifts down into the slot.
        // The element ships opacity-0 and turns visible only on this first
        // POSITIONED frame, so it can never flash untransformed at 0,0.
        state.x = tx + Math.min(360, window.innerWidth * 0.25);
        state.y = ty - Math.min(440, window.innerHeight * 0.55);
        state.s = ts * 0.35;
        entryAt = time;
        state.init = true;
        gsap.set(sq, { autoAlpha: 1 });
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
      className="pointer-events-none fixed left-0 top-0 z-[8] h-6 w-6 bg-bone opacity-0 will-change-transform"
    />
  );
}
