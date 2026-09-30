// Central content data for KUGU Lab modules
// Based on content.md specifications

export interface ModuleMeta {
  id: string;
  slug: string;
  number: number;
  title: string;
  titleShort: string;
  manualPages: string;
  route: string;
  sampleLineage: string;
  status: "draft" | "under_review" | "approved" | "published";
  color: string;
  icon: string;
  learningOutcomes: string[];
  theorySummary: string;
  keyInteractives: string[];
  safetyBlockers: string[];
  visible?: boolean;
  contentState?: "active" | "partial" | "placeholder" | "legacy";
  hasWalkthrough?: boolean;
}

export const modules: ModuleMeta[] = [
  {
    id: "legacy-m1-reactions",
    slug: "m1-reactions",
    number: 1,
    title: "Reaksi-Reaksi Kimia Senyawa Golongan Utama",
    titleShort: "Reaksi Golongan Utama",
    manualPages: "9-12",
    route: "/modules/m1-reactions",
    sampleLineage: "Observasi kualitatif; penalaran ion/cuplikan tidak dikenal",
    status: "published",
    color: "#001f3f",
    icon: "science",
    learningOutcomes: [
      "Mengamati perubahan pada reaksi senyawa golongan utama: pembentukan endapan dan gas.",
      "Mengetahui senyawa golongan utama terpilih yang memiliki kelarutan rendah dalam air.",
      "Mengidentifikasi jenis kation/anion dalam cuplikan larutan.",
      "Menuliskan persamaan reaksi secara benar.",
    ],
    theorySummary:
      "Kita bakal mengamati langsung apa yang terjadi saat larutan ionik dicampur—mulai dari terbentuknya endapan sampai letupan gas. Kuncinya: bedakan apa yang kita lihat (observasi) dengan kesimpulan reaksinya (inferensi)!",
    keyInteractives: [
      "Matriks reaksi (kation/anion vs pereaksi)",
      "Aktivitas pembentukan gas dengan safety gate",
      "Penyusun persamaan (molekuler/ion netto)",
      "Pohon keputusan identifikasi ion tidak dikenal",
    ],
    safetyBlockers: [
      "CR-01: Materials list Al(NO_{3})_{2} vs prosedur Al(NO_{3})_{3}",
      "CR-02: Materials list Na_{2}CrO_{4} vs prosedur K_{2}CrO_{4}",
      "CR-03: Prosedur gas menyebut natrium bikarbonat vs Na_{2}CO_{3}",
      "CR-04: Tabel observasi mencantumkan Na^{+} vs prosedur KNO_{3}",
    ],
    visible: false,
    contentState: "legacy",
    hasWalkthrough: true,
  },
  {
    id: "legacy-m2-mg2sno4",
    slug: "m2-mg2sno4",
    number: 2,
    title: "Sintesis Material Fotokatalis Mg_{2}SnO_{4} dengan Metode Sonokimia",
    titleShort: "Fotokatalis Mg_{2}SnO_{4}",
    manualPages: "13-19",
    route: "/modules/m2-mg2sno4",
    sampleLineage: "Sintesis M2 → pengeringan/kalsinasi → pelet/pengukuran → fotokatalisis → XRD",
    status: "published",
    color: "#705d00",
    icon: "light_mode",
    learningOutcomes: [
      "Memahami sintesis Mg_{2}SnO_{4}.",
      "Karakterisasi produk dengan XRD.",
      "Menentukan informasi terkait band gap dari pengukuran resistansi/konduktivitas.",
      "Mengevaluasi aktivitas fotokatalitik melalui data degradasi methylene blue.",
    ],
    theorySummary:
      "Kita bikin partikel fotokatalis Mg_{2}SnO_{4} pakai energi gelombang suara (ultrasonik), lalu kita uji kemampuannya mengurai polutan warna saat disinari cahaya.",
    keyInteractives: [
      "Peta proses / linimasa durasi panjang",
      "Log sintesis dan pH",
      "Kalkulator hasil (yield)",
      "Worksheet konduktivitas/band gap (σ = L / (R × A))",
      "Analisis fotokatalisis (absorbansi vs waktu)",
    ],
    safetyBlockers: [
      "HCl, NaOH, NH4OH, H2O2, etanol — SOP/SDS diperlukan",
      "Sonikator, peralatan UV, bubuk, press pelet, furnace 900°C",
    ],
    visible: false,
    contentState: "legacy",
    hasWalkthrough: true,
  },
  {
    id: "m4",
    slug: "m4-sn-bi-electrodeposition",
    number: 4,
    title: "Sintesis Paduan Logam Tin-Bismuth dengan Metode Elektrodeposisi",
    titleShort: "Elektrodeposisi Sn–Bi",
    manualPages: "20-25",
    route: "/modules/m4-sn-bi-electrodeposition",
    sampleLineage: "Elektrodeposisi M4 → bukti permukaan/massa → XRD",
    status: "published",
    color: "#001f3f",
    icon: "bolt",
    learningOutcomes: [
      "Sintesis paduan Sn–Bi via elektrodeposisi dengan reagen pengkompleks.",
      "Preparasi katoda dan anoda.",
      "Preparasi elektrolit.",
      "Perakitan sel elektrokimia.",
      "Proses elektrodeposisi.",
      "Handoff karakterisasi XRD.",
    ],
    theorySummary:
      "Sintesis lapisan paduan logam timah–bismut (Sn–Bi) pada permukaan substrat tembaga menggunakan arus searah (DC). Rapat arus dan durasi deposisi dikontrol agar terbentuk lapisan paduan yang seragam, kompak, dan efisien.",
    keyInteractives: [
      "Penjelajah sel elektrokimia (diagram berlabel interaktif)",
      "Worksheet preparasi elektrolit (Larutan A/B/C)",
      "Checklist preparasi katoda/anoda",
      "Log elektrodeposisi",
      "Kalkulator efisiensi arus",
    ],
    safetyBlockers: [
      "Asam/basa, garam logam, pelarut, resin/hardener, solder, DC power",
      "Elektroda karbon disediakan laboratorium — verifikasi identitas, kondisi, dan polaritas sesuai SOP/asisten",
    ],
    contentState: "active",
    hasWalkthrough: true,
  },
  {
    id: "m2",
    slug: "m2-zeolite-fau",
    number: 2,
    title: "Sintesis Zeolit FAU dengan Metode Hidrotermal",
    titleShort: "Zeolit FAU Hidrotermal",
    manualPages: "26-28",
    route: "/modules/m2-zeolite-fau",
    sampleLineage: "Prekursor M2 → kristalisasi hidrotermal → isolasi/pengeringan → XRD + BET",
    status: "published",
    color: "#705d00",
    icon: "hexagon",
    learningOutcomes: [
      "Sintesis zeolit FAU (X atau Y) dengan metode hidrotermal.",
      "Mengamati kristalisasi zeolit.",
      "Menghubungkan komposisi, suhu, dan waktu dengan sifat zeolit.",
      "Mengenali karakterisasi zeolit dasar melalui XRD.",
    ],
    theorySummary:
      "Kita 'memasak' mineral berpori mikroskopis (Zeolit FAU) dari campuran silika-alumina basa. Pori-pori kristalnya sangat ampuh menyaring zat dan jadi katalis industri.",
    keyInteractives: [
      "Workspace resep prekursor dan stoikiometri",
      "Penjelajah kondisi (komposisi-suhu-waktu)",
      "Linimasa kristalisasi bench-mode",
      "Checklist isolasi dan pengeringan",
      "Handoff karakterisasi",
    ],
    safetyBlockers: [
      "CR-05: Hydrothermal/tekanan vs botol PP — perlu rating wadah, tutup, fraksi pengisian, batas suhu",
      "Basa korosif, bejana alkali panas, filtrasi, bubuk",
    ],
    contentState: "active",
  },
  {
    id: "m5",
    slug: "m5-xrd",
    number: 5,
    title: "Karakterisasi dan Interpretasi Data XRD Hasil Sintesis",
    titleShort: "Interpretasi XRD",
    manualPages: "29-33",
    route: "/modules/m5-xrd",
    sampleLineage: "Data XRD dari produk sintesis M1, M2, M3, dan M4",
    status: "published",
    color: "#001f3f",
    icon: "monitoring",
    learningOutcomes: [
      "Memproses, menganalisis, dan menafsirkan data XRD dari bahan sintesis.",
    ],
    theorySummary:
      "XRD itu ibarat 'sidik jari' material padat. Dengan menembakkan sinar-X, kita bisa tahu pasti apakah kristal kita sudah terbentuk rapi dan berapa ukuran nanokristalnya.",
    keyInteractives: [
      "Sandbox Hukum Bragg",
      "Workspace difraktogram interaktif (peak picking)",
      "Kalkulator FWHM/Scherrer",
      "Walkthrough kristalinitas (area puncak/total)",
      "Perbandingan pola referensi",
    ],
    safetyBlockers: [
      "Interlock XRD tidak boleh dilewati",
      "Penanganan bubuk, integritas data mentah, provenans referensi",
    ],
    contentState: "active",
  },
  {
    id: "m6",
    slug: "m6-ftir-tga",
    number: 6,
    title: "Karakterisasi dan Interpretasi Data FTIR dan TGA",
    titleShort: "Interpretasi FTIR + TGA",
    manualPages: "34-38",
    route: "/modules/m6-ftir-tga",
    sampleLineage: "Spektrum FTIR dan termogram dari produk sintesis M1–M4",
    status: "published",
    color: "#705d00",
    icon: "thermostat",
    learningOutcomes: [
      "Memahami prinsip FTIR dan TGA serta menginterpretasikan spektrum dan termogram produk sintesis M1–M4.",
    ],
    theorySummary:
      "FTIR menghubungkan pita serapan dengan gugus fungsi; TGA memanaskan sampel sambil menimbangnya terus-menerus untuk melacak kehilangan massa dan dekomposisi.",
    keyInteractives: [
      "Planner instrumen-run",
      "Workspace FTIR (konten sedang disiapkan)",
      "Workspace TG/DTG (grafik sinkron)",
      "Alat anotasi kehilangan-massa/suhu",
      "Worksheet teoretis-vs-eksperimental",
    ],
    safetyBlockers: [
      "Operasi furnace 900°C, crucible panas, N2/asfiksia, gas berbahaya",
      "Harus ada jalur 'henti dan panggil asisten'",
    ],
    contentState: "partial",
  },
  {
    id: "m1",
    slug: "m1-alfum-mof",
    number: 1,
    title: "Sintesis Kerangka Logam-Organik Aluminium Fumarat (Al-Fum MOF) dengan Metode Presipitasi",
    titleShort: "Al-Fum MOF Presipitasi",
    manualPages: "—",
    route: "/modules/m1-alfum-mof",
    sampleLineage: "Presipitasi Al-Fum → pengeringan → XRD + FTIR",
    status: "draft",
    color: "#705d00",
    icon: "hub",
    learningOutcomes: [
      "Sintesis Al-Fum MOF dengan metode presipitasi.",
      "Memahami kristalisasi aluminium fumarat.",
      "Menyiapkan produk untuk karakterisasi XRD dan FTIR.",
    ],
    theorySummary: "Placeholder kurikulum: konten Al-Fum MOF akan diisi dari Shared_Modul KUGU.docx.",
    keyInteractives: ["Workspace sintesis Al-Fum (direncanakan)", "Handoff karakterisasi XRD/FTIR"],
    safetyBlockers: ["Konten keselamatan dan prosedur menunggu verifikasi pengajar"],
    contentState: "placeholder",
  },
  {
    id: "m3",
    slug: "m3-sno2-precipitation",
    number: 3,
    title: "Sintesis SnO₂ dengan Metode Presipitasi",
    titleShort: "SnO₂ Presipitasi",
    manualPages: "—",
    route: "/modules/m3-sno2-precipitation",
    sampleLineage: "Presipitasi SnO₂ → pengeringan/kalsinasi → XRD",
    status: "draft",
    color: "#001f3f",
    icon: "grain",
    learningOutcomes: [
      "Sintesis SnO₂ dari prekursor SnCl₂·2H₂O.",
      "Memahami oksidasi Sn²⁺ dan peran urea dalam presipitasi.",
      "Menyiapkan produk untuk karakterisasi XRD.",
    ],
    theorySummary: "Placeholder kurikulum: konten sintesis SnO₂ akan diisi dari Shared_Modul KUGU.docx.",
    keyInteractives: ["Workspace presipitasi SnO₂ (direncanakan)", "Handoff karakterisasi XRD"],
    safetyBlockers: ["Konten keselamatan dan prosedur menunggu verifikasi pengajar"],
    contentState: "placeholder",
  },
  {
    id: "m7",
    slug: "m7-bet",
    number: 7,
    title: "Karakterisasi dan Interpretasi Data Adsorpsi-Desorpsi N₂ Isoterm",
    titleShort: "Interpretasi BET",
    manualPages: "—",
    route: "/modules/m7-bet",
    sampleLineage: "Isoterm N₂ → kurva BET → luas permukaan spesifik",
    status: "draft",
    color: "#705d00",
    icon: "show_chart",
    learningOutcomes: [
      "Memahami adsorpsi-desorpsi N₂ dan klasifikasi isoterm IUPAC.",
      "Mengolah kurva BET dan menentukan luas permukaan spesifik.",
      "Menghubungkan luas permukaan dengan sifat material berpori.",
    ],
    theorySummary: "Placeholder kurikulum: konten BET akan diisi dari Shared_Modul KUGU.docx.",
    keyInteractives: ["Workspace isoterm N₂/BET (direncanakan)", "Regresi BET dan interpretasi pori"],
    safetyBlockers: ["Konten keselamatan dan prosedur pengukuran menunggu verifikasi pengajar"],
    contentState: "placeholder",
  },
];

export const visibleModules = modules
  .filter((module) => module.visible !== false)
  .sort((a, b) => a.number - b.number);

export function getModule(slug: string): ModuleMeta | undefined {
  return modules.find((m) => m.slug === slug);
}
