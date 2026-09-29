export type M3StageId = 'brief' | 'understand' | 'rehearse' | 'prove' | 'ready';
export type M3FocusId = 'cell-map' | 'complexing-agents' | 'calculator';
export type M3DemoAgentId = 'edta' | 'citrate' | 'peg400';
export type M3DemoOverlay = { kind: 'complexing-agent'; id: M3DemoAgentId } | null;
export interface M3PresentationState {
  version: 1;
  stageId: M3StageId;
  focusId?: M3FocusId;
  demoOverlay?: M3DemoOverlay;
}
export const M3_STAGE_IDS: readonly M3StageId[];
export const M3_FOCUS_IDS: readonly M3FocusId[];
export const M3_DEMO_AGENT_IDS: readonly M3DemoAgentId[];
export const M3_PRESENTATION_VERSION: 1;
export function coercePresentationState(input: unknown): M3PresentationState | null;
