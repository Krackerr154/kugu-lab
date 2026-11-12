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
import { useMeasuredWidth } from "@/components/shared/useMeasuredWidth";

import {
  ALFUM_STANDARD_REFLECTIONS,
  ANATOMY_WINDOW_HALF_WIDTH,
  anatomyBaseline,
  anatomyCurve,
  anatomyHalo,
  anatomyPeakArea,
  dSpacing,
  diffractogram,
  disorderPattern,
  measureAnatomyPeak,
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
  const { ref: dualRef, width: dualW } = useMeasuredWidth(720);

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

      {/* Dual visual panels.
          Side by side only when each panel can hold the 320-unit chart at its
          natural size. At a landscape phone the panel column is ~478px, so a
          two-column split gave each chart ~211px and scaled every label to 6px;
          stacking keeps the drawing at 1:1 (or larger) and the reader scrolls a
          little instead of squinting. 440 is the floor: below it each chart would
          fall under ~205px and the axis labels under 8px, so a phone stacks. */}
      <div
        ref={dualRef}
        className="mt-4 grid gap-3"
        style={{ gridTemplateColumns: dualW >= 440 ? "1fr 1fr" : "1fr" }}
      >
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
                <text x={10} y={1} fontSize={9} fill="var(--text-secondary)">Kation Al</text>
                <circle cx={62} cy={-2} r={2.8} fill="#d97706" />
                <text x={68} y={1} fontSize={9} fill="var(--text-secondary)">Linker Fumarat</text>
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
                  <text x={sx(t)} y={baselineY + 13} fontSize={9.5} fill="#475569" textAnchor="middle">
                    {t}°
                  </text>
                </g>
              ))}

              {/* Ticks Y */}
              <text x={marginLeft - 4} y={sy(50) + 3} fontSize={8.5} fill="#64748b" textAnchor="end">50</text>
              <text x={marginLeft - 4} y={sy(100) + 3} fontSize={8.5} fill="#64748b" textAnchor="end">100</text>
              <text x={marginLeft - 4} y={marginTop - 3} fontSize={9} fill="#475569" fontWeight={500} textAnchor="start">
                Intensitas (a.u.)
              </text>

              {/* Judul Sumbu X */}
              <text x={marginLeft + plotWidth / 2} y={170} fontSize={9.5} fill="#334155" fontWeight={600} textAnchor="middle">
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

const BRAGG_SOURCES = [
  { value: 1.5406, label: "Cu Kα (1.5406 Å)" },
  { value: 1.54059, label: "Cu Kα1 (1.54059 Å)" },
  { value: 0.7107, label: "Mo Kα (0.7107 Å)" },
  { value: 1.7902, label: "Co Kα (1.7902 Å)" },
];

const LATTICE_PRESETS = [
  { id: "alfum-011", label: "Al-Fum (011) — d = 8,51 Å", d: 8.506 },
  { id: "alfum-020", label: "Al-Fum (020) — d = 6,04 Å", d: 6.040 },
  { id: "alfum-022", label: "Al-Fum (022) — d = 4,26 Å", d: 4.256 },
  { id: "si-111", label: "Silikon (111) — d = 3,14 Å", d: 3.135 },
  { id: "custom", label: "Kustom (Atur d manual)", d: 4.0 },
];

