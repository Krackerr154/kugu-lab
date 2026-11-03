import type { M3StageId, ReviewSlideId } from "@/lib/m3-presentation";

/**
 * Module 6 (FTIR) review deck.
 *
 * Content source: "Pengarahan Modul 6 — Karakterisasi dan Interpretasi Data FTIR"
 * (Praktikum KI3131 Kimia Unsur Golongan Utama, Semester 1 2026/2027).
 *
 * Mirrors the Module 4 deck's shape — every slide carries bullets for the
 * student view, a `script` the assistant reads from the teleprompter, and
 * optional pedagogical notes — so the same presenter workflow applies.
 */

export type M6EmbeddedComponentType =
  | "ftir-vibration"
  | "ftir-spectrum-acid"
  | "ftir-spectrum-alfum"
  | "ftir-coordination"
  | "ftir-purity"
  | "ftir-excel"
  | "ftir-traps"
  | "ftir-conclusions"
  | "ftir-report-grid";

export interface DeckRubric {
  code: string;
  label: string;
  points?: number;
}

export interface ReviewDeckSlide {
  id: ReviewSlideId;
  chapter: M3StageId;
  chapterLabel: string;
  label: string;
  title: string;
  kind: "content" | "data" | "closing";
  bullets: string[];
  script: string;
  pedagogicalNotes?: string;
  rubric?: DeckRubric;
  embeddedComponent?: M6EmbeddedComponentType;
}

