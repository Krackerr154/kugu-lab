"use client";

import Link from "next/link";
import { useOptionalM4GuidedAccess } from "@/components/shared/M4GuidedAccessGate";

/**
 * Entry point to the Module 6 review deck.
 *
 * Same contract as M5PresentationHero: one card, two actions. A praktikan gets
 * "Buka Slideshow" straight into the student player; the assistant gets the
 * same player plus the presenter console, which is where a live session is
 * actually broadcast from. The assistant console is always shown as a link so
 * an unlocked assistant can open it — but unlocked-ness is read from
 * guided-access, not guessed here, so a praktikan sees the locked affordance
 * instead of a button that bounces them off a password wall.
 */
export function M6PresentationHero() {
  const guidedAccess = useOptionalM4GuidedAccess();
  const isAssistant = guidedAccess?.instructorUnlocked === true;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 sm:p-5">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            <span aria-hidden="true" className="material-symbols-outlined text-base">
              slideshow
            </span>
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
            ? "Anda terverifikasi sebagai asisten praktikum. Buka konsol pemandu untuk menyiarkan 18 slide, atau ikuti sendiri sebagai praktikan."
            : "Ikuti pemaparan 18 slide interaktif FTIR dan TGA bersama asisten praktikum, tersinkron langsung lewat WebSocket."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Link
          href="/modules/m6-ftir-tga/presentation"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[var(--primary-container)] px-3.5 py-1.5 text-xs font-bold text-[var(--on-primary)] shadow-xs transition-opacity hover:opacity-90"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">
            play_arrow
          </span>
          <span>{isAssistant ? "Lihat Layar Praktikan" : "Buka Slideshow"}</span>
        </Link>

        <Link
          href="/modules/m6-ftir-tga/presenter"
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            isAssistant
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
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
