import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { type JourneyStage } from "@/components/shared/ModuleJourney";
import { StudentIdentityProvider } from "@/components/shared/StudentIdentityProvider";
import { StudentIdentityGate } from "@/components/shared/StudentIdentityGate";
import { M4GuidedAccessGate } from "@/components/shared/M4GuidedAccessGate";
import { M3PresentationProvider } from "@/components/shared/M3PresentationProvider";
import { M3Journey, M3FollowControls } from "@/components/shared/M3GuidedJourney";
import { PresenterReviewDock } from "@/components/shared/PresenterReviewDock";
import { ReviewSlideView } from "@/components/shared/ReviewSlideView";
import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { ChemText } from "@/components/shared/ChemText";
import { Equation } from "@/components/shared/Equation";
import { ElectrochemicalCellExplorer } from "@/components/interactives/ElectrochemicalCellExplorer";
import { SnBiPotentialGapDiagram } from "@/components/interactives/SnBiPotentialGapDiagram";
import { ReportFormatGuide } from "@/components/shared/ReportFormatGuide";
import { getModule } from "@/lib/modules";

const M4_STAGE_LABELS = {
  brief: "Tujuan Praktikum",
  understand: "Pembahasan",
  rehearse: "Pengolahan Data",
  prove: "Pengolahan Data",
  ready: "Format Laporan",
} as const;
const M4_VISIBLE_STAGE_IDS = ["brief", "understand", "prove", "ready"] as const;

