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
  | "ftir-report-grid"
  | "tga-what-it-measures"
  | "tga-steps"
  | "tga-dtg"
  | "tga-tangent"
  | "tga-alfum"
  | "tga-traps";

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
  // ── BAB 5: TGA ────────────────────────────────────────────────────────────
  {
    id: "q14",
    chapter: "ready",
    chapterLabel: "TGA",
    label: "Apa yang diukur TGA",
    title: "Termogravimetri: Menimbang Sambil Memanaskan",
    kind: "content",
    bullets: [
      "TGA menaikkan suhu secara teratur sambil terus menimbang sampel, sehingga setiap kehilangan massa tercatat sebagai fungsi suhu.",
      "Kurva TG menunjukkan sisa massa (%); kurva DTG adalah turunannya dan memberi tahu pada suhu berapa kehilangan massa paling cepat.",
      "Atmosfer menentukan hasil: N₂ untuk dekomposisi inert, udara untuk pembakaran residu organik.",
      "Yang dibaca dari termogram: jumlah tahap, suhu onset tiap tahap, dan besar kehilangan massa tiap tahap.",
    ],
    script:
      "Sekarang TGA. Bedanya dengan FTIR: FTIR memberi tahu gugus fungsi apa yang ada, TGA memberi tahu pada suhu berapa material itu mulai berubah dan berapa banyak yang hilang. Sampel ditimbang terus-menerus sementara suhu naik. Kurva TG itu sisa massa, DTG itu turunannya — puncak DTG adalah suhu di mana reaksi berjalan paling cepat. Yang kita baca bukan hanya 'berapa persen hilang', tapi berapa tahap, onset-nya di mana, dan besar tiap tahap.",
    pedagogicalNotes:
      "Tekankan bahwa TGA tidak mengidentifikasi gugus fungsi. Siswa sering menjawab 'TGA membuktikan ada C=O' — itu FTIR.",
    rubric: { code: "g.1", label: "Prinsip TGA", points: 15 },
    embeddedComponent: "tga-what-it-measures",
  },
  {
    id: "q15",
    chapter: "ready",
    chapterLabel: "TGA",
    label: "Membaca tahap",
    title: "Membaca Tahap pada Kurva TG",
    kind: "data",
    bullets: [
      "Setiap tahap punya onset (mulai hilang massa), puncak DTG (laju maksimum), dan endset (tahap selesai).",
      "Kehilangan massa tiap tahap dihitung dari selisih sisa massa sebelum dan sesudah tahap, bukan dari tinggi kurva pada satu titik.",
      "Tahap di bawah 150 °C biasanya air fisis; tahap di atas 300 °C menandakan perubahan kerangka.",
      "Sebutkan ketiganya saat melaporkan: onset, puncak, dan Δm — bukan hanya 'terjadi kehilangan massa'.",
    ],
    script:
      "Cara membaca tahap. Tiap tahap punya tiga angka: onset, puncak DTG, dan endset. Δm dihitung dari selisih sisa massa sebelum dan sesudah tahap — bukan dari tinggi kurva di satu titik, karena tinggi itu relatif terhadap sumbu. Tahap di bawah 150 derajat hampir selalu air fisis. Di atas 300 derajat, kerangka mulai berubah.",
    rubric: { code: "g.2", label: "Membaca tahap", points: 20 },
    embeddedComponent: "tga-steps",
  },
  {
    id: "q16",
    chapter: "ready",
    chapterLabel: "TGA",
    label: "DTG",
    title: "DTG: Turunan yang Mempertajam",
    kind: "data",
    bullets: [
      "DTG adalah turunan pertama kurva TG terhadap suhu; puncaknya menunjuk suhu laju kehilangan massa tertinggi.",
      "Dua tahap yang bertumpuk pada kurva TG sering terpisah jelas di kurva DTG.",
      "Puncak DTG dipakai sebagai suhu karakteristik saat membandingkan sampel dengan literatur.",
      "DTG tidak menambah informasi baru — ia hanya menyajikan kurva TG dengan cara yang lebih mudah dibaca.",
    ],
    script:
      "DTG itu turunan dari kurva TG. Gunanya: kalau dua tahap bertumpuk di kurva TG, di DTG sering terpisah jadi dua puncak. Jadi DTG bukan data tambahan — ia cuma cara membaca kurva TG yang sama dengan lebih tajam. Saat membandingkan dengan literatur, sebut suhu puncak DTG, bukan sekadar 'ada dua tahap'.",
    rubric: { code: "g.3", label: "DTG", points: 15 },
    embeddedComponent: "tga-dtg",
  },
  {
    id: "q19",
    chapter: "ready",
    chapterLabel: "TGA",
    label: "Onset",
    title: "Membaca Onset dan Endset: Metode Garis Singgung",
    kind: "data",
    bullets: [
      "Garis singgung ditarik pada titik dengan slope paling curam — praktisnya, puncak DTG.",
      "Onset = perpotongan garis singgung dengan garis dasar sebelum tahap; endset = perpotongan dengan garis dasar sesudahnya.",
      "Cara ini menghasilkan angka yang sama setiap kali dibaca, berbeda dengan menaksir 'di mana kurva mulai membengkok'.",
      "Perhatikan konvensinya: aturan 2%/98% dari Δm memberi onset lebih awal dan endset lebih akhir daripada metode garis singgung.",
    ],
    script:
      "Untuk onset dan endset, jangan menaksir dari mata. Tarik garis singgung di titik paling curam tiap tahap — itu titik puncak DTG. Perpanjang sampai memotong garis dasar datar sebelum tahap: itu onset. Perpanjang lagi sampai memotong garis dasar sesudahnya: itu endset. Kenapa begitu? Karena kalau kalian menaksir dari mata, dua orang akan memberi dua angka berbeda. Metode garis singgung ini yang dipakai perangkat lunak instrumen, dan bisa diulang siapa pun dengan hasil sama. Tapi ada peringatan: angka onset dari metode ini akan berbeda dua puluh sampai tiga puluh derajat dari aturan dua persen yang biasa dipakai di laporan — jadi selalu sebutkan konvensinya.",
    pedagogicalNotes:
      "Turunan kedua tidak dipakai untuk onset: onset adalah perpotongan geometris, bukan titik nol turunan. Turunan kedua hanya membantu memastikan puncak DTG.",
    rubric: { code: "g.5", label: "Onset dan endset", points: 20 },
    embeddedComponent: "tga-tangent",
  },
  {
    id: "q17",
    chapter: "ready",
    chapterLabel: "TGA",
    label: "Al-Fum",
    title: "Termogram Al-Fum: Tiga Tahap",
    kind: "data",
    bullets: [
      "Tahap 1 di bawah 160 °C: air fisis dan air pori — Al-Fum bersifat hidrofilik karena gugus µ-OH.",
      "Tahap 2 sekitar 250–390 °C: dehidroksilasi gugus µ-OH jembatan Al–OH–Al.",
      "Tahap 3 di atas 400 °C: dekomposisi ligan fumarat dan kolapsnya kerangka — kehilangan massa terbesar.",
      "Sampel yang dikeringkan 100 °C vakum kehilangan tahap air, sehingga kurvanya langsung menuju dehidroksilasi.",
    ],
    script:
      "Untuk Al-Fum ada tiga tahap. Pertama air fisis di bawah 160 derajat — Al-Fum ini hidrofilik, justru karena gugus hidroksil jembatan. Kedua dehidroksilasi di sekitar 300 derajat. Ketiga dekomposisi fumarat di atas 400 derajat, dan ini yang terbesar. Kalau kalian mengeringkan sampel 100 derajat vakum, tahap air hampir hilang dan kurvanya langsung ke tahap kedua. Itu bukti bahwa tahap pertama memang air, bukan bagian kerangka.",
    pedagogicalNotes:
      "Suhu bergeser dengan laju pemanasan. Nilai di slide adalah model dari literatur Al-fumarat, bukan data terukur — minta siswa membaca kurva mereka sendiri.",
    rubric: { code: "g.4", label: "Interpretasi termogram", points: 25 },
    embeddedComponent: "tga-alfum",
  },
  {
    id: "q18",
    chapter: "ready",
    chapterLabel: "Simpulan & Laporan",
    label: "Jebakan TGA",
    title: "Dua Hal yang Sering Salah di TGA",
    kind: "closing",
    bullets: [
      "Kurva referensi bukan kurva kalian: laju pemanasan, gas purging, dan kadar air menggeser suhu setiap tahap.",
      "Massa sisa pada 900 °C adalah residu oksida, bukan produk — jangan menghitung rendemen dari TGA.",
      "Untuk laporan: sebutkan laju pemanasan, atmosfer, dan rentang suhu, karena tanpa itu angka tahap tidak bisa dibandingkan.",
      "Hubungkan dengan FTIR: FTIR menunjukkan fumarat masih ada, TGA menunjukkan sampai suhu berapa kerangka bertahan.",
    ],
    script:
      "Dua jebakan. Pertama, membandingkan kurva kalian dengan kurva literatur lalu menyimpulkan 'tahapnya bergeser berarti sampel saya berbeda'. Suhu tahap bergeser karena laju pemanasan dan kadar air. Yang dibandingkan adalah pola tahapnya, bukan angka mentahnya. Kedua, massa sisa di 900 derajat itu oksida, bukan produk — jangan dipakai menghitung rendemen. Di laporan, selalu tulis laju pemanasan dan atmosfer.",
    rubric: { code: "g.5", label: "Evaluasi TGA", points: 15 },
    embeddedComponent: "tga-traps",
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