import type { M3StageId, ReviewSlideId } from "@/lib/m3-presentation";

/**
 * Module 7 (BET) review deck.
 *
 * Content source: "Panduan Modul N2 sorpsi - mahasiswa" — Pengarahan Modul 7,
 * Praktikum KI3131 Kimia Unsur Golongan Utama, Semester 1 2026/2027. 25 slides.
 *
 * Same shape as the Module 6 deck: bullets for the student view, a `script` for
 * the teleprompter, optional pedagogical notes, and an optional embedded panel
 * keyed by `kind`. Nothing here states a number the guide does not state.
 */

export type M7EmbeddedComponentType =
  | "bet-isotherm"
  | "bet-pore"
  | "bet-iupac"
  | "bet-equation"
  | "bet-derivation"
  | "bet-given"
  | "bet-excel"
  | "bet-validity"
  | "bet-results"
  | "bet-traps"
  | "bet-report";

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
  embeddedComponent?: M7EmbeddedComponentType;
}

export const M7_REVIEW_DECK_SLIDES: readonly ReviewDeckSlide[] = [
  // ── BAB 1: TUJUAN ─────────────────────────────────────────────────────────
  {
    id: "r1",
    chapter: "brief",
    chapterLabel: "Tujuan",
    label: "Pembuka",
    title: "Karakterisasi dan Interpretasi Data BET",
    kind: "content",
    bullets: [
      "Modul 7 — adsorpsi-desorpsi N₂ dan metode BET.",
      "Praktikum KI3131 Kimia Unsur Golongan Utama, Semester 1 2026/2027.",
      "Pengukuran tidak dilakukan di praktikum: data isoterm diberikan, kalian yang mengolahnya.",
      "Contoh yang dipakai sepanjang sesi: isoterm N₂ Al-Fum 1:2.",
    ],
    script:
      "Selamat datang di sesi pembahasan Modul 7. Praktikumnya tidak meminta kalian menembak gas ke sampel — instrumennya dipegang laboran, dan yang diberikan ke kalian adalah data isoterm. Jadi seluruh nilai sesi ini ada di pengolahan dan interpretasi: apakah kalian bisa mengubah tabel tekanan dan volume menjadi satu angka luas permukaan, lalu menjelaskan apakah angka itu masuk akal untuk Al-Fum.",
    pedagogicalNotes:
      "Tegaskan sejak awal: nilai tidak diukur di meja praktikum. Mahasiswa yang menulis metode \"sampel diukur dengan gas sorption analyzer\" tanpa menyebut data diberikan akan kehilangan poin metode.",
    embeddedComponent: "bet-isotherm",
  },
  {
    id: "r2",
    chapter: "brief",
    chapterLabel: "Tujuan",
    label: "Tujuan",
    title: "Tiga Hal yang Harus Kalian Bisa di Akhir Sesi",
    kind: "content",
    bullets: [
      "Tujuan 1: memahami prinsip dasar adsorpsi gas pada permukaan padatan.",
      "Tujuan 2: mengolah data isoterm adsorpsi-desorpsi N₂ menjadi luas permukaan spesifik dengan metode BET.",
      "Tujuan 3: mengklasifikasikan isoterm dan menginterpretasi hasilnya untuk sampel Al-Fum.",
      "Keluaran: luas permukaan BET, tipe isoterm, dan simpulan valid atau tidaknya angka tersebut.",
    ],
    script:
      "Tiga tujuan ini yang menjadi kisi-kisi laporan kalian. Perhatikan bahwa tujuan kedua bukan \"menghitung\" saja — kata kuncinya mengolah, artinya tahu sel mana yang diisi, rumus apa yang dipakai, dan mengapa titiknya dibatasi. Tujuan ketiga yang paling sering dianggap remeh: mengklasifikasikan isoterm. Justru di situ kalian menunjukkan bahwa kalian paham struktur porinya, bukan sekadar menyalin angka.",
  },

  // ── BAB 2: PEMBAHASAN ─────────────────────────────────────────────────────
  {
    id: "r3",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Adsorpsi",
    title: "Fisisorpsi dan Kemisorpsi",
    kind: "content",
    bullets: [
      "Gaya: fisisorpsi Van der Waals; kemisorpsi ikatan kimia.",
      "Kalor adsorpsi: fisisorpsi sekitar 10–40 kJ/mol; kemisorpsi sekitar 40–400 kJ/mol.",
      "Lapisan: fisisorpsi monolayer dan multilayer; kemisorpsi monolayer.",
      "Reversibilitas: fisisorpsi reversibel; kemisorpsi sering ireversibel.",
      "Suhu: fisisorpsi rendah, dekat titik didih gas; kemisorpsi umumnya tinggi.",
      "BET didasarkan pada fisisorpsi, sehingga pengukuran dilakukan pada suhu rendah (77 K).",
    ],
    script:
      "Tabel ini yang harus kalian tulis di landasan teori, dan kalimat terakhirnya yang paling penting. BET itu model untuk lapisan berganda, dan lapisan berganda hanya masuk akal kalau adsorpsinya fisisorpsi. Karena itu pengukurannya sengaja dibuat dingin: 77 K, titik didih nitrogen. Kalau kalian menulis \"adsorpsi kimia\" di laporan, seluruh persamaan BET yang kalian pakai kehilangan alasannya.",
    pedagogicalNotes:
      "Jebakan: mahasiswa menyebut \"adsorpsi\" tanpa membedakan fisisorpsi/kemisorpsi, lalu bingung mengapa isotermnya berlapis. Lapisan berganda adalah tanda fisisorpsi.",
  },
  {
    id: "r4",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Prinsip pengukuran",
    title: "Bagaimana Instrumen Menghasilkan Isoterm",
    kind: "content",
    bullets: [
      "Degassing: vakum atau aliran gas inert, sekitar 150–300 °C, beberapa jam.",
      "Sampel didinginkan dalam N₂ cair (77 K).",
      "N₂ dialirkan bertahap dalam volume yang diketahui.",
      "Tekanan setimbang diukur pada setiap dosis.",
      "Volume teradsorpsi dihitung dari selisih gas yang dialirkan dan gas yang tersisa.",
      "Hasilnya isoterm: V terhadap P/P₀, untuk jalur adsorpsi lalu desorpsi.",
    ],
    script:
      "Enam langkah ini urutan metode yang kalian tulis, dan nomor satu yang paling sering dilupakan: degassing. Sampel yang masih menyimpan uap air atau pelarut akan menghabiskan sebagian N₂ untuk hal yang salah, sehingga volume teradsorpsi terlalu kecil dan luas permukaan yang dilaporkan ikut turun. Perhatikan juga langkah terakhir: yang direkam bukan satu kurva, tetapi dua — adsorpsi dan desorpsi. Selisih keduanya yang nanti kita baca sebagai histeresis.",
  },
  {
    id: "r5",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Mengapa 77 K",
    title: "Mengapa Nitrogen dan Mengapa 77 K",
    kind: "content",
    bullets: [
      "N₂ inert dan berinteraksi lemah dengan permukaan, sehingga yang terjadi fisisorpsi.",
      "Pada 77 K tekanan uap jenuh N₂ (P₀) sekitar 1 atm, sehingga P/P₀ dari 0 sampai 1 mudah diatur.",
      "Luas penampang satu molekul N₂ (A_cs) = 0,162 nm², luas yang ditutupi satu molekul dalam monolayer.",
      "Molekulnya relatif kecil, sehingga diharapkan dapat mengakses pori hingga ukuran terkecil.",
    ],
    script:
      "Tiga alasan ini yang membuat nitrogen menjadi standar. Yang pertama soal kimia: ia tidak bereaksi dengan permukaan, jadi yang terukur murni fisisorpsi. Yang kedua soal praktis: pada 77 K, P₀ kira-kira satu atmosfer, sehingga rentang P/P₀ nol sampai satu bisa dicapai dengan mudah. Yang ketiga soal geometri: 0,162 nanometer persegi itu luas satu molekul, dan seluruh perhitungan luas permukaan kalian berdiri di atas angka ini.",
    pedagogicalNotes:
      "A_cs adalah jembatan antara jumlah molekul dan luas. Jika mahasiswa menanyakan dari mana 0,162 nm² berasal, jawab jujur: itu nilai standar dari literatur untuk N₂ pada 77 K, dan itulah yang dipakai panduan.",
  },
  {
    id: "r6",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Bentuk isoterm",
    title: "Membaca Isoterm Adsorpsi-Desorpsi",
    kind: "content",
    bullets: [
      "Sumbu x: P/P₀; sumbu y: V teradsorpsi (cm³/g STP).",
      "P/P₀ rendah: pengisian mikropori dan pembentukan monolayer.",
      "P/P₀ menengah: lapisan berganda (multilayer).",
      "P/P₀ tinggi: kondensasi kapiler di mesopori.",
      "Histeresis: jalur desorpsi berbeda dengan jalur adsorpsi.",
    ],
    script:
      "Kurva ini dibaca dari kiri ke kanan, lalu kembali. Naik tajam di kiri itu mikropori yang terisi lebih dulu karena dindingnya berdekatan. Bagian tengah yang landai adalah lapisan kedua dan seterusnya. Naik tajam di kanan itu kondensasi kapiler di mesopori. Dan ketika jalur turun tidak mengikuti jalur naik, itu histeresis — gas yang sudah terkondensasi di pori lebih sulit keluar daripada masuk, jadi pada tekanan yang sama volume desorpsi lebih besar.",
    pedagogicalNotes:
      "Penting: histeresis bukan artefak. Justru ia bukti adanya mesopori. Mahasiswa yang menyebut histeresis \"kesalahan pengukuran\" sedang membuang informasi struktur pori.",
    embeddedComponent: "bet-isotherm",
  },
  {
    id: "r7",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Klasifikasi IUPAC",
    title: "Enam Tipe Isoterm IUPAC",
    kind: "content",
    bullets: [
      "Tipe I: naik tajam di P/P₀ rendah lalu mendatar — mikropori (< 2 nm).",
      "Tipe II: berbentuk S tanpa histeresis — tidak berpori atau makropori.",
      "Tipe III: cekung terhadap sumbu P/P₀ — interaksi adsorbat-adsorben lemah.",
      "Tipe IV: seperti II tetapi ada histeresis — mesopori (2–50 nm).",
      "Tipe V: seperti III tetapi ada histeresis — mesopori dengan interaksi lemah.",
      "Tipe VI: berundak — permukaan seragam, adsorpsi lapis demi lapis.",
    ],
    script:
      "Enam tipe ini yang kalian sebut namanya di laporan, dan penentuannya bukan hafalan: lihat bentuknya di P/P₀ rendah, lalu lihat apakah ada histeresis. Serapan besar di awal berarti mikropori. Histeresis berarti mesopori. Tipe VI jarang muncul di sampel seperti Al-Fum, tetapi harus kalian kenali supaya tidak salah menempelkan label.",
    embeddedComponent: "bet-iupac",
  },
  {
    id: "r8",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Persamaan BET",
    title: "Persamaan BET dan Asumsinya",
    kind: "content",
    bullets: [
      "1 / [W(P₀/P − 1)] = 1/(Wm·C) + [(C − 1)/(Wm·C)] · (P/P₀)",
      "W: massa N₂ teradsorpsi; Wm: massa N₂ untuk satu monolayer.",
      "C: konstanta BET, mencerminkan energi adsorpsi lapisan pertama.",
      "Asumsi: permukaan homogen; kalor lapisan pertama berbeda dari lapisan berikutnya.",
      "Asumsi: tidak ada interaksi antarmolekul dalam satu lapisan; lapisan berganda menjadi tak terhingga pada P/P₀ = 1.",
      "Linear pada P/P₀ sekitar 0,05–0,35; instrumen yang dipakai memakai 0,05–0,30.",
    ],
    script:
      "Persamaan ini terlihat berat, tetapi strukturnya sederhana: ruas kiri adalah y, P/P₀ adalah x, sehingga yang kalian gambar adalah garis lurus. Dari garis itu kalian ambil slope dan intersep, dan dari keduanya semua besaran lain muncul. Yang perlu kalian hafal bukan hanya rumusnya, tetapi batas berlakunya: linear hanya pada 0,05 sampai 0,35, dan instrumen kita memakai 0,05 sampai 0,30. Di luar jendela itu asumsi BET sudah tidak terpenuhi.",
    pedagogicalNotes:
      "Tekankan bahwa asumsi \"permukaan homogen\" adalah kelemahan BET yang sebenarnya, bukan detail sepele: Al-Fum punya mikropori dan mesopori sekaligus, jadi asumsi ini dilanggar — itulah sebabnya C bisa negatif.",
    embeddedComponent: "bet-equation",
  },
  {
    id: "r9",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Dari garis ke luas",
    title: "Dari Kurva BET ke Luas Permukaan",
    kind: "content",
    bullets: [
      "Slope (b) = (C − 1)/(Wm·C); intersep (a) = 1/(Wm·C).",
      "Wm = 1/(a + b); C = b/a + 1.",
      "S (luas permukaan spesifik) = Wm · N · A_cs / M.",
      "Jika V dalam cm³/g STP: Vm = 1/(a + b) dan S = Vm · N · A_cs / 22414.",
      "Hasil basis volume dan basis massa harus sama — itu pemeriksaan mandiri kalian.",
    ],
    script:
      "Perhatikan urutannya: slope dan intersep dulu, baru Wm, baru C, baru luas. Jangan pernah menghitung luas langsung dari slope. Dan perhatikan bahwa rumus luas memuat volume molar 22414, karena V kalian dalam cm³ per gram STP, bukan dalam gram. Karena itu panduan meminta kalian mengerjakan dua basis sekaligus: kalau basis volume dan basis massa menghasilkan angka berbeda, ada kesalahan sel di salah satunya.",
    embeddedComponent: "bet-derivation",
  },

  // ── BAB 3: PENGOLAHAN DATA ────────────────────────────────────────────────
  {
    id: "r10",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Data yang diberikan",
    title: "Data yang Kalian Terima",
    kind: "data",
    bullets: [
      "Empat kolom: P/P₀ adsorpsi, V adsorpsi, P/P₀ desorpsi, V desorpsi.",
      "P/P₀ tanpa satuan; V dalam cm³/g STP.",
      "Jumlah baris adsorpsi dan desorpsi berbeda — itu normal, bukan data rusak.",
      "Jendela BET Al-Fum 1:2: 7 titik, P/P₀ 0,056–0,289.",
      "Jendela BET Al-Fum 1:3: 7 titik, P/P₀ 0,060–0,289.",
      "Jendela BET Al-Fum 1:4: 6 titik, P/P₀ 0,081–0,283.",
    ],
    script:
      "Perhatikan dua tabel di layar. Yang kiri adalah bentuk data mentahnya, yang kanan adalah jendela BET untuk masing-masing sampel. Kenapa jumlah titiknya berbeda, enam atau tujuh? Karena pemilihan titik bergantung pada di mana kurva masih linear — dan itu berbeda tiap sampel. Jadi kalau kalian memakai tujuh titik untuk 1:4, kalian bukan sedang teliti, kalian sedang keluar dari jendela yang sah.",
    pedagogicalNotes:
      "Kesalahan paling umum: menyalin jumlah titik milik kelompok lain. Tanyakan sampelnya dulu, baru tentukan jendelanya.",
    embeddedComponent: "bet-given",
  },
  {
    id: "r11",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Excel 1",
    title: "Langkah 1 — Menyiapkan Data di Excel",
    kind: "data",
    bullets: [
      "Konstanta diletakkan di A4:B9: kolom A nama besaran, kolom B nilainya.",
      "B4 = 28,0134 (M N₂); B5 = 22414 (volume molar STP); B6 = 6,0221E+23 (N).",
      "B7 = 1,62E-19 (A_cs); B8 = 0,05 (batas bawah); B9 = 0,3 (batas atas).",
      "Baris 14 menjadi judul kolom: A = P/P₀ adsorpsi, B = V adsorpsi, D = P/P₀ desorpsi, E = V desorpsi.",
      "Data adsorpsi ditempel di A15:B, data desorpsi di D15:E.",
      "Pastikan angka berformat angka, bukan teks, dan tidak ada sel kosong di tengah data.",
    ],
    script:
      "Enam konstanta ini harus berada di sel yang persis sama, karena rumus berikutnya merujuk ke sel tersebut dengan referensi absolut. Kalau kalian menggeser tabelnya, semua rumus di slide berikutnya akan menunjuk ke tempat yang salah. Dan satu hal yang sering merusak semuanya: angka hasil salin dari PDF kadang masuk sebagai teks. Kalau sel rata kiri, itu teks, dan Excel akan mengabaikannya di perhitungan.",
    embeddedComponent: "bet-excel",
  },
  {
    id: "r12",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Excel 2",
    title: "Langkah 2 — Plot Isoterm",
    kind: "data",
    bullets: [
      "Blok A15:B (adsorpsi), lalu Insert > Charts > Scatter with Straight Lines and Markers.",
      "Tambahkan seri desorpsi: Select Data > Add, X = D15 sampai baris terakhir, Y = E15 sampai baris terakhir.",
      "Data desorpsi mulai dari titik yang sama dengan adsorpsi terakhir, sehingga kurva menutup sendiri.",
      "Sumbu X: minimum 0, maksimum 1,05 — ada titik P/P₀ sedikit di atas 1.",
      "Sumbu Y: minimum 0; judul sumbu X = P/P₀ dan Y = V teradsorpsi (cm³/g STP).",
      "Hapus judul grafik bawaan yang menimpa plot dan hapus gridline vertikal.",
    ],
    script:
      "Dua seri, satu grafik. Kalau kalian hanya memplot adsorpsi, kalian kehilangan seluruh informasi histeresis. Perhatikan juga mengapa sumbu X berhenti di 1,05 dan bukan 1:00: ada satu titik P/P₀ yang sedikit di atas satu, dan kalau sumbunya dipotong di 1, titik itu akan terlihat seperti kesalahan. Dan tolong, jangan biarkan judul grafik bawaan menimpa kurvanya — itu hal kecil yang langsung terlihat di laporan.",
  },
  {
    id: "r13",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Excel 3",
    title: "Langkah 3 — Menyiapkan Data BET",
    kind: "data",
    bullets: [
      "Hanya titik adsorpsi dengan P/P₀ antara 0,05 dan 0,30 yang dipakai.",
      "Basis volume: salin x ke H16 dan V ke I16; J16 = H16/(I16*(1−H16)); tarik sampai titik terakhir.",
      "Basis massa: salin x ke M16 dan V ke N16.",
      "O16 (W, g/g) = N16/$B$5*$B$4; P16 = M16/(O16*(1−M16)); tarik sampai titik terakhir.",
      "y = x/[V(1−x)] untuk basis volume dan y = x/[W(1−x)] untuk basis massa.",
      "Jangan pernah memakai titik desorpsi untuk BET.",
    ],
    script:
      "Dua basis, dua kolom y, satu tujuan: saling memeriksa. Basis volume memakai V apa adanya, basis massa mengubahnya dulu menjadi gram N₂ per gram sampel lewat B5 dan B4. Kalau kalian hanya mengerjakan satu basis, kalian kehilangan pemeriksaan gratis yang disediakan panduan. Dan yang paling fatal di langkah ini: memakai titik desorpsi. Persamaan BET diturunkan untuk jalur adsorpsi.",
    pedagogicalNotes:
      "Tanda dolar pada $B$5 dan $B$4 bukan gaya-gayaan: itu yang menjaga konstanta tetap saat rumus ditarik ke bawah. Mahasiswa yang menulis B5 tanpa dolar akan mendapat hasil berbeda di tiap baris.",
  },
  {
    id: "r14",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Excel 4",
    title: "Langkah 4 — Kurva BET dan Regresi",
    kind: "data",
    bullets: [
      "Blok H (x) dan J (y) titik BET, lalu Insert > Scatter (hanya titik).",
      "Klik titik data > Chart Elements > Trendline > Linear.",
      "Judul sumbu: P/P₀ dan 1/[V(P₀/P − 1)].",
      "I24 = COUNT(H16:H22); I25 = SLOPE(J16:J22,H16:H22); I26 = INTERCEPT(J16:J22,H16:H22).",
      "I27 = RSQ(J16:J22,H16:H22); I28 = CORREL(H16:H22,J16:J22).",
      "Cocokkan slope dan intersep dari fungsi Excel dengan persamaan trendline pada grafik.",
    ],
    script:
      "Kenapa harus dicocokkan? Karena trendline dan fungsi SLOPE menghitung dari data yang sama, jadi kalau angkanya berbeda, ada blok sel yang salah. Ini pemeriksaan murah yang jarang dilakukan dan sering menyelamatkan laporan. Ganti angka 22 pada rentang dengan baris terakhir titik BET kalian — untuk sampel dengan enam titik, rentangnya berakhir di 21.",
  },
  {
    id: "r15",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Excel 5",
    title: "Langkah 5 — Menghitung Vm, C, dan Luas Permukaan",
    kind: "data",
    bullets: [
      "I29 (Vm, cm³/g STP) = 1/(I25+I26).",
      "I30 (C) = I25/I26+1.",
      "I31 (faktor luas, m² per cm³ STP) = B6*B7/B5.",
      "I32 (S BET, m²/g) = I29*I31.",
      "Pengecekan basis massa: Wm = 1/(N25+N26), C = N25/N26+1, faktor luas = B6*B7/B4, S = N29*N31.",
      "Nilai S dari kedua basis harus sama.",
    ],
    script:
      "Empat sel, empat rumus, selesai. Perhatikan bahwa faktor luas memakai B5 untuk basis volume dan B4 untuk basis massa — itu satu-satunya tempat kedua basis berbeda. Kalau hasil S kalian berbeda jauh antar basis, jangan lanjut menulis laporan: cari sel yang salah dulu.",
    embeddedComponent: "bet-derivation",
  },
  {
    id: "r16",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Excel 6",
    title: "Langkah 6 — Memeriksa Validitas",
    kind: "data",
    bullets: [
      "R² dan r mendekati 1 — syarat perlu, bukan syarat cukup.",
      "Intersep (a) harus positif, sehingga C = b/a + 1 juga positif.",
      "I33 = IF(I30<=0,\"C negatif, BET tidak valid\",\"C positif, BET dapat dipakai\").",
      "Jika C negatif: luas permukaan tetap dihitung dan dicatat, tetapi dilaporkan tidak valid.",
      "Jelaskan kemungkinan penyebab C negatif, jangan hanya menulis \"tidak valid\".",
    ],
    script:
      "Ini slide terpenting di modul ini. R² 0,995 terlihat sempurna, tetapi intersepnya negatif, sehingga C negatif, sehingga BET-nya tidak sah. Kalau kalian berhenti di R², kalian akan melaporkan luas permukaan yang tidak boleh dipakai. Dan ingat: angkanya tetap dicatat — yang berubah adalah statusnya, bukan hasil hitungnya. Yang dinilai adalah apakah kalian berani menyatakan hasilnya tidak valid dan bisa menjelaskan sebabnya.",
    pedagogicalNotes:
      "C negatif bukan kesalahan hitung. Ia tanda bahwa model BET tidak cocok untuk sampel ini pada jendela tersebut — biasanya karena sampel mikropori kuat dan ada kontribusi mesopori.",
    embeddedComponent: "bet-validity",
  },
  {
    id: "r17",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Hasil yang diharapkan",
    title: "Bentuk Akhir yang Diharapkan",
    kind: "data",
    bullets: [
      "Satu grafik isoterm adsorpsi-desorpsi dengan loop tertutup.",
      "Satu grafik kurva BET dengan garis regresi linear.",
      "Kedua grafik memakai data sampel yang sama, bukan sampel berbeda.",
      "Contoh sepanjang sesi: Al-Fum 1:2.",
    ],
    script:
      "Dua grafik ini yang masuk laporan. Yang kiri menunjukkan struktur pori, yang kanan menunjukkan kualitas regresi BET. Jangan mencampur sampel: kurva BET harus berasal dari data isoterm yang sama, kalau tidak, kesimpulan kalian tentang C tidak ada hubungannya dengan bentuk kurvanya.",
    embeddedComponent: "bet-isotherm",
  },
  {
    id: "r18",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Hasil Al-Fum 1:2",
    title: "Hasil yang Diharapkan: Al-Fum 1:2",
    kind: "data",
    bullets: [
      "Jumlah titik BET 7; slope 0,005695; intersep −0,000113; R² 0,9953.",
      "Vm 179,16 cm³/g STP; C −49,19; S BET 779,8 m²/g.",
      "Status: C negatif, BET tidak valid.",
      "Yang dibahas: serapan awal besar menunjukkan mikropori.",
      "Histeresis dan naik tajam di P/P₀ tinggi menunjukkan mesopori.",
    ],
    script:
      "Ini angka acuan untuk 1:2, dan perhatikan kombinasinya: R² tinggi, tetapi intersep negatif. Jadi kalimat laporan yang benar bukan \"luas permukaan 779,8 m²/g\", melainkan \"diperoleh 779,8 m²/g, namun C negatif sehingga nilai BET tidak valid\". Dua kalimat itu nilainya jauh berbeda di kisi-kisi.",
    embeddedComponent: "bet-results",
  },
{
    id: "r19",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Grafik Al-Fum 1:3",
    title: "Grafik Acuan: Al-Fum 1:3",
    kind: "data",
    bullets: [
      "Isoterm adsorpsi-desorpsi dengan loop tertutup.",
      "Kurva BET dengan garis regresi linear.",
      "Serapan awal 208 cm³/g pada P/P₀ 0,016 — mikropori terisi sangat dini.",
      "Histeresis kecil, lalu naik tajam di P/P₀ tinggi.",
    ],
    script:
      "Bandingkan bentuk kurva ini dengan 1:2. Serapan awalnya lebih besar, 208 cm³/g pada P/P₀ hanya 0,016. Artinya mikroporinya lebih agresif mengisi pada tekanan sangat rendah. Tetapi perhatikan: histeresisnya justru lebih kecil. Jadi dua sampel ini punya karakter pori yang berbeda, walaupun keduanya sama-sama Al-Fum.",
    embeddedComponent: "bet-isotherm",
  },
  {
    id: "r20",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Hasil Al-Fum 1:3",
    title: "Hasil yang Diharapkan: Al-Fum 1:3",
    kind: "data",
    bullets: [
      "Jumlah titik BET 7; slope 0,006539; intersep −0,000146; R² 0,9951.",
      "Vm 156,40 cm³/g STP; C −43,92; S BET 680,7 m²/g.",
      "Status: C negatif, BET tidak valid.",
      "Yang dibahas: serapan awal besar (208 cm³/g pada P/P₀ 0,016) menunjukkan mikropori.",
      "Histeresis kecil dengan kenaikan tajam di P/P₀ tinggi menunjukkan mesopori.",
    ],
    script:
      "Sama seperti 1:2: R² bagus, intersep negatif, C negatif, tidak valid. Perhatikan kecenderungannya dari 1:2 ke 1:3 — luas permukaan turun dari 779,8 ke 680,7 meter persegi per gram. Nanti di 1:4 turun lagi. Pola ini yang sebaiknya kalian bahas, karena ia menghubungkan rasio sintesis dengan struktur pori.",
    embeddedComponent: "bet-results",
  },
  {
    id: "r21",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Grafik Al-Fum 1:4",
    title: "Grafik Acuan: Al-Fum 1:4",
    kind: "data",
    bullets: [
      "Isoterm adsorpsi-desorpsi dengan loop tertutup.",
      "Kurva BET dengan garis regresi linear.",
      "Serapan awal lebih kecil: 142 cm³/g pada P/P₀ 0,032.",
      "Histeresis jelas mulai P/P₀ sekitar 0,8.",
    ],
    script:
      "Sampel 1:4 ini yang paling berbeda. Serapan awalnya paling kecil, dan histeresisnya paling jelas — mulai sekitar 0,8. Artinya pada rasio ini mesoporinya lebih dominan dibanding dua sampel sebelumnya. Perhatikan juga bahwa titik BET-nya hanya enam, bukan tujuh, karena jendela 0,05 sampai 0,30 hanya memuat enam titik yang sah.",
    embeddedComponent: "bet-isotherm",
  },
  {
    id: "r22",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Hasil Al-Fum 1:4",
    title: "Hasil yang Diharapkan: Al-Fum 1:4",
    kind: "data",
    bullets: [
      "Jumlah titik BET 6; slope 0,009614; intersep −0,000215; R² 0,9971.",
      "Vm 106,39 cm³/g STP; C −43,72; S BET 463,1 m²/g.",
      "Status: C negatif, BET tidak valid.",
      "S BET paling kecil dari ketiga sampel.",
      "Histeresis jelas mulai P/P₀ sekitar 0,8 menunjukkan mesopori.",
    ],
    script:
      "R² paling tinggi dari ketiganya, 0,9971, dan tetap tidak valid. Ini bukti bahwa R² tinggi tidak menyelamatkan BET. Kalau ada satu kalimat yang harus kalian bawa pulang dari modul ini, itu kalimatnya.",
    embeddedComponent: "bet-results",
  },

  // ── BAB 4: SIMPULAN & LAPORAN ─────────────────────────────────────────────
  {
    id: "r23",
    chapter: "ready",
    chapterLabel: "Simpulan & Laporan",
    label: "Jebakan",
    title: "Hal yang Perlu Diperhatikan",
    kind: "closing",
    bullets: [
      "Pakai titik adsorpsi untuk BET, bukan titik desorpsi.",
      "Gunakan P/P₀, bukan tekanan P; V dalam cm³/g STP.",
      "Jumlah titik BET berbeda tiap sampel (6 atau 7).",
      "Jangan memotong atau menambah titik hanya agar R² terlihat lebih baik.",
      "C negatif dilaporkan sebagai tidak valid, bukan dihapus.",
    ],
    script:
      "Tiga poin pertama ini yang paling sering salah, dan semuanya sudah muncul di panduan. Yang keempat tidak tertulis di panduan tetapi perlu saya tegaskan: memilih titik untuk memperbaiki R² itu bukan analisis, itu manipulasi data. Dan yang kelima, mengulang lagi: C negatif bukan alasan untuk membuang hasil.",
    embeddedComponent: "bet-traps",
  },
  {
    id: "r24",
    chapter: "ready",
    chapterLabel: "Simpulan & Laporan",
    label: "Menyimpulkan",
    title: "Tiga Pertanyaan Penutup",
    kind: "closing",
    bullets: [
      "Termasuk tipe isoterm apa sampel Anda, dan bagaimana karakter porinya?",
      "Apakah ada histeresis? Apa penyebabnya?",
      "Apakah C positif? Apakah luas permukaan BET valid?",
    ],
    script:
      "Tiga pertanyaan ini dijawab dalam bentuk klaim, bukti, alasan — bukan paragraf bebas. Untuk yang pertama, sebut tipenya lalu tunjukkan buktinya di kurva. Untuk yang kedua, jangan hanya menjawab \"ada\"; jelaskan bahwa kondensasi kapiler di mesopori membuat jalur desorpsi tertinggal. Untuk yang ketiga, jawab dengan angka C dan statusnya.",
    pedagogicalNotes:
      "Jawaban yang baik menyebut angka: \"C = −49,19, sehingga BET tidak valid\". Jawaban yang lemah berbunyi \"secara umum hasilnya cukup baik\".",
    embeddedComponent: "bet-report",
  },
  {
    id: "r25",
    chapter: "ready",
    chapterLabel: "Simpulan & Laporan",
    label: "Kisi-kisi laporan",
    title: "Yang Dilaporkan",
    kind: "closing",
    bullets: [
      "Isoterm adsorpsi-desorpsi N₂ sampel (data diberikan).",
      "Klasifikasi tipe isoterm menurut IUPAC dan kaitannya dengan struktur pori.",
      "Penentuan luas permukaan spesifik dari kurva BET.",
      "Analisis nilai C dan maknanya terhadap interaksi adsorbat-adsorben.",
      "Kaitan luas permukaan dengan sifat Al-Fum sebagai adsorben atau katalis.",
    ],
    script:
      "Ini kisi-kisi laporannya, lima butir. Perhatikan butir terakhir: kalian diminta menghubungkan luas permukaan dengan fungsi material. Itu bagian yang membedakan laporan yang hanya melaporkan angka dengan laporan yang memahami mengapa angka itu penting. Al-Fum dengan luas permukaan besar punya lebih banyak situs untuk adsorpsi atau katalisis — tetapi karena nilai BET-nya tidak valid, kalian harus menyampaikan angka itu sebagai indikasi, bukan sebagai kepastian.",
    pedagogicalNotes:
      "Tutup sesi dengan mengulang: angka tetap dilaporkan, status validitas tetap dinyatakan. Dua hal itu tidak saling menggantikan.",
    embeddedComponent: "bet-report",
  },
];

export const M7_REVIEW_DECK_SLIDE_BY_ID: Readonly<Record<string, ReviewDeckSlide>> = Object.freeze(
  Object.fromEntries(M7_REVIEW_DECK_SLIDES.map((s) => [s.id, s]))
);

export const TOTAL_M7_REVIEW_DECK_SLIDES = M7_REVIEW_DECK_SLIDES.length;

export const m7DeckSlideIndex = (id: string): number =>
  M7_REVIEW_DECK_SLIDES.findIndex((s) => s.id === id);
