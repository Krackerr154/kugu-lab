"use client";

import { useEffect, useState, useRef } from "react";

export type ReactionType =
  | "no_reaction"
  | "white_curd"
  | "white_gelatinous"
  | "white_crystalline"
  | "black_ppt"
  | "brown_ppt"
  | "rust_ppt"
  | "green_ppt"
  | "blue_gelatinous"
  | "yellow_ppt"
  | "blue_complex"
  | "dissolve_clear"
  | "redox_sulfur"
  | "gas_h2"
  | "gas_co2"
  | "gas_so2";

export interface VisualSpec {
  initialLiquidColor: string; // CSS color / gradient
  finalLiquidColor: string;
  precipitateColor?: string;
  precipitateType?: "curd" | "gelatinous" | "crystalline" | "powder" | "none";
  precipitateDensity?: "heavy" | "medium" | "light";
  hasGas?: boolean;
  gasType?: "h2" | "co2" | "so2";
  canDissolveInExcess?: boolean;
  excessResult?: "clear" | "blue_complex" | "green_solution";
  canDissolveInHeat?: boolean;
  flameTestResult?: string;
}

interface ReactionTubeAnimationProps {
  cationName: string;
  reagentName: string;
  visualSpec: VisualSpec;
  isUnknown?: boolean;
  onAnimationComplete?: () => void;
}

