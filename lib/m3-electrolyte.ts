// M3 electrolyte composition — transcribed from Penuntun Praktikum KI3131,
// Modul 3, "Penyiapan 100 mL Larutan Elektrolit" (manual page 22).
//
// IMPORTANT BASIS NOTE. The manual's table prints the target concentration and
// the weighed mass in one column ("SnCl2·2H2O — 0,15 M (3,3846 g)") directly
// above a row reading "Volume akhir larutan 5,5 mL". Read naively, the molarity
// looks like it applies to the 5,5 mL sub-solution. It does not: every mass in
// the table corresponds to the stated molarity in the FINAL 100 mL electrolyte.
// Verified for all four reagents (see `molesFromMass` below):
//   1,4612 g / 292,244 = 0,00500 mol -> 0,0500 M in 100 mL
//   3,3846 g / 225,640 = 0,01500 mol -> 0,1500 M in 100 mL
//   2,4254 g / 485,067 = 0,00500 mol -> 0,0500 M in 100 mL
//   5,7636 g / 192,123 = 0,03000 mol -> 0,3000 M in 100 mL
// A student who applies the molarity to the sub-volume would weigh ~18x too
// little SnCl2·2H2O and obtain essentially no deposit, so the UI must state the
// basis explicitly rather than reprinting the ambiguous table.

export const FINAL_VOLUME_ML = 100;

/** Protocol operating point (manual page 23, step k). */
export const PROTOCOL_CURRENT_DENSITY_MA_CM2 = 14.5;
export const PROTOCOL_DURATION_MINUTES = 15;
export const PROTOCOL_DURATION_S = 900;

/** Target pH after dilution (manual page 23, step g). */
export const TARGET_PH = "~2";

export interface ElectrolyteReagent {
  /** Order within the sub-solution, as numbered in the manual's "Langkah" column. */
  step: number;
  name: string;
  /** Amount exactly as printed in the manual. */
  manualAmount: string;
  /** Target concentration in the final 100 mL, when the manual states one. */
  targetMolarity?: number;
  /** Weighed mass in grams, when the manual states one. */
  massG?: number;
  /** Molar mass used to verify the mass against the target concentration. */
  molarMass?: number;
  /** Formula string for the molar mass, for transparency. */
  molarMassNote?: string;
  role: string;
}

export interface ElectrolyteSolution {
  id: "A" | "B" | "C";
  finalVolumeMl: number;
  purpose: string;
  reagents: ElectrolyteReagent[];
}

