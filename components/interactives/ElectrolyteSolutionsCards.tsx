// ElectrolyteSolutionsCards — 3 structured solution cards (A, B, C) for Slide 7 review deck.
// Displays the distinct chemical role of each sub-solution and nested mini cards for each component.
"use client";

import { useEffect, useRef, useState } from "react";
import { ChemText } from "@/components/shared/ChemText";
import { REAGENT_DETAILS } from "@/components/interactives/ReagentDeepDiveOverlay";

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
    reagentKey?: "H2O" | "HCl" | "NH3";
  }[];
}

interface ReagentCardItem {
  id: "H2O" | "HCl" | "NH3";
  formula: string;
  name: string;
  accentColor: string;
  bgTint: string;
  borderColor: string;
  structure: string;
  functionText: string;
  reaction: string;
}

const REAGENTS: ReagentCardItem[] = [
  {
    id: "H2O",
    formula: "H₂O",
    name: "Aquadest",
    accentColor: "#0284c7",
    bgTint: "rgba(2, 132, 199, 0.05)",
    borderColor: "rgba(2, 132, 199, 0.35)",
    structure: "Geometri bentuk-V polar (104,5°), permitivitas dielektrik tinggi (ε_r ≈ 78).",
    functionText: "Pelarut universal & media hidrasi kation; membentuk cangkang solvasi [M(H₂O)₆]ⁿ⁺.",
    reaction: "Mⁿ⁺(s) + 6H₂O → [M(H₂O)₆]ⁿ⁺(aq)",
  },
  {
    id: "HCl",
    formula: "HCl",
    name: "HCl Pekat",
    accentColor: "#dc2626",
    bgTint: "rgba(220, 38, 38, 0.05)",
    borderColor: "rgba(220, 38, 38, 0.35)",
    structure: "Molekul diatomik polar, terionisasi sempurna menjadi H⁺ (aq) dan Cl⁻ (aq).",
    functionText: "Menjaga pH pekat ~2 untuk menekan hidrolisis Bi³⁺ dan memasok donor ligan Cl⁻.",
    reaction: "Bi³⁺ + Cl⁻ + H₂O ⇌ BiOCl↓ + 2H⁺",
  },
  {
    id: "NH3",
    formula: "NH₃",
    name: "NH₃ Pekat",
    accentColor: "#059669",
    bgTint: "rgba(5, 150, 105, 0.05)",
    borderColor: "rgba(5, 150, 105, 0.35)",
    structure: "Piramida trigonal (107,8°) dengan 1 pasangan elektron bebas (PEB) pada atom N.",
    functionText: "Media basa penstabil pembuka deprotonasi H₄EDTA menjadi tetraanion EDTA⁴⁻.",
    reaction: "H₄EDTA + 4NH₃ ⇌ EDTA⁴⁻ + 4NH₄⁺",
  },
];

const SOLUTIONS: SolutionItem[] = [
  {
    id: "A",
    title: "Larutan A",
    badge: "Persiapan Pengompleks",
    accentColor: "var(--primary)",
    volumeInfo: "5 mL · Basa",
    functionText: "Persiapan pengompleks EDTA dalam media basa (NH₃) agar terdeprotonasi dan larut sempurna.",
    components: [
      { name: "H₂O", dotColor: "#64748b", reagentKey: "H2O" },
      { name: "NH₃ (pekat)", dotColor: "#0284c7", reagentKey: "NH3" },
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
      { name: "H₂O", dotColor: "#64748b", reagentKey: "H2O" },
      { name: "HCl (pekat)", dotColor: "#dc2626", reagentKey: "HCl" },
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
      { name: "H₂O", dotColor: "#64748b", reagentKey: "H2O" },
      { name: "HCl", dotColor: "#dc2626", reagentKey: "HCl" },
      { name: "Asam Sitrat", dotColor: "#7c3aed" },
    ],
  },
];

