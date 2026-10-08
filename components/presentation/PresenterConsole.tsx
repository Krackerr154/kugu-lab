"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  REVIEW_DECK_SLIDES,
  REVIEW_DECK_SLIDE_BY_ID,
  TOTAL_REVIEW_DECK_SLIDES,
  deckSlideIndex,
  type ReviewDeckSlide,
} from "@/lib/m4-review-deck-data";
import { REVIEW_CHAPTERS } from "@/lib/m4-review-slides";
import { ElectrodepositionDiagram } from "@/components/interactives/ElectrodepositionDiagram";
import { SnBiPotentialGapDiagram } from "@/components/interactives/SnBiPotentialGapDiagram";
import { ElectrolyteFunctionCard } from "@/components/interactives/ElectrolyteFunctionCard";
import { ElectrochemicalCellExplorer } from "@/components/interactives/ElectrochemicalCellExplorer";
import { ReportFormatGuide } from "@/components/shared/ReportFormatGuide";
import { ReviewDataChart } from "@/components/shared/ReviewDataChart";
import { AsprakDataEntry } from "@/components/shared/AsprakDataEntry";
import { AsprakGamesPanel } from "@/components/shared/AsprakGamesPanel";
import { useM3Presentation } from "@/components/shared/M3PresentationProvider";
import type { ReviewSlideId } from "@/lib/m3-presentation";

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function PresenterConsole() {
  const {
    role,
    status,
    snapshot,
    audienceCount,
    activeSession,
    createSession,
    closeSession,
    presentSlide,
    presentStage,
    presentDataSet,
    roomId,
  } = useM3Presentation();

  const currentSlideId = (snapshot?.slideId ?? "p1") as ReviewSlideId;
  const currentSlideIndex = deckSlideIndex(currentSlideId);
  const currentSlide: ReviewDeckSlide = REVIEW_DECK_SLIDE_BY_ID[currentSlideId] || REVIEW_DECK_SLIDES[0];

  const nextSlideIndex = Math.min(TOTAL_REVIEW_DECK_SLIDES - 1, currentSlideIndex + 1);
  const nextSlide: ReviewDeckSlide = REVIEW_DECK_SLIDES[nextSlideIndex];
  const hasNextSlide = currentSlideIndex < TOTAL_REVIEW_DECK_SLIDES - 1;
  const hasPrevSlide = currentSlideIndex > 0;

  // Session elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    if (role !== "presenting") return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [role]);

  // Slide navigation callback
  const goToSlide = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(TOTAL_REVIEW_DECK_SLIDES - 1, index));
      const target = REVIEW_DECK_SLIDES[clamped];
      if (target) {
        presentSlide(target.id);
      }
    },
    [presentSlide]
  );

  // Keyboard navigation handler with input suppression
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = document.activeElement?.tagName.toLowerCase();
      if (target === "input" || target === "textarea" || target === "select") {
        return;
      }

      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        if (hasNextSlide) goToSlide(currentSlideIndex + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        if (hasPrevSlide) goToSlide(currentSlideIndex - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToSlide(TOTAL_REVIEW_DECK_SLIDES - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex, hasNextSlide, hasPrevSlide, goToSlide]);

  const isDataSlide = currentSlide.kind === "data";
  const isClosingSlide = currentSlide.kind === "closing";
  const publishedDataSetId = snapshot?.dataSetId ?? null;

  return (
    <div
      data-presenter-console
      className="min-h-screen bg-[var(--surface-container-lowest)] text-[var(--foreground)] flex flex-col justify-between"
    >
      {/* ── TOP CONTROL BAR ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[var(--outline-variant)] bg-[var(--surface)]/95 px-4 py-2.5 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-3 w-3 rounded-full bg-[var(--primary-container)] animate-pulse shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Mode Pemandu Asisten
                </span>
                <span className="rounded-full bg-[var(--surface-selected)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary-container)]">
                  Live
                </span>
              </div>
              <span className="font-bold text-sm text-[var(--foreground)] truncate block">
                {activeSession?.name || "Sesi Praktikum KI3131"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live audience count */}
            <div
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]"
              title={`${audienceCount} praktikan terhubung ke sesi ini`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base text-[var(--primary-container)]">
                group
              </span>
              <span>
                <strong className="text-[var(--primary-container)]">{audienceCount}</strong> Praktikan
              </span>
            </div>

            {/* Session Timer */}
            <div
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-1.5 text-xs font-mono font-bold tabular-nums text-[var(--foreground)]"
              title="Durasi sesi review berjalan"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base text-[var(--muted)]">
                timer
              </span>
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            {/* Open student view in new tab */}
            <Link
              href="/modules/m4-sn-bi-electrodeposition/presentation"
              target="_blank"
              rel="noreferrer"
              className="m4-motion-control inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)]"
              title="Buka pratinjau tampilan yang dilihat praktikan pada tab baru"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">
                open_in_new
              </span>
              <span className="hidden sm:inline">Layar Praktikan</span>
            </Link>

            {/* End Session Button */}
            <button
              type="button"
              onClick={closeSession}
              className="m4-motion-control inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--danger,#ef4444)] px-3 text-xs font-bold text-[var(--danger,#ef4444)] hover:bg-[var(--danger,#ef4444)]/10"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">
                stop_circle
              </span>
              <span>Tutup Sesi</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── WORKSTATION DUAL-PANE BODY ─────────────────────────────────────── */}
      <main className="flex-1 px-4 py-4 md:py-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── LEFT PANE: LIVE CURRENT SLIDE DISPLAY (7 Cols) ───────────── */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--outline-variant)] pb-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[var(--primary-container)]/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  {currentSlide.chapterLabel}
                </span>
                <span className="text-xs font-semibold text-[var(--muted)] tabular-nums">
                  Slide {currentSlideIndex + 1} dari {TOTAL_REVIEW_DECK_SLIDES}
                </span>
              </div>
              <span className="text-xs font-semibold text-[var(--muted)]">
                Tampilan Langsung di Layar Praktikan
              </span>
            </div>

            {/* Slide Title */}
            <h1
              className="text-2xl font-bold text-[var(--primary)] leading-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {currentSlide.title}
            </h1>

            {/* Takeaways Card */}
            <div className="surface-panel rounded-xl p-4 bg-[var(--surface)] border border-[var(--outline-variant)] space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Poin Slide Praktikan
              </h2>
              <ul className="space-y-2">
                {currentSlide.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    <span
                      aria-hidden="true"
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--primary-container)]/10 text-[10px] font-bold text-[var(--primary-container)] mt-0.5"
                    >
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Embedded Active Diagram Preview */}
            {currentSlide.embeddedComponent === "electrodeposition-diagram" && (
              <div className="min-w-0">
                <ElectrodepositionDiagram />
              </div>
            )}

            {currentSlide.embeddedComponent === "potential-gap" && (
              <div className="min-w-0">
                <SnBiPotentialGapDiagram />
              </div>
            )}

            {currentSlide.embeddedComponent === "electrolyte-function" && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Fungsi &amp; Urutan Komponen Elektrolit
                </h3>
                <ElectrolyteFunctionCard />
              </div>
            )}

            {currentSlide.embeddedComponent === "cell-explorer" && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Sel Elektrokimia
                </h3>
                <ElectrochemicalCellExplorer />
              </div>
            )}

            {currentSlide.embeddedComponent === "report-format" && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Rubrik Penilaian Laporan Lengkap
                </h3>
                <ReportFormatGuide />
              </div>
            )}

            {/* If data slide, show live computed chart on the left when published */}
            {isDataSlide && publishedDataSetId && (
              <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Grafik Efisiensi yang Ditampilkan ke Praktikan
                </h3>
                <ReviewDataChart dataSetId={publishedDataSetId} />
              </div>
            )}
          </div>

          {/* ── RIGHT PANE: TELEPROMPTER, NOTES & DEDICATED TOOLS (5 Cols) ── */}
          <div className="lg:col-span-5 space-y-4">
            {/* Teleprompter Card */}
            <section
              aria-label="Pemandu bicara asisten"
              className="rounded-xl border-2 border-[var(--primary-container)] bg-[var(--surface)] p-4 sm:p-5 shadow-sm space-y-2.5"
            >
              <div className="flex items-center gap-2 text-[var(--primary-container)]">
                <span aria-hidden="true" className="material-symbols-outlined text-xl">
                  mic
                </span>
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  Apa yang Disampaikan ke Praktikan
                </h2>
              </div>
              <p className="text-base sm:text-lg leading-relaxed text-[var(--foreground)] font-medium bg-[var(--surface-container-low)] p-3 rounded-lg border border-[var(--outline-variant)]/60">
                &ldquo;{currentSlide.script}&rdquo;
              </p>
            </section>

            {/* Rubrik Target Badge Card */}
            {currentSlide.rubric && (
              <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">
                    grade
                  </span>
                  <span>Target Rubrik Laporan</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-sm text-[var(--foreground)]">
                    Poin {currentSlide.rubric.code} — {currentSlide.rubric.label}
                  </span>
                  {currentSlide.rubric.points && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-[var(--surface-selected)] text-[var(--primary-container)]">
                      {currentSlide.rubric.points} Poin
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Pedagogical Notes / Pitfalls Card */}
            {currentSlide.pedagogicalNotes && (
              <div className="rounded-xl border border-[var(--warning-ink)]/40 bg-[var(--surface-selected)] p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--warning-ink)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">
                    warning
                  </span>
                  <span>Catatan Asisten &amp; Peringatan Kritis</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-[var(--foreground)]">
                  {currentSlide.pedagogicalNotes}
                </p>
              </div>
            )}

            {/* Data Entry Panel (Kept persistently mounted so inputs survive slide navigation) */}
            <div className={isDataSlide ? "block space-y-2" : "hidden"}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Borang Input Data Kelompok
              </h2>
              <AsprakDataEntry
                onPublished={(dataSetId) => presentDataSet(dataSetId)}
              />
            </div>

            {/* Games Panel on Slide 19 */}
            {isClosingSlide && roomId && (
              <div className="rounded-xl border border-[var(--primary-container)] bg-[var(--surface)] p-4 space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Kendali Games Kuis Pemahaman
                </h2>
                <AsprakGamesPanel roomId={roomId} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── FOOTER: NAVIGATION, TIMELINE & NEXT SLIDE PREVIEW ──────────────── */}
      <footer className="sticky bottom-0 z-30 border-t border-[var(--outline-variant)] bg-[var(--surface)]/95 px-4 py-2.5 backdrop-blur-md shadow-lg">
        <div className="mx-auto max-w-7xl flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Next Slide Executive Summary */}
            <div className="flex items-center gap-2 min-w-0 max-w-md text-xs truncate">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] shrink-0">
                Berikutnya:
              </span>
              <span className="font-semibold text-[var(--foreground)] truncate">
                Slide {nextSlideIndex + 1} · {nextSlide.title}
              </span>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToSlide(currentSlideIndex - 1)}
                disabled={!hasPrevSlide}
                aria-label="Slide sebelumnya"
                className="m4-motion-control inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] disabled:opacity-30"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  chevron_left
                </span>
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <span className="px-2 text-xs font-bold tabular-nums text-[var(--foreground)]">
                {currentSlideIndex + 1} / {TOTAL_REVIEW_DECK_SLIDES}
              </span>

              <button
                type="button"
                onClick={() => goToSlide(currentSlideIndex + 1)}
                disabled={!hasNextSlide}
                aria-label="Slide berikutnya"
                className="m4-motion-control inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--primary-container)] bg-[var(--primary-container)] px-3.5 text-xs font-bold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-30"
              >
                <span>Berikutnya</span>
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* Quick-Jump Timeline by Chapters */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 border-t border-[var(--outline-variant)]/60 text-xs">
            {REVIEW_CHAPTERS.map((chapter) => (
              <div key={chapter.chapter} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => presentStage(chapter.chapter)}
                  className={`min-h-5 rounded px-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    currentSlide.chapter === chapter.chapter
                      ? "bg-[var(--primary-container)] text-[var(--on-primary)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-container)]"
                  }`}
                >
                  {chapter.label.split(" ")[0]}
                </button>

                <div className="flex items-center gap-0.5">
                  {chapter.slides.map((s) => {
                    const i = deckSlideIndex(s.id);
                    const active = s.id === currentSlideId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => goToSlide(i)}
                        aria-pressed={active}
                        aria-label={`Lompat ke slide ${i + 1}: ${s.title}`}
                        className={`h-5 min-w-5 rounded px-1 text-[10px] font-semibold tabular-nums transition-colors ${
                          active
                            ? "bg-[var(--primary-container)] text-[var(--on-primary)] font-bold shadow-xs"
                            : "bg-[var(--surface-container)] text-[var(--text-secondary)] hover:bg-[var(--surface-container-high)]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
