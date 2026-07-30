import {
  awards,
  colophon,
  experience,
  identity,
  journey,
  leadership,
  programs,
  sciolyMedals,
  skills,
  liveStack,
  teaching,
} from "@/lib/resume-data";
import { Band } from "./Band";
import { Hero } from "./Hero";
import { BackTicker, GapTitle } from "./Titles";

/* -------------------------------------------------------------- sweeps -- */

function Sweeps() {
  return (
    <section data-band className="band-ink relative overflow-hidden py-36 sm:py-44">
      <p
        data-sweep="34"
        className="display relative z-10 whitespace-nowrap text-[clamp(4.5rem,15vw,14rem)]"
        aria-hidden="true"
      >
        SHIPPING
      </p>
      <div className="my-10 h-[3px] w-full bg-bone" aria-hidden="true" />
      <p
        data-sweep="-38"
        className="display outline-text relative z-10 whitespace-nowrap text-right text-[clamp(4.5rem,15vw,14rem)]"
        aria-hidden="true"
      >
        SUNSET PARK → MORNINGSIDE HEIGHTS
      </p>
      <p className="sr-only">Shipping. Sunset Park to Morningside Heights.</p>
    </section>
  );
}

/* ---------------------------------------------------------------- 01 ---- */

function Trajectory() {
  return (
    <Band id="trajectory" className="min-h-svh">
      <BackTicker word="TRAJECTORY" posClass="top-[4%]" />
      {/* the square becomes the missing O */}
      <GapTitle
        text="TRAJECTORY"
        gapIndex={7}
        index="01 · the path"
        window="early"
        hold={1.8}
        className="relative z-10"
      />

      {/* the square swells huge behind the itinerary, then shrinks */}
      <span
        data-sq-slot
        className="pointer-events-none absolute right-[8%] top-[74%] h-[36vh] w-[36vh]"
        aria-hidden="true"
      />

      {/* the itinerary: one departure, one arrival, the match as the route */}
      <div className="relative z-10 pt-24">
        <div data-scrub-rise data-window="early">
          <p className="lbl mb-2 opacity-60">{journey.from.label}</p>
          <p className="display text-[clamp(2.6rem,7vw,6.5rem)]">{journey.from.title}</p>
          <p className="bodycol mt-3 opacity-75">{journey.from.detail}</p>
        </div>

        <div className="my-16 flex items-center gap-5" data-scrub-rise data-window="mid">
          <span className="h-[3px] w-10 bg-bone sm:w-24" aria-hidden="true" />
          <p className="lbl whitespace-nowrap opacity-80">{journey.via}</p>
          <span className="h-[3px] flex-1 bg-bone" aria-hidden="true" />
          <span className="lbl opacity-70" aria-hidden="true">
            ▶
          </span>
        </div>

        <div className="text-right" data-scrub-rise data-window="late">
          <p className="lbl mb-2 opacity-60">{journey.to.label}</p>
          <p className="display text-[clamp(2.6rem,7vw,6.5rem)]">{journey.to.title}</p>
          <p className="bodycol ml-auto mt-3 opacity-75">{journey.to.detail}</p>
        </div>
      </div>
    </Band>
  );
}

/* ------------------------------------------------- 02 · horizontal ------ */

