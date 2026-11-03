import test from "node:test";
import assert from "node:assert/strict";
import {
  M6_REVIEW_DECK_SLIDES,
  M6_REVIEW_DECK_SLIDE_BY_ID,
  TOTAL_M6_REVIEW_DECK_SLIDES,
  m6DeckSlideIndex,
} from "../../lib/m6-review-deck-data.ts";
import {
  REVIEW_SLIDE_CHAPTER_BY_DECK,
  REVIEW_SLIDE_IDS_BY_DECK,
  REVIEW_SLIDE_IDS,
  ALL_REVIEW_SLIDE_IDS,
  reviewDeckOfSlide,
  reviewStageOfSlide,
  coercePresentationState,
} from "../../shared/m3-contract.mjs";

test("the M6 deck has thirteen slides in order, with unique ids", () => {
  assert.equal(TOTAL_M6_REVIEW_DECK_SLIDES, 13);
  assert.equal(M6_REVIEW_DECK_SLIDES.length, 13);

  const ids = M6_REVIEW_DECK_SLIDES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, "slide ids must be unique");
  assert.deepEqual(
    ids,
    ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11", "q12", "q13"]
  );
});

test("every deck slide matches the contract's M6 chapter map exactly", () => {
  const contractDeck = REVIEW_SLIDE_IDS_BY_DECK.m6;
  assert.equal(contractDeck.length, M6_REVIEW_DECK_SLIDES.length);

  for (const slide of M6_REVIEW_DECK_SLIDES) {
    assert.ok(
      contractDeck.includes(slide.id),
      `${slide.id} is missing from the contract's M6 deck`
    );
    assert.equal(
      REVIEW_SLIDE_CHAPTER_BY_DECK.m6[slide.id],
      slide.chapter,
      `${slide.id} chapter disagrees with the contract`
    );
  }
});

test("the M6 deck never borrows a Module 4 slide id", () => {
  for (const slide of M6_REVIEW_DECK_SLIDES) {
    assert.equal(REVIEW_SLIDE_IDS.includes(slide.id), false, `${slide.id} collides with the M4 deck`);
    assert.equal(reviewDeckOfSlide(slide.id), "m6");
  }
});

test("each slide carries the content the presenter console renders", () => {
  for (const slide of M6_REVIEW_DECK_SLIDES) {
    assert.ok(slide.title.length > 0, `${slide.id} has no title`);
    assert.ok(slide.label.length > 0, `${slide.id} has no rail label`);
    assert.ok(slide.chapterLabel.length > 0, `${slide.id} has no chapter label`);
    assert.ok(Array.isArray(slide.bullets) && slide.bullets.length >= 3, `${slide.id} needs at least 3 bullets`);
    for (const bullet of slide.bullets) {
      assert.ok(bullet.trim().length > 10, `${slide.id} has a stub bullet: ${bullet}`);
    }
    // The teleprompter is the reason this deck exists — no slide may ship without it.
    assert.ok(slide.script.trim().length > 60, `${slide.id} has no usable script`);
    assert.ok(slide.rubric, `${slide.id} has no rubric target`);
    assert.ok(slide.rubric.code.length > 0);
  }
});

test("the chapter grouping covers the deck in order and only known stages", () => {
  const allowed = new Set(["brief", "understand", "prove", "ready"]);
  for (const slide of M6_REVIEW_DECK_SLIDES) {
    assert.ok(allowed.has(slide.chapter), `${slide.id} sits in unknown chapter ${slide.chapter}`);
  }

  // Order is preserved globally: chapters never interleave.
  const order = ["brief", "understand", "prove", "ready"];
  let lastRank = 0;
  for (const slide of M6_REVIEW_DECK_SLIDES) {
    const rank = order.indexOf(slide.chapter);
    assert.ok(rank >= lastRank, `${slide.id} jumps back to an earlier chapter`);
    lastRank = rank;
  }
});

