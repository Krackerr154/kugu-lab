/**
 * M6 FTIR band reference and spectrum model.
 *
 * Source of truth: "Pengarahan Modul 6 — Karakterisasi dan Interpretasi Data FTIR"
 * (Praktikum KI3131 Kimia Unsur Golongan Utama, Semester 1 2026/2027).
 *
 * Band positions are the deck's values. The plotted trace is synthesised from
 * those bands because the practical's raw spectra are not part of this
 * repository — the workspace says so on screen rather than implying a measured
 * sample.
 */

export type FtirSample = "asam-fumarat" | "al-fum" | "atmosfer";

export type AssignmentKey =
  | "oh-acid"
  | "co-acid"
  | "coo-asym"
  | "coo-sym"
  | "co"
  | "oh-bend"
  | "skeletal"
  | "water"
  | "artefact";

export interface AssignmentOption {
  key: AssignmentKey;
  label: string;
}

export interface FtirBand {
  id: string;
  sample: FtirSample;
  /** Band centre in cm-1. */
  center: number;
  /** Half-width of the drawn peak, in cm-1. */
  width: number;
  /** Peak depth in transmittance units. */
  depth: number;
  assignment: AssignmentKey;
  /** Whether the band gets a clickable marker in the exercise. */
  marked: boolean;
  /** Whether the band distinguishes free acid from coordinated fumarate. */
  diagnostic: boolean;
  /** Compact label for tight legends, where `note` would truncate. */
  short: string;
  note: string;
}

/** Transmittance baseline of the free-acid trace. */
export const FUMARIC_BASELINE = 100;

/**
 * Vertical offset that stacks the Al-Fum trace above the free-acid one. The
 * deck's worked example uses +140; a smaller offset keeps both traces legible
 * on a phone, which the deck explicitly allows ("angka tidak harus 140").
 */
export const ALFUM_OFFSET = 60;

export const ASSIGNMENT_OPTIONS: readonly AssignmentOption[] = [
  { key: "oh-acid", label: "Ulur O–H asam karboksilat (COOH)" },
  { key: "co-acid", label: "Ulur C=O asam karboksilat (COOH)" },
  { key: "coo-asym", label: "Ulur asimetri COO⁻" },
  { key: "coo-sym", label: "Ulur simetri COO⁻" },
  { key: "co", label: "Ulur C–O" },
  { key: "oh-bend", label: "Tekuk O–H" },
  { key: "skeletal", label: "Tekuk C=C / C–H kerangka fumarat" },
  { key: "water", label: "Ulur O–H air pori atau gugus μ-OH" },
  { key: "artefact", label: "Bukan pita sampel (CO₂ atau uap air atmosfer)" },
];

