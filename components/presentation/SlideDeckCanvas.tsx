"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  REVIEW_DECK_SLIDES,
  REVIEW_DECK_SLIDE_BY_ID,
  TOTAL_REVIEW_DECK_SLIDES,
  deckSlideIndex,
  type ReviewDeckSlide,
} from "@/lib/m4-review-deck-data";
import { SnBiPotentialGapDiagram } from "@/components/interactives/SnBiPotentialGapDiagram";
import { ElectrolyteFunctionCard } from "@/components/interactives/ElectrolyteFunctionCard";
import { ElectrochemicalCellExplorer } from "@/components/interactives/ElectrochemicalCellExplorer";
import { ReviewDataChart } from "@/components/shared/ReviewDataChart";
import { ReportFormatGuide } from "@/components/shared/ReportFormatGuide";
import { ReviewGames } from "@/components/shared/ReviewGames";
import { useOptionalM3Presentation } from "@/components/shared/M3PresentationProvider";
import { OrientationNudge } from "@/components/shared/OrientationNudge";
import type { ReviewSlideId } from "@/lib/m3-presentation";

interface SlideDeckCanvasProps {
  initialSlideId?: ReviewSlideId;
  exitHref?: string;
  onExit?: () => void;
}

export function SlideDeckCanvas({
  initialSlideId = "p1",
  exitHref = "/modules/m4-sn-bi-electrodeposition",
  onExit,
}: SlideDeckCanvasProps) {
  const presentation = useOptionalM3Presentation();

  const role = presentation?.role ?? "solo";
  const slideRequest = presentation?.slideRequest ?? null;
  const presenterSlideId = (slideRequest?.slideId ?? presentation?.snapshot?.slideId ?? null) as ReviewSlideId | null;
  const dataSetId = presentation?.snapshot?.dataSetId ?? null;
  const roomId = presentation?.roomId ?? "";

  const [viewingId, setViewingId] = useState<ReviewSlideId>(presenterSlideId ?? initialSlideId);
  const [lastToken, setLastToken] = useState<number | null>(null);

  // Automatically snap to presenter position when a new broadcast token arrives
  useEffect(() => {
    if (slideRequest && slideRequest.token !== lastToken) {
      setLastToken(slideRequest.token);
      setViewingId(slideRequest.slideId);
    }
  }, [slideRequest, lastToken]);

  const viewingIdx = deckSlideIndex(viewingId);
  const presenterIdx = presenterSlideId ? deckSlideIndex(presenterSlideId) : viewingIdx;
  const isDrifted = presenterSlideId !== null && presenterSlideId !== viewingId;

  // Bounded read-back logic
  const canGoBack = viewingIdx > 0;
  const canGoForward = viewingIdx < presenterIdx;

  const goToSlide = useCallback(
    (targetIdx: number) => {
      const clamped = Math.max(0, Math.min(presenterIdx, targetIdx));
      const targetSlide = REVIEW_DECK_SLIDES[clamped];
      if (targetSlide) {
        setViewingId(targetSlide.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [presenterIdx]
  );

  const returnToPresenter = useCallback(() => {
    if (presenterSlideId) {
      setViewingId(presenterSlideId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [presenterSlideId]);

  // Keyboard navigation: Arrow keys & Space (bounded read-back)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "ArrowLeft" && canGoBack) {
        e.preventDefault();
        goToSlide(viewingIdx - 1);
      } else if ((e.key === "ArrowRight" || e.key === " ") && canGoForward) {
        e.preventDefault();
        goToSlide(viewingIdx + 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canGoBack, canGoForward, goToSlide, viewingIdx]);

  const currentSlide: ReviewDeckSlide = REVIEW_DECK_SLIDE_BY_ID[viewingId] || REVIEW_DECK_SLIDES[0];

  return (
    <div
      data-student-slide-deck
      className="min-h-screen bg-[var(--surface-container-lowest)] text-[var(--foreground)] flex flex-col justify-between overflow-x-hidden relative"
    >
      {/* ── TOP BAR / HEADER ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[var(--outline-variant)] bg-[var(--surface)]/95 backdrop-blur-md px-3 py-2">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--primary-container)] animate-pulse shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)] truncate">
              KUGU Live Review · Modul 4
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentSlide.rubric && (
              <span
                data-slide-rubric-badge
                className="inline-flex items-center gap-1 rounded-full bg-[var(--secondary-container)]/70 px-2.5 py-0.5 text-xs font-bold text-[var(--on-secondary-container)]"
                title={`Target Rubrik Laporan: ${currentSlide.rubric.label}`}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-sm">
                  assignment
                </span>
                <span>Poin {currentSlide.rubric.code}</span>
                {currentSlide.rubric.points && (
                  <span className="text-[10px] opacity-80 hidden sm:inline">({currentSlide.rubric.points} pt)</span>
                )}
              </span>
            )}

            {onExit ? (
              <button
                type="button"
                onClick={onExit}
                className="m4-motion-control inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--outline-variant)] px-2.5 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)]"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-sm">
                  close
                </span>
                <span>Keluar ke Modul</span>
              </button>
            ) : (
              <Link
                href={exitHref}
                className="m4-motion-control inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--outline-variant)] px-2.5 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)]"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-sm">
                  close
                </span>
                <span>Keluar ke Modul</span>
              </Link>
            )}
          </div>
        </div>

        {/* Drift alert banner if student browsed back */}
        {isDrifted && (
          <div
            data-slide-drift-banner
            className="mx-auto mt-2 flex max-w-5xl items-center justify-between gap-2 rounded-lg border border-[var(--warning-ink)] bg-[var(--surface-selected)] px-3 py-1.5 text-xs min-w-0"
          >
            <span className="text-[var(--warning-ink)] font-medium truncate">
              Slide {viewingIdx + 1} (Asisten di Slide {presenterIdx + 1})
            </span>
            <button
              type="button"
              onClick={returnToPresenter}
              className="m4-motion-control inline-flex min-h-7 shrink-0 items-center gap-1 rounded border border-[var(--warning-ink)] px-2 text-[11px] font-bold text-[var(--warning-ink)] hover:bg-[var(--warning-light)]"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-xs">
                my_location
              </span>
              <span>Kembali</span>
            </button>
          </div>
        )}
      </header>

      {/* ── MAIN SLIDE CANVAS ────────────────────────────────────────────── */}
      <main className="flex-1 px-3 py-5 sm:px-4 md:py-8 pb-28 min-w-0 overflow-x-hidden">
        <div className="mx-auto max-w-4xl space-y-5 sm:space-y-6 min-w-0">
          {/* Slide Header Card */}
          <div className="space-y-1.5 border-b border-[var(--outline-variant)] pb-3 sm:pb-4 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[var(--primary-container)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--primary-container)]">
                {currentSlide.chapterLabel}
              </span>
              <span className="text-xs font-semibold tabular-nums text-[var(--muted)]">
                Slide {viewingIdx + 1} dari {TOTAL_REVIEW_DECK_SLIDES}
              </span>
            </div>
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--primary)] leading-tight break-words"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {currentSlide.title}
            </h1>
          </div>

          {/* Core Slide Takeaway Bullets Card */}
          <section
            aria-label="Poin utama materi"
            className="surface-panel rounded-xl p-3.5 sm:p-5 md:p-6 space-y-3 bg-[var(--surface)] shadow-xs min-w-0"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Poin Penting untuk Pemahaman &amp; Laporan
            </h2>
            <ul className="space-y-2">
              {currentSlide.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
                  <span
                    aria-hidden="true"
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-container)]/10 text-xs font-bold text-[var(--primary-container)] mt-0.5"
                  >
                    ✓
                  </span>
                  <span className="min-w-0 break-words">{bullet}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Embedded Interactive Simulations / Panels based on active slide */}
          {currentSlide.embeddedComponent === "potential-gap" && (
            <div className="space-y-2 min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Diagram Interaktif Beda Potensial
              </h2>
              <SnBiPotentialGapDiagram />
            </div>
          )}

          {currentSlide.embeddedComponent === "electrolyte-function" && (
            <div className="space-y-2 min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Eksplorasi Komponen &amp; Urutan Elektrolit
              </h2>
              <ElectrolyteFunctionCard />
            </div>
          )}

          {currentSlide.embeddedComponent === "cell-explorer" && (
            <div className="space-y-2 min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Rangkaian Sel Elektrokimia Kodeposisi
              </h2>
              <ElectrochemicalCellExplorer />
            </div>
          )}

          {currentSlide.embeddedComponent === "data-entry" && (
            <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-5 text-center space-y-3 min-w-0">
              <span aria-hidden="true" className="material-symbols-outlined text-4xl text-[var(--primary-container)]">
                hourglass_top
              </span>
              <h2 className="text-base font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Pengumpulan Data Eksperimen Kelas
              </h2>
              <p className="max-w-md mx-auto text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Asisten praktikum sedang menginput data penimbangan dari masing-masing kelompok meja kerja. Grafik perbandingan efisiensi arus akan segera ditampilkan secara langsung.
              </p>
            </div>
          )}

          {currentSlide.embeddedComponent === "data-chart" && (
            <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4 sm:p-5 space-y-4 min-w-0">
              <h2 className="text-sm font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Grafik Perbandingan Efisiensi Arus Antar Kelompok
              </h2>
              {dataSetId ? (
                <ReviewDataChart dataSetId={dataSetId} />
              ) : (
                <p className="text-xs text-[var(--muted)] text-center py-4">
                  Menunggu asisten mempublikasikan data hasil perhitungan kelompok…
                </p>
              )}
            </div>
          )}

          {currentSlide.embeddedComponent === "report-format" && (
            <div className="space-y-2 min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Rubrik Penilaian Laporan Lengkap
              </h2>
              <ReportFormatGuide />
            </div>
          )}

          {currentSlide.embeddedComponent === "games" && roomId && (
            <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-3 sm:p-5 shadow-xs min-w-0">
              <ReviewGames roomId={roomId} />
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER / SLIDE NAVIGATION RAIL (ALWAYS PINNED TO SCREEN BOTTOM) ───────────────── */}
      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--outline-variant)] bg-[var(--surface)]/95 backdrop-blur-md px-3 py-2.5 min-w-0 shadow-lg">
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

          {/* Interactive Slide Progress Dots (Bounded read-back) */}
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_REVIEW_DECK_SLIDES}
            aria-valuenow={viewingIdx + 1}
            aria-label={`Slide ${viewingIdx + 1} dari ${TOTAL_REVIEW_DECK_SLIDES}`}
            className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1 py-1 px-1 justify-center"
          >
            {REVIEW_DECK_SLIDES.map((s, i) => {
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
                      ? "w-2 sm:w-2.5 bg-[var(--primary-fixed-dim)] hover:bg-[var(--primary-container)]"
                      : "w-1.5 sm:w-2 bg-[var(--outline-variant)] cursor-not-allowed opacity-40"
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] sm:text-xs font-bold tabular-nums text-[var(--muted)]">
              {viewingIdx + 1}/{TOTAL_REVIEW_DECK_SLIDES}
            </span>

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

      {/* Landscape suggestion — advisory only, never blocks the deck.
          Mounted here (student canvas) rather than in PresenterConsole, so only
          students following on a phone see it. */}
      <OrientationNudge />
    </div>
  );
}
