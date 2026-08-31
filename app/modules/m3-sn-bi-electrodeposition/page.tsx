import { ModuleLayout } from "@/components/layout/ModuleLayout";

import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { ProcedureStepper } from "@/components/shared/ProcedureStepper";
import { LabNotebook } from "@/components/shared/LabNotebook";
import { ReportChecklist } from "@/components/shared/ReportChecklist";
import { ElectrodepositionCalculator } from "@/components/interactives/ElectrodepositionCalculator";
import { getModule } from "@/lib/modules";

export default function M3Page() {
  const module = getModule("m3-sn-bi-electrodeposition")!;

  return (
      <ModuleLayout module={module}>
      <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Teori Singkat</h2>
        <div className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
          <p><strong>Kenapa Paduan Sn-Bi?</strong> Mencampur Timah (Sn) dan Bismut (Bi) menghasilkan logam paduan (<em>alloy</em>) yang punya titik leleh lebih rendah dan kuat, cocok banget sebagai alternatif solder ramah lingkungan tanpa timbal.</p>
          <p><strong>Cara Kerja Elektrodeposisi:</strong> Kita alirkan arus listrik searah (DC) ke dalam larutan elektrolit. Ion-ion Sn²⁺ dan Bi³⁺ yang melayang di larutan akan ditarik menuju katoda (kutub negatif), menangkap elektron, lalu menempel membentuk lapisan logam tipis yang berkilau.</p>
          <p><strong>Peran Agen Pengkompleks:</strong> Karena ion Sn dan Bi punya kecenderungan mengendap dengan kecepatan yang beda jauh (<em>potensial reduksinya berbeda</em>), kita tambahkan zat pengkompleks supaya kedua ion bisa mengendap barengan dengan komposisi yang seragam.</p>
          <p><strong>Hukum Faraday & Efisiensi:</strong> Banyaknya endapan paduan bisa kita hitung dari kuat arus listrik (I) dan waktu pelapisan (t). Rasio antara pertambahan massa asli di timbangan dengan hasil hitungan teoretis disebut <em>efisiensi arus</em>.</p>
        </div>

      </section>

      <div className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Interaktif Modul 3</h2>
        <ElectrodepositionCalculator />
      </div>

      <div className="mt-4">
        <ProcedureStepper title="Prosedur Ringkas" steps={[
          { id: 1, title: "Preparasi katoda", detail: "Polishing cermin katoda, ukur luas area, bersihkan (sonikasi/keringkan), timbang massa sebelum.", holdPoint: true, rationale: "Permukaan katoda mempengaruhi kualitas deposit." },
          { id: 2, title: "Preparasi anoda", detail: "Siapkan anoda sesuai prosedur (bisa logam Sn/Bi atau inert).", },
          { id: 3, title: "Preparasi elektrolit (Larutan A/B/C)", detail: "Siapkan komposisi elektrolit sesuai formula praktikum. Catat massa/volume aktual dan pH.", rationale: "Komposisi elektrolit menentukan kualitas deposit paduan." },
          { id: 4, title: "Perakitan sel", detail: "Pasang katoda, anoda, dan elektrolit. Hubungkan ke sumber DC. Verifikasi polaritas.", holdPoint: true, rationale: "Polaritas salah dapat merusak eksperimen." },
          { id: 5, title: "Elektrodeposisi", detail: "Set arus/rapat arus yang ditetapkan. Jalankan selama waktu yang ditentukan. Catat arus, voltase, pH, suhu.", estimatedTime: "Sesuai protokol" },
          { id: 6, title: "Pasca-deposisi", detail: "Keluarkan katoda, bilas, keringkan, timbang massa sesudah. Dokumentasikan permukaan (foto jika diizinkan).", holdPoint: true },
          { id: 7, title: "Hitung efisiensi arus", detail: "Gunakan kalkulator di atas. Catat asumsi valensi/stokiometri." },
          { id: 8, title: "XRD handoff", detail: "Karakterisasi struktur deposit dengan XRD (lihat Modul 5)." },
        ]} />
      </div>

      <div className="mt-4">
        <LabNotebook title="Log Elektrodeposisi M3" storageKey="m3-notebook" fields={[
          { id: "sample_id", label: "ID Sampel", type: "text" },
          { id: "cathode_material", label: "Material Katoda", type: "text" },
          { id: "cathode_area", label: "Luas Katoda (cm²)", type: "number", unit: "cm²" },
          { id: "mass_before", label: "Massa sebelum (g)", type: "number", unit: "g" },
          { id: "mass_after", label: "Massa sesudah (g)", type: "number", unit: "g" },
          { id: "electrolyte", label: "Komposisi elektrolit", type: "text", placeholder: "Larutan A/B/C..." },
          { id: "current", label: "Arus (A)", type: "number", unit: "A" },
          { id: "voltage", label: "Voltase (V)", type: "number", unit: "V" },
          { id: "duration", label: "Durasi (s)", type: "number", unit: "s" },
          { id: "ph", label: "pH elektrolit", type: "number" },
          { id: "obs", label: "Observasi permukaan", type: "textarea", placeholder: "Warna, kekasaran, adhesi..." },
        ]} />
      </div>

      <div className="mt-4">
        <SafetyCallout variant="warning" title="Perhatian: Grafit Elektroda">
          <p>Gunakan elektroda grafit standar laboratorium yang telah disetujui. Jangan membongkar sel baterai bekas secara mandiri tanpa protokol penanganan limbah B3 dan persetujuan instruktur.</p>
        </SafetyCallout>
      </div>

      <div className="mt-4">
        <ReportChecklist
          title="Kisi-Kisi Laporan M3"
          items={[
            { label: "Deskripsi proses elektrodeposisi" },
            { label: "Fungsi Larutan A, B, C" },
            { label: "Observasi katoda sebelum/sesudah" },
            { label: "Perhitungan efisiensi arus dengan asumsi" },
            { label: "Handoff XRD" },
          ]}
        />
      </div>
      </ModuleLayout>
  );
}
