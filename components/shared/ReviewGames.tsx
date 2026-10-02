"use client";

// Student-facing Games UI (Phase 5). Shown when the asprak starts the Games
// phase after the review. The student joins with a display name (NOT the NIM —
// the NIM stays local, as everywhere else), answers each question with a
// confidence stake, and sees the correct answer + explanation only at reveal.
//
// Scoring is server-authoritative; this component only displays. Polls /state
// every 2s for the asprak-driven phase. Mounted inside the slide view chrome on
// the closing slide, but renders its own full card.
//
// Design rules honored:
//  - NO speed scoring, NO timer in the question card.
//  - Reveal always carries the explanation (feedback is the active ingredient).
//  - Final reveal shows top 3 only; each student sees their own score privately.
//  - Colour is never the only signal (icon + worded label on every result).

import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIDENCES, type Confidence } from "@/lib/m4-games";

interface PublicQuestion {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  index: number;
  total: number;
}
interface ScoreRow { name: string; score: number }
interface StudentState {
  phase: "lobby" | "question" | "revealed" | "finished" | "sudden-death" | "sudden-death-revealed";
  question: PublicQuestion | null;
  answered: boolean;
  correctIndex: number | null;
  explanation: string | null;
  yourScore: number;
  answeredCount: number;
  participantCount: number;
  topThree: ScoreRow[] | null;
}

const CONF_LABEL: Record<Confidence, { label: string; sub: string }> = {
  yakin: { label: "Yakin", sub: "+3 / −2" },
  ragu: { label: "Ragu", sub: "+2 / −1" },
  tebak: { label: "Tebak", sub: "+1 / 0" },
};

