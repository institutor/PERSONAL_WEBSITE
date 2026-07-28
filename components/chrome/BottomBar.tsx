import { identity } from "@/lib/resume-data";
import { Clock } from "./Clock";

/** Fixed bottom chrome: (GH) (IN) (@) · BROOKLYN + live time · RESUME ▶▶▶▶▶ */
export function BottomBar() {
  return (
    <footer className="chrome fixed inset-x-0 bottom-0 z-40 flex items-center justify-between px-4 py-3 text-[11px] font-medium tracking-[0.08em] sm:px-6">
      <nav aria-label="Profiles" className="flex gap-3">
        <a className="opacity-85 transition-opacity hover:opacity-100" href={identity.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          (GH)
        </a>
        <a className="opacity-85 transition-opacity hover:opacity-100" href={identity.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          (IN)
        </a>
        <a className="opacity-85 transition-opacity hover:opacity-100" href={`mailto:${identity.links.email}`} aria-label="Email">
          (@)
        </a>
      </nav>

      <p className="hidden gap-2 sm:flex">
        <span className="tracking-[0.14em]">BROOKLYN,</span> <Clock />
      </p>

      <a href={identity.links.resumePdf} className="flex items-center gap-1.5 tracking-[0.14em]">
        RESUME
        <span className="chevrons" aria-hidden="true">
          <span>▶</span>
          <span>▶</span>
          <span>▶</span>
          <span>▶</span>
          <span>▶</span>
        </span>
      </a>
    </footer>
  );
}
