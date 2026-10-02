"use client";

// Asprak data-entry panel for the review-session data slides (Phase 4).
//
// The asprak types the class's raw numbers (3 groups × 4 values is the usual
// load), the server computes η and returns a dataSetId, and the asprak publishes
// that id to the room. Only the id travels in the broadcast — never the raw
// numbers — so a garbled sync can't corrupt the chart.
//
// Appears only on the data slides (p13/p14), only for a presenting asprak. It is
// a thin overlay above the slide chrome, never part of the student view.

import { useCallback, useMemo, useState } from "react";
import {
  computeDataSet,
  validateDataSet,
  SN2_VALENCE,
  SN_MOLAR_MASS,
  type DataSetInput,
  type DataSetResult,
} from "@/lib/m4-dataset";

interface GroupDraft {
  label: string;
  current: string;
  timeSeconds: string;
  massBefore: string;
  massAfter: string;
}

const emptyGroup = (n: number): GroupDraft => ({
  label: `Kelompok ${n}`,
  current: "",
  timeSeconds: "",
  massBefore: "",
  massAfter: "",
});

const num = (s: string): number => {
  // Accept comma decimals (Indonesian) as well as dots.
  const v = Number(s.trim().replace(",", "."));
  return Number.isFinite(v) ? v : NaN;
};

const toInput = (groups: GroupDraft[], valence: number, molarMass: number): DataSetInput => ({
  valence,
  molarMass,
  groups: groups.map((g) => ({
    label: g.label,
    current: num(g.current),
    timeSeconds: num(g.timeSeconds),
    massBefore: num(g.massBefore),
    massAfter: num(g.massAfter),
  })),
});

