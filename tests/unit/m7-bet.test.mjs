import test from "node:test";
import assert from "node:assert/strict";

import {
  BET_CONSTANTS,
  CONCLUSION_QUESTIONS,
  EXCEL_STEPS,
  GIVEN_COLUMNS,
  GUIDE_RESULTS,
  ISOTHERM_TYPES,
  PORE_SITE_COUNT,
  betResult,
  betTransform,
  filledSites,
  iupacCurve,
  iupacVolume,
  linearFit,
  poreCurve,
  poreSites,
  poreVolume,
  withinWindow,
} from "../../lib/m7-bet.ts";

test("konstanta sesuai panduan slide 11", () => {
  assert.equal(BET_CONSTANTS.molarMassN2, 28.0134);
  assert.equal(BET_CONSTANTS.molarVolume, 22414);
  assert.equal(BET_CONSTANTS.avogadro, 6.0221e23);
  assert.equal(BET_CONSTANTS.crossSection, 1.62e-19); // 0,162 nm2
  assert.equal(BET_CONSTANTS.windowMin, 0.05);
  assert.equal(BET_CONSTANTS.windowMax, 0.3);
});

test("enam tipe isoterm IUPAC lengkap", () => {
  assert.equal(ISOTHERM_TYPES.length, 6);
  assert.deepEqual(
    ISOTHERM_TYPES.map((t) => t.id),
    ["I", "II", "III", "IV", "V", "VI"]
  );
  for (const t of ISOTHERM_TYPES) {
    assert.ok(t.shape.length > 0, `${t.id} tanpa ciri kurva`);
    assert.ok(t.material.length > 0, `${t.id} tanpa material`);
  }
  // hanya IV dan V yang punya histeresis menurut panduan
  assert.deepEqual(
    ISOTHERM_TYPES.filter((t) => t.hysteresis).map((t) => t.id),
    ["IV", "V"]
  );
});

test("kurva IUPAC naik monoton dan berada di 0..1", () => {
  for (const t of ISOTHERM_TYPES) {
    const pts = iupacCurve(t.id);
    assert.ok(pts.length > 10);
    for (let i = 0; i < pts.length; i++) {
      assert.ok(pts[i].v >= -1e-9, `${t.id} negatif di x=${pts[i].x}`);
      assert.ok(pts[i].v <= 1.35, `${t.id} terlalu besar di x=${pts[i].x}`);
      if (i > 0) {
        assert.ok(pts[i].v >= pts[i - 1].v - 0.02, `${t.id} turun di x=${pts[i].x}`);
      }
    }
  }
});

test("tipe IV dan V punya loop histeresis, tipe I/II/III tidak", () => {
  for (const id of ["IV", "V"]) {
    const ads = iupacVolume(id, 0.6, "ads");
    const des = iupacVolume(id, 0.6, "des");
    assert.ok(des < ads, `${id} tidak menunjukkan histeresis`);
  }
  for (const id of ["I", "II", "III", "VI"]) {
    const ads = iupacVolume(id, 0.6, "ads");
    const des = iupacVolume(id, 0.6, "des");
    assert.equal(ads, des, `${id} seharusnya tanpa histeresis`);
  }
});

test("model pori deterministik dan terisi bertahap", () => {
  const a = poreSites();
  const b = poreSites();
  assert.equal(a.length, PORE_SITE_COUNT);
  assert.deepEqual(a, b, "urutan situs harus deterministik");

  // P/P0 0 -> kosong, P/P0 1 -> penuh
  assert.equal(filledSites(0).length, 0);
  assert.equal(filledSites(1).length, PORE_SITE_COUNT);

  // monoton
  let prev = -1;
  for (let i = 0; i <= 20; i++) {
    const f = filledSites(i / 20).length;
    assert.ok(f >= prev, `pengisian mundur di P/P0 ${i / 20}`);
    prev = f;
  }
});

