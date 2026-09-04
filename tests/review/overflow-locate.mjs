// Locate real (unclipped) horizontal overflow on a route at a given width.
// Usage: node tests/review/overflow-locate.mjs [path] [width]
import { chromium } from "@playwright/test";

const route = process.argv[2] || "/prelab/m2-mg2sno4";
const width = Number(process.argv[3] || 360);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 800 } });
await page.goto("http://localhost:3000" + route, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(300);

const measure = () =>
  page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const clippedBy = (el) => {
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === "auto" || ox === "scroll" || ox === "hidden") return true;
      }
      return false;
    };
    const bad = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.right <= vw + 1) continue;
      if (clippedBy(el)) continue;
      const childBad = [...el.children].some((c) => c.getBoundingClientRect().right > vw + 1);
      bad.push({
        leaf: !childBad,
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || "").slice(0, 120),
        w: Math.round(r.width),
        left: Math.round(r.left),
        right: Math.round(r.right),
        text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50),
      });
    }
    return { vw, doc: document.documentElement.scrollWidth, bad };
  });

const early = await measure();
console.log(`${route} @ ${width}px  doc=${early.doc} vw=${early.vw}  offenders=${early.bad.length}`);
for (const b of early.bad.filter((x) => x.leaf).slice(0, 10)) console.log("  LEAF", JSON.stringify(b));

await page.waitForTimeout(1500);
const late = await measure();
console.log(`after settle: doc=${late.doc} offenders=${late.bad.length}`);
for (const b of late.bad.filter((x) => x.leaf).slice(0, 10)) console.log("  LEAF", JSON.stringify(b));

await browser.close();
