// M6 TGA Workspace — Al-Fum thermogram/DTG, mass-loss annotation, theoretical vs experimental
"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import { Equation } from "@/components/shared/Equation";
import {
  AL_FUM_AL2O3_MASS,
  TGA_MODELS,
  TGA_T_MAX,
  TGA_T_MIN,
  buildTgaCurve,
  massLossBetween,
  readTgaSteps,
  tgaDtgDomain,
  theoreticalWaterLossPct,
  type TgaModelId,
} from "@/lib/m6-tga-model";

const ReactEChart = dynamic(() => import("echarts-for-react"), { ssr: false });

const MODEL_ORDER: readonly TgaModelId[] = ["al-fum-hydrated", "al-fum-dried"];

export function TGAWorkspace() {
  const [tab, setTab] = useState<"thermogram" | "worksheet">("thermogram");

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Worksheet Modul 6" className="flex gap-1 rounded-lg bg-[var(--surface-muted)] p-1">
        {[
          { id: "thermogram", label: "Termogram / DTG" },
          { id: "worksheet", label: "Worksheet Teoretis vs Eksperimental" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as "thermogram" | "worksheet")}
            aria-pressed={tab === t.id}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-white text-[var(--primary-dark)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "thermogram" && <Thermogram />}
      {tab === "worksheet" && <TheoreticalWorksheet />}
    </div>
  );
}

interface Annotation {
  from: number;
  to: number;
}

