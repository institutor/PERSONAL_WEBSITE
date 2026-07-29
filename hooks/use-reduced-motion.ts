"use client";

import { useEffect, useState } from "react";

const mediaQuery = "(prefers-reduced-motion: reduce)";

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

export function subscribeToMediaQueryChanges(
  media: MediaQueryList,
  callback: () => void,
): () => void {
  const listener = () => callback();

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }

  const legacyMedia = media as LegacyMediaQueryList;
  legacyMedia.addListener?.(listener);
  return () => legacyMedia.removeListener?.(listener);
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia(mediaQuery);
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    return subscribeToMediaQueryChanges(media, updatePreference);
  }, []);

  return reducedMotion;
}
