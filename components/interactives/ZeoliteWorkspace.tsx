// M4 Zeolite Synthesis Workspace — condition explorer, stoichiometry
"use client";

import { useState } from "react";

export function ZeoliteWorkspace() {
  const [tab, setTab] = useState<"stoichiometry" | "conditions">("stoichiometry");

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Worksheet Modul 4" className="flex gap-1 rounded-lg bg-[var(--surface-muted)] p-1">
        {[
          { id: "stoichiometry", label: "Stoikiometri Prekursor" },
          { id: "conditions", label: "Penjelajah Kondisi" },
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

      {tab === "stoichiometry" && <StoichiometryWorksheet />}
      {tab === "conditions" && <ConditionExplorer />}
    </div>
  );
}

function StoichiometryWorksheet() {
  const [reagents, setReagents] = useState([
    { name: "NaOH", mass: 4.0, molarMass: 40.0 },
    { name: "NaAlO2 (sodium aluminate)", mass: 8.2, molarMass: 81.97 },
    { name: "Silica gel (SiO2)", mass: 12.0, molarMass: 60.08 },
    { name: "H2O", mass: 100.0, molarMass: 18.0 },
  ]);

  const updateMass = (i: number, mass: number) => {
    const updated = [...reagents];
    updated[i] = { ...updated[i], mass };
    setReagents(updated);
  };

  const moles = reagents.map((r) => ({ ...r, moles: r.mass / r.molarMass }));
  const maxMoles = Math.max(...moles.map((m) => m.moles));
  const ratios = moles.map((m) => ({
    ...m,
    ratio: maxMoles > 0 ? m.moles / maxMoles : 0,
  }));

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Workspace Stoikiometri Prekursor</h3>
      <p className="text-sm text-[var(--muted)] mb-3">
        Gunakan formula resep yang disetujui. Catat massa aktual dan hitung rasio molar.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="py-2 pr-3">Pereaksi</th>
              <th className="py-2 pr-3">Massa (g)</th>
              <th className="py-2 pr-3">Massa Molar (g/mol)</th>
              <th className="py-2 pr-3">Mol</th>
              <th className="py-2 pr-3">Rasio</th>
            </tr>
          </thead>
          <tbody>
            {ratios.map((r, i) => (
              <tr key={i} className="border-b border-[var(--outline-variant)]">
                <td className="py-1.5 pr-3 font-medium">{r.name}</td>
                <td className="py-1.5 pr-3">
                  <input
                    aria-label={`Massa ${r.name} dalam gram`}
                    type="number" step="0.01" value={r.mass}
                    onChange={(e) => updateMass(i, Number(e.target.value))}
                    className="w-20 rounded border border-[var(--border)] p-1 text-sm"
                  />
                </td>
                <td className="py-1.5 pr-3 font-mono">{r.molarMass.toFixed(2)}</td>
                <td className="py-1.5 pr-3 font-mono">{r.moles.toFixed(4)}</td>
                <td className="py-1.5 pr-3 font-mono">{r.ratio.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[var(--muted)]">
        Rasio molar menunjukkan komposisi relatif prekursor. Rasio Si/Al dari resep ini menentukan tipe zeolit FAU (X atau Y).
      </p>

      <div className="mt-3 rounded-md bg-[var(--secondary-container)]/25 p-2 text-xs text-[var(--warning-ink)]">
        <span aria-hidden="true">⚠️</span> Perhatian: Sintesis menggunakan botol polipropilena (PP). 
        Rating wadah, kerapatan tutup, fraksi pengisian, serta batas suhu/tekanan harus selalu diverifikasi bersama instruktur.
      </div>
    </section>
  );
}

function ConditionExplorer() {
  const [temperature, setTemperature] = useState(100);
  const [time, setTime] = useState(24);
  const [siAlRatio, setSiAlRatio] = useState(2.5);

  // Informational model — NOT predictive
  const nucleationRate = (temperature: number) => Math.exp((temperature - 80) / 20);
  const crystallinity = Math.min(100, (nucleationRate(temperature) * time * 0.5) + (siAlRatio > 1.5 ? 10 : 0));

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Penjelajah Kondisi Sintesis</h3>
      <div className="mb-3 rounded-md bg-[var(--accent-light)] p-2 text-xs text-[var(--info-ink)]">
        <span aria-hidden="true">ℹ️</span> Ini adalah model konsep untuk pembelajaran — BUKAN mesin prediksi eksperimental. 
        Hubungan aktual ditentukan oleh kondisi laboratorium yang disetujui.
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="m4-temperature" className="text-sm font-medium">Suhu Kristalisasi (°C)</label>
          <input
            id="m4-temperature"
            type="range" min="80" max="200" value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="mt-1 w-full"
          />
          <span className="text-sm font-mono">{temperature}°C</span>
        </div>
        <div>
          <label htmlFor="m4-time" className="text-sm font-medium">Waktu Kristalisasi (jam)</label>
          <input
            id="m4-time"
            type="range" min="6" max="72" value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className="mt-1 w-full"
          />
          <span className="text-sm font-mono">{time} jam</span>
        </div>
        <div>
          <label htmlFor="m4-sial-ratio" className="text-sm font-medium">Rasio Si/Al</label>
          <input
            id="m4-sial-ratio"
            type="range" min="1" max="5" step="0.1" value={siAlRatio}
            onChange={(e) => setSiAlRatio(Number(e.target.value))}
            className="mt-1 w-full"
          />
          <span className="text-sm font-mono">{siAlRatio.toFixed(1)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-[var(--surface-muted)] p-4">
        <h4 className="font-semibold text-sm">Prediksi Konseptual:</h4>
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Tingkat nukleasi (relatif):</span>
            <span className="font-mono font-bold">{nucleationRate(temperature).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Indeks kristalinitas (konseptual):</span>
            <span className="font-mono font-bold">{crystallinity.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Tipe FAU yang mungkin:</span>
            <span className="font-mono font-bold">{siAlRatio < 1.5 ? "Zeolit X" : "Zeolit Y"}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-[var(--surface-muted)] p-3 text-xs">
        <p className="font-semibold">Konteks teoritis:</p>
        <ul className="mt-1 space-y-0.5 text-[var(--muted)]">
          <li>• Suhu lebih tinggi → nukleasi lebih cepat, tetapi kristalitas bergantung pada kondisi sebenarnya</li>
          <li>• Waktu yang lebih lama umumnya meningkatkan pertumbuhan kristal</li>
          <li>• Rasio Si/Al menentukan tipe zeolit FAU (X: Si/Al &lt; 1.5, Y: Si/Al &gt; 1.5)</li>
        </ul>
      </div>
    </section>
  );
}
