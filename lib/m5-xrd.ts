/**
 * M5 XRD reference model.
 *
 * Source of truth: "Pengarahan Modul 5 — Pengolahan dan Analisis Data XRD dengan
 * OriginPro" (Praktikum KI3131 Kimia Unsur Golongan Utama, Semester 1
 * 2026/2027).
 *
 * The practical's data are Excel files given to students
 * (XRD_Al-Fum_12/13/14.xlsx, XRD_Std_Al-Fum_CCDC1051975.xlsx) that are not
 * part of this repository. The patterns rendered here are synthesised from the
 * guide's own tables — the standard reflection list (hkl, 2θ, relative
 * intensity) and the expected sample results (peak shifts, FWHM 011,
 * Scherrer D 011, relative crystallinity) — and the workspace says so on
 * screen rather than implying a measured sample.
 */

/**
 * Scherrer / Bragg constants from the guide (slide 8 and 28).
 * K = 0,9; λ(Cu Kα1) = 0,154059 nm for Scherrer, 1,54059 Å for d-spacing.
 */
export const XRD_CONSTANTS = {
  /** Shape factor K (bulat, seragam). */
  K: 0.9,
  /** Cu Kα1 wavelength in nm — Scherrer equation. */
  lambdaNm: 0.154059,
  /** Cu Kα1 wavelength in Å — d-spacing. */
  lambdaA: 1.54059,
  /** Match tolerance for phase comparison, from the guide (±0,5°). */
  matchToleranceDeg: 0.5,
} as const;

export type AlFumSampleId = "1:2" | "1:3" | "1:4";

export interface AlFumReflection {
  /** Miller indices as printed in the guide's expected-results table. */
  hkl: string;
  /** 2θ of the standard reflection, degrees. */
  twoThetaStd: number;
  /** Relative intensity (simulated; anchors the drawn pattern). */
  relIntensity: number;
}

/**
 * Standard Al-Fum reflections (CCDC 1051975) — the guide's expected-results
 * table, slide 31. The six indexed reflections are the ones students are
 * expected to match and index.
 */
export const ALFUM_STANDARD_REFLECTIONS: readonly AlFumReflection[] = [
  { hkl: "011", twoThetaStd: 10.39, relIntensity: 100 },
  { hkl: "020 / 002 / -102", twoThetaStd: 14.65, relIntensity: 55 },
  { hkl: "022", twoThetaStd: 20.87, relIntensity: 40 },
  { hkl: "033", twoThetaStd: 31.52, relIntensity: 30 },
  { hkl: "044", twoThetaStd: 42.47, relIntensity: 22 },
  { hkl: "055", twoThetaStd: 53.84, relIntensity: 16 },
];

export interface AlFumSample {
  id: AlFumSampleId;
  /** Position shift per reflection relative to the standard, degrees. */
  shift: readonly number[];
  /** FWHM of the 011 reflection in degrees (guide slide 32). */
  fwhm011Deg: number;
  /** Relative crystallinity vs 1:2, % (guide slide 32). */
  crystallinityRelPct: number;
}

/**
 * The three sample ratios. Peak shifts are the guide's "Hasil yang
 * Diharapkan: Posisi Puncak" table (slide 31) — sample peaks sit slightly
 * below the standard (holder height offset), well inside the ±0,5° tolerance.
 * The array order must match ALFUM_STANDARD_REFLECTIONS.
 */
export const ALFUM_SAMPLES: readonly AlFumSample[] = [
  {
    id: "1:2",
    shift: [-0.08, -0.04, -0.1, -0.1, -0.12, -0.11],
    fwhm011Deg: 0.327,
    crystallinityRelPct: 100,
  },
  {
    id: "1:3",
    shift: [-0.05, -0.01, -0.07, -0.08, -0.1, -0.09],
    fwhm011Deg: 0.373,
    crystallinityRelPct: 93.7,
  },
  {
    id: "1:4",
    shift: [-0.11, -0.02, -0.12, -0.15, -0.19, -0.15],
    fwhm011Deg: 0.358,
    crystallinityRelPct: 43.5,
  },
];

/**
 * Guide's expected D(011) values (nm) — used as the self-check target and as
 * a test anchor. Computed from Scherrer with K = 0,9, λ = 0,154059 nm,
 * β = FWHM 011 in radians, θ = 2θ(011)/2.
 */
