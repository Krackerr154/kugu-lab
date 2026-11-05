import test from "node:test";
import assert from "node:assert/strict";

import {
  ALFUM_SAMPLES,
  ALFUM_STANDARD_REFLECTIONS,
  ANATOMY_AMPLITUDE,
  ANATOMY_FWHM_DEG,
  ANATOMY_WINDOW_HALF_WIDTH,
  GUIDE_SCHERRER_D011_NM,
  XRD_CONSTANTS,
  XRD_SCAN,
  XRD_SCAN_POINTS,
  anatomyPeakAreaPx,
  anatomyPeakCapture,
  dSpacing,
  diffractogram,
  disorderPattern,
  matchPeakToStandard,
  measureAnatomyPeak,
  orderStageLabel,
  scherrerD,
  seededRandom,
} from "../../lib/m5-xrd.ts";

test("konstanta sesuai panduan", () => {
  assert.equal(XRD_CONSTANTS.K, 0.9);
  assert.equal(XRD_CONSTANTS.lambdaNm, 0.154059); // Cu Kα1 (nm)
  assert.equal(XRD_CONSTANTS.lambdaA, 1.54059); // Cu Kα1 (Å)
  assert.equal(XRD_CONSTANTS.matchToleranceDeg, 0.5); // ±0,5° (slide 21)
});

test("refleksi standar Al-Fum sesuai tabel slide 31", () => {
  assert.equal(ALFUM_STANDARD_REFLECTIONS.length, 6);
  assert.deepEqual(
    ALFUM_STANDARD_REFLECTIONS.map((r) => r.hkl),
    ["011", "020 / 002 / -102", "022", "033", "044", "055"]
  );
  assert.deepEqual(
    ALFUM_STANDARD_REFLECTIONS.map((r) => r.twoThetaStd),
    [10.39, 14.65, 20.87, 31.52, 42.47, 53.84]
  );
});

test("tiga sampel Al-Fum lengkap dengan FWHM dan kristalinitas slide 32", () => {
  assert.equal(ALFUM_SAMPLES.length, 3);
  for (const s of ALFUM_SAMPLES) {
    assert.equal(s.shift.length, ALFUM_STANDARD_REFLECTIONS.length);
  }
  const byId = Object.fromEntries(ALFUM_SAMPLES.map((s) => [s.id, s]));
  assert.equal(byId["1:2"].fwhm011Deg, 0.327);
  assert.equal(byId["1:3"].fwhm011Deg, 0.373);
  assert.equal(byId["1:4"].fwhm011Deg, 0.358);
  assert.equal(byId["1:2"].crystallinityRelPct, 100);
  assert.equal(byId["1:3"].crystallinityRelPct, 93.7);
  assert.equal(byId["1:4"].crystallinityRelPct, 43.5);
});

test("scan 5–80° langkah 0,05° = 1501 titik (slide 10)", () => {
  assert.equal(XRD_SCAN.min, 5);
  assert.equal(XRD_SCAN.max, 80);
  assert.equal(XRD_SCAN.step, 0.05);
  assert.equal(XRD_SCAN_POINTS, 1501);
});

test("difraktogram deterministik: seed sama = data sama", () => {
  const a = diffractogram("1:2", 42);
  const b = diffractogram("1:2", 42);
  assert.equal(a.length, XRD_SCAN_POINTS);
  assert.deepEqual(a, b);
  const c = diffractogram("1:2", 43);
  assert.notDeepEqual(a, c);
});

test("pola standar: puncak utuh tanpa halo amorf", () => {
  const std = diffractogram("standard", 7);
  // persis di posisi standar, intensitas harus dekat nilai relatifnya
  for (const r of ALFUM_STANDARD_REFLECTIONS) {
    const near = std.filter((p) => Math.abs(p.x - r.twoThetaStd) < 0.26);
    const maxY = Math.max(...near.map((p) => p.y));
    assert.ok(
      maxY > r.relIntensity * 0.8,
      `puncak ${r.hkl} @ ${r.twoThetaStd}° terlalu rendah: ${maxY}`
    );
  }
  // di tengah-tengah antar puncak (mis. 60°), hanya noise kecil
  const mid = std.find((p) => p.x === 60);
  assert.ok(mid && mid.y < 12, `baseline standar tidak bersih: ${mid && mid.y}`);

});

