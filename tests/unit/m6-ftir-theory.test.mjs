import test from "node:test";
import assert from "node:assert/strict";

import {
  FTIR_BAND_REGION_LABEL,
  FTIR_BANDS,
  FTIR_THEORY_BANDS,
  checkAssignment,
  intensityOf,
  regionOf,
  shapeOf,
} from "../../lib/m6-ftir-bands.ts";

const centers = new Set(FTIR_BANDS.map((b) => b.center));
const diagnosticCenters = FTIR_BANDS.filter((b) => b.diagnostic).map((b) => b.center);
const bandAt = (center) => FTIR_BANDS.find((b) => b.center === center);

test("setiap baris tabel punya posisi, gugus, dan keterangan", () => {
  assert.ok(FTIR_THEORY_BANDS.length >= 11, "tabel identifikasi terlalu pendek");
  for (const row of FTIR_THEORY_BANDS) {
    assert.ok(row.position.trim().length > 0, "posisi kosong");
    assert.ok(row.group.trim().length > 0, "gugus kosong");
    assert.ok(row.note.trim().length > 0, "keterangan kosong");
  }
});

test("tabel tidak boleh memuat pita yang tidak ada di model", () => {
  for (const row of FTIR_THEORY_BANDS) {
    assert.ok(
      centers.has(row.anchor),
      `anchor ${row.anchor} (${row.position}) tidak ada di FTIR_BANDS — tabel mengarang pita`
    );
  }
});

test("setiap pita bertanda muncul tepat satu kali di tabel", () => {
  const seen = new Map();
  for (const row of FTIR_THEORY_BANDS) {
    seen.set(row.anchor, (seen.get(row.anchor) ?? 0) + 1);
  }
  for (const band of FTIR_BANDS.filter((b) => b.marked)) {
    assert.equal(
      seen.get(band.center),
      1,
      `pita ${band.center} cm⁻¹ muncul ${seen.get(band.center)} kali`
    );
  }
  for (const [center, count] of seen) {
    assert.equal(count, 1, `baris ${center} cm⁻¹ duplikat`);
  }
});

test("semua pita diagnostik tercakup", () => {
  const anchors = new Set(FTIR_THEORY_BANDS.map((r) => r.anchor));
  for (const center of diagnosticCenters) {
    assert.ok(anchors.has(center), `pita diagnostik ${center} cm⁻¹ tidak ada di tabel`);
  }
  assert.equal(diagnosticCenters.length, 4, "jumlah pita diagnostik berubah");
});

test("intensitas diturunkan dari depth pita, bukan diketik manual", () => {
  assert.equal(intensityOf(54), "Kuat");
  assert.equal(intensityOf(45), "Kuat");
  assert.equal(intensityOf(44), "Sedang");
  assert.equal(intensityOf(30), "Sedang");
  assert.equal(intensityOf(29), "Lemah");

  for (const row of FTIR_THEORY_BANDS) {
    const band = bandAt(row.anchor);
    assert.equal(
      row.intensity,
      intensityOf(band.depth),
      `${row.anchor} cm⁻¹: intensitas tidak cocok dengan depth ${band.depth}`
    );
  }
});

test("bentuk pita diturunkan dari width pita", () => {
  assert.equal(shapeOf(430), "Sangat lebar");
  assert.equal(shapeOf(120), "Sangat lebar");
  assert.equal(shapeOf(119), "Lebar");
  assert.equal(shapeOf(60), "Lebar");
  assert.equal(shapeOf(59), "Tajam");

  for (const row of FTIR_THEORY_BANDS) {
    const band = bandAt(row.anchor);
    assert.equal(row.shape, shapeOf(band.width), `${row.anchor} cm⁻¹: bentuk tidak cocok`);
  }
});

test("daerah ditentukan oleh posisi dan jenis sampel", () => {
  assert.equal(regionOf(3480, "al-fum"), "functional");
  assert.equal(regionOf(1500, "al-fum"), "functional");
  assert.equal(regionOf(1430, "al-fum"), "fingerprint");
  assert.equal(regionOf(685, "al-fum"), "fingerprint");
  assert.equal(regionOf(2350, "atmosfer"), "artefact");

  for (const row of FTIR_THEORY_BANDS) {
    const band = bandAt(row.anchor);
    assert.equal(
      row.region,
      regionOf(band.center, band.sample),
      `${row.anchor} cm⁻¹: daerah salah`
    );
  }
});

