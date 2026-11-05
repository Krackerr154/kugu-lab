// M5 XRD Workspace — Bragg sandbox, Al-Fum comparison, FWHM/Scherrer calculator
"use client";

import { useMemo, useRef, useState } from "react";

import { Equation } from "@/components/shared/Equation";

import {
  ALFUM_SAMPLES,
  ALFUM_STANDARD_REFLECTIONS,
  GUIDE_SCHERRER_D011_NM,
  XRD_SCAN,
  dSpacing,
  diffractogram,
  matchPeakToStandard,
  scherrerD,
  type AlFumSampleId,
} from "@/lib/m5-xrd";

const NAVY = "var(--chart-navy)";
const GOLD = "var(--chart-gold)";

function patternPoints(
  pts: readonly { x: number; y: number }[],
  w: number,
  h: number,
  pad = 6
): string {
  const minX = XRD_SCAN.min;
  const maxX = XRD_SCAN.max;
  let maxY = 0;
  for (const p of pts) if (p.y > maxY) maxY = p.y;
  const sx = (x: number) => pad + ((x - minX) / (maxX - minX)) * (w - 2 * pad);
  const sy = (y: number) => h - pad - (y / maxY) * (h - 2 * pad);
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`)
    .join(" ");
}

export function XRDWorkspace() {
  const [tab, setTab] = useState<"bragg" | "bandingkan" | "scherrer">("bragg");

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Worksheet Modul 5" className="flex gap-1 rounded-lg bg-[var(--surface-muted)] p-1">
        {[
          { id: "bragg" as const, label: "Sandbox Bragg" },
          { id: "bandingkan" as const, label: "Bandingkan Al-Fum" },
          { id: "scherrer" as const, label: "FWHM/Scherrer" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-white text-[var(--primary-dark)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "bragg" && <BraggSandbox />}
      {tab === "bandingkan" && <AlFumComparison />}
      {tab === "scherrer" && <ScherrerCalculator />}
    </div>
  );
}

/* ── 1. Sandbox Hukum Bragg ───────────────────────────────────────────── */

function BraggSandbox() {
  const [lambda, setLambda] = useState(1.5406);
  const [twoTheta, setTwoTheta] = useState(28.5);
  const [n, setN] = useState(1);

  const theta = twoTheta / 2;
  const thetaRad = (theta * Math.PI) / 180;
  const d = (n * lambda) / (2 * Math.sin(thetaRad));

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Sandbox Hukum Bragg</h3>
      <Equation
        tex={"n\\lambda = 2d \\sin\\theta"}
        label="Hukum Bragg"
        description="n = orde refleksi, λ = panjang gelombang (Å), d = jarak bidang (Å), θ = sudut Bragg (setengah dari 2θ)"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="m5-lambda-source" className="text-sm font-medium">Sumber Sinar-X (λ, Å)</label>
          <select
            id="m5-lambda-source"
            value={lambda}
            onChange={(e) => setLambda(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          >
            <option value={1.5406}>Cu Kα (1.5406 Å)</option>
            <option value={0.7107}>Mo Kα (0.7107 Å)</option>
            <option value={1.7902}>Co Kα (1.7902 Å)</option>
            <option value={1.54059}>Cu Kα1 (1.54059 Å)</option>
          </select>
        </div>
        <div>
          <label htmlFor="m5-two-theta" className="text-sm font-medium">2θ (derajat)</label>
          <input
            id="m5-two-theta"
            type="number"
            step="0.01"
            value={twoTheta}
            onChange={(e) => setTwoTheta(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="m5-order" className="text-sm font-medium">Orde (n)</label>
          <input
            id="m5-order"
            type="number"
            min="1"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-[var(--primary-light)] p-4">
        <h4 className="font-semibold text-sm text-[var(--primary-dark)]">Hasil:</h4>
        <div className="mt-2 space-y-1 text-sm">
          <p>θ = {twoTheta / 2}° → {theta.toFixed(4)}°</p>
          <p>θ (radian) = {thetaRad.toFixed(6)}</p>
          <p>sin(θ) = {Math.sin(thetaRad).toFixed(6)}</p>
          <div className="mt-2 border-t border-[var(--primary)] pt-2">
            <Equation
              tex={`d = \\frac{n \\lambda}{2 \\sin\\theta} = \\frac{${n} \\times ${lambda}}{2 \\times ${Math.sin(thetaRad).toFixed(6)}}`}
              label="Perhitungan d-spacing"
            />
            <p className="mt-2 text-2xl font-bold text-[var(--primary-dark)]">
              d = {d.toFixed(4)} Å
            </p>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <svg viewBox="0 0 300 150" className="w-full max-w-md mx-auto" role="img" aria-label="Visualisasi Hukum Bragg">
          {/* Crystal planes */}
          <line x1="20" y1="50" x2="280" y2="50" stroke="#475569" strokeWidth="1" strokeDasharray="4,2" />
          <line x1="20" y1="90" x2="280" y2="90" stroke="#475569" strokeWidth="1" strokeDasharray="4,2" />
          <text x="10" y="54" fontSize="8" fill="#64748b">→</text>
          <text x="10" y="94" fontSize="8" fill="#64748b">→</text>
          <text x="290" y="72" fontSize="8" fill="#64748b">d</text>
          <line x1="288" y1="50" x2="288" y2="90" stroke="#64748b" strokeWidth="1" />

          {/* Incoming beam */}
          <line
            x1="50" y1="130" x2="150" y2="50"
            stroke="#ef4444" strokeWidth="2"
            markerEnd="url(#arrowred)"
          />
          {/* Reflected beam */}
          <line
            x1="150" y1="50" x2="250" y2="130"
            stroke="#476083" strokeWidth="2"
            markerEnd="url(#arrowblue)"
          />
          {/* Angle arcs */}
          <path d="M 130 65 A 25 25 0 0 1 150 50" fill="none" stroke="#ef4444" strokeWidth="1" />
          <path d="M 150 50 A 25 25 0 0 0 170 65" fill="none" stroke="#476083" strokeWidth="1" />
          <text x="125" y="60" fontSize="8" fill="#ef4444">θ</text>
          <text x="168" y="60" fontSize="8" fill="#476083">θ</text>

          <defs>
            <marker id="arrowred" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
            </marker>
            <marker id="arrowblue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#476083" />
            </marker>
          </defs>

          <text x="80" y="140" fontSize="8" fill="#ef4444">Sinar masuk</text>
          <text x="210" y="140" fontSize="8" fill="#476083">Sinar difraksi</text>
        </svg>
        <p className="text-center text-xs text-[var(--muted)] mt-1">
          Bidang kristal (garis putus-putus) dengan jarak d = {d.toFixed(4)} Å
        </p>
      </div>
    </section>
  );
}

/* ── 2. Perbandingan sampel vs standar Al-Fum ─────────────────────────── */

interface Annotation {
  twoTheta: number;
  hkl: string;
  d: number;
  matched: boolean;
  deltaDeg: number;
}

const SAMPLE_LABEL: Record<AlFumSampleId, string> = {
  "1:2": "Al-Fum 1:2",
  "1:3": "Al-Fum 1:3",
  "1:4": "Al-Fum 1:4",
};

function AlFumComparison() {
  const [sampleId, setSampleId] = useState<AlFumSampleId>("1:2");
  const [showStandard, setShowStandard] = useState(true);
  const [normalize, setNormalize] = useState(true);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const sample = ALFUM_SAMPLES.find((s) => s.id === sampleId)!;
  const samplePattern = useMemo(() => diffractogram(sampleId, 20261106), [sampleId]);
  const standardPattern = useMemo(() => diffractogram("standard", 11), []);

  // Cari puncak utama sampel secara deterministik (posisi bernilai maksimum
  // lokal, di atas ambang). Ini menyimulasikan langkah "Find Peaks" di Origin.
  const samplePeaks = useMemo(() => {
    const pts = samplePattern;
    const peaks: number[] = [];
    const maxY = Math.max(...pts.map((p) => p.y));
    for (let i = 10; i < pts.length - 10; i++) {
      const p = pts[i];
      if (p.y > maxY * 0.08) {
        const L = pts[i - 1].y;
        const R = pts[i + 1].y;
        if (p.y >= L && p.y > R && p.y > 12) {
          peaks.push(p.x);
        }
      }
    }
    return peaks;
  }, [samplePattern]);

  const handlePlotClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const minX = XRD_SCAN.min;
    const maxX = XRD_SCAN.max;
    const twoTheta = minX + ((e.clientX - rect.left) / rect.width) * (maxX - minX);
    const matched = matchPeakToStandard(twoTheta);
    if (!matched) return;
    setAnnotations((prev) => {
      const existing = prev.some((a) => Math.abs(a.twoTheta - twoTheta) < 0.5);
      if (existing) return prev;
      return [
        ...prev,
        {
          twoTheta,
          hkl: matched.hkl,
          d: dSpacing(twoTheta),
          matched: true,
          deltaDeg: matched.deltaDeg,
        },
      ].sort((a, b) => a.twoTheta - b.twoTheta);
    });
  };

  const clearAnnotations = () => setAnnotations([]);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Bandingkan Sampel vs Standar Al-Fum</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Data sampel disimulasikan sesuai tabel panduan (slide 31–32): posisi
        puncak bergeser sedikit ke kiri (holder height), tanpa puncak pengotor.
        Klik puncak sampel untuk mencocokkannya dengan refleksi standar (toleransi ±0,5°).
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div>
          <label htmlFor="m5-sample-select" className="mr-2 text-sm font-medium">Sampel</label>
          <select
            id="m5-sample-select"
            value={sampleId}
            onChange={(e) => {
              setSampleId(e.target.value as AlFumSampleId);
              setAnnotations([]);
            }}
            className="rounded-md border border-[var(--border)] p-2 text-sm"
          >
            {ALFUM_SAMPLES.map((s) => (
              <option key={s.id} value={s.id}>{SAMPLE_LABEL[s.id]}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showStandard} onChange={(e) => setShowStandard(e.target.checked)} />
          Tampilkan standar
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} />
          Normalisasi (Ymax = 1)
        </label>
        {annotations.length > 0 && (
          <button
            onClick={clearAnnotations}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-muted)]"
          >
            Hapus Anotasi ({annotations.length})
          </button>
        )}
      </div>

      <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-2">
        <svg
          ref={svgRef}
          viewBox="0 0 600 260"
          className="w-full touch-none"
          role="img"
          aria-label="Difraktogram sampel dan standar Al-Fum"
          onClick={handlePlotClick}
        >
          {showStandard && (
            <g>
              <path
                d={patternPoints(
                  standardPattern.map((p) => ({ x: p.x, y: p.y / 100 })),
                  600,
                  120,
                  6
                )}
                fill="none"
                stroke={GOLD}
                strokeWidth={1.3}
              />
              <text x={8} y={14} fontSize={9} fill={GOLD} fontWeight={600}>
                Standar Al-Fum (CCDC 1051975)
              </text>
            </g>
          )}
          <g transform="translate(0,120)">
            <path
              d={patternPoints(
                normalize
                  ? samplePattern.map((p) => ({ x: p.x, y: p.y / 100 }))
                  : samplePattern,
                600,
                120,
                6
              )}
              fill="none"
              stroke={NAVY}
              strokeWidth={1.5}
            />
            <text x={8} y={12} fontSize={9} fill={NAVY} fontWeight={600}>
              {SAMPLE_LABEL[sampleId]} {normalize ? "(ternormalisasi)" : ""}
            </text>
          </g>

          {/* Posisi refleksi standar */}
          {showStandard &&
            ALFUM_STANDARD_REFLECTIONS.map((r) => {
              const sx = 6 + ((r.twoThetaStd - XRD_SCAN.min) / (XRD_SCAN.max - XRD_SCAN.min)) * (600 - 12);
              return (
                <g key={r.hkl}>
                  <line x1={sx} y1={20} x2={sx} y2={240} stroke={GOLD} strokeWidth={0.6} opacity={0.4} strokeDasharray="2,2" />
                  <text x={sx} y={16} fontSize={8} fill={GOLD} textAnchor="middle">
                    {r.hkl}
                  </text>
                </g>
              );
            })}
        </svg>
        <p className="mt-1 text-center text-xs text-[var(--muted)]">
          Posisi puncak standar ditandai garis emas. Klik puncak sampel untuk anotasi.
        </p>
      </div>

      {annotations.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-left">
                <th className="py-1.5 pl-2 pr-3">2θ (°)</th>
                <th className="py-1.5 pr-3">d (Å)</th>
                <th className="py-1.5 pr-3">hkl</th>
                <th className="py-1.5 pr-3">Δ dari standar (°)</th>
                <th className="py-1.5 pr-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {annotations.map((a, i) => (
                <tr key={i} className="border-b border-[var(--outline-variant)] last:border-0">
                  <td className="py-1.5 pl-2 pr-3 font-mono">{a.twoTheta.toFixed(2)}</td>
                  <td className="py-1.5 pr-3 font-mono">{a.d.toFixed(3)}</td>
                  <td className="py-1.5 pr-3 font-mono">{a.hkl}</td>
                  <td className="py-1.5 pr-3 font-mono">{a.deltaDeg >= 0 ? "+" : ""}{a.deltaDeg.toFixed(2)}</td>
                  <td className="py-1.5 pr-2">
                    {a.matched ? (
                      <span className="rounded-full bg-[var(--surface-selected)] px-2 py-0.5 font-medium text-[var(--primary-dark)]">
                        cocok
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700">
                        tidak teridentifikasi
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md bg-[var(--surface-muted)] p-3">
          <div className="text-xs text-[var(--muted)]">FWHM 011 (panduan)</div>
          <div className="mt-1 font-mono text-lg font-semibold">{sample.fwhm011Deg.toFixed(3)}°</div>
        </div>
        <div className="rounded-md bg-[var(--surface-muted)] p-3">
          <div className="text-xs text-[var(--muted)]">Kristalinitas relatif (panduan)</div>
          <div className="mt-1 font-mono text-lg font-semibold">{sample.crystallinityRelPct.toFixed(1)}%</div>
        </div>
        <div className="rounded-md bg-[var(--surface-muted)] p-3">
          <div className="text-xs text-[var(--muted)]">Puncak sampel terdeteksi</div>
          <div className="mt-1 font-mono text-lg font-semibold">{samplePeaks.length}</div>
        </div>
      </div>
    </section>
  );
}

/* ── 3. Kalkulator FWHM / Scherrer ────────────────────────────────────── */

function ScherrerCalculator() {
  const [sampleId, setSampleId] = useState<AlFumSampleId>("1:2");
  const [fwhm, setFwhm] = useState(0.327);
  const [k, setK] = useState(0.9);

  const sample = ALFUM_SAMPLES.find((s) => s.id === sampleId)!;
  // θ dari puncak 011 standar yang digeser sesuai sampel
  const twoTheta = ALFUM_STANDARD_REFLECTIONS[0].twoThetaStd + sample.shift[0];
  const theta = twoTheta / 2;
  const thetaRad = (theta * Math.PI) / 180;
  const fwhmRad = (fwhm * Math.PI) / 180;
  const d = dSpacing(twoTheta);
  const crystalliteSize = scherrerD(twoTheta, fwhm, k);
  const guideD = GUIDE_SCHERRER_D011_NM[sampleId];

  // Semua 6 refleksi dengan FWHM sama → D per hkl + rata-rata 3 teratas
  const rows = ALFUM_STANDARD_REFLECTIONS.map((r) => {
    const idx = ALFUM_STANDARD_REFLECTIONS.indexOf(r);
    const t = r.twoThetaStd + sample.shift[idx];
    const D = scherrerD(t, fwhm, k);
    return { hkl: r.hkl, twoTheta: t, fwhmDeg: fwhm, D };
  });
  const sorted = [...rows].sort((a, b) => b.D - a.D);
  const top3Avg = (sorted[0].D + sorted[1].D + sorted[2].D) / 3;
  const largest = sorted[0];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Kalkulator FWHM / Scherrer</h3>
      <Equation
        tex={"D = \\frac{K\\lambda}{\\beta \\cos\\theta}"}
        label="Persamaan Scherrer"
        description="D = ukuran kristalit (nm), K = 0,9, λ = 0,154059 nm (Cu Kα1), β = FWHM (radian), θ = sudut Bragg (2θ/2)"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="m5-scherrer-sample" className="text-sm font-medium">Sampel</label>
          <select
            id="m5-scherrer-sample"
            value={sampleId}
            onChange={(e) => {
              const id = e.target.value as AlFumSampleId;
              setSampleId(id);
              setFwhm(ALFUM_SAMPLES.find((s) => s.id === id)!.fwhm011Deg);
            }}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          >
            {ALFUM_SAMPLES.map((s) => (
              <option key={s.id} value={s.id}>{SAMPLE_LABEL[s.id]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="m5-fwhm" className="text-sm font-medium">FWHM β (°)</label>
          <input
            id="m5-fwhm"
            type="number"
            step="0.001"
            value={fwhm}
            onChange={(e) => setFwhm(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="m5-shape-factor" className="text-sm font-medium">K (faktor bentuk)</label>
          <input
            id="m5-shape-factor"
            type="number"
            step="0.01"
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-[var(--primary-light)] p-4">
        <h4 className="font-semibold text-sm text-[var(--primary-dark)]">Hasil puncak 011:</h4>
        <div className="mt-2 space-y-1 text-sm font-mono">
          <p>2θ = {twoTheta.toFixed(2)}° → θ = {theta.toFixed(4)}° = {thetaRad.toFixed(6)} rad</p>
          <p>d = {d.toFixed(4)} Å</p>
          <p>β = {fwhm}° = {fwhmRad.toFixed(6)} rad</p>
          <p>cos(θ) = {Math.cos(thetaRad).toFixed(6)}</p>
        </div>
        <div className="mt-2 border-t border-[var(--primary)] pt-2">
          <Equation
            tex={`D = \\frac{${k} \\times 0{,}154059}{${fwhmRad.toFixed(6)} \\times ${Math.cos(thetaRad).toFixed(6)}}`}
            label="Substitusi"
          />
          <p className="mt-2 text-2xl font-bold text-[var(--primary-dark)]">
            D = {crystalliteSize.toFixed(2)} nm
          </p>
          <p className="mt-1 text-sm text-[var(--primary-dark)]">
            Panduan (slide 32): D = {guideD} nm untuk {SAMPLE_LABEL[sampleId]}.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--border)]">
        <div className="border-b border-[var(--border)] px-3 py-2 text-sm font-semibold">
          Semua refleksi (FWHM sama, θ dari 2θ masing-masing)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-left">
                <th className="py-1.5 pl-3 pr-3">hkl</th>
                <th className="py-1.5 pr-3">2θ (°)</th>
                <th className="py-1.5 pr-3">D (nm)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.hkl} className="border-b border-[var(--outline-variant)] last:border-0">
                  <td className="py-1.5 pl-3 pr-3 font-mono">{r.hkl}</td>
                  <td className="py-1.5 pr-3 font-mono">{r.twoTheta.toFixed(2)}</td>
                  <td className="py-1.5 pr-3 font-mono">{r.D.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-[var(--surface-muted)] p-3">
          <div className="text-xs text-[var(--muted)]">D terbesar — bidang pertumbuhan dominan</div>
          <div className="mt-1 text-sm font-semibold">
            {largest.hkl} @ {largest.D.toFixed(1)} nm
          </div>
        </div>
        <div className="rounded-md bg-[var(--surface-muted)] p-3">
          <div className="text-xs text-[var(--muted)]">Rata-rata 3 puncak tertinggi</div>
          <div className="mt-1 text-sm font-semibold">{top3Avg.toFixed(1)} nm</div>
        </div>
      </div>

      <p className="mt-3 text-xs italic text-[var(--muted)]">
        Ukuran kristalit bersifat model-dependent (asumsi kristalit bulat dan
        seragam, K = 0,9) dan belum dikoreksi pelebaran instrumen — jadi batas
        bawah. Hasil harus disertai asumsi dan batasan.
      </p>
    </section>
  );
}
