import { teaching } from "@/lib/resume-data";
import { HandHeading } from "./ornaments/HandHeading";

/**
 * Sketchbook-margin coda — quietest section on the page. Set mostly in
 * Caveat at annotation scale, with tiny doodles per entry (Phase 1).
 */
export function Teaching() {
  return (
    <section data-section="teaching" className="mx-auto max-w-3xl px-6 py-24">
      <HandHeading eyebrow="when not shipping">Teaching &amp; Community</HandHeading>

      <div className="border-l-2 border-ink-faint pl-8" data-margin-rule>
        <ul className="space-y-8">
          {teaching.map((t) => (
            <li key={t.org}>
              <p className="font-note text-2xl" data-doodle={t.doodle}>
                {t.org} <span className="text-accent">· {t.role}</span>
              </p>
              <p className="mt-1 text-sm text-ink-muted">{t.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
