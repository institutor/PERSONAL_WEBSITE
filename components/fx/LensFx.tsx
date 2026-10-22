"use client";

import { useLenis } from "lenis/react";
import { useRef } from "react";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import {
  LENS,
  actorVisible,
  coverRadius,
  handoffBlend,
  lensEnd,
  lensProgress,
  lensRadii,
  oInWindow,
  renderRadius,
  wrap90,
} from "@/lib/lens-math";

/**
 * The hero → TRAJECTORY lens (choreography: lib/lens-math.ts): a lens fixed
 * at mid-screen, on the O's column, while the page keeps scrolling beneath
 * it. The period flies there itself (the lens slot rendered here is one of
 * its marks), spinning into a circle over the fading JIEWEN; at p 0.15 disk A
 * (bone) takes over from its live shape, blends onto the centre and swells;
 * then Trajectory's window opens inside it (a clip-path circle in the
 * window's own, scrolling, coordinates), settling to half its radius, and
 * covers the screen exactly as the O reaches
 * the centre, where the actor grows back in as one more bone circle. Scrolled
 * back below 0.15, the actor takes disk A's shape over (data-lens-*).
 *
 * The disks are 2 × cover px and only ever scaled DOWN (radii clamp to
 * cover), so edges stay crisp. The actor is hidden through the rings via
 * data-lens-hidden (SquareActor honours it) until the O is inside the
 * open window; this tick runs first on the ticker so both read one frame.
 * Lenis moves the page later in that frame, so its scroll event re-centres
 * the window's clip on the position actually painted.
 */
