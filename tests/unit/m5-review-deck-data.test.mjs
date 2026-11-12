import test from "node:test";
import assert from "node:assert/strict";
import {
  M5_REVIEW_DECK_SLIDES,
  M5_REVIEW_DECK_SLIDE_BY_ID,
  TOTAL_M5_REVIEW_DECK_SLIDES,
  m5DeckSlideIndex,
} from "../../lib/m5-review-deck-data.ts";
import {
  ALFUM_SAMPLES,
  GUIDE_SCHERRER_D011_NM,
  M5_COMMON_TRAPS,
  M5_REPORT_GRID,
} from "../../lib/m5-xrd.ts";
import {
  REVIEW_SLIDE_CHAPTER_BY_DECK,
  REVIEW_SLIDE_IDS_BY_DECK,
  ALL_REVIEW_SLIDE_IDS,
  reviewDeckOfSlide,
  reviewStageOfSlide,
  coercePresentationState,
} from "../../shared/m3-contract.mjs";

test("the M5 deck has twenty slides in order, with unique ids", () => {
  assert.equal(TOTAL_M5_REVIEW_DECK_SLIDES, 20);
  assert.equal(M5_REVIEW_DECK_SLIDES.length, 20);

  const ids = M5_REVIEW_DECK_SLIDES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, "slide ids must be unique");
  assert.deepEqual(
    ids,
    Array.from({ length: 20 }, (_, i) => `s${i + 1}`)
  );
});

test("every deck slide matches the contract's M5 chapter map exactly", () => {
  const contractDeck = REVIEW_SLIDE_IDS_BY_DECK.m5;
  assert.equal(contractDeck.length, M5_REVIEW_DECK_SLIDES.length);

  for (const slide of M5_REVIEW_DECK_SLIDES) {
    assert.ok(contractDeck.includes(slide.id), `${slide.id} is missing from the contract's M5 deck`);
    assert.equal(
      REVIEW_SLIDE_CHAPTER_BY_DECK.m5[slide.id],
      slide.chapter,
      `${slide.id} chapter disagrees with the contract`
    );
  }
});

test("the M5 deck borrows no Module 4, 6, or 7 slide id", () => {
  for (const slide of M5_REVIEW_DECK_SLIDES) {
    assert.equal(REVIEW_SLIDE_IDS_BY_DECK.m4.includes(slide.id), false, `${slide.id} collides with M4`);
    assert.equal(REVIEW_SLIDE_IDS_BY_DECK.m6.includes(slide.id), false, `${slide.id} collides with M6`);
    assert.equal(REVIEW_SLIDE_IDS_BY_DECK.m7.includes(slide.id), false, `${slide.id} collides with M7`);
    assert.equal(reviewDeckOfSlide(slide.id), "m5");
  }
});

test("each slide carries what the canvas and console render", () => {
  for (const slide of M5_REVIEW_DECK_SLIDES) {
    assert.ok(slide.title.length > 0, `${slide.id} has no title`);
    assert.ok(slide.label.length > 0, `${slide.id} has no rail label`);
    assert.ok(slide.chapterLabel.length > 0, `${slide.id} has no chapter label`);
    assert.ok(Array.isArray(slide.bullets) && slide.bullets.length >= 3, `${slide.id} needs at least 3 bullets`);
    for (const bullet of slide.bullets) {
      assert.ok(bullet.trim().length > 10, `${slide.id} has a stub bullet: ${bullet}`);
    }
    // The teleprompter is why the deck exists — every slide must be sayable.
    assert.ok(slide.script.trim().length > 60, `${slide.id} has no usable script`);
  }
});

test("the chapter grouping covers the deck in order and only known stages", () => {
  const allowed = new Set(["brief", "understand", "prove", "ready"]);
  for (const slide of M5_REVIEW_DECK_SLIDES) {
    assert.ok(allowed.has(slide.chapter), `${slide.id} sits in unknown chapter ${slide.chapter}`);
  }

  const order = ["brief", "understand", "prove", "ready"];
  let lastRank = 0;
  for (const slide of M5_REVIEW_DECK_SLIDES) {
    const rank = order.indexOf(slide.chapter);
    assert.ok(rank >= lastRank, `${slide.id} jumps back to an earlier chapter`);
    lastRank = rank;
  }
});

