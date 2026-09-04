// Confirm the .material-symbols-outlined clamp does not clip the real glyphs once
// the ligature font has loaded: for each icon span compare scrollWidth (natural
// content width) against clientWidth (the 1em box).
import { chromium } from "@playwright/test";

const routes = ["/", "/modules/m1-reactions", "/prelab/m2-mg2sno4", "/laporan", "/referensi"];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

let clippedTotal = 0;
for (const r of routes) {
  await page.goto("http://localhost:3000" + r, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const res = await page.evaluate(() => {
    const spans = [...document.querySelectorAll(".material-symbols-outlined")];
    const clipped = spans
      .filter((s) => s.scrollWidth > s.clientWidth + 1)
      .map((s) => ({ icon: s.textContent.trim(), scrollW: s.scrollWidth, clientW: s.clientWidth }));
    return {
      total: spans.length,
      fontLoaded: document.fonts.check('24px "Material Symbols Outlined"'),
      clipped: clipped.slice(0, 6),
      clippedCount: clipped.length,
    };
  });
  clippedTotal += res.clippedCount;
  console.log(`${r}: icons=${res.total} fontLoaded=${res.fontLoaded} clipped=${res.clippedCount}`);
  for (const c of res.clipped) console.log("   ", JSON.stringify(c));
}

console.log(clippedTotal === 0 ? "\nICON RENDER: PASS (no glyph clipped)" : `\nICON RENDER: ${clippedTotal} clipped`);
await browser.close();
process.exit(clippedTotal === 0 ? 0 : 1);
