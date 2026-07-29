export interface HandwritingSegment {
  draw: number;
  lift: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function mapHandwritingProgress(
  progress: number,
  segments: HandwritingSegment[],
): number[] {
  const total = segments.reduce(
    (sum, segment) => sum + segment.draw + segment.lift,
    0,
  );
  if (total <= 0) return segments.map(() => 1);

  const clamped = clamp01(progress);
  const eased = 0.5 - 0.5 * Math.cos(Math.PI * clamped);
  const pen = eased * total;
  let cursor = 0;

  return segments.map((segment) => {
    const local = clamp01((pen - cursor) / Math.max(segment.draw, 1));
    cursor += segment.draw + segment.lift;
    return local;
  });
}
