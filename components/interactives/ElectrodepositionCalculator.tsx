// M3 Electrodeposition Calculator — current efficiency, cell explorer
"use client";

import { useState } from "react";
import { Equation } from "@/components/shared/Equation";
import { ElectrochemicalCellExplorer } from "@/components/interactives/ElectrochemicalCellExplorer";

// Faraday constant: 96485 C/mol
const F = 96485;

// Protocol operating point from Penuntun Praktikum KI3131, Modul 3 (p. 19-20):
// "mengalirkan arus listrik sebesar 14,5 mA/cm² selama 15 menit".
const PROTOCOL_CURRENT_DENSITY_MA = 14.5; // mA/cm²
const PROTOCOL_DURATION_S = 900; // 15 minutes

export function ElectrodepositionCalculator() {
  // Defaults reproduce the manual's operating point rather than a round-number
  // placeholder: a 4.00 cm² cathode at 14,5 mA/cm² draws 0.058 A for 900 s.
  // The deposit is Sn-Bi, so the default metal is Sn — not the Cu substrate.
  const [metal, setMetal] = useState("Sn");
  const [valence, setValence] = useState(2);
  const [molarMass, setMolarMass] = useState(118.71);
  const [current, setCurrent] = useState(0.058); // A
  const [time, setTime] = useState(PROTOCOL_DURATION_S); // seconds
  const [area, setArea] = useState(4.0); // cm2
  const [massBefore, setMassBefore] = useState(5.0);
  const [massAfter, setMassAfter] = useState(5.028);

  // Alloy mode (audit item 4). The manual deposits Sn AND Bi together but gives
  // no target composition, and states the efficiency formula with no
  // stoichiometry. content.md M3.5 requires instructor-provided valence
  // assumptions when mixed deposition makes a single calculation inadequate, so
  // the composition is an input the student sets and must have signed off —
  // never a hardcoded default that would look authoritative.
  const [alloyMode, setAlloyMode] = useState(false);
  const [molePercentSn, setMolePercentSn] = useState(50);

  const SN = { valence: 2, molarMass: 118.71 };
  const BI = { valence: 3, molarMass: 208.98 };

  const xSn = molePercentSn / 100;
  const xBi = 1 - xSn;
  const alloyValid = Number.isFinite(molePercentSn) && molePercentSn >= 0 && molePercentSn <= 100;

  // Mole-fraction weighted equivalents. Charge per mole of deposited metal is
  // the weighted valence; mass per mole is the weighted molar mass. Both reduce
  // to the pure-metal values at x = 0 and x = 1.
  const equivalentValence = alloyValid ? xSn * SN.valence + xBi * BI.valence : null;
  const equivalentMolarMass = alloyValid ? xSn * SN.molarMass + xBi * BI.molarMass : null;

  // The active (n, M) pair: alloy equivalents when alloy mode is on, otherwise
  // the single-metal values from the dropdown.
  const effectiveValence = alloyMode && equivalentValence !== null ? equivalentValence : valence;
  const effectiveMolarMass =
    alloyMode && equivalentMolarMass !== null ? equivalentMolarMass : molarMass;

  // Faraday's law only has meaning for strictly positive n, M, I, t and A.
  // Without these guards n = 0 produced "Massa teoretis: Infinity" and a
  // negative valence produced a negative theoretical mass, both silently.
  const errors = {
    valence:
      alloyMode
        ? null
        : !Number.isFinite(valence) || valence < 1
        ? "Valensi (n) harus bilangan positif ≥ 1."
        : null,
    molarMass:
      alloyMode
        ? null
        : !Number.isFinite(molarMass) || molarMass <= 0
        ? "Massa molar harus lebih besar dari 0."
        : null,
    alloy:
      alloyMode && !alloyValid
        ? "Fraksi mol Sn harus berada antara 0% dan 100%."
        : null,
    current:
      !Number.isFinite(current) || current <= 0
        ? "Arus harus lebih besar dari 0."
        : null,
    time:
      !Number.isFinite(time) || time <= 0
        ? "Waktu harus lebih besar dari 0."
        : null,
    area:
      !Number.isFinite(area) || area <= 0
        ? "Luas katoda harus lebih besar dari 0."
        : null,
  };
  const errorList = Object.values(errors).filter((e): e is string => e !== null);
  const isValid = errorList.length === 0;

  // Every derived value is null while the inputs are unphysical, so the results
  // panel shows "—" instead of Infinity, NaN, or a negative mass.
  const totalCharge = isValid ? current * time : null;
  const molesElectrons = totalCharge !== null ? totalCharge / F : null;
  const molesMetal = molesElectrons !== null ? molesElectrons / effectiveValence : null;
  const theoreticalMass = molesMetal !== null ? molesMetal * effectiveMolarMass : null;
  const currentDensity = isValid ? current / area : null;
  const currentDensityMa = currentDensity !== null ? currentDensity * 1000 : null;

  const actualDelta = massAfter - massBefore;
  const efficiency =
    theoreticalMass !== null && theoreticalMass > 0
      ? (actualDelta / theoreticalMass) * 100
      : null;

  const offProtocol =
    currentDensityMa !== null && Math.abs(currentDensityMa - PROTOCOL_CURRENT_DENSITY_MA) > 0.5;

  const metals = [
    { name: "Sn", valence: 2, molarMass: 118.71 },
    { name: "Bi", valence: 3, molarMass: 208.98 },
    { name: "Cu", valence: 2, molarMass: 63.55 },
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

  // Protocol specifies a current DENSITY; the current a student sets on the
  // power supply depends on their own measured plate area.
  const applyProtocolCurrent = () => {
    if (!Number.isFinite(area) || area <= 0) return;
    setCurrent(Number(((PROTOCOL_CURRENT_DENSITY_MA / 1000) * area).toFixed(4)));
    setTime(PROTOCOL_DURATION_S);
  };

  const fieldClass = (hasError: boolean) =>
    `mt-1 w-full rounded-md border p-2 text-sm ${
      hasError ? "border-[var(--error)] bg-[var(--error-container)]/20" : "border-[var(--border)]"
    }`;

  const show = (value: number | null, format: (n: number) => string) =>
    value === null ? "—" : format(value);

  return (
    <div className="space-y-4">
      {/* Interactive cell map, half-reactions, and reduction-potential comparison */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-4">
        <h3 className="text-lg font-bold">Peta Interaktif Sel Elektrokimia</h3>
        <p className="text-sm text-[var(--muted)] mb-3">
          Pilih komponen untuk melihat penjelasan, setengah-reaksi, dan potensial reduksinya.
        </p>
        <ElectrochemicalCellExplorer />
      </section>

      {/* Current efficiency calculator */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-4">
        <h3 className="text-lg font-bold">Kalkulator Efisiensi Arus</h3>
        <p className="text-sm text-[var(--muted)] mb-3">
          Berdasarkan Hukum Faraday: massa teoretis = (I × t × M) / (n × F)
        </p>

        <Equation
          tex={"m_{teoretis} = \\frac{I \\times t \\times M}{n \\times F}"}
          label="Persamaan Faraday"
          description="I = arus (A), t = waktu (s), M = massa molar (g/mol), n = valensi, F = konstanta Faraday (96485 C/mol)"
        />

        {/* Protocol operating point — keeps the prefilled numbers honest */}
        <div className="mt-4 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-muted)] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Titik kerja protokol
              </p>
              <p className="mt-0.5 text-sm text-[var(--text-primary)]">
                14,5 mA/cm² selama 15 menit (900 s) — Modul 3, prosedur elektrodeposisi.
              </p>
            </div>
            <button
              type="button"
              onClick={applyProtocolCurrent}
              className="shrink-0 rounded-lg bg-[var(--primary-container)] px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
            >
              Hitung arus dari luas katoda
            </button>
          </div>
        </div>

        {/* Alloy composition (audit item 4) — Sn and Bi codeposit, so a single
            (n, M) pair is not defensible without a stated assumption. */}
        <div className="mt-3 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-muted)] p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Mode paduan Sn-Bi
              </p>
              <p className="mt-0.5 text-sm text-[var(--text-primary)]">
                Deposit modul ini adalah paduan, bukan logam tunggal. Aktifkan untuk menghitung n dan
                M ekuivalen dari komposisi yang Anda asumsikan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAlloyMode((v) => !v)}
              aria-pressed={alloyMode}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] ${
                alloyMode
                  ? "bg-[var(--secondary)] text-[var(--on-primary)]"
                  : "border border-[var(--border)] text-[var(--text-primary)]"
              }`}
            >
              {alloyMode ? "Mode paduan aktif" : "Aktifkan mode paduan"}
            </button>
          </div>

          {alloyMode && (
            <div className="mt-3 border-t border-[var(--outline-variant)] pt-3">
              <label htmlFor="m3-alloy-sn" className="text-sm font-medium">
                Fraksi mol Sn dalam deposit (x_Sn)
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="m3-alloy-sn"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={molePercentSn}
                  onChange={(e) => setMolePercentSn(Number(e.target.value))}
                  className="flex-1 min-w-0"
                  aria-describedby="m3-alloy-readout"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={molePercentSn}
                  onChange={(e) => setMolePercentSn(Number(e.target.value))}
                  aria-label="Fraksi mol Sn dalam persen"
                  aria-invalid={errors.alloy !== null}
                  /* Not fieldClass(): its `w-full` beats the `w-20` here in the
                     generated stylesheet, which collapsed the range slider to
                     0 px wide. Width classes are spelled out explicitly. */
                  className={`w-20 shrink-0 rounded-md border p-2 text-sm ${
                    errors.alloy !== null
                      ? "border-[var(--error)] bg-[var(--error-container)]/20"
                      : "border-[var(--border)]"
                  }`}
                />
              </div>
              <p id="m3-alloy-readout" className="mt-2 text-sm text-[var(--text-primary)]">
                x<sub>Sn</sub> = {xSn.toFixed(2)} · x<sub>Bi</sub> = {xBi.toFixed(2)} →{" "}
                <span className="font-mono font-bold">
                  n<sub>ekuiv</sub> ={" "}
                  {equivalentValence === null ? "—" : equivalentValence.toFixed(3)}
                </span>
                {" · "}
                <span className="font-mono font-bold">
                  M<sub>ekuiv</sub> ={" "}
                  {equivalentMolarMass === null ? "—" : equivalentMolarMass.toFixed(2)} g/mol
                </span>
              </p>
              {errors.alloy && (
                <p className="mt-1 text-xs font-medium text-[var(--error)]">{errors.alloy}</p>
              )}
              <p className="mt-2 text-xs text-[var(--muted)]">
                n<sub>ekuiv</sub> = x<sub>Sn</sub>·2 + x<sub>Bi</sub>·3 dan M<sub>ekuiv</sub> = x
                <sub>Sn</sub>·118,71 + x<sub>Bi</sub>·208,98 — rata-rata berbobot fraksi mol, yang
                kembali menjadi nilai logam murni pada x = 0 atau x = 1.
              </p>
              <p className="mt-2 rounded-md border border-[var(--secondary)]/40 bg-[var(--secondary-container)]/15 p-2 text-xs font-medium text-[var(--warning-ink)]">
                Penuntun tidak menetapkan komposisi target Sn:Bi. Angka di atas adalah{" "}
                <strong>asumsi Anda</strong> dan harus dikonfirmasi asisten sebelum dipakai di
                laporan. Komposisi sebenarnya hanya dapat ditentukan dari karakterisasi (XRD/EDS pada
                Modul 5), bukan diasumsikan.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="m3-metal" className="text-sm font-medium">Logam Endapan</label>
            <select
              id="m3-metal"
              value={metal}
              disabled={alloyMode}
              onChange={(e) => handleMetalChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm disabled:opacity-50"
            >
              {metals.map((m) => (
                <option key={m.name} value={m.name}>{m.name} (n={m.valence}, M={m.molarMass})</option>
              ))}
            </select>
            {alloyMode && (
              <p className="mt-1 text-xs text-[var(--muted)]">
                Nonaktif: mode paduan memakai n dan M ekuivalen dari komposisi di atas.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="m3-valence" className="text-sm font-medium">Valensi (n)</label>
            <input
              id="m3-valence"
              type="number"
              min="1"
              step="1"
              value={alloyMode && equivalentValence !== null ? equivalentValence.toFixed(3) : valence}
              disabled={alloyMode}
              aria-invalid={errors.valence !== null}
              aria-describedby={errors.valence ? "m3-valence-error" : undefined}
              onChange={(e) => setValence(Number(e.target.value))}
              className={`${fieldClass(errors.valence !== null)} disabled:opacity-50`}
            />
            {errors.valence && (
              <p id="m3-valence-error" className="mt-1 text-xs font-medium text-[var(--error)]">
                {errors.valence}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="m3-molar-mass" className="text-sm font-medium">Massa Molar (g/mol)</label>
            <input
              id="m3-molar-mass"
              type="number"
              min="0"
              step="0.01"
              value={
                alloyMode && equivalentMolarMass !== null
                  ? equivalentMolarMass.toFixed(2)
                  : molarMass
              }
              disabled={alloyMode}
              aria-invalid={errors.molarMass !== null}
              aria-describedby={errors.molarMass ? "m3-molar-mass-error" : undefined}
              onChange={(e) => setMolarMass(Number(e.target.value))}
              className={fieldClass(errors.molarMass !== null)}
            />
            {errors.molarMass && (
              <p id="m3-molar-mass-error" className="mt-1 text-xs font-medium text-[var(--error)]">
                {errors.molarMass}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="m3-current" className="text-sm font-medium">Arus (A)</label>
            <input
              id="m3-current"
              type="number"
              min="0"
              step="0.001"
              value={current}
              aria-invalid={errors.current !== null}
              aria-describedby={errors.current ? "m3-current-error" : undefined}
              onChange={(e) => setCurrent(Number(e.target.value))}
              className={fieldClass(errors.current !== null)}
            />
            {errors.current && (
              <p id="m3-current-error" className="mt-1 text-xs font-medium text-[var(--error)]">
                {errors.current}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="m3-time" className="text-sm font-medium">Waktu (detik)</label>
            <input
              id="m3-time"
              type="number"
              min="0"
              step="1"
              value={time}
              aria-invalid={errors.time !== null}
              aria-describedby={errors.time ? "m3-time-error" : undefined}
              onChange={(e) => setTime(Number(e.target.value))}
              className={fieldClass(errors.time !== null)}
            />
            {errors.time && (
              <p id="m3-time-error" className="mt-1 text-xs font-medium text-[var(--error)]">
                {errors.time}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="m3-area" className="text-sm font-medium">Luas Katoda (cm²)</label>
            <input
              id="m3-area"
              type="number"
              min="0"
              step="0.01"
              value={area}
              aria-invalid={errors.area !== null}
              aria-describedby={errors.area ? "m3-area-error" : undefined}
              onChange={(e) => setArea(Number(e.target.value))}
              className={fieldClass(errors.area !== null)}
            />
            {errors.area && (
              <p id="m3-area-error" className="mt-1 text-xs font-medium text-[var(--error)]">
                {errors.area}
              </p>
            )}
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

          {!isValid && (
            <div role="alert" className="mb-3 rounded-md border border-[var(--error)] bg-[var(--error-container)]/30 p-3">
              <p className="text-sm font-semibold text-[var(--error)]">
                Input belum valid — perhitungan dihentikan.
              </p>
              <ul className="mt-1 list-disc list-inside text-xs text-[var(--on-surface)]">
                {errorList.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-[var(--muted)]">Total muatan (Q = I × t):</span>
              <br />
              <span className="font-mono font-bold">{show(totalCharge, (n) => `${n.toFixed(2)} C`)}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Mol elektron (Q/F):</span>
              <br />
              <span className="font-mono font-bold">{show(molesElectrons, (n) => `${n.toExponential(4)} mol`)}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Mol logam teoretis:</span>
              <br />
              <span className="font-mono font-bold">{show(molesMetal, (n) => `${n.toExponential(4)} mol`)}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Massa teoretis:</span>
              <br />
              <span className="font-mono font-bold">{show(theoreticalMass, (n) => `${n.toFixed(4)} g`)}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Massa aktual (sesudah − sebelum):</span>
              <br />
              <span className="font-mono font-bold">{actualDelta.toFixed(4)} g</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Rapat arus (I/A):</span>
              <br />
              <span className="font-mono font-bold">
                {show(currentDensityMa, (n) => `${n.toFixed(2)} mA/cm²`)}
                {currentDensity !== null && (
                  <span className="ml-2 font-normal text-[var(--muted)]">
                    ({currentDensity.toFixed(4)} A/cm²)
                  </span>
                )}
              </span>
              {offProtocol && (
                <p className="mt-1 text-xs font-medium text-[var(--warning-ink)]">
                  Berbeda dari titik kerja protokol 14,5 mA/cm². Pastikan penyimpangan ini disengaja
                  dan dicatat sebagai deviasi.
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 rounded-md bg-[var(--primary-light)] p-3">
            <Equation
              tex={"\\eta = \\frac{m_{aktual}}{m_{teoretis}} \\times 100\\%"}
              label="Efisiensi Arus"
            />
            <p className="mt-2 text-2xl font-bold text-[var(--primary-dark)]">
              η = {efficiency === null ? "—" : `${efficiency.toFixed(2)}%`}
            </p>
            {efficiency !== null && efficiency > 100 && (
              <p className="mt-1 text-xs text-[var(--danger)]">
                <span aria-hidden="true">⚠️</span> Efisiensi &gt; 100% menunjukkan kesalahan pengukuran atau deposit non-logam. Periksa pengukuran dan asumsi valensi.
              </p>
            )}
            {efficiency !== null && efficiency <= 0 && (
              <p className="mt-1 text-xs text-[var(--danger)]">
                <span aria-hidden="true">⚠️</span> Massa katoda tidak bertambah. Periksa polaritas, kontak listrik, dan apakah arus benar-benar mengalir.
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