test("volume pori selalu 0..1 dan desorpsi tertinggal dari adsorpsi", () => {
  for (let i = 0; i <= 20; i++) {
    const x = i / 20;
    const v = poreVolume(x, "ads");
    assert.ok(v >= 0 && v <= 1, `volume di luar rentang pada ${x}`);
  }
  // pada P/P0 menengah, cabang desorpsi masih menahan gas lebih banyak
  assert.ok(poreVolume(0.6, "des") >= poreVolume(0.6, "ads"));
  assert.equal(poreVolume(1, "ads"), 1);
  assert.equal(poreCurve("ads").length, 81);
});

test("transformasi BET memakai x/[V(1-x)]", () => {
  const pts = [
    { x: 0.1, v: 100 },
    { x: 0.2, v: 200 },
  ];
  const t = betTransform(pts);
  assert.equal(t[0].y, 0.1 / (100 * 0.9));
  assert.equal(t[1].y, 0.2 / (200 * 0.8));
});

test("regresi linear tepat pada garis sempurna", () => {
  const pts = [0, 1, 2, 3, 4].map((x) => ({ x, y: 2 * x + 5 }));
  const fit = linearFit(pts);
  assert.ok(Math.abs(fit.slope - 2) < 1e-12);
  assert.ok(Math.abs(fit.intercept - 5) < 1e-12);
  assert.ok(Math.abs(fit.r2 - 1) < 1e-12);
});

test("BET menghasilkan C negatif -> status tidak valid", () => {
  // garis dengan intersep negatif, seperti ketiga sampel Al-Fum
  const pts = [0.06, 0.09, 0.12, 0.15, 0.18, 0.22, 0.28].map((x) => ({ x, y: 0.0057 * x - 0.00011 }));
  // balikkan transformasi: y = x/[v(1-x)] -> v = x/[y(1-x)]
  const data = pts.map((p) => ({ x: p.x, v: p.x / (p.y * (1 - p.x)) }));
  const r = betResult(data);
  assert.ok(r);
  assert.ok(r.intercept < 0);
  assert.ok(r.c < 0);
  assert.equal(r.valid, false);
  assert.match(r.status, /tidak valid/i);
});

test("rumus panduan mereproduksi Vm dan S yang dilaporkan", () => {
  // Uji konstanta & susunan rumus terhadap angka panduan (slide 18/20/22).
  const factor = (BET_CONSTANTS.avogadro * BET_CONSTANTS.crossSection) / BET_CONSTANTS.molarVolume;

  for (const g of GUIDE_RESULTS) {
    const vm = 1 / (g.slope + g.intercept);
    const area = vm * factor;
    assert.ok(
      Math.abs(vm - g.vm) / g.vm < 0.005,
      `${g.sample}: Vm hitung ${vm.toFixed(2)} vs panduan ${g.vm}`
    );
    assert.ok(
      Math.abs(area - g.surfaceArea) / g.surfaceArea < 0.005,
      `${g.sample}: S hitung ${area.toFixed(1)} vs panduan ${g.surfaceArea}`
    );
  }
});

test("ketiga sampel panduan memang tidak valid", () => {
  for (const g of GUIDE_RESULTS) {
    assert.ok(g.intercept < 0, `${g.sample}: intersep seharusnya negatif`);
    assert.ok(g.c < 0, `${g.sample}: C seharusnya negatif`);
    assert.equal(g.valid, false, `${g.sample}: harus ditandai tidak valid`);
  }
  assert.equal(GUIDE_RESULTS.length, 3);
});

