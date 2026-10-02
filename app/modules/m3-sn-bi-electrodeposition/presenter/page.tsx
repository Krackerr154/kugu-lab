"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentIdentityProvider } from "@/components/shared/StudentIdentityProvider";
import { M4GuidedAccessGate, useM4GuidedAccess } from "@/components/shared/M4GuidedAccessGate";
import { M3PresentationProvider, useM3Presentation } from "@/components/shared/M3PresentationProvider";
import { PresenterConsole } from "@/components/presentation/PresenterConsole";

function PresenterConsoleRunner() {
  const { instructorUnlocked, instructorChecking } = useM4GuidedAccess();
  const { role, createSession } = useM3Presentation();
  const [launching, setLaunching] = useState(false);

  // Automatically start presenter session if unlocked and not yet presenting
  useEffect(() => {
    if (instructorUnlocked && role !== "presenting" && !launching) {
      setLaunching(true);
      void createSession("Sesi Praktikum KI3131").finally(() => {
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface-container-lowest)] p-4 text-center">
        <div className="surface-panel max-w-md p-6 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface)] space-y-4 shadow-sm">
          <span aria-hidden="true" className="material-symbols-outlined text-4xl text-[var(--primary-container)]">
            lock
          </span>
          <h1 className="text-xl font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Akses Khusus Asisten Praktikum
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Halaman ini dikhususkan bagi asisten untuk memandu presentasi review Modul 4. Silakan masukkan kode asisten pada halaman modul untuk membuka akses.
          </p>
          <Link
            href="/modules/m4-sn-bi-electrodeposition"
            className="m4-motion-control inline-flex min-h-9 items-center justify-center rounded-lg border border-[var(--outline-variant)] px-4 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container)]"
          >
            Kembali ke Modul Praktikum
          </Link>
        </div>
      </div>
    );
  }

  if (role !== "presenting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface-container-lowest)] p-4 text-center space-y-3">
        <span className="flex h-4 w-4 rounded-full bg-[var(--primary-container)] animate-ping mx-auto" />
        <p className="text-sm font-semibold text-[var(--foreground)]">Menyiapkan konsol presentasi asisten…</p>
      </div>
    );
  }

  return <PresenterConsole />;
}

export default function PresenterPage() {
  return (
    <StudentIdentityProvider>
      <M3PresentationProvider>
        <M4GuidedAccessGate>
          <PresenterConsoleRunner />
        </M4GuidedAccessGate>
      </M3PresentationProvider>
    </StudentIdentityProvider>
  );
}
