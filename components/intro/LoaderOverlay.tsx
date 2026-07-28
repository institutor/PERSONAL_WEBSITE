import { LETTERING } from "@/lib/generated/lettering-paths";
import { LoaderFx } from "./LoaderFx";

/**
 * The loading screen: "by Jiewen" in thin monoline script, drawn stroke by
 * stroke in sync with REAL load progress; an ion checkmark strikes through
 * when everything is ready.
 *
 * Server component. Strokes use pathLength=1 normalization so their hidden
 * state is baked into SSR markup — the finished signature can never flash
 * before hydration. LoaderFx (client) drives the animation.
 */
export function LoaderOverlay() {
  const art = LETTERING.signature;
  return (
    <div
      data-loader
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      aria-label="Loading portfolio"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-void"
    >
      <div className="relative">
        <svg
          viewBox={`0 0 ${art.w} ${art.h}`}
          className="w-64 text-star sm:w-80"
          aria-hidden="true"
          focusable="false"
        >
          {art.letters.map((letter, li) =>
            letter.frames[0].map((d, pi) => (
              <path
                key={`${li}-${pi}`}
                d={d}
                pathLength={1}
                fill="none"
                stroke="currentColor"
                strokeWidth={art.sw * 0.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: "1 1.06", strokeDashoffset: 1 }}
                data-sig-path
              />
            ))
          )}
        </svg>

        {/* the checkmark runs THROUGH the signature (original spec) */}
        <svg
          viewBox="0 0 120 70"
          className="absolute left-1/2 top-1/2 w-40 -translate-x-1/2 -translate-y-[55%] text-ion/90 sm:w-52"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M12 38 L44 62 L108 10"
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: "1 1.06", strokeDashoffset: 1 }}
            data-check-path
          />
        </svg>
      </div>

      <p className="microlabel absolute bottom-8 left-6" data-loader-label>
        Initializing
      </p>
      <p className="absolute bottom-8 right-6 font-mono text-xs tracking-[0.3em] text-muted">
        <span data-loader-pct style={{ fontVariantNumeric: "tabular-nums" }}>
          000
        </span>
        %
      </p>
      <button
        type="button"
        data-loader-skip
        className="microlabel absolute right-6 top-6 cursor-pointer transition-colors hover:text-ion"
      >
        Skip →
      </button>

      <LoaderFx />
    </div>
  );
}
