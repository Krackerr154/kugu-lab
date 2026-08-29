import { test, expect, type Page } from "@playwright/test";

const VIEWPORTS = [
  { name: "Mobile Small (Android)", width: 360, height: 740 },
  { name: "Mobile Standard (iPhone 14/15)", width: 390, height: 844 },
  { name: "Mobile Large (Phablet)", width: 480, height: 853 },
  { name: "Tablet Portrait (iPad Mini/Air)", width: 768, height: 1024 },
  { name: "Tablet Landscape / Small Laptop", width: 1024, height: 768 },
  { name: "Standard Desktop", width: 1280, height: 800 },
  { name: "Full HD Desktop", width: 1920, height: 1080 },
];

const PAGES_TO_TEST = [
  { name: "Dashboard", path: "/" },
  { name: "Modules Hub", path: "/modules" },
  { name: "M1 Reactions Module", path: "/modules/m1-reactions" },
  { name: "M1 Pre-lab Staged Journey", path: "/prelab/m1-reactions" },
  { name: "M2 Synthesis Module", path: "/modules/m2-mg2sno4" },
  { name: "M5 XRD Characterization", path: "/modules/m5-xrd" },
  { name: "Lab Notebook", path: "/notebook" },
  { name: "Data Analysis", path: "/analisis" },
  { name: "Reports & Checklist", path: "/laporan" },
  { name: "Safety & References", path: "/referensi" },
  { name: "Instructor Room", path: "/pengajar" },
];

/**
 * Finds all elements that cause horizontal overflow beyond viewport width
 */
async function getHorizontalOverflowElements(page: Page) {
  return await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const overflowing: { tag: string; id: string; className: string; scrollWidth: number; clientWidth: number; rectWidth: number; right: number }[] = [];

    if (scrollWidth > docWidth + 1) { // 1px threshold for subpixel rounding
      const allElements = document.querySelectorAll("*");
      for (const el of Array.from(allElements)) {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 1 || el.scrollWidth > docWidth + 1) {
          overflowing.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || "",
            className: el.className ? String(el.className).slice(0, 80) : "",
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            rectWidth: Math.round(rect.width),
            right: Math.round(rect.right),
          });
        }
      }
    }
    return {
      docWidth,
      scrollWidth,
      hasOverflow: scrollWidth > docWidth + 1,
      overflowingCount: overflowing.length,
      overflowingSample: overflowing.slice(0, 5),
    };
  });
}

test.describe("Dynamic Responsive Page Width Audit", () => {
  for (const vp of VIEWPORTS) {
    test.describe(`${vp.name} (${vp.width}x${vp.height})`, () => {
      for (const pageInfo of PAGES_TO_TEST) {
        test(`${pageInfo.name} (${pageInfo.path}) fits without horizontal overflow`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(pageInfo.path, { waitUntil: "domcontentloaded" });
          // Wait for any animations / dynamic rendering to settle
          await page.waitForTimeout(300);

          const overflowData = await getHorizontalOverflowElements(page);
          if (overflowData.hasOverflow) {
            console.warn(
              `[OVERFLOW DETECTED] ${pageInfo.name} at ${vp.width}px. DocWidth: ${overflowData.docWidth}px, ScrollWidth: ${overflowData.scrollWidth}px`,
              overflowData.overflowingSample
            );
          }

          expect(
            overflowData.hasOverflow,
            `Expected no horizontal overflow on ${pageInfo.path} at ${vp.width}px. (Doc: ${overflowData.docWidth}px, Scroll: ${overflowData.scrollWidth}px). Offending elements: ${JSON.stringify(overflowData.overflowingSample)}`
          ).toBe(false);
        });
      }
    });
  }

  test("Dynamic live viewport resizing (1920px -> 360px -> 1440px) maintains layout integrity", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Step down smoothly through viewports
    const widthsToTest = [1920, 1440, 1280, 1024, 900, 768, 640, 480, 390, 360];
    
    for (const w of widthsToTest) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.waitForTimeout(100);
      const overflow = await getHorizontalOverflowElements(page);
      expect(
        overflow.hasOverflow,
        `Horizontal overflow during dynamic resize to ${w}px on /`
      ).toBe(false);
    }

    // Step back up
    for (const w of widthsToTest.reverse()) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.waitForTimeout(100);
      const overflow = await getHorizontalOverflowElements(page);
      expect(
        overflow.hasOverflow,
        `Horizontal overflow during dynamic resize expanding to ${w}px on /`
      ).toBe(false);
    }
  });

  test("Navigation elements adapt correctly between mobile and desktop viewports", async ({ page }) => {
    // Mobile viewport (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/modules/m1-reactions");
    await page.waitForTimeout(200);

    const mobileHeaderVisible = await page.locator("header").filter({ hasText: "KUGU Lab" }).first().isVisible();
    expect(mobileHeaderVisible).toBe(true);

    // Desktop viewport (1280px)
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForTimeout(200);

    const desktopRailVisible = await page.locator("aside").first().isVisible();
    expect(desktopRailVisible).toBe(true);
  });
});
