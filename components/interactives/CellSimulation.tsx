// A deterministic, seekable SVG scene. All moving parts use the same frame;
// deposited particles persist until the learner rewinds or changes scenario.
"use client";

import { useId } from "react";
import type { ComponentKey } from "@/lib/m3-cell-components";
import { cycle, type CellFrame, type ReactionFocus } from "@/lib/m3-simulation";
import { BathAgentLayer } from "@/components/interactives/BathAgentLayer";
import { BATH_AGENT_LABELS, type BathAgent } from "@/lib/m3-ligands";

interface CellSimulationProps {
  frame: CellFrame;
  running: boolean;
  focus: ReactionFocus;
  selected: ComponentKey | null;
  hotspot: (key: ComponentKey, label: string) => Record<string, unknown>;
  activeAgent: BathAgent;
  onAgentSelect: (agent: BathAgent) => void;
  className?: string;
}

const metalTone = (species: "bi" | "sn") => species === "bi" ? "var(--chart-gold)" : "var(--chart-navy)";
const emphasis = (focus: ReactionFocus, species: ReactionFocus) => focus === "all" || focus === species ? 1 : 0.2;
const ELECTRONS = [
  { id: "e-up-1", segment: "up", offset: 0 },
  { id: "e-up-2", segment: "up", offset: 0.5 },
  { id: "e-right-1", segment: "left-top", offset: 0.15 },
  { id: "e-right-2", segment: "right-top", offset: 0.15 },
  { id: "e-right-3", segment: "left-top", offset: 0.65 },
  { id: "e-right-4", segment: "right-top", offset: 0.65 },
  { id: "e-down-1", segment: "down", offset: 0.3 },
  { id: "e-down-2", segment: "down", offset: 0.8 },
];

