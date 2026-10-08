"use client";

import { useEffect, useRef, useState } from "react";
import { CellSimulation, CathodeCloseUp } from "@/components/interactives/CellSimulation";
import { cellFrame, clampTime, ILLUSTRATION_SECONDS, type ReactionFocus } from "@/lib/m3-simulation";
import type { BathAgent } from "@/lib/m3-ligands";
import { useReducedMotion } from "@/components/shared/useReducedMotion";

export function ComplexingEffectWorkbench() {
  const [time, setTime] = useState(6);
  const timeRef = useRef(6);
  const [playing, setPlaying] = useState(false);
  const [complexed, setComplexed] = useState(true);
  const [view, setView] = useState<"closeup" | "cell">("cell");
  const reducedMotion = useReducedMotion();

  const frame = cellFrame(time, complexed);
  const advancing = playing && !reducedMotion;
  const percent = Math.round((time / ILLUSTRATION_SECONDS) * 100);

  const snCount = frame.deposited.filter((atom) => atom.species === "sn").length;
  const biCount = frame.deposited.filter((atom) => atom.species === "bi").length;

  useEffect(() => {
    if (!advancing) return;
    let raf = 0;
    let previous = performance.now();
    let lastPaint = previous;

    const tick = (now: number) => {
      const delta = Math.min(now - previous, 100);
      previous = now;
      timeRef.current = clampTime(timeRef.current + (delta / 1000) * 1);
      if (now - lastPaint >= 1000 / 30 || timeRef.current === ILLUSTRATION_SECONDS) {
        setTime(timeRef.current);
        lastPaint = now;
      }
      if (timeRef.current < ILLUSTRATION_SECONDS) {
        raf = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [advancing]);

  const seek = (next: number) => {
    setPlaying(false);
    timeRef.current = clampTime(next);
    setTime(timeRef.current);
  };

  const toggleComplexed = () => {
    setPlaying(false);
    setComplexed((prev) => !prev);
  };

  return (
    <div
      data-complexing-effect-workbench
      className="m4-motion-enter rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-2 sm:p-2.5 text-xs flex flex-col justify-between h-full"
    >
      {/* ── TOP CONTROL BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-1 mb-1 shrink-0">
        {/* Scenario Toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Skenario:
          </span>
          <button
            type="button"
            onClick={toggleComplexed}
            aria-pressed={complexed}
            className={`m4-motion-control inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-bold shadow-xs ${
              complexed
                ? "border-[var(--secondary)] bg-[var(--secondary-container)]/25 text-[var(--on-secondary-container)]"
                : "border-[var(--error)] bg-[var(--error-container)]/20 text-[var(--error)]"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              {complexed ? "hub" : "block"}
            </span>
            <span>{complexed ? "Dengan Pengompleks" : "Tanpa Pengompleks"}</span>
          </button>
        </div>

        {/* View Switch + Playback Controls */}
        <div className="flex items-center gap-1.5">
          {/* Progress badge */}
          <span className="font-mono tabular-nums text-[10px] text-[var(--text-secondary)] bg-[var(--surface-container-low)] rounded px-1.5 py-0.5">
            {time.toFixed(1)}s · {percent}%
          </span>

          {/* View toggle */}
          <div className="inline-flex rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setView("closeup")}
              className={`rounded px-1.5 py-0.5 font-bold transition-colors ${
                view === "closeup"
                  ? "bg-[var(--surface)] text-[var(--primary)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              }`}
            >
              Katoda Cu
            </button>
            <button
              type="button"
              onClick={() => setView("cell")}
              className={`rounded px-1.5 py-0.5 font-bold transition-colors ${
                view === "cell"
                  ? "bg-[var(--surface)] text-[var(--primary)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              }`}
            >
              Sel Beaker
            </button>
          </div>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            disabled={reducedMotion || time >= ILLUSTRATION_SECONDS}
            className="m4-motion-control inline-flex items-center gap-0.5 rounded border border-[var(--outline-variant)] bg-[var(--surface-control)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--foreground)] hover:bg-[var(--surface-container)] disabled:opacity-40"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm text-[var(--primary)]">
              {playing ? "pause" : "play_arrow"}
            </span>
            <span>{playing ? "Jeda" : "Mulai"}</span>
          </button>

          {/* Replay */}
          <button
            type="button"
            onClick={() => seek(0)}
            aria-label="Ulangi simulasi dari awal"
            className="m4-motion-control inline-flex items-center justify-center rounded border border-[var(--outline-variant)] bg-[var(--surface-control)] p-1 text-[var(--foreground)] hover:bg-[var(--surface-container)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              replay
            </span>
          </button>
        </div>
      </div>

      {/* ── MAIN BODY: 2 COLUMNS (ANIMATION LEFT, ANALYSIS RIGHT) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 flex-1 items-stretch min-h-0">
        {/* Left: Animation Canvas Box (7 cols) */}
        <div className="sm:col-span-7 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-1.5 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between text-[9px] text-[var(--muted)] px-1 mb-0.5 font-semibold">
            <span>{view === "closeup" ? "Permukaan Katoda Plat Cu" : "Beaker Kodeposisi DC"}</span>
            <span className="font-bold text-[var(--primary-container)]">{frame.phase}</span>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0">
            {view === "closeup" ? (
              <div className="w-full h-[96px] max-h-[96px] flex items-center justify-center">
                <CathodeCloseUp frame={frame} focus="all" activeAgent="edta" className="w-full h-full max-h-[96px]" />
              </div>
            ) : (
              <div className="w-full h-[96px] max-h-[96px] flex items-center justify-center">
                <CellSimulation
                  frame={frame}
                  running={advancing}
                  focus="all"
                  selected={null}
                  hotspot={() => ({})}
                  activeAgent="edta"
                  onAgentSelect={() => {}}
                  className="w-full h-full max-h-[96px]"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-1 text-[8.5px] text-[var(--text-secondary)]">
            <span>Garis putus-putus: ion kation larutan</span>
            <span>Kotak/lingkaran solid: atom deposit</span>
          </div>
        </div>

        {/* Right: Pedagogical Analysis & Live Result (5 cols) */}
        <div className="sm:col-span-5 flex flex-col justify-between gap-1.5 min-w-0">
          <div
            className={`rounded-lg border p-2 flex flex-col justify-between flex-1 min-w-0 ${
              complexed
                ? "border-[var(--secondary)]/40 bg-[var(--secondary-container)]/15"
                : "border-[var(--error)]/30 bg-[var(--error-container)]/10"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`inline-flex items-center gap-1 font-bold text-[10px] truncate ${
                    complexed ? "text-[var(--secondary)]" : "text-[var(--error)]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      complexed ? "bg-[var(--secondary)]" : "bg-[var(--error)]"
                    }`}
                  />
                  <span>
                    {complexed ? "Kodeposisi Berhasil" : "Kodeposisi Gagal"}
                  </span>
                </span>
                <span
                  className={`rounded px-1.5 py-0.2 font-mono text-[8.5px] font-bold ${
                    complexed
                      ? "bg-[var(--surface)] text-[var(--foreground)]"
                      : "bg-[var(--surface)] text-[var(--error)]"
                  }`}
                >
                  {complexed ? "Paduan Sn–Bi" : "Hanya Bi"}
                </span>
              </div>

              <p className="mt-1 text-[9.5px] font-semibold text-[var(--foreground)] leading-tight">
                {complexed
                  ? "EDTA & Sitrat mengikat Bi³⁺ lebih kuat daripada Sn²⁺."
                  : "Tanpa pengompleks, Bi³⁺ tereduksi jauh lebih awal."}
              </p>

              <p className="mt-1 text-[8.5px] text-[var(--text-secondary)] leading-tight">
                {complexed
                  ? "Aktivitas Bi³⁺ turun drastis, potensial reduksinya bergeser mendekati Sn²⁺ sehingga keduanya mengendap serentak."
                  : "Selisih 0,45 V mencegah Sn²⁺ tereduksi pada potensial ini; deposit hanya bismut murni tanpa paduan timah."}
              </p>
            </div>

            {/* Bottom atoms summary */}
            <div className="mt-1 flex items-center justify-between border-t border-[var(--outline-variant)]/40 pt-1 text-[8.5px]">
              <span className="text-[var(--text-secondary)]">Deposit katoda:</span>
              <div className="flex items-center gap-1.5 font-bold font-mono">
                <span className="text-[var(--chart-navy)]">
                  ■ Sn: {snCount}
                </span>
                <span className="text-[var(--chart-gold)]">
                  ● Bi: {biCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
