/**
 * Top ink progress bar, driven entirely by CSS scroll-timeline (zero JS,
 * off-main-thread). Browsers without support simply don't show it.
 */
export function ProgressInk() {
  return (
    <div
      className="progress-ink fixed inset-x-0 top-0 z-50 h-px bg-ion"
      aria-hidden="true"
    />
  );
}
