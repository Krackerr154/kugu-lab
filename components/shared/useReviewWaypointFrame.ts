"use client";

import { useLayoutEffect, useState } from "react";
import { REVIEW_SLIDE_BY_ID } from "@/lib/m4-review-slides";
import type { ReviewSlideId } from "@/lib/m3-presentation";
import type { Role } from "@/components/shared/M3PresentationProvider";

interface WaypointFrameOptions {
  role: Role;
  slideId: ReviewSlideId | null;
  token: number | null;
  isPresenter?: boolean;
}

export function useReviewWaypointFrame({
  role,
  slideId,
  token,
  isPresenter = false,
}: WaypointFrameOptions) {
  const [anchorNotFound, setAnchorNotFound] = useState(false);

  useLayoutEffect(() => {
    const clearMarkers = () => {
      if (typeof document === "undefined") return;
      document.querySelectorAll("[data-presenter-slide-content]").forEach((el) => {
        el.removeAttribute("data-presenter-slide-content");
        el.removeAttribute("data-presenter-active-anchor");
        el.removeAttribute("aria-label");
      });
    };

    if (!slideId || (role !== "following" && role !== "presenting")) {
      clearMarkers();
      setAnchorNotFound(false);
      return;
    }

    const slide = REVIEW_SLIDE_BY_ID[slideId];
    if (!slide) {
      clearMarkers();
      return;
    }

    // If data or closing slide (no anchor), clear anchor markers and exit
    if (slide.kind !== "content" || !slide.anchor) {
      clearMarkers();
      setAnchorNotFound(false);
      return;
    }

    const target = document.querySelector<HTMLElement>(`[data-review-anchor="${slide.anchor}"]`);
    if (!target) {
      clearMarkers();
      setAnchorNotFound(true);
      return;
    }

    setAnchorNotFound(false);
    clearMarkers();

    if (isPresenter) {
      target.setAttribute("data-presenter-slide-content", "true");
      target.setAttribute("data-presenter-active-anchor", "true");
      target.setAttribute("aria-label", "Pratinjau konten praktikan");
    }

    // Measure clearance from the journey offset or sticky elements
    const computed = getComputedStyle(target);
    const journeyOffset = parseFloat(computed.getPropertyValue("--journey-offset")) || 150;
    const topOffset = journeyOffset + 16;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - topOffset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "auto",
    });

    return () => {
      clearMarkers();
    };
  }, [role, slideId, token, isPresenter]);

  return { anchorNotFound };
}
