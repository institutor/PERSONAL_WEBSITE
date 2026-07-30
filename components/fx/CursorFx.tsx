"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Custom cursor, two layers:
 *
 *  - blob: a decently large organic shape that INVERTS and BLURS whatever
 *    sits beneath it (backdrop-filter). It trails the pointer with heavy
 *    damping — slower, spread out — and its silhouette is never the same
 *    twice: eight border-radius components each oscillate on their own
 *    randomized frequency/phase, plus a slow rotation.
 *  - dot: a small difference-blended point that stays near the pointer so
 *    precision is never lost.
 *
 * Hovering anything clickable widens both slightly. Mouse-only (pointer:
 * fine), disabled for reduced motion; touch devices keep native behavior.
 */
const BLOB = 80; // px, base size
const DOT = 8;

export function CursorFx() {
  const blobRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blob = blobRef.current;
    const dot = dotRef.current;
    if (!blob || !dot) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("blob-cursor");

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const b = { x: pos.x, y: pos.y, s: 0.6 };
    const d = { x: pos.x, y: pos.y, s: 1 };
    let targetScale = 1;
    let shown = false;

    // per-session wobble seeds — the blob's silhouette is unique every time
    const seeds = Array.from({ length: 8 }, () => ({
      f: 0.55 + Math.random() * 1.05,
      p: Math.random() * Math.PI * 2,
      a: 9 + Math.random() * 9,
    }));
    const spin = (Math.random() - 0.5) * 14;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!shown) {
        shown = true;
        b.x = d.x = pos.x;
        b.y = d.y = pos.y;
        gsap.set([blob, dot], { opacity: 1 });
      }
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      targetScale = t?.closest(
        "a,button,[role='button'],input,select,textarea,summary,label,[data-cursor-grow]"
      )
        ? 1.45
        : 1;
    };
    const onLeave = () => {
      shown = false;
      gsap.set([blob, dot], { opacity: 0 });
    };

    const tick = (time: number) => {
      if (!shown) return;
      // the blur trails slower than the hand; the dot stays honest
      b.x += (pos.x - b.x) * 0.085;
      b.y += (pos.y - b.y) * 0.085;
      b.s += (targetScale - b.s) * 0.11;
      d.x += (pos.x - d.x) * 0.55;
      d.y += (pos.y - d.y) * 0.55;
      d.s += (targetScale * 1.15 - d.s) * 0.3;

      const r = seeds.map((s) => 50 + Math.sin(time * s.f + s.p) * s.a);
      blob.style.borderRadius = `${r[0]}% ${r[1]}% ${r[2]}% ${r[3]}% / ${r[4]}% ${r[5]}% ${r[6]}% ${r[7]}%`;
      gsap.set(blob, {
        x: b.x - BLOB / 2,
        y: b.y - BLOB / 2,
        scale: b.s,
        rotation: (time * spin) % 360,
      });
      gsap.set(dot, { x: d.x - DOT / 2, y: d.y - DOT / 2, scale: d.s });
    };

    gsap.ticker.add(tick);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("blob-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={blobRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] opacity-0 will-change-transform"
        style={{
          width: BLOB,
          height: BLOB,
          backdropFilter: "invert(1) blur(3px)",
          WebkitBackdropFilter: "invert(1) blur(3px)",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[91] rounded-full bg-bone mix-blend-difference opacity-0 will-change-transform"
        style={{ width: DOT, height: DOT }}
      />
    </>
  );
}
