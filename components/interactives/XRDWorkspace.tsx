// M5 XRD Workspace — Bragg sandbox, diffractogram, FWHM/Scherrer calculator
"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { Equation } from "@/components/shared/Equation";

const ReactEChart = dynamic(() => import("echarts-for-react"), { ssr: false });

const CRYSTAL_DEFAULTS = { LAMBDA_Cu: 1.5406 }; // Cu Kα

export function XRDWorkspace() {
  const [tab, setTab] = useState<"bragg" | "diffractogram" | "scherrer">("bragg");

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div role="group" aria-label="Worksheet Modul 5" className="flex gap-1 rounded-lg bg-[var(--surface-muted)] p-1">
        {[
          { id: "bragg", label: "Sandbox Bragg" },
          { id: "diffractogram", label: "Difraktogram" },
          { id: "scherrer", label: "FWHM/Scherrer" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
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
      {tab === "diffractogram" && <Diffractogram />}
      {tab === "scherrer" && <ScherrerCalculator />}
    </div>
  );
}

// Bragg's Law sandbox: nλ = 2d sin θ
function BraggSandbox() {
  const [lambda, setLambda] = useState(CRYSTAL_DEFAULTS.LAMBDA_Cu);
  const [twoTheta, setTwoTheta] = useState(28.5);
  const [n, setN] = useState(1);

  const theta = twoTheta / 2;
  const thetaRad = (theta * Math.PI) / 180;
  const d = (n * lambda) / (2 * Math.sin(thetaRad));

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Sandbox Hukum Bragg</h3>
      <Equation
        tex="n\\lambda = 2d \\sin\\theta"
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
            <option value={1.5418}>Cu Kα1 (1.5418 Å)</option>
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

// Interactive diffractogram with sample data
function Diffractogram() {
  // Sample XRD pattern (simulated FAU zeolite-like peaks)
  const sampleData: { x: number; y: number }[] = [];
  // Generate a simulated pattern with peaks at known 2θ positions
  const peaks = [
    { center: 6.2, intensity: 100, width: 0.15 },
    { center: 10.1, intensity: 40, width: 0.2 },
    { center: 11.8, intensity: 35, width: 0.2 },
    { center: 15.4, intensity: 30, width: 0.15 },
    { center: 20.3, intensity: 45, width: 0.2 },
    { center: 23.6, intensity: 60, width: 0.2 },
    { center: 26.6, intensity: 25, width: 0.15 },
    { center: 31.0, intensity: 35, width: 0.25 },
  ];

  for (let x = 5; x <= 40; x += 0.05) {
    let y = 2 + Math.random() * 3; // baseline noise
    for (const p of peaks) {
      y += p.intensity * Math.exp(-((x - p.center) ** 2) / (2 * p.width ** 2));
    }
    sampleData.push({ x, y });
  }

  const [annotateMode, setAnnotateMode] = useState(false);
  const [annotations, setAnnotations] = useState<{ x: number; y: number; label: string }[]>([]);
  const [clickX, setClickX] = useState<number | null>(null);

  const handleChartClick = (params: any) => {
    if (annotateMode && params.componentType === "series") {
      const newAnnotation = {
        x: params.value[0],
        y: params.value[1],
        label: `Peak @ ${params.value[0].toFixed(2)}°`,
      };
      setAnnotations([...annotations, newAnnotation]);
      setClickX(params.value[0]);
    }
  };

  const markPoints = annotations.map((a) => ({
    coord: [a.x, a.y],
    name: a.label,
    label: { show: true, formatter: a.label, position: "top" as const, fontSize: 10 },
  }));

  const option: EChartsOption = {
    title: { text: "Diffraktogram XRD (Data Sampel — FAU Zeolit)", left: "center", textStyle: { fontSize: 13 } },
    tooltip: { trigger: "axis", formatter: (params: any) => `2θ = ${params[0].value[0].toFixed(2)}°<br/>Intensitas = ${params[0].value[1].toFixed(1)}` },
    legend: { bottom: 0 },
    grid: { left: 70, right: 20, top: 50, bottom: 50 },
    xAxis: { type: "value", name: "2θ (°)", min: 5, max: 40 },
    yAxis: { type: "value", name: "Intensitas (a.u.)" },
    series: [
      {
        name: "Pattern",
        type: "line",
        data: sampleData.map((p) => [p.x, p.y]),
        smooth: false,
        symbol: "none",
        lineStyle: { color: "#001f3f", width: 1 },
        markPoint: { data: markPoints, symbol: "pin", symbolSize: 40 },
      },
    ],
  };

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Workspace Difraktogram Interaktif</h3>
      <p className="text-sm text-[var(--muted)] mb-3">
        Data sampel simulasi (mirip pola FAU). Klik puncak untuk anotasi. CSV/SQL export tersedia.
      </p>

      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={() => setAnnotateMode(!annotateMode)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            annotateMode ? "bg-[var(--primary)] text-white" : "border border-[var(--border)]"
          }`}
        >
          {annotateMode ? "Mode Anotasi AKTIF — klik puncak" : "Aktifkan Mode Anotasi"}
        </button>
        {annotations.length > 0 && (
          <button
            onClick={() => setAnnotations([])}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-muted)]"
          >
            Hapus Anotasi ({annotations.length})
          </button>
        )}
      </div>

      <ReactEChart
        option={option}
        style={{ height: "400px", width: "100%" }}
        onEvents={{ click: handleChartClick }}
      />

      {/* Peak table */}
      {annotations.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="py-1 pr-3">No.</th>
                <th className="py-1 pr-3">2θ (°)</th>
                <th className="py-1 pr-3">Intensitas</th>
                <th className="py-1 pr-3">d (Å)</th>
                <th className="py-1 pr-3">(hkl) Kandidat</th>
              </tr>
            </thead>
            <tbody>
              {annotations.map((a, i) => {
                const d = (1.5406) / (2 * Math.sin((a.x / 2) * Math.PI / 180));
                return (
                  <tr key={i} className="border-b border-[var(--outline-variant)]">
                    <td className="py-1 pr-3">{i + 1}</td>
                    <td className="py-1 pr-3 font-mono">{a.x.toFixed(2)}</td>
                    <td className="py-1 pr-3 font-mono">{a.y.toFixed(1)}</td>
                    <td className="py-1 pr-3 font-mono">{d.toFixed(4)}</td>
                    <td className="py-1 pr-3 text-[var(--muted)]">— butuh referensi</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-2 text-xs text-[var(--muted)]">
        Data mentah tidak boleh dimodifikasi. Anotasi disimpan sebagai versi turunan (derived).
      </p>
    </section>
  );
}

// Scherrer calculator
function ScherrerCalculator() {
  const [lambda] = useState(1.5406);
  const [twoTheta, setTwoTheta] = useState(28.5);
  const [fwhm, setFwhm] = useState(0.3); // in degrees
  const [k, setK] = useState(0.9);

  const theta = twoTheta / 2;
  const thetaRad = (theta * Math.PI) / 180;
  const fwhmRad = (fwhm * Math.PI) / 180;
  const d = lambda / (2 * Math.sin(thetaRad));
  const crystalliteSize = (k * lambda) / (fwhmRad * Math.cos(thetaRad));

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Kalkulator FWHM / Scherrer</h3>
      <Equation
        tex="D = \\frac{K\\lambda}{\\beta \\cos\\theta}"
        label="Persamaan Scherrer"
        description="D = ukuran kristalit (nm), K = faktor bentuk (0.9), λ = panjang gelombang (nm), β = FWHM (radian), θ = sudut Bragg. Catatan: hasil model-dependent."
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="m5-scherrer-two-theta" className="text-sm font-medium">2θ (°)</label>
          <input
            id="m5-scherrer-two-theta"
            type="number"
            step="0.01"
            value={twoTheta}
            onChange={(e) => setTwoTheta(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
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
        <div>
          <label htmlFor="m5-scherrer-lambda" className="text-sm font-medium">λ (Å)</label>
          <input
            id="m5-scherrer-lambda"
            type="number"
            step="0.0001"
            value={lambda}
            disabled
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-[var(--primary-light)] p-4">
        <h4 className="font-semibold text-sm text-[var(--primary-dark)]">Hasil:</h4>
        <div className="mt-2 space-y-1 text-sm font-mono">
          <p>θ = {theta.toFixed(4)}° = {thetaRad.toFixed(6)} rad</p>
          <p>d = {d.toFixed(4)} Å</p>
          <p>β = {fwhm}° = {fwhmRad.toFixed(6)} rad</p>
          <p>cos(θ) = {Math.cos(thetaRad).toFixed(6)}</p>
        </div>
        <div className="mt-2 border-t border-[var(--primary)] pt-2">
          <Equation
            tex={`D = \\frac{${k} \\times ${lambda}}{${fwhmRad.toFixed(6)} \\times ${Math.cos(thetaRad).toFixed(6)}}`}
            label="Substitusi"
          />
          <p className="mt-2 text-2xl font-bold text-[var(--primary-dark)]">
            D = {crystalliteSize.toFixed(2)} Å = {(crystalliteSize / 10).toFixed(2)} nm
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs italic text-[var(--muted)]">
        Ukuran kristalit ini bersifat model-dependent (asumsi kristalit bulat dan seragam). 
        Perhitungan menggunakan faktor bentuk Scherrer K = 0.9. Hasil harus disertai asumsi dan batasan.
      </p>
    </section>
  );
}
