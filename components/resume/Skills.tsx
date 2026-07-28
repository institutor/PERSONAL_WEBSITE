import { liveStack, skills } from "@/lib/resume-data";
import { HandHeading } from "./ornaments/HandHeading";

/** Rough-chip cloud. Chips fade up via CSS scroll-timeline (Phase 2). */
export function Skills() {
  return (
    <section data-section="skills" className="mx-auto max-w-4xl px-6 py-24">
      <HandHeading eyebrow="the toolbox">Skills</HandHeading>

      <div className="space-y-8">
        {Object.entries(skills).map(([group, items]) => (
          <div key={group}>
            <h3 className="font-note mb-3 text-2xl text-ink-muted">{group}</h3>
            <ul className="flex flex-wrap gap-2.5">
              {items.map((item) => (
                <li
                  key={item}
                  className={`rounded-md border-2 px-3.5 py-1.5 text-sm font-medium ${
                    liveStack.includes(item)
                      ? "border-accent text-accent"
                      : "border-ink-faint"
                  }`}
                  data-chip
                  data-live-stack={liveStack.includes(item) ? "" : undefined}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="font-note mt-6 text-xl text-accent" data-margin-note>
        ← you&apos;re looking at some of these right now
      </p>
    </section>
  );
}