export function BraggDiagram() {
  const [lambda, setLambda] = useState(1.5406);
  const [presetId, setPresetId] = useState("alfum-011");
  const [customD, setCustomD] = useState(4.0);
  const [twoTheta, setTwoTheta] = useState(10.4);
  const [n, setN] = useState(1);

  const d = presetId === "custom" ? customD : (LATTICE_PRESETS.find((p) => p.id === presetId)?.d ?? 8.506);

  const theta = twoTheta / 2;
  const thetaRad = (theta * Math.PI) / 180;

  // Path difference: 2d sin(theta)
  const pathDiff = 2 * d * Math.sin(thetaRad);
  const nLambda = n * lambda;
  const pathDiffError = Math.abs(pathDiff - nLambda);

  // Constructive resonance: within 0.08 A
  const constructive = pathDiffError < 0.08;

  // Theoretical exact Bragg angle for this d, lambda, n
  const sinBragg = (n * lambda) / (2 * d);
  const braggAngle = sinBragg <= 1 ? (Math.asin(sinBragg) * 180 / Math.PI) * 2 : null;

  const jumpToBragg = () => {
    if (braggAngle !== null) {
      setTwoTheta(Math.round(braggAngle * 10) / 10);
    }
  };

  // Dimensions — drawn at 1 unit = 1 CSS pixel of the measured frame.
  //
  // The design was authored on a 600-unit grid (reflection point at x=280,
  // detector at x=495, 220-unit rays). Rendering that viewBox into a 330px
  // panel scaled every label by 0.55, which put the θ labels and the ΔL badge
  // at 4.7px — the geometry was there but unreadable. Below 520px the anchors
  // are recomputed as fractions of the real width instead, so the drawing
  // compresses rather than shrinks.
  const { ref: measureRef, width } = useMeasuredWidth(560);
  // Measured on the frame itself, so this is already the SVG's CSS width: the
  // drawing keeps 1 unit = 1 px at every size instead of being shrunk by a
  // viewBox scale (which is what made the θ labels 4.7px on a phone).
  const W = Math.max(300, Math.round(width) || 560);
  // 620, not 520: a two-column slide gives this card ~600px, and at that width
  // the tall variant (260 units) pushed the slide 45px past the slide body. The
  // compact layout is 28 units shorter and sets its type 15% larger, so it is
  // the better read at 600px too — the full layout only earns its extra height
  // on a wide solo card.
  const compact = W < 620;
  const H = compact ? 232 : 260;
  const fs = (n: number) => (compact ? Math.round(n * 1.15 * 10) / 10 : n);

  // Lattice geometry
  const y1 = compact ? 96 : 110;
  const gap = Math.max(compact ? 34 : 48, Math.min(84, d * 8.5));
  const y2 = y1 + gap;
  const y3 = Math.min(H - 20, y2 + gap * 0.7);
  const x0 = Math.round(W * (compact ? 0.46 : 0.467)); // 280 at 600

  // Visual angle clamped between 8 and 22 degrees for clean ray and detector alignment
  const visualTheta = Math.max(8, Math.min(22, theta));
  const vRad = (visualTheta * Math.PI) / 180;
  const cosT = Math.cos(vRad);
  const sinT = Math.sin(vRad);
  const tanT = Math.tan(vRad);
  const L = compact ? Math.round(W * 0.34) : 220;

  // Detector position and dimensions
  const detW = compact ? 58 : 75;
  const det_x = compact ? W - detW - 4 : 495;
  const dx = det_x - x0;
  const dy = dx * tanT;
  const det_h = gap + (compact ? 26 : 34);
  const det_center = ((y1 - dy) + (y2 - dy)) / 2;
  const det_top = Math.max(12, Math.min(130, det_center - det_h / 2));

  // Rays
  const r1_in = { x1: x0 - L * cosT, y1: y1 - L * sinT, x2: x0, y2: y1 };
  const r1_out = { x1: x0, y1: y1, x2: det_x, y2: y1 - dy };

  const r2_in = { x1: x0 - L * cosT, y1: y2 - L * sinT, x2: x0, y2: y2 };
  const r2_out = { x1: x0, y1: y2, x2: det_x, y2: y2 - dy };

  // Perpendicular projection points
  const p1 = { x: x0 - gap * sinT * cosT, y: y2 - gap * sinT * sinT };
  const p2 = { x: x0 + gap * sinT * cosT, y: y2 - gap * sinT * sinT };

  // Atoms per row: seven evenly spaced columns that stop short of the detector
  // housing, so the last atom never hides behind it on a narrow canvas.
  const atomLo = Math.round(W * 0.1);
  const atomHi = Math.max(atomLo + 6, det_x - (compact ? 26 : 35));
  const ATOM_XS = Array.from({ length: 7 }, (_, i) =>
    Math.round(atomLo + ((atomHi - atomLo) * i) / 6)
  );

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-base font-bold text-[var(--foreground)]">Sandbox Hukum Bragg</h3>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Interferensi berkas sinar-X pada dua bidang kisi kristal: nλ = 2d sinθ.
          </p>
        </div>
        {braggAngle !== null && (
          <button
            type="button"
            onClick={jumpToBragg}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 transition-colors"
          >
            <span>🎯</span>
            <span>Lompat ke 2θ Bragg ({braggAngle.toFixed(2)}°)</span>
          </button>
        )}
      </div>

      {/* Control bar */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="m5-bragg-preset" className="text-xs font-semibold text-[var(--foreground)]">
            Bidang Kisi Kristal (d)
          </label>
          <select
            id="m5-bragg-preset"
            value={presetId}
            onChange={(e) => {
              const pid = e.target.value;
              setPresetId(pid);
              const p = LATTICE_PRESETS.find((x) => x.id === pid);
              if (p && p.id !== "custom") {
                const s = (n * lambda) / (2 * p.d);
                if (s <= 1) {
                  setTwoTheta(Math.round(Math.asin(s) * 360 / Math.PI * 10) / 10);
                }
              }
            }}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-white p-2 text-xs font-medium"
          >
            {LATTICE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="m5-bragg-source" className="text-xs font-semibold text-[var(--foreground)]">
            Sumber Sinar-X (λ, Å)
          </label>
          <select
            id="m5-bragg-source"
            value={lambda}
            onChange={(e) => setLambda(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-white p-2 text-xs font-medium"
          >
            {BRAGG_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--foreground)]">
            Orde Difraksi (n)
          </label>
          <div className="mt-1 flex gap-1.5">
            {[1, 2].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setN(val)}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                  n === val
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "border border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                n = {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {presetId === "custom" && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
          <span className="text-xs font-semibold text-[var(--foreground)]">Jarak antarbidang d:</span>
          <input
            type="range"
            min={1.5}
            max={10.0}
            step={0.05}
            value={customD}
            onChange={(e) => setCustomD(Number(e.target.value))}
            className="h-2 flex-1 cursor-pointer accent-[var(--primary)]"
          />
          <span className="font-mono text-xs font-bold text-[var(--primary-dark)]">{customD.toFixed(2)} Å</span>
        </div>
      )}

      {/* Slider Sudut 2θ */}
      <div className="mt-3.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--foreground)]">
            Sudut Difraksi (2θ): <span className="font-mono font-bold text-[var(--primary-dark)]">{twoTheta.toFixed(2)}°</span>
            <span className="ml-2 font-normal text-[var(--text-secondary)]">(θ = {theta.toFixed(2)}°)</span>
          </span>
          {constructive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              PUNCAK AKTIF
            </span>
          ) : (
            <span className="text-[11px] text-[var(--text-secondary)]">Off-resonance</span>
          )}
        </div>
        <input
          type="range"
          min={5.0}
          max={90.0}
          step={0.1}
          value={twoTheta}
          onChange={(e) => setTwoTheta(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--surface-container-high)] accent-[var(--primary)]"
        />
        <div className="flex justify-between text-[10px] text-[var(--muted)]">
          <span>5°</span>
          <span>30°</span>
          <span>60°</span>
          <span>90°</span>
        </div>
      </div>

      {/* Diagram SVG */}
      <div ref={measureRef} className="mt-3.5 overflow-hidden rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-muted)] p-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Geometri dan interferensi Hukum Bragg">
          <defs>
            <marker id="bragg-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
            </marker>
            <marker id="bragg-gold" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#f59e0b" />
            </marker>
            <marker id="bragg-slate" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#64748b" />
            </marker>
            <filter id="bragg-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Bidang kristal (garis putus-putus) */}
          <line x1={30} y1={y1} x2={570} y2={y1} stroke="#94a3b8" strokeDasharray="5,4" strokeWidth={1} />
          <line x1={30} y1={y2} x2={570} y2={y2} stroke="#94a3b8" strokeDasharray="5,4" strokeWidth={1} />
          {y3 < H && <line x1={30} y1={y3} x2={570} y2={y3} stroke="#cbd5e1" strokeDasharray="4,4" strokeWidth={0.8} opacity={0.6} />}

          {/* Label bidang */}
          <text x={34} y={y1 - 6} fontSize={fs(8)} fill="#64748b" fontWeight={600}>Bidang 1</text>
          <text x={34} y={y2 - 6} fontSize={fs(8)} fill="#64748b" fontWeight={600}>Bidang 2</text>

          {/* Jarak antarbidang d (dimensi vertikal kiri) */}
          <line x1={55} y1={y1} x2={55} y2={y2} stroke="#2563eb" strokeWidth={1.5} />
          <line x1={50} y1={y1} x2={60} y2={y1} stroke="#2563eb" strokeWidth={1.5} />
          <line x1={50} y1={y2} x2={60} y2={y2} stroke="#2563eb" strokeWidth={1.5} />
          <text x={64} y={(y1 + y2) / 2 + 3} fontSize={fs(8.5)} fill="#1d4ed8" fontWeight={700}>
            d = {d.toFixed(2)} Å
          </text>

          {/* Atom-atom di bidang 1, 2, 3 */}
          {ATOM_XS.map((x, idx) => (
            <g key={x}>
              <circle cx={x} cy={y1} r={5.2} fill={idx % 2 === 0 ? "#001f3f" : "#d97706"} stroke="#fff" strokeWidth={1.2} />
              <circle cx={x} cy={y2} r={5.2} fill={idx % 2 === 0 ? "#001f3f" : "#d97706"} stroke="#fff" strokeWidth={1.2} />
              {y3 < H && <circle cx={x} cy={y3} r={4.5} fill={idx % 2 === 0 ? "#001f3f" : "#d97706"} stroke="#fff" strokeWidth={1} opacity={0.5} />}
            </g>
          ))}

          {/* ── Berkas 1 (Menghambur di Atom 1 @ x0, y1) ── */}
          {/* Datang */}
          <line x1={r1_in.x1} y1={r1_in.y1} x2={r1_in.x2} y2={r1_in.y2} stroke="#ef4444" strokeWidth={2} markerEnd="url(#bragg-red)" />
          {/* Pantul (Ke atas menuju detektor) */}
          <line
            x1={r1_out.x1}
            y1={r1_out.y1}
            x2={r1_out.x2}
            y2={r1_out.y2}
            stroke={constructive ? "#f59e0b" : "#64748b"}
            strokeWidth={constructive ? 2.8 : 1.2}
            strokeDasharray={constructive ? "none" : "4,3"}
            opacity={constructive ? 1 : 0.45}
            filter={constructive ? "url(#bragg-glow)" : undefined}
            markerEnd={constructive ? "url(#bragg-gold)" : "url(#bragg-slate)"}
          />

          {/* ── Berkas 2 (Menembus dan Menghambur di Atom 2 @ x0, y2) ── */}
          {/* Datang */}
          <line x1={r2_in.x1} y1={r2_in.y1} x2={r2_in.x2} y2={r2_in.y2} stroke="#ef4444" strokeWidth={2} markerEnd="url(#bragg-red)" />
          {/* Pantul (Ke atas paralel berkas 1) */}
          <line
            x1={r2_out.x1}
            y1={r2_out.y1}
            x2={r2_out.x2}
            y2={r2_out.y2}
            stroke={constructive ? "#f59e0b" : "#64748b"}
            strokeWidth={constructive ? 2.8 : 1.2}
            strokeDasharray={constructive ? "none" : "4,3"}
            opacity={constructive ? 1 : 0.45}
            filter={constructive ? "url(#bragg-glow)" : undefined}
            markerEnd={constructive ? "url(#bragg-gold)" : "url(#bragg-slate)"}
          />

          {/* ── Geometri Beda Lintasan 2d sinθ ── */}
          {/* Garis tegak lurus dari Atom 1 ke Berkas 2 (datang & pantul) */}
          <line x1={x0} y1={y1} x2={p1.x} y2={p1.y} stroke="#f59e0b" strokeWidth={1.2} strokeDasharray="3,3" />
          <line x1={x0} y1={y1} x2={p2.x} y2={p2.y} stroke="#f59e0b" strokeWidth={1.2} strokeDasharray="3,3" />

          {/* Ruas lintasan ekstra (Segmen P1 -> Atom 2 -> P2) */}
          <path d={`M ${p1.x} ${p1.y} L ${x0} ${y2} L ${p2.x} ${p2.y}`} fill="none" stroke="#d97706" strokeWidth={3.5} strokeLinejoin="round" />

          {/* Badge Beda Lintasan ΔL = 2d sinθ di bawah bidang 2 */}
          <g transform={`translate(${x0}, ${y2 + 22})`}>
            <rect x={-52} y={-10} width={104} height={20} rx={4} fill="#ffffff" stroke="#d97706" strokeWidth={1.2} />
            <text x={0} y={3.5} fontSize={fs(8.5)} fill="#b45309" fontWeight={700} textAnchor="middle">
              ΔL = 2d sinθ
            </text>
          </g>
          <line x1={x0 - 18} y1={y2 + 12} x2={(p1.x + x0) / 2} y2={y2 + 2} stroke="#d97706" strokeWidth={1} />
          <line x1={x0 + 18} y1={y2 + 12} x2={(p2.x + x0) / 2} y2={y2 + 2} stroke="#d97706" strokeWidth={1} />

          {/* Sudut serang θ di Atom 1 */}
          <path d={`M ${x0 - 24} ${y1} A 24 24 0 0 0 ${x0 - 24 * cosT} ${y1 - 24 * sinT}`} fill="none" stroke="#ef4444" strokeWidth={1.2} />
          <text x={x0 - 34} y={y1 - 6} fontSize={fs(8.5)} fill="#dc2626" fontWeight={700}>θ</text>

          {/* Sudut pantul θ di Atom 1 */}
          <path d={`M ${x0 + 24} ${y1} A 24 24 0 0 1 ${x0 + 24 * cosT} ${y1 - 24 * sinT}`} fill="none" stroke={constructive ? "#f59e0b" : "#64748b"} strokeWidth={1.2} />
          <text x={x0 + 28} y={y1 - 6} fontSize={fs(8.5)} fill={constructive ? "#d97706" : "#64748b"} fontWeight={700}>θ</text>

          {/* Atom 1 & Atom 2 active centers */}
          <circle cx={x0} cy={y1} r={6.5} fill="#001f3f" stroke="#fff" strokeWidth={1.5} />
          <circle cx={x0} cy={y2} r={6.5} fill="#001f3f" stroke="#fff" strokeWidth={1.5} />
          {constructive && (
            <g>
              <circle cx={x0} cy={y1} r={14} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.7} />
              <circle cx={x0} cy={y2} r={14} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.7} />
            </g>
          )}

          {/* Detektor X-ray di kanan — berotasi tegak lurus langsung menyambut berkas pantul */}
          <g transform={`translate(${det_x}, ${det_center}) rotate(${-visualTheta}) translate(0, ${-det_h / 2})`}>
            <rect x={0} y={0} width={detW} height={det_h} rx={6} fill="#0f172a" stroke="#334155" strokeWidth={1.5} />
            {/* Sensor aperture slit */}
            <line x1={0} y1={14} x2={0} y2={det_h - 14} stroke={constructive ? "#22c55e" : "#475569"} strokeWidth={2.5} />
            <text x={detW / 2} y={15} fontSize={fs(7.5)} fill="#94a3b8" fontWeight={700} textAnchor="middle">DETEKTOR</text>
            <rect x={(detW - detW * 0.68) / 2} y={23} width={detW * 0.68} height={24} rx={3} fill="#020617" />
            <text
              x={detW / 2}
              y={39}
              fontSize={fs(9)}
              fontWeight={800}
              fill={constructive ? "#22c55e" : "#64748b"}
              textAnchor="middle"
            >
              {constructive ? "100%" : "0%"}
            </text>
            <text x={detW / 2} y={58} fontSize={fs(7.5)} fontWeight={700} fill={constructive ? "#4ade80" : "#64748b"} textAnchor="middle">
              {constructive ? "PUNCAK" : "PADAM"}
            </text>
          </g>
        </svg>
      </div>

      {/* Live Math / Physics Results Cards */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-container-low)] p-2.5 shadow-2xs">
          <div className="text-[11px] text-[var(--text-secondary)]">Sudut Bragg (θ)</div>
          <div className="mt-1 font-mono text-sm font-bold text-[var(--foreground)]">{theta.toFixed(2)}°</div>
          <div className="text-[10px] text-[var(--muted)]">2θ = {twoTheta.toFixed(2)}°</div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-container-low)] p-2.5 shadow-2xs">
          <div className="text-[11px] text-[var(--text-secondary)]">Beda Lintasan (2d sinθ)</div>
          <div className="mt-1 font-mono text-sm font-bold text-amber-700">{pathDiff.toFixed(3)} Å</div>
          <div className="text-[10px] text-[var(--muted)]">Lintasan ekstra berkas 2</div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-container-low)] p-2.5 shadow-2xs">
          <div className="text-[11px] text-[var(--text-secondary)]">Syarat Sefase (nλ)</div>
          <div className="mt-1 font-mono text-sm font-bold text-[var(--primary-dark)]">{nLambda.toFixed(3)} Å</div>
          <div className="text-[10px] text-[var(--muted)]">{n} × {lambda.toFixed(4)} Å</div>
        </div>

        <div className={`rounded-xl border p-2.5 shadow-2xs ${
          constructive
            ? "border-emerald-300 bg-emerald-50 text-emerald-950"
            : "border-[var(--border)] bg-[var(--surface-container-low)] text-[var(--muted)]"
        }`}>
          <div className="text-[11px] font-semibold">Status Interferensi</div>
          <div className="mt-1 font-mono text-sm font-bold">
            {constructive ? "✓ Sefase (Konstruktif)" : "✕ Destruktif"}
          </div>
          <div className="text-[10px]">
            {constructive
              ? "Puncak difraksi muncul!"
              : `Selisih: ${pathDiffError.toFixed(3)} Å`}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
        <strong>Fisika di balik Hukum Bragg:</strong> Berkas kedua menembus kristal dan menempuh jarak ekstra sebesar <strong>2d sinθ</strong> (ruas kuning tebal). Hanya ketika beda lintasan ini persis sama dengan kelipatan bulat panjang gelombang (<strong>nλ</strong>), kedua sinar pantul bertemu puncak-dengan-puncak (sefase) dan saling menguatkan ke arah detektor.
      </div>
    </section>
  );
}

