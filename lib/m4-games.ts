// Review-session Games: question bank + pure scoring/selection logic (Phase 5).
//
// Framework-free so the server (authoritative scoring) and the browser (asprak
// preview, student self-check display) run the SAME functions. No React, no I/O.
//
// Design decisions locked by the user:
//  - 8 approved questions; 5 drawn at random per session, order shuffled.
//  - Individual scoring (snack for top scorer); NO speed component.
//  - Staked confidence (Certainty-Based Marking): Yakin/Ragu/Tebak.
//  - Reveal at END only; top 3 public, everyone sees their own score.
//  - Tie for the top → sudden death: ONE random question from the 3 UNUSED.
//
// Chemistry mirrors the module page / penuntun. Any Sn–Bi stoichiometric claim
// a student might contest is kept to the approved question set and framed as the
// course's accepted answer, not invented here.

export type Confidence = "yakin" | "ragu" | "tebak";

export interface GameQuestion {
  id: string;
  /** Rubric/teaching tag for the asprak's misconception map. */
  topic: string;
  prompt: string;
  options: readonly string[]; // exactly 4
  correctIndex: number;       // 0..3
  explanation: string;
}

// Confidence payout table (Gardner-Medwin CBM). Wrong + Tebak = 0 so honest
// ignorance is never punished; confident error costs the most.
export const CONFIDENCE_POINTS: Readonly<Record<Confidence, { correct: number; wrong: number }>> = Object.freeze({
  yakin: { correct: 3, wrong: -2 },
  ragu: { correct: 2, wrong: -1 },
  tebak: { correct: 1, wrong: 0 },
});

export const CONFIDENCES: readonly Confidence[] = ["yakin", "ragu", "tebak"] as const;

export function isConfidence(x: unknown): x is Confidence {
  return typeof x === "string" && (CONFIDENCES as readonly string[]).includes(x);
}

/** Points for one answer. No time term by design. */
export function scoreAnswer(correct: boolean, confidence: Confidence): number {
  const row = CONFIDENCE_POINTS[confidence];
  return correct ? row.correct : row.wrong;
}