export const M6_REVIEW_DECK_SLIDES: readonly ReviewDeckSlide[] = [
  // ── BAB 1: TUJUAN ─────────────────────────────────────────────────────────
  {
    id: "q1",
    chapter: "brief",
    chapterLabel: "Tujuan",
    label: "Pembuka & tujuan",
    title: "Apa yang Kita Kerjakan di Modul 6",
    kind: "content",
    bullets: [
      "Tujuan 1: memahami prinsip dasar spektroskopi inframerah.",
      "Tujuan 2: menginterpretasi spektrum FTIR Al-Fum hasil sintesis untuk mengenali gugus fungsi khasnya.",
      "Tujuan 3: membandingkan dengan asam fumarat bebas dan data literatur untuk menilai kemurnian produk.",
      "Keluaran: spektrum yang teranotasi, penetapan pita, dan simpulan kemurnian yang masuk ke laporan.",
    ],
    script:
      "Selamat datang di sesi pembahasan Modul 6. Praktikum kalian sudah selesai, dan sekarang kita kerjakan bagian yang paling sering keliru saat menulis laporan: membaca spektrum FTIR. Produk akhir sesi ini bukan cuma grafik yang tercetak, tetapi kemampuan kalian menjelaskan mengapa pita bergeser, dan apa artinya bagi kemurnian Al-Fum yang kalian sintesis.",
    pedagogicalNotes:
      "Tegaskan bahwa FTIR di modul ini bukan sekadar pelengkap karakterisasi: pita C=O yang hilang adalah bukti utama bahwa fumarat benar-benar terkoordinasi, bukan hanya tercampur.",
    rubric: { code: "c", label: "Tujuan Praktikum", points: 10 },
  },
  {
    id: "q2",
    chapter: "brief",
    chapterLabel: "Tujuan",
    label: "Alur kerja",
    title: "Urutan Pengukuran yang Kalian Lakukan",
    kind: "content",
    bullets: [
      "Preparasi: sampel Al-Fum dicampur KBr dan ditekan menjadi pelet, atau diukur langsung dengan ATR.",
      "Background: spektrum latar diukur lebih dulu, tanpa sampel.",
      "Pengukuran: spektrum sampel direkam pada 4000 sampai 400 cm⁻¹.",
      "Pembacaan: puncak diidentifikasi, lalu dibandingkan dengan spektrum asam fumarat bebas.",
    ],
    script:
      "Kita urutkan kembali alur kerjanya supaya bisa kalian tulis runtut di bagian metode. Yang perlu ditekankan: background harus diukur sebelum sampel. Kalau urutannya tertukar atau background lupa, pita CO₂ dan uap air dari ruangan akan ikut terbaca dan mengacaukan pembacaan.",
    pedagogicalNotes:
      "Jebakan paling umum: mahasiswa menganggap pelet yang keruh sebagai kegagalan. Yang menentukan bukan kejernihan visual, melainkan apakah pita masih terpisah dan rasio signal-to-noise memadai.",
    rubric: { code: "f.1", label: "Deskripsi Metode", points: 35 },
  },

  // ── BAB 2: PEMBAHASAN ─────────────────────────────────────────────────────
  {
    id: "q3",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Prinsip",
    title: "Mengapa Ikatan Menyerap Inframerah",
    kind: "content",
    bullets: [
      "FTIR memanfaatkan interaksi radiasi inframerah dengan getaran ikatan dalam molekul.",
      "Suatu ikatan menyerap hanya bila getarannya mengubah momen dipol molekul.",
      "Ikatan yang simetris sempurna dan tidak mengubah dipol tidak memberi pita kuat.",
      "Posisi serapan dinyatakan dalam bilangan gelombang (cm⁻¹), direkam 4000 sampai 400 cm⁻¹.",
    ],
    script:
      "Ini fondasi yang harus kalian tulis di landasan teori. Kalimat kuncinya: penyerapan terjadi kalau getaran mengubah momen dipol. Karena itu ikatan C=O yang polar memberi pita sangat kuat, sementara ikatan yang benar-benar simetris bisa hampir tidak terlihat. Jangan sekadar menghafal posisi pita tanpa alasan fisiknya.",
    rubric: { code: "f.1", label: "Prinsip FTIR", points: 35 },
  },
  {
    id: "q4",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Jenis vibrasi",
    title: "Ulur Simetri, Ulur Asimetri, dan Tekuk",
    kind: "content",
    bullets: [
      "Ulur simetri: kedua ikatan memanjang dan memendek bersamaan.",
      "Ulur asimetri: satu ikatan memanjang ketika ikatan lain memendek.",
      "Tekuk: sudut ikatan berubah, panjang ikatan relatif tetap.",
      "Ulur biasanya muncul pada bilangan gelombang lebih tinggi daripada tekuk.",
    ],
    script:
      "Tiga jenis gerakan ini yang akan kalian sebut berulang kali saat menetapkan pita. Perhatikan pasangan COO⁻ nanti: yang satu ulur asimetri, yang satu ulur simetri. Karena gerakannya berbeda, posisinya juga berbeda, dan selisih keduanya membawa informasi tentang cara fumarat mengikat aluminium.",
    pedagogicalNotes:
      "Selisih antara ulur asimetri dan simetri COO⁻ (Δν ≈ 180 cm⁻¹ di sini) dipakai literatur untuk menilai mode koordinasi karboksilat — jembatan, kelat, atau monodentat. Sebut sebagai wawasan tambahan, bukan tuntutan laporan.",
    rubric: { code: "f.1", label: "Penetapan Vibrasi", points: 35 },
    embeddedComponent: "ftir-vibration",
  },
  {
    id: "q5",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Instrumen",
    title: "Dari Interferogram ke Spektrum",
    kind: "content",
    bullets: [
      "Spektrofotometer FTIR memakai interferometer Michelson untuk menghasilkan interferogram.",
      "Interferogram diubah menjadi spektrum melalui transformasi Fourier.",
      "Spektrum latar (background) diukur sebelum sampel.",
      "Sampel disiapkan sebagai pelet KBr atau diukur langsung dengan ATR.",
    ],
    script:
      "Kalian tidak perlu menghitung transformasi Fourier, tetapi harus bisa menjelaskan mengapa alat ini disebut FTIR dan bukan sekadar IR. Kata Fourier-nya datang dari langkah matematis yang mengubah interferogram menjadi spektrum. Ini pertanyaan favorit di sidang laporan.",
    rubric: { code: "f.1", label: "Instrumen & Metode", points: 35 },
  },
  {
    id: "q6",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Asam fumarat",
    title: "Spektrum Ligan Bebas: Asam Fumarat",
    kind: "content",
    bullets: [
      "2500–3300 cm⁻¹ (sangat lebar): ulur O–H gugus COOH.",
      "1675 cm⁻¹: ulur C=O gugus COOH.",
      "1274 dan 1231 cm⁻¹: ulur C–O disertai tekuk O–H.",
      "927 cm⁻¹: tekuk O–H di luar bidang.",
    ],
    script:
      "Ini spektrum acuan kalian. Empat pita inilah tanda asam fumarat yang belum terkoordinasi. Perhatikan betapa lebarnya pita O–H di 2500 sampai 3300: itu ciri asam karboksilat yang berikatan hidrogen, bukan air biasa. Hafalkan posisi C=O di 1675, karena pita itulah yang nanti kita cari hilangnya.",
    pedagogicalNotes:
      "Tekankan bahwa keempat pita ini adalah pembanding, bukan hasil. Kalau salah satu masih muncul di spektrum produk, berarti ada sisa asam fumarat bebas.",
    rubric: { code: "f.2", label: "Spektrum Ligan", points: 35 },
    embeddedComponent: "ftir-spectrum-acid",
  },
  {
    id: "q7",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Koordinasi",
    title: "Fumarat Terkoordinasi pada Al³⁺",
    kind: "content",
    bullets: [
      "Setelah H⁺ lepas dan karboksilat berkoordinasi pada Al³⁺, kedua ikatan C–O menjadi setara (orde ikatan ≈1,5).",
      "Pita ulur C=O 1675 cm⁻¹ hilang.",
      "Digantikan ulur asimetri COO⁻ sekitar 1610 cm⁻¹.",
      "Dan ulur simetri COO⁻ sekitar 1430 cm⁻¹.",
    ],
    script:
      "Ini slide inti seluruh modul. Ketika asam kehilangan protonnya, gugus karboksilat berubah dari COOH menjadi COO⁻. Dua ikatan C–O tidak lagi berbeda, keduanya setara karena resonansi. Akibatnya pita C=O yang tajam di 1675 hilang, dan muncul dua pita baru: 1610 dan 1430. Kalau kalian bisa menjelaskan ini, separuh nilai pembahasan sudah aman.",
    pedagogicalNotes:
      "Hubungkan ke modul sintesis: koordinasi inilah yang membangun kerangka Al-Fum. FTIR adalah bukti langsung bahwa kerangka itu terbentuk, bukan sekadar campuran fisik.",
    rubric: { code: "f.2", label: "Mekanisme Koordinasi", points: 35 },
    embeddedComponent: "ftir-coordination",
  },
  {
    id: "q8",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Pita Al-Fum",
    title: "Peta Pita Karakteristik Al-Fum",
    kind: "content",
    bullets: [
      "Sekitar 1610 cm⁻¹: ulur asimetri COO⁻.",
      "Sekitar 1430 cm⁻¹: ulur simetri COO⁻.",
      "Sekitar 1158 dan 805 cm⁻¹: pita terkait ikatan C–O.",
      "720–650 cm⁻¹: tekuk C=C dan C–H kerangka fumarat.",
      "3400–3600 cm⁻¹ (lebar): ulur O–H air dalam pori atau gugus μ-OH.",
    ],
    script:
      "Sekarang spektrum produk kalian. Dua pita di 1610 dan 1430 adalah bukti koordinasi. Pita di 1158 dan 805 berasal dari kerangka C–O. Daerah 720 sampai 650 adalah sidik jari kerangka fumarat. Dan pita lebar di 3400 sampai 3600 bukan O–H ligan, melainkan air di dalam pori atau gugus μ-OH.",
    pedagogicalNotes:
      "Pita 3400–3600 sering salah ditetapkan sebagai O–H karboksilat. Bedanya: pita asam fumarat jauh lebih lebar dan turun sampai 2500, sedangkan pita air pori sempit di kisaran 3400–3600.",
    rubric: { code: "f.2", label: "Peta Pita Produk", points: 35 },
    embeddedComponent: "ftir-spectrum-alfum",
  },

  // ── BAB 3: PENGOLAHAN DATA ────────────────────────────────────────────────
  {
    id: "q9",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Kemurnian",
    title: "Menilai Kemurnian dari Ada atau Tidaknya Pita",
    kind: "content",
    bullets: [
      "Ulur C=O sekitar 1675 cm⁻¹: ada pada asam fumarat bebas, tidak ada pada Al-Fum murni.",
      "Ulur O–H lebar 2500–3300 cm⁻¹: ada pada asam bebas, tidak ada pada Al-Fum murni.",
      "Ulur asimetri dan simetri COO⁻: tidak ada pada asam bebas, ada pada Al-Fum.",
      "Bila pita C=O 1675 masih muncul pada sampel, reaksi belum sempurna.",
    ],
    script:
      "Ini cara paling jujur menilai kemurnian tanpa instrumen tambahan. Kalian tidak mengukur kadar, tetapi memeriksa ada atau tidaknya pita penanda. Kalau 1675 masih ada di produk, berarti masih ada asam fumarat yang belum bereaksi, dan itu harus kalian tulis sebagai temuan, bukan disembunyikan.",
    pedagogicalNotes:
      "Jangan biarkan mahasiswa menulis 'produk murni' tanpa bukti pita. Kesimpulan harus merujuk pita mana yang hadir dan mana yang tidak hadir.",
    rubric: { code: "f.4", label: "Evaluasi Kemurnian", points: 35 },
    embeddedComponent: "ftir-purity",
  },
  {
    id: "q10",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Menyusun grafik",
    title: "Menyusun Spektrum di Excel",
    kind: "content",
    bullets: [
      "Siapkan sumbu x (bilangan gelombang) dan sumbu y (transmitansi): Y1 ligan fumarat, Y2 Al-Fum.",
      "Buat kolom stacked Y2′ = Y2 + offset, misalnya +140, agar kedua kurva tidak bertumpuk.",
      "Gunakan Scatter with Smooth Lines, bukan Line chart.",
      "Atur sumbu x: bounds 400 sampai 4000, major 400, minor 100, dan pilih nilai terbalik (reverse order).",
      "Beri judul sumbu: x = Bilangan gelombang (cm⁻¹), y = Transmitansi (a.u.).",
    ],
    script:
      "Kesalahan paling sering di bagian ini: memakai Line chart, sehingga sumbu x tidak bisa diatur dan spektrum jadi terbalik. Pakai Scatter with Smooth Lines. Lalu batas sumbu x diatur 400 sampai 4000 dan dibalik, karena spektrum IR selalu dibaca dari bilangan gelombang besar di kiri ke kecil di kanan. Offset boleh tidak 140, yang penting kedua kurva terpisah jelas.",
    pedagogicalNotes:
      "Offset adalah pilihan tampilan, bukan data. Tegaskan bahwa menggeser kurva tidak mengubah posisi pita — dan posisi pita itulah yang dibandingkan.",
    rubric: { code: "e", label: "Pengolahan & Penyajian Data", points: 15 },
    embeddedComponent: "ftir-excel",
  },
  {
    id: "q11",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Jebakan",
    title: "Dua Hal yang Sering Menyesatkan",
    kind: "content",
    bullets: [
      "Bandingkan posisi pita, bukan tinggi pita: jumlah sampel tiap pelet berbeda.",
      "Pita di sekitar 2350 cm⁻¹ berasal dari CO₂ di udara, bukan dari sampel.",
      "Pita kecil bergerigi berasal dari uap air.",
      "Keduanya artefak atmosfer dan tidak boleh ditetapkan sebagai gugus fungsi.",
    ],
    script:
      "Dua jebakan ini yang paling sering merusak laporan. Pertama, jangan membandingkan tinggi puncak antar sampel, karena tebal pelet dan jumlah sampelnya berbeda. Yang dibandingkan adalah posisi. Kedua, pita di 2350 itu CO₂ dari udara ruangan. Kalau kalian menetapkannya sebagai gugus fungsi, penguji akan langsung tahu.",
    pedagogicalNotes:
      "Uji cepat: kalau sebuah pita muncul di background maupun di sampel pada posisi yang sama persis, itu artefak.",
    rubric: { code: "f.4", label: "Analisis Artefak", points: 35 },
    embeddedComponent: "ftir-traps",
  },

  // ── BAB 4: SIMPULAN & LAPORAN ─────────────────────────────────────────────
  {
    id: "q12",
    chapter: "ready",
    chapterLabel: "Simpulan & Laporan",
    label: "Menyimpulkan",
    title: "Empat Pertanyaan yang Harus Dijawab",
    kind: "content",
    bullets: [
      "Apakah ligan fumarat sudah terkoordinasi dengan Al³⁺?",
      "Apakah masih ada asam fumarat bebas?",
      "Apakah posisi pita sesuai dengan literatur Al-Fum?",
      "Apa perbedaan antarsampel dan kemungkinan penyebabnya?",
    ],
    script:
      "Empat pertanyaan ini adalah kerangka simpulan kalian. Jawab satu per satu, dan setiap jawaban harus menunjuk pita yang mendukungnya. Bukan 'ya, sudah terkoordinasi', tetapi 'ya, karena C=O 1675 hilang dan muncul pita 1610 serta 1430'.",
    pedagogicalNotes:
      "Latih mahasiswa menulis simpulan berpola klaim–bukti. Simpulan tanpa rujukan pita akan kehilangan poin f.2 dan f.4.",
    rubric: { code: "h", label: "Kesimpulan", points: 10 },
    embeddedComponent: "ftir-conclusions",
  },
  {
    id: "q13",
    chapter: "ready",
    chapterLabel: "Simpulan & Laporan",
    label: "Kisi-kisi",
    title: "Yang Dilaporkan",
    kind: "closing",
    bullets: [
      "Spektra FTIR sampel hasil sintesis dan asam fumarat.",
      "Identifikasi pita serapan karakteristik dan gugus fungsi yang bersesuaian.",
      "Perbandingan spektrum sampel dengan data literatur.",
      "Evaluasi kemurnian berdasarkan ada atau tidaknya pita asam fumarat bebas.",
    ],
    script:
      "Terakhir, kisi-kisi laporannya. Empat hal ini yang dinilai pada bagian FTIR. Pastikan spektrum kalian tercetak dengan sumbu berlabel, pita sudah dianotasi, dan ada perbandingan dengan literatur. Setelah ini kita tutup sesi, dan kalian lanjut menyusun laporan.",
    rubric: { code: "seluruh", label: "Kisi-Kisi Laporan", points: 100 },
    embeddedComponent: "ftir-report-grid",
  },
];

export const M6_REVIEW_DECK_SLIDE_BY_ID: Readonly<Record<string, ReviewDeckSlide>> = Object.freeze(
  Object.fromEntries(M6_REVIEW_DECK_SLIDES.map((s) => [s.id, s]))
);

export const TOTAL_M6_REVIEW_DECK_SLIDES = M6_REVIEW_DECK_SLIDES.length;

export const m6DeckSlideIndex = (id: string): number =>
  M6_REVIEW_DECK_SLIDES.findIndex((s) => s.id === id);
