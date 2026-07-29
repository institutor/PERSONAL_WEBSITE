"use client";

import { useEffect, useRef, useState } from "react";

/**
 * (@) copies the email address instead of firing a mailto: link.
 *
 * mailto: depends on the visitor having a desktop mail client registered —
 * on most machines it opens an app picker and dead-ends. Copying always
 * works, and the address is still printed in full in the contact section.
 */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // insecure context / no permission: fall back to a scratch selection
      const ta = document.createElement("textarea");
      ta.value = email;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        window.location.href = `mailto:${email}`;
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1900);
  };

  return (
    <span className="relative">
      <button
        type="button"
        onClick={copy}
        className="cursor-pointer opacity-85 transition-opacity hover:opacity-100"
        aria-label={`Copy email address ${email}`}
      >
        (@)
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-full top-0 ml-2 whitespace-nowrap transition-opacity duration-300"
        style={{ opacity: copied ? 0.65 : 0 }}
      >
        COPIED
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </span>
  );
}
