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
}

export const modules: ModuleMeta[] = [
  {
    id: "m1",
    slug: "m1-reactions",
    number: 1,
    title: "Reaksi-Reaksi Kimia Senyawa Golongan Utama",
    titleShort: "Reaksi Golongan Utama",
    manualPages: "9-12",
    route: "/modules/m1-reactions",
    sampleLineage: "Observasi kualitatif; penalaran ion/cuplikan tidak dikenal",
    status: "published",
    color: "#0d9488",
    icon: "🧪",
    learningOutcomes: [
      "Mengamati perubahan pada reaksi senyawa golongan utama: pembentukan endapan dan gas.",
      "Mengetahui senyawa golongan utama terpilih yang memiliki kelarutan rendah dalam air.",
      "Mengidentifikasi jenis kation/anion dalam cuplikan larutan.",
      "Menuliskan persamaan reaksi secara benar.",
    ],
    theorySummary:
      "Reaksi ionik dalam larutan akuatik, pengendapan, kelarutan, observasi vs inferensi, reaksi asam-basa dan redoks yang menghasilkan gas, serta persamaan ion netto.",
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
  },
  {
    id: "m2",
    slug: "m2-mg2sno4",
    number: 2,
    title: "Sintesis Material Fotokatalis Mg_{2}SnO_{4} dengan Metode Sonokimia",
    titleShort: "Fotokatalis Mg_{2}SnO_{4}",
    manualPages: "13-19",
    route: "/modules/m2-mg2sno4",
    sampleLineage: "Sintesis M2 → pengeringan/kalsinasi → pelet/pengukuran → fotokatalisis → XRD",
    status: "published",
    color: "#6366f1",
    icon: "☀️",
    learningOutcomes: [
      "Memahami sintesis Mg_{2}SnO_{4}.",
      "Karakterisasi produk dengan XRD.",
      "Menentukan informasi terkait band gap dari pengukuran resistansi/konduktivitas.",
      "Mengevaluasi aktivitas fotokatalitik melalui data degradasi methylene blue.",
    ],
    theorySummary:
      "Fotokatalisis: absorpsi cahaya, pasangan elektron-hole semikonduktor, reaksi redoks. Band gap dan konteks panjang gelombang (TiO_{2} ~3.2 eV, aktif UV). Sonokimia: kavitasi, kondisi lokal, pembentukan jaringan logam-oksigen.",
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
  },
  {
    id: "m3",
    slug: "m3-sn-bi-electrodeposition",
    number: 3,
    title: "Sintesis Paduan Logam Tin-Bismuth dengan Metode Elektrodeposisi",
    titleShort: "Elektrodeposisi Sn–Bi",
    manualPages: "20-25",
    route: "/modules/m3-sn-bi-electrodeposition",
    sampleLineage: "Elektrodeposisi M3 → bukti permukaan/massa → XRD",
    status: "published",
    color: "#f59e0b",
    icon: "⚡",
    learningOutcomes: [
      "Sintesis paduan Sn–Bi via elektrodeposisi dengan reagen pengkompleks.",
      "Preparasi katoda dan anoda.",
      "Preparasi elektrolit.",
      "Perakitan sel elektrokimia.",
      "Proses elektrodeposisi.",
      "Handoff karakterisasi XRD.",
    ],
    theorySummary:
      "Paduan vs logam murni, anatomi sel elektrokimia (Anoda/Katoda, arah arus), prinsip elektrodeposisi, peran agen pengkompleks, rapat arus, luas area, waktu, perubahan massa, efisiensi arus.",
    keyInteractives: [
      "Penjelajah sel elektrokimia (diagram berlabel interaktif)",
      "Worksheet preparasi elektrolit (Larutan A/B/C)",
      "Checklist preparasi katoda/anoda",
      "Log elektrodeposisi",
      "Kalkulator efisiensi arus",
    ],
    safetyBlockers: [
      "Asam/basa, garam logam, pelarut, resin/hardener, solder, DC power",
      "CR-06: Grafit dari baterai bekas — perlu jenis baterai, metode isolasi, supervise",
    ],
  },
  {
    id: "m4",
    slug: "m4-zeolite-fau",
    number: 4,
    title: "Sintesis Zeolit FAU dengan Metode Hidrotermal",
    titleShort: "Zeolit FAU Hidrotermal",
    manualPages: "26-28",
    route: "/modules/m4-zeolite-fau",
    sampleLineage: "Prekursor M4 → kristalisasi hidrotermal → isolasi/pengeringan → XRD + TGA",
    status: "published",
    color: "#16a34a",
    icon: "💠",
    learningOutcomes: [
      "Sintesis zeolit FAU (X atau Y) dengan metode hidrotermal.",
      "Mengamati kristalisasi zeolit.",
      "Menghubungkan komposisi, suhu, dan waktu dengan sifat zeolit.",
      "Mengenali karakterisasi zeolit dasar melalui XRD.",
    ],
    theorySummary:
      "Zeolit sebagai aluminosilikat mikropori kristalin dari tetrahedra [SiO_{4}]^{4-} dan [AlO_{4}]^{5-}. Aplikasi: adsorben, penukar ion, katalis. Sintesis hidrotermal: nukleasi/rekristalisasi/pertumbuhan kristal.",
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
  },
  {
    id: "m5",
    slug: "m5-xrd",
    number: 5,
    title: "Karakterisasi dan Interpretasi Data XRD Hasil Sintesis",
    titleShort: "Interpretasi XRD",
    manualPages: "29-33",
    route: "/modules/m5-xrd",
    sampleLineage: "Data XRD dari produk sintesis M2, M3, M4",
    status: "published",
    color: "#8b5cf6",
    icon: "📐",
    learningOutcomes: [
      "Memproses, menganalisis, dan menafsirkan data XRD dari bahan sintesis.",
    ],
    theorySummary:
      "Prinsip difraksi sinar-X, material kristalin vs amorf, Hukum Bragg (nλ = 2d sin θ), posisi/intensitas/lebar puncak, Kristalinitas, persamaan Scherrer (K = 0.9), perbandingan pola referensi.",
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
  },
  {
    id: "m6",
    slug: "m6-tga",
    number: 6,
    title: "Karakterisasi dan Interpretasi Data TGA Senyawa Hasil Sintesis",
    titleShort: "Interpretasi TGA",
    manualPages: "34-38",
    route: "/modules/m6-tga",
    sampleLineage: "Termogram dari produk sintesis (terutama sampel zeolit)",
    status: "published",
    color: "#dc2626",
    icon: "🔥",
    learningOutcomes: [
      "Memahami analisis termogravimetri dasar, menganalisis perubahan massa dan suhu onset untuk dua sampel, dan memproses data TGA/DTG.",
    ],
    theorySummary:
      "Prinsip TGA: pengukuran massa berkelanjutan selama pemanasan terprogram. Interpretasi TG vs DTG, region kehilangan massa, suhu onset, titik infleksi, stabilitas, mekanisme dekomposisi.",
    keyInteractives: [
      "Planner instrumen-run",
      "Workspace TG/DTG (grafik sinkron)",
      "Alat anotasi kehilangan-massa/suhu",
      "Worksheet teoretis-vs-eksperimental",
    ],
    safetyBlockers: [
      "Operasi furnace 900°C, crucible panas, N2/asfiksia, gas berbahaya",
      "Harus ada jalur 'henti dan panggil asisten'",
    ],
  },
];

export function getModule(slug: string): ModuleMeta | undefined {
  return modules.find((m) => m.slug === slug);
}
