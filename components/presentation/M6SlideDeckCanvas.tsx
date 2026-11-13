"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  M6_REVIEW_DECK_SLIDES,
  M6_REVIEW_DECK_SLIDE_BY_ID,
  TOTAL_M6_REVIEW_DECK_SLIDES,
  m6DeckSlideIndex,
  type ReviewDeckSlide,
} from "@/lib/m6-review-deck-data";
import { FTIRSlidePanel } from "@/components/interactives/FTIRSlidePanel";
import { TGASlidePanel, TGA_SLIDE_PANEL_VARIANTS } from "@/components/interactives/TGASlidePanel";
import { useOptionalM3Presentation } from "@/components/shared/M3PresentationProvider";
import { OrientationNudge } from "@/components/shared/OrientationNudge";
import { DeckActionDial } from "@/components/presentation/DeckActionDial";
import { useReducedMotion } from "@/components/shared/useReducedMotion";
import { toggleFullscreen } from "@/lib/fullscreen";
import { useFullscreenStatus } from "@/components/shared/useFullscreenStatus";
import { ChemText } from "@/components/shared/ChemText";
import type { ReviewSlideId } from "@/lib/m3-presentation";

interface M6SlideDeckCanvasProps {
  initialSlideId?: ReviewSlideId;
  exitHref?: string;
  onExit?: () => void;
}

function isTgaPanel(variant: string): variant is (typeof TGA_SLIDE_PANEL_VARIANTS)[number] {
  return (TGA_SLIDE_PANEL_VARIANTS as readonly string[]).includes(variant);
}

