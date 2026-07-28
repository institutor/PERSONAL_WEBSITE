import { journey } from "@/lib/resume-data";
import { HandHeading } from "./ornaments/HandHeading";

/**
 * Stuyvesant → QuestBridge → Columbia. Phase 1-2 draw the connecting rough
 * scrawl line ([data-journey-line]) and station circles.
 */
export function Journey() {
  return (
    <section data-section="journey" className="mx-auto max-w-4xl px-6 py-24">
      <HandHeading eyebrow="the path so far">Journey</HandHeading>

      <ol className="relative grid gap-10 sm:grid-cols-3" data-journey-line>
        {journey.map((stop) => (
          <li key={stop.title} className="relative">
            <p className="font-note text-xl text-accent" aria-hidden="true">
              {stop.note}
            </p>
            <h3 className="font-hand mt-1 text-2xl font-semibold" data-station>
              {stop.title}
            </h3>
            <p className="mt-2 text-sm text-ink-muted">{stop.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
