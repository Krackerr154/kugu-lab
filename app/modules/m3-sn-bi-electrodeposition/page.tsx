import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { type JourneyStage } from "@/components/shared/ModuleJourney";
import { StudentIdentityProvider } from "@/components/shared/StudentIdentityProvider";
import { StudentIdentityGate } from "@/components/shared/StudentIdentityGate";
import { M3PresentationProvider } from "@/components/shared/M3PresentationProvider";
import { M3Journey, M3FollowControls } from "@/components/shared/M3GuidedJourney";
import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { BenchChecklist } from "@/components/shared/BenchChecklist";
import { LabNotebook } from "@/components/shared/LabNotebook";
import { ReadinessSummary } from "@/components/shared/ReadinessSummary";
import { ChemText } from "@/components/shared/ChemText";
import { ClaimEvidenceReasoning } from "@/components/shared/ClaimEvidenceReasoning";
import { ElectrodepositionCalculator } from "@/components/interactives/ElectrodepositionCalculator";
import { ElectrochemicalCellExplorer } from "@/components/interactives/ElectrochemicalCellExplorer";
import { ComplexingAgentExplorer } from "@/components/interactives/ComplexingAgentExplorer";
import { getModule } from "@/lib/modules";
import { M3_PROCEDURE } from "@/lib/m3-procedure";

