"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the user's `prefers-reduced-motion` setting.
 *
 * Starts optimistic (false) so the first client render matches the server and
 * avoids a hydration mismatch, then corrects itself before paint via an effect.
 * Components use this to skip or shorten animation rather than relying on CSS
 * alone, which matters for JS-driven transitions that CSS cannot intercept.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return;
    setReduced(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);

    // Safari < 14 only has the deprecated addListener.
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  return reduced;
}
