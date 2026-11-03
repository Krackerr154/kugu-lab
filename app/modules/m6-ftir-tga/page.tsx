import { ModuleLayout } from "@/components/layout/ModuleLayout";

import { Equation } from "@/components/shared/Equation";
import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { LabNotebook } from "@/components/shared/LabNotebook";
import { ReportChecklist } from "@/components/shared/ReportChecklist";
import { ClaimEvidenceReasoning } from "@/components/shared/ClaimEvidenceReasoning";
import { TGAWorkspace } from "@/components/interactives/TGAWorkspace";
import { FTIRWorkspace } from "@/components/interactives/FTIRWorkspace";
import {
  FTIRDipoleDemo,
  FTIRModeGallery,
  FTIRBandExplorer,
  FTIRMorphSpectrum,
} from "@/components/interactives/FTIRTheoryVisuals";
import { PURITY_ROWS } from "@/lib/m6-ftir-bands";
import { getModule } from "@/lib/modules";

export default function M6Page() {
  const module = getModule("m6-ftir-tga")!;

  return (
    <ModuleLayout module={module}>
      {/* ── FTIR: TEORI ──────────────────────────────────────────────────── */}
      <section
        id="m6-ftir-teori"
        aria-labelledby="m6-ftir-teori-heading"
        className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 sm:p-5"
      >
        <h2 id="m6-ftir-teori-heading" className="text-lg font-bold text-[var(--foreground)]">
          Teori Singkat FTIR
        </h2>

        <div className="mt-3">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            1. Kapan sebuah ikatan menyerap inframerah?
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            Hanya bila energinya cocok <em>dan</em> getarannya mengubah momen dipol. Karena itu
            pita yang muncul adalah bukti kuat, sedangkan pita yang hilang adalah bukti lemah.
          </p>
          <div className="mt-2">
            <FTIRDipoleDemo />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            2. Mengapa posisi pita menunjuk gugus fungsi?
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            Frekuensi naik bila ikatan lebih kaku dan turun bila atomnya lebih berat —{" "}
            <span className="whitespace-nowrap font-mono text-[13px] text-[var(--foreground)]">
              ν̃ ∝ √(k / μ)
            </span>
            . Itulah sebabnya C=O muncul di 1675, C–O di 1231, dan C–H di sekitar 2950 cm⁻¹.
          </p>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">3. Mode getaran</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            <em>Ulur</em> mengubah panjang ikatan, <em>tekuk</em> mengubah sudutnya. Tekuk selalu
            berada di bawah ulur gugus yang sama.
          </p>
          <div className="mt-2">
            <FTIRModeGallery />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            4. Daerah spektrum dan pita diagnostik
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            Di atas 1500 cm⁻¹ tiap pita dapat ditafsirkan sendiri; di bawahnya yang khas adalah pola
            keseluruhan molekul. Peta di bawah menempatkan setiap pita pada daerahnya — tinggi pita
            menunjukkan intensitas dan lebarnya menunjukkan bentuk — lalu tabel merinci gugus dan
            sampelnya.
          </p>
          <div className="mt-2">
            <FTIRBandExplorer />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            5. Dari asam fumarat ke Al-Fum
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            Setelah karboksilat terikat pada Al³⁺, C=O 1675 menghilang dan muncul pasangan COO⁻ di
            1610 dan 1430 cm⁻¹. Geser untuk melihat peralihannya.
          </p>
          <div className="mt-2">
            <FTIRMorphSpectrum />
          </div>
          <p className="mt-2 text-[12px] leading-snug text-[var(--text-secondary)]">
            Δν = 180 cm⁻¹ hanya bersifat indikatif: rentang mode koordinasi saling tumpang tindih,
            sehingga penetapannya memerlukan TGA dan XRD.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-control)] px-3 py-2">
          <p className="text-[12px] leading-snug text-[var(--text-secondary)]">
            <strong className="text-[var(--foreground)]">Cara membaca:</strong> singkirkan artefak
            (CO₂ 2350, uap air) → ambil pita terkuat → periksa gugus yang diharapkan → bandingkan
            dengan acuan.
          </p>
        </div>

        <p className="mt-2 text-[12px] leading-snug text-[var(--text-secondary)]">
          <strong className="text-[var(--foreground)]">Batasan untuk laporan:</strong> intensitas
          bergantung jumlah sampel dan tekanan pelet, sehingga tidak sebanding antarpelet. KBr
          higroskopis, jadi pita air bisa berasal dari pelet. Spektrum ATR mendistorsi intensitas di
          bilangan gelombang tinggi, dan pemilihan garis dasar dapat menggeser puncak beberapa cm⁻¹.
        </p>
      </section>

      <div className="mt-4">
        <FTIRWorkspace />
      </div>

      <div className="mt-4">
        <h2 className="mb-2 text-lg font-bold">Evaluasi Kemurnian Produk</h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">
              Perbandingan pita FTIR antara asam fumarat bebas dan Al-Fum murni
            </caption>
            <thead>
              <tr className="border-b border-[var(--outline-variant)]">
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Pita
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Asam fumarat bebas
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Al-Fum murni
                </th>
              </tr>
            </thead>
            <tbody>
              {PURITY_ROWS.map((row) => (
                <tr key={row.band} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-2 text-[var(--foreground)]">{row.band}</td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">{row.acid}</td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">{row.alfum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Bila pita C=O 1675 cm⁻¹ masih muncul pada sampel, reaksi belum sempurna dan asam fumarat
          bebas masih tertinggal.
        </p>
      </div>

      <div className="mt-4">
        <SafetyCallout variant="info" title="Dua hal yang sering menyesatkan saat membaca spektrum">
          <p>
            Bandingkan <strong>posisi pita</strong>, bukan tinggi pita — jumlah sampel tiap pelet
            berbeda, sehingga kedalaman serapan tidak sebanding antarsampel.
          </p>
          <p className="mt-2">
            Pita di sekitar <strong>2350 cm⁻¹</strong> berasal dari CO₂ di udara, dan pita kecil
            bergerigi berasal dari uap air. Keduanya artefak atmosfer, bukan gugus fungsi sampel.
          </p>
        </SafetyCallout>
      </div>

      {/* ── TGA ──────────────────────────────────────────────────────────── */}
      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Teori Singkat TGA</h2>
        <div className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
          <p>
            <strong>Bagaimana TGA Bekerja?</strong> Sampel diletakkan di atas timbangan mikro yang
            berada di dalam tungku pemanas (<em>furnace</em>). Suhu dinaikkan secara perlahan dan
            teratur sambil alat terus mencatat penurunan berat sampel saat ada komponen yang
            menguap atau terurai.
          </p>
          <p>
            <strong>Kurva TG vs DTG:</strong>
          </p>
          <ul className="list-disc space-y-1 pl-5 text-xs sm:text-sm">
            <li>
              <strong>Kurva TG (Massa vs Suhu):</strong> Menunjukkan sisa persen bobot sampel.
              Bentuk kurva yang menurun seperti tangga menandakan adanya pelepasan senyawa tertentu.
            </li>
            <li>
              <strong>Kurva DTG (Laju Pengurangan Massa):</strong> Turunan pertama dari kurva TG.
              Puncak kurva DTG menunjukkan pada suhu berapa reaksi penguraian berlangsung paling
              cepat.
            </li>
          </ul>
          <p>
            <strong>Tahapan Dekomposisi Sampel:</strong> Suhu &lt; 150°C biasanya pelepasan molekul
            air yang terperangkap (seperti pada rongga zeolit). Suhu lebih tinggi (&gt; 300°C)
            menandakan rusaknya ikatan kerangka utama atau terbakarnya residu organik.
          </p>
        </div>
      </section>

      <div className="mt-4">
        <Equation
          tex={"\\text{CaCO}_3(s) \\rightarrow \\text{CaO}(s) + \\text{CO}_2(g)"}
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
          <p>
            Operasi furnace 900°C, crucible panas, aliran N2 (risiko asfiksia), gas berbahaya yang
            terlepas, dan urutan shutdown memerlukan SOP instrumen yang disetujui.
          </p>
          <p className="mt-2 font-bold text-[var(--danger)]">
            <span aria-hidden="true" className="material-symbols-outlined align-middle text-base">
              report
            </span>{" "}
            Jalur &quot;Henti dan Panggil Asisten&quot;: untuk anomali gas/perubahan tak terduga,
            henti instrumen dan panggil asisten segera.
          </p>
        </SafetyCallout>
      </div>

      <div className="mt-4">
        <LabNotebook
          title="Catatan TGA M6"
          storageKey="m6-notebook"
          fields={[
            { id: "sample_id", label: "ID Sampel", type: "text" },
            { id: "initial_mass", label: "Massa awal (mg)", type: "number", unit: "mg" },
            { id: "temp_range", label: "Rentang suhu (°C)", type: "text", placeholder: "mis. 30-900°C" },
            { id: "heating_rate", label: "Laju pemanasan (°C/min)", type: "number", unit: "°C/min" },
            { id: "atmosphere", label: "Atmosfer", type: "text", placeholder: "mis. N2 inert" },
            { id: "regions", label: "Region kehilangan massa", type: "textarea", placeholder: "Suhu onset, infleksi, % kehilangan..." },
            { id: "total_loss", label: "Total kehilangan massa (%)", type: "number", unit: "%" },
            { id: "interpretation", label: "Interpretasi termogram", type: "textarea" },
          ]}
        />
      </div>

      <div className="mt-4">
        <ClaimEvidenceReasoning prompt="Berdasarkan spektrum FTIR dan termogram Anda, buat klaim tentang keberhasilan koordinasi fumarat pada Al³⁺ dan stabilitas termal produk, dukung dengan posisi pita dan region onset/infleksi, lalu berikan penalaran stoikiometri." />
      </div>

      <div className="mt-4">
        <ReportChecklist
          title="Kisi-Kisi Laporan M6"
          items={[
            { label: "Spektra FTIR sampel dan asam fumarat" },
            { label: "Identifikasi pita serapan dan gugus fungsi" },
            { label: "Perbandingan dengan data literatur" },
            { label: "Evaluasi kemurnian dari ada/tidaknya pita asam fumarat" },
            { label: "Presentasi termogram/DTG" },
            { label: "Kuantifikasi region kehilangan massa" },
            { label: "Stabilitas termal dan limitasi" },
          ]}
        />
      </div>
    </ModuleLayout>
  );
}