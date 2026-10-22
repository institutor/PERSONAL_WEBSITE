"use client";

import { QUOTES } from "@/lib/quotes";

/**
 * The hero's first bar: one quote at a time, attribution right-aligned in
 * caps (wrapping under the quote on phones). The whole row is one line in
 * its own mask, so the intro rises it and a swap fades it as one piece.
 */
export function QuoteBar() {
  const q = QUOTES[0];

  return (
    <span className="line-mask">
      <span
        data-hero-line
        data-quote-swap
        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0"
      >
        <q data-quote-text className="[quotes:none]">
          {q.text}
        </q>
        <span data-quote-author className="lbl opacity-70">
          — {q.author}
        </span>
      </span>
    </span>
  );
}
