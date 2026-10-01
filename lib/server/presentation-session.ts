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

const relayInternalUrl = () => process.env.RELAY_INTERNAL_URL || "http://kugu-m3-relay:8787";
const adminSecret = () => process.env.ADMIN_SECRET || "";

// Active sessions in this Next.js server instance, keyed by roomId.
//
// One asprak == one room, but several rooms can be live at once (parallel lab
// sections). Keying by roomId is what lets closing one session leave the others
// untouched — the previous single `activeSession` variable made two aspraks
// overwrite each other and made every close look global.
//
// Storage stays in-memory: a 30-minute review is cheap to recreate, so a
// container restart dropping sessions is an accepted limitation, not a bug to
// engineer around here.
const sessions = new Map<string, InternalPresentationSession>();

const toPublic = (session: InternalPresentationSession): PublicPresentationSession => ({
  roomId: session.roomId,
  name: session.name,
  stageId: session.stageId,
  createdAt: session.createdAt,
});

const newestFirst = (list: InternalPresentationSession[]) =>
  [...list].sort((a, b) => b.createdAt - a.createdAt);

/**
 * The most-recently-created session. Back-compat for callers that assumed a
 * single global session; prefer `getActiveSessionsPublic()` when more than one
 * room can be live.
 */
export function getActiveSessionPublic(): PublicPresentationSession | null {
  const latest = newestFirst([...sessions.values()])[0];
  return latest ? toPublic(latest) : null;
}

/** Every live session, newest first. */
export function getActiveSessionsPublic(): PublicPresentationSession[] {
  return newestFirst([...sessions.values()]).map(toPublic);
}

export function updateSessionStage(roomId: string, stageId: string) {
  const session = sessions.get(roomId);
  if (session) session.stageId = stageId;
}

export async function createPresentationSession(name = "Sesi Praktikum KI3131"): Promise<InternalPresentationSession> {
  const relayUrl = relayInternalUrl();
  const secret = adminSecret();

  let roomId = randomBytes(24).toString("base64url");
  let presenterTicket = randomBytes(32).toString("base64url");

  if (secret) {
    try {
      const res = await fetch(`${relayUrl}/internal/rooms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
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
      // In local dev without a relay, keep the generated local IDs.
    }
  }

  const session: InternalPresentationSession = {
    roomId,
    name,
    presenterTicket,
    stageId: "brief",
    createdAt: Date.now(),
  };
  sessions.set(roomId, session);
  return session;
}

/**
 * End ONE session. With a `roomId`, that exact session is closed; without one,
 * the most recent session is closed (back-compat). Either way this NEVER closes
 * more than a single room, and it tells the relay to close only that room's id
 * — the mass-close footgun is gone from both sides.
 */
export async function endPresentationSession(roomId?: string) {
  const relayUrl = relayInternalUrl();
  const secret = adminSecret();

  const target = roomId
    ? sessions.get(roomId)
    : newestFirst([...sessions.values()])[0];
  if (!target) return;

  if (secret) {
    try {
      await fetch(`${relayUrl}/internal/rooms/${encodeURIComponent(target.roomId)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      });
    } catch {
      // ignore — the local map is still cleaned up below
    }
  }

  sessions.delete(target.roomId);
}
