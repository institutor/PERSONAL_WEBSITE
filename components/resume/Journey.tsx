import { journey } from "@/lib/resume-data";
import { HandHeading } from "./ornaments/HandHeading";
import { Sketch } from "./ornaments/Sketch";

/**
 * Stuyvesant → QuestBridge → Columbia. The connecting scrawl line gets the
 * one scrubbed DrawSVG in Phase 2 ([data-journey-line]).
 */
export function Journey() {
  return (
    <section data-section="journey" className="mx-auto max-w-4xl px-6 py-24">
      <HandHeading art="journey" text="Journey" eyebrow="the path so far" />

      <div className="relative">
        <Sketch
          name="journeyLine"
          className="absolute -top-6 left-0 hidden w-full text-ink-faint sm:block"
          draw
        />
        <ol className="relative grid gap-10 pt-4 sm:grid-cols-3" data-journey-line>
          {journey.map((stop) => (
            <li key={stop.title} className="relative">
              <div className="flex items-center gap-3">
                <Sketch name="station" className="w-5 shrink-0 text-accent" />
                <p className="font-note text-xl text-accent" aria-hidden="true">
                  {stop.note}
                </p>
              </div>
              <h3 className="font-hand mt-2 text-2xl font-semibold" data-station>
                {stop.title}
              </h3>
              <p className="mt-2 text-sm text-ink-muted">{stop.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