test("posisi puncak sampel bergeser sesuai tabel slide 31", () => {
  for (const s of ALFUM_SAMPLES) {
    const pat = diffractogram(s.id, 11);
    ALFUM_STANDARD_REFLECTIONS.forEach((r, i) => {
      const expected = r.twoThetaStd + s.shift[i];
      const window = pat.filter((p) => Math.abs(p.x - expected) < 0.4);
      const sumY = window.reduce((a, p) => a + p.y, 0);
      const centroid = window.reduce((a, p) => a + p.x * p.y, 0) / sumY;
      assert.ok(
        Math.abs(centroid - expected) <= 0.04,
        `${s.id} ${r.hkl}: centroid ${centroid.toFixed(3)}°, diharapkan ${expected}°`
      );
    });
  }
});

test("Scherrer mereproduksi D(011) panduan (24,4 / 21,4 / 22,3 nm)", () => {
  for (const s of ALFUM_SAMPLES) {
    const twoTheta011 = ALFUM_STANDARD_REFLECTIONS[0].twoThetaStd + s.shift[0];
    const D = scherrerD(twoTheta011, s.fwhm011Deg);
    const expected = GUIDE_SCHERRER_D011_NM[s.id];
    assert.ok(
      Math.abs(D - expected) < 0.1,
      `${s.id}: D = ${D.toFixed(2)} nm, diharapkan ${expected} nm`
    );
  }
});

test("kristalinitas relatif tercermin pada tinggi halo amorf", () => {
  const haloMid = (id) => {
    const pat = diffractogram(id, 13);
    // 45° berada jauh dari semua puncak → di sana hampir hanya halo + noise
    return pat.find((p) => p.x === 45).y;
  };
  const h2 = haloMid("1:2");
  const h3 = haloMid("1:3");
  const h4 = haloMid("1:4");
  assert.ok(h2 < h3, "1:2 harus punya halo terkecil");
  assert.ok(h3 < h4, "1:4 harus punya halo terbesar");
});

test("matchPeakToStandard memakai toleransi ±0,5°", () => {
  const m = matchPeakToStandard(10.31);
  assert.ok(m);
  assert.equal(m.hkl, "011");
  assert.ok(Math.abs(m.deltaDeg + 0.08) < 1e-9);

  const atEdge = matchPeakToStandard(10.39 + 0.5);
  assert.equal(atEdge.hkl, "011");

  const justOutside = matchPeakToStandard(10.39 + 0.51);
  assert.equal(justOutside, null);

  const unidentified = matchPeakToStandard(60);
  assert.equal(unidentified, null);
});

test("d-spacing konsisten dengan 2θ", () => {
  const d = dSpacing(10.39);
  // 1,54059 / (2 sin 5,195°) ≈ 8,506 Å
  assert.ok(Math.abs(d - 8.506) < 0.01, `d = ${d}`);
});

test("seededRandom deterministik dan di [0,1)", () => {
  const r1 = seededRandom(99);
  const r2 = seededRandom(99);
  const a = r1();
  assert.equal(a, r2());
  assert.ok(a >= 0 && a < 1);
});

