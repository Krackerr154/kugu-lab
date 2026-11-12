/**
 * M6 TGA (thermogravimetric analysis) reference model.
 *
 * Sample: aluminium fumarate MOF (Al-Fum), the product synthesised in Module 1
 * and characterised by FTIR in the rest of this module. The FTIR half of M6
 * uses Al-Fum; TGA used to plot a generic CaCO3 decomposition, which taught the
 * technique on a sample the students never made and never saw the connection.
 *
 * Data provenance — READ BEFORE QUOTING NUMBERS.
 * The practical's raw thermograms are not in this repository. The trace below
 * is a *model* built from published Al-fumarate / MIL-53(Al)-fumarate TGA
 * behaviour, not a measurement of the students' sample:
 *
 *   - MIL-53(Al)-FA decomposes in two resolved steps: ~70 °C with ~28% loss
 *     (solvent/water evaporation) and ~430 °C with ~46% loss from fumarate
 *     framework degradation (FitzGerald et al., solvent-free fumarate MOF
 *     synthesis; citation assembled from the aggregate literature review).
 *   - Al-Fum is hydrophilic: hydrated Al-FumA loses absorbed water that
 *     dehydrated Al-FumA does not (Mani et al., aluminium dicarboxylate MOFs).
 *   - Framework collapse for Al-fumarate begins around 400 °C, and the
 *     as-synthesised material retains water that a 100 °C vacuum-dried sample
 *     does not (Al-FA_A vs Al-FA_C thermograms).
 *
 * Teaching consequence, stated on screen: step temperatures shift with
 * heating rate, purge gas and hydration state, so students must read *their*
 * curve's onset and step boundaries rather than copy these numbers.
 *
 * Unlike the old CaCO3 simulation, the DTG here is the numerical derivative of
 * the plotted TG curve, so the two curves cannot disagree with each other.
 */

export type TgaModelId = "al-fum-hydrated" | "al-fum-dried";

export interface TgaModelStep {
  id: string;
  /** Centre temperature of the step, in °C. */
  center: number;
  /** Gaussian width of the step, in °C. */
  width: number;
  /** Mass lost across this step, in mass %. */
  loss: number;
  label: string;
  short: string;
  /** What the mass loss means chemically. */
  note: string;
}

export interface TgaPoint {
  /** Temperature in °C. */
  t: number;
  /** Remaining mass, mass %. */
  mass: number;
  /** Derivative of mass with respect to temperature, mass %/°C (negative = losing). */
  dtg: number;
}

export interface TgaStepReadout {
  id: string;
  label: string;
  /** Temperature at which the step's mass loss is 5% complete (onset). */
  onset: number;
  /** Temperature of maximum loss rate, from the DTG minimum. */
  peak: number;
  /** Temperature at which the step's mass loss is 95% complete. */
  endset: number;
  lossPct: number;
}

export interface TgaModel {
  id: TgaModelId;
  label: string;
  /** Starting mass before any loss, in mass %. */
  start: number;
  steps: readonly TgaModelStep[];
  note: string;
}

export const TGA_T_MIN = 30;
export const TGA_T_MAX = 900;

/**
 * Hydrated Al-Fum, as it comes off the filter and out of the drying oven.
 * Three chemically distinct steps rather than one gaussian blob:
 *   1. physisorbed / pore water below 150 °C
 *   2. bound water + dehydroxylation of the Al-(µ-OH) bridging groups
 *   3. fumarate linker decomposition and framework collapse
 */
