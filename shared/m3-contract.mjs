// Browser + relay teaching-state boundary. Rebuild rather than forwarding input.
//
// SINGLE SOURCE OF TRUTH. The relay imports this file directly (pure JS, no TS
// build step), and lib/m3-presentation.ts re-exports from it instead of keeping
// a second copy. That is deliberate: a divergent second validator would let the
// web app accept a state the relay rejects (clicks that move nothing) — see the
// contract parity test in relay/test/contract.test.mjs.
export const M3_STAGE_IDS = Object.freeze(['brief', 'understand', 'rehearse', 'prove', 'ready']);
export const M3_FOCUS_IDS = Object.freeze(['cell-map', 'complexing-agents', 'calculator']);
export const M3_DEMO_AGENT_IDS = Object.freeze(['edta', 'citrate', 'peg400']);
export const M3_PRESENTATION_VERSION = 1;

// --- Review-session additions (Phase 1) ------------------------------------
// A review "slide" is a named waypoint into the EXISTING module content, not a
// fixed-size box. Its chapter is the stage it lives in, so the relay can enforce
// slideId <-> stageId consistency exactly as it already does focusId <-> stageId.
// This map is the authoritative slide list; the UI layer (lib/m4-review-slides)
// adds titles/anchors on top of it rather than inventing its own id set.
export const REVIEW_SLIDE_CHAPTER = Object.freeze({
  p1: 'brief', p2: 'brief',
  p3: 'understand', p4: 'understand', p5: 'understand', p6: 'understand', p7: 'understand',
  p8: 'prove',
  p9: 'ready', p10: 'ready',
});
export const REVIEW_SLIDE_IDS = Object.freeze(Object.keys(REVIEW_SLIDE_CHAPTER));
export const REVIEW_PHASES = Object.freeze(['review', 'games']);
const DATA_SET_ID_RE = /^[A-Za-z0-9_-]{8,32}$/;

function coerceSimState(input) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null;
  if (typeof input.playing !== 'boolean') return null;
  if (typeof input.complexed !== 'boolean') return null;
  if (typeof input.time !== 'number' || !Number.isFinite(input.time) || input.time < 0 || input.time > 100) return null;
  if (input.view !== 'closeup' && input.view !== 'cell') return null;
  if (input.mode !== undefined && input.mode !== 'alloy' && input.mode !== 'dendrite') return null;
  if (input.peg !== undefined && typeof input.peg !== 'boolean') return null;
  const result = {
    playing: input.playing,
    time: Math.round(input.time * 10) / 10,
    complexed: input.complexed,
    view: input.view,
  };
  if (input.mode !== undefined) {
    result.mode = input.mode;
  }
  if (input.peg !== undefined) {
    result.peg = input.peg;
  }
  return result;
}

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
  // Review-session fields — all optional; absent === pre-Phase-1 behavior.
  // .includes() (not `in`) guards against prototype keys like "constructor".
  if (input.slideId !== undefined) {
    if (typeof input.slideId !== 'string' || !REVIEW_SLIDE_IDS.includes(input.slideId)) return null;
    if (REVIEW_SLIDE_CHAPTER[input.slideId] !== input.stageId) return null;
  }
  if (input.phase !== undefined && !REVIEW_PHASES.includes(input.phase)) return null;
  if (input.dataSetId !== undefined && (typeof input.dataSetId !== 'string' || !DATA_SET_ID_RE.test(input.dataSetId))) return null;
  if (input.simState !== undefined) {
    const sim = coerceSimState(input.simState);
    if (sim === null) return null;
  }
  const state = { version: M3_PRESENTATION_VERSION, stageId: input.stageId };
  if (input.focusId !== undefined) state.focusId = input.focusId;
  if (overlay === null) state.demoOverlay = null;
  else if (overlay !== undefined) state.demoOverlay = { kind: 'complexing-agent', id: overlay.id };
  if (input.slideId !== undefined) state.slideId = input.slideId;
  if (input.phase !== undefined) state.phase = input.phase;
  if (input.dataSetId !== undefined) state.dataSetId = input.dataSetId;
  if (input.simState !== undefined) state.simState = coerceSimState(input.simState);
  return state;
}