function H2OLewisDiagram() {
  return (
    <svg viewBox="0 0 190 44" className="w-full h-full select-none" aria-hidden="true">
      {/* Lone pairs on Oxygen (top-left & top-right) */}
      <circle cx="45" cy="8" r="2.2" fill="#0284c7" />
      <circle cx="51" cy="6" r="2.2" fill="#0284c7" />
      <circle cx="61" cy="6" r="2.2" fill="#0284c7" />
      <circle cx="67" cy="8" r="2.2" fill="#0284c7" />

      {/* Oxygen atom */}
      <text x="56" y="23" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor">
        O
      </text>

      {/* Partial charges */}
      <text x="73" y="14" fontSize="8.5" fontWeight="bold" fill="#0284c7">
        δ⁻
      </text>
      <text x="27" y="34" fontSize="8" fill="var(--text-secondary)">
        δ⁺
      </text>
      <text x="83" y="34" fontSize="8" fill="var(--text-secondary)">
        δ⁺
      </text>

      {/* Covalent single bonds */}
      <line x1="48" y1="24" x2="36" y2="33" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="64" y1="24" x2="76" y2="33" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />

      {/* Hydrogen atoms */}
      <text x="31" y="41" textAnchor="middle" fontSize="13" fontWeight="bold" fill="currentColor">
        H
      </text>
      <text x="81" y="41" textAnchor="middle" fontSize="13" fontWeight="bold" fill="currentColor">
        H
      </text>

      {/* Vertical separator */}
      <line x1="96" y1="5" x2="96" y2="39" stroke="currentColor" opacity="0.18" strokeDasharray="2 2" />

      {/* Molecular descriptor badges */}
      <text x="143" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0284c7">
        Bentuk-V · 104,5°
      </text>
      <text x="143" y="32" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="var(--text-secondary)">
        2 PEB · Polar (ε_r ≈ 78)
      </text>
    </svg>
  );
}

function HclLewisDiagram() {
  return (
    <svg viewBox="0 0 190 44" className="w-full h-full select-none" aria-hidden="true">
      {/* Hydrogen atom */}
      <text x="30" y="27" textAnchor="middle" fontSize="13.5" fontWeight="bold" fill="currentColor">
        H
      </text>

      {/* Partial charges & dipole vector */}
      <text x="30" y="10" textAnchor="middle" fontSize="8.5" fill="var(--text-secondary)">
        δ⁺
      </text>
      <text x="69" y="10" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#dc2626">
        δ⁻
      </text>
      <line x1="39" y1="8" x2="61" y2="8" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
      <polygon points="61,6 65,8 61,10" fill="#dc2626" />

      {/* Single covalent bond */}
      <line x1="39" y1="23" x2="57" y2="23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      {/* Chlorine atom */}
      <text x="69" y="27" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">
        Cl
      </text>

      {/* 3 Lone pairs on Chlorine (top, right, bottom) */}
      <circle cx="64" cy="13" r="2.2" fill="#dc2626" />
      <circle cx="74" cy="13" r="2.2" fill="#dc2626" />
      <circle cx="82" cy="19" r="2.2" fill="#dc2626" />
      <circle cx="82" cy="27" r="2.2" fill="#dc2626" />
      <circle cx="64" cy="33" r="2.2" fill="#dc2626" />
      <circle cx="74" cy="33" r="2.2" fill="#dc2626" />

      {/* Vertical separator */}
      <line x1="96" y1="5" x2="96" y2="39" stroke="currentColor" opacity="0.18" strokeDasharray="2 2" />

      {/* Molecular descriptor badges */}
      <text x="143" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#dc2626">
        Linear Polar
      </text>
      <text x="143" y="32" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="var(--text-secondary)">
        3 PEB Cl · Terionisasi H⁺
      </text>
    </svg>
  );
}

function Nh3LewisDiagram() {
  return (
    <svg viewBox="0 0 190 44" className="w-full h-full select-none" aria-hidden="true">
      {/* Lone pair on Nitrogen (prominent Lewis base donor site) */}
      <circle cx="51" cy="7" r="2.3" fill="#059669" />
      <circle cx="61" cy="7" r="2.3" fill="#059669" />

      {/* Nitrogen atom */}
      <text x="56" y="23" textAnchor="middle" fontSize="16" fontWeight="bold" fill="currentColor">
        N
      </text>

      {/* Partial negative charge */}
      <text x="73" y="14" fontSize="8.5" fontWeight="bold" fill="#059669">
        δ⁻
      </text>

      {/* 3 Covalent bonds to Hydrogens (trigonal pyramidal) */}
      <line x1="48" y1="24" x2="35" y2="33" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <line x1="56" y1="25" x2="56" y2="34" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <line x1="64" y1="24" x2="77" y2="33" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />

      {/* Hydrogen atoms */}
      <text x="30" y="41" textAnchor="middle" fontSize="12.5" fontWeight="bold" fill="currentColor">
        H
      </text>
      <text x="56" y="42" textAnchor="middle" fontSize="12.5" fontWeight="bold" fill="currentColor">
        H
      </text>
      <text x="82" y="41" textAnchor="middle" fontSize="12.5" fontWeight="bold" fill="currentColor">
        H
      </text>

      {/* Vertical separator */}
      <line x1="96" y1="5" x2="96" y2="39" stroke="currentColor" opacity="0.18" strokeDasharray="2 2" />

      {/* Molecular descriptor badges */}
      <text x="143" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#059669">
        Piramida · 107,8°
      </text>
      <text x="143" y="32" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="var(--text-secondary)">
        1 PEB Aktif · Basa Lewis
      </text>
    </svg>
  );
}

