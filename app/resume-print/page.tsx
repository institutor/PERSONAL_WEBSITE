import type { Metadata } from "next";
import {
  awards,
  experience,
  identity,
  journey,
  leadership,
  programs,
  skills,
  teaching,
} from "@/lib/resume-data";

export const metadata: Metadata = {
  title: "Jiewen Huang · Resume",
  robots: { index: false },
};

/**
 * Print-clean resume used ONLY to generate public/Jiewen_Huang_Resume.pdf
 * (Playwright page.pdf at build). Deliberately phone-free — the original
 * PDF contains a phone number the user chose not to publish.
 */
export default function ResumePrint() {
  return (
    <main className="mx-auto max-w-[46rem] bg-white px-10 py-10 font-body text-[13px] leading-relaxed text-neutral-900">
      <header className="border-b border-neutral-300 pb-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">{identity.name}</h1>
        <p className="mt-1 text-neutral-600">
          {identity.location} · {identity.links.email} · linkedin.com/in/jhuang07 · github.com/institutor
        </p>
        <p className="mt-0.5 text-neutral-600">{identity.tagline}</p>
      </header>

      <Section title="Education">
        {[journey.from, journey.to].map((j) => (
          <p key={j.title} className="mt-1">
            <strong>{j.title}</strong>: {j.detail}
          </p>
        ))}
        <p className="mt-1">QuestBridge National College Match Recipient</p>
      </Section>

      <Section title="Experience">
        {experience.map((job) => (
          <div key={job.company} className="mt-3 break-inside-avoid">
            <p>
              <strong>{job.company}</strong> · {job.role} · {job.location}{" "}
              <span className="float-right text-neutral-500">{job.period}</span>
            </p>
            <ul className="ml-4 mt-1 list-disc space-y-0.5">
              {job.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="Leadership & Projects">
        {leadership.map((l) => (
          <div key={l.org} className="mt-3 break-inside-avoid">
            <p>
              <strong>{l.org}</strong> · {l.role}{" "}
              <span className="float-right text-neutral-500">{l.period}</span>
            </p>
            <ul className="ml-4 mt-1 list-disc space-y-0.5">
              {l.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="Programs & Awards">
        {programs.map((p) => (
          <p key={p.name} className="mt-1">
            <strong>{p.name}</strong> ({p.period}): {p.detail}
          </p>
        ))}
        <p className="mt-2">
          {awards.map((a) => `${a.title}: ${a.detail} (${a.year})`).join(" · ")}
        </p>
      </Section>

      <Section title="Teaching & Community">
        {teaching.map((t) => (
          <p key={t.org} className="mt-1">
            <strong>{t.org}</strong> · {t.role}: {t.detail}
          </p>
        ))}
      </Section>

      <Section title="Skills">
        {Object.entries(skills).map(([group, items]) => (
          <p key={group} className="mt-1">
            <strong>{group}:</strong> {items.join(", ")}
          </p>
        ))}
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="border-b border-neutral-200 pb-1 font-display text-sm font-bold uppercase tracking-[0.15em] text-neutral-700">
        {title}
      </h2>
      {children}
    </section>
  );
}
