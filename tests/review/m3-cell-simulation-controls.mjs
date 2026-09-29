// Controls, species focus, reduced-motion equivalence, hotspots and responsive
// geometry for the seekable M3 illustration (replaces old CSS-loop assertions).
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const output = "artifacts/m3-codeposition";
mkdirSync(output, { recursive: true });
const widths = [320, 390, 768, 1024, 1440, 1920];
const rows = [];
const browser = await chromium.launch();
try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("http://localhost:3000/modules/m3-sn-bi-electrodeposition", { waitUntil: "domcontentloaded" });
    const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
    const timeline = sim.getByRole("slider", { name: "Posisi animasi" });
    await expect(sim.getByRole("button", { name: "Jalankan Sel", exact: true })).toBeDisabled();
    await sim.getByRole("button", { name: "Langkah berikutnya" }).click();
    await sim.getByRole("button", { name: "Langkah berikutnya" }).click();
    await expect(timeline).toHaveValue("50");
    const alloyCount = await sim.locator("[data-deposited-atom]").count();
    assert(alloyCount > 0);
    await sim.getByRole("button", { name: "Sorot Sn", exact: true }).click();
    await expect(sim).toHaveAttribute("data-focus", "sn");
    await expect(sim.getByRole("region", { name: "Reaksi yang diamati" })).toContainText("Reduksi timah");
    await sim.getByRole("button", { name: "Dengan pengompleks", exact: true }).click();
    await expect(timeline).toHaveValue("50");
    await expect(sim.locator('[data-deposited-atom][data-species="sn"]')).toHaveCount(0);
    await expect(sim).toContainText("kaya bismut");
    await sim.getByRole("button", { name: "Sorot H2", exact: true }).click();
    await expect(sim.getByRole("region", { name: "Reaksi yang diamati" })).toContainText("tanpa menambah massa deposit");
    await sim.getByRole("button", { name: "Tanpa pengompleks", exact: true }).click();
    await sim.getByRole("button", { name: "Semua proses", exact: true }).click();
    await timeline.focus();
    await page.keyboard.press("End");
    await expect(timeline).toHaveValue("100");

    const measurements = await sim.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const figures = [...element.querySelectorAll("figure")].map((figure) => {
        const r = figure.getBoundingClientRect();
        return { width: r.width, x: r.x, y: r.y };
      });
      const controls = [...element.querySelectorAll("button, select, input")].map((control) => {
        const r = control.getBoundingClientRect();
        return { label: control.getAttribute("aria-label") ?? control.textContent.trim(), width: r.width, height: r.height };
      });
      const hotspots = [...element.querySelectorAll('[data-testid="m3-cell-scene"] [data-cell-component]')];
      return {
        width: bounds.width, figures, controls,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        hotspotCount: hotspots.length,
        keyboardHotspots: hotspots.every((hotspot) => hotspot.getAttribute("tabindex") === "0" && hotspot.hasAttribute("aria-label") && hotspot.hasAttribute("aria-pressed")),
      };
    });
    assert.equal(measurements.overflow, 0);
    assert.equal(measurements.hotspotCount, 6);
    assert(measurements.keyboardHotspots);
    const hotspots = sim.locator('[data-testid="m3-cell-scene"] [data-cell-component]');
    for (let index = 0; index < measurements.hotspotCount; index++) {
      for (const key of ["Enter", "Space"]) {
        // Select a different component first: a missing handler must fail,
        // rather than inheriting an already-pressed state from the previous key.
        await hotspots.nth(index === 0 ? 1 : 0).click();
        const hotspot = hotspots.nth(index);
        await expect(hotspot).toHaveAttribute("aria-pressed", "false");
        await hotspot.focus();
        await page.keyboard.press(key);
        await expect(hotspot).toHaveAttribute("aria-pressed", "true");
      }
    }
    assert(measurements.controls.every((control) => control.width >= 44 && control.height >= 44), "controls need full-sized tap targets");
    assert(width < 1024 ? measurements.figures[1].y > measurements.figures[0].y : Math.abs(measurements.figures[1].y - measurements.figures[0].y) < 1);
    assert.deepEqual(errors, []);
    if (width === 390 || width === 1440 || width === 1920) {
      await sim.screenshot({
        path: `${output}/${width}-codeposition.png`,
        // Component-only evidence: fixed page chrome otherwise appears midway
        // through a screenshot taller than the viewport. Layout is not changed.
        style: '.no-print, nextjs-portal { visibility: hidden !important; }',
      });
    }
    rows.push({ viewport: width, ...measurements, errors });
    writeFileSync(`${output}/controls-evidence.json`, JSON.stringify({ expected: widths.length, verified: rows.length, rows }, null, 2));
    console.log(`PASS ${width}px: seek, comparison, reaction focus, static fallback, six keyboard hotspots, touch targets, responsive figures`);
    await page.close();
  }
} finally {
  await browser.close();
}
assert.equal(rows.length, widths.length);
assert.equal(new Set(rows.map((row) => row.viewport)).size, widths.length);
console.log(`PASS ${rows.length}/${widths.length} viewport scenarios; evidence ${output}`);
