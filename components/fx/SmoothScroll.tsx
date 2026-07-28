"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis smooth scroll driven by gsap.ticker — ONE animation clock for the
 * whole site (architectural rule #1). autoRaf stays off so Lenis never runs
 * its own loop; lagSmoothing(0) keeps scroll and tweens in lockstep.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

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

  return (
    <ReactLenis root options={{ autoRaf: false, syncTouch: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
