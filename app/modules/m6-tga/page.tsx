import { ModuleLayout } from "@/components/layout/ModuleLayout";

import { Equation } from "@/components/shared/Equation";
import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { LabNotebook } from "@/components/shared/LabNotebook";
import { ReportChecklist } from "@/components/shared/ReportChecklist";
import { ClaimEvidenceReasoning } from "@/components/shared/ClaimEvidenceReasoning";
import { TGAWorkspace } from "@/components/interactives/TGAWorkspace";
import { getModule } from "@/lib/modules";

export default function M6Page() {
  const module = getModule("m6-tga")!;

  return (
      <ModuleLayout module={module}>
      <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Teori Singkat</h2>
        <div className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
          <p><strong>Bagaimana TGA Bekerja?</strong> Sampel diletakkan di atas timbangan mikro yang berada di dalam tungku pemanas (<em>furnace</em>). Suhu dinaikkan secara perlahan dan teratur sambil alat terus mencatat penurunan berat sampel saat ada komponen yang menguap atau terurai.</p>
          <p><strong>Kurva TG vs DTG:</strong></p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li><strong>Kurva TG (Massa vs Suhu):</strong> Menunjukkan sisa persen bobot sampel. Bentuk kurva yang menurun seperti tangga menandakan adanya pelepasan senyawa tertentu.</li>
            <li><strong>Kurva DTG (Laju Pengurangan Massa):</strong> Turunan pertama dari kurva TG. Puncak kurva DTG menunjukkan pada suhu berapa reaksi penguraian berlangsung paling cepat.</li>
          </ul>
          <p><strong>Tahapan Dekomposisi Sampel:</strong> Suhu &lt; 150°C biasanya pelepasan molekul air yang terperangkap (seperti pada rongga zeolit). Suhu lebih tinggi (&gt; 300°C) menandakan rusaknya ikatan kerangka utama atau terbakarnya residu organik.</p>
        </div>

      </section>

      <div className="mt-4">
        <Equation
          tex="\\text{CaCO}_3(s) \\rightarrow \\text{CaO}(s) + \\text{CO}_2(g)"
          label="Contoh Dekomposisi Termal"
          description="Contoh pengajaran: teoretis 44% kehilangan massa berdasarkan rasio massa CO2 terhadap CaCO3. Jangan digeneralisasi ke semua sampel."
        />
      </div>

      <div className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Interaktif Modul 6</h2>
        <TGAWorkspace />
      </div>

      <div className="mt-4">
        <SafetyCallout variant="danger" title="Keselamatan TGA / Furnace">
          <p>Operasi furnace 900°C, crucible panas, aliran N2 (risiko asfiksia), gas berbahaya yang terlepas, dan urutan shutdown memerlukan SOP instrumen yang disetujui.</p>
          <p className="mt-2 font-bold text-[var(--danger)]"><span aria-hidden="true" className="material-symbols-outlined align-middle text-base">report</span> Jalur "Henti dan Panggil Asisten": untuk anomali gas/perubahan tak terduga, henti instrumen dan panggil asisten segera.</p>
        </SafetyCallout>
      </div>

      <div className="mt-4">
        <LabNotebook title="Catatan TGA M6" storageKey="m6-notebook" fields={[
          { id: "sample_id", label: "ID Sampel", type: "text" },
          { id: "initial_mass", label: "Massa awal (mg)", type: "number", unit: "mg" },
          { id: "temp_range", label: "Rentang suhu (°C)", type: "text", placeholder: "mis. 30-900°C" },
          { id: "heating_rate", label: "Laju pemanasan (°C/min)", type: "number", unit: "°C/min" },
          { id: "atmosphere", label: "Atmosfer", type: "text", placeholder: "mis. N2 inert" },
          { id: "regions", label: "Region kehilangan massa", type: "textarea", placeholder: "Suhu onset, infleksi, % kehilangan..." },
          { id: "total_loss", label: "Total kehilangan massa (%)", type: "number", unit: "%" },
          { id: "interpretation", label: "Interpretasi termogram", type: "textarea" },
        ]} />
      </div>

      <div className="mt-4">
        <ClaimEvidenceReasoning
          prompt="Berdasarkan data TGA/DTG Anda, buat klaim tentang stabilitas termal dan mekanisme dekomposisi sampel, dukung dengan region onset/infleksi, dan berikan penalaran stoikiometri."
        />
      </div>

      <div className="mt-4">
        <ReportChecklist
          title="Kisi-Kisi Laporan M6"
          items={[
            { label: "Presentasi termogram/DTG" },
            { label: "Kuantifikasi region kehilangan massa" },
            { label: "Interpretasi onset/infleksi" },
            { label: "Penetapan reaksi (assignment)" },
            { label: "Stabilitas termal" },
            { label: "Limitasi dan sumber error" },
          ]}
        />
      </div>
      </ModuleLayout>
  );
}
