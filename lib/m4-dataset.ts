// Current-efficiency math for the review-session data slides (Phase 4).
//
// PURE and framework-free so it runs identically on the server (the source of
// truth: POST computes and stores) and in the browser (the asprak's live
// preview before publishing). No React, no I/O.
//
// Chemistry (mirrors the module page and penuntun, do NOT invent values):
//   Q           = I × t                      charge, coulomb
//   mol e⁻       = Q / F                      F = 96485 C/mol
//   m_teoretis   = (mol e⁻ / n) × M           n = valence, M = molar mass g/mol
//   m_aktual     = m₂ − m₁                    after − before, gram
//   η            = (m_aktual / m_teoretis) × 100%
//
// The deposit is a Sn–Bi ALLOY and the penuntun fixes no Sn:Bi ratio, so n and M
// are an ASSUMPTION the asprak must confirm — never hard-coded silently. The
// Sn²⁺ pair (n = 2, M = 118.71) is only the worked-example default, surfaced in
// the UI as "needs confirmation", exactly as the module page frames it.

export const FARADAY = 96485; // C/mol

/** Worked-example assumption from the module page. Must be confirmed, not assumed. */
export const SN2_VALENCE = 2;
export const SN_MOLAR_MASS = 118.71; // g/mol, tin

export interface GroupInput {
  label: string;
  /** I — current, amperes. */
  current: number;
  /** t — electrolysis time, seconds. */
  timeSeconds: number;
  /** m₁ — cathode mass before, grams. */
  massBefore: number;
  /** m₂ — cathode mass after, grams. */
  massAfter: number;
}

export interface DataSetInput {
  /** n — electrons per ion (assumption, confirm with instructor). */
  valence: number;
  /** M — molar mass, g/mol (assumption, confirm with instructor). */
  molarMass: number;
  groups: GroupInput[];
}

export interface GroupResult {
  label: string;
  current: number;
  timeSeconds: number;
  massBefore: number;
  massAfter: number;
  /** Q = I × t, coulomb. */
  charge: number;
  /** m₂ − m₁, grams. */
  massActual: number;
  /** (Q / F / n) × M, grams. */
  massTheoretical: number;
  /** η, percent. */
  efficiency: number;
  /** η > 100 — a diagnostic, not success (rinse/dry/weighing/assumption error). */
  overHundred: boolean;
  /** η < 0 — mass loss; a measurement to flag, never silently plotted as 0. */
  negative: boolean;
}

export interface DataSetResult {
  valence: number;
  molarMass: number;
  assumptionConfirmed: boolean;
  groups: GroupResult[];
}

// Bounds are generous around the protocol working point (~0.058 A, 900 s) but
// reject nonsense that would make the teaching chart meaningless.
const BOUNDS = {
  current: { min: 0, max: 100 },         // A (exclusive min)
  timeSeconds: { min: 0, max: 86_400 },  // s (<= 24 h)
  mass: { min: 0, max: 1000 },           // g
  valence: { min: 1, max: 7 },           // integer
  molarMass: { min: 0, max: 1000 },      // g/mol (exclusive min)
  groups: { min: 1, max: 6 },
  labelLen: 40,
} as const;

const finite = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

/** Validate raw input. Returns null when valid, else a short machine code. */
export function validateDataSet(input: unknown): string | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return "invalid-body";
  const o = input as Record<string, unknown>;
  if (!finite(o.valence) || !Number.isInteger(o.valence) || o.valence < BOUNDS.valence.min || o.valence > BOUNDS.valence.max) return "invalid-valence";
  if (!finite(o.molarMass) || o.molarMass <= BOUNDS.molarMass.min || o.molarMass > BOUNDS.molarMass.max) return "invalid-molar-mass";
  if (!Array.isArray(o.groups) || o.groups.length < BOUNDS.groups.min || o.groups.length > BOUNDS.groups.max) return "invalid-group-count";
  for (const g of o.groups as unknown[]) {
    if (typeof g !== "object" || g === null) return "invalid-group";
    const gr = g as Record<string, unknown>;
    if (typeof gr.label !== "string" || gr.label.trim().length === 0 || gr.label.length > BOUNDS.labelLen) return "invalid-label";
    if (!finite(gr.current) || gr.current <= BOUNDS.current.min || gr.current > BOUNDS.current.max) return "invalid-current";
    if (!finite(gr.timeSeconds) || gr.timeSeconds <= BOUNDS.timeSeconds.min || gr.timeSeconds > BOUNDS.timeSeconds.max) return "invalid-time";
    if (!finite(gr.massBefore) || gr.massBefore < BOUNDS.mass.min || gr.massBefore > BOUNDS.mass.max) return "invalid-mass-before";
    if (!finite(gr.massAfter) || gr.massAfter < BOUNDS.mass.min || gr.massAfter > BOUNDS.mass.max) return "invalid-mass-after";
  }
  return null;
}

function computeGroup(g: GroupInput, valence: number, molarMass: number): GroupResult {
  const charge = g.current * g.timeSeconds;
  const molElectrons = charge / FARADAY;
  const massTheoretical = (molElectrons / valence) * molarMass;
  const massActual = g.massAfter - g.massBefore;
  const efficiency = massTheoretical > 0 ? (massActual / massTheoretical) * 100 : 0;
  return {
    label: g.label.trim(),
    current: g.current,
    timeSeconds: g.timeSeconds,
    massBefore: g.massBefore,
    massAfter: g.massAfter,
    charge,
    massActual,
    massTheoretical,
    efficiency,
    overHundred: efficiency > 100,
    negative: efficiency < 0,
  };
}

/**
 * Compute every group's efficiency. Assumes `input` already passed
 * validateDataSet (the API calls that first). `assumptionConfirmed` records
 * that the asprak ticked the "I confirm n and M" box — stored for honesty, not
 * used to gate the math.
 */
export function computeDataSet(input: DataSetInput, assumptionConfirmed = false): DataSetResult {
  return {
    valence: input.valence,
    molarMass: input.molarMass,
    assumptionConfirmed,
    groups: input.groups.map((g) => computeGroup(g, input.valence, input.molarMass)),
  };
}
