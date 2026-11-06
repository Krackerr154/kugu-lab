import type { M3StageId, ReviewSlideId } from "@/lib/m3-presentation";
import { M5_COMMON_TRAPS, M5_REPORT_GRID } from "./m5-xrd.ts";

/**
 * Module 5 (XRD) review deck.
 *
 * Content source: "Pengarahan Modul 5 — Pengolahan dan Analisis Data XRD dengan
 * OriginPro", Praktikum KI3131 Kimia Unsur Golongan Utama, Semester 1 2026/2027.
 * 20 slides.
 */

export type M5EmbeddedComponentType =
  | "xrd-lattice"
  | "xrd-bragg"
  | "xrd-anatomy"
  | "xrd-reflections"
  | "xrd-samples"
  | "xrd-scherrer"
  | "xrd-traps"
  | "xrd-report";

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
  embeddedComponent?: M5EmbeddedComponentType;
}

export const M5_REVIEW_DECK_SLIDES: readonly ReviewDeckSlide[] = [
  // ── BAB 1: TUJUAN PRAKTIKUM ───────────────────────────────────────────────
  {
    id: "s1",
    chapter: "brief",
    chapterLabel: "Tujuan Praktikum",
    label: "Pembuka",
    title: "Pengolahan & Analisis Data XRD dengan OriginPro",
    kind: "content",
    bullets: [
      "Fokus Karakterisasi: Difraksi sinar-X serbuk (PXRD) kerangka berpori Aluminum Fumarate (Al-Fum MOF).",
      "Variasi Sampel: Tiga rasio molar prekursor Al:Asam Fumarat (1:2, 1:3, 1:4) dibandingkan terhadap acuan CCDC 1051975.",
      "Integrasi Software: Visualisasi dan integrasi data via OriginPro serta simulasi pola difraksi CIF via VESTA.",
      "Keluaran Utama: Indexing bidang kristal (hkl), derajat kristalinitas relatif, dan ukuran kristalit via Scherrer.",
    ],
    script:
      "Selamat datang di sesi review Modul 5 Praktikum Kimia Unsur Golongan Utama. Hari ini kita akan membedah difraksi sinar-X serbuk untuk material Al-Fum MOF, membandingkan tiga rasio sintesis terhadap standar CIF CCDC 1051975 menggunakan perangkat lunak OriginPro dan VESTA.",
    pedagogicalNotes:
      "Tekankan bahwa praktikan menerima data riil hasil instrumen, bukan data teoretis sempurna, sehingga ada faktor pergeseran instrumen.",
    embeddedComponent: "xrd-lattice",
  },
  {
    id: "s2",
    chapter: "brief",
    chapterLabel: "Tujuan Praktikum",
    label: "Capaian",
    title: "Capaian Pembelajaran & Target Analisis",
    kind: "content",
    bullets: [
      "Pemahaman Teoretis: Memahami prinsip difraksi kisi kristal, Hukum Bragg, dan perbedaan fase kristalin vs amorf.",
      "Keterampilan Komputasi: Menguasai alur kerja impor data, penataan grafik multi-layer, dan normalisasi kurva di OriginPro.",
      "Indexing Difraksi: Mencocokkan posisi sudut puncak terukur terhadap hasil simulasi kristalografi VESTA.",
      "Kuantifikasi Material: Menghitung persentase kristalinitas sampel dan ukuran kristalit rata-rata dengan persamaan Scherrer.",
    ],
    script:
      "Ada empat target utama yang harus dikuasai setiap mahasiswa: memahami dasar fisis difraksi kisi, terampil mengolah kurva bertumpuk dan normalisasi di OriginPro, memetakan bidang hkl dengan VESTA, serta melakukan perhitungan kuantitatif kristalinitas dan ukuran kristalit.",
    pedagogicalNotes:
      "Praktikan sering kali hanya menumpuk grafik tanpa memahami arti fisis di balik puncak-puncaknya.",
    embeddedComponent: "xrd-anatomy",
  },
  {
    id: "s3",
    chapter: "brief",
    chapterLabel: "Tujuan Praktikum",
    label: "Dataset",
    title: "Struktur Dataset & Format Berkas Praktikum",
    kind: "data",
    bullets: [
      "Berkas Eksperimen: Tiga file Excel (.xlsx) untuk sampel sintesis rasio 1:2, 1:3, dan 1:4.",
      "Format Sumbu: Kolom A berisi sudut difraksi 2θ (°); Kolom B berisi intensitas hamburan (a.u. / counts).",
      "Parameter Pengukuran: Radiasi Cu Kα1 (λ = 1,54059 Å), rentang sudut 2θ = 5,00° hingga 80,00° dengan step size 0,05° (1501 titik).",
      "Berkas Acuan Kristalografi: File CIF CCDC 1051975 untuk struktur kristal Aluminum Fumarate baku.",
    ],
    script:
      "Setiap kelompok menerima tiga file Excel hasil pengukuran difraktometer dengan 1501 titik data sudut 5 sampai 80 derajat, serta file CIF Al-Fum CCDC 1051975 sebagai acuan standar pembanding.",
    pedagogicalNotes:
      "Ingatkan mahasiswa untuk memastikan pengaturan regional desimal di Excel dan OriginPro (koma vs titik) agar kolom angka terbaca benar.",
    embeddedComponent: "xrd-samples",
  },

  // ── BAB 2: PEMBAHASAN TEORI DIFRAKSI ──────────────────────────────────────
  {
    id: "s4",
    chapter: "understand",
    chapterLabel: "Prinsip Difraksi",
    label: "Hukum Bragg",
    title: "Hukum Bragg & Kondisi Interferensi Konstruktif",
    kind: "content",
    bullets: [
      "Persamaan Bragg: nλ = 2d sin θ, menghubungkan panjang gelombang sinar-X (λ = 1,54059 Å) dengan jarak antarbidang kisi d.",
      "Beda Lintasan Fisis: Gelombang yang dihamburkan oleh bidang kristal paralel bersebelahan mengalami beda jarak ΔL = 2d sin θ.",
      "Interferensi Konstruktif: Puncak difraksi tajam hanya terbentuk jika beda lintasan tepat merupakan kelipatan bulat dari λ.",
      "Sudut Bragg: Sudut datang dan sudut pantul bernilai θ, sehingga sudut hamburan total yang terbaca detektor instrumen adalah 2θ.",
    ],
    script:
      "Hukum Bragg n-lambda sama dengan 2d sin-teta adalah fondasi analisis struktur kristal. Sinar-X monokromatis yang dipantulkan oleh atom-atom pada bidang kisi hanya akan saling menguatkan dan membentuk puncak jika beda lintasannya tepat kelipatan panjang gelombang.",
    pedagogicalNotes:
      "Gunakan visual sandbox interaktif di samping untuk menunjukkan pergeseran berkas pantul saat sudut teta diubah.",
    embeddedComponent: "xrd-bragg",
  },
  {
    id: "s5",
    chapter: "understand",
    chapterLabel: "Prinsip Difraksi",
    label: "Orde Struktur",
    title: "Kontinum Orde: Kristalin, Semikristalin, & Amorf",
    kind: "content",
    bullets: [
      "Fase Kristalin Sempurna: Memiliki keteraturan kisi periodik jarak jauh (long-range order), menghasilkan puncak Bragg tajam.",
      "Fase Amorf Murni: Hanya memiliki keteraturan jarak pendek (short-range order); menghasilkan gundukan lebar (halo amorf) di rentang 15°–35° 2θ.",
      "Fase Semikristalin: Memadukan domain kristalin di dalam matriks amorf; difraktogram menampilkan puncak tajam di atas bukit latar belakang amorf.",
      "Kaitan Sintesis MOF: Rasio reaktan yang tidak optimal menghasilkan sisa reaktan amorf atau fasa tak teratur yang menaikkan latar belakang halo.",
    ],
    script:
      "Tingkat keteraturan atom di dalam padatan menentukan bentuk difraktogram. Struktur kristalin menghasilkan puncak-puncak tajam, sedangkan fase amorf hanya memberikan bukit lebar akibat hamburan difus tanpa periodisitas kisi.",
    pedagogicalNotes:
      "Tunjukkan transisi slider kristalinitas: saat keteraturan menurun, puncak Bragg menyusut sementara halo amorf melebar.",
    embeddedComponent: "xrd-lattice",
  },
  {
    id: "s6",
    chapter: "understand",
    chapterLabel: "Prinsip Difraksi",
    label: "Anatomi Difraktogram",
    title: "Empat Informasi Kunci dalam Difraktogram XRD",
    kind: "content",
    bullets: [
      "1. Posisi Puncak (2θ): Karakteristik kisi kristal; menentukan jarak antarbidang d dan indeks Miller (hkl) melalui Hukum Bragg.",
      "2. Intensitas Puncak (I): Menandakan populasi bidang kristal dan faktor struktur kisi |F_hkl|² (kerapatan elektron bidang).",
      "3. Lebar Puncak (FWHM β): Merefleksikan ukuran rata-rata domain kristalit dan tingkat regangan mikro (persamaan Scherrer).",
      "4. Luas Puncak & Halo Amorf: Perbandingan luas puncak Bragg kristalin terhadap luas total difraktogram menentukan derajat kristalinitas.",
    ],
    script:
      "Ada empat parameter kunci dari difraktogram: posisi 2-teta menentukan parameter sel dan indeks hkl, intensitas menandakan faktor struktur, lebar FWHM mengukur dimensi kristalit, dan luas relatif menentukan derajat kristalinitas sampel.",
    pedagogicalNotes:
      "Arahkan perhatian mahasiswa pada visual anatomi: perhatikan bahwa luas puncak kristalin dihitung ketat di atas garis dasar halo amorf.",
    embeddedComponent: "xrd-anatomy",
  },
  {
    id: "s7",
    chapter: "understand",
    chapterLabel: "Prinsip Difraksi",
    label: "Derajat Kristalinitas",
    title: "Konsep & Penentuan Derajat Kristalinitas",
    kind: "content",
    bullets: [
      "Definisi Fisis: Fraksi massa sampel yang berada dalam domain kisi kristal periodik dibandingkan dengan massa total sampel.",
      "Prinsip Integrasi Luas: % Kristalinitas = (A_kristalin / A_total) × 100%, di mana A_kristalin diintegrasikan di atas garis dasar halo amorf.",
      "Luas Total Difraktogram: Dihitung dengan mengintegrasikan seluruh kurva difraksi dari 2θ = 5° hingga 80° terhadap baseline y = 0.",
      "Kristalinitas Relatif Praktikum: Sampel sintesis rasio 1:2 memiliki profil paling teratur dan dijadikan benchmark kristalinitas 100,0%.",
    ],
    script:
      "Derajat kristalinitas mengukur seberapa banyak material kita yang benar-benar tersusun rapi membentuk kristal. Dalam modul ini, rasio sintesis 1:2 memiliki keteraturan tertinggi dan ditetapkan sebagai acuan kristalinitas relatif 100 persen.",
    pedagogicalNotes:
      "Tegaskan perbedaan antara kristalinitas absolut (metode Hermans-Weidinger) dan kristalinitas relatif terhadap sampel acuan terbaik.",
    embeddedComponent: "xrd-samples",
  },
  {
    id: "s8",
    chapter: "understand",
    chapterLabel: "Prinsip Difraksi",
    label: "Persamaan Scherrer",
    title: "Penentuan Ukuran Kristalit: Persamaan Scherrer",
    kind: "content",
    bullets: [
      "Persamaan Dasar: D = (K · λ) / (β · cos θ), di mana D adalah ukuran kristalit rata-rata dalam satuan nanometer (nm).",
      "Konstanta Bentuk K: Faktor bentuk kristal bernilai 0,9 untuk kristalit serbuk mendekati bentuk kubus atau bola.",
      "Panjang Gelombang λ: Menggunakan sinar Cu Kα1 dengan nilai λ = 0,154059 nm (atau 1,54059 Å).",
      "Koreksi Satuan Kritis: FWHM β wajib dalam satuan radian (rad = deg × π / 180), dan sudut θ adalah setengah dari 2θ (θ = 2θ / 2).",
    ],
    script:
      "Persamaan Scherrer menghubungkan pelebaran puncak difraksi dengan ukuran domain kristalit. Ingat baik-baik dua hal yang paling sering salah: beta harus dalam radian, dan teta adalah setengah dari nilai 2-teta yang tertera di sumbu X.",
    pedagogicalNotes:
      "Banyak mahasiswa memasukkan 2-teta utuh ke fungsi cosinus atau lupa mengonversi FWHM derajat ke radian, menghasilkan nilai D yang keliru puluhan kali lipat.",
    embeddedComponent: "xrd-scherrer",
  },
  {
    id: "s9",
    chapter: "understand",
    chapterLabel: "Prinsip Difraksi",
    label: "Refleksi Standar",
    title: "Struktur Kristal & Refleksi Acuan Al-Fum MOF",
    kind: "data",
    bullets: [
      "Kerangka MOF Aluminum Fumarate: Dibangun oleh rantai tak berhingga oktahedra AlO₆ yang dihubungkan oleh ligan fumarat (-OOC-CH=CH-COO-).",
      "Pola Standar CCDC 1051975: Struktur kristal ortorombik/monoklinik baku yang menghasilkan puncak karakteristik tajam pada sudut rendah.",
      "Refleksi Diagnostik: Puncak (011) di 2θ = 10,39° (I_rel = 100%), (020) di 14,65° (55%), (022) di 20,87° (40%), dan (033) di 31,52° (30%).",
      "Jarak Antarbidang (d-spacing): Nilai d dihitung dari Hukum Bragg: d = λ / (2 · sin θ), misalnya d_011 = 8,51 Å.",
    ],
    script:
      "Al-Fum MOF memiliki pola difraksi acuan yang sangat khas pada basis data CCDC 1051975. Refleksi bidang 011 pada 10,39 derajat dengan d-spacing 8,51 Angstrom adalah sidik jari kristalografi paling dominan untuk memastikan fase Al-Fum terbentuk.",
    pedagogicalNotes:
      "Tunjukkan tabel refleksi acuan di panel kanan: mahasiswa harus mencocokkan puncak sampel mereka dengan data baku ini.",
    embeddedComponent: "xrd-reflections",
  },

  // ── BAB 3: ALUR PENGOLAHAN DATA DENGAN ORIGINPRO ──────────────────────────
  {
    id: "s10",
    chapter: "prove",
    chapterLabel: "Alur Analisis Data",
    label: "Tahap 1: Impor Data",
    title: "Tahap 1: Impor Data & Pembuatan Grafik di OriginPro",
    kind: "content",
    bullets: [
      "Persiapan Workbook: Buat workbook baru di OriginPro dan impor ketiga berkas data XRD (.xlsx) ke dalam lembar kerja terpisah.",
      "Penetapan Tipe Kolom: Pastikan Kolom A ditetapkan sebagai sumbu X (Sudut 2θ) dan Kolom B ditetapkan sebagai sumbu Y (Intensitas).",
      "Pembuatan Plot Garis: Pilih seluruh kolom lalu buat grafik garis 2D (Plot → Line) untuk memverifikasi keutuhan kurva difraksi.",
      "Pengaturan Skala Sumbu: Tetapkan batas sumbu X dari 5° hingga 80° dengan interval skala utama (major ticks) sebesar 10°.",
    ],
    script:
      "Langkah pertama di OriginPro adalah memasukkan data ke lembar kerja. Tetapkan kolom pertama sebagai X dan kolom kedua sebagai Y, kemudian buat plot garis 2D pada rentang 5 sampai 80 derajat untuk memverifikasi kualitas data mentah.",
    pedagogicalNotes:
      "Ingatkan mahasiswa agar tidak langsung menghapus titik data atau melakukan smoothing berlebihan yang merusak puncak Bragg.",
    embeddedComponent: "xrd-samples",
  },
  {
    id: "s11",
    chapter: "prove",
    chapterLabel: "Alur Analisis Data",
    label: "Tahap 2: Normalisasi",
    title: "Tahap 2: Normalisasi Intensitas Difraktogram",
    kind: "content",
    bullets: [
      "Urgensi Normalisasi: Intensitas absolut mentah dipengaruhi oleh ketebalan serbuk dan preparasi; kurva harus dinormalisasi sebelum perbandingan.",
      "Rumus Formula Kolom: Tambahkan kolom baru Y_norm dengan formula: (Col(Y) - min(Col(Y))) / (max(Col(Y)) - min(Col(Y))) sehingga puncak tertinggi bernilai 1,0.",
      "Penumpukan Kurva (Stacking): Tumpuk kurva standar CCDC di lapisan terbawah, disusul oleh sampel 1:2, 1:3, dan 1:4 secara vertikal.",
      "Offset Sumbu Y: Tambahkan offset bertingkat (misal +0,4 atau +0,5) pada masing-masing kurva agar tidak saling menumpuk.",
    ],
    script:
      "Normalisasi intensitas mutlak ke skala nol sampai satu wajib dilakukan sebelum membuat grafik bertumpuk. Tanpa normalisasi, kurva dengan intensitas ribuan counts akan menutupi kurva sampel lain yang memiliki massa preparasi lebih kecil.",
    pedagogicalNotes:
      "OriginPro memiliki fitur 'Stack Lines by Y Offsets' yang mempermudah visualisasi tanpa mengubah nilai data asli.",
    embeddedComponent: "xrd-samples",
  },
  {
    id: "s12",
    chapter: "prove",
    chapterLabel: "Alur Analisis Data",
    label: "Tahap 3: VESTA",
    title: "Tahap 3: Simulasi Pola Difraksi Standar dengan VESTA",
    kind: "content",
    bullets: [
      "Membuka Berkas CIF: Buka file CCDC_1051975.cif pada perangkat lunak VESTA untuk menampilkan arsitektur kristal 3D Al-Fum.",
      "Simulasi PXRD: Akses menu Utilities → Powder Diffraction Pattern pada bilah menu VESTA.",
      "Pengaturan Sumber: Pilih radiasi Cu Kα1 (λ = 1,54059 Å) dan rentang sudut 2θ = 5°–80° agar selaras dengan data difraktometer eksperimen.",
      "Tab Reflection: Buka tab 'Reflection' untuk mengekspor daftar indeks bidang (hkl), nilai 2θ teoretis, dan d-spacing (Å) acuan.",
    ],
    script:
      "Untuk memperoleh data standar, kita membuka file CIF di software VESTA dan menjalankan menu simulasi Powder Diffraction Pattern. Dari tab Reflection, catat posisi sudut 2-teta dan indeks hkl acuan untuk proses pencocokan puncak.",
    pedagogicalNotes:
      "Tunjukkan bahwa VESTA memungkinkan mahasiswa melihat langsung kaitan antara bidang kisi (hkl) dengan susunan atom di kisi kristal.",
    embeddedComponent: "xrd-reflections",
  },
  {
    id: "s13",
    chapter: "prove",
    chapterLabel: "Alur Analisis Data",
    label: "Tahap 4: Indexing",
    title: "Tahap 4: Identifikasi Puncak & Pergeseran Sudut (Zero Shift)",
    kind: "content",
    bullets: [
      "Pencocokan Indeks Miller: Berikan label indeks hkl pada puncak eksperimen berdasarkan kecocokan posisi 2θ acuan VESTA.",
      "Puncak Utama Al-Fum: Bidang (011) di ~10,4°, (020) di ~14,7°, (022) di ~20,9°, dan (033) di ~31,5°.",
      "Fenomena Pergeseran Sudut (Δ2θ): Pergeseran kecil (sekitar ±0,05° hingga 0,15°) adalah wajar dan lazim dalam difraktometer laboratorium.",
      "Penyebab Fisis Pergeseran: Efek ketidaktepatan nol instrumen (zero-shift), kesalahan ketinggian wadah sampel (specimen displacement), dan distorsi kisi halus.",
    ],
    script:
      "Petakan puncak eksperimen terhadap hasil simulasi VESTA. Jika terdapat selisih sudut sekitar 0,1 derajat, jangan diubah datanya: itu adalah pergeseran instrumen wajar akibat penempatan wadah sampel atau distorsi regangan kisi.",
    pedagogicalNotes:
      "Toleransi pencocokan pada panduan praktikum adalah ±0,5° (slide 21). Mahasiswa harus mencantumkan nilai pergeseran Δ2θ di tabel laporan.",
    embeddedComponent: "xrd-reflections",
  },
  {
    id: "s14",
    chapter: "prove",
    chapterLabel: "Alur Analisis Data",
    label: "Tahap 5: Integrasi",
    title: "Tahap 5: Integrasi Luas Puncak & Luas Total di OriginPro",
    kind: "content",
    bullets: [
      "Integrasi Luas Total (A_total): Gunakan menu Analysis → Mathematics → Integrate dengan garis dasar baseline Y = 0 pada rentang 5°–80°.",
      "Integrasi Puncak Kristalin (A_kristalin): Gunakan fitur Peak Analyzer untuk mengintegrasikan luas di bawah puncak-puncak kristalin tajam.",
      "Pemilihan Baseline Lokal: Garis dasar puncak kristalin harus ditarik mengikuti batas atas halo amorf, bukan dari Y = 0.",
      "Perhitungan % Kristalinitas: Hitung rasio (A_kristalin / A_total) × 100% untuk masing-masing sampel rasio sintesis.",
    ],
    script:
      "Pengukuran luas di OriginPro terbagi dua: luas total menggunakan batas bawah Y=0 untuk seluruh rentang kurva, sedangkan luas puncak kristalin dihitung di atas baseline halo amorf lokal agar hamburan difus tidak ikut terhitung.",
    pedagogicalNotes:
      "Gunakan panel visual anatomi di samping untuk mendemonstrasikan batas arsiran puncak oranye vs arsiran halo ungu.",
    embeddedComponent: "xrd-anatomy",
  },
  {
    id: "s15",
    chapter: "prove",
    chapterLabel: "Alur Analisis Data",
    label: "Tahap 6: FWHM",
    title: "Tahap 6: Ekstraksi Nilai FWHM (β) untuk 3 Puncak Utama",
    kind: "content",
    bullets: [
      "Pemilihan Tiga Puncak: Pilih tiga refleksi terkuat dan terisolasi dengan baik: bidang (011) ~10,4°, (020) ~14,7°, dan (022) ~20,9°.",
      "Ekstraksi Parameter Puncak: Buka Peak Analyzer → Fit Peaks (Pro) atau gunakan Quick Peaks Gadget untuk mengekstrak FWHM.",
      "Definisi FWHM: Lebar kurva pada setengah tinggi intensitas maksimum relatif terhadap garis dasar lokal puncak.",
      "Pencatatan Data: Salin nilai pusat puncak (Peak Center, 2θ) dan lebar (FWHM, β) dalam satuan derajat ke tabel Microsoft Excel.",
    ],
    script:
      "Pilih tiga puncak terisolasi paling tajam: bidang 011, 020, dan 022. Gunakan fitur Peak Analyzer di OriginPro untuk membaca nilai pusat puncak 2-teta dan lebar FWHM beta pada separuh tinggi di atas garis dasar lokal.",
    pedagogicalNotes:
      "Puncak 033 dan sudut tinggi lainnya sering kali mengalami tumpang-tindih (overlap) sehingga kurang akurat untuk penentuan FWHM tunggal.",
    embeddedComponent: "xrd-scherrer",
  },
  {
    id: "s16",
    chapter: "prove",
    chapterLabel: "Alur Analisis Data",
    label: "Tahap 7: Excel",
    title: "Tahap 7: Perhitungan Scherrer & Derajat Kristalinitas di Excel",
    kind: "content",
    bullets: [
      "Konversi Sudut Difraksi: Masukkan formula `=RADIANS(2θ/2)` untuk memperoleh sudut Bragg θ dalam radian sebelum menghitung `COS(θ)`.",
      "Konversi FWHM ke Radian: Ubah FWHM dari derajat ke radian menggunakan formula Excel: `β_rad = RADIANS(FWHM_deg)`.",
      "Kalkulasi Ukuran Kristalit: Hitung ukuran kristalit per bidang dengan rumus: `D = (0,9 * 0,154059) / (β_rad * COS(θ_rad))` dalam satuan nm.",
      "Ukuran Kristalit Rata-rata: Hitung rata-rata aritmatika D dari ketiga bidang refleksi utama untuk mewakili ukuran kristalit sampel.",
    ],
    script:
      "Di Excel, susun tabel perhitungan Scherrer secara sistematis. Wajib gunakan fungsi RADIANS untuk mengonversi teta dan beta sebelum menghitung D. Ambil nilai rata-rata dari ketiga puncak utama sebagai ukuran kristalit representatif.",
    pedagogicalNotes:
      "Tunjukkan formula sel Excel secara gamblang di layar agar tidak ada mahasiswa yang salah mengetikkan sintaks trigonometri.",
    embeddedComponent: "xrd-scherrer",
  },
  {
    id: "s17",
    chapter: "prove",
    chapterLabel: "Alur Analisis Data",
    label: "Tahap 8: Benchmark",
    title: "Tahap 8: Benchmark Nilai Panduan untuk Rasio 1:2, 1:3, 1:4",
    kind: "data",
    bullets: [
      "Sampel 1:2: Puncak (011) pada 10,39°, FWHM = 0,327°, D_011 = 24,4 nm, Kristalinitas Relatif = 100,0% (sampel paling teratur).",
      "Sampel 1:3: Puncak (011) pada 10,43°, FWHM = 0,373°, D_011 = 21,4 nm, Kristalinitas Relatif = 93,7%.",
      "Sampel 1:4: Puncak (011) pada 10,38°, FWHM = 0,358°, D_011 = 22,3 nm, Kristalinitas Relatif = 43,5% (penurunan tajam fase kristalin).",
      "Interpretasi Kimia: Rasio 1:2 memberikan koordinasi stoikiometri ideal; kelebihan ligan fumarat pada 1:4 mengganggu pertumbuhan kisi teratur.",
    ],
    script:
      "Berikut adalah patokan hasil panduan praktikum: Rasio 1:2 menunjukkan kristalinitas tertinggi 100 persen dengan kristalit 24,4 nm. Rasio 1:3 sedikit menurun ke 93,7 persen, dan rasio 1:4 anjlok ke 43,5 persen akibat kelebihan prekursor yang tidak membentuk kisi periodik.",
    pedagogicalNotes:
      "Angka-angka ini adalah benchmark evaluasi laporan. Jika hasil mahasiswa melenceng jauh dari rentang ini, periksa kembali integrasi baseline dan konversi radian mereka.",
    embeddedComponent: "xrd-samples",
  },

  // ── BAB 4: SIMPULAN & PANDUAN LAPORAN ─────────────────────────────────────
  {
    id: "s18",
    chapter: "ready",
    chapterLabel: "Simpulan & Laporan",
    label: "Jebakan Umum",
    title: "Hal Penting & Kesalahan Umum Analisis XRD",
    kind: "content",
    bullets: [...M5_COMMON_TRAPS],
    script:
      "Sebelum menyusun laporan, tinjau lima kesalahan yang paling sering terjadi: pertama, lupa konversi radian; kedua, memasukkan 2-teta penuh ke cosinus; ketiga, menumpuk grafik tanpa normalisasi; keempat, baseline integrasi bocor ke halo amorf; dan kelima, salah memahami batasan ukuran kristalit Scherrer.",
    pedagogicalNotes:
      "Mintalah praktikan mencatat kelima butir ini sebagai checklist verifikasi sebelum mengumpulkan laporan.",
    embeddedComponent: "xrd-traps",
  },
  {
    id: "s19",
    chapter: "ready",
    chapterLabel: "Simpulan & Laporan",
    label: "Panduan Pembahasan",
    title: "Struktur Pembahasan Laporan: Menjawab Pertanyaan Panduan",
    kind: "content",
    bullets: [
      "Konfirmasi Pembentukan Fasa: Bandingkan posisi puncak eksperimen dengan acuan CCDC 1051975 untuk membuktikan keberhasilan sintesis Al-Fum MOF.",
      "Pengaruh Rasio Reaktan: Jelaskan tren kristalinitas (1:2 > 1:3 >> 1:4) dikaitkan dengan ketersediaan ion Al³⁺ dan ligan fumarat dalam larutan.",
      "Korelasi FWHM & Kristalit: Hubungkan pelebaran puncak difraksi dengan ukuran kristalit sesuai konsep keterbatasan bidang pemantul Bragg.",
      "Evaluasi Pergeseran Sudut: Diskusikan penyebab fisis pergeseran 2θ (instrument zero-shift, displacement wadah, dan regangan mikro).",
    ],
    script:
      "Pembahasan laporan harus berbobot ilmiah dan menjawab empat pertanyaan inti: konfirmasi fasa terhadap standar CCDC, tren pengaruh rasio terhadap kristalinitas, interpretasi ukuran kristalit dari FWHM, dan evaluasi kritis terhadap pergeseran sudut difraksi.",
    pedagogicalNotes:
      "Laporan yang baik menyajikan data kuantitatif yang didukung oleh analisis mekanisme kimia koordinasi MOF, bukan sekadar mendeskripsikan grafik.",
    embeddedComponent: "xrd-report",
  },
  {
    id: "s20",
    chapter: "ready",
    chapterLabel: "Simpulan & Laporan",
    label: "Kisi-kisi Laporan",
    title: "Kisi-Kisi Komponen Laporan Akhir Modul 5 XRD",
    kind: "closing",
    bullets: [...M5_REPORT_GRID],
    script:
      "Inilah kisi-kisi penilaian laporan akhir Modul 5: pastikan grafik perbandingan OriginPro tersaji rapi dan ternormalisasi, tabel indexing hkl lengkap dengan pergeseran sudut, integrasi kristalinitas teliti, perhitungan Scherrer akurat, serta pembahasan mendalam mengenai pengaruh rasio prekursor.",
    pedagogicalNotes:
      "Tutup sesi dengan menegaskan bahwa kelima komponen ini memiliki bobot penilaian eksplisit dalam rubrik praktikum KI3131.",
    embeddedComponent: "xrd-report",
  },
];

export const M5_REVIEW_DECK_SLIDE_BY_ID: Readonly<Record<string, ReviewDeckSlide>> = Object.freeze(
  Object.fromEntries(M5_REVIEW_DECK_SLIDES.map((s) => [s.id, s]))
);

export const TOTAL_M5_REVIEW_DECK_SLIDES = M5_REVIEW_DECK_SLIDES.length;

export const m5DeckSlideIndex = (id: string): number =>
  M5_REVIEW_DECK_SLIDES.findIndex((s) => s.id === id);
