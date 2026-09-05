// CellSimulation — the M3 cell diagram as a running electrolysis animation.
//
// It exists to make three claims visible that the page previously only asserted
// in prose:
//   1. Electrons circulate anode -> DC source -> cathode (not into both terminals).
//   2. Without complexing agents, Bi3+ reaches the cathode while Sn2+ largely
//      does not, so the layer is bismuth-rich instead of an alloy.
//   3. H+ reduction at the cathode spends current without adding deposit mass,
//      which is why the efficiency calculator below reads under 100%.
//
// Animation is CSS, not SMIL: it can be paused with one class and collapsed by
// prefers-reduced-motion. Geometry follows the original 300x200 viewBox so the
// hotspot coordinates from ElectrochemicalCellExplorer still line up.
"use client";

import type { ComponentKey } from "@/lib/m3-cell-components";

export interface CellSimulationProps {
  /** Whether animations advance. */
  running: boolean;
  /** With complexing agents (EDTA + citrate) present, Sn and Bi codeposit. */
  complexed: boolean;
  selected: ComponentKey | null;
  /** Builds the shared role=button/keyboard props for a hotspot. */
  hotspot: (key: ComponentKey, label: string) => Record<string, unknown>;
}

// Vessel interior: x 70..230, y 75..145. Ions start just right of the anode.
const ION_START_X = 78;
const CATHODE_FACE_X = 230;

type Ion = { id: string; y: number; delay: number; species: "bi" | "sn" };

// Staggered so the vessel always has ions in flight without them marching in
// lockstep. Bi is the majority carrier visually because it deposits first.
const IONS: Ion[] = [
  { id: "bi-1", y: 88, delay: 0, species: "bi" },
  { id: "sn-1", y: 96, delay: 0.5, species: "sn" },
  { id: "bi-2", y: 104, delay: 1.1, species: "bi" },
  { id: "sn-2", y: 112, delay: 1.7, species: "sn" },
  { id: "bi-3", y: 120, delay: 2.3, species: "bi" },
  { id: "sn-3", y: 130, delay: 2.9, species: "sn" },
  { id: "bi-4", y: 138, delay: 3.4, species: "bi" },
];

const BUBBLES = [
  { id: "h2-1", x: 224, y: 132, r: 2.6, delay: 0.2, dur: 2.6 },
  { id: "h2-2", x: 226, y: 120, r: 2.0, delay: 1.0, dur: 3.0 },
  { id: "h2-3", x: 223, y: 108, r: 2.9, delay: 1.9, dur: 2.8 },
];

const ELECTRONS = [
  // Up the left wire from the anode.
  { id: "e-up-1", cx: 60, cy: 70, anim: "m3-e-up", dur: 1.9, delay: 0 },
  { id: "e-up-2", cx: 60, cy: 70, anim: "m3-e-up", dur: 1.9, delay: 0.95 },
  // Across the top toward the DC source, then out its negative terminal.
  { id: "e-right-1", cx: 62, cy: 25, anim: "m3-e-right", dur: 1.9, delay: 0.3 },
  { id: "e-right-2", cx: 182, cy: 25, anim: "m3-e-right", dur: 1.9, delay: 0.3 },
  { id: "e-right-3", cx: 62, cy: 25, anim: "m3-e-right", dur: 1.9, delay: 1.25 },
  { id: "e-right-4", cx: 182, cy: 25, anim: "m3-e-right", dur: 1.9, delay: 1.25 },
  // Down the right wire into the cathode.
  { id: "e-down-1", cx: 240, cy: 25, anim: "m3-e-down", dur: 1.9, delay: 0.6 },
  { id: "e-down-2", cx: 240, cy: 25, anim: "m3-e-down", dur: 1.9, delay: 1.55 },
];

