/**
 * Verify the device preview grid renders the app at TRUE device widths.
 *
 * Asserts per frame: inner window.innerWidth == intended device width,
 * no horizontal overflow, real content rendered (not a blank/error frame).
 * Asserts per shell: scaled shell fits its reserved spacer box, caption does not collide.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 node verify_preview.mjs
 *   PREVIEW_PATH=/device-preview.html  (override if installed elsewhere)
 *   PROJECT=/abs/path                  (screenshot goes to <PROJECT>/artifacts/screenshots)
 *
 * Exits non-zero on any failure.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const PREVIEW = process.env.PREVIEW_PATH || "/device-preview.html";
const PROJECT = process.env.PROJECT || process.cwd();
const SHOTS = path.join(PROJECT, "artifacts", "screenshots");
fs.mkdirSync(SHOTS, { recursive: true });

const fails = [];
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1200 } })).newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

const url = `${BASE}${PREVIEW}`;
const resp = await page.goto(url, { waitUntil: "domcontentloaded" });
if (!resp || resp.status() >= 400) {
  console.error(`FAIL  preview page returned HTTP ${resp ? resp.status() : "n/a"} at ${url}`);
  await browser.close();
  process.exit(1);
}
// never networkidle: HMR websockets keep dev servers busy forever
await page.waitForTimeout(4500);

// ---- frame-level checks
const expected = await page.$$eval("iframe[data-target-width]", (els) =>
  els.map((e) => ({ device: e.getAttribute("data-device"), want: Number(e.getAttribute("data-target-width")) }))
);
const frames = page.frames().filter((f) => f !== page.mainFrame());
console.log(`iframes rendered: ${frames.length} (expected ${expected.length})`);
if (!frames.length) fails.push("no iframes rendered");
if (expected.length && frames.length !== expected.length)
  fails.push(`iframe count ${frames.length} != expected ${expected.length}`);

const seenWidths = [];
for (const f of frames) {
  try {
    const info = await f.evaluate(() => ({
      w: window.innerWidth,
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      pathname: location.pathname,
      textLen: (document.body && document.body.innerText ? document.body.innerText.length : 0),
    }));
    seenWidths.push(info.w);
    const overflow = info.scrollW > info.clientW + 2;
    const blank = info.textLen < 30;
    const status = overflow || blank ? "FAIL" : "ok";
    console.log(
      `  ${status.padEnd(4)} ${String(info.w).padStart(4)}px  path=${info.pathname}  ` +
      `text=${info.textLen}  scrollW=${info.scrollW} clientW=${info.clientW}` +
        `${overflow ? "  <-- HORIZONTAL OVERFLOW" : ""}${blank ? "  <-- BLANK/ERROR FRAME" : ""}`
    );
    if (overflow) fails.push(`overflow at ${info.w}px: scrollWidth ${info.scrollW} > clientWidth ${info.clientW}`);
    if (blank) fails.push(`blank frame at ${info.w}px (innerText ${info.textLen} chars) — frame-blocking header?`);
  } catch (e) {
    const msg = e.message.split("\n")[0];
    console.log(`  FAIL frame eval: ${msg}`);
    fails.push(`frame eval failed (cross-origin preview page?): ${msg}`);
  }
}

// intended widths must actually be honoured
for (const { device, want } of expected) {
  if (!seenWidths.includes(want)) fails.push(`no frame reported viewport width ${want}px for ${device}`);
}

// ---- geometry: scaled shell must fit its reserved spacer, caption must not collide
const geo = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll(".device").forEach((dev) => {
    const spacer = dev.firstElementChild;
    const shell = spacer && spacer.querySelector(".shell");
    const cap = dev.querySelector(".caption");
    if (!spacer || !shell || !cap) return;
    const sp = spacer.getBoundingClientRect();
    const sh = shell.getBoundingClientRect();
    const cp = cap.getBoundingClientRect();
    out.push({
      device: cap.innerText.split("\u2014")[0].trim(),
      overhang: Math.round(sh.bottom - sp.bottom),
      captionCollides: sh.bottom > cp.top,
    });
  });
  return out;
});
console.log("\nshell geometry:");
for (const g of geo) {
  const bad = g.overhang > 1 || g.captionCollides;
  console.log(`  ${bad ? "FAIL" : "ok  "} ${g.device.padEnd(16)} overhang=${g.overhang}px collides=${g.captionCollides}`);
  if (g.overhang > 1) fails.push(`${g.device}: shell overhangs reserved box by ${g.overhang}px (spacer padding mismatch)`);
  if (g.captionCollides) fails.push(`${g.device}: shell collides with caption`);
}

const shot = path.join(SHOTS, "device-preview-grid.png");
await page.screenshot({ path: shot, fullPage: true });

console.log(`\npageerrors: ${pageErrors.length ? pageErrors.join(" | ") : "none"}`);
if (pageErrors.length) fails.push(`${pageErrors.length} page error(s)`);
console.log(`screenshot: ${shot}`);

await browser.close();

if (fails.length) {
  console.error(`\nVERIFY FAILED (${fails.length}):`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\nVERIFY PASSED");
