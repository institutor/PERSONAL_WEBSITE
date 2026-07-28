import { leadership } from "@/lib/resume-data";
import { HandHeading } from "./ornaments/HandHeading";
import { Sketch } from "./ornaments/Sketch";

/** Three-column layout; the 9 medals are a drawn medal shelf (staggered draw-on in Phase 2). */
export function Leadership() {
  return (
    <section data-section="leadership" className="mx-auto max-w-5xl px-6 py-24">
      <HandHeading art="leadership" text="Leadership" eyebrow="teams I run with" />

      <div className="grid gap-10 md:grid-cols-3">
        {leadership.map((entry) => (
          <article key={entry.org} className="relative" data-rough-bracket>
            <h3 className="font-hand text-2xl font-semibold">{entry.org}</h3>
            <p className="mt-0.5 font-medium text-accent">{entry.role}</p>
            <p className="text-xs text-ink-muted">{entry.period}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {entry.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            {entry.note && (
              <p
                className="font-note mt-4 text-lg text-accent -rotate-1"
                data-margin-note
              >
                {entry.note}
              </p>
            )}
            {entry.org === "Science Olympiad" && (
              <div
                className="mt-4 flex gap-2"
                data-medal-shelf
                aria-label="9 invitational medals"
              >
                {Array.from({ length: 9 }, (_, i) => (
                  <Sketch key={i} name="medal" className="w-4 text-accent" />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
