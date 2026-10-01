"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useStudentIdentity } from "@/components/shared/StudentIdentityProvider";

interface M4GuidedAccessContextValue {
  instructorUnlocked: boolean;
  instructorChecking: boolean;
  unlockInstructor: (code: string) => Promise<{ ok: boolean; error?: string }>;
  revokeInstructor: () => Promise<void>;
}

const Context = createContext<M4GuidedAccessContextValue | null>(null);
const focusableSelector = "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])";

export function useM4GuidedAccess() {
  const context = useContext(Context);
  if (!context) throw new Error("useM4GuidedAccess must be used within an M4GuidedAccessGate");
  return context;
}

export function useOptionalM4GuidedAccess() {
  return useContext(Context);
}

export function M4GuidedAccessGate({ children }: { children: React.ReactNode }) {
  const { identity, ready, storageOk, setNim, continueAsGuest } = useStudentIdentity();
  const [draft, setDraft] = useState("");
  const [nimError, setNimError] = useState<string | null>(null);
  const [accessBusy, setAccessBusy] = useState(false);
  const [instructorUnlocked, setInstructorUnlocked] = useState(false);
  const [instructorChecking, setInstructorChecking] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const locked = ready && !identity;
  const [gateVisible, setGateVisible] = useState(false);
  const gateActive = locked || gateVisible;

  useEffect(() => {
    let cancelled = false;
    if (!ready || !identity) {
      setInstructorUnlocked(false);
      setInstructorChecking(false);
      return;
    }
    setInstructorChecking(true);
    fetch("/api/m4-guided/unlock", { method: "GET", cache: "no-store" })
      .then(async (response) => ({ response, body: await response.json().catch(() => ({})) as { unlocked?: boolean } }))
      .then(({ response, body }) => {
        if (!cancelled) setInstructorUnlocked(response.ok && body.unlocked === true);
      })
      .catch(() => {
        if (!cancelled) setInstructorUnlocked(false);
      })
      .finally(() => {
        if (!cancelled) setInstructorChecking(false);
      });
    return () => { cancelled = true; };
  }, [identity?.mode, identity?.nim, ready]);

  useEffect(() => {
    if (locked) {
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
      setGateVisible(true);
      return;
    }
    if (!gateVisible) return;
    exitTimerRef.current = window.setTimeout(() => setGateVisible(false), 220);
    return () => {
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
    };
  }, [locked, gateVisible]);

  useEffect(() => {
    if (!gateActive) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    backgroundRef.current?.setAttribute("inert", "");
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      backgroundRef.current?.removeAttribute("inert");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [gateActive]);

  const unlockInstructor = useCallback(async (code: string) => {
    try {
      const response = await fetch("/api/m4-guided/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = await response.json().catch(() => ({})) as { unlocked?: boolean; error?: string };
      if (!response.ok || body.unlocked !== true) return { ok: false, error: response.status === 429 ? "Terlalu banyak percobaan. Coba lagi nanti." : "Kode tidak diterima." };
      setInstructorUnlocked(true);
      return { ok: true };
    } catch {
      return { ok: false, error: "Akses pengajar tidak tersedia saat ini." };
    }
  }, []);

  const revokeInstructor = useCallback(async () => {
    setInstructorUnlocked(false);
    try { await fetch("/api/m4-guided/unlock", { method: "DELETE" }); } catch { /* local state is already locked */ }
  }, []);

  const value = { instructorUnlocked, instructorChecking, unlockInstructor, revokeInstructor };
  return (
    <Context.Provider value={value}>
      <div data-m4-guided-locked={gateActive ? "true" : "false"} className="relative min-h-full">
        <div ref={backgroundRef} aria-hidden={gateActive ? true : undefined} className={gateActive ? "pointer-events-none select-none blur-[6px]" : undefined}>
          {children}
        </div>
        {gateActive && (
          <div className="m4-access-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[var(--primary)]/65 p-4 backdrop-blur-sm sm:p-6" role="presentation">
            <section
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="m4-guided-nim-title"
              aria-describedby="m4-guided-nim-description"
              data-m4-nim-dialog
              className="m4-access-dialog w-full max-w-lg rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7"
            >
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className="material-symbols-outlined flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--primary-container)]">badge</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">M4 · Sn–Bi electrodeposition</p>
                  <h2 id="m4-guided-nim-title" className="mt-1 text-xl font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>Mulai persiapan praktikum</h2>
                </div>
              </div>
              <p id="m4-guided-nim-description" className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                Masukkan NIM untuk memisahkan ceklis dan catatan Anda di browser ini. Asisten juga dapat memasukkan kode pengajar pada kolom yang sama untuk membuka kontrol presentasi. NIM tidak dikirim ke presenter, relay, atau URL.
              </p>
              <form
                className="mt-5 space-y-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const trimmed = draft.trim();
                  if (/^10524\d{3}$/.test(trimmed)) {
                    const error = setNim(trimmed);
                    setNimError(error);
                    if (!error) setDraft("");
                    return;
                  }
                  setAccessBusy(true);
                  setNimError(null);
                  const unlock = await unlockInstructor(trimmed);
                  if (unlock.ok) {
                    continueAsGuest();
                    setDraft("");
                  } else {
                    if (trimmed.length === 0) {
                      setNimError("Masukkan NIM berformat 10524xxx atau kode asisten.");
                    } else {
                      setNimError("NIM tidak valid (format 10524xxx) atau kode asisten salah.");
                    }
                  }
                  setAccessBusy(false);
                }}
              >
                <label htmlFor="m4-guided-nim-input" className="block text-sm font-semibold text-[var(--foreground)]">NIM mahasiswa atau kode pengajar</label>
                <input
                  ref={inputRef}
                  id="m4-guided-nim-input"
                  inputMode="numeric"
                  autoComplete="off"
                  value={draft}
                  onChange={(event) => { setDraft(event.target.value); if (nimError) setNimError(null); }}
                  placeholder="10524xxx atau kode"
                  aria-invalid={nimError ? true : undefined}
                  aria-describedby={nimError ? "m4-guided-nim-error" : undefined}
                  className="control-field min-h-12 w-full px-3 text-base"
                />
                {nimError && <p id="m4-guided-nim-error" role="alert" className="text-sm font-medium text-[var(--danger)]">{nimError}</p>}
                <button type="submit" disabled={accessBusy} className="m4-motion-control inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary-container)] px-4 text-sm font-bold text-[var(--on-primary)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)] disabled:cursor-wait disabled:opacity-60">
                  <span aria-hidden="true" className="material-symbols-outlined">login</span>Masuk dengan NIM
                </button>
                <button type="button" onClick={continueAsGuest} className="m4-motion-control inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[var(--outline-variant)] px-4 text-sm font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]">
                  Lanjut sebagai tamu
                </button>
              </form>
              {!storageOk && <p role="status" className="mt-3 text-xs text-[var(--warning-ink)]">Penyimpanan browser diblokir; pekerjaan hanya bertahan selama sesi ini.</p>}
              <p className="mt-4 text-xs leading-5 text-[var(--text-secondary)]">KUGU adalah pendamping digital. Ikuti SOP, SDS, dan arahan asisten saat bekerja di laboratorium.</p>
            </section>
          </div>
        )}
      </div>
    </Context.Provider>
  );
}