test("filter jendela BET memakai 0,05 sampai 0,30", () => {
  const pts = [0.01, 0.05, 0.1, 0.2, 0.29, 0.3, 0.31, 0.5].map((x) => ({ x, v: 100 }));
  const kept = withinWindow(pts).map((p) => p.x);
  assert.deepEqual(kept, [0.05, 0.1, 0.2, 0.29, 0.3]);
});
test("tutorial Excel memuat enam langkah berurutan", () => {
  assert.equal(EXCEL_STEPS.length, 6);
  assert.deepEqual(
    EXCEL_STEPS.map((s) => s.id),
    ["siapkan", "plot", "bet", "regresi", "hitung", "validasi"]
  );
  for (const s of EXCEL_STEPS) {
    assert.ok(s.title.trim().length > 0, "judul langkah kosong");
    assert.ok(s.bullets.length > 0, `${s.id} tanpa butir`);
  }
});

test("rumus Excel sama dengan panduan", () => {
  const byCell = new Map();
  for (const step of EXCEL_STEPS) {
    for (const c of step.cells ?? []) byCell.set(c.cell, c.formula);
    for (const b of step.basis ?? []) for (const c of b.cells) byCell.set(c.cell, c.formula);
  }

  assert.equal(byCell.get("J16"), "=H16/(I16*(1-H16))");
  assert.equal(byCell.get("O16"), "=N16/$B$5*$B$4");
  assert.equal(byCell.get("P16"), "=M16/(O16*(1-M16))");
  assert.equal(byCell.get("I29"), "=1/(I25+I26)");
  assert.equal(byCell.get("I30"), "=I25/I26+1");
  assert.equal(byCell.get("I31"), "=B6*B7/B5");
  assert.equal(byCell.get("I32"), "=I29*I31");
  assert.match(byCell.get("I33"), /IF\(I30<=0/);
  assert.match(byCell.get("I33"), /C negatif, BET tidak valid/);
});

test("konstanta tutorial cocok dengan konstanta modul", () => {
  const cells = new Map(EXCEL_STEPS[0].cells.map((c) => [c.cell, c.formula]));
  assert.equal(cells.get("B4"), "28,0134");
  assert.equal(cells.get("B5"), "22414");
  assert.equal(cells.get("B6"), "6,0221E+23");
  assert.equal(cells.get("B7"), "1,62E-19");
  assert.equal(cells.get("B8"), "0,05");
  assert.equal(cells.get("B9"), "0,3");

  // nilai yang sama dengan BET_CONSTANTS, hanya beda notasi desimal
  assert.equal(Number(cells.get("B4").replace(",", ".")), BET_CONSTANTS.molarMassN2);
  assert.equal(Number(cells.get("B5")), BET_CONSTANTS.molarVolume);
  assert.equal(Number(cells.get("B8").replace(",", ".")), BET_CONSTANTS.windowMin);
  assert.equal(Number(cells.get("B9").replace(",", ".")), BET_CONSTANTS.windowMax);
});

test("kolom data yang diberikan sesuai panduan slide 10", () => {
  assert.equal(GIVEN_COLUMNS.length, 4);
  assert.deepEqual(
    GIVEN_COLUMNS.map((c) => c.column),
    ["P/P₀ adsorpsi", "V adsorpsi", "P/P₀ desorpsi", "V desorpsi"]
  );
  assert.equal(GIVEN_COLUMNS[1].unit, "cm³/g STP");
});

test("rentang titik BET tiap sampel sesuai panduan", () => {
  const bySample = new Map(GUIDE_RESULTS.map((g) => [g.sample, g]));
  assert.equal(bySample.get("Al-Fum 1:2").range, "0,056–0,289");
  assert.equal(bySample.get("Al-Fum 1:3").range, "0,060–0,289");
  assert.equal(bySample.get("Al-Fum 1:4").range, "0,081–0,283");
  for (const g of GUIDE_RESULTS) {
    assert.ok(g.points === 6 || g.points === 7, `${g.sample}: jumlah titik tak wajar`);
  }
});

test("tiga pertanyaan penutup tersedia", () => {
  assert.equal(CONCLUSION_QUESTIONS.length, 3);
  assert.match(CONCLUSION_QUESTIONS[2], /valid/i);
});
