import test from "node:test";
import assert from "node:assert/strict";
import {
  REVIEW_SLIDES,
  REVIEW_SLIDE_BY_ID,
  REVIEW_CHAPTERS,
  nextSlideId,
  prevSlideId,
  slideIndex,
  TOTAL_REVIEW_SLIDES,
} from "../../lib/m4-review-slides.ts";
import {
  REVIEW_SLIDE_CHAPTER,
  REVIEW_SLIDE_IDS,
  coercePresentationState,
} from "../../shared/m3-contract.mjs";

test("every review slide id and chapter matches the contract allowlist exactly", () => {
  // The UI slide list and the relay's contract allowlist must never diverge:
  // a slide the UI knows but the contract rejects = a click that moves nobody.
  const uiIds = REVIEW_SLIDES.map((s) => s.id);
  assert.deepEqual([...uiIds].sort(), [...REVIEW_SLIDE_IDS].sort(), "id sets differ");
  for (const slide of REVIEW_SLIDES) {
    assert.equal(REVIEW_SLIDE_CHAPTER[slide.id], slide.chapter, `chapter mismatch for ${slide.id}`);
  }
});

test("contract accepts each slide only with its own chapter, rejects the wrong chapter", () => {
  const otherStage = (stage) => (stage === "brief" ? "understand" : "brief");
  for (const slide of REVIEW_SLIDES) {
    const ok = coercePresentationState({ version: 1, stageId: slide.chapter, slideId: slide.id });
    assert.equal(ok?.slideId, slide.id, `should accept ${slide.id} on ${slide.chapter}`);
    const bad = coercePresentationState({ version: 1, stageId: otherStage(slide.chapter), slideId: slide.id });
    assert.equal(bad, null, `should reject ${slide.id} on the wrong chapter`);
  }
});

test("contract rejects unknown slide ids and prototype-key probes", () => {
  for (const bad of ["p0", "p20", "p999", "constructor", "__proto__", "", "P1"]) {
    assert.equal(
      coercePresentationState({ version: 1, stageId: "brief", slideId: bad }),
      null,
      `should reject slideId=${JSON.stringify(bad)}`
    );
  }
});

test("content slides carry an anchor; data/closing slides do not", () => {
  for (const slide of REVIEW_SLIDES) {
    if (slide.kind === "content") {
      assert.ok(slide.anchor, `content slide ${slide.id} needs an anchor`);
    } else {
      assert.equal(slide.anchor, undefined, `${slide.kind} slide ${slide.id} must not have an anchor`);
    }
  }
});

test("there are 18 slides and the chapter grouping covers all of them in order", () => {
  assert.equal(TOTAL_REVIEW_SLIDES, 18);
  const flattened = REVIEW_CHAPTERS.flatMap((c) => c.slides.map((s) => s.id));
  assert.deepEqual(flattened, REVIEW_SLIDES.map((s) => s.id), "chapter grouping must preserve global order");
});

test("next/prev/index navigation is correct at the ends and middle", () => {
  assert.equal(prevSlideId("p1"), null);
  assert.equal(nextSlideId("p18"), null);
  assert.equal(nextSlideId("p1"), "p2");
  assert.equal(prevSlideId("p18"), "p17");
  assert.equal(slideIndex("p1"), 0);
  assert.equal(slideIndex("p18"), 17);
  assert.equal(REVIEW_SLIDE_BY_ID.p6.title, "Selisih Potensial Menghambat Kodeposisi");
});
