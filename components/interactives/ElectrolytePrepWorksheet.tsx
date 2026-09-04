// ElectrolytePrepWorksheet — M3 Larutan A/B/C preparation worksheet.
//
// Three jobs the module page could not do:
//  1. State the concentration BASIS explicitly. The manual's table is ambiguous
//     (molarity printed above a sub-solution volume); misreading it costs ~18x
//     on the SnCl2 mass. Every row shows the verification arithmetic.
//  2. Derive PEG400, which the manual gives only as "0,20 M akhir" — no mass,
//     no volume. Students must compute 0,020 mol -> 8,0 g -> ~7,1 mL themselves.
//  3. Enforce the order of addition as a gated checklist: A into B, then (A+B)
//     into C, then PEG400, then NH3, then dilute, then verify pH ~2.
"use client";

import { useState } from "react";
import { ChemText } from "@/components/shared/ChemText";
import {
  ADDITION_ORDER,
  FINAL_VOLUME_ML,
  PEG400,
  SOLUTIONS,
  TARGET_PH,
  VOLUME_BUDGET,
  molarityInFinalVolume,
  molesFromMass,
} from "@/lib/m3-electrolyte";

const fmt = (n: number, digits: number) =>
  n.toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function ElectrolytePrepWorksheet() {
  const [openSolution, setOpenSolution] = useState<"A" | "B" | "C">("A");
  const [done, setDone] = useState<Set<string>>(new Set());

  const toggleStep = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // The order matters chemically, so a step only unlocks once the previous one
  // is ticked. This mirrors the manual's sequence b -> g.
  const firstIncompleteIndex = ADDITION_ORDER.findIndex((s) => !done.has(s.id));
  const allAdditionsDone = firstIncompleteIndex === -1;

  const solution = SOLUTIONS.find((s) => s.id === openSolution)!;

  return (
    <section className="rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)]/30 shadow-ambient overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-[var(--surface-container-lowest)] border-b border-[var(--outline-variant)]/30">
        <div className="flex items-center gap-3 mb-1">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[var(--primary)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            science
          </span>
          <h3
            className="text-xl font-bold text-[var(--primary)]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Worksheet Preparasi Elektrolit
          </h3>
        </div>
        <p className="text-sm text-[var(--on-surface-variant)]">
          Tiga larutan (A, B, C) dibuat terpisah lalu digabung dengan urutan tertentu hingga volume
          akhir {FINAL_VOLUME_ML} mL, pH {TARGET_PH}. Sumber: Penuntun Praktikum KI3131, Modul 3,
          halaman 22.
        </p>
      </div>

      {/* Basis of concentration — the misreading this worksheet exists to prevent */}
      <div className="m-5 rounded-xl border-2 border-[var(--secondary)]/50 bg-[var(--secondary-container)]/15 p-4">
        <div className="flex items-start gap-2">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[var(--warning-ink)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            priority_high
          </span>
          <div className="min-w-0">
            <p
              className="text-sm font-bold text-[var(--warning-ink)]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Basis konsentrasi: {FINAL_VOLUME_ML} mL akhir — bukan volume sub-larutan
            </p>
            <p className="mt-1 text-sm text-[var(--on-surface)] leading-relaxed">
              Tabel penuntun mencetak molaritas dan massa dalam satu kolom (
              <span className="font-medium">
                &ldquo;<ChemText>{"SnCl_{2}·2H_{2}O"}</ChemText> — 0,15 M (3,3846 g)&rdquo;
              </span>
              ) tepat di atas baris <span className="italic">Volume akhir larutan 5,5 mL</span>.
              Molaritas itu berlaku untuk elektrolit {FINAL_VOLUME_ML} mL, <strong>bukan</strong>{" "}
              untuk 5,5 mL. Setiap massa pada tabel di bawah sudah diverifikasi terhadap basis ini.
            </p>
            <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
              Jika molaritas diterapkan pada sub-volume, massa{" "}
              <ChemText>{"SnCl_{2}·2H_{2}O"}</ChemText> yang tertimbang menjadi ±18× lebih kecil
              dan praktis tidak ada deposit yang terbentuk.
            </p>
          </div>
        </div>
      </div>

      {/* Solution tabs */}
      <div className="px-5">
        <div role="tablist" aria-label="Larutan A, B, dan C" className="flex flex-wrap gap-2">
          {SOLUTIONS.map((s) => {
            const active = s.id === openSolution;
            return (
              <button
                key={s.id}
                role="tab"
                id={`m3-sol-tab-${s.id}`}
                aria-selected={active}
                aria-controls={`m3-sol-panel-${s.id}`}
                onClick={() => setOpenSolution(s.id)}
                className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] ${
                  active
                    ? "border-[var(--primary-container)] bg-[var(--primary-container)] text-[var(--on-primary)]"
                    : "border-[var(--outline-variant)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
                }`}
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Larutan {s.id}
                <span className="ml-2 font-normal opacity-80">
                  {fmt(s.finalVolumeMl, s.finalVolumeMl % 1 === 0 ? 0 : 1)} mL
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active solution panel */}
      <div
        role="tabpanel"
        id={`m3-sol-panel-${solution.id}`}
        aria-labelledby={`m3-sol-tab-${solution.id}`}
        className="p-5"
      >
        <p className="text-sm text-[var(--on-surface)] leading-relaxed">
          <ChemText>{solution.purpose}</ChemText>
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <caption className="sr-only">
              Komposisi larutan {solution.id} beserta verifikasi massa terhadap volume akhir{" "}
              {FINAL_VOLUME_ML} mL
            </caption>
            <thead>
              <tr className="border-b border-[var(--outline-variant)] text-left">
                <th scope="col" className="py-2 pr-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Langkah
                </th>
                <th scope="col" className="py-2 pr-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Bahan
                </th>
                <th scope="col" className="py-2 pr-3 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Sesuai penuntun
                </th>
                <th scope="col" className="py-2 text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Verifikasi ({FINAL_VOLUME_ML} mL)
                </th>
              </tr>
            </thead>
            <tbody>
              {solution.reagents.map((r, i) => {
                const verified =
                  r.massG !== undefined && r.molarMass !== undefined && r.targetMolarity !== undefined;
                const mol = verified ? molesFromMass(r.massG!, r.molarMass!) : null;
                const molarity = verified ? molarityInFinalVolume(r.massG!, r.molarMass!) : null;
                const matches =
                  molarity !== null && Math.abs(molarity - r.targetMolarity!) < 0.0005;

                return (
                  <tr key={i} className="border-b border-[var(--outline-variant)]/40 align-top">
                    <td className="py-3 pr-3 text-[var(--on-surface-variant)]">{r.step}</td>
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-[var(--on-surface)]">
                        <ChemText>{r.name}</ChemText>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--on-surface-variant)] leading-relaxed">
                        <ChemText>{r.role}</ChemText>
                      </p>
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap font-semibold text-[var(--on-surface)]">
                      <ChemText>{r.manualAmount}</ChemText>
                    </td>
                    <td className="py-3 text-xs text-[var(--on-surface-variant)]">
                      {verified ? (
                        <>
                          <p className="font-medium text-[var(--on-surface)]">
                            {fmt(r.massG!, 4)} g ÷ {fmt(r.molarMass!, 3)} g/mol ={" "}
                            {mol!.toFixed(5)} mol
                          </p>
                          <p className="mt-0.5">
                            → {fmt(molarity!, 4)} M dalam {FINAL_VOLUME_ML} mL{" "}
                            {matches ? (
                              <span className="font-semibold text-[var(--success)]">
                                ✓ cocok target {fmt(r.targetMolarity!, 2)} M
                              </span>
                            ) : (
                              <span className="font-semibold text-[var(--error)]">
                                ✗ target {fmt(r.targetMolarity!, 2)} M
                              </span>
                            )}
                          </p>
                          {r.molarMassNote && (
                            <p className="mt-0.5 italic">
                              M dihitung untuk <ChemText>{r.molarMassNote}</ChemText>
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="italic">Volume, tidak ada massa untuk diverifikasi.</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-[var(--on-surface-variant)]">
          Volume akhir larutan {solution.id}:{" "}
          <strong>{fmt(solution.finalVolumeMl, solution.finalVolumeMl % 1 === 0 ? 0 : 1)} mL</strong>{" "}
          — tambahkan air hingga volume ini setelah semua bahan larut.
        </p>

        <div className="mt-4 rounded-lg border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
            Konfirmasi bentuk garam dengan asisten
          </p>
          <p className="mt-1 text-sm text-[var(--on-surface)] leading-relaxed">
            Massa pada penuntun mengasumsikan <ChemText>{"H_{4}EDTA"}</ChemText> anhidrat (292,244
            g/mol) dan asam sitrat anhidrat (192,123 g/mol). Bila stok laboratorium berupa{" "}
            <ChemText>{"Na_{2}H_{2}EDTA·2H_{2}O"}</ChemText> (372,24 g/mol) atau asam sitrat
            monohidrat (210,14 g/mol), massa yang perlu ditimbang berbeda ±27% dan ±9%. Periksa label
            botol sebelum menimbang.
          </p>
        </div>
      </div>

      {/* PEG400 — the manual gives only a final concentration */}
      <div className="mx-5 mb-5 rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4">
        <div className="flex items-center gap-2 mb-2">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--secondary)] text-lg">
            calculate
          </span>
          <h4
            className="font-bold text-[var(--on-surface)]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            PEG400 — turunkan sendiri massa dan volumenya
          </h4>
        </div>
        <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
          Penuntun hanya menuliskan <strong>&ldquo;konsentrasi akhir PEG400 0,20 M&rdquo;</strong>{" "}
          tanpa massa maupun volume, jadi angka kerjanya harus dihitung:
        </p>
        <ol className="mt-3 space-y-1.5 text-sm text-[var(--on-surface)]">
          <li className="flex gap-2">
            <span className="font-bold text-[var(--primary-container)]">1.</span>
            <span>
              n = 0,20 M × {fmt(FINAL_VOLUME_ML / 1000, 3)} L ={" "}
              <strong>{fmt(PEG400.moles, 4)} mol</strong>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[var(--primary-container)]">2.</span>
            <span>
              m = {fmt(PEG400.moles, 4)} mol × {PEG400.nominalMolarMass} g/mol ={" "}
              <strong>{fmt(PEG400.massG, 1)} g</strong>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[var(--primary-container)]">3.</span>
            <span>
              V = {fmt(PEG400.massG, 1)} g ÷ {fmt(PEG400.density, 3)} g/mL ≈{" "}
              <strong>{fmt(PEG400.volumeMl, 2)} mL</strong>
            </span>
          </li>
        </ol>
        <p className="mt-3 text-xs text-[var(--on-surface-variant)] leading-relaxed">
          &ldquo;PEG400&rdquo; adalah massa molar <span className="italic">nominal rata-rata</span>{" "}
          suatu polimer, bukan senyawa tunggal, sehingga 0,20 M bersifat pendekatan. Densitas 1,128
          g/mL adalah nilai umum pada suhu ruang — periksa densitas pada label botol dan catat nilai
          yang Anda pakai. Menimbang {fmt(PEG400.massG, 1)} g lebih dapat dipertanggungjawabkan
          daripada memipet {fmt(PEG400.volumeMl, 2)} mL cairan yang kental.
        </p>
      </div>

      {/* Order of addition — gated, because the sequence is chemically load-bearing */}
      <div className="mx-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[var(--primary)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            low_priority
          </span>
          <h4
            className="font-bold text-[var(--on-surface)]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Urutan Penggabungan
          </h4>
        </div>
        <p className="text-sm text-[var(--on-surface-variant)] mb-3">
          Urutan ini menentukan hasil: agen pengompleks harus bertemu ion logam sebelum pH dinaikkan.
          Setiap langkah terbuka setelah langkah sebelumnya ditandai.
        </p>

        <ol className="space-y-2">
          {ADDITION_ORDER.map((s, i) => {
            const isDone = done.has(s.id);
            const isNext = i === firstIncompleteIndex;
            const locked = !isDone && !isNext;

            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => toggleStep(s.id)}
                  disabled={locked}
                  aria-pressed={isDone}
                  className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] ${
                    isDone
                      ? "border-[var(--success)] bg-[var(--success-light)]"
                      : isNext
                      ? "border-[var(--primary-container)] bg-[var(--surface-container-low)] hover:bg-[var(--surface-container)]"
                      : "border-[var(--outline-variant)]/50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isDone
                        ? "bg-[var(--success)] text-white"
                        : "bg-[var(--surface-variant)] text-[var(--on-surface-variant)]"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block font-medium ${
                        isDone ? "text-[var(--success)]" : "text-[var(--on-surface)]"
                      }`}
                    >
                      <ChemText>{s.label}</ChemText>
                    </span>
                    {locked && (
                      <span className="mt-0.5 block text-xs text-[var(--on-surface-variant)]">
                        Selesaikan langkah sebelumnya dulu.
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Volume budget */}
        <div className="mt-4 rounded-lg border border-[var(--outline-variant)]/50 bg-[var(--surface-container-lowest)] p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] mb-1">
            Neraca volume sebelum pengenceran
          </p>
          <p className="text-sm text-[var(--on-surface)]">
            A + B + C = {fmt(VOLUME_BUDGET.solutionsMl, 1)} mL · PEG400 ≈{" "}
            {fmt(VOLUME_BUDGET.pegMl, 2)} mL · NH<sub>3</sub>{" "}
            {fmt(VOLUME_BUDGET.nh3FinalMl, 1)} mL ={" "}
            <strong>{fmt(VOLUME_BUDGET.committedMl, 2)} mL</strong>
          </p>
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
            Air yang perlu ditambahkan hingga {FINAL_VOLUME_ML} mL ≈{" "}
            <strong className="text-[var(--on-surface)]">
              {fmt(VOLUME_BUDGET.waterToAddMl, 1)} mL
            </strong>
            . Gunakan labu takar {FINAL_VOLUME_ML} mL — jangan menakar air secara terpisah, karena
            volume campuran tidak aditif.
          </p>
        </div>

        {allAdditionsDone && (
          <div className="mt-4 rounded-xl border border-[var(--secondary)]/30 bg-[var(--secondary-container)]/15 p-4">
            <p
              className="text-sm font-bold text-[var(--secondary)]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              ✓ Urutan penggabungan lengkap
            </p>
            <p className="mt-1 text-xs text-[var(--on-surface-variant)]">
              Catat pH aktual yang terukur (target {TARGET_PH}) sebagai data pengamatan. Bila pH
              menyimpang jauh, laporkan sebagai deviasi ke asisten sebelum elektrodeposisi dimulai —
              pH mempengaruhi spesiasi kompleks dan karena itu komposisi deposit.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