export function LensFx() {
  const recentreRef = useRef<(() => void) | null>(null);
  useLenis(() => recentreRef.current?.());

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector<HTMLElement>("[data-lens]");
    const win = document.querySelector<HTMLElement>("[data-lens-window]");
    const oSlot = win?.querySelector<HTMLElement>("[data-sq-slot]");
    const actor = document.querySelector<HTMLElement>("[data-square-actor]");
    const lensSlot = document.querySelector<HTMLElement>("[data-sq-lens]");
    if (!root || !win || !oSlot) return;
    const diskA = root.querySelector<HTMLElement>('[data-lens-disk="a"]');
    if (!diskA) return;

    let lastClip = "";
    const clip = (value: string) => {
      if (value === lastClip) return;
      lastClip = value;
      win.style.clipPath = value;
    };

    // geometry, re-measured on resize / ScrollTrigger refresh
    let s0 = 0;
    let s1 = 0;
    let cx = 0; // lens centre in the viewport: the O's column, mid-height
    let cy = 0;
    let wx = 0; // cx in the window's own box (clip-path coordinates)
    let winDocTop = 0; // the window's document top: its viewport top is winDocTop − scrollY
    let oDocY = 0; // the O's centre, document y
    let oHalf = 0;
    let cover = 1;
    let rTravel = 1;
    let closed = "circle(0px)"; // a radius-0 clip: constant, so the write is skipped
    let measuredW = 0;
    let measuredH = 0;
    const measure = () => {
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      measuredW = window.innerWidth;
      measuredH = vh;
      const o = oSlot.getBoundingClientRect();
      const w = win.getBoundingClientRect();
      cx = o.left + o.width / 2;
      cy = vh / 2;
      wx = cx - w.left;
      winDocTop = w.top + window.scrollY;
      oDocY = o.top + o.height / 2 + window.scrollY;
      oHalf = o.height / 2;
      s0 = LENS.startVh * vh;
      s1 = lensEnd(oDocY, vh);
      cover = coverRadius(cx, cy, vw, vh);
      rTravel = LENS.rTravelFrac * Math.min(vw, vh);
      closed = `circle(0px at ${wx}px 0px)`;
      gsap.set(diskA, { width: cover * 2, height: cover * 2 });
      // the actor's mark at the lens centre: it flies here, rT in radius
      if (lensSlot) {
        Object.assign(lensSlot.style, {
          display: "block",
          left: `${cx - rTravel}px`,
          top: `${cy - rTravel}px`,
          width: `${rTravel * 2}px`,
          height: `${rTravel * 2}px`,
        });
      }
      lastClip = ""; // force a rewrite at the new centre
    };

    // disk A's start: the actor's live shape when it flew into the lens from
    // below, else the exact centre (a reload or a jump past the handoff).
    // Read from GSAP's transform cache: a rotated element's rect is too big.
    type Shape = { x: number; y: number; r: number; round: number; rot: number };
    let handoff: Shape | null = null;
    let handoffFrom = 0; // handoffBlend at the frame the shape was taken
    let prevP: number | null = null;
    const centreShape = (): Shape => ({ x: cx, y: cy, r: rTravel, round: 1, rot: 0 });
    const actorShape = (): Shape => {
      if (!actor || actor.style.visibility === "hidden" || !(Number(actor.style.opacity) > 0)) return centreShape();
      const g = (k: string) => Number(gsap.getProperty(actor, k)) || 0;
      const half = actor.offsetWidth / 2;
      if (!(g("scale") > 0)) return centreShape();
      return {
        x: g("x") + half,
        y: g("y") + half,
        r: half * g("scale"),
        round: Math.min(1, (parseFloat(actor.style.borderRadius) || 0) / 50),
        rot: wrap90(g("rotation")),
      };
    };

    // disk A's shape, handed to the actor if the page scrolls back below the
    // handoff; removed once the actor is visible again (the frame after it
    // has read them — this tick runs before the actor's)
    let shapeOnActor = false;
    const giveShape = (sh: Shape | null) => {
      if (!actor) return;
      if (sh) {
        Object.assign(actor.dataset, {
          lensX: sh.x.toFixed(2),
          lensY: sh.y.toFixed(2),
          lensR: sh.r.toFixed(2),
          lensRound: sh.round.toFixed(3),
          lensRot: sh.rot.toFixed(2),
        });
        shapeOnActor = true;
      } else if (shapeOnActor && actor.style.visibility !== "hidden") {
        for (const k of ["lensX", "lensY", "lensR", "lensRound", "lensRot"]) delete actor.dataset[k];
        shapeOnActor = false;
      }
    };

    let lastHidden: boolean | null = null;
    const hideActor = (hidden: boolean) => {
      if (!actor || hidden === lastHidden) return;
      lastHidden = hidden;
      if (hidden) actor.dataset.lensHidden = "1";
      else delete actor.dataset.lensHidden;
    };
    const place = (disk: HTMLElement, x: number, y: number, r: number, round = 1, rotation = 0) => {
      if (r <= 0) {
        gsap.set(disk, { display: "none" });
        return;
      }
      gsap.set(disk, {
        display: "block",
        x: x - cover,
        y: y - cover,
        scale: r / cover,
        rotation,
        borderRadius: `${50 * round}%`,
      });
    };

    let rw = 0; // the window's rendered radius this frame
    const windowClip = () => (rw > 0 ? `circle(${rw}px at ${wx}px ${cy - (winDocTop - window.scrollY)}px)` : closed);

    const tick = () => {
      // a load within 0.4 vh of the top plays the full intro (HeroIntro's
      // rule) with the period popping in at the full stop: no lens until
      // it is over, even if the restored scroll is already past S0
      const introAtTop =
        document.documentElement.dataset.intro === "play" && window.scrollY <= window.innerHeight * 0.4;
      const p = introAtTop ? 0 : lensProgress(window.scrollY, s0, s1);
      const fromBelow = prevP !== null && prevP < LENS.travelEnd;
      prevP = p;
      giveShape(null);
      if (p < LENS.travelEnd || p >= 1) {
        // the actor flies the first leg itself; after the lens, the page
        rw = 0;
        root.style.display = "";
        clip(p >= 1 ? "none" : closed);
        hideActor(false);
        handoff = null;
        return;
      }
      root.style.display = "block";
      if (!handoff) {
        handoff = fromBelow ? actorShape() : centreShape();
        handoffFrom = handoffBlend(p);
      }

      const radii = lensRadii(p, rTravel, cover);
      const lerp = gsap.utils.interpolate;
      // the blend restarts from wherever p was when the shape was taken: a
      // fast scroll can overshoot 0.15 in one frame, and disk A must still
      // start exactly on the actor
      const b = handoffFrom >= 1 ? 1 : Math.max(0, (handoffBlend(p) - handoffFrom) / (1 - handoffFrom));
      const a: Shape = {
        x: lerp(handoff.x, cx, b),
        y: lerp(handoff.y, cy, b),
        r: renderRadius(lerp(handoff.r, radii.a, b), cover),
        round: lerp(handoff.round, 1, b),
        rot: lerp(handoff.rot, 0, b),
      };
      place(diskA, a.x, a.y, a.r, a.round, a.rot);
      rw = renderRadius(radii.window, cover);
      clip(windowClip());
      const hidden = !(actorVisible(p) && oInWindow(oDocY - window.scrollY - cy, oHalf, rw));
      hideActor(hidden);
      if (hidden && p < LENS.actorReturn) giveShape(a);
    };
    // only while the window is opening: closed and fully open (none) don't move
    recentreRef.current = () => {
      if (rw > 0) clip(windowClip());
    };

    let resizeTimer = 0;
    const onResize = () => {
      // touch devices resize on every URL-bar show/hide: keep the lens where
      // it is, as ScrollTrigger (and so the actor's marks) does
      const urlBar =
        ScrollTrigger.isTouch === 1 &&
        window.innerWidth === measuredW &&
        Math.abs(window.innerHeight - measuredH) <= measuredH * 0.25;
      if (urlBar) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 160);
    };

    measure();
    tick();
    window.addEventListener("resize", onResize);
    ScrollTrigger.addEventListener("refresh", measure);
    gsap.ticker.add(tick, false, true); // first in the frame, before the actor

    return () => {
      recentreRef.current = null;
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      win.style.clipPath = "";
      if (actor) {
        for (const k of ["lensHidden", "lensX", "lensY", "lensR", "lensRound", "lensRot"]) delete actor.dataset[k];
      }
    };
  });

  return (
    <>
      <div data-lens aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] hidden overflow-hidden">
        <div data-lens-disk="a" className="lens-disk bg-bone" />
      </div>
      {/* measurable, never painted; stays display:none (out of the actor's
          route) unless LensFx runs and places it */}
      <span data-sq-slot data-sq-lens aria-hidden="true" className="pointer-events-none invisible fixed left-0 top-0 hidden" />
    </>
  );
}
