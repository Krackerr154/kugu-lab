/**
 * Modul 7 — adsorpsi-desorpsi N2 dan metode BET.
 *
 * Source of truth: "Panduan Modul N2 sorpsi - mahasiswa" (Pengarahan Modul 7,
 * Praktikum KI3131, Semester 1 2026/2027), 25 slides.
 *
 * Everything the page states about BET — the window, the constants, the
 * validity rule and the three worked Al-Fum results — comes from that guide.
 * The pore animation and the IUPAC curves are generated from one small model
 * here, so the picture and the plotted curve can never disagree.
 */

/* ── Konstanta dari panduan (slide 11) ─────────────────────────────────── */

export const BET_CONSTANTS = {
  /** M N2, g/mol */
  molarMassN2: 28.0134,
  /** Volume molar pada STP, cm3/mol */
  molarVolume: 22414,
  /** Bilangan Avogadro, /mol */
  avogadro: 6.0221e23,
  /** Luas penampang satu molekul N2, m2 (0,162 nm2) */
  crossSection: 1.62e-19,
  /** Jendela BET yang dipakai instrumen */
  windowMin: 0.05,
  windowMax: 0.3,
  /** Batas linear menurut teori (slide 8) */
  linearMin: 0.05,
  linearMax: 0.35,
} as const;

/* ── Klasifikasi isoterm IUPAC (slide 7) ───────────────────────────────── */

export type IsothermTypeId = "I" | "II" | "III" | "IV" | "V" | "VI";

export interface IsothermType {
  id: IsothermTypeId;
  shape: string;
  material: string;
  /** Apakah tipe ini punya histeresis pada kurva desorpsi */
  hysteresis: boolean;
  note: string;
}

export const ISOTHERM_TYPES: readonly IsothermType[] = [
  {
    id: "I",
    shape: "Naik tajam di P/P₀ rendah, lalu mendatar",
    material: "Mikropori (< 2 nm)",
    hysteresis: false,
    note: "Semua pori terisi pada tekanan sangat rendah; dataran menunjukkan kapasitas mikropori.",
  },
  {
    id: "II",
    shape: "Berbentuk S, tanpa histeresis",
    material: "Tidak berpori atau makropori",
    hysteresis: false,
    note: "Lapisan pertama terbentuk di lutut kurva, lalu lapisan berganda di P/P₀ tinggi.",
  },
  {
    id: "III",
    shape: "Cekung terhadap sumbu P/P₀",
    material: "Interaksi adsorbat-adsorben lemah",
    hysteresis: false,
    note: "Tidak ada lutut yang jelas: molekul lebih suka menumpuk pada molekul lain daripada dinding.",
  },
  {
    id: "IV",
    shape: "Seperti II, ada histeresis",
    material: "Mesopori (2–50 nm)",
    hysteresis: true,
    note: "Lutut = monolayer, kenaikan akhir = kondensasi kapiler di mesopori.",
  },
  {
    id: "V",
    shape: "Seperti III, ada histeresis",
    material: "Mesopori, interaksi lemah",
    hysteresis: true,
    note: "Interaksi dinding lemah namun tetap ada kondensasi kapiler.",
  },
  {
    id: "VI",
    shape: "Berundak",
    material: "Permukaan seragam, adsorpsi lapis demi lapis",
    hysteresis: false,
    note: "Tiap undakan adalah satu lapisan yang selesai sebelum lapisan berikutnya mulai.",
  },
];

