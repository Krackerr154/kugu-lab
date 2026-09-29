"use client";

// M3 guided-presentation context (Phases 2–3, local-only).
//
// One provider serves three roles on the same transport:
//   - solo:      not connected; solo M3 is completely untouched.
//   - following: subscribes and APPLIES validated snapshots as one-way,
//                idempotent-per-token requests (navRequest, agentRequest).
//                Never publishes. Rejects stale/duplicate seq within an epoch,
//                and reloads on epoch change. Sends hello on join → gets the
//                presenter's current snapshot back.
//   - presenting: owns an epoch + monotonic seq; publishes intentional snapshot
//                 updates and replies to hello with the current snapshot. Ending
//                 the session emits `ended`.
//
// It NEVER reads or transmits private student state (checklist, notebook,
// calculator, CER, NIM). Applying a snapshot cannot loop back onto the wire.
// Phase 4 swaps createLocalTransport for a WSS transport via transportFactory.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createLocalTransport,
  newClientId,
  newEpoch,
  type M3PresentationState,
  type M3StageId,
  type M3DemoOverlay,
  type PresentationMessage,
  type PresentationTransport,
} from "@/lib/m3-presentation";
import type { JourneyNavRequest } from "@/components/shared/ModuleJourney";
import type { BathAgent } from "@/lib/m3-ligands";

export type Role = "solo" | "following" | "presenting";
// Follower-facing connection status (plan §Phase 3 explicit labels).
export type ConnectionStatus =
  | "solo"
  | "connecting"
  | "following"
  | "reconnecting"
  | "disconnected"
  | "ended"
  | "presenting";

export interface AgentRequest {
  id: BathAgent;
  token: number;
}

interface M3PresentationContextValue {
  role: Role;
  status: ConnectionStatus;
  /** Latest applied snapshot while following, or the presenter's own state. */
  snapshot: M3PresentationState | null;
  navRequest: JourneyNavRequest | null;
  agentRequest: AgentRequest | null;
  /** True once a presenter session has ended under the follower. */
  ended: boolean;

  // Follower actions
  follow: () => void;
  unfollow: () => void;
  rejoin: () => void;

  // Presenter actions
  startPresenting: () => void;
  endPresenting: () => void;
  presentStage: (stageId: M3StageId) => void;
  presentDemoOverlay: (overlay: M3DemoOverlay) => void;
}

const M3PresentationContext = createContext<M3PresentationContextValue | null>(null);

const INITIAL_STATE: M3PresentationState = { version: 1, stageId: "brief" };

