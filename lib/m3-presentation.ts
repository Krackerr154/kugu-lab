// M3 guided-presentation shared contract (Phase 2).
//
// This is the ONLY shape allowed to cross between a presenter and a follower.
// It carries semantic teaching context — a stage, an optional section focus, and
// an optional demonstration overlay — NEVER pixels, scroll offsets, cursor
// positions, NIM, or any private student input (checklist, notebook, calculator,
// CER). Everything here is validated on both sides before it is applied.
//
// Phase 2 is local-only: there is no relay. A same-origin BroadcastChannel plays
// the role the WebSocket relay will fill in Phase 4, so the follow/apply logic
// is real and testable without any network.

import type { BathAgent } from "@/lib/m3-ligands";

export type M3StageId = "brief" | "understand" | "rehearse" | "prove" | "ready";
export const M3_STAGE_IDS: readonly M3StageId[] = [
  "brief",
  "understand",
  "rehearse",
  "prove",
  "ready",
] as const;

// Allowlisted section anchors a presenter may point at (semantic, not pixels).
export type M3FocusId = "cell-map" | "complexing-agents" | "calculator";
export const M3_FOCUS_IDS: readonly M3FocusId[] = [
  "cell-map",
  "complexing-agents",
  "calculator",
] as const;

// The only demonstration overlay in the MVP: a specific complexing-agent card
// in the Understand stage. `id` reuses the workbench's BathAgent union.
export const M3_DEMO_AGENT_IDS: readonly BathAgent[] = ["edta", "citrate", "peg400"] as const;
export type M3DemoOverlay = { kind: "complexing-agent"; id: BathAgent } | null;

export interface M3PresentationState {
  version: 1;
  stageId: M3StageId;
  focusId?: M3FocusId;
  demoOverlay?: M3DemoOverlay;
}

export const M3_PRESENTATION_VERSION = 1 as const;

function isStageId(x: unknown): x is M3StageId {
  return typeof x === "string" && (M3_STAGE_IDS as readonly string[]).includes(x);
}
function isFocusId(x: unknown): x is M3FocusId {
  return typeof x === "string" && (M3_FOCUS_IDS as readonly string[]).includes(x);
}
function isDemoOverlay(x: unknown): x is M3DemoOverlay {
  if (x === null || x === undefined) return true;
  if (typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return o.kind === "complexing-agent" && (M3_DEMO_AGENT_IDS as readonly unknown[]).includes(o.id);
}

/**
 * Validate and NORMALIZE arbitrary input (e.g. a parsed wire message) into a
 * safe M3PresentationState, or return null. Unknown/extra fields are dropped —
 * we never forward arbitrary client JSON. This is the single choke point both
 * the presenter (before publish) and the follower (on receive) run.
 */
export function coercePresentationState(input: unknown): M3PresentationState | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;
  if (o.version !== M3_PRESENTATION_VERSION) return null;
  if (!isStageId(o.stageId)) return null;
  if (o.focusId !== undefined && !isFocusId(o.focusId)) return null;
  if (o.demoOverlay !== undefined && !isDemoOverlay(o.demoOverlay)) return null;

  const state: M3PresentationState = { version: M3_PRESENTATION_VERSION, stageId: o.stageId };
  if (isFocusId(o.focusId)) state.focusId = o.focusId;
  if (o.demoOverlay === null) state.demoOverlay = null;
  else if (isDemoOverlay(o.demoOverlay) && o.demoOverlay) state.demoOverlay = o.demoOverlay;
  return state;
}

export function isPresentationState(input: unknown): input is M3PresentationState {
  return coercePresentationState(input) !== null;
}

// ── Local (no-network) transport for Phase 2 ────────────────────────────────
// A thin channel the follower subscribes to and a presenter/test posts to. The
// BroadcastChannel implementation is same-origin only and never touches the
// network; Phase 4 swaps this for a WSS-backed implementation of the same shape.

export interface PresentationTransport {
  publish(state: M3PresentationState): void;
  subscribe(handler: (state: M3PresentationState) => void): () => void;
  close(): void;
}

export const M3_PRESENTATION_CHANNEL = "m3-presentation";

export function createLocalTransport(
  channelName: string = M3_PRESENTATION_CHANNEL,
): PresentationTransport {
  // SSR / unsupported-environment guard: a no-op transport keeps solo M3 working.
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return { publish: () => {}, subscribe: () => () => {}, close: () => {} };
  }
  const channel = new BroadcastChannel(channelName);
  return {
    publish(state) {
      channel.postMessage(state);
    },
    subscribe(handler) {
      const listener = (event: MessageEvent) => {
        const state = coercePresentationState(event.data);
        if (state) handler(state); // ignore malformed / foreign messages
      };
      channel.addEventListener("message", listener);
      return () => channel.removeEventListener("message", listener);
    },
    close() {
      channel.close();
    },
  };
}
