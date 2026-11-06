import { createGuidedAccessService } from "@/lib/server/m4-guided-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const service = createGuidedAccessService({
  getOrigin: (request) => {
    const origin = request.headers.get("origin");
    const configured = process.env.M4_GUIDED_ORIGIN?.replace(/\/$/, "");
    if (configured && origin === configured) return configured;
    if (origin && (/^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin))) {
      return origin;
    }
    const reqOrigin = new URL(request.url).origin;
    if (origin === reqOrigin) return reqOrigin;
    return configured || reqOrigin;
  },
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
