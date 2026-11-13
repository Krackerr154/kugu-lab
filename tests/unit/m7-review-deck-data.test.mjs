import test from "node:test";
import assert from "node:assert/strict";
import {
  M7_REVIEW_DECK_SLIDES,
  M7_REVIEW_DECK_SLIDE_BY_ID,
  TOTAL_M7_REVIEW_DECK_SLIDES,
  m7DeckSlideIndex,
} from "../../lib/m7-review-deck-data.ts";
import { COMMON_TRAPS, GUIDE_RESULTS, REPORT_GRID } from "../../lib/m7-bet.ts";
import {
  REVIEW_SLIDE_CHAPTER_BY_DECK,
  REVIEW_SLIDE_IDS_BY_DECK,
  ALL_REVIEW_SLIDE_IDS,
  reviewDeckOfSlide,
  reviewStageOfSlide,
  coercePresentationState,
} from "../../shared/m3-contract.mjs";

test("the M7 deck has twenty-five slides in order, with unique ids", () => {
  assert.equal(TOTAL_M7_REVIEW_DECK_SLIDES, 25);
  assert.equal(M7_REVIEW_DECK_SLIDES.length, 25);

  const ids = M7_REVIEW_DECK_SLIDES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, "slide ids must be unique");
  assert.deepEqual(
    ids,
    Array.from({ length: 25 }, (_, i) => `r${i + 1}`)
  );
});

test("every deck slide matches the contract's M7 chapter map exactly", () => {
  const contractDeck = REVIEW_SLIDE_IDS_BY_DECK.m7;
  assert.equal(contractDeck.length, M7_REVIEW_DECK_SLIDES.length);

  for (const slide of M7_REVIEW_DECK_SLIDES) {
    assert.ok(contractDeck.includes(slide.id), `${slide.id} is missing from the contract's M7 deck`);
    assert.equal(
      REVIEW_SLIDE_CHAPTER_BY_DECK.m7[slide.id],
      slide.chapter,
      `${slide.id} chapter disagrees with the contract`
    );
  }
});

test("the M7 deck borrows no Module 4 or Module 6 slide id", () => {
  for (const slide of M7_REVIEW_DECK_SLIDES) {
    assert.equal(REVIEW_SLIDE_IDS_BY_DECK.m4.includes(slide.id), false, `${slide.id} collides with M4`);
    assert.equal(REVIEW_SLIDE_IDS_BY_DECK.m6.includes(slide.id), false, `${slide.id} collides with M6`);
    assert.equal(reviewDeckOfSlide(slide.id), "m7");
  }
});

