import { NextResponse } from "next/server";
import { getDataSet } from "@/lib/server/m4-dataset-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/m4-guided/dataset/<id> — students fetch the computed class results by
// the id the asprak published in the broadcast. Public (no instructor cookie):
// the id is an unguessable 12-char token, the payload is computed teaching
// numbers only (no NIM, no personal data), and students must read it to see the
// chart. The raw input lives server-side; only derived results are returned.
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id || !/^[A-Za-z0-9_-]{8,32}$/.test(id)) {
    return NextResponse.json({ ok: false, error: "invalid-id" }, { status: 400 });
  }
  const entry = getDataSet(id);
  if (!entry) {
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, dataSetId: entry.id, result: entry.result });
}
