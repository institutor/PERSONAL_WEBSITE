import { experience } from "@/lib/resume-data";
import { SectionHeading } from "./SectionHeading";

/** The centerpiece: period rail left, work right; featured entry gets the panel + telemetry stats. */
export function Experience() {
  return (
    <section data-section="experience" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading index="02" label="Experience" title="Things that shipped" kx="65%" ky="45%" />

      <div className="divide-y divide-faint border-t border-faint">
        {experience.map((job) => (
          <article
            key={job.company}
            className="grid gap-6 py-12 md:grid-cols-[200px_1fr]"
            data-vt
          >
            <div>
              <p className="font-mono text-xs tracking-wider text-muted">{job.period}</p>
              <p className="microlabel mt-2">{job.location}</p>
            </div>

            <div className={job.featured ? "panel -m-6 p-6 md:-m-8 md:p-8" : undefined}>
              <h3 className="font-display text-2xl font-semibold sm:text-3xl">
                {job.company}
              </h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-ion">
                {job.role}
              </p>

              <ul className="mt-6 max-w-2xl space-y-3 text-sm leading-relaxed text-muted">
                {job.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[2px] text-ion">
                      —
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {job.stats && (
                <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-faint pt-6 sm:grid-cols-4">
                  {job.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="sr-only">{s.label}</dt>
                      <dd className="font-mono text-3xl text-star" data-stat>
                        {s.value}
                      </dd>
                      <dd className="microlabel mt-1.5">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {job.tech && (
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
                  {job.tech.map((t) => (
                    <li
                      key={t}
                      className="border border-faint px-2 py-0.5 font-mono text-[11px] tracking-wider text-muted"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
