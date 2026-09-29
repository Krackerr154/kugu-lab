"use client";

// Client pieces that bind the guided-presentation context to the M3 surfaces
// (Phase 3). Kept separate from the server page so ModuleJourney stays generic.
//
//   M3Journey        — ModuleJourney fed with the follower's navRequest
//   M3FollowControls — voluntary student controls with explicit connection
//                      status (Ikuti / Berhenti / Kembali ke presenter)
//   M3PresenterDeck  — the presenter's intentional publish controls (start/end,
//                      pick a stage, publish/clear a demo overlay)
//
// All read from M3PresentationProvider, which the page wraps around everything.

import { ModuleJourney, type JourneyStage } from "@/components/shared/ModuleJourney";
import { useM3Presentation, type ConnectionStatus } from "@/components/shared/M3PresentationProvider";
import { M3_STAGE_IDS, M3_DEMO_AGENT_IDS, type M3StageId } from "@/lib/m3-presentation";
import { BATH_AGENT_LABELS } from "@/lib/m3-ligands";

const STAGE_LABEL: Record<M3StageId, string> = {
  brief: "Tinjauan",
  understand: "Pahami",
  rehearse: "Latih",
  prove: "Buktikan",
  ready: "Siap",
};

// Explicit, honest connection labels (plan §Phase 3). Never claim "live" when
// stale: disconnected/ended read distinctly from following.
const STATUS_META: Record<ConnectionStatus, { label: string; icon: string; tone: string }> = {
  solo: { label: "Mode mandiri", icon: "cast", tone: "text-[var(--text-secondary)]" },
  connecting: { label: "Menyambungkan…", icon: "sync", tone: "text-[var(--primary-container)]" },
  following: { label: "Mengikuti presentasi", icon: "cast_connected", tone: "text-[var(--primary-container)]" },
  reconnecting: { label: "Menyambung ulang…", icon: "sync_problem", tone: "text-[var(--warning-ink)]" },
  disconnected: { label: "Terputus", icon: "cloud_off", tone: "text-[var(--warning-ink)]" },
  ended: { label: "Presentasi berakhir", icon: "stop_circle", tone: "text-[var(--text-secondary)]" },
  presenting: { label: "Anda memimpin presentasi", icon: "co_present", tone: "text-[var(--primary-container)]" },
};

const controlBtn =
  "min-h-9 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]";
const primaryBtn =
  "min-h-9 rounded-lg bg-[var(--primary-container)] px-3 text-xs font-semibold text-[var(--on-primary)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]";

export function M3Journey({ stages }: { stages: JourneyStage[] }) {
  const { navRequest } = useM3Presentation();
  return <ModuleJourney stages={stages} navRequest={navRequest} />;
}

export function M3FollowControls() {
  const { role, status, snapshot, ended, follow, unfollow, rejoin } = useM3Presentation();
  const meta = STATUS_META[status];
  const following = role === "following";
  const stageText = snapshot ? STAGE_LABEL[snapshot.stageId] : null;

  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2 text-sm"
      data-presentation-status={status}
    >
      <span aria-hidden="true" className={`material-symbols-outlined text-[18px] ${meta.tone}`}>{meta.icon}</span>
      <span className={`font-semibold ${status === "solo" ? "text-[var(--foreground)]" : meta.tone}`}>{meta.label}</span>
      {following && stageText && !ended && (
        <span className="text-xs text-[var(--text-secondary)]">· tahap {stageText}</span>
      )}
      <span aria-live="polite" role="status" className="sr-only">
        {meta.label}{following && stageText ? `, tahap ${stageText}` : ""}.
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {role === "solo" && !ended && (
          <button type="button" onClick={follow} className={primaryBtn}>Ikuti presentasi</button>
        )}
        {following && (
          <button type="button" onClick={unfollow} className={controlBtn}>Berhenti mengikuti</button>
        )}
        {(ended || status === "disconnected") && (
          <>
            <button type="button" onClick={rejoin} className={primaryBtn}>Kembali ke presenter</button>
            <button type="button" onClick={unfollow} className={controlBtn}>Jelajahi mandiri</button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Presenter deck. Intentional publish controls — nothing broadcasts until the
 * presenter acts, so they can explore privately. A connected-count is NOT shown
 * because this transport has no reliable presence count and it must not be
 * mistaken for attention.
 */
export function M3PresenterDeck() {
  const { role, snapshot, startPresenting, endPresenting, presentStage, presentDemoOverlay } = useM3Presentation();
  const presenting = role === "presenting";

  if (!presenting) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2 text-sm">
        <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--primary-container)]">co_present</span>
        <span className="font-semibold text-[var(--foreground)]">Mode pengajar</span>
        <span className="text-xs text-[var(--text-secondary)]">Publikasikan tahap dan sorotan ke siswa yang mengikuti.</span>
        <button type="button" onClick={startPresenting} className={`${primaryBtn} ml-auto`} disabled={role === "following"}>
          Mulai presentasi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-[var(--primary-container)] bg-[var(--surface-container-low)] px-3 py-2.5 text-sm" data-presenter-deck>
      <div className="flex flex-wrap items-center gap-2">
        <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--primary-container)]">co_present</span>
        <span className="font-semibold text-[var(--foreground)]">Anda memimpin presentasi</span>
        <button type="button" onClick={endPresenting} className={`${controlBtn} ml-auto`}>Akhiri presentasi</button>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Tahap</p>
        <div className="mt-1 flex flex-wrap gap-2" role="group" aria-label="Publikasikan tahap">
          {M3_STAGE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => presentStage(id)}
              aria-pressed={snapshot?.stageId === id}
              className={`${controlBtn} aria-pressed:border-[var(--primary-container)] aria-pressed:bg-[var(--surface-selected)]`}
            >
              {STAGE_LABEL[id]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Sorotan agen (Pahami)</p>
        <div className="mt-1 flex flex-wrap gap-2" role="group" aria-label="Publikasikan sorotan agen">
          {M3_DEMO_AGENT_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => presentDemoOverlay({ kind: "complexing-agent", id })}
              aria-pressed={snapshot?.demoOverlay?.kind === "complexing-agent" && snapshot.demoOverlay.id === id}
              className={`${controlBtn} aria-pressed:border-[var(--primary-container)] aria-pressed:bg-[var(--surface-selected)]`}
            >
              {BATH_AGENT_LABELS[id]}
            </button>
          ))}
          <button type="button" onClick={() => presentDemoOverlay(null)} className={controlBtn}>
            Hapus sorotan
          </button>
        </div>
      </div>

      <p className="text-xs leading-5 text-[var(--text-secondary)]">
        Kontrol ini hanya mengirim tahap dan sorotan. Ceklis, catatan, dan jawaban siswa tidak pernah ikut terkirim.
      </p>
    </div>
  );
}
