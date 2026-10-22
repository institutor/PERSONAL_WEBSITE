/**
 * Letters that part for the travelling shape. Each letter is pushed straight
 * out from the shape's centre until it clears the shape's edge by `pad`
 * (zero outside), and eases back as the shape moves on. Pure functions of
 * the current positions, so the effect is reversible and frame-rate agnostic
 * apart from the settle ease.
 */

export interface Vec {
  x: number;
  y: number;
}

export interface Shape {
  x: number;
  y: number;
  r: number;
}

export const FLOW = {
  padEm: 0.3, // clearance beyond the shape's edge, in letter heights
  ease: 0.2, // settle per frame toward the target offset
  epsilon: 0.05, // px: smaller moves are not written
  squareBoost: 1.1, // a square's corners reach past its half-size
} as const;

/** The offset that moves `point` just outside `shape` (by `pad`); zero when already outside. */
export function repel(point: Vec, shape: Shape, pad: number): Vec {
  const clearance = shape.r + pad;
  if (clearance <= 0) return { x: 0, y: 0 };
  const dx = point.x - shape.x;
  const dy = point.y - shape.y;
  const d = Math.hypot(dx, dy);
  if (d >= clearance) return { x: 0, y: 0 };
  if (d < 1e-6) return { x: 0, y: -clearance }; // dead centre: lift it
  const k = (clearance - d) / d;
  return { x: dx * k, y: dy * k };
}

export function settle(current: number, target: number, ease: number): number {
  return current + (target - current) * ease;
}