export const GUIDE_SCHERRER_D011_NM: Record<AlFumSampleId, number> = {
  "1:2": 24.4,
  "1:3": 21.4,
  "1:4": 22.3,
};

export interface DiffractogramPoint {
  x: number;
  y: number;
}

/** 2θ scan range from the guide (slide 10). */
export const XRD_SCAN = { min: 5, max: 80, step: 0.05 } as const;

/** Number of points in a full scan: (80−5)/0,05 + 1 = 1501. */
export const XRD_SCAN_POINTS =
  Math.round((XRD_SCAN.max - XRD_SCAN.min) / XRD_SCAN.step) + 1;

/**
 * Deterministic PRNG (mulberry32) so the synthesised noise is identical on
 * every render — the old workspace regenerated noise inside the render body,
 * reshuffling the pattern on every re-render.
 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussianArea(intensity: number, sigma: number): number {
  // ∫ intensity·exp(−x²/2σ²) dx = intensity·σ·√(2π)
  return intensity * sigma * Math.sqrt(2 * Math.PI);
}

/**
 * Crystalline fraction (kristalinitas) of a synthesised sample pattern, as
 * defined by the guide: area under the crystalline peaks over total area under
 * the curve, baseline y = 0. The halo (amorphous hump) amplitude is chosen so
 * the synthetic pattern reproduces the guide's relative crystallinity values
 * for the 1:2 / 1:3 / 1:4 samples.
 */
function haloAmplitudeFor(
  sample: AlFumSample,
  reflections: readonly AlFumReflection[],
  sigmaDeg: number
): number {
  let crystallineArea = 0;
  for (let i = 0; i < reflections.length; i++) {
    crystallineArea += gaussianArea(reflections[i].relIntensity, sigmaDeg);
  }
  const fr = sample.crystallinityRelPct / 100;
  // haloArea / crystallineArea = (1 − fr) / fr
  return (crystallineArea * (1 - fr)) / fr / gaussianArea(1, 14);
}

/**
 * Synthesise a deterministic diffractogram for a sample or the standard.
 *
 * - Standard: a clean pattern of the six indexed reflections (Kα1 only).
 * - Samples: the same reflections shifted per the guide's table, broadened by
 *   the sample's FWHM (011 value applied to all reflections), sitting on an
 *   amorphous halo whose area matches the guide's relative crystallinity, with
 *   a small fixed noise floor.
 *
 * The FWHM of a Gaussian peak at 2θ position p is 2σ√(2 ln 2) in the same
 * units as σ, so a target FWHM in degrees maps to σ = FWHM / (2√(2 ln 2)).
 */
export function diffractogram(
  target: AlFumSampleId | "standard",
  seed = 20261105
): DiffractogramPoint[] {
  const reflections = ALFUM_STANDARD_REFLECTIONS;
  const sample = target === "standard" ? null : ALFUM_SAMPLES.find((s) => s.id === target)!;

  const fwhmDeg = sample ? sample.fwhm011Deg : 0.15;
  const sigmaDeg = fwhmDeg / (2 * Math.sqrt(2 * Math.log(2)));
  const haloSigmaDeg = 14;
  const haloCenter = 22;
  const haloAmp = sample
    ? haloAmplitudeFor(sample, reflections, sigmaDeg)
    : 0;

  const rnd = seededRandom(seed);
  const points: DiffractogramPoint[] = [];
  for (let x = XRD_SCAN.min; x <= XRD_SCAN.max + 1e-9; x += XRD_SCAN.step) {
    let y = 2 + rnd() * 3; // baseline noise
    if (sample) {
      y += haloAmp * Math.exp(-((x - haloCenter) ** 2) / (2 * haloSigmaDeg ** 2));
    }
    for (let i = 0; i < reflections.length; i++) {
      const center = sample ? reflections[i].twoThetaStd + sample.shift[i] : reflections[i].twoThetaStd;
      y += reflections[i].relIntensity * Math.exp(-((x - center) ** 2) / (2 * sigmaDeg ** 2));
    }
    points.push({ x: Math.round(x * 100) / 100, y });
  }
  return points;
}