test("embedded panels are only the variants XRDSlidePanel renders", () => {
  const allowed = new Set([
    "xrd-lattice",
    "xrd-bragg",
    "xrd-anatomy",
    "xrd-reflections",
    "xrd-samples",
    "xrd-scherrer",
    "xrd-traps",
    "xrd-report",
  ]);

  let withPanel = 0;
  for (const slide of M5_REVIEW_DECK_SLIDES) {
    if (!slide.embeddedComponent) continue;
    withPanel += 1;
    assert.ok(allowed.has(slide.embeddedComponent), `${slide.id} points at unknown panel ${slide.embeddedComponent}`);
  }
  assert.ok(withPanel >= 15, "most slides should carry a reference panel");
});

test("the deck is looked up by id and index consistently", () => {
  for (const [i, slide] of M5_REVIEW_DECK_SLIDES.entries()) {
    assert.equal(m5DeckSlideIndex(slide.id), i);
    assert.equal(M5_REVIEW_DECK_SLIDE_BY_ID[slide.id].id, slide.id);
  }
  assert.equal(m5DeckSlideIndex("s99"), -1);
});

test("the contract accepts M5 slides only in their own chapter", () => {
  assert.deepEqual(coercePresentationState({ version: 1, stageId: "brief", slideId: "s1" }), {
    version: 1,
    stageId: "brief",
    slideId: "s1",
  });
  assert.deepEqual(coercePresentationState({ version: 1, stageId: "understand", slideId: "s6" }), {
    version: 1,
    stageId: "understand",
    slideId: "s6",
  });
  assert.deepEqual(coercePresentationState({ version: 1, stageId: "prove", slideId: "s14" }), {
    version: 1,
    stageId: "prove",
    slideId: "s14",
  });
  assert.deepEqual(coercePresentationState({ version: 1, stageId: "ready", slideId: "s20" }), {
    version: 1,
    stageId: "ready",
    slideId: "s20",
  });

  assert.equal(coercePresentationState({ version: 1, stageId: "brief", slideId: "s14" }), null);
  assert.equal(coercePresentationState({ version: 1, stageId: "prove", slideId: "s20" }), null);
  assert.equal(coercePresentationState({ version: 1, stageId: "brief", slideId: "s99" }), null);
});

test("every M5 slide derives a stage the contract accepts (presentSlide path)", () => {
  for (const slide of M5_REVIEW_DECK_SLIDES) {
    const stage = reviewStageOfSlide(slide.id);
    assert.equal(stage, slide.chapter, `${slide.id} derives the wrong stage`);
    assert.ok(stage, `${slide.id} derives no stage at all`);

    const state = coercePresentationState({ version: 1, stageId: stage, slideId: slide.id });
    assert.ok(state, `contract rejected the state presentSlide would send for ${slide.id}`);
    assert.deepEqual(state, { version: 1, stageId: stage, slideId: slide.id });
  }
});

test("the worked results in slide 17 match the guide's benchmark numbers", () => {
  const slide17 = M5_REVIEW_DECK_SLIDE_BY_ID.s17;
  assert.ok(slide17, "no slide s17 in deck");
  const text = slide17.bullets.join(" ");

  for (const sample of ALFUM_SAMPLES) {
    const dVal = GUIDE_SCHERRER_D011_NM[sample.id];
    assert.ok(text.includes(sample.id), `slide s17 omits sample ${sample.id}`);
    assert.ok(
      text.includes(dVal.toFixed(1).replace(".", ",")),
      `slide s17 omits D = ${dVal.toFixed(1)} for ${sample.id}`
    );
    assert.ok(
      text.includes(sample.crystallinityRelPct.toFixed(1).replace(".", ",")),
      `slide s17 omits crystallinity = ${sample.crystallinityRelPct.toFixed(1)}% for ${sample.id}`
    );
  }
});

test("the trap and report slides agree with the data module", () => {
  const traps = M5_REVIEW_DECK_SLIDE_BY_ID.s18.bullets;
  assert.deepEqual(traps, [...M5_COMMON_TRAPS]);

  const report = M5_REVIEW_DECK_SLIDE_BY_ID.s20.bullets;
  assert.deepEqual(report, [...M5_REPORT_GRID]);
});

test("adding the M5 deck left the total count and all decks intact", () => {
  assert.equal(ALL_REVIEW_SLIDE_IDS.length, 73);
  assert.equal(reviewDeckOfSlide("p5"), "m4");
  assert.equal(reviewDeckOfSlide("s5"), "m5");
  assert.equal(reviewDeckOfSlide("q5"), "m6");
  assert.equal(reviewDeckOfSlide("r5"), "m7");
  assert.equal(reviewDeckOfSlide("nope"), null);
  assert.equal(reviewDeckOfSlide(null), null);

  assert.equal(reviewStageOfSlide("s1"), "brief");
  assert.equal(reviewStageOfSlide("s20"), "ready");
});
