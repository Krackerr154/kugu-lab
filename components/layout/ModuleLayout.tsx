// ModuleLayout — shared template for all module pages
import Link from "next/link";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { ChemText } from "@/components/shared/ChemText";
import { modules } from "@/lib/modules";
import type { ModuleMeta } from "@/lib/modules";

interface ModuleLayoutProps {
  module: ModuleMeta;
  children: React.ReactNode;
}

export function ModuleLayout({ module, children }: ModuleLayoutProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[var(--muted)]">
        <Link href="/modules" className="hover:underline">Modul</Link>
        <span className="mx-1">/</span>
        <span aria-current="page" className="text-[var(--foreground)]">M{module.number}</span>
      </nav>

      {/* Header */}
      <header className="rounded-xl bg-white border border-[var(--border)] p-5 mb-4">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl"
            style={{ backgroundColor: `${module.color}15` }}
          >
            <span aria-hidden="true">{module.icon}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold sm:text-2xl"><ChemText>{module.title}</ChemText></h1>
            <div className="mt-2">
              <SourceBadge pages={module.manualPages} />
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              <span className="font-medium">Alur sampel:</span> <ChemText>{module.sampleLineage}</ChemText>
            </p>
          </div>
        </div>

        {/* Learning outcomes */}
        <div className="mt-4">
          <h2 className="text-sm font-bold">Tujuan Pembelajaran</h2>
          <ul className="mt-1 space-y-0.5">
            {module.learningOutcomes.map((o, i) => (
              <li key={i} className="text-sm text-slate-600">
                {i + 1}. <ChemText>{o}</ChemText>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Safety gate */}
      <div className="mb-4">
        <SafetyCallout
          variant="danger"
          title="Gerbang Keselamatan — Baca Sebelum Melanjutkan"
        >
          <p>Konten keselamatan menunggu SOP/SDS yang disetujui. Modul ini melengkapi — bukan menggantikan — persetujuan asisten secara langsung.</p>
          {module.safetyBlockers.length > 0 && (
            <ul className="mt-2 list-disc pl-4 text-xs">
              {module.safetyBlockers.map((s, i) => (
                <li key={i}><ChemText>{s}</ChemText></li>
              ))}
            </ul>
          )}
        </SafetyCallout>
      </div>

      {/* Content sections */}
      {children}

      {/* Navigation footer */}
      <nav aria-label="Navigasi antar-modul" className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm">
        {module.number > 1 ? (
          <Link
            href={modules[module.number - 2].route}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 hover:bg-slate-50"
          >
            ← M{module.number - 1}
          </Link>
        ) : (
          <Link href="/modules" className="rounded-md border border-[var(--border)] px-3 py-1.5 hover:bg-slate-50">
            ← Daftar Modul
          </Link>
        )}
        {module.number < 6 ? (
          <Link
            href={modules[module.number].route}
            className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-white hover:bg-[var(--primary-dark)]"
          >
            M{module.number + 1} →
          </Link>
        ) : (
          <Link href="/laporan" className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-white hover:bg-[var(--primary-dark)]">
            Laporan →
          </Link>
        )}
      </nav>
    </div>
  );
}
