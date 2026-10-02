import test from "node:test";
import assert from "node:assert/strict";
import WebSocket from "ws";
import { createRelay } from "../server.mjs";

// Phase 3: the relay emits an out-of-band `audience` count (joined students,
// excluding the presenter) on every join and leave, so the asprak deck can show
// a live follower count. These lock three things: the presenter is NOT counted,
// the count tracks join/leave, and `audience` never bumps `seq` (it must not
// perturb the state-replay machinery followers depend on).

const ORIGIN = "http://localhost:3000";
const ADMIN = "audience-admin-secret";

const connect = (port) =>
  new WebSocket(`ws://127.0.0.1:${port}/presentation/ws`, { headers: { Origin: ORIGIN } });

const open = (ws) => new Promise((resolve, reject) => { ws.once("open", resolve); ws.once("error", reject); });

const nextMsg = (ws, predicate, timeout = 3000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error("timed out")); }, timeout);
    const onMessage = (data) => { let m; try { m = JSON.parse(data.toString()); } catch { return; } if (predicate(m)) { cleanup(); resolve(m); } };
    const cleanup = () => { clearTimeout(timer); ws.off("message", onMessage); };
    ws.on("message", onMessage);
  });

const issueRoom = async (base) => {
  const res = await fetch(`${base}/internal/rooms`, { method: "POST", headers: { Authorization: `Bearer ${ADMIN}` } });
  assert.equal(res.status, 201);
  return res.json();
};

test("audience count excludes the presenter and tracks student join/leave", async () => {
  const relay = createRelay({ port: 0, host: "127.0.0.1", adminSecret: ADMIN, allowedOrigins: [ORIGIN], roomTtlMs: 60_000 });
  const address = await relay.listen();
  const base = `http://127.0.0.1:${address.port}`;
  const room = await issueRoom(base);

  // Presenter joins — audience should be 0 (presenter is not audience).
  const presenter = connect(address.port); await open(presenter);
  const presenterAudience = nextMsg(presenter, (m) => m.t === "audience");
  presenter.send(JSON.stringify({ t: "join", roomId: room.roomId, role: "presenter", ticket: room.presenterTicket }));
  assert.equal((await presenterAudience).count, 0, "presenter alone => 0 audience");

  // First student joins — presenter should see count 1.
  const s1 = connect(address.port); await open(s1);
  const after1 = nextMsg(presenter, (m) => m.t === "audience" && m.count === 1);
  s1.send(JSON.stringify({ t: "join", roomId: room.roomId, role: "student" }));
  assert.equal((await after1).count, 1);

  // Second student joins — count 2.
  const s2 = connect(address.port); await open(s2);
  const after2 = nextMsg(presenter, (m) => m.t === "audience" && m.count === 2);
  s2.send(JSON.stringify({ t: "join", roomId: room.roomId, role: "student" }));
  assert.equal((await after2).count, 2);

  // One student leaves — count drops to 1.
  const afterLeave = nextMsg(presenter, (m) => m.t === "audience" && m.count === 1);
  s1.close();
  assert.equal((await afterLeave).count, 1);

  presenter.close(); s2.close();
  await relay.close();
});

test("audience messages carry no seq and never advance presentation seq", async () => {
  const relay = createRelay({ port: 0, host: "127.0.0.1", adminSecret: ADMIN, allowedOrigins: [ORIGIN], roomTtlMs: 60_000 });
  const address = await relay.listen();
  const base = `http://127.0.0.1:${address.port}`;
  const room = await issueRoom(base);

  const presenter = connect(address.port); await open(presenter);
  presenter.send(JSON.stringify({ t: "join", roomId: room.roomId, role: "presenter", ticket: room.presenterTicket }));
  const firstState = await nextMsg(presenter, (m) => m.t === "state");
  const seqAfterJoin = firstState.seq;

  // A student joining triggers an audience message but must NOT bump seq.
  const s1 = connect(address.port); await open(s1);
  const audience = nextMsg(presenter, (m) => m.t === "audience");
  s1.send(JSON.stringify({ t: "join", roomId: room.roomId, role: "student" }));
  const a = await audience;
  assert.equal(a.seq, undefined, "audience message has no seq field");

  // The next real present() must still be seqAfterJoin + 1 (audience didn't consume a seq).
  const update = nextMsg(s1, (m) => m.t === "state" && m.seq > seqAfterJoin);
  presenter.send(JSON.stringify({ t: "present", state: { version: 1, stageId: "understand" } }));
  assert.equal((await update).seq, seqAfterJoin + 1);

  presenter.close(); s1.close();
  await relay.close();
});
