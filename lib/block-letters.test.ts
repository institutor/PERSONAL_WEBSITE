import assert from "node:assert/strict";
import test from "node:test";
import { CAP, GLYPHS, SLIT, SLOT_W, glyphOf, isBlockChar, pointsAttr, wordUnits } from "./block-letters.ts";

const r1 = (n: number) => Math.round(n * 10) / 10;

test("constants match the reference system", () => {
  assert.equal(CAP, 100);
  assert.equal(SLIT, 3.7);
  assert.equal(SLOT_W, 29.5);
});

test("every polygon stays inside its glyph box", () => {
  for (const [ch, g] of Object.entries(GLYPHS)) {
    assert.ok(g.polys.length >= 1, ch);
    for (const poly of g.polys) {
      assert.ok(poly.length >= 4, `${ch}: a block needs at least 4 points`);
      for (const [x, y] of poly) {
        assert.ok(x >= 0 && x <= g.w, `${ch}: x ${x} outside 0..${g.w}`);
        assert.ok(y >= 0 && y <= CAP, `${ch}: y ${y} outside 0..${CAP}`);
      }
    }
  }
});

test("glyph widths", () => {
  assert.equal(GLYPHS.J.w, 105.7);
  assert.equal(GLYPHS.I.w, 51);
  assert.equal(GLYPHS.E.w, 105.7);
  assert.equal(GLYPHS.W.w, 160.4);
  assert.equal(GLYPHS.N.w, 105.7);
  assert.equal(GLYPHS.M.w, 105.7);
  assert.equal(GLYPHS["'"].w, 29.5);
});

test("word widths include slits and the optional slot", () => {
  assert.equal(r1(wordUnits("JIEWEN")), 652.7);
  assert.equal(r1(wordUnits("JIEWEN", { trailingSlot: true })), 685.9);
  assert.equal(r1(wordUnits("I'M")), 193.6);
});

test("unknown characters fail loudly", () => {
  assert.equal(isBlockChar("H"), false);
  assert.throws(() => glyphOf("H"), RangeError);
  assert.throws(() => wordUnits("JIEWEN HUANG"), RangeError);
});

test("pointsAttr formats an SVG points list", () => {
  assert.equal(pointsAttr([[0, 21.5], [21.5, 0], [51, 0]]), "0,21.5 21.5,0 51,0");
});
