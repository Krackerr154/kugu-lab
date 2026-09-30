// M3 guided-presentation shared contract (Phases 2–4).
// Semantic teaching context only: no pixels, private student data, or credentials.
import type { BathAgent } from "@/lib/m3-ligands";

export type M3StageId = "brief" | "understand" | "rehearse" | "prove" | "ready";
export const M3_STAGE_IDS: readonly M3StageId[] = ["brief", "understand", "rehearse", "prove", "ready"] as const;
export type M3FocusId = "cell-map" | "complexing-agents" | "calculator";
export const M3_FOCUS_IDS: readonly M3FocusId[] = ["cell-map", "complexing-agents", "calculator"] as const;
export const M3_DEMO_AGENT_IDS: readonly BathAgent[] = ["edta", "citrate", "peg400"] as const;
export type M3DemoOverlay = { kind: "complexing-agent"; id: BathAgent } | null;
export interface M3PresentationState { version: 1; stageId: M3StageId; focusId?: M3FocusId; demoOverlay?: M3DemoOverlay; }
export const M3_PRESENTATION_VERSION = 1 as const;

function isStageId(x: unknown): x is M3StageId { return typeof x === "string" && (M3_STAGE_IDS as readonly string[]).includes(x); }
function isFocusId(x: unknown): x is M3FocusId { return typeof x === "string" && (M3_FOCUS_IDS as readonly string[]).includes(x); }
function isFocusAllowed(stageId: M3StageId, focusId: M3FocusId): boolean {
  return stageId === "understand" ? focusId === "cell-map" || focusId === "complexing-agents" : stageId === "prove" ? focusId === "calculator" : false;
}
function normalizeDemoOverlay(x: unknown): M3DemoOverlay {
  if (x === null || x === undefined) return null;
  if (typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (o.kind !== "complexing-agent" || !(M3_DEMO_AGENT_IDS as readonly unknown[]).includes(o.id)) return null;
  return { kind: "complexing-agent", id: o.id as BathAgent };
}

export function coercePresentationState(input: unknown): M3PresentationState | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;
  if (o.version !== M3_PRESENTATION_VERSION || !isStageId(o.stageId)) return null;
  if (o.focusId !== undefined && (!isFocusId(o.focusId) || !isFocusAllowed(o.stageId, o.focusId))) return null;
  if (o.demoOverlay !== undefined && o.demoOverlay !== null && o.stageId !== "understand") return null;
  const demoOverlay = normalizeDemoOverlay(o.demoOverlay);
  if (o.demoOverlay !== undefined && o.demoOverlay !== null && !demoOverlay) return null;
  const state: M3PresentationState = { version: M3_PRESENTATION_VERSION, stageId: o.stageId };
  if (isFocusId(o.focusId)) state.focusId = o.focusId;
  if (o.demoOverlay === null) state.demoOverlay = null;
  else if (demoOverlay) state.demoOverlay = demoOverlay;
  return state;
}
export function isPresentationState(input: unknown): input is M3PresentationState { return coercePresentationState(input) !== null; }

export type PresentationMessage =
  | { t: "state"; epoch: string; seq: number; state: M3PresentationState }
  | { t: "hello"; clientId: string }
  | { t: "bye"; clientId: string }
  | { t: "ended"; epoch: string };
const isId = (x: unknown): x is string => typeof x === "string" && x.length > 0 && x.length <= 200;
export function coerceMessage(input: unknown): PresentationMessage | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;
  switch (o.t) {
    case "state": {
      if (!isId(o.epoch) || typeof o.seq !== "number" || !Number.isSafeInteger(o.seq) || o.seq < 0) return null;
      const state = coercePresentationState(o.state);
      return state ? { t: "state", epoch: o.epoch, seq: o.seq, state } : null;
    }
    case "hello": return isId(o.clientId) ? { t: "hello", clientId: o.clientId } : null;
    case "bye": return isId(o.clientId) ? { t: "bye", clientId: o.clientId } : null;
    case "ended": return isId(o.epoch) ? { t: "ended", epoch: o.epoch } : null;
    default: return null;
  }
}
export function newClientId(): string { return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`; }
export function newEpoch(): string { return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`; }

export type RelayRole = "student" | "presenter";
export type RelayClientMessage =
  | { t: "join"; roomId: string; role: RelayRole; ticket?: string }
  | { t: "present"; state: M3PresentationState }
  | { t: "snapshot" }
  | { t: "end" }
  | { t: "ping" };
export type RelayServerMessage =
  | { t: "state"; roomId: string; epoch: string; seq: number; state: M3PresentationState; presenterConnected: boolean; expiresAt: string }
  | { t: "presence"; roomId: string; epoch: string; connected: boolean }
  | { t: "ended"; roomId: string; epoch: string; reason: string }
  | { t: "error"; code: string }
  | { t: "pong" };
