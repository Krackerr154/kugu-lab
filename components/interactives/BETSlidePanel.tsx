"use client";

import { useMemo } from "react";
import { useMeasuredWidth } from "@/components/shared/useMeasuredWidth";
import { BETPoreFilling, IUPACGallery } from "@/components/interactives/BETTheoryVisuals";
import { BETExcelTutorial } from "@/components/interactives/BETExcelTutorial";
import {
  BET_CONSTANTS,
  COMMON_TRAPS,
  GIVEN_COLUMNS,
  GUIDE_RESULTS,
  REPORT_GRID,
  iupacCurve,
} from "@/lib/m7-bet";
import type { M7EmbeddedComponentType } from "@/lib/m7-review-deck-data";

/**
 * Reference panels embedded in the Module 7 (BET) deck.
 *
 * Read-only figures the assistant points at while talking; every number comes
 * from lib/m7-bet.ts, so a panel can never quote a value the page contradicts.
 * The graded exercise lives on the module page, not here.
 */

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]">{children}</p>;
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-panel rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-3 sm:p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary-container)]">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/* ── Isoterm: loop adsorpsi-desorpsi ───────────────────────────────────── */

function IsothermPanel() {
  const { ref, width } = useMeasuredWidth(480);
  const ads = useMemo(() => iupacCurve("IV", "ads", 60), []);
  const des = useMemo(() => iupacCurve("IV", "des", 60), []);

  const pad = { top: 12, right: 12, bottom: 28, left: 42 };
  const w = Math.max(width, 260);
  const h = width < 420 ? 170 : 200;
  const innerW = Math.max(w - pad.left - pad.right, 100);
  const innerH = Math.max(h - pad.top - pad.bottom, 80);

  const path = (pts: readonly { x: number; v: number }[]) =>
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${(pad.left + p.x * innerW).toFixed(1)},${(pad.top + innerH - p.v * innerH).toFixed(1)}`)
      .join(" ");

  return (
    <PanelShell title="Isoterm adsorpsi-desorpsi">
      <div ref={ref} className="w-full">
        <svg width={w} height={h} role="img" aria-label="Isoterm tipe IV dengan loop histeresis">
          <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="var(--outline)" strokeWidth="1" />
          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + innerH} stroke="var(--outline)" strokeWidth="1" />
          <path d={path(ads)} fill="none" stroke="var(--chart-navy)" strokeWidth="2" />
          <path d={path(des)} fill="none" stroke="var(--chart-gold)" strokeWidth="2" strokeDasharray="4 3" />
          <text x={pad.left + innerW / 2} y={h - 8} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">
            P/P₀
          </text>
          <text x={12} y={pad.top + innerH / 2} textAnchor="middle" fontSize="11" fill="var(--text-secondary)" transform={`rotate(-90 12 ${pad.top + innerH / 2})`}>
            V (cm³/g STP)
          </text>
          <text x={pad.left + 4} y={pad.top + 10} fontSize="10" fill="var(--chart-navy)">adsorpsi</text>
          <text x={pad.left + 4} y={pad.top + 24} fontSize="10" fill="var(--chart-gold)">desorpsi</text>
        </svg>
      </div>
      <Caption>Kiri: mikropori terisi. Tengah: lapisan berganda. Kanan: kondensasi kapiler. Selisih kedua jalur = histeresis.</Caption>
    </PanelShell>
  );
}

/* ── Persamaan BET ─────────────────────────────────────────────────────── */

function EquationPanel() {
  const c = BET_CONSTANTS;
  return (
    <PanelShell title="Persamaan BET">
      <code className="block overflow-x-auto rounded-lg bg-[var(--surface-container-lowest)] px-3 py-2 text-[12px] leading-relaxed text-[var(--foreground)]">
        1 / [W(P₀/P − 1)] = 1/(Wm·C) + [(C − 1)/(Wm·C)] · (P/P₀)
      </code>
      <ul className="mt-2 space-y-1 text-[11.5px] leading-snug text-[var(--text-secondary)]">
        <li>Linear hanya pada P/P₀ {c.linearMin}–{c.linearMax}; instrumen memakai {c.windowMin}–{c.windowMax}.</li>
        <li>Permukaan dianggap homogen; kalor lapisan pertama berbeda dari lapisan berikutnya.</li>
        <li>Tidak ada interaksi antarmolekul dalam satu lapisan.</li>
        <li>Lapisan berganda menjadi tak terhingga pada P/P₀ = 1.</li>
      </ul>
      <Caption>y = ruas kiri, x = P/P₀. Slope dan intersep garis itulah yang dipakai.</Caption>
    </PanelShell>
  );
}

/* ── Turunan besaran ───────────────────────────────────────────────────── */

const DERIVATION_ROWS = [
  { name: "Slope (b)", formula: "(C − 1)/(Wm·C)" },
  { name: "Intersep (a)", formula: "1/(Wm·C)" },
  { name: "Wm", formula: "1/(a + b)" },
  { name: "C", formula: "b/a + 1" },
  { name: "S (luas permukaan)", formula: "Wm · N · A_cs / M" },
] as const;

function DerivationPanel() {
  return (
    <PanelShell title="Dari garis ke luas permukaan">
      <table className="w-full text-left text-[11.5px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
            <th className="py-1">Besaran</th>
            <th className="py-1">Rumus</th>
          </tr>
        </thead>
        <tbody>
          {DERIVATION_ROWS.map((row) => (
            <tr key={row.name} className="border-t border-[var(--outline-variant)]">
              <td className="py-1 pr-2 font-semibold text-[var(--foreground)]">{row.name}</td>
              <td className="py-1 font-mono text-[11px] text-[var(--text-secondary)]">{row.formula}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Caption>Untuk V dalam cm³/g STP: Vm = 1/(a + b) dan S = Vm · N · A_cs / {BET_CONSTANTS.molarVolume}.</Caption>
    </PanelShell>
  );
}

/* ── Data yang diberikan ───────────────────────────────────────────────── */

function GivenPanel() {
  return (
    <PanelShell title="Data yang diberikan">
      <table className="w-full text-left text-[11.5px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
            <th className="py-1">Kolom</th>
            <th className="py-1">Satuan</th>
          </tr>
        </thead>
        <tbody>
          {GIVEN_COLUMNS.map((col) => (
            <tr key={col.column} className="border-t border-[var(--outline-variant)]">
              <td className="py-1 pr-2 font-semibold text-[var(--foreground)]">{col.column}</td>
              <td className="py-1 text-[var(--text-secondary)]">{col.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Titik BET (adsorpsi, P/P₀ 0,05–0,30)</h4>
      <table className="mt-1 w-full text-left text-[11.5px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
            <th className="py-1">Sampel</th>
            <th className="py-1">Titik</th>
            <th className="py-1">P/P₀</th>
          </tr>
        </thead>
        <tbody>
          {GUIDE_RESULTS.map((r) => (
            <tr key={r.sample} className="border-t border-[var(--outline-variant)]">
              <td className="py-1 pr-2 font-semibold text-[var(--foreground)]">{r.sample}</td>
              <td className="py-1 tabular-nums">{r.points}</td>
              <td className="py-1 tabular-nums text-[var(--text-secondary)]">{r.range}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Caption>Jumlah baris adsorpsi dan desorpsi berbeda — itu normal.</Caption>
    </PanelShell>
  );
}

/* ── Validitas ─────────────────────────────────────────────────────────── */

function ValidityPanel() {
  return (
    <PanelShell title="R² bagus belum tentu valid">
      <table className="w-full text-left text-[11.5px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
            <th className="py-1">Sampel</th>
            <th className="py-1">R²</th>
            <th className="py-1">C</th>
            <th className="py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {GUIDE_RESULTS.map((r) => (
            <tr key={r.sample} className="border-t border-[var(--outline-variant)]">
              <td className="py-1 pr-2 font-semibold text-[var(--foreground)]">{r.sample}</td>
              <td className="py-1 tabular-nums">{r.r2.toFixed(4)}</td>
              <td className="py-1 tabular-nums text-[var(--warning-ink)]">{r.c.toFixed(2)}</td>
              <td className="py-1 text-[var(--warning-ink)]">{r.valid ? "valid" : "tidak valid"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Caption>Intersep negatif → C negatif → BET tidak sah, walau R² mendekati 1.</Caption>
    </PanelShell>
  );
}

/* ── Hasil acuan ───────────────────────────────────────────────────────── */

function ResultsPanel() {
  return (
    <PanelShell title="Hasil acuan dari panduan">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-[11.5px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <th className="py-1">Sampel</th>
              <th className="py-1">b</th>
              <th className="py-1">a</th>
              <th className="py-1">R²</th>
              <th className="py-1">Vm</th>
              <th className="py-1">C</th>
              <th className="py-1">S (m²/g)</th>
            </tr>
          </thead>
          <tbody>
            {GUIDE_RESULTS.map((r) => (
              <tr key={r.sample} className="border-t border-[var(--outline-variant)]">
                <td className="py-1 pr-2 font-semibold text-[var(--foreground)]">{r.sample}</td>
                <td className="py-1 tabular-nums">{r.slope.toFixed(6)}</td>
                <td className="py-1 tabular-nums">{r.intercept.toFixed(6)}</td>
                <td className="py-1 tabular-nums">{r.r2.toFixed(4)}</td>
                <td className="py-1 tabular-nums">{r.vm.toFixed(2)}</td>
                <td className="py-1 tabular-nums text-[var(--warning-ink)]">{r.c.toFixed(2)}</td>
                <td className="py-1 tabular-nums font-semibold">{r.surfaceArea.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Caption>Ketiga sampel: C negatif, sehingga luas permukaan dilaporkan sebagai indikasi, bukan nilai tervalidasi.</Caption>
    </PanelShell>
  );
}

/* ── Jebakan & kisi-kisi ───────────────────────────────────────────────── */

function TrapsPanel() {
  return (
    <PanelShell title="Tiga jebakan">
      <ol className="list-decimal space-y-1.5 pl-4 text-[12px] leading-snug text-[var(--foreground)]">
        {COMMON_TRAPS.map((trap) => (
          <li key={trap}>{trap}</li>
        ))}
      </ol>
      <Caption>Ditambah satu aturan tidak tertulis: jangan memilih titik demi R² yang lebih baik.</Caption>
    </PanelShell>
  );
}

function ReportPanel() {
  return (
    <PanelShell title="Yang dilaporkan">
      <ol className="list-decimal space-y-1.5 pl-4 text-[12px] leading-snug text-[var(--foreground)]">
        {REPORT_GRID.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <Caption>Angka tetap dilaporkan; status validitas tetap dinyatakan. Keduanya tidak saling menggantikan.</Caption>
    </PanelShell>
  );
}

/* ── Router ────────────────────────────────────────────────────────────── */

export function BETSlidePanel({ variant }: { variant: M7EmbeddedComponentType }) {
  switch (variant) {
    case "bet-isotherm":
      return <IsothermPanel />;
    case "bet-pore":
      return <BETPoreFilling />;
    case "bet-iupac":
      return <IUPACGallery />;
    case "bet-equation":
      return <EquationPanel />;
    case "bet-derivation":
      return <DerivationPanel />;
    case "bet-given":
      return <GivenPanel />;
    case "bet-excel":
      return <BETExcelTutorial />;
    case "bet-validity":
      return <ValidityPanel />;
    case "bet-results":
      return <ResultsPanel />;
    case "bet-traps":
      return <TrapsPanel />;
    case "bet-report":
      return <ReportPanel />;
    default:
      return null;
  }
}
