import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const outputDir = "artifacts/presenter-review";
mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: "reduce",
  storageState: "tests/e2e/m4-guest-state.json",
});

const page = await context.newPage();

// Unlock instructor
await page.request.post("http://localhost:3000/api/m4-guided/unlock", {
  headers: { Origin: "http://localhost:3000" },
  data: { code: "1920" },
});

await page.goto("http://localhost:3000/modules/m4-sn-bi-electrodeposition");

// Open session
await page.getByRole("button", { name: "Buka Sesi" }).click();
await page.waitForTimeout(500);

// Capture Slide 1
await page.screenshot({ path: `${outputDir}/slide1-presenter.png` });
console.log("Captured slide 1");

// Click Slide 7
const dock = page.locator("[data-presenter-dock]");
await dock.getByLabel(/7\.\s*Selisih/i).click();
await page.waitForTimeout(500);

// Capture Slide 7
await page.screenshot({ path: `${outputDir}/slide7-presenter.png` });
console.log("Captured slide 7");

await browser.close();
console.log("Screenshots captured successfully in", outputDir);