export const FTIR_BANDS: readonly FtirBand[] = [
  // ── Asam fumarat bebas (ligan belum terkoordinasi) ──────────────────────
  {
    id: "f-oh",
    sample: "asam-fumarat",
    center: 2950,
    width: 430,
    depth: 46,
    assignment: "oh-acid",
    marked: true,
    diagnostic: true,
    short: "Ulur O–H (COOH)",
    note: "Pita O–H sangat lebar (2500–3300 cm⁻¹) dari dimer asam karboksilat berikatan hidrogen. Pita ini hilang setelah H⁺ lepas dan karboksilat terkoordinasi.",
  },
  {
    id: "f-c=o",
    sample: "asam-fumarat",
    center: 1675,
    width: 42,
    depth: 54,
    assignment: "co-acid",
    marked: true,
    diagnostic: true,
    short: "Ulur C=O (COOH)",
    note: "Ulur C=O tajam pada 1675 cm⁻¹. Ini penanda asam fumarat bebas: bila pita ini masih muncul pada sampel, reaksi belum sempurna.",
  },
  {
    id: "f-co-a",
    sample: "asam-fumarat",
    center: 1274,
    width: 26,
    depth: 34,
    assignment: "co",
    marked: true,
    diagnostic: false,
    short: "Ulur C–O + tekuk O–H",
    note: "Ulur C–O disertai tekuk O–H pada gugus COOH. Berpasangan dengan pita 1231 cm⁻¹ di sebelahnya.",
  },
  {
    id: "f-co-b",
    sample: "asam-fumarat",
    center: 1231,
    width: 22,
    depth: 28,
    assignment: "co",
    marked: false,
    diagnostic: false,
    short: "Ulur C–O + tekuk O–H",
    note: "Pasangan pita 1274 cm⁻¹; keduanya berasal dari COOH.",
  },
  {
    id: "f-oh-bend",
    sample: "asam-fumarat",
    center: 927,
    width: 40,
    depth: 26,
    assignment: "oh-bend",
    marked: true,
    diagnostic: false,
    short: "Tekuk O–H",
    note: "Tekuk O–H di luar bidang pada 927 cm⁻¹, khas asam karboksilat bebas.",
  },

  // ── Al-Fum (fumarat terkoordinasi pada Al3+) ────────────────────────────
  {
    id: "a-oh",
    sample: "al-fum",
    center: 3480,
    width: 240,
    depth: 26,
    assignment: "water",
    marked: true,
    diagnostic: false,
    short: "O–H air pori / μ-OH",
    note: "Pita lebar 3400–3600 cm⁻¹ dari air di dalam pori atau gugus μ-OH, bukan O–H ligan fumarat.",
  },
  {
    id: "a-coo-asym",
    sample: "al-fum",
    center: 1610,
    width: 46,
    depth: 50,
    assignment: "coo-asym",
    marked: true,
    diagnostic: true,
    short: "Ulur asimetri COO⁻",
    note: "Ulur asimetri COO⁻. Muncul menggantikan C=O 1675 cm⁻¹ setelah karboksilat terkoordinasi pada Al³⁺.",
  },
  {
    id: "a-coo-sym",
    sample: "al-fum",
    center: 1430,
    width: 40,
    depth: 44,
    assignment: "coo-sym",
    marked: true,
    diagnostic: true,
    short: "Ulur simetri COO⁻",
    note: "Ulur simetri COO⁻. Bersama pita 1610 cm⁻¹, keduanya menandakan kedua ikatan C–O kini setara (orde ikatan ≈1,5).",
  },
  {
    id: "a-co",
    sample: "al-fum",
    center: 1158,
    width: 34,
    depth: 28,
    assignment: "co",
    marked: true,
    diagnostic: false,
    short: "Ulur C–O",
    note: "Pita terkait ikatan C–O pada kerangka fumarat.",
  },
  {
    id: "a-co-2",
    sample: "al-fum",
    center: 805,
    width: 30,
    depth: 22,
    assignment: "co",
    marked: false,
    diagnostic: false,
    short: "Ulur C–O",
    note: "Pita C–O kedua pada 805 cm⁻¹; berpasangan dengan 1158 cm⁻¹.",
  },
  {
    id: "a-skel",
    sample: "al-fum",
    center: 685,
    width: 36,
    depth: 26,
    assignment: "skeletal",
    marked: true,
    diagnostic: false,
    short: "Tekuk C=C / C–H",
    note: "Tekuk C=C dan C–H kerangka fumarat pada 720–650 cm⁻¹.",
  },

  // ── Artefak atmosfer ────────────────────────────────────────────────────
  {
    id: "t-co2",
    sample: "atmosfer",
    center: 2350,
    width: 22,
    depth: 20,
    assignment: "artefact",
    marked: true,
    diagnostic: false,
    short: "Artefak CO₂ udara",
    note: "Pita sekitar 2350 cm⁻¹ berasal dari CO₂ di udara, muncul pada kedua spektrum. Ini bukan gugus fungsi sampel dan tidak boleh ditetapkan.",
  },
];

export const FTIR_REGIONS = [
  { id: "fingerprint", label: "Sidik jari", range: "1800–600 cm⁻¹", min: 600, max: 1800 },
  { id: "full", label: "Seluruh", range: "4000–400 cm⁻¹", min: 400, max: 4000 },
] as const;

export type FtirRegionId = (typeof FTIR_REGIONS)[number]["id"];

export interface SpectrumPoint {
  x: number;
  acid: number;
  alfum: number;
}

