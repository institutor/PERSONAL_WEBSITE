import { teaching } from "@/lib/resume-data";
import { SectionHeading } from "./SectionHeading";

export function Teaching() {
  return (
    <section data-section="teaching" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading index="06" label="Give-back" title="When not shipping" kx="55%" ky="65%" />

      <ul className="divide-y divide-faint border-t border-faint">
        {teaching.map((t) => (
          <li key={t.org} className="grid gap-2 py-6 sm:grid-cols-[220px_1fr]" data-vt>
            <div>
              <h3 className="font-display text-lg font-semibold">{t.org}</h3>
              <p className="microlabel mt-1">{t.role}</p>
            </div>
            <p className="text-sm leading-relaxed text-muted">{t.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