test("each slide carries what the canvas and console render", () => {
  for (const slide of M7_REVIEW_DECK_SLIDES) {
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
  for (const slide of M7_REVIEW_DECK_SLIDES) {
    assert.ok(allowed.has(slide.chapter), `${slide.id} sits in unknown chapter ${slide.chapter}`);
  }

  const order = ["brief", "understand", "prove", "ready"];
  let lastRank = 0;
  for (const slide of M7_REVIEW_DECK_SLIDES) {
    const rank = order.indexOf(slide.chapter);
    assert.ok(rank >= lastRank, `${slide.id} jumps back to an earlier chapter`);
    lastRank = rank;
  }
});

test("embedded panels are only the variants BETSlidePanel renders", () => {
  const allowed = new Set([
    "bet-isotherm",
    "bet-pore",
    "bet-iupac",
    "bet-equation",
    "bet-derivation",
    "bet-given",
    "bet-excel",
    "bet-validity",
    "bet-results",
    "bet-traps",
    "bet-report",
  ]);

  let withPanel = 0;
  for (const slide of M7_REVIEW_DECK_SLIDES) {
    if (!slide.embeddedComponent) continue;
    withPanel += 1;
    assert.ok(allowed.has(slide.embeddedComponent), `${slide.id} points at unknown panel ${slide.embeddedComponent}`);
  }
  assert.ok(withPanel >= 12, "most slides should carry a reference panel");
});

test("the deck is looked up by id and index consistently", () => {
  for (const [i, slide] of M7_REVIEW_DECK_SLIDES.entries()) {
    assert.equal(m7DeckSlideIndex(slide.id), i);
    assert.equal(M7_REVIEW_DECK_SLIDE_BY_ID[slide.id].id, slide.id);
  }
  assert.equal(m7DeckSlideIndex("r99"), -1);
});

test("the contract accepts M7 slides only in their own chapter", () => {
  assert.deepEqual(coercePresentationState({ version: 1, stageId: "brief", slideId: "r1" }), {
    version: 1,
    stageId: "brief",
    slideId: "r1",
  });
  assert.deepEqual(coercePresentationState({ version: 1, stageId: "prove", slideId: "r16" }), {
    version: 1,
    stageId: "prove",
    slideId: "r16",
  });
  assert.deepEqual(coercePresentationState({ version: 1, stageId: "ready", slideId: "r25" }), {
    version: 1,
    stageId: "ready",
    slideId: "r25",
  });

  assert.equal(coercePresentationState({ version: 1, stageId: "brief", slideId: "r16" }), null);
  assert.equal(coercePresentationState({ version: 1, stageId: "prove", slideId: "r25" }), null);
  assert.equal(coercePresentationState({ version: 1, stageId: "brief", slideId: "r99" }), null);
});

test("every M7 slide derives a stage the contract accepts (presentSlide path)", () => {
  for (const slide of M7_REVIEW_DECK_SLIDES) {
    const stage = reviewStageOfSlide(slide.id);
    assert.equal(stage, slide.chapter, `${slide.id} derives the wrong stage`);
    assert.ok(stage, `${slide.id} derives no stage at all`);

    const state = coercePresentationState({ version: 1, stageId: stage, slideId: slide.id });
    assert.ok(state, `contract rejected the state presentSlide would send for ${slide.id}`);
    assert.deepEqual(state, { version: 1, stageId: stage, slideId: slide.id });
  }
});

test("the three worked results in the deck are the guide's own numbers", () => {
  // Slide -> sample. A deck that drifts from lib/m7-bet.ts would teach one
  // value while the module page grades another.
  const slideFor = { "Al-Fum 1:2": "r18", "Al-Fum 1:3": "r20", "Al-Fum 1:4": "r22" };
  for (const result of GUIDE_RESULTS) {
    const slide = M7_REVIEW_DECK_SLIDE_BY_ID[slideFor[result.sample]];
    assert.ok(slide, `no slide for ${result.sample}`);
    const text = slide.bullets.join(" ").replace(/\u2212/g, "-");
    assert.ok(text.includes(String(result.points)), `${slide.id} omits the point count`);
    assert.ok(
      text.includes(result.surfaceArea.toFixed(1).replace(".", ",")),
      `${slide.id} omits S = ${result.surfaceArea.toFixed(1)}`
    );
    assert.ok(
      text.includes(result.c.toFixed(2).replace(".", ",")),
      `${slide.id} omits C = ${result.c.toFixed(2)}`
    );
  }
});

test("the trap and report slides agree with the data module", () => {
  const traps = M7_REVIEW_DECK_SLIDE_BY_ID.r23.bullets;
  for (const trap of COMMON_TRAPS) {
    assert.ok(traps.includes(trap), `slide r23 lost the trap: ${trap}`);
  }

  const report = M7_REVIEW_DECK_SLIDE_BY_ID.r25.bullets;
  assert.deepEqual(report, [...REPORT_GRID]);
});

test("adding the M7 deck left the other decks untouched", () => {
  assert.equal(ALL_REVIEW_SLIDE_IDS.length, 74);
  assert.equal(reviewDeckOfSlide("p5"), "m4");
  assert.equal(reviewDeckOfSlide("q5"), "m6");
  assert.equal(reviewDeckOfSlide("r5"), "m7");
  assert.equal(reviewDeckOfSlide("nope"), null);
  assert.equal(reviewDeckOfSlide(null), null);

  assert.equal(reviewStageOfSlide("p1"), "brief");
  assert.equal(reviewStageOfSlide("q13"), "ready");
});
