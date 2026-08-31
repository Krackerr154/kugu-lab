"use client";

import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/layout/TransitionLink";

const routeContext: Array<[string, string]> = [
  ["/prelab", "Persiapan sebelum sesi praktikum"],
  ["/modules", "Eksplorasi modul dan prosedur"],
  ["/analisis", "Workspace analisis data"],
  ["/notebook", "Catatan observasi tersimpan"],
  ["/laporan", "Susun bukti dan laporan"],
  ["/referensi", "Keselamatan, SDS, dan referensi"],
];

function getContext(pathname: string) {
  if (pathname === "/") return "Selamat datang, Praktikan";
  return routeContext.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Pendamping praktikum KI3131";
}

export function AppHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header style={{ viewTransitionName: "app-header" }} className="no-print sticky top-0 z-10 hidden h-20 items-center justify-between border-b border-[var(--outline-variant)] bg-[var(--surface)]/95 px-6 backdrop-blur-sm lg:flex lg:px-10 xl:px-12">
      <div className="flex items-center gap-4 min-w-0">
        {!isHome && (
          <TransitionLink
            href="/"
            direction="nav-back"
            aria-label="Kembali ke Beranda"
            className="group flex items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] px-3.5 py-2 text-xs font-bold text-[var(--primary-container)] shadow-xs transition-all hover:border-[var(--primary-container)] hover:bg-[var(--primary-container)] hover:text-white hover:shadow-sm active:scale-[0.97]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base transition-transform duration-200 group-hover:-translate-x-1">
              arrow_back
            </span>
            <span>Beranda</span>
          </TransitionLink>
        )}

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary-container)]">
            KUGU Lab · KI3131
          </p>
          <div className="mt-0.5 flex items-baseline gap-3">
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
      </div>

      <div className="ml-6 flex shrink-0 items-center gap-2 text-[var(--on-surface-variant)]">
        <TransitionLink
          href="/modules"
          aria-label="Jelajahi modul"
          className="group hidden h-10 items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 text-sm transition-colors hover:border-[var(--primary-container)] hover:bg-[var(--surface-container)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] sm:flex"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">search</span>
          <span>Jelajahi modul</span>
        </TransitionLink>

        <TransitionLink
          href="/referensi"
          aria-label="Buka referensi dan bantuan keselamatan"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-container-high)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          <span aria-hidden="true" className="material-symbols-outlined">help</span>
        </TransitionLink>
      </div>
    </header>
  );
}
