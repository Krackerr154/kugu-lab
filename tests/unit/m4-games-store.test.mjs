import test from "node:test";
import assert from "node:assert/strict";
import {
  startGame,
  getGame,
  endGame,
  openNextQuestion,
  revealQuestion,
  startSuddenDeath,
  joinGame,
  submitAnswer,
  studentView,
  asprakView,
  leaderboard,
  topScorers,
  distributionFor,
  _clearGames,
} from "../../lib/server/m4-games-store.ts";
import { GAME_QUESTION_BY_ID } from "../../lib/m4-games.ts";

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROOM = "room_abcdefghijklmnop";

const correctIdx = (qid) => GAME_QUESTION_BY_ID[qid].correctIndex;
const wrongIdx = (qid) => (GAME_QUESTION_BY_ID[qid].correctIndex + 1) % 4;

test("full game flow: lobby → question → reveal → next → finished, with server scoring", () => {
  _clearGames();
  const g = startGame(ROOM, mulberry32(42));
  assert.equal(g.phase, "lobby");
  assert.equal(g.playedIds.length, 5);

  const alice = joinGame(g, "Alice");
  const bob = joinGame(g, "Bob");
  assert.ok(alice.ok && bob.ok);

  openNextQuestion(g);
  assert.equal(g.phase, "question");
  const q1 = g.playedIds[0];

  // Alice confident-correct (+3), Bob confident-wrong (−2).
  assert.deepEqual(submitAnswer(g, alice.token, q1, correctIdx(q1), "yakin"), { ok: true, accepted: true });
  assert.deepEqual(submitAnswer(g, bob.token, q1, wrongIdx(q1), "yakin"), { ok: true, accepted: true });

  // Second submission is ignored (first write wins).
  assert.deepEqual(submitAnswer(g, alice.token, q1, wrongIdx(q1), "yakin"), { ok: true, accepted: false });

  // Correct answer must NOT be exposed while the question is open.
  const openView = studentView(g, alice.token);
  assert.equal(openView.correctIndex, null, "answer hidden before reveal");
  assert.equal(openView.answered, true);

  revealQuestion(g);
  const revealView = studentView(g, alice.token);
  assert.equal(revealView.correctIndex, correctIdx(q1));
  assert.ok(revealView.explanation);
  assert.equal(revealView.yourScore, 3);

  const board = leaderboard(g);
  assert.deepEqual(board, [{ name: "Alice", score: 3 }, { name: "Bob", score: -2 }]);

  // Play out the remaining 4, then one more "next" to reach the results screen.
  for (let i = 1; i < 5; i++) { openNextQuestion(g); revealQuestion(g); }
  openNextQuestion(g);
  assert.equal(g.phase, "finished");
  const finalView = studentView(g, alice.token);
  assert.ok(finalView.topThree);
  assert.equal(finalView.topThree[0].name, "Alice");
});

test("answers are rejected outside an open question and for unknown participants", () => {
  _clearGames();
  const g = startGame(ROOM, mulberry32(1));
  const p = joinGame(g, "Cara");
  const q = g.playedIds[0];
  // Lobby — not accepting.
  assert.equal(submitAnswer(g, p.token, q, 0, "yakin").error, "not-accepting");
  openNextQuestion(g);
  // Unknown participant token.
  assert.equal(submitAnswer(g, "nope", q, 0, "yakin").error, "unknown-participant");
  // Wrong question id.
  assert.equal(submitAnswer(g, p.token, "q-does-not-exist", 0, "yakin").error, "wrong-question");
  // Invalid confidence.
  assert.equal(submitAnswer(g, p.token, q, 0, "super-sure").error, "invalid-confidence");
  // Invalid option.
  assert.equal(submitAnswer(g, p.token, q, 9, "yakin").error, "invalid-option");
});

test("distribution is anonymous counts and totals only", () => {
  _clearGames();
  const g = startGame(ROOM, mulberry32(2));
  const a = joinGame(g, "A");
  const b = joinGame(g, "B");
  const c = joinGame(g, "C");
  openNextQuestion(g);
  const q = g.playedIds[0];
  submitAnswer(g, a.token, q, 0, "ragu");
  submitAnswer(g, b.token, q, 0, "ragu");
  submitAnswer(g, c.token, q, 2, "tebak");
  const dist = distributionFor(g, q);
  assert.equal(dist.total, 3);
  assert.equal(dist.counts[0], 2);
  assert.equal(dist.counts[2], 1);
  // No names anywhere in the distribution object.
  assert.equal(JSON.stringify(dist).includes("A"), false);
});

test("sudden death draws one reserved question only after a tie at finish", () => {
  _clearGames();
  const g = startGame(ROOM, mulberry32(3));
  const a = joinGame(g, "A");
  const b = joinGame(g, "B");
  // Make them tie: both confident-correct on every played question.
  openNextQuestion(g);
  for (let i = 0; i < 5; i++) {
    const q = g.playedIds[i];
    submitAnswer(g, a.token, q, correctIdx(q), "yakin");
    submitAnswer(g, b.token, q, correctIdx(q), "yakin");
    revealQuestion(g);
    openNextQuestion(g);
  }
  assert.equal(g.phase, "finished");
  const tied = topScorers(g);
  assert.equal(tied.length, 2, "both tied at the top");

  startSuddenDeath(g, mulberry32(9));
  assert.equal(g.phase, "sudden-death");
  assert.ok(g.reservedIds.includes(g.suddenDeathId), "sudden death from the 3 unused");
  // Sudden-death question is answerable and scored.
  const sd = g.suddenDeathId;
  assert.equal(submitAnswer(g, a.token, sd, correctIdx(sd), "yakin").accepted, true);
  revealQuestion(g);
  assert.equal(g.phase, "sudden-death-revealed");
  assert.equal(leaderboard(g)[0].name, "A");
});

test("asprak view hides the correct answer until reveal and exposes the board", () => {
  _clearGames();
  const g = startGame(ROOM, mulberry32(4));
  joinGame(g, "A");
  openNextQuestion(g);
  const open = asprakView(g);
  assert.equal(open.correctIndex, null, "asprak sees no answer key while open (shown only on reveal)");
  assert.equal(open.totalQuestions, 5);
  revealQuestion(g);
  const revealed = asprakView(g);
  assert.equal(typeof revealed.correctIndex, "number");
  assert.ok(Array.isArray(revealed.board));
});

test("getGame misses after endGame", () => {
  _clearGames();
  startGame(ROOM, mulberry32(5));
  assert.ok(getGame(ROOM));
  endGame(ROOM);
  assert.equal(getGame(ROOM), null);
});
