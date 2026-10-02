"use client";

import { useState } from "react";
import { ModuleJourney, type JourneyStage } from "@/components/shared/ModuleJourney";
import { useM3Presentation } from "@/components/shared/M3PresentationProvider";
import { useM4GuidedAccess } from "@/components/shared/M4GuidedAccessGate";
import { M3_STAGE_IDS, type M3StageId } from "@/lib/m3-presentation";
import {
  REVIEW_SLIDES,
  REVIEW_SLIDE_BY_ID,
  REVIEW_CHAPTERS,
  TOTAL_REVIEW_SLIDES,
  slideIndex,
} from "@/lib/m4-review-slides";

const DEFAULT_STAGE_LABEL: Record<M3StageId, string> = {
  brief: "Tujuan Praktikum",
  understand: "Pembahasan",
  rehearse: "Latih",
  prove: "Pengolahan Data",
  ready: "Format Laporan",
};

const M4_VISIBLE_STAGE_IDS: readonly M3StageId[] = ["brief", "understand", "prove", "ready"] as const;

export type M3StageLabelMap = Partial<Record<M3StageId, string>>;
const labelForStage = (labels: M3StageLabelMap, stageId: M3StageId) => labels[stageId] ?? DEFAULT_STAGE_LABEL[stageId] ?? stageId;

export function M3Journey({ stages, legacyStageMap = {} }: { stages: JourneyStage[]; legacyStageMap?: Record<string, string> }) {
  const { navRequest, snapshot, role } = useM3Presentation();
  // When a slide is being presented and this client is following, the slide
  // view owns scrolling (it frames the exact anchor). Suppressing the stage-nav
  // scroll here prevents the two from fighting — the stage's instant scroll was
  // overriding the slide's finer anchor scroll. Scroll-view followers (no
  // slideId) and every other module are unaffected.
  const slideDriven = role === "following" && !!snapshot?.slideId;
  const effectiveNavRequest = slideDriven ? null : navRequest;
  const mappedNavRequest = effectiveNavRequest && !stages.some((stage) => stage.id === effectiveNavRequest.stageId) && legacyStageMap[effectiveNavRequest.stageId]
    ? { ...effectiveNavRequest, stageId: legacyStageMap[effectiveNavRequest.stageId] }
    : effectiveNavRequest;
  return <ModuleJourney stages={stages} navRequest={mappedNavRequest} />;
}