export interface PurityRow {
  band: string;
  acid: string;
  alfum: string;
}

export const PURITY_ROWS: readonly PurityRow[] = [
  { band: "Ulur C=O sekitar 1675 cm⁻¹", acid: "Ada", alfum: "Tidak ada" },
  { band: "Ulur O–H lebar 2500–3300 cm⁻¹", acid: "Ada", alfum: "Tidak ada" },
  { band: "Ulur asimetri dan simetri COO⁻", acid: "Tidak ada", alfum: "Ada" },
];

function gaussian(x: number, center: number, width: number): number {
  const d = (x - center) / width;
  return Math.exp(-d * d);
}

/** Sample spectra synthesised from the band table, sampled across a region. */
export function buildSpectrum(regionId: FtirRegionId, steps = 480): SpectrumPoint[] {
  const region = FTIR_REGIONS.find((r) => r.id === regionId) ?? FTIR_REGIONS[0];
  const points: SpectrumPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const x = region.min + ((region.max - region.min) * i) / steps;
    let acid = FUMARIC_BASELINE;
    let alfum = FUMARIC_BASELINE + ALFUM_OFFSET;

    for (const band of FTIR_BANDS) {
      const drop = band.depth * gaussian(x, band.center, band.width);
      // Atmospheric artefacts land on both traces, as they do on a real scan.
      if (band.sample === "asam-fumarat" || band.sample === "atmosfer") acid -= drop;
      if (band.sample === "al-fum" || band.sample === "atmosfer") alfum -= drop;
    }

    points.push({ x, acid, alfum });
  }

  return points;
}

/** Y bounds taken from the whole 400-4000 sweep so switching regions never rescales. */
export function spectrumDomain(): { min: number; max: number } {
  const points = buildSpectrum("full", 720);
  let min = Infinity;
  let max = -Infinity;

  for (const p of points) {
    min = Math.min(min, p.acid, p.alfum);
    max = Math.max(max, p.acid, p.alfum);
  }

  return {
    min: Math.floor((min - 4) / 10) * 10,
    max: Math.ceil((max + 4) / 10) * 10,
  };
}

export function markedBands(): FtirBand[] {
  return FTIR_BANDS.filter((b) => b.marked);
}

export function bandById(id: string): FtirBand | undefined {
  return FTIR_BANDS.find((b) => b.id === id);
}

export function assignmentLabel(key: AssignmentKey): string {
  return ASSIGNMENT_OPTIONS.find((o) => o.key === key)?.label ?? key;
}

export function sampleLabel(sample: FtirSample): string {
  if (sample === "asam-fumarat") return "Asam fumarat";
  if (sample === "al-fum") return "Al-Fum";
  return "Kedua spektrum";
}

export interface AssignmentVerdict {
  correct: boolean;
  band: FtirBand;
}

export function checkAssignment(bandId: string, key: AssignmentKey): AssignmentVerdict | null {
  const band = bandById(bandId);
  if (!band) return null;
  return { correct: band.assignment === key, band };
}

export interface Progress {
  answered: number;
  correct: number;
  total: number;
}

export function progressOf(answers: Readonly<Record<string, AssignmentKey>>): Progress {
  const bands = markedBands();
  let answered = 0;
  let correct = 0;

  for (const band of bands) {
    const given = answers[band.id];
    if (given === undefined) continue;
    answered += 1;
    if (given === band.assignment) correct += 1;
  }

  return { answered, correct, total: bands.length };
}
/**
 * Baris tabel identifikasi FTIR.
 *
 * The table is DERIVED from FTIR_BANDS, never hand-written: each row names a
 * band id and the module's own `depth` / `width` are turned into the
 * intensity and shape columns. That way the identification table and the
 * spectrum that the workspace plots cannot disagree — a band cannot appear in
 * the table without existing in the model, and its strength label follows the
 * physical number that draws the peak.
 *
 * `position` stays authored because a real table quotes a literature range
 * (e.g. O–H 2500–3300) rather than the single centre the plot uses.
 */