/** Kurva sintetis untuk tiap tipe, x = P/P0 (0..1). */
export function iupacVolume(type: IsothermTypeId, x: number, branch: "ads" | "des" = "ads"): number {
  const t = Math.min(1, Math.max(0, x));
  // cabang desorpsi bergeser ke kiri, menciptakan loop histeresis
  const h = branch === "des" ? 0.08 : 0;

  switch (type) {
    case "I":
      return 1 - Math.exp(-34 * t);
    case "II":
      // dinormalkan agar v(1) ≈ 1
      return 0.72 * (t / (0.055 + t)) + 0.32 * Math.pow(t, 5);
    case "III":
      return 0.30 * Math.pow(t, 2.4) + 0.68 * Math.pow(t, 6);
    case "IV": {
      const s = Math.max(0, t - h);
      return 0.72 * (s / (0.075 + s)) + 0.34 * Math.pow(s, 6);
    }
    case "V": {
      const s = Math.max(0, t - h);
      return 0.35 * Math.pow(s, 2.2) + 0.62 * Math.pow(s, 6);
    }
    case "VI": {
      const step = (c: number, w: number) => 1 / (1 + Math.exp(-(t - c) / w));
      return 0.2 * step(0.12, 0.02) + 0.22 * step(0.34, 0.02) + 0.24 * step(0.56, 0.02) + 0.34 * step(0.8, 0.03);
    }
  }
}

/** Titik kurva untuk satu tipe, siap diplot. */
export function iupacCurve(
  type: IsothermTypeId,
  branch: "ads" | "des" = "ads",
  steps = 64,
): { x: number; v: number }[] {
  const pts: { x: number; v: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    pts.push({ x, v: iupacVolume(type, x, branch) });
  }
  return pts;
}

/* ── Model pengisian pori (animasi) ────────────────────────────────────── */

export type PoreSite = {
  x: number;
  y: number;
  /** P/P0 saat situs ini mulai terisi (cabang adsorpsi). */
  threshold: number;
  /** monolayer / multilayer / condensation */
  layer: "mono" | "multi" | "capillary";
};

/**
 * Situs adsorpsi di dalam pori, disusun deterministik: dinding dulu (monolayer),
 * lalu lapisan kedua, lalu pengisian kapiler. Ambang tiap situs naik sesuai
 * urutannya, sehingga fraksi terisi naik mulus terhadap P/P0.
 */
export function poreSites(): PoreSite[] {
  const sites: PoreSite[] = [];
  const rows = 9;
  const channelX0 = 26;
  const channelX1 = 74;
  const inner = [30, 36, 42, 48, 54, 60, 66, 70];

  for (let r = 0; r < rows; r++) {
    const y = 18 + (r * 62) / (rows - 1);

    // monolayer: menempel di kedua dinding
    sites.push({ x: channelX0 + 2, y, threshold: 0.02 + r * 0.004, layer: "mono" });
    sites.push({ x: channelX1 - 2, y, threshold: 0.025 + r * 0.004, layer: "mono" });

    // multilayer: lapisan kedua & ketiga, tumbuh dari dinding ke dalam
    sites.push({ x: channelX0 + 8, y, threshold: 0.12 + r * 0.01, layer: "multi" });
    sites.push({ x: channelX1 - 8, y, threshold: 0.14 + r * 0.01, layer: "multi" });

    // kondensasi kapiler: mengisi bagian tengah pada P/P0 tinggi
    for (let i = 0; i < inner.length; i++) {
      sites.push({
        x: inner[i],
        y,
        threshold: 0.55 + i * 0.045 + r * 0.002,
        layer: "capillary",
      });
    }
  }
  return sites;
}

export const PORE_SITE_COUNT = poreSites().length;

/** Situs yang sudah terisi pada P/P0 tertentu. */
export function filledSites(pp: number, branch: "ads" | "des" = "ads"): PoreSite[] {
  // cabang desorpsi bertahan lebih lama: pengosongan kapiler tertunda
  const shift = branch === "des" ? 0.16 : 0;
  return poreSites().filter((s) => (s.layer === "capillary" ? pp >= s.threshold - shift : pp >= s.threshold));
}

/** Volume teradsorpsi relatif (0..1) dari model yang sama dengan animasi. */
export function poreVolume(pp: number, branch: "ads" | "des" = "ads"): number {
  return filledSites(pp, branch).length / PORE_SITE_COUNT;
}

export function poreCurve(branch: "ads" | "des" = "ads", steps = 80): { x: number; v: number }[] {
  const pts: { x: number; v: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    pts.push({ x, v: poreVolume(x, branch) });
  }
  return pts;
}

/* ── Matematika BET ────────────────────────────────────────────────────── */

export interface BetPoint {
  x: number;
  v: number;
}

