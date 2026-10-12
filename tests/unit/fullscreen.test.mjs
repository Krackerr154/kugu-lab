import test from "node:test";
import assert from "node:assert/strict";
import { isFullscreen, toggleFullscreen } from "../../lib/fullscreen.ts";

test("fullscreen helper functions are defined and safe in non-browser environments", async () => {
  assert.equal(typeof isFullscreen, "function");
  assert.equal(typeof toggleFullscreen, "function");

  // In Node.js environment (no document), isFullscreen returns false and toggleFullscreen returns false
  assert.equal(isFullscreen(), false);
  const result = await toggleFullscreen();
  assert.equal(result, false);
});