test("embedded panels are only the variants the panel component renders", () => {
  const allowed = new Set([
    "ftir-vibration",
    "ftir-spectrum-acid",
    "ftir-spectrum-alfum",
    "ftir-coordination",
    "ftir-purity",
    "ftir-excel",
    "ftir-traps",
    "ftir-conclusions",
    "ftir-report-grid",
  ]);

  let withPanel = 0;
  for (const slide of M6_REVIEW_DECK_SLIDES) {
    if (!slide.embeddedComponent) continue;
    withPanel += 1;
    assert.ok(
      allowed.has(slide.embeddedComponent),
      `${slide.id} points at unknown panel ${slide.embeddedComponent}`
    );
  }
  assert.ok(withPanel >= 8, "most slides should carry a reference panel");
});

test("the deck is looked up by id and index consistently", () => {
  for (const [i, slide] of M6_REVIEW_DECK_SLIDES.entries()) {
    assert.equal(m6DeckSlideIndex(slide.id), i);
    assert.equal(M6_REVIEW_DECK_SLIDE_BY_ID[slide.id].id, slide.id);
  }
  assert.equal(m6DeckSlideIndex("q99"), -1);
});

test("the contract accepts M6 slides only in their own chapter", () => {
  assert.deepEqual(coercePresentationState({ version: 1, stageId: "brief", slideId: "q1" }), {
    version: 1,
    stageId: "brief",
    slideId: "q1",
  });
  assert.deepEqual(coercePresentationState({ version: 1, stageId: "understand", slideId: "q7" }), {
    version: 1,
    stageId: "understand",
    slideId: "q7",
  });
  assert.deepEqual(coercePresentationState({ version: 1, stageId: "ready", slideId: "q13" }), {
    version: 1,
    stageId: "ready",
    slideId: "q13",
  });

  // Wrong chapter for that slide.
  assert.equal(coercePresentationState({ version: 1, stageId: "brief", slideId: "q7" }), null);
  assert.equal(coercePresentationState({ version: 1, stageId: "prove", slideId: "q1" }), null);
  // Unknown id in the q namespace.
  assert.equal(coercePresentationState({ version: 1, stageId: "brief", slideId: "q99" }), null);
});

test("adding the M6 deck left the M4 deck and its ids untouched", () => {
  assert.deepEqual([...REVIEW_SLIDE_IDS], [
    "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10",
  ]);
  assert.equal(ALL_REVIEW_SLIDE_IDS.length, 48);
  assert.equal(reviewDeckOfSlide("p5"), "m4");
  assert.equal(reviewDeckOfSlide("q5"), "m6");
  assert.equal(reviewDeckOfSlide("nope"), null);
  assert.equal(reviewDeckOfSlide(null), null);

  assert.deepEqual(coercePresentationState({ version: 1, stageId: "understand", slideId: "p7" }), {
    version: 1,
    stageId: "understand",
    slideId: "p7",
  });
});

test("every M6 slide derives a stage the contract accepts (presentSlide path)", () => {
  // presentSlide turns a slide id into {stageId, slideId}. If the derivation
  // used the Module 4-only chapter map it would return undefined for q* and the
  // relay would silently drop every Module 6 broadcast.
  for (const slide of M6_REVIEW_DECK_SLIDES) {
    const stage = reviewStageOfSlide(slide.id);
    assert.equal(stage, slide.chapter, `${slide.id} derives the wrong stage`);
    assert.ok(stage, `${slide.id} derives no stage at all`);

    const state = coercePresentationState({ version: 1, stageId: stage, slideId: slide.id });
    assert.ok(state, `contract rejected the state presentSlide would send for ${slide.id}`);
    assert.deepEqual(state, { version: 1, stageId: stage, slideId: slide.id });
  }

  assert.equal(reviewStageOfSlide("p1"), "brief", "M4 derivation must still work");
  assert.equal(reviewStageOfSlide("nope"), null);
});
