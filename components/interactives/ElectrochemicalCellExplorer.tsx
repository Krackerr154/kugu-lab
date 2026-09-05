// M3 Electrochemical Cell Explorer — cell anatomy, half-reactions, and the
// reduction-potential gap that makes Sn-Bi codeposition non-trivial.
//
// The diagram itself is CellSimulation (animated); component copy and the
// ComponentKey union live in lib/m3-cell-components.ts.
"use client";

import { useState } from "react";
import { Equation } from "@/components/shared/Equation";
import { ChemText } from "@/components/shared/ChemText";
import { PredictionPrompt } from "@/components/shared/PredictionPrompt";
import { CellSimulation } from "@/components/interactives/CellSimulation";
import { CELL_COMPONENTS, type ComponentKey } from "@/lib/m3-cell-components";

// Potentials plotted on a shared axis so the ~0,45 V gap is visible, not just stated.
const POTENTIAL_SCALE = { min: -0.3, max: 0.5 };
const POTENTIAL_ROWS = [
  { label: "Bi³⁺/Bi", value: 0.31, tone: "var(--chart-gold)", caption: "Paling mudah tereduksi — mengendap lebih dulu" },
  { label: "H⁺/H₂", value: 0.0, tone: "var(--outline)", caption: "Reaksi samping yang menggerus efisiensi arus" },
  { label: "Sn²⁺/Sn", value: -0.14, tone: "var(--chart-navy)", caption: "Perlu potensial lebih negatif" },
];

const potentialToPercent = (v: number) =>
  ((v - POTENTIAL_SCALE.min) / (POTENTIAL_SCALE.max - POTENTIAL_SCALE.min)) * 100;

