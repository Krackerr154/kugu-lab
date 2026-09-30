// M3 complexing-agent reference data.
//
// Sources: Shared_Modul KUGU Module 4 for the recipe roles
// and quantities, and the manual's own reading list for the mechanism — Tsai &
// Hu (J. Electrochem. Soc. 156, D490, 2009) on the interactive effects of citric
// acid, EDTA and PEG on Sn-Bi composition, and the PEG-400 paper the manual
// assigns as tugas pendahuluan #3 (doi 10.1149/1.3276678).
//
// Where the manual does not state a mechanism, this data says so instead of
// inventing one.

export interface ComplexingAgent {
  id: "edta" | "citrate" | "peg400";
  name: string;
  formulaLabel: string;
  solution: string;
  /** Short classification shown on the card face. */
  kind: string;
  /** One-line role, shown on the collapsed card. */
  summary: string;
  /** Concentration exactly as the manual specifies it. */
  concentration: string;
  /** Weighed/derived working amount for 100 mL of electrolyte. */
  workingAmount: string;
  /** Tailwind hue family driving the card's colour treatment. */
  hue: "purple" | "blue" | "teal";
  icon: string;
  /** KaTeX for the governing equilibrium or process, if one can be written. */
  tex?: string;
  texLabel?: string;
  /** Why it is in the recipe — the mechanism. */
  mechanism: string[];
  /** What changes in the deposit because of it. */
  effect: string[];
  /** Reference pointer from the manual's own list. */
  reference: string;
}

