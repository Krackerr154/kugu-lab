// ScientificChart — ECharts wrapper with data table alternative and CSV export
"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";

const ReactEChart = dynamic(() => import("echarts-for-react"), { ssr: false });

export interface ChartData {
  name: string;
  color?: string;
  points: { x: number; y: number }[];
}

interface ScientificChartProps {
  title: string;
  xLabel: string;
  yLabel: string;
  series: ChartData[];
  height?: number;
  showTable?: boolean;
}

export function ScientificChart({
  title,
  xLabel,
  yLabel,
  series,
  height = 400,
  showTable = true,
}: ScientificChartProps) {
  const [tableVisible, setTableVisible] = useState(false);
  const chartRef = useRef<any>(null);

  const option: EChartsOption = {
    title: { text: title, left: "center", textStyle: { fontSize: 14 } },
    tooltip: { trigger: "axis" },
    legend: { bottom: 0 },
    grid: { left: 60, right: 20, top: 40, bottom: 60 },
    xAxis: {
      type: "value",
      name: xLabel,
      nameLocation: "middle",
      nameGap: 30,
    },
    yAxis: {
      type: "value",
      name: yLabel,
      nameLocation: "middle",
      nameGap: 40,
    },
    series: series.map((s) => ({
      name: s.name,
      type: "line",
      data: s.points.map((p) => [p.x, p.y]),
      smooth: false,
      symbol: "circle",
      symbolSize: 5,
      lineStyle: { color: s.color },
      itemStyle: { color: s.color },
    })),
  };

  const exportCSV = () => {
    const headers = ["x", ...series.map((s) => s.name)];
    const maxLen = Math.max(...series.map((s) => s.points.length));
    const rows: string[] = [headers.join(",")];
    for (let i = 0; i < maxLen; i++) {
      const row = [
        series[0]?.points[i]?.x?.toString() ?? "",
        ...series.map((s) => s.points[i]?.y?.toString() ?? ""),
      ];
      rows.push(row.join(","));
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = () => {
    const chart = chartRef.current?.getEchartsInstance();
    if (chart) {
      const url = chart.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#fff" });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_")}.png`;
      a.click();
    }
  };

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="flex gap-2 text-xs">
          <button onClick={exportCSV} className="rounded-md border border-[var(--border)] px-2 py-1 hover:bg-[var(--surface-muted)]">
            ⬇ CSV
          </button>
          <button onClick={exportPNG} className="rounded-md border border-[var(--border)] px-2 py-1 hover:bg-[var(--surface-muted)]">
            ⬇ PNG
          </button>
          {showTable && (
            <button
              onClick={() => setTableVisible(!tableVisible)}
              className="rounded-md border border-[var(--border)] px-2 py-1 hover:bg-[var(--surface-muted)]"
            >
              {tableVisible ? "Sembunyikan Tabel" : "Tampilkan Tabel"}
            </button>
          )}
        </div>
      </div>
      <div ref={chartRef as any}>
        <ReactEChart option={option} style={{ height: `${height}px`, width: "100%" }} />
      </div>
      {tableVisible && showTable && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-1 pr-3 text-left">{xLabel}</th>
                {series.map((s) => (
                  <th key={s.name} className="py-1 pr-3 text-left">{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Math.max(...series.map((s) => s.points.length)) > 0 &&
                Array.from({ length: Math.max(...series.map((s) => s.points.length)) }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--outline-variant)]">
                    <td className="py-0.5 pr-3">{series[0]?.points[i]?.x?.toFixed(2) ?? ""}</td>
                    {series.map((s) => (
                      <td key={s.name} className="py-0.5 pr-3">{s.points[i]?.y?.toFixed(2) ?? ""}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