export interface DisorderPattern {
  points: DiffractogramPoint[];
  /** FWHM (degrees) used for every reflection. */
  fwhmDeg: number;
  /** Crystalline fraction in percent, as defined by the guide. */
  crystallinityPct: number;
}

/**
 * Pattern for the kristalin ↔ semikristalin ↔ amorf continuum.
 *
 * `disorder` in [0, 1]: 0 = perfect crystal (sharp peaks, no halo), 1 = fully
 * amorphous (residual broad bumps on a dominant halo). Peak broadening grows
 * with disorder; peak amplitudes fall; the halo area grows to conserve the
 * guide's area definition (crystalline area / total area).
 */
export function disorderPattern(disorder: number, seed = 20261105): DisorderPattern {
  const d = Math.min(1, Math.max(0, disorder));
  const fwhmDeg = 0.15 + 3.3 * d;
  const crystallinityPct = (1 - d) * 100;
  const sigmaDeg = fwhmDeg / (2 * Math.sqrt(2 * Math.log(2)));
  const reflections = ALFUM_STANDARD_REFLECTIONS;

  // Gundukan amorf (halo): murni amorf menghasilkan gundukan lebar yang rendah
  // (~22 a.u., atau ~20-25% dari puncak tajam kristalin), bukan menjulang tinggi.
  const haloAmp = 22 * d;
  // Puncak kristalin meluruh dan melebar seiring bertambahnya disorder
  const ampFactor = Math.pow(1 - d, 1.4);

  const rnd = seededRandom(seed);
  const points: DiffractogramPoint[] = [];
  for (let x = XRD_SCAN.min; x <= XRD_SCAN.max + 1e-9; x += XRD_SCAN.step) {
    let y = 2 + rnd() * 3;
    y += haloAmp * Math.exp(-((x - 22) ** 2) / (2 * 14 ** 2));
    for (const r of reflections) {
      y += r.relIntensity * ampFactor * Math.exp(-((x - r.twoThetaStd) ** 2) / (2 * sigmaDeg ** 2));
    }
    points.push({ x: Math.round(x * 100) / 100, y });
  }
  return { points, fwhmDeg, crystallinityPct };
}

/** Guide's own wording for the continuum (slide 5). */
export const ORDER_STAGES = [
  { maxDisorder: 0.25, label: "Kristalin — puncak tajam" },
  { maxDisorder: 0.7, label: "Semikristalin — puncak tajam di atas gundukan lebar" },
  { maxDisorder: 1.01, label: "Amorf — hanya gundukan lebar" },
] as const;

export function orderStageLabel(disorder: number): string {
  for (const s of ORDER_STAGES) {
    if (disorder <= s.maxDisorder) return s.label;
  }
  return ORDER_STAGES[ORDER_STAGES.length - 1].label;
}

/** d-spacing in Å from 2θ (degrees) with a given wavelength in Å. */
export function dSpacing(twoThetaDeg: number, lambdaA = XRD_CONSTANTS.lambdaA): number {
  const thetaRad = ((twoThetaDeg / 2) * Math.PI) / 180;
  return lambdaA / (2 * Math.sin(thetaRad));
}

/**
 * Scherrer crystallite size in nm.
 * D = Kλ / (β cos θ); β must be in radians, θ = 2θ/2.
 */
export function scherrerD(
  twoThetaDeg: number,
  fwhmDeg: number,
  k: number = XRD_CONSTANTS.K,
  lambdaNm: number = XRD_CONSTANTS.lambdaNm
): number {
  const thetaRad = ((twoThetaDeg / 2) * Math.PI) / 180;
  const betaRad = (fwhmDeg * Math.PI) / 180;
  return (k * lambdaNm) / (betaRad * Math.cos(thetaRad));
}

export interface PeakAnnotation {
  /** 2θ of the clicked peak (sample pattern), degrees. */
  twoTheta: number;
  /** Assigned hkl from the standard list. */
  hkl: string;
  /** d-spacing in Å at this position. */
  d: number;
  /** True if within the guide's ±0,5° match tolerance of its standard. */
  matched: boolean;
  /** Distance to the assigned standard reflection, degrees. */
  deltaDeg: number;
}

/* ── Peak-shape model used by the anatomy figure ───────────────────────── */

/**
 * Amplitude factor applied to every reflection in the anatomy figure.
 * Kept here (not in the component) so the drawn curve and the FWHM/area
 * read-offs are computed by one source.
 */
