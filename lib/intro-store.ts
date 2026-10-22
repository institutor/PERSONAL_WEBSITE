import { create } from "zustand";

/**
 * Intro phase machine shared between the loader overlay and the hero.
 *  loading → handoff (loader finished; its clock line is flying onto the
 *                     quote bar, so the hero stages its pre-intro pose)
 *  → reveal          (the black site rises in; play the intro)
 *  loading → skipped (user skipped; jump to the final hero state)
 *  → done            (intro finished OR reduced-motion/no-JS paths)
 */
export type IntroPhase = "loading" | "handoff" | "reveal" | "skipped" | "done";

interface IntroState {
  phase: IntroPhase;
  setPhase: (phase: IntroPhase) => void;
}

export const useIntroStore = create<IntroState>((set) => ({
  phase: "loading",
  setPhase: (phase) => set({ phase }),
}));
