import { NextResponse, type NextRequest } from "next/server";
import { isInstructorAuthenticated } from "@/lib/server/m4-guided-access";
import {
  startGame,
  getGame,
  endGame,
  openNextQuestion,
  revealQuestion,
  startSuddenDeath,
  asprakView,
} from "@/lib/server/m4-games-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOM_RE = /^[A-Za-z0-9_-]{16,64}$/;

// Asprak control + asprak view for the Games phase. Instructor-only (cookie).
// Students never reach this route — they use /join, /answer, and /state.

export async function GET(request: NextRequest) {
  if (!isInstructorAuthenticated(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const roomId = request.nextUrl.searchParams.get("roomId") ?? "";
  if (!ROOM_RE.test(roomId)) return NextResponse.json({ ok: false, error: "invalid-room" }, { status: 400 });
  const game = getGame(roomId);
  if (!game) return NextResponse.json({ ok: true, exists: false });
  return NextResponse.json({ ok: true, exists: true, view: asprakView(game) });
}

export async function POST(request: NextRequest) {
  if (!isInstructorAuthenticated(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  let body: { roomId?: unknown; action?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }
  const roomId = typeof body.roomId === "string" ? body.roomId : "";
  const action = typeof body.action === "string" ? body.action : "";
  if (!ROOM_RE.test(roomId)) return NextResponse.json({ ok: false, error: "invalid-room" }, { status: 400 });

  if (action === "start") {
    const game = startGame(roomId);
    return NextResponse.json({ ok: true, view: asprakView(game) });
  }

  const game = getGame(roomId);
  if (!game) return NextResponse.json({ ok: false, error: "no-game" }, { status: 404 });

  switch (action) {
    case "next":
      openNextQuestion(game);
      break;
    case "reveal":
      revealQuestion(game);
      break;
    case "sudden-death":
      startSuddenDeath(game);
      break;
    case "end":
      endGame(roomId);
      return NextResponse.json({ ok: true, ended: true });
    default:
      return NextResponse.json({ ok: false, error: "invalid-action" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, view: asprakView(game) });
}