export function betTransform(points: readonly BetPoint[]): { x: number; y: number }[] {
  return points.map((p) => ({ x: p.x, y: p.x / (p.v * (1 - p.x)) }));
}

export function linearFit(pts: readonly { x: number; y: number }[]): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = pts.length;
  const sumX = pts.reduce((a, p) => a + p.x, 0);
  const sumY = pts.reduce((a, p) => a + p.y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const p of pts) {
    sxx += (p.x - meanX) ** 2;
    sxy += (p.x - meanX) * (p.y - meanY);
    syy += (p.y - meanY) ** 2;
  }

  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
  return { slope, intercept, r2 };
}

export interface BetResult {
  slope: number;
  intercept: number;
  r2: number;
  /** Volume monolayer, cm3/g STP */
  vm: number;
  /** Konstanta BET */
  c: number;
  /** Luas permukaan spesifik, m2/g */
  surfaceArea: number;
  /** C positif dan intersep positif -> BET dapat dipakai */
  valid: boolean;
  status: string;
}

export function betResult(points: readonly BetPoint[]): BetResult | null {
  if (points.length < 2) return null;
  const fit = linearFit(betTransform(points));
  const vm = 1 / (fit.slope + fit.intercept);
  const c = fit.slope / fit.intercept + 1;
  const areaFactor = (BET_CONSTANTS.avogadro * BET_CONSTANTS.crossSection) / BET_CONSTANTS.molarVolume;
  const surfaceArea = vm * areaFactor;
  const valid = c > 0 && fit.intercept > 0;

  return {
    slope: fit.slope,
    intercept: fit.intercept,
    r2: fit.r2,
    vm,
    c,
    surfaceArea,
    valid,
    status: valid ? "C positif, BET dapat dipakai" : "C negatif, BET tidak valid",
  };
}

/** Titik dalam jendela BET instrumen (0,05–0,30). */
export function withinWindow(points: readonly BetPoint[]): BetPoint[] {
  return points.filter((p) => p.x >= BET_CONSTANTS.windowMin && p.x <= BET_CONSTANTS.windowMax);
}

/* ── Hasil acuan dari panduan (slide 18, 20, 22) ───────────────────────── */

export interface GuideResult {
  sample: string;
  points: number;
  /** Rentang P/P0 titik yang jatuh di jendela BET (slide 10). */
  range: string;
  slope: number;
  intercept: number;
  r2: number;
  vm: number;
  c: number;
  surfaceArea: number;
  valid: boolean;
}

export const GUIDE_RESULTS: readonly GuideResult[] = [
  { sample: "Al-Fum 1:2", points: 7, range: "0,056–0,289", slope: 0.005695, intercept: -0.000113, r2: 0.9953, vm: 179.16, c: -49.19, surfaceArea: 779.8, valid: false },
  { sample: "Al-Fum 1:3", points: 7, range: "0,060–0,289", slope: 0.006539, intercept: -0.000146, r2: 0.9951, vm: 156.4, c: -43.92, surfaceArea: 680.7, valid: false },
  { sample: "Al-Fum 1:4", points: 6, range: "0,081–0,283", slope: 0.009614, intercept: -0.000215, r2: 0.9971, vm: 106.39, c: -43.72, surfaceArea: 463.1, valid: false },
];
/* ── Tutorial Excel (panduan slide 11–15) ─────────────────────────────── */

/**
 * Langkah pengolahan manual di Excel, disalin dari panduan modul.
 * Praktikan mengerjakan ini sendiri, jadi sel dan rumusnya harus persis
 * seperti di panduan — bukan versi yang "kira-kira sama".
 */
export interface ExcelStep {
  id: string;
  title: string;
  intro: string;
  bullets: readonly string[];
  cells?: readonly { cell: string; label: string; formula: string }[];
  basis?: readonly { title: string; cells: readonly { cell: string; label: string; formula: string }[] }[];
}

