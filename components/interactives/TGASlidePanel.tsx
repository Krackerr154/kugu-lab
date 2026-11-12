"use client";

import { useMemo } from "react";
import {
  TGA_MODELS,
  TGA_T_MAX,
  TGA_T_MIN,
  buildTgaCurve,
  readTgaSteps,
  tgaDtgDomain,
} from "@/lib/m6-tga-model";

/**
 * Read-only TGA figures for the Module 6 review deck.
 *
 * Same contract as FTIRSlidePanel: these are the figures the assistant points
 * at while talking. The interactive exercise (annotation, model switching,
 * stoichiometry worksheet) lives on the module page, not here.
 *
 * Drawn as plain SVG, not ECharts, because the deck loads these inside a
 * `m4-deck-panel` that must measure its own width for legible labels — the
 * same rule that fixed the M5 XRD charts.
 */

export type TgaPanelVariant =
  | "tga-what-it-measures"
  | "tga-steps"
  | "tga-dtg"
  | "tga-alfum"
  | "tga-traps";

const TG_COLOR = "var(--chart-red)";
const DTG_COLOR = "var(--chart-navy)";
const GRID = "var(--surface-container-high)";
const TEXT = "var(--text-secondary)";

/* ── Shared chart scaffolding ─────────────────────────────────────────────── */

interface ChartBox {
  w: number;
  h: number;
  pad: { top: number; right: number; bottom: number; left: number };
}

function useChartBox(height: number) {
  return useMemo<ChartBox>(
    () => ({
      w: 100, // resolved by the SVG viewBox at render time
      h: height,
      pad: { top: 18, right: 12, bottom: 34, left: 42 },
    }),
    [height]
  );
}

function axisTicks(min: number, max: number, count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i <= count; i++) out.push(min + ((max - min) * i) / count);
  return out;
}

/* ── Variant: what TGA measures ───────────────────────────────────────────── */

