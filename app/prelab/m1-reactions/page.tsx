import Link from "next/link";
import { M1LabRehearsal } from "@/components/interactives/M1LabRehearsal";
import { ProcedureWalkthrough, type WalkthroughStep, type WalkthroughCheck } from "@/components/shared/ProcedureWalkthrough";
import { getModule } from "@/lib/modules";

export default function M1PrelabPage() {
  const module = getModule("m1-reactions")!;

  const steps: WalkthroughStep[] = [
    {
      id: 1,
      title: "Baca Manual & Siapkan Jurnal",
      detail:
        "Baca halaman 9-12 manual praktikum. Siapkan jurnal pre-lab: tulis tujuan, dasar teori singkat (reaksi pengendapan, reaksi gas), dan alat/bahan yang akan digunakan.",
      rationale:
        "Pre-lab jurnal wajib dikumpulkan sebelum sesi dimulai. Tanpa jurnal, Anda tidak diperbolehkan masuk lab.",
      equipment: ["Manual praktikum KI3131", "Jurnal pre-lab", "Pulpen", "Kalkulator"],
      estimatedTime: "30-45 min",
    },
    {
      id: 2,
      title: "Kenali Pereaksi dan Kation Golongan Utama",
      detail:
        "Pelajari kation yang akan diuji: Ag^{+}, Pb^{2+}, Hg_{2}^{2+}, Cu^{2+}, Al^{3+}, Cr^{3+}, Fe^{3+}, Zn^{2+}. Pelajari pereaksi grup: HCl encer, H_{2}S dalam larutan asam, NaOH, NH_{3} berlebih. Pahami urutan analisis golongan kualitatif.",
      rationale:
        "Urutan penambahan pereaksi grup menentukan keberhasilan identifikasi. Pereaksi grup pertama (HCl) mengendapkan kation Golongan I, lalu H_{2}S untuk Golongan II, dan seterusnya.",
      equipment: ["Tabel analisis kualitatif", "Tabel kelarutan"],
      safetyNote:
        "H_{2}S bersifat toksik. Pastikan ruangan memiliki ventilasi yang baik. Hanya gunakan di dalam fume hood dengan persetujuan asisten.",
      estimatedTime: "20 min",
    },
    {
      id: 3,
      title: "Siapkan Larutan Kation",
      detail:
        "Buat larutan kation yang ditugaskan sesuai konsentrasi yang disetujui oleh asisten. Gunakan tabung reaksi bersih. Label setiap tabung dengan jelas (kation, konsentrasi, tanggal).",
      rationale:
        "Konsentrasi mempengaruhi hasil pengendapan. Tabung kotor dapat memberikan hasil palsu (false positive).",
      equipment: ["Tabung reaksi", "Rak tabung", "Pipet tetes", "Larutan stok kation", "Akuades", "Label"],
      safetyNote:
        "Gunakan sarung tangan dan kacamata saat menangani larutan logam. Cuci tangan setelah selesai.",
      estimatedTime: "15 min",
    },
    {
      id: 4,
      title: "Tambahkan Pereaksi Grup — HCl Encer",
      detail:
        "Tambahkan beberapa tetes HCl encer ke setiap larutan kation. Amati dengan teliti: apakah terbentuk endapan? Warna endapan? Apakah endapan larut dalam air panas?",
      rationale:
        "HCl mengendapkan kation Golongan I (Ag^{+}, Pb^{2+}, Hg_{2}^{2+}) sebagai klorida. PbCl_{2} larut dalam air panas — ini membedakannya dari AgCl dan Hg_{2}Cl_{2}.",
      equipment: ["HCl encer", "Pipet tetes", "Penangas air panas"],
      safetyNote:
        "HCl korosif. Hindari kontak dengan kulit dan mata. Jangan mencampur dengan basa kuat.",
      holdPoint: true,
      expectedObservation:
        "Ag^{+}: endapan putih AgCl (tidak larut dalam air panas). Pb^{2+}: endapan putih PbCl_{2} (larut dalam air panas). Hg_{2}^{2+}: endapan putih Hg_{2}Cl_{2}. Kation Golongan II+: tidak ada endapan dengan HCl.",
      estimatedTime: "10 min per kation",
    },
    {
      id: 5,
      title: "Lanjutkan dengan Pereaksi Grup Berikutnya",
      detail:
        "Untuk kation yang tidak mengendap dengan HCl, alirkan H_{2}S dalam larutan asam. Amati endapan yang terbentuk. Lalu, untuk sisa larutan, tambahkan NaOH dan NH_{3} berlebih secara bertahap.",
      rationale:
        "H_{2}S dalam larutan asam mengendapkan kation Golongan II (Cu^{2+} sebagai CuS hitam, dll.). NaOH dan NH_{3} mengendapkan kation Golongan III/IV/V sebagai hidroksida.",
      equipment: ["H_{2}S (gas/solution)", "NaOH", "NH_{3}", "Pipet tetes", "Kertas pH"],
      safetyNote:
        "H_{2}S toksik dan berbau. Gunakan hanya di fume hood. NH_{3} dan NaOH korosif. Tambahkan secara bertahap.",
      holdPoint: true,
      expectedObservation:
        "Cu^{2+}: endapan hitam CuS. Fe^{3+}: endapan coklat-merah Fe(OH)_{3}. Cr^{3+}: endapan hijau Cr(OH)_{3}. Al^{3+}: endapan putih Al(OH)_{3} (larut dalam NaOH berlebih). Zn^{2+}: endapan putih Zn(OH)_{2} (larut dalam NaOH dan NH_{3} berlebih).",
      estimatedTime: "15 min per pereaksi",
    },
    {
      id: 6,
      title: "Identifikasi Ion Tidak Dikenal",
      detail:
        "Gunakan pohon keputusan identifikasi ion. Tambahkan pereaksi sesuai alur: HCl → air panas → NH_{3} berlebih → K_{2}CrO_{4}. Catat setiap hasil observasi sebagai bukti.",
      rationale:
        "Pohon keputusan memastikan identifikasi sistematis. Setiap cabang membutuhkan bukti observasi sebelum melanjutkan ke cabang berikutnya.",
      equipment: ["Cuplikan tidak dikenal", "Semua pereaksi grup", "Pohon keputusan (tersedia di modul interaktif)"],
      safetyNote:
        "Dilarang mencampur pereaksi sembarangan. Gunakan hanya pereaksi yang diizinkan dalam alur identifikasi.",
      holdPoint: true,
      expectedObservation:
        "Hasil tergantung cuplikan. Catat semua observasi secara objektif (apa yang Anda lihat, bukan apa yang Anda harapkan).",
      estimatedTime: "20-30 min",
    },
    {
      id: 7,
      title: "Tuliskan Persamaan Reaksi",
      detail:
        "Untuk setiap reaksi yang positif (ada endapan, gas, atau perubahan warna), tuliskan persamaan molekuler lengkap dan persamaan ion netto. Pastikan persamaan seimbang.",
      rationale:
        "Persamaan ion netto menunjukkan spesies yang benar-benar bereaksi. Ini adalah inti dari pemahaman reaksi golongan utama.",
      equipment: ["Jurnal", "Pulpen", "Tabel kelarutan", "Kalkulator (untuk menyetarakan muatan)"],
      expectedObservation:
        "Contoh: Ag^{+} + Cl^{-} → AgCl↓ (ion netto). AgNO_{3} + NaCl → AgCl↓ + NaNO_{3} (molekuler).",
      estimatedTime: "15 min",
    },
    {
      id: 8,
      title: "Bersihkan dan Simpan Alat",
      detail:
        "Cuci semua tabung reaksi dengan akuades, lalu bilas dengan akuades bebas ion. Keringkan dan simpan di rak. Buang limbah cair ke wadah limbah logam berat — JANGAN buang ke saluran umum.",
      rationale:
        "Limbah logam berat (Ag, Hg, Pb, Cr) tidak boleh masuk ke saluran umum. Pemisahan limbah adalah kewajiban praktikum.",
      equipment: ["Sikat tabung", "Akuades", "Akuades bebas ion", "Wadah limbah logam berat"],
      safetyNote:
        "Pastikan wadah limbah berlabel dengan jelas. Tutup rapat setelah menggunakan. Cuci tangan setelah membersihkan.",
      estimatedTime: "10 min",
    },
  ];

  const checks: WalkthroughCheck[] = [
    {
      afterStep: 1,
      question:
        "Mengapa urutan penambahan pereaksi grup penting dalam analisis kation kualitatif?",
      options: [
        "Tidak penting — semua pereaksi dapat ditambahkan secara acak",
        "Karena setiap pereaksi grup mengendapkan kation golongan tertentu, dan reagen berikutnya hanya efektif pada kation yang tersisa",
        "Karena HCl harus selalu ditambahkan terakhir",
        "Karena warna endapan bergantung pada urutan",
      ],
      correctIndex: 1,
      explanation:
        "Pereaksi grup (HCl, H_{2}S, NaOH, NH_{3}) bekerja secara selektif. HCl mengendapkan Golongan I dulu. Setelah Golongan I dihilangkan, H_{2}S hanya mengendapkan Golongan II dari sisa larutan. Jika urutan salah, kation dari golongan sebelumnya akan mengganggu hasil golongan berikutnya.",
    },
    {
      afterStep: 3,
      question:
        "Apa yang terjadi jika Anda menggunakan tabung reaksi yang kotor untuk preparasi larutan kation?",
      options: [
        "Tidak ada masalah — kotoran tidak mempengaruhi hasil",
        "Hasil bisa menjadi false positive (endapan palsu) karena kotoran bereaksi dengan pereaksi",
        "Hasil akan menjadi lebih akurat",
        "Hanya mempengaruhi warna larutan, bukan endapan",
      ],
      correctIndex: 1,
      explanation:
        "Kotoran dalam tabung (sisa reaksi sebelumnya, residu deterjen, ion pengganggu) dapat bereaksi dengan pereaksi dan menghasilkan endapan palsu. Ini adalah sumber error yang umum dan dapat menyebabkan identifikasi ion yang salah.",
    },
    {
      afterStep: 5,
      question:
        "Kation mana yang membentuk endapan hidroksida yang LARUT dalam NaOH berlebih?",
      options: [
        "Fe^{3+} (Fe(OH)_{3} coklat-merah, tidak larut)",
        "Al^{3+} (Al(OH)_{3} putih, larut sebagai [Al(OH)_{4}]^{-})",
        "Cu^{2+} (Cu(OH)_{2} biru, tidak larut)",
        "Cr^{3+} (Cr(OH)_{3} hijau, tidak larut dalam NaOH berlebih)",
      ],
      correctIndex: 1,
      explanation:
        "Al(OH)_{3} bersifat amfoter — larut dalam NaOH berlebih membentuk aluminat [Al(OH)_{4}]^{-}. Ini membedakan Al^{3+} dari Fe^{3+} dan Cr^{3+} yang hidroksidanya tidak amfoter. Zn^{2+} juga amfoter (larut dalam NaOH berlebih).",
    },
    {
      afterStep: 7,
      question:
        "Apa persamaan ion netto yang benar untuk reaksi antara AgNO_{3} dan NaCl?",
      options: [
        "AgNO_{3} + NaCl → AgCl + NaNO_{3}",
        "Ag^{+} + NO_{3}^{-} + Na^{+} + Cl^{-} → AgCl↓ + Na^{+} + NO_{3}^{-}",
        "Ag^{+} + Cl^{-} → AgCl↓",
        "Ag + Cl → AgCl",
      ],
      correctIndex: 2,
      explanation:
        "Persamaan ion netto hanya menampilkan spesies yang berubah (bereaksi). Na^{+} dan NO_{3}^{-} adalah ion spektator (tidak berubah), jadi dihilangkan. Ag^{+} dan Cl^{-} bereaksi membentuk endapan AgCl. Persamaan pertama adalah persamaan molekuler, bukan ion netto.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[var(--on-surface-variant)]">
        <Link href="/prelab" className="hover:underline">Pre-lab</Link>
        <span className="mx-1">/</span>
        <span aria-current="page" className="text-[var(--on-surface)]">M1 — Reaksi Golongan Utama</span>
      </nav>

      {/* Header */}
      <header className="rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)]/30 shadow-ambient p-6 mb-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-3xl text-[var(--primary-container)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined">{module.icon}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Pre-lab: {module.titleShort}
            </h1>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">
              {module.title}
            </p>
            <p className="text-xs text-[var(--on-surface-variant)] mt-2">
              Manual hal. {module.manualPages} · Selesaikan walkthrough ini sebelum masuk lab
            </p>
          </div>
        </div>

        {/* Learning outcomes */}
        <div className="mt-4 rounded-lg bg-[var(--surface-container-low)] p-4 border border-[var(--outline-variant)]/30">
          <p className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">
            Tujuan Pembelajaran
          </p>
          <ul className="space-y-1">
            {module.learningOutcomes.map((o, i) => (
              <li key={i} className="text-sm text-[var(--on-surface)] flex items-start gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--secondary)] mt-0.5">check_circle</span>
                {o}
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Pre-lab tasks summary */}
      <section className="mb-6 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--secondary)]" style={{ fontVariationSettings: "'FILL' 1" }}>
            assignment
          </span>
          <h2 className="text-lg font-bold text-[var(--on-surface)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Tugas Pre-lab
          </h2>
        </div>
        <ul className="space-y-2 text-sm text-[var(--on-surface)]">
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--secondary)] mt-0.5">task_alt</span>
            Baca manual hal. 9-12 dan tulis jurnal pre-lab (tujuan, teori, alat/bahan)
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--secondary)] mt-0.5">task_alt</span>
            Selesaikan walkthrough prosedur interaktif di bawah ini
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--secondary)] mt-0.5">task_alt</span>
            Pelajari matriks reaksi interaktif di halaman modul M1
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--secondary)] mt-0.5">task_alt</span>
            Siapkan flowchart analisis kualitatif kation
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-[var(--secondary)] mt-0.5">task_alt</span>
            Tulis persamaan reaksi yang diharapkan untuk setiap kation vs pereaksi grup
          </li>
        </ul>
      </section>

      {/* Guided Evidence Trail rehearsal */}
      <M1LabRehearsal />

      {/* Interactive Procedure Walkthrough */}
      <ProcedureWalkthrough
        title="Walkthrough Prosedur M1"
        intro="Ikuti langkah demi langkah. Cek pemahaman muncul setelah langkah tertentu — Anda harus menjawab sebelum melanjutkan."
        steps={steps}
        checks={checks}
      />

      {/* After walkthrough: link to module */}
      <section className="mt-6 rounded-xl bg-[var(--primary-container)] p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Siap untuk Modul Interaktif?
        </h2>
        <p className="text-sm text-white/70 mb-4">
          Setelah menyelesaikan walkthrough, pelajari matriks reaksi interaktif dan pohon keputusan identifikasi ion.
        </p>
        <Link
          href="/modules/m1-reactions"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--secondary-container)] px-6 py-3 font-bold text-[var(--primary)] hover:opacity-90 transition-opacity"
        >
          <span aria-hidden="true" className="material-symbols-outlined">menu_book</span>
          Buka Modul M1 Interaktif
        </Link>
      </section>
    </div>
  );
}
