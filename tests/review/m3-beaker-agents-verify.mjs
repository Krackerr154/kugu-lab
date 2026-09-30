import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { cellFrame } from "../../lib/m3-simulation.ts";
import { bathAgentFrame } from "../../lib/m3-ligands.ts";

const out = "artifacts/m3-beaker-agents";
mkdirSync(out, { recursive: true });
let sampledCases = 0;
for (const complexed of [true, false]) {
  for (const view of ["cell", "closeup"]) {
    for (let tick = 0; tick <= 240; tick++) {
      const frame = cellFrame(tick / 20, complexed);
      const agents = bathAgentFrame(frame, view);
      assert.deepEqual(agents, bathAgentFrame(frame, view));
      assert.equal(agents.ligands.length, complexed ? 4 : 0);
      assert.equal(agents.peg === null, !complexed, `peg drawn only in the complexed bath (complexed=${complexed})`);
      for (const point of [...agents.ligands, ...(agents.peg ? [agents.peg] : [])]) assert(Number.isFinite(point.x) && Number.isFinite(point.y));
      if (complexed && tick === 240) assert(agents.ligands.every((ligand) => ligand.phase === "released"));
      sampledCases++;
    }
  }
}
const examples = bathAgentFrame(cellFrame(0, true), "cell").ligands;
for (const agent of ["edta", "citrate"]) assert.deepEqual([...new Set(examples.filter((ligand) => ligand.agent === agent).map((ligand) => ligand.species))].sort(), ["bi", "sn"]);

const widths = [320, 390, 768, 1024, 1440, 1920];
const report = { sampledCases, expectedViewports: widths.length, viewports: [], motion: null };
const browser = await chromium.launch();
try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce", storageState: "tests/e2e/m4-guest-state.json" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("http://localhost:3000/modules/m4-sn-bi-electrodeposition", { waitUntil: "domcontentloaded" });
    const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
    const beaker = sim.getByTestId("m3-cell-scene");
    const row = { width, phases: [], errors };
    for (let step = 0; step < 5; step++) {
      if (step) await sim.getByRole("button", { name: "Langkah berikutnya" }).click();
      const state = await beaker.evaluate((svg) => {
        const liquid = svg.querySelector('[data-cell-component="electrolyte"]').getBoundingClientRect();
        return [...svg.querySelectorAll("[data-ligand]")].map((element) => {
          const rect = element.getBoundingClientRect();
          return { id: element.dataset.ligand, phase: element.dataset.phase,
            inside: rect.left >= liquid.left - 1 && rect.right <= liquid.right + 1 && rect.top >= liquid.top - 1 && rect.bottom <= liquid.bottom + 1 };
        });
      });
      assert.equal(state.length, 4);
      assert(state.every((ligand) => ligand.inside), `ligand outside liquid at ${width}px step ${step}`);
      row.phases.push(state);
    }
    for (const [id, label] of [["citrate", "Sitrat"], ["edta", "EDTA"], ["peg400", "PEG400"]]) {
      const hotspot = beaker.getByRole("button", { name: `Detail ${label} di beaker`, exact: true });
      await hotspot.focus();
      await page.keyboard.press(id === "edta" ? "Enter" : "Space");
      const touch = sim.getByRole("button", { name: `Sorot agen ${label}`, exact: true });
      const rect = await touch.boundingBox();
      assert(rect.width >= 44 && rect.height >= 44);
      await expect(touch).toHaveAttribute("aria-pressed", "true");
      await expect(hotspot).not.toHaveAttribute("aria-controls");
    }
    await expect(sim.getByRole("region", { name: "Agen dalam beaker" })).toHaveCount(0);
    await sim.getByRole("button", { name: "Dengan pengompleks", exact: true }).click();
    await expect(beaker.locator("[data-ligand]")).toHaveCount(0);
    await expect(beaker.locator('[data-agent-layer="peg400"]')).toHaveCount(0);
    await sim.getByRole("button", { name: "Sorot agen EDTA", exact: true }).click();
    await expect(sim.getByRole("button", { name: "Sorot agen EDTA", exact: true })).toHaveAttribute("aria-pressed", "true");
    await sim.getByRole("button", { name: "Tanpa pengompleks", exact: true }).click();
    await sim.getByRole("button", { name: "Ulangi dari awal" }).click();
    await sim.getByRole("button", { name: "Langkah berikutnya" }).click();
    row.overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(row.overflow <= 1, `overflow at ${width}px: ${row.overflow}`);
    assert.deepEqual(errors, []);
    if ([390, 1440, 1920].includes(width)) {
      await sim.screenshot({ path: `${out}/${width}-agents.png`, style: '.no-print, nextjs-portal { visibility: hidden !important; }' });
    }
    report.viewports.push(row);
    writeFileSync(`${out}/evidence.json`, JSON.stringify(report, null, 2));
    console.log(`PASS ${width}px: five frames, liquid containment, three agent controls, removed detail panel, comparison`);
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference", storageState: "tests/e2e/m4-guest-state.json" });
  await page.goto("http://localhost:3000/modules/m4-sn-bi-electrodeposition", { waitUntil: "domcontentloaded" });
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  const ligand = sim.getByTestId("m3-cell-scene").locator('[data-ligand="edta-0"]');
  await sim.getByRole("button", { name: "Jalankan Sel", exact: true }).click();
  await expect(sim).toHaveAttribute("data-playing", "true");
  const before = await ligand.boundingBox();
  await page.waitForTimeout(350);
  const after = await ligand.boundingBox();
  const displacement = Math.hypot(after.x - before.x, after.y - before.y);
  assert(displacement > 2, "ligand must visibly move rather than only change its phase attribute");
  await sim.getByRole("button", { name: "Jeda Sel", exact: true }).click();
  const paused = await ligand.getAttribute("transform");
  await page.waitForTimeout(250);
  assert.equal(await ligand.getAttribute("transform"), paused);
  report.motion = { sampledDisplacementPx: displacement, pauseHoldsPose: true };
  console.log("PASS real ligand movement and pause", JSON.stringify(report.motion));
} finally {
  writeFileSync(`${out}/evidence.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
assert.equal(report.viewports.length, report.expectedViewports);
assert.equal(new Set(report.viewports.map((row) => row.width)).size, widths.length);
console.log(`PASS ${sampledCases} deterministic model cases and ${report.viewports.length}/${widths.length} viewport cases`);