function WhatItMeasuresPanel() {
  const rows = [
    { icon: "scale", title: "Massa", detail: "Sampel ditimbang terus-menerus selama dipanaskan." },
    { icon: "device_thermostat", title: "Suhu", detail: "Naik teratur, mis. 10 °C/menit sampai 900 °C." },
    { icon: "science", title: "Atmosfer", detail: "N₂ inersia atau udara; gas memengaruhi hasil." },
    { icon: "stacked_line_chart", title: "Turunan", detail: "DTG mempertegas suhu laju kehilangan tertinggi." },
  ];

  return (
    <ul className="flex h-full flex-col justify-center gap-3">
      {rows.map((r) => (
        <li key={r.title} className="flex items-start gap-2">
          <span aria-hidden="true" className="material-symbols-outlined text-base text-[var(--primary-container)]">
            {r.icon}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-[var(--foreground)]">{r.title}</p>
            <p className="text-[var(--text-secondary)]">{r.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── Variant: TG + DTG curve ──────────────────────────────────────────────── */

function CurvePanel({ mode }: { mode: "steps" | "dtg" }) {
  const model = TGA_MODELS["al-fum-hydrated"];
  const points = useMemo(() => buildTgaCurve({ modelId: "al-fum-hydrated", step: 2 }), []);
  const steps = useMemo(() => readTgaSteps(model, points), [model, points]);
  const dtg = useMemo(() => tgaDtgDomain(points), [points]);

  const H = mode === "dtg" ? 300 : 260;
  const box = useChartBox(H);
  // Width is passed by the parent through the viewBox; this constant only sets
  // the authored aspect ratio. The deck CSS scales the element, and because
  // 1 unit == 1 px at the measured width the type stays at its authored size.
  const W = 620;

  const innerW = W - box.pad.left - box.pad.right;
  const innerH = H - box.pad.top - box.pad.bottom;

  const xOf = (t: number) => box.pad.left + ((t - TGA_T_MIN) / (TGA_T_MAX - TGA_T_MIN)) * innerW;
  const yMass = (m: number) => box.pad.top + ((105 - m) / 105) * innerH;
  const yDtg = (d: number) => box.pad.top + ((d - dtg.max) / (dtg.min - dtg.max)) * innerH;

  const tgPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.t).toFixed(1)} ${yMass(p.mass).toFixed(1)}`)
    .join(" ");
  const dtgPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.t).toFixed(1)} ${yDtg(p.dtg).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={
        mode === "dtg"
          ? "Termogram Al-Fum: kurva TG merah dan kurva DTG biru dengan tiga puncak."
          : "Termogram Al-Fum tiga tahap: air fisis, dehidroksilasi, dekomposisi fumarat."
      }
      className="block w-full select-none"
    >
      <rect
        x={box.pad.left}
        y={box.pad.top}
        width={innerW}
        height={innerH}
        fill="var(--surface-container-lowest)"
        stroke={GRID}
      />

      {/* Y grid + labels (mass axis) */}
      {axisTicks(0, 105, 3).map((v) => (
        <g key={`y${v}`}>
          <line x1={box.pad.left} y1={yMass(v)} x2={box.pad.left + innerW} y2={yMass(v)} stroke={GRID} strokeWidth="1" />
          <text x={box.pad.left - 5} y={yMass(v) + 3.5} textAnchor="end" fontSize="10" fill={TEXT}>
            {Math.round(v)}
          </text>
        </g>
      ))}

      {/* X ticks */}
      {axisTicks(TGA_T_MIN, TGA_T_MAX, 5).map((v) => (
        <text key={`x${v}`} x={xOf(v)} y={box.pad.top + innerH + 13} textAnchor="middle" fontSize="10" fill={TEXT}>
          {Math.round(v)}
        </text>
      ))}

      <text
        x={12}
        y={box.pad.top + innerH / 2}
        textAnchor="middle"
        fontSize="10"
        fill={TEXT}
        transform={`rotate(-90 12 ${box.pad.top + innerH / 2})`}
      >
        massa (%)
      </text>
      <text x={box.pad.left + innerW / 2} y={H - 3} textAnchor="middle" fontSize="10" fill={TEXT}>
        suhu (°C)
      </text>

      {mode === "dtg" && (
        <>
          <path d={dtgPath} fill="none" stroke={DTG_COLOR} strokeWidth="1.4" strokeDasharray="4 3" />
          <text x={box.pad.left + innerW - 4} y={box.pad.top + 12} textAnchor="end" fontSize="10" fontWeight="700" fill={DTG_COLOR}>
            DTG
          </text>
        </>
      )}

      <path d={tgPath} fill="none" stroke={TG_COLOR} strokeWidth="2" />
      <text x={box.pad.left + innerW - 4} y={box.pad.top + (mode === "dtg" ? 26 : 12)} textAnchor="end" fontSize="10" fontWeight="700" fill={TG_COLOR}>
        TG
      </text>

      {/* Step markers */}
      {steps.map((s) => (
        <g key={s.id}>
          <line
            x1={xOf(s.peak)}
            y1={box.pad.top}
            x2={xOf(s.peak)}
            y2={box.pad.top + innerH}
            stroke={TEXT}
            strokeWidth="0.8"
            strokeDasharray="3 3"
            opacity="0.55"
          />
          <circle cx={xOf(s.peak)} cy={yMass(100 - steps.slice(0, steps.indexOf(s)).reduce((a, x) => a + x.lossPct, 0) - s.lossPct / 2)} r="3" fill={TG_COLOR} />
          <text
            x={xOf(s.peak)}
            y={box.pad.top - 5}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill={TEXT}
          >
            {s.peak}°C
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ── Variant: Al-Fum three-step reading ───────────────────────────────────── */

function AlFumPanel() {
  const model = TGA_MODELS["al-fum-hydrated"];
  const points = useMemo(() => buildTgaCurve({ modelId: "al-fum-hydrated", step: 2 }), []);
  const steps = useMemo(() => readTgaSteps(model, points), [model, points]);

  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {steps.map((s, i) => (
        <div
          key={s.id}
          className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2"
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-bold text-[var(--foreground)]">
              {i + 1}. {s.label}
            </p>
            <span className="shrink-0 font-bold tabular-nums text-[var(--chart-red)]">
              −{s.lossPct}%
            </span>
          </div>
          <p className="text-[var(--text-secondary)]">
            onset {s.onset} °C · puncak DTG {s.peak} °C · selesai {s.endset} °C
          </p>
        </div>
      ))}
      <p className="text-[var(--text-secondary)]">
        Sisa 900 °C ≈ {points[points.length - 1].mass.toFixed(0)}% — residu kaya alumina, bukan logam Al.
      </p>
    </div>
  );
}

/* ── Variant: traps ───────────────────────────────────────────────────────── */

function TrapsPanel() {
  const traps = [
    {
      title: "Kurva orang lain bukan kurva kalian",
      body: "Laju pemanasan, gas purging, dan kadar air menggeser suhu tiap tahap. Bandingkan bentuk, bukan angka mentah.",
    },
    {
      title: "Massa sisa ≠ rendemen",
      body: "Residu 900 °C adalah oksida, bukan produk. Jangan menghitung rendemen dari kurva TGA.",
    },
  ];

  return (
    <div className="flex h-full flex-col justify-center gap-3">
      {traps.map((t) => (
        <div key={t.title} className="rounded-lg border border-[var(--chart-red)]/35 bg-[var(--chart-red)]/8 px-3 py-2">
          <p className="font-bold text-[var(--chart-red)]">{t.title}</p>
          <p className="mt-0.5 text-[var(--text-secondary)]">{t.body}</p>
        </div>
      ))}
    </div>
  );
}

export function TGASlidePanel({ variant }: { variant: TgaPanelVariant }) {
  switch (variant) {
    case "tga-what-it-measures":
      return <WhatItMeasuresPanel />;
    case "tga-steps":
      return <CurvePanel mode="steps" />;
    case "tga-dtg":
      return <CurvePanel mode="dtg" />;
    case "tga-alfum":
      return <AlFumPanel />;
    case "tga-traps":
      return <TrapsPanel />;
    default:
      return null;
  }
}

export const TGA_SLIDE_PANEL_VARIANTS = [
  "tga-what-it-measures",
  "tga-steps",
  "tga-dtg",
  "tga-alfum",
  "tga-traps",
] as const;
