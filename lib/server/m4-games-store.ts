import { randomBytes } from "node:crypto";
import {
  GAME_QUESTION_BY_ID,
  GAME_ROUND_SIZE,
  CONFIDENCE_POINTS,
  selectRound,
  pickSuddenDeath,
  scoreAnswer,
  isConfidence,
  toPublicQuestion,
  type Confidence,
  type PublicQuestion,
} from "../m4-games.ts";

// Server-authoritative Games session. The asprak owns a game keyed to their
// presentation roomId; students answer over HTTP with an ephemeral participant
// token (NIM NEVER travels — it stays local in the browser, exactly like the
// rest of the guided feature). The correct answer is never exposed before the
// question is revealed.
//
// State machine (per question): lobby -> question open -> answers locked ->
// revealed -> next ... -> finished -> (optional) sudden-death.
//
// In-memory, short-lived — same rationale as the presentation/dataset stores: a
// ~5-minute game is cheap to re-run, so a container restart dropping it is an
// accepted limitation.

export type GamePhase = "lobby" | "question" | "revealed" | "finished" | "sudden-death" | "sudden-death-revealed";

interface Answer {
  optionIndex: number;
  confidence: Confidence;
  correct: boolean;
  points: number;
}

interface Participant {
  token: string;
  name: string;          // display handle the student types (NOT the NIM)
  score: number;
  // questionId -> answer (one answer per question, first write wins)
  answers: Map<string, Answer>;
}

interface GameSession {
  roomId: string;
  phase: GamePhase;
  playedIds: string[];
  reservedIds: string[];
  currentIndex: number;        // 0-based into playedIds; -1 in lobby
  suddenDeathId: string | null;
  participants: Map<string, Participant>;
  createdAt: number;
}

const TTL_MS = 3 * 60 * 60 * 1000;
const MAX_PARTICIPANTS = 60;
const NAME_MAX = 32;
const games = new Map<string, GameSession>();

const purge = (now: number) => {
  for (const [roomId, g] of games) {
    if (g.createdAt + TTL_MS <= now) games.delete(roomId);
  }
};

const activeQuestionId = (g: GameSession): string | null => {
  if (g.phase === "question" || g.phase === "revealed") return g.playedIds[g.currentIndex] ?? null;
  if (g.phase === "sudden-death" || g.phase === "sudden-death-revealed") return g.suddenDeathId;
  return null;
};

/** Create (or reset) a game for a room. Instructor-triggered. */
export function startGame(roomId: string, rng: () => number = Math.random): GameSession {
  purge(Date.now());
  const { playedIds, reservedIds } = selectRound(rng);
  const game: GameSession = {
    roomId,
    phase: "lobby",
    playedIds,
    reservedIds,
    currentIndex: -1,
    suddenDeathId: null,
    participants: new Map(),
    createdAt: Date.now(),
  };
  games.set(roomId, game);
  return game;
}

export function getGame(roomId: string): GameSession | null {
  const g = games.get(roomId);
  if (!g) return null;
  if (g.createdAt + TTL_MS <= Date.now()) { games.delete(roomId); return null; }
  return g;
}

export function endGame(roomId: string) {
  games.delete(roomId);
}

/** Advance to the next question (or open the first). Instructor-triggered. */
export function openNextQuestion(g: GameSession): GameSession {
  if (g.phase === "lobby") { g.currentIndex = 0; g.phase = "question"; return g; }
  if (g.phase === "revealed") {
    if (g.currentIndex < g.playedIds.length - 1) { g.currentIndex += 1; g.phase = "question"; }
    else g.phase = "finished";
    return g;
  }
  return g;
}

/** Lock answers for the current question and reveal the correct option. */
export function revealQuestion(g: GameSession): GameSession {
  if (g.phase === "question") g.phase = "revealed";
  else if (g.phase === "sudden-death") g.phase = "sudden-death-revealed";
  return g;
}

/** Begin sudden death: draw one unused question. Only meaningful after finish. */
export function startSuddenDeath(g: GameSession, rng: () => number = Math.random): GameSession {
  if (g.phase !== "finished") return g;
  g.suddenDeathId = pickSuddenDeath(g.reservedIds, rng);
  if (g.suddenDeathId) g.phase = "sudden-death";
  return g;
}

export interface JoinResult { ok: boolean; token?: string; error?: string }

/** Register a participant; returns their ephemeral token. */
export function joinGame(g: GameSession, name: string): JoinResult {
  const trimmed = (name ?? "").trim();
  if (trimmed.length === 0 || trimmed.length > NAME_MAX) return { ok: false, error: "invalid-name" };
  if (g.participants.size >= MAX_PARTICIPANTS) return { ok: false, error: "full" };
  const token = randomBytes(12).toString("base64url");
  g.participants.set(token, { token, name: trimmed, score: 0, answers: new Map() });
  return { ok: true, token };
}

export interface SubmitResult { ok: boolean; error?: string; accepted?: boolean }

/**
 * Record an answer. Scoring happens here (server-authoritative). One answer per
 * question per participant — a resubmission is ignored, not re-scored. The
 * correct flag is computed server-side; the client never sends it.
 */
