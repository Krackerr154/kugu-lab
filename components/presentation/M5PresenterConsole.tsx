"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  M5_REVIEW_DECK_SLIDES,
  M5_REVIEW_DECK_SLIDE_BY_ID,
  TOTAL_M5_REVIEW_DECK_SLIDES,
  m5DeckSlideIndex,
  type ReviewDeckSlide,
} from "@/lib/m5-review-deck-data";
import { M5_REVIEW_CHAPTERS } from "@/lib/m5-review-slides";
import { XRDSlidePanel } from "@/components/interactives/XRDSlidePanel";
import { useM3Presentation } from "@/components/shared/M3PresentationProvider";
import { ChemText } from "@/components/shared/ChemText";
import type { ReviewSlideId } from "@/lib/m3-presentation";

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Assistant console for the Module 5 (XRD) review session.
 *
 * Two-pane workstation: live slide on the left, teleprompter and teaching
 * notes on the right.
 */
export function M5PresenterConsole() {
  const {
    role,
    status,
    snapshot,
    audienceCount,
    closeSession,
    presentSlide,
  } = useM3Presentation();

  const currentSlideId = (snapshot?.slideId ?? "s1") as ReviewSlideId;
  const resolvedIndex = m5DeckSlideIndex(currentSlideId);
  const currentSlideIndex = resolvedIndex >= 0 ? resolvedIndex : 0;
  const currentSlide: ReviewDeckSlide =
    M5_REVIEW_DECK_SLIDE_BY_ID[currentSlideId] || M5_REVIEW_DECK_SLIDES[0];

  const nextSlideIndex = Math.min(TOTAL_M5_REVIEW_DECK_SLIDES - 1, currentSlideIndex + 1);
  const nextSlide: ReviewDeckSlide = M5_REVIEW_DECK_SLIDES[nextSlideIndex];
  const hasNextSlide = currentSlideIndex < TOTAL_M5_REVIEW_DECK_SLIDES - 1;
  const hasPrevSlide = currentSlideIndex > 0;

  // Session elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(TOTAL_M5_REVIEW_DECK_SLIDES - 1, index));
      const target = M5_REVIEW_DECK_SLIDES[clamped];
      if (target) presentSlide(target.id);
    },
    [presentSlide]
  );

  const stepForward = useCallback(() => {
    if (hasNextSlide) goToSlide(currentSlideIndex + 1);
  }, [hasNextSlide, goToSlide, currentSlideIndex]);

  const stepBack = useCallback(() => {
    if (hasPrevSlide) goToSlide(currentSlideIndex - 1);
  }, [hasPrevSlide, goToSlide, currentSlideIndex]);

  // Keyboard control for the assistant
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        stepForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBack();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(0);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stepForward, stepBack, goToSlide]);

  return (
    <div
      data-presenter-console
      data-deck="m5"
      className="min-h-screen flex flex-col bg-[var(--surface-container-low)] text-[var(--foreground)]"
    >
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[var(--outline-variant)] bg-[var(--surface)]/95 px-4 py-2.5 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--chart-red)] animate-pulse" />
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-[var(--foreground)] truncate">
                Sesi Praktikum KI3131 · Modul 5 XRD
              </h1>
              <p className="text-[11px] text-[var(--muted)]">
                {role === "presenting" ? "Menyiarkan" : status} · {audienceCount} praktikan terhubung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--outline-variant)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--text-secondary)]">
              <span aria-hidden="true" className="material-symbols-outlined text-base text-[var(--muted)]">
                timer
              </span>
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            <Link
              href="/modules/m5-xrd/presentation"
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

            <button
              type="button"
              onClick={closeSession}
              className="m4-motion-control inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--danger)] px-3 text-xs font-bold text-[var(--danger)] hover:bg-[var(--danger)]/10"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">
                stop_circle
              </span>
              <span>Tutup Sesi</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── DUAL PANE BODY ─────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-4 md:py-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: what the students see */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--outline-variant)] pb-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[var(--primary-container)]/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  {currentSlide.chapterLabel}
                </span>
                <span className="text-xs font-semibold text-[var(--muted)] tabular-nums">
                  Slide {currentSlideIndex + 1} dari {TOTAL_M5_REVIEW_DECK_SLIDES}
                </span>
              </div>
              <span className="text-xs font-semibold text-[var(--muted)]">
                Tampilan Langsung di Layar Praktikan
              </span>
            </div>

            <h2
              className="text-2xl font-bold leading-tight text-[var(--primary)]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              <ChemText>{currentSlide.title}</ChemText>
            </h2>

            <div className="surface-panel rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Poin Slide Praktikan
              </h3>
              <ul className="space-y-2">
                {currentSlide.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm leading-relaxed text-[var(--text-secondary)]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-container)]/10 text-[10px] font-bold text-[var(--primary-container)]"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {currentSlide.embeddedComponent && (
              <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-3">
                <XRDSlidePanel variant={currentSlide.embeddedComponent} />
              </div>
            )}
          </div>

          {/* RIGHT: teleprompter + notes */}
          <div className="lg:col-span-5 space-y-4">
            <section
              aria-label="Pemandu bicara asisten"
              className="rounded-xl border-2 border-[var(--primary-container)] bg-[var(--surface)] p-4 sm:p-5 shadow-sm space-y-2.5"
            >
              <div className="flex items-center gap-2 text-[var(--primary-container)]">
                <span aria-hidden="true" className="material-symbols-outlined text-xl">
                  mic
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Apa yang Disampaikan ke Praktikan
                </h3>
              </div>
              <p className="text-base sm:text-lg leading-relaxed text-[var(--foreground)] font-medium bg-[var(--surface-container-low)] p-3 rounded-lg border border-[var(--outline-variant)]/60">
                &ldquo;{currentSlide.script}&rdquo;
              </p>
            </section>

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

            {/* Chapter rail */}
            <nav
              aria-label="Peta bab sesi"
              className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-3.5 space-y-2"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Peta Bab</h3>
              {M5_REVIEW_CHAPTERS.map((chapter) => (
                <div key={chapter.chapter} className="space-y-1">
                  <p className="text-[11px] font-bold text-[var(--foreground)]">{chapter.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {chapter.slides.map((s) => {
                      const active = s.id === currentSlideId;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => presentSlide(s.id)}
                          aria-current={active ? "true" : undefined}
                          className={`m4-motion-control min-h-8 rounded-md border px-2 text-[11px] font-semibold tabular-nums transition-colors ${
                            active
                              ? "border-[var(--primary-container)] bg-[var(--primary-container)] text-[var(--on-primary)]"
                              : "border-[var(--outline-variant)] text-[var(--text-secondary)] hover:bg-[var(--surface-container)]"
                          }`}
                          title={s.title}
                        >
                          {m5DeckSlideIndex(s.id) + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="sticky bottom-0 z-30 border-t border-[var(--outline-variant)] bg-[var(--surface)]/95 px-4 py-2.5 backdrop-blur-md shadow-lg">
        <div className="mx-auto max-w-7xl flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 max-w-md items-center gap-2 text-xs">
              <span className="shrink-0 font-bold uppercase tracking-wider text-[var(--muted)]">Berikut:</span>
              <span className="truncate font-semibold text-[var(--foreground)]">
                {hasNextSlide ? nextSlide.title : "Sesi selesai"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={stepBack}
                disabled={!hasPrevSlide}
                aria-label="Slide sebelumnya"
                className="m4-motion-control inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] disabled:opacity-30"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  chevron_left
                </span>
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                onClick={stepForward}
                disabled={!hasNextSlide}
                aria-label="Slide berikutnya"
                className="m4-motion-control inline-flex min-h-9 items-center gap-1 rounded-lg bg-[var(--primary-container)] px-3.5 text-xs font-bold text-[var(--on-primary)] hover:bg-[var(--primary-container)]/90 disabled:opacity-30"
              >
                <span>Berikutnya</span>
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
