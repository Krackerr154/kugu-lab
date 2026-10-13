"use client";

import { ChemText } from "@/components/shared/ChemText";

export interface ReagentDetail {
  id: "H2O" | "HCl" | "NH3";
  formula: string;
  name: string;
  roleBadge: string;
  solutionsBadge: string;
  accentColor: string;
  bgTint: string;
  borderColor: string;
  primaryRole: string;
  mechanism: string;
  equation: string;
  criticalWarning: string;
}

export const REAGENT_DETAILS: ReagentDetail[] = [
  {
    id: "H2O",
    formula: "H₂O",
    name: "Aquadest Bebas Ion",
    roleBadge: "Pelarut & Hidrasi",
    solutionsBadge: "Larutan A, B, C",
    accentColor: "#0284c7",
    bgTint: "rgba(2, 132, 199, 0.06)",
    borderColor: "rgba(2, 132, 199, 0.35)",
    primaryRole:
      "Media pelarut murni berkonstanta dielektrik tinggi (ε_r ≈ 78) yang mendisosiasi garam prekursor.",
    mechanism:
      "Membentuk cangkang solvasi [M(H₂O)₆]ⁿ⁺ stabil sebelum ligan pengompleks EDTA dan sitrat masuk.",
    equation: "Mⁿ⁺(s) + 6H₂O → [M(H₂O)₆]ⁿ⁺(aq)",
    criticalWarning:
      "Wajib aquadest murni; ion kalsium & klorida liar pada air kran merusak stoikiometri paduan.",
  },
  {
    id: "HCl",
    formula: "HCl",
    name: "Asam Klorida Pekat",
    roleBadge: "Anti-Hidrolisis",
    solutionsBadge: "Larutan B & C",
    accentColor: "#dc2626",
    bgTint: "rgba(220, 38, 38, 0.06)",
    borderColor: "rgba(220, 38, 38, 0.35)",
    primaryRole:
      "Menyediakan ion H⁺ berlebih untuk menjaga keasaman pekat (pH ~ 2) pada prekursor logam.",
    mechanism:
      "Mencegah kesetimbangan hidrolisis kation Bi³⁺ membentuk endapan bismut oksiklorida:",
    equation: "Bi³⁺ + Cl⁻ + H₂O ⇌ BiOCl↓ + 2H⁺",
    criticalWarning:
      "Tanpa HCl pekat, Bi³⁺ langsung mengendap putih susu (BiOCl) dan kodeposisi paduan gagal total.",
  },
  {
    id: "NH3",
    formula: "NH₃",
    name: "Amonia Pekat",
    roleBadge: "Deprotonasi EDTA",
    solutionsBadge: "Larutan A",
    accentColor: "#059669",
    bgTint: "rgba(5, 150, 105, 0.06)",
    borderColor: "rgba(5, 150, 105, 0.35)",
    primaryRole:
      "Media basa penstabil yang membuka kelarutan asam EDTA yang sukar larut dalam air netral.",
    mechanism:
      "Mendeprotonasi gugus karboksilat asam H₄EDTA bebas menjadi ion kelat tetraanion aktif:",
    equation: "H₄EDTA + 4NH₃ ⇌ EDTA⁴⁻ + 4NH₄⁺",
    criticalWarning:
      "Tanpa suasana basa amonia, serbuk EDTA tidak larut sempurna dan gagal mengkelat ion logam.",
  },
];

export interface ReagentDeepDiveOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeReagentId?: "H2O" | "HCl" | "NH3" | null;
  onSelectReagent?: (id: "H2O" | "HCl" | "NH3") => void;
}