function EdtaLewisDiagram() {
  return (
    <svg viewBox="0 0 210 44" className="w-full h-full select-none" aria-hidden="true">
      {/* Ethylenediamine core: –N–CH₂–CH₂–N– with 4 –COO⁻ branches */}
      <circle cx="28" cy="18" r="2.2" fill="#7c3aed" />
      <text x="28" y="30" textAnchor="middle" fontSize="13" fontWeight="bold" fill="currentColor">
        N
      </text>
      <line x1="35" y1="26" x2="49" y2="26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <text x="56" y="30" textAnchor="middle" fontSize="13" fontWeight="bold" fill="currentColor">
        N
      </text>
      <circle cx="56" cy="18" r="2.2" fill="#7c3aed" />

      {/* 4 Carboxylate branches */}
      <line x1="22" y1="22" x2="13" y2="15" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" />
      <text x="9" y="14" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#7c3aed">
        Ac⁻
      </text>
      <line x1="22" y1="30" x2="13" y2="37" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" />
      <text x="9" y="41" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#7c3aed">
        Ac⁻
      </text>

      <line x1="62" y1="22" x2="71" y2="15" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" />
      <text x="75" y="14" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#7c3aed">
        Ac⁻
      </text>
      <line x1="62" y1="30" x2="71" y2="37" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" />
      <text x="75" y="41" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#7c3aed">
        Ac⁻
      </text>

      {/* Vertical separator */}
      <line x1="86" y1="5" x2="86" y2="39" stroke="currentColor" opacity="0.18" strokeDasharray="2 2" />

      {/* Molecular descriptor badges */}
      <text x="148" y="18" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#7c3aed">
        Heksadentat (2N + 4O)
      </text>
      <text x="148" y="32" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="var(--text-secondary)">
        Kelat Kuat · log Kf ≈ 27,8
      </text>
    </svg>
  );
}

function CitrateLewisDiagram() {
  return (
    <svg viewBox="0 0 210 44" className="w-full h-full select-none" aria-hidden="true">
      {/* 3 Carboxyls + 1 OH */}
      <circle cx="44" cy="8" r="2.2" fill="#d97706" />
      <line x1="44" y1="10" x2="44" y2="22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <text x="44" y="9" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#d97706">
        OH
      </text>

      {/* Carbon chain C–C–C */}
      <line x1="25" y1="25" x2="44" y2="25" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="44" y1="25" x2="63" y2="25" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />

      {/* Carboxyl branches */}
      <text x="15" y="28" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#d97706">
        OOC–
      </text>
      <text x="73" y="28" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#d97706">
        –COO
      </text>
      <line x1="44" y1="27" x2="44" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <text x="44" y="42" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#d97706">
        COO⁻
      </text>

      {/* Vertical separator */}
      <line x1="86" y1="5" x2="86" y2="39" stroke="currentColor" opacity="0.18" strokeDasharray="2 2" />

      {/* Molecular descriptor badges */}
      <text x="148" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#d97706">
        Tridentat / Sitrat
      </text>
      <text x="148" y="32" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="var(--text-secondary)">
        Buffer pH ≈ 2 · log Kf 10,2
      </text>
    </svg>
  );
}

