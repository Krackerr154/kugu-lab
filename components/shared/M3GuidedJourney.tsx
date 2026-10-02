"use client";

import { useState } from "react";
import Link from "next/link";
import { ModuleJourney, type JourneyStage } from "@/components/shared/ModuleJourney";
import { useM3Presentation } from "@/components/shared/M3PresentationProvider";
import { useM4GuidedAccess } from "@/components/shared/M4GuidedAccessGate";
import { M3_STAGE_IDS, type M3StageId } from "@/lib/m3-presentation";
import { TOTAL_REVIEW_SLIDES, slideIndex } from "@/lib/m4-review-slides";

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
  // When a slide is being presented and this client is following or presenting, the slide
  // view owns scrolling (it frames the exact anchor). Suppressing the stage-nav
  // scroll here prevents the two from fighting — the stage's instant scroll was
  // overriding the slide's finer anchor scroll. Scroll-view followers (no
  // slideId) and every other module are unaffected.
  const slideDriven = (role === "following" || role === "presenting") && !!snapshot?.slideId;
  const effectiveNavRequest = slideDriven ? null : navRequest;
  const mappedNavRequest = effectiveNavRequest && !stages.some((stage) => stage.id === effectiveNavRequest.stageId) && legacyStageMap[effectiveNavRequest.stageId]
    ? { ...effectiveNavRequest, stageId: legacyStageMap[effectiveNavRequest.stageId] }
    : effectiveNavRequest;
  return <ModuleJourney stages={stages} navRequest={mappedNavRequest} />;
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
    audienceCount,
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
          aria-label="Panel status asisten"
          className="flex h-full min-h-[52px] items-center justify-between gap-x-3 rounded-lg border-2 border-[var(--primary-container)] bg-[var(--surface-container-low)] px-3.5 py-2 text-sm shadow-xs m4-motion-enter"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--primary-container)] animate-pulse shrink-0" />
            <span className="font-bold text-[var(--foreground)] text-xs truncate">
              Sesi Aktif: {activeSession?.name || "Sesi Praktikum KI3131"}
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

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/modules/m4-sn-bi-electrodeposition/presenter"
              target="_blank"
              rel="noreferrer"
              className="m4-motion-control inline-flex min-h-7 items-center gap-1 rounded border border-[var(--primary-container)] bg-[var(--primary-container)] px-2 text-[11px] font-bold text-[var(--on-primary)] hover:opacity-90"
              title="Buka konsol presentasi asisten di tab baru"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[13px]">
                open_in_new
              </span>
              <span>Konsol Presenter</span>
            </Link>

            <button
              type="button"
              onClick={closeSession}
              className="m4-motion-control min-h-7 rounded border border-[var(--danger,#ef4444)] px-2 text-[11px] font-semibold text-[var(--danger,#ef4444)] hover:bg-[var(--danger,#ef4444)]/10"
            >
              Tutup Sesi
            </button>
          </div>
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
              Buka ruang presentasi review untuk praktikan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/modules/m4-sn-bi-electrodeposition/presenter"
            target="_blank"
            rel="noreferrer"
            className="m4-motion-control inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              dashboard
            </span>
            <span className="hidden sm:inline">Buka Konsol</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              setCreating(true);
              await createSession("Sesi Praktikum KI3131");
              setCreating(false);
            }}
            disabled={creating}
            className="m4-motion-control inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[var(--primary-container)] px-3.5 text-xs font-bold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-50"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
              podium
            </span>
            {creating ? "Membuka…" : "Buka Sesi"}
          </button>
        </div>
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

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/modules/m4-sn-bi-electrodeposition/presentation"
            className="m4-motion-control inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--primary-container)] bg-[var(--primary-container)] px-3 text-xs font-bold text-[var(--on-primary)] hover:opacity-90"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[15px]">
              slideshow
            </span>
            <span className="hidden sm:inline">Layar Slide</span>
          </Link>

          <button
            type="button"
            onClick={unfollow}
            className="m4-motion-control min-h-9 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)]"
          >
            Jelajahi Mandiri
          </button>
        </div>
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

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/modules/m4-sn-bi-electrodeposition/presentation"
            className="m4-motion-control inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[15px]">
              slideshow
            </span>
            <span className="hidden sm:inline">Layar Slide</span>
          </Link>

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
        </div>
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