export function CellSimulation({ frame, running, focus, selected, hotspot, activeAgent, onAgentSelect, className }: CellSimulationProps) {
  const clipId = useId();
  return (
    <svg
      viewBox="0 0 300 225"
      className={className ?? `w-full ${running ? "" : "m3-sim-paused"}`}
      data-testid="m3-cell-scene"
      aria-label="Diagram sel elektrodeposisi: sumber DC dengan terminal positif ke elektroda karbon dan terminal negatif ke katoda tembaga; elektron mengalir dari anoda melalui sumber DC menuju katoda. Setiap komponen dapat dipilih untuk penjelasan."
    >
      <defs><clipPath id={clipId}><rect x="71" y="75" width="158" height="69" /></clipPath></defs>
      <rect x="120" y="10" width="60" height="30" rx="4"
        fill={selected === "dcSource" ? "var(--secondary-container)" : "var(--surface-variant)"}
        stroke="var(--outline)" strokeWidth="1.5" {...hotspot("dcSource", "Sumber DC")} />
      <text x="150" y="30" textAnchor="middle" fontSize="10" fill="var(--on-surface)" pointerEvents="none">DC</text>
      <text x="126" y="30" textAnchor="middle" fontSize="11" fill="var(--primary)" fontWeight="bold" pointerEvents="none">+</text>
      <text x="174" y="30" textAnchor="middle" fontSize="12" fill="var(--primary)" fontWeight="bold" pointerEvents="none">−</text>
      <path d="M120 25 H60 V70 M180 25 H240 V70" fill="none" stroke="var(--outline)" strokeWidth="2" />
      <g pointerEvents="none" data-testid="m3-electrons">
        {ELECTRONS.map((electron) => {
          const f = cycle(frame.elapsed, 1.9, electron.offset);
          const x = electron.segment === "up" ? 60 : electron.segment === "down" ? 240 : (electron.segment === "left-top" ? 64 : 184) + f * 52;
          const y = electron.segment === "up" ? 70 - f * 45 : electron.segment === "down" ? 25 + f * 45 : 25;
          return <circle key={electron.id} data-electron={electron.id} data-direction={electron.segment} cx={x} cy={y} r="2.5" fill="var(--secondary)" />;
        })}
      </g>
      <rect x="40" y="70" width="220" height="108" rx="5" fill="var(--surface-control)" stroke="var(--outline)" strokeWidth="1.5" />
      <rect x="45" y="72" width="210" height="101"
        fill={selected === "electrolyte" ? "var(--primary-fixed)" : "var(--surface-container)"}
        {...hotspot("electrolyte", "Elektrolit, larutan A B C dengan pH sekitar 2")} />
      <g clipPath={`url(#${clipId})`} pointerEvents="none" data-testid="m3-ions">
        {frame.ions.map((ion) => (
          <g key={ion.id} data-ion={ion.id} data-species={ion.species} data-state={ion.state}
            data-can-reduce={String(ion.canReduce)} data-transport={ion.travel.toFixed(3)}
            transform={`translate(${ion.x} ${ion.y})`} opacity={ion.deposited ? 0 : emphasis(focus, ion.species)}>
            {ion.species === "bi"
              ? <circle r="4.2" fill={metalTone(ion.species)} />
              : <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill={metalTone(ion.species)} />}
            <text y="1.7" textAnchor="middle" fontSize="4.6" fontWeight="bold" fill="var(--on-primary)">{ion.species === "bi" ? "Bi" : "Sn"}</text>
          </g>
        ))}
      </g>
      <BathAgentLayer frame={frame} view="cell" focus={focus} activeAgent={activeAgent} />
      <rect x="50" y="70" width="20" height="60" rx="2"
        fill={selected === "anode" ? "var(--secondary-container)" : "var(--outline)"}
        stroke="var(--primary-container)" strokeWidth="1.5" {...hotspot("anode", "Anoda positif, elektroda karbon")} />
      <text x="60" y="194" textAnchor="middle" fontSize="9" fill="var(--primary)" fontWeight="bold" pointerEvents="none">Anoda (+)</text>
      <rect x="230" y="70" width="20" height="60" rx="2"
        fill={selected === "cathode" ? "var(--secondary-container)" : "var(--surface-variant)"}
        stroke="var(--primary-container)" strokeWidth="1.5" {...hotspot("cathode", "Katoda negatif, plat tembaga tempat paduan mengendap")} />
      <g data-testid="m3-deposit" data-deposit={frame.outcome} data-count={frame.deposited.length} pointerEvents="none">
        {frame.deposited.map((atom) => <rect key={atom.id} data-species={atom.species} opacity={emphasis(focus, atom.species)} x={227 - atom.layer * 3} y={78 + atom.row * 8} width="3" height="7" fill={metalTone(atom.species)} />)}
      </g>
      <text x="240" y="194" textAnchor="middle" fontSize="9" fill="var(--primary)" fontWeight="bold" pointerEvents="none">Katoda (−)</text>
      <g pointerEvents="none" data-testid="m3-bubbles" opacity={emphasis(focus, "h2")}>
        {[0, 1, 2].map((index) => {
          const f = cycle(Math.max(0, frame.elapsed - 3), 2.8, index / 3);
          return <circle key={index} data-bubble={`h2-${index + 1}`} cx={218 - index * 3} cy={129 - f * 53}
            r={1.8 + f * 1.5} fill="var(--surface-control)" stroke="var(--outline)" strokeWidth="0.9"
            opacity={frame.elapsed <= 3 ? 0 : 1 - f * 0.7} />;
        })}
      </g>
      {(["edta", "citrate", "peg400"] as const).map((agent, index) => (
        <g key={agent} data-agent-hotspot={agent} role="button" tabIndex={0}
          aria-label={`Detail ${BATH_AGENT_LABELS[agent]} di beaker`} aria-pressed={activeAgent === agent}
          transform={`translate(${74 + index * 54} 155)`}
          onClick={() => onAgentSelect(agent)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onAgentSelect(agent); }
          }}
          className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-container)]">
          <rect width="50" height="16" rx="3" fill={activeAgent === agent ? "var(--surface-selected)" : "var(--surface-control)"}
            stroke={activeAgent === agent ? "var(--primary-container)" : "var(--outline-variant)"} />
          <text x="25" y="11" textAnchor="middle" fontSize="8" fill="var(--primary-container)" pointerEvents="none">{BATH_AGENT_LABELS[agent]}</text>
        </g>
      ))}
      <text x="150" y="215" textAnchor="middle" fontSize="10" fill="var(--on-surface-variant)" pointerEvents="none">Elektrolit (pH ~2)</text>
      <text x="90" y="20" fontSize="8" fill="var(--on-surface-variant)" {...hotspot("leads", "Kabel penghubung")}>kabel</text>
      <text x="210" y="20" fontSize="8" fill="var(--on-surface-variant)" {...hotspot("leads", "Kabel penghubung")}>kabel</text>
      <text x="78" y="45" fontSize="8" fill="var(--secondary)" pointerEvents="none">e⁻ →</text>
      <text x="196" y="45" fontSize="8" fill="var(--secondary)" pointerEvents="none">e⁻ →</text>
    </svg>
  );
}

