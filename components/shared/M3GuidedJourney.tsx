"use client";

import { useState } from "react";
import { ModuleJourney, type JourneyStage } from "@/components/shared/ModuleJourney";
import { useM3Presentation } from "@/components/shared/M3PresentationProvider";
import { useM4GuidedAccess } from "@/components/shared/M4GuidedAccessGate";
import { M3_STAGE_IDS, type M3StageId } from "@/lib/m3-presentation";

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
  const { navRequest } = useM3Presentation();
  const mappedNavRequest = navRequest && !stages.some((stage) => stage.id === navRequest.stageId) && legacyStageMap[navRequest.stageId]
    ? { ...navRequest, stageId: legacyStageMap[navRequest.stageId] }
    : navRequest;
  return (
    <div className="space-y-6">
      <M3FollowControls />
      <ModuleJourney stages={stages} navRequest={mappedNavRequest} />
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
          className="rounded-xl border-2 border-[var(--primary-container)] bg-[var(--surface-container-low)] p-3.5 sm:p-4 text-sm shadow-xs space-y-3 m4-motion-enter"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--outline-variant)] pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--primary-container)] animate-pulse" />
              <span className="font-bold text-[var(--foreground)]">
                Anda Memandu: {activeSession?.name || "Sesi Praktikum KI3131"}
              </span>
              <span className="rounded-full bg-[var(--surface-selected)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary-container)]">
                Live
              </span>
            </div>
            <button
              type="button"
              onClick={closeSession}
              className="min-h-9 rounded-lg border border-[var(--danger,#ef4444)] px-3 text-xs font-semibold text-[var(--danger,#ef4444)] hover:bg-[var(--danger,#ef4444)]/10 m4-motion-control"
            >
              Tutup Sesi
            </button>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Pilih Tahap (Otomatis Diarahkan ke Mahasiswa):
            </p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Publikasikan tahap">
              {visibleStageIds.map((id) => {
                const active = (snapshot?.stageId ?? "brief") === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => presentStage(id)}
                    aria-pressed={active}
                    className={`min-h-10 rounded-lg px-3.5 text-xs font-bold transition-all ${
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
          </div>
        </section>
      );
    }

    // Instructor not yet presenting
    return (
      <section
        aria-label="Panel pembukaan sesi asisten"
        data-instructor-panel
        className="rounded-xl border border-[var(--primary-container)] bg-[var(--surface-container-low)] p-3.5 sm:p-4 text-sm m4-motion-enter"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="material-symbols-outlined text-2xl text-[var(--primary-container)]">
              co_present
            </span>
            <div>
              <h4 className="font-bold text-[var(--foreground)]">Mode Pemandu Asisten</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Buka ruang presentasi otomatis agar praktikan dapat bergabung dan mengikuti materi secara bersamaan.
              </p>
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
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[var(--primary-container)] px-4 text-xs font-bold text-[var(--on-primary)] m4-motion-control hover:opacity-90 disabled:opacity-50"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">
              podium
            </span>
            {creating ? "Membuka Sesi…" : "Buka Sesi Praktikum"}
          </button>
        </div>
        {joinError && (
          <p role="alert" className="mt-2 text-xs text-[var(--danger)]">
            Gagal membuka sesi: {joinError}
          </p>
        )}
      </section>
    );
  }

  // ── STUDENT VIEW ───────────────────────────────────────────────────────────
  if (role === "following") {
    return (
      <div
        className="rounded-xl border border-[var(--primary-container)] bg-[var(--surface-container-low)] p-3 text-sm m4-motion-enter"
        data-following-deck
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-lg text-[var(--primary-container)]">
              cast_connected
            </span>
            <span className="font-semibold text-[var(--foreground)]">
              Mengikuti Panduan Asisten
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              · Tahap: <strong>{labelForStage(stageLabels, snapshot?.stageId ?? "brief")}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={unfollow}
            className="min-h-9 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] m4-motion-control"
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
        className="rounded-xl border-2 border-[var(--primary-container)] bg-[var(--surface-container)] p-4 shadow-xs space-y-3 m4-motion-enter"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--primary-container)] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                Sesi Praktikum Terbuka
              </span>
            </div>
            <h4 className="text-base font-bold text-[var(--foreground)]">
              {activeSession.name}
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Asisten telah membuka ruang panduan. Klik tombol di kanan untuk bergabung dan menyelaraskan alur materi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => follow(activeSession.roomId)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary-container)] px-5 text-xs font-bold text-[var(--on-primary)] shadow-xs m4-motion-control hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">
              login
            </span>
            Masuk Ruangan / Ikuti Asisten
          </button>
        </div>
        {joinError && (
          <p role="alert" className="text-xs text-[var(--danger)]">
            Tidak dapat tersambung: {joinError}.
          </p>
        )}
      </section>
    );
  }

  // No active session, student in solo mode
  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2 text-xs text-[var(--text-secondary)]"
      data-solo-bar
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--muted)]">
        menu_book
      </span>
      <span>Mode Mandiri · Belum ada sesi presentasi aktif dari asisten.</span>
    </div>
  );
}
