"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentIdentityProvider } from "@/components/shared/StudentIdentityProvider";
import { M4GuidedAccessGate, useM4GuidedAccess } from "@/components/shared/M4GuidedAccessGate";
import { M3PresentationProvider, useM3Presentation } from "@/components/shared/M3PresentationProvider";
import { M5PresenterConsole } from "@/components/presentation/M5PresenterConsole";

function InstructorLockCard() {
  const { unlockInstructor } = useM4GuidedAccess();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await unlockInstructor(code.trim());
    if (!result.ok) {
      setError(result.error ?? "Kode asisten tidak valid.");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface-container-lowest)] p-4 text-center">
      <div className="surface-panel max-w-md w-full p-6 sm:p-7 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface)] space-y-4 shadow-sm text-left">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="material-symbols-outlined text-4xl text-[var(--primary-container)]">
            lock
          </span>
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Akses Asisten Praktikum
            </h1>
            <p className="text-xs text-[var(--muted)]">Modul 5 · Difraksi Sinar-X Serbuk (XRD)</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          Halaman ini dikhususkan bagi asisten untuk menyiarkan slide review dan mengendalikan sesi praktikum.
          Praktikan mengikuti jalannya presentasi melalui layar praktikan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-[var(--foreground)]">
            Kode Akses Pengajar / Asisten
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Masukkan kode asisten"
              className="control-field mt-1.5 min-h-11 w-full px-3 text-sm"
              autoFocus
            />
          </label>

          {error && <p role="alert" className="text-xs font-medium text-[var(--danger)]">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={busy || !code}
              className="m4-motion-control inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--primary-container)] px-4 text-xs font-bold text-[var(--on-primary)] hover:opacity-90 disabled:opacity-50"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">key</span>
              {busy ? "Memeriksa…" : "Buka Konsol Asisten"}
            </button>
            <Link
              href="/modules/m5-xrd"
              className="m4-motion-control inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--outline-variant)] px-3 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-container)]"
            >
              Kembali
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function PresenterConsoleRunner() {
  const { instructorUnlocked, instructorChecking } = useM4GuidedAccess();
  const { role, createSession } = useM3Presentation();
  const [launching, setLaunching] = useState(false);

  // Start the broadcast as soon as the assistant is unlocked.
  useEffect(() => {
    if (instructorUnlocked && role !== "presenting" && !launching) {
      setLaunching(true);
      void createSession("Sesi Praktikum KI3131 · Modul 5 XRD", "s1").finally(() => {
        setLaunching(false);
      });
    }
  }, [instructorUnlocked, role, launching, createSession]);

  if (instructorChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-container-lowest)] p-4">
        <p className="text-sm font-semibold text-[var(--muted)]">Memeriksa hak akses asisten…</p>
      </div>
    );
  }

  if (!instructorUnlocked) {
    return <InstructorLockCard />;
  }

  if (role !== "presenting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface-container-lowest)] p-4 text-center space-y-3">
        <span className="flex h-4 w-4 rounded-full bg-[var(--primary-container)] animate-ping mx-auto" />
        <p className="text-sm font-semibold text-[var(--foreground)]">Menyiapkan konsol presentasi asisten…</p>
      </div>
    );
  }

  return <M5PresenterConsole />;
}

export default function M5PresenterPage() {
  return (
    <StudentIdentityProvider>
      <M3PresentationProvider>
        <M4GuidedAccessGate
          moduleTag="M5 · Difraksi Sinar-X Serbuk (XRD)"
          moduleTitle="Konsol Asisten Modul 5"
        >
          <PresenterConsoleRunner />
        </M4GuidedAccessGate>
      </M3PresentationProvider>
    </StudentIdentityProvider>
  );
}
