// Verify the "Praktikum Pulse" sidebar footer is gone and nothing else broke.
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

let fails = 0;
const check = (ok, label, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!ok) fails++;
};

const GONE = ["Praktikum Pulse", "Total Modul", "Ambang Lulus", "NA ≥ 55", "Mulai Praktikum"];

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

// The rail is collapsed until hovered, so check the raw HTML: the removed
// strings must be absent from the DOM entirely, not merely invisible.
console.log("\n[1] Removed strings are absent from the sidebar");
const railHtml = await page.locator("aside").first().innerHTML();
for (const s of GONE) check(!railHtml.includes(s), `"${s}" no longer in the rail DOM`);

// Hovering must not bring them back either.
await page.locator("aside").first().hover();
await page.waitForTimeout(500);
const hoveredHtml = await page.locator("aside").first().innerHTML();
for (const s of GONE) check(!hoveredHtml.includes(s), `"${s}" absent after hover`);

// ---------- the rail still works ----------
console.log("\n[2] Sidebar navigation still intact");
const rail = await page.locator("aside").first().evaluate((el) => {
  const nav = el.querySelector('nav[aria-label="Navigasi utama"]');
  return {
    brand: el.innerText.includes("KUGU Lab"),
    subtitle: el.innerText.includes("KI3131"),
    linkCount: nav ? nav.querySelectorAll("a").length : 0,
    labels: nav ? [...nav.querySelectorAll("a")].map((a) => a.innerText.trim()) : [],
    viewTransitionName: getComputedStyle(el).viewTransitionName,
    collapsedWidth: el.getBoundingClientRect().width,
  };
});
console.log("   rail:", JSON.stringify(rail));
check(rail.brand && rail.subtitle, "brand block (KUGU Lab / KI3131) still present");
check(rail.linkCount >= 6, "navigation links still render", `${rail.linkCount} links`);
check(rail.viewTransitionName === "app-rail", "view-transition name preserved", rail.viewTransitionName);

// ---------- no dangling empty container / layout shift ----------
console.log("\n[3] Layout");
const widths = await page.evaluate(() => ({
  scroll: document.documentElement.scrollWidth,
  client: document.documentElement.clientWidth,
}));
check(widths.scroll <= widths.client, "no horizontal overflow at 1440px", JSON.stringify(widths));

// Mobile drawer is a separate tree and should be untouched.
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Buka menu/ }).click();
await page.waitForTimeout(400);
const drawer = await page.locator("#mobile-navigation").evaluate((el) => ({
  links: el.querySelectorAll("a").length,
  text: el.innerText.slice(0, 120).replace(/\n/g, " | "),
}));
console.log("   mobile drawer:", JSON.stringify(drawer));
check(drawer.links >= 6, "mobile drawer links intact", `${drawer.links} links`);
for (const s of GONE) {
  const html = await page.locator("#mobile-navigation").innerHTML();
  check(!html.includes(s), `"${s}" absent from the mobile drawer too`);
  break; // one representative check; the footer never existed in this tree
}
const mobileWidths = await page.evaluate(() => ({
  scroll: document.documentElement.scrollWidth,
  client: document.documentElement.clientWidth,
}));
check(mobileWidths.scroll <= mobileWidths.client, "no overflow at 390px", JSON.stringify(mobileWidths));

console.log("\nconsole errors:", consoleErrors.length ? consoleErrors : "none");
if (consoleErrors.length) fails++;
console.log(fails === 0 ? "\nRESULT: PASS" : `\nRESULT: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
