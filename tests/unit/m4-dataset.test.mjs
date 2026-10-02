import test from "node:test";
import assert from "node:assert/strict";
import {
  computeDataSet,
  validateDataSet,
  FARADAY,
  SN2_VALENCE,
  SN_MOLAR_MASS,
} from "../../lib/m4-dataset.ts";

// The efficiency math is the teaching payload: it must match the module page's
// worked example exactly, flag >100% as a diagnostic (not success), and reject
// nonsense before it can reach the chart.

test("matches the module page worked example (Q=52.2C, Sn2+, eta≈87.19%)", () => {
  // From the page: Q = 0.058 A × 900 s = 52.20 C; m_teoretis ≈ 0.032112 g;
  // m_aktual = 0.0280 g → η ≈ 87.19%.
  const result = computeDataSet(
    {
      valence: SN2_VALENCE,
      molarMass: SN_MOLAR_MASS,
      groups: [{ label: "Protokol", current: 0.058, timeSeconds: 900, massBefore: 1.0, massAfter: 1.028 }],
    },
    true
  );
  const g = result.groups[0];
  assert.equal(Math.round(g.charge * 100) / 100, 52.2, "charge");
  assert.ok(Math.abs(g.massTheoretical - 0.032112) < 1e-5, `m_teoretis ${g.massTheoretical}`);
  assert.ok(Math.abs(g.massActual - 0.028) < 1e-9, "m_aktual");
  assert.ok(Math.abs(g.efficiency - 87.19) < 0.05, `eta ${g.efficiency}`);
  assert.equal(g.overHundred, false);
  assert.equal(g.negative, false);
  assert.equal(result.assumptionConfirmed, true);
});

test("FARADAY constant is 96485 and feeds the formula", () => {
  assert.equal(FARADAY, 96485);
  const r = computeDataSet({ valence: 1, molarMass: FARADAY, groups: [{ label: "x", current: 1, timeSeconds: 1, massBefore: 0, massAfter: 1 }] }, false);
  // Q=1, mol e- = 1/96485, m_teoretis = (1/96485)/1 * 96485 = 1 g → η = 100%.
  assert.ok(Math.abs(r.groups[0].massTheoretical - 1) < 1e-9);
  assert.ok(Math.abs(r.groups[0].efficiency - 100) < 1e-9);
});

test("flags over-100% as a diagnostic, not success", () => {
  const r = computeDataSet(
    { valence: SN2_VALENCE, molarMass: SN_MOLAR_MASS, groups: [{ label: "K2", current: 0.058, timeSeconds: 900, massBefore: 1.0, massAfter: 1.040 }] },
    false
  );
  assert.ok(r.groups[0].efficiency > 100, "should exceed 100%");
  assert.equal(r.groups[0].overHundred, true);
});

test("flags negative efficiency (mass loss) instead of silently zeroing", () => {
  const r = computeDataSet(
    { valence: SN2_VALENCE, molarMass: SN_MOLAR_MASS, groups: [{ label: "K3", current: 0.058, timeSeconds: 900, massBefore: 1.0, massAfter: 0.99 }] },
    false
  );
  assert.ok(r.groups[0].efficiency < 0);
  assert.equal(r.groups[0].negative, true);
});

test("validateDataSet accepts a well-formed set and rejects each bad field", () => {
  const good = {
    valence: 2,
    molarMass: 118.71,
    groups: [{ label: "K1", current: 0.058, timeSeconds: 900, massBefore: 1.0, massAfter: 1.02 }],
  };
  assert.equal(validateDataSet(good), null);

  assert.equal(validateDataSet(null), "invalid-body");
  assert.equal(validateDataSet([]), "invalid-body");
  assert.equal(validateDataSet({ ...good, valence: 0 }), "invalid-valence");
  assert.equal(validateDataSet({ ...good, valence: 2.5 }), "invalid-valence");
  assert.equal(validateDataSet({ ...good, molarMass: 0 }), "invalid-molar-mass");
  assert.equal(validateDataSet({ ...good, groups: [] }), "invalid-group-count");
  assert.equal(
    validateDataSet({ ...good, groups: Array.from({ length: 7 }, () => good.groups[0]) }),
    "invalid-group-count"
  );
  assert.equal(validateDataSet({ ...good, groups: [{ ...good.groups[0], label: "" }] }), "invalid-label");
  assert.equal(validateDataSet({ ...good, groups: [{ ...good.groups[0], current: 0 }] }), "invalid-current");
  assert.equal(validateDataSet({ ...good, groups: [{ ...good.groups[0], current: "x" }] }), "invalid-current");
  assert.equal(validateDataSet({ ...good, groups: [{ ...good.groups[0], timeSeconds: -1 }] }), "invalid-time");
  assert.equal(validateDataSet({ ...good, groups: [{ ...good.groups[0], massBefore: NaN }] }), "invalid-mass-before");
  assert.equal(validateDataSet({ ...good, groups: [{ ...good.groups[0], massAfter: Infinity }] }), "invalid-mass-after");
});

test("multi-group set computes each group independently", () => {
  const r = computeDataSet(
    {
      valence: SN2_VALENCE,
      molarMass: SN_MOLAR_MASS,
      groups: [
        { label: "K1", current: 0.058, timeSeconds: 900, massBefore: 1.0, massAfter: 1.028 },
        { label: "K2", current: 0.058, timeSeconds: 900, massBefore: 1.0, massAfter: 1.040 },
        { label: "K3", current: 0.058, timeSeconds: 900, massBefore: 1.0, massAfter: 1.020 },
      ],
    },
    true
  );
  assert.equal(r.groups.length, 3);
  assert.ok(r.groups[0].efficiency < 100);
  assert.ok(r.groups[1].overHundred);
  assert.ok(r.groups[2].efficiency < r.groups[1].efficiency);
});
