"use client";

// Student-facing review slide view (Phase 2).
//
// When a student follows an asprak's session, the module content stays mounted
// and scrollable underneath; this overlay FRAMES the current slide's anchor and
// provides the thin chrome. It never replaces the content — exit drops straight
// back to free scroll with nothing lost.
//
// Design rules enforced here:
//  - Students do NOT drive the PRESENTATION (nothing here broadcasts; followers
//    cannot publish anyway). The rail dots allow LOCAL read-back only.
//  - Read-back is bounded to slides the asprak has already shown (index <=
//    presenter index): you may re-read slide 5 while the asprak is on 7, but you
//    cannot read ahead and spoil what's coming.
//  - Drift is allowed, visible, and one tap to undo (no shared projector).
//  - Position is remote, content is local: a dropped connection never blanks the
//    screen — the slide content is still in the page.
//  - prefers-reduced-motion: framing is instant, no smooth scroll.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  REVIEW_SLIDES,
  REVIEW_SLIDE_BY_ID,
  REVIEW_CHAPTERS,
  TOTAL_REVIEW_SLIDES,
  slideIndex,
} from "@/lib/m4-review-slides";
import {
  useOptionalM3Presentation,
  type ConnectionStatus,
} from "@/components/shared/M3PresentationProvider";
import type { ReviewSlideId } from "@/lib/m3-presentation";

const CHAPTER_LABEL: Record<string, string> = Object.fromEntries(
  REVIEW_CHAPTERS.map((c) => [c.chapter, c.label])
);

/** Scroll an anchor to just below the sticky rail. Instant, not smooth:
 *  remote-driven framing must land deterministically (smooth scrolls get
 *  cancelled by the re-render / layout shift that a slide change triggers), the
 *  same reason ModuleJourney uses the instant path for remote nav. */
function frameAnchor(anchor: string) {
  if (typeof document === "undefined") return;
  const el = document.querySelector<HTMLElement>(`[data-review-anchor="${anchor}"]`);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
}

const STATUS_COPY: Partial<Record<ConnectionStatus, { label: string; tone: string }>> = {
  connecting: { label: "Menyambungkan…", tone: "var(--muted)" },
  reconnecting: { label: "Menyambungkan ulang…", tone: "var(--warning-ink)" },
  disconnected: { label: "Koneksi terputus — materi tetap bisa dibaca", tone: "var(--danger)" },
  ended: { label: "Sesi telah ditutup asisten", tone: "var(--muted)" },
};

