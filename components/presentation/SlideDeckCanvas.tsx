"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  REVIEW_DECK_SLIDES,
  REVIEW_DECK_SLIDE_BY_ID,
  TOTAL_REVIEW_DECK_SLIDES,
  deckSlideIndex,
  type ReviewDeckSlide,
} from "@/lib/m4-review-deck-data";
import { SnBiPotentialGapDiagram } from "@/components/interactives/SnBiPotentialGapDiagram";
import { ElectrodepositionDiagram } from "@/components/interactives/ElectrodepositionDiagram";
import { ComplexingEffectWorkbench } from "@/components/interactives/ComplexingEffectWorkbench";
import { ElectrolyteSolutionsCards } from "@/components/interactives/ElectrolyteSolutionsCards";
import { ReviewDataChart } from "@/components/shared/ReviewDataChart";
import { ReportFormatGuide } from "@/components/shared/ReportFormatGuide";
import { ReviewGames } from "@/components/shared/ReviewGames";
import { useOptionalM3Presentation } from "@/components/shared/M3PresentationProvider";
import { OrientationNudge } from "@/components/shared/OrientationNudge";
import { DeckActionDial } from "@/components/presentation/DeckActionDial";
import { useReducedMotion } from "@/components/shared/useReducedMotion";
import type { ReviewSlideId } from "@/lib/m3-presentation";

interface SlideDeckCanvasProps {
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
  const numberMatch = text.match(/^(\d+\.\s*)(.*)$/);
  if (numberMatch) {
    return (
      <div className="flex items-start gap-1.5 sm:gap-2 min-w-0 flex-1">
        <span className="w-5 sm:w-6 shrink-0 font-semibold text-[var(--foreground)]">{numberMatch[1]}</span>
        <span className="min-w-0 flex-1 break-words">{numberMatch[2]}</span>
      </div>
    );
  }
  return <span className="min-w-0 flex-1 break-words">{text}</span>;
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
  const status = presentation?.status ?? "solo";
  const joinError = presentation?.joinError ?? null;
  const relayMode = presentation?.relayMode ?? false;

  const [viewingId, setViewingId] = useState<ReviewSlideId>(presenterSlideId ?? initialSlideId);
  const [lastToken, setLastToken] = useState<number | null>(null);
  // Direction of the last slide change, so the transition can travel the same
  // way the user moved. Paired with `swapKey` to force the animation to replay.
  const [swapDirection, setSwapDirection] = useState<"forward" | "back">("forward");
  const [swapKey, setSwapKey] = useState(0);
  const reducedMotion = useReducedMotion();
  const slideBodyRef = useRef<HTMLDivElement>(null);

  // Automatically snap to presenter position when a new broadcast token arrives
  useEffect(() => {
    if (slideRequest && slideRequest.token !== lastToken) {
      setLastToken(slideRequest.token);
      setViewingId((current) => {
        // Presenter-driven: compare where we are against where they went.
        const next = deckSlideIndex(slideRequest.slideId);
        setSwapDirection(next < deckSlideIndex(current) ? "back" : "forward");
        return slideRequest.slideId;
      });
      setSwapKey((k) => k + 1);
    }
  }, [slideRequest, lastToken]);

  const viewingIdx = deckSlideIndex(viewingId);
  // In a guided session, students can only read back up to the presenter's
  // current slide. When studying solo (no presenter active), allow navigating
  // freely across all slides.
  const presenterIdx = presenterSlideId ? deckSlideIndex(presenterSlideId) : TOTAL_REVIEW_DECK_SLIDES - 1;
  const isDrifted = presenterSlideId !== null && presenterSlideId !== viewingId;

