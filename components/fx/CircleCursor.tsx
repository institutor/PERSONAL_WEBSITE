"use client";

import { useEffect, useRef } from "react";

/**
 * Minimalist circle cursor. A bone disc in difference blend: everything
 * inside the circle inverts (ink <-> bone) — exact on a two-color page.
 * Small at rest; grows a step over text characters, a bit more over
 * anything clickable. Never large. Mouse-only; reduced motion keeps the
 * native cursor.
 */
const BASE = 16; // px diameter at rest
const OVER_TEXT = 2.3; // ~37px
const OVER_LINK = 2.75; // ~44px

const INTERACTIVE = "a,button,input,select,textarea,label,summary,[role='button']";

export function CircleCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("circle-cursor");

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const cur = { x: pos.x, y: pos.y, s: 1, target: 1 };
    let shown = false;
    let raf = 0;

    const hasOwnText = (el: Element) => {
      for (const n of el.childNodes) {
        if (n.nodeType === Node.TEXT_NODE && n.textContent && n.textContent.trim()) return true;
      }
      return false;
    };

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!shown) {
        shown = true;
        cur.x = pos.x;
        cur.y = pos.y;
        dot.style.opacity = "1";
      }
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;
      if (t.closest(INTERACTIVE)) cur.target = OVER_LINK;
      else if (hasOwnText(t)) cur.target = OVER_TEXT;
      else cur.target = 1;
    };
    const onLeave = () => {
      shown = false;
      dot.style.opacity = "0";
    };

    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.45;
      cur.y += (pos.y - cur.y) * 0.45;
      cur.s += (cur.target - cur.s) * 0.18;
      dot.style.transform = `translate(${cur.x - BASE / 2}px, ${cur.y - BASE / 2}px) scale(${cur.s})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("circle-cursor");
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[95] h-4 w-4 rounded-full bg-bone opacity-0 mix-blend-difference will-change-transform"
    />
  );
}
