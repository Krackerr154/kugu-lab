// Verify how the six \\-escaped Equation formulas actually render in the browser.
// Prints the visible KaTeX text for each equation on the affected routes.
import { chromium } from "@playwright/test";

const ROUTES = [
  "/modules/m2-mg2sno4",
  "/modules/m5-xrd",
  "/modules/m6-tga",
  "/modules/m3-sn-bi-electrodeposition",
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const route of ROUTES) {
  await page.goto("http://localhost:3000" + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const eqs = await page.evaluate(() =>
    [...document.querySelectorAll(".katex")].map((e) => {
      // KaTeX duplicates content in MathML + HTML; read only the HTML half.
      const html = e.querySelector(".katex-html");
      return (html ?? e).textContent.replace(/\s+/g, " ").trim().slice(0, 90);
    })
  );
  const errs = await page.locator(".katex-error").count();
  console.log(`\n${route}  (katex nodes: ${eqs.length}, errors: ${errs})`);
  eqs.forEach((t, i) => console.log(`  [${i}] ${JSON.stringify(t)}`));
}

await browser.close();
