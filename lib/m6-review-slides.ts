// Review-session slide list for Module 6 (FTIR).
//
// Unlike the Module 4 pair, this is DERIVED from lib/m6-review-deck-data.ts
// rather than restated beside it. The M4 deck keeps two hand-maintained lists
// and needs a test to prove they agree; deriving removes that failure mode
// entirely — there is exactly one place a slide is declared.
import type { M3StageId, ReviewSlideId } from "@/lib/m3-presentation";
// Relative, not the @/ alias: this module is imported directly by node --test,
// which does not resolve tsconfig path aliases. Type-only imports above are
// erased at strip time, so only this value import has to be resolvable.
import { M6_REVIEW_DECK_SLIDES } from "./m6-review-deck-data.ts";

export type ReviewSlideKind = "content" | "data" | "closing";

export interface ReviewSlide {
  id: ReviewSlideId;
  chapter: M3StageId;
  label: string;
  title: string;
  kind: ReviewSlideKind;
  rubric?: string;
}

export const M6_REVIEW_SLIDES: readonly ReviewSlide[] = M6_REVIEW_DECK_SLIDES.map((slide) => ({
  id: slide.id,
  chapter: slide.chapter,
  label: slide.label,
  title: slide.title,
  kind: slide.kind,
  rubric: slide.rubric?.code,
}));

export const M6_REVIEW_SLIDE_BY_ID: Readonly<Record<string, ReviewSlide>> = Object.freeze(
  Object.fromEntries(M6_REVIEW_SLIDES.map((s) => [s.id, s]))
);

export const M6_REVIEW_CHAPTERS: readonly {
  chapter: M3StageId;
  label: string;
  slides: readonly ReviewSlide[];
}[] = [
  { chapter: "brief", label: "Tujuan", slides: M6_REVIEW_SLIDES.filter((s) => s.chapter === "brief") },
  {
    chapter: "understand",
    label: "Pembahasan",
    slides: M6_REVIEW_SLIDES.filter((s) => s.chapter === "understand"),
  },
  {
    chapter: "prove",
    label: "Pengolahan Data",
    slides: M6_REVIEW_SLIDES.filter((s) => s.chapter === "prove"),
  },
  {
    chapter: "ready",
    label: "Simpulan & Laporan",
    slides: M6_REVIEW_SLIDES.filter((s) => s.chapter === "ready"),
  },
];

export const nextM6SlideId = (id: ReviewSlideId): ReviewSlideId | null => {
  const i = M6_REVIEW_SLIDES.findIndex((s) => s.id === id);
  return i >= 0 && i < M6_REVIEW_SLIDES.length - 1 ? M6_REVIEW_SLIDES[i + 1].id : null;
};

export const prevM6SlideId = (id: ReviewSlideId): ReviewSlideId | null => {
  const i = M6_REVIEW_SLIDES.findIndex((s) => s.id === id);
  return i > 0 ? M6_REVIEW_SLIDES[i - 1].id : null;
};

export const m6SlideIndex = (id: ReviewSlideId): number =>
  M6_REVIEW_SLIDES.findIndex((s) => s.id === id);

export const TOTAL_M6_REVIEW_SLIDES = M6_REVIEW_SLIDES.length;

export const M6_FIRST_SLIDE_ID: ReviewSlideId = M6_REVIEW_SLIDES[0].id;
