// KUGU M3 guided-presentation relay. Pilot rooms are in-memory and expire.
import { createServer } from "node:http";
import { randomBytes, randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";
import { coerceClientMessage, coercePresentationState } from "./protocol.mjs";

const LOOPBACKS = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const DEFAULT_TTL = 4 * 60 * 60 * 1000;
const MAX_TTL = 4 * 60 * 60 * 1000;
const ROOM_ID_RE = /^[A-Za-z0-9_-]{32}$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
const safeId = (bytes) => randomBytes(bytes).toString("base64url");
const nowIso = (ms) => new Date(ms).toISOString();

function isOriginAllowed(origin, allowed) { return typeof origin === "string" && allowed.includes(origin); }
function isPrivateOrLoopback(address) {
  if (!address) return false;
  if (LOOPBACKS.has(address)) return true;
  const clean = address.replace(/^::ffff:/, "");
  return clean === "127.0.0.1" || clean === "localhost" || clean.startsWith("10.") || clean.startsWith("172.") || clean.startsWith("192.168.");
}

export function createRelay(options = {}) {
  const port = Number(options.port ?? process.env.PORT ?? 8787);
  const host = options.host ?? process.env.HOST ?? "127.0.0.1";
  const adminSecret = options.adminSecret ?? process.env.ADMIN_SECRET ?? "";
  const allowedOrigins = options.allowedOrigins ?? (process.env.ALLOWED_ORIGINS || "").split(",").map((x) => x.trim()).filter(Boolean);
  const roomTtlMs = Math.min(Math.max(Number(options.roomTtlMs ?? process.env.ROOM_TTL_MS ?? DEFAULT_TTL), 60_000), MAX_TTL);
  const maxPayload = Number(options.maxPayload ?? process.env.MAX_MSG_BYTES ?? 8192);
  const maxMessages = Number(options.maxMessagesPer10s ?? process.env.MAX_MSGS_PER_10S ?? 60);
  const rooms = new Map();
  let wss;

  const send = (ws, message) => {
    if (ws.readyState !== ws.OPEN) return;
    if (ws.bufferedAmount > 1_000_000) { ws.close(1013, "backpressure"); return; }
    ws.send(JSON.stringify(message));
  };
  const broadcast = (room, message) => { for (const client of room.clients) send(client, message); };
  const stateMessage = (room) => ({ t: "state", roomId: room.roomId, epoch: room.epoch, seq: room.seq, state: room.state, presenterConnected: room.presenter !== null, expiresAt: nowIso(room.expiresAt) });
  const presenceMessage = (room, connected) => ({ t: "presence", roomId: room.roomId, epoch: room.epoch, connected });
  // Audience = joined students only (exclude the presenter socket). Broadcast on
  // every join/leave so the asprak deck shows a live follower count. No seq bump:
  // this is out-of-band presence, not presentation state, so it never perturbs
  // the state/epoch replay machinery the followers rely on.
  const audienceCount = (room) => room.clients.size - (room.presenter ? 1 : 0);
  const audienceMessage = (room) => ({ t: "audience", roomId: room.roomId, epoch: room.epoch, count: audienceCount(room) });
  const endRoom = (room, reason) => {
    if (!rooms.has(room.roomId)) return;
    broadcast(room, { t: "ended", roomId: room.roomId, epoch: room.epoch, reason });
    for (const client of room.clients) { try { client.close(1000, reason); } catch {} }
    if (room.timer) clearTimeout(room.timer);
    rooms.delete(room.roomId);
  };
  const issueRoom = () => {
    const roomId = safeId(24);
    const presenterTicket = safeId(32);
    const expiresAt = Date.now() + roomTtlMs;
    const room = { roomId, presenterTicket, expiresAt, epoch: randomUUID(), seq: 0, state: { version: 1, stageId: "brief" }, presenter: null, clients: new Set(), timer: null };
    room.timer = setTimeout(() => endRoom(room, "expired"), roomTtlMs);
    room.timer.unref?.();
    rooms.set(roomId, room);
    return { roomId, presenterTicket, expiresAt };
  };

  const server = createServer((req, res) => {
    if (req.method === "GET" && req.url === "/healthz") {
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify({ ok: true })); return;
    }
    if (req.method === "POST" && req.url === "/internal/rooms") {
      const auth = req.headers.authorization || "";
      if (!adminSecret || !isPrivateOrLoopback(req.socket.remoteAddress) || auth !== `Bearer ${adminSecret}`) { res.writeHead(403, { "cache-control": "no-store" }); res.end("forbidden"); return; }
      const room = issueRoom(); res.writeHead(201, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(room)); return;
    }
    if (req.method === "DELETE" && req.url.startsWith("/internal/rooms")) {
      const auth = req.headers.authorization || "";
      if (!adminSecret || !isPrivateOrLoopback(req.socket.remoteAddress) || auth !== `Bearer ${adminSecret}`) { res.writeHead(403, { "cache-control": "no-store" }); res.end("forbidden"); return; }
      // DELETE /internal/rooms/<roomId> closes ONLY that room. The bare
      // DELETE /internal/rooms (no id) is rejected: closing every room at once
      // was a footgun that let one asprak's "Tutup Sesi" kill every other
      // active room. Callers must name the room they own.
      const path = new URL(req.url, "http://relay").pathname;
      const roomId = decodeURIComponent(path.slice("/internal/rooms/".length));
      if (!roomId || path === "/internal/rooms" || path === "/internal/rooms/") {
        res.writeHead(400, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify({ ok: false, error: "room-id-required" })); return;
      }
      const room = rooms.get(roomId);
      if (!room) { res.writeHead(404, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify({ ok: false, error: "room-not-found" })); return; }
      endRoom(room, "closed-by-api");
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify({ ok: true })); return;
    }
    res.writeHead(404, { "content-type": "text/plain" }); res.end("not found");
  });

  wss = new WebSocketServer({ noServer: true, maxPayload });
  server.on("upgrade", (req, socket, head) => {
    const origin = req.headers.origin;
    if (!isOriginAllowed(origin, allowedOrigins)) { socket.write("HTTP/1.1 403 Forbidden\r\n\r\n"); socket.destroy(); return; }
    const url = new URL(req.url || "/", "http://relay");
    if (url.pathname !== "/presentation/ws") { socket.write("HTTP/1.1 404 Not Found\r\n\r\n"); socket.destroy(); return; }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws));
  });

  wss.on("connection", (ws) => {
    const connection = { ws, room: null, role: null, joined: false, closed: false, times: [] };
    const fail = (code) => send(ws, { t: "error", code });
    const rateLimited = () => { const cutoff = Date.now() - 10_000; connection.times = connection.times.filter((x) => x > cutoff); connection.times.push(Date.now()); return connection.times.length > maxMessages; };
    ws.on("message", (data, isBinary) => {
      if (connection.closed || isBinary || rateLimited() || data.length > maxPayload) return;
      let input; try { input = JSON.parse(data.toString("utf8")); } catch { fail("invalid-message"); return; }
      const message = coerceClientMessage(input); if (!message) { fail("invalid-message"); return; }
      if (!connection.joined) {
        if (message.t !== "join") { fail("join-required"); return; }
        const room = rooms.get(message.roomId);
        if (!room) { fail("room-not-found"); ws.close(1008, "room-not-found"); return; }
        if (room.expiresAt <= Date.now()) { endRoom(room, "expired"); return; }
        if (message.role === "presenter" && (message.ticket !== room.presenterTicket || room.presenter)) { fail("unauthorized"); ws.close(1008, "unauthorized"); return; }
        connection.room = room; connection.role = message.role; connection.joined = true; room.clients.add(ws);
        if (message.role === "presenter") { room.presenter = ws; broadcast(room, presenceMessage(room, true)); }
        send(ws, stateMessage(room));
        // Tell the presenter (and everyone) the current audience size. A joining
        // student also receives it, so the count is correct on every screen.
        broadcast(room, audienceMessage(room));
        return;
      }
      const room = connection.room;
      if (!room) return;
      if (message.t === "snapshot") { send(ws, stateMessage(room)); return; }
      if (message.t === "ping") { send(ws, { t: "pong" }); return; }
      if (message.t === "present") {
        if (connection.role !== "presenter" || room.presenter !== ws) { fail("unauthorized"); return; }
        room.seq += 1; room.state = message.state; broadcast(room, stateMessage(room)); return;
      }
      if (message.t === "end") {
        if (connection.role !== "presenter" || room.presenter !== ws) { fail("unauthorized"); return; }
        endRoom(room, "presenter-ended"); return;
      }
    });
    ws.on("close", () => {
      connection.closed = true;
      const room = connection.room; if (!room) return;
      room.clients.delete(ws);
      if (room.presenter === ws) { room.presenter = null; broadcast(room, presenceMessage(room, false)); }
      // A leaving student (or presenter) changes the audience size; tell the rest.
      if (rooms.has(room.roomId)) broadcast(room, audienceMessage(room));
    });
    ws.on("error", () => {});
  });

  return {
    server,
    rooms,
    listen: () => new Promise((resolve, reject) => { const onError = (error) => { server.off("listening", onListening); reject(error); }; const onListening = () => { server.off("error", onError); resolve(server.address()); }; server.once("error", onError); server.once("listening", onListening); server.listen(port, host); }),
    close: () => new Promise((resolve, reject) => {
      for (const room of rooms.values()) endRoom(room, "relay-stopped");
      const finish = () => {
        server.closeIdleConnections?.();
        server.close((serverError) => serverError ? reject(serverError) : resolve());
      };
      if (wss.clients.size === 0) { finish(); return; }
      wss.close((error) => error ? reject(error) : finish());
    }),
  };
}

if (import.meta.url === `file://${process.argv[1]?.replaceAll("\\", "/")}`) {
  const relay = createRelay();
  relay.listen().then((address) => console.log(`[kugu-m3-relay] listening on ${typeof address === "string" ? address : `${address.address}:${address.port}`}`)).catch((error) => { console.error("relay failed", error.message); process.exitCode = 1; });
}
