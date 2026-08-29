import { LabNotebook } from "@/components/shared/LabNotebook";

export default function NotebookPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold">Catatan Praktikum</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Notebook terstruktur per modul. Data tersimpan otomatis di browser (localStorage).
      </p>

      <div className="mt-6 space-y-4">
        <LabNotebook
          title="Catatan Umum Praktikum"
          headingLevel={2}
          storageKey="general-notebook"
          fields={[
            { id: "date", label: "Tanggal praktikum", type: "text", placeholder: "YYYY-MM-DD" },
            { id: "module", label: "Modul", type: "select", options: ["M1", "M2", "M3", "M4", "M5", "M6"] },
            { id: "sample_id", label: "ID Sampel", type: "text" },
            { id: "observations", label: "Observasi umum", type: "textarea" },
            { id: "raw_data", label: "Data mentah", type: "textarea" },
            { id: "deviations", label: "Deviasi dari prosedur", type: "textarea" },
            { id: "assistant_notes", label: "Catatan/koreksi asisten", type: "textarea" },
          ]}
        />
        <LabNotebook
          title="Flowchart & Persiapan"
          headingLevel={2}
          storageKey="flowchart-notebook"
          fields={[
            { id: "flowchart", label: "Deskripsi flowchart prosedur", type: "textarea", placeholder: "Langkah-langkah prosedur dalam urutan..." },
            { id: "expected_reactions", label: "Reaksi/data yang diharapkan", type: "textarea" },
            { id: "calc_formulas", label: "Rumus perhitungan yang akan digunakan", type: "textarea" },
            { id: "safety_check", label: "Pemeriksaan keselamatan", type: "textarea", placeholder: "APD, hazards, limbah..." },
          ]}
        />
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">
        Catatan tersimpan otomatis di browser ini. Untuk versi penyimpanan server (dengan autentikasi), diperlukan backend PostgreSQL.
      </p>
    </div>
  );
}
