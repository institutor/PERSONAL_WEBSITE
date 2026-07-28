"use client";

import { useEffect, useState } from "react";

/** Live New York clock — the page has a place (motion-study #22). */
export function Clock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono" style={{ fontVariantNumeric: "tabular-nums" }} suppressHydrationWarning>
      {time}
    </span>
  );
}