export const TGA_MODELS: Readonly<Record<TgaModelId, TgaModel>> = Object.freeze({
  "al-fum-hydrated": {
    id: "al-fum-hydrated",
    label: "Al-Fum terhidrasi",
    start: 100,
    note:
      "Sampel hasil sintesis yang masih membawa air pori. Tiga tahap terpisah: air fisis, dehidroksilasi, lalu dekomposisi fumarat.",
    steps: [
      {
        id: "water",
        center: 105,
        width: 26,
        loss: 14,
        label: "Air fisis & air pori",
        short: "H₂O fisis",
        note: "Air yang terperangkap di pori dan teradsorpsi di permukaan. Hilang sebelum 150 °C dan tidak merusak kerangka.",
      },
      {
        id: "hydroxyl",
        center: 320,
        width: 34,
        loss: 9,
        label: "Dehidroksilasi gugus µ-OH",
        short: "µ-OH",
        note: "Air terikat dari kondensasi gugus hidroksil jembatan Al–(µ-OH)–Al. Kerangka mulai berubah tetapi belum kolaps.",
      },
      {
        id: "fumarate",
        center: 465,
        width: 30,
        loss: 46,
        label: "Dekomposisi ligan fumarat",
        short: "fumarat",
        note: "Kerangka fumarat terurai dan kerangka MOF kolaps. Ini kehilangan massa terbesar dan penanda stabilitas termal.",
      },
    ],
  },
  "al-fum-dried": {
    id: "al-fum-dried",
    label: "Al-Fum kering (100 °C, vakum)",
    start: 100,
    note:
      "Sampel yang sudah dikeringkan 100 °C dalam vakum. Tahap air fisis hampir hilang, sehingga kurva langsung menuju dehidroksilasi.",
    steps: [
      {
        id: "water",
        center: 105,
        width: 24,
        loss: 3,
        label: "Sisa air",
        short: "H₂O sisa",
        note: "Sisa air permukaan saja. Sampel kering hampir tidak menunjukkan tahap ini.",
      },
      {
        id: "hydroxyl",
        center: 325,
        width: 34,
        loss: 9,
        label: "Dehidroksilasi gugus µ-OH",
        short: "µ-OH",
        note: "Sama seperti sampel terhidrasi: air terikat dari gugus hidroksil jembatan.",
      },
      {
        id: "fumarate",
        center: 470,
        width: 30,
        loss: 46,
        label: "Dekomposisi ligan fumarat",
        short: "fumarat",
        note: "Dekomposisi fumarat dan kolapsnya kerangka. Suhu puncak bergeser sedikit lebih tinggi karena sampel lebih kering.",
      },
    ],
  },
});

export const TGA_RESIDUE_PCT: Readonly<Record<TgaModelId, number>> = Object.freeze({
  // 100 - (14 + 9 + 46) = 31 — alumina-rich residue, not metallic Al.
  "al-fum-hydrated": 31,
  // 100 - (3 + 9 + 46) = 42
  "al-fum-dried": 42,
});

/**
 * Smooth step response: fraction of a gaussian's mass loss already released at
 * temperature `t`. The integral of a gaussian is an erf, which we approximate
 * with the Abramowitz & Stegun 7.1.26 polynomial (max abs error 1.5e-7). Using
 * the integral rather than the gaussian itself means the curve is monotonic and
 * reaches exactly `loss` at high temperature instead of asymptotically
 * approaching it — which is what stops the model from disagreeing with its own
 * stated mass balance.
 */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

/** Fraction (0..1) of a step completed at temperature t. */
function stepFraction(step: TgaModelStep, t: number): number {
  return 0.5 * (1 + erf((t - step.center) / (step.width * Math.SQRT2)));
}

export function tgaMassAt(model: TgaModel, t: number): number {
  let mass = model.start;
  for (const step of model.steps) mass -= step.loss * stepFraction(step, t);
  return mass;
}

export interface BuildTgaOptions {
  modelId?: TgaModelId;
  /** Temperature step between points, in °C. */
  step?: number;
}

/**
 * Build the TG curve and its numerical derivative.
 *
 * The DTG is computed by central difference on the same sampled curve that is
 * plotted, so the two traces are guaranteed consistent. It is reported in
 * mass %/°C, which is what a TGA instrument's DTG channel gives (some report
 * %/min; the deck says which one).
 */