export type TransportMessage = PresentationMessage | RelayClientMessage | RelayServerMessage;

export interface PresentationTransport { readonly mode: "local" | "relay"; send(message: TransportMessage): void; subscribe(handler: (message: TransportMessage) => void): () => void; close(): void; }
export interface RelayTransportOptions { url: string; roomId: string; role: RelayRole; ticket?: string; reconnect?: boolean; }
export function coerceRelayServerMessage(input: unknown): RelayServerMessage | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;
  if (o.t === "state") {
    if (typeof o.roomId !== "string" || typeof o.epoch !== "string" || typeof o.expiresAt !== "string" || !Number.isSafeInteger(o.seq) || (o.seq as number) < 0) return null;
    const state = coercePresentationState(o.state);
    return state ? { t: "state", roomId: o.roomId, epoch: o.epoch, seq: o.seq as number, state, presenterConnected: o.presenterConnected === true, expiresAt: o.expiresAt } : null;
  }
  if (o.t === "presence") return typeof o.roomId === "string" && typeof o.epoch === "string" && typeof o.connected === "boolean" ? { t: "presence", roomId: o.roomId, epoch: o.epoch, connected: o.connected } : null;
  if (o.t === "ended") return typeof o.roomId === "string" && typeof o.epoch === "string" && typeof o.reason === "string" ? { t: "ended", roomId: o.roomId, epoch: o.epoch, reason: o.reason } : null;
  if (o.t === "error") return typeof o.code === "string" ? { t: "error", code: o.code } : null;
  if (o.t === "pong") return { t: "pong" };
  return null;
}

export const M3_PRESENTATION_CHANNEL = "m3-presentation";
export function createLocalTransport(channelName: string = M3_PRESENTATION_CHANNEL): PresentationTransport {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return { mode: "local", send: () => {}, subscribe: () => () => {}, close: () => {} };
  const channel = new BroadcastChannel(channelName);
  return {
    mode: "local",
    send(message) { channel.postMessage(message); },
    subscribe(handler) {
      const listener = (event: MessageEvent) => { const message = coerceMessage(event.data); if (message) handler(message); };
      channel.addEventListener("message", listener);
      return () => channel.removeEventListener("message", listener);
    },
    close() { channel.close(); },
  };
}

export function createRelayTransport(options: RelayTransportOptions): PresentationTransport {
  const listeners = new Set<(message: TransportMessage) => void>();
  let socket: WebSocket | null = null;
  let closed = false;
  let opened = false;
  let reconnectTimer: number | null = null;
  let heartbeatTimer: number | null = null;
  const queue: RelayClientMessage[] = [];
  const emit = (message: TransportMessage) => listeners.forEach((listener) => listener(message));
  let lastError: string | null = null;
  const connect = () => {
    if (closed) return;
    lastError = null;
    socket = new WebSocket(options.url);
    socket.addEventListener("open", () => {
      opened = true;
      socket?.send(JSON.stringify({ t: "join", roomId: options.roomId, role: options.role, ...(options.ticket ? { ticket: options.ticket } : {}) }));
      for (const message of queue.splice(0)) socket?.send(JSON.stringify(message));
      heartbeatTimer = window.setInterval(() => { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ t: "ping" })); }, 30_000);
    });
    socket.addEventListener("message", (event) => {
      try {
        const message = coerceRelayServerMessage(JSON.parse(String(event.data)));
        if (message) {
          if (message.t === "error") lastError = message.code;
          emit(message);
        }
      } catch {
        emit({ t: "error", code: "invalid-server-message" });
      }
    });
    socket.addEventListener("error", () => {
      if (!lastError) emit({ t: "error", code: "disconnected" });
    });
    socket.addEventListener("close", (event) => {
      opened = false;
      if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
      heartbeatTimer = null;
      if (!closed) {
        const code = lastError || event.reason || "disconnected";
        emit({ t: "error", code });
        if (options.reconnect !== false && code !== "room-not-found" && code !== "unauthorized") {
          reconnectTimer = window.setTimeout(connect, 1_000);
        }
      }
    });
  };
  connect();
  return {
    mode: "relay",
    send(message) { if (closed) return; const relayMessage = message as RelayClientMessage; if (opened && socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(relayMessage)); else queue.push(relayMessage); },
    subscribe(handler) { listeners.add(handler); return () => listeners.delete(handler); },
    close() { closed = true; if (reconnectTimer !== null) window.clearTimeout(reconnectTimer); if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer); socket?.close(1000, "client closed"); socket = null; },
  };
}
