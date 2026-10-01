import { NextResponse, type NextRequest } from "next/server";
import { isInstructorAuthenticated } from "@/lib/server/m4-guided-access";
import {
  getActiveSessionPublic,
  getActiveSessionsPublic,
  createPresentationSession,
  endPresentationSession,
} from "@/lib/server/presentation-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // `session` (singular, newest) stays for back-compat; `sessions` (all live
  // rooms, newest first) is additive for callers that handle parallel rooms.
  const sessions = getActiveSessionsPublic();
  return NextResponse.json({
    active: sessions.length > 0,
    session: getActiveSessionPublic(),
    sessions,
  });
}

export async function POST(request: NextRequest) {
  const isAuth = isInstructorAuthenticated(request);
  if (!isAuth) {
    return NextResponse.json(
      { ok: false, error: "Akses asisten diperlukan untuk membuka sesi." },
      { status: 403 }
    );
  }

  let bodyName: string | undefined;
  try {
    const json = (await request.json()) as { name?: string };
    if (json && typeof json.name === "string" && json.name.trim().length > 0) {
      bodyName = json.name.trim();
    }
  } catch {
    // optional body
  }

  const session = await createPresentationSession(bodyName || "Sesi Praktikum KI3131");
  return NextResponse.json({
    ok: true,
    session: {
      roomId: session.roomId,
      presenterTicket: session.presenterTicket,
      name: session.name,
      stageId: session.stageId,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const isAuth = isInstructorAuthenticated(request);
  if (!isAuth) {
    return NextResponse.json(
      { ok: false, error: "Akses asisten diperlukan untuk menutup sesi." },
      { status: 403 }
    );
  }

  // Close exactly the room the caller names (query param or JSON body). With no
  // id, fall back to the newest session — never a mass close.
  let roomId: string | undefined = request.nextUrl.searchParams.get("roomId") ?? undefined;
  if (!roomId) {
    try {
      const json = (await request.json()) as { roomId?: string };
      if (json && typeof json.roomId === "string" && json.roomId.length > 0) {
        roomId = json.roomId;
      }
    } catch {
      // optional body
    }
  }

  await endPresentationSession(roomId);
  return NextResponse.json({ ok: true });
}
