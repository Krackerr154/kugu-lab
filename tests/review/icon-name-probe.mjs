// Sweep EVERY Material Symbols icon name used in the codebase and report any that
// are not real ligatures in the loaded font (they render as wide literal text).
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next" || e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".tsx")) files.push(p);
  }
})(path.join(ROOT, "app"));
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".tsx")) files.push(p);
  }
})(path.join(ROOT, "components"));

// Icon names appear either as JSX children of a material-symbols span, or as data
// values (icon: "x" / icon="x"). Collect both, then filter to plausible names.
const names = new Map(); // name -> Set(file)
for (const f of files) {
  const src = fs.readFileSync(f, "utf-8");
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  for (const m of src.matchAll(/material-symbols-outlined[^>]*>\s*([a-z0-9_]+)\s*</g)) {
    if (!names.has(m[1])) names.set(m[1], new Set());
    names.get(m[1]).add(rel);
  }
  for (const m of src.matchAll(/\bicon:\s*"([a-z0-9_]+)"/g)) {
    if (!names.has(m[1])) names.set(m[1], new Set());
    names.get(m[1]).add(rel);
  }
  for (const m of src.matchAll(/\{?\s*"?([a-z0-9_]+)"?\s*\}?<\/span>/g)) { /* noop, kept simple */ }
}

const list = [...names.keys()].sort();
console.log(`collected ${list.length} distinct icon names from ${files.length} tsx files`);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

const widths = await page.evaluate((icons) => {
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;left:-9999px;top:0;";
  document.body.appendChild(host);
  const out = {};
  for (const n of icons) {
    const s = document.createElement("span");
    s.style.cssText = 'font-family:"Material Symbols Outlined";font-size:24px;white-space:nowrap;display:inline-block;';
    s.textContent = n;
    host.appendChild(s);
    out[n] = Math.round(s.getBoundingClientRect().width);
  }
  host.remove();
  return out;
}, list);

const bad = Object.entries(widths).filter(([, w]) => w > 26);
if (!bad.length) {
  console.log("all icon names resolve to a single glyph — PASS");
} else {
  console.log(`\n${bad.length} INVALID icon name(s):`);
  for (const [n, w] of bad) console.log(`  ${n} (${w}px)  used in: ${[...names.get(n)].join(", ")}`);
}

await browser.close();
process.exit(bad.length ? 1 : 0);
