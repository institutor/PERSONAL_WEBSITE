import { LoaderFx } from "./LoaderFx";

/**
 * The loading screen shell: ink overlay, % readout, skip. The animation
 * itself is the v1 preload package (canvas "by Jiewen" + checkmark sweep),
 * mounted by LoaderFx and fed real loading state.
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
      className="fixed inset-0 z-[80] bg-ink text-bone"
    >
      <p className="lbl absolute bottom-8 left-6 opacity-70" data-loader-label>
        Initializing
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
