import { ReportChecklist } from "@/components/shared/ReportChecklist";

export default function LaporanPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold">Laporan</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Template laporan, rubrik, dan checklist per modul.
      </p>

      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Rubrik Laporan Penuh</h2>
        <p className="text-xs text-[var(--muted)]">Pedoman penilaian laporan praktikum</p>
        <div className="mt-3">
          <ReportChecklist
            title="Rubrik Laporan Penuh"
            rubric={[
              { element: "Cover", points: 5 },
              { element: "Judul Modul", points: 5 },
              { element: "Tujuan", points: 10 },
              { element: "Data Observasi", points: 15 },
              { element: "Pengolahan Data", points: 15 },
              { element: "Pembahasan", points: 35 },
              { element: "Kesimpulan", points: 10 },
              { element: "Referensi", points: 5 },
            ]}
            items={[
              { label: "Cover lengkap (nama, NIM, kelompok, tanggal)" },
              { label: "Judul modul sesuai silabus praktikum" },
              { label: "Tujuan dirumuskan dengan jelas" },
              { label: "Data observasi lengkap dan terstruktur" },
              { label: "Pengolahan data menampilkan rumus, satuan, dan perhitungan" },
              { label: "Pembahasan menghubungkan teori dengan hasil" },
              { label: "Kesimpulan menjawab tujuan" },
              { label: "Referensi menggunakan format yang konsisten" },
            ]}
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Jenis Laporan</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-3">
            <p className="font-semibold text-sm">Laporan Pendek</p>
            <p className="text-xs text-[var(--muted)]">Disetujarkan pada hari praktikum.</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <p className="font-semibold text-sm">Laporan Penuh</p>
            <p className="text-xs text-[var(--muted)]">Bergiliran antar modul — mengikuti rubrik di atas.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Penilaian</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Praktikum Harian</p>
            <table className="mt-1 w-full text-xs">
              <tbody>
                <tr className="border-b border-[var(--outline-variant)]"><td className="py-1">Jurnal</td><td className="text-right">10%</td></tr>
                <tr className="border-b border-[var(--outline-variant)]"><td className="py-1">Pre-lab</td><td className="text-right">15%</td></tr>
                <tr className="border-b border-[var(--outline-variant)]"><td className="py-1">Quiz awal</td><td className="text-right">15%</td></tr>
                <tr className="border-b border-[var(--outline-variant)]"><td className="py-1">Prosedur/Partisipasi</td><td className="text-right">30%</td></tr>
                <tr className="border-b border-[var(--outline-variant)]"><td className="py-1">Laporan</td><td className="text-right">30%</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <p className="text-sm font-semibold">Nilai Akhir</p>
            <table className="mt-1 w-full text-xs">
              <tbody>
                <tr className="border-b border-[var(--outline-variant)]"><td className="py-1">Praktikum harian</td><td className="text-right">75%</td></tr>
                <tr className="border-b border-[var(--outline-variant)]"><td className="py-1">Ujian praktikum</td><td className="text-right">25%</td></tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-[var(--muted)]">Ambang lulus: NA ≥ 55.00</p>
          </div>
        </div>
      </section>
    </div>
  );
}
