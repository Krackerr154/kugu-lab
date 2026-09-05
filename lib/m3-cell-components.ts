// M3 cell anatomy data, extracted so CellSimulation and
// ElectrochemicalCellExplorer can share the ComponentKey union without a
// circular import.
//
// Standard reduction potentials (vs SHE, 25 °C) are textbook values included so
// students can answer tugas pendahuluan #2 ("tuliskan reaksi-reaksi yang mungkin
// terjadi di anoda dan katoda ... lengkapi dengan potensial reduksi"). They are
// STANDARD potentials: the actual deposition potentials in this electrolyte are
// shifted by complexation and concentration, which is the point the explorer makes.

export type ComponentKey = "dcSource" | "anode" | "cathode" | "electrolyte" | "leads";

export interface HalfReaction {
  tex: string;
  potential: string;
  role: string;
}

export interface CellComponent {
  name: string;
  description: string;
  halfReactions?: HalfReaction[];
  note?: string;
}

export const CELL_COMPONENTS: Record<ComponentKey, CellComponent> = {
  dcSource: {
    name: "Sumber DC (0-10 V, 0-10 A)",
    description:
      "Catu daya arus searah yang memaksa reaksi berlangsung ke arah non-spontan. Terminal positif menarik elektron dari anoda; terminal negatif mendorong elektron ke katoda. Rapat arus diatur sesuai protokol (14,5 mA/cm²) — jangan melebihi arus yang disetujui.",
    note:
      "Sel ini elektrolitik, bukan galvanik: energi listrik dipasok dari luar, sehingga tanda potensial sel keseluruhan negatif secara termodinamika.",
  },
  anode: {
    name: "Anoda (+) — grafit",
    description:
      "Elektroda tempat oksidasi berlangsung. Modul ini memakai grafit, yaitu elektroda yang relatif inert, sehingga yang teroksidasi adalah spesi dalam larutan, bukan elektrodanya sendiri.",
    halfReactions: [
      {
        tex: "2\\text{H}_2\\text{O}(l) \\rightarrow \\text{O}_2(g) + 4\\text{H}^+(aq) + 4e^-",
        potential: "E° = +1,23 V (sebagai reduksi O₂/H₂O)",
        role: "Oksidasi air — reaksi anoda yang umum pada elektroda inert dalam larutan berair",
      },
    ],
    note:
      "Elektrolit ini mengandung klorida (dari HCl dan SnCl₂), sehingga oksidasi klorida juga mungkin bersaing. Reaksi anoda yang berlaku dan implikasi keselamatannya harus dikonfirmasi dengan asisten — jangan diasumsikan dari halaman ini.",
  },
  cathode: {
    name: "Katoda (−) — plat tembaga",
    description:
      "Elektroda tempat reduksi berlangsung. Ion Sn²⁺ dan Bi³⁺ menerima elektron dan mengendap sebagai logam, sehingga massa katoda bertambah. Substrat tembaga tidak ikut terdeposisi — ia hanya permukaan tempat paduan menempel.",
    halfReactions: [
      {
        tex: "\\text{Bi}^{3+}(aq) + 3e^- \\rightarrow \\text{Bi}(s)",
        potential: "E° = +0,31 V",
        role: "Reduksi bismut — potensial paling positif, jadi paling mudah tereduksi",
      },
      {
        tex: "\\text{Sn}^{2+}(aq) + 2e^- \\rightarrow \\text{Sn}(s)",
        potential: "E° = −0,14 V",
        role: "Reduksi timah — butuh potensial lebih negatif daripada bismut",
      },
      {
        tex: "2\\text{H}^+(aq) + 2e^- \\rightarrow \\text{H}_2(g)",
        potential: "E° = 0,00 V",
        role: "Reaksi samping: evolusi hidrogen. Elektrolit ber-pH ~2, jadi H⁺ berlimpah",
      },
    ],
    note:
      "Evolusi H₂ memakai sebagian arus tanpa menambah massa deposit. Inilah salah satu penyebab utama efisiensi arus < 100% pada kalkulator di bawah.",
  },
  electrolyte: {
    name: "Elektrolit (Larutan A + B + C, pH ~2)",
    description:
      "Larutan pembawa ion logam beserta agen pengompleks. Larutan A menyumbang EDTA dalam NH₃, Larutan B menyumbang SnCl₂ dan Bi(NO₃)₃ dalam HCl, Larutan C menyumbang asam sitrat, lalu PEG400 dan NH₃ ditambahkan sebelum diencerkan ke 100 mL.",
    note:
      "EDTA dan asam sitrat mengompleks ion logam sehingga potensial deposisi efektifnya bergeser; PEG400 bekerja pada permukaan deposit. Fungsi rinci tiap komponen adalah bahan tugas pendahuluan #3.",
  },
  leads: {
    name: "Kabel Penghubung",
    description:
      "Penghantar dari sumber DC ke elektroda. Verifikasi polaritas dan kontak (gunakan amperemeter) sebelum menyalakan catu daya.",
    note:
      "Polaritas terbalik akan melarutkan deposit dan merusak percobaan; massa katoda akan turun, bukan naik.",
  },
};
