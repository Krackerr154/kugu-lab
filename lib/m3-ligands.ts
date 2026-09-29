// Visual annotations only: not a speciation, ligand-exchange, or adsorption
// kinetics model. Manual pp. 20–24 identifies EDTA/citrate and the PEG additive.
// Representative assignments deliberately include both metals for both ligands;
// neither ligand is assigned exclusively to one metal or given a binding constant.
import type { CellFrame } from "./m3-simulation";
import type { ComplexingAgent } from "./m3-complexing-agents";

export type BathAgent = ComplexingAgent["id"];
export type SceneView = "cell" | "closeup";
export const BATH_AGENT_LABELS = { edta: "EDTA", citrate: "Sitrat", peg400: "PEG400" } as const;

const TARGETS = [
  { index: 0, agent: "edta" },
  { index: 3, agent: "citrate" },
  { index: 12, agent: "citrate" },
  { index: 15, agent: "edta" },
] as const;

const progress = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, value: number) => {
  const eased = value * value * (3 - 2 * value);
  return from + (to - from) * eased;
};

export function bathAgentFrame(frame: CellFrame, view: SceneView) {
  const zoom = view === "closeup";
  const association = progress(frame.elapsed / 1.2);
  const ligands = frame.complexed ? TARGETS.map((target, index) => {
    const ion = frame.ions[target.index];
    const homeX = zoom ? 30 + index * 42 : 95 + index * 36;
    const homeY = zoom ? 204 : 145;
    const boundX = zoom ? Math.min(ion.zoomX, 226) : ion.x;
    const boundY = zoom ? ion.zoomY : ion.y;
    const release = progress((frame.elapsed - ion.arrival - 0.3) / 1.6);
    const phase = ion.deposited ? "released" : association < 1 ? "associating" : "bound";
    return {
      id: `${target.agent}-${target.index}`,
      agent: target.agent,
      metalId: ion.id,
      species: ion.species,
      phase,
      x: ion.deposited ? mix(boundX, homeX, release) : mix(homeX, boundX, association),
      y: ion.deposited ? mix(boundY, homeY, release) : mix(homeY, boundY, association),
      scale: zoom ? 1.7 : 1,
    };
  }) : [];

  // The chain's central attachment is beside row 3. Growth on another row
  // must not displace it; this symbol is not an envelope of the entire deposit.
  const layers = frame.deposited.filter((ion) => ion.row === 3).reduce((max, ion) => Math.max(max, ion.layer + 1), 0);
  const adsorbed = progress(frame.elapsed / 1.6);
  const surfaceX = zoom ? 240 - layers * 18 - 5 : 230 - layers * 3 - 2;
  // PEG is a recipe additive: the "tanpa pengompleks" scenario is a bare metal-salt
  // bath, so no additive (EDTA, citrate, or PEG) is drawn. It is not a complexing
  // agent, but it is removed alongside them so the comparison bath has none.
  const peg = frame.complexed ? {
    x: mix(zoom ? 135 : 190, surfaceX, adsorbed),
    y: zoom ? 119 : 108,
    scale: zoom ? 1.6 : 1,
    phase: adsorbed < 1 ? "approaching" : "adsorbed",
  } : null;
  return { ligands, peg };
}
