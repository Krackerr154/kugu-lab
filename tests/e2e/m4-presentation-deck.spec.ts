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
    await expect(consoleEl).toContainText("Slide 1 dari 19");
    await expect(consoleEl).toContainText("Review Praktikum Modul 4 — Sintesis Paduan Sn–Bi");

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
    await expect(studentDeck).toContainText("Slide 1 dari 19");
    await expect(studentDeck).toContainText("Review Praktikum Modul 4");

    await presenterPage.close();
    await studentPage.close();
  });

  test("advancing to Slide 7 synchronizes both views and renders potential gap diagram", async ({ context }) => {
    const presenterPage = await context.newPage();
    await presenterPage.emulateMedia({ reducedMotion: "reduce" });
    await presenterPage.goto(presenterRoute);
    await expect(presenterPage.locator("[data-presenter-console]")).toBeVisible({ timeout: 10000 });

    const studentPage = await context.newPage();
    await studentPage.emulateMedia({ reducedMotion: "reduce" });
    await studentPage.goto(presentationRoute);
    const studentDeck = studentPage.locator("[data-student-slide-deck]");
    await expect(studentDeck).toBeVisible({ timeout: 10000 });

    // Presenter jumps to Slide 7 (Selisih potensial)
    const slide7Btn = presenterPage.locator("button").filter({ hasText: /^7$/ });
    await expect(slide7Btn).toBeVisible();
    await slide7Btn.click();

    // Verify presenter view on Slide 7
    await expect(presenterPage.locator("[data-presenter-console]")).toContainText("Slide 7 dari 19");
    await expect(presenterPage.locator("[data-potential-gap-diagram]")).toBeVisible();
    await expect(presenterPage.getByText("Selisih potensial reduksi sebesar 0,45 Volt")).toBeVisible();
    await expect(presenterPage.getByText("Poin f.1")).toBeVisible();

    // Verify student view synchronously updates to Slide 7
    await expect(studentDeck).toContainText("Slide 7 dari 19");
    await expect(studentDeck.locator("[data-potential-gap-diagram]")).toBeVisible();
    await expect(studentDeck).toContainText("Selisih Potensial Menghambat Kodeposisi");
    await expect(studentDeck.locator("[data-slide-rubric-badge]")).toContainText("Poin f.1");

    await presenterPage.close();
    await studentPage.close();
  });

  test("student bounded read-back displays drift banner and allows instant snap-back", async ({ context }) => {
    const presenterPage = await context.newPage();
    await presenterPage.emulateMedia({ reducedMotion: "reduce" });
    await presenterPage.goto(presenterRoute);
    await expect(presenterPage.locator("[data-presenter-console]")).toBeVisible({ timeout: 10000 });

    const studentPage = await context.newPage();
    await studentPage.emulateMedia({ reducedMotion: "reduce" });
    await studentPage.goto(presentationRoute);
    const studentDeck = studentPage.locator("[data-student-slide-deck]");
    await expect(studentDeck).toBeVisible({ timeout: 10000 });

    // Presenter jumps to Slide 4
    const slide4Btn = presenterPage.locator("button").filter({ hasText: /^4$/ });
    await slide4Btn.click();
    await expect(studentDeck).toContainText("Slide 4 dari 19");

    // Student clicks Previous button to read Slide 3
    const prevBtn = studentDeck.getByRole("button", { name: "Slide sebelumnya" });
    await prevBtn.click();

    // Student sees Slide 3 and drift banner appears
    await expect(studentDeck).toContainText("Slide 3 dari 19");
    const driftBanner = studentDeck.locator("[data-slide-drift-banner]");
    await expect(driftBanner).toBeVisible();
    await expect(driftBanner).toContainText("Anda sedang membaca Slide 3");
    await expect(driftBanner).toContainText("Asisten memandu di Slide 4");

    // Student clicks 'Kembali ke Posisi Asisten'
    const returnBtn = driftBanner.getByRole("button", { name: "Kembali ke Posisi Asisten" });
    await returnBtn.click();

    // Student view is restored to Slide 4 and drift banner disappears
    await expect(studentDeck).toContainText("Slide 4 dari 19");
    await expect(driftBanner).not.toBeVisible();

    await presenterPage.close();
    await studentPage.close();
  });

  test("Slide 18 renders report format guide and Slide 19 renders games", async ({ context }) => {
    const presenterPage = await context.newPage();
    await presenterPage.emulateMedia({ reducedMotion: "reduce" });
    await presenterPage.goto(presenterRoute);
    await expect(presenterPage.locator("[data-presenter-console]")).toBeVisible({ timeout: 10000 });

    const studentPage = await context.newPage();
    await studentPage.emulateMedia({ reducedMotion: "reduce" });
    await studentPage.goto(presentationRoute);
    const studentDeck = studentPage.locator("[data-student-slide-deck]");
    await expect(studentDeck).toBeVisible({ timeout: 10000 });

    // Presenter jumps to Slide 18 (Format Laporan)
    const slide18Btn = presenterPage.locator("button").filter({ hasText: /^18$/ });
    await slide18Btn.click();

    await expect(presenterPage.locator("[data-report-format]")).toBeVisible();
    await expect(studentDeck.locator("[data-report-format]")).toBeVisible();

    // Presenter jumps to Slide 19 (Penutup & Games)
    const slide19Btn = presenterPage.locator("button").filter({ hasText: /^19$/ });
    await slide19Btn.click();

    await expect(presenterPage.locator("[data-asprak-games]")).toBeVisible();
    await expect(studentDeck.locator("[data-review-games]")).toBeVisible();

    await presenterPage.close();
    await studentPage.close();
  });
});
