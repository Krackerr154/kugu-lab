export type M3StageId = 'brief' | 'understand' | 'rehearse' | 'prove' | 'ready';
export type M3FocusId = 'cell-map' | 'complexing-agents' | 'calculator';
export type M3DemoAgentId = 'edta' | 'citrate' | 'peg400';
export type M3DemoOverlay = { kind: 'complexing-agent'; id: M3DemoAgentId } | null;
export type ReviewSlideId =
  | 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8' | 'p9' | 'p10'
  | 'p11' | 'p12' | 'p13' | 'p14' | 'p15' | 'p16' | 'p17' | 'p18' | 'p19';
export type ReviewPhase = 'review' | 'games';
export interface M3PresentationState {
  version: 1;
  stageId: M3StageId;
  focusId?: M3FocusId;
  demoOverlay?: M3DemoOverlay;
  slideId?: ReviewSlideId;
  phase?: ReviewPhase;
  dataSetId?: string;
}
export const M3_STAGE_IDS: readonly M3StageId[];
export const M3_FOCUS_IDS: readonly M3FocusId[];
export const M3_DEMO_AGENT_IDS: readonly M3DemoAgentId[];
export const M3_PRESENTATION_VERSION: 1;
export const REVIEW_SLIDE_CHAPTER: Readonly<Record<ReviewSlideId, M3StageId>>;
export const REVIEW_SLIDE_IDS: readonly ReviewSlideId[];
export const REVIEW_PHASES: readonly ReviewPhase[];
export function coercePresentationState(input: unknown): M3PresentationState | null;
