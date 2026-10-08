import test from "node:test";
import assert from "node:assert/strict";
import {
  REVIEW_DECK_SLIDES,
  REVIEW_DECK_SLIDE_BY_ID,
  TOTAL_REVIEW_DECK_SLIDES,
} from "../../lib/m4-review-deck-data.ts";
import { REVIEW_SLIDE_IDS, REVIEW_SLIDE_CHAPTER } from "../../shared/m3-contract.mjs";

test("review deck contains exactly 17 slides matching contract allowlist", () => {
  assert.equal(TOTAL_REVIEW_DECK_SLIDES, 17);
  assert.equal(REVIEW_DECK_SLIDES.length, 17);

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
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p4.embeddedComponent, undefined);
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p4.rubric?.code, "f.1");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p5.embeddedComponent, "potential-gap");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p5.rubric?.code, "f.1");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p7.embeddedComponent, "electrolyte-function");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p7.initialView, "solutions");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p7.rubric?.code, "f.2");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p8.embeddedComponent, "electrolyte-function");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p8.initialView, "sequence");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p9.embeddedComponent, "cell-explorer");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p9.rubric?.code, "f.1 & f.3");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p11.kind, "data");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p11.embeddedComponent, "data-entry");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p12.kind, "data");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p12.embeddedComponent, "data-chart");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p12.rubric?.code, "f.4");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p16.embeddedComponent, "report-format");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p16.rubric?.code, "seluruh");

  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p17.kind, "closing");
  assert.equal(REVIEW_DECK_SLIDE_BY_ID.p17.embeddedComponent, "games");
});
