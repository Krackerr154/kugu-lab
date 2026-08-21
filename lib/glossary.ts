// Glossary terms — Indonesian primary, English scientific in parentheses

export interface GlossaryTerm {
  term: string;
  english?: string;
  definition: string;
  module?: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  { term: "Kation", english: "Cation", definition: "Ion bermuatan positif yang terbentuk saat atom kehilangan elektron.", module: "M1" },
  { term: "Anion", english: "Anion", definition: "Ion bermuatan negatif yang terbentuk saat atom menerima elektron.", module: "M1" },
  { term: "Endapan", english: "Precipitate", definition: "Padatan yang terbentuk dan terpisah dari larutan akibat reaksi kimia.", module: "M1" },
  { term: "Kelarutan", english: "Solubility", definition: "Jumlah maksimum zat terlarut dalam pelarut pada kesetimbangan pada suhu tertentu.", module: "M1" },
  { term: "Persamaan ion netto", english: "Net ionic equation", definition: "Persamaan reaksi yang hanya menunjukkan spesies yang berubah secara kimia.", module: "M1" },
  { term: "Ion kompleks", english: "Complex ion", definition: "Ion pusat logam yang dikelilingi ligan dalam koordinasi tertentu.", module: "M1" },
  { term: "Asam/basa", english: "Acid/base", definition: "Asam adalah donor proton (H+); basa adalah akseptor proton.", module: "M1" },
  { term: "Redoks", english: "Redox", definition: "Reaksi yang melibatkan transfer elektron antara spesies (reduksi-oksidasi).", module: "M1" },
  { term: "Fotokatalisis", english: "Photocatalysis", definition: "Percepatan reaksi fotokimia oleh katalis yang menyerap cahaya.", module: "M2" },
  { term: "Band gap", definition: "Rentang energi dimana tidak ada keadaan elektronik yang dapat ditempati; menentukan absorpsi cahaya semikonduktor.", module: "M2" },
  { term: "Sonokimia", english: "Sonochemistry", definition: "Pemanfaatan gelombang ultrasonik dalam larutan untuk menyebabkan kavitasi dan reaksi kimia.", module: "M2" },
  { term: "Elektrodeposisi", english: "Electrodeposition", definition: "Proses pelapisan logam pada elektroda menggunakan arus listrik dalam larutan elektrolit.", module: "M3" },
  { term: "Anoda", english: "Anode", definition: "Elektroda tempat oksidasi terjadi; dalam sel elektrolisis, elektroda positif.", module: "M3" },
  { term: "Katoda", english: "Cathode", definition: "Elektroda tempat reduksi terjadi; dalam sel elektrolisis, elektroda negatif.", module: "M3" },
  { term: "Efisiensi arus", english: "Current efficiency", definition: "Rasio massa aktual yang diendapkan terhadap massa teoretis berdasarkan hukum Faraday.", module: "M3" },
  { term: "Rapat arus", english: "Current density", definition: "Arus per satuan luas area elektroda (A/cm²).", module: "M3" },
  { term: "Zeolit", english: "Zeolite", definition: "Aluminosilikat mikropori kristalin dari tetrahedra [SiO4]4- dan [AlO4]5- yang saling terhubung.", module: "M4" },
  { term: "Hidrotermal", english: "Hydrothermal", definition: "Metode sintesis menggunakan larutan akuatik pada suhu dan tekanan di atas kondisi ambien.", module: "M4" },
  { term: "FAU", definition: "Kode struktur zeolit faujasite (termasuk zeolit X dan Y) dengan rasio Si/Al bervariasi.", module: "M4" },
  { term: "Nukleasi", english: "Nucleation", definition: "Pembentukan inti kristal pertama dari fase baru dalam larutan.", module: "M4" },
  { term: "Difraksi sinar-X", english: "XRD (X-ray diffraction)", definition: "Teknik karakterisasi yang mengukur pola difraksi sinar-X untuk menentukan struktur kristal.", module: "M5" },
  { term: "Hukum Bragg", english: "Bragg's law", definition: "nλ = 2d sin θ; menghubungkan panjang gelombang, jarak bidang kristal, dan sudut difraksi.", module: "M5" },
  { term: "FWHM", english: "Full width at half maximum", definition: "Lebar puncak pada setengah intensitas maksimum; digunakan dalam perhitungan ukuran kristalit.", module: "M5" },
  { term: "Persamaan Scherrer", english: "Scherrer equation", definition: "D = Kλ / (β cos θ); mengestimasi ukuran kristalit dari pelebaran puncak difraksi (K = 0.9).", module: "M5" },
  { term: "Kristalinitas", english: "Crystallinity", definition: "Derajat struktur kristal dalam material; diukur dari rasio area puncak kristalin terhadap total area.", module: "M5" },
  { term: "Termogravimetri", english: "TGA (Thermogravimetric analysis)", definition: "Teknik analisis yang mengukur perubahan massa sampel selama pemanasan terprogram.", module: "M6" },
  { term: "DTG", english: "Derivative thermogravimetry", definition: "Turunan dari kurva TGA terhadap suhu/waktu; menunjukkan laju kehilangan massa.", module: "M6" },
  { term: "Onset", definition: "Suhu awal terjadinya proses (mis. dekomposisi) pada termogram.", module: "M6" },
];
