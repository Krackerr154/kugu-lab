export type M3StageId = 'brief' | 'understand' | 'rehearse' | 'prove' | 'ready';
export type M3FocusId = 'cell-map' | 'complexing-agents' | 'calculator';
export type M3DemoAgentId = 'edta' | 'citrate' | 'peg400';
export type M3DemoOverlay = { kind: 'complexing-agent'; id: M3DemoAgentId } | null;
export type ReviewSlideId =
  | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10'
  | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10' | 'q11' | 'q12' | 'q13'
  | 'r1' | 'r2' | 'r3' | 'r4' | 'r5' | 'r6' | 'r7' | 'r8' | 'r9' | 'r10'
  | 'r11' | 'r12' | 'r13' | 'r14' | 'r15' | 'r16' | 'r17' | 'r18' | 'r19' | 'r20'
  | 'r21' | 'r22' | 'r23' | 'r24' | 'r25';
export type ReviewDeckId = 'm4' | 'm6' | 'm7';
export type ReviewPhase = 'review' | 'games';
export interface M3SimState {
  playing: boolean;
  time: number;
  complexed: boolean;
  view: 'closeup' | 'cell';
  mode?: 'alloy' | 'dendrite';
  peg?: boolean;
}
export interface M3PresentationState {
  version: 1;
  stageId: M3StageId;
  focusId?: M3FocusId;
  demoOverlay?: M3DemoOverlay;
  slideId?: ReviewSlideId;
  phase?: ReviewPhase;
  dataSetId?: string;
  simState?: M3SimState;
  slideStage?: number;
}
export const M3_STAGE_IDS: readonly M3StageId[];
export const M3_FOCUS_IDS: readonly M3FocusId[];
export const M3_DEMO_AGENT_IDS: readonly M3DemoAgentId[];
export const M3_PRESENTATION_VERSION: 1;
export const REVIEW_SLIDE_CHAPTER: Readonly<Record<ReviewSlideId, M3StageId>>;
export const REVIEW_SLIDE_IDS: readonly ReviewSlideId[];
export const REVIEW_DECK_IDS: readonly ReviewDeckId[];
export const REVIEW_SLIDE_CHAPTER_BY_DECK: Readonly<Record<ReviewDeckId, Readonly<Record<string, M3StageId>>>>;
export const REVIEW_SLIDE_IDS_BY_DECK: Readonly<Record<ReviewDeckId, readonly ReviewSlideId[]>>;
export const ALL_REVIEW_SLIDE_IDS: readonly ReviewSlideId[];
export function reviewDeckOfSlide(slideId: unknown): ReviewDeckId | null;
export function reviewStageOfSlide(slideId: unknown): M3StageId | null;
export const REVIEW_PHASES: readonly ReviewPhase[];
export function coercePresentationState(input: unknown): M3PresentationState | null;
