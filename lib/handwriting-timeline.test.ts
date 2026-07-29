import assert from "node:assert/strict";
import test from "node:test";
import {
  mapHandwritingProgress,
  type HandwritingSegment,
} from "./handwriting-timeline.ts";

const segments: HandwritingSegment[] = [
  { draw: 100, lift: 20 },
  { draw: 100, lift: 0 },
];

test("draws one continuous timeline with a real pen-lift gap", () => {
  assert.deepEqual(mapHandwritingProgress(0, segments), [0, 0]);
  assert.deepEqual(mapHandwritingProgress(1, segments), [1, 1]);

  const duringFirstStroke = mapHandwritingProgress(0.25, segments);
  assert.ok(duringFirstStroke[0] > 0);
  assert.equal(duringFirstStroke[1], 0);

  const duringLift = mapHandwritingProgress(0.5, segments);
  assert.equal(duringLift[0], 1);
  assert.equal(duringLift[1], 0);

  const stillDuringLift = mapHandwritingProgress(0.52, segments);
  assert.equal(stillDuringLift[0], 1);
  assert.equal(stillDuringLift[1], 0);

  const duringSecondStroke = mapHandwritingProgress(0.75, segments);
  assert.equal(duringSecondStroke[0], 1);
  assert.ok(duringSecondStroke[1] > 0);
});
