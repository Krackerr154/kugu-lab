import { NextResponse, type NextRequest } from "next/server";
import { getGame, studentView } from "@/lib/server/m4-games-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOM_RE = /^[A-Za-z0-9_-]{16,64}$/;

// Student polls for the current game state (what to show: open question, waiting,
// reveal, final top-3). The correct answer and explanation are present ONLY when
// the asprak has revealed. Token is optional — without it the student still sees
// the question/phase, just not their own score/answered flag. Public route.
export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId") ?? "";
  const token = request.nextUrl.searchParams.get("token");
  if (!ROOM_RE.test(roomId)) return NextResponse.json({ ok: false, error: "invalid-room" }, { status: 400 });

  const game = getGame(roomId);
  if (!game) return NextResponse.json({ ok: true, exists: false });

  return NextResponse.json({ ok: true, exists: true, state: studentView(game, token) });
}
