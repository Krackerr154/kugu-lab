import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { cellFrame } from "../../lib/m3-simulation.ts";
import { pegGrowthFrame } from "../../lib/m3-peg-growth.ts";

const out = "artifacts/m3-peg-dendrites";
mkdirSync(out, { recursive: true });
const times = new Set(Array.from({ length: 1201 }, (_, i) => i / 100));
for (let i = 0; i < 24; i++) for (const delta of [-0.000001, 0, 0.000001]) times.add(3.3 + i * 0.35 + delta);
let modelCases = 0;
for (const complexed of [false, true]) for (const time of times) {
  const base = cellFrame(time, complexed);
  const views = [false, true].map((peg) => pegGrowthFrame(base, peg));
  assert.equal(views[0].deposited.length, views[1].deposited.length);
  for (const [index, frame] of views.entries()) {
    assert.deepEqual(frame, pegGrowthFrame(base, Boolean(index)));
    const nodes = new Map(frame.deposited.map((atom) => [atom.id, atom]));
    for (const atom of frame.deposited) {
      assert(atom.x >= 18 && atom.x <= 232 && atom.y >= 18 && atom.y <= 132);
      if (atom.parent === -1) assert.equal(atom.x + 8, 240);
      else {
        const parent = nodes.get(atom.parent);
        assert(parent, "a growing branch needs an already deposited parent");
        assert(Math.hypot(parent.x - atom.x, parent.y - atom.y) <= Math.hypot(16, 16));
      }
    }
    for (const chain of frame.adsorbates) {
      const front = frame.deposited.filter((atom) => atom.row === chain.row).reduce((x, atom) => Math.min(x, atom.x - 8), 240);
      assert.equal(chain.surfaceX, front);
      if (chain.phase === "adsorbed") assert.equal(chain.x, front - 5);
    }
    const previous = pegGrowthFrame(cellFrame(Math.max(0, time - 0.001), complexed), Boolean(index));
    assert(previous.deposited.every((atom) => nodes.has(atom.id)), "growth must persist, not erase old dendrites");
    modelCases++;
  }
}
for (const time of [NaN, Infinity, -5, 100]) {
  assert(Number.isFinite(pegGrowthFrame(cellFrame(time, true), true).elapsed));
}

const widths = [320, 390, 768, 1024, 1440, 1920];
const report = { modelCases, expectedViewports: widths.length, viewports: [], motion: null };
const save = () => writeFileSync(`${out}/evidence.json`, JSON.stringify(report, null, 2));
// Optional transport fallback for environments where Google Fonts stalls on QUIC.
// This still downloads the real fonts; no responses or layout assertions are mocked.
const browser = await chromium.launch({ args: process.env.KUGU_VERIFY_NO_QUIC ? ["--disable-quic"] : [] });
try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce", storageState: "tests/e2e/m4-guest-state.json" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto("http://localhost:3000/modules/m4-sn-bi-electrodeposition", { waitUntil: "domcontentloaded" });
    const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
    await sim.getByTestId("m3-cell-scene").getByRole("button", { name: "Detail PEG400 di beaker" }).focus();
    await page.keyboard.press("Enter");
    const lesson = sim.getByRole("region", { name: "PEG400 dan pertumbuhan dendrit" });
    await expect(lesson).toBeVisible();
    await sim.getByRole("button", { name: "Ke pembesaran PEG400", exact: true }).click();
    await expect(lesson).toBeFocused();
    for (const label of ["1. Adsorpsi", "2. Situs terhambat", "3. Pertumbuhan tersebar"]) {
      const button = lesson.getByRole("button", { name: label, exact: true });
      await button.focus();
      await page.keyboard.press("Space");
      await expect(button).toHaveAttribute("aria-pressed", "true");
    }
    const measurements = await lesson.evaluate((element) => {
      const controls = [...element.querySelectorAll("button")].map((e) => { const r=e.getBoundingClientRect(); return { width:r.width, height:r.height, clipped:e.scrollWidth > e.clientWidth+1 }; });
      const geometry = [...element.querySelectorAll("svg")].map((svg) => {
        const b=svg.getBoundingClientRect();
        return [...svg.querySelectorAll("[data-growth-node], [data-peg-site]")].every((e) => { const r=e.getBoundingClientRect(); return r.left>=b.left && r.right<=b.right && r.top>=b.top && r.bottom<=b.bottom; });
      });
      return { controls, geometry, overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth };
    });
    assert(measurements.overflow <= 1, `overflow at ${width}px: ${measurements.overflow}`);
    assert(measurements.geometry.every(Boolean));
    assert(measurements.controls.every((c) => c.width>=44 && c.height>=44 && !c.clipped));
    assert.deepEqual(errors, []);
    if ([390, 1440, 1920].includes(width)) await sim.screenshot({ path:`${out}/${width}-peg.png`, style:'.no-print, nextjs-portal { visibility:hidden !important; }' });
    await sim.getByRole("button", { name: "Sorot agen EDTA", exact: true }).click();
    await expect(lesson).toHaveCount(0);
    await expect(sim.getByTestId("m3-agents-closeup")).toBeVisible();
    report.viewports.push({ width, ...measurements, errors });
    save();
    await page.close();
    console.log(`PASS ${width}px: morphology bounds, three keyboard steps, focus jump, original view restored`);
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference", storageState: "tests/e2e/m4-guest-state.json" });
  await page.goto("http://localhost:3000/modules/m4-sn-bi-electrodeposition", { waitUntil: "domcontentloaded" });
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  await sim.getByRole("button", { name:"Sorot agen PEG400", exact:true }).click();
  const lesson = sim.getByRole("region", { name:"PEG400 dan pertumbuhan dendrit" });
  const chain = lesson.locator("[data-peg-site]").first();
  await sim.getByRole("button", { name:"Jalankan Sel", exact:true }).click();
  await expect(sim).toHaveAttribute("data-playing", "true");
  const before = await chain.boundingBox();
  await page.waitForTimeout(350);
  const after = await chain.boundingBox();
  const dx = Math.abs(after.x-before.x);
  assert(dx>2, "PEG must visibly approach the surface");
  await sim.getByRole("button", { name:"Jeda Sel", exact:true }).click();
  const stopped = await chain.getAttribute("transform");
  await page.waitForTimeout(250);
  assert.equal(await chain.getAttribute("transform"), stopped);
  await lesson.getByRole("button", { name:"2. Situs terhambat", exact:true }).click();
  const initialCount = await lesson.locator("[data-growth-node]").count();
  await sim.getByRole("button", { name:"Jalankan Sel", exact:true }).click();
  await expect.poll(() => lesson.locator("[data-growth-node]").count()).toBeGreaterThan(initialCount);
  await page.emulateMedia({ reducedMotion:"reduce" });
  await expect(sim).toHaveAttribute("data-playing", "false");
  report.motion = { pegDisplacementPx:dx, pauseStable:true, growthObserved:true, preferenceChangeStopsPlayback:true };
  save();
} finally { save(); await browser.close(); }
assert.equal(report.viewports.length, widths.length);
assert.equal(new Set(report.viewports.map((v) => v.width)).size, widths.length);
console.log(`PASS ${modelCases} model cases and ${report.viewports.length}/${widths.length} viewports`, JSON.stringify(report.motion));
