import assert from "node:assert/strict";
import test from "node:test";
import { QUOTES, QUOTE_INTERVAL_MS, nextQuoteIndex } from "./quotes.ts";

test("Sanderson opens, verbatim", () => {
  assert.equal(
    QUOTES[0].text,
    "The most important step a man can take. It's not the first one, is it? It's the next one. Always the next step…",
  );
  assert.equal(QUOTES[0].author, "Brandon Sanderson");
});

test("every quote is attributed", () => {
  assert.ok(QUOTES.length >= 10);
  for (const q of QUOTES) {
    assert.ok(q.text.trim().length > 0);
    assert.ok(q.author.trim().length > 0);
  }
});

test("cycle wraps", () => {
  assert.equal(QUOTE_INTERVAL_MS, 7000);
  assert.equal(nextQuoteIndex(0, 12), 1);
  assert.equal(nextQuoteIndex(11, 12), 0);
});
