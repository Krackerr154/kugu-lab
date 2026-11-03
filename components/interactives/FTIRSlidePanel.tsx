"use client";

import { useMemo } from "react";
import { useMeasuredWidth } from "@/components/shared/useMeasuredWidth";
import {
  FTIR_BANDS,
  FUMARIC_BASELINE,
  ALFUM_OFFSET,
  buildSpectrum,
  spectrumDomain,
  type FtirBand,
} from "@/lib/m6-ftir-bands";
import type { M6EmbeddedComponentType } from "@/lib/m6-review-deck-data";

const DOMAIN = spectrumDomain();
const ACID_COLOR = "var(--chart-navy)";
const ALFUM_COLOR = "var(--chart-gold)";

/**
 * Reference panels embedded in the Module 6 deck.
 *
 * These are the presentation counterparts of the FTIR workspace: read-only
 * figures the assistant points at while talking. The interactive assignment
 * exercise lives on the module page, not here.
 */
export function FTIRSlidePanel({ variant }: { variant: M6EmbeddedComponentType }) {
  switch (variant) {
    case "ftir-vibration":
      return <VibrationPanel />;
    case "ftir-spectrum-acid":
      return <SpectrumPanel sample="acid" />;
    case "ftir-spectrum-alfum":
      return <SpectrumPanel sample="alfum" />;
    case "ftir-coordination":
      return <CoordinationPanel />;
    case "ftir-purity":
      return <PurityPanel />;
    case "ftir-excel":
      return <ExcelPanel />;
    case "ftir-traps":
      return <TrapsPanel />;
    case "ftir-conclusions":
      return <ConclusionsPanel />;
    case "ftir-report-grid":
      return <ReportGridPanel />;
    default:
      return null;
  }
}

/* ── Spectrum ─────────────────────────────────────────────────────────────── */

