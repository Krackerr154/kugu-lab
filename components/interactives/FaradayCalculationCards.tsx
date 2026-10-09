// FaradayCalculationCards — 3 structured step cards for Faraday calculations on Slide 8.
// Features clean LaTeX math rendering via KaTeX, parameter breakdown, and justified explanation.
"use client";

import { useEffect, useRef } from "react";
import katex from "katex";

interface FaradayStep {
  stepNum: 1 | 2 | 3;
  stepLabel: string;
  title: string;
  accentColor: string;
  tex: string;
  explanation: string;
  params: {
    symbol: string;
    desc: string;
  }[];
}

const STEPS: FaradayStep[] = [
  {
    stepNum: 1,
    stepLabel: "Langkah 1",
    title: "Total Muatan Listrik",
    accentColor: "var(--primary-container)",
    tex: "Q = I \\times t",
    explanation:
      "Menghitung total muatan listrik yang mengalir dari catu daya DC berdasarkan arus konstan dan durasi proses elektrodeposisi.",
    params: [
      { symbol: "I", desc: "Arus (A)" },
      { symbol: "t", desc: "Waktu (s)" },
      { symbol: "Q", desc: "Muatan (C)" },
    ],
  },
  {
    stepNum: 2,
    stepLabel: "Langkah 2",
    title: "Massa Paduan Teoritis",
    accentColor: "#d97706",
    tex: "m_{\\text{teoritis}} = \\frac{Q \\times (M_{\\text{Sn}} + M_{\\text{Bi}})}{5 \\times F}",
    explanation:
      "Menghitung massa teoritis paduan Sn–Bi rasio 1:1 mol. Reduksi 1 mol Sn²⁺ (2e⁻) dan 1 mol Bi³⁺ (3e⁻) membutuhkan total 5 mol elektron.",
    params: [
      { symbol: "M_Sn + M_Bi", desc: "327,69 g/mol" },
      { symbol: "n_tot", desc: "5 mol e⁻" },
      { symbol: "F", desc: "96.485 C/mol" },
    ],
  },
  {
    stepNum: 3,
    stepLabel: "Langkah 3",
    title: "Efisiensi Arus",
    accentColor: "#7c3aed",
    tex: "\\eta = \\frac{m_{\\text{aktual}}}{m_{\\text{teoritis}}} \\times 100\\%",
    explanation:
      "Membandingkan perolehan massa aktual dari selisih timbangan katoda terhadap estimasi massa teoritis hukum Faraday.",
    params: [
      { symbol: "m_akt", desc: "m₂ − m₁ (g)" },
      { symbol: "η < 100%", desc: "Reaksi H₂" },
      { symbol: "η > 100%", desc: "Sisa garam" },
    ],
  },
];

function LatexFormula({ tex }: { tex: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(tex, containerRef.current, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
      } catch {
        if (containerRef.current) {
          containerRef.current.textContent = tex;
        }
      }
    }
  }, [tex]);

  return (
    <div
      ref={containerRef}
      className="m4-katex-step flex items-center justify-center py-0.5 min-h-[36px] overflow-x-auto overflow-y-hidden"
    />
  );
}

export function FaradayCalculationCards() {
  return (
    <div
      data-faraday-calculation-cards
      className="m4-motion-enter grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 h-full items-stretch min-w-0"
    >
      {STEPS.map((s) => (
        <div
          key={s.stepNum}
          className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-2 sm:p-2.5 flex flex-col justify-between shadow-xs min-w-0 h-full"
          style={{ gap: "0.25rem" }}
        >
          {/* Header & Step Badge */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.accentColor }}
                />
                <h3 className="font-bold text-[11px] sm:text-xs text-[var(--foreground)] truncate">
                  {s.title}
                </h3>
              </div>
              <span className="rounded-full px-1.5 py-0.2 text-[8px] font-mono font-bold shrink-0 border border-[var(--outline-variant)]/40 text-[var(--text-secondary)] bg-[var(--surface-container-low)]">
                {s.stepLabel}
              </span>
            </div>

            {/* LaTeX Equation Container */}
            <div className="rounded-lg border border-[var(--outline-variant)]/50 bg-[var(--surface-container-lowest)] px-2 py-0.5 my-1 shadow-2xs">
              <LatexFormula tex={s.tex} />
            </div>

            {/* Justified Pedagogical Explanation */}
            <p
              className="text-[9px] sm:text-[9.5px] text-[var(--text-secondary)] leading-snug text-justify mt-1"
              style={{ textAlign: "justify", textJustify: "inter-word" }}
            >
              {s.explanation}
            </p>
          </div>

          {/* Bottom Parameter Chips */}
          <div className="mt-auto pt-1 border-t border-[var(--outline-variant)]/40 min-w-0">
            <div className="grid grid-cols-3 gap-1 min-w-0 text-center">
              {s.params.map((p, pIdx) => (
                <div
                  key={pIdx}
                  className="rounded-lg border border-[var(--outline-variant)]/60 bg-[var(--surface-container-low)] px-1 py-0.5 flex flex-col items-center justify-center min-w-0 shadow-2xs"
                >
                  <span className="font-mono font-bold text-[9px] sm:text-[9.5px] text-[var(--foreground)] truncate w-full">
                    {p.symbol}
                  </span>
                  <span className="text-[7.5px] sm:text-[8px] text-[var(--text-secondary)] truncate w-full leading-tight">
                    {p.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
