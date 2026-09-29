// M3 guided-presentation shared contract (Phases 2–4).
//
// TWO layers:
//   1. M3PresentationState — the ONLY teaching payload that crosses between a
//      presenter and a follower: a stage, an optional section focus, and an
//      optional demonstration overlay. NEVER pixels, scroll offsets, cursor,
//      NIM, or private student input. coercePresentationState() validates AND
//      strips unknown fields, so hostile/private data can't ride along.
//   2. PresentationMessage — the wire envelope: state (with server-ownable
//      epoch+sequence), plus presence/lifecycle messages (hello/bye/ended).
//      coerceMessage() is the single receive-side choke point.
//
// Phases 2–3 are local-only: createLocalTransport uses a same-origin
// BroadcastChannel (no network). Phase 4 swaps in a WSS transport implementing
// the same send/subscribe(message) interface, with the server owning epoch and
// monotonic sequence.

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

// The only demonstration overlay in the MVP: a specific complexing-agent card.
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
 * Validate and NORMALIZE arbitrary input into a safe M3PresentationState, or
 * return null. Unknown/extra fields are dropped — arbitrary client JSON is never
 * forwarded. Both the presenter (before publish) and follower (on receive) run
 * this single choke point.
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

// ── Wire envelope ───────────────────────────────────────────────────────────
// `state` carries a server-ownable epoch (session instance id) and monotonic
// sequence so followers can reject stale/duplicate messages and reload a fresh
// snapshot when the epoch changes (plan §4). hello/bye drive presence and, on
// hello, a snapshot-on-join reply. ended signals the session is over.
export type PresentationMessage =
  | { t: "state"; epoch: string; seq: number; state: M3PresentationState }
  | { t: "hello"; clientId: string }
  | { t: "bye"; clientId: string }
  | { t: "ended"; epoch: string };

const isId = (x: unknown): x is string => typeof x === "string" && x.length > 0 && x.length <= 200;

/** Validate + normalize a received wire message, or null. Drops unknown fields. */
export function coerceMessage(input: unknown): PresentationMessage | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;
  switch (o.t) {
    case "state": {
      if (!isId(o.epoch)) return null;
      if (typeof o.seq !== "number" || !Number.isInteger(o.seq) || o.seq < 0) return null;
      const state = coercePresentationState(o.state);
      if (!state) return null;
      return { t: "state", epoch: o.epoch, seq: o.seq, state };
    }
    case "hello":
      return isId(o.clientId) ? { t: "hello", clientId: o.clientId } : null;
    case "bye":
      return isId(o.clientId) ? { t: "bye", clientId: o.clientId } : null;
    case "ended":
      return isId(o.epoch) ? { t: "ended", epoch: o.epoch } : null;
    default:
      return null;
  }
}

export function newClientId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
export function newEpoch(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ── Transport ───────────────────────────────────────────────────────────────
export interface PresentationTransport {
  send(message: PresentationMessage): void;
  subscribe(handler: (message: PresentationMessage) => void): () => void;
  close(): void;
}

export const M3_PRESENTATION_CHANNEL = "m3-presentation";

/** Same-origin, no-network transport for Phases 2–3. SSR/absent-API safe. */
export function createLocalTransport(
  channelName: string = M3_PRESENTATION_CHANNEL,
): PresentationTransport {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return { send: () => {}, subscribe: () => () => {}, close: () => {} };
  }
  const channel = new BroadcastChannel(channelName);
  return {
    send(message) {
      channel.postMessage(message);
    },
    subscribe(handler) {
      const listener = (event: MessageEvent) => {
        const message = coerceMessage(event.data);
        if (message) handler(message); // ignore malformed / foreign messages
      };
      channel.addEventListener("message", listener);
      return () => channel.removeEventListener("message", listener);
    },
    close() {
      channel.close();
    },
  };
}
