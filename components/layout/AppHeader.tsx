"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { contentConflicts } from "@/lib/conflicts";

const routeContext: Array<[string, string]> = [
  ["/prelab", "Persiapan sebelum sesi praktikum"],
  ["/modules", "Eksplorasi modul dan prosedur"],
  ["/analisis", "Workspace analisis data"],
  ["/notebook", "Catatan observasi tersimpan"],
  ["/laporan", "Susun bukti dan laporan"],
  ["/referensi", "Keselamatan, SDS, dan referensi"],
  ["/pengajar", "Review konten dan konflik manual"],
];

function getContext(pathname: string) {
  if (pathname === "/") return "Selamat datang, Praktikan";
  return routeContext.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Pendamping praktikum KI3131";
}

export function AppHeader() {
  const pathname = usePathname();
  const unresolvedConflicts = contentConflicts.filter((conflict) => conflict.status === "unresolved");
  const isHome = pathname === "/";

  return (
    <header className="no-print sticky top-0 z-10 hidden h-20 items-center justify-between border-b border-[var(--outline-variant)] bg-[var(--surface)]/95 px-6 backdrop-blur-sm lg:flex lg:px-10 xl:px-12">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--secondary)]">
          KUGU Lab · KI3131
        </p>
        <div className="mt-1 flex items-baseline gap-3">
          {isHome ? (
            <h1 className="truncate text-xl font-bold tracking-tight text-[var(--primary)] lg:text-2xl">
              KUGU Laboratory Platform
            </h1>
          ) : (
            <p className="truncate text-xl font-bold tracking-tight text-[var(--primary)] lg:text-2xl">
              KUGU Laboratory Platform
            </p>
          )}
          <span className="hidden text-sm text-[var(--on-surface-variant)] xl:inline">{getContext(pathname)}</span>
        </div>
      </div>

      <div className="ml-6 flex shrink-0 items-center gap-2 text-[var(--on-surface-variant)]">
        <Link
          href="/modules"
          aria-label="Jelajahi modul"
          className="group hidden h-10 items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 text-sm transition-colors hover:border-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:ring-2 focus-visible:ring-[var(--secondary)] sm:flex"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">search</span>
          <span>Jelajahi modul</span>
        </Link>

        <Link
          href="/pengajar"
          aria-label={
            unresolvedConflicts.length > 0
              ? `Buka ruang pengajar, ${unresolvedConflicts.length} konflik perlu ditinjau`
              : "Buka ruang pengajar"
          }
          className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-container-high)] focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
        >
          <span aria-hidden="true" className="material-symbols-outlined">notifications</span>
          {unresolvedConflicts.length > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--error)] ring-2 ring-[var(--surface)]"
            />
          )}
        </Link>

        <Link
          href="/referensi"
          aria-label="Buka referensi dan bantuan keselamatan"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-container-high)] focus-visible:ring-2 focus-visible:ring-[var(--secondary)]"
        >
          <span aria-hidden="true" className="material-symbols-outlined">help</span>
        </Link>

        <div
          aria-label="Profil Praktikan"
          className="ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--outline-variant)] bg-[var(--surface-variant)] text-sm font-bold text-[var(--on-surface-variant)]"
        >
          P
        </div>
      </div>
    </header>
  );
}
