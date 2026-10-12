import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

test("capture multiple mobile slides", async ({ page }) => {
  mkdirSync("artifacts/mobile-audit", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://localhost:3000/modules/m4-sn-bi-electrodeposition/presentation");

  await page.waitForSelector("[data-student-slide-deck]");
  await page.waitForTimeout(1000);

  // Capture slide 1
  await page.screenshot({ path: "artifacts/mobile-audit/slide1-390.png" });

  // Go through a few slides
  for (const s of [2, 3, 5, 7, 9, 11, 13]) {
    // click slide dot or button
    const dot = page.locator(`button[aria-label^="Slide ${s}:"]`);
    if (await dot.count() > 0) {
      await dot.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `artifacts/mobile-audit/slide${s}-390.png` });
    }
  }
});
