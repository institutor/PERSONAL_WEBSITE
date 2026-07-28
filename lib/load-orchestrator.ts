/**
 * Aggregates every real wait behind the loader into one monotonic 0..1
 * display value (plan Phase-4 mechanics):
 *
 *  - fixed task weights → the aggregate can never move backwards
 *  - ratcheted, exponentially-smoothed display
 *  - min(smoothed, elapsed/MIN_MS) IS the minimum-display-time mechanism:
 *    a warm-cache load takes exactly MIN_MS, a slow one tracks reality
 *  - BAIL_MS forces completion so a wedged task can't strand the loader
 *
 * Module singleton; set() is a max() so StrictMode double-mounts are no-ops.
 */

export type LoadTask = "fonts" | "chunk" | "textures" | "compile";

const WEIGHTS: Record<LoadTask, number> = {
  fonts: 0.2,
  chunk: 0.2,
  textures: 0.45,
  compile: 0.15,
};

const MIN_MS = 1600;
const BAIL_MS = 6000;

class LoadOrchestrator {
  private progress: Record<LoadTask, number> = {
    fonts: 0,
    chunk: 0,
    textures: 0,
    compile: 0,
  };
  private startedAt = 0;
  private smooth = 0;
  private ratchet = 0;
  skipped = false;

  set(task: LoadTask, value: number): void {
    this.progress[task] = Math.max(this.progress[task], Math.min(1, value));
  }

  /** Mark every task complete (fallback paths with no WebGL, skip, etc.). */
  completeAll(): void {
    for (const k of Object.keys(this.progress) as LoadTask[]) {
      this.progress[k] = 1;
    }
  }

  get raw(): number {
    let total = 0;
    for (const [task, w] of Object.entries(WEIGHTS) as [LoadTask, number][]) {
      total += w * this.progress[task];
    }
    return total;
  }

  get done(): boolean {
    return this.raw >= 0.999;
  }

  /** Advance smoothing by dt seconds and return the value to render. */
  display(dt: number): number {
    if (!this.startedAt) this.startedAt = performance.now();
    const elapsed = performance.now() - this.startedAt;
    if (this.skipped || elapsed > BAIL_MS) return 1;

    this.smooth += (this.raw - this.smooth) * Math.min(1, dt * 5);
    const value = Math.min(this.smooth, elapsed / MIN_MS, 0.995);
    this.ratchet = Math.max(this.ratchet, value);
    // the explicit "all done" gate lets us reach a true 1.0
    if (this.done && this.ratchet > 0.98 && elapsed >= MIN_MS) return 1;
    return this.ratchet;
  }
}

export const orchestrator = new LoadOrchestrator();