export function AsprakDataEntry({
  onPublished,
}: {
  onPublished: (dataSetId: string, result: DataSetResult) => void;
}) {
  const [groups, setGroups] = useState<GroupDraft[]>([emptyGroup(1), emptyGroup(2), emptyGroup(3)]);
  const [valence, setValence] = useState(String(SN2_VALENCE));
  const [molarMass, setMolarMass] = useState(String(SN_MOLAR_MASS));
  const [assumptionConfirmed, setAssumptionConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setGroupField = (i: number, field: keyof GroupDraft, v: string) =>
    setGroups((prev) => prev.map((g, idx) => (idx === i ? { ...g, [field]: v } : g)));

  const addGroup = () => setGroups((prev) => (prev.length < 6 ? [...prev, emptyGroup(prev.length + 1)] : prev));
  const removeGroup = (i: number) => setGroups((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  // Live local preview using the SAME pure function the server uses.
  const preview = useMemo((): DataSetResult | null => {
    const input = toInput(groups, num(valence), num(molarMass));
    if (validateDataSet(input) !== null) return null;
    return computeDataSet(input, assumptionConfirmed);
  }, [groups, valence, molarMass, assumptionConfirmed]);

  const publish = useCallback(async () => {
    setError(null);
    const input = toInput(groups, num(valence), num(molarMass));
    const invalid = validateDataSet(input);
    if (invalid) { setError("Periksa angka: semua kolom harus terisi dan masuk akal."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/m4-guided/dataset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, assumptionConfirmed }),
      });
      const data = (await res.json()) as { ok: boolean; dataSetId?: string; result?: DataSetResult; error?: string };
      if (data.ok && data.dataSetId && data.result) {
        onPublished(data.dataSetId, data.result);
      } else {
        setError(data.error === "payload-too-large" ? "Data terlalu besar." : "Gagal mengirim data.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setSubmitting(false);
    }
  }, [groups, valence, molarMass, assumptionConfirmed, onPublished]);

  const fieldClass =
    "min-h-8 w-full rounded border border-[var(--outline-variant)] bg-[var(--surface)] px-2 text-xs tabular-nums focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary-container)]";

  return (
    <div
      data-asprak-data-entry
      className="flex flex-col gap-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Data kelompok (I, t, m₁, m₂)
        </span>
        <button
          type="button"
          onClick={addGroup}
          disabled={groups.length >= 6}
          className="m4-motion-control inline-flex min-h-6 items-center gap-0.5 rounded border border-[var(--outline-variant)] px-1.5 text-[10px] font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] disabled:opacity-30"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[13px]">add</span>
          Kelompok
        </button>
      </div>

      {/* Compact grid: label + 4 numeric cells + computed η, one row per group. */}
      <div className="flex flex-col gap-1">
        {groups.map((g, i) => {
          const r = preview?.groups[i];
          return (
            <div key={i} className="flex items-center gap-1">
              <input
                aria-label={`Nama kelompok ${i + 1}`}
                value={g.label}
                onChange={(e) => setGroupField(i, "label", e.target.value)}
                className={`${fieldClass} w-20 shrink-0`}
                maxLength={40}
              />
              <input aria-label={`Arus kelompok ${i + 1} (A)`} inputMode="decimal" placeholder="I (A)" value={g.current} onChange={(e) => setGroupField(i, "current", e.target.value)} className={fieldClass} />
              <input aria-label={`Waktu kelompok ${i + 1} (s)`} inputMode="decimal" placeholder="t (s)" value={g.timeSeconds} onChange={(e) => setGroupField(i, "timeSeconds", e.target.value)} className={fieldClass} />
              <input aria-label={`Massa awal kelompok ${i + 1} (g)`} inputMode="decimal" placeholder="m₁ (g)" value={g.massBefore} onChange={(e) => setGroupField(i, "massBefore", e.target.value)} className={fieldClass} />
              <input aria-label={`Massa akhir kelompok ${i + 1} (g)`} inputMode="decimal" placeholder="m₂ (g)" value={g.massAfter} onChange={(e) => setGroupField(i, "massAfter", e.target.value)} className={fieldClass} />
              <span
                className="w-14 shrink-0 text-right text-xs font-bold tabular-nums"
                style={{ color: r ? (r.overHundred || r.negative ? "var(--warning-ink)" : "var(--primary-container)") : "var(--muted)" }}
                data-group-eff={i}
              >
                {r ? `${r.efficiency.toFixed(1)}%` : "—"}
              </span>
              <button
                type="button"
                onClick={() => removeGroup(i)}
                disabled={groups.length <= 1}
                aria-label={`Hapus kelompok ${i + 1}`}
                className="m4-motion-control inline-flex min-h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--muted)] hover:text-[var(--warning-ink)] disabled:opacity-20"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Assumption line — n and M are an assumption that must be confirmed. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--outline-variant)] pt-1.5 text-[11px]">
        <label className="flex items-center gap-1">
          <span className="text-[var(--muted)]">n</span>
          <input aria-label="Valensi (n)" inputMode="numeric" value={valence} onChange={(e) => setValence(e.target.value)} className={`${fieldClass} w-12`} />
        </label>
        <label className="flex items-center gap-1">
          <span className="text-[var(--muted)]">M</span>
          <input aria-label="Massa molar (M, g/mol)" inputMode="decimal" value={molarMass} onChange={(e) => setMolarMass(e.target.value)} className={`${fieldClass} w-16`} />
        </label>
        <label className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <input type="checkbox" checked={assumptionConfirmed} onChange={(e) => setAssumptionConfirmed(e.target.checked)} className="accent-[var(--primary-container)]" />
          Asumsi n &amp; M dikonfirmasi
        </label>
        <span className="text-[10px] italic text-[var(--muted)]">Default Sn²⁺ (ilustrasi) — ganti sesuai kesepakatan.</span>
      </div>

      {error && <p className="text-[11px] text-[var(--danger,#ef4444)]">{error}</p>}

      <button
        type="button"
        onClick={publish}
        disabled={submitting || !preview}
        className="m4-motion-control inline-flex min-h-8 items-center justify-center gap-1 rounded-lg bg-[var(--primary-container)] px-3 text-xs font-bold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-40"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[15px]">bar_chart</span>
        {submitting ? "Mengirim…" : "Publikasikan ke praktikan"}
      </button>
    </div>
  );
}