export function ReactionTubeAnimation({
  cationName,
  reagentName,
  visualSpec,
  isUnknown = false,
  onAnimationComplete,
}: ReactionTubeAnimationProps) {
  const [animState, setAnimState] = useState<"idle" | "dropping" | "reacting" | "reacted">("idle");
  const [isExcess, setIsExcess] = useState(false);
  const [isHeated, setIsHeated] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showFlameTest, setShowFlameTest] = useState(false);
  const [gasTestTriggered, setGasTestTriggered] = useState(false);

  // Auto trigger drop animation on cation / reagent switch
  useEffect(() => {
    setAnimState("dropping");
    setIsExcess(false);
    setIsHeated(false);
    setShowFlameTest(false);
    setGasTestTriggered(false);

    const dropTimer = setTimeout(() => {
      setAnimState("reacting");
    }, 900);

    const reactTimer = setTimeout(() => {
      setAnimState("reacted");
      if (onAnimationComplete) onAnimationComplete();
    }, 2200);

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(reactTimer);
    };
  }, [cationName, reagentName, visualSpec]);

  const handleRetrigger = () => {
    setAnimState("dropping");
    setIsExcess(false);
    setIsHeated(false);
    setShowFlameTest(false);
    setGasTestTriggered(false);

    setTimeout(() => setAnimState("reacting"), 900);
    setTimeout(() => {
      setAnimState("reacted");
      if (onAnimationComplete) onAnimationComplete();
    }, 2200);
  };

  const handleAgitate = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 900);
  };

  const handleExcess = () => {
    if (!visualSpec.canDissolveInExcess) return;
    setIsExcess(true);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 900);
  };

  const handleHeat = () => {
    setIsHeated(true);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 900);
  };

  const handleGasTest = () => {
    setShowFlameTest(true);
    setGasTestTriggered(true);
  };

  // Determine current active liquid & precipitate visuals based on state
  let currentLiquidColor = visualSpec.initialLiquidColor;
  let currentPptColor = visualSpec.precipitateColor;
  let showPrecipitate = animState === "reacting" || animState === "reacted";

  if (animState === "reacting" || animState === "reacted") {
    currentLiquidColor = visualSpec.finalLiquidColor;
  }

  // Handle excess re-dissolution or color change
  if (isExcess && visualSpec.canDissolveInExcess) {
    if (visualSpec.excessResult === "blue_complex") {
      currentLiquidColor = "rgba(10, 45, 180, 0.88)"; // Deep royal blue tetraamminecopper
      showPrecipitate = false;
    } else if (visualSpec.excessResult === "green_solution") {
      currentLiquidColor = "rgba(22, 163, 74, 0.75)"; // Green chromite
      showPrecipitate = false;
    } else {
      currentLiquidColor = "rgba(235, 245, 255, 0.4)"; // Clear aluminate / zincate / amminesilver
      showPrecipitate = false;
    }
  }

  // Handle heat re-dissolution (e.g., PbCl2)
  if (isHeated && visualSpec.canDissolveInHeat) {
    currentLiquidColor = "rgba(240, 248, 255, 0.5)"; // Clear hot solution
    showPrecipitate = false;
  }

  // Generate bubble elements for gas reactions
  const bubbles = [
    { cx: 70, delay: "0s", duration: "1.2s", size: 3.5 },
    { cx: 85, delay: "0.3s", duration: "1.0s", size: 4.5 },
    { cx: 62, delay: "0.6s", duration: "1.4s", size: 3.0 },
    { cx: 78, delay: "0.2s", duration: "1.1s", size: 5.0 },
    { cx: 90, delay: "0.5s", duration: "1.3s", size: 3.8 },
    { cx: 66, delay: "0.8s", duration: "0.9s", size: 4.0 },
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full w-full max-w-[420px] mx-auto p-4 bg-gradient-to-b from-[var(--surface-container-lowest)] to-[var(--surface-container-low)] rounded-2xl border border-[var(--outline-variant)]/60 shadow-lg select-none">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between border-b border-[var(--outline-variant)]/40 pb-3 mb-2">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--muted)]">Tabung Reaksi</span>
          <h4 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary-container)]"></span>
            <span>{isUnknown ? "Cuplikan Misterius" : cationName}</span>
            <span className="text-[var(--muted)] font-normal">+</span>
            <span className="text-[var(--primary-container)]">{reagentName}</span>
          </h4>
        </div>

        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
            animState === "dropping"
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300 animate-pulse"
              : animState === "reacting"
              ? "bg-sky-50 dark:bg-sky-950/40 text-sky-600 border-sky-300 animate-pulse"
              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300"
          }`}
        >
          {animState === "dropping" && "💧 Meneteskan..."}
          {animState === "reacting" && "⚡ Bereaksi..."}
          {animState === "reacted" && "✓ Reaksi Teramati"}
          {animState === "idle" && "Siap"}
        </span>
      </div>

      {/* Main SVG Animation Area */}
      <div className="relative w-full h-[280px] sm:h-[300px] flex items-center justify-center my-2">
        {/* Agitate Shake Wrapper */}
        <div className={`relative w-full h-full flex items-center justify-center ${isShaking ? "animate-shake" : ""}`}>
          <svg
            viewBox="0 0 200 320"
            className="w-full h-full max-h-[300px] overflow-visible drop-shadow-md"
            aria-label="Animasi Tabung Reaksi Kimia"
          >
            <defs>
              {/* Glass Tube Gradients */}
              <linearGradient id="glassTubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="15%" stopColor="#d0e5f5" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="85%" stopColor="#c8def0" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.65" />
              </linearGradient>

              {/* Glass Highlight */}
              <linearGradient id="glassHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              {/* Pipette Dropper Gradient */}
              <linearGradient id="dropperBulbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b4252" />
                <stop offset="50%" stopColor="#4c566a" />
                <stop offset="100%" stopColor="#2e3440" />
              </linearGradient>

              {/* Precipitate settling filter (organic blur & turbulence) */}
              <filter id="pptTurbulence" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>

            {/* Test Tube Stand / Rack shadow */}
            <ellipse cx="100" cy="305" rx="42" ry="7" fill="rgba(0,0,0,0.12)" />

            {/* === ANIMATED DROPPER PIPETTE === */}
            <g
              className={`transition-all duration-700 ease-out origin-top ${
                animState === "dropping" ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-8 pointer-events-none scale-95"
              }`}
            >
              {/* Dropper Rubber Bulb */}
              <path d="M 90 8 C 88 0, 112 0, 110 8 L 108 20 L 92 20 Z" fill="url(#dropperBulbGrad)" />
              {/* Dropper Collar */}
              <rect x="90" y="20" width="20" height="4" rx="1.5" fill="#d8dee9" stroke="#4c566a" strokeWidth="0.5" />
              {/* Dropper Glass Body & Tip */}
              <path d="M 94 24 L 94 48 L 98 62 L 102 62 L 106 48 L 106 24 Z" fill="rgba(240, 248, 255, 0.7)" stroke="#cbd5e1" strokeWidth="0.8" />
              {/* Liquid inside Dropper */}
              <path d="M 95 35 L 95 47 L 98 59 L 102 59 L 105 47 L 105 35 Z" fill="#93c5fd" opacity="0.85" />

              {/* Falling Droplet */}
              {animState === "dropping" && (
                <circle
                  cx="100"
                  cy="68"
                  r="3.5"
                  fill="#60a5fa"
                  className="animate-falling-drop"
                />
              )}
            </g>

            {/* === TEST TUBE BODY === */}
            {/* Tube Back Wall */}
            <path
              d="M 60 70 L 60 260 A 40 40 0 0 0 140 260 L 140 70 Z"
              fill="rgba(245, 250, 255, 0.3)"
            />

            {/* Liquid In Tube */}
            <g className="transition-all duration-700 ease-out">
              <path
                d="M 61 140 L 61 260 A 39 39 0 0 0 139 260 L 139 140 Q 100 146 61 140 Z"
                fill={currentLiquidColor}
                className="transition-colors duration-1000 ease-in-out"
              />

              {/* Liquid Meniscus Top Surface */}
              <ellipse
                cx="100"
                cy="140"
                rx="39"
                ry="6"
                fill={currentLiquidColor}
                filter="brightness(1.15)"
                className="transition-colors duration-1000 ease-in-out"
              />

              {/* Impact Surface Ripple when Droplet hits */}
              {animState === "reacting" && (
                <ellipse
                  cx="100"
                  cy="140"
                  rx="30"
                  ry="4.5"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="animate-liquid-ripple"
                />
              )}
            </g>

            {/* === PRECIPITATE PARTICLES / CLOUD === */}
            {showPrecipitate && currentPptColor && (
              <g className="transition-opacity duration-1000 ease-in-out">
                {/* Cloud Dispersion in Liquid */}
                <ellipse
                  cx="100"
                  cy="195"
                  rx="34"
                  ry="45"
                  fill={currentPptColor}
                  opacity={animState === "reacting" ? 0.75 : 0.45}
                  filter="url(#pptTurbulence)"
                  className="animate-ppt-cloud"
                />

                {/* Settled Precipitate at Bottom of Tube */}
                <path
                  d="M 64 250 A 36 36 0 0 0 136 250 Q 100 242 64 250 Z"
                  fill={currentPptColor}
                  opacity={animState === "reacted" ? 0.95 : 0.6}
                  className="transition-opacity duration-1000"
                />

                {/* Granular / Flake Particles */}
                <circle cx="85" cy="220" r="2.5" fill={currentPptColor} opacity="0.9" />
                <circle cx="112" cy="235" r="3.2" fill={currentPptColor} opacity="0.85" />
                <circle cx="96" cy="255" r="2.8" fill={currentPptColor} opacity="0.9" />
                <circle cx="78" cy="245" r="2.0" fill={currentPptColor} opacity="0.8" />
                <circle cx="120" cy="248" r="2.2" fill={currentPptColor} opacity="0.85" />
                <circle cx="104" cy="210" r="1.8" fill={currentPptColor} opacity="0.75" />
              </g>
            )}

            {/* === GAS BUBBLES ANIMATION === */}
            {visualSpec.hasGas && (animState === "reacting" || animState === "reacted") && (
              <g>
                {bubbles.map((b, idx) => (
                  <circle
                    key={idx}
                    cx={b.cx}
                    cy={250}
                    r={b.size}
                    fill="rgba(255, 255, 255, 0.75)"
                    stroke="rgba(180, 220, 255, 0.9)"
                    strokeWidth="0.8"
                    style={{
                      animation: `bubbleRise ${b.duration} infinite ease-in ${b.delay}`,
                    }}
                  />
                ))}

                {/* Fizz / Foam layer at surface */}
                <ellipse
                  cx="100"
                  cy="138"
                  rx="36"
                  ry="5"
                  fill="rgba(255, 255, 255, 0.6)"
                  className="animate-pulse"
                />
              </g>
            )}

            {/* === STEAM / HEAT VAPOR === */}
            {isHeated && (
              <g className="opacity-75">
                <path
                  d="M 90 120 Q 82 90 96 70 T 88 40"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-steam-rise opacity-70"
                />
                <path
                  d="M 110 125 Q 118 95 104 75 T 112 45"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-steam-rise opacity-60"
                  style={{ animationDelay: "0.4s" }}
                />
              </g>
            )}

            {/* === GLASS TUBE OUTLINE & REFLECTIONS === */}
            {/* Tube Lip / Rim */}
            <ellipse cx="100" cy="70" rx="42" ry="5.5" fill="none" stroke="#94a3b8" strokeWidth="2.2" />
            <ellipse cx="100" cy="70" rx="40" ry="4.5" fill="none" stroke="#cbd5e1" strokeWidth="1.2" />

            {/* Tube Main Wall Outer */}
            <path
              d="M 58 70 L 58 260 A 42 42 0 0 0 142 260 L 142 70"
              fill="url(#glassTubeGrad)"
              stroke="#64748b"
              strokeWidth="1.8"
            />

            {/* Graduation Markings on Glass */}
            <g stroke="#94a3b8" strokeWidth="1" opacity="0.6">
              <line x1="62" y1="160" x2="72" y2="160" />
              <line x1="62" y1="180" x2="68" y2="180" />
              <line x1="62" y1="200" x2="72" y2="200" />
              <line x1="62" y1="220" x2="68" y2="220" />
              <line x1="62" y1="240" x2="72" y2="240" />
            </g>

            {/* Longitudinal Glass Specular Highlights */}
            <path
              d="M 64 78 L 64 256 A 36 36 0 0 0 76 282 L 76 78 Z"
              fill="url(#glassHighlight)"
            />
            <path
              d="M 134 78 L 134 256 A 36 36 0 0 1 126 282 L 126 78 Z"
              fill="url(#glassHighlight)"
              transform="scale(-1, 1) translate(-260, 0)"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Floating Gas Test Overlay */}
        {showFlameTest && visualSpec.hasGas && (
          <div className="absolute top-2 right-2 bg-black/85 text-white p-2.5 rounded-xl text-xs max-w-[170px] shadow-xl border border-amber-400/50 animate-fade-in z-20">
            <p className="font-bold text-amber-300 flex items-center gap-1 mb-1">
              <span>🔥</span>
              <span>Uji Identifikasi Gas:</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              {visualSpec.flameTestResult || "Gas terdeteksi aktif keluar dari mulut tabung."}
            </p>
          </div>
        )}
      </div>

      {/* Interactive Workbench Action Bar */}
      <div className="w-full flex items-center justify-center gap-2 flex-wrap pt-2 border-t border-[var(--outline-variant)]/40 mt-1">
        <button
          onClick={handleRetrigger}
          disabled={animState === "dropping" || animState === "reacting"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] active:scale-95 disabled:opacity-50 transition-all shadow-xs"
          title="Ulangi tetesan reagen"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-sm">water_drop</span>
          <span>Teteskan</span>
        </button>

        <button
          onClick={handleAgitate}
          disabled={animState === "dropping"}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-highest)] hover:border-[var(--primary-container)] active:scale-95 transition-all"
          title="Kocok tabung agar homogen"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-sm">sync</span>
          <span>Kocok</span>
        </button>

        {visualSpec.canDissolveInExcess && (
          <button
            onClick={handleExcess}
            disabled={isExcess || animState !== "reacted"}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
              isExcess
                ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-400"
                : "border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:border-blue-500 hover:text-blue-700"
            }`}
            title="Tambahkan reagen berlebih (excess) untuk menguji kelarutan kompleks/amfoter"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">add_circle</span>
            <span>{isExcess ? "Excess Aktif" : "+ Reagen Berlebih"}</span>
          </button>
        )}

        {visualSpec.canDissolveInHeat && (
          <button
            onClick={handleHeat}
            disabled={isHeated || animState !== "reacted"}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
              isHeated
                ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400"
                : "border-[var(--outline-variant)] bg-[var(--surface-container-low)] hover:border-amber-500 hover:text-amber-700"
            }`}
            title="Panaskan tabung di water bath (uji kelarutan PbCl2)"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_fire_department</span>
            <span>{isHeated ? "Dipanaskan (Larut)" : "🔥 Panaskan"}</span>
          </button>
        )}

        {visualSpec.hasGas && (
          <button
            onClick={handleGasTest}
            disabled={animState !== "reacted"}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-xs"
            title="Uji nyala atau air kapur untuk gas yang dihasilkan"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">mode_heat</span>
            <span>Uji Gas (Splint)</span>
          </button>
        )}
      </div>

      {/* Dynamic Keyframes injected into this component */}
      <style jsx>{`
        @keyframes fallingDrop {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          75% {
            transform: translateY(70px);
            opacity: 1;
          }
          100% {
            transform: translateY(76px);
            opacity: 0;
          }
        }
        @keyframes liquidRipple {
          0% {
            transform: scale(0.3);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.1);
            opacity: 0;
          }
        }
        @keyframes pptCloud {
          0% {
            transform: translateY(-20px) scale(0.6);
            opacity: 0;
          }
          50% {
            transform: translateY(0px) scale(1);
            opacity: 0.85;
          }
          100% {
            transform: translateY(10px) scale(1.05);
            opacity: 0.55;
          }
        }
        @keyframes bubbleRise {
          0% {
            transform: translateY(0) scale(0.7);
            opacity: 0.2;
          }
          40% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-115px) scale(1.1);
            opacity: 0;
          }
        }
        @keyframes steamRise {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-35px) scale(1.2);
            opacity: 0;
          }
        }
        @keyframes shakeTube {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-5deg) translateX(-3px); }
          40% { transform: rotate(5deg) translateX(3px); }
          60% { transform: rotate(-3deg) translateX(-2px); }
          80% { transform: rotate(3deg) translateX(2px); }
        }
        .animate-falling-drop {
          animation: fallingDrop 0.85s cubic-bezier(0.55, 0.055, 0.675, 0.19) 1 forwards;
        }
        .animate-liquid-ripple {
          animation: liquidRipple 0.7s ease-out 1 forwards;
          transform-origin: 100px 140px;
        }
        .animate-ppt-cloud {
          animation: pptCloud 1.6s ease-out 1 forwards;
          transform-origin: 100px 195px;
        }
        .animate-steam-rise {
          animation: steamRise 1.8s ease-out infinite;
        }
        .animate-shake {
          animation: shakeTube 0.8s ease-in-out 1;
          transform-origin: 100px 70px;
        }
      `}</style>
    </div>
  );
}
