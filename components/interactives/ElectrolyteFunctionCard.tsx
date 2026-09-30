"use client";

import { useState } from "react";
import { ChemText } from "@/components/shared/ChemText";
import { Equation } from "@/components/shared/Equation";
import {
  ADDITION_ORDER,
  FINAL_VOLUME_ML,
  PEG400,
  PROTOCOL_CURRENT_DENSITY_MA_CM2,
  PROTOCOL_DURATION_MINUTES,
  SOLUTIONS,
  TARGET_PH,
  VOLUME_BUDGET,
  type ElectrolyteSolution,
  type ElectrolyteReagent,
} from "@/lib/m3-electrolyte";
import { COMPLEXING_AGENTS, type ComplexingAgent } from "@/lib/m3-complexing-agents";

type SolutionId = ElectrolyteSolution["id"];

const PHASE_META: Record<SolutionId, { label: string; icon: string; summary: string }> = {
  A: { label: "Persiapan pengompleks", icon: "hub", summary: "EDTA disiapkan dalam media basa." },
  B: { label: "Sumber ion logam", icon: "science", summary: "Sn²⁺ dan Bi³⁺ dibawa dalam media asam." },
  C: { label: "Pengompleks pendamping", icon: "account_tree", summary: "Sitrat membantu mengatur deposit." },
};

