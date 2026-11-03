"use client";

/**
 * Tutorial pengolahan BET di Excel (Modul 7).
 *
 * Praktikan mengerjakan pengolahan ini sendiri di Excel, jadi tutorial ini
 * menampilkan sel dan rumus persis seperti panduan — dengan tombol salin agar
 * rumus panjang tidak perlu diketik ulang dan salah ketik.
 */

import { useState } from "react";

import { EXCEL_STEPS, type ExcelStep } from "@/lib/m7-bet";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");

  function flash(next: "ok" | "fail") {
    setState(next);
    window.setTimeout(() => setState("idle"), 1600);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      flash("ok");
      return;
    } catch {
      // Clipboard API ditolak (konteks tidak aman / izin). Jatuhkan ke
      // textarea sementara; execCommand masih jalan di lebih banyak konteks.
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const done = document.execCommand("copy");
      document.body.removeChild(ta);
      flash(done ? "ok" : "fail");
    } catch {
      flash("fail");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Salin rumus untuk ${label}`}
      className="shrink-0 rounded border border-[var(--outline-variant)] px-1.5 py-0.5 text-[9.5px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-selected)]"
    >
      {state === "ok" ? "tersalin" : state === "fail" ? "salin manual" : "salin"}
    </button>
  );
}

function CellTable({
  cells,
}: {
  cells: readonly { cell: string; label: string; formula: string }[];
}) {
  return (
    <div className="mt-1.5 overflow-x-auto rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
      <table className="w-full min-w-[24rem] border-collapse">
        <tbody>
          {cells.map((c) => (
            <tr key={c.cell} className="border-b border-[var(--border)] last:border-0">
              <td className="w-12 whitespace-nowrap px-2 py-1.5 font-mono text-[11px] font-semibold text-[var(--foreground)]">
                {c.cell}
              </td>
              <td className="px-2 py-1.5 text-[11.5px] text-[var(--text-secondary)]">{c.label}</td>
              <td className="px-2 py-1.5">
                {c.formula ? (
                  <div className="flex items-center gap-1.5">
                    <code className="min-w-0 flex-1 break-all font-mono text-[11px] text-[var(--foreground)]">
                      {c.formula}
                    </code>
                    <CopyButton value={c.formula} label={c.cell} />
                  </div>
                ) : (
                  <span className="text-[10.5px] italic text-[var(--text-secondary)]">salin dari kolom A/B</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BETExcelTutorial() {
  return (
    <div>
      <p className="text-sm leading-6 text-[var(--text-secondary)]">
        Pengolahan dilakukan manual di Excel. Ikuti urutan ini; sel dan rumusnya sama dengan
        panduan modul, jadi hasilnya bisa dicocokkan dengan lembar kerja asisten.
      </p>

      <ol className="mt-2 space-y-2">
        {EXCEL_STEPS.map((step, i) => (
          <li
            key={step.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-container-lowest)] p-2.5"
          >
            <div className="flex items-baseline gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-[10px] font-bold text-[var(--surface-container-lowest)]">
                {i + 1}
              </span>
              <h3 className="text-[13px] font-bold text-[var(--foreground)]">
                {step.title.replace(/^\d+\.\s*/, "")}
              </h3>
            </div>

            <p className="mt-1 pl-7 text-[11.5px] leading-snug text-[var(--text-secondary)]">
              {step.intro}
            </p>

            <ul className="mt-1 space-y-0.5 pl-11 text-[11.5px] leading-snug text-[var(--text-secondary)]">
              {step.bullets.map((b) => (
                <li key={b} className="list-disc">
                  {b}
                </li>
              ))}
            </ul>

            {step.cells && (
              <div className="mt-1.5 pl-7">
                <CellTable cells={step.cells} />
              </div>
            )}

            {step.basis?.map((b) => (
              <div key={b.title} className="mt-1.5 pl-7">
                <p className="text-[11px] font-semibold text-[var(--foreground)]">{b.title}</p>
                <CellTable cells={b.cells} />
              </div>
            ))}
          </li>
        ))}
      </ol>

      <p className="mt-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-control)] px-3 py-2 text-[11px] leading-snug text-[var(--text-secondary)]">
        <strong className="text-[var(--foreground)]">Paling sering salah:</strong> mengambil titik
        desorpsi untuk BET, memakai tekanan P alih-alih P/P₀, dan lupa bahwa jumlah titik BET tiap
        sampel bisa 6 atau 7. Rentang di rumus (mis. <code className="font-mono">H16:H22</code>)
        harus disesuaikan dengan baris terakhir data Anda.
      </p>
    </div>
  );
}