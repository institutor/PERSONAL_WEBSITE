import { liveStack, skills } from "@/lib/resume-data";
import { HandHeading } from "./ornaments/HandHeading";
import { Sketch } from "./ornaments/Sketch";

/** Rough-chip cloud. Chips fade up via CSS scroll-timeline (Phase 2). */
export function Skills() {
  return (
    <section data-section="skills" className="mx-auto max-w-4xl px-6 py-24">
      <HandHeading art="skills" text="Skills" eyebrow="the toolbox" />

      <div className="space-y-8">
        {Object.entries(skills).map(([group, items]) => (
          <div key={group}>
            <h3 className="font-note mb-3 text-2xl text-ink-muted">{group}</h3>
            <ul className="flex flex-wrap gap-3">
              {items.map((item) => (
                <li
                  key={item}
                  className={`px-2 py-0.5 text-sm font-medium ${
                    liveStack.includes(item)
                      ? "rough-chip-accent text-accent"
                      : "rough-chip"
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

      <p className="font-note mt-8 flex items-center gap-2 text-xl text-accent" data-margin-note>
        <Sketch name="arrowRight" className="w-8 rotate-180" />
        you&apos;re looking at some of these right now
      </p>
    </section>
  );
}