export function ReagentDeepDiveOverlay({
  isOpen,
  onClose,
  activeReagentId,
  onSelectReagent,
}: ReagentDeepDiveOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Penjelasan Mendalam Reagen Kritis: H2O, HCl, dan NH3"
      className="m4-reagent-overlay-backdrop absolute inset-0 z-30 rounded-xl bg-[var(--surface)]/95 backdrop-blur-md p-2 sm:p-2.5 flex flex-col justify-between shadow-2xl"
    >
      {/* ── TOP HEADER BAR ── */}
      <div className="m4-reagent-header flex items-center justify-between gap-2 border-b border-[var(--outline-variant)]/60 shrink-0 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[var(--primary)] shrink-0 animate-pulse" />
          <h2 className="m4-reagent-main-title font-bold text-[var(--foreground)] truncate">
            Peran Reagen Kritis: H₂O · HCl · NH₃
          </h2>
          <span className="m4-reagent-header-pill hidden sm:inline-block rounded-md border border-[var(--outline-variant)]/60 bg-[var(--surface-container-low)] font-semibold text-[var(--text-secondary)]">
            Pendalaman Slide 7
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="m4-reagent-esc-hint text-[var(--muted)] hidden md:inline">
            Tekan &lsquo;Berikutnya&rsquo; atau Esc untuk menutup
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pendalaman reagen"
            className="m4-motion-control m4-reagent-close-btn inline-flex items-center gap-1 rounded-md border border-[var(--outline-variant)] bg-[var(--surface-control)] font-bold text-[var(--foreground)] hover:bg-[var(--surface-container)]"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xs">
              close
            </span>
            <span>Tutup</span>
          </button>
        </div>
      </div>

      {/* ── 3 CARD GRID (UNFOLDING CARDS) ── */}
      <div className="m4-reagent-cards-stage grid grid-cols-1 sm:grid-cols-3 flex-1 min-h-0 items-stretch">
        {REAGENT_DETAILS.map((reagent, idx) => {
          const isSelected = activeReagentId === reagent.id;
          return (
            <div
              key={reagent.id}
              onClick={() => onSelectReagent?.(reagent.id)}
              className={`m4-reagent-card m4-reagent-card-${idx + 1} rounded-xl border flex flex-col justify-between shadow-xs transition-all h-full min-w-0 ${
                isSelected
                  ? "ring-2 ring-[var(--primary)]"
                  : "hover:border-[var(--outline)]"
              }`}
              style={{
                backgroundColor: reagent.bgTint,
                borderColor: reagent.borderColor,
              }}
            >
              {/* Header: Formula + Role + Solution pill */}
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
                  <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                    <span
                      aria-hidden="true"
                      className="m4-reagent-badge flex items-center justify-center rounded-lg font-bold text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: reagent.accentColor }}
                    >
                      <ChemText>{reagent.formula}</ChemText>
                    </span>
                    <div className="min-w-0">
                      <h3 className="m4-reagent-title font-bold text-[var(--foreground)] truncate leading-tight">
                        {reagent.name}
                      </h3>
                      <span
                        className="m4-reagent-sub font-bold uppercase tracking-wider block truncate"
                        style={{ color: reagent.accentColor }}
                      >
                        {reagent.roleBadge}
                      </span>
                    </div>
                  </div>

                  <span className="m4-reagent-sol rounded-md border border-[var(--outline-variant)]/60 bg-[var(--surface)] font-mono font-bold text-[var(--text-secondary)] shrink-0">
                    {reagent.solutionsBadge}
                  </span>
                </div>

                {/* Primary chemical explanation */}
                <p className="m4-reagent-desc text-[var(--foreground)]">
                  <ChemText>{reagent.primaryRole}</ChemText>
                </p>
              </div>

              {/* Center: Equation Box */}
              <div className="m4-reagent-eq-box rounded-lg border border-[var(--outline-variant)]/60 bg-[var(--surface)]/90 text-center shadow-2xs min-w-0">
                <span className="m4-reagent-eq-lbl font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Reaksi Kimia:
                </span>
                <p
                  className="m4-reagent-eq-formula font-mono font-bold truncate"
                  style={{ color: reagent.accentColor }}
                >
                  <ChemText>{reagent.equation}</ChemText>
                </p>
              </div>

              {/* Bottom: Mechanism & Critical Warning */}
              <div className="m4-reagent-warn-wrapper min-w-0 border-t border-[var(--outline-variant)]/40">
                <div className="m4-reagent-warn-box rounded-md border border-amber-500/30 bg-amber-500/10 flex items-start gap-1">
                  <span
                    aria-hidden="true"
                    className="m4-reagent-warn-icon material-symbols-outlined text-amber-600 shrink-0"
                  >
                    warning
                  </span>
                  <p className="m4-reagent-warn-text leading-tight text-amber-950 dark:text-amber-200">
                    <ChemText>{reagent.criticalWarning}</ChemText>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
