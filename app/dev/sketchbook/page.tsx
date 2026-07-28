import { LETTERING, type LetteringName } from "@/lib/generated/lettering-paths";
import { SKETCHES, type SketchName } from "@/lib/generated/sketch-paths";
import { HandHeading } from "@/components/resume/ornaments/HandHeading";
import { Lettering } from "@/components/resume/ornaments/Lettering";
import { Sketch } from "@/components/resume/ornaments/Sketch";

export const metadata = { title: "sketchbook — by Jiewen", robots: { index: false } };

/**
 * Hidden dev gallery: every generated ornament + lettering in both themes.
 * The regression surface for the whole hand-drawn system — kept forever.
 */
function Panel({ theme }: { theme: "light" | "dark" }) {
  return (
    <div className={`theme-${theme} bg-paper p-10 text-ink`} style={{ background: "var(--paper)", color: "var(--ink)" }}>
      <h2 className="font-hand mb-8 text-3xl font-bold">{theme}</h2>

      <h3 className="font-note mb-4 text-2xl text-accent">lettering (real drawn strokes)</h3>
      <div className="space-y-6">
        {(Object.keys(LETTERING) as LetteringName[]).map((name) => (
          <div key={name}>
            <p className="mb-1 text-xs" style={{ color: "var(--ink-muted)" }}>{name}</p>
            <Lettering name={name} className={name === "name" ? "w-full max-w-2xl" : "w-full max-w-sm"} />
          </div>
        ))}
      </div>

      <h3 className="font-note mb-4 mt-10 text-2xl text-accent">ornaments</h3>
      <div className="grid grid-cols-3 gap-6 sm:grid-cols-4">
        {(Object.keys(SKETCHES) as SketchName[]).map((name) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-full items-center justify-center">
              <Sketch name={name} className="max-h-16 w-auto max-w-full" />
            </div>
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{name}</p>
          </div>
        ))}
      </div>

      <h3 className="font-note mb-4 mt-10 text-2xl text-accent">boxes & chips</h3>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="rough-box bg-paper-2 px-4 py-1.5 font-hand text-lg">
          rough-box (hover = boil)
        </button>
        <span className="rough-box-accent px-4 py-1.5 font-hand text-lg text-accent">
          rough-box-accent
        </span>
        <span className="rough-chip px-2 py-0.5 text-sm">rough-chip</span>
        <span className="rough-chip-accent px-2 py-0.5 text-sm text-accent">rough-chip-accent</span>
      </div>

      <div className="mt-10">
        <HandHeading art="skills" text="Skills" eyebrow="sample HandHeading" />
      </div>
    </div>
  );
}

export default function Sketchbook() {
  return (
    <main className="grid min-h-svh md:grid-cols-2">
      <Panel theme="light" />
      <Panel theme="dark" />
    </main>
  );
}