export default function M3Page() {
  const module = getModule("m4-sn-bi-electrodeposition")!;

  const stages: JourneyStage[] = [
    // ── BRIEF ────────────────────────────────────────────────────────────
    {
      id: "brief",
      label: "Tujuan Praktikum",
      icon: "flag",
      question: "Apa tujuan praktikum ini, dan bukti apa yang perlu dihasilkan?",
      content: (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="min-w-0 flex-1"><StudentIdentityGate hidePrompt /></div>
            <div className="min-w-0 flex-1"><M3FollowControls stageLabels={M4_STAGE_LABELS} /></div>
          </div>
          <div className="surface-panel p-4 sm:p-5 shadow-xs" data-review-anchor="review-brief-intro">
            <p className="max-w-[72ch] text-base leading-7 text-[var(--text-secondary)]">
              Praktikum ini bertujuan mensintesis <strong className="text-[var(--foreground)]">paduan logam Sn–Bi</strong> pada
              substrat plat tembaga melalui metode <strong className="text-[var(--foreground)]">elektrodeposisi</strong>:
              arus searah (DC) mereduksi kation <ChemText>{"Sn^{2+}"}</ChemText> dan <ChemText>{"Bi^{3+}"}</ChemText> dari
              larutan elektrolit secara serentak (kodeposisi) di katoda.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2" data-review-anchor="review-brief-actions">
              <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Tindakan fisik
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                  Menyolder dan mengecor katoda tembaga, menyiapkan elektroda karbon dari laboratorium, meracik 100 mL larutan elektrolit (A + B + C),
                  merangkai sel elektrokimia DC, menjalankan elektrodeposisi, menimbang massa deposit, serta menghitung efisiensi arus.
                </p>
              </div>
              <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Keluaran / bukti
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">
                  Katoda tembaga berlapis paduan Sn–Bi, data penimbangan massa sebelum dan sesudah deposisi, nilai efisiensi arus, dokumentasi visual permukaan, serta sampel paduan untuk karakterisasi XRD pada Modul 5.
                </p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[var(--border)] pt-4 sm:grid-cols-4" data-review-anchor="review-brief-meta">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Penuntun</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">Halaman {module.manualPages}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Tahap</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">M4a → M4b</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Alur sampel</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[var(--foreground)]"><ChemText>{module.sampleLineage}</ChemText></dd>
              </div>
            </dl>
          </div>

          <SafetyCallout variant="danger" title="Batas Keselamatan Modul 4">
            <p>
              Modul ini melibatkan HCl pekat, NH<sub>3</sub> pekat, garam logam Sn dan Bi, aseton,
              resin/hardener, solder panas, sumber listrik DC, dan elektroda karbon yang disediakan
              laboratorium. Verifikasi identitas, kondisi, dan polaritas elektroda bersama asisten.
              Instruksi penanganan rinci mengikuti SOP/SDS laboratorium yang berlaku dan arahan
              asisten, bukan halaman ini.
            </p>
          </SafetyCallout>
        </>
      ),
    },

    // ── UNDERSTAND ───────────────────────────────────────────────────────
    {
      id: "understand",
      label: "Pembahasan",
      icon: "neurology",
      question: "Teori apa yang menjelaskannya?",
      content: (
        <>
          {/* Concept 1: why an alloy, how deposition builds it */}
          <div className="surface-panel p-4 sm:p-5 shadow-xs" data-review-anchor="review-why-alloy">
            <h3 className="max-w-[50ch] text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Mengapa paduan Sn-Bi, dan bagaimana elektrodeposisi membangunnya
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Mengapa paduan Sn–Bi?
                </p>
                <ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-6 text-[var(--text-secondary)]">
                  <li>Sifat mekanik dan ketahanan korosi paduan lebih unggul dibandingkan logam murni penyusunnya.</li>
                  <li>Komposisi eutektik <ChemText>Sn-58Bi</ChemText> meleleh pada suhu ~139 °C, jauh di bawah titik leleh solder konvensional.</li>
                  <li>Merupakan alternatif solder ramah lingkungan bebas timbal (Pb-free) yang memenuhi regulasi RoHS.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Prinsip kerja elektrodeposisi
                </p>
                <ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-6 text-[var(--text-secondary)]">
                  <li>Arus listrik DC mereduksi kation logam di katoda: ion menerima elektron dan mengendap membentuk lapisan paduan padat.</li>
                  <li>Dapat berlangsung pada suhu ruang serta mampu melapisi substrat dengan geometri permukaan yang rumit.</li>
                  <li>Ketebalan dan komposisi deposit dapat dikendalikan melalui rapat arus, potensial, pH, dan konsentrasi elektrolit.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Concept 2: the interactive cell map + potential gap (the core difficulty) */}
          <div className="surface-panel p-4 sm:p-5 shadow-xs" data-review-anchor="review-potential-gap">
            <h3 className="max-w-[50ch] text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Tantangan Beda Potensial
            </h3>
            <div className="mt-4">
              <SnBiPotentialGapDiagram />
            </div>
            <div className="mt-4" data-review-anchor="review-cell">
              <ElectrochemicalCellExplorer />
            </div>
          </div>

        </>
      ),
    },

    // ── DATA PROCESSING ──────────────────────────────────────────────────
    {
      id: "prove",
      label: "Pengolahan Data",
      icon: "calculate",
      question: "Bagaimana data praktikum diolah, diperiksa, dan ditafsirkan?",
      content: (
        <>
          <section
            aria-labelledby="m4-data-formulas-title"
            data-m4-data-formulas
            data-review-anchor="review-formulas"
            className="surface-panel p-4 sm:p-5 shadow-xs"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Alur pengolahan data</p>
            <h3 id="m4-data-formulas-title" className="mt-1 text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Rumus yang digunakan dan alasannya
            </h3>
            <p className="mt-2 max-w-[76ch] text-sm leading-6 text-[var(--text-secondary)]">
              Gunakan data arus, waktu, dan massa untuk mengubah muatan listrik menjadi perkiraan massa logam yang dapat terdeposit. Urutan ini membuat hasil dapat diperiksa: hitung muatan, hitung massa teoritis, lalu bandingkan dengan massa aktual setelah katoda dibilas dan dikeringkan.
            </p>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <Equation
                tex={"Q = I \\times t"}
                label="1 · Muatan yang mengalir"
                description="Q = muatan (C), I = arus (A), t = waktu (s)."
                compact
              />
              <Equation
                tex={"m_{teoretis} = \\frac{Q \\times M}{n \\times F} = \\frac{I \\times t \\times M}{n \\times F}"}
                label="2 · Massa teoritis"
                description="M = massa molar, n = elektron per ion, F = 96485 C/mol."
                compact
              />
              <Equation
                tex={"\\eta = \\frac{m_{aktual}}{m_{teoretis}} \\times 100\\%"}
                label="3 · Efisiensi arus"
                description="m aktual = massa sesudah − massa sebelum (setelah bilas dan kering)."
                compact
              />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3" data-review-anchor="review-efficiency-notes">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">Mengapa perlu dibandingkan?</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  Tidak semua arus listrik terpakai untuk membentuk deposit: ion <ChemText>{"H^{+}"}</ChemText> dalam larutan asam dapat mengalami reduksi samping menjadi gas <ChemText>{"H_{2}"}</ChemText> (reaksi evolusi hidrogen). Oleh karena itu, efisiensi arus di bawah 100% merupakan hal yang wajar. Sebaliknya, efisiensi di atas 100% mengindikasikan adanya galat, seperti pencucian atau pengeringan katoda yang kurang sempurna, kesalahan penimbangan, atau ketidaktepatan asumsi stoikiometri.
                </p>
              </div>
              <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3" data-review-anchor="review-assumptions">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">Batas asumsi Sn–Bi</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  Deposit yang terbentuk merupakan paduan biner Sn–Bi, sedangkan penuntun praktikum tidak menetapkan rasio stoikiometri keduanya secara pasti. Perhitungan contoh di bawah menggunakan pendekatan Sn²⁺ sebagai ilustrasi; untuk laporan resmi, gunakan asumsi komposisi atau valensi yang telah dikonfirmasi oleh asisten pembimbing.
                </p>
              </div>
            </div>

            <div data-m4-calculation-example className="mt-4 rounded-lg border border-[var(--primary-container)]/30 bg-[var(--surface-container-low)] p-3 sm:p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">Contoh perhitungan dengan titik kerja protokol</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-[var(--text-secondary)]">
                <li><strong className="text-[var(--foreground)]">Q</strong> = 0,058 A × 900 s = 52,20 C.</li>
                <li><strong className="text-[var(--foreground)]">Mol elektron</strong> = 52,20 / 96485 = 5,4102 × 10⁻⁴ mol.</li>
                <li>Dengan asumsi sementara Sn²⁺, <strong className="text-[var(--foreground)]">m teoritis</strong> = (5,4102 × 10⁻⁴ / 2) × 118,71 = 0,032112 g.</li>
                <li>Jika massa aktual = 0,0280 g, maka efisiensi dihitung sebagai berikut:</li>
              </ol>
              <div className="mt-3">
                <Equation
                  tex={"\\eta = \\frac{0{,}0280}{0{,}032112} \\times 100\\% \\approx 87{,}19\\%"}
                  label="Hasil contoh"
                  compact
                />
              </div>
              <p className="mt-2 text-xs italic leading-5 text-[var(--text-secondary)]">
                Catatan: Nilai ini merupakan contoh ilustratif dengan asumsi reduksi Sn²⁺ (n = 2). Pada laporan praktikum, gunakan data massa aktual hasil penimbangan Anda serta asumsi yang disepakati bersama asisten.
              </p>
            </div>
          </section>
        </>
      ),
    },

    // ── REPORT FORMAT ────────────────────────────────────────────────────
    {
      id: "ready",
      label: "Format Laporan",
      icon: "verified",
      question: "Bagaimana hasil praktikum akan disusun dalam laporan?",
      content: <ReportFormatGuide />,
    },
  ];

  return (
    <StudentIdentityProvider>
      <M3PresentationProvider>
        <M4GuidedAccessGate>
          <ModuleLayout module={module} compactHeader>
            <M3Journey stages={stages} legacyStageMap={{ rehearse: "prove" }} />
          </ModuleLayout>
          <PresenterReviewDock />
          <ReviewSlideView />
        </M4GuidedAccessGate>
      </M3PresentationProvider>
    </StudentIdentityProvider>
  );
}
