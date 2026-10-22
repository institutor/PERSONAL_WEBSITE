import assert from "node:assert/strict";
import test from "node:test";
import { squareMorph } from "./square-morph.ts";

// 6 marks: full stop · TRAJECTORY · EXPERIENCE · two deck slots · BU■LD
const N = 6;

test("born a square at the full stop", () => {
  assert.deepEqual(squareMorph(0, 0, N), { round: 0, spin: 0 });
});

test("spins into a circle across the first flight", () => {
  assert.deepEqual(squareMorph(0, 0.5, N), { round: 0.5, spin: 180 });
  assert.deepEqual(squareMorph(0, 1, N), { round: 1, spin: 360 });
});

test("stays a circle for the rest of the journey", () => {
  assert.deepEqual(squareMorph(1, 0, N), { round: 1, spin: 360 });
  assert.deepEqual(squareMorph(2, 0.4, N), { round: 1, spin: 360 });
  assert.deepEqual(squareMorph(3, 1, N), { round: 1, spin: 360 });
});

test("spins back into a square on the final approach", () => {
  assert.deepEqual(squareMorph(4, 0.5, N), { round: 0.5, spin: 540 });
  assert.deepEqual(squareMorph(4, 1, N), { round: 0, spin: 720 });
  assert.deepEqual(squareMorph(5, 0, N), { round: 0, spin: 720 });
});

test("spin never runs backwards along the route", () => {
  let prev = -1;
  for (let ai = 0; ai < N; ai++) {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const { spin } = squareMorph(ai, t, N);
      assert.ok(spin >= prev, `spin went back at mark ${ai}, t ${t}`);
      prev = spin;
    }
  }
});

test("a two-stop route rounds out and back in one flight", () => {
  assert.deepEqual(squareMorph(0, 0, 2), { round: 0, spin: 0 });
  assert.equal(squareMorph(0, 0.5, 2).round, 1);
  assert.deepEqual(squareMorph(1, 0, 2), { round: 0, spin: 720 });
});

test("no route, no morph", () => {
  assert.deepEqual(squareMorph(0, 0.5, 1), { round: 0, spin: 0 });
});
