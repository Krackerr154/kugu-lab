"use client";

import { M3PresenterDeck, type M3StageLabelMap } from "@/components/shared/M3GuidedJourney";
import { useM3Presentation } from "@/components/shared/M3PresentationProvider";
import { M4InstructorUnlock } from "@/components/shared/M4InstructorUnlock";
import { useM4GuidedAccess } from "@/components/shared/M4GuidedAccessGate";
import type { M3StageId } from "@/lib/m3-presentation";

interface M4PresenterAccessProps {
  stageLabels: M3StageLabelMap;
  visibleStageIds: readonly M3StageId[];
}

export function M4PresenterAccess({ stageLabels, visibleStageIds }: M4PresenterAccessProps) {
  const { instructorUnlocked, revokeInstructor } = useM4GuidedAccess();
  const { endPresenting } = useM3Presentation();

  if (!instructorUnlocked) return <M4InstructorUnlock />;

  return (
    <div className="space-y-2" data-m4-instructor-unlocked>
      <M3PresenterDeck stageLabels={stageLabels} visibleStageIds={visibleStageIds} />
      <button
        type="button"
        onClick={() => { endPresenting(); void revokeInstructor(); }}
        className="m4-motion-control min-h-11 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
      >
        Kunci kembali mode pengajar
      </button>
    </div>
  );
}