export function CellSimulation({ running, complexed, selected, hotspot }: CellSimulationProps) {
  // A paused animation keeps its current frame, so the diagram never blanks out.
  // Longhand properties only: React warns when the `animation` shorthand and the
  // `animationPlayState` longhand are set together, and the shorthand would also
  // reset play-state on every rerender.
  const motion = (name: string, dur: number, delay: number) => ({
    className: "m3-sim-motion",
    style: {
      animationName: name,
      animationDuration: `${dur}s`,
      animationTimingFunction: "linear",
      animationDelay: `${delay}s`,
      animationIterationCount: "infinite" as const,
      animationFillMode: "both" as const,
      animationPlayState: running ? ("running" as const) : ("paused" as const),
    },
  });

  return (
    <svg
      viewBox="0 0 300 200"
      className={`w-full ${running ? "" : "m3-sim-paused"}`}
      aria-label="Diagram sel elektrodeposisi: sumber DC dengan terminal positif ke anoda grafit dan terminal negatif ke katoda tembaga; elektron mengalir dari anoda melalui sumber DC menuju katoda. Setiap komponen dapat dipilih untuk penjelasan."
    >
      {/* DC Source */}
      <rect
        x="120" y="10" width="60" height="30" rx="4"
        fill={selected === "dcSource" ? "var(--secondary-container)" : "var(--surface-variant)"}
        stroke="var(--outline)" strokeWidth="2"
        {...hotspot("dcSource", "Sumber DC")}
      />
      <text x="150" y="30" textAnchor="middle" fontSize="10" fill="var(--on-surface)" pointerEvents="none">DC</text>
      <text x="126" y="30" textAnchor="middle" fontSize="11" fill="var(--error)" fontWeight="bold" pointerEvents="none">+</text>
      <text x="174" y="30" textAnchor="middle" fontSize="12" fill="var(--success)" fontWeight="bold" pointerEvents="none">−</text>

      {/* Wires */}
      <line x1="120" y1="25" x2="60" y2="25" stroke="var(--outline)" strokeWidth="2" />
      <line x1="60" y1="25" x2="60" y2="70" stroke="var(--outline)" strokeWidth="2" />
      <line x1="180" y1="25" x2="240" y2="25" stroke="var(--outline)" strokeWidth="2" />
      <line x1="240" y1="25" x2="240" y2="70" stroke="var(--outline)" strokeWidth="2" />

      {/* Travelling electrons */}
      <g pointerEvents="none" data-testid="m3-electrons">
        {ELECTRONS.map((e) => (
          <circle
            key={e.id}
            data-electron={e.id}
            cx={e.cx}
            cy={e.cy}
            r="2.6"
            fill="var(--secondary)"
            {...motion(e.anim, e.dur, e.delay)}
          />
        ))}
      </g>

      {/* Electrolyte vessel outline */}
      <rect x="40" y="70" width="220" height="80" rx="4" fill="none" stroke="var(--outline)" strokeWidth="2" />
      <rect
        x="70" y="75" width="160" height="70"
        fill={selected === "electrolyte" ? "var(--primary)" : "var(--primary-fixed-dim)"}
        fillOpacity="0.35"
        {...hotspot("electrolyte", "Elektrolit, larutan A B C dengan pH sekitar 2")}
      />

      {/* Migrating metal ions. Without complexing agents Sn2+ stalls partway:
          the cathode potential that reduces Bi3+ is not negative enough for Sn. */}
      <g pointerEvents="none" data-testid="m3-ions">
        {IONS.map((ion) => {
          const isBi = ion.species === "bi";
          const arrives = isBi || complexed;
          return (
            <g
              key={ion.id}
              data-ion={ion.id}
              data-species={ion.species}
              data-arrives={arrives ? "true" : "false"}
              {...motion(arrives ? "m3-ion-arrive" : "m3-ion-stall", arrives ? 4.2 : 3.6, ion.delay)}
            >
              <circle
                cx={ION_START_X}
                cy={ion.y}
                r="4.4"
                fill={isBi ? "var(--chart-gold)" : "var(--chart-navy)"}
              />
              <text
                x={ION_START_X}
                y={ion.y + 2.2}
                textAnchor="middle"
                fontSize="4.6"
                fontWeight="bold"
                fill="var(--surface)"
              >
                {isBi ? "Bi" : "Sn"}
              </text>
            </g>
          );
        })}
      </g>

      {/* Anode (left) */}
      <rect
        x="50" y="70" width="20" height="60" rx="2"
        fill={selected === "anode" ? "var(--error)" : "var(--outline)"}
        stroke="var(--outline)" strokeWidth="2"
        {...hotspot("anode", "Anoda positif, elektroda grafit")}
      />
      <text x="60" y="145" textAnchor="middle" fontSize="9" fill="var(--error)" fontWeight="bold" pointerEvents="none">
        Anoda (+)
      </text>

      {/* Deposit layer on the cathode face — bismuth-rich when uncomplexed,
          uniform Sn-Bi alloy when the complexing agents are present. */}
      <rect
        data-testid="m3-deposit"
        data-deposit={complexed ? "alloy" : "bismuth-rich"}
        x={CATHODE_FACE_X - 5}
        y="72"
        width="5"
        height="56"
        fill={complexed ? "var(--chart-blue)" : "var(--chart-gold)"}
        pointerEvents="none"
        {...motion("m3-deposit-grow", 5, 0)}
      />

      {/* Cathode (right) */}
      <rect
        x="230" y="70" width="20" height="60" rx="2"
        fill={selected === "cathode" ? "var(--success)" : "var(--outline)"}
        stroke="var(--outline)" strokeWidth="2"
        {...hotspot("cathode", "Katoda negatif, plat tembaga tempat paduan mengendap")}
      />
      <text x="240" y="145" textAnchor="middle" fontSize="9" fill="var(--success)" fontWeight="bold" pointerEvents="none">
        Katoda (−)
      </text>

      {/* H2 bubbles at the cathode: current spent without depositing metal */}
      <g pointerEvents="none" data-testid="m3-bubbles">
        {BUBBLES.map((b) => (
          <circle
            key={b.id}
            data-bubble={b.id}
            cx={b.x}
            cy={b.y}
            r={b.r}
            fill="none"
            stroke="var(--outline)"
            strokeWidth="0.9"
            {...motion("m3-bubble-rise", b.dur, b.delay)}
          />
        ))}
      </g>

      <text x="150" y="162" textAnchor="middle" fontSize="8" fill="var(--primary)" pointerEvents="none">
        Elektrolit (pH ~2)
      </text>

      {/* Leads */}
      <text x="90" y="20" fontSize="8" fill="var(--on-surface-variant)" {...hotspot("leads", "Kabel penghubung")}>
        kabel
      </text>
      <text x="210" y="20" fontSize="8" fill="var(--on-surface-variant)" {...hotspot("leads", "Kabel penghubung")}>
        kabel
      </text>

      {/* Static direction labels remain for readers with motion disabled */}
      <text x="78" y="45" fontSize="8" fill="var(--secondary)" pointerEvents="none">e⁻ →</text>
      <text x="196" y="45" fontSize="8" fill="var(--secondary)" pointerEvents="none">e⁻ →</text>
    </svg>
  );
}