const ROLE_META = [
  { matches: /H_{2}O/, label: "Pelarut" },
  { matches: /NH_{3}/, label: "Media basa" },
  { matches: /EDTA/, label: "Pengompleks" },
  { matches: /HCl/, label: "Media asam" },
  { matches: /SnCl/, label: "Sumber Sn" },
  { matches: /Bi\(/, label: "Sumber Bi" },
  { matches: /Asam sitrat/, label: "Pengompleks" },
];

const SYSTEM_ROLES = [
  {
    name: "Kation logam: Sn^{2+} dan Bi^{3+}",
    role: "Kation utama yang mengalami reduksi di katoda untuk membentuk deposit paduan Sn–Bi. Rasio pengendapan aktual bergantung pada kondisi operasi dan kompleksasi dalam larutan.",
  },
  {
    name: "Anion pendamping: Cl^{-} dan NO_{3}^{-}",
    role: "Anion penyeimbang muatan dari garam logam SnCl₂ dan Bi(NO₃)₃ serta asam (HCl). Berperan menjaga netralitas muatan dan konduktivitas medium elektrolit.",
  },
  {
    name: "Kation asam: H^{+}",
    role: "Spesi asam dalam larutan yang dapat mengalami reaksi samping reduksi menjadi gas H₂ di katoda, sehingga mengonsumsi sebagian arus listrik tanpa menghasilkan massa deposit logam.",
  },
  {
    name: "Pelarut: H_{2}O",
    role: "Pelarut utama pada pembuatan sub-larutan A, B, dan C serta medium pengenceran hingga tanda batas 100 mL pada labu takar.",
  },
  {
    name: "Kondisi asam: pH ~2",
    role: "Target keasaman akhir elektrolit yang harus diukur dan dicatat. pH menjaga kelarutan ion logam, mencegah hidrolisis, dan menstabilkan kesetimbangan kompleks.",
  },
] as const;

const roleLabel = (reagent: ElectrolyteReagent) => ROLE_META.find((entry) => entry.matches.test(reagent.name))?.label ?? "Komponen resep";

const ADDITION_WHY: Record<string, string> = {
  "a-into-b": "Larutan A (EDTA dalam suasana basa) dicampurkan perlahan ke dalam Larutan B (ion logam dalam suasana asam) agar kompleksasi berlangsung bertahap tanpa terjadi pengendapan lokal.",
  "ab-into-c": "Campuran (A+B) dituangkan ke dalam Larutan C agar asam sitrat berfungsi optimal sebagai pengompleks pendamping dan sistem penyangga (buffer) keasaman.",
  peg: "PEG400 ditambahkan sebagai surfaktan/aditif permukaan yang teradsorpsi pada katoda untuk menghambat pembentukan dendrit dan meratakan morfologi deposit.",
  nh3: "Penambahan 0,5 mL NH₃ pekat untuk menyesuaikan pH larutan menuju nilai target pH ~2 sebelum pengenceran akhir.",
  dilute: "Penambahan air suling hingga tepat tanda batas labu takar 100 mL untuk mencapai konsentrasi molaritas akhir yang ditargetkan.",
  ph: "Pengukuran dan pencatatan pH akhir elektrolit dengan pH meter/indikator sebelum sel elektrokimia dialiri arus listrik.",
};

const fmt = (value: number, digits = 2) => value.toFixed(digits).replace(".", ",");

export function ElectrolyteFunctionCard() {
  const [activeSolution, setActiveSolution] = useState<SolutionId>("A");
  const [activeAddition, setActiveAddition] = useState(0);
  const [activeAgentId, setActiveAgentId] = useState<ComplexingAgent["id"]>("edta");
  const solution = SOLUTIONS.find((entry) => entry.id === activeSolution)!;
  const addition = ADDITION_ORDER[activeAddition];
  const activeAgent = COMPLEXING_AGENTS.find((entry) => entry.id === activeAgentId)!;

  return (
    <section
      aria-labelledby="electrolyte-function-title"
      data-electrolyte-function-card
      className="surface-panel min-w-0 space-y-4 p-4 sm:p-5"
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Elektrolit M4</p>
        <h4 id="electrolyte-function-title" className="mt-1 text-lg font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Fungsi setiap komponen elektrolit
        </h4>
        <p className="mt-2 max-w-[82ch] text-sm leading-6 text-[var(--text-secondary)]">
          Semua konsentrasi berlaku untuk elektrolit akhir {FINAL_VOLUME_ML} mL, bukan volume sub-larutan A/B/C. Pilih fase untuk membaca fungsi, jumlah, dan alasan penggunaannya.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Fase penyiapan elektrolit">
        {SOLUTIONS.map((entry) => {
          const meta = PHASE_META[entry.id];
          const active = activeSolution === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              id={`electrolyte-tab-${entry.id}`}
              aria-selected={active}
              aria-controls="electrolyte-panel"
              onClick={() => setActiveSolution(entry.id)}
              className={`min-h-16 rounded-lg border px-3 py-2 text-left m4-motion-color focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] ${active ? "border-[var(--primary-container)] bg-[var(--surface-selected)]" : "border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:border-[var(--primary-container)]"}`}
            >
              <span className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                <span aria-hidden="true" className="material-symbols-outlined text-lg text-[var(--primary-container)]">{meta.icon}</span>
                Larutan {entry.id}
                <span className="ml-auto text-xs font-semibold tabular-nums text-[var(--text-secondary)]">{entry.finalVolumeMl} mL</span>
              </span>
              <span className="mt-1 block text-xs leading-4 text-[var(--text-secondary)]">{meta.label}</span>
            </button>
          );
        })}
      </div>

      <section id="electrolyte-panel" role="tabpanel" aria-labelledby={`electrolyte-tab-${solution.id}`} data-active-solution={solution.id} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3 sm:p-4">
        <div key={solution.id} className="m4-motion-enter">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">Larutan {solution.id} · {PHASE_META[solution.id].label}</p>
              <p className="mt-1 max-w-[80ch] text-sm leading-5 text-[var(--text-secondary)]"><ChemText>{solution.purpose}</ChemText></p>
            </div>
            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1 text-xs font-semibold tabular-nums text-[var(--on-surface-variant)]">{solution.finalVolumeMl} mL</span>
          </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {solution.reagents.map((reagent) => (
            <article key={`${solution.id}-${reagent.step}-${reagent.name}`} data-reagent-role={roleLabel(reagent)} className="min-w-0 rounded-md border border-[var(--outline-variant)] bg-[var(--surface)] p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h5 className="min-w-0 text-sm font-bold text-[var(--foreground)]"><ChemText>{reagent.name}</ChemText></h5>
                <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--on-surface-variant)]">{roleLabel(reagent)}</span>
              </div>
              <p className="mt-2 text-xs font-semibold tabular-nums text-[var(--primary-container)]">{reagent.manualAmount}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]"><ChemText>{reagent.role}</ChemText></p>
              {reagent.targetMolarity !== undefined && reagent.massG !== undefined && (
                <p className="mt-2 border-t border-[var(--outline-variant)] pt-2 text-[11px] tabular-nums text-[var(--muted)]">
                  {reagent.massG} g · target {fmt(reagent.targetMolarity, 2)} M
                </p>
              )}
            </article>
          ))}
        </div>
        </div>
      </section>

      <section aria-labelledby="electrolyte-agent-title" data-electrolyte-agents className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3 sm:p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Peran aditif resep</p>
          <h5 id="electrolyte-agent-title" className="mt-1 text-base font-bold text-[var(--foreground)]">Peran agen pengompleks</h5>
          <p className="mt-1 max-w-[80ch] text-sm leading-6 text-[var(--text-secondary)]">
            EDTA dan asam sitrat mengikat ion logam sehingga potensial deposisi efektif dapat bergeser; PEG400 bekerja terutama pada morfologi permukaan. Pilih satu kartu untuk melihat mekanisme dan batas penjelasannya.
          </p>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-3" role="tablist" aria-label="Agen dalam resep elektrolit">
          {COMPLEXING_AGENTS.map((agent) => {
            const active = activeAgentId === agent.id;
            return (
              <button
                key={agent.id}
                id={`electrolyte-agent-tab-${agent.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="electrolyte-agent-panel"
                onClick={() => setActiveAgentId(agent.id)}
                className={`min-h-44 rounded-lg border p-3 text-left m4-motion-color focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] ${active ? "border-[var(--secondary)] bg-[var(--surface-selected)]" : "border-[var(--outline-variant)] bg-[var(--surface)] hover:border-[var(--primary-container)]"}`}
              >
                <span className="flex items-start gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--primary-container)]">{agent.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[var(--foreground)]">{agent.name}</span>
                    <span className="block text-xs text-[var(--text-secondary)]">{agent.solution}</span>
                  </span>
                </span>
                <span className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{agent.kind}</span>
                <span className="mt-1 block text-xs leading-5 text-[var(--text-secondary)]">{agent.summary}</span>
                <span className="mt-3 block rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-2 py-1 font-mono text-xs leading-5 text-[var(--foreground)]"><ChemText>{agent.formulaLabel}</ChemText> · {agent.concentration}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--primary-container)]">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">touch_app</span>
                  Lihat mekanisme
                </span>
              </button>
            );
          })}
        </div>

        <section id="electrolyte-agent-panel" role="tabpanel" aria-labelledby={`electrolyte-agent-tab-${activeAgent.id}`} data-active-agent={activeAgent.id} className="mt-3 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-3 sm:p-4">
          <div key={activeAgent.id} className="m4-motion-enter">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">{activeAgent.name} · {activeAgent.kind}</p>
              <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]"><ChemText>{activeAgent.formulaLabel}</ChemText> · {activeAgent.solution}</p>
            </div>
            <div className="text-right text-xs tabular-nums text-[var(--text-secondary)]">
              <p>{activeAgent.concentration}</p>
              <p className="mt-0.5">{activeAgent.workingAmount}</p>
            </div>
          </div>

          {activeAgent.tex && <div className="mt-3"><Equation tex={activeAgent.tex} label={activeAgent.texLabel} compact /></div>}

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <section className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
              <h6 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]"><span aria-hidden="true" className="material-symbols-outlined text-sm">psychology</span>Mekanisme</h6>
              <ol className="mt-2 space-y-1.5">
                {activeAgent.mechanism.map((item, index) => <li key={index} className="flex gap-2 text-xs leading-5 text-[var(--foreground)]"><span className="font-bold text-[var(--primary-container)]">{index + 1}.</span><span><ChemText>{item}</ChemText></span></li>)}
              </ol>
            </section>
            <section className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
              <h6 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--secondary)]"><span aria-hidden="true" className="material-symbols-outlined text-sm">layers</span>Pengaruh pada deposit</h6>
              <ul className="mt-2 space-y-1.5">
                {activeAgent.effect.map((item, index) => <li key={index} className="flex gap-2 text-xs leading-5 text-[var(--foreground)]"><span aria-hidden="true" className="text-[var(--primary-container)]">→</span><span><ChemText>{item}</ChemText></span></li>)}
              </ul>
            </section>
          </div>

          <p className="mt-2 text-[11px] italic leading-5 text-[var(--muted)]">Rujukan: {activeAgent.reference}</p>
          </div>
        </section>
      </section>

      <section className="rounded-lg border border-[var(--secondary)]/40 bg-[var(--secondary-container)]/35 p-3" aria-labelledby="electrolyte-final-additions-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--on-secondary-container)]">Fase pencampuran akhir</p>
            <h5 id="electrolyte-final-additions-title" className="mt-1 font-bold text-[var(--on-secondary-container)]">Setelah A + B + C dibuat</h5>
          </div>
          <span className="text-xs font-semibold tabular-nums text-[var(--on-secondary-container)]">{FINAL_VOLUME_ML} mL · pH {TARGET_PH}</span>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Urutan pencampuran akhir">
          {ADDITION_ORDER.map((step, index) => (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={activeAddition === index}
              id={`electrolyte-addition-tab-${step.id}`}
              aria-controls="electrolyte-addition-panel"
              onClick={() => setActiveAddition(index)}
              className={`min-w-28 min-h-12 rounded-md border px-2 py-1.5 text-left text-xs font-semibold m4-motion-color focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] ${activeAddition === index ? "border-[var(--primary-container)] bg-[var(--surface)] text-[var(--primary)]" : "border-[var(--outline-variant)] bg-[var(--surface)]/60 text-[var(--on-secondary-container)]"}`}
            >
              <span className="block text-[10px] uppercase tracking-wider">Langkah {index + 1}</span>
              <span className="mt-0.5 block leading-4"><ChemText>{step.label}</ChemText></span>
            </button>
          ))}
        </div>
        <div id="electrolyte-addition-panel" className="mt-3 rounded-md bg-[var(--surface)]/75 p-3" role="tabpanel" aria-labelledby={`electrolyte-addition-tab-${addition.id}`} aria-live="polite" data-active-addition={addition.id}>
          <div key={addition.id} className="m4-motion-enter">
          <p className="text-sm font-semibold text-[var(--foreground)]"><ChemText>{addition.label}</ChemText></p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{ADDITION_WHY[addition.id]}</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--on-secondary-container)]">
          Total volume reagen sebelum penambahan air: {fmt(VOLUME_BUDGET.committedMl)} mL (termasuk volume nominal PEG400 ≈ {fmt(PEG400.volumeMl)} mL). Tambahkan air suling hingga tepat tanda batas 100 mL, lalu jalankan deposisi pada rapat arus {fmt(PROTOCOL_CURRENT_DENSITY_MA_CM2, 1)} mA/cm² selama {PROTOCOL_DURATION_MINUTES} menit sesuai arahan asisten.
        </p>
      </section>

      <details className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3" open>
        <summary className="cursor-pointer text-sm font-bold text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]">Peta fungsi lintas komponen</summary>
        <div className="mt-3 grid min-w-0 gap-2 md:grid-cols-2">
          {SYSTEM_ROLES.map((item) => (
            <div key={item.name} className="min-w-0 rounded-md border border-[var(--outline-variant)] bg-[var(--surface)] p-3">
              <h5 className="text-sm font-bold text-[var(--foreground)]"><ChemText>{item.name}</ChemText></h5>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]"><ChemText>{item.role}</ChemText></p>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
