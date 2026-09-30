import { ChemText } from "@/components/shared/ChemText";

export function ReportFormatGuide() {
  return (
    <section
      aria-labelledby="report-format-title"
      data-report-format
      data-report-format-placeholder
      className="m4-motion-enter surface-panel space-y-5 p-4 sm:p-6 shadow-xs"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--outline-variant)] pb-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            Format Laporan Resmi · KI3131
          </p>
          <h3
            id="report-format-title"
            className="text-lg font-bold text-[var(--foreground)] sm:text-xl"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Format & Rubrik Penilaian Laporan Praktikum
          </h3>
          <p className="max-w-[80ch] text-sm leading-6 text-[var(--text-secondary)]">
            Susun laporan praktikum resmi mengikuti urutan komponen di bawah ini. Alokasi bobot penilaian terstandar
            mencapai akumulasi 100 poin.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--primary-container)] bg-[var(--surface-container-low)] px-3 py-2 text-right">
          <span aria-hidden="true" className="material-symbols-outlined text-xl text-[var(--primary-container)]">
            grade
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Total Bobot</p>
            <p className="text-base font-bold text-[var(--primary-container)]">100 Poin</p>
          </div>
        </div>
      </div>

      {/* Structured Rubric Layout */}
      <div className="space-y-4">
        {/* Row 1: a. Sampul Depan & b. Judul Modul */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* a. Sampul Depan */}
          <article className="flex flex-col rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--outline-variant)]/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-bold text-[var(--primary-container)]">
                  a
                </span>
                <h4 className="text-base font-bold text-[var(--foreground)]">Sampul Depan</h4>
              </div>
              <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary-container)]">
                5 Poin
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-5 text-[var(--text-secondary)]">
              Berisi judul percobaan, logo ITB, nama praktikan, NIM praktikan, tanggal pengumpulan laporan, dan nama
              asisten pembimbing praktikum.
            </p>
          </article>

          {/* b. Judul Modul */}
          <article className="flex flex-col rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--outline-variant)]/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-bold text-[var(--primary-container)]">
                  b
                </span>
                <h4 className="text-base font-bold text-[var(--foreground)]">Judul Modul</h4>
              </div>
              <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary-container)]">
                5 Poin
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-5 text-[var(--text-secondary)]">
              Penulisan judul modul praktikum secara tepat, formal, dan jelas sesuai penuntun resmi modul.
            </p>
          </article>
        </div>

        {/* Row 2: c. Tujuan Praktikum */}
        <article className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--outline-variant)]/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-bold text-[var(--primary-container)]">
                c
              </span>
              <h4 className="text-base font-bold text-[var(--foreground)]">Tujuan Praktikum</h4>
            </div>
            <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary-container)]">
              10 Poin
            </span>
          </div>
          <p className="mt-2.5 text-xs leading-5 text-[var(--text-secondary)]">
            Merumuskan sasaran capaian percobaan secara spesifik, terukur, dan berbasis fenomena kimia anorganik yang
            dipelajari (misalnya sintesis paduan Sn–Bi dengan elektrodeposisi dan evaluasi efisiensi arus).
          </p>
        </article>

        {/* Row 3: d. Data Pengamatan & e. Pengolahan Data */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* d. Data Pengamatan */}
          <article className="flex flex-col rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--outline-variant)]/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-bold text-[var(--primary-container)]">
                  d
                </span>
                <h4 className="text-base font-bold text-[var(--foreground)]">Data Pengamatan</h4>
              </div>
              <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary-container)]">
                15 Poin
              </span>
            </div>
            <ol className="mt-3 space-y-2 text-xs leading-5 text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[11px] font-bold text-[var(--primary-container)]">
                  1
                </span>
                <span className="flex-1 text-[var(--foreground)] font-medium">
                  Gambar katoda dan anoda sebelum dan setelah proses elektrodeposisi.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[11px] font-bold text-[var(--primary-container)]">
                  2
                </span>
                <span className="flex-1 text-[var(--foreground)] font-medium">
                  Massa katoda dan anoda sebelum dan setelah proses elektrodeposisi.
                </span>
              </li>
            </ol>
          </article>

          {/* e. Pengolahan Data */}
          <article className="flex flex-col rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--outline-variant)]/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-bold text-[var(--primary-container)]">
                  e
                </span>
                <h4 className="text-base font-bold text-[var(--foreground)]">Pengolahan Data</h4>
              </div>
              <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary-container)]">
                15 Poin
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-5 text-[var(--text-secondary)]">
              Menyajikan alur perhitungan kuantitatif lengkap beserta satuan, persamaan reaksi pendukung, rumus
              matematis (hukum Faraday, efisiensi arus), dan hasil perhitungan akhir.
            </p>
          </article>
        </div>

        {/* Row 4: f. Pembahasan (Hero Card - 35 Poin) */}
        <article className="rounded-xl border-2 border-[var(--primary-container)] bg-[var(--surface-container-low)] p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--outline-variant)] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-container)] text-xs font-bold text-[var(--on-primary)]">
                f
              </span>
              <div>
                <h4 className="text-base font-bold text-[var(--foreground)] sm:text-lg">Pembahasan</h4>
                <p className="text-xs text-[var(--muted)]">Komponen bobot penilaian terbesar dalam laporan</p>
              </div>
            </div>
            <span className="rounded-full bg-[var(--primary-container)] px-3 py-1 text-xs font-bold text-[var(--on-primary)]">
              35 Poin · Bobot Utama
            </span>
          </div>

          <p className="text-xs leading-5 text-[var(--text-secondary)]">
            Analisis dan jabarkan poin-poin utama pembahasan berikut secara komprehensif dan mendalam:
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-container)] text-[11px] font-bold text-[var(--on-primary)]">
                  1
                </span>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Proses Sintesis
                </h5>
              </div>
              <p className="text-xs leading-5 text-[var(--foreground)] font-medium">
                Deskripsikan proses sintesis paduan logam Sn-Bi dengan metoda elektrodeposisi.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-container)] text-[11px] font-bold text-[var(--on-primary)]">
                  2
                </span>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Fungsi Larutan
                </h5>
              </div>
              <p className="text-xs leading-5 text-[var(--foreground)] font-medium">
                Jelaskan fungsi dari masing-masing larutan A, B, dan C.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-container)] text-[11px] font-bold text-[var(--on-primary)]">
                  3
                </span>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Pengamatan Katoda
                </h5>
              </div>
              <p className="text-xs leading-5 text-[var(--foreground)] font-medium">
                Perubahan yang diamati pada katoda, sebelum dan sesudah proses elektrodeposisi.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-3.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-container)] text-[11px] font-bold text-[var(--on-primary)]">
                  4
                </span>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--primary-container)]">
                  Efisiensi Arus
                </h5>
              </div>
              <p className="text-xs leading-5 text-[var(--foreground)] font-medium">
                Hitung efisiensi arus.
              </p>
            </div>
          </div>
        </article>

        {/* Row 5: h. Kesimpulan & i. Daftar Pustaka */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* h. Kesimpulan */}
          <article className="flex flex-col rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--outline-variant)]/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-bold text-[var(--primary-container)]">
                  h
                </span>
                <h4 className="text-base font-bold text-[var(--foreground)]">Kesimpulan</h4>
              </div>
              <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary-container)]">
                10 Poin
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-5 text-[var(--text-secondary)]">
              Menjawab tujuan praktikum secara ringkas, lugas, dan didasarkan langsung pada data serta temuan hasil
              percobaan.
            </p>
          </article>

          {/* i. Daftar Pustaka */}
          <article className="flex flex-col rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--outline-variant)]/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-bold text-[var(--primary-container)]">
                  i
                </span>
                <h4 className="text-base font-bold text-[var(--foreground)]">Daftar Pustaka</h4>
              </div>
              <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary-container)]">
                5 Poin
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-5 text-[var(--text-secondary)]">
              Menyertakan rujukan literatur ilmiah yang valid (buku teks, jurnal internasional bereputasi, penuntun
              praktikum) dengan format sitasi baku dan konsisten.
            </p>
          </article>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3.5 text-xs leading-5 text-[var(--text-secondary)]">
        <p>
          <strong className="text-[var(--foreground)]">Catatan Penulisan:</strong> Laporan diketik atau ditulis tangan rapi sesuai instruksi dosen/asisten pengampu, mencantumkan satuan SI yang konsisten, menyertakan estimasi ketidakpastian atau galat bila ada, serta melampirkan data pendukung analisis instrumen.
        </p>
      </div>
    </section>
  );
}
