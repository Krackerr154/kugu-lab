import test from "node:test";
import assert from "node:assert/strict";
import {
  M5_REVIEW_SLIDES,
  M5_REVIEW_SLIDE_BY_ID,
  M5_REVIEW_CHAPTERS,
  M5_FIRST_SLIDE_ID,
  TOTAL_M5_REVIEW_SLIDES,
  nextM5SlideId,
  prevM5SlideId,
  m5SlideIndex,
} from "../../lib/m5-review-slides.ts";
import { M5_REVIEW_DECK_SLIDES } from "../../lib/m5-review-deck-data.ts";

test("the M5 slide list is derived from the deck, so the two can never drift", () => {
  assert.equal(M5_REVIEW_SLIDES.length, M5_REVIEW_DECK_SLIDES.length);

  for (const [i, slide] of M5_REVIEW_SLIDES.entries()) {
    const source = M5_REVIEW_DECK_SLIDES[i];
    assert.equal(slide.id, source.id);
    assert.equal(slide.chapter, source.chapter);
    assert.equal(slide.title, source.title);
    assert.equal(slide.label, source.label);
    assert.equal(slide.kind, source.kind);
    assert.equal(slide.rubric, source.rubric?.code);
  }
});

test("chapter grouping preserves the global order and covers every slide once", () => {
  const flattened = M5_REVIEW_CHAPTERS.flatMap((c) => c.slides.map((s) => s.id));
  assert.deepEqual(flattened, M5_REVIEW_SLIDES.map((s) => s.id));

  assert.equal(flattened.length, TOTAL_M5_REVIEW_SLIDES);
  assert.equal(new Set(flattened).size, flattened.length);
});

test("every chapter has at least one slide and a label", () => {
  for (const chapter of M5_REVIEW_CHAPTERS) {
    assert.ok(chapter.label.length > 0);
    assert.ok(chapter.slides.length > 0, `${chapter.chapter} has no slides`);
    for (const slide of chapter.slides) {
      assert.equal(slide.chapter, chapter.chapter);
    }
  }
});

test("navigation clamps at both ends and walks one step at a time", () => {
  assert.equal(prevM5SlideId("s1"), null);
  assert.equal(nextM5SlideId("s20"), null);
  assert.equal(nextM5SlideId("s1"), "s2");
  assert.equal(prevM5SlideId("s20"), "s19");
  assert.equal(m5SlideIndex("s1"), 0);
  assert.equal(m5SlideIndex("s20"), 19);
  assert.equal(m5SlideIndex("nope"), -1);

  // The chain must reach every slide exactly once.
  let cursor = M5_FIRST_SLIDE_ID;
  const walked = [cursor];
  while (nextM5SlideId(cursor)) {
    cursor = nextM5SlideId(cursor);
    walked.push(cursor);
    assert.ok(walked.length <= TOTAL_M5_REVIEW_SLIDES + 1, "navigation looped");
  }
  assert.equal(walked.length, TOTAL_M5_REVIEW_SLIDES);
});

test("lookup by id returns the same object the list holds", () => {
  for (const slide of M5_REVIEW_SLIDES) {
    assert.equal(M5_REVIEW_SLIDE_BY_ID[slide.id], slide);
  }
});
