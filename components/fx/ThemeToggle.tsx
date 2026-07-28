"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Naive Phase-0 toggle: swaps html[data-theme] + persists. Phase 3 replaces
 * the glyphs with generated rough sun/moon art and re-rasterizes bird sprites.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as Theme) ?? "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // private mode etc. — theme still applies for this page view
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="fixed right-5 top-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-paper-2 text-xl transition-transform hover:-rotate-12"
      data-theme-toggle
    >
      <span aria-hidden="true">{theme === "dark" ? "☾" : "☀"}</span>
    </button>
  );
}
