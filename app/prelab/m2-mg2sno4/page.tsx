import Link from "next/link";
import { ProcedureWalkthrough, type WalkthroughStep, type WalkthroughCheck } from "@/components/shared/ProcedureWalkthrough";
import { SafetyCallout } from "@/components/shared/SafetyCallout";
import { ChemText } from "@/components/shared/ChemText";
import { Equation } from "@/components/shared/Equation";
import { getModule } from "@/lib/modules";

// Procedure content is transcribed from Penuntun Praktikum Anorganik KI3131
// (FMIPA ITB, Semester 1 2025/2026), Modul 2, pages 13-17: stages M2a synthesis,
// M2b calcination, M2c band-gap measurement, M2d photocatalysis test.
// Quantities, temperatures and durations are the manual's values — do not round
// or "improve" them here; they are protocol variables approved by the course team.

export default function M2PrelabPage() {
  const module = getModule("m2-mg2sno4")!;

  const steps: WalkthroughStep[] = [
    {
      id: 1,
      title: "Siapkan Jurnal Pre-lab & Tugas Pendahuluan",
      detail:
        "Tulis tujuan, dasar teori (fotokatalisis, pasangan elektron-hole, ROS, band gap, kavitasi akustik), diagram alir M2a-M2d, tabel data pengamatan, dan rumus pengolahan data. Kerjakan 6 tugas pendahuluan modul.",
      rationale:
        "Jurnal dan tugas pendahuluan dikumpulkan sebelum tes awal. Modul ini berjalan lintas sesi (M2A-B lalu M2C-D), jadi rencana kerja harus sudah utuh sejak awal.",
      equipment: ["Jurnal pre-lab", "Kalkulator", "Tabel massa molar"],
      estimatedTime: "45-60 min",
    },
    {
      id: 2,
      title: "Preparasi Larutan Prekursor Timah (M2a)",
      detail:
        "Timbang SnCl_{2}·2H_{2}O sebanyak 1,355 g (6 mmol), larutkan dalam 5 mL air. Tambahkan 1,2 mL HCl pekat 32%, aduk 5 menit, lalu tambahkan 0,75 mL H_{2}O_{2} 30% tetes-per-tetes. Tutup seluruh permukaan gelas kimia (kaca arloji / aluminium foil / plastic wrap), aduk 15 menit dengan pengaduk magnetik.",
      rationale:
        "H_{2}O_{2} mengoksidasi Sn^{2+} menjadi Sn^{4+}; spesi Sn^{4+} inilah yang dibutuhkan untuk membentuk kerangka ortostanat pada Mg_{2}SnO_{4}. Penutup gelas menahan percikan dan penguapan selama pengadukan.",
      equipment: [
        "SnCl_{2}·2H_{2}O",
        "HCl pekat (32%)",
        "H_{2}O_{2} 30%",
        "Gelas kimia 100 mL",
        "Pengaduk magnetik + hotplate",
        "Kaca arloji / plastic wrap",
      ],
      safetyNote:
        "HCl pekat dan H_{2}O_{2} 30% korosif/oksidator kuat. Bekerja di lemari asam sesuai SOP/SDS laboratorium yang berlaku dan penambahan H_{2}O_{2} harus tetes-per-tetes di bawah pengawasan asisten.",
      holdPoint: true,
      expectedObservation:
        "Larutan Sn tetap jernih setelah penambahan HCl. Konsentrasi alternatif: jika HCl 37% gunakan 1 mL; jika H_{2}O_{2} 35% gunakan minimal 0,516 mL (dibulatkan 0,55 mL).",
      estimatedTime: "25 min",
    },
    {
      id: 3,
      title: "Preparasi Larutan Magnesium dan Penggabungan",
      detail:
        "Buat pelarut campuran air:etanol 1:1 dengan volume akhir 50 mL. Timbang MgCl_{2}·6H_{2}O 2,44 g (12 mmol) dan larutkan dengan pelarut tersebut di erlenmeyer 250 mL. Masukkan larutan Sn ke dalam larutan Mg, bilas gelas kimia dengan 45 mL aqua DM dan masukkan bilasan ke erlenmeyer. Aduk campuran 30 menit.",
      rationale:
        "Rasio 12 mmol Mg : 6 mmol Sn = 2:1 sesuai stoikiometri Mg_{2}SnO_{4}. Bilasan gelas kimia dimasukkan agar tidak ada prekursor Sn yang hilang — kehilangan ini langsung menurunkan rendemen.",
      equipment: ["MgCl_{2}·6H_{2}O", "Etanol", "Aqua DM", "Erlenmeyer 250 mL", "Timbangan analitik"],
      expectedObservation: "Campuran homogen, belum terbentuk padatan sebelum basa ditambahkan.",
      estimatedTime: "40 min",
    },
    {
      id: 4,
      title: "Atur pH dengan NaOH 4 M",
      detail:
        "Tambahkan NaOH 4 M tetes demi tetes hingga pH larutan mencapai 10-13. Catat pH target dan pH aktual, serta volume NaOH yang benar-benar dipakai.",
      rationale:
        "Kondisi basa memicu pembentukan jaringan M-O-M (hidroksida/oksida logam). Manual menyatakan rentang pH 10-13 bersifat variatif, jadi nilai aktual adalah data eksperimen yang harus dilaporkan, bukan angka yang boleh diasumsikan.",
      equipment: ["NaOH 4 M", "Indikator pH", "Pipet tetes"],
      safetyNote:
        "NaOH 4 M korosif. Tambahkan bertahap; jangan pipet dengan mulut. Ikuti SOP penanganan basa kuat dan APD yang disetujui.",
      holdPoint: true,
      expectedObservation: "Larutan mulai keruh / terbentuk suspensi putih saat pH naik.",
      estimatedTime: "15-30 min",
    },
    {
      id: 5,
      title: "Sonikasi Suspensi",
      detail:
        "Sonikasi larutan selama 2 jam dengan pola 4 × 30 menit dan istirahat 5 menit antar siklus. Waktu sonikasi bervariasi dari 1 jam (2 × 30 menit) hingga 2 jam (4 × 30 menit) sesuai penugasan kelompok. Catat jumlah siklus dan waktu istirahat yang benar-benar dijalankan.",
      rationale:
        "Kavitasi akustik menghasilkan suhu lokal tinggi dan tumbukan antargelembung yang memutus serta membentuk ikatan kimia. Waktu kontak yang sangat singkat inilah yang membuat partikel oksida berukuran nano — menguntungkan karena menekan rekombinasi elektron-hole.",
      equipment: ["Ultrasonic bath", "Stopwatch / timer"],
      safetyNote:
        "Ultrasonic bath menghasilkan panas dan bising. Jangan memasukkan tangan ke dalam bath saat beroperasi; ikuti instruksi operasional alat dari asisten.",
      expectedObservation: "Padatan berwarna putih terbentuk selama proses sonikasi.",
      estimatedTime: "1-2 jam",
    },
    {
      id: 6,
      title: "Filtrasi, Pencucian, dan Pengeringan",
      detail:
        "Saring suspensi secara bertahap: filtrasi gravitasi terlebih dahulu, lanjutkan dengan sentrifugasi bila endapan sulit terpisah. Cuci padatan dengan aqua DM. Pindahkan padatan ke cawan penguapan — JANGAN dikeringkan di atas kertas saring. Keringkan 24 jam pada suhu 85 °C.",
      rationale:
        "Pencucian menghilangkan sisa ion Na^{+} dan Cl^{-} dari NaOH dan klorida prekursor; sisa ion akan muncul sebagai pengotor pada XRD dan mengacaukan massa produk. Pengeringan di kertas saring membuat padatan menempel dan hilang saat dipindahkan.",
      equipment: ["Kertas saring", "Corong", "Alat filtrasi vakum", "Sentrifugator", "Cawan penguapan", "Oven"],
      expectedObservation: "Padatan putih kering yang dapat digerus, massa dicatat sebelum kalsinasi.",
      estimatedTime: "24 jam (termasuk pengeringan)",
    },
    {
      id: 7,
      title: "Kalsinasi 900 °C (M2b)",
      detail:
        "Setelah padatan kering, timbang lalu gerus hingga homogen. Tempatkan sampel dalam krus alumina dan kalsinasi pada 900 °C selama 24 jam dalam furnace. Timbang kembali untuk menghitung persentase hasil sintesis. Sisihkan 0,5 g sampel untuk analisis XRD.",
      rationale:
        "Kalsinasi mengubah fasa amorf/hidroksida menjadi Mg_{2}SnO_{4} kristalin spinel terbalik. Massa sebelum dan sesudah kalsinasi adalah dasar perhitungan rendemen — keduanya wajib dicatat.",
      equipment: ["Mortar dan alu", "Krus alumina", "Furnace", "Timbangan analitik"],
      safetyNote:
        "Furnace 900 °C dan krus panas: gunakan penjepit krus dan sarung tangan tahan panas, dinginkan sampel sesuai prosedur sebelum ditimbang. Operasi furnace hanya dengan izin dan pengawasan asisten.",
      holdPoint: true,
      expectedObservation:
        "Uraikan bentuk, warna, dan tekstur padatan sebelum dan sesudah kalsinasi (bagian kisi-kisi laporan A.1).",
      estimatedTime: "24 jam",
    },
    {
      id: 8,
      title: "Pelet dan Pengukuran Hambatan (M2c)",
      detail:
        "Press bubuk hasil kalsinasi menjadi pelet padat (ketebalan 2-5 mm) dengan press hidrolik, sinter 900 °C selama 12 jam. Amplas kedua sisi, bersihkan dengan etanol, keringkan. Lapisi kedua sisi dengan pasta konduktif (perak/karbon), keringkan pada 120-150 °C. Ukur resistansi R pada dua suhu: suhu ruang dan 100 °C. Catat T dalam Kelvin.",
      rationale:
        "Pengukuran dua titik suhu cukup untuk mendapatkan slope ln(σ) terhadap 1/T, yang dipakai menghitung band gap. Pasta konduktif memastikan kontak listrik yang baik sehingga R yang terukur mewakili sampel, bukan hambatan kontak.",
      equipment: [
        "Press hidrolik",
        "Kertas amplas",
        "Pasta konduktif (perak/karbon)",
        "Multimeter / ohmmeter",
        "Probe dua atau empat titik",
        "Termokopel",
        "Jangka sorong",
      ],
      safetyNote:
        "Press hidrolik dan furnace: ikuti instruksi alat. Bubuk oksida halus tidak boleh terhirup — gunakan masker sesuai SOP penanganan bubuk.",
      holdPoint: true,
      expectedObservation:
        "Dua pasang data (T, R): suhu ruang dan 100 °C. Ukur juga diameter dan ketebalan pelet untuk menghitung A dan L.",
      estimatedTime: "12+ jam (termasuk sintering)",
    },
    {
      id: 9,
      title: "Uji Fotokatalisis Metilen Biru (M2d)",
      detail:
        "Buat 250 mL metilen biru 1,248 × 10^{-5} M (4 ppm) dari larutan stok 6,24 × 10^{-5} M (20 ppm). Ambil 25 mL ke dalam 5 gelas kimia 100 mL berlabel A-E. Ukur absorbansi larutan A pada 500-750 nm secara scanning (A_{0}). Tambahkan 0,10 g sampel hasil sintesis ke B, C, D, dan E lalu aduk — gelas A tanpa sampel. Simpan di ruang UV mini tanpa lampu menyala (gelap), aduk 1 jam, diamkan 5 menit. Ambil 5 mL larutan A dan B, ukur absorbansinya. Nyalakan UV 30 menit, matikan pengaduk dan lampu 5 menit, ambil A dan C. Ulangi untuk A dan D (60 menit) serta A dan E (90 menit).",
      rationale:
        "Tahap gelap 1 jam memisahkan penurunan absorbansi karena adsorpsi pada permukaan katalis dari degradasi akibat foto-oksidasi. Gelas A tanpa fotokatalis adalah kontrol untuk memastikan penurunan bukan berasal dari penyinaran saja.",
      equipment: [
        "Metilen biru (stok 20 ppm)",
        "5 gelas kimia 100 mL",
        "Spektrofotometer UV-Vis (mode scanning 500-750 nm)",
        "Ruang/kotak UV",
        "Pipet volume",
        "Sentrifugator",
      ],
      safetyNote:
        "Lampu UV berbahaya bagi mata dan kulit. Jangan melihat langsung ke sumber UV dan jangan membuka ruang UV saat lampu menyala; ikuti SOP peralatan UV laboratorium.",
      holdPoint: true,
      expectedObservation:
        "Hati-hati agar padatan fotokatalis tidak terbawa saat mengambil larutan — lakukan sentrifugasi jika padatan sulit dipisahkan. Warna biru memudar seiring waktu penyinaran.",
      estimatedTime: "2,5+ jam",
    },
    {
      id: 10,
      title: "Pengolahan Data dan Handoff XRD",
      detail:
        "Hitung σ = L/(R × A) untuk kedua suhu, lalu ln(σ) dan 1/T. Hitung slope dari dua titik data dan band gap E_{g} = −2k × slope dengan k = 8,617 × 10^{-5} eV/K. Gambarkan grafik A_{i}/A_{0} vs waktu dan grafik ln(C_{i}/C_{0}) vs waktu, lalu tentukan orde reaksi degradasi. Serahkan 0,5 g sampel untuk XRD (lanjut ke Modul 5).",
      rationale:
        "Band gap dan orde reaksi adalah dua kesimpulan kuantitatif modul ini. Keduanya harus dibandingkan dengan nilai literatur (Mg_{2}SnO_{4} dilaporkan sekitar 2,88-4,88 eV) dan dibahas kaitannya dengan aktivitas di bawah UV maupun sinar tampak.",
      equipment: ["Origin / Excel", "Kalkulator", "Data R-T dan absorbansi"],
      expectedObservation:
        "Bandingkan rendemen aktual dengan massa teoretis dan bahas penyebab penyimpangan.",
      estimatedTime: "45 min",
    },
  ];

  const checks: WalkthroughCheck[] = [
    {
      afterStep: 1,
      question:
        "Mengapa H_{2}O_{2} 30% ditambahkan ke larutan SnCl_{2}·2H_{2}O sebelum digabungkan dengan larutan magnesium?",
      options: [
        "Untuk menurunkan pH larutan sebelum NaOH ditambahkan",
        "Untuk mengoksidasi Sn^{2+} menjadi Sn^{4+}, spesi yang dibutuhkan untuk membentuk kerangka ortostanat SnO_{4}^{4-}",
        "Untuk melarutkan MgCl_{2}·6H_{2}O yang sukar larut dalam air",
        "Sebagai sumber oksigen agar sonikasi menghasilkan gelembung",
      ],
      correctIndex: 1,
      explanation:
        "Mg_{2}SnO_{4} adalah oksida berbasis ortostanat (SnO_{4}^{4-}) dengan timah pada tingkat oksidasi +4, sedangkan prekursor SnCl_{2}·2H_{2}O menyediakan Sn^{2+}. H_{2}O_{2} berperan sebagai oksidator yang mengubah Sn^{2+} menjadi Sn^{4+}. Karena itu penambahannya dilakukan tetes-per-tetes dan campuran diaduk sebelum tahap berikutnya.",
    },
    {
      afterStep: 3,
      question:
        "Menurut prosedur modul, sampai pH berapa NaOH 4 M ditambahkan, dan bagaimana Anda harus memperlakukan nilai tersebut?",
      options: [
        "pH 7 tepat — nilai netral wajib dicapai sebelum sonikasi",
        "pH 10-13 (variatif) — pH aktual adalah data eksperimen yang harus dicatat dan dilaporkan",
        "pH 4-5 — kondisi asam diperlukan agar Sn^{4+} tidak mengendap",
        "pH bebas, selama larutan sudah keruh",
      ],
      correctIndex: 1,
      explanation:
        "Modul menetapkan penambahan NaOH 4 M tetes demi tetes hingga pH 10-13 dan menyebut rentang ini variatif. Artinya pH bukan konstanta yang bisa diasumsikan: pH target dan pH aktual, beserta volume NaOH yang dipakai, termasuk data pengamatan yang dibahas dalam laporan.",
    },
    {
      afterStep: 5,
      question:
        "Mengapa padatan hasil sonikasi harus dicuci dengan aqua DM dan dipindahkan ke cawan penguapan, bukan dikeringkan di atas kertas saring?",
      options: [
        "Agar padatan lebih cepat kering pada suhu 85 °C",
        "Karena pencucian menghilangkan sisa ion Na^{+} dan Cl^{-}, dan pengeringan di kertas saring membuat padatan menempel sehingga hilang saat dipindahkan",
        "Karena kertas saring bereaksi dengan Mg_{2}SnO_{4} pada suhu 85 °C",
        "Agar warna padatan tetap putih",
      ],
      correctIndex: 1,
      explanation:
        "Prosedur secara eksplisit meminta pencucian dengan aqua DM untuk menghilangkan sisa ion lain seperti Na dan Cl, dan memberi peringatan \"jangan dikeringkan di atas kertas saring\". Sisa ion muncul sebagai pengotor pada difraktogram XRD, sementara padatan yang menempel pada kertas saring langsung mengurangi massa produk dan rendemen.",
    },
    {
      afterStep: 7,
      question:
        "Dari pengukuran resistansi pada dua suhu, bagaimana band gap Mg_{2}SnO_{4} dihitung menurut modul?",
      options: [
        "E_{g} = σ × R × A, langsung dari konduktivitas pada suhu ruang",
        "E_{g} = −2k × slope, dengan slope = [ln(σ_{2}) − ln(σ_{1})] / (1/T_{2} − 1/T_{1}) dan k = 8,617 × 10^{-5} eV/K",
        "E_{g} = h c / λ dari panjang gelombang serapan maksimum metilen biru",
        "E_{g} dibaca langsung dari nilai FWHM difraktogram XRD",
      ],
      correctIndex: 1,
      explanation:
        "Alur modul: hitung σ = L/(R × A) untuk tiap suhu, lalu ln(σ) dan 1/T (T dalam Kelvin). Slope dari dua titik data itu dimasukkan ke E_{g} = −2k × slope dengan k = 8,617 × 10^{-5} eV/K. Karena hanya dua titik yang diukur, hasilnya sensitif terhadap ketepatan R dan T — itulah alasan pasta konduktif dan termokopel dipakai.",
    },
    {
      afterStep: 8,
      question:
        "Pada uji fotokatalisis, apa fungsi gelas kimia A dan tahap pengadukan 1 jam dalam ruang gelap sebelum lampu UV dinyalakan?",
      options: [
        "A adalah blanko pelarut, dan tahap gelap hanya untuk menghemat waktu",
        "A adalah kontrol tanpa fotokatalis, dan tahap gelap memisahkan penurunan absorbansi akibat adsorpsi pada katalis dari degradasi akibat penyinaran",
        "A berisi katalis paling banyak sebagai pembanding tertinggi",
        "Tahap gelap dipakai untuk memanaskan larutan hingga suhu reaksi",
      ],
      correctIndex: 1,
      explanation:
        "Prosedur menyatakan gelas kimia A hanya berisi larutan metilen biru tanpa sampel, dan A selalu diukur bersama gelas uji pada setiap titik waktu — itulah fungsi kontrol. Pengadukan 1 jam dalam gelap membuat adsorpsi mencapai kesetimbangan lebih dulu, sehingga penurunan absorbansi setelah UV menyala dapat diatribusikan pada aktivitas fotokatalitik, bukan sekadar penyerapan pewarna di permukaan padatan.",
    },
  ];

  const prelabTasks = [
    "Jelaskan prinsip dasar fotokatalisis, termasuk peran pasangan elektron-hole dan pembentukan spesi oksigen reaktif (ROS) dalam degradasi kontaminan.",
    "Jelaskan apa yang dimaksud band gap dan bagaimana menentukan nilainya secara eksperimental melalui pengukuran hambatan listrik.",
    "Jelaskan prinsip metode sonokimia dan peran kavitasi akustik dalam pembentukan partikel.",
    "Apa yang dimaksud proses kalsinasi dalam sintesis material oksida, dan mengapa tahap ini penting untuk Mg_{2}SnO_{4}?",
    "Tuliskan reaksi pembentukan Mg_{2}SnO_{4} berdasarkan pereaksi yang digunakan, jelaskan transformasi Mg^{2+}(aq) dan Sn^{4+}(aq) menjadi oksidanya, dan hitung massa teoretis produk dari jumlah pereaksi pada prosedur.",
    "Bagaimana kecenderungan absorbansi metilen biru terhadap waktu penyinaran UV? Apa yang terjadi bila sumber cahaya diganti sinar tampak (λ = 400-700 nm), dan mengapa?",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[var(--on-surface-variant)]">
        <Link href="/prelab" className="hover:underline">Pre-lab</Link>
        <span className="mx-1">/</span>
        <span aria-current="page" className="text-[var(--on-surface)]">
          M2 — <ChemText>{module.titleShort}</ChemText>
        </span>
      </nav>

      {/* Header */}
      <header className="rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)]/30 shadow-ambient p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-3xl text-[var(--primary-container)]">
            <span aria-hidden="true" className="material-symbols-outlined">{module.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Pre-lab: <ChemText>{module.titleShort}</ChemText>
            </h1>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">
              <ChemText>{module.title}</ChemText>
            </p>
            <p className="text-xs text-[var(--on-surface-variant)] mt-2">
              Modul berjalan lintas sesi: M2a sintesis, M2b kalsinasi, M2c pengukuran band gap, M2d uji fotokatalisis.
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
                <span className="flex-1"><ChemText>{o}</ChemText></span>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Timeline overview — this module's stages span multiple lab sessions */}
      <section className="mb-6 rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)]/30 shadow-ambient p-5">
        <div className="flex items-center gap-2 mb-4">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--secondary)]" style={{ fontVariationSettings: "'FILL' 1" }}>
            schedule
          </span>
          <h2 className="text-lg font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Linimasa Tahap M2
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { tag: "M2a", label: "Sintesis", detail: "Preparasi prekursor, pH 10-13, sonikasi 1-2 jam, filtrasi, pengeringan 24 jam @ 85 °C" },
            { tag: "M2b", label: "Kalsinasi", detail: "Gerus, krus alumina, 900 °C selama 24 jam, timbang untuk rendemen, sisihkan 0,5 g untuk XRD" },
            { tag: "M2c", label: "Band gap", detail: "Press pelet 2-5 mm, sinter 900 °C 12 jam, pasta konduktif, ukur R pada suhu ruang dan 100 °C" },
            { tag: "M2d", label: "Fotokatalisis", detail: "Metilen biru 4 ppm, gelas A-E, 1 jam gelap, penyinaran UV 30/60/90 menit" },
          ].map((s) => (
            <div key={s.tag} className="rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4">
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
          Catatan penomoran: daftar isi penuntun menuliskan uji fotokatalisis sebagai M2c, sedangkan badan prosedur
          menuliskannya sebagai M2d (pengukuran band gap juga tertulis M2c). Konfirmasikan label tahap dengan asisten
          sebelum mengisi jurnal.
        </p>
      </section>

      {/* Key equations for this module */}
      <section className="mb-6 grid gap-3 lg:grid-cols-2">
        <Equation
          tex={"\\sigma = \\frac{L}{R \\times A}"}
          label="Konduktivitas"
          description="L = ketebalan pelet, A = luas penampang, R = hambatan terukur."
        />
        <Equation
          tex={"E_g = -2k \\cdot \\text{slope}, \\quad \\text{slope} = \\frac{\\ln(\\sigma_2) - \\ln(\\sigma_1)}{\\frac{1}{T_2} - \\frac{1}{T_1}}"}
          label="Band gap dari dua titik suhu"
          description="k = 8,617 × 10⁻⁵ eV/K, T dalam Kelvin."
        />
      </section>

      {/* Pre-lab tasks from the manual */}
      <section className="mb-6 rounded-xl bg-[var(--surface-container-low)] border border-[var(--outline-variant)]/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--secondary)]" style={{ fontVariationSettings: "'FILL' 1" }}>
            assignment
          </span>
          <h2 className="text-lg font-bold text-[var(--on-surface)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Tugas Pendahuluan M2
          </h2>
        </div>
        <ol className="space-y-2 text-sm text-[var(--on-surface)] list-decimal list-inside">
          {prelabTasks.map((t, i) => (
            <li key={i} className="leading-relaxed"><ChemText>{t}</ChemText></li>
          ))}
        </ol>
      </section>

      {/* Safety boundary */}
      <div className="mb-6">
        <SafetyCallout variant="danger" title="Batas Keselamatan Modul 2">
          <p>
            Modul ini melibatkan HCl pekat, H<sub>2</sub>O<sub>2</sub> 30%, NaOH 4 M, NH<sub>4</sub>OH, etanol,
            ultrasonic bath, press hidrolik, furnace 900 °C, bubuk oksida, dan lampu UV. Instruksi penanganan rinci
            harus mengikuti SOP/SDS laboratorium yang berlaku saat ini dan arahan asisten — bukan halaman ini.
          </p>
        </SafetyCallout>
      </div>

      {/* Interactive Procedure Walkthrough */}
      <ProcedureWalkthrough
        title="Walkthrough Prosedur M2"
        intro="Ikuti langkah demi langkah M2a sampai M2d. Cek pemahaman muncul pada langkah tertentu — Anda harus menjawab sebelum melanjutkan."
        steps={steps}
        checks={checks}
      />

      {/* After walkthrough: link to module */}
      <section className="mt-6 rounded-xl bg-[var(--primary-container)] p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
          Siap untuk Workspace Modul?
        </h2>
        <p className="text-sm text-white/70 mb-4">
          Lanjutkan ke worksheet konduktivitas/band gap dan analisis absorbansi fotokatalisis.
        </p>
        <Link
          href="/modules/m2-mg2sno4"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--secondary-container)] px-6 py-3 font-bold text-[var(--primary)] hover:opacity-90 transition-opacity"
        >
          <span aria-hidden="true" className="material-symbols-outlined">menu_book</span>
          Buka Modul M2 Interaktif
        </Link>
      </section>
    </div>
  );
}
