// ReportRubricCards — 3 structured cards detailing the 100-point report rubric for Slide 9.
// Compact, zero-scroll presentation layout designed for mobile landscape & desktop canvas.
"use client";

interface RubricSection {
  id: string;
  title: string;
  badge: string;
  accentColor: string;
  points: number;
  highlight?: boolean;
  summary: string;
  items: {
    code: string;
    label: string;
    points: string;
    dotColor: string;
  }[];
}

const SECTIONS: RubricSection[] = [
  {
    id: "initial",
    title: "Bagian Awal",
    badge: "20 Poin",
    accentColor: "var(--primary-container)",
    points: 20,
    summary:
      "Format identitas formal laporan dan perumusan sasaran capaian praktikum sintesis Sn–Bi.",
    items: [
      { code: "a", label: "Sampul Depan (Identitas & Logo)", points: "5 pt", dotColor: "#64748b" },
      { code: "b", label: "Judul Modul (Sesuai Penuntun)", points: "5 pt", dotColor: "#64748b" },
      { code: "c", label: "Tujuan Praktikum (Spesifik)", points: "5 pt", dotColor: "#0284c7" },
      { code: "d", label: "Hipotesis / Prinsip Reaksi", points: "5 pt", dotColor: "#0284c7" },
    ],
  },
  {
    id: "discussion",
    title: "Pembahasan",
    badge: "35 Poin · Bobot Max",
    accentColor: "#d97706",
    points: 35,
    highlight: true,
    summary:
      "Kupas tuntas fungsi larutan A/B/C, reaksi elektroda paduan Sn–Bi, dan efisiensi arus.",
    items: [
      { code: "f.1", label: "Rangkaian Sel & 2 Elektroda", points: "7 pt", dotColor: "#d97706" },
      { code: "f.2", label: "Fungsi Larutan A, B, C & Ligan", points: "10 pt", dotColor: "#d97706" },
      { code: "f.3", label: "Reaksi Elektroda Sn–Bi", points: "8 pt", dotColor: "#d97706" },
      { code: "f.4", label: "Efisiensi Arus & Reaksi H₂", points: "10 pt", dotColor: "#d97706" },
    ],
  },
  {
    id: "data-closing",
    title: "Data & Penutup",
    badge: "45 Poin",
    accentColor: "#7c3aed",
    points: 45,
    summary:
      "Pencatatan data kuantitatif, rumus hukum Faraday, serta penarikan kesimpulan akhir.",
    items: [
      { code: "d", label: "Data Pengamatan (Tabel I, t, m)", points: "15 pt", dotColor: "#7c3aed" },
      { code: "e", label: "Perhitungan Rumus Q, m, & η", points: "15 pt", dotColor: "#7c3aed" },
      { code: "h", label: "Kesimpulan (Menjawab Tujuan)", points: "10 pt", dotColor: "#059669" },
      { code: "i", label: "Format Daftar Pustaka", points: "5 pt", dotColor: "#64748b" },
    ],
  },
];

export function ReportRubricCards() {
  return (
    <div
      data-report-rubric-cards
      className="m4-motion-enter grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 h-full items-stretch min-w-0"
    >
      {SECTIONS.map((sec) => (
        <div
          key={sec.id}
          className={`rounded-xl border p-1.5 sm:p-2 flex flex-col justify-between shadow-xs min-w-0 h-full ${
            sec.highlight
              ? "border-[var(--secondary)]/60 bg-[var(--secondary-container)]/10"
              : "border-[var(--outline-variant)] bg-[var(--surface)]"
          }`}
          style={{ gap: "0.2rem" }}
        >
          {/* Header & Section Title */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: sec.accentColor }}
                />
                <h3 className="font-bold text-[11px] sm:text-xs text-[var(--foreground)] truncate">
                  {sec.title}
                </h3>
              </div>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[8px] font-mono font-bold shrink-0 border ${
                  sec.highlight
                    ? "border-[var(--secondary)]/60 bg-[var(--surface)] text-[var(--secondary)]"
                    : "border-[var(--outline-variant)]/40 text-[var(--text-secondary)] bg-[var(--surface-container-low)]"
                }`}
              >
                {sec.badge}
              </span>
            </div>

            <p
              className="text-[8.5px] sm:text-[9px] text-[var(--text-secondary)] leading-tight text-justify mt-0.5"
              style={{ textAlign: "justify", textJustify: "inter-word" }}
            >
              {sec.summary}
            </p>
          </div>

          {/* Structured Rubric Rows */}
          <div className="mt-auto pt-1 border-t border-[var(--outline-variant)]/40 min-w-0">
            <div className="text-[7.5px] font-bold uppercase tracking-wider text-[var(--muted)] mb-0.5">
              Komponen &amp; Bobot:
            </div>
            <div className="space-y-0.5 min-w-0">
              {sec.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-md border px-1.5 py-0.5 flex items-center justify-between gap-1 min-w-0 shadow-2xs ${
                    sec.highlight
                      ? "border-[var(--secondary)]/30 bg-[var(--surface)]"
                      : "border-[var(--outline-variant)]/60 bg-[var(--surface-container-low)]"
                  }`}
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.dotColor }}
                    />
                    <span className="font-semibold text-[8px] sm:text-[8.5px] text-[var(--foreground)] truncate">
                      <span className="text-[var(--primary)] font-mono font-bold mr-1">{item.code}.</span>
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[7.5px] sm:text-[8px] font-mono font-bold text-[var(--primary-container)] shrink-0 ml-1">
                    {item.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
