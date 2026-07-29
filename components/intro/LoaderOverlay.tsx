import Image from "next/image";
import { LoaderFx } from "./LoaderFx";

/**
 * Volumetric Inkfield preloader (from the original prototype, recolored):
 * ink background with two soft bone glows — the only gradient on the whole
 * site, loading only — and the ORIGINAL handmade "by Jiewen" artwork
 * (check-swoosh included) revealed left→right in sync with REAL progress.
 * Exit: slight scale-and-fade, per the prototype.
 */
export function LoaderOverlay() {
  return (
    <div
      data-loader
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      aria-label="Loading portfolio"
      className="fixed inset-0 z-[80] flex items-center justify-center text-bone"
      style={{
        background:
          "radial-gradient(circle at 30% 25%, rgba(232,227,216,0.13), transparent 32%), radial-gradient(circle at 72% 66%, rgba(232,227,216,0.07), transparent 36%), var(--ink)",
      }}
    >
      <Image
        src="/loader/by-jiewen-loader.webp"
        alt=""
        aria-hidden="true"
        width={1904}
        height={826}
        priority
        unoptimized
        data-loader-art
        className="w-[min(72%,620px)] select-none"
        style={{ clipPath: "inset(0 100% 0 0)" }}
      />

      <p className="lbl absolute bottom-8 left-6 opacity-60" data-loader-label>
        Drawing the page / preparing the work
      </p>
      <p className="absolute bottom-8 right-6 font-mono text-xs tracking-[0.3em] opacity-70">
        <span data-loader-pct style={{ fontVariantNumeric: "tabular-nums" }}>
          000
        </span>
        %
      </p>
      <button
        type="button"
        data-loader-skip
        className="lbl absolute right-6 top-6 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
      >
        Skip →
      </button>

      <LoaderFx />
    </div>
  );
}
