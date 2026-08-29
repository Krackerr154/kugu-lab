import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { SourceBadge } from "@/components/shared/SourceBadge";
import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { ProcedureStepper } from "@/components/shared/ProcedureStepper";
import { LabNotebook } from "@/components/shared/LabNotebook";
import { ReportChecklist } from "@/components/shared/ReportChecklist";
import { ZeoliteWorkspace } from "@/components/interactives/ZeoliteWorkspace";
import { ChemText } from "@/components/shared/ChemText";
import { getModule } from "@/lib/modules";

export default function M4Page() {
  const module = getModule("m4-zeolite-fau")!;

  return (
      <ModuleLayout module={module}>
      <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Teori Singkat</h2>
        <div className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
          <p><strong>Apa itu Zeolit?</strong> Zeolit adalah mineral aluminosilikat dengan kerangka berpori mirip "spons kristal" mikroskopis. Kerangkanya tersusun dari unit tetrahedral <ChemText>{"[SiO_{4}]^{4-}"}</ChemText> dan <ChemText>{"[AlO_{4}]^{5-}"}</ChemText> yang saling menyambung dan membentuk terowongan berukuran molekul.</p>
          <p><strong>Keunggulan Zeolit FAU (Faujasite):</strong> Tipe FAU punya rongga pintu masuk (<em>supercage</em>) yang cukup lebar, menjadikannya juara dalam menyerap gas, menukar ion mineral di air, hingga menjadi katalis utama perengkahan minyak bumi (<em>fluid catalytic cracking</em>).</p>
          <p><strong>Sintesis Hidrotermal ("Memasak Kristal"):</strong> Kita campurkan sumber silika dan alumina dalam suasana basa pekat, lalu dipanaskan pada wadah tertutup. Di kondisi ini, ion-ion berkumpul membentuk inti kristal (<em>nukleasi</em>) lalu tumbuh menjadi zeolit murni.</p>
          <p><strong>Zeolit X vs Zeolit Y:</strong> Dua saudara ini punya kerangka FAU yang sama, tapi rasio Si/Al-nya berbeda. Zeolit X punya kandungan Al lebih banyak (lebih cocok untuk penukar ion), sedangkan Zeolit Y lebih kaya Si (lebih tahan panas dan asam untuk katalis).</p>
        </div>
        <div className="mt-3"><SourceBadge pages="26-28" /></div>
      </section>

      <div className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Interaktif Modul 4</h2>
        <ZeoliteWorkspace />
      </div>

      <div className="mt-4">
        <SafetyCallout variant="danger" title="CR-05: Hidrotermal vs Botol PP">
          <p>Manual menyebut kondisi hidrotermal/tekanan tinggi tetapi prosedur menggunakan botol PP yang dipanaskan. Tim pengajar HARUS menentukan: rating wadah, tutup, fraksi pengisian, batas suhu, proses pendinginan/pembukaan, dan kontrol tekanan.</p>
        </SafetyCallout>
      </div>

      <div className="mt-4">
        <ProcedureStepper title="Prosedur Ringkas" steps={[
          { id: 1, title: "Preparasi prekursor", detail: "Siapkan NaOH, natrium aluminat, silika gel, dan air sesuai resep. Catat massa aktual.", rationale: "Rasio Si/Al menentukan tipe zeolit FAU." },
          { id: 2, title: "Pencampuran gel prekursor", detail: "Campur sambil diaduk hingga homogen. Catat urutan penambahan." },
          { id: 3, title: "Penuangan ke wadah", detail: "Tuang gel ke wadah yang disetujui (botol PP?). Isi sesuai fraksi yang ditentukan.", holdPoint: true, rationale: "Fraksi pengisian mempengaruhi tekanan internal." },
          { id: 4, title: "Inkubasi/kristalisasi", detail: "Simpan pada suhu dan waktu yang ditetapkan. Catat suhu aktual dan durasi.", estimatedTime: "6-72 jam", rationale: "Suhu dan waktu menentukan nukleasi dan pertumbuhan." },
          { id: 5, title: "Observasi Tyndall", detail: "Periksa efek Tyndall untuk indikasi pembentukan partikel/koloid." },
          { id: 6, title: "Isolasi produk", detail: "Filtrasi Büchner, cuci dengan air dan NaOH encer sesuai protokol.", holdPoint: true },
          { id: 7, title: "Pengeringan", detail: "Keringkan pada ~110-125°C selama 4-5 jam. Timbang produk." },
          { id: 8, title: "Handoff karakterisasi", detail: "Buat ID sampel unik. Siapkan untuk XRD (M5) dan TGA (M6)." },
        ]} />
      </div>

      <div className="mt-4">
        <LabNotebook title="Log Sintesis M4" storageKey="m4-notebook" fields={[
          { id: "sample_id", label: "ID Sampel", type: "text" },
          { id: "precursors", label: "Massa/volume prekursor aktual", type: "textarea", placeholder: "NaOH, NaAlO2, SiO2, H2O..." },
          { id: "si_al", label: "Rasio Si/Al", type: "number" },
          { id: "cryst_temp", label: "Suhu kristalisasi (°C)", type: "number", unit: "°C" },
          { id: "cryst_time", label: "Waktu kristalisasi (jam)", type: "number", unit: "jam" },
          { id: "tyndall", label: "Observasi Tyndall", type: "select", options: ["Positif", "Negatif", "Tidak diuji"] },
          { id: "appearance", label: "Penampakan produk", type: "text", placeholder: "Warna, tekstur..." },
          { id: "dry_mass", label: "Massa setelah kering (g)", type: "number", unit: "g" },
          { id: "notes", label: "Catatan/deviasi", type: "textarea" },
        ]} />
      </div>

      <div className="mt-4">
        <ReportChecklist
          title="Kisi-Kisi Laporan M4"
          items={[
            { label: "Prinsip sintesis hidrotermal" },
            { label: "Manfaat metode hidrotermal" },
            { label: "Penalaran prekursor ke produk" },
            { label: "Bukti kristalisasi (observasi + XRD)" },
            { label: "Rencana hasil XRD/TGA" },
          ]}
        />
      </div>
      </ModuleLayout>
  );
}