function PegLewisDiagram() {
  return (
    <svg viewBox="0 0 210 44" className="w-full h-full select-none" aria-hidden="true">
      {/* Polyethylene glycol repeating ether chain */}
      <text x="13" y="26" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#0d9488">
        HO–
      </text>
      <text x="23" y="27" textAnchor="middle" fontSize="15" fill="var(--muted)">
        [
      </text>
      <text x="41" y="26" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="currentColor">
        CH₂CH₂
      </text>
      <circle cx="59" cy="18" r="2.2" fill="#0d9488" />
      <circle cx="65" cy="18" r="2.2" fill="#0d9488" />
      <text x="62" y="27" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0d9488">
        O
      </text>
      <text x="71" y="27" textAnchor="middle" fontSize="15" fill="var(--muted)">
        ]ₙ
      </text>
      <text x="79" y="35" textAnchor="middle" fontSize="7.5" fontFamily="monospace" fill="#0d9488">
        n≈8–9
      </text>

      {/* Vertical separator */}
      <line x1="88" y1="5" x2="88" y2="39" stroke="currentColor" opacity="0.18" strokeDasharray="2 2" />

      {/* Molecular descriptor badges */}
      <text x="150" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0d9488">
        Surfaktan Non-ionik
      </text>
      <text x="150" y="32" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="var(--text-secondary)">
        Supresi Dendrit (n ≈ 8–9)
      </text>
    </svg>
  );
}

interface Stage2ReagentItem {
  id: "EDTA" | "Citrate" | "PEG";
  formula: string;
  name: string;
  accentColor: string;
  bgTint: string;
  borderColor: string;
  solutionSource: string;
  functionText: string;
  reaction: string;
}

const STAGE2_REAGENTS: Stage2ReagentItem[] = [
  {
    id: "EDTA",
    formula: "EDTA",
    name: "EDTA⁴⁻",
    accentColor: "#7c3aed",
    bgTint: "rgba(124, 58, 237, 0.05)",
    borderColor: "rgba(124, 58, 237, 0.35)",
    solutionSource: "Larutan A",
    functionText: "Pengkelat kuat heksadentat; selektif mengikat Bi³⁺ untuk menggeser potensial ke arah negatif dan merapatkan gap ΔE°.",
    reaction: "Bi³⁺ + EDTA⁴⁻ ⇌ [Bi(EDTA)]⁻",
  },
  {
    id: "Citrate",
    formula: "Cit",
    name: "Asam Sitrat",
    accentColor: "#d97706",
    bgTint: "rgba(217, 119, 6, 0.05)",
    borderColor: "rgba(217, 119, 6, 0.35)",
    solutionSource: "Larutan C",
    functionText: "Pengompleks pendamping Sn²⁺ & buffer pH ~2 untuk menstabilkan kation dan menekan hidrolisis prekursor.",
    reaction: "Sn²⁺ + HCit²⁻ ⇌ [Sn(Cit)]⁻ + H⁺",
  },
  {
    id: "PEG",
    formula: "PEG",
    name: "PEG-400",
    accentColor: "#0d9488",
    bgTint: "rgba(13, 148, 136, 0.05)",
    borderColor: "rgba(13, 148, 136, 0.35)",
    solutionSource: "Aditif Katoda",
    functionText: "Leveling agent perata deposit; teradsorpsi pada tonjolan katoda Cu untuk menekan dendrit dan menghaluskan paduan.",
    reaction: "Katoda + PEG → Katoda–[PEG]ads",
  },
];

export interface ElectrolyteSolutionsCardsProps {
  stage?: 0 | 1 | 2;
  onSetStage?: (stage: 0 | 1 | 2) => void;
  overlayOpen?: boolean;
  onToggleOverlay?: (open: boolean) => void;
  activeReagentId?: "H2O" | "HCl" | "NH3" | null;
  onSelectReagent?: (id: "H2O" | "HCl" | "NH3" | null) => void;
}

