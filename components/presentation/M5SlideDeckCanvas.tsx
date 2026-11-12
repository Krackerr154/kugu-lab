"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  M5_REVIEW_DECK_SLIDES,
  M5_REVIEW_DECK_SLIDE_BY_ID,
  TOTAL_M5_REVIEW_DECK_SLIDES,
  m5DeckSlideIndex,
  type ReviewDeckSlide,
} from "@/lib/m5-review-deck-data";
import { XRDSlidePanel } from "@/components/interactives/XRDSlidePanel";
import { useOptionalM3Presentation } from "@/components/shared/M3PresentationProvider";
import { OrientationNudge } from "@/components/shared/OrientationNudge";
import { DeckActionDial } from "@/components/presentation/DeckActionDial";
import { useReducedMotion } from "@/components/shared/useReducedMotion";
import { toggleFullscreen } from "@/lib/fullscreen";
import { useFullscreenStatus } from "@/components/shared/useFullscreenStatus";
import { ChemText } from "@/components/shared/ChemText";
import type { ReviewSlideId } from "@/lib/m3-presentation";

interface M5SlideDeckCanvasProps {
  initialSlideId?: ReviewSlideId;
  exitHref?: string;
  onExit?: () => void;
}

function formatBulletText(text: string) {
  const colonIdx = text.indexOf(":");
  if (colonIdx > 0 && colonIdx <= 25) {
    const prefix = text.slice(0, colonIdx).trim();
    const rest = text.slice(colonIdx + 1).trim();
    return (
      <div className="flex items-start gap-1.5 sm:gap-2 min-w-0 flex-1">
        <span className="m4-deck-bullet-key inline-flex items-baseline justify-between w-32 sm:w-40 shrink-0 font-semibold text-[var(--foreground)]">
          <span>{prefix}</span>
          <span className="text-[var(--muted)]">:</span>
        </span>
        <span className="min-w-0 flex-1 break-words">{rest}</span>
      </div>
    );
  }
  return <span className="min-w-0 flex-1 break-words">{text}</span>;
}

/**
 * Student deck for the Module 5 (XRD) review session.
 *
 * Same shell, bounded read-back and relay semantics as the Module 7 deck.
 */
