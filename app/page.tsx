import { TransitionLink } from "@/components/layout/TransitionLink";
import Link from "next/link";
import { modules } from "@/lib/modules";
import { contentConflicts } from "@/lib/conflicts";
import { ChemText } from "@/components/shared/ChemText";

export default function HomePage() {
  const unresolvedConflicts = contentConflicts.filter((c) => c.status === "unresolved");

  // Map module status to schedule-like items
  const scheduleItems = modules.slice(0, 4).map((m, i) => ({
    module: m,
    label: m.titleShort,
    status: i === 0 ? "Aktif" : i === 1 ? " Mendatang" : "Terjadwal",
    statusColor: i === 0 ? "secondary" : "outline",
  }));

  return (
      <div className="bg-[var(--background)] px-3 sm:px-4 py-5 md:px-8 md:py-8 lg:px-12">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-8 min-w-0">

          <h1 className="print-title sr-only lg:hidden">KUGU Laboratory Platform</h1>

          {/* Announcements Banner */}
          {unresolvedConflicts.length > 0 && (
            <div className="bg-[var(--secondary-container)] text-[var(--on-secondary-container)] rounded-xl p-4 sm:p-6 flex items-start md:items-center gap-3 sm:gap-4 shadow-sm border border-[var(--secondary)]/20">
              <span aria-hidden="true" className="material-symbols-outlined text-[var(--secondary)] text-2xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words">
                  Penting: {unresolvedConflicts.length} konflik konten belum diselesaikan — tim pengajar harus meninjau sebelum publikasi final
                </p>
              </div>
            </div>
          )}

          {/* === Bento Grid === */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">

            {/* Left Column: Module Choice (7/12) */}
            <div className="lg:col-span-7 bg-[var(--surface)] rounded-xl shadow-ambient p-4 sm:p-6 border border-[var(--outline-variant)]/30 flex flex-col relative overflow-hidden min-w-0">
              <div className="flex justify-between items-center mb-6 sm:mb-8 relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Pilih Modul Praktikum
                </h2>
                <Link href="/modules" className="text-[var(--primary-container)] text-sm font-semibold hover:underline">
                  Lihat Semua
                </Link>
              </div>

              {/* Module cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                {modules.map((m) => (
                  <TransitionLink
                    key={m.id}
                    href={m.route}
                    direction="nav-forward"
                    className="flex flex-col p-4 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/50 hover:border-[var(--primary-container)] hover:bg-[var(--surface-container-lowest)] hover:shadow-md hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 transition-all duration-300 ease-out cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 min-w-0"
                  >
                    {/* Icon */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--primary-container)] group-hover:scale-105 group-hover:bg-[var(--primary-container)] group-hover:text-white transition-all duration-300 mb-3 shadow-xs">
                      <span aria-hidden="true" className="material-symbols-outlined text-xl">{m.icon}</span>
                    </div>
                    {/* Title */}
                    <h3 className="text-sm font-semibold text-[var(--on-surface)] group-hover:text-[var(--primary-container)] transition-colors duration-200 mb-1">
                      M{m.number} — <ChemText>{m.titleShort}</ChemText>
                    </h3>
                    <p className="text-xs text-[var(--on-surface-variant)] mb-4 line-clamp-2 leading-relaxed">
                      <ChemText>{m.theorySummary}</ChemText>
                    </p>
                    {/* Meta */}
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold text-[var(--primary-container)] group-hover:text-[var(--secondary)] flex items-center gap-1 transition-colors">
                        Buka
                        <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </TransitionLink>
                ))}
            </div>

            </div>
            {/* Right Column: Lab Schedule (5/12) */}
            <div className="lg:col-span-5 bg-[var(--surface)] rounded-xl shadow-ambient border border-[var(--outline-variant)]/30 flex flex-col min-w-0">
              {/* Header */}
              <div className="p-4 sm:p-6 bg-[var(--surface-container-lowest)] border-b border-[var(--outline-variant)]/30 rounded-t-xl">
                <h2 className="inline-flex items-center gap-3 text-xl sm:text-2xl font-bold tracking-tight text-[var(--primary)] before:inline-block before:h-8 before:w-1.5 before:rounded-full before:bg-[var(--primary-container)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Jadwal Praktikum
                </h2>
              </div>

              {/* Schedule list */}
              <div className="flex-1 p-0">
                <ul className="flex flex-col">
                  {scheduleItems.map((item, i) => (
                    <li key={item.module.id}>
                      <TransitionLink
                        href={item.module.route}
                        direction="nav-forward"
                        aria-label={`Buka modul ${item.module.number}: ${item.label}`}
                        className={`flex gap-3 sm:gap-4 items-start p-4 sm:p-6 ${i < scheduleItems.length - 1 ? "border-b border-[var(--outline-variant)]/30" : ""} hover:bg-[var(--surface-container-low)] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary-container)] min-w-0`}
                      >
                      {/* Date badge */}
                      <div className="flex flex-col items-center justify-center bg-[var(--surface-variant)] text-[var(--on-surface)] w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex-shrink-0 group-hover:bg-[var(--primary-container)] group-hover:text-white transition-colors">
                        <span className="text-[10px] uppercase tracking-wider font-medium">Mod</span>
                        <span className="text-sm font-bold">{item.module.number}</span>
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--on-surface)] mb-1 group-hover:text-[var(--primary-container)] transition-colors truncate">
                          {item.label}
                        </h3>
                        <p className="text-xs text-[var(--on-surface-variant)] mb-2 break-words">
                          <ChemText>{item.module.sampleLineage}</ChemText>
                        </p>
                        {/* Status chip */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            item.statusColor === "secondary"
                              ? "bg-[var(--secondary)]/10 text-[var(--on-secondary-container)]"
                              : "bg-[var(--surface-variant)] text-[var(--on-surface-variant)]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.statusColor === "secondary" ? "bg-[var(--secondary)]" : "bg-[var(--outline)]"
                            }`}
                          ></span>
                          {item.status}
                        </span>
                      </div>
                      <span className="self-center text-[var(--on-surface-variant)] opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--primary)] group-hover:opacity-100 flex-shrink-0" aria-hidden="true">
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </span>
                      </TransitionLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* === Course Journey Section === */}
          <div className="bg-[var(--surface)] rounded-xl shadow-ambient border border-[var(--outline-variant)]/30 p-4 sm:p-6 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Perjalanan Praktikum
              </h2>
            </div>
            <p className="text-sm text-[var(--on-surface-variant)] mb-6">
              Alur pembelajaran terstruktur: observasi → sintesis → karakterisasi → integrasi bukti.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { stage: "Tahap 1", title: "Amati & Jelaskan", desc: "Modul 1 — Reaksi golongan utama", tone: "navy" },
                { stage: "Tahap 2", title: "Sintesis Material", desc: "Modul 2-4 — Mg2SnO4, Sn-Bi, Zeolit", tone: "gold" },
                { stage: "Tahap 3", title: "Karakterisasi & Interpretasi", desc: "Modul 5-6 — XRD dan TGA", tone: "navy" },
                { stage: "Tahap 4", title: "Integrasi Bukti", desc: "Lintas modul — Sintesis → karakterisasi", tone: "gold" },
              ].map((step) => (
                <div
                  key={step.stage}
                  className="rounded-xl border border-[var(--outline-variant)]/50 bg-[var(--surface-container-low)] p-4 hover:border-[var(--primary-container)] transition-colors min-w-0"
                >
                  <div className={`mb-3 h-1 w-8 rounded-full ${step.tone === "gold" ? "bg-[var(--secondary)]" : "bg-[var(--primary-container)]"}`}></div>
                  <p className="text-xs font-semibold text-[var(--on-surface-variant)] uppercase tracking-wider">{step.stage}</p>
                  <p className="font-semibold text-sm mt-1 text-[var(--on-surface)]">{step.title}</p>
                  <p className="text-xs text-[var(--on-surface-variant)] mt-1">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Sample lineage */}
            <div className="mt-6 rounded-xl bg-[var(--surface-container)] p-4 text-xs text-[var(--on-surface-variant)] break-words">
              <p className="font-semibold text-[var(--on-surface)]">Alur Sampel:</p>
              <p className="mt-1 leading-relaxed break-words">
                <ChemText>
                  M1: observasi reaksi │ M2: sintesis Mg2SnO4 → kalsinasi → pelet/band-gap → fotokatalisis → XRD │ M3: elektrodeposisi Sn-Bi → XRD │ M4: sintesis zeolit FAU → XRD + TGA │ M5/M6: integrasi bukti dari sintesis sebelumnya
                </ChemText>
              </p>
            </div>
          </div>

          {/* === Recent Resources Section === */}
          <div className="bg-[var(--surface)] rounded-xl shadow-ambient border border-[var(--outline-variant)]/30 p-4 sm:p-6 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Referensi & Sumber Daya
              </h2>
              <Link href="/referensi" className="text-[var(--primary-container)] text-sm font-semibold hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Resource items */}
              <Link
                href="/referensi"
                className="flex items-center gap-4 p-4 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/50 hover:border-[var(--primary-container)] transition-colors group min-w-0"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--error-container)] text-[var(--on-error-container)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--error)] group-hover:text-white transition-colors">
                  <span aria-hidden="true" className="material-symbols-outlined">shield</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--on-surface)] truncate">SDS & Keselamatan</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">Wajib sebelum praktikum</p>
                </div>
              </Link>
              <Link
                href="/prelab"
                className="flex items-center gap-4 p-4 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/50 hover:border-[var(--primary-container)] transition-colors group min-w-0"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--primary-container)]/10 text-[var(--primary-container)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--primary-container)] group-hover:text-white transition-colors">
                  <span aria-hidden="true" className="material-symbols-outlined">edit_note</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--on-surface)] truncate">Pre-lab Modules</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">Persiapan sebelum lab</p>
                </div>
              </Link>
              <Link
                href="/analisis"
                className="flex items-center gap-4 p-4 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/50 hover:border-[var(--primary-container)] transition-colors group min-w-0"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--secondary)]/10 text-[var(--primary-container)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--secondary)] group-hover:text-white transition-colors">
                  <span aria-hidden="true" className="material-symbols-outlined">analytics</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--on-surface)] truncate">Analisis Data</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">Worksheet & kalkulator</p>
                </div>
              </Link>
              <Link
                href="/laporan"
                className="flex items-center gap-4 p-4 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/50 hover:border-[var(--primary-container)] transition-colors group min-w-0"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--tertiary-container)]/10 text-[var(--on-tertiary-container)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--tertiary-container)] group-hover:text-white transition-colors">
                  <span aria-hidden="true" className="material-symbols-outlined">description</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--on-surface)] truncate">Laporan Praktikum</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">Template & panduan</p>
                </div>
              </Link>
            </div>
          </div>

          {/* === Assessment Overview === */}
          <div className="bg-[var(--surface)] rounded-xl shadow-ambient border border-[var(--outline-variant)]/30 p-4 sm:p-6 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--primary)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                Penilaian
              </h2>
              <span className="text-xs text-[var(--on-surface-variant)]">Pedoman Praktikum KI3131</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--surface-container-low)] p-4 sm:p-5 border border-[var(--outline-variant)]/30 min-w-0">
                <p className="text-sm font-bold mb-3 text-[var(--on-surface)]">Praktikum Harian</p>
                <table className="w-full text-xs">
                  <tbody>
                    {[
                      ["Jurnal", "10%"],
                      ["Pre-lab", "15%"],
                      ["Quiz awal", "15%"],
                      ["Prosedur/Partisipasi", "30%"],
                      ["Laporan", "30%"],
                    ].map(([label, pct]) => (
                      <tr key={label} className="border-b border-[var(--outline-variant)]/30 last:border-0">
                        <td className="py-2 text-[var(--on-surface-variant)]">{label}</td>
                        <td className="py-2 text-right font-semibold text-[var(--on-surface)]">{pct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl bg-[var(--surface-container-low)] p-4 sm:p-5 border border-[var(--outline-variant)]/30 min-w-0">
                <p className="text-sm font-bold mb-3 text-[var(--on-surface)]">Nilai Akhir</p>
                <table className="w-full text-xs">
                  <tbody>
                    {[
                      ["Praktikum harian", "75%"],
                      ["Ujian praktikum", "25%"],
                    ].map(([label, pct]) => (
                      <tr key={label} className="border-b border-[var(--outline-variant)]/30 last:border-0">
                        <td className="py-2 text-[var(--on-surface-variant)]">{label}</td>
                        <td className="py-2 text-right font-semibold text-[var(--on-surface)]">{pct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 rounded-lg bg-[var(--secondary-container)]/10 p-3 text-center">
                  <p className="text-xs text-[var(--on-surface-variant)]">Ambang lulus</p>
                  <p className="text-xl font-bold text-[var(--primary-container)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                    NA ≥ 55.00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* === Content Conflicts (instructor-facing) === */}
          {unresolvedConflicts.length > 0 && (
            <div className="bg-[var(--error-container)]/30 rounded-xl border border-[var(--error)]/20 p-4 sm:p-6 min-w-0">
              <div className="flex items-center gap-3 mb-4">
                <span aria-hidden="true" className="material-symbols-outlined text-[var(--error)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  report_problem
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-[var(--error)]" style={{ fontFamily: "Montserrat, sans-serif" }}>
                  Konflik Konten Belum Diselesaikan
                </h2>
              </div>
              <p className="text-xs text-[var(--on-surface-variant)] mb-4">
                Item berikut ditemukan saat penelaahan prosedur. Tim pengajar harus menyelesaikan keputusan ini sebelum konten dipublikasikan sebagai final.
              </p>
              <ul className="space-y-2">
                {unresolvedConflicts.map((c) => (
                  <li key={c.id} className="flex items-start gap-3 text-sm text-[var(--on-surface)] break-words min-w-0">
                    <span className="font-mono text-xs bg-[var(--error)]/10 text-[var(--error)] px-2 py-0.5 rounded-full flex-shrink-0">
                      {c.id}
                    </span>
                    <span className="min-w-0 break-words flex-1">
                      <span className="font-semibold">{c.module}:</span> <ChemText>{c.conflict}</ChemText>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* === Boundary Notice === */}
          <div className="rounded-xl border border-[var(--outline-variant)]/30 bg-[var(--surface-container-low)] p-4 sm:p-5 text-center text-sm text-[var(--on-surface-variant)] min-w-0">
            <p className="break-words">
              Pendamping digital ini melengkapi — bukan menggantikan — kerja praktikum fisik, SOP, SDS, dan putusan instruktur.
            </p>
            <p className="mt-1 text-xs break-words">
              Selalu konsultasi dengan asisten/instruktur sebelum bekerja di bench.
            </p>
          </div>

        </div>
      </div>
  );
}
