import { colophon, identity } from "@/lib/resume-data";

/** Bookend: the signature draws once more here (Phase 2); a bird lands on the rule (Phase 3). */
export function Footer() {
  return (
    <footer data-section="footer" className="mx-auto max-w-3xl px-6 pb-16 pt-24 text-center">
      <div className="mb-10 h-[2px] w-full bg-ink-faint" data-final-rule aria-hidden="true" />

      <p className="font-note text-4xl -rotate-2 text-ink" data-signature-footer>
        {identity.signature}
      </p>

      <nav aria-label="Contact" className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
        <a className="underline decoration-ink-faint underline-offset-4 hover:text-accent" href={`mailto:${identity.links.email}`}>
          {identity.links.email}
        </a>
        <a className="underline decoration-ink-faint underline-offset-4 hover:text-accent" href={identity.links.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a className="underline decoration-ink-faint underline-offset-4 hover:text-accent" href={identity.links.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a className="underline decoration-ink-faint underline-offset-4 hover:text-accent" href={identity.links.resumePdf}>
          Resume (PDF)
        </a>
      </nav>

      <p className="mt-10 text-xs text-ink-muted">{colophon}</p>
      <p className="mt-1 text-xs text-ink-muted">
        © {new Date().getFullYear()} Jiewen Huang · {identity.location}
      </p>
    </footer>
  );
}
