/**
 * Verify the legacy "Manual 2025/2026" badge text is completely gone from all module pages.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const ROUTES = [
  "/modules/m1-reactions",
  "/modules/m2-mg2sno4",
  "/modules/m3-sn-bi-electrodeposition",
  "/modules/m4-zeolite-fau",
  "/modules/m5-xrd",
  "/modules/m6-tga",
];

const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));

let bad = 0;
for (const r of ROUTES) {
  const resp = await page.goto(BASE + r, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  const info = await page.evaluate(() => {
    const text = document.body.innerText;
    const matches = text.match(/Manual\s+2025\/2026/g) || [];
    return { total: matches.length };
  });
  const ok = info.total === 0;
  if (!ok) bad++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${r.padEnd(38)} http=${resp.status()} manual badge count=${info.total}`
  );
}

console.log(`\npageerrors: ${errs.length ? errs.join(" | ") : "none"}`);
await b.close();
if (bad || errs.length) { console.error(`FAILED (${bad} route(s))`); process.exit(1); }
console.log("VERIFY PASSED — legacy manual badges completely removed");
