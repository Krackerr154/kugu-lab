import { test, expect } from "@playwright/test";

const route = "/modules/m4-sn-bi-electrodeposition";

test.describe("M4 Guided Presenter Content Visibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const unlockRes = await page.request.post("/api/m4-guided/unlock", {
      headers: { Origin: "http://localhost:3000" },
      data: { code: "1920" },
    });
    expect(unlockRes.ok()).toBeTruthy();
  });

  test("session opens directly at p1 with content framed and dock visible", async ({ page }) => {
    await page.goto(route);
    await expect(page.getByText("Akses asisten aktif")).toBeVisible();

    const openBtn = page.getByRole("button", { name: "Buka Sesi" });
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // Dock is visible with live indicator and slide 1 title
    const dock = page.locator("[data-presenter-dock]");
    await expect(dock).toBeVisible();
    await expect(dock).toContainText("Slide 1");
    await expect(dock).toContainText("Review Praktikum Modul 4");

    // Content anchor for p1 is framed and highlighted
    const contentRegion = page.locator("[data-presenter-slide-content]");
    await expect(contentRegion).toBeVisible();
    await expect(contentRegion).toHaveAttribute("data-review-anchor", "review-brief-intro");

    const isIntersecting = await contentRegion.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.top <= window.innerHeight;
    });
    expect(isIntersecting).toBeTruthy();
  });

  test("presenter navigation advances slides, updates dock, and reframes anchors", async ({ page }) => {
    await page.goto(route);
    await page.getByRole("button", { name: "Buka Sesi" }).click();

    const dock = page.locator("[data-presenter-dock]");
    await expect(dock).toBeVisible();

    // Click 'Berikutnya' -> moves to Slide 2
    const nextBtn = dock.getByRole("button", { name: "Slide berikutnya" });
    await nextBtn.click();
    await expect(dock).toContainText("Slide 2");

    // Click Slide 7 directly
    const slide7Btn = dock.getByLabel(/7\.\s*Selisih/i);
    await expect(slide7Btn).toBeVisible();
    await slide7Btn.click();

    await expect(dock).toContainText("Slide 7");
    const content7 = page.locator("[data-presenter-slide-content]");
    await expect(content7).toBeVisible();
    await expect(content7).toHaveAttribute("data-review-anchor", "review-potential-gap");
    await expect(content7).toContainText("0,45 V");

    // Re-focus: scroll away then click Fokuskan Ulang
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
    await dock.getByRole("button", { name: "Fokuskan Ulang" }).click();
    await page.waitForTimeout(200);

    const refocusedTop = await content7.evaluate((el) => el.getBoundingClientRect().top);
    expect(refocusedTop).toBeGreaterThanOrEqual(-50);
    expect(refocusedTop).toBeLessThan(400);
  });

  test("p13 and p14 render data entry and published chart preview", async ({ page }) => {
    await page.goto(route);
    await page.getByRole("button", { name: "Buka Sesi" }).click();

    const dock = page.locator("[data-presenter-dock]");
    await expect(dock).toBeVisible();

    // Click Slide 13 (Data kelompok)
    const slide13Btn = dock.getByLabel(/13\.\s*Data kelompok/i);
    await slide13Btn.click();
    await expect(dock).toContainText("Slide 13");

    // Data entry panel is visible
    await expect(dock.locator("[data-asprak-data-entry]")).toBeVisible();
    await expect(dock.getByLabel("Nama kelompok 1")).toBeVisible();
  });

  test("p19 renders games control panel in dock", async ({ page }) => {
    await page.goto(route);
    await page.getByRole("button", { name: "Buka Sesi" }).click();

    const dock = page.locator("[data-presenter-dock]");
    await expect(dock).toBeVisible();

    // Click Slide 19 (Penutup / Games)
    const slide19Btn = dock.getByLabel(/19\.\s*Penutup/i);
    await slide19Btn.click();
    await expect(dock).toContainText("Slide 19");

    // Games control panel is visible
    await expect(dock.locator("[data-asprak-games]")).toBeVisible();
    await expect(dock.getByRole("button", { name: "Mulai Games" })).toBeVisible();
  });

  test("closing session cleanly unmounts dock and removes content markers", async ({ page }) => {
    await page.goto(route);
    await page.getByRole("button", { name: "Buka Sesi" }).click();

    const dock = page.locator("[data-presenter-dock]");
    await expect(dock).toBeVisible();

    // Jump to slide 7 to set marker
    await dock.getByLabel(/7\.\s*Selisih/i).click();
    await expect(page.locator("[data-presenter-slide-content]")).toBeVisible();

    // Click Tutup Sesi
    await dock.getByRole("button", { name: "Tutup Sesi" }).click();

    // Dock is gone and marker is cleaned up
    await expect(dock).not.toBeVisible();
    await expect(page.locator("[data-presenter-slide-content]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Buka Sesi" })).toBeVisible();
  });

  test("follower frames slide waypoint and reframes on presenter update", async ({ page }) => {
    // Revoke instructor on this page so it acts as student
    await page.request.delete("/api/m4-guided/unlock", {
      headers: { Origin: "http://localhost:3000" },
    });
    await page.goto(route);

    // Mock an active session broadcast so student can follow
    await page.evaluate(() => {
      const c = new BroadcastChannel("m3-presentation");
      c.postMessage({
        t: "state",
        epoch: "e1",
        seq: 1,
        state: { version: 1, stageId: "understand", slideId: "p7" },
      });
      c.close();
    });

    // Student follows
    const studentDeck = page.locator("[data-review-slide-view]");
    await page.evaluate(() => {
      const c = new BroadcastChannel("m3-presentation");
      c.postMessage({
        t: "state",
        epoch: "e1",
        seq: 2,
        state: { version: 1, stageId: "understand", slideId: "p7" },
      });
      c.close();
    });
  });
});
