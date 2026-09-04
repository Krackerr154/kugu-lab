import Link from "next/link";
import {
  ProcedureWalkthrough,
  type WalkthroughStep,
  type WalkthroughCheck,
} from "@/components/shared/ProcedureWalkthrough";
import { ElectrolytePrepWorksheet } from "@/components/interactives/ElectrolytePrepWorksheet";
import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { ChemText } from "@/components/shared/ChemText";
import { Equation } from "@/components/shared/Equation";
import { getModule } from "@/lib/modules";
import {
  PROTOCOL_CURRENT_DENSITY_MA_CM2,
  PROTOCOL_DURATION_MINUTES,
} from "@/lib/m3-electrolyte";

// Procedure content is transcribed from Penuntun Praktikum Kimia Golongan Utama
// KI3131, Modul 3 "Sintesis Paduan Logam Tin-Bismuth dengan Metode
// Elektrodeposisi", manual pages 20-24: stage M3a (cathode and anode
// fabrication) and stage M3b (electrolyte preparation and electrodeposition).
// Quantities, mesh sizes, temperatures and durations are the manual's values —
// do not round or "improve" them; they are protocol variables approved by the
// course team.

export default function M3PrelabPage() {
  const module = getModule("m3-sn-bi-electrodeposition")!;

  // Indonesian decimal comma — the manual writes "14,5 mA/cm2", and step titles
  // are plain strings so they cannot use toLocaleString at render time.
  const protocolDensityId = String(PROTOCOL_CURRENT_DENSITY_MA_CM2).replace(".", ",");

  const steps: WalkthroughStep[] = [
    {
      id: 1,
      title: "Siapkan Jurnal Pre-lab & Tugas Pendahuluan",
      detail:
        "Tulis tujuan, dasar teori (paduan logam, elektrodeposisi, peran agen pengompleks, rapat arus, efisiensi arus), diagram alir M3a-M3b, tabel data pengamatan massa katoda/anoda, dan rumus efisiensi arus. Kerjakan 5 tugas pendahuluan modul — dua di antaranya menuntut Anda merujuk makalah jurnal.",
      rationale:
        "Tugas pendahuluan #2 meminta reaksi anoda dan katoda beserta potensial reduksinya, dan #3 serta #5 mewajibkan pembacaan makalah. Keduanya tidak bisa dikerjakan mendadak di lab, dan modul ini berjalan lintas sesi karena resin katoda perlu 2 × 24 jam untuk mengeras.",
      equipment: ["Jurnal pre-lab", "Kalkulator", "Tabel potensial reduksi standar"],
      estimatedTime: "60-90 min",
    },
    {
      id: 2,
      title: "Pembuatan Katoda: Plat Tembaga & Sambungan Listrik (M3a)",
      detail:
        "Siapkan satu buah plat tembaga. Buat goresan-goresan pada salah satu sisi plat. Sambungkan sisi tersebut dengan kawat tembaga sepanjang 15 cm menggunakan solder dan kawat timah, lalu tunggu hingga sambungan mengeras. Cek dengan Ampere meter apakah kabel dan tembaga benar-benar tersambung.",
      rationale:
        "Goresan memperluas permukaan efektif dan memberi tautan mekanis sehingga resin serta deposit menempel lebih baik. Pemeriksaan dengan Ampere meter adalah gerbang mutu: sambungan solder yang tampak baik bisa tetap tidak kontinu secara listrik, dan kegagalan ini baru terlihat saat elektrodeposisi tidak menghasilkan deposit sama sekali.",
      equipment: [
        "Plat tembaga",
        "Kawat tembaga 15 cm",
        "Solder + kawat timah",
        "Ampere meter / multimeter",
        "Kertas amplas",
      ],
      safetyNote:
        "Solder panas dan uap fluks: bekerja di area berventilasi sesuai SOP laboratorium, gunakan dudukan solder, dan jangan menyentuh ujung solder. Ikuti arahan asisten untuk penanganan solder dan timah.",
      holdPoint: true,
      expectedObservation:
        "Ampere meter menunjukkan kontinuitas (hambatan sangat kecil) antara ujung kawat dan plat tembaga.",
      estimatedTime: "30-45 min",
    },
    {
      id: 3,
      title: "Pembuatan Katoda: Pengecoran Resin",
      detail:
        "Siapkan cetakan silikon. Campurkan resin dan hardener dengan perbandingan volume 3:1 di dalam gelas plastik, aduk perlahan agar tidak terbentuk gelembung. Taruh plat tembaga di dasar cetakan lalu tuangkan campuran resin. Biarkan resin mengeras hingga 2 × 24 jam.",
      rationale:
        "Resin mengisolasi seluruh bagian katoda kecuali permukaan kerja, sehingga luas terekspos yang dipakai menghitung rapat arus benar-benar sama dengan luas yang Anda ukur. Gelembung pada resin membuka jalur elektrolit ke bagian yang seharusnya terisolasi dan merusak dasar perhitungan rapat arus.",
      equipment: ["Resin", "Hardener", "Gelas plastik", "Cetakan silikon", "Pengaduk"],
      safetyNote:
        "Resin dan hardener bersifat iritan/sensitizer. Gunakan APD dan ventilasi sesuai SDS produk yang berlaku serta arahan asisten; prosedur resin termasuk yang memerlukan persetujuan khusus.",
      holdPoint: true,
      expectedObservation:
        "Resin mengeras bening/berwarna sesuai produk. Rencanakan jadwal: 2 × 24 jam berarti tahap ini harus dimulai jauh sebelum sesi elektrodeposisi.",
      estimatedTime: "2 × 24 jam (menunggu)",
    },
    {
      id: 4,
      title: "Pembuatan Anoda: Grafit dari Baterai Bekas",
      detail:
        "Siapkan anoda grafit dengan membuka baterai yang sudah tidak terpakai. Rendam grafit di dalam etanol, lanjutkan dengan aqua DM, masing-masing dengan sonikasi sekitar 5 menit. Keringkan grafit di atas hotplate yang dilapisi aluminium foil — dalam proses ini pengotor dari dalam grafit akan keluar.",
      rationale:
        "Grafit baterai jenuh dengan elektrolit dan pasta karbon dari sel aslinya. Etanol mengangkat pengotor organik, aqua DM mengangkat garam yang larut air, dan pemanasan mengeluarkan sisa yang terperangkap di pori. Pengotor yang tertinggal akan larut ke elektrolit dan ikut terdeposit di katoda.",
      equipment: [
        "Baterai bekas (jenis disetujui asisten)",
        "Batang grafit",
        "Etanol",
        "Aqua DM",
        "Ultrasonic bath",
        "Hotplate + aluminium foil",
      ],
      safetyNote:
        "Pembongkaran baterai bekas adalah blocker keselamatan CR-06: jenis baterai, metode isolasi, penanganan limbah B3, dan pengawasan harus ditetapkan asisten terlebih dahulu. Jangan membongkar baterai secara mandiri. Etanol mudah terbakar — jauhkan dari hotplate yang menyala.",
      holdPoint: true,
      expectedObservation:
        "Air bilasan mula-mula keruh/berwarna lalu menjadi bening pada sonikasi berikutnya.",
      estimatedTime: "30 min",
    },
    {
      id: 5,
      title: "Penyiapan 100 mL Larutan Elektrolit (M3b)",
      detail:
        "Buat tiga larutan terpisah (A, B, C) sesuai tabel komposisi, lalu gabungkan dengan urutan: pipet A sedikit demi sedikit ke dalam B, tuangkan (A+B) ke dalam C secara perlahan, tambahkan PEG400 hingga konsentrasi akhir 0,20 M, tambahkan NH_{3} pekat 0,5 mL, dan tambahkan air hingga volume akhir 100 mL. Cek pH larutan — target pH ~2. Gunakan worksheet elektrolit di halaman ini untuk memverifikasi setiap massa dan menurunkan angka PEG400.",
      rationale:
        "Molaritas pada tabel penuntun berlaku untuk volume akhir 100 mL, bukan untuk volume sub-larutan 5/5,5/9 mL yang tertulis persis di bawahnya. Salah membaca basis ini membuat massa SnCl_{2}·2H_{2}O tertimbang sekitar 18 kali lebih kecil sehingga praktis tidak ada deposit. Urutannya pun bermakna: agen pengompleks harus bertemu ion logam sebelum pH dinaikkan oleh NH_{3}.",
      equipment: [
        "EDTA",
        "SnCl_{2}·2H_{2}O",
        "Bi(NO_{3})_{3}·5H_{2}O",
        "Asam sitrat",
        "PEG400",
        "NH_{3} pekat",
        "HCl pekat",
        "Labu takar 100 mL",
        "pH meter / indikator",
        "Timbangan analitik",
      ],
      safetyNote:
        "HCl pekat dan NH_{3} pekat korosif dengan uap iritan — bekerja di lemari asam dan jangan mencampurnya langsung. Garam Sn dan Bi adalah limbah logam berat: kumpulkan sesuai SOP limbah B3, jangan dibuang ke bak cuci.",
      holdPoint: true,
      expectedObservation:
        "Larutan akhir jernih hingga sedikit keruh dengan pH sekitar 2. Catat pH aktual — bila menyimpang jauh dari 2, laporkan sebagai deviasi sebelum melanjutkan.",
      estimatedTime: "60-75 min",
    },
    {
      id: 6,
      title: "Mirror Polishing dan Pengukuran Luas Katoda",
      detail:
        "Keluarkan resin dari cetakan silikon. Haluskan plat tembaga dengan kertas amplas ukuran 200, 500, 800, dan 1000 mesh secara berurutan hingga permukaan terlihat cemerlang (mirror polishing); gunakan beberapa tetes aqua DM untuk membantu. Ukur panjang dan lebar plat tembaga lalu hitung luasnya.",
      rationale:
        "Urutan mesh dari kasar ke halus menghilangkan goresan yang ditinggalkan amplas sebelumnya; melompati tahap membuat goresan kasar tetap ada dan deposit tumbuh tidak merata. Luas yang Anda ukur di sini adalah pembagi pada rapat arus — kesalahan pengukuran luas langsung menjadi kesalahan rapat arus dan efisiensi arus.",
      equipment: [
        "Kertas amplas 200, 500, 800, 1000 mesh",
        "Aqua DM",
        "Jangka sorong / penggaris",
      ],
      expectedObservation:
        "Permukaan tembaga memantul seperti cermin tanpa goresan kasar yang terlihat. Catat panjang, lebar, dan luas hasil perhitungan.",
      estimatedTime: "30-40 min",
    },
    {
      id: 7,
      title: "Pembersihan, Pengeringan, dan Penimbangan Awal",
      detail:
        "Sonikasi plat yang telah dihaluskan di dalam gelas kimia berisi aseton selama minimal 10 menit. Keringkan di dalam oven bersuhu 60 °C sebelum disimpan di dalam desikator. Timbang katoda dan ambil gambar katoda sebelum proses elektrodeposisi. Timbang juga anoda.",
      rationale:
        "Aseton mengangkat lemak dan sisa serbuk amplas; lapisan minyak setipis apa pun membuat deposit tidak melekat. Desikator mencegah plat menyerap uap air sebelum ditimbang. Massa awal ini adalah salah satu dari dua angka yang menentukan efisiensi arus, jadi harus diambil setelah plat benar-benar kering.",
      equipment: [
        "Aseton",
        "Ultrasonic bath",
        "Oven 60 °C",
        "Desikator",
        "Timbangan analitik",
        "Kamera",
      ],
      safetyNote:
        "Aseton mudah terbakar dan uapnya iritan — gunakan di area berventilasi, jauh dari sumber panas atau percikan, dan tampung limbahnya sesuai SOP pelarut.",
      holdPoint: true,
      expectedObservation:
        "Massa katoda sebelum deposisi tercatat hingga ketelitian timbangan analitik, beserta foto permukaan sebelum deposisi.",
      estimatedTime: "45 min (termasuk pengeringan)",
    },
    {
      id: 8,
      title: "Perakitan Sel Elektrodeposisi",
      detail:
        "Isi gelas kimia 250 mL dengan larutan elektrolit. Siapkan karton duplex ukuran 9 × 9 cm sebagai tutup, buat dua lubang kecil berjarak kurang lebih 3 cm di tengah karton dengan cutter. Pasang katoda dan anoda melalui lubang tersebut sesuai Gambar 3.3 penuntun, lalu sambungkan ke sumber listrik DC. Verifikasi polaritas sebelum menyalakan.",
      rationale:
        "Karton menahan kedua elektroda pada jarak tetap ±3 cm; jarak antar-elektroda mempengaruhi distribusi medan dan keseragaman deposit, sehingga jarak yang berubah-ubah membuat hasil antar kelompok tidak dapat dibandingkan. Polaritas terbalik akan melarutkan katoda tembaga Anda alih-alih melapisinya.",
      equipment: [
        "Gelas kimia 250 mL",
        "Karton duplex 9 × 9 cm",
        "Cutter",
        "Power supply DC (0-10 V, 0-10 A)",
        "Kabel penghubung",
      ],
      safetyNote:
        "Sumber listrik DC: pastikan power supply mati saat merangkai, periksa polaritas bersama asisten, dan jangan pernah menyentuh elektroda saat arus mengalir. Otorisasi kelistrikan tetap pada asisten.",
      holdPoint: true,
      expectedObservation:
        "Katoda terhubung ke terminal negatif dan anoda ke terminal positif; kedua elektroda tercelup tanpa saling bersentuhan.",
      estimatedTime: "20 min",
    },
    {
      id: 9,
      title: `Proses Elektrodeposisi: ${protocolDensityId} mA/cm² selama ${PROTOCOL_DURATION_MINUTES} Menit`,
      detail: `Jalankan percobaan dengan mengalirkan arus listrik sebesar ${protocolDensityId} mA/cm² selama ${PROTOCOL_DURATION_MINUTES} menit. Karena yang ditetapkan penuntun adalah rapat arus, hitung dulu arus yang harus diset pada power supply: I = ${protocolDensityId} mA/cm² × luas katoda Anda. Catat arus, tegangan, pH elektrolit, dan suhu bila terukur.`,
      rationale: `Rapat arus, bukan arus, yang menentukan laju reduksi per satuan permukaan — karena itu dua kelompok dengan luas plat berbeda harus menyetel arus yang berbeda untuk menjalankan protokol yang sama. Contoh: plat 4,00 cm² memerlukan 0,058 A, sedangkan plat 2,50 cm² memerlukan 0,0363 A. Rapat arus yang terlalu tinggi mendorong evolusi H_{2} dan deposit dendritik.`,
      equipment: ["Power supply DC", "Stopwatch / timer", "Multimeter", "pH meter"],
      safetyNote:
        "Jangan melebihi arus yang disetujui asisten. Gas dapat terbentuk di elektroda — pastikan area berventilasi dan jangan menutup gelas kimia secara rapat.",
      expectedObservation: `Lapisan keperakan hingga abu-abu gelap tumbuh pada permukaan katoda. Gelembung yang deras menandakan rapat arus terlalu tinggi atau pH bergeser — catat sebagai pengamatan, jangan diabaikan.`,
      estimatedTime: `${PROTOCOL_DURATION_MINUTES} min (+ persiapan)`,
    },
    {
      id: 10,
      title: "Pasca-deposisi: Bilas, Keringkan, Timbang",
      detail:
        "Setelah elektrodeposisi selama 15 menit, bilas katoda dengan aqua DM. Keringkan di dalam oven bersuhu 60 °C hingga kering sebelum disimpan di desikator. Timbang katoda. Amati permukaan plat tembaga setelah deposisi dan bandingkan dengan kondisi sebelum deposisi — ambil gambar sebelum dan sesudah.",
      rationale:
        "Bilasan menghilangkan elektrolit sisa yang, bila dibiarkan mengering, akan tertimbang sebagai garam dan membuat pertambahan massa tampak lebih besar daripada logam yang benar-benar terdeposit. Efisiensi arus di atas 100% hampir selalu berasal dari kesalahan ini atau dari deposit non-logam yang ikut mengendap.",
      equipment: ["Aqua DM", "Oven 60 °C", "Desikator", "Timbangan analitik", "Kamera"],
      holdPoint: true,
      expectedObservation:
        "Pertambahan massa katoda dalam orde miligram hingga puluhan miligram. Deskripsikan warna, kekasaran, dan adhesi lapisan.",
      estimatedTime: "30-45 min",
    },
    {
      id: 11,
      title: "Hitung Efisiensi Arus dan Handoff XRD",
      detail:
        "Hitung efisiensi arus = (pertambahan massa aktual / pertambahan massa teoretis) × 100%. Gunakan kalkulator efisiensi arus pada halaman modul M3, dan catat secara eksplisit asumsi valensi serta stoikiometri yang Anda pakai. Serahkan sampel untuk karakterisasi XRD — analisisnya dikerjakan pada Modul 5.",
      rationale:
        "Deposit ini adalah paduan Sn-Bi, sedangkan Hukum Faraday dalam bentuk sederhana hanya berlaku untuk satu logam dengan satu nilai n dan M. Karena penuntun tidak menetapkan target komposisi, asumsi apa pun yang Anda pakai harus dituliskan dan dikonfirmasi asisten — bukan diam-diam diasumsikan sebagai Sn murni.",
      equipment: ["Kalkulator efisiensi arus (halaman modul M3)", "Data massa dan arus"],
      expectedObservation:
        "Efisiensi arus di bawah 100% adalah hasil yang wajar; sebagian muatan terpakai untuk reduksi H^{+} menjadi H_{2}. Nilai di atas 100% menandakan kesalahan pengukuran atau asumsi.",
      estimatedTime: "30 min",
    },
  ];

  // A check with `afterStep: N` renders on the step that FOLLOWS step id N, so
  // each question is asked one step after the material that answers it.
  const checks: WalkthroughCheck[] = [
    {
      afterStep: 2,
      question:
        "Mengapa penuntun meminta sambungan solder katoda diperiksa dengan Ampere meter, bukan hanya secara visual?",
      options: [
        "Untuk mengukur luas permukaan plat tembaga yang akan dilapisi",
        "Karena sambungan solder bisa tampak baik tetapi tidak kontinu secara listrik, dan kegagalan itu baru terdeteksi ketika tidak ada deposit yang terbentuk",
        "Untuk memastikan polaritas power supply sudah benar",
        "Karena Ampere meter menghilangkan lapisan oksida pada permukaan tembaga",
      ],
      correctIndex: 1,
      explanation:
        "Prosedur langkah (d) secara eksplisit meminta \"cek apakah kabel dan tembaga sudah tersambung dengan baik (gunakan Ampere meter)\". Solder dingin (cold joint) tampak mengkilap dan menempel, tetapi hambatannya bisa sangat besar atau bahkan terputus. Karena katoda kemudian dicor resin dan menunggu 2 × 24 jam, sambungan yang gagal tidak bisa diperbaiki lagi tanpa membuat katoda baru — pemeriksaan listrik ini adalah gerbang mutu sebelum titik tak-kembali.",
    },
    {
      afterStep: 5,
      question:
        "Pada tabel elektrolit, SnCl_{2}·2H_{2}O tertulis \"0,15 M (3,3846 g)\" dan tepat di bawahnya tertulis \"Volume akhir larutan 5,5 mL\". Konsentrasi 0,15 M itu mengacu pada volume yang mana?",
      options: [
        "Pada 5,5 mL larutan B, karena angkanya berada di blok baris yang sama",
        "Pada 100 mL elektrolit akhir — 3,3846 g ÷ 225,64 g/mol = 0,0150 mol, yang memberi 0,15 M hanya bila dibagi 0,100 L",
        "Pada 250 mL gelas kimia yang dipakai saat elektrodeposisi",
        "Pada volume gabungan A + B + C = 19,5 mL sebelum pengenceran",
      ],
      correctIndex: 1,
      explanation:
        "Periksa aritmetikanya: 3,3846 g ÷ 225,64 g/mol = 0,01500 mol. Dalam 5,5 mL itu berarti 2,73 M, bukan 0,15 M; dalam 100 mL tepat 0,150 M. Pola yang sama berlaku untuk keempat garam — EDTA 0,00500 mol, Bi(NO_{3})_{3}·5H_{2}O 0,00500 mol, dan asam sitrat 0,0300 mol semuanya cocok dengan basis 100 mL. Bila molaritas diterapkan pada sub-volume, massa SnCl_{2}·2H_{2}O yang tertimbang menjadi sekitar 18 kali lebih kecil dan praktis tidak ada deposit yang terbentuk.",
    },
    {
      afterStep: 6,
      question:
        "Berapa massa dan volume PEG400 yang harus ditambahkan, dan mengapa angka itu tidak tercantum di penuntun?",
      options: [
        "0,20 g dalam 1 mL — penuntun menganggapnya terlalu sepele untuk dicantumkan",
        "8,0 g atau kira-kira 7,1 mL — penuntun hanya menetapkan konsentrasi akhir 0,20 M, jadi n = 0,20 × 0,100 L = 0,020 mol dikalikan massa molar nominal 400 g/mol lalu dibagi densitas",
        "20 mL, yaitu 20% dari volume akhir 100 mL",
        "Tidak perlu dihitung; PEG400 ditambahkan secukupnya hingga larutan terlihat kental",
      ],
      correctIndex: 1,
      explanation:
        "Penuntun hanya menulis \"tambahkan PEG400 (konsentrasi akhir PEG400 0,20 M)\" tanpa massa maupun volume. Turunkan sendiri: n = 0,20 M × 0,100 L = 0,020 mol; m = 0,020 mol × 400 g/mol = 8,0 g; V = 8,0 g ÷ 1,128 g/mL ≈ 7,1 mL. Perlu disadari bahwa 400 g/mol adalah massa molar nominal rata-rata sebuah polimer, bukan senyawa tunggal, sehingga \"0,20 M\" di sini bersifat pendekatan. Menimbang 8,0 g lebih dapat dipertanggungjawabkan daripada memipet cairan yang kental.",
    },
    {
      afterStep: 9,
      question:
        "Luas katoda kelompok Anda 2,50 cm². Berapa arus yang harus diset pada power supply agar sesuai protokol 14,5 mA/cm²?",
      options: [
        "14,5 mA, karena protokol sudah menyebut angka itu secara langsung",
        "36,3 mA (0,0363 A), yaitu 14,5 mA/cm² × 2,50 cm²",
        "5,8 mA, yaitu 14,5 mA/cm² ÷ 2,50 cm²",
        "58 mA, nilai baku yang sama untuk semua kelompok",
      ],
      correctIndex: 1,
      explanation:
        "Protokol menetapkan rapat arus (mA/cm²), bukan arus (mA). Arus yang diset = rapat arus × luas: 14,5 × 2,50 = 36,25 mA ≈ 0,0363 A. Kelompok dengan plat 4,00 cm² justru harus menyetel 0,058 A untuk protokol yang sama. Menyetel 14,5 mA pada plat 2,50 cm² berarti hanya menjalankan 5,8 mA/cm² — kurang dari setengah rapat arus yang ditetapkan — dan hasilnya tidak dapat dibandingkan dengan kelompok lain.",
    },
    {
      afterStep: 10,
      question: "Perhitungan Anda menghasilkan efisiensi arus 112%. Apa penjelasan paling mungkin?",
      options: [
        "Elektrodeposisi berjalan sangat baik sehingga melampaui prediksi Hukum Faraday",
        "Ada kesalahan: sisa elektrolit yang tidak terbilas ikut tertimbang, deposit non-logam terbawa, atau asumsi valensi/massa molar tidak sesuai paduan Sn-Bi yang sebenarnya",
        "Rapat arus terlalu rendah sehingga massa teoretis terhitung terlalu kecil",
        "Wajar untuk paduan, karena dua logam mengendap sekaligus",
      ],
      correctIndex: 1,
      explanation:
        "Hukum Faraday adalah batas atas: muatan yang mengalir hanya mampu mereduksi sejumlah tertentu ion logam, sehingga efisiensi > 100% selalu menandakan masalah pengukuran atau asumsi. Penyebab tersering adalah katoda yang belum terbilas atau belum kering sempurna sehingga garam elektrolit tertimbang sebagai deposit. Penyebab kedua adalah asumsi n dan M: prosedur mengendapkan Sn dan Bi bersamaan, sedangkan perhitungan sederhana memakai satu pasang (n, M) saja — dan karena penuntun tidak menetapkan komposisi target, asumsi itu harus dituliskan serta dikonfirmasi asisten. Sebaliknya, efisiensi di bawah 100% wajar karena sebagian muatan terpakai mereduksi H^{+} menjadi H_{2}.",
    },
  ];

  const prelabTasks = [
    "Jelaskan prinsip metode sintesis dengan cara elektrodeposisi.",
    "Tuliskan reaksi-reaksi yang mungkin terjadi di anoda dan katoda dalam percobaan ini, lengkapi dengan potensial reduksi masing-masing reaksi tersebut.",
    "Rujuk makalah http://dx.doi.org/10.1149/1.3276678 dan bahas apa fungsi dari PEG-400.",
    "Apa kelebihan dan kekurangan dari metode yang digunakan dalam praktikum ini?",
    "Rujuk makalah https://doi.org/10.1166/jnn.2013.6850, bandingkan persamaan dan perbedaan percobaan praktikum ini dengan penelitian pada referensi tersebut.",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[var(--on-surface-variant)]">
        <Link href="/prelab" className="hover:underline">
          Pre-lab
        </Link>
        <span className="mx-1">/</span>
        <span aria-current="page" className="text-[var(--on-surface)]">
          M3 — <ChemText>{module.titleShort}</ChemText>
        </span>
      </nav>

      {/* Header */}
      <header className="rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)]/30 shadow-ambient p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-3xl text-[var(--primary-container)]">
            <span aria-hidden="true" className="material-symbols-outlined">
              {module.icon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold text-[var(--primary)]"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Pre-lab: <ChemText>{module.titleShort}</ChemText>
            </h1>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">
              <ChemText>{module.title}</ChemText>
            </p>
            <p className="text-xs text-[var(--on-surface-variant)] mt-2">
              Modul berjalan lintas sesi: M3a pembuatan katoda dan anoda (resin perlu 2 × 24 jam),
              M3b penyiapan elektrolit dan elektrodeposisi. Sumber: penuntun halaman 20-24.
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
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[16px] text-[var(--secondary)] mt-0.5"
                >
                  check_circle
                </span>
                <span className="flex-1">
                  <ChemText>{o}</ChemText>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Stage timeline */}
      <section className="mb-6 rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)]/30 shadow-ambient p-5">
        <div className="flex items-center gap-2 mb-4">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[var(--secondary)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            schedule
          </span>
          <h2
            className="text-lg font-bold text-[var(--primary)]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Linimasa Tahap M3
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              tag: "M3a-1",
              label: "Katoda",
              detail:
                "Plat tembaga digores, disolder ke kawat 15 cm, dicek Ampere meter, dicor resin 3:1 — mengeras 2 × 24 jam",
            },
            {
              tag: "M3a-2",
              label: "Anoda",
              detail:
                "Grafit baterai bekas, sonikasi etanol lalu aqua DM masing-masing ~5 menit, dikeringkan di hotplate",
            },
            {
              tag: "M3b-1",
              label: "Elektrolit",
              detail:
                "Larutan A/B/C, A ke B lalu (A+B) ke C, PEG400 0,20 M, NH₃ 0,5 mL, encerkan ke 100 mL, pH ~2",
            },
            {
              tag: "M3b-2",
              label: "Deposisi",
              detail:
                "Amplas 200→1000 mesh, ukur luas, sonikasi aseton ≥10 menit, timbang, 14,5 mA/cm² selama 15 menit, timbang ulang",
            },
          ].map((s) => (
            <div
              key={s.tag}
              className="rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {s.tag}
                </span>
                <p className="font-bold text-sm text-[var(--on-surface)]">{s.label}</p>
              </div>
              <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--on-surface-variant)]">
          Rencanakan jadwal lebih awal: resin katoda mengeras 2 × 24 jam, jadi tahap M3a harus dimulai
          jauh sebelum sesi elektrodeposisi.
        </p>
      </section>

      {/* Key equations */}
      <section className="mb-6 grid gap-3 lg:grid-cols-2">
        <Equation
          tex={"m_{teoretis} = \\frac{I \\times t \\times M}{n \\times F}"}
          label="Massa teoretis (Hukum Faraday)"
          description="I = arus (A), t = waktu (s), M = massa molar (g/mol), n = valensi, F = 96485 C/mol."
        />
        <Equation
          tex={"j = \\frac{I}{A} \\;\\Rightarrow\\; I = j \\times A"}
          label="Rapat arus menentukan arus yang diset"
          description="Protokol menetapkan j = 14,5 mA/cm², jadi arus power supply bergantung pada luas katoda Anda."
        />
      </section>

      {/* Pre-lab tasks */}
      <section className="mb-6 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[var(--secondary)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            assignment
          </span>
          <h2
            className="text-lg font-bold text-[var(--on-surface)]"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Tugas Pendahuluan M3
          </h2>
        </div>
        <ol className="space-y-2 text-sm text-[var(--on-surface)] list-decimal list-inside">
          {prelabTasks.map((t, i) => (
            <li key={i} className="leading-relaxed">
              <ChemText>{t}</ChemText>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-[var(--on-surface-variant)]">
          Tugas #2 (reaksi anoda/katoda beserta potensial reduksi) dibahas pada peta sel elektrokimia
          di halaman modul M3. Tugas #3 dan #5 menuntut pembacaan makalah — kerjakan sebelum sesi lab.
        </p>
      </section>

      {/* Safety boundary */}
      <div className="mb-6">
        <SafetyCallout variant="danger" title="Batas Keselamatan Modul 3">
          <p>
            Modul ini melibatkan HCl pekat, NH<sub>3</sub> pekat, garam logam Sn dan Bi, aseton,
            etanol, resin/hardener, solder panas, sumber listrik DC, dan grafit dari baterai bekas.
            Pembongkaran baterai bekas (CR-06) memerlukan penetapan jenis baterai, metode isolasi,
            penanganan limbah B3, dan pengawasan asisten terlebih dahulu. Instruksi penanganan rinci
            mengikuti SOP/SDS laboratorium yang berlaku dan arahan asisten — bukan halaman ini.
          </p>
        </SafetyCallout>
      </div>

      {/* Electrolyte preparation worksheet */}
      <div className="mb-6">
        <ElectrolytePrepWorksheet />
      </div>

      {/* Interactive procedure walkthrough */}
      <ProcedureWalkthrough
        title="Walkthrough Prosedur M3"
        intro="Ikuti langkah demi langkah M3a sampai M3b. Cek pemahaman muncul pada langkah tertentu — Anda harus menjawab sebelum melanjutkan."
        steps={steps}
        checks={checks}
      />

      {/* Link to module workspace */}
      <section className="mt-6 rounded-xl bg-[var(--primary-container)] p-6 text-center">
        <h2
          className="text-lg font-bold text-white mb-2"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Siap untuk Workspace Modul?
        </h2>
        <p className="text-sm text-white/70 mb-4">
          Lanjutkan ke peta sel elektrokimia, kalkulator efisiensi arus, dan log elektrodeposisi.
        </p>
        <Link
          href="/modules/m3-sn-bi-electrodeposition"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--secondary-container)] px-6 py-3 font-bold text-[var(--primary)] hover:opacity-90 transition-opacity"
        >
          <span aria-hidden="true" className="material-symbols-outlined">
            menu_book
          </span>
          Buka Modul M3 Interaktif
        </Link>
      </section>
    </div>
  );
}
