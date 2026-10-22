import { Mark } from "./Mark";

const NAV = [
  ["TRAJECTORY", "#trajectory"],
  ["EXPERIENCE", "#experience"],
  ["AWARDS", "#awards"],
  ["SKILLS", "#skills"],
  ["LEADERSHIP", "#leadership"],
  ["CONTACT", "#contact"],
] as const;

/**
 * Fixed top chrome — the mark (block J, back to top) and navigation;
 * blend-difference inverts it over any band. Profile links live in the
 * bottom bar and the contact section, so they aren't repeated up here.
 */
export function TopBar() {
  return (
    <header className="chrome fixed inset-x-0 top-0 z-40 flex items-center gap-5 px-4 py-3 sm:px-6">
      <a
        href="#hero"
        aria-label="Jiewen Huang, back to the top"
        className="block h-[18px] shrink-0 opacity-90 transition-opacity hover:opacity-100"
      >
        <Mark className="h-full w-auto" />
      </a>
      <nav aria-label="Sections" className="flex gap-4 text-[10px] font-medium tracking-[0.12em]">
        {NAV.map(([label, href]) => (
          <a key={href} href={href} className="hidden opacity-80 transition-opacity hover:opacity-100 md:inline">
            {label}
          </a>
        ))}
        <span className="md:hidden text-[10px] tracking-[0.14em]">JIEWEN HUANG · PORTFOLIO</span>
      </nav>
    </header>
  );
}
