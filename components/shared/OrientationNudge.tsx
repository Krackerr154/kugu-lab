"use client";

import { useEffect, useState } from "react";
import { requestLandscape, useOrientationNudge } from "@/components/shared/useOrientationNudge";

/**
 * Non-blocking slim suggestion to hold the phone in landscape during a live review.
 */
export function OrientationNudge() {
  const { isPortraitPhone, canLock, dismissed, dismiss } = useOrientationNudge();
  const [lockFailed, setLockFailed] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Reset transient state whenever the relevant device state changes.
  useEffect(() => {
    setLockFailed(false);
    setExiting(false);
  }, [isPortraitPhone, dismissed]);

  // Auto-dismiss after 5 seconds so it doesn't occupy screen space if ignored
  useEffect(() => {
    if (!isPortraitPhone || dismissed) return;
    const timer = window.setTimeout(() => {
      setExiting(true);
      window.setTimeout(dismiss, 180);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [isPortraitPhone, dismissed, dismiss]);

  if (!isPortraitPhone || dismissed) return null;

  const handleRotate = async () => {
    const ok = await requestLandscape();
    if (!ok) setLockFailed(true);
  };

  const handleDismiss = () => {
    setExiting(true);
    window.setTimeout(dismiss, 180);
  };

  return (
    <div
      data-orientation-nudge
      role="status"
      aria-live="polite"
      className={[
        "pointer-events-none fixed inset-x-0 bottom-12 z-40 flex justify-center px-3",
        "transition-opacity duration-150",
        exiting ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--warning-ink)]",
          "bg-[var(--surface-selected)] px-3.5 py-1.5 shadow-md",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined shrink-0 text-base text-[var(--warning-ink)]"
        >
          screen_rotation
        </span>

        <p className="text-[11px] font-semibold text-[var(--warning-ink)] leading-none whitespace-nowrap">
          Miringkan perangkat untuk tampilan lebih lega
        </p>

        {canLock && !lockFailed && (
          <button
            type="button"
            onClick={handleRotate}
            aria-label="Putar layar otomatis"
            className="m4-motion-control inline-flex h-5 items-center gap-1 rounded bg-[var(--warning-ink)] px-2 text-[10px] font-bold text-[var(--surface-selected)] hover:opacity-90 ml-0.5"
          >
            <span>Putar</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Tutup saran orientasi"
          className="m4-motion-control -mr-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--warning-ink)] hover:bg-[var(--warning-light)]"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-sm">
            close
          </span>
        </button>
      </div>
    </div>
  );
}
