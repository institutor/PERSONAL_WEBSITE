"use client";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import {
  LENS,
  actorVisible,
  coverRadius,
  diskATravel,
  lensEnd,
  lensProgress,
  lensRadii,
  renderRadius,
} from "@/lib/lens-math";

/**
 * The hero → TRAJECTORY lens (choreography: lib/lens-math.ts): a lens fixed
 * at mid-screen, on the O's column, while the page keeps scrolling beneath
 * it. Leaving the full stop, the square becomes disk A (bone): it takes over
 * from the actor's live box, rounds out while travelling to the centre and
 * swells over the fading JIEWEN; disk B (ink) and disk C (bone) appear
 * inside it, each half the one outside; then Trajectory's window opens
 * inside C (a clip-path circle in the window's own, scrolling, coordinates)
 * and covers the screen exactly as the O reaches the centre, where the actor
 * grows back in as one more bone circle.
 *
 * The disks are 2 × cover px and only ever scaled DOWN (radii clamp to
 * cover), so edges stay crisp. The actor is hidden through the rings via
 * data-lens-hidden (SquareActor honours it); this tick runs first on the
 * ticker so both read one frame.
 */
export function LensFx() {
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector<HTMLElement>("[data-lens]");
    const win = document.querySelector<HTMLElement>("[data-lens-window]");
    const oSlot = win?.querySelector<HTMLElement>("[data-sq-slot]");
    const fullStop = document.querySelector<HTMLElement>('[data-section="hero"] [data-sq-slot]');
    const actor = document.querySelector<HTMLElement>("[data-square-actor]");
    if (!root || !win || !oSlot) return;
    const [diskA, diskB, diskC] = (["a", "b", "c"] as const).map(
      (k) => root.querySelector<HTMLElement>(`[data-lens-disk="${k}"]`)!
    );

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
    let cover = 1;
    let rTravel = 1;
    let closed = "circle(0px)"; // a radius-0 clip: constant, so the write is skipped
    const measure = () => {
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const o = oSlot.getBoundingClientRect();
      cx = o.left + o.width / 2;
      cy = vh / 2;
      wx = cx - win.getBoundingClientRect().left;
      s0 = LENS.startVh * vh;
      s1 = lensEnd(o.top + o.height / 2 + window.scrollY, vh);
      cover = coverRadius(cx, cy, vw, vh);
      rTravel = LENS.rTravelFrac * Math.min(vw, vh);
      closed = `circle(0px at ${wx}px 0px)`;
      gsap.set([diskA, diskB, diskC], { width: cover * 2, height: cover * 2 });
      lastClip = ""; // force a rewrite at the new centre
    };

    // the box disk A starts from: the actor's last visible frame when the
    // lens is entered from the hero, else the full stop itself
    type Box = { x: number; y: number; half: number };
    let handoff: Box | null = null;
    let prevP = 0;
    const boxOf = (r: DOMRect): Box => ({ x: r.left + r.width / 2, y: r.top + r.height / 2, half: r.width / 2 });
    const slotBox = () => (fullStop ? boxOf(fullStop.getBoundingClientRect()) : null);
    const actorBox = () => {
      if (actor && actor.style.visibility !== "hidden" && Number(actor.style.opacity) > 0) {
        const r = actor.getBoundingClientRect();
        if (r.width > 0 && (r.left > 1 || r.top > 1)) return boxOf(r);
      }
      return slotBox();
    };

    let lastHidden: boolean | null = null;
    const hideActor = (hidden: boolean) => {
      if (!actor || hidden === lastHidden) return;
      lastHidden = hidden;
      if (hidden) actor.dataset.lensHidden = "1";
      else delete actor.dataset.lensHidden;
    };
    const place = (disk: HTMLElement, x: number, y: number, r: number, radius = "50%") => {
      if (r <= 0) {
        gsap.set(disk, { display: "none" });
        return;
      }
      gsap.set(disk, {
        display: "block",
        x: x - cover,
        y: y - cover,
        scale: r / cover,
        borderRadius: radius,
      });
    };

    const tick = () => {
      // a load within 0.4 vh of the top plays the full intro (HeroIntro's
      // rule) with the period popping in at the full stop: no lens until
      // it is over, even if the restored scroll is already past S0
      const introAtTop =
        document.documentElement.dataset.intro === "play" && window.scrollY <= window.innerHeight * 0.4;
      const p = introAtTop ? 0 : lensProgress(window.scrollY, s0, s1);
      const enteredFromHero = prevP <= 0;
      prevP = p;
      if (p <= 0 || p >= 1) {
        root.style.display = "";
        clip(p >= 1 ? "none" : closed);
        hideActor(false);
        handoff = null;
        return;
      }
      const winTop = win.getBoundingClientRect().top; // read before this frame's writes
      root.style.display = "block";
      if (!handoff) handoff = enteredFromHero ? actorBox() : slotBox();

      const radii = lensRadii(p, rTravel, cover);
      if (p < LENS.travelEnd && handoff) {
        const { u, round } = diskATravel(p);
        place(
          diskA,
          gsap.utils.interpolate(handoff.x, cx, u),
          gsap.utils.interpolate(handoff.y, cy, u),
          gsap.utils.interpolate(handoff.half, rTravel, u),
          `${50 * round}%`
        );
      } else {
        place(diskA, cx, cy, renderRadius(radii.a, cover));
      }
      place(diskB, cx, cy, renderRadius(radii.b, cover));
      place(diskC, cx, cy, renderRadius(radii.c, cover));
      const rw = renderRadius(radii.window, cover);
      clip(rw > 0 ? `circle(${rw}px at ${wx}px ${cy - winTop}px)` : closed);
      hideActor(!actorVisible(p));
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 160);
    };

    measure();
    tick();
    window.addEventListener("resize", onResize);
    ScrollTrigger.addEventListener("refresh", measure);
    gsap.ticker.add(tick, false, true); // first in the frame, before the actor

    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      win.style.clipPath = "";
      if (actor) delete actor.dataset.lensHidden;
    };
  });

  return (
    <div data-lens aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] hidden overflow-hidden">
      <div data-lens-disk="a" className="lens-disk bg-bone" />
      <div data-lens-disk="b" className="lens-disk bg-ink" />
      <div data-lens-disk="c" className="lens-disk bg-bone" />
    </div>
  );
}
