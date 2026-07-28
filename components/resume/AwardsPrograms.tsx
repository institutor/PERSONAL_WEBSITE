import { awards, programs } from "@/lib/resume-data";
import { HandHeading } from "./ornaments/HandHeading";
import { Sketch } from "./ornaments/Sketch";

/**
 * Deterministic pin-board rotations — constants, never Math.random
 * (hydration safety, architectural rule #2).
 */
const ROTATIONS = [-2.5, 1.5, -1, 2.5, -2, 1, -1.5] as const;

export function AwardsPrograms() {
  return (
    <section data-section="awards" className="mx-auto max-w-5xl px-6 py-24">
      <HandHeading art="awards" text="Programs & Awards" eyebrow="the trophy wall" />

      <div className="grid gap-12 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h3 className="font-hand mb-6 text-2xl font-semibold">Summers</h3>
          <div className="space-y-8">
            {programs.map((p) => (
              <article key={p.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h4 className="font-hand text-xl font-semibold">{p.name}</h4>
                  <p className="text-xs text-ink-muted">{p.period}</p>
                </div>
                <p className="mt-2 text-sm text-ink-muted">{p.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-hand mb-6 text-2xl font-semibold">Awards</h3>
          <ul className="space-y-4">
            {awards.map((a, i) => (
              <li
                key={a.title}
                className="rough-chip bg-paper-2 px-3 py-2"
                style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)` }}
                data-pin-card
              >
                <div className="flex items-baseline gap-3">
                  {a.big ? (
                    <span
                      className="font-hand text-3xl font-bold text-accent"
                      data-big-place
                    >
                      {a.big}
                    </span>
                  ) : (
                    <Sketch name="star" className="w-4 shrink-0 self-center text-accent" />
                  )}
                  <div>
                    <p className="font-medium leading-snug">
                      {a.big ? a.detail : a.title}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {a.big ? a.year : `${a.detail} · ${a.year}`}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
