import { leadership } from "@/lib/resume-data";
import { SectionHeading } from "./SectionHeading";

export function Leadership() {
  return (
    <section data-section="leadership" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading index="03" label="Leadership" title="Teams I run with" kx="35%" ky="70%" />

      <div className="grid gap-px overflow-hidden border border-faint bg-faint md:grid-cols-3">
        {leadership.map((entry) => (
          <article key={entry.org} className="bg-void p-8" data-vt>
            <h3 className="font-display text-2xl font-semibold">{entry.org}</h3>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-ion">
              {entry.role}
            </p>
            <p className="microlabel mt-2">{entry.period}</p>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
              {entry.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            {entry.note && (
              <p className="mt-5 font-mono text-xs text-ion/80">
                {"// "}
                {entry.note}
              </p>
            )}
            {entry.org === "Science Olympiad" && (
              <p className="mt-5 font-mono text-xs tracking-wider text-muted" aria-label="9 invitational medals">
                MEDALS <span className="text-ion">×9</span> — YALE · COLUMBIA · BROWN
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