  // Restart the enter animation on every swap. React reuses the same DOM node
  // across slides, so swapping the class alone would not replay it; and we
  // cannot remount via `key` without resetting the embedded interactive panels.
  // Detach -> reflow -> reattach is the standard imperative replay.
  //
  // The class is removed again once the animation finishes. Leaving it on means
  // the animation object stays attached to the node; if it is ever left pending
  // at currentTime 0, its fill mode pins the slide at the `from` keyframe and
  // the whole slide body sits 20px off-centre permanently.
  useEffect(() => {
    const node = slideBodyRef.current;
    if (!node) return;
    if (reducedMotion) {
      node.classList.remove("m4-slide-enter-back", "m4-slide-enter-forward");
      return;
    }
    const className = swapDirection === "back" ? "m4-slide-enter-back" : "m4-slide-enter-forward";
    node.classList.remove("m4-slide-enter-back", "m4-slide-enter-forward");
    // Reading offsetWidth forces the browser to apply the removal before the
    // class goes back on; without it the two changes collapse into no-op.
    void node.offsetWidth;
    node.classList.add(className);

    const onEnd = (e: AnimationEvent) => {
      if (e.target !== node) return;
      node.classList.remove("m4-slide-enter-back", "m4-slide-enter-forward");
    };
    node.addEventListener("animationend", onEnd);
    // Fallback in case animationend never fires (e.g. the tab was hidden when
    // the animation was due to run).
    const timer = window.setTimeout(() => {
      node.classList.remove("m4-slide-enter-back", "m4-slide-enter-forward");
    }, 600);
    return () => {
      node.removeEventListener("animationend", onEnd);
      window.clearTimeout(timer);
    };
  }, [swapKey, swapDirection, reducedMotion]);

  // Bounded read-back logic
  const canGoBack = viewingIdx > 0;
  const canGoForward = viewingIdx < presenterIdx;

  const goToSlide = useCallback(
    (targetIdx: number) => {
      const clamped = Math.max(0, Math.min(presenterIdx, targetIdx));
      const targetSlide = REVIEW_DECK_SLIDES[clamped];
      if (targetSlide) {
        setSwapDirection(clamped < viewingIdx ? "back" : "forward");
        setSwapKey((k) => k + 1);
        setViewingId(targetSlide.id);
        // Respect the OS setting: a smooth scroll is motion too.
        window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
      }
    },
    [presenterIdx, viewingIdx, reducedMotion]
  );