export type FtirBandRegion = "functional" | "fingerprint" | "artefact";
export type FtirIntensity = "Kuat" | "Sedang" | "Lemah";
export type FtirShape = "Sangat lebar" | "Lebar" | "Tajam";
export type FtirAppearsOn = "Asam fumarat" | "Al-Fum" | "Keduanya";

export interface FtirTheoryBand {
  /** Band centre in cm-1; ties this row to FTIR_BANDS and to the strip ticks. */
  anchor: number;
  position: string;
  group: string;
  region: FtirBandRegion;
  intensity: FtirIntensity;
  shape: FtirShape;
  appearsOn: FtirAppearsOn;
  note: string;
}

/** Peak depth in transmittance units -> conventional intensity class. */
export function intensityOf(depth: number): FtirIntensity {
  if (depth >= 45) return "Kuat";
  if (depth >= 30) return "Sedang";
  return "Lemah";
}

/** Drawn half-width in cm-1 -> the shape words correlation tables use. */
export function shapeOf(width: number): FtirShape {
  if (width >= 120) return "Sangat lebar";
  if (width >= 60) return "Lebar";
  return "Tajam";
}

/** Atmospheric bands are never part of the sample's functional-group region. */
export function regionOf(center: number, sample: FtirSample): FtirBandRegion {
  if (sample === "atmosfer") return "artefact";
  return center >= 1500 ? "functional" : "fingerprint";
}

function appearsOnOf(sample: FtirSample): FtirAppearsOn {
  if (sample === "asam-fumarat") return "Asam fumarat";
  if (sample === "al-fum") return "Al-Fum";
  return "Keduanya";
}

const THEORY_ROW_SPEC: readonly { id: string; position: string; group: string }[] = [
  { id: "f-oh", position: "2500–3300", group: "Ulur O–H asam karboksilat" },
  { id: "f-c=o", position: "1675", group: "Ulur C=O asam karboksilat" },
  { id: "a-oh", position: "3400–3600", group: "Ulur O–H air pori / μ-OH" },
  { id: "a-coo-asym", position: "1610", group: "Ulur asimetri COO⁻" },
  { id: "a-coo-sym", position: "1430", group: "Ulur simetri COO⁻" },
  { id: "f-co-a", position: "1274", group: "Ulur C–O + tekuk O–H (COOH)" },
  { id: "f-co-b", position: "1231", group: "Ulur C–O + tekuk O–H (COOH)" },
  { id: "a-co", position: "1158", group: "Ulur C–O" },
  { id: "f-oh-bend", position: "927", group: "Tekuk O–H dimer asam" },
  { id: "a-co-2", position: "805", group: "Ulur C–O (kedua)" },
  { id: "a-skel", position: "685", group: "Tekuk C=C / C–H kerangka fumarat" },
  { id: "t-co2", position: "2350", group: "CO₂ udara (artefak)" },
];

const REGION_ORDER: Record<FtirBandRegion, number> = {
  functional: 0,
  fingerprint: 1,
  artefact: 2,
};

export const FTIR_THEORY_BANDS: readonly FtirTheoryBand[] = THEORY_ROW_SPEC.map(
  ({ id, position, group }) => {
    const band = FTIR_BANDS.find((b) => b.id === id);
    if (!band) throw new Error(`FTIR theory row references unknown band id: ${id}`);
    return {
      anchor: band.center,
      position,
      group,
      region: regionOf(band.center, band.sample),
      intensity: intensityOf(band.depth),
      shape: shapeOf(band.width),
      appearsOn: appearsOnOf(band.sample),
      note: band.note,
    };
  },
)
  .slice()
  .sort(
    (a, b) => REGION_ORDER[a.region] - REGION_ORDER[b.region] || b.anchor - a.anchor,
  );

/** Group heading wording used by the identification table. */
export const FTIR_BAND_REGION_LABEL: Record<FtirBandRegion, { title: string; range: string }> = {
  functional: { title: "Daerah gugus fungsi", range: "4000–1500 cm⁻¹" },
  fingerprint: { title: "Daerah sidik jari", range: "1500–600 cm⁻¹" },
  artefact: { title: "Artefak atmosfer", range: "bukan pita sampel" },
};