test("CO2 atmosfer tidak pernah masuk daerah gugus fungsi", () => {
  const co2 = FTIR_THEORY_BANDS.find((r) => r.anchor === 2350);
  assert.ok(co2, "baris CO2 hilang");
  assert.equal(co2.region, "artefact");
  assert.equal(co2.appearsOn, "Keduanya");
  assert.match(co2.group, /CO₂/i);

  const band = bandAt(2350);
  assert.equal(band.assignment, "artefact");
  assert.equal(band.diagnostic, false);
});

test("sampel asal tiap baris cocok dengan model pita", () => {
  const expected = { "asam-fumarat": "Asam fumarat", "al-fum": "Al-Fum", atmosfer: "Keduanya" };
  for (const row of FTIR_THEORY_BANDS) {
    assert.equal(row.appearsOn, expected[bandAt(row.anchor).sample], `${row.anchor} cm⁻¹`);
  }
});

test("baris diurutkan per daerah lalu menurun berdasarkan posisi", () => {
  const order = { functional: 0, fingerprint: 1, artefact: 2 };
  for (let i = 1; i < FTIR_THEORY_BANDS.length; i++) {
    const prev = FTIR_THEORY_BANDS[i - 1];
    const cur = FTIR_THEORY_BANDS[i];
    assert.ok(
      order[prev.region] < order[cur.region] ||
        (order[prev.region] === order[cur.region] && prev.anchor > cur.anchor),
      `urutan salah di ${prev.anchor} -> ${cur.anchor}`
    );
  }
});

test("posisi teks tiap baris mencakup pusat pitanya", () => {
  for (const row of FTIR_THEORY_BANDS) {
    const nums = (row.position.match(/\d+/g) ?? []).map(Number);
    assert.ok(nums.length > 0, `posisi "${row.position}" tidak memuat angka`);
    const inside =
      nums.includes(row.anchor) ||
      (nums.length >= 2 && row.anchor >= Math.min(...nums) && row.anchor <= Math.max(...nums));
    assert.ok(inside, `anchor ${row.anchor} cm⁻¹ berada di luar rentang "${row.position}"`);
  }
});

test("tabel tidak menduplikasi posisi maupun anchor", () => {
  const positions = new Set();
  const anchors = new Set();
  for (const row of FTIR_THEORY_BANDS) {
    assert.ok(!positions.has(row.position), `posisi ${row.position} muncul dua kali`);
    assert.ok(!anchors.has(row.anchor), `anchor ${row.anchor} muncul dua kali`);
    positions.add(row.position);
    anchors.add(row.anchor);
  }
});

test("setiap daerah punya label judul untuk tabel", () => {
  for (const region of ["functional", "fingerprint", "artefact"]) {
    const label = FTIR_BAND_REGION_LABEL[region];
    assert.ok(label.title.length > 0, `label ${region} kosong`);
    assert.ok(label.range.length > 0, `rentang ${region} kosong`);
  }
  assert.match(FTIR_BAND_REGION_LABEL.functional.range, /1500/);
});

test("kunci jawaban workspace menunjuk gugus yang sama dengan tabel", () => {
  const expected = {
    2950: "oh-acid",
    1675: "co-acid",
    1610: "coo-asym",
    1430: "coo-sym",
    1231: "co",
    3480: "water",
    927: "oh-bend",
    685: "skeletal",
    2350: "artefact",
  };

  for (const [center, key] of Object.entries(expected)) {
    const band = bandAt(Number(center));
    assert.ok(band, `pita ${center} cm⁻¹ tidak ada`);
    assert.equal(band.assignment, key, `kunci jawaban ${center} cm⁻¹ berubah`);

    const verdict = checkAssignment(band.id, key);
    assert.ok(verdict, `checkAssignment gagal untuk ${band.id}`);
    assert.equal(verdict.correct, true, `workspace menilai ${center} cm⁻¹ salah untuk ${key}`);
  }
});