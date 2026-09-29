// Qualitative teaching model, NOT a kinetic, composition, or yield model.
// Manual: Modul Praktikum KUGU 2025, pp. 20–24: reduction at the cathode,
// Bi preferential deposition, EDTA/citrate-assisted codeposition, Cu substrate.
// Timing, particle counts, positions, and spacing below are authored illustration
// parameters. They are not experimental data or a crystal-lattice prediction.
export const ILLUSTRATION_SECONDS = 12;
export const CHECKPOINTS = [0, 3, 6, 9, ILLUSTRATION_SECONDS] as const;
export type MetalSpecies = "bi" | "sn";
export type ReactionFocus = "all" | MetalSpecies | "h2";

export const METAL_EVENTS = Array.from({ length: 18 }, (_, index) => ({
  id: `metal-${index}`,
  species: ((index + Math.floor(index / 6)) % 2 === 0 ? "bi" : "sn") as MetalSpecies,
  row: index % 6,
  layer: Math.floor(index / 6),
  startX: 90 + (index % 6) * 21,
  startY: 84 + Math.floor(index / 6) * 18 + (index % 2) * 3,
  arrival: 3 + index * 0.46,
}));

export const clampTime = (time: number) =>
  Number.isFinite(time) ? Math.max(0, Math.min(ILLUSTRATION_SECONDS, time)) : 0;

export function cellFrame(time: number, complexed: boolean) {
  const elapsed = clampTime(time);
  const layersByRow = new Map<number, number>();
  const ions = METAL_EVENTS.map((event) => {
    const travel = Math.max(0, Math.min(1, (elapsed - event.arrival + 2.8) / 2.8));
    // Transport and reduction are different. Uncomplexed Sn can approach the
    // surface; in this selected illustrative potential window it is NOT reduced.
    const canReduce = event.species === "bi" || complexed;
    const layer = layersByRow.get(event.row) ?? 0;
    // A non-depositing species does not reserve an empty layer under later metal.
    if (canReduce) layersByRow.set(event.row, layer + 1);
    const deposited = canReduce && elapsed >= event.arrival + 0.3;
    const reducing = canReduce && elapsed >= event.arrival && !deposited;
    return {
      ...event,
      originLayer: event.layer,
      layer,
      travel,
      canReduce,
      deposited,
      reducing,
      x: event.startX + (221 - event.startX) * travel,
      y: event.startY + (82 + event.row * 8 - event.startY) * travel + Math.sin(travel * Math.PI) * 3,
      zoomX: 28 + event.layer * 42 + ((canReduce ? 231 - layer * 18 : 161) - 28 - event.layer * 42) * travel,
      zoomY: 48 + event.row * 24,
      state: deposited ? "deposited" : reducing ? "reducing" : travel === 1 ? "unreduced" : "solution",
    };
  });
  const deposited = ions.filter((ion) => ion.deposited);
  const phase = elapsed === 0 ? "Siap diamati" : elapsed < 3 ? "Transpor spesi logam" : elapsed < 6 ? "Reduksi di permukaan" : elapsed < ILLUSTRATION_SECONDS ? "Pertumbuhan lapisan" : "Ilustrasi selesai";
  const outcome = deposited.length === 0 ? "none" : deposited.some((ion) => ion.species === "sn") ? "alloy" : "bismuth-rich";
  return { elapsed, complexed, ions, deposited, phase, outcome };
}

export type CellFrame = ReturnType<typeof cellFrame>;

export function cycle(time: number, period: number, offset = 0) {
  return ((Math.max(0, time) / period + offset) % 1 + 1) % 1;
}
