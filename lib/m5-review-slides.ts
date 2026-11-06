// Review-session slide list for Module 5 (XRD).
//
// DERIVED from lib/m5-review-deck-data.ts, exactly like Module 6 and Module 7:
// the deck data declares each slide once, this file adds the lookup helpers.
// Two hand-kept lists are two chances to drift.
import type { M3StageId, ReviewSlideId } from "@/lib/m3-presentation";
// Relative, not the @/ alias: node --test does not resolve tsconfig paths for
// value imports. The type imports above are erased and therefore safe.
import { M5_REVIEW_DECK_SLIDES } from "./m5-review-deck-data.ts";

export type ReviewSlideKind = "content" | "data" | "closing";

export interface ReviewSlide {
  id: ReviewSlideId;
  chapter: M3StageId;
  label: string;
  title: string;
  kind: ReviewSlideKind;
  rubric?: string;
}

export const M5_REVIEW_SLIDES: readonly ReviewSlide[] = M5_REVIEW_DECK_SLIDES.map((slide) => ({
  id: slide.id,
  chapter: slide.chapter,
  label: slide.label,
  title: slide.title,
  kind: slide.kind,
  rubric: slide.rubric?.code,
}));

export const M5_REVIEW_SLIDE_BY_ID: Readonly<Record<string, ReviewSlide>> = Object.freeze(
  Object.fromEntries(M5_REVIEW_SLIDES.map((s) => [s.id, s]))
);

export const M5_REVIEW_CHAPTERS: readonly {
  chapter: M3StageId;
  label: string;
  slides: readonly ReviewSlide[];
}[] = [
  { chapter: "brief", label: "Tujuan", slides: M5_REVIEW_SLIDES.filter((s) => s.chapter === "brief") },
  {
    chapter: "understand",
    label: "Pembahasan Teori",
    slides: M5_REVIEW_SLIDES.filter((s) => s.chapter === "understand"),
  },
  {
    chapter: "prove",
    label: "Pengolahan Data",
    slides: M5_REVIEW_SLIDES.filter((s) => s.chapter === "prove"),
  },
  {
    chapter: "ready",
    label: "Simpulan & Laporan",
    slides: M5_REVIEW_SLIDES.filter((s) => s.chapter === "ready"),
  },
];

export const nextM5SlideId = (id: ReviewSlideId): ReviewSlideId | null => {
  const i = M5_REVIEW_SLIDES.findIndex((s) => s.id === id);
  return i >= 0 && i < M5_REVIEW_SLIDES.length - 1 ? M5_REVIEW_SLIDES[i + 1].id : null;
};

export const prevM5SlideId = (id: ReviewSlideId): ReviewSlideId | null => {
  const i = M5_REVIEW_SLIDES.findIndex((s) => s.id === id);
  return i > 0 ? M5_REVIEW_SLIDES[i - 1].id : null;
};

export const m5SlideIndex = (id: ReviewSlideId): number =>
  M5_REVIEW_SLIDES.findIndex((s) => s.id === id);

export const TOTAL_M5_REVIEW_SLIDES = M5_REVIEW_SLIDES.length;

export const M5_FIRST_SLIDE_ID: ReviewSlideId = M5_REVIEW_SLIDES[0].id;
