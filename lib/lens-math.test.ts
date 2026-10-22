import assert from "node:assert/strict";
import test from "node:test";
import { LENS, actorVisible, coverRadius, diskATravel, growth, lensProgress, lensRadii } from "./lens-math.ts";

test("progress clamps to the lens range", () => {
  assert.equal(lensProgress(100, 154, 1997), 0);
  assert.equal(lensProgress(154 + (1997 - 154) / 2, 154, 1997), 0.5);
  assert.equal(lensProgress(5000, 154, 1997), 1);
  assert.equal(lensProgress(500, 1000, 1000), 0);
});

test("cover radius reaches the farthest corner", () => {
  assert.ok(Math.abs(coverRadius(0, 0, 100, 100) - (Math.hypot(100, 100) + 2)) < 1e-9);
  assert.ok(Math.abs(coverRadius(50, 50, 100, 100) - (Math.hypot(50, 50) + 2)) < 1e-9);
  assert.ok(Math.abs(coverRadius(655, 196, 1024, 768) - (Math.hypot(655, 572) + 2)) < 1e-9);
});

test("growth is an ease-in inside its own range", () => {
  assert.equal(growth(0.1, 0.18, 0.86), 0);
  assert.equal(growth(0.18, 0.18, 0.86), 0);
  assert.equal(growth(0.86, 0.18, 0.86), 1);
  assert.equal(growth(0.99, 0.18, 0.86), 1);
  const mid = growth(0.52, 0.18, 0.86);
  assert.ok(mid > 0 && mid < 0.5, `ease-in: ${mid}`);
});

test("radii start and end where the spec says", () => {
  const r0 = lensRadii(0.18, 61, 1300);
  assert.deepEqual(r0, { a: 61, b: 0, c: 0, window: 0 });
  assert.equal(lensRadii(0.5, 61, 1300).window, 0);
  assert.deepEqual(lensRadii(1, 61, 1300), { a: 1300, b: 1300, c: 1300, window: 1300 });
});

test("radii stay nested and never shrink as p grows", () => {
  let prev = lensRadii(0, 61, 1300);
  for (let i = 1; i <= 100; i++) {
    const p = i / 100;
    const r = lensRadii(p, 61, 1300);
    assert.ok(r.a >= r.b && r.b >= r.c && r.c >= r.window, `crossed at p=${p}: ${JSON.stringify(r)}`);
    assert.ok(r.a >= prev.a && r.b >= prev.b && r.c >= prev.c && r.window >= prev.window, `shrank at p=${p}`);
    prev = r;
  }
});

test("disk A travels and rounds out by travelEnd", () => {
  assert.deepEqual(diskATravel(0), { u: 0, round: 0 });
  assert.deepEqual(diskATravel(LENS.travelEnd), { u: 1, round: 1 });
  assert.equal(diskATravel(LENS.travelEnd / 2).u, 0.5);
  assert.deepEqual(diskATravel(0.5), { u: 1, round: 1 });
});

test("the actor is seen only at the full stop and at the O", () => {
  assert.equal(actorVisible(-0.1), true);
  assert.equal(actorVisible(0), true);
  assert.equal(actorVisible(0.001), false);
  assert.equal(actorVisible(0.5), false);
  assert.equal(actorVisible(LENS.actorReturn), true);
  assert.equal(actorVisible(1), true);
});
