import test from "node:test";
import assert from "node:assert/strict";
import WebSocket from "ws";
import { createRelay } from "../server.mjs";

const waitFor = (ws, predicate, timeout = 3000) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => { cleanup(); reject(new Error("timed out waiting for relay message")); }, timeout);
  const onMessage = (data) => { let msg; try { msg = JSON.parse(data.toString()); } catch { return; } if (predicate(msg)) { cleanup(); resolve(msg); } };
  const onClose = () => { cleanup(); reject(new Error("socket closed before expected message")); };
  const cleanup = () => { clearTimeout(timer); ws.off("message", onMessage); ws.off("close", onClose); };
  ws.on("message", onMessage); ws.once("close", onClose);
});
const connect = (port) => new WebSocket(`ws://127.0.0.1:${port}/presentation/ws`, { headers: { Origin: "http://localhost:3000" } });
const send = (ws, message) => ws.send(JSON.stringify(message));

 test("authenticated presenter publishes to students, late join snapshots, and students cannot publish", async () => {
  const relay = createRelay({ port: 0, host: "127.0.0.1", adminSecret: "integration-admin-secret", allowedOrigins: ["http://localhost:3000"], roomTtlMs: 60_000 });
  const address = await relay.listen();
  const issued = await fetch(`http://127.0.0.1:${address.port}/internal/rooms`, { method: "POST", headers: { Authorization: "Bearer integration-admin-secret" } });
  assert.equal(issued.status, 201);
  const room = await issued.json();
  const presenter = connect(address.port); const student = connect(address.port);
  await Promise.all([new Promise((r, j) => { presenter.once("open", r); presenter.once("error", j); }), new Promise((r, j) => { student.once("open", r); student.once("error", j); })]);
  send(student, { t: "join", roomId: room.roomId, role: "student" });
  send(presenter, { t: "join", roomId: room.roomId, role: "presenter", ticket: room.presenterTicket });
  const firstStudent = await waitFor(student, (m) => m.t === "state");
  assert.equal(firstStudent.state.stageId, "brief");
  await waitFor(presenter, (m) => m.t === "state");

  send(student, { t: "present", state: { version: 1, stageId: "prove" } });
  assert.equal((await waitFor(student, (m) => m.t === "error")).code, "unauthorized");

  send(presenter, { t: "present", state: { version: 1, stageId: "understand", focusId: "complexing-agents", demoOverlay: { kind: "complexing-agent", id: "edta", private: "drop" } } });
  const update = await waitFor(student, (m) => m.t === "state" && m.seq > firstStudent.seq);
  assert.deepEqual(update.state, { version: 1, stageId: "understand", focusId: "complexing-agents", demoOverlay: { kind: "complexing-agent", id: "edta" } });

  const late = connect(address.port); await new Promise((r, j) => { late.once("open", r); late.once("error", j); });
  send(late, { t: "join", roomId: room.roomId, role: "student" });
  const lateState = await waitFor(late, (m) => m.t === "state");
  assert.equal(lateState.state.stageId, "understand"); assert.equal(lateState.seq, update.seq);

  send(presenter, { t: "end" });
  assert.equal((await waitFor(student, (m) => m.t === "ended")).reason, "presenter-ended");
  presenter.close(); student.close(); late.close(); await relay.close();
});

test("unknown room and wrong origin are rejected without creating rooms", async () => {
  const relay = createRelay({ port: 0, host: "127.0.0.1", adminSecret: "another-admin-secret", allowedOrigins: ["http://localhost:3000"] });
  const address = await relay.listen();
  const missing = connect(address.port); await new Promise((resolve) => missing.once("open", resolve)); send(missing, { t: "join", roomId: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", role: "student" });
  assert.equal((await waitFor(missing, (m) => m.t === "error")).code, "room-not-found");
  missing.close(); assert.equal(relay.rooms.size, 0); await relay.close();
});