export const ANATOMY_AMPLITUDE = 0.85;
/** Noise-free background level of the anatomy curve. */
export const ANATOMY_BASE = 3;
/** Gaussian width of every reflection, degrees. */
export const ANATOMY_FWHM_DEG = 0.55;
/** Amorphous halo used as the local background in the anatomy figure. */
/**
 * Amorphous halo used as the local background in the anatomy figure.
 *
 * The amplitude is chosen so the shaded mound is legible at the plotting scale:
 * at amplitude 18 the silhouette rose only ~19% of the plot height and read as
 * a wedge rather than a hump. 26 puts the crest near a third of the height,
 * which is still a soft diffuse background (the tallest Bragg peak is ~99 a.u.)
 * but unmistakably a mound.
 */
export const ANATOMY_HALO = { amplitude: 26, center: 22, sigma: 12 } as const;

function anatomySigma(): number {
  return ANATOMY_FWHM_DEG / (2 * Math.sqrt(2 * Math.log(2)));
}

/** Amorphous halo intensity at 2θ, degrees. */
export function anatomyHalo(twoThetaDeg: number): number {
  const { amplitude, center, sigma } = ANATOMY_HALO;
  return amplitude * Math.exp(-((twoThetaDeg - center) ** 2) / (2 * sigma ** 2));
}

/** Local background (flat base + halo) at 2θ. This is the peak's baseline. */
export function anatomyBaseline(twoThetaDeg: number): number {
  return ANATOMY_BASE + anatomyHalo(twoThetaDeg);
}

/** One reflection's own contribution at 2θ, above the background. */
export function anatomyPeakAt(twoThetaDeg: number, reflection: AlFumReflection): number {
  const sigma = anatomySigma();
  return (
    reflection.relIntensity *
    ANATOMY_AMPLITUDE *
    Math.exp(-((twoThetaDeg - reflection.twoThetaStd) ** 2) / (2 * sigma ** 2))
  );
}

/** The full drawn curve at 2θ: background + every reflection. */
export function anatomyCurve(twoThetaDeg: number): number {
  return (
    anatomyBaseline(twoThetaDeg) +
    ALFUM_STANDARD_REFLECTIONS.reduce(
      (sum, r) => sum + anatomyPeakAt(twoThetaDeg, r),
      0
    )
  );
}

export interface AnatomyPeakMeasure {
  hkl: string;
  /** 2θ of the apex (sampled, degrees). */
  apexTwoTheta: number;
  /** Absolute intensity (curve value) at the apex. */
  apexY: number;
  /** Local background immediately under the apex. */
  baselineY: number;
  /** Peak height above the local background. */
  heightAboveBase: number;
  /** Absolute intensity of the half-maximum level (baseline + half height). */
  halfMaxY: number;
  /** 2θ where the peak's own contribution falls to half, left branch. */
  leftTwoTheta: number;
  /** 2θ where the peak's own contribution falls to half, right branch. */
  rightTwoTheta: number;
  /**
   * Full width at half maximum, degrees — measured from the peak's own
   * contribution above background. Reproduces ANATOMY_FWHM_DEG.
   */
  fwhmDeg: number;
}

/**
 * Measure a peak the way a crystallographer does: locate the apex, find the
 * local background right under it, and walk out until the peak's own
 * contribution has fallen to half. The half-maximum level is therefore
 * baseline + height/2, NOT half of the raw curve value — using half of the
 * raw value on a peak sitting on a halo gives a wrong (much wider) answer.
 */
