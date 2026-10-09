import test from "node:test";
import assert from "node:assert/strict";
import {
  REVIEW_DECK_SLIDES,
  REVIEW_DECK_SLIDE_BY_ID,
  TOTAL_REVIEW_DECK_SLIDES,
} from "../../lib/m4-review-deck-data.ts";
import { REVIEW_SLIDE_IDS, REVIEW_SLIDE_CHAPTER } from "../../shared/m3-contract.mjs";

test("review deck contains exactly 10 slides matching contract allowlist", () => {
  assert.equal(TOTAL_REVIEW_DECK_SLIDES, 10);
  assert.equal(REVIEW_DECK_SLIDES.length, 10);

  const ids = REVIEW_DECK_SLIDES.map((s) => s.id);
  assert.deepEqual(ids, [...REVIEW_SLIDE_IDS]);
});

test("each slide has valid metadata, non-empty script, and structured bullets", () => {
  for (const slide of REVIEW_DECK_SLIDES) {
    assert.ok(slide.id in REVIEW_DECK_SLIDE_BY_ID);
    assert.equal(slide.chapter, REVIEW_SLIDE_CHAPTER[slide.id]);
    assert.ok(slide.chapterLabel && slide.chapterLabel.length > 0);
    assert.ok(slide.label && slide.label.length > 0);
    assert.ok(slide.title && slide.title.length > 0);
    assert.ok(["content", "data", "closing"].includes(slide.kind));
    assert.ok(Array.isArray(slide.bullets) && slide.bullets.length >= 2, `slide ${slide.id} needs at least 2 bullets`);
    assert.ok(slide.script && slide.script.length > 10, `slide ${slide.id} needs a substantive script`);

    const byId = REVIEW_DECK_SLIDE_BY_ID[slide.id];
    assert.equal(byId.id, slide.id);
  }
});

test("designated interactive components are correctly mapped to slides", () => {
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p4.embeddedComponent, "electrodeposition-diagram");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p4.rubric?.code, "f.1");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p5.embeddedComponent, "potential-gap");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p5.rubric?.code, "f.1");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p6.embeddedComponent, "complexing-effect");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p6.rubric?.code, "f.2");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p7.embeddedComponent, "electrolyte-solutions");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p7.initialView, "solutions");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p7.rubric?.code, "f.2");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p8.embeddedComponent, "faraday-calculation");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p8.rubric?.code, "e");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p9.embeddedComponent, "report-format");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p9.rubric?.code, "seluruh");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p10.kind, "closing");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p10.embeddedComponent, "games");
});
