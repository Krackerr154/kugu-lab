import { NextResponse, type NextRequest } from "next/server";
import { isInstructorAuthenticated } from "@/lib/server/m4-guided-access";
import {
  getActiveSessionPublic,
  createPresentationSession,
  endPresentationSession,
} from "@/lib/server/presentation-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = getActiveSessionPublic();
  return NextResponse.json({
    active: session !== null,
    session,
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

  await endPresentationSession();
  return NextResponse.json({ ok: true });
}
