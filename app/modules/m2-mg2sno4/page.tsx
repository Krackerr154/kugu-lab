import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { Equation } from "@/components/shared/Equation";
import { ProcedureStepper } from "@/components/shared/ProcedureStepper";
import { LabNotebook } from "@/components/shared/LabNotebook";
import { ReportChecklist } from "@/components/shared/ReportChecklist";
import { PhotocatalysisWorkspace } from "@/components/interactives/PhotocatalysisWorkspace";
import { getModule } from "@/lib/modules";

export default function M2Page() {
  const module = getModule("m2-mg2sno4")!;

  return (
    <ModuleLayout module={module}>
      {/* Theory */}
      <section className="mt-4 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-bold">Teori</h2>
        <div className="mt-2 space-y-2 text-sm text-slate-600">
          <p><strong>Fotokatalisis:</strong> absorpsi cahaya oleh semikonduktor menghasilkan pasangan elektron-hole (e⁻/h⁺) yang memicu reaksi redoks.</p>
          <p><strong>Band gap:</strong> rentang energi yang menentukan panjang gelombang cahaya yang dapat diserap. TiO2 (~3.2 eV, aktif UV) digunakan sebagai pembanding.</p>
          <p><strong>Sonokimia:</strong> kavitasi akibat gelombang ultrasonik menciptakan kondisi lokal ekstrem yang memfasilitasi pembentukan jaringan logam-oksigen nanoskala.</p>
          <p><strong>Reactive oxygen species:</strong> superoksida, radikal hidroksil, dan hidrogen peroksida berperan dalam degradasi polutan organik.</p>
        </div>
        <div className="mt-2"><SourceBadge pages="13-19" /></div>
      </section>

      {/* Interactive */}
      <div className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Interaktif Modul 2</h2>
        <PhotocatalysisWorkspace />
      </div>

      {/* Yield calculator inline */}
      <div className="mt-4">
        <Equation
          tex="\\text{Yield} = \\frac{m_{\\text{aktual}}}{m_{\\text{teoretis}}} \\times 100\\%"
          label="Kalkulator Hasil (Yield)"
          description="m_aktual = massa produk yang diperoleh, m_teoretis = massa berdasarkan stoikiometri reaksi."
        />
      </div>

      {/* Procedure */}
      <div className="mt-4">
        <ProcedureStepper title="Prosedur Ringkas" steps={[
          { id: 1, title: "Preparasi larutan reagen", detail: "Timbang MgCl2/SnCl4 dan NaOH sesuai resep manual. Catat massa aktual.", rationale: "Stoikiometri menentukan fasa produk." },
          { id: 2, title: "Atur pH ke target (10-13)", detail: "Tambahkan NaOH bertahap sambil memantau pH. Catat setiap titik pH.", holdPoint: true, estimatedTime: "15-30 min" },
          { id: 3, title: "Sonication", detail: "Lakukan sonikasi selama durasi yang ditentukan (1-2 jam) dengan istirahat antar siklus.", estimatedTime: "1-2 jam", rationale: "Kavitasi ultrasonik mendorong pembentukan material nanoskala." },
          { id: 4, title: "Filtrasi dan pencucian", detail: "Saring produk, cuci dengan air/etanol untuk menghapus pengotor ionik." },
          { id: 5, title: "Pengeringan dan kalsinasi", detail: "Keringkan pada suhu yang disetujui, lalu kalsinasi pada suhu tinggi (≤900°C).", holdPoint: true, rationale: "Kalsinasi mengubah fasa amorf ke kristalin." },
          { id: 6, title: "Pembuatan pelet dan pengukuran", detail: "Buat pelet, ukur resistansi pada berbagai suhu untuk konduktivitas/band gap." },
          { id: 7, title: "Uji fotokatalisis", detail: "Irradiasi larutan metilen biru dengan fotokatalis di bawah UV. Ukur absorbansi vs waktu.", estimatedTime: "2+ jam" },
          { id: 8, title: "XRD handoff", detail: "Karakterisasi struktur produk dengan XRD (lihat Modul 5)." },
        ]} />
      </div>

      {/* Notebook */}
      <div className="mt-4">
        <LabNotebook title="Log Sintesis M2" storageKey="m2-notebook" fields={[
          { id: "sample_id", label: "ID Sampel", type: "text" },
          { id: "reagent_mass", label: "Massa reagen aktual", type: "text", placeholder: "mis. MgCl2: 2.45g, SnCl4: 5.30g" },
          { id: "ph_records", label: "Catatan pH", type: "textarea", placeholder: "Target vs aktual pH per penambahan..." },
          { id: "sonication", label: "Siklus sonikasi", type: "text", placeholder: "mis. 3x20min, istirahat 5min" },
          { id: "calcination", label: "Suhu kalsinasi (°C)", type: "number", unit: "°C" },
          { id: "mass_product", label: "Massa produk (g)", type: "number", unit: "g" },
          { id: "pellet", label: "Dimensi pelet", type: "text", placeholder: "diameter, tebal" },
          { id: "resistance", label: "Resistansi (Ω)", type: "number", unit: "Ω" },
          { id: "notes", label: "Catatan/deviasi", type: "textarea" },
        ]} />
      </div>

      {/* Report */}
      <div className="mt-4">
        <ReportChecklist
          title="Kisi-Kisi Laporan M2"
          items={[
            { label: "Diskusi hasil sintesis (yield)" },
            { label: "Peran masing-masing reagen" },
            { label: "Efek sonokimia pada material" },
            { label: "Data elektrik dan perhitungan band gap" },
            { label: "Data fotokatalisis (grafik absorbansi vs waktu)" },
            { label: "Sumber error dan keterbatasan" },
          ]}
        />
      </div>
    </ModuleLayout>
  );
}
