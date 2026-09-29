// Authored morphology sketches, NOT a deposition-rate or microstructure model.
// The same clock/number of symbolic parcels isolates a shape contrast, not equal
// experimental mass/current efficiency. Recipe and reading list: manual pp.22–25.
import type { CellFrame } from "./m3-simulation";

// [parent index, distance from Cu, surface row]; all parents precede children.
// Branch geometry is a teaching choice, not an Sn/Bi crystal structure.
const BRANCHES = [
  [-1, 0, 3], [0, 1, 3], [1, 2, 3], [2, 3, 3],
  [3, 4, 2], [4, 5, 1], [5, 6, 1], [6, 7, 0], [6, 7, 2],
  [3, 4, 4], [9, 5, 5], [10, 6, 5], [11, 7, 6], [11, 7, 4],
  [2, 2, 4], [14, 3, 5], [15, 3, 6], [8, 8, 2], [17, 9, 1],
  [13, 8, 4], [19, 9, 5], [7, 8, 0], [12, 8, 6], [18, 10, 1],
] as const;
const ROWS = [3, 2, 4, 1, 5, 0];
const fraction = (value: number) => Math.max(0, Math.min(1, value));

export function pegGrowthFrame(frame: CellFrame, peg: boolean) {
  const elapsed = frame.elapsed;
  const sites = new Map<number, { layer: number; id: number }>();
  const parcels = BRANCHES.map(([parent, depth, row], index) => {
    // Leave residual unevenness: reduced branching does not mean a perfect film.
    const site = peg ? index === BRANCHES.length - 1 ? 4 : ROWS[index % ROWS.length] : row;
    const previous = sites.get(site);
    const layer = peg ? (previous?.layer ?? -1) + 1 : depth;
    sites.set(site, { layer, id: index });
    const x = 232 - layer * 16;
    const y = 30 + site * 16;
    const arrival = 3.3 + index * 0.35;
    const travel = fraction((elapsed - arrival + 0.85) / 0.85);
    return {
      id: index, parent: peg ? previous?.id ?? -1 : parent,
      row: site, x, y, deposited: elapsed >= arrival, travel,
      incomingX: 22 + (x - 22) * travel,
      incomingY: 80 + (y - 80) * travel + Math.sin(travel * Math.PI) * 12,
    };
  });
  const deposited = parcels.filter((parcel) => parcel.deposited);
  const association = fraction(elapsed / 1.6);
  const adsorbates = peg ? [1, 3, 5].map((row) => {
    // Each chain follows its OWN surface patch, never another row's tallest tip.
    const surfaceX = deposited.filter((atom) => atom.row === row).reduce((front, atom) => Math.min(front, atom.x - 8), 240);
    return { row, surfaceX, x: 130 + (surfaceX - 5 - 130) * association,
      y: 30 + row * 16, phase: association < 1 ? "approaching" : "adsorbed" };
  }) : [];
  const phase = elapsed < 3.3 ? 0 : elapsed < 6.4 ? 1 : 2;
  return { elapsed, phase, deposited, adsorbates, incoming: parcels.filter((p) => !p.deposited && p.travel > 0) };
}

export type PegGrowthFrame = ReturnType<typeof pegGrowthFrame>;
