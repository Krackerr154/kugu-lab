"use client";

import { useLayoutEffect, useRef } from "react";
import { useM3Presentation } from "@/components/shared/M3PresentationProvider";
import { useM4GuidedAccess } from "@/components/shared/M4GuidedAccessGate";
import { AsprakDataEntry } from "@/components/shared/AsprakDataEntry";
import { AsprakGamesPanel } from "@/components/shared/AsprakGamesPanel";
import { ReviewDataChart } from "@/components/shared/ReviewDataChart";
import { useReviewWaypointFrame } from "@/components/shared/useReviewWaypointFrame";
import {
  REVIEW_SLIDES,
  REVIEW_SLIDE_BY_ID,
  REVIEW_CHAPTERS,
  TOTAL_REVIEW_SLIDES,
  slideIndex,
} from "@/lib/m4-review-slides";
import type { ReviewSlideId } from "@/lib/m3-presentation";

export function PresenterReviewDock() {
  const {
    role,
    snapshot,
    slideRequest,
    audienceCount,
    activeSession,
    presentSlide,
    presentStage,
    presentDataSet,
    closeSession,
    roomId,
  } = useM3Presentation();

  const { instructorUnlocked } = useM4GuidedAccess();
  const dockRef = useRef<HTMLElement>(null);

  const isPresenter = instructorUnlocked && role === "presenting";
  const currentSlideId = snapshot?.slideId ?? ("p1" as ReviewSlideId);
  const currentIndex = currentSlideId ? slideIndex(currentSlideId) : 0;
  const currentSlide = currentSlideId ? REVIEW_SLIDE_BY_ID[currentSlideId] : null;

  // Frame active anchor whenever slide or token changes
  const { anchorNotFound } = useReviewWaypointFrame({
    role,
    slideId: currentSlideId,
    token: slideRequest?.token ?? 0,
    isPresenter,
  });

  // Dynamic bottom clearance so dock never obscures content
  useLayoutEffect(() => {
    if (!isPresenter) return;
    const updatePadding = () => {
      if (dockRef.current) {
        const height = dockRef.current.offsetHeight;
        document.body.style.paddingBottom = `${height + 24}px`;
      }
    };
    updatePadding();
    const observer = new ResizeObserver(updatePadding);
    if (dockRef.current) observer.observe(dockRef.current);
    return () => {
      observer.disconnect();
      document.body.style.paddingBottom = "";
    };
  }, [isPresenter]);

  if (!isPresenter) return null;

  const atStart = currentIndex <= 0;
  const atEnd = currentIndex >= TOTAL_REVIEW_SLIDES - 1;
  const isDataSlide = currentSlide?.kind === "data";
  const isClosingSlide = currentSlide?.kind === "closing";
  const publishedDataSetId = snapshot?.dataSetId ?? null;

  const go = (target: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_REVIEW_SLIDES - 1, target));
    presentSlide(REVIEW_SLIDES[clamped].id);
  };

  return (
    <aside
      ref={dockRef}
      data-presenter-dock
      data-presenter-deck
      aria-label="Panel kendali asisten"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[var(--primary-container)] bg-[var(--surface-container-lowest)]/95 shadow-2xl backdrop-blur-md transition-all m4-motion-enter"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-2 p-3">
        {/* Top bar: Session info, audience count, slide title, Prev/Next, Tutup Sesi */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--outline-variant)] pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--primary-container)] animate-pulse shrink-0" />
            <span className="font-bold text-[var(--foreground)] text-xs sm:text-sm truncate">
              Anda Memandu: {activeSession?.name || "Sesi Praktikum KI3131"}
            </span>
            <span className="rounded-full bg-[var(--surface-selected)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary-container)] shrink-0">
              Live
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-selected)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary-container)] shrink-0 tabular-nums"
              title={`${audienceCount} praktikan mengikuti sesi ini`}
              data-audience-count
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[13px] leading-none">group</span>
              {audienceCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => go(currentIndex - 1)}
              disabled={atStart}
              aria-label="Slide sebelumnya"
              className="m4-motion-control inline-flex min-h-8 w-8 items-center justify-center rounded-lg border border-[var(--outline-variant)] text-[var(--primary-container)] hover:bg-[var(--surface-container)] disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-[var(--primary-container)]"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <span className="px-1 text-xs font-bold tabular-nums text-[var(--foreground)]">
              {currentIndex + 1}/{TOTAL_REVIEW_SLIDES}
            </span>

            <button
              type="button"
              onClick={() => (currentIndex < 0 ? go(0) : go(currentIndex + 1))}
              disabled={atEnd}
              aria-label="Slide berikutnya"
              className="m4-motion-control inline-flex min-h-8 items-center gap-1 rounded-lg border border-[var(--primary-container)] bg-[var(--primary-container)] px-3 text-xs font-bold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-[var(--primary-container)]"
            >
              <span>Berikutnya</span>
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>

            <button
              type="button"
              onClick={closeSession}
              className="m4-motion-control ml-2 min-h-8 rounded-lg border border-[var(--danger,#ef4444)] px-2.5 text-xs font-semibold text-[var(--danger,#ef4444)] hover:bg-[var(--danger,#ef4444)]/10 focus-visible:outline-2 focus-visible:outline-[var(--danger,#ef4444)]"
            >
              Tutup Sesi
            </button>
          </div>
        </div>

        {/* Current slide indicator banner */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="rounded bg-[var(--primary-container)]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--primary-container)]">
              Slide {currentIndex + 1}
            </span>
            <span className="font-semibold text-[var(--foreground)] truncate">
              {currentSlide?.title}
            </span>
          </div>

          {anchorNotFound && currentSlide?.kind === "content" && (
            <span className="text-[11px] text-[var(--warning-ink)] font-medium">
              Anchor konten sedang tidak terlihat pada tampilan ini.
            </span>
          )}

          <button
            type="button"
            onClick={() => go(currentIndex)}
            className="text-[11px] font-medium text-[var(--primary-container)] underline hover:opacity-80 shrink-0"
          >
            Fokuskan Ulang
          </button>
        </div>

        {/* Chapter rails & slide waypoints */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-0.5">
          {REVIEW_CHAPTERS.map((chapter) => {
            const isChapterActive = currentSlide?.chapter === chapter.chapter;
            return (
              <div key={chapter.chapter} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => presentStage(chapter.chapter)}
                  className={`min-h-6 rounded px-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    isChapterActive
                      ? "bg-[var(--primary-container)] text-[var(--on-primary)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-container)]"
                  }`}
                >
                  {chapter.label.split(" ")[0]}
                </button>

                <div className="flex items-center gap-0.5">
                  {chapter.slides.map((s) => {
                    const i = slideIndex(s.id);
                    const active = s.id === currentSlideId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => presentSlide(s.id)}
                        aria-pressed={active}
                        aria-label={`${i + 1}. ${s.label}: ${s.title}`}
                        title={`${i + 1}. ${s.label}: ${s.title}`}
                        className="m4-motion-color h-5 min-w-5 rounded px-1 text-[10px] font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary-container)]"
                        style={{
                          backgroundColor: active ? "var(--primary-container)" : "var(--surface-container)",
                          color: active ? "var(--on-primary)" : "var(--text-secondary)",
                        }}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Data slides: inline asprak data entry + preview chart */}
        {isDataSlide && (
          <div className="max-h-[40vh] overflow-y-auto border-t border-[var(--outline-variant)] pt-2 space-y-2">
            <AsprakDataEntry
              onPublished={(dataSetId) => presentDataSet(dataSetId)}
            />
            {publishedDataSetId && (
              <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-2">
                <p className="mb-1 text-[11px] font-semibold text-[var(--primary-container)]">
                  Tampilan grafik yang dilihat praktikan:
                </p>
                <ReviewDataChart dataSetId={publishedDataSetId} />
              </div>
            )}
          </div>
        )}

        {/* Closing slide: the asprak runs the Games phase from here */}
        {isClosingSlide && roomId && (
          <div className="max-h-[40vh] overflow-y-auto border-t border-[var(--outline-variant)] pt-2">
            <AsprakGamesPanel roomId={roomId} />
          </div>
        )}
      </div>
    </aside>
  );
}
