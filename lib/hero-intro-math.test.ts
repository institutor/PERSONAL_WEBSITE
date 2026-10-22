import assert from "node:assert/strict";
import test from "node:test";
import { REST_INSET_PX, bottomRestOffset } from "./hero-intro-math.ts";

test("lockup drops to rest just above the bottom bar", () => {
  assert.equal(REST_INSET_PX, 56);
  assert.equal(bottomRestOffset({ viewportHeight: 900, lockupTop: 344, lockupHeight: 260, inset: 56 }), 240);
});

test("never negative on a short viewport", () => {
  assert.equal(bottomRestOffset({ viewportHeight: 360, lockupTop: 110, lockupHeight: 220, inset: 56 }), 0);
});