  const returnToPresenter = useCallback(() => {
    if (presenterSlideId) {
      setSwapDirection(deckSlideIndex(presenterSlideId) < viewingIdx ? "back" : "forward");
      setSwapKey((k) => k + 1);
      setViewingId(presenterSlideId);
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    }
  }, [presenterSlideId, viewingIdx, reducedMotion]);

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
      className="m4-deck-fit m4-deck-compact bg-[var(--surface-container-lowest)] text-[var(--foreground)] flex flex-col justify-between"
    >
      {/* ── TOP BAR / HEADER ──────────────────────────────────────────────── */}
      <header className="m4-deck-topbar sticky top-0 z-30 border-b border-[var(--outline-variant)] bg-[var(--surface)]/95 backdrop-blur-md px-3 py-2">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              data-connection-dot
              data-connection-state={
                role === "presenting" || status === "presenting"
                  ? "presenting"
                  : status === "following"
                  ? "following"
                  : status === "connecting" || status === "reconnecting"
                  ? "connecting"
                  : status === "disconnected" || status === "ended" || joinError
                  ? "disconnected"
                  : "solo"
              }
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
              KUGU Live Review · Modul 4
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Header keeps only live status now: rubric point moved beside the
                slide title, and deck actions live in the bottom-right speed dial. */}
          </div>
        </div>

        {/* Connection state. Without this, a student whose transport cannot reach the
            presenter (e.g. local BroadcastChannel mode across a different browser,
            incognito window, or another device) just sees a silently frozen deck
            with no explanation. */}
        {role !== "presenting" && (status === "connecting" || status === "reconnecting") && (
          <div
            data-connection-banner
            data-connection-state="connecting"
            className="mx-auto mt-2 flex max-w-5xl items-center gap-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container)] px-3 py-1.5 text-xs min-w-0"
          >
            <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-sm text-[var(--muted)]">
              sync
            </span>
            <span className="truncate text-[var(--text-secondary)]">
              Menyambungkan ke sesi asisten…
            </span>
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
              <span aria-hidden="true" className="material-symbols-outlined text-xs">
                refresh
              </span>
              <span>Coba lagi</span>
            </button>
          </div>
        )}

        {/* Local dev transport: BroadcastChannel is scoped to ONE browser context, so a
            student in a different browser / incognito window / device can never receive
            the presenter's slides. Say so explicitly instead of showing a stale deck. */}
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
              Mode lokal: sinkronisasi hanya berjalan di tab/jendela browser yang sama. Untuk
              praktikan di perangkat lain, jalankan sesi lewat relay (WSS).
            </span>
          </div>
        )}

        {/* Drift is surfaced in the speed dial's "Kembali ke Asisten" item
            instead of a header banner, so it costs no vertical space until the
            student opens the menu. */}
      </header>

      {/* ── MAIN SLIDE CANVAS ────────────────────────────────────────────── */}
      <main className="m4-deck-slidebody flex-1 px-3 py-5 sm:px-4 md:py-8 pb-16 min-w-0 overflow-x-hidden">
        {/* Animation restarts imperatively (see useIsomorphicLayoutEffect below)
            rather than via a changing `key`, because remounting this subtree
            would reset the embedded interactive panels mid-session. */}
        <div
          ref={slideBodyRef}
          className={`mx-auto max-w-4xl space-y-5 sm:space-y-6 min-w-0 ${
            reducedMotion ? "" : swapDirection === "back" ? "m4-slide-enter-back" : "m4-slide-enter-forward"
          }`}
          data-slide-direction={swapDirection}
        >
          {/* Slide Header Card */}
          <div className="m4-deck-chapter space-y-1 sm:space-y-1.5 border-b border-[var(--outline-variant)] pb-2 sm:pb-4 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded bg-[var(--primary-container)]/10 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  {currentSlide.chapterLabel}
                </span>
                <span className="m4-deck-counter text-xs font-semibold tabular-nums text-[var(--muted)]">
                  Slide {viewingIdx + 1} dari {TOTAL_REVIEW_DECK_SLIDES}
                </span>
              </div>
              {/* Rubric point sits on the chapter metadata row, right-aligned,
                  not beside the title: the title is long and wrapping it around
                  a badge reads poorly. */}
              {currentSlide.rubric && (
                <span
                  data-slide-rubric-badge
                  className="m4-deck-rubric inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--secondary-container)]/70 px-2.5 py-0.5 text-xs font-bold text-[var(--on-secondary-container)]"
                  title={`Target Rubrik Laporan: ${currentSlide.rubric.label}`}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-xs sm:text-sm">
                    assignment
                  </span>
                  <span>Poin {currentSlide.rubric.code}</span>
                  {currentSlide.rubric.points && (
                    <span className="text-[10px] opacity-80">({currentSlide.rubric.points} pt)</span>
                  )}
                </span>
              )}
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <h1
                className="m4-deck-heading text-lg sm:text-2xl md:text-3xl font-bold text-[var(--primary)] leading-tight break-words min-w-0 flex-1"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {currentSlide.title}
              </h1>
            </div>
          </div>

          {/* In landscape a phone has width to spare and almost no height, so
              bullets and panel sit side by side. Portrait keeps the single
              column. The wrapper is always present; CSS decides the layout. */}
          <div className="m4-deck-split space-y-5 sm:space-y-6 min-w-0">
          {/* Core Slide Takeaway Bullets Card (Omitted on dedicated full-diagram slides) */}
          {currentSlide.embeddedComponent !== "potential-gap" &&
           currentSlide.embeddedComponent !== "complexing-effect" &&
           currentSlide.embeddedComponent !== "electrolyte-solutions" && (
          <section
            aria-label="Poin utama materi"
            className="m4-deck-bullets surface-panel rounded-xl p-3.5 sm:p-5 md:p-6 bg-[var(--surface)] shadow-xs min-w-0"
          >
            <ul className="space-y-2">
              {currentSlide.bullets.map((bullet, idx) => {
                if (currentSlide.id === "p4" && idx === 2) {
                  return (
                    <li key={idx} className="min-w-0 pt-0.5">
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] sm:text-xs min-w-0">
                        <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-1.5 flex flex-col justify-between min-w-0">
                          <div className="flex items-center gap-1 font-bold text-[var(--foreground)] truncate">
                            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#D97706] shrink-0" />
                            <span>Katoda</span>
                          </div>
                          <p className="mt-0.5 text-[9px] text-[var(--text-secondary)] leading-tight">
                            Plat Cu aktif, reduksi deposit Sn–Bi
                          </p>
                        </div>
                        <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-1.5 flex flex-col justify-between min-w-0">
                          <div className="flex items-center gap-1 font-bold text-[var(--foreground)] truncate">
                            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#334155] shrink-0" />
                            <span>Anoda</span>
                          </div>
                          <p className="mt-0.5 text-[9px] text-[var(--text-secondary)] leading-tight">
                            Batang C inert, oksidasi penutup arus
                          </p>
                        </div>
                        <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-1.5 flex flex-col justify-between min-w-0">
                          <div className="flex items-center gap-1 font-bold text-[var(--foreground)] truncate">
                            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--chart-navy)] shrink-0" />
                            <span>Elektrolit</span>
                          </div>
                          <p className="mt-0.5 text-[9px] text-[var(--text-secondary)] leading-tight">
                            Medium asam pH ~2, ion Sn²⁺ &amp; Bi³⁺
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                }
                const isStepList = currentSlide.id === "p2";
                return (
                  <li
                    key={idx}
                    className="relative flex items-start gap-2.5 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] min-w-0"
                  >
                    {isStepList && idx < currentSlide.bullets.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-2.5 top-5 -bottom-2.5 w-px bg-[var(--outline-variant)]"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="m4-deck-bullet-badge relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-container)]/10 text-xs font-bold text-[var(--primary-container)] mt-0.5 tabular-nums"
                    >
                      {isStepList ? idx + 1 : "✓"}
                    </span>
                    {formatBulletText(bullet)}
                  </li>
                );
              })}
            </ul>
          </section>
          )}

          {/* Embedded Interactive Simulations / Panels based on active slide.
              Each is wrapped in .m4-deck-panel so it scrolls inside itself
              instead of pushing the slide past the viewport — the deck stays
              one screen tall while the panel keeps all of its content. */}
          {currentSlide.embeddedComponent === "electrodeposition-diagram" && (
            <div className="m4-deck-panel min-w-0 h-full">
              <ElectrodepositionDiagram />
            </div>
          )}

          {currentSlide.embeddedComponent === "potential-gap" && (
            <div className="m4-deck-panel min-w-0 h-full">
              <SnBiPotentialGapDiagram />
            </div>
          )}

          {currentSlide.embeddedComponent === "complexing-effect" && (
            <div className="m4-deck-panel min-w-0 h-full">
              <ComplexingEffectWorkbench />
            </div>
          )}

          {currentSlide.embeddedComponent === "electrolyte-solutions" && (
            <div className="m4-deck-panel min-w-0 h-full w-full">
              <ElectrolyteSolutionsCards />
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
              <div className="m4-deck-panel">
                <ReportFormatGuide />
              </div>
            </div>
          )}

          {currentSlide.embeddedComponent === "games" && roomId && (
            <div className="m4-deck-panel rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-3 sm:p-5 shadow-xs min-w-0">
              <ReviewGames roomId={roomId} />
            </div>
          )}
          </div>
        </div>
      </main>

      {/* ── FOOTER / SLIDE NAVIGATION RAIL (ALWAYS PINNED TO SCREEN BOTTOM) ───────────────── */}
      <footer className="m4-deck-footer fixed inset-x-0 bottom-0 z-30 border-t border-[var(--outline-variant)] bg-[var(--surface)]/95 backdrop-blur-md px-3 py-1.5 min-w-0 shadow-lg">
        {/* Single row: left arrow on left, progress dots centered, counter + right arrow on right. */}
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
            className="flex flex-1 items-center justify-center gap-1 overflow-x-auto min-w-0 py-0.5 px-1"
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

      {/* Deck actions (return to assistant, exit) live in a bottom-right speed
          dial rather than the header, to keep the header chrome minimal on a
          height-starved phone viewport. */}
      <DeckActionDial
        onReturnToPresenter={returnToPresenter}
        canReturnToPresenter={isDrifted}
        driftLabel={
          presenterSlideId ? `Slide ${viewingIdx + 1} (Asisten di Slide ${presenterIdx + 1})` : undefined
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
  );
}
