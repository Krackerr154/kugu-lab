import { NextResponse, type NextRequest } from "next/server";
import { getGame, submitAnswer } from "@/lib/server/m4-games-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOM_RE = /^[A-Za-z0-9_-]{16,64}$/;
const MAX_BODY_BYTES = 512;

// Student submits an answer + confidence stake. Public, but gated by the
// ephemeral participant token (issued by /join). Scoring is server-side; the
// client never sends a correctness flag, and the correct answer is not revealed
// here. Answers go over HTTP, never the relay — the relay stays a state channel.
export async function POST(request: NextRequest) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "payload-too-large" }, { status: 413 });

  let body: { roomId?: unknown; token?: unknown; questionId?: unknown; optionIndex?: unknown; confidence?: unknown };
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
  const token = typeof body.token === "string" ? body.token : "";
  const questionId = typeof body.questionId === "string" ? body.questionId : "";
  const optionIndex = typeof body.optionIndex === "number" ? body.optionIndex : NaN;
  if (!ROOM_RE.test(roomId) || token.length === 0) {
    return NextResponse.json({ ok: false, error: "invalid-request" }, { status: 400 });
  }

  const game = getGame(roomId);
  if (!game) return NextResponse.json({ ok: false, error: "no-game" }, { status: 404 });

  const result = submitAnswer(game, token, questionId, optionIndex, body.confidence);
  if (!result.ok) {
    const status = result.error === "unknown-participant" ? 403 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }
  // Do NOT echo correctness — the student learns it only at reveal via /state.
  return NextResponse.json({ ok: true, accepted: result.accepted });
}