export function M3PresentationProvider({
  children,
  transportFactory = createLocalTransport,
}: {
  children: React.ReactNode;
  transportFactory?: () => PresentationTransport;
}) {
  const [role, setRole] = useState<Role>("solo");
  const [status, setStatus] = useState<ConnectionStatus>("solo");
  const [snapshot, setSnapshot] = useState<M3PresentationState | null>(null);
  const [navRequest, setNavRequest] = useState<JourneyNavRequest | null>(null);
  const [agentRequest, setAgentRequest] = useState<AgentRequest | null>(null);
  const [ended, setEnded] = useState(false);

  const transportRef = useRef<PresentationTransport | null>(null);
  const clientIdRef = useRef<string>("");
  const tokenRef = useRef(0);
  // Follower epoch/seq tracking for stale-message rejection.
  const epochRef = useRef<string | null>(null);
  const lastSeqRef = useRef<number>(-1);
  // Presenter authoritative state.
  const presenterEpochRef = useRef<string>("");
  const presenterSeqRef = useRef<number>(0);
  const presenterStateRef = useRef<M3PresentationState>(INITIAL_STATE);
  const presenterPublishRef = useRef<(() => void) | null>(null);

  const applyState = useCallback((state: M3PresentationState) => {
    tokenRef.current += 1;
    const token = tokenRef.current;
    setSnapshot(state);
    setNavRequest({ stageId: state.stageId, token });
    if (state.demoOverlay && state.demoOverlay.kind === "complexing-agent") {
      setAgentRequest({ id: state.demoOverlay.id, token });
    }
  }, []);

  // ── Follower subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (role !== "following") return;
    const transport = transportFactory();
    transportRef.current = transport;
    setEnded(false);
    setStatus("connecting");
    epochRef.current = null;
    lastSeqRef.current = -1;

    const unsubscribe = transport.subscribe((message: PresentationMessage) => {
      if (message.t === "state") {
        // New session instance → reset the sequence gate and take the snapshot.
        if (epochRef.current !== message.epoch) {
          epochRef.current = message.epoch;
          lastSeqRef.current = -1;
        }
        // Reject stale / duplicate messages within the same epoch.
        if (message.seq <= lastSeqRef.current) return;
        lastSeqRef.current = message.seq;
        setStatus("following");
        setEnded(false);
        applyState(message.state);
      } else if (message.t === "ended") {
        if (epochRef.current === null || epochRef.current === message.epoch) {
          setStatus("ended");
          setEnded(true);
        }
      }
    });

    // Announce arrival so the presenter replies with the current snapshot.
    transport.send({ t: "hello", clientId: clientIdRef.current || (clientIdRef.current = newClientId()) });

    return () => {
      // Leave politely; do not delete any personal work.
      transport.send({ t: "bye", clientId: clientIdRef.current });
      unsubscribe();
      transport.close();
      transportRef.current = null;
    };
  }, [role, transportFactory, applyState]);

  // ── Presenter subscription (answer hello with current snapshot) ───────────
  useEffect(() => {
    if (role !== "presenting") return;
    const transport = transportFactory();
    transportRef.current = transport;
    presenterEpochRef.current = newEpoch();
    presenterSeqRef.current = 0;
    presenterStateRef.current = INITIAL_STATE;
    setStatus("presenting");
    setSnapshot(INITIAL_STATE);

    const publish = () => {
      presenterSeqRef.current += 1;
      transport.send({
        t: "state",
        epoch: presenterEpochRef.current,
        seq: presenterSeqRef.current,
        state: presenterStateRef.current,
      });
    };

    const unsubscribe = transport.subscribe((message) => {
      // A late joiner said hello → send them (everyone) the authoritative state.
      if (message.t === "hello") publish();
    });

    // Announce the opening snapshot.
    publish();

    // Expose publish to the action callbacks via a ref-bound closure.
    presenterPublishRef.current = () => publish();

    return () => {
      transport.send({ t: "ended", epoch: presenterEpochRef.current });
      unsubscribe();
      transport.close();
      transportRef.current = null;
      presenterPublishRef.current = null;
    };
  }, [role, transportFactory]);

  // ── Follower actions ──────────────────────────────────────────────────────
  const follow = useCallback(() => {
    setEnded(false);
    setRole("following");
  }, []);
  const unfollow = useCallback(() => {
    setRole("solo");
    setStatus("solo");
    setSnapshot(null);
    setNavRequest(null);
    setAgentRequest(null);
    setEnded(false);
  }, []);
  const rejoin = useCallback(() => {
    // Detach and re-subscribe: forces the mount effect to re-run and re-hello.
    setRole("solo");
    setStatus("solo");
    setEnded(false);
    // Re-enter following on the next tick so the effect cleanup/mount cycle runs.
    queueMicrotask(() => setRole("following"));
  }, []);

  // ── Presenter actions ─────────────────────────────────────────────────────
  const startPresenting = useCallback(() => setRole("presenting"), []);
  const endPresenting = useCallback(() => {
    setRole("solo");
    setStatus("solo");
    setSnapshot(null);
  }, []);
  const presentStage = useCallback((stageId: M3StageId) => {
    presenterStateRef.current = { ...presenterStateRef.current, stageId };
    setSnapshot(presenterStateRef.current);
    presenterPublishRef.current?.();
  }, []);
  const presentDemoOverlay = useCallback((overlay: M3DemoOverlay) => {
    presenterStateRef.current = { ...presenterStateRef.current, demoOverlay: overlay };
    setSnapshot(presenterStateRef.current);
    presenterPublishRef.current?.();
  }, []);

  const value = useMemo<M3PresentationContextValue>(
    () => ({
      role,
      status,
      snapshot,
      navRequest,
      agentRequest,
      ended,
      follow,
      unfollow,
      rejoin,
      startPresenting,
      endPresenting,
      presentStage,
      presentDemoOverlay,
    }),
    [role, status, snapshot, navRequest, agentRequest, ended, follow, unfollow, rejoin, startPresenting, endPresenting, presentStage, presentDemoOverlay],
  );

  return <M3PresentationContext.Provider value={value}>{children}</M3PresentationContext.Provider>;
}

export function useM3Presentation(): M3PresentationContextValue {
  const ctx = useContext(M3PresentationContext);
  if (!ctx) throw new Error("useM3Presentation must be used within an M3PresentationProvider");
  return ctx;
}

/** Non-throwing variant for shared interactives that also render outside M3. */
export function useOptionalM3Presentation(): M3PresentationContextValue | null {
  return useContext(M3PresentationContext);
}