test("continuum disorder: kristalin → amorf melebar dan menumbuhkan halo", () => {
  const kristalin = disorderPattern(0);
  const semikristalin = disorderPattern(0.5);
  const amorf = disorderPattern(1);

  // FWHM naik monoton
  assert.ok(kristalin.fwhmDeg < semikristalin.fwhmDeg);
  assert.ok(semikristalin.fwhmDeg < amorf.fwhmDeg);
  assert.equal(kristalin.fwhmDeg, 0.15);
  assert.ok(amorf.fwhmDeg > 3);

  // kristalinitas = 100% → 0%
  assert.equal(kristalin.crystallinityPct, 100);
  assert.ok(amorf.crystallinityPct < 1);

  // puncak tajam menyusut: kaki puncak (10,39° VS 10,89°) hampir rata saat
  // amorf, sangat terjal saat kristalin
  const yAt = (pat, x) => {
    const p = pat.points.reduce((m, q) =>
      Math.abs(q.x - x) < Math.abs(m.x - x) ? q : m
    );
    return p.y;
  };
  const peakC = yAt(kristalin, 10.39);
  const shoulderC = yAt(kristalin, 10.89);
  const peakA = yAt(amorf, 10.39);
  const shoulderA = yAt(amorf, 10.89);
  assert.ok(peakC > 80, `puncak kristalin ${peakC}`);
  const staircaseC = peakC - shoulderC;
  const staircaseA = peakA - shoulderA;
  assert.ok(staircaseA < staircaseC * 0.2, `kaki amorf ${staircaseA} vs kristalin ${staircaseC}`);

  // halo naik: di 45° (jauh dari puncak)
  const haloC = yAt(kristalin, 45);
  const haloA = yAt(amorf, 45);
  assert.ok(haloC < haloA, `halo kristalin ${haloC} vs amorf ${haloA}`);

  // tinggi amorf harus rendah (gundukan lebar ~25 a.u., tidak menjulang melebihi kristalin)
  const maxAmorf = Math.max(...amorf.points.map((p) => p.y));
  assert.ok(maxAmorf < 35, `gundukan amorf terlalu tinggi: ${maxAmorf}`);
  assert.ok(maxAmorf > 18, `gundukan amorf terlalu rendah: ${maxAmorf}`);

  // deterministik
  assert.deepEqual(disorderPattern(0.5), disorderPattern(0.5));
});

test("label tahap keteraturan sesuai slide 5", () => {
  assert.equal(orderStageLabel(0), "Kristalin — puncak tajam");
  assert.equal(orderStageLabel(0.2), "Kristalin — puncak tajam");
  assert.equal(orderStageLabel(0.3), "Semikristalin — puncak tajam di atas gundukan lebar");
  assert.equal(orderStageLabel(0.7), "Semikristalin — puncak tajam di atas gundukan lebar");
  assert.equal(orderStageLabel(0.9), "Amorf — hanya gundukan lebar");
  assert.equal(orderStageLabel(1), "Amorf — hanya gundukan lebar");
});

test("anatomi: FWHM diukur dari setengah tinggi puncak DI ATAS latar lokal", () => {
  for (const r of ALFUM_STANDARD_REFLECTIONS) {
    const m = measureAnatomyPeak(r);
    // Setengah-maksimum = baseline + tinggi/2, BUKAN setengah nilai mentah.
    assert.ok(
      Math.abs(m.halfMaxY - (m.baselineY + m.heightAboveBase / 2)) < 1e-9,
      `${r.hkl}: halfMaxY salah`
    );
    assert.ok(m.halfMaxY > m.baselineY, `${r.hkl}: setengah-maksimum di bawah baseline`);
    assert.ok(m.apexY > m.halfMaxY, `${r.hkl}: puncak tidak di atas setengah-maksimum`);
    // Lebar terukur harus mereproduksi lebar puncak yang dipakai menggambar
    assert.ok(
      Math.abs(m.fwhmDeg - ANATOMY_FWHM_DEG) < 0.01,
      `${r.hkl}: FWHM ${m.fwhmDeg} vs ${ANATOMY_FWHM_DEG}`
    );
    // Simetris terhadap pusat puncak
    const centre = r.twoThetaStd;
    assert.ok(Math.abs((m.leftTwoTheta + m.rightTwoTheta) / 2 - centre) < 0.01, `${r.hkl}: tidak simetris`);
  }
});