export default function M3Page() {
  const module = getModule("m3-sn-bi-electrodeposition")!;

  const stages: JourneyStage[] = [
    // ── BRIEF ────────────────────────────────────────────────────────────
    {
      id: "brief",
      label: "Tinjauan",
      icon: "flag",
      question: "Apa yang akan saya lakukan, dan mengapa?",
      content: (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="min-w-0 flex-1"><StudentIdentityGate /></div>
            <div className="min-w-0 flex-1"><M3FollowControls /></div>
          </div>
          <div className="surface-panel p-4 sm:p-5 shadow-xs">
            <p className="max-w-[72ch] text-base leading-7 text-[var(--text-secondary)]">
              Anda membuat <strong className="text-[var(--foreground)]">paduan logam Sn-Bi</strong> dengan
              melapiskannya pada plat tembaga melalui <strong className="text-[var(--foreground)]">elektrodeposisi</strong>:
              arus DC mereduksi ion <ChemText>{"Sn^{2+}"}</ChemText> dan <ChemText>{"Bi^{3+}"}</ChemText> dari
              larutan elektrolit agar mengendap bersamaan (kodeposisi) di katoda. Modul berjalan
              lintas sesi karena resin katoda perlu mengeras 2 × 24 jam.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Tindakan fisik
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                  Menyolder & mengecor katoda, menyiapkan anoda grafit, meracik 100 mL elektrolit,
                  merangkai sel DC, menjalankan deposisi, menimbang, menghitung efisiensi arus.
                </p>
              </div>
              <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Keluaran / bukti
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                  Katoda berlapis Sn-Bi, massa sebelum/sesudah, efisiensi arus, foto permukaan, dan
                  sampel untuk XRD (Modul 5).
                </p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--border)] pt-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Penuntun</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">Halaman {module.manualPages}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Tahap</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">M3a → M3b</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Durasi</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">Lintas sesi (resin 2×24 jam)</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Alur sampel</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[var(--foreground)]"><ChemText>{module.sampleLineage}</ChemText></dd>
              </div>
            </dl>
          </div>

          <SafetyCallout variant="danger" title="Batas Keselamatan Modul 3">
            <p>
              Modul ini melibatkan HCl pekat, NH<sub>3</sub> pekat, garam logam Sn dan Bi, aseton,
              etanol, resin/hardener, solder panas, sumber listrik DC, dan grafit dari baterai bekas.
              Pembongkaran baterai bekas (CR-06) memerlukan penetapan jenis baterai, metode isolasi,
              penanganan limbah B3, dan pengawasan asisten terlebih dahulu — jangan membongkar
              baterai secara mandiri. Instruksi penanganan rinci mengikuti SOP/SDS laboratorium yang
              berlaku dan arahan asisten, bukan halaman ini.
            </p>
          </SafetyCallout>
        </>
      ),
    },

    // ── UNDERSTAND ───────────────────────────────────────────────────────
    {
      id: "understand",
      label: "Pahami",
      icon: "neurology",
      question: "Teori apa yang menjelaskannya?",
      content: (
        <>
          {/* Concept 1: why an alloy, how deposition builds it */}
          <div className="surface-panel p-4 sm:p-5 shadow-xs">
            <h3 className="max-w-[50ch] text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Mengapa paduan Sn-Bi, dan bagaimana elektrodeposisi membangunnya
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Kenapa paduan
                </p>
                <ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-6 text-[var(--text-secondary)]">
                  <li>Sifat mekanik & ketahanan korosi lebih unggul daripada logam murni.</li>
                  <li>Eutektik <ChemText>Sn-58Bi</ChemText> meleleh ~139 °C — jauh di bawah solder konvensional.</li>
                  <li>Solder bebas timbal (Pb-free), sesuai regulasi RoHS.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Cara kerja elektrodeposisi
                </p>
                <ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-6 text-[var(--text-secondary)]">
                  <li>Arus DC mereduksi ion logam di katoda; ion menangkap elektron lalu menempel sebagai lapisan.</li>
                  <li>Berjalan pada suhu rendah, dapat melapisi bentuk kompleks.</li>
                  <li>Komposisi & ketebalan dikontrol lewat rapat arus, tegangan, pH, konsentrasi ion.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Concept 2: the interactive cell map + potential gap (the core difficulty) */}
          <div className="surface-panel p-4 sm:p-5 shadow-xs">
            <h3 className="max-w-[50ch] text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Peta sel & tantangan beda potensial
            </h3>
            <p className="mt-2 max-w-[72ch] text-base leading-7 text-[var(--text-secondary)]">
              Bismut jauh lebih mudah tereduksi daripada timah (selisih ≈ 0,45 V), sehingga tanpa
              intervensi yang terbentuk adalah lapisan kaya bismut, bukan paduan. Pilih tiap komponen
              sel untuk melihat setengah-reaksi dan potensial reduksinya (tugas pendahuluan #2).
            </p>
            <div className="mt-4">
              <ElectrochemicalCellExplorer />
            </div>
          </div>

          {/* Concept 3: how the recipe defeats the gap — interactive agent cards */}
          <div className="surface-panel p-4 sm:p-5 shadow-xs">
            <h3 className="max-w-[50ch] text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Peran agen pengompleks
            </h3>
            <p className="mt-2 max-w-[72ch] text-base leading-7 text-[var(--text-secondary)]">
              EDTA dan asam sitrat mengikat ion logam sehingga potensial deposisi efektifnya bergeser
              dan mendekat; PEG400 bekerja pada morfologi permukaan. Buka tiap kartu untuk mekanismenya.
            </p>
            <div className="mt-4">
              <ComplexingAgentExplorer />
            </div>
          </div>
        </>
      ),
    },

    // ── REHEARSE ─────────────────────────────────────────────────────────
    {
      id: "rehearse",
      label: "Latih",
      icon: "checklist",
      question: "Bagaimana saya menjalankan prosedurnya dan mengambil keputusan?",
      content: (
        <>
          <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 text-sm text-[var(--text-secondary)]">
            Untuk latihan langkah-demi-langkah dengan cek pemahaman, gunakan{" "}
            <a
              href="/prelab/m3-sn-bi-electrodeposition"
              className="font-semibold text-[var(--primary-container)] underline-offset-2 hover:underline"
            >
              walkthrough pre-lab M3
            </a>
            . Ceklis di bawah adalah versi bench yang bisa Anda centang sambil bekerja — tersimpan di
            browser Anda.
          </div>

          <BenchChecklist
            title="Ceklis Bench M3a → M3b"
            storageKey="m3-bench-checklist"
            note="Rencanakan lebih awal: resin katoda mengeras 2 × 24 jam, jadi tahap M3a harus dimulai jauh sebelum sesi elektrodeposisi."
            phases={M3_PROCEDURE}
          />
        </>
      ),
    },

    // ── PROVE ────────────────────────────────────────────────────────────
    {
      id: "prove",
      label: "Buktikan",
      icon: "calculate",
      question: "Bisakah saya menghitung, memprediksi, dan menalar hasilnya?",
      content: (
        <>
          <div className="surface-panel p-4 sm:p-5 shadow-xs">
            <h3 className="max-w-[50ch] text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Efisiensi arus dari Hukum Faraday
            </h3>
            <p className="mt-2 max-w-[72ch] text-base leading-7 text-[var(--text-secondary)]">
              Muatan yang mengalir menentukan batas atas massa yang dapat terdeposit. Bandingkan massa
              nyata di timbangan dengan batas itu. Efisiensi di bawah 100% wajar (sebagian arus
              mereduksi <ChemText>{"H^{+}"}</ChemText> menjadi <ChemText>{"H_{2}"}</ChemText>); di atas
              100% menandakan kesalahan pengukuran atau asumsi.
            </p>
            <div className="mt-4">
              <ElectrodepositionCalculator />
            </div>
          </div>

          <ClaimEvidenceReasoning
            prompt="Setelah menghitung efisiensi arus, susun klaim-bukti-penalaran: apakah nilai Anda masuk akal untuk paduan Sn-Bi, dan apa asumsi valensi/komposisi yang Anda pakai?"
            claimPlaceholder="mis. Efisiensi arus percobaan kami sekitar ... %"
            evidencePlaceholder="Massa sebelum/sesudah, arus, waktu, luas katoda, dan asumsi n & M yang dipakai..."
            reasoningPlaceholder="Hubungkan bukti dengan Hukum Faraday, reaksi samping H2, dan mengapa komposisi Sn:Bi adalah asumsi yang harus dikonfirmasi..."
          />
        </>
      ),
    },

    // ── READY ────────────────────────────────────────────────────────────
    {
      id: "ready",
      label: "Siap",
      icon: "verified",
      question: "Apa yang sudah selesai, dan apa yang masih perlu konfirmasi instruktur?",
      content: (
        <>
          <ReadinessSummary
            prepared={[
              { text: "Teori paduan, elektrodeposisi, dan beda potensial reduksi dibaca.", href: "#understand", linkLabel: "Tinjau" },
              { text: "Peran EDTA, asam sitrat, dan PEG400 dipahami dari kartu interaktif." },
              { text: "Prosedur M3a→M3b dilatih pada walkthrough pre-lab.", href: "/prelab/m3-sn-bi-electrodeposition", linkLabel: "Buka walkthrough" },
              { text: "Ceklis bench ditinjau dan rumus efisiensi arus dicoba di kalkulator." },
              { text: "Log elektrodeposisi disiapkan untuk mencatat data di bench." },
            ]}
            instructorConfirmed={[
              { text: "Pembongkaran baterai bekas (CR-06): jenis baterai, isolasi, limbah B3, pengawasan." },
              { text: "Otorisasi sumber listrik DC dan verifikasi polaritas sebelum menyalakan arus." },
              { text: "Penanganan HCl/NH_{3} pekat, aseton, dan resin sesuai SOP/SDS yang berlaku." },
              { text: "Asumsi komposisi Sn:Bi untuk perhitungan efisiensi (penuntun tidak menetapkannya)." },
            ]}
            boundary={
              <p>
                Menyelesaikan tahap-tahap di atas berarti Anda telah melakukan{" "}
                <strong className="text-[var(--foreground)]">persiapan digital</strong> — bukan bahwa
                Anda berwenang bekerja mandiri di laboratorium. KUGU tidak menggantikan SOP, SDS,
                putusan asisten, atau kerja praktikum fisik.
              </p>
            }
          />

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
        </>
      ),
    },
  ];

  return (
    <StudentIdentityProvider>
      <M3PresentationProvider>
        <ModuleLayout module={module} compactHeader>
          <M3Journey stages={stages} />
        </ModuleLayout>
      </M3PresentationProvider>
    </StudentIdentityProvider>
  );
}
