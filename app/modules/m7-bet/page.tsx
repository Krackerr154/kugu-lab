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
          BET bertumpu pada fisisorpsi, sehingga pengukuran dilakukan pada suhu rendah. N₂ dipakai
          karena inert dan berinteraksi lemah; pada <strong>77 K</strong> tekanan uap jenuhnya (P₀)
          mendekati 1 atm sehingga P/P₀ dari 0 sampai 1 mudah diatur. Luas penampang satu molekul N₂
          adalah <strong>0,162 nm²</strong>.
        </p>

        {/* ── Definisi P/P₀ ─────────────────────────────────────────────── */}
        <div
          id="m7-pp0"
          className="mt-3 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-3"
        >
          <h3 className="text-[13px] font-bold text-[var(--foreground)]">
            Apa itu P/P₀?
          </h3>

          <p className="mt-1.5 text-[12.5px] leading-6 text-[var(--text-secondary)]">
            <strong className="text-[var(--foreground)]">P</strong> adalah tekanan gas N₂ di atas
            sampel pada saat itu, dalam satuan tekanan (biasanya mmHg atau kPa).{" "}
            <strong className="text-[var(--foreground)]">P₀</strong> adalah tekanan uap jenuh N₂
            pada suhu pengukuran — tekanan saat N₂ mulai mengembun menjadi cairan. Pada 77 K
            nilainya mendekati 1 atm.
          </p>

          <p className="mt-1.5 text-[12.5px] leading-6 text-[var(--text-secondary)]">
            <strong className="text-[var(--foreground)]">P/P₀</strong> adalah perbandingan
            keduanya: bilangan tanpa satuan, dari 0 (tidak ada gas) sampai 1 (gas tepat akan
            mengembun). Inilah besaran yang dipakai di seluruh modul ini sebagai sumbu-x isoterm.
          </p>

          <p className="mt-1.5 text-[12.5px] leading-6 text-[var(--text-secondary)]">
            Yang menentukan banyaknya N₂ yang menempel bukan tekanan mutlaknya, melainkan{" "}
            <em>seberapa dekat gas itu ke titik embun</em>. Pada P/P₀ yang sama, permukaan akan
            terisi dengan jumlah yang sama walaupun suhu dan tekanan mutlaknya berbeda — itulah
            alasan isoterm selalu diplot terhadap P/P₀, bukan terhadap P. Tanpa normalisasi ini,
            data dari dua laboratorium tidak akan bisa dibandingkan.
          </p>

          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--outline-variant)]">
            <table className="w-full min-w-[26rem] border-collapse text-left">
              <caption className="sr-only">Arti tiap rentang P/P0</caption>
              <thead>
                <tr className="border-b border-[var(--outline-variant)] bg-[var(--surface-control)]">
                  <th scope="col" className="px-2.5 py-1.5 text-[10.5px] font-semibold text-[var(--text-secondary)]">P/P₀</th>
                  <th scope="col" className="px-2.5 py-1.5 text-[10.5px] font-semibold text-[var(--text-secondary)]">Yang terjadi di permukaan</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["0", "Belum ada gas; permukaan bersih hasil degassing."],
                  ["≈ 0,05–0,30", "Monolayer terbentuk, lalu lapisan berganda mulai menumpuk. Di rentang inilah BET dihitung."],
                  ["≈ 0,30–0,90", "Lapisan berganda menebal; pada mesopori mulai terjadi kondensasi kapiler."],
                  ["→ 1", "Semua pori terisi; N₂ hampir mengembun di seluruh permukaan."],
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
            <strong className="text-[var(--foreground)]">P₀ diukur, bukan diasumsikan.</strong>{" "}
            Instrumen menentukan P₀ pada tiap pengukuran dari tabung terpisah, karena tekanan uap
            jenuh bergantung pada suhu dan tekanan atmosfer setempat. Nilai 1 atm hanya perkiraan
            untuk 77 K di permukaan laut.
          </p>
        </div>

        <p className="mt-2 text-[11px] leading-snug text-[var(--text-secondary)]">
          Pengukuran tidak dilakukan di praktikum — data isoterm diberikan, lalu diolah.
        </p>
      </section>

      {/* ── Cara isoterm diukur ─────────────────────────────────────────── */}
      <section aria-labelledby="m7-ukur" className={`${CARD} mt-4`}>
        <h2 id="m7-ukur" className="text-lg font-bold text-[var(--foreground)]">
          Bagaimana isoterm N₂ diukur
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Data yang Anda olah bukan angka yang muncul sendiri. Enam tahap berikut menjelaskan dari
          mana pasangan P/P₀ dan V berasal. Penjelasan ini bersifat umum — rincian tiap instrumen
          berbeda, tetapi urutan fisiknya sama.
        </p>

        <ol className="mt-2 space-y-2">
          {[
            {
              t: "Degassing — membersihkan permukaan",
              b: "Sampel dipanaskan dalam vakum untuk mengusir air dan pelarut yang menempel di pori. Tanpa langkah ini yang terukur adalah air, bukan pori. Suhu dan lama pemanasan bergantung pada ketahanan material: untuk MOF umumnya 100–200 °C selama beberapa jam sampai semalam, karena terlalu panas dapat merusak kerangka. Setelah degassing, sampel ditimbang — massa inilah pembagi pada sumbu V (cm³/g).",
            },
            {
              t: "Pendinginan ke 77 K",
              b: "Tabung sampel dicelupkan ke nitrogen cair. Suhu ini dipilih karena N₂ berada dekat titik embunnya, sehingga perubahan tekanan kecil saja sudah cukup untuk menyapu P/P₀ dari 0 sampai 1. Pada suhu kamar, rentang itu tidak terjangkau.",
            },
            {
              t: "Penambahan gas bertahap",
              b: "Instrumen memasukkan N₂ sedikit demi sedikit dan menunggu kesetimbangan di tiap titik — jumlah yang teradsorpsi berhenti berubah. Setiap titik kesetimbangan menjadi satu baris data: tekanan (menjadi P/P₀) dan jumlah teradsorpsi (menjadi V).",
            },
            {
              t: "Menghitung berapa yang teradsorpsi",
              b: "Yang diukur langsung adalah tekanan dalam volume tertutup yang diketahui. Dari selisih tekanan sebelum dan sesudah gas dimasukkan, dengan hukum gas ideal dan volume mati tabung, dihitung berapa mol yang meninggalkan fase gas. Mol yang hilang itulah yang menempel di permukaan. Cara lain (gravimetri) menimbang pertambahan massa sampel secara langsung.",
            },
            {
              t: "Menaikkan lalu menurunkan tekanan",
              b: "Pengukuran berjalan dari P/P₀ rendah ke tinggi (adsorpsi), lalu diturunkan kembali dengan menyedot gas (desorpsi). Bila kedua jalur tidak berimpit, terbentuk histeresis — jalur desorpsi bertahan lebih penuh karena kondensasi kapiler baru menguap pada tekanan lebih rendah. Inilah sebabnya isoterm punya dua cabang.",
            },
            {
              t: "Yang dihasilkan",
              b: "Tabel P/P₀ terhadap V (cm³/g STP) untuk kedua cabang. V dinyatakan pada kondisi standar agar sebanding antar-laboratorium: 1 mol gas = 22.414 cm³. Dari tabel inilah grafik isoterm, klasifikasi IUPAC, dan perhitungan BET dikerjakan.",
            },
          ].map((s, i) => (
            <li key={s.t} className="rounded-lg border border-[var(--border)] bg-[var(--surface-container-lowest)] p-2.5">
              <div className="flex items-baseline gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-[10px] font-bold text-[var(--surface-container-lowest)]">
                  {i + 1}
                </span>
                <h3 className="text-[13px] font-bold text-[var(--foreground)]">{s.t}</h3>
              </div>
              <p className="mt-1 pl-7 text-[12px] leading-snug text-[var(--text-secondary)]">{s.b}</p>
            </li>
          ))}
        </ol>

        <p className="mt-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-control)] px-3 py-2 text-[11.5px] leading-snug text-[var(--text-secondary)]">
          <strong className="text-[var(--foreground)]">Perlu ditekankan:</strong> luas permukaan
          BET bukan luas geometrik partikel. Ia adalah luas permukaan tempat N₂ bisa menempel —
          termasuk seluruh dinding pori di dalam partikel — sehingga nilainya bisa ratusan kali
          lebih besar daripada luas luar partikelnya.
        </p>
      </section>

      {/* ── Isoterm + animasi pori ──────────────────────────────────────── */}
      <section aria-labelledby="m7-isoterm" className={`${CARD} mt-4`}>
        <h2 id="m7-isoterm" className="text-lg font-bold text-[var(--foreground)]">
          Apa yang terjadi di dalam pori
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Geser P/P₀ dan perhatikan isi pori sekaligus titik pada isoterm. Keduanya dihitung dari
          model yang sama: dinding terisi lebih dulu, lalu lapisan berganda, lalu kondensasi kapiler
          di bagian tengah. Cabang desorpsi tertinggal dari adsorpsi — itulah histeresis.
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
          Bentuk kurva menunjukkan jenis pori. Ketuk tiap tipe untuk membaca cirinya.
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
            description="W = massa N₂ teradsorpsi; Wm = massa N₂ satu monolayer; C = konstanta BET yang menyatakan energi adsorpsi lapisan pertama."
          />
        </div>

        <div className="mt-3 grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
          <ul className="list-disc space-y-1 pl-5 text-[12.5px] leading-snug">
            <li>Permukaan dianggap homogen.</li>
            <li>Kalor adsorpsi lapisan pertama berbeda dari lapisan berikutnya, yang setara kalor pencairan.</li>
            <li>Tidak ada interaksi antarmolekul dalam satu lapisan.</li>
            <li>Lapisan berganda menjadi tak terhingga pada P/P₀ = 1.</li>
          </ul>
          <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-control)] px-3 py-2">
            <p className="text-[12px] font-semibold text-[var(--foreground)]">Jendela BET</p>
            <p className="mt-1 text-[12px] leading-snug">
              Linear pada P/P₀ <strong>0,05–0,35</strong>. Instrumen yang dipakai memakai{" "}
              <strong>0,05–0,30</strong> — itu rentang yang dipakai modul ini.
            </p>
            <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]">
              Gunakan titik <em>adsorpsi</em>, bukan desorpsi; sumbu x P/P₀, bukan tekanan P.
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
          Untuk basis volume: Vm = 1/(a + b) dan S = Vm · N · A_cs / 22414. Hasil basis volume dan
          basis massa harus sama — itu pemeriksaan mandiri yang baik.
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
          Pengukuran tidak dilakukan di praktikum. Anda menerima empat kolom, lalu mengolahnya
          sendiri. Hanya titik <strong>adsorpsi</strong> di dalam jendela BET yang dipakai.
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
          Periksa validitas — bukan hanya R²
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Garis yang lurus belum tentu sah. Syaratnya: R² dan r mendekati 1, <strong>intersep
          positif</strong>, sehingga C = b/a + 1 juga positif. Bila intersep negatif maka C negatif:
          luas permukaan tetap boleh dihitung dan dicatat, tetapi <strong>dilaporkan tidak
          valid</strong>, lalu dijelaskan kemungkinan penyebabnya.
        </p>
        <p className="mt-1 font-mono text-[12px] text-[var(--foreground)]">
          =IF(C&lt;=0,&quot;C negatif, BET tidak valid&quot;,&quot;C positif, BET dapat dipakai&quot;)
        </p>
      </section>

      {/* ── Hasil acuan ─────────────────────────────────────────────────── */}
      <section aria-labelledby="m7-acuan" className={`${CARD} mt-4`}>
        <h2 id="m7-acuan" className="text-lg font-bold text-[var(--foreground)]">
          Hasil yang diharapkan
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
          Ketiga sampel Al-Fum memberi garis yang rapi (R² &gt; 0,99) tetapi intersep negatif,
          sehingga C negatif dan BET-nya tidak valid. Perhatikan bahwa luas permukaan tetap
          menurun teratur dari 1:2 ke 1:4.
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
          Jumlah titik BET berbeda tiap sampel (6 atau 7) — itu wajar, bergantung pada berapa titik
          yang jatuh di dalam jendela 0,05–0,30.
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
            prompt="Jawab ketiga pertanyaan di atas sebagai klaim: sebutkan tipe isoterm sampel Anda, jelaskan ada tidaknya histeresis beserta sebabnya, lalu nyatakan apakah C positif dan luas permukaan BET-nya valid."
            claimPlaceholder="Contoh: Isoterm sampel saya termasuk tipe ..., dengan pori ..."
            evidencePlaceholder="Bukti: nilai C, R², intersep, bentuk kurva pada P/P₀ ..."
            reasoningPlaceholder="Penalaran: mengapa C negatif muncul pada material berpori ini, dan apa konsekuensinya bagi nilai S BET..."
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