// The 8 approved questions. Order here is the canonical bank order; a session
// shuffles a random 5 of these and keeps the other 3 as the sudden-death pool.
export const GAME_QUESTION_BANK: readonly GameQuestion[] = [
  {
    id: "q-alloy",
    topic: "Mengapa paduan Sn–Bi",
    prompt: "Mengapa praktikum ini menargetkan paduan Sn–Bi, bukan logam timah murni?",
    options: [
      "Paduan eutektik Sn–58Bi meleleh ~139 °C, jauh di bawah solder timbal konvensional",
      "Timah murni tidak dapat dielektrodeposisi pada substrat tembaga",
      "Bismut jauh lebih murah daripada timah sehingga menekan biaya",
      "Paduan selalu menghantarkan listrik lebih baik daripada logam murni",
    ],
    correctIndex: 0,
    explanation:
      "Tujuannya solder bebas timbal bertitik leleh rendah: komposisi eutektik Sn–58Bi meleleh pada ~139 °C, memenuhi kebutuhan RoHS.",
  },
  {
    id: "q-potential",
    topic: "Selisih potensial / kodeposisi",
    prompt: "Apa tantangan utama saat mengendapkan Sn dan Bi secara bersamaan (kodeposisi)?",
    options: [
      "Selisih potensial reduksi keduanya cukup besar (~0,45 V) sehingga satu logam cenderung mengendap lebih dulu",
      "Potensial reduksi keduanya identik sehingga mustahil dipisahkan",
      "Keduanya tidak larut dalam air sama sekali",
      "Keduanya menghasilkan gas alih-alih logam di katoda",
    ],
    correctIndex: 0,
    explanation:
      "ΔE° ≈ 0,45 V antara Sn²⁺/Sn dan Bi³⁺/Bi. Tanpa pengompleks, Bi mengendap lebih dulu; itulah sebabnya agen pengompleks diperlukan untuk mendekatkan potensial efektif.",
  },
  {
    id: "q-ammonia",
    topic: "Urutan pencampuran (NH₃ sebelum EDTA)",
    prompt: "Mengapa amonia (NH₃) ditambahkan sebelum EDTA saat meracik larutan pengompleks?",
    options: [
      "NH₃ menaikkan pH sehingga EDTA terdeprotonasi, larut, dan aktif mengompleks",
      "NH₃ bereaksi langsung dengan tembaga substrat",
      "NH₃ menurunkan suhu larutan agar EDTA stabil",
      "NH₃ mengoksidasi EDTA menjadi bentuk aktifnya",
    ],
    correctIndex: 0,
    explanation:
      "EDTA sukar larut dalam bentuk terprotonasi. NH₃ menaikkan pH lebih dulu agar EDTA terdeprotonasi, larut sempurna, dan dapat membentuk kompleks logam.",
  },
  {
    id: "q-hcl",
    topic: "Peran HCl pada larutan garam",
    prompt: "Apa peran HCl dalam larutan garam logam (larutan B)?",
    options: [
      "Menjaga suasana asam agar Sn²⁺ dan Bi³⁺ tidak terhidrolisis menjadi hidroksida/oksida",
      "Menyumbang ion klorida sebagai pereduksi utama logam",
      "Melarutkan PEG400 yang bersifat nonpolar",
      "Menetralkan amonia yang terbawa dari larutan pengompleks",
    ],
    correctIndex: 0,
    explanation:
      "Dalam suasana kurang asam, Sn²⁺/Bi³⁺ mudah terhidrolisis dan mengendap. HCl menjaga keasaman sehingga ion logam tetap terlarut dan siap direduksi.",
  },
  {
    id: "q-charge",
    topic: "Perhitungan muatan Q = I·t",
    prompt: "Pada titik kerja protokol (I = 0,058 A; t = 900 s), berapa muatan listrik Q yang mengalir?",
    options: ["52,2 C", "0,0644 C", "15,5 C", "155 C"],
    correctIndex: 0,
    explanation: "Q = I × t = 0,058 A × 900 s = 52,2 coulomb. Ini angka awal sebelum menghitung massa teoretis.",
  },
  {
    id: "q-efficiency",
    topic: "Efisiensi > 100%",
    prompt: "Sebuah kelompok memperoleh efisiensi arus 112%. Interpretasi yang benar adalah…",
    options: [
      "Menandakan galat (bilas/pengeringan kurang, salah timbang, atau asumsi stoikiometri), bukan keunggulan",
      "Elektrodeposisi berjalan melampaui batas Hukum Faraday",
      "Arus yang dipakai terlalu kecil dari seharusnya",
      "Massa molar yang dipakai terlalu besar sehingga wajar",
    ],
    correctIndex: 0,
    explanation:
      "Hukum Faraday adalah batas atas: muatan hanya mampu mereduksi sejumlah tertentu ion. η > 100% selalu menandakan galat — paling sering garam elektrolit yang belum terbilas ikut tertimbang.",
  },
  {
    id: "q-peg",
    topic: "Peran PEG400",
    prompt: "Apa peran PEG400 dalam larutan elektrolit?",
    options: [
      "Pengatur morfologi / perata permukaan deposit — bukan agen pengompleks",
      "Agen pengompleks utama ion Sn²⁺ dan Bi³⁺",
      "Sumber tambahan ion logam untuk deposit",
      "Penurun pH agar larutan tetap asam",
    ],
    correctIndex: 0,
    explanation:
      "PEG400 adalah aditif perata (leveler) yang menghaluskan morfologi deposit dan menekan pertumbuhan dendrit. Ia BUKAN pengompleks seperti EDTA atau asam sitrat.",
  },
  {
    id: "q-ph",
    topic: "Langkah akhir penyiapan larutan",
    prompt: "Apa langkah terakhir saat menyiapkan larutan elektrolit gabungan sebelum dipakai?",
    options: [
      "Memeriksa dan menyetel pH larutan hingga ~2",
      "Memanaskan larutan hingga mendidih",
      "Menyaring larutan dengan kertas saring",
      "Mengencerkan larutan hingga tepat 1 liter",
    ],
    correctIndex: 0,
    explanation:
      "Langkah akhir adalah memastikan pH ~2. Keasaman ini menjaga ion logam tetap stabil (tak terhidrolisis) dan memberi kondisi deposisi yang sesuai protokol.",
  },
] as const;

export const GAME_BANK_IDS: readonly string[] = GAME_QUESTION_BANK.map((q) => q.id);
export const GAME_QUESTION_BY_ID: Readonly<Record<string, GameQuestion>> = Object.freeze(
  Object.fromEntries(GAME_QUESTION_BANK.map((q) => [q.id, q]))
);

export const GAME_ROUND_SIZE = 5; // questions played per session
export const GAME_SUDDEN_DEATH_POOL = GAME_QUESTION_BANK.length - GAME_ROUND_SIZE; // = 3

/** Fisher–Yates shuffle using an injectable RNG (default Math.random). */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface RoundSelection {
  /** The 5 question ids to play, in shuffled order. */
  playedIds: string[];
  /** The 3 unused ids — the sudden-death pool. */
  reservedIds: string[];
}

/** Pick 5 of 8 at random (shuffled order); reserve the other 3. */
export function selectRound(rng: () => number = Math.random): RoundSelection {
  const shuffled = shuffle(GAME_BANK_IDS, rng);
  return {
    playedIds: shuffled.slice(0, GAME_ROUND_SIZE),
    reservedIds: shuffled.slice(GAME_ROUND_SIZE),
  };
}

/** Pick one sudden-death question id from the reserved pool. */
export function pickSuddenDeath(reservedIds: readonly string[], rng: () => number = Math.random): string | null {
  if (reservedIds.length === 0) return null;
  return reservedIds[Math.floor(rng() * reservedIds.length)];
}

/** A question with the correct answer stripped — safe to send before reveal. */
export interface PublicQuestion {
  id: string;
  topic: string;
  prompt: string;
  options: readonly string[];
  index: number;   // 1-based position in the round
  total: number;
}

export function toPublicQuestion(q: GameQuestion, index: number, total: number): PublicQuestion {
  return { id: q.id, topic: q.topic, prompt: q.prompt, options: q.options, index, total };
}
