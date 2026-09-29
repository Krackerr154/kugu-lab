// Browser + relay teaching-state boundary. Rebuild rather than forwarding input.
export const M3_STAGE_IDS = Object.freeze(['brief', 'understand', 'rehearse', 'prove', 'ready']);
export const M3_FOCUS_IDS = Object.freeze(['cell-map', 'complexing-agents', 'calculator']);
export const M3_DEMO_AGENT_IDS = Object.freeze(['edta', 'citrate', 'peg400']);
export const M3_PRESENTATION_VERSION = 1;

export function coercePresentationState(input) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null;
  if (input.version !== M3_PRESENTATION_VERSION || !M3_STAGE_IDS.includes(input.stageId)) return null;
  if (input.focusId !== undefined) {
    if (!M3_FOCUS_IDS.includes(input.focusId)) return null;
    const expectedStage = input.focusId === 'calculator' ? 'prove' : 'understand';
    if (input.stageId !== expectedStage) return null;
  }
  const overlay = input.demoOverlay;
  if (overlay !== undefined && overlay !== null &&
      (input.stageId !== 'understand' || typeof overlay !== 'object' || Array.isArray(overlay) ||
       overlay.kind !== 'complexing-agent' || !M3_DEMO_AGENT_IDS.includes(overlay.id))) return null;
  const state = { version: M3_PRESENTATION_VERSION, stageId: input.stageId };
  if (input.focusId !== undefined) state.focusId = input.focusId;
  if (overlay === null) state.demoOverlay = null;
  else if (overlay !== undefined) state.demoOverlay = { kind: 'complexing-agent', id: overlay.id };
  return state;
}
