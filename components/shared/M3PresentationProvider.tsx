"use client";

// M3 guided-presentation provider. Local BroadcastChannel is retained only when
// no relay URL is configured; production uses the WSS relay transport.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createLocalTransport,
  createRelayTransport,
  newClientId,
  newEpoch,
  type M3PresentationState,
  type M3StageId,
  type M3DemoOverlay,
  type PresentationMessage,
  type PresentationTransport,
  type RelayServerMessage,
} from "@/lib/m3-presentation";
import type { JourneyNavRequest } from "@/components/shared/ModuleJourney";
import type { BathAgent } from "@/lib/m3-ligands";

export type Role = "solo" | "following" | "presenting";
export type ConnectionStatus = "solo" | "connecting" | "following" | "reconnecting" | "disconnected" | "ended" | "presenting";
export interface AgentRequest { id: BathAgent; token: number; }
export interface PresentationTransportConfig { roomId: string; role: "student" | "presenter"; ticket?: string; }
export type PresentationTransportFactory = (config: PresentationTransportConfig) => PresentationTransport;

interface M3PresentationContextValue {
  role: Role;
  status: ConnectionStatus;
  snapshot: M3PresentationState | null;
  navRequest: JourneyNavRequest | null;
  agentRequest: AgentRequest | null;
  ended: boolean;
  relayMode: boolean;
  roomId: string;
  presenterTicket: string;
  joinError: string | null;
  setRoomId: (value: string) => void;
  setPresenterTicket: (value: string) => void;
  follow: () => void;
  unfollow: () => void;
  rejoin: () => void;
  startPresenting: () => void;
  endPresenting: () => void;
  presentStage: (stageId: M3StageId) => void;
  presentDemoOverlay: (overlay: M3DemoOverlay) => void;
}

const Context = createContext<M3PresentationContextValue | null>(null);
const INITIAL_STATE: M3PresentationState = { version: 1, stageId: "brief" };
const envRelayUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_M3_RELAY_URL ?? "" : "";

