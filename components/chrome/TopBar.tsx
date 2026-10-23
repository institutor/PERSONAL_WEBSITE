import { identity } from "@/lib/resume-data";

/**
 * Fixed top chrome — one quiet line, the place: it pairs with the live New
 * York clock in the bottom bar (where / when). No navigation: the page is a
 * single scroll and the section anchors still work for deep links.
 * Blend-difference inverts it over any band.
 */
export function TopBar() {
  return (
    <header className="chrome fixed inset-x-0 top-0 z-40 flex items-center px-4 py-3 sm:px-6">
      <p className="text-[10px] font-medium tracking-[0.14em] opacity-80">{identity.location.toUpperCase()}</p>
    </header>
  );
}
