import assert from "node:assert/strict";
import test from "node:test";
import {
  LENS,
  actorVisible,
  coverRadius,
  diskATravel,
  lensEnd,
  lensProgress,
  lensRadii,
  oInWindow,
  outerRadius,
  renderRadius,
  smoothstep,
} from "./lens-math.ts";

const close = (x: number, y: number, eps = 1e-6) => Math.abs(x - y) < eps;

test("progress and end of lens", () => {
  assert.equal(lensProgress(100, 154, 1233), 0);
  assert.equal(lensProgress(1233, 154, 1233), 1);
  assert.equal(lensProgress(500, 1000, 1000), 0);
  assert.equal(lensEnd(1617, 768), 1233);
});

test("cover radius reaches the farthest corner", () => {
  assert.ok(close(coverRadius(655, 384, 1024, 768), Math.hypot(655, 384) + 2));
});

test("smoothstep", () => {
  assert.equal(smoothstep(-1), 0);
  assert.equal(smoothstep(0), 0);
  assert.equal(smoothstep(0.5), 0.5);
  assert.equal(smoothstep(1), 1);
  assert.equal(smoothstep(2), 1);
});

test("outer radius: holds at rTravel, then grows exponentially to cover / K^3", () => {
  assert.equal(outerRadius(0.1, 61, 1300), 61);
  assert.equal(outerRadius(LENS.travelEnd, 61, 1300), 61);
  assert.ok(close(outerRadius(1, 61, 1300), 1300 / LENS.K ** 3, 1e-6));
  const mid = outerRadius(0.575, 61, 1300); // halfway in p → geometric mean in radius
  assert.ok(close(mid, Math.sqrt(61 * (1300 / LENS.K ** 3)), 1e-6));
});

test("ratios hold after the ramps", () => {
  for (const p of [0.37, 0.5, 0.8, 1]) {
    const r = lensRadii(p, 61, 1300);
    assert.ok(close(r.b / r.a, LENS.K), `b/a at ${p}`);
  }
  for (const p of [0.54, 0.8, 1]) {
    const r = lensRadii(p, 61, 1300);
    assert.ok(close(r.c / r.b, LENS.K), `c/b at ${p}`);
  }
  for (const p of [0.72, 0.9, 1]) {
    const r = lensRadii(p, 61, 1300);
    assert.ok(close(r.window / r.c, LENS.K), `window/c at ${p}`);
  }
});

test("inner circles are absent before their ramps and the window covers at 1", () => {
  const r = lensRadii(0.2, 61, 1300);
  assert.deepEqual([r.b, r.c, r.window], [0, 0, 0]);
  assert.equal(lensRadii(0.5, 61, 1300).window, 0);
  assert.ok(close(lensRadii(1, 61, 1300).window, 1300, 1e-6));
});

test("nested and monotone for every p", () => {
  let prev = lensRadii(0, 61, 1300);
  for (let i = 1; i <= 200; i++) {
    const p = i / 200;
    const r = lensRadii(p, 61, 1300);
    assert.ok(r.a >= r.b && r.b >= r.c && r.c >= r.window, `crossed at ${p}`);
    assert.ok(r.a >= prev.a && r.b >= prev.b && r.c >= prev.c && r.window >= prev.window, `shrank at ${p}`);
    prev = r;
  }
});

test("rendered radius is clamped to cover", () => {
  assert.equal(renderRadius(5000, 1300), 1300);
  assert.equal(renderRadius(300, 1300), 300);
});

test("disk A travel and actor visibility", () => {
  assert.deepEqual(diskATravel(0), { u: 0, round: 0 });
  assert.deepEqual(diskATravel(LENS.travelEnd), { u: 1, round: 1 });
  assert.equal(diskATravel(LENS.travelEnd / 2).u, 0.5);
  assert.equal(actorVisible(0), true);
  assert.equal(actorVisible(0.3), false);
  assert.equal(actorVisible(LENS.actorReturn), true);
});

test("the actor returns only once the O sits inside the open window", () => {
  // O 300 px below the centre, slot half-size 22: needs a window of 322
  assert.equal(oInWindow(300, 22, 321), false);
  assert.equal(oInWindow(300, 22, 322), true);
  assert.equal(oInWindow(-300, 22, 322), true); // above the centre on the way back
  assert.equal(oInWindow(0, 22, 0), false); // a closed window shows nothing
});
