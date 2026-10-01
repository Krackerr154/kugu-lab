import test from "node:test";
import assert from "node:assert/strict";
import WebSocket from "ws";
import { createRelay } from "../server.mjs";

// Regression: closing ONE session must not disturb other live rooms, and the
// bare mass-close must be rejected. This locks the Phase 0 fix for the bug where
// one asprak's "Tutup Sesi" tore down every other asprak's room.

const ORIGIN = "http://localhost:3000";
const ADMIN = "multiroom-admin-secret";

const connect = (port) =>
  new WebSocket(`ws://127.0.0.1:${port}/presentation/ws`, { headers: { Origin: ORIGIN } });

const joinStudent = (port, roomId) =>
  new Promise((resolve) => {
    const ws = connect(port);
    const finish = (value) => { try { ws.close(); } catch {} resolve(value); };
    ws.once("open", () => ws.send(JSON.stringify({ t: "join", roomId, role: "student" })));
    ws.on("message", (data) => {
      let msg; try { msg = JSON.parse(data.toString()); } catch { return; }
      if (msg.t === "state") finish({ ok: true });
      else if (msg.t === "error") finish({ ok: false, code: msg.code });
    });
    ws.once("error", () => finish({ ok: false, code: "socket-error" }));
    setTimeout(() => finish({ ok: false, code: "timeout" }), 3000);
  });

const issueRoom = async (base) => {
  const res = await fetch(`${base}/internal/rooms`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ADMIN}`, "Content-Type": "application/json" },
  });
  assert.equal(res.status, 201);
  return res.json();
};

test("DELETE /internal/rooms/<id> closes only that room; other rooms survive", async () => {
  const relay = createRelay({ port: 0, host: "127.0.0.1", adminSecret: ADMIN, allowedOrigins: [ORIGIN], roomTtlMs: 60_000 });
  const address = await relay.listen();
  const base = `http://127.0.0.1:${address.port}`;

  const roomA = await issueRoom(base);
  const roomB = await issueRoom(base);
  assert.notEqual(roomA.roomId, roomB.roomId);
  assert.equal(relay.rooms.size, 2);

  assert.deepEqual(await joinStudent(address.port, roomA.roomId), { ok: true });
  assert.deepEqual(await joinStudent(address.port, roomB.roomId), { ok: true });

  // Close ONLY room A.
  const del = await fetch(`${base}/internal/rooms/${encodeURIComponent(roomA.roomId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${ADMIN}` },
  });
  assert.equal(del.status, 200);
  assert.deepEqual(await del.json(), { ok: true });

  // A is gone, B is untouched.
  assert.equal(relay.rooms.size, 1);
  assert.deepEqual(await joinStudent(address.port, roomA.roomId), { ok: false, code: "room-not-found" });
  assert.deepEqual(await joinStudent(address.port, roomB.roomId), { ok: true });

  await relay.close();
});

test("bare DELETE /internal/rooms is rejected (no mass close) and leaves rooms intact", async () => {
  const relay = createRelay({ port: 0, host: "127.0.0.1", adminSecret: ADMIN, allowedOrigins: [ORIGIN], roomTtlMs: 60_000 });
  const address = await relay.listen();
  const base = `http://127.0.0.1:${address.port}`;

  await issueRoom(base);
  await issueRoom(base);
  assert.equal(relay.rooms.size, 2);

  const res = await fetch(`${base}/internal/rooms`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${ADMIN}` },
  });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { ok: false, error: "room-id-required" });
  assert.equal(relay.rooms.size, 2, "no room should have been closed");

  await relay.close();
});

test("DELETE of an unknown room id is a 404, not a silent success", async () => {
  const relay = createRelay({ port: 0, host: "127.0.0.1", adminSecret: ADMIN, allowedOrigins: [ORIGIN], roomTtlMs: 60_000 });
  const address = await relay.listen();
  const base = `http://127.0.0.1:${address.port}`;

  const res = await fetch(`${base}/internal/rooms/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${ADMIN}` },
  });
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { ok: false, error: "room-not-found" });

  await relay.close();
});

test("DELETE still requires auth and loopback", async () => {
  const relay = createRelay({ port: 0, host: "127.0.0.1", adminSecret: ADMIN, allowedOrigins: [ORIGIN], roomTtlMs: 60_000 });
  const address = await relay.listen();
  const base = `http://127.0.0.1:${address.port}`;

  const room = await issueRoom(base);
  const denied = await fetch(`${base}/internal/rooms/${encodeURIComponent(room.roomId)}`, { method: "DELETE" });
  assert.equal(denied.status, 403);
  assert.equal(relay.rooms.size, 1, "unauthorized DELETE must not close the room");

  await relay.close();
});