export const EXCEL_STEPS: readonly ExcelStep[] = [
  {
    id: "siapkan",
    title: "1. Siapkan data di Excel",
    intro: "Konstanta diletakkan di A4:B9, data mentah mulai baris 15.",
    bullets: [
      "Isi konstanta di A4:B9 — kolom A nama besaran, kolom B nilainya.",
      "Baris 14 dijadikan judul kolom: A = P/P₀ adsorpsi, B = V adsorpsi, D = P/P₀ desorpsi, E = V desorpsi.",
      "Tempel data adsorpsi di A15:B dan data desorpsi di D15:E. Jumlah barisnya memang berbeda.",
      "Pastikan angka berformat angka (bukan teks) dan tidak ada sel kosong di tengah data.",
    ],
    cells: [
      { cell: "B4", label: "M N₂ (g/mol)", formula: "28,0134" },
      { cell: "B5", label: "Volume molar STP (cm³/mol)", formula: "22414" },
      { cell: "B6", label: "N (/mol)", formula: "6,0221E+23" },
      { cell: "B7", label: "A_cs (m²)", formula: "1,62E-19" },
      { cell: "B8", label: "Batas bawah P/P₀", formula: "0,05" },
      { cell: "B9", label: "Batas atas P/P₀", formula: "0,3" },
    ],
  },
  {
    id: "plot",
    title: "2. Plot isoterm",
    intro: "Satu grafik memuat cabang adsorpsi dan desorpsi sekaligus.",
    bullets: [
      "Blok A15:B (adsorpsi), lalu Insert > Charts > Scatter with Straight Lines and Markers.",
      "Klik kanan grafik > Select Data > Add. Nama: Desorpsi, X: D15 sampai baris terakhir kolom D, Y: E15 sampai baris terakhir kolom E. Blok hanya sel yang berisi data.",
      "Pastikan data desorpsi dimulai dari titik yang sama dengan adsorpsi terakhir, sehingga kurva menutup sendiri tanpa seri tambahan.",
      "Sumbu X: minimum 0, maksimum 1,05 (ada titik P/P₀ sedikit di atas 1). Sumbu Y: minimum 0.",
      "Judul sumbu: X = P/P₀ dan Y = V teradsorpsi (cm³/g STP). Hapus judul grafik bawaan dan gridline vertikal.",
    ],
  },
  {
    id: "bet",
    title: "3. Siapkan data BET",
    intro: "Hanya titik adsorpsi di dalam jendela 0,05–0,30 yang dipakai.",
    bullets: [
      "Ambil titik adsorpsi dengan P/P₀ antara 0,05 dan 0,30.",
      "Kerjakan dua basis sekaligus (volume dan massa) — hasil luas permukaannya harus sama, jadi keduanya sekaligus menjadi pemeriksaan.",
    ],
    basis: [
      {
        title: "Basis volume",
        cells: [
          { cell: "H16", label: "salin P/P₀ (x)", formula: "" },
          { cell: "I16", label: "salin V", formula: "" },
          { cell: "J16", label: "y = x/[V(1−x)]", formula: "=H16/(I16*(1-H16))" },
        ],
      },
      {
        title: "Basis massa",
        cells: [
          { cell: "M16", label: "salin x", formula: "" },
          { cell: "N16", label: "salin V", formula: "" },
          { cell: "O16", label: "W (g/g)", formula: "=N16/$B$5*$B$4" },
          { cell: "P16", label: "y = x/[W(1−x)]", formula: "=M16/(O16*(1-M16))" },
        ],
      },
    ],
  },
  {
    id: "regresi",
    title: "4. Kurva BET dan regresi",
    intro: "Regresi dihitung dengan fungsi Excel, lalu dicocokkan dengan garis tren.",
    bullets: [
      "Blok H (x) dan J (y) titik BET, lalu Insert > Scatter (hanya titik).",
      "Klik titik data > Chart Elements > Trendline > Linear.",
      "Beri judul sumbu: P/P₀ dan 1/[V(P₀/P − 1)].",
      "Cocokkan slope dan intersep hasil fungsi dengan persamaan trendline pada grafik.",
    ],
    cells: [
      { cell: "I24", label: "n", formula: "=COUNT(H16:H22)" },
      { cell: "I25", label: "Slope (b)", formula: "=SLOPE(J16:J22,H16:H22)" },
      { cell: "I26", label: "Intersep (a)", formula: "=INTERCEPT(J16:J22,H16:H22)" },
      { cell: "I27", label: "R²", formula: "=RSQ(J16:J22,H16:H22)" },
      { cell: "I28", label: "r", formula: "=CORREL(H16:H22,J16:J22)" },
    ],
  },
  {
    id: "hitung",
    title: "5. Hitung Vm, C, dan luas permukaan",
    intro: "Empat sel terakhir; perhatikan faktor luas memakai B5 untuk basis volume.",
    bullets: [
      "Ganti angka 22 pada rentang dengan baris terakhir titik BET Anda.",
      "Pengecekan basis massa: Wm = 1/(N25+N26), C = N25/N26+1, faktor luas = B6*B7/B4, S = N29*N31. Nilainya harus sama dengan basis volume.",
    ],
    cells: [
      { cell: "I29", label: "Vm (cm³/g STP)", formula: "=1/(I25+I26)" },
      { cell: "I30", label: "C", formula: "=I25/I26+1" },
      { cell: "I31", label: "Faktor luas (m² per cm³ STP)", formula: "=B6*B7/B5" },
      { cell: "I32", label: "S BET (m²/g)", formula: "=I29*I31" },
    ],
  },
  {
    id: "validasi",
    title: "6. Periksa validitas",
    intro: "R² bagus belum tentu sah — intersep harus positif.",
    bullets: [
      "R² dan r mendekati 1.",
      "Intersep (a) harus positif, sehingga C = b/a + 1 juga positif.",
      "Jika C negatif: luas permukaan tetap dihitung dan dicatat, tetapi dilaporkan tidak valid, lalu jelaskan kemungkinan penyebabnya.",
      "Pakai titik adsorpsi (bukan desorpsi), sumbu x P/P₀ (bukan P), dan V dalam cm³/g STP.",
    ],
    cells: [
      {
        cell: "I33",
        label: "Status",
        formula: '=IF(I30<=0,"C negatif, BET tidak valid","C positif, BET dapat dipakai")',
      },
    ],
  },
];


