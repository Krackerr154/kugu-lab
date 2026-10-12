import { test, expect } from "@playwright/test";

const presenterRoute = "/modules/m4-sn-bi-electrodeposition/presenter";
const presentationRoute = "/modules/m4-sn-bi-electrodeposition/presentation";

test.describe("M4 Presentation Deck & Presenter Console Dual Synchronization", () => {
  test.beforeEach(async ({ context }) => {
    // Unlock instructor on the context
    const page = await context.newPage();
    const unlockRes = await page.request.post("/api/m4-guided/unlock", {
      headers: { Origin: "http://localhost:3000" },
      data: { code: "1920" },
    });
    expect(unlockRes.ok()).toBeTruthy();
    await page.close();
  });

  test("presenter console opens session, shows teleprompter, and renders Slide 1", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(presenterRoute);

    // Presenter console loads
    const consoleEl = page.locator("[data-presenter-console]");
    await expect(consoleEl).toBeVisible({ timeout: 10000 });

    // Live status and title
    await expect(consoleEl).toContainText("Sesi Praktikum KI3131");
    await expect(consoleEl).toContainText("Slide 1 dari 10");
    await expect(consoleEl).toContainText("Tujuan & Output Praktikum");

    // Teleprompter is visible with script
    await expect(consoleEl.getByText("Apa yang Disampaikan ke Praktikan")).toBeVisible();
    await expect(consoleEl).toContainText("Kita sudah selesai praktikum di laboratorium");
  });

  test("student presentation view loads and auto-connects to live session", async ({ context }) => {
    // 1. Open Presenter Console
    const presenterPage = await context.newPage();
    await presenterPage.emulateMedia({ reducedMotion: "reduce" });
    await presenterPage.goto(presenterRoute);
    await expect(presenterPage.locator("[data-presenter-console]")).toBeVisible({ timeout: 10000 });

    // 2. Open Student Presentation View
    const studentPage = await context.newPage();
    await studentPage.emulateMedia({ reducedMotion: "reduce" });
    await studentPage.goto(presentationRoute);

    const studentDeck = studentPage.locator("[data-student-slide-deck]");
    await expect(studentDeck).toBeVisible({ timeout: 10000 });

    // Student view displays Slide 1
    await expect(studentDeck).toContainText("Slide 1 dari 10");
    await expect(studentDeck).toContainText("Tujuan & Output Praktikum");

    await presenterPage.close();
    await studentPage.close();
  });

  test("advancing to Slide 5 synchronizes both views and renders potential gap diagram", async ({ context }) => {
    const presenterPage = await context.newPage();
    await presenterPage.emulateMedia({ reducedMotion: "reduce" });
    await presenterPage.goto(presenterRoute);
    await expect(presenterPage.locator("[data-presenter-console]")).toBeVisible({ timeout: 10000 });

    const studentPage = await context.newPage();
    await studentPage.emulateMedia({ reducedMotion: "reduce" });
    await studentPage.goto(presentationRoute);
    const studentDeck = studentPage.locator("[data-student-slide-deck]");
    await expect(studentDeck).toBeVisible({ timeout: 10000 });

    // Presenter jumps to Slide 5 (Selisih potensial Sn vs Bi)
    const slide5Btn = presenterPage.locator("button").filter({ hasText: /^5$/ });
    await expect(slide5Btn).toBeVisible();
    await slide5Btn.click();

    // Verify presenter view on Slide 5
    await expect(presenterPage.locator("[data-presenter-console]")).toContainText("Slide 5 dari 10");
    await expect(presenterPage.locator("[data-potential-gap-diagram]")).toBeVisible();
    await expect(presenterPage.getByText("Bismut dan timah memiliki selisih potensial reduksi")).toBeVisible();
    await expect(presenterPage.getByText("Poin f.1")).toBeVisible();

    // Verify student view synchronously updates to Slide 5
    await expect(studentDeck).toContainText("Slide 5 dari 10");
    await expect(studentDeck.locator("[data-potential-gap-diagram]")).toBeVisible();
    await expect(studentDeck).toContainText("Selisih Potensial Menghambat Kodeposisi");
    await expect(studentDeck.locator("[data-slide-rubric-badge]")).toContainText("Poin f.1");

    await presenterPage.close();
    await studentPage.close();
  });

  test("student bounded read-back displays drift state and allows instant snap-back via action dial", async ({ context }) => {
    const presenterPage = await context.newPage();
    await presenterPage.emulateMedia({ reducedMotion: "reduce" });
    await presenterPage.goto(presenterRoute);
    await expect(presenterPage.locator("[data-presenter-console]")).toBeVisible({ timeout: 10000 });

    const studentPage = await context.newPage();
    await studentPage.emulateMedia({ reducedMotion: "reduce" });
    await studentPage.goto(presentationRoute);
    const studentDeck = studentPage.locator("[data-student-slide-deck]");
    await expect(studentDeck).toBeVisible({ timeout: 10000 });

    // Presenter jumps to Slide 3
    const slide3Btn = presenterPage.locator("button").filter({ hasText: /^3$/ });
    await slide3Btn.click();
    await expect(studentDeck).toContainText("Slide 3 dari 10");

    // Student clicks Previous button to read Slide 2
    const prevBtn = studentDeck.getByRole("button", { name: "Slide sebelumnya" });
    await prevBtn.click();

    // Student sees Slide 2
    await expect(studentDeck).toContainText("Slide 2 dari 10");

    // Student opens the action dial menu
    const dialTrigger = studentDeck.locator("[data-deck-action-dial] > button");
    await dialTrigger.click();

    // The snap-back button is enabled
    const returnBtn = studentDeck.getByRole("menuitem", { name: "Kembali ke Asisten" });
    await expect(returnBtn).toBeEnabled();
    await returnBtn.click();

    // Student view is restored to Slide 3
    await expect(studentDeck).toContainText("Slide 3 dari 10");

    await presenterPage.close();
    await studentPage.close();
  });

  test("Slide 9 renders report rubric cards and Slide 10 renders games", async ({ context }) => {
    const presenterPage = await context.newPage();
    await presenterPage.emulateMedia({ reducedMotion: "reduce" });
    await presenterPage.goto(presenterRoute);
    await expect(presenterPage.locator("[data-presenter-console]")).toBeVisible({ timeout: 10000 });

    const studentPage = await context.newPage();
    await studentPage.emulateMedia({ reducedMotion: "reduce" });
    await studentPage.goto(presentationRoute);
    const studentDeck = studentPage.locator("[data-student-slide-deck]");
    await expect(studentDeck).toBeVisible({ timeout: 10000 });

    // Presenter jumps to Slide 9 (Format Laporan)
    const slide9Btn = presenterPage.locator("button").filter({ hasText: /^9$/ });
    await slide9Btn.click();

    await expect(presenterPage.locator("[data-report-rubric-cards]")).toBeVisible();
    await expect(studentDeck.locator("[data-report-rubric-cards]")).toBeVisible();

    // Presenter jumps to Slide 10 (Penutup & Games)
    const slide10Btn = presenterPage.locator("button").filter({ hasText: /^10$/ });
    await slide10Btn.click();

    await expect(presenterPage.locator("[data-asprak-games]")).toBeVisible();
    await expect(studentDeck.locator("[data-review-games]")).toBeVisible();

    await presenterPage.close();
    await studentPage.close();
  });
});