export function M5SlideDeckCanvas({
  initialSlideId = "s1",
  exitHref = "/modules/m5-xrd",
  onExit,
}: M5SlideDeckCanvasProps) {
  const presentation = useOptionalM3Presentation();

  const role = presentation?.role ?? "solo";
  const slideRequest = presentation?.slideRequest ?? null;
  const presenterSlideId = (slideRequest?.slideId ?? presentation?.snapshot?.slideId ?? null) as ReviewSlideId | null;
  const roomId = presentation?.roomId ?? "";
  const status = presentation?.status ?? "solo";
  const joinError = presentation?.joinError ?? null;
  const relayMode = presentation?.relayMode ?? false;

  const [viewingId, setViewingId] = useState<ReviewSlideId>(() =>
    presenterSlideId && m5DeckSlideIndex(presenterSlideId) >= 0 ? presenterSlideId : initialSlideId
  );
  const [lastToken, setLastToken] = useState<number | null>(null);
  const [swapDirection, setSwapDirection] = useState<"forward" | "back">("forward");
  const [swapKey, setSwapKey] = useState(0);
  const reducedMotion = useReducedMotion();
  const fullscreen = useFullscreenStatus();
  const slideBodyRef = useRef<HTMLDivElement>(null);

  // Snap to the presenter's slide whenever a new broadcast token arrives.
  useEffect(() => {
    if (slideRequest && slideRequest.token !== lastToken) {
      setLastToken(slideRequest.token);
      if (m5DeckSlideIndex(slideRequest.slideId) < 0) return;
      setViewingId((current) => {
        const next = m5DeckSlideIndex(slideRequest.slideId);
        setSwapDirection(next < m5DeckSlideIndex(current) ? "back" : "forward");
        return slideRequest.slideId;
      });
      setSwapKey((k) => k + 1);
    }
  }, [slideRequest, lastToken]);

  const viewingIdx = m5DeckSlideIndex(viewingId);
  const isFollowing =
    (role === "following" || role === "presenting") && status === "following" && !presentation?.ended;
  const presenterIdx =
    isFollowing && presenterSlideId && m5DeckSlideIndex(presenterSlideId) >= 0
      ? m5DeckSlideIndex(presenterSlideId)
      : TOTAL_M5_REVIEW_DECK_SLIDES - 1;
  const isDrifted = isFollowing && presenterSlideId !== null && presenterSlideId !== viewingId;

  // Replay the enter animation on every swap
  useEffect(() => {
    const node = slideBodyRef.current;
    if (!node) return;
    if (reducedMotion) {
      node.classList.remove("m4-slide-enter-back", "m4-slide-enter-forward");
      return;
    }
    const className = swapDirection === "back" ? "m4-slide-enter-back" : "m4-slide-enter-forward";
    node.classList.remove("m4-slide-enter-back", "m4-slide-enter-forward");
    void node.offsetWidth;
    node.classList.add(className);

    const onEnd = (e: AnimationEvent) => {
      if (e.target !== node) return;
      node.classList.remove("m4-slide-enter-back", "m4-slide-enter-forward");
    };
    node.addEventListener("animationend", onEnd);
    const timer = window.setTimeout(() => {
      node.classList.remove("m4-slide-enter-back", "m4-slide-enter-forward");
    }, 600);
    return () => {
      node.removeEventListener("animationend", onEnd);
      window.clearTimeout(timer);
    };
  }, [swapKey, swapDirection, reducedMotion]);

  const canGoBack = viewingIdx > 0;
  const canGoForward = viewingIdx < presenterIdx;

  const goToSlide = useCallback(
    (targetIdx: number) => {
      const clamped = Math.max(0, Math.min(presenterIdx, targetIdx));
      const targetSlide = M5_REVIEW_DECK_SLIDES[clamped];
      if (targetSlide) {
        setSwapDirection(clamped < viewingIdx ? "back" : "forward");
        setSwapKey((k) => k + 1);
        setViewingId(targetSlide.id);
        window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      }
    },
    [presenterIdx, viewingIdx, reducedMotion]
  );

  const stepForward = useCallback(() => {
    if (canGoForward) goToSlide(viewingIdx + 1);
  }, [canGoForward, goToSlide, viewingIdx]);

  const stepBack = useCallback(() => {
    if (canGoBack) goToSlide(viewingIdx - 1);
  }, [canGoBack, goToSlide, viewingIdx]);

  const snapToPresenter = useCallback(() => {
    if (presenterSlideId && m5DeckSlideIndex(presenterSlideId) >= 0) {
      goToSlide(m5DeckSlideIndex(presenterSlideId));
    }
  }, [presenterSlideId, goToSlide]);

  // Keyboard navigation for students
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        stepForward();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        stepBack();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToSlide(presenterIdx);
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stepForward, stepBack, goToSlide, presenterIdx]);

  const currentSlide: ReviewDeckSlide =
    M5_REVIEW_DECK_SLIDE_BY_ID[viewingId] || M5_REVIEW_DECK_SLIDES[0];

  return (
    <div
      data-deck-canvas
      data-deck="m5"
      className="m4-deck-fit m4-deck-compact bg-[var(--surface-container-lowest)] text-[var(--foreground)] flex flex-col justify-between"
    >
      <OrientationNudge />

      {/* ── HEADER BAR ─────────────────────────────────────────────────── */}
      {/* Only session identity and chrome controls live here. The chapter tag
          and slide counter moved into the slide body: on a 390px phone the
          header cannot hold brand + chapter + counter + two buttons without
          squeezing the title off the row. */}
      <header className="m4-deck-topbar sticky top-0 z-30 border-b border-[var(--outline-variant)] bg-[var(--surface)]/95 backdrop-blur-md px-3 py-2 min-w-0">
        <div className="mx-auto flex max-w-4xl lg:max-w-6xl items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="m4-deck-brand truncate text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
              Modul 5 · XRD
            </span>
            {isDrifted && (
              <button
                type="button"
                onClick={snapToPresenter}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                title="Lompat ke slide yang sedang diterangkan asisten"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-xs">
                  sync
                </span>
                <span className="hidden sm:inline">Kembali ke Asisten</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Keluar layar penuh" : "Masuk layar penuh"}
              className="m4-motion-control inline-flex min-h-8 w-8 items-center justify-center rounded-lg border border-[var(--outline-variant)] text-[var(--text-secondary)] hover:bg-[var(--surface-container)]"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                {fullscreen ? "fullscreen_exit" : "fullscreen"}
              </span>
            </button>
            {onExit ? (
              <button
                type="button"
                onClick={onExit}
                className="m4-motion-control inline-flex min-h-8 items-center gap-1 rounded-lg border border-[var(--outline-variant)] px-2.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-container)]"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-sm">
                  close
                </span>
                <span className="hidden sm:inline">Keluar</span>
              </button>
            ) : (
              <a
                href={exitHref}
                className="m4-motion-control inline-flex min-h-8 items-center gap-1 rounded-lg border border-[var(--outline-variant)] px-2.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-container)]"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-sm">
                  close
                </span>
                <span className="hidden sm:inline">Keluar</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN SLIDE CANVAS ──────────────────────────────────────────── */}
      {/* `m4-deck-slidebody` is the scroll container inside the fixed
          `m4-deck-fit` frame, so the footer rail stays thumb-reachable while a
          tall slide scrolls under it. */}
      <main className="m4-deck-slidebody flex-1 px-3 py-2 sm:px-4 min-w-0 overflow-y-auto">
        <div
          ref={slideBodyRef}
          className="mx-auto max-w-4xl lg:max-w-6xl space-y-4 sm:space-y-6 min-w-0"
          data-slide-direction={swapDirection}
        >
          {/* Slide header: chapter tag, counter, title */}
          <div className="m4-deck-chapter space-y-1 sm:space-y-1.5 border-b border-[var(--outline-variant)] pb-2 sm:pb-4 min-w-0">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="rounded bg-[var(--primary-container)]/10 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                {currentSlide.chapterLabel}
              </span>
              <span className="m4-deck-counter text-xs font-semibold tabular-nums text-[var(--muted)]">
                Slide {viewingIdx + 1} dari {TOTAL_M5_REVIEW_DECK_SLIDES}
              </span>
            </div>
            <h2 className="m4-deck-heading text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] min-w-0">
              <ChemText>{currentSlide.title}</ChemText>
            </h2>
          </div>

          <div className="m4-deck-split space-y-5 sm:space-y-6 min-w-0">
            <section
              aria-label="Poin utama materi"
              className="m4-deck-bullets surface-panel rounded-xl p-3.5 sm:p-5 bg-[var(--surface)] shadow-xs min-w-0"
            >
              <ul className="space-y-2 sm:space-y-2.5">
                {currentSlide.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed min-w-0">
                    <span
                      aria-hidden="true"
                      className="m4-deck-bullet-badge mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-container)]/10 text-[10px] font-bold text-[var(--primary-container)]"
                    >
                      {idx + 1}
                    </span>
                    {formatBulletText(bullet)}
                  </li>
                ))}
              </ul>
            </section>

            {currentSlide.embeddedComponent && (
              <div className="m4-deck-panel min-w-0">
                <XRDSlidePanel variant={currentSlide.embeddedComponent} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── FOOTER NAVIGATION ──────────────────────────────────────────── */}
      <footer className="m4-deck-footer shrink-0 border-t border-[var(--outline-variant)] bg-[var(--surface)]/95 backdrop-blur-md px-3 py-1.5 min-w-0 shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 min-w-0">
          <button
            type="button"
            onClick={() => goToSlide(viewingIdx - 1)}
            disabled={!canGoBack}
            aria-label="Slide sebelumnya"
            className="m4-motion-control inline-flex min-h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--outline-variant)] text-[var(--primary-container)] hover:bg-[var(--surface-container)] disabled:opacity-30"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">
              chevron_left
            </span>
          </button>

          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_M5_REVIEW_DECK_SLIDES}
            aria-valuenow={viewingIdx + 1}
            aria-label={`Slide ${viewingIdx + 1} dari ${TOTAL_M5_REVIEW_DECK_SLIDES}`}
            className="flex flex-1 items-center justify-center gap-1 overflow-x-auto min-w-0 py-0.5 px-1"
          >
            {M5_REVIEW_DECK_SLIDES.map((s, i) => {
              const isViewed = i <= presenterIdx;
              const isCurrent = i === viewingIdx;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToSlide(i)}
                  disabled={!isViewed}
                  aria-label={`Buka slide ${i + 1}: ${s.title}`}
                  className={`h-2 sm:h-2.5 rounded-full transition-all shrink-0 ${
                    isCurrent
                      ? "w-6 sm:w-8 bg-[var(--primary-container)]"
                      : isViewed
                      ? "w-2 sm:w-2.5 bg-[var(--primary-container)]/40 hover:bg-[var(--primary-container)]/70"
                      : "w-2 sm:w-2.5 bg-[var(--outline-variant)]/40 cursor-not-allowed opacity-40"
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <DeckActionDial
              onReturnToPresenter={snapToPresenter}
              canReturnToPresenter={isDrifted}
              driftLabel={
                presenterSlideId
                  ? `Slide ${viewingIdx + 1} (Asisten di Slide ${presenterIdx + 1})`
                  : undefined
              }
              onExit={
                onExit ??
                (exitHref
                  ? () => {
                      window.location.href = exitHref;
                    }
                  : undefined)
              }
            />
            <button
              type="button"
              onClick={() => goToSlide(viewingIdx + 1)}
              disabled={!canGoForward}
              aria-label="Slide berikutnya"
              className="m4-motion-control inline-flex min-h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--outline-variant)] text-[var(--primary-container)] hover:bg-[var(--surface-container)] disabled:opacity-30"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