export function buildTgaCurve(options: BuildTgaOptions = {}): TgaPoint[] {
  const model = TGA_MODELS[options.modelId ?? "al-fum-hydrated"];
  const step = options.step ?? 1;
  const points: TgaPoint[] = [];

  for (let t = TGA_T_MIN; t <= TGA_T_MAX; t += step) {
    points.push({ t, mass: tgaMassAt(model, t), dtg: 0 });
  }

  for (let i = 0; i < points.length; i++) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const span = next.t - prev.t;
    points[i].dtg = span > 0 ? (next.mass - prev.mass) / span : 0;
  }

  return points;
}

/** Smallest DTG value (the fastest mass-loss point) in mass %/°C. */
export function tgaMaxLossRate(points: readonly TgaPoint[]): number {
  return points.reduce((min, p) => Math.min(min, p.dtg), 0);
}

/** Largest DTG magnitude, for axis scaling. Always positive. */
export function tgaDtgDomain(points: readonly TgaPoint[]): { min: number; max: number } {
  const min = tgaMaxLossRate(points);
  return { min: min * 1.15, max: Math.abs(min) * 0.12 };
}

/**
 * Onset / peak / endset per step, read off the curve rather than restated from
 * the model constants. Onset and endset are the temperatures where 2% and 98%
 * of the step's loss have happened — the same cumulative-mass convention a
 * student can apply by hand with a ruler on their own printout.
 */
export function readTgaSteps(model: TgaModel, points: readonly TgaPoint[]): TgaStepReadout[] {
  const cumulative: number[] = [];
  let running = model.start;
  for (let i = 0; i < points.length; i++) {
    cumulative.push(running - points[i].mass);
    running = points[i].mass;
  }

  return model.steps.map((step, idx) => {
    const before = model.steps.slice(0, idx).reduce((sum, s) => sum + s.loss, 0);
    const onsetT = findTempWhereLoss(before + step.loss * 0.02, points, model);
    const endsetT = findTempWhereLoss(before + step.loss * 0.98, points, model);
    const peakT =
      points.find((p) => Math.abs(p.t - step.center) < 1)?.t ?? step.center;

    return {
      id: step.id,
      label: step.label,
      onset: Math.round(onsetT),
      peak: Math.round(peakT),
      endset: Math.round(endsetT),
      lossPct: step.loss,
    };
  });
}

function findTempWhereLoss(target: number, points: readonly TgaPoint[], model: TgaModel): number {
  for (const p of points) {
    if (model.start - p.mass >= target) return p.t;
  }
  return points[points.length - 1].t;
}

/**
 * Mass lost between two temperatures on the plotted curve. This is what the
 * annotation tool reports: the student clicks two temperatures and gets the
 * real Δm between them, instead of the `—` placeholder the old workspace
 * showed.
 */
export function massLossBetween(
  points: readonly TgaPoint[],
  tFrom: number,
  tTo: number
): { from: number; to: number; lossPct: number } {
  const at = (t: number): number => {
    const exact = points.find((p) => Math.abs(p.t - t) < 1e-9);
    if (exact) return exact.mass;
    let nearest = points[0];
    let best = Infinity;
    for (const p of points) {
      const d = Math.abs(p.t - t);
      if (d < best) {
        best = d;
        nearest = p;
      }
    }
    return nearest.mass;
  };

  const from = at(tFrom);
  const to = at(tTo);
  return { from, to, lossPct: from - to };
}

/**
 * Stoichiometric check for a hydrate: expected mass loss if `n` water molecules
 * leave a formula unit. Used by the worksheet so the theoretical side is a real
 * calculation and not a hard-coded example.
 */
export function theoreticalWaterLossPct(aluminaMass: number, nWater: number): number {
  const water = 18.015 * nWater;
  return (water / (aluminaMass + water)) * 100;
}

export const AL_FUM_AL2O3_MASS = 101.961;
