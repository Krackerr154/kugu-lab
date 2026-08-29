export default function PengajarPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold">Ruang Pengajar</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Area instruktur/asisten — memerlukan autentikasi (prototipe: tampilan publik).
      </p>

      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Dashboard Kohor</h2>
        <p className="text-sm text-[var(--muted)]">
          Kesiapan kohor, analitik pertanyaan, preview/publikasi konten.
        </p>
        <div className="mt-3 rounded-md bg-[var(--accent-light)] p-3 text-sm text-[var(--info-ink)]">
          <span aria-hidden="true" className="material-symbols-outlined align-middle text-base">info</span> Fitur ini memerlukan backend dengan autentikasi dan basis data PostgreSQL. 
          Dalam prototipe ini, tampilan adalah demo statis.
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
          <h3 className="font-bold"><span aria-hidden="true" className="material-symbols-outlined align-middle text-base">analytics</span> Pertanyaan Analitik</h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
            <li>• Siapa yang belum menyelesaikan pre-lab/safety briefing?</li>
            <li>• Pertanyaan mana yang paling banyak salah?</li>
            <li>• Langkah prosedur/perhitungan mana yang konsisten error?</li>
            <li>• Apakah revisi konten memperbaiki kesiapan?</li>
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
          <h3 className="font-bold"><span aria-hidden="true" className="material-symbols-outlined align-middle text-base">publish</span> Alur Publikasi Konten</h3>
          <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
            <span className="rounded bg-[var(--surface-container-high)] px-2 py-1">Draft</span>
            <span>→</span>
            <span className="rounded bg-[var(--secondary-container)]/25 px-2 py-1">Review Ilmiah</span>
            <span>→</span>
            <span className="rounded-full border border-[var(--outline-variant)] bg-[var(--surface-muted)] px-2 py-1">Cek Aksesibilitas</span>
            <span>→</span>
            <span className="rounded-full border border-[var(--outline-variant)] bg-[var(--surface-muted)] px-2 py-1">Preview</span>
            <span>→</span>
            <span className="rounded-full bg-[var(--success-light)] px-2 py-1 text-[var(--verification-ink)]">Publikasi Instruktur</span>
            <span>→</span>
            <span className="rounded bg-[var(--primary-light)] px-2 py-1">Versi Immutable</span>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-control)] p-5">
        <h2 className="text-lg font-bold">Peran dan Izin</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="py-2 pr-4">Peran</th>
                <th className="py-2">Izin Inti</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--outline-variant)]">
                <td className="py-1.5 pr-4 font-medium">Mahasiswa</td>
                <td className="py-1.5 text-xs">Baca modul, pre-lab, simpan jurnal/draft, upload dataset, lihat progres</td>
              </tr>
              <tr className="border-b border-[var(--outline-variant)]">
                <td className="py-1.5 pr-4 font-medium">Asisten</td>
                <td className="py-1.5 text-xs">Kesiapan kohor, anotasi, miskonsepsi agregat anonim</td>
              </tr>
              <tr className="border-b border-[var(--outline-variant)]">
                <td className="py-1.5 pr-4 font-medium">Instruktur</td>
                <td className="py-1.5 text-xs">Publikasi/versi konten, analitik, ketersediaan modul, ekspor</td>
              </tr>
              <tr className="border-b border-[var(--outline-variant)]">
                <td className="py-1.5 pr-4 font-medium">Editor Konten</td>
                <td className="py-1.5 text-xs">Draft/pratinjau — tidak bisa publikasi tanpa persetujuan instruktur</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4 font-medium">Administrator</td>
                <td className="py-1.5 text-xs">Peran, kohort, pengaturan keamanan, backup, audit log</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
