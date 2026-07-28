import { journey } from "@/lib/resume-data";
import { SectionHeading } from "./SectionHeading";

/** Stuyvesant → QuestBridge → Columbia as a three-node trajectory rail. */
export function Journey() {
  return (
    <section data-section="journey" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading index="01" label="Trajectory" title="The path" kx="20%" ky="30%" />

      <ol className="relative grid gap-12 border-t border-faint pt-10 sm:grid-cols-3 sm:gap-8">
        {journey.map((stop, i) => (
          <li key={stop.title} className="relative" data-vt>
            <span
              aria-hidden="true"
              className="absolute -top-[2.6rem] left-0 h-1.5 w-1.5 rounded-full bg-ion"
            />
            <p className="microlabel">{String(i + 1).padStart(2, "0")} — {stop.note}</p>
            <h3 className="mt-3 font-display text-2xl font-semibold">{stop.title}</h3>
            <p className="mt-2 text-sm text-muted">{stop.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
