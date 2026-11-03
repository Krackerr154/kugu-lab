import test from "node:test";
import assert from "node:assert/strict";
import {
  ALFUM_OFFSET,
  ASSIGNMENT_OPTIONS,
  FTIR_BANDS,
  FTIR_REGIONS,
  FUMARIC_BASELINE,
  PURITY_ROWS,
  bandById,
  buildSpectrum,
  checkAssignment,
  markedBands,
  progressOf,
  spectrumDomain,
} from "../../lib/m6-ftir-bands.ts";

test("every band id is unique and every assignment key is a real option", () => {
  const ids = FTIR_BANDS.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length, "band ids must be unique");

  const optionKeys = new Set(ASSIGNMENT_OPTIONS.map((o) => o.key));
  for (const band of FTIR_BANDS) {
    assert.ok(
      optionKeys.has(band.assignment),
      `band ${band.id} points at unknown assignment ${band.assignment}`
    );
  }
});

test("the exercise covers ten clickable bands, four of them diagnostic", () => {
  const marked = markedBands();
  assert.equal(marked.length, 10);
  assert.equal(marked.filter((b) => b.diagnostic).length, 4);

  const diagnostic = marked.filter((b) => b.diagnostic).map((b) => b.center).sort((a, b) => a - b);
  // C=O of free fumaric acid, then the two carboxylate bands of Al-Fum,
  // plus the broad free-acid O-H that disappears on coordination.
  assert.deepEqual(diagnostic, [1610, 1430, 1675, 2950].sort((a, b) => a - b));
});

test("the atmospheric CO2 band is an artefact and is never diagnostic", () => {
  const co2 = bandById("t-co2");
  assert.ok(co2);
  assert.equal(co2.sample, "atmosfer");
  assert.equal(co2.assignment, "artefact");
  assert.equal(co2.diagnostic, false);
  assert.ok(co2.center > 2300 && co2.center < 2400);
});

test("every band sits inside the plotted 400-4000 cm-1 window", () => {
  for (const band of FTIR_BANDS) {
    assert.ok(band.center > 400 && band.center < 4000, `${band.id} at ${band.center}`);
    assert.ok(band.width > 0 && band.depth > 0, `${band.id} needs a positive width and depth`);
  }
});

test("region bounds are ordered, inside the instrument window, and non-empty", () => {
  assert.ok(FTIR_REGIONS.length >= 2);
  for (const region of FTIR_REGIONS) {
    assert.ok(region.min < region.max, `${region.id} bounds are inverted`);
    assert.ok(region.min >= 400 && region.max <= 4000, `${region.id} escapes 400-4000`);
  }
  const ids = FTIR_REGIONS.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("the synthesised spectrum is finite and runs strictly left to right", () => {
  for (const region of FTIR_REGIONS) {
    const points = buildSpectrum(region.id, 120);
    assert.equal(points.length, 121);
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      assert.ok(Number.isFinite(p.acid), `acid NaN at ${p.x}`);
      assert.ok(Number.isFinite(p.alfum), `alfum NaN at ${p.x}`);
      if (i > 0) assert.ok(p.x > points[i - 1].x, "x must increase");
    }
  }
});

test("the stacked Al-Fum trace sits exactly one offset above the free-acid trace", () => {
  const points = buildSpectrum("full", 200);
  for (const p of points) {
    // Both traces carry the same atmospheric artefacts, so the offset holds
    // everywhere except where a sample-specific band pulls one of them down.
    const gap = p.alfum - p.acid;
    assert.ok(gap > 0, `traces crossed at ${p.x}`);
  }
  const baselineGap = FUMARIC_BASELINE + ALFUM_OFFSET - FUMARIC_BASELINE;
  assert.equal(baselineGap, ALFUM_OFFSET);
});

test("every clickable band actually shows up as a dip at its own wavenumber", () => {
  const points = buildSpectrum("full", 3600); // 1 cm-1 resolution
  const at = (x) => points.reduce((best, p) => (Math.abs(p.x - x) < Math.abs(best.x - x) ? p : best), points[0]);

  for (const band of markedBands()) {
    const baseline = band.sample === "asam-fumarat" ? FUMARIC_BASELINE : FUMARIC_BASELINE + ALFUM_OFFSET;
    const key = band.sample === "asam-fumarat" ? "acid" : "alfum";
    const dip = baseline - at(band.center)[key];
    assert.ok(
      dip >= band.depth * 0.7,
      `${band.id} at ${band.center} only dips ${dip.toFixed(1)} of its ${band.depth} depth`
    );
  }
});

test("the spectrum domain is stable across regions and brackets both traces", () => {
  const domain = spectrumDomain();
  assert.ok(domain.min < FUMARIC_BASELINE, "domain must leave room under the acid baseline");
  assert.ok(domain.max > FUMARIC_BASELINE + ALFUM_OFFSET, "domain must leave room above the Al-Fum baseline");
  assert.ok(domain.min >= 0);
});

test("checkAssignment marks the deck's answer right and every other option wrong", () => {
  const band = bandById("f-c=o");
  assert.ok(band);

  assert.equal(checkAssignment("f-c=o", "co-acid").correct, true);
  for (const option of ASSIGNMENT_OPTIONS) {
    if (option.key === band.assignment) continue;
    assert.equal(
      checkAssignment("f-c=o", option.key).correct,
      false,
      `${option.key} must not be accepted for ${band.id}`
    );
  }

  assert.equal(checkAssignment("does-not-exist", "co-acid"), null);
});

test("progress counts answered and correct separately, over marked bands only", () => {
  assert.deepEqual(progressOf({}), { answered: 0, correct: 0, total: 10 });

  const partial = progressOf({ "f-c=o": "co-acid", "a-coo-asym": "coo-sym" });
  assert.deepEqual(partial, { answered: 2, correct: 1, total: 10 });

  // Unmarked bands shape the trace but are not part of the exercise.
  const unmarked = FTIR_BANDS.find((b) => !b.marked);
  assert.ok(unmarked);
  assert.deepEqual(progressOf({ [unmarked.id]: unmarked.assignment }), {
    answered: 0,
    correct: 0,
    total: 10,
  });
});

test("the purity reference carries the deck's three discriminating rows", () => {
  assert.equal(PURITY_ROWS.length, 3);

  const cO = PURITY_ROWS[0];
  assert.match(cO.band, /1675/);
  assert.equal(cO.acid, "Ada");
  assert.equal(cO.alfum, "Tidak ada");

  const coo = PURITY_ROWS[2];
  assert.match(coo.band, /COO/);
  assert.equal(coo.acid, "Tidak ada");
  assert.equal(coo.alfum, "Ada");
});
