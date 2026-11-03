import { ModuleLayout } from "@/components/layout/ModuleLayout";

import { Equation } from "@/components/shared/Equation";
import { ReportChecklist } from "@/components/shared/ReportChecklist";
import { BETPoreFilling, IUPACGallery } from "@/components/interactives/BETTheoryVisuals";
import { BETExcelTutorial } from "@/components/interactives/BETExcelTutorial";
import { ClaimEvidenceReasoning } from "@/components/shared/ClaimEvidenceReasoning";
import { BET_CONSTANTS, CONCLUSION_QUESTIONS, GIVEN_COLUMNS, GUIDE_RESULTS } from "@/lib/m7-bet";
import { getModule } from "@/lib/modules";

const CARD = "rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 sm:p-5";

export default function M7BetPage() {
  const module = getModule("m7-bet")!;

  return (
    <ModuleLayout module={module}>
      {/* ── Apa yang diukur ─────────────────────────────────────────────── */}
      <section aria-labelledby="m7-adsorpsi" className={CARD}>
        <h2 id="m7-adsorpsi" className="text-lg font-bold text-[var(--foreground)]">
          Adsorpsi gas pada permukaan padatan
        </h2>

        <div className="mt-2 overflow-x-auto rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <caption className="sr-only">Perbandingan fisisorpsi dan kemisorpsi</caption>
            <thead>
              <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-control)]">
                <th scope="col" className="px-3 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Aspek</th>
                <th scope="col" className="px-3 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Fisisorpsi</th>
                <th scope="col" className="px-3 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Kemisorpsi</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Gaya", "Van der Waals", "Ikatan kimia"],
                ["Kalor adsorpsi", "Rendah (10–40 kJ/mol)", "Tinggi (40–400 kJ/mol)"],
                ["Lapisan", "Monolayer dan multilayer", "Monolayer"],
                ["Reversibilitas", "Reversibel", "Sering ireversibel"],
                ["Suhu", "Rendah, dekat titik didih gas", "Umumnya tinggi"],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-2 text-[12px] font-semibold text-[var(--foreground)]">{row[0]}</td>
                  <td className="px-3 py-2 text-[12px] text-[var(--foreground)]">{row[1]}</td>
                  <td className="px-3 py-2 text-[12px] text-[var(--text-secondary)]">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Karakterisasi luas permukaan spesifik dengan metode BET (*Brunauer–Emmett–Teller*)
          bertumpu pada fenomena <strong>fisisorpsi</strong> molekul gas pada permukaan padatan.
          Agar molekul gas dapat menempel secara fisik tanpa merusak struktur sampel, pengukuran
          dijalankan pada suhu kriogenik. Gas nitrogen (N₂) dipilih sebagai adsorbat standar karena
          sifatnya inert, berinteraksi lemah dengan permukaan, dan memiliki luas penampang molekul
          yang terkarakterisasi baik, yaitu <strong>0,162 nm²</strong> (<em>molecular cross-sectional area</em>, A_cs).
          Pada suhu nitrogen cair <strong>77 K</strong> (-196 °C), tekanan uap jenuh N₂ (P₀)
          berada di kisaran 1 atm, sehingga rentang tekanan relatif P/P₀ dari 0 hingga mendekati 1
          sangat praktis dikontrol di laboratorium.
        </p>

        {/* ── Definisi P/P₀ ─────────────────────────────────────────────── */}
        <div
          id="m7-pp0"
          className="mt-3 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-3.5"
        >
          <h3 className="text-[13px] font-bold text-[var(--foreground)]">
            Memahami Besaran P/P₀ (Tekanan Relatif)
          </h3>

          <p className="mt-1.5 text-[12.5px] leading-6 text-[var(--text-secondary)]">
            Dalam eksperimen adsorpsi gas, tekanan gas tidak disajikan sebagai tekanan mutlak,
            melainkan sebagai rasio tanpa satuan yang disebut <strong>tekanan relatif (P/P₀)</strong>:
          </p>

          <ul className="mt-1 space-y-1 pl-4 text-[12px] leading-relaxed text-[var(--text-secondary)]">
            <li>
              <strong className="text-[var(--foreground)]">P</strong> adalah tekanan kesetimbangan
              gas N₂ di dalam tabung sampel (biasanya terbaca dalam satuan mmHg atau kPa).
            </li>
            <li>
              <strong className="text-[var(--foreground)]">P₀</strong> adalah tekanan uap jenuh N₂
              cair pada suhu tabung (77 K), yaitu batas tekanan ketika gas N₂ mulai mengembun
              menjadi fase cair ruah (~760 mmHg atau 1 atm).
            </li>
            <li>
              <strong className="text-[var(--foreground)]">P/P₀</strong> merupakan perbandingan
              keduanya dengan rentang 0 hingga 1. Nilai 0 berarti kondisi vakum total, sedangkan
              1 berarti gas berada tepat di ambang kondensasi total.
            </li>
          </ul>

          <p className="mt-2 text-[12.5px] leading-6 text-[var(--text-secondary)]">
            <strong>Mengapa kita memakai rasio P/P₀, bukan P biasa?</strong> Secara termodinamika,
            banyaknya gas yang menempel pada dinding pori dikendalikan oleh{" "}
            <em>seberapa dekat kondisi gas tersebut ke titik embunnya</em>, bukan sekadar nilai
            tekanan absolutnya. Dengan menormalkan P terhadap P₀, perilaku adsorpsi menjadi setara
            dan dapat diperbandingkan antar-laboratorium di seluruh dunia—meskipun tekanan udara
            harian atau ketinggian lab berbeda-beda.
          </p>

          <div className="mt-2.5 overflow-x-auto rounded-md border border-[var(--outline-variant)]">
            <table className="w-full min-w-[26rem] border-collapse text-left">
              <caption className="sr-only">Makna fisik setiap rentang P/P0</caption>
              <thead>
                <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-control)]">
                  <th scope="col" className="px-2.5 py-1.5 text-[10.5px] font-semibold text-[var(--text-secondary)]">Rentang P/P₀</th>
                  <th scope="col" className="px-2.5 py-1.5 text-[10.5px] font-semibold text-[var(--text-secondary)]">Proses Fisik di Permukaan Pori</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["0", "Vakum: permukaan pori bersih dan siap ditempeli molekul gas."],
                  ["≈ 0,05–0,30", "Monolayer (lapisan tunggal) terbentuk lengkap, disusul pembentukan awal multilayer. Ini adalah jendela kerja analisis BET."],
                  ["≈ 0,30–0,90", "Multilayer makin menebal. Pada material berpori mesopori (2–50 nm), terjadi pengisian kapiler (kondensasi kapiler) di dalam pori."],
                  ["→ 1", "Kondensasi ruah: seluruh ruang pori terisi penuh cairan N₂ dan mendekati saturasi total."],
                ].map(([r, t]) => (
                  <tr key={r} className="border-b border-[var(--border)] last:border-0">
                    <td className="whitespace-nowrap px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[var(--foreground)]">{r}</td>
                    <td className="px-2.5 py-1.5 text-[12px] leading-snug text-[var(--text-secondary)]">{t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-[11.5px] leading-snug text-[var(--text-secondary)]">
            <strong className="text-[var(--foreground)]">Catatan penting: P₀ diukur, bukan diasumsikan.</strong>{" "}
            Nilai P₀ dipantau secara berkala selama pengujian menggunakan tabung referensi tersendiri.
            Tekanan uap jenuh N₂ sangat peka terhadap kemurnian cairan nitrogen dan tekanan atmosfer
            setempat, sehingga angka 1 atm hanyalah aproksimasi teoritis di permukaan laut.
          </p>
        </div>

        <p className="mt-2 text-[11px] leading-snug text-[var(--text-secondary)]">
          Karena instrumen dijalankan oleh teknisi/asisten, praktikan tidak menjalankan pengukuran
          langsung di laboratorium, melainkan mengolah berkas data mentah hasil karakterisasi.
        </p>
      </section>

      {/* ── Cara isoterm diukur ─────────────────────────────────────────── */}
      <section aria-labelledby="m7-ukur" className={`${CARD} mt-4`}>
        <h2 id="m7-ukur" className="text-lg font-bold text-[var(--foreground)]">
          Bagaimana isoterm N₂ diukur
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Data mentah yang Anda terima di lembar kerja dihasilkan melalui tahapan fisik terstandarisasi
          di dalam instrumen porosimetri gas. Secara umum, alur pengukurannya mengikuti enam tahapan berikut:
        </p>

        <ol className="mt-2.5 space-y-2">
          {[
            {
              t: "1. Degassing — pembersihan rongga pori",
              b: "Sebelum diukur, pori sampel harus dikosongkan dari molekul asing seperti uap air dari udara atau residu pelarut sintesis. Sampel dipanaskan di bawah vakum tinggi. Untuk material seperti MOF, suhu aktivasi umumnya berkisar 100–200 °C selama beberapa jam hingga semalam (disesuaikan dengan ketahanan termal kerangka agar kristal tidak rusak). Bobot kering sampel setelah degassing ditimbang secara presisi sebagai faktor pembagi volume spesifik V (cm³/g).",
            },
            {
              t: "2. Pendinginan ke suhu kriogenik (77 K)",
              b: "Tabung sampel diturunkan ke dalam bejana Dewar berisi cairan nitrogen (77 K / -196 °C). Suhu rendah ini memperlambat energi kinetik molekul N₂ sehingga gaya Van der Waals cukup kuat untuk menahan molekul pada dinding pori. Selain itu, karena N₂ berada di dekat titik didihnya, variasi tekanan gas di tabung dapat mencakup seluruh rentang P/P₀ dari 0 hingga mendekati 1.",
            },
            {
              t: "3. Dosis gas bertahap dan pencapaian kesetimbangan",
              b: "Instrumen menginjeksikan gas N₂ dalam jumlah terukur (dosis kecil) ke dalam tabung sampel, lalu memantau tekanannya hingga stabil. Begitu laju adsorpsi dan desorpsi seimbang dan tekanan tidak lagi berubah, sistem dinyatakan mencapai kesetimbangan. Tekanan dan volume gas pada setiap titik kesetimbangan inilah yang dicatat menjadi satu baris data isoterm.",
            },
            {
              t: "4. Penentuan jumlah gas yang teradsorpsi",
              b: "Metode yang paling umum adalah volumetrik manometrik: instrumen mengukur penurunan tekanan dalam ruang tertutup bervolume tetap. Menggunakan hukum gas ideal serta koreksi volume kosong tabung (dead volume yang dikalibrasi sebelumnya dengan gas helium), dihitung berapa mol N₂ yang berpindah dari fase gas ke permukaan pori. Alternatif lain adalah metode gravimetri dengan menimbang langsung pertambahan mikrogram sampel.",
            },
            {
              t: "5. Siklus adsorpsi dan desorpsi (pembentukan histeresis)",
              b: "Pengukuran dimulai dari tekanan rendah menuju tekanan tinggi (cabang adsorpsi), kemudian dilanjutkan dengan menyedot gas kembali secara bertahap menuju tekanan rendah (cabang desorpsi). Pada material mesopori (2–50 nm), cairan N₂ yang mengembun di leher pori tertahan oleh kelengkungan meniskus sehingga baru menguap pada tekanan yang lebih rendah dari saat pengisiannya. Perbedaan jalur naik dan turun ini membentuk loop histeresis.",
            },
            {
              t: "6. Luaran data terstandarisasi (cm³/g STP)",
              b: "Hasil akhir berupa tabel data pasangan P/P₀ terhadap volume gas teradsorpsi V. Volume gas selalu dinormalisasi ke kondisi standar (STP: 0 °C, 1 atm, di mana 1 mol gas ideal = 22.414 cm³) per gram massa adsorben bersih. Berdasarkan tabel inilah kurva isoterm diplot, tipe pori diidentifikasi via klasifikasi IUPAC, dan luas permukaan spesifik dihitung dengan persamaan BET.",
            },
          ].map((s, i) => (
            <li key={s.t} className="rounded-lg border border-[var(--border)] bg-[var(--surface-container-lowest)] p-3">
              <div className="flex items-baseline gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-[10px] font-bold text-[var(--surface-container-lowest)]">
                  {i + 1}
                </span>
                <h3 className="text-[13px] font-bold text-[var(--foreground)]">{s.t}</h3>
              </div>
              <p className="mt-1 pl-7 text-[12px] leading-relaxed text-[var(--text-secondary)]">{s.b}</p>
            </li>
          ))}
        </ol>

        <p className="mt-2.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-control)] px-3 py-2 text-[11.5px] leading-snug text-[var(--text-secondary)]">
          <strong className="text-[var(--foreground)]">Konsep kunci:</strong> Luas permukaan
          spesifik BET bukanlah luas geometris tampak luar partikel. Yang diukur adalah total luas
          bidang kontak molekul N₂ yang melapisi seluruh lekuk dan dinding pori internal, sehingga
          nilainya dapat mencapai ratusan hingga ribuan m²/g padatan.
        </p>
      </section>

      {/* ── Isoterm + animasi pori ──────────────────────────────────────── */}
      <section aria-labelledby="m7-isoterm" className={`${CARD} mt-4`}>
        <h2 id="m7-isoterm" className="text-lg font-bold text-[var(--foreground)]">
          Apa yang terjadi di dalam pori
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Gunakan slider P/P₀ atau tekan tombol Putar untuk mengamati dinamika molekul di dalam pori
          bersamaan dengan kurva isotermnya. Keduanya terikat pada model fisika yang sama: dinding
          pori mengikat lapisan pertama (monolayer), dilanjutkan penumpukan lapisan berganda (multilayer),
          hingga bagian tengah terisi penuh oleh kondensasi kapiler. Saat tekanan diturunkan,
          pengosongan cairan kapiler tertahan—membentuk cabang desorpsi yang melahirkan histeresis.
        </p>
        <div className="mt-2">
          <BETPoreFilling />
        </div>
      </section>

      {/* ── Klasifikasi IUPAC ───────────────────────────────────────────── */}
      <section aria-labelledby="m7-iupac" className={`${CARD} mt-4`}>
        <h2 id="m7-iupac" className="text-lg font-bold text-[var(--foreground)]">
          Klasifikasi isoterm (IUPAC)
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Profil kurva isoterm mencerminkan arsitektur rongga pori pada material. Pilih salah satu tipe
          kurva IUPAC di bawah ini untuk mempelajari kaitan antara pola grafik, ukuran pori (mikro,
          meso, atau makropori), dan kekuatan interaksi adsorbat–adsorben.
        </p>
        <div className="mt-2">
          <IUPACGallery />
        </div>
      </section>

      {/* ── Persamaan BET ───────────────────────────────────────────────── */}
      <section aria-labelledby="m7-persamaan" className={`${CARD} mt-4`}>
        <h2 id="m7-persamaan" className="text-lg font-bold text-[var(--foreground)]">
          Persamaan BET
        </h2>
        <div className="mt-2">
          <Equation
            tex={"\\frac{1}{W\\left(\\frac{P_0}{P}-1\\right)} = \\frac{1}{W_m C} + \\frac{C-1}{W_m C}\\cdot\\frac{P}{P_0}"}
            label="Persamaan BET (basis massa)"
            description="W = massa gas N₂ teradsorpsi; Wm = massa N₂ untuk satu lapisan monolayer lengkap; C = konstanta BET tak berdimensi yang mencerminkan energi adsorpsi lapisan pertama."
          />
        </div>

        <div className="mt-3 grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
          <ul className="list-disc space-y-1.5 pl-5 text-[12.5px] leading-snug">
            <li>Permukaan adsorben diasumsikan homogen secara energetika.</li>
            <li>Kalor adsorpsi lapisan pertama bernilai spesifik, sedangkan lapisan berikutnya memiliki kalor adsorpsi setara kalor pencairan gas (kondensasi ruah).</li>
            <li>Tidak ada interaksi lateral antarmolekul gas dalam lapisan adsorpsi yang sama.</li>
            <li>Jumlah lapisan adsorpsi mendekati tak terhingga saat gas mendekati saturasi (P/P₀ → 1).</li>
          </ul>
          <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-control)] p-3">
            <p className="text-[12px] font-semibold text-[var(--foreground)]">Jendela Linear BET</p>
            <p className="mt-1 text-[12px] leading-relaxed">
              Secara teori persamaan BET linear pada rentang P/P₀ <strong>0,05–0,35</strong>.
              Pada panduan modul ini, jendela yang ditetapkan adalah <strong>0,05–0,30</strong>.
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-[var(--text-secondary)]">
              Gunakan hanya titik dari cabang <em>adsorpsi</em> (bukan desorpsi), dan gunakan nilai <em>P/P₀</em> (bukan tekanan absolut P).
            </p>
          </div>
        </div>
      </section>

      {/* ── Kurva ke luas permukaan ─────────────────────────────────────── */}
      <section aria-labelledby="m7-hitung" className={`${CARD} mt-4`}>
        <h2 id="m7-hitung" className="text-lg font-bold text-[var(--foreground)]">
          Dari kurva BET ke luas permukaan
        </h2>
        <div className="mt-2 overflow-x-auto rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <caption className="sr-only">Besaran dan rumus pengolahan BET</caption>
            <thead>
              <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-control)]">
                <th scope="col" className="px-3 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Besaran</th>
                <th scope="col" className="px-3 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">Rumus</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Slope (b)", "(C − 1)/(Wₘ·C)"],
                ["Intersep (a)", "1/(Wₘ·C)"],
                ["Wₘ", "1/(a + b)"],
                ["C", "b/a + 1"],
                ["S (luas permukaan spesifik)", "Wₘ · N · A_cs / M"],
              ].map(([k, f]) => (
                <tr key={k} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-2 text-[12.5px] font-semibold text-[var(--foreground)]">{k}</td>
                  <td className="px-3 py-2 font-mono text-[12px] text-[var(--text-secondary)]">{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] leading-snug text-[var(--text-secondary)]">
          Untuk basis volume: Vm = 1/(a + b) dan luas permukaan dihitung melalui S = Vm · N · A_cs / 22414.
          Hasil perhitungan basis volume dan basis massa harus menghasilkan nilai yang sama persis—gunakan
          keselarasan ini sebagai verifikasi mandiri atas rumus lembar kerja Anda.
        </p>
        <p className="mt-1 font-mono text-[11px] text-[var(--text-secondary)]">
          N = {BET_CONSTANTS.avogadro.toExponential(4)} /mol · A_cs = {BET_CONSTANTS.crossSection.toExponential(2)} m² ·
          V_molar = {BET_CONSTANTS.molarVolume} cm³/mol · M = {BET_CONSTANTS.molarMassN2} g/mol
        </p>
      </section>

      {/* ── Data yang diberikan ─────────────────────────────────────────── */}
      <section aria-labelledby="m7-data" className={`${CARD} mt-4`}>
        <h2 id="m7-data" className="text-lg font-bold text-[var(--foreground)]">
          Data yang diberikan
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Pada sesi ini Anda menerima berkas data mentah empat kolom hasil pengujian instrumen. Sebelum
          memulai regresi, lakukan seleksi data: gunakan hanya titik-titik dari cabang <strong>adsorpsi</strong> yang
          berada di dalam jendela linear BET (P/P₀ 0,05–0,30).
        </p>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="overflow-x-auto rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            <table className="w-full min-w-[20rem] border-collapse text-sm">
              <caption className="sr-only">Kolom data isoterm yang diberikan</caption>
              <thead>
                <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-control)]">
                  {["Kolom", "Isi", "Satuan"].map((h) => (
                    <th key={h} scope="col" className="px-2.5 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GIVEN_COLUMNS.map((c) => (
                  <tr key={c.column} className="border-b border-[var(--border)] last:border-0">
                    <td className="whitespace-nowrap px-2.5 py-2 font-mono text-[11.5px] text-[var(--foreground)]">{c.column}</td>
                    <td className="px-2.5 py-2 text-[11.5px] text-[var(--text-secondary)]">{c.content}</td>
                    <td className="whitespace-nowrap px-2.5 py-2 text-[11px] text-[var(--text-secondary)]">{c.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
            <table className="w-full min-w-[18rem] border-collapse text-sm">
              <caption className="sr-only">Jumlah dan rentang titik BET tiap sampel</caption>
              <thead>
                <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-control)]">
                  {["Sampel", "Titik BET", "Rentang P/P₀"].map((h) => (
                    <th key={h} scope="col" className="px-2.5 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GUIDE_RESULTS.map((g) => (
                  <tr key={g.sample} className="border-b border-[var(--border)] last:border-0">
                    <td className="whitespace-nowrap px-2.5 py-2 text-[11.5px] font-semibold text-[var(--foreground)]">{g.sample}</td>
                    <td className="px-2.5 py-2 text-[11.5px] text-[var(--text-secondary)]">{g.points}</td>
                    <td className="whitespace-nowrap px-2.5 py-2 font-mono text-[11px] text-[var(--text-secondary)]">{g.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Tutorial Excel ──────────────────────────────────────────────── */}
      <section aria-labelledby="m7-excel" className={`${CARD} mt-4`}>
        <h2 id="m7-excel" className="text-lg font-bold text-[var(--foreground)]">
          Pengolahan manual di Excel
        </h2>
        <div className="mt-2">
          <BETExcelTutorial />
        </div>
      </section>

      {/* ── Validitas ───────────────────────────────────────────────────── */}
      <section aria-labelledby="m7-valid" className={`${CARD} mt-4`}>
        <h2 id="m7-valid" className="text-lg font-bold text-[var(--foreground)]">
          Periksa validitas — bukan hanya nilai R²
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Kurva regresi yang lurus (R² dan r mendekati 1) belum tentu valid secara fisik. Syarat mutlak
          keabsahan model BET adalah <strong>intersep (a) harus positif</strong>, sehingga konstanta
          energi <strong>C = (b/a) + 1 juga bernilai positif</strong>. Jika intersep bernilai negatif (C &le; 0),
          asumsi fisisorpsi model BET gugur secara termodinamika. Pada kondisi ini, nilai luas permukaan
          tetap dihitung dan dilaporkan dalam tabel, namun wajib diberi status tegas <strong>tidak valid</strong> disertai
          pembahasan ilmiah mengapa model BET gagal pada material mikropori tersebut.
        </p>
        <p className="mt-1.5 font-mono text-[12px] text-[var(--foreground)]">
          =IF(C&lt;=0,&quot;C negatif, BET tidak valid&quot;,&quot;C positif, BET dapat dipakai&quot;)
        </p>
      </section>

      {/* ── Hasil acuan ─────────────────────────────────────────────────── */}
      <section aria-labelledby="m7-acuan" className={`${CARD} mt-4`}>
        <h2 id="m7-acuan" className="text-lg font-bold text-[var(--foreground)]">
          Hasil yang diharapkan
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Ketiga variasi sampel Al-Fumarat (Al-Fum) menghasilkan regresi linear dengan koefisien korelasi
          yang sangat tinggi (R² &gt; 0,995). Namun, seluruh sampel menghasilkan intersep bernilai negatif
          sehingga nilai C negatif dan hasil BET secara teoritis tidak valid. Meskipun demikian, tren luas
          permukaan tampak menurun secara teratur dari rasio 1:2 menuju 1:4 seiring variasi kondisi sintesis.
        </p>
        <div className="mt-2 overflow-x-auto rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <caption className="sr-only">Hasil pengolahan BET tiga sampel Al-Fum</caption>
            <thead>
              <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-control)]">
                {["Sampel", "Titik", "b", "a", "R²", "Vm (cm³/g)", "C", "S (m²/g)", "Status"].map((h) => (
                  <th key={h} scope="col" className="px-2 py-2 text-left text-[11px] font-semibold text-[var(--text-secondary)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GUIDE_RESULTS.map((g) => (
                <tr key={g.sample} className="border-b border-[var(--border)] last:border-0">
                  <td className="whitespace-nowrap px-2 py-2 text-[12px] font-semibold text-[var(--foreground)]">{g.sample}</td>
                  <td className="px-2 py-2 text-[12px] text-[var(--text-secondary)]">{g.points}</td>
                  <td className="whitespace-nowrap px-2 py-2 font-mono text-[11.5px] text-[var(--text-secondary)]">{g.slope}</td>
                  <td className="whitespace-nowrap px-2 py-2 font-mono text-[11.5px] text-[var(--text-secondary)]">{g.intercept}</td>
                  <td className="px-2 py-2 font-mono text-[11.5px] text-[var(--foreground)]">{g.r2}</td>
                  <td className="whitespace-nowrap px-2 py-2 font-mono text-[11.5px] text-[var(--foreground)]">{g.vm}</td>
                  <td className="whitespace-nowrap px-2 py-2 font-mono text-[11.5px] text-[var(--text-secondary)]">{g.c}</td>
                  <td className="whitespace-nowrap px-2 py-2 font-mono text-[11.5px] font-semibold text-[var(--foreground)]">{g.surfaceArea}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-[11px] text-[var(--text-secondary)]">tidak valid</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-[var(--text-secondary)]">
          Jumlah titik BET berbeda tiap sampel (6 atau 7) — hal ini wajar karena bergantung pada berapa
          banyak titik ukur yang jatuh di dalam jendela linear P/P₀ 0,05–0,30.
        </p>
      </section>

      {/* ── Menyimpulkan ────────────────────────────────────────────────── */}
      <section aria-labelledby="m7-kesimpulan" className={`${CARD} mt-4`}>
        <h2 id="m7-kesimpulan" className="text-lg font-bold text-[var(--foreground)]">
          Menyimpulkan
        </h2>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm leading-6 text-[var(--text-secondary)]">
          {CONCLUSION_QUESTIONS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
        <div className="mt-2">
          <ClaimEvidenceReasoning
            prompt="Susun kesimpulan Anda dengan kerangka Claim–Evidence–Reasoning (CER): sebutkan tipe isoterm sampel Anda beserta karakter porinya (Claim), sertakan data numerik pendukung seperti nilai C, R², intersep, dan rentang P/P₀ (Evidence), lalu jelaskan secara ilmiah mengapa nilai C negatif muncul dan bagaimana dampaknya terhadap keabsahan luas permukaan BET yang dilaporkan (Reasoning)."
            claimPlaceholder="Contoh: Berdasarkan profil isoterm, sampel Al-Fum 1:2 tergolong tipe I/IV yang menandakan keberadaan mikropori..."
            evidencePlaceholder="Bukti: Nilai slope b = ..., intersep a = ..., R² = ..., dan konstanta C = ... pada rentang P/P₀ 0,056–0,289..."
            reasoningPlaceholder="Penalaran: Intersep bernilai negatif mengindikasikan bahwa model BET tidak valid karena pengisian mikropori terjadi lebih dini..."
          />
        </div>
      </section>

      <div className="mt-4">
        <ReportChecklist
          title="Kisi-Kisi Laporan M7"
          items={[
            { label: "Isoterm adsorpsi-desorpsi N₂ sampel (data diberikan)" },
            { label: "Klasifikasi tipe isoterm IUPAC dan kaitannya dengan struktur pori" },
            { label: "Penentuan luas permukaan spesifik dari kurva BET" },
            { label: "Analisis nilai C dan maknanya terhadap interaksi adsorbat-adsorben" },
            { label: "Kaitan luas permukaan dengan sifat Al-Fum sebagai adsorben atau katalis" },
          ]}
        />
      </div>
    </ModuleLayout>
  );
}