export function submitAnswer(
  g: GameSession,
  token: string,
  questionId: string,
  optionIndex: number,
  confidence: unknown
): SubmitResult {
  if (g.phase !== "question" && g.phase !== "sudden-death") return { ok: false, error: "not-accepting" };
  const expected = activeQuestionId(g);
  if (!expected || questionId !== expected) return { ok: false, error: "wrong-question" };
  const participant = g.participants.get(token);
  if (!participant) return { ok: false, error: "unknown-participant" };
  if (!isConfidence(confidence)) return { ok: false, error: "invalid-confidence" };
  const question = GAME_QUESTION_BY_ID[questionId];
  if (!question) return { ok: false, error: "unknown-question" };
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= question.options.length) {
    return { ok: false, error: "invalid-option" };
  }
  if (participant.answers.has(questionId)) return { ok: true, accepted: false }; // first write wins

  const correct = optionIndex === question.correctIndex;
  const points = scoreAnswer(correct, confidence);
  participant.answers.set(questionId, { optionIndex, confidence, correct, points });
  participant.score += points;
  return { ok: true, accepted: true };
}

// ---- Views ---------------------------------------------------------------

export interface AnswerDistribution { counts: number[]; total: number }

/** Anonymous option distribution for the current (or given) question. */
export function distributionFor(g: GameSession, questionId: string): AnswerDistribution {
  const question = GAME_QUESTION_BY_ID[questionId];
  const counts = question ? new Array(question.options.length).fill(0) : [];
  let total = 0;
  for (const p of g.participants.values()) {
    const a = p.answers.get(questionId);
    if (a) { counts[a.optionIndex] = (counts[a.optionIndex] ?? 0) + 1; total += 1; }
  }
  return { counts, total };
}

export interface ScoreRow { name: string; score: number }

/** All participants sorted high→low (asprak view / final reveal source). */
export function leaderboard(g: GameSession): ScoreRow[] {
  return [...g.participants.values()]
    .map((p) => ({ name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);
}

/** The set of top scorers (handles ties): everyone sharing the max score. */
export function topScorers(g: GameSession): ScoreRow[] {
  const board = leaderboard(g);
  if (board.length === 0) return [];
  const max = board[0].score;
  return board.filter((r) => r.score === max);
}

export interface StudentState {
  phase: GamePhase;
  question: PublicQuestion | null;
  answered: boolean;
  // Present only after reveal:
  correctIndex: number | null;
  explanation: string | null;
  yourScore: number;
  answeredCount: number;
  participantCount: number;
  // Present only when finished/revealed-final:
  topThree: ScoreRow[] | null;
  suddenDeathTied: ScoreRow[] | null;
}

/** The state a given participant should see. Correct answer hidden until reveal. */
export function studentView(g: GameSession, token: string | null): StudentState {
  const participant = token ? g.participants.get(token) ?? null : null;
  const qid = activeQuestionId(g);
  const question = qid ? GAME_QUESTION_BY_ID[qid] : null;
  const total = g.phase.startsWith("sudden-death") ? 1 : g.playedIds.length;
  const index = g.phase.startsWith("sudden-death") ? 1 : g.currentIndex + 1;
  const revealed = g.phase === "revealed" || g.phase === "sudden-death-revealed";

  const answeredCount = qid ? distributionFor(g, qid).total : 0;
  const showFinal = g.phase === "finished" || g.phase === "sudden-death-revealed";

  return {
    phase: g.phase,
    question: question && qid && (g.phase === "question" || g.phase === "revealed" || g.phase === "sudden-death" || g.phase === "sudden-death-revealed")
      ? toPublicQuestion(question, index, total)
      : null,
    answered: !!(participant && qid && participant.answers.has(qid)),
    correctIndex: revealed && question ? question.correctIndex : null,
    explanation: revealed && question ? question.explanation : null,
    yourScore: participant?.score ?? 0,
    answeredCount,
    participantCount: g.participants.size,
    topThree: showFinal ? leaderboard(g).slice(0, 3) : null,
    suddenDeathTied: g.phase === "finished" ? topScorers(g).filter((_, __, arr) => arr.length > 1) : null,
  };
}

/** Asprak control-panel view: full board + distribution + confidence map. */
export interface AsprakGameView {
  phase: GamePhase;
  questionIndex: number;
  totalQuestions: number;
  currentQuestionId: string | null;
  participantCount: number;
  answeredCount: number;
  distribution: AnswerDistribution | null;
  correctIndex: number | null;
  board: ScoreRow[];
  topScorers: ScoreRow[];
  reservedCount: number;
}

export function asprakView(g: GameSession): AsprakGameView {
  const qid = activeQuestionId(g);
  const question = qid ? GAME_QUESTION_BY_ID[qid] : null;
  const revealed = g.phase === "revealed" || g.phase === "sudden-death-revealed";
  return {
    phase: g.phase,
    questionIndex: g.phase.startsWith("sudden-death") ? 1 : g.currentIndex + 1,
    totalQuestions: g.phase.startsWith("sudden-death") ? 1 : g.playedIds.length,
    currentQuestionId: qid,
    participantCount: g.participants.size,
    answeredCount: qid ? distributionFor(g, qid).total : 0,
    distribution: qid ? distributionFor(g, qid) : null,
    correctIndex: revealed && question ? question.correctIndex : null,
    board: leaderboard(g),
    topScorers: topScorers(g),
    reservedCount: g.reservedIds.length,
  };
}

/** Test-only reset. */
export function _clearGames() { games.clear(); }
export { CONFIDENCE_POINTS, GAME_ROUND_SIZE };
