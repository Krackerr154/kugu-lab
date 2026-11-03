// Review-session slide list for Module 7 (BET).
//
// DERIVED from lib/m7-review-deck-data.ts, exactly like Module 6: the deck data
// declares each slide once, this file adds the lookup helpers. Two hand-kept
// lists are two chances to drift.
import type { M3StageId, ReviewSlideId } from "@/lib/m3-presentation";
// Relative, not the @/ alias: node --test does not resolve tsconfig paths for
// value imports. The type imports above are erased and therefore safe.
import { M7_REVIEW_DECK_SLIDES } from "./m7-review-deck-data.ts";

export type ReviewSlideKind = "content" | "data" | "closing";

export interface ReviewSlide {
  id: ReviewSlideId;
  chapter: M3StageId;
  label: string;
  title: string;
  kind: ReviewSlideKind;
  rubric?: string;
}

export const M7_REVIEW_SLIDES: readonly ReviewSlide[] = M7_REVIEW_DECK_SLIDES.map((slide) => ({
  id: slide.id,
  chapter: slide.chapter,
  label: slide.label,
  title: slide.title,
  kind: slide.kind,
  rubric: slide.rubric?.code,
}));

export const M7_REVIEW_SLIDE_BY_ID: Readonly<Record<string, ReviewSlide>> = Object.freeze(
  Object.fromEntries(M7_REVIEW_SLIDES.map((s) => [s.id, s]))
);

export const M7_REVIEW_CHAPTERS: readonly {
  chapter: M3StageId;
  label: string;
  slides: readonly ReviewSlide[];
}[] = [
  { chapter: "brief", label: "Tujuan", slides: M7_REVIEW_SLIDES.filter((s) => s.chapter === "brief") },
  {
    chapter: "understand",
    label: "Pembahasan",
    slides: M7_REVIEW_SLIDES.filter((s) => s.chapter === "understand"),
  },
  {
    chapter: "prove",
    label: "Pengolahan Data",
    slides: M7_REVIEW_SLIDES.filter((s) => s.chapter === "prove"),
  },
  {
    chapter: "ready",
    label: "Simpulan & Laporan",
    slides: M7_REVIEW_SLIDES.filter((s) => s.chapter === "ready"),
  },
];

export const nextM7SlideId = (id: ReviewSlideId): ReviewSlideId | null => {
  const i = M7_REVIEW_SLIDES.findIndex((s) => s.id === id);
  return i >= 0 && i < M7_REVIEW_SLIDES.length - 1 ? M7_REVIEW_SLIDES[i + 1].id : null;
};

export const prevM7SlideId = (id: ReviewSlideId): ReviewSlideId | null => {
  const i = M7_REVIEW_SLIDES.findIndex((s) => s.id === id);
  return i > 0 ? M7_REVIEW_SLIDES[i - 1].id : null;
};

export const m7SlideIndex = (id: ReviewSlideId): number =>
  M7_REVIEW_SLIDES.findIndex((s) => s.id === id);

export const TOTAL_M7_REVIEW_SLIDES = M7_REVIEW_SLIDES.length;

export const M7_FIRST_SLIDE_ID: ReviewSlideId = M7_REVIEW_SLIDES[0].id;
