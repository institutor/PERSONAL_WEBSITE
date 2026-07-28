import { liveStack, skills } from "@/lib/resume-data";
import { SectionHeading } from "./SectionHeading";

export function Skills() {
  return (
    <section data-section="skills" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading index="05" label="Stack" title="Instruments" kx="15%" ky="85%" />

      <div className="space-y-8 border-t border-faint pt-10">
        {Object.entries(skills).map(([group, items]) => (
          <div key={group} className="grid gap-3 sm:grid-cols-[220px_1fr]">
            <h3 className="microlabel pt-1.5">{group}</h3>
            <ul className="flex flex-wrap gap-2">
              {items.map((item) => {
                const live = liveStack.includes(item);
                return (
                  <li
                    key={item}
                    className={`border px-3 py-1 font-mono text-xs tracking-wider ${
                      live ? "border-ion/40 text-ion" : "border-faint text-muted"
                    }`}
                    data-chip
                  >
                    {live && (
                      <span aria-hidden="true" className="mr-1.5 inline-block h-1 w-1 -translate-y-[2px] rounded-full bg-ion" />
                    )}
                    {item}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-8 font-mono text-xs text-ion/80">
        {"// items marked ● are rendering this page right now"}
      </p>
    </section>
  );
}