/** Kolom data yang diberikan kepada praktikan (slide 10). */
export const GIVEN_COLUMNS: readonly { column: string; content: string; unit: string }[] = [
  { column: "P/P₀ adsorpsi", content: "Tekanan relatif adsorpsi", unit: "tanpa satuan" },
  { column: "V adsorpsi", content: "Volume N₂ teradsorpsi", unit: "cm³/g STP" },
  { column: "P/P₀ desorpsi", content: "Tekanan relatif desorpsi", unit: "tanpa satuan" },
  { column: "V desorpsi", content: "Volume N₂ pada jalur desorpsi", unit: "cm³/g STP" },
];

/** Pertanyaan penutup (slide 24). */
export const CONCLUSION_QUESTIONS: readonly string[] = [
  "Termasuk tipe isoterm apa sampel Anda, dan bagaimana karakter porinya?",
  "Apakah ada histeresis? Apa penyebabnya?",
  "Apakah C positif? Apakah luas permukaan BET valid?",
];

/** Kisi-kisi laporan (panduan slide 25). */
export const REPORT_GRID: readonly string[] = [
  "Isoterm adsorpsi-desorpsi N₂ sampel (data diberikan).",
  "Klasifikasi tipe isoterm menurut IUPAC dan kaitannya dengan struktur pori.",
  "Penentuan luas permukaan spesifik dari kurva BET.",
  "Analisis nilai C dan maknanya terhadap interaksi adsorbat-adsorben.",
  "Kaitan luas permukaan dengan sifat Al-Fum sebagai adsorben atau katalis.",
];

/** Kesalahan yang paling sering terjadi (panduan slide 23). */
export const COMMON_TRAPS: readonly string[] = [
  "Pakai titik adsorpsi untuk BET, bukan titik desorpsi.",
  "Gunakan P/P₀, bukan tekanan P; V dalam cm³/g STP.",
  "Jumlah titik BET berbeda tiap sampel (6 atau 7).",
];
