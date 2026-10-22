"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis smooth scroll driven by gsap.ticker — ONE animation clock for the
 * whole site (architectural rule #1). autoRaf stays off so Lenis never runs
 * its own loop; lagSmoothing(0) keeps scroll and tweens in lockstep.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  // the root instance appears after ReactLenis's own effect; this re-renders then
  const lenis = useLenis();

  useEffect(() => {
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current?.lenis?.on("scroll", ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  // Intro scroll lock: while html[data-intro="play"], Lenis is stopped (it
  // swallows wheel + touch) and the scroll keys are ignored. The scrollbar
  // itself stays put, so nothing reflows when the page is released.
  useEffect(() => {
    const docEl = document.documentElement;
    const playing = () => docEl.dataset.intro === "play";
    const sync = () => {
      if (playing()) lenis?.stop();
      else lenis?.start();
    };
    const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]);
    const onKey = (e: KeyboardEvent) => {
      if (!playing() || !SCROLL_KEYS.has(e.key)) return;
      if (e.target instanceof Element && e.target.closest("button, a, input, textarea, select")) return;
      e.preventDefault();
    };
    const mo = new MutationObserver(sync);
    mo.observe(docEl, { attributes: true, attributeFilter: ["data-intro"] });
    sync();
    window.addEventListener("keydown", onKey);
    return () => {
      mo.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [lenis]);

  return (
    <ReactLenis root options={{ autoRaf: false, syncTouch: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