export function ElectrochemicalCellExplorer() {
  const [selected, setSelected] = useState<ComponentKey | null>(null);
  const [running, setRunning] = useState(true);
  const [complexed, setComplexed] = useState(true);
  const detail = selected ? CELL_COMPONENTS[selected] : null;

  // SVG shapes are not focusable by default. Each hotspot gets role="button",
  // tabIndex, an aria-label and Enter/Space handling so the diagram is fully
  // operable by keyboard and announced by screen readers.
  const hotspot = (key: ComponentKey, label: string) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": label,
    "aria-pressed": selected === key,
    onClick: () => setSelected(key),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setSelected(key);
      }
    },
    className: "cursor-pointer outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
  });

  return (
    <div className="space-y-4">
      {/* Cell anatomy diagram */}
      <div className="relative mx-auto max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <CellSimulation
          running={running}
          complexed={complexed}
          selected={selected}
          hotspot={hotspot}
        />
      </div>

      {/* Simulation controls */}
      <div className="mx-auto max-w-md space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            aria-pressed={running}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--primary-container)] px-3 py-2 text-xs font-bold text-[var(--on-primary)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
              {running ? "pause" : "play_arrow"}
            </span>
            {running ? "Jeda Sel" : "Jalankan Sel"}
          </button>
          <button
            type="button"
            onClick={() => setComplexed((v) => !v)}
            aria-pressed={complexed}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] ${
              complexed
                ? "border-[var(--success)] bg-[var(--success-light)] text-[var(--success)]"
                : "border-[var(--secondary)] bg-[var(--secondary-container)]/25 text-[var(--warning-ink)]"
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
              {complexed ? "hub" : "block"}
            </span>
            {complexed ? "Dengan pengompleks" : "Tanpa pengompleks"}
          </button>
        </div>

        {/* Legend — the ion colours carry meaning, so they must be named */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[var(--on-surface-variant)]">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--chart-gold)" }} />
            <ChemText>{"Bi^{3+}"}</ChemText>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--chart-navy)" }} />
            <ChemText>{"Sn^{2+}"}</ChemText>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--secondary)" }} />
            e⁻
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full border border-[var(--outline)]"
            />
            <ChemText>{"gelembung H_{2}"}</ChemText>
          </span>
        </div>

        {/* What the current state is teaching. aria-live so toggling the state is
            announced rather than being a purely visual change. */}
        <p
          aria-live="polite"
          className={`rounded-lg border p-2.5 text-xs leading-relaxed ${
            complexed
              ? "border-[var(--success)]/40 bg-[var(--success-light)]/50 text-[var(--on-surface)]"
              : "border-[var(--secondary)]/50 bg-[var(--secondary-container)]/15 text-[var(--on-surface)]"
          }`}
        >
          {complexed ? (
            <>
              <strong>Dengan EDTA dan asam sitrat:</strong> kedua ion terikat kompleks, potensial
              deposisi efektifnya mendekat, dan <ChemText>{"Sn^{2+}"}</ChemText> ikut mencapai katoda.
              Lapisan yang tumbuh adalah paduan Sn-Bi.
            </>
          ) : (
            <>
              <strong>Tanpa pengompleks:</strong> pada potensial yang cukup mereduksi{" "}
              <ChemText>{"Bi^{3+}"}</ChemText> (E° = +0,31 V), <ChemText>{"Sn^{2+}"}</ChemText> (E° =
              −0,14 V) belum tereduksi — ionnya berbalik ke larutan. Lapisan menjadi kaya bismut, bukan
              paduan.
            </>
          )}
        </p>
      </div>

      <p className="text-center text-xs text-[var(--on-surface-variant)]">
        Elektron mengalir dari anoda → sumber DC → katoda. Arus konvensional berlawanan arah dengan aliran
        elektron. Gelembung di katoda adalah <ChemText>{"H_{2}"}</ChemText> — arus yang terpakai tanpa
        menambah massa deposit. Gunakan Tab lalu Enter untuk memilih komponen tanpa mouse.
      </p>

      {/* Selected component detail */}
      {detail ? (
        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
          <p className="font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            {detail.name}
          </p>
          <p className="mt-1 text-sm text-[var(--on-surface)] leading-relaxed">
            <ChemText>{detail.description}</ChemText>
          </p>

          {detail.halfReactions && (
            <div className="mt-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)]">
                Setengah-reaksi yang mungkin
              </p>
              {detail.halfReactions.map((hr, i) => (
                <div key={i} className="rounded-lg border border-[var(--outline-variant)]/60 bg-[var(--surface)] p-3">
                  <Equation tex={hr.tex} compact />
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="rounded-full bg-[var(--surface-variant)] px-2 py-0.5 text-xs font-bold text-[var(--on-surface)]">
                      {hr.potential}
                    </span>
                    <span className="text-xs text-[var(--on-surface-variant)]">{hr.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {detail.note && (
            <p className="mt-3 border-l-2 border-[var(--secondary)] pl-3 text-xs text-[var(--on-surface-variant)] leading-relaxed">
              <ChemText>{detail.note}</ChemText>
            </p>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-[var(--on-surface-variant)]">
          Pilih komponen pada diagram untuk melihat penjelasan dan setengah-reaksinya.
        </p>
      )}

      {/* Reduction potential comparison — the core concept of this module */}
      <section className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4">
        <h4 className="font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Mengapa Kodeposisi Sn-Bi Sulit
        </h4>
        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
          Bandingkan potensial reduksi standar ketiga reaksi katoda pada satu sumbu yang sama.
        </p>

        <div className="mt-4 space-y-3">
          {POTENTIAL_ROWS.map((row) => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-semibold text-[var(--on-surface)]">{row.label}</span>
                <span className="font-mono font-bold text-[var(--on-surface)]">
                  {row.value > 0 ? "+" : ""}{row.value.toFixed(2)} V
                </span>
              </div>
              <div className="mt-1 h-2.5 rounded-full bg-[var(--surface-container-high)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${potentialToPercent(row.value)}%`, background: row.tone }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[var(--on-surface-variant)]">{row.caption}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-[var(--surface-container-low)] p-3">
          <p className="text-sm text-[var(--on-surface)]">
            Selisih <strong>≈ 0,45 V</strong> antara Bi³⁺/Bi dan Sn²⁺/Sn berarti bismut tereduksi jauh lebih dulu.
            Tanpa intervensi, hasilnya lapisan kaya bismut yang tidak seragam — bukan paduan.
          </p>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
            Karena itu elektrolit memakai agen pengompleks: EDTA dan asam sitrat mengikat ion logam sehingga
            potensial deposisi efektifnya bergeser dan kedua logam dapat mengendap bersamaan (kodeposisi).
            PEG400 bekerja pada morfologi permukaan deposit.
          </p>
          <p className="mt-2 text-xs italic text-[var(--on-surface-variant)]">
            Nilai di atas adalah potensial <em>standar</em> (1 M, 25 °C, vs SHE). Potensial deposisi sebenarnya di
            elektrolit ini bergeser karena kompleksasi dan konsentrasi — justru itulah mekanisme yang dimanfaatkan.
          </p>
        </div>
      </section>

      {/* Predict before reveal */}
      <PredictionPrompt
        question="Berdasarkan potensial reduksi standar, logam mana yang akan mengendap lebih dulu di katoda, dan mengapa hal itu menjadi masalah untuk membuat paduan Sn-Bi?"
        predictionHint="Bandingkan E° Bi^{3+}/Bi dengan E° Sn^{2+}/Sn, lalu pikirkan komposisi lapisan yang terbentuk..."
        revealText="Bismut mengendap lebih dulu, karena E° Bi^{3+}/Bi = +0,31 V jauh lebih positif daripada E° Sn^{2+}/Sn = −0,14 V."
        explanation="Spesi dengan potensial reduksi lebih positif lebih mudah menerima elektron. Pada potensial katoda yang cukup untuk mereduksi Bi^{3+}, timah belum tereduksi sama sekali, sehingga deposit awal hampir seluruhnya bismut dan komposisi paduan tidak seragam sepanjang ketebalan lapisan. Agen pengompleks (EDTA, asam sitrat) mengikat ion logam dan menggeser potensial deposisi efektifnya sehingga kedua logam dapat mengendap pada rentang potensial yang berdekatan — inilah yang disebut kodeposisi. Sebagai reaksi samping, H^{+} pada pH ~2 juga dapat tereduksi menjadi gas H_{2}, memakai arus tanpa menambah massa deposit dan menurunkan efisiensi arus."
      />
    </div>
  );
}
