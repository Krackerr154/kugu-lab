// ReadinessSummary — the "Ready" stage panel from UI_REBUILD_PLAN.md §6E.
// Splits what the digital preparation CAN establish (theory read, procedure
// rehearsed, checks answered) from what it CANNOT verify and must be confirmed
// by the assistant or a physical SOP/SDS. The final state must never imply the
// student is independently authorized to work at the bench.
"use client";

import type { ReactNode } from "react";
import { ChemText } from "@/components/shared/ChemText";

export interface ReadinessItem {
  text: string;
  /** Optional deep link (e.g. to the pre-lab walkthrough). */
  href?: string;
  linkLabel?: string;
}

interface ReadinessSummaryProps {
  /** Digital-preparation items the student can complete in KUGU. */
  prepared: ReadinessItem[];
  /** Items that require the instructor / physical SOP and KUGU cannot verify. */
  instructorConfirmed: ReadinessItem[];
  /** Closing honesty statement. */
  boundary: ReactNode;
}

export function ReadinessSummary({
  prepared,
  instructorConfirmed,
  boundary,
}: ReadinessSummaryProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* What digital prep establishes */}
      <section className="surface-panel p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[20px] text-[var(--success)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            task_alt
          </span>
          <h3 className="text-base font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Persiapan digital
          </h3>
        </div>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Yang dapat Anda selesaikan di KUGU sebelum masuk lab.
        </p>
        <ul className="mt-3 space-y-2">
          {prepared.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
              <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-[16px] text-[var(--success)]">
                check_circle
              </span>
              <span className="flex-1">
                <ChemText>{item.text}</ChemText>
                {item.href && (
                  <>
                    {" "}
                    <a
                      href={item.href}
                      className="font-semibold text-[var(--primary-container)] underline-offset-2 hover:underline"
                    >
                      {item.linkLabel ?? "Buka"}
                    </a>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* What only the assistant can confirm */}
      <section className="rounded-xl border-2 border-[var(--secondary)]/50 bg-[var(--secondary-container)]/15 p-5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[20px] text-[var(--warning-ink)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            gpp_maybe
          </span>
          <h3 className="text-base font-bold text-[var(--warning-ink)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Wajib konfirmasi asisten
          </h3>
        </div>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Tidak dapat diverifikasi secara digital — harus lewat asisten atau SOP/SDS fisik.
        </p>
        <ul className="mt-3 space-y-2">
          {instructorConfirmed.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
              <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-[16px] text-[var(--warning-ink)]">
                pending
              </span>
              <span className="flex-1">
                <ChemText>{item.text}</ChemText>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Honest boundary spanning both columns */}
      <div className="lg:col-span-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 text-center text-sm text-[var(--text-secondary)]">
        {boundary}
      </div>
    </div>
  );
}