export function ReviewSlideView() {
  const presentation = useOptionalM3Presentation();
  // Hooks run unconditionally (rules of hooks); gate on render below.
  const [viewingId, setViewingId] = useState<ReviewSlideId | null>(null);
  const appliedTokenRef = useRef<number | null>(null);

  const role = presentation?.role ?? "solo";
  const status = presentation?.status ?? "solo";
  const slideRequest = presentation?.slideRequest ?? null;
  const presenterSlideId = slideRequest?.slideId ?? null;

  const showAnchor = useCallback((id: ReviewSlideId) => {
    setViewingId(id);
  }, []);

  // Frame the anchor AFTER the DOM reflects the new slide (and the padding-
  // bottom reservation). A layout effect keyed on viewingId lands deterministically;
  // scheduling scrollTo straight from the broadcast handler raced the re-render
  // and silently no-opped.
  useLayoutEffect(() => {
    if (role !== "following" || !viewingId) return;
    const slide = REVIEW_SLIDE_BY_ID[viewingId];
    if (slide?.anchor) frameAnchor(slide.anchor);
  }, [role, viewingId]);

  // Apply the presenter's slide once per token (idempotent, never re-broadcast).
  // A new broadcast always snaps the student back to the asprak's position.
  useEffect(() => {
    if (role !== "following" || !slideRequest) return;
    if (appliedTokenRef.current === slideRequest.token) return;
    appliedTokenRef.current = slideRequest.token;
    showAnchor(slideRequest.slideId);
  }, [role, slideRequest, showAnchor]);

  const returnToPresenter = useCallback(() => {
    if (presenterSlideId) showAnchor(presenterSlideId);
  }, [presenterSlideId, showAnchor]);

  const exit = useCallback(() => { presentation?.unfollow(); }, [presentation]);

  // Esc exits the follow view (back to free scroll).
  useEffect(() => {
    if (role !== "following") return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") exit(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [role, exit]);

  // Reserve space so the fixed bar never covers the bottom of the content.
  const active = role === "following" && viewingId !== null;
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "132px";
    return () => { document.body.style.paddingBottom = prev; };
  }, [active]);

  if (!active || !viewingId) return null;

  const slide = REVIEW_SLIDE_BY_ID[viewingId];
  if (!slide) return null;

  const idx = slideIndex(viewingId);
  const presenterIdx = presenterSlideId ? slideIndex(presenterSlideId) : idx;
  const drifted = presenterSlideId !== null && presenterSlideId !== viewingId;
  const statusCopy = STATUS_COPY[status];

  // Read-back is bounded to already-shown slides.
  const canBack = idx > 0;
  const canForward = idx < presenterIdx;
  const stepTo = (target: number) => {
    const clamped = Math.max(0, Math.min(presenterIdx, target));
    showAnchor(REVIEW_SLIDES[clamped].id);
  };

  return (
    <aside
      data-review-slide-view
      aria-label="Tampilan slide review"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]/95 backdrop-blur-sm"
    >
      {/* Top line: read-back + position/chapter + exit */}
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 pt-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => stepTo(idx - 1)}
            disabled={!canBack}
            aria-label="Lihat slide sebelumnya"
            className="m4-motion-control inline-flex min-h-8 w-8 items-center justify-center rounded-lg border border-[var(--outline-variant)] text-[var(--primary-container)] hover:bg-[var(--surface-container)] disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => stepTo(idx + 1)}
            disabled={!canForward}
            aria-label="Lihat slide berikutnya"
            className="m4-motion-control inline-flex min-h-8 w-8 items-center justify-center rounded-lg border border-[var(--outline-variant)] text-[var(--primary-container)] hover:bg-[var(--surface-container)] disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
          <span className="ml-1 truncate text-xs font-semibold text-[var(--foreground)]">
            {CHAPTER_LABEL[slide.chapter] ?? slide.chapter}
            <span className="text-[var(--text-secondary)]"> · {slide.title}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span aria-live="polite" className="hidden sm:inline text-[11px] font-semibold tabular-nums text-[var(--muted)]">
            {idx + 1}/{TOTAL_REVIEW_SLIDES}
          </span>
          <button
            type="button"
            onClick={exit}
            className="m4-motion-control inline-flex min-h-8 items-center gap-1 rounded-lg border border-[var(--outline-variant)] px-2.5 text-[11px] font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[15px]">logout</span>
            Keluar
          </button>
        </div>
      </div>

      {/* Drift banner: student is reading a different slide than the asprak. */}
      {drifted && (
        <div
          data-review-drift
          role="status"
          className="mx-auto mt-1.5 flex max-w-5xl items-center justify-between gap-2 border-t border-[var(--outline-variant)] bg-[var(--surface-selected)] px-3 py-1.5"
        >
          <span className="truncate text-[11px] text-[var(--warning-ink)]">
            Anda melihat slide {idx + 1} · Asisten di slide {presenterIdx + 1}
          </span>
          <button
            type="button"
            onClick={returnToPresenter}
            className="m4-motion-control inline-flex min-h-7 shrink-0 items-center gap-1 rounded border border-[var(--warning-ink)] px-2 text-[11px] font-semibold text-[var(--warning-ink)] hover:bg-[var(--warning-light)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--warning-ink)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">my_location</span>
            Kembali ke posisi
          </button>
        </div>
      )}

      {/* Connection honesty line — content stays readable regardless. */}
      {statusCopy && !drifted && (
        <p className="mx-auto max-w-5xl px-3 pt-1 text-[11px]" style={{ color: statusCopy.tone }}>
          {statusCopy.label}
        </p>
      )}

      {/* Progress rail — INDICATOR of the asprak's position; dots up to the
          asprak's slide are tappable for local read-back only (no broadcast). */}
      <div
        className="mx-auto mt-1.5 flex max-w-5xl items-center gap-1 px-3 pb-2"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={TOTAL_REVIEW_SLIDES}
        aria-valuenow={presenterIdx + 1}
        aria-label={`Asisten di slide ${presenterIdx + 1} dari ${TOTAL_REVIEW_SLIDES}`}
      >
        {REVIEW_SLIDES.map((s, i) => {
          const seen = i <= presenterIdx;
          return (
            <button
              key={s.id}
              type="button"
              disabled={!seen}
              onClick={() => showAnchor(s.id)}
              aria-label={`Slide ${i + 1}: ${s.title}`}
              aria-current={i === idx ? "true" : undefined}
              className="m4-motion-color h-2.5 flex-1 rounded-full disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
              style={{
                backgroundColor:
                  i === idx
                    ? "var(--primary-container)"
                    : i <= presenterIdx
                      ? "var(--primary-fixed-dim)"
                      : "var(--outline-variant)",
              }}
            />
          );
        })}
      </div>
    </aside>
  );
}
