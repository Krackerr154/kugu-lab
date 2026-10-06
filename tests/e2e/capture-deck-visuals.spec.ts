import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const presenterRoute = "/modules/m4-sn-bi-electrodeposition/presenter";
const presentationRoute = "/modules/m4-sn-bi-electrodeposition/presentation";

test.describe("Visual QA Capture for Slide Deck & Presenter Console", () => {
  test.beforeAll(() => {
    mkdirSync("artifacts/deck-review", { recursive: true });
  });

  test.beforeEach(async ({ context }) => {
    const page = await context.newPage();
    const unlockRes = await page.request.post("/api/m4-guided/unlock", {
      headers: { Origin: "http://localhost:3000" },
      data: { code: "1920" },
    });
    expect(unlockRes.ok()).toBeTruthy();
    await page.close();
  });

  test("capture desktop presenter view on Slide 7 (1440x900)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(presenterRoute);

    const consoleEl = page.locator("[data-presenter-console]");
    await expect(consoleEl).toBeVisible({ timeout: 15000 });

    // Jump to Slide 7
    const slide7Btn = page.locator("button").filter({ hasText: /^7$/ });
    await expect(slide7Btn).toBeVisible();
    await slide7Btn.click();
    await expect(consoleEl).toContainText("Slide 7 dari 19");
    await page.waitForTimeout(600);

    await page.screenshot({ path: "artifacts/deck-review/desktop-presenter-slide7.png" });
  });

  test("capture desktop student slide deck on Slide 7 (1440x900)", async ({ context }) => {
    // 1. Presenter sets Slide 7
    const presenterPage = await context.newPage();
    await presenterPage.setViewportSize({ width: 1440, height: 900 });
    await presenterPage.emulateMedia({ reducedMotion: "reduce" });
    await presenterPage.goto(presenterRoute);
    await expect(presenterPage.locator("[data-presenter-console]")).toBeVisible({ timeout: 15000 });
    const slide7Btn = presenterPage.locator("button").filter({ hasText: /^7$/ });
    await slide7Btn.click();

    // 2. Student opens presentation view
    const studentPage = await context.newPage();
    await studentPage.setViewportSize({ width: 1440, height: 900 });
    await studentPage.emulateMedia({ reducedMotion: "reduce" });
    await studentPage.goto(presentationRoute);

    const studentDeck = studentPage.locator("[data-student-slide-deck]");
    await expect(studentDeck).toBeVisible({ timeout: 15000 });
    await expect(studentDeck).toContainText("Slide 7 dari 19");
    await pageWait(studentPage, 600);

    await studentPage.screenshot({ path: "artifacts/deck-review/desktop-student-slide7.png" });

    await presenterPage.close();
    await studentPage.close();
  });

  test("capture mobile student slide deck on Slide 7 (390x844) and verify zero overflow", async ({ context }) => {
    // 1. Presenter sets Slide 7
    const presenterPage = await context.newPage();
    await presenterPage.emulateMedia({ reducedMotion: "reduce" });
    await presenterPage.goto(presenterRoute);
    await expect(presenterPage.locator("[data-presenter-console]")).toBeVisible({ timeout: 15000 });
    const slide7Btn = presenterPage.locator("button").filter({ hasText: /^7$/ });
    await slide7Btn.click();

    // 2. Student on 390px mobile
    const studentPage = await context.newPage();
    await studentPage.setViewportSize({ width: 390, height: 844 });
    await studentPage.emulateMedia({ reducedMotion: "reduce" });
    await studentPage.goto(presentationRoute);

    const studentDeck = studentPage.locator("[data-student-slide-deck]");
    await expect(studentDeck).toBeVisible({ timeout: 15000 });
    await expect(studentDeck).toContainText("Slide 7 dari 19");
    await pageWait(studentPage, 600);

    // Verify zero horizontal overflow
    const overflow = await studentPage.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);

    await studentPage.screenshot({ path: "artifacts/deck-review/mobile-student-slide7.png" });

    await presenterPage.close();
    await studentPage.close();
  });
});

async function pageWait(page: Page, ms: number) {
  await page.waitForTimeout(ms);
}