export function ElectrolyteSolutionsCards({
  stage,
  onSetStage,
  overlayOpen,
  onToggleOverlay,
  activeReagentId,
  onSelectReagent,
}: ElectrolyteSolutionsCardsProps = {}) {
  // Determine active global stage (0, 1, or 2)
  const activeStage: 0 | 1 | 2 = stage !== undefined ? stage : overlayOpen ? 1 : 0;

  // Individual card stage overrides
  const [individualStages, setIndividualStages] = useState<Record<number, 0 | 1 | 2>>({});

  // Reset individual overrides when global stage changes
  useEffect(() => {
    setIndividualStages({});
  }, [stage, overlayOpen]);

  const [face1Content, setFace1Content] = useState<"solutions" | "stage2">(
    activeStage === 2 ? "stage2" : "solutions"
  );
  const prevStageRef = useRef(activeStage);

  useEffect(() => {
    const prev = prevStageRef.current;
    prevStageRef.current = activeStage;

    if (activeStage === 0) {
      setFace1Content("solutions");
    } else if (activeStage === 2) {
      setFace1Content("stage2");
    } else if (activeStage === 1) {
      // While turning backwards at stage 1, keep face 1 stable until card turns past 90deg (400ms)
      if (prev === 0) {
        const timer = setTimeout(() => {
          setFace1Content("stage2");
        }, 400);
        return () => clearTimeout(timer);
      } else if (prev === 2) {
        const timer = setTimeout(() => {
          setFace1Content("solutions");
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [activeStage]);

  const getCardStage = (idx: number): 0 | 1 | 2 => {
    if (individualStages[idx] !== undefined) {
      return individualStages[idx];
    }
    return activeStage;
  };

  const advanceCardStage = (idx: number) => {
    const current = getCardStage(idx);
    const next = ((current + 1) % 3) as 0 | 1 | 2;
    setIndividualStages((prev) => ({ ...prev, [idx]: next }));
    if (onSetStage) {
      onSetStage(next);
    } else if (onToggleOverlay) {
      onToggleOverlay(next > 0);
    }
  };

  return (
    <div
      data-electrolyte-solutions-cards
      className="m4-flip-stage m4-motion-enter h-full w-full min-w-0"
    >
      {SOLUTIONS.map((sol, idx) => {
        const reagent1 = REAGENTS[idx];
        const reagent2 = STAGE2_REAGENTS[idx];
        const currentCardStage = getCardStage(idx);
        const isFlipped = currentCardStage === 1;

        return (
          <div key={sol.id} className="m4-flip-column min-w-0">
            <div className={`m4-flip-inner ${isFlipped ? "m4-is-flipped" : ""}`}>
              {/* ── FRONT FACE (FACE 1): LARUTAN A/B/C (STAGE 0) OR EDTA/CITRATE/PEG (STAGE 2) ── */}
              {face1Content === "solutions" ? (
                <div
                  className="m4-flip-face m4-flip-front m4-deck-sol-card border border-[var(--outline-variant)] bg-[var(--surface)] shadow-xs min-w-0"
                  onClick={() => advanceCardStage(idx)}
                >
                  {/* Header & Function Text */}
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
                      <div
                        className="m4-reagent-pill-name border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--foreground)] shadow-2xs"
                      >
                        {sol.title}
                      </div>
                      <span className="m4-deck-sol-vol rounded-md font-mono font-bold shrink-0 border border-[var(--outline-variant)]/60 text-[var(--text-secondary)] bg-[var(--surface-container-low)]">
                        {sol.volumeInfo}
                      </span>
                    </div>

                    <div className="mb-0.5 sm:mb-1">
                      <span className="m4-deck-sol-badge inline-block text-[var(--primary)]">
                        {sol.badge}
                      </span>
                    </div>

                    <p className="m4-deck-sol-body">
                      <ChemText>{sol.functionText}</ChemText>
                    </p>
                  </div>

                  {/* Mini Cards for Component Names */}
                  <div className="m4-deck-sol-bottom min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="m4-deck-sol-comp-lbl">Komponen:</span>
                      <span className="text-[8px] text-[var(--muted)] font-semibold hidden sm:inline">
                        Klik kartu untuk 3D balik
                      </span>
                    </div>
                    <div className="m4-deck-sol-grid min-w-0">
                      {sol.components.map((comp, cIdx) => (
                        <div
                          key={cIdx}
                          className={`m4-deck-sol-mini border border-[var(--outline-variant)]/70 bg-[var(--surface-container-low)] min-w-0 shadow-2xs ${
                            sol.components.length === 3 && cIdx === 2 ? "col-span-2" : ""
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className="m4-deck-sol-mini-dot"
                            style={{ backgroundColor: comp.dotColor }}
                          />
                          <span className="m4-deck-sol-mini-text">
                            <ChemText>{comp.name}</ChemText>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── STAGE 2 FRONT FACE: EDTA / SITRAT / PEG-400 ── */
                <div
                  className="m4-flip-face m4-flip-front m4-reagent-back-card min-w-0"
                  style={{
                    backgroundColor: reagent2.bgTint,
                    borderColor: reagent2.borderColor,
                  }}
                  onClick={() => advanceCardStage(idx)}
                >
                  {/* Header: Reagent Title Pill */}
                  <div className="flex items-center justify-between gap-1 mb-1 shrink-0 min-w-0">
                    <div
                      className="m4-reagent-pill-name shadow-2xs"
                      style={{
                        backgroundColor: reagent2.bgTint,
                        borderColor: reagent2.borderColor,
                        color: reagent2.accentColor,
                      }}
                    >
                      <ChemText>{reagent2.name}</ChemText>
                    </div>
                  </div>

                  {/* 1. STRUKTUR & KOORDINASI */}
                  <div className="min-w-0">
                    <span className="m4-reagent-sec-lbl block mb-0.5">
                      1. Struktur &amp; Koordinasi:
                    </span>
                    <div className="m4-reagent-lewis-box border border-[var(--outline-variant)]/60 bg-[var(--surface)]/90 shadow-2xs min-w-0">
                      {reagent2.id === "EDTA" && <EdtaLewisDiagram />}
                      {reagent2.id === "Citrate" && <CitrateLewisDiagram />}
                      {reagent2.id === "PEG" && <PegLewisDiagram />}
                    </div>
                  </div>

                  {/* 2. FUNGSI */}
                  <div className="min-w-0">
                    <span className="m4-reagent-sec-lbl block">
                      2. Fungsi:
                    </span>
                    <p className="m4-reagent-sec-text text-[var(--foreground)] mt-0.5">
                      <ChemText>{reagent2.functionText}</ChemText>
                    </p>
                  </div>

                  {/* 3. REAKSI / MEKANISME */}
                  <div className="min-w-0">
                    <span className="m4-reagent-sec-lbl block mb-0.5">
                      3. Reaksi / Mekanisme:
                    </span>
                    <div className="m4-reagent-eq-box rounded-lg border border-[var(--outline-variant)]/60 bg-[var(--surface)]/90 text-center shadow-2xs min-w-0">
                      <p
                        className="m4-reagent-eq-formula font-mono font-bold truncate"
                        style={{ color: reagent2.accentColor }}
                      >
                        <ChemText>{reagent2.reaction}</ChemText>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── BACK FACE (FACE 2): REAGEN KRITIS H₂O · HCl · NH₃ ── */}
              <div
                className="m4-flip-face m4-flip-back m4-reagent-back-card min-w-0"
                style={{
                  backgroundColor: reagent1.bgTint,
                  borderColor: reagent1.borderColor,
                }}
                onClick={() => advanceCardStage(idx)}
              >
                {/* Header: Reagent Title Pill */}
                <div className="flex items-center justify-between gap-1 mb-1 shrink-0 min-w-0">
                  <div
                    className="m4-reagent-pill-name shadow-2xs"
                    style={{
                      backgroundColor: reagent1.bgTint,
                      borderColor: reagent1.borderColor,
                      color: reagent1.accentColor,
                    }}
                  >
                    <ChemText>{reagent1.id === "H2O" ? "Aquadest (H₂O)" : reagent1.name}</ChemText>
                  </div>
                </div>

                {/* 1. STRUKTUR LEWIS */}
                <div className="min-w-0">
                  <span className="m4-reagent-sec-lbl block mb-0.5">
                    1. Struktur Lewis:
                  </span>
                  <div className="m4-reagent-lewis-box border border-[var(--outline-variant)]/60 bg-[var(--surface)]/90 shadow-2xs min-w-0">
                    {reagent1.id === "H2O" && <H2OLewisDiagram />}
                    {reagent1.id === "HCl" && <HclLewisDiagram />}
                    {reagent1.id === "NH3" && <Nh3LewisDiagram />}
                  </div>
                </div>

                {/* 2. FUNGSI */}
                <div className="min-w-0">
                  <span className="m4-reagent-sec-lbl block">
                    2. Fungsi:
                  </span>
                  <p className="m4-reagent-sec-text text-[var(--foreground)] mt-0.5">
                    <ChemText>{reagent1.functionText}</ChemText>
                  </p>
                </div>

                {/* 3. REAKSI KIMIA */}
                <div className="min-w-0">
                  <span className="m4-reagent-sec-lbl block mb-0.5">
                    3. Reaksi Kimia:
                  </span>
                  <div className="m4-reagent-eq-box rounded-lg border border-[var(--outline-variant)]/60 bg-[var(--surface)]/90 text-center shadow-2xs min-w-0">
                    <p
                      className="m4-reagent-eq-formula font-mono font-bold truncate"
                      style={{ color: reagent1.accentColor }}
                    >
                      <ChemText>{reagent1.reaction}</ChemText>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
