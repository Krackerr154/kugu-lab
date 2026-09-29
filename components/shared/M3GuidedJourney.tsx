"use client";

// Client pieces that bind the guided-presentation follower context to the M3
// surfaces (Phase 2). Kept separate from the server page so ModuleJourney stays
// generic for other modules.
//
//   M3Journey        — renders ModuleJourney fed with the follower's navRequest
//   M3FollowControls — the voluntary Ikuti/Berhenti follow controls (compact,
//                      placed inside the Brief stage so it does not bloat the
//                      sticky rail's arrival position)
//
// Both read from M3PresentationProvider, which the page wraps around everything.

import { ModuleJourney, type JourneyStage } from "@/components/shared/ModuleJourney";
import { useM3Presentation } from "@/components/shared/M3PresentationProvider";

const STAGE_LABEL: Record<string, string> = {
  brief: "Tinjauan",
  understand: "Pahami",
  rehearse: "Latih",
  prove: "Buktikan",
  ready: "Siap",
};

export function M3Journey({ stages }: { stages: JourneyStage[] }) {
  const { navRequest } = useM3Presentation();
  return <ModuleJourney stages={stages} navRequest={navRequest} />;
}

export function M3FollowControls() {
  const { mode, status, snapshot, follow, unfollow } = useM3Presentation();
  const following = mode === "following";

  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2 text-sm"
      data-presentation-status={status}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--primary-container)]">
        {following ? "cast_connected" : "cast"}
      </span>
      <span className="font-semibold text-[var(--foreground)]">
        {following ? "Mengikuti presentasi" : "Mode mandiri"}
      </span>
      {following && snapshot && (
        <span className="text-xs text-[var(--text-secondary)]">
          · tahap {STAGE_LABEL[snapshot.stageId] ?? snapshot.stageId}
        </span>
      )}
      <span aria-live="polite" role="status" className="sr-only">
        {following
          ? `Mengikuti presentasi. Tahap saat ini ${snapshot ? STAGE_LABEL[snapshot.stageId] ?? snapshot.stageId : "menunggu"}.`
          : "Mode mandiri. Anda menjelajah sendiri."}
      </span>
      {following ? (
        <button
          type="button"
          onClick={unfollow}
          className="ml-auto min-h-9 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
        >
          Berhenti mengikuti
        </button>
      ) : (
        <button
          type="button"
          onClick={follow}
          className="ml-auto min-h-9 rounded-lg bg-[var(--primary-container)] px-3 text-xs font-semibold text-[var(--on-primary)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
        >
          Ikuti presentasi
        </button>
      )}
    </div>
  );
}
