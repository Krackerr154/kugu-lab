"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChemText } from "@/components/shared/ChemText";
import { Equation } from "@/components/shared/Equation";
import { CellSimulation, CathodeCloseUp } from "@/components/interactives/CellSimulation";
import { CHECKPOINTS, ILLUSTRATION_SECONDS, cellFrame, clampTime, type ReactionFocus } from "@/lib/m3-simulation";
import { CELL_COMPONENTS, type ComponentKey } from "@/lib/m3-cell-components";
import { BATH_AGENT_LABELS, type BathAgent } from "@/lib/m3-ligands";
import { BathAgentDetails } from "@/components/interactives/BathAgentDetails";
import { PegDendriteComparison } from "@/components/interactives/PegDendriteComparison";
import { useOptionalM3Presentation } from "@/components/shared/M3PresentationProvider";

interface CodepositionWorkbenchProps {
  selected: ComponentKey | null;
  hotspot: (key: ComponentKey, label: string) => Record<string, unknown>;
}

const control = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-control)] px-3 text-sm font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] disabled:cursor-not-allowed disabled:opacity-40";

export function CodepositionWorkbench({ selected, hotspot }: CodepositionWorkbenchProps) {
  const rootRef = useRef<HTMLElement>(null);
  const timeRef = useRef(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [complexed, setComplexed] = useState(true);
  const [focus, setFocus] = useState<ReactionFocus>("all");
  const [activeAgent, setActiveAgent] = useState<BathAgent>("edta");
  const agentDetailsId = useId();
  const pegComparisonId = useId();
  const [speed, setSpeed] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  // Guided-presentation follower: a controlled request to open a demo agent.
  // Null outside M3 / when not following, so solo behavior is unchanged.
  const presentation = useOptionalM3Presentation();
  const agentRequest = presentation?.agentRequest ?? null;
  const appliedAgentToken = useRef<number | null>(null);
  const frame = cellFrame(time, complexed);
  const advancing = playing && inView && pageVisible && !reducedMotion;
  const finished = time >= ILLUSTRATION_SECONDS;
  const percent = Math.round(time / ILLUSTRATION_SECONDS * 100);
  const reaction = focus === "all" ? null : CELL_COMPONENTS.cathode.halfReactions![focus === "bi" ? 0 : focus === "sn" ? 1 : 2];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      setReducedMotion(media.matches);
      if (media.matches) setPlaying(false);
    };
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    if (rootRef.current) observer.observe(rootRef.current);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  // One clock drives particles, reduction events, deposits, and the slider.
  // Paint at most 30 fps; no charting/animation dependency or independent timers.
  useEffect(() => {
    if (!advancing) return;
    let raf = 0;
    let previous = performance.now();
    let lastPaint = previous;
    const tick = (now: number) => {
      const delta = Math.min(now - previous, 100);
      previous = now;
      timeRef.current = clampTime(timeRef.current + delta / 1000 * speed);
      if (now - lastPaint >= 1000 / 30 || timeRef.current === ILLUSTRATION_SECONDS) {
        setTime(timeRef.current);
        lastPaint = now;
      }
      if (timeRef.current < ILLUSTRATION_SECONDS) raf = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [advancing, speed]);

  const seek = (next: number) => {
    setPlaying(false);
    timeRef.current = clampTime(next);
    setTime(timeRef.current);
  };

  // Apply a follower's demo-agent request: select the agent the presenter is
  // demonstrating. One-way and idempotent per token; never rebroadcasts and
  // never alters bath chemistry, playback time, or any private student state.
  useEffect(() => {
    if (!agentRequest) return;
    if (appliedAgentToken.current === agentRequest.token) return;
    appliedAgentToken.current = agentRequest.token;
    setActiveAgent(agentRequest.id);
  }, [agentRequest?.token, agentRequest?.id]);

  return (
    <section ref={rootRef} aria-label="Simulasi kodeposisi" className="min-w-0 space-y-4" data-playing={advancing} data-time={time.toFixed(3)} data-focus={focus}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--outline-variant)] pb-3">
        <div>
          <h4 className="text-base font-bold text-[var(--primary)]">Ikuti pembentukan lapisan</h4>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Bandingkan skenario pada posisi animasi yang sama.</p>
        </div>
        <button type="button" className={control} aria-pressed={complexed}
          onClick={() => { setPlaying(false); setComplexed((value) => !value); }}>
          <span aria-hidden="true" className="material-symbols-outlined text-xl">{complexed ? "hub" : "block"}</span>
          {complexed ? "Dengan pengompleks" : "Tanpa pengompleks"}
        </button>
      </div>

      <div role="group" aria-label="Sorot proses" className="flex flex-wrap items-center gap-2">
        {([
          ["all", "Semua proses", "Semua"], ["bi", "Sorot Bi", "Bi"],
          ["sn", "Sorot Sn", "Sn"], ["h2", "Sorot H2", "H_{2}"],
        ] as const).map(([key, label, text]) => (
          <button key={key} type="button" aria-label={label} aria-pressed={focus === key} onClick={() => setFocus(key)}
            className={`${control} aria-pressed:border-[var(--primary-container)] aria-pressed:bg-[var(--surface-selected)]`}>
            {key !== "all" && <span aria-hidden="true" className={`h-3 w-3 ${key === "sn" ? "rounded-sm bg-[var(--chart-navy)]" : key === "bi" ? "rounded-full bg-[var(--chart-gold)]" : "rounded-full border border-[var(--outline)]"}`} />}
            <ChemText>{text}</ChemText>
          </button>
        ))}
      </div>

      <div className="space-y-2 border-y border-[var(--outline-variant)] py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--primary-container)]" aria-live="polite">{frame.phase}</p>
          <output className="text-xs tabular-nums text-[var(--text-secondary)]">{percent}% urutan ilustrasi</output>
        </div>
        <label className="block">
          <span className="sr-only">Posisi animasi</span>
          <input type="range" min="0" max="100" step="1" value={percent}
            aria-valuetext={`${percent}% urutan ilustrasi, ${frame.phase}`}
            onChange={(event) => seek(Number(event.target.value) / 100 * ILLUSTRATION_SECONDS)}
            className="block h-11 w-full cursor-pointer accent-[var(--primary-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={control} aria-pressed={playing} disabled={reducedMotion || finished} onClick={() => setPlaying((value) => !value)}>
            <span aria-hidden="true" className="material-symbols-outlined text-xl">{playing ? "pause" : "play_arrow"}</span>
            {playing ? "Jeda Sel" : "Jalankan Sel"}
          </button>
          <button type="button" className={control} disabled={finished}
            onClick={() => seek(CHECKPOINTS.find((point) => point > time + 0.001) ?? ILLUSTRATION_SECONDS)}>
            <span aria-hidden="true" className="material-symbols-outlined text-xl">skip_next</span>Langkah berikutnya
          </button>
          <button type="button" className={control} aria-label="Ulangi dari awal" disabled={time === 0} onClick={() => seek(0)}>
            <span aria-hidden="true" className="material-symbols-outlined text-xl">replay</span>Ulangi
          </button>
          <label className="ml-auto flex min-h-11 items-center gap-2 text-xs text-[var(--text-secondary)]">
            Kecepatan animasi
            <select aria-label="Kecepatan animasi" className="control-field min-h-11 px-2 text-base" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
              <option value="0.5">0,5×</option><option value="1">1×</option><option value="2">2×</option>
            </select>
          </label>
        </div>
        {reducedMotion && <p className="text-sm text-[var(--text-secondary)]">Gerak dikurangi sesuai perangkat Anda. Gunakan langkah atau penggeser untuk memeriksa keadaan statis yang sama.</p>}
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <figure className="min-w-0 rounded-lg bg-[var(--surface-container-low)] p-3">
          <figcaption className="mb-2 text-sm font-semibold text-[var(--primary-container)]">Sel elektrodeposisi</figcaption>
          <CellSimulation frame={frame} running={advancing} focus={focus} selected={selected} hotspot={hotspot}
            activeAgent={activeAgent} onAgentSelect={setActiveAgent} agentDetailsId={agentDetailsId} />
          <div role="group" aria-label="Sorot agen dalam beaker" className="mt-2 flex flex-wrap gap-2">
            {(["edta", "citrate", "peg400"] as const).map((agent) => (
              <button key={agent} type="button" aria-label={`Sorot agen ${BATH_AGENT_LABELS[agent]}`}
                aria-pressed={activeAgent === agent} aria-controls={agentDetailsId} onClick={() => setActiveAgent(agent)}
                className={`${control} aria-pressed:border-[var(--primary-container)] aria-pressed:bg-[var(--surface-selected)]`}>
                {BATH_AGENT_LABELS[agent]}
              </button>
            ))}
          </div>
          <p role="status" className="sr-only">{BATH_AGENT_LABELS[activeAgent]} dipilih.{activeAgent === "peg400" ? " Pembesaran menampilkan perbandingan pertumbuhan dendrit. Gunakan tombol Ke pembesaran PEG400 untuk berpindah." : " Detail agen diperbarui."}</p>
          {activeAgent === "peg400" && <button type="button" className={`${control} mt-2`} aria-controls={pegComparisonId}
            onClick={() => {
              const target = document.getElementById(pegComparisonId);
              target?.focus({ preventScroll: true });
              target?.scrollIntoView({ behavior: "instant", block: "start" });
            }}>Ke pembesaran PEG400<span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span></button>}
          <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">Pilih label di beaker atau tombol agen untuk membaca detail. Elektroda dan sumber DC juga dapat dipilih.</p>
        </figure>
        <figure className="min-w-0 rounded-lg bg-[var(--surface-container-low)] p-3">
          <figcaption className="mb-2 text-sm font-semibold text-[var(--primary-container)]">{activeAgent === "peg400" ? "PEG400: model penghambatan dendrit" : "Dekat permukaan katoda"}</figcaption>
          {activeAgent === "peg400" ? <PegDendriteComparison frame={frame} onSeek={seek} id={pegComparisonId} /> : <>
            <CathodeCloseUp frame={frame} focus={focus} activeAgent={activeAgent} />
            <p className="text-xs leading-5 text-[var(--text-secondary)]">Garis putus: spesi dalam larutan. Bentuk terisi: logam yang sudah terdeposit.</p>
          </>}
        </figure>
      </div>

      <BathAgentDetails agentId={activeAgent} complexed={complexed} id={agentDetailsId} />

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--text-secondary)]" aria-label="Legenda partikel">
        <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 rounded-full bg-[var(--chart-gold)]" />Bi</span>
        <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 rounded-sm bg-[var(--chart-navy)]" />Sn</span>
        <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 rounded-full border border-[var(--outline)]" /><ChemText>{"H_{2}"}</ChemText></span>
      </div>

      <section aria-label="Reaksi yang diamati" className="min-w-0 rounded-lg bg-[var(--surface-container-low)] p-4">
        <h5 className="text-sm font-bold text-[var(--primary)]">
          {focus === "sn" ? "Reduksi timah" : focus === "bi" ? "Reduksi bismut" : focus === "h2" ? "Reaksi samping hidrogen" : "Dari spesi larutan menjadi lapisan logam"}
        </h5>
        {reaction && <div className="my-2"><Equation tex={reaction.tex} compact /></div>}
        <p className="mt-1 max-w-[72ch] text-sm leading-6 text-[var(--text-secondary)]">
          {focus === "sn"
            ? complexed
              ? "Ikuti bentuk persegi Sn: spesi menerima dua elektron, lalu menjadi logam pada katoda. Pada skenario kodeposisi ini, Sn ikut membangun lapisan bersama Bi."
              : "Sn tetap dapat mendekati permukaan, tetapi belum ikut tereduksi pada jendela potensial ilustrasi ini. Transpor menuju katoda tidak otomatis berarti deposisi."
            : focus === "bi"
              ? "Ikuti lingkaran Bi: spesi menerima tiga elektron dan menjadi logam. Tanpa pengompleks, Bi lebih mudah tereduksi dibandingkan Sn; pada skenario kodeposisi keduanya membentuk deposit."
              : focus === "h2"
                ? "Reduksi ion hidrogen memakai elektron untuk membentuk gas, tanpa menambah massa deposit. Karena itu tidak seluruh muatan harus menjadi Sn atau Bi; jumlah gelembung di animasi bukan nilai efisiensi arus."
                : "Spesi logam bergerak di larutan, menerima elektron di permukaan, lalu bertahan sebagai deposit. Pilih Bi, Sn, atau H2 untuk mengikuti satu proses; penggeser dan tombol langkah menahan adegan agar dapat diperiksa."}
        </p>
      </section>

      <p aria-live="polite" className="max-w-[72ch] text-sm leading-6 text-[var(--on-surface)]">
        {complexed ? <><strong>Dengan EDTA dan asam sitrat:</strong> ilustrasi memperlihatkan Sn dan Bi ikut tereduksi dan membangun lapisan. Pengompleks menggeser potensial deposisi efektif; hasil nyata tetap bergantung pada kondisi elektrolit dan operasi.</> : <><strong>Tanpa pengompleks:</strong> pada jendela potensial ilustrasi ini, Bi tereduksi lebih dahulu (E° = +0,31 V; Sn E° = −0,14 V). Sn tetap dapat mendekati katoda, tetapi belum ikut tereduksi. Lapisan yang diperlihatkan kaya bismut.</>}
      </p>
      <p className="max-w-[80ch] text-xs leading-5 text-[var(--text-secondary)]">
        Skema konseptual, bukan prediksi komposisi, massa, efisiensi, waktu praktikum, atau kisi kristal. Penanda ligan bersifat simbolik: protonasi, muatan, struktur kompleks, dan jalur elementer reaksi tidak dimodelkan. Transpor, reduksi, dan pertumbuhan berlangsung bersamaan di sel nyata. Dasar: penuntun hlm. 20–24.
      </p>
    </section>
  );
}
