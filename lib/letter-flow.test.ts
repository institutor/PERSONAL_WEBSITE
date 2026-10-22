import assert from "node:assert/strict";
import test from "node:test";
import { FLOW, repel, settle } from "./letter-flow.ts";

const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;

test("a letter outside the shape stays put", () => {
  assert.deepEqual(repel({ x: 500, y: 100 }, { x: 100, y: 100, r: 100 }, 10), { x: 0, y: 0 });
  assert.deepEqual(repel({ x: 210, y: 100 }, { x: 100, y: 100, r: 100 }, 10), { x: 0, y: 0 }); // exactly at the clearance
});

test("a letter inside is pushed straight out to the edge plus pad", () => {
  const o = repel({ x: 150, y: 100 }, { x: 100, y: 100, r: 100 }, 10);
  assert.ok(close(o.x, 60) && close(o.y, 0), JSON.stringify(o)); // 50 in → lands at 110
  const diag = repel({ x: 130, y: 140 }, { x: 100, y: 100, r: 100 }, 0);
  const d = Math.hypot(30, 40); // 50 → pushed to 100 along the same direction
  assert.ok(close(diag.x, 30 * (100 - d) / d) && close(diag.y, 40 * (100 - d) / d));
});

test("dead centre lifts the letter upward", () => {
  assert.deepEqual(repel({ x: 100, y: 100 }, { x: 100, y: 100, r: 80 }, 20), { x: 0, y: -100 });
});

test("no shape, no push", () => {
  assert.deepEqual(repel({ x: 100, y: 100 }, { x: 100, y: 100, r: 0 }, 0), { x: 0, y: 0 });
});

test("settle eases toward the target", () => {
  assert.equal(settle(0, 100, FLOW.ease), 20);
  assert.equal(settle(100, 0, 0.5), 50);
  assert.equal(settle(7, 7, FLOW.ease), 7);
});
