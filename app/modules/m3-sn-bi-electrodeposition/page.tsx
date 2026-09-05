import { ModuleLayout } from "@/components/layout/ModuleLayout";

import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { ProcedureStepper } from "@/components/shared/ProcedureStepper";
import { LabNotebook } from "@/components/shared/LabNotebook";
import { ReportChecklist } from "@/components/shared/ReportChecklist";
import { ChemText } from "@/components/shared/ChemText";
import { ElectrodepositionCalculator } from "@/components/interactives/ElectrodepositionCalculator";
import { ComplexingAgentExplorer } from "@/components/interactives/ComplexingAgentExplorer";
import { getModule } from "@/lib/modules";

export default function M3Page() {
  const module = getModule("m3-sn-bi-electrodeposition")!;

  return (
      <ModuleLayout module={module}>
      <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Teori Singkat</h2>

        {/* Why an alloy, and how electrodeposition builds it */}
        <div className="mt-3">
          <h3 className="font-bold text-md mb-2 text-[var(--primary-container)]">
            Dasar Paduan &amp; Elektrodeposisi
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border-2 border-sky-300 bg-gradient-to-br from-sky-100 to-sky-200 p-3 shadow-sm">
              <p className="mb-1 text-xs font-bold text-sky-900">🔗 Kenapa Paduan Sn-Bi?</p>
              <ul className="list-inside list-disc space-y-1 text-xs text-sky-800">
                <li>Paduan punya sifat mekanik dan ketahanan korosi lebih unggul dari logam murni.</li>
                <li>
                  Komposisi eutektik <ChemText>Sn-58Bi</ChemText> meleleh pada ~139 °C — jauh di bawah
                  solder konvensional.
                </li>
                <li>Solder bebas timbal (Pb-free), sesuai regulasi RoHS.</li>
                <li>Dipakai di elektronik, otomotif, kelistrikan, dan pelapisan pelindung.</li>
              </ul>
            </div>
            <div className="rounded-lg border-2 border-emerald-300 bg-gradient-to-br from-emerald-100 to-emerald-200 p-3 shadow-sm">
              <p className="mb-1 text-xs font-bold text-emerald-900">⚡ Cara Kerja Elektrodeposisi</p>
              <ul className="list-inside list-disc space-y-1 text-xs text-emerald-800">
                <li>
                  Arus DC mereduksi ion logam di katoda:{" "}
                  <ChemText>{"Sn^{2+}"}</ChemText> dan <ChemText>{"Bi^{3+}"}</ChemText> menangkap
                  elektron lalu menempel sebagai lapisan.
                </li>
                <li>Berjalan pada suhu rendah, bisa melapisi bentuk kompleks.</li>
                <li>Komposisi dan ketebalan lapisan dapat dikontrol.</li>
                <li>Parameter: rapat arus, tegangan, pH, suhu, konsentrasi ion.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* The central difficulty of this module */}
        <div className="mt-4">
          <h3 className="font-bold text-md mb-2 text-[var(--primary-container)]">
            Tantangan Utama: Beda Potensial Reduksi
          </h3>
          <div className="rounded-lg border-2 border-amber-300 bg-gradient-to-br from-amber-100 to-amber-200 p-3 shadow-sm">
            <p className="mb-2 text-xs text-amber-800">
              Bismut punya potensial reduksi lebih besar daripada timah, jadi{" "}
              <strong>Bi cenderung terdeposit lebih dahulu</strong>. Tanpa intervensi, yang terbentuk
              adalah lapisan kaya bismut — bukan paduan.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-md border border-amber-400/60 bg-amber-50 p-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Lebih mudah tereduksi
                </p>
                <p className="mt-0.5 font-mono text-xs font-bold text-amber-900">
                  <ChemText>{"Bi^{3+}/Bi"}</ChemText> = +0,31 V
                </p>
              </div>
              <div className="rounded-md border border-amber-400/60 bg-amber-50 p-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Lebih sukar tereduksi
                </p>
                <p className="mt-0.5 font-mono text-xs font-bold text-amber-900">
                  <ChemText>{"Sn^{2+}/Sn"}</ChemText> = −0,14 V
                </p>
              </div>
              <div className="rounded-md border-2 border-amber-500 bg-amber-300/60 p-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Selisih
                </p>
                <p className="mt-0.5 font-mono text-xs font-bold text-amber-900">≈ 0,45 V</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] italic text-amber-800">
              Nilai di atas adalah potensial <strong>standar</strong>. Kompleksasi dan konsentrasi
              menggeser potensial deposisi sebenarnya — pergeseran itulah mekanisme yang dipakai
              modul ini.
            </p>
          </div>
        </div>

        {/* How the recipe defeats that gap — interactive, one card per agent */}
        <div className="mt-4">
          <h3 className="font-bold text-md mb-2 text-[var(--primary-container)]">
            Peran Agen Pengompleks
          </h3>
          <ComplexingAgentExplorer />
        </div>

        {/* The quantitative conclusion of the module */}
        <div className="mt-4">
          <h3 className="font-bold text-md mb-2 text-[var(--primary-container)]">
            Hukum Faraday &amp; Efisiensi Arus
          </h3>
          <div className="rounded-lg border-2 border-indigo-300 bg-gradient-to-br from-indigo-100 to-indigo-200 p-3 shadow-sm">
            <p className="mb-2 text-xs text-indigo-800">
              Muatan yang mengalir menentukan <strong>batas atas</strong> massa yang dapat terdeposit.
              Membandingkan massa nyata di timbangan dengan batas itu memberi efisiensi arus.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-md border border-indigo-400/60 bg-indigo-50 p-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Massa teoretis
                </p>
                <p className="mt-0.5 font-mono text-xs font-bold text-indigo-900">
                  m = (I × t × M) / (n × F)
                </p>
              </div>
              <div className="rounded-md border border-indigo-400/60 bg-indigo-50 p-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Efisiensi arus
                </p>
                <p className="mt-0.5 font-mono text-xs font-bold text-indigo-900">
                  η = (Δm aktual / m teoretis) × 100%
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-indigo-800">
              <strong>Wajar di bawah 100%:</strong> sebagian muatan terpakai mereduksi{" "}
              <ChemText>{"H^{+}"}</ChemText> menjadi <ChemText>{"H_{2}"}</ChemText>, bukan logam.
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--danger)]">
              <span aria-hidden="true">⚠️</span> Di atas 100% berarti ada kesalahan: elektrolit belum
              terbilas, deposit belum kering, atau asumsi n dan M tidak sesuai paduan.
            </p>
          </div>
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
