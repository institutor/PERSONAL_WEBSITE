import { identity } from "@/lib/resume-data";

const NAV = [
  ["TRAJECTORY", "#trajectory"],
  ["EXPERIENCE", "#experience"],
  ["LEADERSHIP", "#leadership"],
  ["SIGNAL", "#signal"],
  ["STACK", "#stack"],
  ["CONTACT", "#contact"],
] as const;

/** Fixed top chrome — blend-difference inverts it over any band. */
export function TopBar() {
  return (
    <header className="chrome fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6">
      <nav aria-label="Sections" className="flex gap-4 text-[10px] font-medium tracking-[0.12em]">
        {NAV.map(([label, href]) => (
          <a key={href} href={href} className="hidden opacity-80 transition-opacity hover:opacity-100 md:inline">
            {label}
          </a>
        ))}
        <span className="md:hidden text-[10px] tracking-[0.14em]">JIEWEN HUANG — PORTFOLIO</span>
      </nav>
      <div className="flex gap-2">
        <a className="pill" href={identity.links.github} target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
        <a className="pill hidden sm:inline-block" href={identity.links.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn ↗
        </a>
      </div>
    </header>
  );
}