function Thermogram() {
  const [modelId, setModelId] = useState<TgaModelId>("al-fum-hydrated");
  const model = TGA_MODELS[modelId];
  const points = useMemo(() => buildTgaCurve({ modelId, step: 1 }), [modelId]);
  const steps = useMemo(() => readTgaSteps(model, points), [model, points]);
  const dtgDomain = useMemo(() => tgaDtgDomain(points), [points]);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotateMode, setAnnotateMode] = useState(false);

  const handleChartClick = (params: { value?: [number, number] }) => {
    if (!annotateMode || !params?.value) return;
    const t = Math.round(params.value[0]);
    // First click opens a region, second click closes it, then it repeats.
    setAnnotations((prev) => {
      const open = prev.find((a) => a.from === a.to);
      if (open) {
        return prev.map((a) =>
          a === open ? { from: Math.min(open.from, t), to: Math.max(open.from, t) } : a
        );
      }
      if (prev.length >= 4) return prev;
      return [...prev, { from: t, to: t }];
    });
  };

  const option: EChartsOption = {
    title: {
      text: `Termogram TG/DTG — ${model.label}`,
      left: "center",
      textStyle: { fontSize: 13 },
    },
    tooltip: { trigger: "axis" },
    legend: { bottom: 0, data: ["TG (massa %)", "DTG (%/°C)"] },
    grid: { left: 70, right: 70, top: 50, bottom: 54 },
    xAxis: {
      type: "value",
      name: "Suhu (°C)",
      min: TGA_T_MIN,
      max: TGA_T_MAX,
      nameLocation: "middle",
      nameGap: 26,
    },
    yAxis: [
      { type: "value", name: "Massa (%)", position: "left", min: 0, max: 105 },
      {
        type: "value",
        name: "DTG (%/°C)",
        position: "right",
        min: Math.floor(dtgDomain.min * 10) / 10,
        max: Math.ceil(dtgDomain.max * 10) / 10,
      },
    ],
    series: [
      {
        name: "TG (massa %)",
        type: "line",
        data: points.map((p) => [p.t, p.mass]),
        smooth: false,
        symbol: "none",
        lineStyle: { color: "#ba1a1a", width: 2 },
        yAxisIndex: 0,
        markLine: {
          silent: true,
          symbol: "none",
          label: { formatter: (p: { name?: string }) => p.name ?? "", fontSize: 10 },
          data: steps.map((s) => ({
            name: `${s.peak}°C`,
            xAxis: s.peak,
            lineStyle: { color: "#9aa0a6", type: "dashed", width: 1 },
          })),
        },
      },
      {
        name: "DTG (%/°C)",
        type: "line",
        data: points.map((p) => [p.t, p.dtg]),
        smooth: false,
        symbol: "none",
        lineStyle: { color: "#476083", width: 1.2, type: "dashed" },
        yAxisIndex: 1,
      },
    ],
  };

  const regions = annotations.map((a) => {
    const { from: massFrom, to: massTo, lossPct } = massLossBetween(points, a.from, a.to);
    return { from: a.from, to: a.to, massFrom, massTo, lossPct };
  });
  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Workspace TG/DTG</h3>
      <p className="text-sm text-[var(--muted)] mb-3">
        Kurva model Al-Fum — produk sintesis Modul 1, bukan CaCO<sub>3</sub> generik. Klik grafik
        untuk menandai rentang suhu; Δm dihitung dari kurva.
      </p>

      <div role="group" aria-label="Pilih model sampel" className="mb-2 flex flex-wrap gap-2">
        {MODEL_ORDER.map((id) => (
          <button
            key={id}
            onClick={() => {
              setModelId(id);
              setAnnotations([]);
            }}
            aria-pressed={modelId === id}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              modelId === id
                ? "bg-[var(--primary)] text-white"
                : "border border-[var(--border)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            {TGA_MODELS[id].label}
          </button>
        ))}
      </div>

      <div className="mb-2 flex gap-2">
        <button
          onClick={() => setAnnotateMode(!annotateMode)}
          aria-pressed={annotateMode}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            annotateMode ? "bg-[var(--primary)] text-white" : "border border-[var(--border)]"
          }`}
        >
          {annotateMode ? "Mode Anotasi AKTIF" : "Aktifkan Anotasi"}
        </button>
        {annotations.length > 0 && (
          <button
            onClick={() => setAnnotations([])}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-muted)]"
          >
            Hapus ({annotations.length})
          </button>
        )}
      </div>

      {annotateMode && (
        <div className="mb-2 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-2">
          <p className="mb-1 text-xs text-[var(--muted)]">
            Klik grafik pada suhu awal lalu suhu akhir, atau isi manual lalu tambahkan.
          </p>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const from = Math.round(Number(fd.get("from")));
              const to = Math.round(Number(fd.get("to")));
              if (!Number.isFinite(from) || !Number.isFinite(to)) return;
              if (from < TGA_T_MIN || to > TGA_T_MAX || from === to) return;
              setAnnotations((prev) =>
                prev.length >= 4
                  ? prev
                  : [...prev, { from: Math.min(from, to), to: Math.max(from, to) }]
              );
            }}
          >
            <label className="text-xs font-medium">
              Dari (°C)
              <input
                name="from"
                type="number"
                min={TGA_T_MIN}
                max={TGA_T_MAX}
                step="1"
                defaultValue={100}
                className="ml-1 w-20 rounded border border-[var(--border)] p-1 text-sm"
              />
            </label>
            <label className="text-xs font-medium">
              Sampai (°C)
              <input
                name="to"
                type="number"
                min={TGA_T_MIN}
                max={TGA_T_MAX}
                step="1"
                defaultValue={200}
                className="ml-1 w-20 rounded border border-[var(--border)] p-1 text-sm"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white"
            >
              Hitung Δm
            </button>
          </form>
        </div>
      )}

      <ReactEChart
        option={option}
        style={{ height: "400px", width: "100%" }}
        onEvents={{ click: handleChartClick }}
      />

      {regions.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="py-1 pr-3">No.</th>
                <th className="py-1 pr-3">Rentang (°C)</th>
                <th className="py-1 pr-3">Massa awal (%)</th>
                <th className="py-1 pr-3">Massa akhir (%)</th>
                <th className="py-1 pr-3">Δm (%)</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((r, i) => (
                <tr key={i} className="border-b border-[var(--outline-variant)]">
                  <td className="py-1 pr-3">{i + 1}</td>
                  <td className="py-1 pr-3 font-mono">
                    {r.from === r.to ? `${r.from} °C` : `${r.from}–${r.to} °C`}
                  </td>
                  <td className="py-1 pr-3 font-mono">
                    {r.from === r.to ? "—" : r.massFrom.toFixed(2)}
                  </td>
                  <td className="py-1 pr-3 font-mono">
                    {r.from === r.to ? "—" : r.massTo.toFixed(2)}
                  </td>
                  <td className="py-1 pr-3 font-mono font-semibold">
                    {r.from === r.to ? "klik suhu akhir" : r.lossPct.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <caption className="pb-1 text-left font-semibold">
            Tahap dekomposisi (dibaca dari kurva)
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)] text-left">
              <th className="py-1 pr-3">Tahap</th>
              <th className="py-1 pr-3">Onset (°C)</th>
              <th className="py-1 pr-3">Puncak DTG (°C)</th>
              <th className="py-1 pr-3">Endset (°C)</th>
              <th className="py-1 pr-3">Δm (%)</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s) => (
              <tr key={s.id} className="border-b border-[var(--outline-variant)]">
                <td className="py-1 pr-3 font-semibold">{s.label}</td>
                <td className="py-1 pr-3 font-mono">{s.onset}</td>
                <td className="py-1 pr-3 font-mono">{s.peak}</td>
                <td className="py-1 pr-3 font-mono">{s.endset}</td>
                <td className="py-1 pr-3 font-mono">{s.lossPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-md bg-[var(--surface-muted)] p-3 text-xs">
        <p className="font-semibold">{model.note}</p>
        <ul className="mt-1 space-y-0.5 text-[var(--muted)]">
          {model.steps.map((s) => (
            <li key={s.id}>
              • {s.label}: {s.note}
            </li>
          ))}
          <li>
            • Sisa pada 900 °C ≈ {points[points.length - 1].mass.toFixed(0)}% — residu kaya Al
            (alumina), bukan logam Al.
          </li>
        </ul>
        <p className="mt-2 text-[var(--muted)]">
          <strong>Batas model:</strong> ini kurva sintetis yang disusun dari perilaku TGA
          Al-fumarat di literatur, bukan data terukur sampel kalian. Suhu tahap bergeser dengan
          laju pemanasan, gas purging, dan kadar air — baca onset dan batas tahap pada kurva
          kalian sendiri.
        </p>
      </div>
    </section>
  );
}

function TheoreticalWorksheet() {
  // Real Al-Fum stoichiometry: Al(OH)(fumarate) · nH2O. The worksheet asks for
  // the water content implied by the measured first step instead of hard-coding
  // a CaCO3 example the students never made.
  const [aluminaMass, setAluminaMass] = useState(AL_FUM_AL2O3_MASS);
  const [nWater, setNWater] = useState(2);
  const [experimentalLoss, setExperimentalLoss] = useState(14);

  const theoreticalLoss = theoreticalWaterLossPct(aluminaMass, nWater);
  const error = Math.abs(experimentalLoss - theoreticalLoss);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <h3 className="text-lg font-bold">Worksheet Teoretis vs Eksperimental</h3>
      <p className="text-sm text-[var(--muted)] mb-3">
        Bandingkan kehilangan massa tahap air pada kurva kalian dengan hitungan stoikiometri
        hidrat Al-Fum.
      </p>

      <Equation
        tex={
          "\\text{mass loss}_{\\text{teoretis}} = \\frac{n \\times M_{\\text{H}_2\\text{O}}}{M_{\\text{Al}_2\\text{O}_3} + n \\times M_{\\text{H}_2\\text{O}}} \\times 100\\%"
        }
        label="Kehilangan Massa Teoretis"
        description="n = jumlah molekul air per unit Al2O3. Contoh: n = 2, M(H2O) = 18,015 g/mol, M(Al2O3) = 101,961 g/mol → teoretis ≈ 26,1%"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="m6-alumina-mass" className="text-sm font-medium">
            Massa Al₂O₃ (g/mol)
          </label>
          <input
            id="m6-alumina-mass"
            type="number"
            step="0.001"
            value={aluminaMass}
            onChange={(e) => setAluminaMass(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="m6-nwater" className="text-sm font-medium">
            n air per Al₂O₃
          </label>
          <input
            id="m6-nwater"
            type="number"
            step="1"
            min="0"
            value={nWater}
            onChange={(e) => setNWater(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="m6-experimental-loss" className="text-sm font-medium">
            Kehilangan eksperimental (%)
          </label>
          <input
            id="m6-experimental-loss"
            type="number"
            step="0.01"
            value={experimentalLoss}
            onChange={(e) => setExperimentalLoss(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-[var(--primary-light)] p-4">
        <h4 className="font-semibold text-sm text-[var(--primary-dark)]">Hasil:</h4>
        <div className="mt-2 space-y-1 text-sm">
          <p className="font-mono">
            Teoretis = ({nWater} × 18,015) / ({aluminaMass} + {nWater} × 18,015) × 100 ={" "}
            {theoreticalLoss.toFixed(2)}%
          </p>
          <p className="font-mono">Eksperimental = {experimentalLoss.toFixed(2)}%</p>
          <p className="font-mono">
            Selisih = |{experimentalLoss.toFixed(2)} − {theoreticalLoss.toFixed(2)}| ={" "}
            {error.toFixed(2)}%
          </p>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {error <= 1
            ? "Selisih ≤ 1%: n yang kalian pilih konsisten dengan kurva."
            : "Selisih > 1%: cek ulang n, atau sampel memang tidak stoikiometri (air berlebih / kekurangan)."}
        </p>
      </div>

      <p className="mt-3 text-xs italic text-[var(--muted)]">
        Langkah air hanya salah satu tahap. Dekomposisi fumarat tidak bisa dihitung dengan
        stoikiometri sederhana — untuk itu gunakan kurva TG dan bandingkan dengan literatur.
      </p>

      <div className="mt-3 rounded-md bg-[var(--danger-light)] p-3 text-xs text-[var(--danger)]">
        <span aria-hidden="true" className="material-symbols-outlined align-middle text-base">
          report
        </span>{" "}
        Jalur &quot;Henti dan Panggil Asisten&quot;: untuk anomali gas/perubahan tak terduga, henti
        instrumen dan panggil asisten.
      </div>
    </section>
  );
}