export function ReviewGames({ roomId }: { roomId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [state, setState] = useState<StudentState | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastQuestionRef = useRef<string | null>(null);

  // Poll the server state machine.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const url = `/api/m4-guided/games/state?roomId=${encodeURIComponent(roomId)}${token ? `&token=${encodeURIComponent(token)}` : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = (await res.json()) as { ok: boolean; exists: boolean; state?: StudentState };
        if (!cancelled && data.ok && data.exists && data.state) setState(data.state);
      } catch {
        /* transient */
      }
    };
    void tick();
    const timer = window.setInterval(tick, 2000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [roomId, token]);

  // Reset the local choice when the question changes.
  useEffect(() => {
    const qid = state?.question?.id ?? null;
    if (qid !== lastQuestionRef.current) {
      lastQuestionRef.current = qid;
      setChoice(null);
      setConfidence(null);
      setError(null);
    }
  }, [state?.question?.id]);

  const join = useCallback(async () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) { setError("Masukkan nama tampilan."); return; }
    setJoining(true); setError(null);
    try {
      const res = await fetch("/api/m4-guided/games/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, name: trimmed }),
      });
      const data = (await res.json()) as { ok: boolean; token?: string; error?: string };
      if (data.ok && data.token) setToken(data.token);
      else setError(data.error === "full" ? "Ruang penuh." : "Gagal bergabung.");
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setJoining(false);
    }
  }, [name, roomId]);

  const submit = useCallback(async () => {
    if (choice === null || confidence === null || !token || !state?.question) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/m4-guided/games/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, token, questionId: state.question.id, optionIndex: choice, confidence }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) setError("Gagal mengirim jawaban.");
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setSubmitting(false);
    }
  }, [choice, confidence, token, state?.question, roomId]);

  // ── Not joined yet ──────────────────────────────────────────────────────
  if (!token) {
    return (
      <div data-review-games className="rounded-lg border border-[var(--primary-container)] bg-[var(--surface-container-lowest)] p-3">
        <p className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--primary-container)]">quiz</span>
          Games — Cek Pemahaman
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Masuk dengan nama tampilan (bukan NIM). Skor individu, seru-seruan — pemenang dapat camilan.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <input
            aria-label="Nama tampilan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void join(); }}
            placeholder="Nama tampilan"
            maxLength={32}
            className="min-h-9 flex-1 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary-container)]"
          />
          <button
            type="button"
            onClick={join}
            disabled={joining || name.trim().length === 0}
            className="m4-motion-control inline-flex min-h-9 items-center gap-1 rounded-lg bg-[var(--primary-container)] px-3 text-xs font-bold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-40"
          >
            {joining ? "Masuk…" : "Masuk"}
          </button>
        </div>
        {error && <p className="mt-1 text-[11px] text-[var(--danger,#ef4444)]">{error}</p>}
      </div>
    );
  }

  // ── Joined: render by phase ─────────────────────────────────────────────
  const q = state?.question ?? null;
  const revealed = state?.phase === "revealed" || state?.phase === "sudden-death-revealed";
  const finished = state?.phase === "finished" || state?.phase === "sudden-death-revealed";

  return (
    <div data-review-games className="rounded-lg border border-[var(--primary-container)] bg-[var(--surface-container-lowest)] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--primary-container)]">quiz</span>
          {state?.phase?.startsWith("sudden-death") ? "Sudden Death" : "Games — Cek Pemahaman"}
        </p>
        {q && <span className="text-[11px] font-semibold tabular-nums text-[var(--muted)]">Soal {q.index}/{q.total}</span>}
      </div>

      {/* Lobby */}
      {state?.phase === "lobby" && (
        <p className="mt-2 text-xs text-[var(--text-secondary)]" aria-live="polite">
          Menunggu asisten memulai soal pertama… ({state.participantCount} pemain bergabung)
        </p>
      )}

      {/* Question open or revealed */}
      {q && (state?.phase === "question" || state?.phase === "sudden-death" || revealed) && (
        <div className="mt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{q.topic}</p>
          <p className="mt-0.5 text-sm font-semibold leading-6 text-[var(--foreground)]">{q.prompt}</p>

          <fieldset className="mt-2 flex flex-col gap-1.5" disabled={revealed || state?.answered || submitting}>
            <legend className="sr-only">Pilihan jawaban</legend>
            {q.options.map((opt, i) => {
              const isChoice = choice === i;
              const isCorrect = revealed && state?.correctIndex === i;
              const isYourWrong = revealed && state?.answered && isChoice && state?.correctIndex !== i;
              return (
                <label
                  key={i}
                  className="m4-motion-color flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm"
                  style={{
                    borderColor: isCorrect ? "var(--success,#16a34a)" : isYourWrong ? "var(--danger,#ef4444)" : isChoice ? "var(--primary-container)" : "var(--outline-variant)",
                    backgroundColor: isCorrect ? "var(--success-container,#dcfce7)" : isChoice && !revealed ? "var(--surface-selected)" : "var(--surface)",
                  }}
                >
                  <input
                    type="radio"
                    name={`games-${q.id}`}
                    checked={isChoice}
                    onChange={() => setChoice(i)}
                    className="accent-[var(--primary-container)]"
                  />
                  <span className="flex-1 text-[var(--foreground)]">{opt}</span>
                  {isCorrect && <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--success,#16a34a)]">check_circle</span>}
                  {isYourWrong && <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--danger,#ef4444)]">cancel</span>}
                </label>
              );
            })}
          </fieldset>

          {/* Confidence stake — only before submit/reveal */}
          {!revealed && !state?.answered && choice !== null && (
            <div className="mt-2">
              <p className="text-[11px] font-semibold text-[var(--text-secondary)]">Seberapa yakin?</p>
              <div className="mt-1 flex gap-1.5">
                {CONFIDENCES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConfidence(c)}
                    aria-pressed={confidence === c}
                    className="m4-motion-color flex min-h-10 flex-1 flex-col items-center justify-center rounded-lg border text-xs font-bold"
                    style={{
                      borderColor: confidence === c ? "var(--secondary-container,var(--primary-container))" : "var(--outline-variant)",
                      backgroundColor: confidence === c ? "var(--surface-selected)" : "var(--surface)",
                      color: "var(--foreground)",
                    }}
                  >
                    {CONF_LABEL[c].label}
                    <span className="text-[9px] font-normal text-[var(--muted)]">{CONF_LABEL[c].sub}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={choice === null || confidence === null || submitting}
                className="m4-motion-control mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg bg-[var(--primary-container)] px-3 text-xs font-bold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-40"
              >
                {submitting ? "Mengirim…" : "Kirim Jawaban"}
              </button>
            </div>
          )}

          {/* Submitted, waiting for reveal */}
          {!revealed && state?.answered && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]" aria-live="polite">
              <span aria-hidden="true" className="material-symbols-outlined text-[15px] text-[var(--primary-container)]">check_circle</span>
              Jawaban terkirim · {state.answeredCount}/{state.participantCount} praktikan menjawab · menunggu asisten…
            </p>
          )}

          {/* Reveal: explanation always shown */}
          {revealed && state?.explanation && (
            <div className="mt-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-2.5">
              <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]">
                <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--primary-container)]">lightbulb</span>
                Pembahasan
              </p>
              <p className="mt-1 text-xs leading-6 text-[var(--text-secondary)]">{state.explanation}</p>
              <p className="mt-1.5 text-xs font-semibold text-[var(--foreground)]">Skor Anda sekarang: {state.yourScore}</p>
            </div>
          )}
        </div>
      )}

      {/* Final reveal — top 3 public, your own score private */}
      {finished && state?.topThree && (
        <div className="mt-2">
          <p className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]">
            <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--secondary-container,var(--primary-container))]">trophy</span>
            Hasil Akhir
          </p>
          <ol className="mt-1.5 flex flex-col gap-1">
            {state.topThree.map((r, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] px-3 py-1.5 text-sm">
                <span className="w-5 text-center font-bold tabular-nums text-[var(--primary-container)]">{i + 1}</span>
                <span className="flex-1 truncate font-semibold text-[var(--foreground)]">{r.name}</span>
                <span className="font-bold tabular-nums text-[var(--foreground)]">{r.score}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs font-semibold text-[var(--text-secondary)]">
            Skor akhir Anda: <span className="text-[var(--foreground)]">{state.yourScore}</span>
          </p>
        </div>
      )}

      {error && <p className="mt-1 text-[11px] text-[var(--danger,#ef4444)]">{error}</p>}
    </div>
  );
}
