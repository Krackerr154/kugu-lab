"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Measures an element's content width in CSS pixels.
 *
 * Charts here are drawn at 1 unit = 1 CSS pixel rather than through a scaled
 * viewBox: a viewBox shrinks axis text with the container, which turned 11px
 * labels into 4px ones on a phone. Measuring keeps type and hit targets at
 * their real size at every width.
 */
export function useMeasuredWidth(fallback: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(fallback);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (w: number) => {
      if (w > 0) setWidth(Math.round(w));
    };
    apply(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => apply(entries[0]?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}