function formatBulletText(text: string) {
  const colonIdx = text.indexOf(":");
  if (colonIdx > 0 && colonIdx <= 25) {
    const prefix = text.slice(0, colonIdx).trim();
    const rest = text.slice(colonIdx + 1).trim();
    return (
      <div className="m4-deck-bullet-row min-w-0 flex-1 items-start gap-1.5 sm:gap-2">
        <span className="m4-deck-bullet-key inline-flex items-baseline justify-between shrink-0 font-semibold text-[var(--foreground)] md:w-32 lg:w-40">
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
 * Student deck for the Module 6 (FTIR) review session.
 *
 * Same shell, bounded read-back and relay semantics as the Module 4 deck; it
 * carries no sub-staged slides, data entry or games, so the component is much
 * smaller. The `m4-deck-*` classes are reused deliberately: they are the deck
 * layout primitives in globals.css, not Module 4 content.
 */
export function M6SlideDeckCanvas({
  initialSlideId = "q1",
  exitHref = "/modules/m6-ftir-tga",
  onExit,
}: M6SlideDeckCanvasProps) {
  const presentation = useOptionalM3Presentation();

  const role = presentation?.role ?? "solo";
  const slideRequest = presentation?.slideRequest ?? null;
  const presenterSlideId = (slideRequest?.slideId ?? presentation?.snapshot?.slideId ?? null) as ReviewSlideId | null;
  const roomId = presentation?.roomId ?? "";
  const status = presentation?.status ?? "solo";
  const joinError = presentation?.joinError ?? null;
  const relayMode = presentation?.relayMode ?? false;

  const [viewingId, setViewingId] = useState<ReviewSlideId>(() =>
    presenterSlideId && m6DeckSlideIndex(presenterSlideId) >= 0 ? presenterSlideId : initialSlideId
  );
  const [lastToken, setLastToken] = useState<number | null>(null);
  const [swapDirection, setSwapDirection] = useState<"forward" | "back">("forward");
  const [swapKey, setSwapKey] = useState(0);
  const reducedMotion = useReducedMotion();
  const fullscreen = useFullscreenStatus();
  const slideBodyRef = useRef<HTMLDivElement>(null);

  // Snap to the presenter's slide whenever a new broadcast token arrives.
  // A token carrying another deck's slide id (a student who opened the Module 4
  // deck while a Module 6 session is live) must be ignored, not turned into an
  // index of -1.
  useEffect(() => {
    if (slideRequest && slideRequest.token !== lastToken) {
      setLastToken(slideRequest.token);
      if (m6DeckSlideIndex(slideRequest.slideId) < 0) return;
      setViewingId((current) => {
        const next = m6DeckSlideIndex(slideRequest.slideId);
        setSwapDirection(next < m6DeckSlideIndex(current) ? "back" : "forward");
        return slideRequest.slideId;
      });
      setSwapKey((k) => k + 1);
    }
  }, [slideRequest, lastToken]);

  const viewingIdx = m6DeckSlideIndex(viewingId);
  const isFollowing =
    (role === "following" || role === "presenting") && status === "following" && !presentation?.ended;
  const presenterIdx =
    isFollowing && presenterSlideId && m6DeckSlideIndex(presenterSlideId) >= 0
      ? m6DeckSlideIndex(presenterSlideId)
      : TOTAL_M6_REVIEW_DECK_SLIDES - 1;
  const isDrifted = isFollowing && presenterSlideId !== null && presenterSlideId !== viewingId;

  // Replay the enter animation on every swap (see the Module 4 canvas for why
  // the class has to be detached, forced to reflow, then reattached).
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
      const targetSlide = M6_REVIEW_DECK_SLIDES[clamped];
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

  const returnToPresenter = useCallback(() => {
    if (presenterSlideId) {
      setSwapDirection(m6DeckSlideIndex(presenterSlideId) < viewingIdx ? "back" : "forward");
      setSwapKey((k) => k + 1);
      setViewingId(presenterSlideId);
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    }
  }, [presenterSlideId, viewingIdx, reducedMotion]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "ArrowLeft" && canGoBack) {
        e.preventDefault();
        stepBack();
      } else if ((e.key === "ArrowRight" || e.key === " ") && canGoForward) {
        e.preventDefault();
        stepForward();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canGoBack, canGoForward, stepBack, stepForward, goToSlide]);

  const currentSlide: ReviewDeckSlide =
    M6_REVIEW_DECK_SLIDE_BY_ID[viewingId] || M6_REVIEW_DECK_SLIDES[0];

  const connectionState =
    role === "presenting" || status === "presenting"
      ? "presenting"
      : status === "following"
      ? "following"
      : status === "connecting" || status === "reconnecting"
      ? "connecting"
      : status === "disconnected" || status === "ended" || joinError
      ? "disconnected"
      : "solo";

  return (
    <div
      data-student-slide-deck
      data-deck="m6"
      className="m4-deck-fit m4-deck-compact bg-[var(--surface-container-lowest)] text-[var(--foreground)] flex flex-col justify-between"
    >
      {/* ── TOP BAR ────────────────────────────────────────────────────── */}
      <header className="m4-deck-topbar sticky top-0 z-30 border-b border-[var(--outline-variant)] bg-[var(--surface)]/95 backdrop-blur-md px-3 py-2">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              data-connection-dot
              data-connection-state={connectionState}
              className={`flex h-2.5 w-2.5 rounded-full shrink-0 ${
                status === "following"
                  ? "bg-[var(--primary-container)] animate-pulse"
                  : status === "connecting" || status === "reconnecting"
                  ? "bg-[var(--muted)] animate-pulse"
                  : status === "disconnected" || status === "ended" || joinError
                  ? "bg-[var(--warning-ink)]"
                  : "bg-[var(--primary-container)] animate-pulse"
              }`}
              title={
                status === "following"
                  ? "Terhubung ke asisten"
                  : status === "connecting" || status === "reconnecting"
                  ? "Menyambungkan…"
                  : status === "disconnected" || status === "ended" || joinError
                  ? "Tidak terhubung"
                  : "Mode mandiri"
              }
            />
            <span className="m4-deck-brand text-xs font-bold uppercase tracking-wider text-[var(--primary-container)] truncate">
              KUGU Live Review · Modul 6
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                void toggleFullscreen();
              }}
              aria-label={fullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
              className="m4-motion-control inline-flex min-h-7 px-2 items-center justify-center gap-1 rounded-lg border border-[var(--outline-variant)] text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)]"
              title={fullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">
                {fullscreen ? "fullscreen_exit" : "fullscreen"}
              </span>
              <span className="hidden sm:inline">{fullscreen ? "Normal" : "Layar Penuh"}</span>
            </button>

            <DeckActionDial
              onReturnToPresenter={returnToPresenter}
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
          </div>
        </div>

        {role !== "presenting" && (status === "connecting" || status === "reconnecting") && (
          <div
            data-connection-banner
            data-connection-state="connecting"
            className="mx-auto mt-2 flex max-w-5xl items-center gap-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-3 py-1.5 text-xs min-w-0"
          >
            <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-sm text-[var(--muted)]">
              sync
            </span>
            <span className="truncate text-[var(--text-secondary)]">Menyambungkan ke sesi asisten…</span>
          </div>
        )}

        {role !== "presenting" && (status === "disconnected" || status === "ended" || joinError) && (
          <div
            data-connection-banner
            data-connection-state={status === "ended" ? "ended" : "disconnected"}
            className="mx-auto mt-2 flex max-w-5xl items-center justify-between gap-2 rounded-lg border border-[var(--warning-ink)] bg-[var(--surface-selected)] px-3 py-1.5 text-xs min-w-0"
          >
            <span className="text-[var(--warning-ink)] font-medium truncate">
              {status === "ended"
                ? "Sesi asisten telah berakhir."
                : joinError === "room-not-found"
                ? "Ruang sesi tidak ditemukan."
                : joinError === "unauthorized"
                ? "Tidak memiliki akses ke sesi ini."
                : "Tidak terhubung ke asisten — slide tidak akan mengikuti."}
            </span>
            <button
              type="button"
              onClick={() => presentation?.rejoin?.()}
              className="m4-motion-control inline-flex min-h-7 shrink-0 items-center gap-1 rounded border border-[var(--warning-ink)] px-2 text-[11px] font-bold text-[var(--warning-ink)] hover:bg-[var(--warning-light)]"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-xs">refresh</span>
              <span>Coba lagi</span>
            </button>
          </div>
        )}

        {!relayMode && role === "solo" && status === "solo" && (
          <div
            data-connection-banner
            data-connection-state="local-only"
            className="mx-auto mt-2 flex max-w-5xl items-start gap-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-3 py-1.5 text-xs min-w-0"
          >
            <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-sm text-[var(--muted)]">
              lan
            </span>
            <span className="min-w-0 text-[var(--text-secondary)]">
              Mode lokal: sinkronisasi hanya berjalan di tab/jendela browser yang sama. Untuk praktikan
              di perangkat lain, jalankan sesi lewat relay (WSS).
            </span>
          </div>
        )}
      </header>

      {/* ── MAIN SLIDE CANVAS ──────────────────────────────────────────── */}
      <main className="m4-deck-slidebody flex-1 px-3 py-2 sm:px-4 min-w-0 overflow-y-auto">
        <div
          ref={slideBodyRef}
          className={`mx-auto max-w-4xl space-y-5 sm:space-y-6 min-w-0 ${
            reducedMotion ? "" : swapDirection === "back" ? "m4-slide-enter-back" : "m4-slide-enter-forward"
          }`}
          data-slide-direction={swapDirection}
        >
          {/* Slide header */}
          <div className="m4-deck-chapter space-y-1 sm:space-y-1.5 border-b border-[var(--outline-variant)] pb-2 sm:pb-4 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded bg-[var(--primary-container)]/10 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  {currentSlide.chapterLabel}
                </span>
                <span className="m4-deck-counter text-xs font-semibold tabular-nums text-[var(--muted)]">
                  Slide {viewingIdx + 1} dari {TOTAL_M6_REVIEW_DECK_SLIDES}
                </span>
              </div>
              {currentSlide.rubric && (
                <span
                  data-slide-rubric-badge
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--secondary)]/40 bg-[var(--surface-selected)] px-2 py-0.5 text-[10px] font-bold text-[var(--secondary)]"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[11px]">
                    assignment
                  </span>
                  Poin {currentSlide.rubric.code}
                  {currentSlide.rubric.points ? ` (${currentSlide.rubric.points} pt)` : ""}
                </span>
              )}
            </div>
            <h2 className="m4-deck-heading text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] min-w-0">
              <ChemText>{currentSlide.title}</ChemText>
            </h2>
          </div>

          {/* Bullets + embedded panel */}
          <div className="m4-deck-split space-y-5 sm:space-y-6 min-w-0">
            <section
              aria-label="Poin utama materi"
              className="m4-deck-bullets surface-panel rounded-xl p-3.5 sm:p-5 bg-[var(--surface)] shadow-xs min-w-0"
            >
              <ul className="m4-deck-bullet-list space-y-2">
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
              <div className="m4-deck-panel min-w-0 h-full">
                {isTgaPanel(currentSlide.embeddedComponent) ? (
                  <TGASlidePanel variant={currentSlide.embeddedComponent} />
                ) : (
                  <FTIRSlidePanel variant={currentSlide.embeddedComponent} />
                )}
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
            aria-valuemax={TOTAL_M6_REVIEW_DECK_SLIDES}
            aria-valuenow={viewingIdx + 1}
            aria-label={`Slide ${viewingIdx + 1} dari ${TOTAL_M6_REVIEW_DECK_SLIDES}`}
            className="flex flex-1 items-center justify-center gap-1 overflow-x-auto min-w-0 py-0.5 px-1"
          >
            {M6_REVIEW_DECK_SLIDES.map((s, i) => {
              const isViewed = i <= presenterIdx;
              const isCurrent = i === viewingIdx;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!isViewed}
                  onClick={() => goToSlide(i)}
                  aria-label={`Slide ${i + 1}: ${s.title}`}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`h-2.5 rounded-full transition-all shrink-0 ${
                    isCurrent
                      ? "w-5 sm:w-6 bg-[var(--primary-container)]"
                      : isViewed
                      ? "w-2.5 bg-[var(--outline)]"
                      : "w-2.5 bg-[var(--surface-container-high)]"
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="m4-deck-counter text-[11px] font-semibold tabular-nums text-[var(--muted)]">
              {viewingIdx + 1}/{TOTAL_M6_REVIEW_DECK_SLIDES}
            </span>
            <button
              type="button"
              onClick={() => goToSlide(viewingIdx + 1)}
              disabled={!canGoForward}
              aria-label="Slide berikutnya"
              className="m4-motion-control inline-flex min-h-8 w-8 items-center justify-center rounded-lg border border-[var(--outline-variant)] text-[var(--primary-container)] hover:bg-[var(--surface-container)] disabled:opacity-30"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </footer>

      <OrientationNudge />
    </div>
  );
}
