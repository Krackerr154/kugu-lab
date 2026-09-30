import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { SafetyCallout } from "@/components/shared/SafetyCallout";
import type { ModuleMeta } from "@/lib/modules";

interface ModulePlaceholderProps {
  module: ModuleMeta;
}

export function ModulePlaceholder({ module }: ModulePlaceholderProps) {
  return (
    <ModuleLayout module={module}>
      <section
        aria-labelledby="module-placeholder-title"
        data-module-placeholder
        className="surface-panel border border-[var(--outline-variant)] p-5 sm:p-6 shadow-xs"
      >
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="material-symbols-outlined text-3xl text-[var(--secondary)]">
            construction
          </span>
          <div>
            <h2 id="module-placeholder-title" className="text-lg font-bold text-[var(--foreground)]">
              Konten modul sedang disiapkan
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Ini adalah placeholder kurikulum. Ruang modul sudah ditempatkan agar urutan pembelajaran tetap rapi,
              tetapi prosedur, kuantitas, interaktif, dan keputusan keselamatan belum boleh dianggap sebagai instruksi praktikum.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-panel p-5 shadow-xs">
        <h2 className="text-lg font-bold">Ruang lingkup yang direncanakan</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--text-secondary)]">
          {module.learningOutcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </section>

      <SafetyCallout variant="info" title="Batas placeholder">
        <p>
          Tunggu versi konten yang telah diverifikasi pengajar. Placeholder ini tidak memberi otorisasi bekerja di laboratorium,
          tidak menetapkan resep, dan tidak menggantikan SOP, SDS, atau arahan asisten.
        </p>
      </SafetyCallout>
    </ModuleLayout>
  );
}
