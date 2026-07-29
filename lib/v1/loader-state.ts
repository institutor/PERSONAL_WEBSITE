export type LoaderPhase = "drawing" | "checking" | "complete";

export type LoaderStateInput = {
  elapsedMs: number;
  fontsReady: boolean;
  imageReady: boolean;
  rendererReady: boolean;
  reducedMotion: boolean;
};

export type LoaderScheduledWork = {
  animationFrame: number | null;
  completionTimer: number | null;
};

const DRAWING_MINIMUM_MS = 1600;
const CHECKING_START_MS = 1200;
const HARD_TIMEOUT_MS = 3000;
const REDUCED_MOTION_MINIMUM_MS = 300;

export function cancelLoaderWork(
  work: LoaderScheduledWork,
  cancelAnimationFrame: (handle: number) => void,
  clearTimeout: (handle: number) => void,
): void {
  if (work.animationFrame !== null) {
    cancelAnimationFrame(work.animationFrame);
    work.animationFrame = null;
  }

  if (work.completionTimer !== null) {
    clearTimeout(work.completionTimer);
    work.completionTimer = null;
  }
}

export function resolveLoaderPhase({
  elapsedMs,
  fontsReady,
  imageReady,
  rendererReady,
  reducedMotion,
}: LoaderStateInput): LoaderPhase {
  if (reducedMotion) {
    return elapsedMs >= REDUCED_MOTION_MINIMUM_MS ? "complete" : "drawing";
  }

  if (elapsedMs >= HARD_TIMEOUT_MS) {
    return "complete";
  }

  const assetsReady = fontsReady && imageReady && rendererReady;

  if (assetsReady && elapsedMs >= DRAWING_MINIMUM_MS) {
    return "complete";
  }

  if (!assetsReady && elapsedMs >= CHECKING_START_MS) {
    return "checking";
  }

  return "drawing";
}