export const SOLUTIONS: ElectrolyteSolution[] = [
  {
    id: "A",
    finalVolumeMl: 5,
    purpose:
      "Pembawa agen pengompleks EDTA dalam media basa (NH_{3}). EDTA hanya larut baik setelah dideprotonasi, sehingga NH_{3} ditambahkan lebih dulu.",
    reagents: [
      { step: 1, name: "H_{2}O", manualAmount: "4 mL", role: "Pelarut awal." },
      {
        step: 1,
        name: "NH_{3} (pekat)",
        manualAmount: "1 mL",
        role: "Menaikkan pH agar EDTA terdeprotonasi dan larut.",
      },
      {
        step: 2,
        name: "EDTA",
        manualAmount: "0,05 M (1,4612 g)",
        targetMolarity: 0.05,
        massG: 1.4612,
        molarMass: 292.244,
        molarMassNote: "H_{4}EDTA, C_{10}H_{16}N_{2}O_{8}",
        role:
          "Agen pengompleks kuat; menggeser potensial deposisi efektif Bi^{3+} dan Sn^{2+} agar keduanya dapat mengendap bersamaan.",
      },
    ],
  },
  {
    id: "B",
    finalVolumeMl: 5.5,
    purpose:
      "Pembawa kedua ion logam. Media HCl pekat menahan hidrolisis Sn^{2+} dan Bi^{3+} yang mudah membentuk oksiklorida/oksinitrat pada pH lebih tinggi.",
    reagents: [
      { step: 1, name: "H_{2}O", manualAmount: "4 mL", role: "Pelarut awal." },
      {
        step: 1,
        name: "HCl (pekat)",
        manualAmount: "1,5 mL",
        role:
          "Menjaga keasaman agar Sn^{2+} tidak terhidrolisis menjadi Sn(OH)Cl dan Bi^{3+} tidak menjadi BiONO_{3}.",
      },
      {
        step: 2,
        name: "SnCl_{2}·2H_{2}O",
        manualAmount: "0,15 M (3,3846 g)",
        targetMolarity: 0.15,
        massG: 3.3846,
        molarMass: 225.64,
        molarMassNote: "SnCl_{2}·2H_{2}O",
        role: "Sumber ion Sn^{2+}, komponen mayor paduan.",
      },
      {
        step: 3,
        name: "Bi(NO_{3})_{3}·5H_{2}O",
        manualAmount: "0,05 M (2,4254 g)",
        targetMolarity: 0.05,
        massG: 2.4254,
        molarMass: 485.067,
        molarMassNote: "Bi(NO_{3})_{3}·5H_{2}O",
        role: "Sumber ion Bi^{3+}, komponen minor paduan.",
      },
    ],
  },
  {
    id: "C",
    finalVolumeMl: 9,
    purpose:
      "Pembawa agen pengompleks kedua. Asam sitrat bekerja bersama EDTA mengatur komposisi deposit Sn-Bi.",
    reagents: [
      { step: 1, name: "H_{2}O", manualAmount: "8 mL", role: "Pelarut awal." },
      { step: 1, name: "HCl", manualAmount: "1 mL", role: "Menjaga media tetap asam." },
      {
        step: 2,
        name: "Asam sitrat",
        manualAmount: "0,30 M (5,7636 g)",
        targetMolarity: 0.3,
        massG: 5.7636,
        molarMass: 192.123,
        molarMassNote: "C_{6}H_{8}O_{7} anhidrat",
        role:
          "Pengompleks tambahan; bersama EDTA dan PEG400 mengendalikan komposisi serta morfologi deposit.",
      },
    ],
  },
];

/** mol from a weighed mass — used to verify the manual's table against 100 mL. */
export function molesFromMass(massG: number, molarMass: number): number {
  return massG / molarMass;
}

/** Concentration the weighed mass produces in the final electrolyte volume. */
export function molarityInFinalVolume(massG: number, molarMass: number): number {
  return molesFromMass(massG, molarMass) / (FINAL_VOLUME_ML / 1000);
}

/** PEG400 is given only as a final concentration, so mass and volume must be derived. */
export const PEG400 = {
  targetMolarity: 0.2,
  nominalMolarMass: 400,
  density: 1.128,
  get moles() {
    return this.targetMolarity * (FINAL_VOLUME_ML / 1000);
  },
  get massG() {
    return this.moles * this.nominalMolarMass;
  },
  get volumeMl() {
    return this.massG / this.density;
  },
};

/** Order of addition after A, B and C are made up (manual page 22, steps b-g). */
export const ADDITION_ORDER = [
  { id: "a-into-b", label: "Pipet larutan A sedikit demi sedikit ke dalam larutan B" },
  { id: "ab-into-c", label: "Tuangkan larutan (A+B) ke dalam larutan C secara perlahan" },
  { id: "peg", label: "Tambahkan PEG400 hingga konsentrasi akhir 0,20 M" },
  { id: "nh3", label: "Tambahkan NH_{3} (pekat) sebanyak 0,5 mL" },
  { id: "dilute", label: "Tambahkan air hingga volume akhir 100 mL" },
  { id: "ph", label: "Cek pH larutan (pH ~2)" },
];

/** Volumes committed before the final make-up to 100 mL. */
export const VOLUME_BUDGET = {
  solutionsMl: 5 + 5.5 + 9,
  nh3FinalMl: 0.5,
  get pegMl() {
    return PEG400.volumeMl;
  },
  get committedMl() {
    return this.solutionsMl + this.nh3FinalMl + this.pegMl;
  },
  get waterToAddMl() {
    return FINAL_VOLUME_ML - this.committedMl;
  },
};
