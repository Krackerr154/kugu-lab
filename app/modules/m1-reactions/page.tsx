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
      {/* Theory */}
      <section className="mt-4 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-bold">Teori</h2>
        <p className="mt-1 text-sm text-slate-600">
          Reaksi ionik dalam larutan akuatik mencakup pengendapan, kelarutan, observasi vs inferensi,
          reaksi asam-basa dan redoks yang menghasilkan gas, serta persamaan ion netto.
        </p>
        <div className="mt-2">
          <SourceBadge pages="9-12" />
        </div>
      </section>

      {/* Interactive */}
      <div className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Interaktif Modul 1</h2>
        <ReactionExplorer />
      </div>

      {/* Procedure */}
      <div className="mt-4">
        <ProcedureStepper title="Prosedur Ringkas (Verifikasi SOP)" steps={[
          { id: 1, title: "Siapkan larutan kation", detail: "Buat larutan kation yang ditugaskan sesuai konsentrasi yang disetujui.", rationale: "Konsentrasi mempengaruhi hasil pengendapan." },
          { id: 2, title: "Tambahkan pereaksi grup", detail: "Tambahkan HCl encer pertama, lalu reagen grup berikutnya sesuai alur analisis kualitatif.", holdPoint: true, rationale: "Urutan penambahan penting untuk identifikasi grup yang benar." },
          { id: 3, title: "Amati dan catat", detail: "Catat: ada/tidak endapan, warna, gas, perubahan warna larutan.", estimatedTime: "5-10 min per reaksi" },
          { id: 4, title: "Identifikasi ion tidak dikenal", detail: "Gunakan pohon keputusan dengan hanya pereaksi yang diizinkan.", holdPoint: true },
          { id: 5, title: "Tuliskan persamaan", detail: "Tulis persamaan molekuler dan ion netto untuk setiap reaksi yang positif." },
        ]} />
      </div>

      {/* Notebook */}
      <div className="mt-4">
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
      <div className="mt-4">
        <ClaimEvidenceReasoning
          prompt="Berdasarkan hasil identifikasi ion tidak dikenal, buat klaim tentang identitas ion, dukung dengan bukti observasi, dan berikan penalaran kimia."
        />
      </div>

      {/* Report checklist */}
      <div className="mt-4">
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
