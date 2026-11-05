"use client";

/**
 * Visual untuk teori XRD (Modul 5).
 *
 * CrystalOrderContinuum — kontinum kristalin ↔ semikristalin ↔ amorf: kisi
 * atom 2D bergetar dan terdistorsi seiring kenaikan disorder, sementara difraktogram
 * di sebelahnya melebar dan menumbuhkan gundukan halo dari model fisik yang sama
 * (lib/m5-xrd.ts). Tombol "Putar" menjalankan autosweep siklus penuh (0 → 1 → 0).
 *
 * BraggDiagram — sandbox geometri Hukum Bragg: bidang kristal, berkas
 * datang/pantul, dan putusan konstruktif/destruktif yang dihitung dari
 * nλ = 2d sinθ.
 *
 * DiffractogramAnatomy — pola standar Al-Fum beranotasi: apa yang bisa dibaca
 * dari posisi, lebar, dan luas puncak.
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  ALFUM_STANDARD_REFLECTIONS,
  dSpacing,
  diffractogram,
  disorderPattern,
  orderStageLabel,
  seededRandom,
} from "@/lib/m5-xrd";

const NAVY = "var(--chart-navy)";
const GOLD = "var(--chart-gold)";
const DIM = "var(--text-secondary)";
const MUTED = "var(--muted)";

/* ── 1. Kontinum keteraturan kristal ──────────────────────────────────── */

const LATTICE_COLS = 6;
const LATTICE_ROWS = 4;
const ATOM_COUNT = LATTICE_COLS * LATTICE_ROWS;

const ATOM_PHASES = (() => {
  const rnd = seededRandom(20261105);
  const phases: { a: number; b: number }[] = [];
  for (let i = 0; i < ATOM_COUNT; i++) {
    phases.push({ a: rnd() * Math.PI * 2, b: rnd() * Math.PI * 2 });
  }
  return phases;
})();

const STATIC_OFFSETS = (() => {
  const rnd = seededRandom(1052401);
  const offsets: { x: number; y: number }[] = [];
  for (let i = 0; i < ATOM_COUNT; i++) {
    const angle = rnd() * Math.PI * 2;
    const mag = 0.6 + rnd() * 0.7;
    offsets.push({
      x: Math.cos(angle) * mag,
      y: Math.sin(angle) * mag,
    });
  }
  return offsets;
})();

function patternPath(
  pts: readonly { x: number; y: number }[],
  marginLeft: number,
  marginTop: number,
  plotWidth: number,
  plotHeight: number,
  yMax = 140
): string {
  const minX = 5;
  const maxX = 80;
  const baselineY = marginTop + plotHeight;
  const sx = (x: number) => marginLeft + ((x - minX) / (maxX - minX)) * plotWidth;
  const sy = (y: number) => baselineY - (Math.min(y, yMax) / yMax) * plotHeight;
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
    .join(" ");
}