export const COMPLEXING_AGENTS: ComplexingAgent[] = [
  {
    id: "edta",
    name: "EDTA",
    formulaLabel: "H_{4}EDTA (C_{10}H_{16}N_{2}O_{8})",
    solution: "Larutan A",
    kind: "Pengompleks kuat (heksadentat)",
    summary:
      "Mengikat kedua ion logam sehingga potensial deposisi efektifnya bergeser dan mendekat.",
    concentration: "0,05 M",
    workingAmount: "1,4612 g dalam 100 mL",
    hue: "purple",
    icon: "hub",
    tex: "M^{n+} + \\text{EDTA}^{4-} \\rightleftharpoons [M(\\text{EDTA})]^{(n-4)}",
    texLabel: "Kesetimbangan pembentukan kompleks",
    mechanism: [
      "EDTA merupakan ligan heksadentat: satu molekul mengikat kuat satu ion logam melalui enam atom donor (empat gugus karboksilat dan dua atom nitrogen), membentuk cincin kelat yang sangat stabil.",
      "Ion logam yang terikat kompleks tidak lagi bebas di larutan. Aktivitas ion bebasnya turun drastis, dan menurut persamaan Nernst potensial reduksi efektifnya bergeser ke arah lebih negatif.",
      "Karena tetapan kestabilan kompleks Bi-EDTA dan Sn-EDTA berbeda, pergeseran yang dialami kedua ion tidak sama besar — di sinilah jarak 0,45 V dapat dipersempit.",
      "EDTA dilarutkan lebih dahulu dalam NH_{3} pekat (Larutan A) karena bentuk asamnya sukar larut; deprotonasi diperlukan agar gugus karboksilat siap mengikat logam.",
    ],
    effect: [
      "Tanpa EDTA, Bi^{3+} tereduksi jauh lebih dulu dan menghasilkan lapisan kaya bismut yang tidak seragam.",
      "Dengan EDTA, kedua logam dapat mengendap dalam rentang potensial yang berdekatan — inilah kodeposisi yang dituju modul ini.",
    ],
    reference:
      "Tsai & Hu (2009), J. Electrochem. Soc. 156, D490 — Composition Control of Sn-Bi Deposits",
  },
  {
    id: "citrate",
    name: "Asam Sitrat",
    formulaLabel: "C_{6}H_{8}O_{7}",
    solution: "Larutan C",
    kind: "Pengompleks pendamping (trikarboksilat)",
    summary:
      "Pengompleks kedua yang bekerja bersama EDTA untuk mengatur komposisi deposit.",
    concentration: "0,30 M",
    workingAmount: "5,7636 g dalam 100 mL",
    hue: "blue",
    icon: "account_tree",
    tex: "M^{n+} + \\text{Cit}^{3-} \\rightleftharpoons [M(\\text{Cit})]^{(n-3)}",
    texLabel: "Kesetimbangan sitrat-logam",
    mechanism: [
      "Asam sitrat memiliki tiga gugus karboksilat dan satu gugus hidroksil yang dapat mengikat ion logam sebagai ligan polidentat. Kekuatan ikatannya lebih lemah dibandingkan EDTA, namun hadir dengan konsentrasi enam kali lebih tinggi (0,30 M vs 0,05 M).",
      "Kombinasi ligan kuat berkonsentrasi rendah (EDTA) dengan ligan lemah berkonsentrasi tinggi memberi kendali yang lebih halus atas spesiasi kedua logam daripada satu ligan saja.",
      "Sitrat juga berfungsi sebagai buffer lemah pada media asam, membantu menahan pH elektrolit di sekitar 2 selama deposisi berlangsung.",
    ],
    effect: [
      "Rasio Sn:Bi dalam deposit bergantung pada kesetimbangan gabungan EDTA dan sitrat — inilah 'interactive effects' yang menjadi judul literatur Tsai & Hu.",
      "Perubahan konsentrasi sitrat menggeser komposisi deposit tanpa harus mengubah rapat arus.",
    ],
    reference:
      "Tsai, Hu & Lin (2007), Electrochim. Acta 53, 2040 — Effects of complex agents on composition, adhesion, and dendrite formation",
  },
  {
    id: "peg400",
    name: "PEG400",
    formulaLabel: "HO(CH_{2}CH_{2}O)_{n}H",
    solution: "Ditambahkan setelah A+B+C",
    kind: "Aditif permukaan (model adsorpsi)",
    summary:
      "Memodifikasi pertumbuhan bersama komponen elektrolit lain; dapat membantu menekan dendrit.",
    concentration: "0,20 M akhir",
    workingAmount: "≈ 8,0 g (≈ 7,1 mL) dalam 100 mL",
    hue: "teal",
    icon: "layers",
    mechanism: [
      "PEG400 merupakan campuran rantai polietilena glikol dengan massa molar nominal rata-rata 400 g/mol. Karena itu '0,20 M' memakai nilai rata-rata, bukan massa molar satu senyawa tunggal.",
      "PEG yang teradsorpsi dapat menutup sebagian situs pertumbuhan. Model di beaker mengilustrasikan penambahan logam yang lebih tersebar; bukan penghentian semua deposisi atau pengikisan dendrit lama.",
      "Adsorpsi PEG sebagai aditif perata dilaporkan pada deposit Bi (doi 10.1016/j.electacta.2011.06.077). Adaptasi gambar ke Sn–Bi bersifat konseptual; lokasi adsorpsi dan interaksi PEG dengan ion larutan tidak ditentukan oleh skema ini.",
      "Pada studi Sn–Bi Tsai, Hu & Lin (2007), penghambatan dendrit merupakan hasil gabungan asam sitrat, EDTA, dan PEG. Hasil itu tidak membuktikan efek PEG400 saja, maupun adsorpsi yang selalu memilih ujung dendrit.",
    ],
    effect: [
      "Dendrit dapat berkurang, tetapi tidak dijamin hilang; morfologi dan adhesi tetap bergantung pada komposisi larutan serta kondisi deposisi.",
      "Mengubah aditif juga dapat mengubah komposisi paduan dan perilaku elektrokimia, bukan hanya meratakan permukaan.",
      "Tidak ditulis persamaan kesetimbangan karena skema ini tidak menetapkan satu stoikiometri adsorpsi atau kompleksasi PEG.",
    ],
    reference:
      "Boiadjieva dkk. (2010), J. Electrochem. Soc. 157, D159 — Effect of PEG 400 on Zn–Cr Alloy Electrodeposition, doi 10.1149/1.3276678. Pembanding Sn–Bi: Tsai, Hu & Lin (2007), Electrochim. Acta 53, 2040–2047",
  },
];
