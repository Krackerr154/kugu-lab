// M3 Electrodeposition Calculator — current efficiency, cell explorer
"use client";

import { useState } from "react";
import { Equation } from "@/components/shared/Equation";

// Faraday constant: 96485 C/mol
const F = 96485;

export function ElectrodepositionCalculator() {
  // Current efficiency calculator inputs
  const [metal, setMetal] = useState("Cu");
  const [valence, setValence] = useState(2);
  const [molarMass, setMolarMass] = useState(63.55);
  const [current, setCurrent] = useState(0.5); // A
  const [time, setTime] = useState(3600); // seconds
  const [actualMass, setActualMass] = useState(0.45); // grams
  const [area, setArea] = useState(4.0); // cm2
  const [massBefore, setMassBefore] = useState(5.000);
  const [massAfter, setMassAfter] = useState(5.450);

  // Calculations
  const totalCharge = current * time; // Q = I × t
  const molesElectrons = totalCharge / F;
  const molesMetal = molesElectrons / valence;
  const theoreticalMass = molesMetal * molarMass;
  const actualDelta = massAfter - massBefore;
  const efficiency = theoreticalMass > 0 ? (actualDelta / theoreticalMass) * 100 : 0;
  const currentDensity = area > 0 ? current / area : 0;

  const metals = [
    { name: "Cu", valence: 2, molarMass: 63.55 },
    { name: "Sn", valence: 2, molarMass: 118.71 },
    { name: "Bi", valence: 3, molarMass: 208.98 },
    { name: "Zn", valence: 2, molarMass: 65.38 },
    { name: "Ag", valence: 1, molarMass: 107.87 },
  ];

  const handleMetalChange = (name: string) => {
    const m = metals.find((m) => m.name === name);
    if (m) {
      setMetal(m.name);
      setValence(m.valence);
      setMolarMass(m.molarMass);
    }
  };

  return (
    <div className="space-y-4">
      {/* Interactive cell map */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-4">
        <h3 className="text-lg font-bold">Peta Interaktif Sel Elektrokimia</h3>
        <p className="text-sm text-[var(--muted)] mb-3">Klik komponen untuk penjelasan.</p>
        <CellExplorer />
      </section>

      {/* Current efficiency calculator */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-4">
        <h3 className="text-lg font-bold">Kalkulator Efisiensi Arus</h3>
        <p className="text-sm text-[var(--muted)] mb-3">
          Berdasarkan Hukum Faraday: massa teoretis = (I × t × M) / (n × F)
        </p>

        <Equation
          tex="m_{teoretis} = \\frac{I \\times t \\times M}{n \\times F}"
          label="Persamaan Faraday"
          description="I = arus (A), t = waktu (s), M = massa molar (g/mol), n = valensi, F = konstanta Faraday (96485 C/mol)"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="m3-metal" className="text-sm font-medium">Logam Endapan</label>
            <select
              id="m3-metal"
              value={metal}
              onChange={(e) => handleMetalChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
            >
              {metals.map((m) => (
                <option key={m.name} value={m.name}>{m.name} (n={m.valence}, M={m.molarMass})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="m3-valence" className="text-sm font-medium">Valensi (n)</label>
            <input
              id="m3-valence"
              type="number"
              value={valence}
              onChange={(e) => setValence(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="m3-molar-mass" className="text-sm font-medium">Massa Molar (g/mol)</label>
            <input
              id="m3-molar-mass"
              type="number"
              step="0.01"
              value={molarMass}
              onChange={(e) => setMolarMass(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="m3-current" className="text-sm font-medium">Arus (A)</label>
            <input
              id="m3-current"
              type="number"
              step="0.01"
              value={current}
              onChange={(e) => setCurrent(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="m3-time" className="text-sm font-medium">Waktu (detik)</label>
            <input
              id="m3-time"
              type="number"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="m3-area" className="text-sm font-medium">Luas Katoda (cm²)</label>
            <input
              id="m3-area"
              type="number"
              step="0.01"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="m3-mass-before" className="text-sm font-medium">Massa Katoda Sebelum (g)</label>
            <input
              id="m3-mass-before"
              type="number"
              step="0.001"
              value={massBefore}
              onChange={(e) => setMassBefore(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="m3-mass-after" className="text-sm font-medium">Massa Katoda Sesudah (g)</label>
            <input
              id="m3-mass-after"
              type="number"
              step="0.001"
              value={massAfter}
              onChange={(e) => setMassAfter(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-4 rounded-lg bg-[var(--surface-muted)] p-4">
          <h4 className="font-semibold text-sm mb-2">Hasil Perhitungan:</h4>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-[var(--muted)]">Total muatan (Q = I × t):</span>
              <br />
              <span className="font-mono font-bold">{totalCharge.toFixed(2)} C</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Mol elektron (Q/F):</span>
              <br />
              <span className="font-mono font-bold">{molesElectrons.toExponential(4)} mol</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Mol logam teoretis:</span>
              <br />
              <span className="font-mono font-bold">{molesMetal.toExponential(4)} mol</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Massa teoretis:</span>
              <br />
              <span className="font-mono font-bold">{theoreticalMass.toFixed(4)} g</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Massa aktual (sesudah - sebelum):</span>
              <br />
              <span className="font-mono font-bold">{actualDelta.toFixed(4)} g</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Rapat arus (I/A):</span>
              <br />
              <span className="font-mono font-bold">{currentDensity.toFixed(4)} A/cm²</span>
            </div>
          </div>
          <div className="mt-3 rounded-md bg-[var(--primary-light)] p-3">
            <Equation
              tex="\\eta = \\frac{m_{aktual}}{m_{teoretis}} \\times 100\\%"
              label="Efisiensi Arus"
            />
            <p className="mt-2 text-2xl font-bold text-[var(--primary-dark)]">
              η = {efficiency.toFixed(2)}%
            </p>
            {efficiency > 100 && (
              <p className="mt-1 text-xs text-[var(--danger)]">
                <span aria-hidden="true">⚠️</span> Efisiensi &gt; 100% menunjukkan kesalahan pengukuran atau deposit non-logam. Periksa pengukuran dan asumsi valensi.
              </p>
            )}
          </div>
        </div>

        <p className="mt-3 text-xs italic text-[var(--muted)]">
          Untuk paduan Sn-Bi, asumsi valensi/stokiometri harus ditentukan instruktur karena deposit campuran menyulitkan perhitungan tunggal.
        </p>
      </section>
    </div>
  );
}

// Interactive cell diagram
function CellExplorer() {
  const [selected, setSelected] = useState<string | null>(null);

  const components: Record<string, { name: string; description: string }> = {
    anode: { name: "Anoda (+)", description: "Elektroda positif dalam sel elektrolisis. Tempat oksidasi. Dalam elektrodeposisi Sn-Bi, anoda bisa berupa logam yang akan larut atau elektroda inert." },
    cathode: { name: "Katoda (-)", description: "Elektroda negatif. Tempat reduksi. Logam (Sn, Bi) diendapkan di katoda. Massa katoda bertambah setelah elektrodeposisi." },
    electrolyte: { name: "Elektrolit", description: "Larutan mengandung ion logam yang akan diendapkan (misal Larutan A, B, C). Agen pengompleks mengontrol laju deposisi dan keseragaman fasa paduan." },
    dcSource: { name: "Sumber DC", description: "Catu daya arus searah yang menyediakan arus konstan. Rapat arus diatur sesuai protokol. Jangan melebihi arus yang disetujui." },
    leads: { name: "Kabel Penghubung", description: "Kabel penghantar dari sumber DC ke elektroda. Pastikan polaritas benar sebelum menyalakan." },
  };

  return (
    <div>
      <div className="relative mx-auto max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <svg viewBox="0 0 300 200" className="w-full" role="img" aria-label="Diagram sel elektrokimia">
          {/* DC Source */}
          <rect
            x="120" y="10" width="60" height="30" rx="4"
            fill={selected === "dcSource" ? "#fcd400" : "#e1e3e4"}
            stroke="#74777f" strokeWidth="2"
            onClick={() => setSelected("dcSource")}
            className="cursor-pointer"
          />
          <text x="150" y="30" textAnchor="middle" fontSize="10" fill="#191c1d">DC</text>

          {/* Wires */}
          <line x1="120" y1="25" x2="60" y2="25" stroke="#74777f" strokeWidth="2" />
          <line x1="60" y1="25" x2="60" y2="70" stroke="#74777f" strokeWidth="2" />
          <line x1="180" y1="25" x2="240" y2="25" stroke="#74777f" strokeWidth="2" />
          <line x1="240" y1="25" x2="240" y2="70" stroke="#74777f" strokeWidth="2" />

          {/* Anode (left) */}
          <rect
            x="50" y="70" width="20" height="60" rx="2"
            fill={selected === "anode" ? "#ba1a1a" : "#74777f"}
            stroke="#74777f" strokeWidth="2"
            onClick={() => setSelected("anode")}
            className="cursor-pointer"
          />
          <text x="60" y="145" textAnchor="middle" fontSize="9" fill="#ba1a1a" fontWeight="bold">Anoda (+)</text>

          {/* Cathode (right) */}
          <rect
            x="230" y="70" width="20" height="60" rx="2"
            fill={selected === "cathode" ? "#15803d" : "#74777f"}
            stroke="#74777f" strokeWidth="2"
            onClick={() => setSelected("cathode")}
            className="cursor-pointer"
          />
          <text x="240" y="145" textAnchor="middle" fontSize="9" fill="#15803d" fontWeight="bold">Katoda (-)</text>

          {/* Electrolyte vessel */}
          <rect x="40" y="70" width="220" height="80" rx="4" fill="none" stroke="#74777f" strokeWidth="2" />
          <rect
            x="70" y="75" width="160" height="70"
            fill={selected === "electrolyte" ? "#001f3f" : "#afc8f0"}
            fillOpacity="0.3"
            onClick={() => setSelected("electrolyte")}
            className="cursor-pointer"
          />
          <text x="150" y="115" textAnchor="middle" fontSize="9" fill="#001f3f">Elektrolit</text>

          {/* Lead labels */}
          <text x="90" y="20" fontSize="8" fill="#74777f" onClick={() => setSelected("leads")} className="cursor-pointer">kabel</text>
          <text x="210" y="20" fontSize="8" fill="#74777f" onClick={() => setSelected("leads")} className="cursor-pointer">kabel</text>

          {/* Electron flow arrows */}
          <text x="100" y="45" fontSize="8" fill="#705d00">e⁻ →</text>
          <text x="195" y="45" fontSize="8" fill="#705d00">← e⁻</text>
        </svg>
      </div>

      {selected ? (
        <div className="mt-3 rounded-md bg-[var(--primary-light)] p-3 text-sm">
          <p className="font-bold text-[var(--primary-dark)]">{components[selected].name}</p>
          <p className="text-[var(--text-primary)]">{components[selected].description}</p>
        </div>
      ) : (
        <p className="mt-3 text-center text-sm text-[var(--muted)]">Klik komponen pada diagram untuk penjelasan.</p>
      )}
    </div>
  );
}
