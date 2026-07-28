import { Sawtooth } from "@/components/fx/Sawtooth";
import {
  awards,
  colophon,
  experience,
  identity,
  journey,
  leadership,
  liveStack,
  programs,
  skills,
  teaching,
} from "@/lib/resume-data";
import { Band } from "./Band";
import { BrokenWord } from "./BrokenWord";
import { Hero } from "./Hero";

/* ------------------------------------------------------------------ 01 -- */

function Trajectory() {
  return (
    <Band
      id="trajectory"
      tone="bone"
      index="01"
      paren="( the path )"
      topRow={["STUYVESANT '26", "QUESTBRIDGE MATCH", "COLUMBIA '30"]}
      shapes="a"
    >
      <p className="statement max-w-3xl text-[clamp(2rem,4.6vw,4rem)]" data-reveal>
        Stuyvesant to Columbia, the long way up.
      </p>

      <div className="mt-20 grid gap-12 sm:grid-cols-3">
        {journey.map((stop, i) => (
          <div key={stop.title} data-reveal>
            <p className="lbl opacity-70">
              0{i + 1} — {stop.note}
            </p>
            <p className="statement mt-3 text-2xl">{stop.title}</p>
            <p className="bodycol mt-2 opacity-80">{stop.detail}</p>
          </div>
        ))}
      </div>
    </Band>
  );
}

/* ------------------------------------------------------------------ 02 -- */

