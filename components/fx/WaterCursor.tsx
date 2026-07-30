"use client";

import { useEffect, useRef } from "react";

/**
 * Water cursor: the page as a still surface.
 *
 *  - cursor: a small bone square (the site's protagonist, handheld). It
 *    leans into travel direction and presses down on click. Difference
 *    blend keeps it visible on both inks.
 *  - ripples: moving disturbs the surface — expanding rings spawn along
 *    the trail, each a thin annulus (clip-path ring) whose band carries a
 *    real backdrop blur: the content under the ring smears while the wave
 *    passes, then settles, like water. Clicks drop a bigger stone.
 *
 * All ring animation runs on the compositor (WAAPI transform/opacity on
 * a pooled set of elements). Mouse-only; reduced motion keeps the native
 * cursor and a still surface.
 */
const RING_POOL = 14;
const RING_SIZE = 170; // px at scale 1
const SPAWN_DIST = 46; // px of travel per ripple

// annulus: outer circle + inner circle, evenodd — the ring band is ~11% wide
const R = RING_SIZE / 2;
const RI = R * 0.78;
const RING_PATH = `path(evenodd, "M ${R} 0 A ${R} ${R} 0 1 0 ${R} ${RING_SIZE} A ${R} ${R} 0 1 0 ${R} 0 Z M ${R} ${R - RI} A ${RI} ${RI} 0 1 1 ${R} ${R + RI} A ${RI} ${RI} 0 1 1 ${R} ${R - RI} Z")`;

export function WaterCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const sq = sqRef.current;
    if (!root || !sq) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("water-cursor");

    // ---- ring pool -------------------------------------------------------
    const rings: HTMLDivElement[] = [];
    for (let i = 0; i < RING_POOL; i++) {
      const el = document.createElement("div");
      el.className = "ripple-ring";
      el.style.clipPath = RING_PATH;
      root.appendChild(el);
      rings.push(el);
    }
    let ringIdx = 0;

    const drop = (x: number, y: number, size: number, ms: number) => {
      const el = rings[ringIdx];
      ringIdx = (ringIdx + 1) % RING_POOL;
      el.style.left = `${x - RING_SIZE / 2}px`;
      el.style.top = `${y - RING_SIZE / 2}px`;
      el.animate(
        [
          { transform: `scale(${(size * 0.22) / RING_SIZE})`, opacity: 0.9 },
          { transform: `scale(${size / RING_SIZE})`, opacity: 0 },
        ],
        { duration: ms, easing: "cubic-bezier(0.16, 0.84, 0.44, 1)", fill: "forwards" }
      );
    };

    // ---- cursor ----------------------------------------------------------
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const cur = { x: pos.x, y: pos.y, r: 0, s: 0, target: 1 };
    let last = { x: pos.x, y: pos.y };
    let traveled = 0;
    let shown = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!shown) {
        shown = true;
        cur.x = last.x = pos.x;
        cur.y = last.y = pos.y;
        sq.style.opacity = "1";
      }
      // spawn ripples by distance traveled — the wake
      traveled += Math.hypot(pos.x - last.x, pos.y - last.y);
      if (traveled >= SPAWN_DIST) {
        traveled = 0;
        drop(pos.x, pos.y, RING_SIZE * (0.8 + Math.random() * 0.4), 1050);
      }
      last = { x: pos.x, y: pos.y };
    };
    const onDown = () => {
      cur.target = 0.72;
      // the stone: two rings, staggered
      drop(pos.x, pos.y, RING_SIZE * 1.7, 1250);
      setTimeout(() => drop(pos.x, pos.y, RING_SIZE * 1.15, 1050), 110);
    };
    const onUp = () => {
      cur.target = 1;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      cur.target = t?.closest("a,button,[role='button'],input,select,textarea,summary,label") ? 1.7 : 1;
    };
    const onLeave = () => {
      shown = false;
      sq.style.opacity = "0";
    };

    const tick = () => {
      const dx = pos.x - cur.x;
      cur.x += dx * 0.4;
      cur.y += (pos.y - cur.y) * 0.4;
      // lean into horizontal travel, settle square
      cur.r = cur.r * 0.86 + dx * 0.7;
      cur.s += (cur.target - cur.s) * 0.22;
      sq.style.transform = `translate(${cur.x - 6}px, ${cur.y - 6}px) rotate(${cur.r}deg) scale(${cur.s})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      rings.forEach((r) => r.remove());
      document.documentElement.classList.remove("water-cursor");
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <div
        ref={sqRef}
        className="fixed left-0 top-0 h-3 w-3 bg-bone opacity-0 mix-blend-difference will-change-transform"
      />
    </div>
  );
}
