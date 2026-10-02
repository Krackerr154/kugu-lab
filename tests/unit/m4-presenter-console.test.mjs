import test from "node:test";
import assert from "node:assert/strict";

export function formatSessionTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function shouldSuppressKeyShortcut(targetTagName) {
  if (!targetTagName) return false;
  const tag = targetTagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
}

export function getNextSlideIndex(currentIndex, totalSlides) {
  return Math.min(totalSlides - 1, currentIndex + 1);
}

export function getPrevSlideIndex(currentIndex) {
  return Math.max(0, currentIndex - 1);
}

test("formatSessionTime formats elapsed seconds to MM:SS", () => {
  assert.equal(formatSessionTime(0), "00:00");
  assert.equal(formatSessionTime(45), "00:45");
  assert.equal(formatSessionTime(60), "01:00");
  assert.equal(formatSessionTime(125), "02:05");
  assert.equal(formatSessionTime(3600), "60:00");
});

test("shouldSuppressKeyShortcut ignores slide navigation keys when user is typing in forms", () => {
  assert.equal(shouldSuppressKeyShortcut("INPUT"), true);
  assert.equal(shouldSuppressKeyShortcut("input"), true);
  assert.equal(shouldSuppressKeyShortcut("TEXTAREA"), true);
  assert.equal(shouldSuppressKeyShortcut("textarea"), true);
  assert.equal(shouldSuppressKeyShortcut("SELECT"), true);
  assert.equal(shouldSuppressKeyShortcut("select"), true);

  assert.equal(shouldSuppressKeyShortcut("DIV"), false);
  assert.equal(shouldSuppressKeyShortcut("BUTTON"), false);
  assert.equal(shouldSuppressKeyShortcut("BODY"), false);
  assert.equal(shouldSuppressKeyShortcut(null), false);
});

test("getNextSlideIndex and getPrevSlideIndex clamp correctly within 19 slides", () => {
  const total = 19;
  assert.equal(getPrevSlideIndex(0), 0);
  assert.equal(getPrevSlideIndex(5), 4);

  assert.equal(getNextSlideIndex(0, total), 1);
  assert.equal(getNextSlideIndex(17, total), 18);
  assert.equal(getNextSlideIndex(18, total), 18);
});