export function CathodeCloseUp({ frame, focus, activeAgent, className = "w-full" }: { frame: CellFrame; focus: ReactionFocus; activeAgent: BathAgent; className?: string }) {
  return (
    <svg viewBox="0 0 300 240" className={className} role="img" aria-label="Pembesaran katoda: spesi logam mendekati permukaan, menerima elektron, lalu tertinggal sebagai partikel logam. Skema bukan kisi kristal.">
      <rect x="10" y="30" width="230" height="190" rx="4" fill="var(--surface-container)" />
      <rect x="240" y="30" width="48" height="190" fill="var(--surface-variant)" stroke="var(--outline)" />
      <text x="25" y="20" fontSize="11" fill="var(--on-surface-variant)">Larutan</text>
      <text x="264" y="110" textAnchor="middle" fontSize="18" fontWeight="bold" fill="var(--primary-container)">Cu</text>
      <text x="264" y="128" textAnchor="middle" fontSize="8" fill="var(--on-surface-variant)">substrat</text>
      {frame.ions.filter((ion) => !ion.deposited).map((ion) => {
        const x = ion.zoomX;
        const y = ion.zoomY;
        return (
          <g key={ion.id} opacity={emphasis(focus, ion.species)} data-zoom-ion={ion.id} data-state={ion.state}>
            <circle cx={x} cy={y} r="10" fill="var(--surface-control)" stroke={metalTone(ion.species)} strokeWidth="1.5" strokeDasharray="2 2" />
            <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill={metalTone(ion.species)}>{ion.species === "bi" ? "Bi" : "Sn"}</text>
            {ion.reducing && Array.from({ length: ion.species === "bi" ? 3 : 2 }, (_, i) => (
              <circle key={i} data-transfer-electron cx={x + 12 + i * 6} cy={y - 10} r="2" fill="var(--secondary)" />
            ))}
          </g>
        );
      })}
      <g data-testid="m3-cathode-particles">
        {frame.deposited.map((atom) => {
          const x = 231 - atom.layer * 18;
          const y = 48 + atom.row * 24;
          return (
            <g key={atom.id} data-deposited-atom={atom.id} data-species={atom.species} opacity={emphasis(focus, atom.species)}>
              {atom.species === "bi" ? <circle cx={x} cy={y} r="9" fill={metalTone(atom.species)} /> : <rect x={x - 9} y={y - 9} width="18" height="18" rx="3" fill={metalTone(atom.species)} />}
              <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--on-primary)">{atom.species === "bi" ? "Bi" : "Sn"}</text>
            </g>
          );
        })}
      </g>
      <BathAgentLayer frame={frame} view="closeup" focus={focus} activeAgent={activeAgent} />
      <g opacity={emphasis(focus, "h2")}>
        {[0, 1].map((i) => {
          const f = cycle(Math.max(0, frame.elapsed - 3), 3.1, i / 2);
          return <g key={i} opacity={frame.elapsed <= 3 ? 0 : 1 - f * 0.65}>
            <circle cx={185 - i * 12} cy={165 - f * 120} r={5 + f * 4} fill="var(--surface-control)" stroke="var(--outline)" />
            <text x={185 - i * 12} y={167 - f * 120} textAnchor="middle" fontSize="6" fill="var(--on-surface-variant)">H<tspan baselineShift="sub" fontSize="4">2</tspan></text>
          </g>;
        })}
      </g>
    </svg>
  );
}
