"use client";

// Student-facing data chart for review data slides (Phase 4).
//
// Fetches the computed class results by the dataSetId the asprak published, then
// renders a horizontal bar chart of current efficiency per group. CSS-only bars
// (no chart lib) so it stays light and animates with GPU props only (width via
// transform-free inline style set once; color tokens). The 100% line is the
// teaching anchor: >100% is flagged as a diagnostic, not success.
//
// Only derived teaching numbers are fetched — never NIM or raw personal data.

import { useEffect, useState } from "react";
import type { DataSetResult } from "@/lib/m4-dataset";

const clampPct = (p: number) => Math.max(0, Math.min(140, p)); // cap bar length for layout

export function ReviewDataChart({ dataSetId }: { dataSetId: string }) {
  const [result, setResult] = useState<DataSetResult | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error" | "notfound">("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setResult(null);
    (async () => {
      try {
        const res = await fetch(`/api/m4-guided/dataset/${encodeURIComponent(dataSetId)}`, { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 404) { setState("notfound"); return; }
        const data = (await res.json()) as { ok: boolean; result?: DataSetResult };
        if (data.ok && data.result) { setResult(data.result); setState("ready"); }
        else setState("error");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => { cancelled = true; };
  }, [dataSetId]);

  if (state === "loading") {
    return <p data-review-data-chart className="text-xs text-[var(--muted)]">Memuat data kelas…</p>;
  }
  if (state === "notfound") {
    return <p data-review-data-chart className="text-xs text-[var(--muted)]">Data belum dipublikasikan asisten.</p>;
  }
  if (state === "error" || !result) {
    return <p data-review-data-chart className="text-xs text-[var(--danger,#ef4444)]">Gagal memuat data kelas.</p>;
  }

  const maxEff = Math.max(100, ...result.groups.map((g) => g.efficiency));
  const scale = (pct: number) => `${(clampPct(pct) / clampPct(maxEff)) * 100}%`;

  return (
    <div data-review-data-chart className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        {result.groups.map((g, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-24 shrink-0 truncate text-xs font-semibold text-[var(--foreground)]" title={g.label}>
              {g.label}
            </span>
            <div className="relative h-5 flex-1 overflow-hidden rounded bg-[var(--surface-container)]">
              {/* 100% reference line */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 w-px bg-[var(--outline)]"
                style={{ left: scale(100) }}
              />
              <span
                className="m4-motion-color absolute inset-y-0 left-0 rounded"
                style={{
                  width: scale(g.efficiency),
                  backgroundColor: g.overHundred || g.negative ? "var(--warning-ink)" : "var(--primary-fixed-dim)",
                }}
                data-group-bar={i}
              />
            </div>
            <span
              className="w-14 shrink-0 text-right text-xs font-bold tabular-nums"
              style={{ color: g.overHundred || g.negative ? "var(--warning-ink)" : "var(--primary-container)" }}
            >
              {g.efficiency.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "var(--primary-fixed-dim)" }} />
          ≤ 100% (wajar)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "var(--warning-ink)" }} />
          &gt; 100% (periksa: galat, bukan keunggulan)
        </span>
        <span className="ml-auto italic">
          Asumsi n={result.valence}, M={result.molarMass} g/mol
          {result.assumptionConfirmed ? " (dikonfirmasi)" : " (belum dikonfirmasi)"}
        </span>
      </div>
    </div>
  );
}