function ExperienceHorizontal() {
  const [naomi, fed10, o2] = experience;
  return (
    <section id="experience" data-band data-hsection className="band-ink relative overflow-hidden">
      <BackTicker word="EXPERIENCE" posClass="top-[6%]" />

      <div data-htrack className="relative z-10 flex h-svh w-max items-center">
        {/* panel 0 — chapter head; the square becomes the missing N and
            rides sideways inside the word while the page scrolls sideways */}
        <div className="relative flex h-full w-[70vw] shrink-0 flex-col justify-center px-6 sm:px-10">
          <GapTitle
            text="EXPERIENCE"
            gapIndex={7}
            index="02 · shipped"
            window="early"
            sqRide
            sizeClass="text-[clamp(3rem,9.5vw,9rem)]"
          />
          <p className="statement mt-8 max-w-xl text-[clamp(1.4rem,2.6vw,2.4rem)] opacity-90">
            What I build reaches production.
          </p>
        </div>

        {/* panel 1 — NaomiAI: the filled panel */}
        <div className="relative m-6 flex w-[84vw] shrink-0 flex-col justify-center self-stretch bg-bone px-8 text-ink sm:px-12">
          <div className="lbl flex flex-wrap justify-between gap-2 opacity-80">
            <span>{naomi.company}</span>
            <span>{naomi.role}</span>
            <span>{naomi.period}</span>
          </div>
          <p className="statement mt-8 max-w-3xl text-[clamp(1.8rem,3.6vw,3.4rem)]">
            NaomiAI ELA: a K-8 reading-intervention platform, live for 190 students in the South
            Bronx.
          </p>
          <div className="mt-8 flex flex-wrap gap-10">
            {naomi.bullets.slice(1).map((b, i) => (
              <p key={i} className="bodycol opacity-80">
                {b}
              </p>
            ))}
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-14 gap-y-6 border-t border-ink/25 pt-6">
            {naomi.stats?.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-mono text-3xl" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {s.value}
                </dd>
                <dd className="lbl mt-1 opacity-70">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* panel 2 — Fed10: the framed panel */}
        <div className="relative m-6 flex w-[58vw] shrink-0 flex-col justify-center self-stretch border-[3px] border-bone px-8 sm:px-12">
          <p className="lbl opacity-60">
            {fed10.period} · {fed10.location}
          </p>
          <p className="display mt-3 text-[clamp(2.4rem,5vw,4.5rem)]">{fed10.company}</p>
          <p className="lbl mt-2 opacity-80">{fed10.role}</p>
          <div className="mt-6 space-y-4">
            {fed10.bullets.map((b, i) => (
              <p key={i} className="bodycol opacity-80">
                {b}
              </p>
            ))}
          </div>
        </div>

        {/* panel 3 — O2NYC: filled again + tail */}
        <div className="relative m-6 flex w-[58vw] shrink-0 flex-col justify-center self-stretch bg-bone px-8 text-ink sm:px-12">
          <p className="numeral pointer-events-none absolute right-6 top-6 opacity-20" aria-hidden="true">
            O₂
          </p>
          <p className="lbl opacity-60">
            {o2.period} · {o2.location}
          </p>
          <p className="display mt-3 text-[clamp(2.4rem,5vw,4.5rem)]">{o2.company}</p>
          <p className="lbl mt-2 opacity-80">{o2.role}</p>
          <div className="mt-6 space-y-4">
            {o2.bullets.map((b, i) => (
              <p key={i} className="bodycol opacity-80">
                {b}
              </p>
            ))}
          </div>
          <p className="lbl mt-12 opacity-60">← BACK TO VERTICAL</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------- 03-05 · the deck ----- */
/**
 * SAKAZUKI-style card deck: after the horizontal chapter, each remaining
 * section is a full card that slides UP over the previous one — arriving
 * at its own organic angle, slightly inset (never covering the full screen
 * mid-flight), then straightening and locking edge-to-edge. Every card's
 * top edge has a square notch bitten out — the traveling square's mark.
 * The page after the deck (Contact) enters straight and full-width: the
 * bold return to normal flow. Choreography lives in ScrollFx ([data-deck]).
 */
function CardDeck() {
  return (
    <section data-deck data-band className="band-ink relative overflow-hidden">
      {/* base layer: the usual colossal hollow ticker — the same background
          words that ride behind every band, traveling under the cards */}
      <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden" aria-hidden="true">
        <p
          data-mega
          className="display outline-text whitespace-nowrap text-[clamp(9rem,26vw,24rem)] opacity-20 will-change-transform"
        >
          AWARDS · SKILLS · LEADERSHIP · AWARDS · SKILLS
        </p>
      </div>
      <div className="min-h-svh" aria-hidden="true" />

      {/* card 03 — AWARDS, bone */}
      <article
        id="awards"
        data-deck-card
        className="deck-notch relative flex flex-col justify-center bg-bone px-4 py-20 text-ink sm:px-10"
      >
        <GapTitle
          text="AWARDS"
          gapIndex={2}
          index="03 · proof"
          sqSeg={0}
          sqTone="ink"
          sizeClass="text-[clamp(3rem,9.5vw,9rem)]"
        />
        <ul className="mt-12 border-t-[3px] border-ink">
          {awards.map((a) => (
            <li key={a.title} className="flex items-baseline gap-6 border-b border-ink/15 py-3.5" data-card-rise>
              <span className="display w-24 shrink-0 text-2xl">{a.big ?? "·"}</span>
              <span className="statement min-w-0 flex-1 text-lg">
                {a.big ? a.detail : a.title}
                {!a.big && <span className="bodycol ml-3 inline opacity-60">{a.detail}</span>}
              </span>
              <span className="lbl shrink-0 opacity-60">{a.year}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col justify-between gap-8 sm:flex-row" data-card-rise>
          {programs.map((p, i) => (
            <p key={p.name} className={`bodycol ${i === 1 ? "sm:text-right" : ""}`}>
              <strong>
                {p.name} · {p.period}
              </strong>
              {p.detail}
            </p>
          ))}
        </div>
      </article>

      {/* card 04 — STACK, ink with a bone frame */}
      <article
        id="skills"
        data-deck-card
        className="deck-notch relative flex flex-col justify-center bg-ink px-4 py-20 text-bone sm:px-10"
      >
        <div className="pointer-events-none absolute inset-3 border-[3px] border-bone sm:inset-5" aria-hidden="true" />
        <GapTitle
          text="SKILLS"
          gapIndex={2}
          index="04 · instruments"
          sqSeg={1}
          sizeClass="text-[clamp(3rem,9.5vw,9rem)]"
        />

        <div className="mt-12 space-y-7 border-t-[3px] border-bone pt-10">
          {Object.entries(skills).map(([group, items]) => (
            <div key={group} className="grid gap-4 sm:grid-cols-[200px_1fr]" data-card-rise>
              <p className="lbl pt-1.5 opacity-60">{group}</p>
              <ul className="flex flex-wrap gap-2">
                {items.map((item) => {
                  const live = liveStack.includes(item);
                  return (
                    <li key={item} className={`pill ${live ? "font-semibold" : "opacity-70"}`}>
                      {item}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="space-y-4 pt-5" data-card-rise>
            {teaching.map((t) => (
              <p key={t.org} className="bodycol !max-w-xl opacity-75">
                <strong>
                  {t.org} · {t.role}
                </strong>
                {t.detail}
              </p>
            ))}
          </div>
        </div>
      </article>

      {/* card 05 — LEADERSHIP, bone (the deck's finale) */}
      <article
        id="leadership"
        data-deck-card
        className="deck-notch relative flex flex-col justify-center bg-bone px-4 py-20 text-ink sm:px-10"
      >
        <GapTitle
          text="LEADERSHIP"
          gapIndex={8}
          index="05 · teams"
          sqSeg={2}
          sqTone="ink"
          sizeClass="text-[clamp(3rem,9.5vw,9rem)]"
        />
        <div className="mt-12 grid gap-10 border-t-[3px] border-ink pt-9 md:grid-cols-3">
          {leadership.map((entry) => (
            <div key={entry.org} data-card-rise>
              <p className="statement text-2xl">{entry.org}</p>
              <p className="lbl mt-1 opacity-80">{entry.role}</p>
              <p className="lbl mt-1 opacity-50">{entry.period}</p>
              <div className="mt-4 space-y-3">
                {entry.bullets.map((b, bi) => (
                  <p key={bi} className="bodycol opacity-75">
                    {b}
                  </p>
                ))}
              </div>
              {entry.org === "Science Olympiad" && (
                <div className="mt-5 border-t border-ink/20 pt-3">
                  <p className="lbl mb-2 opacity-60">THE MEDAL SHELF · ×11</p>
                  <ul className="space-y-1.5">
                    {sciolyMedals.map((m) => (
                      <li key={m.meet + m.place} className="flex items-baseline gap-3 text-[0.7rem] leading-snug">
                        <span className="display w-[4.6rem] shrink-0 whitespace-nowrap text-sm">{m.place}</span>
                        <span className="opacity-75">
                          <strong className="font-semibold opacity-100">{m.meet}</strong> · {m.events}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </article>

      {/* the shutter: ink slats close BOTTOM-UP over the final card at the
          end of the deck; the pin releases before the top slats finish, so
          the contact page is already arriving while strips of the card
          still show at the top — the reference's exact overlap */}
      <div data-shutter aria-hidden="true" className="pointer-events-none absolute inset-0 z-40">
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            data-shutter-bar
            className="absolute left-0 w-full bg-ink will-change-transform"
            style={{ top: `${(i * 100) / 10}%`, height: `calc(${100 / 10}% + 1px)` }}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- 06 ---- */

function Contact() {
  return (
    <Band id="contact" index="06" paren="( say hi )" className="flex min-h-svh flex-col justify-center pb-32">
      <BackTicker word="CONTACT" posClass="top-[2%]" />
      <div className="relative z-10" data-zoom-in="1.26">
        <p className="display text-[clamp(2.4rem,6vw,5.5rem)]" aria-hidden="true">
          LET&rsquo;S
        </p>

        {/* the finale: the I is knocked out; the traveling square replaces it */}
        <div className="relative" data-knock role="img" aria-label="Build">
          <p className="display -ml-[0.04em] whitespace-nowrap text-[clamp(6rem,19vw,17rem)]" aria-hidden="true">
            {"BUILD".split("").map((ch, i) =>
              i === 2 ? (
                <span key={i} className="relative inline-block w-[0.74em] text-center">
                  <span data-knock-letter className="inline-block will-change-transform">
                    {ch}
                  </span>
                  <span
                    data-sq-slot
                    className="pointer-events-none absolute bottom-[0.05em] left-1/2 h-[0.72em] w-[0.72em] -translate-x-1/2"
                    aria-hidden="true"
                  />
                </span>
              ) : (
                <span key={i} className="inline-block">
                  {ch}
                </span>
              )
            )}
          </p>
        </div>
      </div>

      <div className="mt-16 h-[3px] w-full bg-bone" aria-hidden="true" />

      <div className="mt-20 text-center">
        <a
          href={`mailto:${identity.links.email}`}
          className="statement break-all text-[clamp(1.4rem,4vw,3.4rem)] underline decoration-2 underline-offset-8 transition-opacity hover:opacity-80"
          data-reveal
        >
          {identity.links.email}
        </a>
      </div>

      {/* the only named profile links on the page — the fixed bar keeps
          compact marks, so these stay quiet and let RESUME carry the weight */}
      <div className="mt-10 flex justify-center gap-10" data-reveal>
        <a
          className="lbl underline decoration-1 underline-offset-[6px] opacity-70 transition-opacity hover:opacity-100"
          href={identity.links.github}
          target="_blank"
          rel="noopener noreferrer"
        >
          GITHUB ↗
        </a>
        <a
          className="lbl underline decoration-1 underline-offset-[6px] opacity-70 transition-opacity hover:opacity-100"
          href={identity.links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
        >
          LINKEDIN ↗
        </a>
      </div>

      <div className="mt-20 text-center" data-reveal data-resume-glide>
        <a
          href={identity.links.resumePdf}
          className="display inline-flex items-baseline gap-4 text-[clamp(3rem,9vw,7.5rem)] transition-opacity hover:opacity-85"
        >
          RESUME
          <span className="chevrons" aria-hidden="true">
            <span>▶</span>
            <span>▶</span>
            <span>▶</span>
            <span>▶</span>
            <span>▶</span>
          </span>
        </a>
      </div>

      <p className="lbl mt-24 text-center opacity-50">
        DESIGNED &amp; ENGINEERED BY JIEWEN HUANG · © {new Date().getFullYear()}
      </p>
      <p className="sr-only">{colophon}</p>
    </Band>
  );
}

/* ----------------------------------------------------------------------- */

export function Resume() {
  return (
    <main id="resume-root">
      <Hero />
      <Sweeps />
      <Trajectory />
      <ExperienceHorizontal />
      <CardDeck />
      <Contact />
    </main>
  );
}
