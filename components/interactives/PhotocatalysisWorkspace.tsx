// M2 Photocatalysis Workspace — conductivity/band-gap, absorbance vs time
"use client";

import { useState } from "react";
import { Equation } from "@/components/shared/Equation";
import { ScientificChart } from "@/components/shared/ScientificChart";

export function PhotocatalysisWorkspace() {
  const [tab, setTab] = useState<"conductivity" | "photocatalysis">("conductivity");

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Worksheet Modul 2" className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {[
          { id: "conductivity", label: "Konduktivitas / Band Gap" },
          { id: "photocatalysis", label: "Fotokatalisis (Absorbansi vs Waktu)" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            aria-pressed={tab === t.id}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "bg-white text-[var(--primary-dark)] shadow-sm" : "text-[var(--muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "conductivity" && <ConductivityCalculator />}
      {tab === "photocatalysis" && <PhotocatalysisChart />}
    </div>
  );
}

function ConductivityCalculator() {
  const [resistance, setResistance] = useState(1500); // Ohm
  const [thickness, setThickness] = useState(0.15); // cm
  const [area, setArea] = useState(1.0); // cm²
  const [temperature, setTemperature] = useState(300); // K

  // σ = L / (R × A)
  const conductivity = area > 0 && resistance > 0 ? thickness / (resistance * area) : 0;
  const lnSigma = Math.log(conductivity);
  const invT = 1 / temperature;

  // Sample data for ln(σ) vs 1/T
  const sampleData = [
    { temp: 300, sigma: 0.0004 },
    { temp: 320, sigma: 0.0008 },
    { temp: 340, sigma: 0.0015 },
    { temp: 360, sigma: 0.003 },
    { temp: 380, sigma: 0.006 },
    { temp: 400, sigma: 0.012 },
  ].map((d) => ({
    x: 1000 / d.temp,
    y: Math.log(d.sigma),
  }));

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Worksheet Konduktivitas / Band Gap</h3>
      <Equation
        tex="\\sigma = \\frac{L}{R \\times A}"
        label="Konduktivitas"
        description="σ = konduktivitas (S/cm), L = tebal pelet (cm), R = resistansi (Ω), A = luas penampang (cm²)"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="m2-resistance" className="text-sm font-medium">Resistansi R (Ω)</label>
          <input
            id="m2-resistance"
            type="number" step="0.1" value={resistance}
            onChange={(e) => setResistance(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="m2-thickness" className="text-sm font-medium">Tebal Pelet L (cm)</label>
          <input
            id="m2-thickness"
            type="number" step="0.01" value={thickness}
            onChange={(e) => setThickness(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="m2-area" className="text-sm font-medium">Luas Penampang A (cm²)</label>
          <input
            id="m2-area"
            type="number" step="0.01" value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="m2-temperature" className="text-sm font-medium">Suhu T (K)</label>
          <input
            id="m2-temperature"
            type="number" value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-[var(--primary-light)] p-4">
        <h4 className="font-semibold text-sm text-[var(--primary-dark)]">Hasil:</h4>
        <div className="mt-2 space-y-1 text-sm font-mono">
          <p>σ = {thickness} / ({resistance} × {area})</p>
          <p>σ = {conductivity.toExponential(4)} S/cm</p>
          <p>ln(σ) = {lnSigma.toFixed(4)}</p>
          <p>1/T = {invT.toFixed(6)} K⁻¹</p>
        </div>
      </div>

      <Equation
        tex="\\ln(\\sigma) = \\ln(\\sigma_0) - \\frac{E_g}{2k_B T}"
        label="Hubungan Band Gap"
        description="Slope dari ln(σ) vs 1/T memberikan estimasi Eg/2k_B. Eg = band gap energy."
      />

      <div className="mt-4">
        <ScientificChart
          title="ln(σ) vs 1000/T (Data Sampel)"
          xLabel="1000/T (K⁻¹)"
          yLabel="ln(σ)"
          series={[{ name: "Data sampel", color: "#6366f1", points: sampleData }]}
          height={300}
        />
      </div>

      <p className="mt-2 text-xs italic text-[var(--muted)]">
        Manual menggunakan workflow ln(σ) dan slope 1/T. Jangan mengasumsikan model material yang tidak disetujui.
      </p>
    </section>
  );
}

function PhotocatalysisChart() {
  // Sample absorbance vs time data (methylene blue degradation)
  const sampleData = [
    { time: 0, absorbance: 1.20 },
    { time: 15, absorbance: 1.08 },
    { time: 30, absorbance: 0.95 },
    { time: 45, absorbance: 0.82 },
    { time: 60, absorbance: 0.70 },
    { time: 75, absorbance: 0.58 },
    { time: 90, absorbance: 0.48 },
    { time: 105, absorbance: 0.40 },
    { time: 120, absorbance: 0.33 },
  ];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Analisis Fotokatalisis</h3>
      <p className="text-sm text-[var(--muted)] mb-3">
        Plot absorbansi (metilen biru) terhadap waktu penyinaran UV. Data sampel.
      </p>

      <ScientificChart
        title="Degradasi Metilen Biru vs Waktu"
        xLabel="Waktu (menit)"
        yLabel="Absorbansi"
        series={[
          { name: "Absorbansi", color: "#6366f1", points: sampleData.map((d) => ({ x: d.time, y: d.absorbance })) },
        ]}
        height={350}
      />

      <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
        <p className="font-semibold">Interpretasi:</p>
        <p className="text-[var(--muted)]">
          Penurunan absorbansi menunjukkan degradasi metilen biru oleh fotokatalis Mg2SnO4 di bawah UV.
          Bandingkan dengan kontrol (dark) jika protokol menetapkan.
        </p>
      </div>

      <p className="mt-2 text-xs italic text-[var(--muted)]">
        Siswa harus menyatakan klaim dengan bukti grafik terlampir dan kaveat.
      </p>
    </section>
  );
}
