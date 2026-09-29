"use client";

// M3 guided-presentation follower context (Phase 2, local-only).
//
// Owns the voluntary follow mode and, while following, subscribes to a
// PresentationTransport and turns each received (validated) snapshot into two
// controlled, one-way requests the M3 surfaces consume:
//   - navRequest  → ModuleJourney jumps to the stage (instant, no focus steal)
//   - agentRequest → CodepositionWorkbench selects the demo complexing agent
//
// It NEVER publishes and NEVER touches private student state (checklist,
// notebook, calculator, CER). Applying a snapshot cannot loop back onto the
// transport. When not following, both requests are null so solo M3 is untouched.
//
// Phase 2 uses createLocalTransport (same-origin BroadcastChannel, no network).
// Phase 4 swaps in a WSS-backed transport of the same shape via transportFactory.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createLocalTransport,
  type M3PresentationState,
  type PresentationTransport,
} from "@/lib/m3-presentation";
import type { JourneyNavRequest } from "@/components/shared/ModuleJourney";
import type { BathAgent } from "@/lib/m3-ligands";

export type FollowMode = "solo" | "following";
// Phase 4 will widen this to connecting/reconnecting/disconnected/ended.
export type ConnectionStatus = "solo" | "following";

export interface AgentRequest {
  id: BathAgent;
  token: number;
}

interface M3PresentationContextValue {
  mode: FollowMode;
  status: ConnectionStatus;
  /** Latest applied snapshot while following, else null. */
  snapshot: M3PresentationState | null;
  navRequest: JourneyNavRequest | null;
  agentRequest: AgentRequest | null;
  follow: () => void;
  unfollow: () => void;
}

const M3PresentationContext = createContext<M3PresentationContextValue | null>(null);

export function M3PresentationProvider({
  children,
  transportFactory = createLocalTransport,
}: {
  children: React.ReactNode;
  /** Injectable for tests and the Phase 4 WSS transport. */
  transportFactory?: () => PresentationTransport;
}) {
  const [mode, setMode] = useState<FollowMode>("solo");
  const [snapshot, setSnapshot] = useState<M3PresentationState | null>(null);
  const [navRequest, setNavRequest] = useState<JourneyNavRequest | null>(null);
  const [agentRequest, setAgentRequest] = useState<AgentRequest | null>(null);
  const tokenRef = useRef(0);

  useEffect(() => {
    if (mode !== "following") return;
    const transport = transportFactory();
    const unsubscribe = transport.subscribe((state) => {
      // A fresh token every message so re-sending the same stage still applies.
      tokenRef.current += 1;
      const token = tokenRef.current;
      setSnapshot(state);
      setNavRequest({ stageId: state.stageId, token });
      if (state.demoOverlay && state.demoOverlay.kind === "complexing-agent") {
        setAgentRequest({ id: state.demoOverlay.id, token });
      }
    });
    return () => {
      unsubscribe();
      transport.close();
    };
  }, [mode, transportFactory]);

  const follow = useCallback(() => setMode("following"), []);
  const unfollow = useCallback(() => {
    // Detach without deleting personal work; stop moving the follower.
    setMode("solo");
    setSnapshot(null);
    setNavRequest(null);
    setAgentRequest(null);
  }, []);

  const value = useMemo<M3PresentationContextValue>(
    () => ({ mode, status: mode, snapshot, navRequest, agentRequest, follow, unfollow }),
    [mode, snapshot, navRequest, agentRequest, follow, unfollow],
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
