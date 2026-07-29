import {
  awards,
  colophon,
  experience,
  identity,
  journey,
  leadership,
  programs,
  skills,
  liveStack,
  teaching,
} from "@/lib/resume-data";
import { Band } from "./Band";
import { Hero } from "./Hero";
import { MegaTitle } from "./MegaTitle";

/* -------------------------------------------------------------- sweeps -- */

function Sweeps() {
  return (
    <section data-band className="band-ink relative overflow-hidden py-36 sm:py-44">
      <p
        data-sweep="34"
        className="display relative z-10 whitespace-nowrap text-[clamp(4.5rem,15vw,14rem)]"
        aria-hidden="true"
      >
        BUILDS THINGS THAT SHIP
      </p>
      <div className="my-10 h-[3px] w-full bg-bone" aria-hidden="true" />
      <p
        data-sweep="-38"
        className="display outline-text relative z-10 whitespace-nowrap text-right text-[clamp(4.5rem,15vw,14rem)]"
        aria-hidden="true"
      >
        BROOKLYN → MORNINGSIDE HEIGHTS
      </p>
      <p className="sr-only">Builds things that ship. Brooklyn to Morningside Heights.</p>

      <span data-sq-slot className="pointer-events-none absolute left-[12%] top-[46%] h-10 w-10" aria-hidden="true" />
    </section>
  );
}

/* ---------------------------------------------------------------- 01 ---- */

function Trajectory() {
  const windows = ["early", "mid", "late"] as const;
  return (
    <Band id="trajectory" className="min-h-svh">
      <MegaTitle text="TRAJECTORY" index="01" />

      <span
        data-sq-slot
        className="pointer-events-none absolute right-[8%] top-[34%] h-[38vh] w-[38vh]"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-14 pt-16">
        {journey.map((stop, i) => (
          <div key={stop.title} data-scrub-rise data-window={windows[i]}>
            <p className="lbl mb-2 opacity-60">
              0{i + 1} — {stop.note}
            </p>
            <p className="display text-[clamp(2.8rem,7.5vw,7rem)]">{stop.title}</p>
            <p className="bodycol mt-3 opacity-75">{stop.detail}</p>
          </div>
        ))}
      </div>
    </Band>
  );
}

/* ------------------------------------------------- 02 · horizontal ------ */

