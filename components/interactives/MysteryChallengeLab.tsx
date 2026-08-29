/**
 * Enhanced Mystery Challenge Mode with Interactive Dropper Animation
 * Students click reagent bottles → see animation of dropping into test tube
 * Progressive difficulty with scoring and timed challenges
 */

"use client";

import { useState, useEffect } from "react";
import { Equation } from "../shared/Equation";
import { ReactionTubeAnimation, type VisualSpec } from "./ReactionTubeAnimation";

interface MysteryChallenge {
  id: string;
  name: string;
  actualCation: string;
  hints: string[];
  difficulty: "easy" | "medium" | "hard";
  maxTests: number;
  testSequence: {
    reagent: string;
    expectedObservation: string;
    confirmatory: boolean;
  }[];
}

const MYSTERY_CHALLENGES: MysteryChallenge[] = [
  {
    id: "mystery-01",
    name: "Cuplikan Misterius #A01",
    actualCation: "Ag+",
    hints: ["Endapan putih dengan HCl (Golongan I)", "Bisa larut dalam amonia berlebih"],
    difficulty: "easy",
    maxTests: 5,
    testSequence: [{ reagent: "HCl", expectedObservation: "Endapan putih curdy AgCl", confirmatory: true }],
  },
  {
    id: "mystery-02",
    name: "Cuplikan Misterius #A02",
    actualCation: "Pb2+",
    hints: ["Endapan putih dengan HCl", "Larut dalam air panas"],
    difficulty: "easy",
    maxTests: 5,
    testSequence: [{ reagent: "HCl", expectedObservation: "Endapan putih kristal PbCl₂", confirmatory: true }],
  },
  {
    id: "mystery-03",
    name: "Cuplikan Misterius #B01",
    actualCation: "Cu2+",
    hints: ["Warna biru alami larutan", "Endapan biru dengan NaOH", "Kompleks biru royal dengan NH₃"],
    difficulty: "medium",
    maxTests: 6,
    testSequence: [{ reagent: "NaOH", expectedObservation: "Endapan gelatin biru Cu(OH)₂", confirmatory: true }],
  },
  {
    id: "mystery-04",
    name: "Cuplikan Misterius #B02",
    actualCation: "Al3+",
    hints: ["Endapan putih dengan NaOH", "Bisa larut dalam basa berlebih (amfoter)"],
    difficulty: "medium",
    maxTests: 6,
    testSequence: [{ reagent: "NaOH", expectedObservation: "Endapan putih Al(OH)₃ amfoter", confirmatory: true }],
  },
];

