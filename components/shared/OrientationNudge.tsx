"use client";

import { useEffect, useState } from "react";
import { requestLandscape, useOrientationNudge } from "@/components/shared/useOrientationNudge";

/**
 * Non-blocking suggestion to hold the phone in landscape during a live review.
 *
 * Deliberately NOT a modal: this content works in both orientations, so gating it
 * behind a "rotate your device" screen would be a WCAG 1.3.4 (AA) failure
 * (W3C technique F100) — it would lock out anyone who physically cannot rotate
 * their device (e.g. mounted on a wheelchair arm).
 *
 * Rules that keep it compliant:
 *   - Renders over the deck without blocking it: no backdrop, no focus trap,
 *     `pointer-events` confined to the banner itself so slides stay scrollable.
 *   - Dismissible, and the dismissal persists.
 *   - Auto-hides the moment the device rotates to landscape.
 *   - Only ever mounts on phone-sized portrait viewports.
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

  if (!isPortraitPhone || dismissed) return null;

  const handleRotate = async () => {
    const ok = await requestLandscape();
    // If the lock didn't take (iOS Safari: never implemented), say so plainly
    // rather than leaving a dead button behind.
    if (!ok) setLockFailed(true);
  };

  const handleDismiss = () => {
    setExiting(true);
    // Let the fade finish, then unmount.
    window.setTimeout(dismiss, 180);
  };

  return (
    <div
      data-orientation-nudge
      role="status"
      aria-live="polite"
      className={[
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-20 sm:pb-24",
        "transition-opacity duration-150",
        exiting ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-auto w-full max-w-md rounded-xl border border-[var(--warning-ink)]",
          "bg-[var(--surface-selected)] px-3.5 py-3 shadow-lg",
        ].join(" ")}
      >
        <div className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className="material-symbols-outlined shrink-0 text-xl text-[var(--warning-ink)]"
          >
            screen_rotation
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[var(--warning-ink)]">
              Tampilan lebih legar dalam mode lanskap
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-[var(--warning-ink)]/85">
              {lockFailed
                ? "Perangkat ini tidak dapat diputar otomatis. Anda tetap dapat mengikuti seluruh slide dalam mode potret."
                : "Miringkan perangkat Anda jika memungkinkan. Seluruh materi tetap dapat dibaca tanpa memutar layar."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup saran lanskap"
            className="m4-motion-control -mr-1 -mt-1 inline-flex min-h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--warning-ink)] hover:bg-[var(--warning-light)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">
              close
            </span>
          </button>
        </div>

        {/* Action button only where screen.orientation.lock() can actually work.
            On iOS Safari it is absent, so we never show a control that does nothing. */}
        {canLock && !lockFailed && (
          <button
            type="button"
            onClick={handleRotate}
            className="m4-motion-control mt-2.5 inline-flex min-h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--warning-ink)] px-3 text-xs font-bold text-[var(--surface-selected)] hover:opacity-90"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              screen_rotation
            </span>
            <span>Putar ke lanskap</span>
          </button>
        )}
      </div>
    </div>
  );
}
