"use client";

import Link from "next/link";
import { useOptionalM4GuidedAccess } from "@/components/shared/M4GuidedAccessGate";

export function M5PresentationHero() {
  const guidedAccess = useOptionalM4GuidedAccess();
  const isAssistant = guidedAccess?.instructorUnlocked === true;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 sm:p-5">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            <span aria-hidden="true" className="material-symbols-outlined text-base">slideshow</span>
            Sesi Presentasi &amp; Review Terpandu
          </span>
          {isAssistant && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Akses Asisten Aktif
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          {isAssistant
            ? "Anda terverifikasi sebagai asisten praktikum. Anda dapat membuka konsol pemandu untuk menyiarkan slide atau melihat layar praktikan."
            : "Ikuti pemaparan 20 slide interaktif bersama asisten praktikum dengan sinkronisasi langsung via WebSocket."}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/modules/m5-xrd/presentation"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[var(--primary-container)] px-3.5 py-1.5 text-xs font-bold text-[var(--on-primary)] hover:opacity-90 transition-opacity shadow-xs"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">play_arrow</span>
          <span>Buka Presentasi</span>
        </Link>
        <Link
          href="/modules/m5-xrd/presenter"
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            isAssistant
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
              : "border-[var(--outline-variant)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-container)]"
          }`}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">
            {isAssistant ? "co_present" : "lock"}
          </span>
          <span>{isAssistant ? "Konsol Asisten" : "Mode Asisten"}</span>
        </Link>
      </div>
    </div>
  );
}
