// M6 TGA Workspace — thermogram/DTG, mass-loss annotation, theoretical vs experimental
"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { Equation } from "@/components/shared/Equation";

const ReactEChart = dynamic(() => import("echarts-for-react"), { ssr: false });

export function TGAWorkspace() {
  const [tab, setTab] = useState<"thermogram" | "worksheet">("thermogram");

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Worksheet Modul 6" className="flex gap-1 rounded-lg bg-[var(--surface-muted)] p-1">
        {[
          { id: "thermogram", label: "Termogram / DTG" },
          { id: "worksheet", label: "Worksheet Teoretis vs Eksperimental" },
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

      {tab === "thermogram" && <Thermogram />}
      {tab === "worksheet" && <TheoreticalWorksheet />}
    </div>
  );
}

// Generate TGA sample data (simulated CaCO3 decomposition)
function generateTGAData() {
  const tgData: { x: number; y: number }[] = [];
  const dtgData: { x: number; y: number }[] = [];
  
  let mass = 100;
  let prevMass = 100;
  for (let t = 30; t <= 900; t += 2) {
    // Baseline drift
    let m = 100;
    // First region: dehydration (100-200°C) — small loss
    if (t > 100 && t < 200) {
      m -= 2 * Math.exp(-((t - 150) ** 2) / 500);
    }
    // Main decomposition: CaCO3 → CaO + CO2 (600-800°C)
    if (t > 600 && t < 800) {
      m -= 44 * Math.exp(-((t - 700) ** 2) / 800);
    }
    m = 100 - (100 - m) * 0.98; // smooth
    tgData.push({ x: t, y: m });
    
    // DTG: derivative
    if (t > 32) {
      const dm = (m - prevMass) / 2;
      dtgData.push({ x: t, y: -dm * 10 });
    }
    prevMass = m;
  }
  
  return { tgData, dtgData };
}

function Thermogram() {
  const { tgData, dtgData } = generateTGAData();
  const [annotations, setAnnotations] = useState<{ x: number; label: string }[]>([]);
  const [annotateMode, setAnnotateMode] = useState(false);

  const handleChartClick = (params: any) => {
    if (annotateMode) {
      setAnnotations([...annotations, { x: params.value[0], label: `Region @ ${params.value[0].toFixed(0)}°C` }]);
    }
  };

  const option: EChartsOption = {
    title: { text: "Termogram TGA/DTG (Data Sampel — CaCO3)", left: "center", textStyle: { fontSize: 13 } },
    tooltip: { trigger: "axis" },
    legend: { bottom: 0, data: ["TG (mass %)", "DTG (derivatif)"] },
    grid: { left: 70, right: 70, top: 50, bottom: 50 },
    xAxis: { type: "value", name: "Suhu (°C)", min: 30, max: 900 },
    yAxis: [
      { type: "value", name: "Massa (%)", position: "left", min: 0, max: 105 },
      { type: "value", name: "DTG (%/min)", position: "right" },
    ],
    series: [
      {
        name: "TG (mass %)",
        type: "line",
        data: tgData.map((p) => [p.x, p.y]),
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#ba1a1a", width: 2 },
        yAxisIndex: 0,
      },
      {
        name: "DTG (derivatif)",
        type: "line",
        data: dtgData.map((p) => [p.x, p.y]),
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#476083", width: 1, type: "dashed" },
        yAxisIndex: 1,
      },
    ],
  };

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Workspace TG/DTG</h3>
      <p className="text-sm text-[var(--muted)] mb-3">
        Data sampel simulasi (dekomposisi CaCO3). Klik grafik untuk menandai region.
      </p>

      <div className="mb-2 flex gap-2">
        <button
          onClick={() => setAnnotateMode(!annotateMode)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            annotateMode ? "bg-[var(--primary)] text-white" : "border border-[var(--border)]"
          }`}
        >
          {annotateMode ? "Mode Anotasi AKTIF" : "Aktifkan Anotasi"}
        </button>
        {annotations.length > 0 && (
          <button
            onClick={() => setAnnotations([])}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-muted)]"
          >
            Hapus ({annotations.length})
          </button>
        )}
      </div>

      <ReactEChart
        option={option}
        style={{ height: "400px", width: "100%" }}
        onEvents={{ click: handleChartClick }}
      />

      {/* Region table */}
      {annotations.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="py-1 pr-3">No.</th>
                <th className="py-1 pr-3">Suhu (°C)</th>
                <th className="py-1 pr-3">Mass-loss (%)</th>
                <th className="py-1 pr-3">Interpretasi</th>
              </tr>
            </thead>
            <tbody>
              {annotations.map((a, i) => (
                <tr key={i} className="border-b border-[var(--outline-variant)]">
                  <td className="py-1 pr-3">{i + 1}</td>
                  <td className="py-1 pr-3 font-mono">{a.x.toFixed(0)}</td>
                  <td className="py-1 pr-3">—</td>
                  <td className="py-1 pr-3 text-[var(--muted)]">Interpretasi siswa...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 rounded-md bg-[var(--surface-muted)] p-3 text-xs">
        <p className="font-semibold">Region kunci (berdasarkan sampel):</p>
        <ul className="mt-1 space-y-0.5 text-[var(--muted)]">
          <li>• ~150°C: kehilangan air/hidrasi (≈2%)</li>
          <li>• ~700°C: dekomposisi CaCO3 → CaO + CO2 (≈44%)</li>
          <li>• Suhu onset: awal kehilangan massa signifikan</li>
        </ul>
      </div>
    </section>
  );
}

function TheoreticalWorksheet() {
  const [formula, setFormula] = useState("CaCO3");
  const [molarMass, setMolarMass] = useState(100.09);
  const [lostMass, setLostMass] = useState(44.01); // CO2
  const [experimentalLoss, setExperimentalLoss] = useState(42.5);

  const theoreticalLoss = (lostMass / molarMass) * 100;
  const error = Math.abs(experimentalLoss - theoreticalLoss);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Worksheet Teoretis vs Eksperimental</h3>
      <p className="text-sm text-[var(--muted)] mb-3">
        Hitung kehilangan massa teoretis dan bandingkan dengan eksperimental.
      </p>

      <Equation
        tex="\\text{mass loss}_{\\text{teoretis}} = \\frac{M_{\\text{hilang}}}{M_{\\text{senyawa}}} \\times 100\\%"
        label="Kehilangan Massa Teoretis"
        description="Contoh manual: CaCO3 → CaO + CO2. Massa CO2 = 44.01 g/mol, massa CaCO3 = 100.09 g/mol → teoretis ≈ 44%"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="m6-formula" className="text-sm font-medium">Rumus Senyawa</label>
          <input
            id="m6-formula"
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="m6-molar-mass" className="text-sm font-medium">Massa Molar Senyawa (g/mol)</label>
          <input
            id="m6-molar-mass"
            type="number"
            step="0.01"
            value={molarMass}
            onChange={(e) => setMolarMass(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="m6-lost-mass" className="text-sm font-medium">Massa Produk Hilang (g/mol)</label>
          <input
            id="m6-lost-mass"
            type="number"
            step="0.01"
            value={lostMass}
            onChange={(e) => setLostMass(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="m6-experimental-loss" className="text-sm font-medium">Kehilangan Eksperimental (%)</label>
          <input
            id="m6-experimental-loss"
            type="number"
            step="0.01"
            value={experimentalLoss}
            onChange={(e) => setExperimentalLoss(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-[var(--primary-light)] p-4">
        <h4 className="font-semibold text-sm text-[var(--primary-dark)]">Hasil:</h4>
        <div className="mt-2 space-y-1 text-sm">
          <p className="font-mono">
            Kehilangan teoretis = ({lostMass} / {molarMass}) × 100 = {theoreticalLoss.toFixed(2)}%
          </p>
          <p className="font-mono">
            Kehilangan eksperimental = {experimentalLoss.toFixed(2)}%
          </p>
          <p className="font-mono">
            Error = |{experimentalLoss.toFixed(2)} - {theoreticalLoss.toFixed(2)}| = {error.toFixed(2)}%
          </p>
        </div>
        <div className="mt-2 border-t border-[var(--primary)] pt-2">
          <Equation
            tex={`\\text{CaCO}_3 \\rightarrow \\text{CaO} + \\text{CO}_2 \\quad \\Delta m_{\\text{teoretis}} = ${theoreticalLoss.toFixed(2)}\\%`}
            label="Reaksi Contoh"
          />
        </div>
      </div>

      <p className="mt-3 text-xs italic text-[var(--muted)]">
        Ini adalah contoh pengajaran (CaCO3) — jangan digeneralisasi ke semua sampel. 
        Asumsi model harus disertakan dalam laporan.
      </p>

      <div className="mt-3 rounded-md bg-[var(--danger-light)] p-3 text-xs text-[var(--danger)]">
        <span aria-hidden="true" className="material-symbols-outlined align-middle text-base">report</span> Jalur "Henti dan Panggil Asisten": untuk anomali gas/perubahan tak terduga, henti instrumen dan panggil asisten.
      </div>
    </section>
  );
}
