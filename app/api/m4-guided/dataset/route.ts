import { NextResponse, type NextRequest } from "next/server";
import { isInstructorAuthenticated } from "@/lib/server/m4-guided-access";
import { validateDataSet, type DataSetInput } from "@/lib/m4-dataset";
import { saveDataSet } from "@/lib/server/m4-dataset-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4096;

// POST — asprak submits the class's raw numbers; the server computes η and
// returns a dataSetId. Instructor-only: students never write data. The raw
// numbers are stored server-side and surfaced by id via GET; they never ride in
// the presentation broadcast.
export async function POST(request: NextRequest) {
  if (!isInstructorAuthenticated(request)) {
    return NextResponse.json(
      { ok: false, error: "Akses asisten diperlukan untuk mengirim data." },
      { status: 403 }
    );
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload-too-large" }, { status: 413 });
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "payload-too-large" }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const o = (body ?? {}) as Record<string, unknown>;
  const assumptionConfirmed = o.assumptionConfirmed === true;
  const dataset = { valence: o.valence, molarMass: o.molarMass, groups: o.groups };

  const invalid = validateDataSet(dataset);
  if (invalid) {
    return NextResponse.json({ ok: false, error: invalid }, { status: 400 });
  }

  const entry = saveDataSet(dataset as DataSetInput, assumptionConfirmed);
  return NextResponse.json({ ok: true, dataSetId: entry.id, result: entry.result });
}
