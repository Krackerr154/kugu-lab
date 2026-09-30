import { randomBytes } from "node:crypto";

export interface PublicPresentationSession {
  roomId: string;
  name: string;
  stageId: string;
  createdAt: number;
}

interface InternalPresentationSession extends PublicPresentationSession {
  presenterTicket: string;
}

// Global active session in this Next.js server instance
let activeSession: InternalPresentationSession | null = null;

export function getActiveSessionPublic(): PublicPresentationSession | null {
  if (!activeSession) return null;
  return {
    roomId: activeSession.roomId,
    name: activeSession.name,
    stageId: activeSession.stageId,
    createdAt: activeSession.createdAt,
  };
}

export function updateSessionStage(stageId: string) {
  if (activeSession) {
    activeSession.stageId = stageId;
  }
}

export async function createPresentationSession(name = "Sesi Praktikum KI3131"): Promise<InternalPresentationSession> {
  const relayInternalUrl = process.env.RELAY_INTERNAL_URL || "http://kugu-m3-relay:8787";
  const adminSecret = process.env.ADMIN_SECRET || "";

  let roomId = randomBytes(24).toString("base64url");
  let presenterTicket = randomBytes(32).toString("base64url");

  if (adminSecret) {
    try {
      const res = await fetch(`${relayInternalUrl}/internal/rooms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = (await res.json()) as { roomId: string; presenterTicket: string };
        if (data.roomId && data.presenterTicket) {
          roomId = data.roomId;
          presenterTicket = data.presenterTicket;
        }
      }
    } catch {
      // In local dev without relay, keep generated local IDs
    }
  }

  activeSession = {
    roomId,
    name,
    presenterTicket,
    stageId: "brief",
    createdAt: Date.now(),
  };

  return activeSession;
}

export async function endPresentationSession() {
  const relayInternalUrl = process.env.RELAY_INTERNAL_URL || "http://kugu-m3-relay:8787";
  const adminSecret = process.env.ADMIN_SECRET || "";

  if (adminSecret && activeSession) {
    try {
      await fetch(`${relayInternalUrl}/internal/rooms`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminSecret}`,
        },
      });
    } catch {
      // ignore
    }
  }

  activeSession = null;
}
