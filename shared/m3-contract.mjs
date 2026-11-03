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
//
// Two decks now share this contract. Each keeps its own id namespace — Module 4
// uses p1..p10, Module 6 (FTIR) uses q1..q13, Module 7 (BET) uses r1..r25 — so
// a state can never be read
// against the wrong deck's chapter map.
const M4_REVIEW_SLIDE_CHAPTER = Object.freeze({
  p1: 'brief', p2: 'brief',
  p3: 'understand', p4: 'understand', p5: 'understand', p6: 'understand', p7: 'understand',
  p8: 'prove',
  p9: 'ready', p10: 'ready',
});
const M6_REVIEW_SLIDE_CHAPTER = Object.freeze({
  q1: 'brief', q2: 'brief',
  q3: 'understand', q4: 'understand', q5: 'understand', q6: 'understand',
  q7: 'understand', q8: 'understand',
  q9: 'prove', q10: 'prove', q11: 'prove',
  q12: 'ready', q13: 'ready',
});

const M7_REVIEW_SLIDE_CHAPTER = Object.freeze({
  r1: 'brief', r2: 'brief',
  r3: 'understand', r4: 'understand', r5: 'understand', r6: 'understand',
  r7: 'understand', r8: 'understand', r9: 'understand',
  r10: 'prove', r11: 'prove', r12: 'prove', r13: 'prove', r14: 'prove',
  r15: 'prove', r16: 'prove', r17: 'prove', r18: 'prove', r19: 'prove',
  r20: 'prove', r21: 'prove', r22: 'prove',
  r23: 'ready', r24: 'ready', r25: 'ready',
});
// Flat lookup the validator uses. The namespaces are disjoint, so spreading is safe.
const ALL_REVIEW_SLIDE_CHAPTER = Object.freeze({
  ...M4_REVIEW_SLIDE_CHAPTER,
  ...M6_REVIEW_SLIDE_CHAPTER,
  ...M7_REVIEW_SLIDE_CHAPTER,
});

export const REVIEW_DECK_IDS = Object.freeze(['m4', 'm6', 'm7']);
export const REVIEW_SLIDE_CHAPTER_BY_DECK = Object.freeze({
  m4: M4_REVIEW_SLIDE_CHAPTER,
  m6: M6_REVIEW_SLIDE_CHAPTER,
  m7: M7_REVIEW_SLIDE_CHAPTER,
});
// Backward-compatible aliases. Module 4's deck was the only one when these were
// introduced and its tests assert REVIEW_SLIDE_IDS equals its own id list, so
// these must keep pointing at Module 4 alone.
export const REVIEW_SLIDE_CHAPTER = M4_REVIEW_SLIDE_CHAPTER;
export const REVIEW_SLIDE_IDS = Object.freeze(Object.keys(M4_REVIEW_SLIDE_CHAPTER));
export const REVIEW_SLIDE_IDS_BY_DECK = Object.freeze({
  m4: REVIEW_SLIDE_IDS,
  m6: Object.freeze(Object.keys(M6_REVIEW_SLIDE_CHAPTER)),
  m7: Object.freeze(Object.keys(M7_REVIEW_SLIDE_CHAPTER)),
});
export const ALL_REVIEW_SLIDE_IDS = Object.freeze([
  ...REVIEW_SLIDE_IDS,
  ...REVIEW_SLIDE_IDS_BY_DECK.m6,
  ...REVIEW_SLIDE_IDS_BY_DECK.m7,
]);

/** Which deck a slide belongs to, or null for an unknown id. */
export function reviewDeckOfSlide(slideId) {
  if (typeof slideId !== 'string') return null;
  if (REVIEW_SLIDE_IDS_BY_DECK.m4.includes(slideId)) return 'm4';
  if (REVIEW_SLIDE_IDS_BY_DECK.m6.includes(slideId)) return 'm6';
  if (REVIEW_SLIDE_IDS_BY_DECK.m7.includes(slideId)) return 'm7';
  return null;
}

/**
 * The chapter a slide lives in, across every deck.
 *
 * presentSlide derives stageId from the slide id; using the Module 4-only map
 * would return undefined for a q* slide and the contract would drop the state.
 */
export function reviewStageOfSlide(slideId) {
  if (typeof slideId !== 'string') return null;
  return ALL_REVIEW_SLIDE_CHAPTER[slideId] ?? null;
}

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
    if (typeof input.slideId !== 'string' || !ALL_REVIEW_SLIDE_IDS.includes(input.slideId)) return null;
    if (ALL_REVIEW_SLIDE_CHAPTER[input.slideId] !== input.stageId) return null;
  }
  if (input.phase !== undefined && !REVIEW_PHASES.includes(input.phase)) return null;
  if (input.dataSetId !== undefined && (typeof input.dataSetId !== 'string' || !DATA_SET_ID_RE.test(input.dataSetId))) return null;
  if (input.simState !== undefined) {
    const sim = coerceSimState(input.simState);
    if (sim === null) return null;
  }
  if (input.slideStage !== undefined) {
    if (typeof input.slideStage !== 'number' || !Number.isInteger(input.slideStage) || input.slideStage < 0 || input.slideStage > 2) return null;
  }
  const state = { version: M3_PRESENTATION_VERSION, stageId: input.stageId };
  if (input.focusId !== undefined) state.focusId = input.focusId;
  if (overlay === null) state.demoOverlay = null;
  else if (overlay !== undefined) state.demoOverlay = { kind: 'complexing-agent', id: overlay.id };
  if (input.slideId !== undefined) state.slideId = input.slideId;
  if (input.phase !== undefined) state.phase = input.phase;
  if (input.dataSetId !== undefined) state.dataSetId = input.dataSetId;
  if (input.simState !== undefined) state.simState = coerceSimState(input.simState);
  if (input.slideStage !== undefined) state.slideStage = input.slideStage;
  return state;
}