function ExperienceHorizontal() {
  const [naomi, fed10, o2] = experience;
  return (
    <section id="experience" data-band data-hsection className="band-ink relative overflow-hidden">
      {/* massive hollow backdrop traveling behind the panels, full pin long */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[6%] z-0 overflow-hidden"
        aria-hidden="true"
      >
        <p data-mega className="display outline-text whitespace-nowrap text-[clamp(8rem,26vh,16rem)] opacity-30 will-change-transform">
          EXPERIENCE — EXPERIENCE — EXPERIENCE
        </p>
      </div>

      <div data-htrack className="relative z-10 flex h-svh w-max items-center">
        {/* panel 0 — chapter head */}
        <div className="relative flex h-full w-[64vw] shrink-0 flex-col justify-center px-6 sm:px-10">
          <p className="paren mb-6">( 02 — shipped )</p>
          <p className="statement max-w-xl text-[clamp(2rem,4.4vw,4rem)]">
            Two years, three teams, one habit: things reach production.
          </p>
          <p className="lbl mt-10 opacity-60">SCROLL — THE PAGE TURNS SIDEWAYS HERE →</p>
          <span data-sq-slot className="pointer-events-none absolute bottom-[20%] right-[12%] h-8 w-8" aria-hidden="true" />
        </div>

        {/* panel 1 — NaomiAI: the filled panel */}
        <div className="relative m-6 flex w-[84vw] shrink-0 flex-col justify-center self-stretch bg-bone px-8 text-ink sm:px-12">
          <div className="lbl flex flex-wrap justify-between gap-2 opacity-80">
            <span>{naomi.company}</span>
            <span>{naomi.role}</span>
            <span>{naomi.period}</span>
          </div>
          <p className="statement mt-8 max-w-3xl text-[clamp(1.8rem,3.6vw,3.4rem)]">
            NaomiAI ELA — a K-8 reading-intervention platform, live for 190 students in the South
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
            {fed10.period} — {fed10.location}
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
            {o2.period} — {o2.location}
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

/* ---------------------------------------------------------------- 03 ---- */

function Leadership() {
  const windows = ["early", "mid", "late"] as const;
  return (
    <Band id="leadership">
      <MegaTitle text="LEADERSHIP" index="03" lead="outline" />
      <div className="mt-16 grid gap-12 md:grid-cols-3" data-zoom-in>
        {leadership.map((entry, i) => (
          <div key={entry.org} data-scrub-rise data-window={windows[i]}>
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
            {entry.note && <p className="bodycol mt-4 font-semibold">— {entry.note}</p>}
            {entry.org === "Science Olympiad" && (
              <p className="lbl mt-4 opacity-60">MEDALS ×9 — YALE · COLUMBIA · BROWN</p>
            )}
          </div>
        ))}
      </div>
    </Band>
  );
}

/* ---------------------------------------------------------------- 04 ---- */

function Signal() {
  return (
    <Band id="signal">
      <span
        data-sq-slot
        className="pointer-events-none absolute left-[6%] top-[38%] h-24 w-24"
        aria-hidden="true"
      />
      <MegaTitle text="SIGNAL" index="04" />

      <ul className="relative z-10 mt-20">
        {awards.map((a, i) => (
          <li
            key={a.title}
            className="flex items-baseline gap-6 border-t border-bone/15 py-4"
            data-driftx
            data-window={(["early", "mid", "late"] as const)[i % 3]}
          >
            <span className="display w-24 shrink-0 text-2xl">{a.big ?? "—"}</span>
            <span className="statement min-w-0 flex-1 text-lg">
              {a.big ? a.detail : a.title}
              {!a.big && <span className="bodycol ml-3 inline opacity-60">{a.detail}</span>}
            </span>
            <span className="lbl shrink-0 opacity-60">{a.year}</span>
          </li>
        ))}
      </ul>

      <div className="mt-16 flex flex-col justify-between gap-10 sm:flex-row" data-zoom-in>
        {programs.map((p, i) => (
          <p key={p.name} className={`bodycol ${i === 1 ? "sm:text-right" : ""}`}>
            <strong>
              {p.name} — {p.period}
            </strong>
            {p.detail}
          </p>
        ))}
      </div>
    </Band>
  );
}

/* ---------------------------------------------------------------- 05 ---- */

function Stack() {
  return (
    <Band id="stack">
      <MegaTitle text="STACK" index="05" lead="outline" />
      <div className="mt-14 space-y-8" data-zoom-in>
        {Object.entries(skills).map(([group, items]) => (
          <div key={group} className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <p className="lbl pt-1.5 opacity-60">{group}</p>
            <ul className="flex flex-wrap gap-2">
              {items.map((item) => {
                const live = liveStack.includes(item);
                return (
                  <li key={item} className={`pill ${live ? "font-semibold" : "opacity-70"}`}>
                    {live && <span aria-hidden="true">■ </span>}
                    {item}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <p className="lbl pt-2">
          <span data-sq-slot className="mr-2 inline-block h-4 w-4 align-middle" aria-hidden="true" />= RENDERING
          THIS PAGE RIGHT NOW
        </p>

        <div className="space-y-4 pt-8">
          {teaching.map((t) => (
            <p key={t.org} className="bodycol !max-w-xl opacity-75">
              <strong>
                {t.org} — {t.role}
              </strong>
              {t.detail}
            </p>
          ))}
        </div>
      </div>
    </Band>
  );
}

/* ---------------------------------------------------------------- 06 ---- */

function Contact() {
  return (
    <Band id="contact" index="06" paren="( say hi )" className="pb-40">
      <div data-zoom-in="1.14">
        <p className="display text-[clamp(2.4rem,6vw,5.5rem)]" aria-hidden="true">
          LET&rsquo;S
        </p>

        {/* the knockout: the I slides up past the others; the square takes its place */}
        <div className="relative" data-knock role="img" aria-label="Build">
          <p className="display -ml-[0.04em] whitespace-nowrap text-[clamp(7rem,22vw,20rem)]" aria-hidden="true">
            {"BUILD".split("").map((ch, i) =>
              i === 2 ? (
                <span key={i} className="relative inline-block w-[0.62em] text-center">
                  <span data-knock-letter className="inline-block will-change-transform">
                    {ch}
                  </span>
                  <span
                    data-sq-slot
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[0.58em] w-[0.58em] -translate-x-1/2 -translate-y-[54%]"
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

      <div className="mt-20 text-center" data-reveal>
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
        DESIGNED &amp; ENGINEERED BY JIEWEN HUANG — NEXT.JS · THREE.JS · GSAP · ©{" "}
        {new Date().getFullYear()}
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
      <Leadership />
      <Signal />
      <Stack />
      <Contact />
    </main>
  );
}
