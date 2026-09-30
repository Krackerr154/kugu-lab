"use client";

import { useState } from "react";
import { useM4GuidedAccess } from "@/components/shared/M4GuidedAccessGate";

export function M4InstructorUnlock() {
  const { unlockInstructor, instructorChecking } = useM4GuidedAccess();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <section data-m4-instructor-unlock className="rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[var(--primary-container)]">lock</span>
        <span className="font-semibold text-[var(--foreground)]">Mode pengajar</span>
        <span className="text-xs text-[var(--text-secondary)]">Kontrol presentasi hanya untuk instruktur/asisten.</span>
        <button
          type="button"
          onClick={() => { setOpen((current) => !current); setError(null); }}
          className="m4-motion-control ml-auto min-h-11 rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]"
          aria-expanded={open}
          aria-controls="m4-instructor-unlock-form"
        >
          Akses pengajar
        </button>
      </div>
      {open && (
        <form
          id="m4-instructor-unlock-form"
          className="m4-motion-enter mt-3 grid gap-2 sm:grid-cols-[1fr_auto]"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(null);
            const result = await unlockInstructor(code);
            if (!result.ok) setError(result.error ?? "Kode tidak diterima.");
            else setCode("");
            setBusy(false);
          }}
        >
          <label className="text-xs font-semibold text-[var(--text-secondary)]">
            Kode pengajar
            <input
              aria-label="Kode pengajar"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={code}
              onChange={(event) => { setCode(event.target.value); if (error) setError(null); }}
              className="control-field mt-1 min-h-11 w-full px-3 text-base"
              autoFocus
            />
          </label>
          <button
            type="submit"
            disabled={busy || instructorChecking || !code}
            className="m4-motion-control mt-auto inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[var(--primary-container)] px-3 text-xs font-bold text-[var(--on-primary)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">key</span>
            {busy ? "Memeriksa…" : "Buka kontrol"}
          </button>
          {error && <p role="alert" className="text-xs font-medium text-[var(--danger)] sm:col-span-2">{error}</p>}
        </form>
      )}
      <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
        Unlock ini hanya menampilkan kontrol. Sesi relay tetap memerlukan ruang dan tiket pengajar yang diterbitkan operator.
      </p>
    </section>
  );
}