function Experience() {
  const featured = experience[0];
  const rest = experience.slice(1);
  return (
    <Band
      id="experience"
      tone="ink"
      index="02"
      paren="( shipped )"
      topRow={["ENGINEER", "2025 — PRESENT", "NEW YORK / SF"]}
      shapes="b"
    >
      <BrokenWord
        label="Experience"
        rows={[
          { text: "EXPE", bleed: "left", travel: 5 },
          { text: "RIENCE", bleed: "right", travel: -5 },
        ]}
      />

      {/* featured: the voltage panel with a diamond notch (motion-study #19) */}
      <div className="relative mt-24 bg-volt px-6 py-10 text-bone sm:px-10 sm:py-12" data-reveal>
        <div
          aria-hidden="true"
          className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 bg-ink"
        />
        <div className="lbl flex flex-wrap justify-between gap-2 opacity-90">
          <span>{featured.company}</span>
          <span>{featured.role}</span>
          <span>{featured.period}</span>
        </div>
        <p className="statement mt-8 max-w-3xl text-[clamp(1.6rem,3.4vw,3rem)]">
          NaomiAI ELA — a K-8 reading-intervention platform, live for 190 students in the South
          Bronx.
        </p>
        <div className="mt-8 flex flex-wrap gap-10">
          {featured.bullets.slice(1).map((b, i) => (
            <p key={i} className="bodycol opacity-90">
              {b}
            </p>
          ))}
        </div>
        <dl className="mt-10 flex flex-wrap gap-x-14 gap-y-6 border-t border-bone/25 pt-6">
          {featured.stats?.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-mono text-3xl" style={{ fontVariantNumeric: "tabular-nums" }}>
                {s.value}
              </dd>
              <dd className="lbl mt-1 opacity-80">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-16 flex flex-col justify-between gap-12 sm:flex-row">
        {rest.map((job, i) => (
          <div key={job.company} className={i === 1 ? "sm:text-right" : undefined} data-reveal>
            <p className="lbl opacity-70">
              {job.period} — {job.location}
            </p>
            <p className="statement mt-2 text-2xl">{job.company}</p>
            <p className="lbl mt-1 text-volt brightness-150">{job.role}</p>
            <div className={`mt-4 space-y-3 ${i === 1 ? "sm:ml-auto" : ""}`}>
              {job.bullets.map((b, bi) => (
                <p key={bi} className={`bodycol opacity-80 ${i === 1 ? "sm:ml-auto" : ""}`}>
                  {b}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Band>
  );
}

/* ------------------------------------------------------------------ 03 -- */

function Leadership() {
  return (
    <Band
      id="leadership"
      tone="bone"
      index="03"
      paren="( teams )"
      topRow={["STUYCAST", "STUDENT CAUCUS", "SCIENCE OLYMPIAD"]}
      shapes="c"
    >
      <p className="statement max-w-3xl text-[clamp(2rem,4.6vw,4rem)]" data-reveal>
        Someone has to sweat the details.
      </p>

      <div className="mt-20 grid gap-12 md:grid-cols-3">
        {leadership.map((entry) => (
          <div key={entry.org} data-reveal>
            <p className="statement text-2xl">{entry.org}</p>
            <p className="lbl mt-1 text-volt">{entry.role}</p>
            <p className="lbl mt-1 opacity-60">{entry.period}</p>
            <div className="mt-4 space-y-3">
              {entry.bullets.map((b, i) => (
                <p key={i} className="bodycol opacity-80">
                  {b}
                </p>
              ))}
            </div>
            {entry.note && <p className="bodycol mt-4 font-medium text-volt">— {entry.note}</p>}
            {entry.org === "Science Olympiad" && (
              <p className="lbl mt-4 opacity-70">MEDALS ×9 — YALE · COLUMBIA · BROWN</p>
            )}
          </div>
        ))}
      </div>
    </Band>
  );
}

/* ------------------------------------------------------------------ 04 -- */

function Signal() {
  return (
    <Band
      id="signal"
      tone="ink"
      index="04"
      paren="( proof )"
      topRow={["AWARDS", "PROGRAMS", "2023 — 2026"]}
      shapes="a"
    >
      <BrokenWord
        label="Signal"
        rows={[
          { text: "SIG", bleed: "left", travel: 4 },
          { text: "NAL", bleed: "right", travel: -4 },
        ]}
      />

      <ul className="mt-24">
        {awards.map((a) => (
          <li
            key={a.title}
            className="flex items-baseline gap-6 border-t border-bone/15 py-4"
            data-reveal
          >
            <span className="display w-24 shrink-0 text-2xl text-volt brightness-150">
              {a.big ?? "—"}
            </span>
            <span className="statement min-w-0 flex-1 text-lg">
              {a.big ? a.detail : a.title}
              {!a.big && <span className="bodycol ml-3 inline opacity-60">{a.detail}</span>}
            </span>
            <span className="lbl shrink-0 opacity-60">{a.year}</span>
          </li>
        ))}
      </ul>

      <div className="mt-16 flex flex-col justify-between gap-10 sm:flex-row">
        {programs.map((p, i) => (
          <p key={p.name} className={`bodycol ${i === 1 ? "sm:text-right" : ""}`} data-reveal>
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

/* ------------------------------------------------------------------ 05 -- */

function Stack() {
  return (
    <Band
      id="stack"
      tone="bone"
      index="05"
      paren="( instruments )"
      topRow={["LANGUAGES", "FRAMEWORKS", "PLATFORMS"]}
      shapes="b"
    >
      <div className="space-y-10">
        {Object.entries(skills).map(([group, items]) => (
          <div key={group} className="grid gap-4 sm:grid-cols-[200px_1fr]" data-reveal>
            <p className="lbl pt-1.5 opacity-70">{group}</p>
            <ul className="flex flex-wrap gap-2">
              {items.map((item) => {
                const live = liveStack.includes(item);
                return (
                  <li key={item} className={`pill ${live ? "border-volt text-volt" : ""}`}>
                    {live && <span aria-hidden="true">■ </span>}
                    {item}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="lbl mt-12 text-volt" data-reveal>
        ■ = RENDERING THIS PAGE RIGHT NOW
      </p>

      <div className="mt-20 space-y-4">
        {teaching.map((t) => (
          <p key={t.org} className="bodycol !max-w-xl opacity-80" data-reveal>
            <strong>
              {t.org} — {t.role}
            </strong>
            {t.detail}
          </p>
        ))}
      </div>
    </Band>
  );
}

/* ------------------------------------------------------------------ 06 -- */

function Contact() {
  return (
    <Band
      id="contact"
      tone="ink"
      index="06"
      paren="( say hi )"
      topRow={["OPEN TO", "INTERNSHIPS", "SUMMER 2027"]}
      shapes="c"
      className="pb-36"
    >
      <BrokenWord
        label="Let's build"
        rows={[
          { text: "LET'S", bleed: "left", travel: 5 },
          { text: "BUILD", bleed: "right", travel: -5, glyphAt: 2 },
        ]}
      />

      <div className="mt-24 text-center">
        <a
          href={`mailto:${identity.links.email}`}
          className="statement break-all text-[clamp(1.4rem,4.2vw,3.6rem)] underline decoration-volt decoration-4 underline-offset-8 transition-opacity hover:opacity-80"
          data-reveal
        >
          {identity.links.email}
        </a>
      </div>

      <div className="mt-24 text-center" data-reveal>
        <a
          href={identity.links.resumePdf}
          className="display inline-flex items-baseline gap-4 text-[clamp(3rem,9vw,7.5rem)] transition-opacity hover:opacity-85"
        >
          RESUME
          <span className="chevrons text-volt" aria-hidden="true">
            <span>▶</span>
            <span>▶</span>
            <span>▶</span>
            <span>▶</span>
            <span>▶</span>
          </span>
        </a>
      </div>

      <div className="mt-20">
        <Sawtooth color="volt" height={14} reverse />
      </div>

      <p className="lbl mt-10 text-center opacity-60">
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
      <Trajectory />
      <Experience />
      <Leadership />
      <Signal />
      <Stack />
      <Contact />
    </main>
  );
}
