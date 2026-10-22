/**
 * A ring of radius r unrolling into a straight line along its bottom while
 * keeping its length (2πr). At u = 0 it is the closed circle centred on
 * (cx, cy) with its seam at 12 o'clock; as u grows the curvature falls
 * (radius r / (1 − u)), the seam opens, and at u = 1 it lies flat on
 * y = cy + r, centred on cx. The bottom point never moves. y is down.
 */

export function unrollPoints(u: number, r: number, cx: number, cy: number, n = 96): Array<[number, number]> {
  const L = 2 * Math.PI * r;
  const k = (1 - Math.min(1, Math.max(0, u))) / r; // curvature
  const baseY = cy + r;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const s = -L / 2 + (L * i) / n; // arc length from the bottom point
    if (k < 1e-9) {
      pts.push([cx + s, baseY]);
    } else {
      const R = 1 / k;
      const phi = s * k;
      pts.push([cx + R * Math.sin(phi), baseY - R * (1 - Math.cos(phi))]);
    }
  }
  return pts;
}

export function unrollPath(u: number, r: number, cx: number, cy: number, n = 96): string {
  return unrollPoints(u, r, cx, cy, n)
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join("");
}
