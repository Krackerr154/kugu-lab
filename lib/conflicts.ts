// Content reconciliation register — conflicts from manual mapping
// Must be resolved by teaching team before publishing

export interface ContentConflict {
  id: string;
  module: string;
  conflict: string;
  requiredDecision: string;
  status: "unresolved" | "resolved";
}

export const contentConflicts: ContentConflict[] = [
  {
    id: "CR-01",
    module: "M1",
    conflict: "Materials list Al(NO_{3})_{2}; prosedur menggunakan Al(NO_{3})_{3}.",
    requiredDecision: "Koreksi senyawa/rumus dan konsentrasi.",
    status: "unresolved",
  },
  {
    id: "CR-02",
    module: "M1",
    conflict: "Materials list Na_{2}CrO_{4}; prosedur menggunakan K_{2}CrO_{4}.",
    requiredDecision: "Koreksi garam/pereaksi dan perlakuan limbah.",
    status: "unresolved",
  },
  {
    id: "CR-03",
    module: "M1",
    conflict: "Prosedur gas menyebut natrium bikarbonat; materials list Na_{2}CO_{3}.",
    requiredDecision: "Koreksi pereaksi dan observasi/persamaan yang diharapkan.",
    status: "unresolved",
  },
  {
    id: "CR-04",
    module: "M1",
    conflict: "Tabel observasi mencantumkan Na^{+}; prosedur menonjolkan KNO_{3}.",
    requiredDecision: "Konfirmasi matriks kation/pereaksi yang dimaksud.",
    status: "unresolved",
  },
  {
    id: "CR-05",
    module: "M4",
    conflict: "Naratif hydrothermal/tekanan tinggi vs prosedur botol PP yang dipanaskan.",
    requiredDecision: "Rating wadah, penutup, fraksi pengisian, proses kontrol suhu/tekanan.",
    status: "unresolved",
  },
  {
    id: "CR-06",
    module: "M3",
    conflict: "Grafit diperoleh dari baterai bekas.",
    requiredDecision: "Jenis baterai yang disetujui, metode isolasi, supervise, dan jalur e-waste.",
    status: "unresolved",
  },
  {
    id: "CR-07",
    module: "M6",
    conflict: "Objektif mendeskripsikan dua sampel zeolit; teks prosedur/pre-lab lain menyebut alumina/gel alumina.",
    requiredDecision: "Konfirmasi set sampel yang dianalisis dan prompt laporan.",
    status: "unresolved",
  },
];
