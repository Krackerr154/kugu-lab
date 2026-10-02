import test from "node:test";
import assert from "node:assert/strict";
import { saveDataSet, getDataSet, _clearDataSets } from "../../lib/server/m4-dataset-store.ts";

// The store is the server-side source of truth: it computes η once on save and
// hands back a short public id. These lock the id format (must satisfy the
// contract's dataSetId regex), round-trip retrieval, and miss behavior.

const sample = {
  valence: 2,
  molarMass: 118.71,
  groups: [
    { label: "K1", current: 0.058, timeSeconds: 900, massBefore: 1.0, massAfter: 1.028 },
    { label: "K2", current: 0.058, timeSeconds: 900, massBefore: 1.0, massAfter: 1.040 },
  ],
};

const DATA_SET_ID_RE = /^[A-Za-z0-9_-]{8,32}$/;

test("saveDataSet returns a contract-valid id and computes efficiency", () => {
  _clearDataSets();
  const entry = saveDataSet(sample, true);
  assert.ok(DATA_SET_ID_RE.test(entry.id), `id ${entry.id} must match contract regex`);
  assert.equal(entry.result.groups.length, 2);
  assert.ok(Math.abs(entry.result.groups[0].efficiency - 87.19) < 0.1);
  assert.equal(entry.result.groups[1].overHundred, true);
  assert.equal(entry.result.assumptionConfirmed, true);
});

test("getDataSet round-trips a saved entry and misses on unknown id", () => {
  _clearDataSets();
  const entry = saveDataSet(sample, false);
  const fetched = getDataSet(entry.id);
  assert.ok(fetched);
  assert.equal(fetched.id, entry.id);
  assert.equal(fetched.result.assumptionConfirmed, false);
  assert.equal(getDataSet("AAAAAAAAAAAA"), null, "unknown id must be a miss, not a throw");
});

test("ids are unique across saves", () => {
  _clearDataSets();
  const ids = new Set();
  for (let i = 0; i < 50; i++) ids.add(saveDataSet(sample, false).id);
  assert.equal(ids.size, 50, "every save must produce a distinct id");
});
