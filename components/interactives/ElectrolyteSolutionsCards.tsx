// ElectrolyteSolutionsCards — 3 structured solution cards (A, B, C) for Slide 7 review deck.
// Displays the distinct chemical role of each sub-solution and nested mini cards for each component.
"use client";

import { ChemText } from "@/components/shared/ChemText";

interface SolutionItem {
  id: "A" | "B" | "C";
  title: string;
  badge: string;
  accentColor: string;
  volumeInfo: string;
  functionText: string;
  components: {
    name: string;
    dotColor: string;
  }[];
}

const SOLUTIONS: SolutionItem[] = [
  {
    id: "A",
    title: "Larutan A",
    badge: "Persiapan Pengompleks",
    accentColor: "var(--primary)",
    volumeInfo: "5 mL · Basa",
    functionText: "Persiapan pengompleks EDTA dalam media basa (NH₃) agar terdeprotonasi dan larut sempurna.",
    components: [
      { name: "H₂O", dotColor: "#64748b" },
      { name: "NH₃ (pekat)", dotColor: "#0284c7" },
      { name: "EDTA", dotColor: "#059669" },
    ],
  },
  {
    id: "B",
    title: "Larutan B",
    badge: "Sumber Kation Logam",
    accentColor: "#d97706",
    volumeInfo: "5,5 mL · Asam",
    functionText: "Sumber kation logam Sn²⁺ dan Bi³⁺ dalam suasana asam pekat (HCl) untuk mencegah hidrolisis.",
    components: [
      { name: "H₂O", dotColor: "#64748b" },
      { name: "HCl (pekat)", dotColor: "#dc2626" },
      { name: "SnCl₂·2H₂O", dotColor: "#1e3a8a" },
      { name: "Bi(NO₃)₃·5H₂O", dotColor: "#d97706" },
    ],
  },
  {
    id: "C",
    title: "Larutan C",
    badge: "Pengompleks & Penyangga",
    accentColor: "#7c3aed",
    volumeInfo: "9 mL · Buffer pH ~2",
    functionText: "Pengompleks pendamping (asam sitrat) sekaligus penyangga keasaman larutan (buffer pH ~2).",
    components: [
      { name: "H₂O", dotColor: "#64748b" },
      { name: "HCl", dotColor: "#dc2626" },
      { name: "Asam Sitrat", dotColor: "#7c3aed" },
    ],
  },
];

export function ElectrolyteSolutionsCards() {
  return (
    <div
      data-electrolyte-solutions-cards
      className="m4-motion-enter grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 h-full items-stretch min-w-0"
    >
      {SOLUTIONS.map((sol) => (
        <div
          key={sol.id}
          className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-2 sm:p-2.5 flex flex-col justify-between shadow-xs min-w-0 h-full"
        >
          {/* Header & Function Text */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: sol.accentColor }}
                />
                <h3 className="font-bold text-[11px] sm:text-xs text-[var(--foreground)] truncate">
                  {sol.title}
                </h3>
              </div>
              <span className="rounded-full px-1.5 py-0.2 text-[8px] font-mono font-bold shrink-0 border border-[var(--outline-variant)]/40 text-[var(--text-secondary)] bg-[var(--surface-container-low)]">
                {sol.volumeInfo}
              </span>
            </div>

            <div className="mb-0.5">
              <span className="inline-block text-[8px] font-bold uppercase tracking-wider text-[var(--primary)]">
                {sol.badge}
              </span>
            </div>

            <p
              className="text-[9.5px] sm:text-[10px] text-[var(--text-secondary)] leading-snug text-justify"
              style={{ textAlign: "justify", textJustify: "inter-word" }}
            >
              <ChemText>{sol.functionText}</ChemText>
            </p>
          </div>

          {/* Mini Cards for Component Names (Expanded to fill card space) */}
          <div className="mt-auto pt-1 border-t border-[var(--outline-variant)]/40 min-w-0">
            <div className="text-[8px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
              Komponen:
            </div>
            <div className="grid grid-cols-2 gap-1.5 min-w-0">
              {sol.components.map((comp, cIdx) => (
                <div
                  key={cIdx}
                  className={`rounded-lg border border-[var(--outline-variant)]/60 bg-[var(--surface-container-low)] px-2 py-1 flex items-center gap-1.5 min-w-0 shadow-2xs ${
                    sol.components.length === 3 && cIdx === 2 ? "col-span-2" : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: comp.dotColor }}
                  />
                  <span className="font-bold text-[9.5px] sm:text-[10px] text-[var(--foreground)] truncate">
                    <ChemText>{comp.name}</ChemText>
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
