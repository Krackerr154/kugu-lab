// Verify the deterministic frame model and actual browser motion. Illustration
// counts/times are authored schematic data, never physical composition/yield.
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { cellFrame, METAL_EVENTS, ILLUSTRATION_SECONDS } from "../../lib/m3-simulation.ts";

const output = "artifacts/m3-codeposition";
mkdirSync(output, { recursive: true });
const report = { model: [], motion: {}, errors: [] };
for (const complexed of [true, false]) {
  let previous = 0;
  for (let tick = 0; tick <= 120; tick++) {
    const frame = cellFrame(tick / 10, complexed);
    assert(frame.deposited.length >= previous, "deposit must not shrink while time advances");
    previous = frame.deposited.length;
    assert(frame.ions.every((ion) => ion.x >= 70 && ion.x <= 230 && ion.y >= 75 && ion.y <= 145));
    assert.deepEqual(frame, cellFrame(tick / 10, complexed), "replay must be deterministic");
    for (const row of new Set(frame.deposited.map((ion) => ion.row))) {
      const layers = frame.deposited.filter((ion) => ion.row === row).map((ion) => ion.layer).sort();
      assert.deepEqual(layers, layers.map((_, index) => index), "metal must grow from the substrate, not float over missing atoms");
    }
  }
  const end = cellFrame(ILLUSTRATION_SECONDS, complexed);
  assert.equal(end.deposited.length, METAL_EVENTS.filter((ion) => ion.species === "bi" || complexed).length);
  assert.equal(end.outcome, complexed ? "alloy" : "bismuth-rich");
  if (!complexed) assert(end.ions.filter((ion) => ion.species === "sn").every((ion) => ion.travel === 1 && !ion.deposited));
  report.model.push({ complexed, sampledFrames: 121, illustrationParticles: end.deposited.length, outcome: end.outcome });
}
assert.equal(cellFrame(NaN, true).elapsed, 0);
assert.equal(cellFrame(-3, true).deposited.length, 0);
assert.equal(cellFrame(99, true).elapsed, ILLUSTRATION_SECONDS);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: "no-preference" });
  page.on("pageerror", (error) => report.errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") report.errors.push(message.text()); });
  await page.goto("http://localhost:3000/modules/m3-sn-bi-electrodeposition", { waitUntil: "domcontentloaded" });
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  const timeline = sim.getByRole("slider", { name: "Posisi animasi" });
  await sim.getByRole("button", { name: "Jalankan Sel", exact: true }).click();
  await expect(sim).toHaveAttribute("data-playing", "true");
  const electron = sim.locator('[data-electron="e-up-1"]');
  const before = await electron.getAttribute("cy");
  await expect.poll(() => electron.getAttribute("cy")).not.toBe(before);
  report.motion.electronBefore = before;
  report.motion.electronAfter = await electron.getAttribute("cy");
  await sim.getByRole("combobox", { name: "Kecepatan animasi" }).selectOption("2");
  const fastStart = Number(await sim.getAttribute("data-time"));
  const wallStart = performance.now();
  await page.waitForTimeout(700);
  const wallSeconds = (performance.now() - wallStart) / 1000;
  const simulatedSeconds = Number(await sim.getAttribute("data-time")) - fastStart;
  report.motion.measuredSpeed = simulatedSeconds / wallSeconds;
  assert(report.motion.measuredSpeed > 1.4 && report.motion.measuredSpeed < 2.6, "2x changes the shared clock, not only a label");

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(sim).toHaveAttribute("data-playing", "false");
  const offscreen = await sim.getAttribute("data-time");
  await page.waitForTimeout(350);
  assert.equal(await sim.getAttribute("data-time"), offscreen, "offscreen playback must freeze");
  report.motion.offscreenPausedAt = offscreen;
  await sim.scrollIntoViewIfNeeded();
  await expect(sim).toHaveAttribute("data-playing", "true");
  await sim.getByRole("button", { name: "Jeda Sel", exact: true }).click();
  await timeline.focus();
  await page.keyboard.press("End");
  await expect(timeline).toHaveValue("100");
  const endCount = await sim.locator("[data-deposited-atom]").count();
  await page.waitForTimeout(300);
  assert.equal(await sim.locator("[data-deposited-atom]").count(), endCount);
  report.motion.persistentEndParticles = endCount;
  await expect(sim).toContainText("Ilustrasi selesai");
  assert.deepEqual(report.errors, []);
  console.log("PASS deterministic growth, transport/reduction distinction, real motion, speed, offscreen pause, persistent result");
} finally {
  writeFileSync(`${output}/motion-evidence.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
