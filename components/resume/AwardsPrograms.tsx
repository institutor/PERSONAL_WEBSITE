import { awards, programs } from "@/lib/resume-data";
import { SectionHeading } from "./SectionHeading";

export function AwardsPrograms() {
  return (
    <section data-section="awards" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading index="04" label="Recognition" title="Signal" kx="80%" ky="20%" />

      <div className="grid gap-16 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="microlabel mb-8">Programs</p>
          <div className="space-y-10">
            {programs.map((p) => (
              <article key={p.name} data-vt>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                  <p className="font-mono text-xs text-muted">{p.period}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <p className="microlabel mb-8">Awards</p>
          <ul className="divide-y divide-faint border-t border-faint">
            {awards.map((a) => (
              <li key={a.title} className="flex items-baseline gap-5 py-4" data-vt>
                <span className="w-14 shrink-0 font-mono text-lg text-ion">
                  {a.big ?? "—"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">
                    {a.big ? a.detail : a.title}
                  </p>
                  {!a.big && <p className="mt-0.5 text-xs text-muted">{a.detail}</p>}
                </div>
                <span className="shrink-0 font-mono text-xs text-muted">{a.year}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
