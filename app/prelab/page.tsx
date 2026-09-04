import Link from "next/link";
import { modules } from "@/lib/modules";
import { ChemText } from "@/components/shared/ChemText";

export default function PrelabPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <header className="rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)]/30 shadow-ambient p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--primary)] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            edit_note
          </span>
          <h1 className="text-2xl font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Pre-lab & Jurnal
          </h1>
        </div>
        <p className="text-sm text-[var(--on-surface-variant)]">
          Persiapan sebelum praktikum: walkthrough prosedur interaktif, pre-lab task, jurnal, flowchart, tabel/persamaan yang diharapkan.
        </p>
      </header>

      {/* Ritme Praktikum */}
      <section className="mb-6 rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)]/30 shadow-ambient p-6">
        <div className="flex items-center gap-2 mb-4">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--secondary)]" style={{ fontVariationSettings: "'FILL' 1" }}>
            schedule
          </span>
          <h2 className="text-xl font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Ritme Praktikum
          </h2>
          <span className="text-xs text-[var(--on-surface-variant)] ml-auto">Pedoman KI3131</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--primary)] text-lg">login</span>
              <p className="font-bold text-sm text-[var(--on-surface)]">Sebelum Lab</p>
            </div>
            <p className="text-sm text-[var(--on-surface-variant)]">Registrasi/briefing, pre-lab task, jurnal, persiapan alat/bahan, flowchart, reaksi/tabel/perhitungan yang diharapkan.</p>
          </div>
          <div className="rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--secondary)] text-lg">play_circle</span>
              <p className="font-bold text-sm text-[var(--on-surface)]">Awal Lab</p>
            </div>
            <p className="text-sm text-[var(--on-surface-variant)]">Kehadiran, pengumpulan tugas, pemeriksaan APD/keselamatan, quiz awal, briefing asisten.</p>
          </div>
          <div className="rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--tertiary-container)] text-lg">science</span>
              <p className="font-bold text-sm text-[var(--on-surface)]">Selama Lab</p>
            </div>
            <p className="text-sm text-[var(--on-surface-variant)]">Ikuti prosedur, catat observasi dan data mentah, dokumentasikan deviasi, foto jika diizinkan.</p>
          </div>
          <div className="rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4">
            <div className="flex items-center gap-2 mb-1">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--success)] text-lg">task_alt</span>
              <p className="font-bold text-sm text-[var(--on-surface)]">Setelah Lab</p>
            </div>
            <p className="text-sm text-[var(--on-surface-variant)]">Submit laporan pendek hari itu, siapkan laporan penuh bergiliran, gunakan M5/M6 untuk interpretasi data sintesis sebelumnya.</p>
          </div>
        </div>
      </section>

      {/* Pre-lab per Modul — interactive walkthrough cards */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--primary)]" style={{ fontVariationSettings: "'FILL' 1" }}>
            route
          </span>
          <h2 className="text-xl font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Walkthrough Pre-lab per Modul
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const hasWalkthrough = m.id === "m1" || m.id === "m2" || m.id === "m3";
            const walkthroughRoute = `/prelab/${m.slug}`;

            return (
              <Link
                key={m.id}
                href={hasWalkthrough ? walkthroughRoute : m.route}
                className="group rounded-xl border border-[var(--outline-variant)]/40 bg-[var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--primary-container)] hover:shadow-ambient focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] focus-visible:ring-offset-2"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-2xl text-[var(--primary-container)]"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined">{m.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[var(--on-surface)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                        M{m.number}
                      </p>
                      {hasWalkthrough && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--secondary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--secondary)] uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)]"></span>
                          Tersedia
                        </span>
                      )}
                      {!hasWalkthrough && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-variant)] px-2 py-0.5 text-[10px] font-medium text-[var(--on-surface-variant)] uppercase tracking-wider">
                          Segera
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--on-surface-variant)] mt-0.5 truncate"><ChemText>{m.titleShort}</ChemText></p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-[var(--on-surface-variant)] line-clamp-2">
                  <ChemText>{m.learningOutcomes[0]}</ChemText>
                </p>

                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[var(--primary-container)] group-hover:underline">
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                    {hasWalkthrough ? "play_arrow" : "menu_book"}
                  </span>
                  {hasWalkthrough ? "Mulai walkthrough" : "Buka modul"}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Boundary notice */}
      <section className="mt-6 rounded-xl border border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)] p-4 text-center text-sm text-[var(--on-surface-variant)]">
        <p>
          Walkthrough interaktif melengkapi — bukan menggantikan — jurnal pre-lab dan persetujuan asisten.
        </p>
        <p className="mt-1 text-xs">
          Asisten dapat memeriksa apakah Anda telah menyelesaikan walkthrough sebelum sesi lab.
        </p>
      </section>
    </div>
  );
}
