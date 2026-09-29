"use client";

import { bathAgentFrame, type BathAgent, type SceneView } from "@/lib/m3-ligands";
import type { CellFrame, ReactionFocus } from "@/lib/m3-simulation";

// Symbols distinguish the agents without inventing a molecular structure or
// specifying donor occupancy/protonation in this acidic, mixed-ligand bath.
export function LigandSymbol({ agent }: { agent: BathAgent }) {
  if (agent === "peg400") return (
    <path d="M0 -20 C-6 -17 6 -13 0 -10 S-6 -3 0 0 S6 7 0 10 S-6 17 0 20"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  );
  const points = agent === "edta" ? [[-6, -3.5], [0, -7], [6, -3.5], [6, 3.5], [0, 7], [-6, 3.5]] : [[-6, -4], [6, -4], [0, 7]];
  return (
    <g fill="var(--surface-control)" stroke="currentColor" strokeWidth="1.1">
      <path d={agent === "edta" ? "M-6 -3.5 Q0 -10 6 -3.5 M6 3.5 Q0 10 -6 3.5" : "M-6 -4 Q0 -9 6 -4 M6 -4 Q8 4 0 7"} fill="none" />
      {points.map(([x, y], index) => agent === "edta"
        ? <circle key={index} cx={x} cy={y} r="1.5" />
        : <rect key={index} x={x - 1.7} y={y - 1.7} width="3.4" height="3.4" rx="0.5" />)}
    </g>
  );
}

export function BathAgentLayer({ frame, view, activeAgent = "edta", focus = "all" }: {
  frame: CellFrame;
  view: SceneView;
  activeAgent?: BathAgent;
  focus?: ReactionFocus;
}) {
  const agents = bathAgentFrame(frame, view);
  return (
    <g aria-hidden="true" pointerEvents="none" data-testid={`m3-agents-${view}`}>
      {agents.ligands.map((ligand) => (
        <g key={ligand.id} data-ligand={ligand.id} data-agent={ligand.agent} data-phase={ligand.phase}
          data-metal={ligand.metalId} data-species={ligand.species}
          transform={`translate(${ligand.x} ${ligand.y}) scale(${ligand.scale})`}
          opacity={(activeAgent === ligand.agent ? 1 : 0.5) * (focus === "all" || focus === ligand.species ? 1 : 0.2)}
          style={{ color: "var(--chart-blue)" }}>
          <LigandSymbol agent={ligand.agent} />
        </g>
      ))}
      {agents.peg && (
        <g data-agent-layer="peg400" data-phase={agents.peg.phase}
          transform={`translate(${agents.peg.x} ${agents.peg.y}) scale(${agents.peg.scale})`}
          opacity={activeAgent === "peg400" ? 1 : 0.4} style={{ color: "var(--primary-container)" }}>
          <LigandSymbol agent="peg400" />
        </g>
      )}
    </g>
  );
}