export function M3PresentationProvider({ children, transportFactory, relayUrl = envRelayUrl }: {
  children: React.ReactNode;
  transportFactory?: PresentationTransportFactory;
  relayUrl?: string;
}) {
  const relayMode = relayUrl.length > 0;
  const [role, setRole] = useState<Role>("solo");
  const [status, setStatus] = useState<ConnectionStatus>("solo");
  const [snapshot, setSnapshot] = useState<M3PresentationState | null>(null);
  const [navRequest, setNavRequest] = useState<JourneyNavRequest | null>(null);
  const [agentRequest, setAgentRequest] = useState<AgentRequest | null>(null);
  const [ended, setEnded] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [presenterTicket, setPresenterTicket] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const tokenRef = useRef(0);
  const clientIdRef = useRef("");
  const epochRef = useRef<string | null>(null);
  const lastSeqRef = useRef(-1);
  const presenterEpochRef = useRef("");
  const presenterSeqRef = useRef(0);
  const presenterStateRef = useRef<M3PresentationState>(INITIAL_STATE);
  const presenterPublishRef = useRef<(() => void) | null>(null);

  const makeTransport = useCallback((config: PresentationTransportConfig) => {
    if (transportFactory) return transportFactory(config);
    if (relayMode) return createRelayTransport({ url: relayUrl, ...config });
    return createLocalTransport();
  }, [relayMode, relayUrl, transportFactory]);

  const applyState = useCallback((state: M3PresentationState) => {
    tokenRef.current += 1;
    const token = tokenRef.current;
    setSnapshot(state);
    setNavRequest({ stageId: state.stageId, token });
    setAgentRequest(state.demoOverlay?.kind === "complexing-agent" ? { id: state.demoOverlay.id, token } : null);
  }, []);

  const acceptState = useCallback((message: PresentationMessage | RelayServerMessage) => {
    if (message.t === "state") {
      if (epochRef.current !== message.epoch) { epochRef.current = message.epoch; lastSeqRef.current = -1; }
      if (message.seq <= lastSeqRef.current) return;
      lastSeqRef.current = message.seq;
      setStatus("following");
      setEnded(false);
      applyState(message.state);
    }
  }, [applyState]);

  useEffect(() => {
    if (role !== "following") return;
    const transport = makeTransport({ roomId: roomId.trim(), role: "student" });
    setEnded(false); setStatus("connecting"); setJoinError(null); epochRef.current = null; lastSeqRef.current = -1;
    const unsubscribe = transport.subscribe((message) => {
      if (message.t === "state") acceptState(message);
      else if (message.t === "ended") { setStatus("ended"); setEnded(true); }
      else if (message.t === "presence" && !message.connected) setStatus("disconnected");
      else if (message.t === "error") { setJoinError(message.code); setStatus(message.code === "room-not-found" || message.code === "unauthorized" ? "ended" : "disconnected"); }
    });
    if (transport.mode === "local") transport.send({ t: "hello", clientId: clientIdRef.current || (clientIdRef.current = newClientId()) });
    return () => {
      if (transport.mode === "local") transport.send({ t: "bye", clientId: clientIdRef.current });
      unsubscribe(); transport.close();
    };
  }, [acceptState, makeTransport, role, roomId]);

  useEffect(() => {
    if (role !== "presenting") return;
    const transport = makeTransport({ roomId: roomId.trim(), role: "presenter", ticket: presenterTicket.trim() });
    presenterEpochRef.current = newEpoch(); presenterSeqRef.current = 0; presenterStateRef.current = INITIAL_STATE;
    setStatus("presenting"); setSnapshot(INITIAL_STATE); setJoinError(null);
    const publish = () => {
      presenterSeqRef.current += 1;
      if (transport.mode === "relay") transport.send({ t: "present", state: presenterStateRef.current });
      else transport.send({ t: "state", epoch: presenterEpochRef.current, seq: presenterSeqRef.current, state: presenterStateRef.current });
    };
    const unsubscribe = transport.subscribe((message) => {
      if (message.t === "hello" && transport.mode === "local") publish();
      if (message.t === "error") setJoinError(message.code);
    });
    presenterPublishRef.current = publish;
    publish();
    return () => {
      if (transport.mode === "relay") transport.send({ t: "end" });
      else transport.send({ t: "ended", epoch: presenterEpochRef.current });
      unsubscribe(); transport.close(); presenterPublishRef.current = null;
    };
  }, [makeTransport, presenterTicket, role, roomId]);

  const follow = useCallback(() => {
    if (relayMode && !roomId.trim()) { setJoinError("room-required"); return; }
    setJoinError(null); setEnded(false); setRole("following");
  }, [relayMode, roomId]);
  const unfollow = useCallback(() => { setRole("solo"); setStatus("solo"); setSnapshot(null); setNavRequest(null); setAgentRequest(null); setEnded(false); }, []);
  const rejoin = useCallback(() => { setRole("solo"); setStatus("solo"); setEnded(false); window.setTimeout(() => setRole("following"), 0); }, []);
  const startPresenting = useCallback(() => {
    if (relayMode && (!roomId.trim() || !presenterTicket.trim())) { setJoinError("room-and-ticket-required"); return; }
    setJoinError(null); setRole("presenting");
  }, [presenterTicket, relayMode, roomId]);
  const endPresenting = useCallback(() => { setRole("solo"); setStatus("solo"); setSnapshot(null); }, []);
  const presentStage = useCallback((stageId: M3StageId) => {
    presenterStateRef.current = { version: 1, stageId, ...(stageId === "understand" && presenterStateRef.current.focusId ? { focusId: presenterStateRef.current.focusId } : {}) };
    setSnapshot(presenterStateRef.current); presenterPublishRef.current?.();
  }, []);
  const presentDemoOverlay = useCallback((overlay: M3DemoOverlay) => {
    presenterStateRef.current = overlay ? { version: 1, stageId: "understand", focusId: "complexing-agents", demoOverlay: overlay } : { ...presenterStateRef.current, demoOverlay: null };
    setSnapshot(presenterStateRef.current); presenterPublishRef.current?.();
  }, []);

  const value = useMemo(() => ({ role, status, snapshot, navRequest, agentRequest, ended, relayMode, roomId, presenterTicket, joinError, setRoomId, setPresenterTicket, follow, unfollow, rejoin, startPresenting, endPresenting, presentStage, presentDemoOverlay }), [role, status, snapshot, navRequest, agentRequest, ended, relayMode, roomId, presenterTicket, joinError, follow, unfollow, rejoin, startPresenting, endPresenting, presentStage, presentDemoOverlay]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useM3Presentation() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useM3Presentation must be used within an M3PresentationProvider");
  return ctx;
}
export function useOptionalM3Presentation() { return useContext(Context); }
