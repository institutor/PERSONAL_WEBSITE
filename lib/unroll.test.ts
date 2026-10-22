import assert from "node:assert/strict";
import test from "node:test";
import { unrollPath, unrollPoints } from "./unroll.ts";

const R = 20;
const CX = 50;
const CY = 40;
const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) <= eps;
const length = (pts: Array<[number, number]>) =>
  pts.slice(1).reduce((sum, [x, y], i) => sum + Math.hypot(x - pts[i][0], y - pts[i][1]), 0);

test("u = 0 is the closed ring centred on (cx, cy)", () => {
  const pts = unrollPoints(0, R, CX, CY);
  for (const [x, y] of pts) assert.ok(close(Math.hypot(x - CX, y - CY), R), `${x},${y} off the ring`);
  const [first, last] = [pts[0], pts[pts.length - 1]];
  assert.ok(close(first[0], last[0]) && close(first[1], last[1]), "the seam is closed");
  assert.ok(close(first[1], CY - R), "the seam sits at 12 o'clock");
});

test("u = 1 is a flat line along the ring's bottom, as long as the ring", () => {
  const pts = unrollPoints(1, R, CX, CY);
  for (const [, y] of pts) assert.ok(close(y, CY + R));
  assert.ok(close(pts[0][0], CX - Math.PI * R));
  assert.ok(close(pts[pts.length - 1][0], CX + Math.PI * R));
});

test("the length never changes while it unrolls", () => {
  for (const u of [0, 0.25, 0.5, 0.75, 0.999, 1]) {
    const L = length(unrollPoints(u, R, CX, CY, 400));
    assert.ok(Math.abs(L - 2 * Math.PI * R) < 0.01, `u ${u}: length ${L}`);
  }
});

test("the bottom of the ring stays put", () => {
  for (const u of [0, 0.3, 0.6, 1]) {
    const pts = unrollPoints(u, R, CX, CY, 96);
    const mid = pts[48];
    assert.ok(close(mid[0], CX) && close(mid[1], CY + R), `u ${u}: ${mid}`);
  }
});

test("unrollPath is an SVG polyline through the points", () => {
  const d = unrollPath(1, R, CX, CY, 2);
  const x0 = CX - Math.PI * R;
  assert.equal(d, `M${x0.toFixed(2)},${(CY + R).toFixed(2)}L${CX.toFixed(2)},${(CY + R).toFixed(2)}L${(CX + Math.PI * R).toFixed(2)},${(CY + R).toFixed(2)}`);
});
