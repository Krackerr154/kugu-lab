import { chromium, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const route = "/modules/m3-sn-bi-electrodeposition";
const output = path.resolve("artifacts/m3-layout-polish");
mkdirSync(output, { recursive: true });
const viewports = [[320, 740], [360, 800], [390, 844], [640, 900], [768, 1024], [844, 390], [1024, 768], [1280, 900], [1440, 900], [1920, 1080], [2560, 1440]];
const stages = ["brief", "understand", "rehearse", "prove", "ready"];
const rows = [];
const browser = await chromium.launch();

try {
  for (const [width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 768, hasTouch: width < 1024, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    const row = { width, height, stages: [], errors, failures: [] };
    const check = (ok, message) => { if (!ok) row.failures.push(message); };
    try {
      const response = await page.goto(base + route, { waitUntil: "domcontentloaded" });
      check(response?.status() === 200, `HTTP ${response?.status()}`);
      await page.waitForFunction(() => document.fonts.status === "loaded", null, { timeout: 15000 });
      const rail = page.getByRole("navigation", { name: "Tahap persiapan modul" });
      await expect(rail).toBeVisible();
      await page.waitForFunction(() => {
        const nav = document.querySelector('nav[aria-label="Tahap persiapan modul"]');
        return nav?.parentElement?.style.getPropertyValue("--journey-offset");
      });
      row.initial = await page.evaluate(() => {
        const header = document.querySelector("h1").closest("header");
        const rail = document.querySelector('nav[aria-label="Tahap persiapan modul"]');
        const p = document.querySelector("#brief .surface-panel > p");
        return {
          headerHeight: header.getBoundingClientRect().height,
          titleWidth: header.querySelector("h1").getBoundingClientRect().width,
          railTop: rail.getBoundingClientRect().top,
          railHeight: rail.getBoundingClientRect().height,
          introFont: getComputedStyle(p).fontSize,
          introLineHeight: getComputedStyle(p).lineHeight,
          introWidth: p.getBoundingClientRect().width,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          h1Count: document.querySelectorAll("h1").length,
          clippedLabels: [...rail.querySelectorAll("ol button span:last-child")].filter((el) => el.getBoundingClientRect().height && el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent.trim()),
        };
      });
      check(row.initial.overflow <= 1, "page overflows horizontally");
      check(row.initial.h1Count === 1, "page needs exactly one h1");
      check(row.initial.clippedLabels.length === 0, `clipped labels: ${row.initial.clippedLabels.join(", ")}`);
      check(row.initial.railHeight <= 68, "rail takes too much vertical space");
      if (width === 390 || width === 1920) await page.screenshot({ path: path.join(output, `${width}-arrival.png`) });

      for (const id of [...stages, "understand", "brief"]) {
        if (width < 768) await rail.getByRole("combobox").selectOption(id);
        else await rail.locator("ol button").nth(stages.indexOf(id)).click();
        await expect.poll(async () => {
          const data = await page.evaluate((stageId) => {
            const nav = document.querySelector('nav[aria-label="Tahap persiapan modul"]');
            const navRect = nav.getBoundingClientRect();
            const heading = document.getElementById(`${stageId}-heading`).getBoundingClientRect();
            const active = nav.querySelector("select").value;
            return { active, gap: heading.top - navRect.bottom, top: heading.top };
          }, id);
          return data.active === id && data.gap >= 0 && data.top < 280;
        }, { timeout: 5000 }).toBe(true);
        row.stages.push(id);
      }
      const rect = await rail.boundingBox();
      check(Math.abs(rect.y - (width < 1024 ? 64 : 80)) <= 1, "rail does not pin below global header");
      check((await rail.getByRole("button").count()) === (width < 768 ? 2 : 5), "wrong breakpoint navigation controls");

      // All reagent dialogs remain contained and their close control is reachable.
      for (const name of ["EDTA", "Asam Sitrat", "PEG400"]) {
        const card = page.locator('#understand button[aria-haspopup="dialog"]').filter({ has: page.getByRole("heading", { name, exact: true }) });
        await card.click();
        const dialog = page.getByRole("dialog");
        const close = dialog.getByRole("button", { name: /^Tutup penjelasan/ });
        await expect(close).toBeFocused();
        await dialog.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)));
        const box = await dialog.boundingBox();
        const closeBox = await close.boundingBox();
        check(box.x >= 0 && box.x + box.width <= width && box.y >= 0 && box.y + box.height <= height, `${name} dialog exceeds viewport`);
        check(closeBox.width >= 44 && closeBox.height >= 44, `${name} close target is too small`);
        if (width === 390 && name === "EDTA") await page.screenshot({ path: path.join(output, "390-reagent-dialog.png") });
        await page.keyboard.press("Escape");
        await expect(card).toBeFocused();
      }
      if (width === 390 || width === 1920) {
        await page.locator("#understand").evaluate((el) => el.scrollIntoView());
        await page.screenshot({ path: path.join(output, `${width}-understand.png`) });
      }
    } catch (error) {
      row.failures.push(error.message);
    } finally {
      check(errors.length === 0, `browser errors: ${errors.join(" | ")}`);
      rows.push(row);
      writeFileSync(path.join(output, "responsive-evidence.json"), JSON.stringify({ expectedViewports: viewports.length, checkedViewports: rows.length, rows }, null, 2));
      await context.close();
      console.log(`${row.failures.length ? "FAIL" : "PASS"} ${width}x${height} ${JSON.stringify(row.initial)} ${row.failures.join(" | ")}`);
    }
  }
} finally {
  await browser.close();
}
const failed = rows.filter((row) => row.failures.length);
console.log(JSON.stringify({ expected: viewports.length, checked: rows.length, passed: rows.length - failed.length, failed: failed.length, evidence: output }));
process.exitCode = failed.length || rows.length !== viewports.length ? 1 : 0;
