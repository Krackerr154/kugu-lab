import test from "node:test";
import assert from "node:assert/strict";
import {
  GAME_QUESTION_BANK,
  GAME_BANK_IDS,
  GAME_ROUND_SIZE,
  GAME_SUDDEN_DEATH_POOL,
  CONFIDENCE_POINTS,
  scoreAnswer,
  selectRound,
  pickSuddenDeath,
  shuffle,
  toPublicQuestion,
} from "../../lib/m4-games.ts";

// A seedable RNG so selection/shuffle tests are deterministic.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("the bank has exactly 8 approved questions, each well-formed", () => {
  assert.equal(GAME_QUESTION_BANK.length, 8);
  const ids = new Set();
  for (const q of GAME_QUESTION_BANK) {
    assert.equal(q.options.length, 4, `${q.id} must have 4 options`);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < 4, `${q.id} correctIndex in range`);
    assert.ok(q.prompt.length > 0 && q.explanation.length > 0, `${q.id} has prompt + explanation`);
    assert.ok(!ids.has(q.id), `${q.id} is unique`);
    ids.add(q.id);
  }
});

test("round size is 5 and sudden-death pool is 3", () => {
  assert.equal(GAME_ROUND_SIZE, 5);
  assert.equal(GAME_SUDDEN_DEATH_POOL, 3);
});

test("confidence payout matches the agreed Yakin/Ragu/Tebak table", () => {
  assert.deepEqual(CONFIDENCE_POINTS.yakin, { correct: 3, wrong: -2 });
  assert.deepEqual(CONFIDENCE_POINTS.ragu, { correct: 2, wrong: -1 });
  assert.deepEqual(CONFIDENCE_POINTS.tebak, { correct: 1, wrong: 0 });
  // Honest ignorance (wrong + tebak) is never punished.
  assert.equal(scoreAnswer(false, "tebak"), 0);
  // Confident error costs the most.
  assert.equal(scoreAnswer(false, "yakin"), -2);
  // Confident correct pays the most.
  assert.equal(scoreAnswer(true, "yakin"), 3);
});

test("selectRound picks 5 unique played + 3 reserved, disjoint, covering the bank", () => {
  const rng = mulberry32(42);
  const { playedIds, reservedIds } = selectRound(rng);
  assert.equal(playedIds.length, 5);
  assert.equal(reservedIds.length, 3);
  const all = new Set([...playedIds, ...reservedIds]);
  assert.equal(all.size, 8, "played + reserved must be 8 distinct ids");
  for (const id of all) assert.ok(GAME_BANK_IDS.includes(id), `${id} is a real bank id`);
  // Disjoint.
  for (const id of playedIds) assert.ok(!reservedIds.includes(id), `${id} not in both`);
});

test("selectRound varies with the RNG (not a fixed slice)", () => {
  const a = selectRound(mulberry32(1)).playedIds.join(",");
  const b = selectRound(mulberry32(999)).playedIds.join(",");
  // Overwhelmingly likely to differ across very different seeds.
  assert.notEqual(a, b);
});

test("pickSuddenDeath draws from the reserved pool only", () => {
  const rng = mulberry32(7);
  const { reservedIds } = selectRound(rng);
  const sd = pickSuddenDeath(reservedIds, mulberry32(3));
  assert.ok(reservedIds.includes(sd), "sudden death must come from the 3 unused");
  assert.equal(pickSuddenDeath([], rng), null);
});

test("shuffle is a permutation (no loss, no duplication)", () => {
  const out = shuffle(GAME_BANK_IDS, mulberry32(5));
  assert.deepEqual([...out].sort(), [...GAME_BANK_IDS].sort());
});

test("toPublicQuestion strips the correct answer", () => {
  const q = GAME_QUESTION_BANK[0];
  const pub = toPublicQuestion(q, 1, 5);
  assert.equal("correctIndex" in pub, false, "public question must not leak the answer");
  assert.equal("explanation" in pub, false, "public question must not leak the explanation");
  assert.equal(pub.options.length, 4);
  assert.equal(pub.index, 1);
  assert.equal(pub.total, 5);
});
