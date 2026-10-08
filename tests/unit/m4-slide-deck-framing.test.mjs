import test from "node:test";
import assert from "node:assert/strict";
import {
  deckSlideIndex,
  TOTAL_REVIEW_DECK_SLIDES,
  REVIEW_DECK_SLIDES,
} from "../../lib/m4-review-deck-data.ts";

export function clampSlideIndex(targetIndex) {
  return Math.max(0, Math.min(TOTAL_REVIEW_DECK_SLIDES - 1, targetIndex));
}

export function canStudentReadBack(targetIndex, presenterIndex) {
  if (targetIndex < 0 || targetIndex >= TOTAL_REVIEW_DECK_SLIDES) return false;
  return targetIndex <= presenterIndex;
}

export function calculateDrift(viewingId, presenterId) {
  if (!viewingId || !presenterId) return { drifted: false, viewingIdx: -1, presenterIdx: -1 };
  const viewingIdx = deckSlideIndex(viewingId);
  const presenterIdx = deckSlideIndex(presenterId);
  return {
    drifted: viewingIdx !== presenterIdx && viewingIdx >= 0 && presenterIdx >= 0,
    viewingIdx,
    presenterIdx,
  };
}

test("clampSlideIndex bounds index to 0..14", () => {
  assert.equal(clampSlideIndex(-10), 0);
  assert.equal(clampSlideIndex(0), 0);
  assert.equal(clampSlideIndex(7), 7);
  assert.equal(clampSlideIndex(14), 14);
  assert.equal(clampSlideIndex(99), 14);
});

test("canStudentReadBack allows only slides already shown by presenter", () => {
  // Presenter is on Slide 7 (index 6)
  const presenterIdx = 6;

  // Student can read slides 0..6
  for (let i = 0; i <= presenterIdx; i++) {
    assert.equal(canStudentReadBack(i, presenterIdx), true, `slide index ${i} should be readable`);
  }

  // Student CANNOT read ahead (7..18)
  for (let i = presenterIdx + 1; i < TOTAL_REVIEW_DECK_SLIDES; i++) {
    assert.equal(canStudentReadBack(i, presenterIdx), false, `slide index ${i} should not be readable yet`);
  }

  // Out of bounds
  assert.equal(canStudentReadBack(-1, presenterIdx), false);
  assert.equal(canStudentReadBack(25, presenterIdx), false);
});

test("calculateDrift correctly flags when student is looking at another slide", () => {
  const noDrift = calculateDrift("p7", "p7");
  assert.equal(noDrift.drifted, false);
  assert.equal(noDrift.viewingIdx, 6);
  assert.equal(noDrift.presenterIdx, 6);

  const drifted = calculateDrift("p3", "p7");
  assert.equal(drifted.drifted, true);
  assert.equal(drifted.viewingIdx, 2);
  assert.equal(drifted.presenterIdx, 6);
});
