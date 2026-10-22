"use client";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { squareMorph } from "@/lib/square-morph";

/**
 * The page's protagonist: ONE voltage square that journeys through the site.
 *
 * Slots ([data-sq-slot]) are invisible geometry markers placed in the
 * sections. The square interpolates between consecutive slots as you scroll —
 * growing, shrinking, riding the horizontal chapter (live rects track pinned
 * transforms), spinning with travel velocity — and finally lands in the gap
 * where BUILD's "I" used to be (the letter is knocked out by ScrollFx).
 * Shape: it spins into a circle across its first flight, stays round
 * through the site, and spins back into a square for BU■LD. That first
 * flight is unseen: LensFx's rings stand in for it (data-lens-hidden) and
 * it grows back into TRAJECTORY's O as the lens finishes.
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

    // The sticky hero reports its STUCK position (rect and offsetTop alike);
    // its natural top is where the flow after it begins, minus its height.
    const heroShift = (el: HTMLElement) => {
      const hero = el.closest<HTMLElement>('[data-section="hero"]');
      const next = hero?.nextElementSibling;
      if (!hero || !next || getComputedStyle(hero).position !== "sticky") return 0;
      return hero.getBoundingClientRect().top + hero.offsetHeight - next.getBoundingClientRect().top;
    };

    // Slots in the sticky lens stage (Trajectory) reach the reading zone
    // only after the stage unsticks: shift them by the spacer's length,
    // less however far the stage is stuck right now (its rect includes it).
    const lensShift = (el: HTMLElement) => {
      const wrap = el.closest<HTMLElement>("[data-lens-wrap]");
      const stage = wrap?.querySelector<HTMLElement>("[data-lens-stage]");
      const spacer = wrap?.querySelector<HTMLElement>("[data-lens-spacer]");
      if (!wrap || !stage || !spacer) return 0;
      const stuck = stage.getBoundingClientRect().top - wrap.getBoundingClientRect().top;
      return spacer.offsetHeight - stuck;
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
          const top = el.getBoundingClientRect().top + window.scrollY - heroShift(el) + lensShift(el);
          const hold = Math.max(1, Number(el.dataset.sqHold) || 1);
          const lead = vh * (0.68 + 0.3 * (hold - 1));
          const exit = vh * Math.max(0.08, 0.34 - 0.18 * (hold - 1));
          const dwell = Number(el.dataset.sqDwell) || 0; // extra rest, in viewports
          return { el, arrive: top - lead, depart: top - exit + dwell * vh };
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
    const state = { x: 0, y: 0, s: 1, r: 0, round: 0, spin: 0, init: false, hidden: false };
    let enteredAt = -1; // ticker time the period popped in

    const update = (time: number) => {
      if (marks.length < 2) return;
      // hold until the hero calls the period in (as JIEWEN lands) or the
      // intro is over (skip, reload mid-page)
      const docEl = document.documentElement;
      const introPlaying = docEl.dataset.intro === "play";
      if (!state.init && introPlaying && docEl.dataset.square !== "in") return;
      const y = window.scrollY;
      // LensFx hides the actor while its rings stand in for it
      const hidden = sq.dataset.lensHidden === "1";

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

      const morph = squareMorph(ai, t, marks.length);

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

      const tx = cx - BASE / 2;
      const ty = cy - BASE / 2;
      const ts = Math.max(0.2, size / BASE);

      if (!state.init) {
        // the period pops in ON its slot: grows from nothing with a quarter
        // twist (~0.4 s). The element ships opacity-0 and turns visible only
        // on this first POSITIONED frame, so it can never flash at 0,0.
        state.x = tx;
        state.y = ty;
        state.s = 0;
        state.round = morph.round;
        state.spin = morph.spin - 90;
        enteredAt = time;
        state.init = true;
        state.hidden = hidden;
        gsap.set(sq, { autoAlpha: hidden ? 0 : 1 });
      }
      if (hidden !== state.hidden) {
        state.hidden = hidden;
        if (hidden) {
          gsap.set(sq, { autoAlpha: 0 });
        } else {
          // back from the lens: in place, growing into the O from 15 %. At
          // the full stop the lens hands back the actor's own box, so there
          // it simply reappears.
          state.x = tx;
          state.y = ty;
          if (ai > 0) state.s = ts * 0.15;
          gsap.set(sq, { autoAlpha: 1 });
        }
      }
      const k = 0.075; // soft damping — lazy, fluid follow
      // while the intro floats the lockup up, ride it locked to the slot
      const kPos = introPlaying ? 1 : k;
      const kIn = time - enteredAt < 1 ? 0.14 : k; // the pop itself is quick (~0.3 s)
      const prevX = state.x;
      state.x += (tx - state.x) * kPos;
      state.y += (ty - state.y) * kPos;
      state.s += (ts - state.s) * kIn;
      // spin with horizontal travel, settle back to upright
      const vel = state.x - prevX;
      state.r += vel * 0.18;
      state.r *= 0.94;
      state.round += (morph.round - state.round) * k;
      state.spin += (morph.spin - state.spin) * kIn;

      gsap.set(sq, {
        x: state.x,
        y: state.y,
        scale: state.s,
        rotation: state.r + state.spin,
        borderRadius: `${state.round * 50}%`,
      });
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
