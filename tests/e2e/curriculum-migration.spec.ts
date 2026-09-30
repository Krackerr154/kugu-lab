import { expect, test } from "@playwright/test";

const visibleModules = [
  { number: 1, href: "/modules/m1-alfum-mof", state: "placeholder" },
  { number: 2, href: "/modules/m2-zeolite-fau", state: "active" },
  { number: 3, href: "/modules/m3-sno2-precipitation", state: "placeholder" },
  { number: 4, href: "/modules/m4-sn-bi-electrodeposition", state: "active" },
  { number: 5, href: "/modules/m5-xrd", state: "active" },
  { number: 6, href: "/modules/m6-ftir-tga", state: "partial" },
  { number: 7, href: "/modules/m7-bet", state: "placeholder" },
] as const;

test.describe("revised curriculum shell", () => {
  test("shows the seven revised modules and hides legacy qualitative content", async ({ page }) => {
    await page.goto("/modules", { waitUntil: "domcontentloaded" });

    const cards = page.locator("[data-module-card]");
    await expect(cards).toHaveCount(7);

    for (const module of visibleModules) {
      const card = page.locator(`[data-module-card][data-module-number=\"${module.number}\"]`);
      await expect(card).toHaveAttribute("href", module.href);
      await expect(card).toHaveAttribute("data-module-state", module.state);
    }

    await expect(page.getByText("Reaksi Golongan Utama", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Mg2SnO4", { exact: true })).toHaveCount(0);
  });

  test("keeps the Sn-Bi experience available as Module 4", async ({ page }) => {
    await page.goto("/modules/m4-sn-bi-electrodeposition", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Modul 4", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Tin-Bismuth/i })).toBeVisible();
  });

  test("keeps the former Sn-Bi URL as a non-breaking compatibility route", async ({ page }) => {
    await page.goto("/modules/m3-sn-bi-electrodeposition", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Modul 4", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Tin-Bismuth/i })).toBeVisible();
  });

  test("renders explicit placeholders for new curriculum chapters", async ({ page }) => {
    for (const path of ["/modules/m1-alfum-mof", "/modules/m3-sno2-precipitation", "/modules/m7-bet"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByText("Konten modul sedang disiapkan", { exact: true })).toBeVisible();
      await expect(page.getByText(/placeholder/i).first()).toBeVisible();
    }
  });

  test("uses Module 4 for the Sn-Bi pre-lab entry", async ({ page }) => {
    await page.goto("/prelab", { waitUntil: "domcontentloaded" });

    const moduleFour = page.locator('a[href="/prelab/m4-sn-bi-electrodeposition"]');
    await expect(moduleFour).toBeVisible();
    await expect(page.getByText("Reaksi Golongan Utama", { exact: true })).toHaveCount(0);
  });

  test("keeps placeholder actions honest and legacy pre-lab links working", async ({ page }) => {
    await page.goto("/modules/m1-alfum-mof", { waitUntil: "domcontentloaded" });
    await expect(page.locator('a[href="/modules/m1-alfum-mof"]').filter({ hasText: "Buka modul" })).toBeVisible();
    await expect(page.getByText("Pre-Lab Rehearsal", { exact: true })).toHaveCount(0);

    await page.goto("/modules/m1-reactions", { waitUntil: "domcontentloaded" });
    await expect(page.locator('a[href="/prelab/m1-reactions"]')).toBeVisible();
  });

  test("exposes the revised analysis entry points and hides retired reference terms", async ({ page }) => {
    await page.goto("/analisis", { waitUntil: "domcontentloaded" });
    await expect(page.locator('a[href="/modules/m7-bet"]')).toBeVisible();

    await page.goto("/referensi", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Fotokatalisis", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Kation", { exact: true })).toHaveCount(0);
  });

  test("Zeolite content exposes the revised Module 2 accessibility label", async ({ page }) => {
    await page.goto("/modules/m2-zeolite-fau", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("group", { name: "Worksheet Modul 2" })).toBeVisible();
  });
});
