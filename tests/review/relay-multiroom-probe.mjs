// Probe: does closing one session destroy OTHER rooms in the relay?
//
// The web app's "Tutup Sesi" now calls DELETE /internal/rooms/<roomId>, closing
// only the named room. This probe opens two independent rooms (as two aspraks
// would), closes one by id, and confirms the other survives. It also checks the
// bare DELETE (no id) is rejected rather than mass-closing.
//
// Run: node tests/review/relay-multiroom-probe.mjs
import { createRelay } from "../../relay/server.mjs";

const ADMIN = "probe-secret";
const ORIGIN = "http://localhost:3000";
const PORT = 8899;
const BASE = `http://127.0.0.1:${PORT}`;
const WS_URL = `ws://127.0.0.1:${PORT}/presentation/ws`;

const issueRoom = async () => {
  const res = await fetch(`${BASE}/internal/rooms`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ADMIN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "probe" }),
  });
  return res.json();
};

// The relay rejects upgrades without an allowed Origin, so pass it explicitly.
const joinStudent = (roomId) =>
  new Promise((resolve) => {
    const ws = new WebSocket(WS_URL, { headers: { Origin: ORIGIN } });
    const finish = (value) => { try { ws.close(); } catch {} resolve(value); };
    ws.addEventListener("open", () =>
      ws.send(JSON.stringify({ t: "join", roomId, role: "student" }))
    );
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.t === "state") finish({ ok: true });
      else if (message.t === "error") finish({ ok: false, code: message.code });
    });
    ws.addEventListener("error", () => finish({ ok: false, code: "socket-error" }));
    setTimeout(() => finish({ ok: false, code: "timeout" }), 4000);
  });

const closeRoom = (roomId) =>
  fetch(`${BASE}/internal/rooms/${encodeURIComponent(roomId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${ADMIN}` },
  });

const bareDelete = () =>
  fetch(`${BASE}/internal/rooms`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${ADMIN}` },
  });

const relay = createRelay({
  port: PORT,
  host: "127.0.0.1",
  adminSecret: ADMIN,
  allowedOrigins: ORIGIN,
  roomTtlMs: 60_000,
});

const results = {};
try {
  await relay.listen();

  const roomA = await issueRoom();
  const roomB = await issueRoom();
  results.roomsAreDistinct = roomA.roomId !== roomB.roomId;
  results.roomCountBefore = relay.rooms.size;

  results.aJoinableBefore = await joinStudent(roomA.roomId);
  results.bJoinableBefore = await joinStudent(roomB.roomId);

  // Bare mass-close must be rejected, closing nothing.
  const bare = await bareDelete();
  results.bareDeleteStatus = bare.status;
  results.roomCountAfterBareDelete = relay.rooms.size;

  // Close ONLY session A — this is what "Tutup Sesi" triggers today.
  const del = await closeRoom(roomA.roomId);
  results.closeAStatus = del.status;

  results.roomCountAfter = relay.rooms.size;
  results.aJoinableAfterClosingA = await joinStudent(roomA.roomId);
  results.bJoinableAfterClosingA = await joinStudent(roomB.roomId);
  results.bSurvived = results.bJoinableAfterClosingA.ok === true;
  results.aClosed = results.aJoinableAfterClosingA.ok === false;
} catch (error) {
  results.error = String(error);
} finally {
  await relay.close().catch(() => {});
}

console.log(JSON.stringify(results, null, 2));
const pass =
  results.bSurvived &&
  results.aClosed &&
  results.bareDeleteStatus === 400 &&
  results.roomCountAfterBareDelete === 2;
console.log(
  pass
    ? "\nRESULT: PASS - per-room close isolates rooms; bare mass-close is rejected."
    : "\nRESULT: FAIL - see results above."
);
