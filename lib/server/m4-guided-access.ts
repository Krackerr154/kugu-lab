import { randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "kugu-m4-instructor";
const TTL_MS = 60 * 60 * 1000;
const MAX_BODY_BYTES = 512;
const MAX_FAILED_ATTEMPTS = 10;
const COOLDOWN_MS = 60 * 1000;

export interface GuidedAccessServiceOptions {
  getCode?: () => string;
  getOrigin?: (request: Request) => string;
  secureCookies?: boolean;
  now?: () => number;
}

interface Session {
  expiresAt: number;
  code: string;
}

const json = (body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });

const cookieValue = (request: Request) => {
  const raw = request.headers.get("cookie") ?? "";
  const match = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match?.[1] ?? null;
};

const sameText = (left: string, right: string) => {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
};

const serializeCookie = (value: string, secure: boolean, maxAge: number) => [
  `${COOKIE_NAME}=${value}`,
  "HttpOnly",
  "SameSite=Strict",
  `Max-Age=${maxAge}`,
  "Path=/api/m4-guided",
  ...(secure ? ["Secure"] : []),
].join("; ");

export function createGuidedAccessService(options: GuidedAccessServiceOptions = {}) {
  const getCode = options.getCode ?? (() => process.env.M4_GUIDED_ACCESS_CODE ?? "");
  const getOrigin = options.getOrigin ?? ((request: Request) => new URL(request.url).origin);
  const secureCookies = options.secureCookies ?? process.env.NODE_ENV === "production";
  const now = options.now ?? (() => Date.now());
  const sessions = new Map<string, Session>();
  let failedAttempts = 0;
  let throttleUntil = 0;

  const purge = (time: number) => {
    for (const [token, session] of sessions) {
      if (session.expiresAt <= time) sessions.delete(token);
    }
    if (throttleUntil > 0 && throttleUntil <= time) failedAttempts = 0;
  };

  const originAllowed = (request: Request, method: string) => {
    const expected = getOrigin(request);
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite === "cross-site") return false;
    if (method === "GET" && !origin) return true;
    return origin === expected;
  };

  const readCode = async (request: Request): Promise<{ ok: true; code: string } | { ok: false; response: Response }> => {
    const contentType = request.headers.get("content-type") ?? "";
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_BODY_BYTES) return { ok: false, response: json({ unlocked: false, error: "payload-too-large" }, 413) };
    if (!contentType.toLowerCase().startsWith("application/json")) return { ok: false, response: json({ unlocked: false, error: "json-required" }, 415) };
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return { ok: false, response: json({ unlocked: false, error: "payload-too-large" }, 413) };
    try {
      const body = JSON.parse(text) as unknown;
      if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, response: json({ unlocked: false, error: "invalid-payload" }, 400) };
      const record = body as Record<string, unknown>;
      if (Object.keys(record).length !== 1 || typeof record.code !== "string" || record.code.length === 0 || record.code.length > 64) {
        return { ok: false, response: json({ unlocked: false, error: "invalid-payload" }, 400) };
      }
      return { ok: true, code: record.code };
    } catch {
      return { ok: false, response: json({ unlocked: false, error: "invalid-payload" }, 400) };
    }
  };

  const handle = async (request: Request) => {
    const method = request.method.toUpperCase();
    const time = now();
    purge(time);

    if (!["GET", "POST", "DELETE"].includes(method)) {
      return json({ unlocked: false, error: "method-not-allowed" }, 405, { allow: "GET, POST, DELETE" });
    }
    if (!originAllowed(request, method)) return json({ unlocked: false, error: "origin-not-allowed" }, 403);

    if (method === "GET") {
      const token = cookieValue(request);
      const session = token ? sessions.get(token) : undefined;
      if (!session || session.expiresAt <= time || !sameText(session.code, getCode())) return json({ unlocked: false });
      return json({ unlocked: true, expiresAt: session.expiresAt });
    }

    if (method === "DELETE") {
      const token = cookieValue(request);
      if (token) sessions.delete(token);
      return json({ unlocked: false }, 200, { "set-cookie": serializeCookie("", secureCookies, 0) });
    }

    if (throttleUntil > time) {
      return json({ unlocked: false, error: "too-many-attempts" }, 429, { "retry-after": String(Math.ceil((throttleUntil - time) / 1000)) });
    }
    const configuredCode = getCode();
    if (!configuredCode) return json({ unlocked: false, error: "unavailable" }, 503);
    const parsed = await readCode(request);
    if (!parsed.ok) return parsed.response;
    if (!sameText(parsed.code, configuredCode)) {
      failedAttempts += 1;
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) throttleUntil = time + COOLDOWN_MS;
      return json({ unlocked: false, error: "invalid-code" }, 401);
    }

    failedAttempts = 0;
    throttleUntil = 0;
    const token = randomBytes(32).toString("base64url");
    const expiresAt = time + TTL_MS;
    sessions.set(token, { expiresAt, code: configuredCode });
    return json({ unlocked: true, expiresAt }, 200, { "set-cookie": serializeCookie(token, secureCookies, TTL_MS / 1000) });
  };

  return handle;
}

export const guidedAccessCookieName = COOKIE_NAME;