function SpectrumPanel({ sample }: { sample: "acid" | "alfum" }) {
  const { ref, width } = useMeasuredWidth(520);
  const points = useMemo(() => buildSpectrum("full", 420), []);

  const pad = { top: 14, right: 10, bottom: 30, left: 46 };
  const h = width < 420 ? 180 : 210;
  const w = Math.max(width, 260);
  const innerW = Math.max(w - pad.left - pad.right, 100);
  const innerH = h - pad.top - pad.bottom;

  const minX = 400;
  const maxX = 4000;
  const xOf = (v: number) => pad.left + ((maxX - v) / (maxX - minX)) * innerW;
  const yOf = (t: number) => pad.top + ((DOMAIN.max - t) / (DOMAIN.max - DOMAIN.min)) * innerH;

  const path = (key: "acid" | "alfum") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.x).toFixed(1)} ${yOf(p[key]).toFixed(1)}`).join(" ");

  // Only the bands belonging to the sample being shown, plus the shared artefact.
  const dataSample = sample === "acid" ? "asam-fumarat" : "al-fum";
  const bands = FTIR_BANDS.filter(
    (b) => b.marked && (b.sample === dataSample || b.sample === "atmosfer")
  );

  const nearest = (band: FtirBand) =>
    points.reduce(
      (best, p) => (Math.abs(p.x - band.center) < Math.abs(best.x - band.center) ? p : best),
      points[0]
    );

  // An atmospheric artefact sits on whichever trace is drawn; picking the
  // Al-Fum trace while only the acid curve is visible left the marker floating
  // in empty space.
  const traceOf = (band: FtirBand) =>
    band.sample === "asam-fumarat" || (band.sample === "atmosfer" && sample === "acid")
      ? "acid"
      : "alfum";

  return (
    <div className="flex h-full flex-col justify-between gap-2">
      {sample === "alfum" && (
        <div className="flex items-center gap-4 text-[10px] font-semibold text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-0.5 w-3.5 rounded-full opacity-45" style={{ background: ACID_COLOR }} />
            Asam fumarat
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-0.5 w-3.5 rounded-full" style={{ background: ALFUM_COLOR }} />
            Al-Fum
          </span>
        </div>
      )}
      <div ref={ref}>
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          className="block w-full select-none"
          role="img"
          aria-label={
            sample === "acid"
              ? "Spektrum FTIR asam fumarat dengan pita 2950, 1675, 1274, dan 927 per sentimeter."
              : "Spektrum FTIR Al-Fum dengan pita 1610, 1430, 1158, 927, dan 685 per sentimeter."
          }
        >
          <text
            x="10"
            y={pad.top + innerH / 2}
            textAnchor="middle"
            fontSize="10"
            fill="var(--text-secondary)"
            transform={`rotate(-90 10 ${pad.top + innerH / 2})`}
          >
            % transmitansi
          </text>

          {[DOMAIN.min, (DOMAIN.min + DOMAIN.max) / 2, DOMAIN.max].map((v) => (
            <g key={`y${v}`}>
              <line
                x1={pad.left}
                y1={yOf(v)}
                x2={pad.left + innerW}
                y2={yOf(v)}
                stroke="var(--surface-container-high)"
                strokeWidth="1"
              />
              <text
                x={pad.left - 6}
                y={yOf(v) + 3.5}
                textAnchor="end"
                fontSize="10"
                fill="var(--text-secondary)"
              >
                {Math.round(v)}
              </text>
            </g>
          ))}

          {[4000, 3000, 2000, 1000, 400].map((v) => (
            <text
              key={`x${v}`}
              x={xOf(v)}
              y={pad.top + innerH + 14}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-secondary)"
            >
              {v}
            </text>
          ))}

          {sample === "alfum" && (
            <path d={path("acid")} fill="none" stroke={ACID_COLOR} strokeWidth="1.4" opacity="0.45" />
          )}
          <path
            d={path(sample === "acid" ? "acid" : "alfum")}
            fill="none"
            stroke={sample === "acid" ? ACID_COLOR : ALFUM_COLOR}
            strokeWidth="1.9"
          />

          {bands.map((band) => {
            const near = nearest(band);
            const t = near[traceOf(band)];
            return (
              <circle
                key={band.id}
                cx={xOf(band.center)}
                cy={yOf(t)}
                r="4"
                fill={band.diagnostic ? (sample === "acid" ? ACID_COLOR : ALFUM_COLOR) : "var(--surface-container-lowest)"}
                stroke={sample === "acid" ? ACID_COLOR : ALFUM_COLOR}
                strokeWidth="1.8"
              />
            );
          })}

          <text
            x={pad.left + innerW / 2}
            y={h - 2}
            textAnchor="middle"
            fontSize="10"
            fill="var(--text-secondary)"
          >
            Bilangan gelombang (cm⁻¹)
          </text>
        </svg>
      </div>

      <ul className="grid grid-cols-1 gap-x-3 gap-y-0.5 text-[11px] sm:grid-cols-2">
        {bands.map((band) => (
          <li key={band.id} className="flex items-baseline gap-1.5 min-w-0">
            <span className="shrink-0 font-bold tabular-nums text-[var(--foreground)]">
              {band.center}
            </span>
            <span className="min-w-0 leading-tight text-[var(--text-secondary)]">{band.short}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Vibration modes ──────────────────────────────────────────────────────── */

function VibrationPanel() {
  const modes = [
    { id: "sym", label: "Ulur simetri", hint: "kedua ikatan memanjang & memendek bersamaan" },
    { id: "asym", label: "Ulur asimetri", hint: "satu memanjang, satunya memendek" },
    { id: "bend", label: "Tekuk", hint: "sudut ikatan berubah" },
  ];

  return (
    <div className="grid h-full grid-cols-3 gap-2">
      {modes.map((mode) => (
        <figure key={mode.id} className="flex flex-col items-center gap-1.5 text-center">
          <svg viewBox="0 0 90 56" className="w-full max-w-[92px]" aria-hidden="true">
            {mode.id === "bend" ? (
              <>
                <line x1="45" y1="40" x2="20" y2="20" stroke="var(--chart-navy)" strokeWidth="3" strokeLinecap="round" />
                <line x1="45" y1="40" x2="70" y2="20" stroke="var(--chart-gold)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="45" cy="40" r="4" fill="var(--foreground)" />
                <circle cx="20" cy="20" r="3.5" fill="var(--chart-navy)" />
                <circle cx="70" cy="20" r="3.5" fill="var(--chart-gold)" />
                <path d="M28 30 A 16 16 0 0 1 62 30" fill="none" stroke="var(--text-secondary)" strokeWidth="1" strokeDasharray="2 2" />
              </>
            ) : (
              <>
                <line x1="28" y1="28" x2="62" y2="28" stroke="var(--outline-variant)" strokeWidth="2" />
                <circle cx="24" cy="28" r="5" fill="var(--chart-navy)" />
                <circle cx="66" cy="28" r="5" fill="var(--chart-gold)" />
                {mode.id === "sym" ? (
                  <>
                    <path d="M24 28 L10 28" stroke="var(--chart-navy)" strokeWidth="2" markerEnd="url(#ar)" />
                    <path d="M66 28 L80 28" stroke="var(--chart-gold)" strokeWidth="2" markerEnd="url(#ar)" />
                  </>
                ) : (
                  <>
                    <path d="M24 28 L10 28" stroke="var(--chart-navy)" strokeWidth="2" markerEnd="url(#ar)" />
                    <path d="M66 28 L52 28" stroke="var(--chart-gold)" strokeWidth="2" markerEnd="url(#ar)" />
                  </>
                )}
              </>
            )}
            <defs>
              <marker id="ar" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <path d="M0 0 L5 2.5 L0 5 z" fill="currentColor" />
              </marker>
            </defs>
          </svg>
          <figcaption className="min-w-0">
            <span className="block text-[11px] font-bold text-[var(--foreground)]">{mode.label}</span>
            <span className="block text-[10px] leading-tight text-[var(--text-secondary)]">{mode.hint}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ── Coordination ─────────────────────────────────────────────────────────── */

function CoordinationPanel() {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-2">
          <svg viewBox="0 0 120 44" className="mx-auto w-full max-w-[120px]" aria-hidden="true">
            <text x="8" y="26" fontSize="12" fontWeight="700" fill="var(--chart-navy)">R–C</text>
            <text x="46" y="18" fontSize="12" fontWeight="700" fill="var(--chart-navy)">=O</text>
            <text x="70" y="26" fontSize="12" fontWeight="700" fill="var(--chart-navy)">–OH</text>
          </svg>
          <p className="text-[11px] font-bold text-[var(--foreground)]">COOH</p>
          <p className="text-[10px] text-[var(--text-secondary)]">C=O dan C–O berbeda</p>
        </div>
        <div className="rounded-lg border border-[var(--chart-gold)]/45 bg-[var(--chart-gold)]/8 p-2">
          <svg viewBox="0 0 120 44" className="mx-auto w-full max-w-[120px]" aria-hidden="true">
            <text x="8" y="26" fontSize="12" fontWeight="700" fill="var(--chart-gold)">R–C</text>
            <text x="44" y="18" fontSize="12" fontWeight="700" fill="var(--chart-gold)">O</text>
            <text x="70" y="26" fontSize="12" fontWeight="700" fill="var(--chart-gold)">O⁻</text>
            <path d="M46 24 Q 60 30 76 24" fill="none" stroke="var(--chart-gold)" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
          <p className="text-[11px] font-bold text-[var(--foreground)]">COO⁻</p>
          <p className="text-[10px] text-[var(--text-secondary)]">kedua C–O setara (≈1,5)</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] font-semibold">
        <span className="rounded bg-[var(--surface-container)] px-2 py-0.5 tabular-nums text-[var(--text-secondary)] line-through">
          1675 C=O
        </span>
        <span aria-hidden="true" className="text-[var(--muted)]">→</span>
        <span className="rounded bg-[var(--chart-gold)]/12 px-2 py-0.5 tabular-nums text-[var(--chart-gold)]">
          1610
        </span>
        <span className="text-[var(--muted)]">+</span>
        <span className="rounded bg-[var(--chart-gold)]/12 px-2 py-0.5 tabular-nums text-[var(--chart-gold)]">
          1430
        </span>
      </div>
    </div>
  );
}

/* ── Purity ───────────────────────────────────────────────────────────────── */

function PurityPanel() {
  const rows = [
    { band: "C=O ≈ 1675", acid: "Ada", alfum: "Tidak ada" },
    { band: "O–H 2500–3300", acid: "Ada", alfum: "Tidak ada" },
    { band: "COO⁻ asim + sim", acid: "Tidak ada", alfum: "Ada" },
  ];

  return (
    <div className="flex h-full flex-col justify-center">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-[var(--outline-variant)]">
            <th scope="col" className="py-1 text-left font-semibold text-[var(--text-secondary)]">Pita</th>
            <th scope="col" className="py-1 text-left font-semibold text-[var(--text-secondary)]">Asam fumarat</th>
            <th scope="col" className="py-1 text-left font-semibold text-[var(--text-secondary)]">Al-Fum</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.band} className="border-b border-[var(--border)] last:border-0">
              <td className="py-1 font-semibold text-[var(--foreground)]">{r.band}</td>
              <td className="py-1 text-[var(--text-secondary)]">{r.acid}</td>
              <td className="py-1 text-[var(--text-secondary)]">{r.alfum}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] font-semibold text-[var(--chart-red)]">
        Pita 1675 yang masih muncul = reaksi belum sempurna.
      </p>
    </div>
  );
}

/* ── Excel recipe ─────────────────────────────────────────────────────────── */

function ExcelPanel() {
  const steps = [
    "X = bilangan gelombang, Y1 = ligan fumarat, Y2 = Al-Fum.",
    "Kolom stacked Y2′ = Y2 + offset (mis. 140) supaya kurva tidak bertumpuk.",
    "Insert → Scatter with Smooth Lines.",
    "Sumbu X: bounds 400–4000, major 400, minor 100, nilai dibalik (reverse order).",
    "Judul sumbu: Transmitansi (a.u.) dan Bilangan gelombang (cm⁻¹).",
  ];

  return (
    <ol className="flex h-full flex-col justify-center gap-1.5">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-2 text-[11px] leading-snug">
          <span className="shrink-0 font-bold tabular-nums text-[var(--primary-container)]">{i + 1}</span>
          <span className="min-w-0 text-[var(--text-secondary)]">{step}</span>
        </li>
      ))}
    </ol>
  );
}

/* ── Traps ────────────────────────────────────────────────────────────────── */

function TrapsPanel() {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <div className="rounded-lg border border-[var(--chart-red)]/35 bg-[var(--chart-red)]/8 px-2.5 py-2">
        <p className="text-[11px] font-bold text-[var(--chart-red)]">Bandingkan posisi, bukan tinggi</p>
        <p className="mt-0.5 text-[10px] leading-snug text-[var(--text-secondary)]">
          Jumlah sampel tiap pelet berbeda, jadi kedalaman serapan tidak sebanding antarsampel.
        </p>
      </div>
      <div className="rounded-lg border border-[var(--chart-red)]/35 bg-[var(--chart-red)]/8 px-2.5 py-2">
        <p className="text-[11px] font-bold text-[var(--chart-red)]">2350 cm⁻¹ = CO₂ udara</p>
        <p className="mt-0.5 text-[10px] leading-snug text-[var(--text-secondary)]">
          Bukan gugus fungsi sampel. Pita kecil bergerigi juga artefak uap air.
        </p>
      </div>
    </div>
  );
}

/* ── Conclusions ──────────────────────────────────────────────────────────── */

function ConclusionsPanel() {
  const questions = [
    "Sudahkah fumarat terkoordinasi dengan Al³⁺?",
    "Masih adakah asam fumarat bebas?",
    "Sesuaikah posisi pita dengan literatur?",
    "Apa penyebab perbedaan antarsampel?",
  ];

  return (
    <ol className="flex h-full flex-col justify-center gap-2">
      {questions.map((q, i) => (
        <li key={i} className="flex items-start gap-2 text-[11px] leading-snug">
          <span className="shrink-0 rounded bg-[var(--surface-container)] px-1.5 font-bold tabular-nums text-[var(--primary-container)]">
            {i + 1}
          </span>
          <span className="min-w-0 text-[var(--text-secondary)]">{q}</span>
        </li>
      ))}
    </ol>
  );
}

/* ── Report grid ──────────────────────────────────────────────────────────── */

function ReportGridPanel() {
  const items = [
    "Spektra FTIR sampel dan asam fumarat",
    "Identifikasi pita & gugus fungsi",
    "Perbandingan dengan literatur",
    "Evaluasi kemurnian produk",
  ];

  return (
    <ul className="flex h-full flex-col justify-center gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-[11px] font-semibold">
          <span aria-hidden="true" className="material-symbols-outlined text-sm text-[var(--chart-green)]">
            check_circle
          </span>
          <span className="min-w-0 text-[var(--text-secondary)]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export const FTIR_SLIDE_PANEL_VARIANTS = [
  "ftir-vibration",
  "ftir-spectrum-acid",
  "ftir-spectrum-alfum",
  "ftir-coordination",
  "ftir-purity",
  "ftir-excel",
  "ftir-traps",
  "ftir-conclusions",
  "ftir-report-grid",
] as const;

export type { FtirBand };
export { FUMARIC_BASELINE, ALFUM_OFFSET };
