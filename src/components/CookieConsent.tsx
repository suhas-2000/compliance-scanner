"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cs-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const existing = window.localStorage.getItem(STORAGE_KEY);
      if (!existing) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function choose(value: "accepted" | "declined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-4 shadow-[0_-4px_20px_rgba(15,43,76,0.08)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-slate-600 sm:max-w-xl">
          We use essential cookies to run this site and a preference cookie to
          remember your cookie choice. We don&apos;t use tracking or
          advertising cookies. See our{" "}
          <a href="/privacy" className="font-medium text-[var(--teal)] underline underline-offset-2">
            Privacy Policy
          </a>{" "}
          for details.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose("declined")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Decline
          </button>
          <button
            onClick={() => choose("accepted")}
            className="rounded-lg bg-[var(--navy)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--navy-dark)]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
