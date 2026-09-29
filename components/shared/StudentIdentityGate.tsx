"use client";

// Compact NIM entry + identity badge for M3 (Phase 1).
//
// Kept deliberately low-profile so it does not bloat the module's top chrome or
// push the stage rail down: one wrapping row, no large heading block. M3 stays
// fully usable whether or not a NIM is entered (guest path allowed). Switching
// identity NEVER deletes saved work — it only changes the active namespaced key.

import { useState } from "react";
import { useStudentIdentity } from "@/components/shared/StudentIdentityProvider";

export function StudentIdentityGate() {
  const { identity, ready, storageOk, setNim, continueAsGuest, changeIdentity } = useStudentIdentity();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Avoid an SSR/first-paint flash: render nothing until storage has been read.
  if (!ready) return null;

  // Already chosen → compact single-row badge.
  if (identity) {
    const label = identity.mode === "nim" ? `NIM ${identity.nim}` : "Mode tamu";
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2 text-sm">
        <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--primary-container)]">
          {identity.mode === "nim" ? "badge" : "person"}
        </span>
        <span className="font-semibold text-[var(--foreground)]">{label}</span>
        <span className="text-xs text-[var(--text-secondary)]">· tersimpan lokal di browser ini</span>
        <button
          type="button"
          onClick={() => { setDraft(""); setError(null); changeIdentity(); }}
          className="ml-auto min-h-9 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
        >
          Ganti NIM
        </button>
      </div>
    );
  }

  // No choice yet → compact prompt row (label + input + two actions, wrapping).
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(setNim(draft));
  };

  return (
    <section aria-labelledby="nim-gate-title" className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2.5">
      <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
        <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--primary-container)]">badge</span>
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
          className="control-field min-h-11 w-32 px-3 text-base"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[var(--primary-container)] px-3 text-sm font-semibold text-[var(--on-primary)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">check</span>Simpan
        </button>
        <button
          type="button"
          onClick={continueAsGuest}
          className="inline-flex min-h-11 items-center rounded-lg border border-[var(--outline-variant)] px-3 text-sm font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
        >
          Lanjut sebagai tamu
        </button>
      </form>
      {error && <p id="nim-error" role="alert" className="mt-1.5 text-sm font-medium text-[var(--danger)]">{error}</p>}
      {!storageOk && (
        <p role="status" className="mt-1.5 flex items-start gap-1.5 text-xs text-[var(--warning-ink)]">
          <span aria-hidden="true" className="material-symbols-outlined text-[14px] shrink-0">info</span>
          Penyimpanan browser diblokir; pekerjaan hanya bertahan selama sesi ini.
        </p>
      )}
    </section>
  );
}
