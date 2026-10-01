"use client";

// Compact NIM entry + identity badge for M3 (Phase 1).
//
// Kept deliberately low-profile so it does not bloat the module's top chrome or
// push the stage rail down: one wrapping row, no large heading block. M3 stays
// fully usable whether or not a NIM is entered (guest path allowed). Switching
// identity NEVER deletes saved work — it only changes the active namespaced key.

import { useState } from "react";
import { useStudentIdentity } from "@/components/shared/StudentIdentityProvider";
import { useOptionalM4GuidedAccess } from "@/components/shared/M4GuidedAccessGate";

export function StudentIdentityGate({ hidePrompt = false }: { hidePrompt?: boolean }) {
  const { identity, ready, storageOk, setNim, continueAsGuest, changeIdentity } = useStudentIdentity();
  const guidedAccess = useOptionalM4GuidedAccess();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Avoid an SSR/first-paint flash: render nothing until storage has been read.
  if (!ready) return null;

  const isAssistant = guidedAccess?.instructorUnlocked === true;

  // Assistant Mode Badge
  if (isAssistant) {
    return (
      <div
        data-identity-badge
        className="flex h-full min-h-[52px] items-center justify-between gap-x-3 rounded-lg border border-[var(--primary-container)] bg-[var(--surface-container-low)] px-3.5 py-2 text-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-[var(--primary-container)] shrink-0">
            school
          </span>
          <div className="flex flex-wrap items-baseline gap-x-1.5 min-w-0">
            <span className="font-bold text-[var(--foreground)] truncate">Asisten Praktikum</span>
            <span className="text-xs text-[var(--text-secondary)] shrink-0">· Akses asisten aktif</span>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await guidedAccess?.revokeInstructor();
            changeIdentity();
          }}
          className="m4-motion-control min-h-9 shrink-0 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
          title="Keluar dari mode asisten"
        >
          Keluar Asisten
        </button>
      </div>
    );
  }

  // Already chosen student identity → compact single-row badge.
  if (identity) {
    const isNim = identity.mode === "nim";
    const label = isNim ? `NIM ${identity.nim}` : "Mode tamu";
    return (
      <div
        data-identity-badge
        className="flex h-full min-h-[52px] items-center justify-between gap-x-3 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3.5 py-2 text-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-[var(--primary-container)] shrink-0">
            {isNim ? "badge" : "person"}
          </span>
          <div className="flex flex-wrap items-baseline gap-x-1.5 min-w-0">
            <span className="font-semibold text-[var(--foreground)] truncate">{label}</span>
            <span className="text-xs text-[var(--text-secondary)] shrink-0">· tersimpan lokal di browser ini</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setDraft(""); setError(null); changeIdentity(); }}
          className="m4-motion-control min-h-9 shrink-0 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
        >
          Ganti NIM
        </button>
      </div>
    );
  }

  // No choice yet → compact prompt row (label + input + two actions, wrapping).
  if (hidePrompt) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(setNim(draft));
  };

  return (
    <section aria-labelledby="nim-gate-title" className="h-full min-h-[52px] rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3.5 py-2">
      <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
        <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-[var(--primary-container)] shrink-0">badge</span>
        <label id="nim-gate-title" htmlFor="nim-input" className="text-sm font-semibold text-[var(--foreground)]">
          NIM <span className="font-normal text-[var(--text-secondary)]">(opsional, disimpan lokal)</span>
        </label>
        <input
          id="nim-input"
          inputMode="numeric"
          autoComplete="off"
          value={draft}
          onChange={(e) => { setDraft(e.target.value); if (error) setError(null); }}
          placeholder="10524xxx"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "nim-error" : undefined}
          className="control-field min-h-9 w-32 px-3 text-sm"
        />
        <button
          type="submit"
          className="m4-motion-control inline-flex min-h-9 items-center gap-1 rounded-lg bg-[var(--primary-container)] px-3 text-xs font-semibold text-[var(--on-primary)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">check</span>Simpan
        </button>
        <button
          type="button"
          onClick={continueAsGuest}
          className="m4-motion-control inline-flex min-h-9 items-center rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
        >
          Lanjut sebagai tamu
        </button>
      </form>
      {error && <p id="nim-error" role="alert" className="mt-1.5 text-xs font-medium text-[var(--danger)]">{error}</p>}
      {!storageOk && (
        <p role="status" className="mt-1.5 flex items-start gap-1.5 text-xs text-[var(--warning-ink)]">
          <span aria-hidden="true" className="material-symbols-outlined text-[14px] shrink-0">info</span>
          Penyimpanan browser diblokir; pekerjaan hanya bertahan selama sesi ini.
        </p>
      )}
    </section>
  );
}
