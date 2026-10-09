"use client";

import { useEffect, useRef, useState } from "react";
import { CellSimulation, CathodeCloseUp } from "@/components/interactives/CellSimulation";
import { cellFrame, clampTime, ILLUSTRATION_SECONDS, type ReactionFocus } from "@/lib/m3-simulation";
import { pegGrowthFrame } from "@/lib/m3-peg-growth";
import type { BathAgent } from "@/lib/m3-ligands";
import { useReducedMotion } from "@/components/shared/useReducedMotion";
import { useOptionalM3Presentation } from "@/components/shared/M3PresentationProvider";

export function ComplexingEffectWorkbench() {
  const presentation = useOptionalM3Presentation();
  const role = presentation?.role ?? "solo";
  const remoteSimState = presentation?.snapshot?.simState;
  const isPresenter = role === "presenting";
  const isFollowing = (role === "following" || role === "presenting") && presentation?.status === "following" && !presentation?.ended;

  const [time, setTime] = useState(6);
  const timeRef = useRef(6);
  const [playing, setPlaying] = useState(false);
  const [complexed, setComplexed] = useState(true);
  const [mode, setMode] = useState<"alloy" | "dendrite">("alloy");
  const [peg, setPeg] = useState(false);
  const [view, setView] = useState<"closeup" | "cell">("cell");
  const reducedMotion = useReducedMotion();

  // Broadcast simulation state from presenter to students
  const broadcastSim = (next: {
    playing?: boolean;
    time?: number;
    complexed?: boolean;
    view?: "closeup" | "cell";
    mode?: "alloy" | "dendrite";
    peg?: boolean;
  }) => {
    if (!isPresenter || !presentation?.presentSimState) return;
    presentation.presentSimState({
      playing: next.playing ?? playing,
      time: next.time !== undefined ? next.time : timeRef.current,
      complexed: next.complexed !== undefined ? next.complexed : complexed,
      view: next.view !== undefined ? next.view : view,
      mode: next.mode !== undefined ? next.mode : mode,
      peg: next.peg !== undefined ? next.peg : peg,
    });
  };

  // Follower synchronizes to incoming presenter simulation state
  useEffect(() => {
    if (!isFollowing || !remoteSimState) return;
    setComplexed(remoteSimState.complexed);
    setView(remoteSimState.view);
    if (remoteSimState.mode) {
      setMode(remoteSimState.mode);
    }
    if (remoteSimState.peg !== undefined) {
      setPeg(remoteSimState.peg);
    }
    if (!remoteSimState.playing || Math.abs(remoteSimState.time - timeRef.current) > 0.5) {
      timeRef.current = clampTime(remoteSimState.time);
      setTime(timeRef.current);
    }
    setPlaying(remoteSimState.playing);
  }, [remoteSimState, isFollowing]);

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
        if (isPresenter) {
          presentation?.presentSimState?.({
            playing: false,
            time: ILLUSTRATION_SECONDS,
            complexed,
            view,
            mode,
            peg,
          });
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [advancing, isPresenter, presentation, complexed, view, mode, peg]);

  const seek = (next: number) => {
    const clamped = clampTime(next);
    setPlaying(false);
    timeRef.current = clamped;
    setTime(clamped);
    if (isPresenter) {
      broadcastSim({ playing: false, time: clamped });
    }
  };

  const toggleComplexed = () => {
    const next = !complexed;
    setPlaying(false);
    setComplexed(next);
    if (isPresenter) {
      broadcastSim({ playing: false, complexed: next });
    }
  };

  const handleSelectMode = (nextMode: "alloy" | "dendrite") => {
    setMode(nextMode);
    if (isPresenter) {
      broadcastSim({ mode: nextMode });
    }
  };

  const handleSetPeg = (nextPeg: boolean) => {
    setPeg(nextPeg);
    if (isPresenter) {
      broadcastSim({ peg: nextPeg, mode: "dendrite" });
    }
  };

  const handleTogglePlay = () => {
    const nextPlaying = !playing;
    let nextTime = timeRef.current;
    if (nextPlaying && nextTime >= ILLUSTRATION_SECONDS) {
      nextTime = 0;
      timeRef.current = 0;
      setTime(0);
    }
    setPlaying(nextPlaying);
    if (isPresenter) {
      broadcastSim({ playing: nextPlaying, time: nextTime });
    }
  };

  const handleSetView = (nextView: "closeup" | "cell") => {
    setView(nextView);
    if (isPresenter) {
      broadcastSim({ view: nextView });
    }
  };

  const dendriteFrame = pegGrowthFrame(frame, peg);

  return (
    <div
      data-complexing-effect-workbench
      className="m4-motion-enter rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-2 sm:p-2.5 text-xs flex flex-col justify-between h-full"
    >
      {/* ── TOP CONTROL BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-1 mb-1 shrink-0">
        {/* Scenario Toggles */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] shrink-0">
            Skenario:
          </span>
          <button
            type="button"
            onClick={() => {
              if (mode !== "alloy") {
                handleSelectMode("alloy");
              } else {
                toggleComplexed();
              }
            }}
            aria-pressed={mode === "alloy"}
            className={`m4-motion-control inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10.5px] font-bold shadow-xs shrink-0 ${
              mode === "alloy"
                ? complexed
                  ? "border-[var(--secondary)] bg-[var(--secondary-container)]/25 text-[var(--on-secondary-container)] ring-1 ring-[var(--secondary)]/40"
                  : "border-[var(--error)] bg-[var(--error-container)]/20 text-[var(--error)] ring-1 ring-[var(--error)]/40"
                : "border-[var(--outline-variant)] bg-[var(--surface-control)] text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xs">
              {complexed ? "hub" : "block"}
            </span>
            <span>{complexed ? "Dengan Pengompleks" : "Tanpa Pengompleks"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode(mode === "dendrite" ? "alloy" : "dendrite")}
            aria-pressed={mode === "dendrite"}
            className={`m4-motion-control inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10.5px] font-bold shadow-xs shrink-0 ${
              mode === "dendrite"
                ? "border-[#7c3aed] bg-[#7c3aed]/15 text-[#7c3aed] ring-1 ring-[#7c3aed]/40"
                : "border-[var(--outline-variant)] bg-[var(--surface-control)] text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xs">
              account_tree
            </span>
            <span>Pertumbuhan Dendrit</span>
          </button>
        </div>

        {/* View Switch + Playback Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Progress badge */}
          <span className="font-mono tabular-nums text-[10px] text-[var(--text-secondary)] bg-[var(--surface-container-low)] rounded px-1.5 py-0.5">
            {time.toFixed(1)}s · {percent}%
          </span>

          {/* View toggle */}
          <div className="inline-flex rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-0.5 text-[10px]">
            {mode === "alloy" ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSetView("closeup")}
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
                  onClick={() => handleSetView("cell")}
                  className={`rounded px-1.5 py-0.5 font-bold transition-colors ${
                    view === "cell"
                      ? "bg-[var(--surface)] text-[var(--primary)] shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Sel Beaker
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSetPeg(false)}
                  className={`rounded px-1.5 py-0.5 font-bold transition-colors ${
                    !peg
                      ? "bg-[var(--surface)] text-[#7c3aed] shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Tanpa PEG
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPeg(true)}
                  className={`rounded px-1.5 py-0.5 font-bold transition-colors ${
                    peg
                      ? "bg-[var(--surface)] text-[var(--secondary)] shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Dengan PEG
                </button>
              </>
            )}
          </div>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={reducedMotion || (time >= ILLUSTRATION_SECONDS && !isPresenter)}
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
      <div className="flex flex-col sm:flex-row gap-2 flex-1 items-stretch min-h-0">
        {/* Left: Animation Canvas Box (58% width on landscape) */}
        <div
          className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-1.5 flex flex-col justify-between min-w-0"
          style={{ width: "58%", flex: "0 0 58%" }}
        >
          <div className="flex items-center justify-between text-[9px] text-[var(--muted)] px-1 mb-0.5 font-semibold shrink-0">
            <span>
              {mode === "dendrite"
                ? peg
                  ? "Permukaan Katoda Cu · Adsorpsi PEG400"
                  : "Permukaan Katoda Cu · Pertumbuhan Dendrit"
                : view === "closeup"
                ? "Permukaan Katoda Plat Cu"
                : "Beaker Kodeposisi DC"}
            </span>
            <span className="font-bold text-[var(--primary-container)]">
              {mode === "dendrite"
                ? time < 3.3
                  ? "Tahap 1: Inisiasi"
                  : time < 6.4
                  ? "Tahap 2: Tonjolan"
                  : "Tahap 3: Percabangan"
                : frame.phase}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0" style={{ height: "118px", maxHeight: "118px" }}>
            {mode === "dendrite" ? (
              <div className="w-full flex items-center justify-center" style={{ height: "118px", maxHeight: "118px" }}>
                <svg
                  viewBox="0 0 300 150"
                  className="w-auto h-full max-h-[118px]"
                  role="img"
                  aria-label={peg ? "Pertumbuhan tersebar dengan adsorpsi PEG400" : "Pertumbuhan jarum dendrit tanpa PEG400"}
                >
                  <rect x="10" y="10" width="230" height="130" rx="4" fill="var(--surface-container)" />
                  <rect x="240" y="10" width="48" height="130" fill="var(--surface-variant)" stroke="var(--outline)" />
                  <text x="264" y="77" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--primary-container)">Cu</text>
                  <g fill="var(--primary-container)" stroke="var(--primary-container)" strokeWidth="10" strokeLinecap="round">
                    {dendriteFrame.deposited.map((atom) => {
                      const parent = dendriteFrame.deposited.find((entry) => entry.id === atom.parent);
                      return <line key={atom.id} x1={parent?.x ?? 240} y1={parent?.y ?? atom.y} x2={atom.x} y2={atom.y} />;
                    })}
                  </g>
                  {dendriteFrame.deposited.map((atom) => (
                    <circle key={atom.id} cx={atom.x} cy={atom.y} r="7" fill="var(--primary-container)" />
                  ))}
                  {dendriteFrame.incoming.map((ion) => (
                    <circle
                      key={ion.id}
                      cx={ion.incomingX}
                      cy={ion.incomingY}
                      r="4.5"
                      fill="var(--surface-control)"
                      stroke="var(--primary-container)"
                      strokeWidth="1.3"
                      strokeDasharray="2 2"
                    />
                  ))}
                  {dendriteFrame.adsorbates.map((chain) => (
                    <g key={chain.row} transform={`translate(${chain.x} ${chain.y})`}>
                      <path d="M0 -11 C-7 -8 7 -5 0 -2 S-7 4 0 7 S7 10 0 12" fill="none" stroke="var(--secondary)" strokeWidth="2.6" />
                    </g>
                  ))}
                </svg>
              </div>
            ) : view === "closeup" ? (
              <div className="w-full flex items-center justify-center" style={{ height: "118px", maxHeight: "118px" }}>
                <CathodeCloseUp
                  frame={frame}
                  focus="all"
                  activeAgent="edta"
                  className="w-auto h-full"
                  viewBox="10 20 280 200"
                />
              </div>
            ) : (
              <div className="w-full flex items-center justify-center" style={{ height: "118px", maxHeight: "118px" }}>
                <CellSimulation
                  frame={frame}
                  running={advancing}
                  focus="all"
                  selected={null}
                  hotspot={() => ({})}
                  activeAgent="edta"
                  onAgentSelect={() => {}}
                  className="w-auto h-full"
                  viewBox="35 8 230 192"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-1 text-[8.5px] text-[var(--text-secondary)] shrink-0">
            <span>
              {mode === "dendrite"
                ? peg
                  ? "Pita bergelombang: molekul PEG400 teradsorpsi"
                  : "Garis tebal: cabang dendrit logam"
                : "Garis putus-putus: ion kation larutan"}
            </span>
            <span>
              {mode === "dendrite"
                ? "Titik: atom terdeposit di katoda"
                : "Kotak/lingkaran solid: atom deposit"}
            </span>
          </div>
        </div>

        {/* Right: Pedagogical Analysis & Live Result */}
        <div className="w-full flex flex-col justify-between gap-1 min-w-0 flex-1">
          {mode === "dendrite" ? (
            <div
              className={`rounded-lg border p-2 flex flex-col justify-between flex-1 min-w-0 ${
                !peg
                  ? "border-[#7c3aed]/40 bg-[#7c3aed]/10"
                  : "border-[var(--secondary)]/40 bg-[var(--secondary-container)]/15"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[10px] truncate ${
                      !peg ? "text-[#7c3aed]" : "text-[var(--secondary)]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        !peg ? "bg-[#7c3aed]" : "bg-[var(--secondary)]"
                      }`}
                    />
                    <span>
                      {!peg ? "Pertumbuhan Dendrit" : "Pertumbuhan Tersebar"}
                    </span>
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.2 font-mono text-[8.5px] font-bold ${
                      !peg
                        ? "bg-[var(--surface)] text-[#7c3aed]"
                        : "bg-[var(--surface)] text-[var(--secondary)]"
                    }`}
                  >
                    {!peg ? "Tanpa PEG400" : "Dengan PEG400"}
                  </span>
                </div>

                <p className="mt-1 text-[10px] font-bold text-[var(--foreground)] leading-snug">
                  {!peg
                    ? "Efek medan listrik lokal di ujung tonjolan (tip effect)."
                    : "Molekul PEG400 menutup situs tonjolan aktif."}
                </p>

                <p className="mt-1 text-[9px] text-[var(--text-secondary)] leading-relaxed">
                  {!peg
                    ? "Tanpa aditif penghambat, ion logam terus mengendap di titik tertinggi, memicu percabangan jarum yang rapuh dan mudah rontok."
                    : "Adsorpsi PEG400 memperlambat pertumbuhan di puncak tonjolan, memaksa ion baru mengendap di lembah sehingga lapisan rata."}
                </p>
              </div>

              {/* Bottom status */}
              <div className="mt-1 flex items-center justify-between border-t border-[var(--outline-variant)]/40 pt-1 text-[8.5px] pr-10">
                <span className="text-[var(--text-secondary)]">Morfologi deposit:</span>
                <div className="flex items-center gap-1.5 font-bold font-mono">
                  <span className={!peg ? "text-[#7c3aed]" : "text-[var(--secondary)]"}>
                    {!peg
                      ? `Jarum (${dendriteFrame.deposited.length} node)`
                      : `Rata (${dendriteFrame.deposited.length} node)`}
                  </span>
                </div>
              </div>
            </div>
          ) : (
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

                <p className="mt-1 text-[10px] font-bold text-[var(--foreground)] leading-snug">
                  {complexed
                    ? "EDTA & Sitrat mengikat Bi³⁺ lebih kuat daripada Sn²⁺."
                    : "Tanpa pengompleks, Bi³⁺ tereduksi jauh lebih awal."}
                </p>

                <p className="mt-1 text-[9px] text-[var(--text-secondary)] leading-relaxed">
                  {complexed
                    ? "Aktivitas Bi³⁺ turun drastis, potensial reduksinya bergeser mendekati Sn²⁺ sehingga keduanya mengendap serentak."
                    : "Selisih 0,45 V mencegah Sn²⁺ tereduksi pada potensial ini; deposit hanya bismut murni tanpa paduan timah."}
                </p>
              </div>

              {/* Bottom atoms summary */}
              <div className="mt-1 flex items-center justify-between border-t border-[var(--outline-variant)]/40 pt-1 text-[8.5px] pr-10">
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
          )}
        </div>
      </div>
    </div>
  );
}
