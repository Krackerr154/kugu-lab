// Authoritative review-session slide list for Module 4 (Sn–Bi electrodeposition).
//
// A slide is a WAYPOINT, not a fixed-size box: a content slide names an existing
// DOM anchor (data-review-anchor="<anchor>") that the student view scrolls to and
// frames. No module content is duplicated here, so the course-approved chemistry
// numbers cannot drift out of a second rendering.
//
// The id↔chapter mapping is mirrored in shared/m3-contract.mjs (REVIEW_SLIDE_CHAPTER)
// so the relay can enforce slideId↔stageId consistency; the test in
// tests/unit/m4-review-slides.test.mjs asserts the two never diverge.
//
// Slide kinds:
//   "content" — frames an existing module anchor (asprak talks, students read)
//   "data"    — the class's measured numbers (asprak enters 3 groups; Phase 4 UI)
//   "closing" — session wrap + hand-off to Games (Phase 5 UI)
import type { M3StageId, ReviewSlideId } from "@/lib/m3-presentation";

export type ReviewSlideKind = "content" | "data" | "closing";

export interface ReviewSlide {
  id: ReviewSlideId;
  chapter: M3StageId;
  /** Short rail label. */
  label: string;
  /** Full title shown in the slide chrome. */
  title: string;
  kind: ReviewSlideKind;
  /** data-review-anchor target for content slides. Omitted for data/closing. */
  anchor?: string;
  /** Rubric point(s) this slide supports, for the "Untuk laporan" footer. */
  rubric?: string;
}

export const REVIEW_SLIDES: readonly ReviewSlide[] = [
  // ── PEMBUKA ────────────────────────────────────────────────────────────
  { id: "p1", chapter: "brief", label: "Pembuka", title: "Review Praktikum Modul 4 — Sintesis Paduan Sn–Bi", kind: "content", anchor: "review-brief-intro" },

  // ── TUJUAN PRAKTIKUM ─────────────────────────────────────────────────────
  { id: "p2", chapter: "brief", label: "Tujuan", title: "Tujuan & Keluaran Praktikum", kind: "content", anchor: "review-brief-intro", rubric: "c" },
  { id: "p3", chapter: "brief", label: "Urutan kerja", title: "Apa Saja yang Tadi Dikerjakan", kind: "content", anchor: "review-brief-actions", rubric: "f.1" },

  // ── PEMBAHASAN ───────────────────────────────────────────────────────────
  { id: "p4", chapter: "understand", label: "Mengapa paduan", title: "Mengapa Paduan Sn–Bi, Bukan Logam Murni", kind: "content", anchor: "review-why-alloy", rubric: "f.1" },
  { id: "p5", chapter: "understand", label: "Prinsip deposisi", title: "Bagaimana Arus Membentuk Lapisan", kind: "content", anchor: "review-why-alloy", rubric: "f.1" },
  { id: "p6", chapter: "understand", label: "Selisih potensial", title: "Selisih Potensial Menghambat Kodeposisi", kind: "content", anchor: "review-potential-gap", rubric: "f.1" },
  { id: "p7", chapter: "understand", label: "Pengompleks", title: "Mengapa Perlu Agen Pengompleks", kind: "content", anchor: "review-potential-gap", rubric: "f.2" },
  { id: "p8", chapter: "understand", label: "Larutan A/B/C", title: "Fungsi Larutan A, B, dan C", kind: "content", anchor: "review-electrolyte", rubric: "f.2" },
  { id: "p9", chapter: "understand", label: "Pencampuran", title: "Urutan Pencampuran A + B + C", kind: "content", anchor: "review-electrolyte", rubric: "f.1, f.2" },
  { id: "p10", chapter: "understand", label: "Sel elektrokimia", title: "Sel Elektrokimia yang Kalian Rangkai", kind: "content", anchor: "review-cell", rubric: "f.1, f.3" },

  // ── PENGOLAHAN DATA ──────────────────────────────────────────────────────
  { id: "p11", chapter: "prove", label: "Rumus", title: "Dari Arus ke Massa ke Efisiensi", kind: "content", anchor: "review-formulas", rubric: "e" },
  { id: "p12", chapter: "prove", label: "Data kelompok", title: "Data Kelompok", kind: "data", rubric: "d" },
  { id: "p13", chapter: "prove", label: "Efisiensi kelas", title: "Efisiensi Arus Kelompok", kind: "data", rubric: "f.4" },
  { id: "p14", chapter: "prove", label: "H₂ samping", title: "Reaksi Samping Hidrogen", kind: "content", anchor: "review-efficiency-notes", rubric: "f.4" },
  { id: "p15", chapter: "prove", label: ">100%", title: "Bila Hasil Melebihi 100%", kind: "content", anchor: "review-efficiency-notes", rubric: "f.4, h" },
  { id: "p16", chapter: "prove", label: "Asumsi Sn–Bi", title: "Asumsi yang Harus Dikonfirmasi", kind: "content", anchor: "review-assumptions", rubric: "f.4, h" },

  // ── FORMAT LAPORAN ───────────────────────────────────────────────────────
  { id: "p17", chapter: "ready", label: "Format laporan", title: "Format & Rubrik Laporan (100 Poin)", kind: "content", anchor: "review-report-format", rubric: "seluruh" },

  // ── PENUTUP ──────────────────────────────────────────────────────────────
  { id: "p18", chapter: "ready", label: "Penutup", title: "Selesai Review — Lanjut Games", kind: "closing" },
] as const;

export const REVIEW_SLIDE_BY_ID: Readonly<Record<ReviewSlideId, ReviewSlide>> =
  Object.freeze(Object.fromEntries(REVIEW_SLIDES.map((s) => [s.id, s])) as Record<ReviewSlideId, ReviewSlide>);

/** Chapter → its slides, in order. Used to build the asprak's chapter rail. */
export const REVIEW_CHAPTERS: readonly { chapter: M3StageId; label: string; slides: readonly ReviewSlide[] }[] = [
  { chapter: "brief", label: "Tujuan Praktikum", slides: REVIEW_SLIDES.filter((s) => s.chapter === "brief") },
  { chapter: "understand", label: "Pembahasan", slides: REVIEW_SLIDES.filter((s) => s.chapter === "understand") },
  { chapter: "prove", label: "Pengolahan Data", slides: REVIEW_SLIDES.filter((s) => s.chapter === "prove") },
  { chapter: "ready", label: "Format Laporan", slides: REVIEW_SLIDES.filter((s) => s.chapter === "ready") },
];

export const nextSlideId = (id: ReviewSlideId): ReviewSlideId | null => {
  const i = REVIEW_SLIDES.findIndex((s) => s.id === id);
  return i >= 0 && i < REVIEW_SLIDES.length - 1 ? REVIEW_SLIDES[i + 1].id : null;
};
export const prevSlideId = (id: ReviewSlideId): ReviewSlideId | null => {
  const i = REVIEW_SLIDES.findIndex((s) => s.id === id);
  return i > 0 ? REVIEW_SLIDES[i - 1].id : null;
};
export const slideIndex = (id: ReviewSlideId): number => REVIEW_SLIDES.findIndex((s) => s.id === id);
export const TOTAL_REVIEW_SLIDES = REVIEW_SLIDES.length;