export function measureAnatomyPeak(
  reflection: AlFumReflection
): AnatomyPeakMeasure {
  const center = reflection.twoThetaStd;

  let apexTwoTheta = center;
  let apexY = -Infinity;
  for (let x = center - 0.4; x <= center + 0.4 + 1e-9; x += 0.001) {
    const y = anatomyCurve(x);
    if (y > apexY) {
      apexY = y;
      apexTwoTheta = x;
    }
  }

  const baselineY = anatomyBaseline(apexTwoTheta);
  const halfOwn = (reflection.relIntensity * ANATOMY_AMPLITUDE) / 2;

  const walk = (dir: 1 | -1): number => {
    for (let d = 0; d <= 1.2; d += 0.001) {
      const x = apexTwoTheta + dir * d;
      if (anatomyPeakAt(x, reflection) <= halfOwn) return x;
    }
    return apexTwoTheta + dir * 1.2;
  };

  const leftTwoTheta = walk(-1);
  const rightTwoTheta = walk(1);

  return {
    hkl: reflection.hkl,
    apexTwoTheta: Math.round(apexTwoTheta * 1000) / 1000,
    apexY,
    baselineY,
    heightAboveBase: apexY - baselineY,
    halfMaxY: baselineY + (apexY - baselineY) / 2,
    leftTwoTheta: Math.round(leftTwoTheta * 1000) / 1000,
    rightTwoTheta: Math.round(rightTwoTheta * 1000) / 1000,
    fwhmDeg: rightTwoTheta - leftTwoTheta,
  };
}

/** Half-width of the measurement window (degrees either side of a peak). */
export const ANATOMY_WINDOW_HALF_WIDTH = 1.2;

/**
 * Integral of the drawn curve minus its local background, between two 2θ
 * limits — i.e. the peak area exactly as it is shaded in the figure.
 *
 * Both the 2θ limits and the intensity are converted to PIXELS before
 * multiplying, because the trapezoid rule is only exact for the area actually
 * enclosed by the plotted polygon when the grid is orthogonal. Mixing degrees
 * with a.u. would report a number that does not match the ink on screen.
 *
 * @param pxPerDeg horizontal pixels per degree
 * @param pxPerAu  vertical pixels per intensity unit
 */
export function anatomyPeakAreaPx(
  twoThetaFrom: number,
  twoThetaTo: number,
  pxPerDeg: number,
  pxPerAu: number,
  step = 0.005
): number {
  let area = 0;
  let prevX = twoThetaFrom;
  let prevY = Math.max(0, anatomyCurve(prevX) - anatomyBaseline(prevX));
  for (let x = twoThetaFrom + step; x <= twoThetaTo + 1e-9; x += step) {
    const y = Math.max(0, anatomyCurve(x) - anatomyBaseline(x));
    area += ((prevY + y) / 2) * (x - prevX) * pxPerDeg * pxPerAu;
    prevX = x;
    prevY = y;
  }
  return area;
}

/**
 * Fraction of a peak's integrated area that survives inside the drawing
 * window ±w degrees, measured for THAT peak only (its own contribution above
 * background, not the whole pattern).
 *
 * Gaussian peaks have long tails: on a beta = 0,55 deg peak a ±1,2 deg window
 * still carries ~99,9% of the area. This reports it instead of pretending the
 * window is exact.
 */
export function anatomyPeakCapture(
  reflection: AlFumReflection,
  twoThetaFrom: number,
  twoThetaTo: number,
  step = 0.002
): number {
  let inside = 0;
  let total = 0;
  for (let x = twoThetaFrom; x <= twoThetaTo + 1e-9; x += step) {
    const own = anatomyPeakAt(x, reflection);
    total += own;
    if (x >= twoThetaFrom && x <= twoThetaTo) inside += own;
  }
  // account for the tails outside the window by integrating the whole peak
  let full = 0;
  for (let x = reflection.twoThetaStd - 6; x <= reflection.twoThetaStd + 6; x += step) {
    full += anatomyPeakAt(x, reflection);
  }
  return full > 0 ? total / full : 0;
}

/**
 * Assign a measured peak to a standard reflection. Matching uses the guide's
 * ±0,5° criterion (slide 21). Returns null when no standard reflection is
 * within tolerance — that peak is "tidak teridentifikasi".
 */
export function matchPeakToStandard(
  twoThetaDeg: number,
  reflections: readonly AlFumReflection[] = ALFUM_STANDARD_REFLECTIONS,
  toleranceDeg = XRD_CONSTANTS.matchToleranceDeg
): { hkl: string; deltaDeg: number } | null {
  let best: { hkl: string; deltaDeg: number } | null = null;
  for (const r of reflections) {
    const delta = Math.abs(twoThetaDeg - r.twoThetaStd);
    if (delta <= toleranceDeg && (!best || delta < best.deltaDeg)) {
      best = { hkl: r.hkl, deltaDeg: twoThetaDeg - r.twoThetaStd };
    }
  }
  return best;
}
