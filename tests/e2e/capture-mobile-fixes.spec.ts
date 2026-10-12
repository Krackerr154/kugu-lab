import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

test("capture mobile portrait and landscape visual evidence", async ({ browser }) => {
  mkdirSync("artifacts/mobile-fixes", { recursive: true });

  // 1. Mobile Portrait (390 x 844)
  const portraitContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const pageP = await portraitContext.newPage();
  await pageP.emulateMedia({ reducedMotion: "reduce" });

  await pageP.goto("/modules/m4-sn-bi-electrodeposition/presentation");
  await pageP.waitForSelector("[data-student-slide-deck]");
  await pageP.waitForTimeout(500);
  await pageP.screenshot({ path: "artifacts/mobile-fixes/portrait-slide1.png" });

  const nextBtnP = pageP.getByRole("button", { name: "Slide berikutnya" });
  await nextBtnP.click(); // slide 2
  await nextBtnP.click(); // slide 3
  await nextBtnP.click(); // slide 4
  await pageP.waitForTimeout(300);
  await pageP.screenshot({ path: "artifacts/mobile-fixes/portrait-slide4.png" });

  await nextBtnP.click(); // slide 5
  await pageP.waitForSelector("[data-potential-gap-diagram]");
  await pageP.waitForTimeout(300);
  await pageP.screenshot({ path: "artifacts/mobile-fixes/portrait-slide5.png" });

  await nextBtnP.click(); // slide 6
  await pageP.waitForTimeout(300);
  await pageP.screenshot({ path: "artifacts/mobile-fixes/portrait-slide6.png" });

  await portraitContext.close();

  // 2. Mobile Landscape (844 x 390)
  const landscapeContext = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
  });
  const pageL = await landscapeContext.newPage();
  await pageL.emulateMedia({ reducedMotion: "reduce" });

  await pageL.goto("/modules/m4-sn-bi-electrodeposition/presentation");
  await pageL.waitForSelector("[data-student-slide-deck]");
  await pageL.waitForTimeout(500);
  await pageL.screenshot({ path: "artifacts/mobile-fixes/landscape-slide1.png" });

  const nextBtnL = pageL.getByRole("button", { name: "Slide berikutnya" });
  await nextBtnL.click(); // slide 2
  await nextBtnL.click(); // slide 3
  await nextBtnL.click(); // slide 4
  await pageL.waitForTimeout(300);
  await pageL.screenshot({ path: "artifacts/mobile-fixes/landscape-slide4.png" });

  await nextBtnL.click(); // slide 5
  await pageL.waitForSelector("[data-potential-gap-diagram]");
  await pageL.waitForTimeout(300);
  await pageL.screenshot({ path: "artifacts/mobile-fixes/landscape-slide5.png" });

  await nextBtnL.click(); // slide 6
  await pageL.waitForTimeout(300);
  await pageL.screenshot({ path: "artifacts/mobile-fixes/landscape-slide6.png" });

  await landscapeContext.close();
});
