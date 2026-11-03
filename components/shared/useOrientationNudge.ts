"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Detects whether the student is holding a PHONE in portrait, and whether nudging
 * them toward landscape is worth doing at all.
 *
 * Design constraints (see WCAG 1.3.4 / W3C failure technique F100):
 *   - This NEVER gates content. It only reports a hint the caller may render as a
 *     dismissible, non-blocking suggestion. A blocking "rotate your device" doorslam
 *     is a documented accessibility failure for content that works in both
 *     orientations — and this deck does work in both.
 *   - screen.orientation.lock() is absent on iOS Safari entirely, and rejected on
 *     desktop and in non-fullscreen tabs elsewhere. So `canLock` is reported
 *     separately: the caller shows a "rotate" ACTION button only where the call can
 *     actually succeed, and plain advisory text everywhere else.
 */

const DISMISS_KEY = "kugu:m4:orientation-nudge-dismissed";

// A phone in portrait. Deliberately narrow: tablets and laptops never see this.
const PORTRAIT_PHONE_QUERY = "(orientation: portrait) and (max-width: 600px)";

// Orientation locking is a mobile-device capability. Desktop browsers expose
// screen.orientation.lock but reject every call (a monitor cannot rotate), so we
// additionally require a coarse pointer to avoid showing a button that always fails.
const TOUCH_QUERY = "(pointer: coarse)";

interface OrientationNudgeState {
  /** Phone-sized viewport currently in portrait — the nudge is relevant. */
  isPortraitPhone: boolean;
  /** screen.orientation.lock exists AND we're on a touch device, so a "rotate"
   *  button has a realistic chance of working. */
  canLock: boolean;
  /** User has dismissed the nudge in a previous session. */
  dismissed: boolean;
}

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    // Private mode / storage disabled: treat as not dismissed, never crash.
    return false;
  }
}

export function useOrientationNudge(): OrientationNudgeState & {
  dismiss: () => void;
} {
  const [isPortraitPhone, setIsPortraitPhone] = useState(false);
  const [canLock, setCanLock] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia(PORTRAIT_PHONE_QUERY);
    const sync = () => setIsPortraitPhone(mq.matches);
    sync();
    const isTouch = window.matchMedia(TOUCH_QUERY).matches;

    // Feature-detect the lock API once. Present but non-functional in many contexts
    // (needs fullscreen on Chromium), so the caller still has to try/catch.
    // TS's ScreenOrientation types `lock` as always present; at runtime it is absent
    // on iOS Safari, so probe through a loose shape and never trust the type.
    const orientation = (window.screen as Screen | undefined)?.orientation as
      | { lock?: unknown }
      | undefined;
    setCanLock(Boolean(typeof orientation?.lock === "function") && isTouch);

    setDismissed(readDismissed());

    // React to actual rotation: the nudge must vanish on its own once rotated.
    // "change" is the correct event, but we also listen to "resize" and
    // "orientationchange": some browsers (and all CDP viewport emulation) update
    // the viewport without firing a media-query change, and mobile browser chrome
    // showing/hiding also changes the effective viewport via resize.
    const onChange = () => sync();
    let usingLegacy = false;

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
    } else {
      usingLegacy = true;
      mq.addListener(onChange); // Safari < 14
    }
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);

    return () => {
      if (usingLegacy) mq.removeListener(onChange);
      else mq.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignored: dismissal just won't persist. Nudge still hides for this session.
    }
  }, []);

  return { isPortraitPhone, canLock, dismissed, dismiss };
}

/**
 * Best-effort request to rotate. Never throws, never blocks, and returns false when
 * nothing happened so the caller can keep the advisory text visible.
 *
 * Only meaningful on Chromium Android (and then usually only in fullscreen), so we
 * attempt fullscreen first when we aren't already there.
 */
export async function requestLandscape(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const orientation = window.screen?.orientation as
    | (ScreenOrientation & { lock?: (o: string) => Promise<void> })
    | undefined;
  if (!orientation || typeof orientation.lock !== "function") return false;

  try {
    // Locking is generally ignored outside fullscreen: the OS/browser chrome still
    // needs to rotate freely. Best-effort enter fullscreen first.
    if (!document.fullscreenElement && typeof document.documentElement.requestFullscreen === "function") {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // No user gesture, or blocked by permissions policy. Try the lock anyway.
      }
    }
    await orientation.lock("landscape");
    return true;
  } catch {
    // NotAllowedError / NotSupportedError / SecurityError — all expected outcomes.
    return false;
  }
}
