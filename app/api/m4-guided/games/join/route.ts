import { NextResponse, type NextRequest } from "next/server";
import { getGame, joinGame } from "@/lib/server/m4-games-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOM_RE = /^[A-Za-z0-9_-]{16,64}$/;
const MAX_BODY_BYTES = 512;

// Student joins the game with a display name of their choosing. Returns an
// ephemeral participant token. The NIM is NEVER sent here — it stays local in
// the browser; answers associate with the token only. Public (no instructor
// cookie): students must be able to join.
export async function POST(request: NextRequest) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "payload-too-large" }, { status: 413 });

  let body: { roomId?: unknown; name?: unknown };
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "payload-too-large" }, { status: 413 });
    }
    body = JSON.parse(text) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const roomId = typeof body.roomId === "string" ? body.roomId : "";
  const name = typeof body.name === "string" ? body.name : "";
  if (!ROOM_RE.test(roomId)) return NextResponse.json({ ok: false, error: "invalid-room" }, { status: 400 });

  const game = getGame(roomId);
  if (!game) return NextResponse.json({ ok: false, error: "no-game" }, { status: 404 });

  const result = joinGame(game, name);
  if (!result.ok) {
    const status = result.error === "full" ? 409 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }
  return NextResponse.json({ ok: true, token: result.token });
}
