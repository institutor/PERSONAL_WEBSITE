import { identity } from "@/lib/resume-data";

export function Footer() {
  return (
    <footer data-section="footer" className="mx-auto w-full max-w-6xl px-6 pb-14 pt-28">
      <p className="microlabel">07 / Contact</p>

      <a
        href={`mailto:${identity.links.email}`}
        className="knockout mt-5 block break-all font-display text-[clamp(1.6rem,5.2vw,4.5rem)] font-bold tracking-tight transition-opacity hover:opacity-80"
        style={{ "--kx": "40%", "--ky": "60%" } as React.CSSProperties}
      >
        {identity.links.email}
      </a>

      <div className="mt-14 flex flex-wrap items-baseline justify-between gap-6 border-t border-faint pt-6">
        <nav aria-label="Contact" className="flex gap-6 font-mono text-xs tracking-wider">
          <a className="text-muted transition-colors hover:text-ion" href={identity.links.github} target="_blank" rel="noopener noreferrer">
            GITHUB
          </a>
          <a className="text-muted transition-colors hover:text-ion" href={identity.links.linkedin} target="_blank" rel="noopener noreferrer">
            LINKEDIN
          </a>
          <a className="text-muted transition-colors hover:text-ion" href={identity.links.resumePdf}>
            RESUME.PDF
          </a>
        </nav>
        <div className="text-right">
          <p className="font-mono text-[11px] tracking-wider text-muted">
            DESIGNED &amp; ENGINEERED IN THE VOID — NEXT.JS · THREE.JS · GSAP · ©{" "}
            {new Date().getFullYear()} JIEWEN HUANG
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-wider text-muted/70">
            SPACE IMAGERY: &ldquo;COSMIC CLIFFS&rdquo;, CARINA NEBULA — NASA / ESA / CSA / STScI (WEBB)
          </p>
        </div>
      </div>
    </footer>
  );
}
