// ModuleLayout — shared template for all module pages
import { TransitionLink } from "@/components/layout/TransitionLink";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { ChemText } from "@/components/shared/ChemText";
import { modules } from "@/lib/modules";
import type { ModuleMeta } from "@/lib/modules";

interface ModuleLayoutProps {
  module: ModuleMeta;
  children: React.ReactNode;
}

export function ModuleLayout({ module, children }: ModuleLayoutProps) {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 transition-all duration-300">
      {/* Breadcrumb Bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
          <TransitionLink href="/" direction="nav-back" className="hover:underline hover:text-[var(--primary-container)] transition-colors inline-flex min-h-[40px] items-center gap-1">
            <span aria-hidden="true" className="material-symbols-outlined text-base">home</span>
            <span>Beranda</span>
          </TransitionLink>
          <span className="text-[var(--outline-variant)]">/</span>
          <TransitionLink href="/modules" direction="nav-back" className="hover:underline hover:text-[var(--primary-container)] transition-colors inline-flex min-h-[40px] items-center">
            Modul
          </TransitionLink>
          <span className="text-[var(--outline-variant)]">/</span>
          <span aria-current="page" className="text-[var(--foreground)] font-semibold">M{module.number}</span>
        </nav>
      </div>

      {/* Main Grid: Workbench + Sticky Companion Rail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left / Main Column */}
        <div className="xl:col-span-8 2xl:col-span-9 min-w-0 space-y-6">
          {/* Header */}
          <header className="surface-panel p-5 sm:p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-3xl text-[var(--primary-container)] shadow-xs">
                <span aria-hidden="true" className="material-symbols-outlined">{module.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Modul {module.number}
                  </span>
                  <SourceBadge pages={module.manualPages} />
                </div>
                <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl"><ChemText>{module.title}</ChemText></h1>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  <span className="font-medium">Alur sampel:</span> <ChemText>{module.sampleLineage}</ChemText>
                </p>
              </div>
            </div>

            {/* Learning outcomes */}
            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <h2 className="text-sm font-bold text-[var(--foreground)]">Tujuan Pembelajaran</h2>
              <ul className="mt-2 space-y-1.5">
                {module.learningOutcomes.map((o, i) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-xs font-semibold text-[var(--primary-container)] bg-[var(--surface-muted)] px-1.5 py-0.5 rounded-md shrink-0 mt-0.5">{i + 1}</span>
                    <span className="flex-1"><ChemText>{o}</ChemText></span>
                  </li>
                ))}
              </ul>
            </div>
          </header>

          {/* Content sections */}
          <div className="space-y-6">
            {children}
          </div>

          {/* Navigation footer */}
          <nav aria-label="Navigasi antar-modul" className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-5 text-sm gap-2 flex-wrap">
            {module.number > 1 ? (
              <TransitionLink
                href={modules[module.number - 2].route}
                direction="nav-back"
                className="min-h-10 rounded-lg border border-[var(--outline)] px-4 py-2 hover:bg-[var(--surface-muted)] hover:border-[var(--primary-container)] active:scale-[0.98] transition-all flex items-center gap-1.5 font-medium"
              >
                <span>←</span>
                <span>M{module.number - 1}</span>
              </TransitionLink>
            ) : (
              <TransitionLink
                href="/modules"
                direction="nav-back"
                className="min-h-10 rounded-lg border border-[var(--outline)] px-4 py-2 hover:bg-[var(--surface-muted)] hover:border-[var(--primary-container)] active:scale-[0.98] transition-all flex items-center gap-1.5 font-medium"
              >
                <span>←</span>
                <span>Daftar Modul</span>
              </TransitionLink>
            )}

            <TransitionLink
              href="/"
              direction="nav-back"
              className="min-h-10 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-2 text-xs font-semibold text-[var(--primary-container)] hover:bg-[var(--surface-container-lowest)] hover:border-[var(--primary-container)] active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">home</span>
              <span>Beranda</span>
            </TransitionLink>

            {module.number < 6 ? (
              <TransitionLink
                href={modules[module.number].route}
                direction="nav-forward"
                className="min-h-10 rounded-lg bg-[var(--primary)] px-5 py-2 text-white hover:bg-[var(--primary-dark)] active:scale-[0.98] shadow-xs transition-all flex items-center gap-1.5 font-medium"
              >
                <span>M{module.number + 1}</span>
                <span>→</span>
              </TransitionLink>
            ) : (
              <TransitionLink
                href="/laporan"
                direction="nav-forward"
                className="min-h-10 rounded-lg bg-[var(--primary)] px-5 py-2 text-white hover:bg-[var(--primary-dark)] active:scale-[0.98] shadow-xs transition-all flex items-center gap-1.5 font-medium"
              >
                <span>Laporan</span>
                <span>→</span>
              </TransitionLink>
            )}
          </nav>
        </div>

        {/* Right Sticky Companion Sidebar */}
        <aside aria-label="Companion Panel Modul" className="hidden xl:block xl:col-span-4 2xl:col-span-3 sticky top-24 space-y-4">
          {/* Module Quick Card */}
          <div className="surface-panel p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-base text-[var(--primary-container)]">info</span>
              <span>Ringkasan Modul {module.number}</span>
            </h3>
            <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
              {module.theorySummary}
            </p>
            <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">{module.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Manual Hal:</span>
                <span className="font-semibold">{module.manualPages}</span>
              </div>
            </div>
          </div>

          {/* Quick Lab Actions */}
          <div className="surface-panel p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3 flex items-center gap-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-base text-[var(--primary-container)]">bolt</span>
              <span>Akses Cepat Lab</span>
            </h3>
            <div className="flex flex-col gap-2 text-xs font-medium">
              <TransitionLink
                href={`/prelab/${module.slug}`}
                className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:border-[var(--primary-container)] hover:bg-[var(--surface-container)] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-[var(--primary-container)]">assignment_turned_in</span>
                  <span>Pre-Lab Rehearsal</span>
                </div>
                <span className="text-[var(--muted)]">→</span>
              </TransitionLink>

              <TransitionLink
                href="/notebook"
                className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:border-[var(--primary-container)] hover:bg-[var(--surface-container)] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-[var(--primary-container)]">edit_note</span>
                  <span>Buku Catatan Observasi</span>
                </div>
                <span className="text-[var(--muted)]">→</span>
              </TransitionLink>

              <TransitionLink
                href="/analisis"
                className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:border-[var(--primary-container)] hover:bg-[var(--surface-container)] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-[var(--primary-container)]">query_stats</span>
                  <span>Workspace Analisis Data</span>
                </div>
                <span className="text-[var(--muted)]">→</span>
              </TransitionLink>

              <TransitionLink
                href="/referensi"
                className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:border-[var(--primary-container)] hover:bg-[var(--surface-container)] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-[var(--primary-container)]">menu_book</span>
                  <span>SDS & Referensi Keselamatan</span>
                </div>
                <span className="text-[var(--muted)]">→</span>
              </TransitionLink>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}