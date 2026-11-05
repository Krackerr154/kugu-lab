"use client";

/**
 * Visual untuk teori XRD (Modul 5).
 *
 * CrystalOrderContinuum — kontinum kristalin ↔ semikristalin ↔ amorf: kisi
 * atom yang bergetar makin kuat dengan slider keteraturan, dan difraktogram di
 * sebelahnya melebar serta menumbuhkan gundukan halo dari model yang sama
 * (lib/m5-xrd.ts), jadi gambar dan kurva tidak mungkin bercerita berbeda.
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
const LATTICE_X0 = 26;
const LATTICE_Y0 = 28;
const LATTICE_DX = 40;
const LATTICE_DY = 30;

const ATOM_PHASES = (() => {
  const rnd = seededRandom(20261105);
  const phases: { a: number; b: number }[] = [];
  for (let i = 0; i < LATTICE_COLS * LATTICE_ROWS; i++) {
    phases.push({ a: rnd() * Math.PI * 2, b: rnd() * Math.PI * 2 });
  }
  return phases;
})();

function patternPath(
  pts: readonly { x: number; y: number }[],
  w: number,
  h: number,
  pad = 6
): string {
  const minX = 5;
  const maxX = 80;
  let maxY = 0;
  for (const p of pts) if (p.y > maxY) maxY = p.y;
  const sx = (x: number) => pad + ((x - minX) / (maxX - minX)) * (w - 2 * pad);
  const sy = (y: number) => h - pad - (y / maxY) * (h - 2 * pad);
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`)
    .join(" ");
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
  const [playing, setPlaying] = useState(true);
  const reduced = useReducedMotion();
  const describedBy = useId();
  const tRef = useRef(0);
  const pausedRef = useRef(!playing);
  const [, setTick] = useState(0);
  pausedRef.current = !playing || reduced;

  const L = disorderPattern(disorder);
  const stage = orderStageLabel(disorder);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current) tRef.current += dt;
      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const freq = 2 + 8 * disorder;
  const amp = disorder * 9;

  const atomShift = (idx: number, t: number) => {
    const ph = ATOM_PHASES[idx];
    const oscillation = reduced ? 1 : Math.sin(t * freq + ph.a);
    const oscillation2 = reduced ? 1 : Math.cos(t * freq * 0.83 + ph.b);
    return {
      dx: (oscillation * amp + (1 - Math.abs(oscillation)) * amp * 0.3) * (ph.a > Math.PI ? 1 : -0.7),
      dy: oscillation2 * amp * 0.85,
    };
  };

  const W = 300;
  const H = 150;

  const atoms = [];
  let idx = 0;
  for (let r = 0; r < LATTICE_ROWS; r++) {
    for (let c = 0; c < LATTICE_COLS; c++) {
      const bx = LATTICE_X0 + c * LATTICE_DX;
      const by = LATTICE_Y0 + r * LATTICE_DY;
      const { dx, dy } = atomShift(idx, tRef.current / 1000);
      atoms.push({ x: bx + dx, y: by + dy, key: idx });
      idx++;
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold">Kristalin ↔ Semikristalin ↔ Amorf</h3>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            playing
              ? "bg-[var(--primary)] text-white"
              : "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
          }`}
        >
          {playing ? "⏸ Jeda" : "▶ Putar"}
        </button>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]" id={describedBy}>
        Geser gagang untuk mengubah keteraturan kisi. Atom makin bergetar → puncak
        makin lebar dan gundukan amorf tumbuh.
      </p>

      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(disorder * 100)}
        aria-label="Tingkat keteraturan"
        aria-describedby={describedBy}
        onChange={(e) => {
          const v = Number(e.target.value) / 100;
          setDisorder(v);
          setPlaying(false);
        }}
        className="mt-3 w-full"
      />
      <div className="flex justify-between text-xs text-[var(--muted)]">
        <span>Kristalin</span>
        <span>Semikristalin</span>
        <span>Amorf</span>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Kisi atom kristal">
            {atoms.map((a) => (
              <circle
                key={a.key}
                cx={a.x}
                cy={a.y}
                r={4.2}
                fill={a.key % 2 === 0 ? NAVY : GOLD}
                opacity={0.92}
              />
            ))}
          </svg>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Difraktogram">
            <path
              d={patternPath(L.points, W, H)}
              fill="none"
              stroke={NAVY}
              strokeWidth={1.5}
            />
            <text x={8} y={H - 4} fontSize={9} fill={MUTED}>
              5° ··· 80° 2θ
            </text>
          </svg>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-md bg-[var(--primary-light)] px-2.5 py-1 font-medium text-[var(--primary-dark)]">
          {stage}
        </span>
        <span className="text-[var(--muted)]">
          FWHM ≈ {L.fwhmDeg.toFixed(2)}° · kristalinitas ≈ {Math.round(L.crystallinityPct)}%
        </span>
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
  const W = 300;
  const H = 150;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Anatomi Difraktogram</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Empat hal yang bisa dibaca dari pola XRD (panduan slide 6).
      </p>
      <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Anatomi difraktogram standar Al-Fum">
          <path d={patternPath(pattern, W, H)} fill="none" stroke={NAVY} strokeWidth={1.5} />
          <text x={8} y={H - 4} fontSize={9} fill={MUTED}>
            2θ (°)
          </text>

          {/* Anotasi 1: posisi → d & hkl */}
          <line x1={86} y1={26} x2={86} y2={46} stroke={GOLD} strokeWidth={1.5} />
          <text x={86} y={20} fontSize={8.5} fill={GOLD} textAnchor="middle" fontWeight={600}>
            posisi → d & hkl
          </text>

          {/* Anotasi 2: lebar → kristalit */}
          <line x1={196} y1={58} x2={196} y2={78} stroke={GOLD} strokeWidth={1.5} />
          <text x={196} y={52} fontSize={8.5} fill={GOLD} textAnchor="middle" fontWeight={600}>
            lebar → ukuran kristalit
          </text>

          {/* Anotasi 3: luas → kristalinitas */}
          <line x1={150} y1={120} x2={150} y2={104} stroke={GOLD} strokeWidth={1.5} />
          <text x={150} y={132} fontSize={8.5} fill={GOLD} textAnchor="middle" fontWeight={600}>
            luas di bawah kurva → kristalinitas
          </text>

          {/* Anotasi 4: gundukan amorf */}
          <text x={240} y={120} fontSize={8.5} fill={MUTED} textAnchor="middle">
            gundukan lebar = amorf
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