// Asprak slide deck: fine-grained waypoint control that lives inside the
// presenter card, grouped by the chapter (stage) rail. presentSlide broadcasts
// both the slide and its chapter, so a scroll-view follower still lands on the
// right stage and a slide-view follower gets the exact position.
function PresenterSlideDeck() {
  const { snapshot, presentSlide } = useM3Presentation();
  const currentSlideId = snapshot?.slideId ?? null;
  const currentIndex = currentSlideId ? slideIndex(currentSlideId) : -1;
  const atStart = currentIndex <= 0;
  const atEnd = currentIndex === TOTAL_REVIEW_SLIDES - 1;

  const go = (target: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_REVIEW_SLIDES - 1, target));
    presentSlide(REVIEW_SLIDES[clamped].id);
  };

  return (
    <div className="flex flex-col gap-1.5 border-t border-[var(--outline-variant)] pt-1.5" data-presenter-slide-deck>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Slide {currentIndex >= 0 ? `${currentIndex + 1}/${TOTAL_REVIEW_SLIDES}` : "—"}
          {currentSlideId && <span className="ml-1 font-normal normal-case text-[var(--text-secondary)]">· {REVIEW_SLIDE_BY_ID[currentSlideId].title}</span>}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => go(currentIndex - 1)}
            disabled={atStart}
            aria-label="Slide sebelumnya"
            className="m4-motion-control inline-flex min-h-7 w-7 items-center justify-center rounded border border-[var(--outline-variant)] text-[var(--primary-container)] hover:bg-[var(--surface-container)] disabled:opacity-30"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => (currentIndex < 0 ? go(0) : go(currentIndex + 1))}
            disabled={atEnd}
            aria-label="Slide berikutnya"
            className="m4-motion-control inline-flex min-h-7 items-center gap-1 rounded border border-[var(--primary-container)] bg-[var(--primary-container)] px-2 text-[11px] font-semibold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-30"
          >
            {currentIndex < 0 ? "Mulai Slide" : "Berikutnya"}
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
      {/* Jump-to by chapter: each chapter's slides as compact dots. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {REVIEW_CHAPTERS.map((chapter) => (
          <div key={chapter.chapter} className="flex items-center gap-0.5">
            <span className="mr-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--muted)]">{chapter.label.split(" ")[0]}</span>
            {chapter.slides.map((s) => {
              const i = slideIndex(s.id);
              const active = s.id === currentSlideId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => presentSlide(s.id)}
                  aria-pressed={active}
                  title={`${i + 1}. ${s.title}`}
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
        ))}
      </div>
    </div>
  );
}

export function M3FollowControls({
  stageLabels = {},
  visibleStageIds = M4_VISIBLE_STAGE_IDS,
}: {
  stageLabels?: M3StageLabelMap;
  visibleStageIds?: readonly M3StageId[];
}) {
  const {
    role,
    snapshot,
    activeSession,
    createSession,
    closeSession,
    follow,
    unfollow,
    presentStage,
    joinError,
  } = useM3Presentation();

  const { instructorUnlocked } = useM4GuidedAccess();
  const [creating, setCreating] = useState(false);

  // ── INSTRUCTOR VIEW ────────────────────────────────────────────────────────
  if (instructorUnlocked) {
    if (role === "presenting") {
      return (
        <section
          aria-label="Panel kendali asisten"
          data-presenter-deck
          className="flex h-full min-h-[52px] flex-col justify-center gap-2 rounded-lg border-2 border-[var(--primary-container)] bg-[var(--surface-container-low)] p-3 text-sm shadow-xs m4-motion-enter"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--outline-variant)] pb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2 w-2 rounded-full bg-[var(--primary-container)] animate-pulse shrink-0" />
              <span className="font-bold text-[var(--foreground)] text-xs truncate">
                Anda Memandu: {activeSession?.name || "Sesi Praktikum KI3131"}
              </span>
              <span className="rounded-full bg-[var(--surface-selected)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary-container)] shrink-0">
                Live
              </span>
            </div>
            <button
              type="button"
              onClick={closeSession}
              className="m4-motion-control min-h-7 rounded border border-[var(--danger,#ef4444)] px-2 text-[11px] font-semibold text-[var(--danger,#ef4444)] hover:bg-[var(--danger,#ef4444)]/10"
            >
              Tutup Sesi
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mr-1">Tahap:</span>
            {visibleStageIds.map((id) => {
              const active = (snapshot?.stageId ?? "brief") === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => presentStage(id)}
                  aria-pressed={active}
                  className={`min-h-8 rounded px-2.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-[var(--primary-container)] text-[var(--on-primary)] shadow-xs"
                      : "border border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-container)]"
                  }`}
                >
                  {labelForStage(stageLabels, id)}
                </button>
              );
            })}
          </div>

          {/* Fine-grained slide waypoints for the review session. */}
          <PresenterSlideDeck />
        </section>
      );
    }

    // Instructor not yet presenting
    return (
      <section
        aria-label="Panel pembukaan sesi asisten"
        data-instructor-panel
        className="flex h-full min-h-[52px] items-center justify-between gap-x-3 rounded-lg border border-[var(--primary-container)] bg-[var(--surface-container-low)] px-3.5 py-2 text-sm m4-motion-enter"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-[var(--primary-container)] shrink-0">
            co_present
          </span>
          <div className="min-w-0">
            <span className="font-bold text-[var(--foreground)] text-xs sm:text-sm truncate block">
              Mode Pemandu Asisten
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] truncate block">
              Buka ruang presentasi untuk praktikan
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            setCreating(true);
            await createSession("Sesi Praktikum KI3131");
            setCreating(false);
          }}
          disabled={creating}
          className="m4-motion-control inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[var(--primary-container)] px-3.5 text-xs font-bold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-50"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
            podium
          </span>
          {creating ? "Membuka…" : "Buka Sesi"}
        </button>
      </section>
    );
  }

  // ── STUDENT VIEW ───────────────────────────────────────────────────────────
  if (role === "following") {
    const followedSlideId = snapshot?.slideId ?? null;
    const followedSlideIdx = followedSlideId ? slideIndex(followedSlideId) : -1;
    return (
      <div
        className="flex h-full min-h-[52px] items-center justify-between gap-x-3 rounded-lg border border-[var(--primary-container)] bg-[var(--surface-container-low)] px-3.5 py-2 text-sm m4-motion-enter"
        data-following-deck
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-[var(--primary-container)] shrink-0">
            cast_connected
          </span>
          <div className="flex flex-wrap items-baseline gap-x-1.5 min-w-0">
            <span className="font-semibold text-[var(--foreground)] truncate">
              Mengikuti Panduan Asisten
            </span>
            <span className="text-xs text-[var(--text-secondary)] shrink-0">
              {followedSlideIdx >= 0
                ? <>· Slide <strong>{followedSlideIdx + 1}/{TOTAL_REVIEW_SLIDES}</strong></>
                : <>· Tahap: <strong>{labelForStage(stageLabels, snapshot?.stageId ?? "brief")}</strong></>}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={unfollow}
          className="m4-motion-control min-h-9 shrink-0 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)]"
        >
          Jelajahi Mandiri
        </button>
      </div>
    );
  }

  if (activeSession) {
    return (
      <section
        aria-label="Sesi praktikum aktif dari asisten"
        data-active-room-card
        className="flex h-full min-h-[52px] items-center justify-between gap-x-3 rounded-lg border-2 border-[var(--primary-container)] bg-[var(--surface-container)] px-3.5 py-2 shadow-xs m4-motion-enter"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--primary-container)] animate-pulse shrink-0" />
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-container)] shrink-0">
                Sesi Terbuka
              </span>
              <span className="font-bold text-[var(--foreground)] text-xs sm:text-sm truncate">
                · {activeSession.name}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] truncate">
              Klik untuk menyelaraskan alur materi dengan asisten
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => follow(activeSession.roomId)}
          className="m4-motion-control inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[var(--primary-container)] px-3 text-xs font-bold text-[var(--on-primary)] shadow-xs hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
            login
          </span>
          Ikuti Asisten
        </button>
      </section>
    );
  }

  // No active session, student in solo mode
  return (
    <div
      className="flex h-full min-h-[52px] items-center gap-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3.5 py-2 text-xs text-[var(--text-secondary)]"
      data-solo-bar
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-[var(--muted)] shrink-0">
        menu_book
      </span>
      <span className="leading-snug">
        <strong className="font-semibold text-[var(--foreground)]">Mode Mandiri</strong> · Belum ada sesi presentasi aktif dari asisten.
      </span>
    </div>
  );
}