export function MysteryChallengeLab({ onSelectTest, initialIndex }: { onSelectTest?: () => void, initialIndex?: number }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);
  const [selectedMystery, setSelectedMystery] = useState<MysteryChallenge>(MYSTERY_CHALLENGES[0]);
  const [testedReagents, setTestedReagents] = useState<string[]>([]);
  const [observations, setObservations] = useState<{reagent: string, text: string}[]>([]);
  const [score, setScore] = useState(0);
  const [timeStart, setTimeStart] = useState(Date.now());
  const [guessMade, setGuessMade] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Prevent hydration mismatch
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Helper functions for determining reaction visual properties
  const determineFinalColor = (cation: string, reagent: string): string => {
    if (hasPrecipitate(cation, reagent)) return "rgba(245, 240, 235, 0.6)";
    if (cation.includes("Cu") && reagent === "NH3") return "rgba(79, 70, 229, 0.5)"; // Royal blue
    return "rgba(240, 248, 255, 0.5)";
  };

  const determinePrecipitateColor = (cation: string, reagent: string): "white" | "black" | "blue" | "brown" | "no_color" => {
    if (!hasPrecipitate(cation, reagent)) return "no_color";
    
    // Based on actual chemistry observations
    switch (cation) {
      case "Ag+":
        if (reagent === "HCl") return "white"; // White curdy AgCl
        if (reagent === "NaOH") return "brown"; // Brown Ag2O
        if (reagent === "H2S") return "black"; // Black Ag2S
        break;
      case "Pb2+":
        if (reagent === "HCl") return "white"; // White PbCl2
        if (reagent === "NaOH") return "white"; // White amphoteric
        if (reagent === "H2S") return "black"; // Black PbS
        break;
      case "Cu2+":
        if (reagent === "NaOH") return "blue"; // Blue Cu(OH)2
        break;
      case "Al3+":
        if (reagent === "NaOH") return "white"; // White amphoteric
        break;
      default:
        return "white";
    }
    return "white";
  };

  const observePrecipitateType = (text: string): "curd" | "gelatinous" | "crystalline" | "powder" | "none" => {
    if (text.includes("kental") || text.includes("curdy")) return "curd";
    if (text.includes("kristal") || text.includes("jarum")) return "crystalline";
    if (text.includes("gelatinous") || text.includes("gel")) return "gelatinous";
    if (text.includes("putih") && !text.includes("kental")) return "powder";
    return "powder";
  };

  const hasGasFormation = (reagent: string): boolean => {
    return reagent === "NaOH" || reagent === "H2S" || reagent === "NH3";
  };

  const hasPrecipitate = (cation: string, reagent: string): boolean => {
    const cationsWithPrecipitates: Record<string, string[]> = {
      "Ag+": ["HCl", "NaOH", "H2S"],
      "Pb2+": ["HCl", "NaOH", "H2S"],
      "Cu2+": ["NaOH"],
      "Al3+": ["NaOH"],
    };
    return cationsWithPrecipitates[cation]?.includes(reagent) ?? false;
  };

  const getPrecipitateHex = (color: "white" | "black" | "blue" | "brown" | "no_color"): string => {
    switch (color) {
      case "white":
        return "#ffffff";
      case "black":
        return "#000000";
      case "blue":
        return "#3b82f6";
      case "brown":
        return "#78350f";
      case "no_color":
        return "#ffffff";
      default:
        return "#ffffff";
    }
  };


  const handleTestDrop = async (reagentId: string) => {
    if (isTesting || testedReagents.includes(reagentId)) return;

    setIsTesting(true);
    
    // Simulate drop animation delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const observationMap: Record<string, string> = {
      "HCl": "Terbentuk endapan putih atau keruh",
      "H2S": "Terbentuk endapan berwarna",
      "NaOH": "Terbentuk endapan hidroksida",
      "NH3": "Terbentuk kompleks amina atau tidak bereaksi"
    };

    setTestedReagents([...testedReagents, reagentId]);
    setObservations([...observations, { reagent: reagentId, text: observationMap[reagentId] || "Reaksi terdeteksi..." }]);
    setIsTesting(false);
    
    setTimeout(() => {}, 3000);
  };

  const handleSubmitGuess = () => {
    if (!guessMade) return;
    
    const isCorrect = guessMade === selectedMystery.actualCation;
    if (isCorrect) {
      setScore(score + 100);
    } else {
      setScore(Math.max(0, score - 50));
    }
    setShowSolution(true);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % MYSTERY_CHALLENGES.length;
    setCurrentIndex(nextIndex);
    setSelectedMystery(MYSTERY_CHALLENGES[nextIndex]);
    setTestedReagents([]);
    setObservations([]);
    setScore(0);
    setTimeStart(Date.now());
    setGuessMade(null);
    setShowSolution(false);
  };

  const getDifficultyBadgeClass = (diff: string) => {
    switch(diff) {
      case "easy": return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700";
      case "hard": return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const timeSpent = Math.floor((Date.now() - timeStart) / 1000);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-[var(--outline-variant)] gap-4">
        <div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getDifficultyBadgeClass(selectedMystery.difficulty)} inline-block`}>
            Level {selectedMystery.difficulty.toUpperCase()}
          </span>
          <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2 mt-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[var(--primary-container)]">
              search_check
            </span>
            {selectedMystery.name} ({currentIndex + 1} dari {MYSTERY_CHALLENGES.length})
          </h3>
        </div>
        
        {/* Score Display */}
        <div className="flex items-center gap-4 bg-[var(--surface-container-low)] p-3 rounded-xl">
          <div className="text-right min-w-[80px]">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Skor</p>
            <p className="text-2xl font-bold text-[var(--primary)]">{score}</p>
          </div>
          <button
            onClick={handleNext}
            className="px-3 py-2 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] hover:border-[var(--primary-container)] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Cuplikan Berikutnya ➔
          </button>
        </div>
      </div>

      {/* Hint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {selectedMystery.hints.map((hint, idx) => (
          <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/40 text-sm text-blue-900 dark:text-blue-100 flex items-start gap-3">
            <span aria-hidden="true" className="material-symbols-outlined text-base mt-0.5 text-blue-500 flex-shrink-0">lightbulb</span>
            <span>{hint}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Reagent Dispenser */}
        <div className="p-5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">?</div>
            <div>
              <h4 className="font-bold text-sm text-[var(--foreground)]">Cuplikan Misterius</h4>
              <p className="text-xs text-[var(--muted)]">Kation tidak dikenal - identifikasi!</p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-[var(--outline-variant)]/40">
            <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
              Reagen yang Tersedia ({4 - testedReagents.length} tes tersisa):
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {["HCl", "H2S", "NaOH", "NH3"].map((reagentId) => {
                const isUsed = testedReagents.includes(reagentId);
                const iconMap: Record<string, string> = {
                  "HCl": "science",
                  "H2S": "bubble_chart", 
                  "NaOH": "opacity",
                  "NH3": "water_drop"
                };

                return (
                  <button
                    key={reagentId}
                    onClick={() => handleTestDrop(reagentId)}
                    disabled={isUsed || isTesting}
                    className={`relative p-4 rounded-lg text-left border-2 transition-all flex items-center gap-3 min-h-[70px] ${
                      isUsed
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                        : "bg-[var(--surface-container-lowest)] border-[var(--outline-variant)]/60 hover:border-[var(--primary-container)] hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-xl text-amber-400">
                      {iconMap[reagentId]}
                    </span>
                    <div className="flex-1">
                      <span className={`font-semibold ${isUsed ? "text-gray-500" : "text-[var(--foreground)]"}`}>
                        {reagentId === "H2S" ? "H₂S (suasana asam)" : 
                         reagentId === "NH3" ? "NH₃ (amoniak)" : 
                         reagentId}
                      </span>
                      {isUsed && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-2">✓ Selesai</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stats Bar */}
            <div className="mt-4 p-3 bg-[var(--surface-container-lowest)] rounded-lg border border-[var(--outline-variant)]/30 text-xs text-[var(--muted)] flex flex-wrap gap-x-4 gap-y-1">
              <span>⏱️ Waktu: {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}</span>
              <span>🧪 Tes: {testedReagents.length}/5</span>
              <span>💡 Skor sementara: {score}</span>
            </div>
          </div>
        </div>

        {/* Right: Live Observation Pad */}
        <div className="md:col-span-1 space-y-4">
          {/* Test Results - REPLACED WITH REACTION TUBE ANIMATION */}
          <div className="p-5 bg-[var(--surface-container-low)] rounded-xl border border-[var(--outline-variant)]/40 space-y-3">
            {observations.length === 0 ? (
              <div className="py-8 text-center">
                <span aria-hidden="true" className="material-symbols-outlined text-6xl text-[var(--muted)] mb-3">
                  science
                </span>
                <p className="text-sm text-[var(--muted)] italic">
                  Klik botol reagen di sebelah kiri untuk memulai pengujian
                </p>
              </div>
            ) : (
              <>
                {/* Animation Display */}
                <div className="relative">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2 mb-3">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">science</span>
                    Visualisasi Reaksi:
                  </h4>
                  
                  {/* Show reaction tube animation for last test */}
                  {observations.length > 0 && (
                    <ReactionTubeAnimation
                      cationName={selectedMystery.actualCation.replace('+', '+').replace('2+', '²⁺')}
                      reagentName={observations[observations.length - 1].reagent === "H2S" ? "H₂S (suasana asam)" : 
                                   observations[observations.length - 1].reagent === "NH3" ? "NH₃ (amonia)" : 
                                   observations[observations.length - 1].reagent}
                      visualSpec={{
                        initialLiquidColor: "rgba(235, 245, 255, 0.4)",
                        finalLiquidColor: determineFinalColor(selectedMystery.actualCation, observations[observations.length - 1].reagent),
                        precipitateColor: getPrecipitateHex(determinePrecipitateColor(selectedMystery.actualCation, observations[observations.length - 1].reagent)),
                        precipitateType: observePrecipitateType(observations[observations.length - 1].text),
                        hasGas: hasGasFormation(observations[observations.length - 1].reagent),
                      }}
                      isUnknown={!showSolution}
                    />
                  )}
                </div>

                {/* Observations List */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2 mt-4">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">assignment</span>
                  Hasil Observasi Langsung:
                </h4>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {observations.map((obs, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 ${obs.reagent === observations[observations.length - 1].reagent 
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300" 
                        : "bg-[var(--surface-container-lowest)] border-[var(--outline-variant)]/40"} 
                       rounded-lg border text-sm animate-fade-in`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">
                          Tes #{idx + 1}: {obs.reagent === "H2S" ? "H₂S" : obs.reagent === "NH3" ? "NH₃" : obs.reagent}
                        </span>
                        {obs.reagent === observations[observations.length - 1].reagent && !showSolution ? (
                          <span className="material-symbols-outlined text-emerald-500 text-lg animate-pulse">ev_station</span>
                        ) : (
                          <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                        )}
                      </div>
                      <p className="text-[var(--foreground)] leading-relaxed">{obs.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Decision Guessing */}
          <div className="p-5 bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--outline-variant)]/60 space-y-4">
            <p className="text-sm font-bold text-[var(--foreground)]">
              Berdasarkan bukti observasi di atas, kation apakah ini?
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {["Ag+", "Pb2+", "Al3+", "Cu2+", "Zn2+"].map((option) => (
                <button
                  key={option}
                  onClick={() => !showSolution && setGuessMade(option)}
                  disabled={showSolution}
                  className={`py-3 px-4 rounded-lg text-sm font-bold border-2 transition-all ${
                    guessMade === option
                      ? "bg-[var(--primary-container)] text-white border-[var(--primary-container)] shadow-inner"
                      : "bg-[var(--surface-container-low)] border-[var(--outline-variant)]/60 hover:border-[var(--primary-container)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {!showSolution && (
              <button
                onClick={handleSubmitGuess}
                disabled={!guessMade}
                className="w-full py-3 bg-[var(--primary)] text-white text-sm font-bold rounded-lg hover:bg-[var(--primary-dark)] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                Konfirmasi Jawaban & Hitung Skor
              </button>
            )}

            {showSolution && (
              <div className={`p-4 rounded-xl border text-sm space-y-3 animate-fade-in ${
                guessMade === selectedMystery.actualCation
                  ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700"
                  : "bg-red-50 dark:bg-red-900/40 text-red-900 dark:text-red-100 border-red-300 dark:border-red-700"
              }`}>
                <p className="font-bold text-base flex items-center gap-2">
                  {guessMade === selectedMystery.actualCation ? (
                    <>
                      <span className="material-symbols-outlined">check_circle</span>
                      Jawaban Anda BENAR!
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">close</span>
                      Kurang Tepat
                    </>
                  )}
                </p>
                
                <div className="pt-3 border-t border-current/20">
                  <p className="font-semibold text-sm mb-2">Identitas: <strong>{selectedMystery.actualCation.replace('+', '+').replace('2+', '²⁺').replace('3+', '³⁺')}</strong></p>
                  
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Solusi Lengkap:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {selectedMystery.testSequence.map((step, idx) => (
                        <li key={idx}>{step.expectedObservation}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="font-semibold text-sm mt-3">Skor Akhir:</p>
                  <p className="text-3xl font-bold">{score} pts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}