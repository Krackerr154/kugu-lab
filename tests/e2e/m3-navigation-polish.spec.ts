import { test, expect } from "@playwright/test";

const route = "/modules/m3-sn-bi-electrodeposition";
const stageIds = ["brief", "understand", "rehearse", "prove", "ready"];

test("M3 keeps the arrival compact while retaining all objectives in a keyboard disclosure", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  const header = page.locator("header").filter({ has: page.getByRole("heading", { level: 1 }) });
  const summary = header.locator("summary");
  await expect(summary).toContainText("Tujuan Pembelajaran");
  await expect(header.locator("li")).toHaveCount(6);
  await expect(header.locator("li").first()).not.toBeVisible();
  expect((await header.boundingBox())!.height).toBeLessThanOrEqual(320);
  const heading = await header.getByRole("heading", { level: 1 }).boundingBox();
  expect(heading!.x - (await header.boundingBox())!.x).toBeLessThanOrEqual(25);
  expect((await page.getByRole("navigation", { name: "Tahap persiapan modul" }).boundingBox())!.y).toBeLessThan(480);
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(header.locator("li").first()).toBeVisible();
  await expect(header.locator("li").last()).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(header.locator("li").first()).not.toBeVisible();

  // Compact presentation is opt-in: neighboring modules keep their objectives open.
  await page.goto("/modules/m2-mg2sno4");
  const neighbor = page.locator("header").filter({ has: page.getByRole("heading", { level: 1 }) });
  await expect(neighbor.locator("summary")).toHaveCount(0);
  await expect(neighbor.locator("li").first()).toBeVisible();
});

test("M3 reading text and reagent dialogs stay legible and touch accessible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(route);
  const intro = await page.locator("#brief .surface-panel > p").first().evaluate((el) => {
    const style = getComputedStyle(el);
    return { font: parseFloat(style.fontSize), line: parseFloat(style.lineHeight), width: el.getBoundingClientRect().width };
  });
  expect.soft(intro.font).toBeGreaterThanOrEqual(16);
  expect.soft(intro.line).toBeGreaterThanOrEqual(24);
  expect.soft(intro.width).toBeLessThanOrEqual(800);

  await page.setViewportSize({ width: 390, height: 844 });
  const card = page.locator('#understand button[aria-haspopup="dialog"]').filter({ has: page.getByRole("heading", { name: "EDTA", exact: true }) });
  await card.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", { name: /^Tutup penjelasan/ });
  await dialog.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)));
  const target = await close.boundingBox();
  expect.soft(target!.width).toBeGreaterThanOrEqual(44);
  expect.soft(target!.height).toBeGreaterThanOrEqual(44);
  const mechanism = await dialog.locator("li").first().evaluate((el) => ({
    font: parseFloat(getComputedStyle(el).fontSize),
    line: parseFloat(getComputedStyle(el).lineHeight),
  }));
  expect.soft(mechanism.font).toBeGreaterThanOrEqual(14);
  expect.soft(mechanism.line).toBeGreaterThanOrEqual(21);
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(card).toBeFocused();
});

test("rapid keyboard stage selections survive normal-motion scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(route);
  const rail = page.getByRole("navigation", { name: "Tahap persiapan modul" });
  const picker = rail.getByRole("combobox", { name: "Pilih tahap persiapan" });
  await page.waitForFunction(() => document.querySelector('nav[aria-label="Tahap persiapan modul"]')?.parentElement?.style.getPropertyValue("--journey-offset"));
  await picker.focus();
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(200); // Deliberately issue the next selection mid-animation.
  await page.keyboard.press("ArrowDown");
  await expect.poll(() => page.locator("#rehearse").evaluate((el) =>
    Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop))
  )).toBeLessThanOrEqual(2);
  await expect(picker).toHaveValue("rehearse");
  await expect(picker).toBeFocused();
  // After programmatic navigation settles, ordinary reading still updates location.
  await page.evaluate(() => document.getElementById("understand")!.scrollIntoView({ behavior: "instant" }));
  await expect(picker).toHaveValue("understand");
});

test("mobile stage navigation keeps every stage reachable without hiding its heading", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const rail = page.getByRole("navigation", { name: "Tahap persiapan modul" });
  const picker = rail.getByRole("combobox", { name: "Pilih tahap persiapan" });
  await expect(picker).toBeVisible();
  await expect(picker.locator("option")).toHaveCount(5);

  for (const id of [...stageIds, "understand", "brief"]) {
    await picker.selectOption(id);
    await expect(picker).toHaveValue(id);
    await expect.poll(async () => {
      const navBox = await rail.boundingBox();
      const heading = await page.locator(`#${id}-heading`).boundingBox();
      return Boolean(navBox && heading && heading.y >= navBox.y + navBox.height && heading.y < 300);
    }).toBe(true);
  }

  const navBox = await rail.boundingBox();
  expect(navBox!.height).toBeLessThanOrEqual(68);
  expect(navBox!.y).toBeCloseTo(64, 0);
  const controls = await rail.locator("select, button").evaluateAll((elements) =>
    elements.filter((el) => el.getBoundingClientRect().height > 0).map((el) => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height, left: r.left, right: r.right };
    })
  );
  for (const control of controls) {
    expect(control.width).toBeGreaterThanOrEqual(44);
    expect(control.height).toBeGreaterThanOrEqual(44);
    expect(control.left).toBeGreaterThanOrEqual(0);
    expect(control.right).toBeLessThanOrEqual(390);
  }

  await expect(rail.getByRole("button", { name: "Tahap sebelumnya" })).toBeDisabled();
  await rail.getByRole("button", { name: "Tahap berikutnya" }).click();
  await expect(picker).toHaveValue("understand");
  await expect(page.locator("#understand-heading")).toBeFocused();

  // Real scrolling, not just click state: moving back up updates the selector.
  await picker.selectOption("ready");
  await expect(rail.getByRole("button", { name: "Tahap berikutnya" })).toBeDisabled();
  await page.evaluate(() => document.getElementById("rehearse")!.scrollIntoView());
  await expect(picker).toHaveValue("rehearse");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(picker).toHaveValue("brief");
});