/* ── 3. Anatomi difraktogram ──────────────────────────────────────────── */

export function DiffractogramAnatomy() {
  // ── Canvas ───────────────────────────────────────────────────────────────
  // Drawn at 1 SVG unit = 1 CSS pixel of the measured container, not through a
  // fixed 900-unit viewBox. On a 390px phone the fixed viewBox scaled every
  // label by 0.37, which rendered the 9px ticks at 3.3px — legible on desktop,
  // invisible on the phone the students actually carry. Measuring keeps type
  // and the axis gutters at their real size at every width; below 560px the
  // layout switches to a compact variant (shorter plot, no magnifier inset,
  // slimmer gutters) because there is no longer room for the inset to sit in
  // empty space beside the curve.
  const { ref: measureRef, width } = useMeasuredWidth(860);
  // The measured element is the chart frame itself (not the card around it), so
  // `width` is the SVG's own CSS width. Drawing the viewBox at exactly that
  // width makes 1 SVG unit = 1 CSS pixel and keeps the authored font sizes.
  const W = Math.max(300, Math.round(width) || 860);
  const compact = W < 620;
  const H = compact ? 292 : 420;
  const marginLeft = compact ? 34 : 46;
  const marginRight = compact ? 8 : 16;
  const marginTop = compact ? 10 : 14;
  const plotHeight = compact ? H - marginTop - 48 : H - marginTop - 70;
  const baselineY = marginTop + plotHeight;
  const plotWidth = W - marginLeft - marginRight;
  const minX = 5;
  const maxX = 80;
  const yMax = 112;
  // The magnifier only earns its space when there is empty plot beside the
  // curve to park it in; below that width it would cover reflections.
  const showInset = W >= 700;
  // Compact needs slightly larger type because the same 9px that reads fine in
  // a 900-unit figure sits next to far less ink in a 330-unit one.
  const fs = (n: number) => (compact ? Math.round(n * 1.25 * 10) / 10 : n);

  const sx = (x: number) => marginLeft + ((x - minX) / (maxX - minX)) * plotWidth;
  const sy = (y: number) => baselineY - (Math.min(y, yMax) / yMax) * plotHeight;

  // Both annotations are measured from the SAME curve that gets drawn.
  const fwhmPeak = useMemo(() => measureAnatomyPeak(ALFUM_STANDARD_REFLECTIONS[0]), []);
  const areaPeak = useMemo(() => measureAnatomyPeak(ALFUM_STANDARD_REFLECTIONS[3]), []);
  // Quoted in a.u.·° (degrees × intensity), the unit an integrated XRD peak
  // area is normally reported in — not an hkl index, and not pixels.
  const anatomyAreaValue = useMemo(
    () =>
      anatomyPeakArea(
        areaPeak.apexTwoTheta - ANATOMY_WINDOW_HALF_WIDTH,
        areaPeak.apexTwoTheta + ANATOMY_WINDOW_HALF_WIDTH
      ),
    [areaPeak]
  );

  const { pattern, peakArea, peakAreaTop, haloArea, haloTop, fwhmInset } = useMemo(() => {
    const rnd = seededRandom(20261108);
    const pts: { x: number; y: number }[] = [];
    for (let x = minX; x <= maxX + 1e-9; x += 0.05) {
      const y = anatomyCurve(x) + (rnd() - 0.5) * 1.6;
      pts.push({ x: Math.round(x * 100) / 100, y });
    }

    // ④ Halo amorf: genapkan dari fungsi halonya sendiri di seluruh rentang
    // plot, bukan potongan array terpisah. Bentuknya harus gundukan mulus
    // (naik-turun simetris di sekitar 22°), bukan baji yang menurun lurus.
    const haloStep = 0.1;
    const haloPts: { x: number; y: number }[] = [];
    for (let x = minX; x <= maxX + 1e-9; x += haloStep) {
      haloPts.push({ x, y: anatomyBaseline(x) });
    }

    // ③ Luas puncak: between the curve and its LOCAL background inside the
    // measurement window only — never down to y = 0, never over the halo.
    const aLo = areaPeak.apexTwoTheta - ANATOMY_WINDOW_HALF_WIDTH;
    const aHi = areaPeak.apexTwoTheta + ANATOMY_WINDOW_HALF_WIDTH;
    const areaPts = pts.filter((p) => p.x >= aLo && p.x <= aHi);
    const peakAreaD =
      areaPts
        .map(
          (p, i) =>
            `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(Math.max(p.y, anatomyBaseline(p.x))).toFixed(1)}`
        )
        .join(" ") +
      " " +
      [...areaPts]
        .reverse()
        .map((p) => `L${sx(p.x).toFixed(1)},${sy(anatomyBaseline(p.x)).toFixed(1)}`)
        .join(" ") +
      " Z";

    const zoomLo = fwhmPeak.apexTwoTheta - 1.2;
    const zoomHi = fwhmPeak.apexTwoTheta + 1.2;
    const insetPts: { x: number; y: number }[] = [];
    for (let x = zoomLo; x <= zoomHi + 1e-9; x += 0.01) {
      insetPts.push({ x, y: anatomyCurve(x) });
    }

    const peakAreaTop =
      areaPts
        .map(
          (p, i) =>
            `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(Math.max(p.y, anatomyBaseline(p.x))).toFixed(1)}`
        )
        .join(" ");

    const haloTop =
      haloPts
        .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
        .join(" ");

    return {
      pattern: pts,
      peakArea: peakAreaD,
      haloArea:
        haloPts
          .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
          .join(" ") +
        ` L${sx(haloPts[haloPts.length - 1].x).toFixed(1)},${baselineY} L${sx(haloPts[0].x).toFixed(1)},${baselineY} Z`,
      peakAreaTop,
      haloTop,
      fwhmInset: { zoomLo, zoomHi, pts: insetPts },
    };
  }, [sx, sy, baselineY, fwhmPeak, areaPeak]);

  const lineD = patternPath(pattern, marginLeft, marginTop, plotWidth, plotHeight, yMax);

  // ── Magnifier inset: parked in the empty 56–79° region, vertically centred
  // on the flat baseline. Verified against the data: nothing but noise lives
  // above 30 a.u. past 56°, so this box hides no peak.
  const IN = { x: sx(56), y: sy(40), w: sx(79) - sx(56), h: sy(8) - sy(40) };
  const inPad = { l: 30, r: 12, t: 24, b: 18 };
  const inW = IN.w - inPad.l - inPad.r;
  const inH = IN.h - inPad.t - inPad.b;
  const inMinY = Math.min(...fwhmInset.pts.map((p) => p.y)) - 2;
  const inMaxY = Math.max(...fwhmInset.pts.map((p) => p.y)) + 2;
  const ix = (x: number) =>
    IN.x + inPad.l + ((x - fwhmInset.zoomLo) / (fwhmInset.zoomHi - fwhmInset.zoomLo)) * inW;
  const iy = (y: number) =>
    IN.y + inPad.t + inH - ((y - inMinY) / (inMaxY - inMinY)) * inH;
  const insetLineD = fwhmInset.pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${ix(p.x).toFixed(1)},${iy(p.y).toFixed(1)}`)
    .join(" ");

  const TICKS_X = [10, 20, 30, 40, 50, 60, 70, 80];
  const Y_TICKS = [25, 50, 75, 100];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-xs">
      <div className="border-b border-[var(--border)] pb-3">
        <h3 className="text-base font-bold text-[var(--foreground)]">Anatomi Difraktogram</h3>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
          Empat informasi kunci yang diekstraksi dari difraktogram XRD (panduan praktikum slide 6).
        </p>
      </div>

      <div ref={measureRef} className="mt-3 overflow-hidden rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-muted)]">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Anatomi difraktogram standar Al-Fum">
          <defs>
            <linearGradient id="m5-anatomy-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#001f3f" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#001f3f" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="m5-halo-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#9333ea" stopOpacity="0.02" />
            </linearGradient>
            <marker id="arrow-gold" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#b45309" />
            </marker>
            <marker id="arrow-purple" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#9333ea" />
            </marker>
          </defs>

          {/* ── Plot chrome ── */}
          {Y_TICKS.map((v) => (
            <line
              key={v}
              x1={marginLeft}
              y1={sy(v)}
              x2={marginLeft + plotWidth}
              y2={sy(v)}
              stroke={v === 50 || v === 100 ? "#cbd5e1" : "#e2e8f0"}
              strokeDasharray="3,4"
              strokeWidth={0.8}
            />
          ))}

          {/* ── ④ Amorphous halo: gundukan mulus dari fungsinya sendiri ──
              Digambar lebih dulu supaya puncak kristalin dan area puncak
              tetap terbaca di atasnya. Garis atasnya solid (bukan putus) agar
              bentuk gundukannya jelas tidak tertukar dengan kurva data. */}
          <path d={haloArea} fill="url(#m5-halo-fill)" />
          <path d={haloTop} fill="none" stroke="#9333ea" strokeWidth={1.4} strokeLinejoin="round" opacity={0.75} />

          {/* ── ③ Luas puncak: kurva dikurangi latar lokalnya sendiri ── */}
          <path d={peakArea} fill="rgba(217, 119, 6, 0.38)" stroke="#d97706" strokeWidth={1.4} strokeLinejoin="round" />
          <path d={peakAreaTop} fill="none" stroke="#b45309" strokeWidth={1.6} strokeLinejoin="round" />

          {/* ── The trace ── */}
          <path d={lineD} fill="none" stroke={NAVY} strokeWidth={1.7} strokeLinejoin="round" />

          {/* ── Axes ── */}
          <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={baselineY} stroke="#64748b" strokeWidth={1.2} />
          <line x1={marginLeft} y1={baselineY} x2={marginLeft + plotWidth} y2={baselineY} stroke="#64748b" strokeWidth={1.2} />

          {TICKS_X.map((t) => (
            <g key={t}>
              <line x1={sx(t)} y1={baselineY} x2={sx(t)} y2={baselineY + 4} stroke="#64748b" strokeWidth={1} />
              <text x={sx(t)} y={baselineY + 15} fontSize={fs(9)} fill="#475569" textAnchor="middle">
                {t}°
              </text>
            </g>
          ))}
          <text x={marginLeft + plotWidth / 2} y={baselineY + 31} fontSize={fs(9.5)} fill="#334155" fontWeight={700} textAnchor="middle">
            Sudut Difraksi 2θ (°)
          </text>

          {Y_TICKS.map((v) => (
            <text key={v} x={marginLeft - 6} y={sy(v) + 3} fontSize={fs(8)} fill="#64748b" textAnchor="end">
              {v}
            </text>
          ))}
          <text
            x={-(marginTop + plotHeight / 2)}
            y={11}
            transform="rotate(-90)"
            fontSize={fs(9.5)}
            fill="#334155"
            fontWeight={600}
            textAnchor="middle"
          >
            Intensitas (a.u.)
          </text>

          {/* ══ ① Posisi puncak 2θ ══════════════════════════════════════════
              Drop line from the measured apex down to the axis. The marker
              numbers are drawn in the legend strip below, not over the data. */}
          <line
            x1={sx(fwhmPeak.apexTwoTheta)}
            y1={sy(fwhmPeak.apexY)}
            x2={sx(fwhmPeak.apexTwoTheta)}
            y2={baselineY}
            stroke="#b45309"
            strokeWidth={1.1}
            strokeDasharray="4,3"
            opacity={0.9}
          />
          <circle cx={sx(fwhmPeak.apexTwoTheta)} cy={sy(fwhmPeak.apexY)} r={3.2} fill="#b45309" />
          <circle cx={sx(fwhmPeak.apexTwoTheta)} cy={baselineY} r={2.6} fill="#b45309" />
          <text
            x={sx(fwhmPeak.apexTwoTheta)}
            y={sy(fwhmPeak.apexY) - 8}
            fontSize={fs(8.5)}
            fill="#92400e"
            fontWeight={800}
            textAnchor="middle"
          >
            10,39°
          </text>

          {/* ══ ③ Luas puncak ═══════════════════════════════════════════════
              Short callout sitting in the empty band above the 033 peak. */}
          <line
            x1={sx(areaPeak.apexTwoTheta)}
            y1={sy(areaPeak.apexY) - 34}
            x2={sx(areaPeak.apexTwoTheta)}
            y2={sy(areaPeak.apexY) - 6}
            stroke="#b45309"
            strokeWidth={1.1}
            markerEnd="url(#arrow-gold)"
          />
          <text
            x={sx(areaPeak.apexTwoTheta)}
            y={sy(areaPeak.apexY) - 40}
            fontSize={fs(8.5)}
            fill="#92400e"
            fontWeight={800}
            textAnchor="middle"
          >
            luas puncak
            <tspan x={sx(areaPeak.apexTwoTheta)} dy={10} fontSize={fs(8.5)} fontWeight={700}>
              A = {anatomyAreaValue.toFixed(1)} a.u.·°
            </tspan>
          </text>

          {/* ══ ④ Halo amorf ════════════════════════════════════════════════
              The arrow lands on the halo's own curve at its crest region, so
              the pointer touches ink that really exists. */}
          <path
            d={`M ${sx(40)} ${sy(38)} C ${sx(36)} ${sy(32)}, ${sx(31)} ${sy(anatomyHalo(31) + 9)}, ${sx(26)} ${sy(anatomyHalo(26) - 1)}`}
            fill="none"
            stroke="#9333ea"
            strokeWidth={1.3}
            markerEnd="url(#arrow-purple)"
          />
          <text x={sx(40)} y={sy(38) - 5} fontSize={fs(8.5)} fill="#6b21a8" fontWeight={800}>
            halo
          </text>

          {/* ══ ② Lebar puncak β — magnifier ═══════════════════════════════
              β is 0,55° ≈ 6 px on the main axis, so it is measured in a zoom
              window. The window sits over the empty 56–79° stretch. */}
          {showInset && (
          <g>
            <line
              x1={sx(fwhmPeak.apexTwoTheta) - 6}
              y1={sy(fwhmPeak.halfMaxY)}
              x2={IN.x}
              y2={IN.y + IN.h}
              stroke="#b45309"
              strokeWidth={0.8}
              strokeDasharray="2,3"
              opacity={0.55}
            />
            <line
              x1={sx(fwhmPeak.apexTwoTheta) + 6}
              y1={sy(fwhmPeak.halfMaxY)}
              x2={IN.x}
              y2={IN.y}
              stroke="#b45309"
              strokeWidth={0.8}
              strokeDasharray="2,3"
              opacity={0.55}
            />

            <rect x={IN.x} y={IN.y} width={IN.w} height={IN.h} rx={5} fill="#ffffff" stroke="#b45309" strokeWidth={1.3} />
            <text x={IN.x + 7} y={IN.y + 13} fontSize={fs(10)} fill="#92400e" fontWeight={800}>
              LEBIH DEKAT · β
            </text>

            {/* Background and half-maximum levels */}
            <line
              x1={ix(fwhmInset.zoomLo)}
              y1={iy(fwhmPeak.baselineY)}
              x2={ix(fwhmInset.zoomHi)}
              y2={iy(fwhmPeak.baselineY)}
              stroke="#94a3b8"
              strokeDasharray="3,3"
              strokeWidth={0.8}
            />
            <line
              x1={ix(fwhmInset.zoomLo)}
              y1={iy(fwhmPeak.halfMaxY)}
              x2={ix(fwhmInset.zoomHi)}
              y2={iy(fwhmPeak.halfMaxY)}
              stroke="#b45309"
              strokeDasharray="4,3"
              strokeWidth={1}
            />
            <text x={IN.x + 5} y={iy(fwhmPeak.halfMaxY) - 2} fontSize={fs(9)} fill="#b45309" fontWeight={700}>
              ½I
            </text>

            <path d={insetLineD} fill="none" stroke={NAVY} strokeWidth={1.7} strokeLinejoin="round" />

            {/* β bracket at the half-maximum level */}
            <line
              x1={ix(fwhmPeak.leftTwoTheta)}
              y1={iy(fwhmPeak.halfMaxY)}
              x2={ix(fwhmPeak.rightTwoTheta)}
              y2={iy(fwhmPeak.halfMaxY)}
              stroke="#b45309"
              strokeWidth={3}
            />
            <line
              x1={ix(fwhmPeak.leftTwoTheta)}
              y1={iy(fwhmPeak.halfMaxY) - 5}
              x2={ix(fwhmPeak.leftTwoTheta)}
              y2={iy(fwhmPeak.halfMaxY) + 5}
              stroke="#b45309"
              strokeWidth={1.4}
            />
            <line
              x1={ix(fwhmPeak.rightTwoTheta)}
              y1={iy(fwhmPeak.halfMaxY) - 5}
              x2={ix(fwhmPeak.rightTwoTheta)}
              y2={iy(fwhmPeak.halfMaxY) + 5}
              stroke="#b45309"
              strokeWidth={1.4}
            />
            <text
              x={(ix(fwhmPeak.leftTwoTheta) + ix(fwhmPeak.rightTwoTheta)) / 2}
              y={iy(fwhmPeak.halfMaxY) + 14}
              fontSize={fs(9)}
              fill="#92400e"
              fontWeight={800}
              textAnchor="middle"
            >
              β
            </text>

            {/* Apex stem */}
            <line
              x1={ix(fwhmPeak.apexTwoTheta)}
              y1={iy(fwhmPeak.apexY)}
              x2={ix(fwhmPeak.apexTwoTheta)}
              y2={iy(fwhmPeak.halfMaxY)}
              stroke="#b45309"
              strokeWidth={0.8}
              strokeDasharray="2,2"
              opacity={0.7}
            />

            <text
              x={IN.x + IN.w / 2}
              y={IN.y + IN.h - 5}
              fontSize={fs(9.5)}
              fill="#92400e"
              fontWeight={700}
              textAnchor="middle"
            >
              β = {fwhmPeak.fwhmDeg.toFixed(2)}° (2θ)
            </text>
          </g>
          )}
        </svg>
      </div>

      {/* ── Numbered legend strip: where ①②③④ actually live ── */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { n: 1, label: "Posisi puncak", detail: `2θ = 10,39°`, tone: "amber" },
          { n: 2, label: "Lebar puncak β", detail: `FWHM = ${fwhmPeak.fwhmDeg.toFixed(2)}°`, tone: "amber" },
          { n: 3, label: "Luas puncak", detail: "area di atas latar", tone: "amber" },
          { n: 4, label: "Halo amorf", detail: "hamburan difus", tone: "purple" },
        ].map((k) => (
          <div
            key={k.n}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${
              k.tone === "amber" ? "border-amber-200 bg-amber-50/60" : "border-purple-200 bg-purple-50/60"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                k.tone === "amber" ? "bg-amber-700" : "bg-purple-700"
              }`}
            >
              {k.n}
            </span>
            <span className="min-w-0">
              <span className={`block text-[11px] font-bold leading-tight ${k.tone === "amber" ? "text-amber-900" : "text-purple-900"}`}>
                {k.label}
              </span>
              <span className="block font-mono text-[10px] leading-tight text-[var(--text-secondary)]">{k.detail}</span>
            </span>
          </div>
        ))}
      </div>

      {/* 4-Card Pedagogical Summary */}
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-container-low)] p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold">1</span>
            <span>Posisi Puncak (2θ)</span>
          </div>
          <div className="mt-1 font-mono text-[11px] font-semibold text-[var(--primary-dark)]">
            2θ → d = λ / (2 sinθ)
          </div>
          <p className="mt-1.5 text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Sudut pantul menentukan jarak antarbidang kisi atom (d). Dicocokkan dengan basis data kristal (ICDD/CIF) untuk identifikasi fasa dan indeks Miller (hkl).
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-container-low)] p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold">2</span>
            <span>Lebar Puncak (FWHM β)</span>
          </div>
          <div className="mt-1 font-mono text-[11px] font-semibold text-[var(--primary-dark)]">
            D = Kλ / (β cosθ)
          </div>
          <p className="mt-1.5 text-[11px] text-[var(--text-secondary)] leading-relaxed">
            β diukur pada setengah tinggi puncak <strong>di atas latar lokal</strong> — bukan setengah nilai mentah. Berbanding terbalik dengan ukuran kristalit (Scherrer).
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-container-low)] p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold">3</span>
            <span>Luas Puncak (Area)</span>
          </div>
          <div className="mt-1 font-mono text-[11px] font-semibold text-[var(--primary-dark)]">
            % = (Σ A_kristal / A_total) × 100%
          </div>
          <p className="mt-1.5 text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Luas kurva di atas latar lokal tiap puncak, dijumlahkan lalu dibandingkan luas total kurva (termasuk gundukan amorf) menentukan derajat kristalinitas.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-container-low)] p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-200 text-[10px] font-bold">4</span>
            <span>Gundukan Lebar (Halo)</span>
          </div>
          <div className="mt-1 font-mono text-[11px] font-semibold text-[var(--primary-dark)]">
            Hamburan Difus (Amorf)
          </div>
          <p className="mt-1.5 text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Bukit landai tanpa puncak tajam membuktikan keberadaan fasa amorf atau ketidakteraturan kisi, di mana atom tersusun acak tanpa periode jangka panjang.
          </p>
        </div>
      </div>

      {/* Standard Al-Fum Reference chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs">
        <span className="font-semibold text-[var(--foreground)]">Standar Al-Fum (CCDC 1051975):</span>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          {ALFUM_STANDARD_REFLECTIONS.map((r) => (
            <span key={r.hkl} className="rounded border border-[var(--outline-variant)] bg-white px-2 py-0.5 text-[var(--primary-dark)]">
              {r.hkl} @ {r.twoThetaStd.toFixed(2)}°
            </span>
          ))}
        </div>
      </div>
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
