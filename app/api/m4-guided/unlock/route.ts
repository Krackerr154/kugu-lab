import { createGuidedAccessService } from "@/lib/server/m4-guided-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const service = createGuidedAccessService({
  getOrigin: (request) => process.env.M4_GUIDED_ORIGIN?.replace(/\/$/, "") || new URL(request.url).origin,
});

export async function GET(request: Request) {
  return service(request);
}

export async function POST(request: Request) {
  return service(request);
}

export async function DELETE(request: Request) {
  return service(request);
}
