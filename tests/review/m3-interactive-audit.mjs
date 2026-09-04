// Probe the M3 interactive for the issues found by reading the source:
// keyboard/ARIA on the SVG, dark-mode behaviour of hardcoded colors,
// divide-by-zero on valence, and the default current density vs the protocol's
// 14.5 mA/cm2.
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://localhost:3000/modules/m3-sn-bi-electrodeposition", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

// 1. Default operating point vs the manual's 14.5 mA/cm2.
const defaults = await page.evaluate(() => {
  const val = (id) => document.getElementById(id)?.value;
  const body = document.body.innerText;
  const jd = body.match(/Rapat arus \(I\/A\):\s*([\d.]+)/);
  return {
    current: val("m3-current"),
    time: val("m3-time"),
    area: val("m3-area"),
    currentDensityShown: jd ? jd[1] + " A/cm2" : "not found",
  };
});
console.log("DEFAULTS:", JSON.stringify(defaults));
console.log("  protocol is 14.5 mA/cm2 = 0.0145 A/cm2 for 15 min (900 s)");

// 2. Keyboard + ARIA on the clickable cell diagram.
const svgA11y = await page.evaluate(() => {
  const svg = document.querySelector("svg[role='img']");
  if (!svg) return "no svg";
  const clickable = [...svg.querySelectorAll("*")].filter((el) => el.classList.contains("cursor-pointer"));
  return {
    clickableCount: clickable.length,
    withTabIndex: clickable.filter((e) => e.hasAttribute("tabindex")).length,
    withRole: clickable.filter((e) => e.hasAttribute("role")).length,
    withAriaLabel: clickable.filter((e) => e.hasAttribute("aria-label")).length,
    focusableInsideSvg: [...svg.querySelectorAll("[tabindex], button, a")].length,
  };
});
console.log("CELL DIAGRAM A11Y:", JSON.stringify(svgA11y));

// 3. Divide-by-zero and negative valence.
await page.fill("#m3-valence", "0");
await page.waitForTimeout(200);
const zeroValence = await page.evaluate(() => {
  const t = document.body.innerText;
  const m = t.match(/Massa teoretis:\s*(\S+)/);
  const e = t.match(/η = (\S+)/);
  return { theoreticalMass: m ? m[1] : "?", efficiency: e ? e[1] : "?" };
});
console.log("VALENCE=0 ->", JSON.stringify(zeroValence));

await page.fill("#m3-valence", "-2");
await page.waitForTimeout(200);
const negValence = await page.evaluate(() => {
  const m = document.body.innerText.match(/Massa teoretis:\s*(\S+)/);
  const e = document.body.innerText.match(/η = (\S+)/);
  return { theoreticalMass: m ? m[1] : "?", efficiency: e ? e[1] : "?" };
});
console.log("VALENCE=-2 ->", JSON.stringify(negValence));

// 4. Hardcoded SVG colors: do they respond to the dark scheme?
await page.emulateMedia({ colorScheme: "dark" });
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
const darkColors = await page.evaluate(() => {
  const svg = document.querySelector("svg[role='img']");
  const fills = [...svg.querySelectorAll("rect")].map((r) => r.getAttribute("fill")).filter(Boolean);
  const textFills = [...svg.querySelectorAll("text")].map((r) => r.getAttribute("fill")).filter(Boolean);
  return {
    rectFills: [...new Set(fills)],
    textFills: [...new Set(textFills)],
    pageBg: getComputedStyle(document.body).backgroundColor,
  };
});
console.log("DARK MODE:", JSON.stringify(darkColors));

await browser.close();
