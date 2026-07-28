import { create } from "zustand";

/**
 * Intro phase machine shared between the loader overlay and the WebGL hero.
 *  loading → reveal  (loader finished; play the full cinematic)
 *  loading → skipped (user skipped; jump to the final hero state)
 *  → done            (cinematic finished OR reduced-motion/no-JS paths)
 */
export type IntroPhase = "loading" | "reveal" | "skipped" | "done";

interface IntroState {
  phase: IntroPhase;
  setPhase: (phase: IntroPhase) => void;
}

export const useIntroStore = create<IntroState>((set) => ({
  phase: "loading",
  setPhase: (phase) => set({ phase }),
}));
