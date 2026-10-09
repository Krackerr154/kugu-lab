import type { M3StageId, ReviewSlideId } from "@/lib/m3-presentation";

export type EmbeddedComponentType =
  | "electrodeposition-diagram"
  | "potential-gap"
  | "complexing-effect"
  | "electrolyte-solutions"
  | "faraday-calculation"
  | "report-format"
  | "games";

export interface DeckRubric {
  code: string;
  label: string;
  points?: number;
}

export interface ReviewDeckSlide {
  id: ReviewSlideId;
  chapter: M3StageId;
  chapterLabel: string;
  label: string;
  title: string;
  kind: "content" | "data" | "closing";
  bullets: string[];
  script: string;
  pedagogicalNotes?: string;
  rubric?: DeckRubric;
  embeddedComponent?: EmbeddedComponentType;
  initialView?: "solutions" | "sequence";
}

export const REVIEW_DECK_SLIDES: readonly ReviewDeckSlide[] = [
  // ── BAB 1: TUJUAN PRAKTIKUM ────────────────────────────────────────────────
  {
    id: "p1",
    chapter: "brief",
    chapterLabel: "Tujuan Praktikum",
    label: "Pembuka & Tujuan",
    title: "Tujuan & Output Praktikum",
    kind: "content",
    bullets: [
      "Tujuan: mensintesis paduan biner Sn–Bi pada katoda plat Cu secara kodeposisi serentak dari elektrolit asam.",
      "Output 1: katoda plat tembaga berlapis deposit paduan Sn–Bi yang kompak dan merata.",
      "Output 2: data penimbangan massa sebelum dan sesudah deposisi beserta nilai efisiensi arus.",
    ],
    script:
      "Selamat datang di sesi review. Kita sudah selesai praktikum di laboratorium, sekarang kita bahas apa yang tadi dikerjakan — dari tujuan, teori elektrokimia, data angka kalian, sampai cara menulisnya terstruktur di laporan resmi. Ingat, produk akhir kalian hari ini bukan cuma pelat tembaga yang berubah warna — tetapi juga angka efisiensi arus hasil penimbangan.",
    pedagogicalNotes:
      "Slide ini menetapkan kontrak sesi sekaligus tujuan. Pastikan praktikan memahami bahwa output akhir dari sesi ini adalah kesiapan menulis laporan praktikum.",
    rubric: {
      code: "c",
      label: "Tujuan Praktikum",
      points: 10,
    },
  },
  {
    id: "p2",
    chapter: "brief",
    chapterLabel: "Tujuan Praktikum",
    label: "Urutan kerja",
    title: "Apa Saja yang Tadi Dikerjakan",
    kind: "content",
    bullets: [
      "Penyolderan: Penggoresan & penyolderan kawat 15 cm pada plat Cu.",
      "Uji Kontinuitas: Uji sambungan kawat dengan multimeter/amperemeter.",
      "Proteksi Resin: Pengecoran resin pelindung katoda & pengeringan 2 × 24 jam.",
      "Preparasi Larutan: Penyiapan anoda karbon & peracikan 100 mL elektrolit (A + B + C).",
      "Elektrodeposisi: Rangkaian sel DC, kodeposisi, pencucian, pengeringan, & penimbangan.",
    ],
    script:
      "Kita urutkan kembali alur kerja fisik tadi agar kalian dapat menuliskannya secara runtut di laporan. Titik kritis yang sering luput adalah uji kontinuitas setelah penyolderan sebelum pengecoran resin.",
    pedagogicalNotes:
      "Uji kontinuitas adalah gerbang mutu awal: solderan yang rapuh atau putus di dalam resin akan menyebabkan sel gagal bekerja saat dialiri arus.",
    rubric: {
      code: "f.1",
      label: "Deskripsi Proses Sintesis",
      points: 35,
    },
  },

  // ── BAB 2: PEMBAHASAN ──────────────────────────────────────────────────────
  {
    id: "p3",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Mengapa paduan",
    title: "Mengapa Paduan Sn–Bi, Bukan Logam Murni",
    kind: "content",
    bullets: [
      "Paduan memiliki ketahanan korosi dan kekuatan mekanik yang lebih baik dibandingkan logam murni penyusunnya.",
      "Komposisi eutektik Sn-58Bi meleleh pada suhu ~139 °C, jauh lebih rendah daripada solder Sn-Pb konvensional (~183 °C).",
      "Alternatif solder ramah lingkungan bebas timbal (lead-free) yang memenuhi standar regulasi internasional RoHS.",
    ],
    script:
      "Ini alasan mendasar mengapa kita merekayasa paduan Sn–Bi dan bukan hanya logam murni timah atau bismut saja. Eutektik Sn-58Bi meleleh pada suhu sangat rendah (sekitar 139 °C) dan aman tanpa timbal.",
    rubric: {
      code: "f.1",
      label: "Latar Belakang & Rasionalisasi Paduan",
      points: 35,
    },
  },
  {
    id: "p4",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Definisi elektrodeposisi",
    title: "Apa itu Elektrodeposisi?",
    kind: "content",
    bullets: [
      "Definisi: Pengendapan lapisan logam atau paduan pada katoda melalui reduksi kation dari larutan elektrolit oleh arus DC.",
      "Reaksi Katoda: Elektron mereduksi kation di permukaan elektroda: Mⁿ⁺ + ne⁻ → M⁰ (lapisan paduan Sn–Bi pada plat Cu).",
      "Komponen Sel: Katoda kerja (plat Cu), anoda inert (batang C), larutan elektrolit (Sn²⁺ & Bi³⁺), dan catu daya DC.",
    ],
    script:
      "Elektrodeposisi pada dasarnya adalah proses pelapisan material secara elektrokimia. Arus searah (DC) menyuplai elektron ke katoda plat Cu kalian, sehingga kation timah dan bismut di larutan tereduksi dari fasa cair menjadi lapisan paduan padat di permukaan elektroda.",
    pedagogicalNotes:
      "Menekankan bahwa elektrodeposisi membutuhkan 4 komponen serentak: katoda (tempat reduksi), anoda (tempat oksidasi), larutan elektrolit (penghantar ionik), dan sirkuit eksternal DC (penyedia elektron).",
    embeddedComponent: "electrodeposition-diagram",
    rubric: {
      code: "f.1",
      label: "Prinsip Elektrodeposisi",
      points: 35,
    },
  },
  {
    id: "p5",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Selisih potensial",
    title: "Selisih Potensial Menghambat Kodeposisi",
    kind: "content",
    bullets: [
      "Potensial reduksi standar: Bi³⁺/Bi = +0,31 V, sedangkan Sn²⁺/Sn = −0,14 V (vs SHE).",
      "Selisih potensial standar sangat besar: ΔE° ≈ 0,45 V.",
      "Tanpa intervensi kimia, ion Bi³⁺ yang lebih mulia akan tereduksi jauh lebih awal dan mendominasi deposit katoda.",
      "Kodeposisi serentak tidak mungkin tercapai dalam larutan garam murni tanpa pengompleks.",
    ],
    script:
      "Ini kesulitan utama modul praktikum kita. Bismut dan timah memiliki selisih potensial reduksi sebesar 0,45 Volt. Secara termodinamika alami, bismut akan habis tereduksi duluan sebelum timah sempat mengendap.",
    pedagogicalNotes:
      "Ini adalah slide konsep paling inti di bab Pembahasan. Luangkan waktu agar mahasiswa memahami mengapa larutan elektrolit tidak bisa sesederhana mencampur garam Sn dan Bi.",
    embeddedComponent: "potential-gap",
    rubric: {
      code: "f.1",
      label: "Inti Pembahasan — Termodinamika Reduksi",
      points: 35,
    },
  },
  {
    id: "p6",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Pengompleks",
    title: "Mengapa Perlu Agen Pengompleks",
    kind: "content",
    bullets: [
      "Agen pengompleks (EDTA & asam sitrat) mengikat kation logam membentuk senyawa kompleks kelat.",
      "Kompleksasi menurunkan aktivitas kation bebas dan menggeser potensial reduksi ke arah yang lebih negatif.",
      "Penggeseran potensial pada Bi³⁺ jauh lebih besar daripada Sn²⁺, sehingga potensial deposisi efektif menjadi berdekatan.",
      "Kodeposisi serentak kedua ion akhirnya dapat berlangsung pada rentang potensial yang sama.",
    ],
    script:
      "Agen pengompleks bertindak sebagai penyeimbang termodinamika. EDTA dan sitrat mengikat ion bismut lebih kuat dan menarik potensial reduksi efektifnya mendekati timah sehingga keduanya dapat mengendap serentak.",
    embeddedComponent: "complexing-effect",
    rubric: {
      code: "f.2",
      label: "Peran Agen Pengompleks",
      points: 35,
    },
  },
  {
    id: "p7",
    chapter: "understand",
    chapterLabel: "Pembahasan",
    label: "Larutan A/B/C",
    title: "Fungsi Larutan A, B, dan C",
    kind: "content",
    bullets: [
      "Larutan A: Persiapan pengompleks EDTA dalam media basa (NH₃) agar terdeprotonasi dan larut sempurna.",
      "Larutan B: Sumber kation logam Sn²⁺ (dari SnCl₂·2H₂O) dan Bi³⁺ (dari Bi(NO₃)₃) dalam suasana asam HCl.",
      "Larutan C: Pengompleks pendamping (asam sitrat) sekaligus penyangga keasaman larutan (buffer pH ~2).",
    ],
    script:
      "Ini pertanyaan yang hampir selalu diujikan dan wajib ada di laporan: Larutan A untuk persiapan pengompleks EDTA, Larutan B sebagai sumber ion logam, dan Larutan C sebagai pengompleks pendamping serta penyangga.",
    embeddedComponent: "electrolyte-solutions",
    initialView: "solutions",
    rubric: {
      code: "f.2",
      label: "Fungsi Setiap Komponen Elektrolit (Wajib)",
      points: 35,
    },
  },

  // ── BAB 3: PENGOLAHAN DATA ─────────────────────────────────────────────────
  {
    id: "p8",
    chapter: "prove",
    chapterLabel: "Pengolahan Data",
    label: "Rumus",
    title: "Dari Arus ke Massa ke Efisiensi",
    kind: "content",
    bullets: [
      "Langkah 1: Hitung total muatan listrik yang mengalir: Q = I × t (Coulomb).",
      "Langkah 2: Hitung massa teoritis paduan Sn–Bi (1:1 mol): m_teoritis = (Q × (M_Sn + M_Bi)) / ((n_Sn + n_Bi) × F).",
      "Langkah 3: Hitung efisiensi arus: η = (m_aktual / m_teoritis) × 100%.",
    ],
    script:
      "Alur matematis pengolahan data harus runtut di laporan: hitung total muatan Q terlebih dahulu, tentukan massa teoritis paduan Sn–Bi rasio 1:1 mol dengan membagi terhadap transfer elektron gabungan (n_Sn + n_Bi = 2 + 3 = 5), baru kemudian bandingkan dengan massa aktual hasil timbangan.",
    embeddedComponent: "faraday-calculation",
    rubric: {
      code: "e",
      label: "Pengolahan Data & Rumus Perhitungan",
      points: 15,
    },
  },

  // ── BAB 4: FORMAT LAPORAN & PENUTUP ────────────────────────────────────────
  {
    id: "p9",
    chapter: "ready",
    chapterLabel: "Format Laporan",
    label: "Format laporan",
    title: "Format & Rubrik Laporan (100 Poin)",
    kind: "content",
    bullets: [
      "Struktur laporan resmi (100 poin): Sampul (5), Judul (5), Tujuan (10), Data Pengamatan (15), Pengolahan Data (15), Pembahasan (35), Kesimpulan (10), Daftar Pustaka (5).",
      "Bagian Pembahasan memiliki bobot terbesar: 35 Poin.",
      "Pastikan mencakup poin f.1 (deskripsi proses), f.2 (fungsi larutan A/B/C), f.3 (reaksi katoda), dan f.4 (analisis efisiensi arus).",
    ],
    script:
      "Bagian Pembahasan memiliki porsi nilai paling besar: 35 poin. Semua yang kita kupas tuntas hari ini — beda potensial, peran pengompleks, hingga analisis efisiensi arus — adalah jawaban untuk bagian Pembahasan tersebut.",
    embeddedComponent: "report-format",
    rubric: {
      code: "seluruh",
      label: "Rubrik Penilaian Laporan Lengkap (100 Poin)",
      points: 100,
    },
  },
  {
    id: "p10",
    chapter: "ready",
    chapterLabel: "Format Laporan",
    label: "Penutup",
    title: "Selesai Review — Lanjut Games",
    kind: "closing",
    bullets: [
      "Review materi Modul 4 telah selesai dipaparkan.",
      "Kuis diagnostik konsep: 5 soal acak dari bank 8 soal disetujui kurikulum.",
      "Sistem penilaian berbasis keyakinan (Yakin, Ragu, Tebak) tanpa penalti kecepatan.",
      "Peringkat 3 teratas akan ditampilkan di papan skor akhir.",
    ],
    script:
      "Sekian review praktikum Modul 4 hari ini. Sekarang kita masuk ke sesi seru-seruan games untuk menguji pemahaman konsep sebelum kalian mulai menyusun laporan.",
    embeddedComponent: "games",
  },
] as const;

export const REVIEW_DECK_SLIDE_BY_ID: Readonly<Record<ReviewSlideId, ReviewDeckSlide>> =
  Object.freeze(
    Object.fromEntries(REVIEW_DECK_SLIDES.map((s) => [s.id, s])) as Record<
      ReviewSlideId,
      ReviewDeckSlide
    >
  );

export const TOTAL_REVIEW_DECK_SLIDES = REVIEW_DECK_SLIDES.length;

export const deckSlideIndex = (id: ReviewSlideId): number =>
  REVIEW_DECK_SLIDES.findIndex((s) => s.id === id);

export const nextDeckSlideId = (id: ReviewSlideId): ReviewSlideId | null => {
  const i = deckSlideIndex(id);
  return i >= 0 && i < TOTAL_REVIEW_DECK_SLIDES - 1 ? REVIEW_DECK_SLIDES[i + 1].id : null;
};

export const prevDeckSlideId = (id: ReviewSlideId): ReviewSlideId | null => {
  const i = deckSlideIndex(id);
  return i > 0 ? REVIEW_DECK_SLIDES[i - 1].id : null;
};
