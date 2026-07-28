import { experience } from "@/lib/resume-data";
import { HandHeading } from "./ornaments/HandHeading";

/**
 * The centerpiece. Featured entry (24/7 Teach / NaomiAI) gets the big card
 * + stat callouts ([data-stat] → SplitText stamp-in, Phase 2).
 */
export function Experience() {
  return (
    <section data-section="experience" className="mx-auto max-w-4xl px-6 py-24">
      <HandHeading eyebrow="things that shipped">Experience</HandHeading>

      <div className="space-y-14">
        {experience.map((job) => (
          <article
            key={job.company}
            className={
              job.featured
                ? "rounded-lg border-2 border-ink bg-paper-2 p-8 sm:p-10"
                : "border-l-2 border-ink-faint pl-6 sm:pl-8"
            }
            data-rough-card={job.featured ? "featured" : undefined}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-hand text-2xl font-semibold sm:text-3xl">
                {job.company}
              </h3>
              <p className="text-sm text-ink-muted">{job.period}</p>
            </div>
            <p className="mt-1 font-medium text-accent" data-role-circle>
              {job.role}
            </p>
            <p className="text-sm text-ink-muted">{job.location}</p>

            <ul className="mt-5 space-y-3">
              {job.bullets.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden="true" className="mt-1 text-accent">
                    –
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {job.stats && (
              <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {job.stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd
                      className="font-hand text-4xl font-bold text-accent"
                      data-stat
                    >
                      {s.value}
                    </dd>
                    <dd className="mt-1 text-xs text-ink-muted">{s.label}</dd>
                  </div>
                ))}
              </dl>
            )}

            {job.tech && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
                {job.tech.map((t) => (
                  <li
                    key={t}
                    className="rounded border border-ink-faint px-2.5 py-0.5 text-xs text-ink-muted"
                    data-tech-underline
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
