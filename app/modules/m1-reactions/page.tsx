import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { ProcedureStepper } from "@/components/shared/ProcedureStepper";
import { LabNotebook } from "@/components/shared/LabNotebook";
import { ReportChecklist } from "@/components/shared/ReportChecklist";
import { ClaimEvidenceReasoning } from "@/components/shared/ClaimEvidenceReasoning";
import { ReactionExplorer } from "@/components/interactives/ReactionExplorer";
import { getModule } from "@/lib/modules";

export default function M1Page() {
  const module = getModule("m1-reactions")!;

  return (
      <ModuleLayout module={module}>
      {/* Learning Objectives */}
      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold mb-3" id="tujuan-pembelajaran">Tujuan Pembelajaran</h2>
        <ol className="space-y-2 text-sm text-[var(--foreground)] list-decimal list-inside ml-4">
          <li>Mengamati perubahan pada reaksi senyawa golongan utama: pembentukan endapan dan gas.</li>
          <li>Mengetahui senyawa golongan utama terpilih yang memiliki kelarutan rendah dalam air.</li>
          <li>Mengidentifikasi jenis kation/anion dalam cuplikan larutan.</li>
          <li>Menuliskan persamaan reaksi secara benar.</li>
        </ol>
        <div className="mt-3">
          <SourceBadge pages="9" />
        </div>
      </section>

      {/* Theory */}
      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold mb-3">Teori Singkat</h2>
        
        {/* Solubility Rules */}
        <div className="mb-4">
          <h3 className="font-bold text-md mb-2 text-[var(--primary-container)]">Aturan Kelarutan (Solubility Rules)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900 dark:to-sky-800 rounded-lg border-2 border-sky-300 dark:border-sky-700 shadow-sm">
              <p className="text-xs font-bold mb-1 text-sky-900 dark:text-sky-100">✅ Senyawa Larut:</p>
              <ul className="text-xs space-y-1 text-sky-800 dark:text-sky-200 list-disc list-inside">
                <li>Semua senyawa Golongan IA (Na⁺, K⁺, dll)</li>
                <li>Garam dengan NH₄⁺ dan NO₃⁻</li>
                <li>Halida (Cl⁻, Br⁻, I⁻), kecuali AgX, PbX₂, Hg₂X₂</li>
                <li>Sulfat (SO₄²⁻), kecuali PbSO₄, BaSO₄, CaSO₄</li>
              </ul>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-lg border-2 border-amber-300 dark:border-amber-700 shadow-sm">
              <p className="text-xs font-bold mb-1 text-amber-900 dark:text-amber-100">❌ Kelarutan Rendah:</p>
              <ul className="text-xs space-y-1 text-amber-800 dark:text-amber-200 list-disc list-inside">
                <li>Hidroksida (OH⁻), kecuali NaOH, KOH</li>
                <li>Karbonat (CO₃²⁻), fosfat (PO₄³⁻)</li>
                <li>Sulfida (S²⁻) dalam suasana asam</li>
                <li>Ca²⁺, Sr²⁺, Ba²⁺ dengan anion tertentu</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <p><strong>Reaksi Ionik & Endapan:</strong> Saat larutan garam dicampur, ion-ionnya saling bertemu. Kalau ada kombinasi kation dan anion yang sukar larut dalam air, keduanya langsung berikatan membentuk padatan (endapan).</p>
          <p><strong>Observasi vs Inferensi:</strong> Jangan tertukar antara apa yang mata kita lihat langsung (<em>observasi</em>, contoh: larutan jadi keruh dan muncul endapan putih) dengan kesimpulan kimianya (<em>inferensi</em>, contoh: terbentuk endapan BaSO₄).</p>
          <p><strong>Reaksi Pembentukan Gas:</strong> Reaksi asam-basa atau redoks tertentu bisa menghasilkan gas (seperti CO₂ atau H₂). Perhatikan letupan gelembung dan bau atau perubahan warna uapnya.</p>
          <p><strong>Persamaan Ion Netto:</strong> Kita hanya menuliskan spesi ion yang benar-benar bereaksi membentuk produk baru. Ion-ion penonton yang tidak berubah wujud dicoret agar reaksinya lebih simpel dan jelas.</p>
        </div>
        <div className="mt-3">
          <SourceBadge pages="9-12" />
        </div>
      </section>

      {/* Gas Formation Reactions */}
      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold mb-3">Pembentukan Gas (Gas Evolution Reactions)</h2>
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 shadow-sm">
            <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-100 mb-1">Gas Hidrogen (H₂)</h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-200 mb-1"><strong>Rumus:</strong> Logam aktif + Asam encer</p>
            <p className="text-xs text-emerald-900 dark:text-emerald-100 font-mono bg-emerald-50 dark:bg-emerald-950/50 p-1 rounded">M(s) + 2HCl(aq) → MCl₂(aq) + H₂(g)↑</p>
            <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-1"><strong>Uji:</strong> Kayu menyala → bunyi "pop"</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg border-2 border-blue-300 dark:border-blue-700 shadow-sm">
            <h3 className="font-bold text-sm text-blue-900 dark:text-blue-100 mb-1">Gas Karbon Dioksida (CO₂)</h3>
            <p className="text-xs text-blue-800 dark:text-blue-200 mb-1"><strong>Rumus:</strong> Karbonat + Asam</p>
            <p className="text-xs text-blue-900 dark:text-blue-100 font-mono bg-blue-50 dark:bg-blue-950/50 p-1 rounded">CO₃²⁻(aq) + 2H⁺(aq) → CO₂(g)↑ + H₂O(l)</p>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1"><strong>Uji:</strong> Air kapur (Ca(OH)₂) → keruh putih</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-lg border-2 border-amber-300 dark:border-amber-700 shadow-sm">
            <h3 className="font-bold text-sm text-amber-900 dark:text-amber-100 mb-1">Gas Amonia (NH₃)</h3>
            <p className="text-xs text-amber-800 dark:text-amber-200 mb-1"><strong>Rumus:</strong> Amonium + Basa kuat</p>
            <p className="text-xs text-amber-900 dark:text-amber-100 font-mono bg-amber-50 dark:bg-amber-950/50 p-1 rounded">NH₄⁺(aq) + OH⁻(aq) → NH₃(g)↑ + H₂O(l)</p>
            <p className="text-xs text-amber-800 dark:text-amber-200 mt-1"><strong>Uji:</strong> Bau tajam, lakmus biru makin biru</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg border-2 border-purple-300 dark:border-purple-700 shadow-sm">
            <h3 className="font-bold text-sm text-purple-900 dark:text-purple-100 mb-1">Gas Belerang Dioksida (SO₂)</h3>
            <p className="text-xs text-purple-800 dark:text-purple-200 mb-1"><strong>Rumus:</strong> Sulfit + Asam</p>
            <p className="text-xs text-purple-900 dark:text-purple-100 font-mono bg-purple-50 dark:bg-purple-950/50 p-1 rounded">SO₃²⁻(aq) + 2H⁺(aq) → SO₂(g)↑ + H₂O(l)</p>
            <p className="text-xs text-purple-800 dark:text-purple-200 mt-1"><strong>Uji:</strong> Bau menusuk, merubah KMnO₄ ungu menjadi tak berwarna</p>
          </div>
        </div>
        <div className="mt-3">
          <SourceBadge pages="138-143" />
        </div>
      </section>

      {/* Theory continued - same as before */}
      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Observasi vs Inferensi</h2>
        <div className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
          <p><strong>Observasi:</strong> Apa yang mata kita lihat langsung (contoh: larutan jadi keruh, endapan putih, gelembung gas).</p>
          <p><strong>Inferensi:</strong> Kesimpulan kimia dari observasi (contoh: terbentuk endapan AgCl, pelepasan gas H₂).</p>
          <p className="italic text-xs mt-2">⚠️ Penting: Bedakan antara "apa yang terlihat" dengan "apa yang terjadi secara kimia"!</p>
        </div>
      </section>

      {/* Interactive */}
      <div className="mt-6">
        <h2 className="mb-2 text-lg font-bold">Interaktif Modul 1</h2>
        <ReactionExplorer />
      </div>

      {/* Procedure */}
      <div className="mt-6">
        <ProcedureStepper title="Prosedur Ringkas (Verifikasi SOP)" steps={[
          { id: 1, title: "Siapkan larutan kation", detail: "Buat larutan kation yang ditugaskan sesuai konsentrasi yang disetujui.", rationale: "Konsentrasi mempengaruhi hasil pengendapan." },
          { id: 2, title: "Tambahkan pereaksi grup", detail: "Tambahkan HCl encer pertama, lalu reagen grup berikutnya sesuai alur analisis kualitatif.", holdPoint: true, rationale: "Urutan penambahan penting untuk identifikasi grup yang benar." },
          { id: 3, title: "Amati dan catat", detail: "Catat: ada/tidak endapan, warna, gas, perubahan warna larutan.", estimatedTime: "5-10 min per reaksi" },
          { id: 4, title: "Identifikasi ion tidak dikenal", detail: "Gunakan pohon keputusan dengan hanya pereaksi yang diizinkan.", holdPoint: true },
          { id: 5, title: "Tuliskan persamaan", detail: "Tulis persamaan molekuler dan ion netto untuk setiap reaksi yang positif." },
        ]} />
      </div>

      {/* Notebook */}
      <div className="mt-6">
        <LabNotebook title="Catatan Observasi M1" storageKey="m1-notebook" fields={[
          { id: "sample", label: "ID Sampel/Cuplikan", type: "text", placeholder: "mis. M1-A01" },
          { id: "ion", label: "Ion/Cuplikan diuji", type: "text", placeholder: "mis. Ag+ atau Cuplikan X" },
          { id: "reagent", label: "Pereaksi", type: "text", placeholder: "mis. HCl encer" },
          { id: "observation", label: "Observasi", type: "select", options: ["Tidak ada reaksi", "Endapan putih", "Endapan berwarna", "Gas", "Perubahan warna"] },
          { id: "desc", label: "Deskripsi detail", type: "textarea", placeholder: "Warna, jumlah, sifat endapan..." },
          { id: "equation", label: "Persamaan reaksi", type: "text", placeholder: "mis. Ag+ + Cl- → AgCl↓" },
          { id: "inference", label: "Inferensi", type: "textarea", placeholder: "Apa yang Anda simpulkan?" },
        ]} />
      </div>

      {/* CER */}
      <div className="mt-6">
        <ClaimEvidenceReasoning
          prompt="Berdasarkan hasil identifikasi ion tidak dikenal, buat klaim tentang identitas ion, dukung dengan bukti observasi, dan berikan penalaran kimia."
        />
      </div>

      {/* Report checklist */}
      <div className="mt-6">
        <ReportChecklist
          title="Kisi-Kisi Laporan M1"
          rubric={[
            { element: "Cover", points: 5 },
            { element: "Judul Modul", points: 5 },
            { element: "Tujuan", points: 10 },
            { element: "Data Observasi", points: 15 },
            { element: "Pengolahan Data", points: 15 },
            { element: "Pembahasan", points: 35 },
            { element: "Kesimpulan", points: 10 },
            { element: "Referensi", points: 5 },
          ]}
          items={[
            { label: "Tabel observasi reaksi (kation vs pereaksi)", points: 5 },
            { label: "Persamaan molekuler dan ion netto", points: 5 },
            { label: "Justifikasi identifikasi ion tidak dikenal", points: 5 },
            { label: "Sumber error dan ketidakpastian", points: 5 },
            { label: "Diagram alur identifikasi ion", points: 5 },
          ]}
        />
      </div>
      </ModuleLayout>
  );
}