function patternAreaPath(
  pts: readonly { x: number; y: number }[],
  marginLeft: number,
  marginTop: number,
  plotWidth: number,
  plotHeight: number,
  yMax = 140
): string {
  const lineD = patternPath(pts, marginLeft, marginTop, plotWidth, plotHeight, yMax);
  const baselineY = marginTop + plotHeight;
  const minX = 5;
  const maxX = 80;
  const sx = (x: number) => marginLeft + ((x - minX) / (maxX - minX)) * plotWidth;
  const startX = sx(pts[0].x).toFixed(1);
  const endX = sx(pts[pts.length - 1].x).toFixed(1);
  return `${lineD} L${endX},${baselineY} L${startX},${baselineY} Z`;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function CrystalOrderContinuum() {
  const [disorder, setDisorder] = useState(0.35);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const describedBy = useId();

  const disorderRef = useRef(disorder);
  disorderRef.current = disorder;
  const playRef = useRef(playing);
  playRef.current = playing;

  const clock = useRef({ last: 0, dir: 1 as 1 | -1 });
  const tRef = useRef(0);
  const [, setTick] = useState(0);

  const L = useMemo(() => disorderPattern(disorder), [disorder]);
  const stage = orderStageLabel(disorder);

  const stopPlaying = () => setPlaying(false);

  const onTogglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    // Jika sudah di ujung atau arah balik, mulai kembali dari kristalin murni (0)
    if (disorder >= 0.95 || clock.current.dir === -1) {
      setDisorder(0);
      clock.current.dir = 1;
    }
    setPlaying(true);
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.064);
      last = now;

      if (!reduced) {
        tRef.current += dt;
      }

      if (playRef.current) {
        const FORWARD_SEC = 4.5;
        const REVERSE_SEC = 3.5;
        const speed = clock.current.dir === 1 ? 1 / FORWARD_SEC : 1 / REVERSE_SEC;
        let nextD = disorderRef.current + dt * speed * clock.current.dir;

        if (nextD >= 1) {
          nextD = 1;
          clock.current.dir = -1;
        } else if (nextD <= 0 && clock.current.dir === -1) {
          nextD = 0;
          setPlaying(false);
          clock.current.dir = 1;
        }
        setDisorder(nextD);
      } else {
        if (!reduced) {
          setTick((t) => (t + 1) % 100000);
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Dimensi SVG
  const W = 320;
  const H = 180;

  // Lattice geometry
  const DX = 46;
  const DY = 34;
  const X0 = 45;
  const Y0 = 39;

  const freq = 2.5 + 4 * disorder;
  const thermalAmp = reduced ? 0 : 0.8 + disorder * 3.5;
  const staticAmp = disorder * 14;

  const atoms: { x: number; y: number; r: number; c: number; key: number; color: string; radius: number }[] = [];
  let idx = 0;
  for (let r = 0; r < LATTICE_ROWS; r++) {
    for (let c = 0; c < LATTICE_COLS; c++) {
      const bx = X0 + c * DX;
      const by = Y0 + r * DY;
      const ph = ATOM_PHASES[idx];
      const off = STATIC_OFFSETS[idx];
      const t = tRef.current;

      const thermalX = reduced ? 0 : Math.sin(t * freq + ph.a) * thermalAmp;
      const thermalY = reduced ? 0 : Math.cos(t * freq * 0.83 + ph.b) * thermalAmp;

      const x = bx + off.x * staticAmp + thermalX;
      const y = by + off.y * staticAmp + thermalY;

      const isAl = (r + c) % 2 === 0;
      atoms.push({
        x,
        y,
        r,
        c,
        key: idx,
        color: isAl ? "#001f3f" : "#d97706",
        radius: isAl ? 5.8 : 4.8,
      });
      idx++;
    }
  }

  // Ikatan/kisi kristal
  const bonds: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  for (let r = 0; r < LATTICE_ROWS; r++) {
    for (let c = 0; c < LATTICE_COLS; c++) {
      const a = atoms[r * LATTICE_COLS + c];
      if (c < LATTICE_COLS - 1) {
        const b = atoms[r * LATTICE_COLS + c + 1];
        bonds.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: `h-${r}-${c}` });
      }
      if (r < LATTICE_ROWS - 1) {
        const b = atoms[(r + 1) * LATTICE_COLS + c];
        bonds.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: `v-${r}-${c}` });
      }
    }
  }
  const bondOpacity = Math.max(0, (1 - disorder * 1.35) * 0.35);

  // XRD Plot layout
  const marginLeft = 34;
  const marginRight = 12;
  const marginTop = 16;
  const plotHeight = 126;
  const baselineY = marginTop + plotHeight; // 142
  const plotWidth = W - marginLeft - marginRight; // 274
  const minX = 5;
  const maxX = 80;
  const yMax = 140;

  const sx = (x: number) => marginLeft + ((x - minX) / (maxX - minX)) * plotWidth;
  const sy = (y: number) => baselineY - (Math.min(y, yMax) / yMax) * plotHeight;

  const TICKS_X = [10, 20, 40, 60, 80];
  const lineD = patternPath(L.points, marginLeft, marginTop, plotWidth, plotHeight, yMax);
  const areaD = patternAreaPath(L.points, marginLeft, marginTop, plotWidth, plotHeight, yMax);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-base font-bold text-[var(--foreground)]">
            Kristalin ↔ Semikristalin ↔ Amorf
          </h3>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]" id={describedBy}>
            Keteraturan susunan kisi atom menentukan ketajaman puncak difraksi XRD.
          </p>
        </div>

        <button
          type="button"
          onClick={onTogglePlay}
          aria-pressed={playing}
          aria-label={playing ? "Hentikan animasi" : "Putar animasi otomatis"}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold shadow-sm transition-all ${
            playing
              ? "bg-amber-600 text-white hover:bg-amber-700"
              : "bg-[var(--primary)] text-white hover:opacity-90"
          }`}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] leading-none">
            {playing ? "pause" : "play_arrow"}
          </span>
          {playing ? "Jeda" : "Putar"}
        </button>
      </div>

      {/* Control bar */}
      <div className="mt-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--foreground)]">
            Tingkat Ketidakteraturan (Disorder):
          </span>
          <span className="font-mono font-medium text-[var(--primary-dark)] bg-[var(--surface-muted)] px-2 py-0.5 rounded border border-[var(--border)]">
            {Math.round(disorder * 100)}%
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(disorder * 100)}
          aria-label="Tingkat ketidakteraturan kisi"
          aria-describedby={describedBy}
          onChange={(e) => {
            stopPlaying();
            setDisorder(Number(e.target.value) / 100);
          }}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--surface-container-high)] accent-[var(--primary)]"
        />

        {/* Quick preset buttons */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <button
            type="button"
            onClick={() => { stopPlaying(); setDisorder(0); }}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              disorder < 0.2
                ? "bg-[var(--primary-light)] text-[var(--primary-dark)] font-semibold shadow-xs"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            Kristalin (0%)
          </button>
          <button
            type="button"
            onClick={() => { stopPlaying(); setDisorder(0.5); }}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              disorder >= 0.2 && disorder <= 0.75
                ? "bg-[var(--primary-light)] text-[var(--primary-dark)] font-semibold shadow-xs"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            Semikristalin (50%)
          </button>
          <button
            type="button"
            onClick={() => { stopPlaying(); setDisorder(1); }}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              disorder > 0.75
                ? "bg-[var(--primary-light)] text-[var(--primary-dark)] font-semibold shadow-xs"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            Amorf (100%)
          </button>
        </div>
      </div>

      {/* Dual visual panels */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* Panel 1: Lattice */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-container-lowest)] p-3 shadow-xs">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--foreground)]">Kisi Atom 2D</span>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              {disorder < 0.25 ? "Periodik teratur" : disorder < 0.7 ? "Distorsi kisi" : "Acak (amorf)"}
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-muted)]">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Simulasi susunan kisi atom">
              {/* Garis kisi kristal */}
              {bonds.map((b) => (
                <line
                  key={b.key}
                  x1={b.x1}
                  y1={b.y1}
                  x2={b.x2}
                  y2={b.y2}
                  stroke="#64748b"
                  strokeWidth={1.2}
                  opacity={bondOpacity}
                />
              ))}

              {/* Atom-atom */}
              {atoms.map((a) => (
                <circle
                  key={a.key}
                  cx={a.x}
                  cy={a.y}
                  r={a.radius}
                  fill={a.color}
                  stroke="white"
                  strokeWidth={1.2}
                  opacity={0.95}
                />
              ))}

              {/* Legend kecil di pojok */}
              <g transform="translate(10, 162)">
                <circle cx={4} cy={-2} r={3.2} fill="#001f3f" />
                <text x={10} y={1} fontSize={7.5} fill="var(--text-secondary)">Kation Al</text>
                <circle cx={62} cy={-2} r={2.8} fill="#d97706" />
                <text x={68} y={1} fontSize={7.5} fill="var(--text-secondary)">Linker Fumarat</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Panel 2: Diffractogram */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-container-lowest)] p-3 shadow-xs">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--foreground)]">Difraktogram XRD</span>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              Cu Kα1 (λ = 1.5406 Å)
            </span>
          </div>
          <div className="overflow-hidden rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-muted)]">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Difraktogram XRD hasil simulasi">
              <defs>
                <linearGradient id="m5-xrd-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#001f3f" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#001f3f" stopOpacity="0.03" />
                </linearGradient>
              </defs>

              {/* Grid lines horizontal */}
              <line x1={marginLeft} y1={sy(50)} x2={marginLeft + plotWidth} y2={sy(50)} stroke="#cbd5e1" strokeDasharray="3,3" strokeWidth={0.7} />
              <line x1={marginLeft} y1={sy(100)} x2={marginLeft + plotWidth} y2={sy(100)} stroke="#cbd5e1" strokeDasharray="3,3" strokeWidth={0.7} />

              {/* Kurva & Area */}
              <path d={areaD} fill="url(#m5-xrd-fill)" />
              <path d={lineD} fill="none" stroke="#001f3f" strokeWidth={1.5} strokeLinejoin="round" />

              {/* Sumbu X & Y */}
              <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={baselineY} stroke="#64748b" strokeWidth={1} />
              <line x1={marginLeft} y1={baselineY} x2={marginLeft + plotWidth} y2={baselineY} stroke="#64748b" strokeWidth={1} />

              {/* Ticks & Labels X */}
              {TICKS_X.map((t) => (
                <g key={t}>
                  <line x1={sx(t)} y1={baselineY} x2={sx(t)} y2={baselineY + 3.5} stroke="#64748b" strokeWidth={1} />
                  <text x={sx(t)} y={baselineY + 13} fontSize={8.5} fill="#475569" textAnchor="middle">
                    {t}°
                  </text>
                </g>
              ))}

              {/* Ticks Y */}
              <text x={marginLeft - 4} y={sy(50) + 3} fontSize={7.5} fill="#64748b" textAnchor="end">50</text>
              <text x={marginLeft - 4} y={sy(100) + 3} fontSize={7.5} fill="#64748b" textAnchor="end">100</text>
              <text x={marginLeft - 4} y={marginTop - 3} fontSize={8} fill="#475569" fontWeight={500} textAnchor="start">
                Intensitas (a.u.)
              </text>

              {/* Judul Sumbu X */}
              <text x={marginLeft + plotWidth / 2} y={170} fontSize={8.5} fill="#334155" fontWeight={600} textAnchor="middle">
                Sudut Difraksi 2θ (°)
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Footer / Status bar */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 rounded-lg bg-[var(--surface-container-low)] p-2.5 border border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            disorder <= 0.25
              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
              : disorder <= 0.7
              ? "bg-amber-100 text-amber-900 border border-amber-300"
              : "bg-slate-200 text-slate-900 border border-slate-300"
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {stage}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[var(--text-secondary)]">FWHM (011): </span>
            <span className="font-mono font-bold text-[var(--foreground)]">{L.fwhmDeg.toFixed(2)}°</span>
          </div>
          <div>
            <span className="text-[var(--text-secondary)]">Kristalinitas: </span>
            <span className="font-mono font-bold text-[var(--foreground)]">{Math.round(L.crystallinityPct)}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 2. Sandbox geometri Bragg ────────────────────────────────────────── */

const SOURCES = [
  { value: 1.5406, label: "Cu Kα (1.5406 Å)" },
  { value: 0.7107, label: "Mo Kα (0.7107 Å)" },
  { value: 1.7902, label: "Co Kα (1.7902 Å)" },
  { value: 1.54059, label: "Cu Kα1 (1.54059 Å)" },
];

export function BraggDiagram() {
  const [lambda, setLambda] = useState(1.5406);
  const [twoTheta, setTwoTheta] = useState(28.5);
  const [n, setN] = useState(1);

  const theta = twoTheta / 2;
  const thetaRad = (theta * Math.PI) / 180;
  const d = (n * lambda) / (2 * Math.sin(thetaRad));
  const pathDiff = 2 * d * Math.sin(thetaRad);
  const nLambda = n * lambda;
  const constructive = Math.abs(nLambda - pathDiff) < 0.05;
  const residual = nLambda - pathDiff;

  const W = 300;
  const H = 150;
  const gap = Math.max(16, Math.min(64, d * 9));
  const y1 = 55;
  const y2 = y1 + gap;
  const cx = 150;

  const rayLen = 92;
  const startX = cx - rayLen * Math.cos(thetaRad);
  const startY = y1 - rayLen * Math.sin(thetaRad);
  const endX = cx + rayLen * Math.cos(thetaRad);
  const endY = y1 + rayLen * Math.sin(thetaRad);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Sandbox Hukum Bragg</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        nλ = 2d sinθ. Geser 2θ — ketika nλ ≈ 2d sinθ, hamburan sefase dan puncak
        muncul.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="m5-bragg-source" className="text-sm font-medium">Sumber sinar-X (λ, Å)</label>
          <select
            id="m5-bragg-source"
            value={lambda}
            onChange={(e) => setLambda(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="m5-bragg-two-theta" className="text-sm font-medium">2θ (°)</label>
          <input
            id="m5-bragg-two-theta"
            type="range"
            min={4}
            max={120}
            step={0.1}
            value={twoTheta}
            onChange={(e) => setTwoTheta(Number(e.target.value))}
            className="mt-3 w-full"
          />
          <div className="text-right text-sm font-mono">{twoTheta.toFixed(1)}°</div>
        </div>
        <div>
          <label htmlFor="m5-bragg-order" className="text-sm font-medium">Orde n</label>
          <input
            id="m5-bragg-order"
            type="number"
            min={1}
            max={4}
            value={n}
            onChange={(e) => setN(Math.max(1, Math.min(4, Number(e.target.value) || 1)))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Geometri Hukum Bragg">
          {/* Bidang kristal */}
          <line x1={16} y1={y1} x2={W - 16} y2={y1} stroke={NAVY} strokeWidth={1.2} strokeDasharray="5,3" />
          <line x1={16} y1={y2} x2={W - 16} y2={y2} stroke={NAVY} strokeWidth={1.2} strokeDasharray="5,3" />
          <text x={W - 12} y={(y1 + y2) / 2 + 3} fontSize={9} fill={MUTED} textAnchor="end">
            d
          </text>

          {/* Berkas datang & pantul */}
          <line x1={startX} y1={startY} x2={cx} y2={y1} stroke="#ef4444" strokeWidth={2} />
          <line x1={cx} y1={y1} x2={endX} y2={endY} stroke="#476083" strokeWidth={2} />
          <line x1={startX + 14} y1={startY + 14} x2={cx + 10} y2={y2} stroke="#ef4444" strokeWidth={1.2} opacity={0.55} />

          {/* Busur sudut θ */}
          <path d={`M ${cx - 18} ${y1} A 18 18 0 0 0 ${cx - 18 * Math.cos(thetaRad)} ${y1 - 18 * Math.sin(thetaRad)}`} fill="none" stroke="#ef4444" strokeWidth={1} />
          <text x={cx - 26} y={y1 - 8} fontSize={9} fill="#ef4444">θ</text>

          {/* Verdict glow */}
          {constructive && (
            <g>
              <circle cx={cx} cy={y1} r={5} fill={GOLD} opacity={0.9} />
              <circle cx={cx} cy={y1} r={9} fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.5} />
            </g>
          )}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div className="rounded-md bg-[var(--surface-muted)] p-2">
          <div className="text-xs text-[var(--muted)]">θ</div>
          <div className="font-mono">{theta.toFixed(2)}°</div>
        </div>
        <div className="rounded-md bg-[var(--surface-muted)] p-2">
          <div className="text-xs text-[var(--muted)]">d</div>
          <div className="font-mono">{d.toFixed(3)} Å</div>
        </div>
        <div className="rounded-md bg-[var(--surface-muted)] p-2">
          <div className="text-xs text-[var(--muted)]">2d sinθ</div>
          <div className="font-mono">{pathDiff.toFixed(3)} Å</div>
        </div>
        <div className="rounded-md bg-[var(--surface-muted)] p-2">
          <div className="text-xs text-[var(--muted)]">nλ</div>
          <div className="font-mono">{nLambda.toFixed(3)} Å</div>
        </div>
      </div>

      <div
        className={`mt-3 rounded-md px-3 py-2 text-sm font-medium ${
          constructive
            ? "bg-[var(--surface-selected)] text-[var(--primary-dark)]"
            : "border border-[var(--border)] text-[var(--muted)]"
        }`}
      >
        {constructive
          ? "✓ Konstruktif — hamburan sefase (nλ ≈ 2d sinθ), muncul puncak difraksi"
          : `Tidak sefase — selisih ${Math.abs(residual).toFixed(3)} Å dari nλ; puncak padam`}
      </div>
    </section>
  );
}

/* ── 3. Anatomi difraktogram ──────────────────────────────────────────── */

export function DiffractogramAnatomy() {
  const pattern = useMemo(() => diffractogram("standard", 99), []);
  const W = 320;
  const H = 180;
  const marginLeft = 34;
  const marginRight = 12;
  const marginTop = 20;
  const plotHeight = 122;
  const baselineY = marginTop + plotHeight; // 142
  const plotWidth = W - marginLeft - marginRight; // 274
  const yMax = 140;

  const minX = 5;
  const maxX = 80;
  const sx = (x: number) => marginLeft + ((x - minX) / (maxX - minX)) * plotWidth;

  const lineD = patternPath(pattern, marginLeft, marginTop, plotWidth, plotHeight, yMax);
  const areaD = patternAreaPath(pattern, marginLeft, marginTop, plotWidth, plotHeight, yMax);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-xs">
      <h3 className="text-base font-bold text-[var(--foreground)]">Anatomi Difraktogram</h3>
      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
        Empat informasi kunci yang diekstraksi dari difraktogram XRD (panduan slide 6).
      </p>
      <div className="mt-3 overflow-hidden rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-muted)] p-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Anatomi difraktogram standar Al-Fum">
          <defs>
            <linearGradient id="m5-anatomy-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#001f3f" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#001f3f" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Area & Line */}
          <path d={areaD} fill="url(#m5-anatomy-fill)" />
          <path d={lineD} fill="none" stroke={NAVY} strokeWidth={1.5} />

          {/* Sumbu X & Y */}
          <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={baselineY} stroke="#64748b" strokeWidth={1} />
          <line x1={marginLeft} y1={baselineY} x2={marginLeft + plotWidth} y2={baselineY} stroke="#64748b" strokeWidth={1} />

          {/* Ticks X */}
          {[10, 20, 40, 60, 80].map((t) => (
            <g key={t}>
              <line x1={sx(t)} y1={baselineY} x2={sx(t)} y2={baselineY + 3.5} stroke="#64748b" strokeWidth={1} />
              <text x={sx(t)} y={baselineY + 12} fontSize={8} fill="#475569" textAnchor="middle">
                {t}°
              </text>
            </g>
          ))}
          <text x={marginLeft + plotWidth / 2} y={170} fontSize={8.5} fill="#334155" fontWeight={600} textAnchor="middle">
            Sudut Difraksi 2θ (°)
          </text>

          {/* Anotasi 1: posisi → d & hkl */}
          <line x1={sx(10.39)} y1={28} x2={sx(10.39)} y2={54} stroke={GOLD} strokeWidth={1.2} />
          <circle cx={sx(10.39)} cy={54} r={2} fill={GOLD} />
          <text x={sx(10.39) + 4} y={24} fontSize={8} fill="#b45309" fontWeight={700}>
            ① Posisi (2θ) → d & hkl
          </text>

          {/* Anotasi 2: lebar → kristalit */}
          <line x1={sx(14.65)} y1={72} x2={sx(14.65) + 30} y2={50} stroke={GOLD} strokeWidth={1.2} />
          <circle cx={sx(14.65)} cy={72} r={2} fill={GOLD} />
          <text x={sx(14.65) + 34} y={52} fontSize={8} fill="#b45309" fontWeight={700}>
            ② Lebar (FWHM β) → Ukuran Kristalit
          </text>

          {/* Anotasi 3: luas → kristalinitas */}
          <line x1={sx(31.52)} y1={105} x2={sx(31.52)} y2={85} stroke={GOLD} strokeWidth={1.2} />
          <circle cx={sx(31.52)} cy={105} r={2} fill={GOLD} />
          <text x={sx(31.52) - 10} y={80} fontSize={8} fill="#b45309" fontWeight={700}>
            ③ Luas Puncak → % Kristalinitas
          </text>

          {/* Anotasi 4: gundukan amorf */}
          <text x={sx(55)} y={120} fontSize={8} fill="#64748b" fontStyle="italic" textAnchor="middle">
            ④ Gundukan lebar (halo) = Fasa Amorf
          </text>
        </svg>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Pola standar Al-Fum (CCDC 1051975) dari tabel panduan: 011 @ 10,39°,
        020/002/-102 @ 14,65°, 022 @ 20,87°, 033 @ 31,52°, 044 @ 42,47°, 055 @
        53,84°. d-spacing dihitung dari posisi: d = λ/(2 sinθ).
      </p>
    </section>
  );
}

export function STANDARD_D_SPACINGS(): { hkl: string; twoTheta: number; d: number }[] {
  return ALFUM_STANDARD_REFLECTIONS.map((r) => ({
    hkl: r.hkl,
    twoTheta: r.twoThetaStd,
    d: dSpacing(r.twoThetaStd),
  }));
}
