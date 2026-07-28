"use client";

type Theme = "light" | "dark";

/**
 * Theme toggle. The sun/moon artwork arrives as server-rendered children
 * (drawn Sketch SVGs) — CSS shows the right one per html[data-theme], so
 * this client component ships zero sketch data and needs no state.
 */
export function ThemeToggle({ children }: { children: React.ReactNode }) {
  function toggle() {
    const current = (document.documentElement.dataset.theme as Theme) ?? "dark";
    const next: Theme = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // private mode etc. — theme still applies for this page view
    }
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="fixed right-5 top-5 z-40 flex h-11 w-11 items-center justify-center rounded-full text-ink transition-transform hover:-rotate-12"
      data-theme-toggle
    >
      {children}
    </button>
  );
}
