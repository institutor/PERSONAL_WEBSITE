import { teaching } from "@/lib/resume-data";
import { HandHeading } from "./ornaments/HandHeading";
import { Sketch } from "./ornaments/Sketch";

const DOODLE = {
  terminal: "terminal",
  pencil: "pencil",
  note: "musicNote",
} as const;

/**
 * Sketchbook-margin coda — quietest section on the page. Caveat at
 * annotation scale with a tiny drawn doodle per entry.
 */
export function Teaching() {
  return (
    <section data-section="teaching" className="mx-auto max-w-3xl px-6 py-24">
      <HandHeading art="teaching" text="Teaching & Community" eyebrow="when not shipping" />

      <div className="border-l-2 border-ink-faint pl-8" data-margin-rule>
        <ul className="space-y-8">
          {teaching.map((t) => (
            <li key={t.org} className="flex items-start gap-4">
              <Sketch
                name={DOODLE[t.doodle]}
                className="mt-1 w-8 shrink-0 text-ink-muted"
              />
              <div>
                <p className="font-note text-2xl">
                  {t.org} <span className="text-accent">· {t.role}</span>
                </p>
                <p className="mt-1 text-sm text-ink-muted">{t.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
