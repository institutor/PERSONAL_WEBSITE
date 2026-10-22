"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { gsap } from "@/lib/gsap";
import { useIntroStore } from "@/lib/intro-store";
import { QUOTES, QUOTE_INTERVAL_MS, nextQuoteIndex } from "@/lib/quotes";

/**
 * The hero's first bar: one quote at a time, attribution right-aligned in
 * caps (wrapping under the quote on phones). The whole row is one line in
 * its own mask, so the intro rises it and a swap fades it as one piece.
 * Every quote is stacked in the same grid cell (only the active one
 * visible), so the bar always reserves the tallest quote at this width and
 * the centred lockup never jumps on a swap.
 *
 * Cycling starts only once the intro reports "done", so a slow loader can
 * never swap a quote mid-intro.
 */
export function QuoteBar() {
  const [index, setIndex] = useState(0);
  const phase = useIntroStore((s) => s.phase);
  const swapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = swapRef.current;
    if (phase !== "done" || !el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const advance = () => setIndex((i) => nextQuoteIndex(i, QUOTES.length));
    let tween: gsap.core.Tween | null = null;

    const id = window.setInterval(() => {
      if (reduced) {
        advance();
        return;
      }
      tween = gsap.to(el, {
        autoAlpha: 0,
        y: -6,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          // commit the new quote before it starts fading in
          flushSync(advance);
          tween = gsap.fromTo(
            el,
            { autoAlpha: 0, y: 6 },
            { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
          );
        },
      });
    }, QUOTE_INTERVAL_MS);

    return () => {
      window.clearInterval(id);
      tween?.kill();
    };
  }, [phase]);

  return (
    <span className="line-mask">
      <span ref={swapRef} data-hero-line data-quote-swap className="grid">
        {QUOTES.map((q, i) => {
          const active = i === index;
          return (
            <span
              key={i}
              aria-hidden={!active}
              className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0 [grid-area:1/1] ${active ? "" : "invisible"}`}
            >
              <q data-quote-text={active ? "" : undefined} className="[quotes:none]">
                {q.text}
              </q>
              <span data-quote-author={active ? "" : undefined} className="lbl opacity-70">
                — {q.author}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
