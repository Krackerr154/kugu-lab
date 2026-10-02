"use client";

// Asprak Games control panel (Phase 5). Lives on the closing slide inside the
// presenter deck. Drives the server-authoritative game: start → open question →
// (optional) show distribution → reveal → next → … → finished → sudden death.
//
// The asprak's screen is the shared view (no projector means the asprak narrates
// from here). The misconception signal — who is confidently wrong — comes from
// the distribution + correct answer shown together only after reveal.

import { useCallback, useEffect, useState } from "react";
import { GAME_QUESTION_BY_ID } from "@/lib/m4-games";

interface Distribution { counts: number[]; total: number }
interface ScoreRow { name: string; score: number }
interface AsprakView {
  phase: "lobby" | "question" | "revealed" | "finished" | "sudden-death" | "sudden-death-revealed";
  questionIndex: number;
  totalQuestions: number;
  currentQuestionId: string | null;
  participantCount: number;
  answeredCount: number;
  distribution: Distribution | null;
  correctIndex: number | null;
  board: ScoreRow[];
  topScorers: ScoreRow[];
  reservedCount: number;
}

const LETTER = ["A", "B", "C", "D"];

export function AsprakGamesPanel({ roomId }: { roomId: string }) {
  const [view, setView] = useState<AsprakView | null>(null);
  const [exists, setExists] = useState(false);
  const [showDist, setShowDist] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/m4-guided/games?roomId=${encodeURIComponent(roomId)}`, { cache: "no-store" });
      const data = (await res.json()) as { ok: boolean; exists?: boolean; view?: AsprakView };
      if (data.ok) { setExists(!!data.exists); if (data.view) setView(data.view); }
    } catch {
      /* transient */
    }
  }, [roomId]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(refresh, 2000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const act = useCallback(async (action: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/m4-guided/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, action }),
      });
      const data = (await res.json()) as { ok: boolean; view?: AsprakView; ended?: boolean };
      if (data.ok) {
        if (data.ended) { setExists(false); setView(null); }
        else if (data.view) { setExists(true); setView(data.view); }
        if (action === "next" || action === "start" || action === "sudden-death") setShowDist(false);
      }
    } finally {
      setBusy(false);
    }
  }, [roomId]);

  // Not started yet.
  if (!exists || !view) {
    return (
      <div data-asprak-games className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Games — Cek Pemahaman</span>
        <p className="text-[11px] text-[var(--text-secondary)]">5 soal acak dari bank 8 · skor individu · tanpa skor kecepatan.</p>
        <button
          type="button"
          onClick={() => act("start")}
          disabled={busy}
          className="m4-motion-control inline-flex min-h-8 items-center justify-center gap-1 rounded-lg bg-[var(--primary-container)] px-3 text-xs font-bold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-40"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[15px]">sports_esports</span>
          Mulai Games
        </button>
      </div>
    );
  }

  const q = view.currentQuestionId ? GAME_QUESTION_BY_ID[view.currentQuestionId] : null;
  const inReveal = view.phase === "revealed" || view.phase === "sudden-death-revealed";
  const inQuestion = view.phase === "question" || view.phase === "sudden-death";
  const isSudden = view.phase.startsWith("sudden-death");

  return (
    <div data-asprak-games className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
          {isSudden ? "Sudden Death" : `Games · Soal ${view.questionIndex}/${view.totalQuestions}`}
        </span>
        <span className="text-[10px] font-semibold tabular-nums text-[var(--primary-container)]">
          {view.answeredCount}/{view.participantCount} menjawab
        </span>
      </div>

      {q && (inQuestion || inReveal) && (
        <p className="text-[11px] leading-5 text-[var(--foreground)]">
          <span className="font-semibold">{q.topic}:</span> {q.prompt}
        </p>
      )}

      {/* Distribution: hidden while open (asprak shouldn't react early), shown on demand or at reveal. */}
      {(showDist || inReveal) && view.distribution && q && (
        <div className="flex flex-col gap-0.5" data-games-distribution>
          {q.options.map((_, i) => {
            const count = view.distribution!.counts[i] ?? 0;
            const total = Math.max(1, view.distribution!.total);
            const pct = Math.round((count / total) * 100);
            const isCorrect = inReveal && view.correctIndex === i;
            return (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-3 font-bold" style={{ color: isCorrect ? "var(--success,#16a34a)" : "var(--muted)" }}>{LETTER[i]}</span>
                <div className="relative h-3 flex-1 overflow-hidden rounded bg-[var(--surface-container)]">
                  <span className="m4-motion-color absolute inset-y-0 left-0 rounded" style={{ width: `${pct}%`, backgroundColor: isCorrect ? "var(--success,#16a34a)" : "var(--primary-fixed-dim)" }} />
                </div>
                <span className="w-10 text-right tabular-nums text-[var(--text-secondary)]">{count} · {pct}%</span>
                {isCorrect && <span aria-hidden="true" className="material-symbols-outlined text-[12px] text-[var(--success,#16a34a)]">check</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Controls by phase */}
      <div className="flex flex-wrap items-center gap-1.5">
        {view.phase === "lobby" && (
          <button type="button" onClick={() => act("next")} disabled={busy} className="m4-motion-control inline-flex min-h-7 items-center gap-1 rounded border border-[var(--primary-container)] bg-[var(--primary-container)] px-2.5 text-[11px] font-bold text-[var(--on-primary)] disabled:opacity-40">
            Buka Soal 1
          </button>
        )}
        {inQuestion && (
          <>
            <button type="button" onClick={() => setShowDist((s) => !s)} className="m4-motion-control inline-flex min-h-7 items-center gap-1 rounded border border-[var(--outline-variant)] px-2.5 text-[11px] font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)]">
              {showDist ? "Sembunyikan Sebaran" : "Lihat Sebaran"}
            </button>
            <button type="button" onClick={() => act("reveal")} disabled={busy} className="m4-motion-control inline-flex min-h-7 items-center gap-1 rounded border border-[var(--primary-container)] bg-[var(--primary-container)] px-2.5 text-[11px] font-bold text-[var(--on-primary)] disabled:opacity-40">
              Tutup &amp; Tampilkan Jawaban
            </button>
          </>
        )}
        {view.phase === "revealed" && (
          <button type="button" onClick={() => act("next")} disabled={busy} className="m4-motion-control inline-flex min-h-7 items-center gap-1 rounded border border-[var(--primary-container)] bg-[var(--primary-container)] px-2.5 text-[11px] font-bold text-[var(--on-primary)] disabled:opacity-40">
            {view.questionIndex >= view.totalQuestions ? "Lihat Hasil Akhir" : "Soal Berikutnya"}
          </button>
        )}
        {view.phase === "sudden-death" && (
          <button type="button" onClick={() => act("reveal")} disabled={busy} className="m4-motion-control inline-flex min-h-7 items-center gap-1 rounded border border-[var(--primary-container)] bg-[var(--primary-container)] px-2.5 text-[11px] font-bold text-[var(--on-primary)] disabled:opacity-40">
            Tampilkan Jawaban
          </button>
        )}
        {(view.phase === "finished" || view.phase === "sudden-death-revealed") && (
          <>
            {view.phase === "finished" && view.topScorers.length > 1 && view.reservedCount > 0 && (
              <button type="button" onClick={() => act("sudden-death")} disabled={busy} className="m4-motion-control inline-flex min-h-7 items-center gap-1 rounded border border-[var(--secondary-container,var(--primary-container))] px-2.5 text-[11px] font-bold text-[var(--primary-container)] hover:bg-[var(--surface-container)] disabled:opacity-40">
                <span aria-hidden="true" className="material-symbols-outlined text-[13px]">bolt</span>
                Sudden Death ({view.topScorers.length} seri)
              </button>
            )}
            <button type="button" onClick={() => act("end")} disabled={busy} className="m4-motion-control inline-flex min-h-7 items-center gap-1 rounded border border-[var(--outline-variant)] px-2.5 text-[11px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-container)] disabled:opacity-40">
              Akhiri Games
            </button>
          </>
        )}
      </div>

      {/* Final board (asprak sees everyone; students see top 3). */}
      {(view.phase === "finished" || view.phase === "sudden-death-revealed") && view.board.length > 0 && (
        <ol className="flex flex-col gap-0.5" data-games-board>
          {view.board.slice(0, 5).map((r, i) => (
            <li key={i} className="flex items-center gap-2 text-[11px]">
              <span className="w-4 text-center font-bold tabular-nums text-[var(--primary-container)]">{i + 1}</span>
              <span className="flex-1 truncate text-[var(--foreground)]">{r.name}</span>
              <span className="font-bold tabular-nums text-[var(--foreground)]">{r.score}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