test("anatomi: setengah nilai mentah BUKAN setengah maksimum", () => {
  // Bug lama: memakai apexY/2 sebagai level setengah-maksimum. Untuk puncak
  // yang berdiri di atas gundukan halo, level itu jatuh di BAWAH latar lokal
  // dan garis ukurnya memotong jauh ke luar puncak (FWHM palsu).
  // Puncak 011 di atas halo: apex/2 hanya sedikit di atas baseline, sehingga
  // garis ukurnya memotong di KAKI puncak dan melaporkan lebar ~3° (bukan 0,55°).
  const r = ALFUM_STANDARD_REFLECTIONS[0];
  const m = measureAnatomyPeak(r);
  const wrongLevel = m.apexY / 2;
  assert.ok(
    wrongLevel < m.halfMaxY,
    `011: apex/2=${wrongLevel.toFixed(2)} seharusnya di bawah setengah-maksimum ${m.halfMaxY.toFixed(2)}`
  );
  // Level yang benar harus di atas baseline, dan lebarnya tetap sempit.
  assert.ok(m.halfMaxY > m.baselineY, "setengah-maksimum harus di atas baseline");
  assert.ok(m.fwhmDeg < 1, `FWHM melebar ${m.fwhmDeg}`);

  // Untuk semua puncak: lebar terukur konsisten dan setengah-maksimum selalu
  // berada tepat di tengah antara baseline dan apex.
  for (const refl of ALFUM_STANDARD_REFLECTIONS) {
    const a = measureAnatomyPeak(refl);
    assert.ok(
      Math.abs(a.halfMaxY - (a.baselineY + (a.apexY - a.baselineY) / 2)) < 1e-9,
      `${refl.hkl}: halfMaxY tidak di tengah`
    );
    assert.ok(a.halfMaxY > a.baselineY, `${refl.hkl}: halfMaxY di bawah baseline`);
  }
});

test("anatomi: luas puncak tergambar = integral kurva minus latar lokal", () => {
  const r = ALFUM_STANDARD_REFLECTIONS[3];
  const m = measureAnatomyPeak(r);
  const lo = m.apexTwoTheta - ANATOMY_WINDOW_HALF_WIDTH;
  const hi = m.apexTwoTheta + ANATOMY_WINDOW_HALF_WIDTH;

  // Luas dalam piksel²: konversi kedua sumbu ke piksel dulu, karena poligon
  // yang digambar hidup di koordinat layar, bukan di (derajat × a.u.).
  const PX_PER_DEG = 838 / 75;
  const PX_PER_AU = 336 / 112;
  const areaPx = anatomyPeakAreaPx(lo, hi, PX_PER_DEG, PX_PER_AU);
  assert.ok(areaPx > 0, `luas negatif/nol: ${areaPx}`);

  // Sama dengan luas Gaussian analitik, dikonversi ke piksel.
  const amp = r.relIntensity * ANATOMY_AMPLITUDE;
  const sigma = ANATOMY_FWHM_DEG / (2 * Math.sqrt(2 * Math.log(2)));
  const expectedPx = amp * sigma * Math.sqrt(2 * Math.PI) * PX_PER_DEG * PX_PER_AU;
  assert.ok(
    Math.abs(areaPx - expectedPx) / expectedPx < 0.02,
    `luas ${areaPx.toFixed(1)} px² vs teoritis ${expectedPx.toFixed(1)} px²`
  );

  // Latar halo TIDAK boleh ikut terhitung sebagai luas puncak.
  const baselineOnly = (() => {
    // area antara latar lokal dan dirinya sendiri = 0, jadi luas yang
    // dilaporkan harus sepenuhnya berasal dari kontribusi puncak.
    return anatomyPeakCapture(r, lo, hi);
  })();
  assert.ok(baselineOnly > 0.999, `jendela ukur kehilangan ${(1 - baselineOnly) * 100}% area puncak`);
});
