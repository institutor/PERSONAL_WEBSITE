import assert from "node:assert/strict";
import test from "node:test";
import { squareMorph } from "./square-morph.ts";

// desktop route, 9 marks: full stop · lens · O · 36vh · EXPERIENCE · three deck slots · BU■LD
const N = 9;
const R = { lens: 1, o: 2 };

test("born a square at the full stop", () => {
  assert.deepEqual(squareMorph(0, 0, R), { round: 0, spin: 0 });
});

test("spins three turns into a circle on the way to the lens", () => {
  assert.deepEqual(squareMorph(0, 0.5, R), { round: 0.5, spin: 540 });
  assert.deepEqual(squareMorph(0, 1, R), { round: 1, spin: 1080 });
});

test("stays a circle from the lens to the O", () => {
  assert.deepEqual(squareMorph(1, 0, R), { round: 1, spin: 1080 });
  assert.deepEqual(squareMorph(1, 0.6, R), { round: 1, spin: 1080 });
  assert.deepEqual(squareMorph(2, 0, R), { round: 1, spin: 1080 });
});

test("leaving the O it spins once more and lands a square", () => {
  assert.deepEqual(squareMorph(2, 0.5, R), { round: 0.5, spin: 1260 });
  assert.deepEqual(squareMorph(2, 1, R), { round: 0, spin: 1440 });
});

test("stays a square for the rest of the journey, BU■LD included", () => {
  for (let ai = 3; ai < N; ai++) {
    for (const t of [0, 0.5, 1]) assert.deepEqual(squareMorph(ai, t, R), { round: 0, spin: 1440 });
  }
});

test("spin never runs backwards along the route", () => {
  for (const [count, roles] of [
    [N, R],
    [8, R], // phone: no 36vh slot, the O's next mark is EXPERIENCE
    [7, { lens: -1, o: 1 }],
  ] as const) {
    let prev = -1;
    for (let ai = 0; ai < count; ai++) {
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const { spin } = squareMorph(ai, t, roles);
        assert.ok(spin >= prev, `spin went back at mark ${ai}, t ${t}`);
        prev = spin;
      }
    }
  }
});

test("phone route: square again on landing in EXPERIENCE", () => {
  // 8 marks: full stop · lens · O · EXPERIENCE · three deck slots · BU■LD
  assert.deepEqual(squareMorph(2, 1, R), { round: 0, spin: 1440 });
  assert.deepEqual(squareMorph(3, 0, R), { round: 0, spin: 1440 });
});

test("no lens slot: the full stop rounds straight into the O", () => {
  const noLens = { lens: -1, o: 1 };
  assert.deepEqual(squareMorph(0, 0.5, noLens), { round: 0.5, spin: 540 });
  assert.deepEqual(squareMorph(1, 0, noLens), { round: 1, spin: 1080 });
  assert.deepEqual(squareMorph(1, 1, noLens), { round: 0, spin: 1440 });
  assert.deepEqual(squareMorph(2, 0.5, noLens), { round: 0, spin: 1440 });
});

test("no O on the route, no morph", () => {
  assert.deepEqual(squareMorph(0, 0.5, { lens: -1, o: -1 }), { round: 0, spin: 0 });
});
