/**
 * Generates the Antigravity-style "walkthrough" artifact from trace.json.
 * Output: artifacts/WALKTHROUGH.md
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "artifacts");
const t = JSON.parse(fs.readFileSync(path.join(OUT, "trace.json"), "utf-8"));

const pass = t.steps.filter((s) => s.status === "pass").length;
const fail = t.steps.filter((s) => s.status === "fail");

const uniq = new Map();
for (const l of t.allLogs) {
  const k = `${l.type}|${l.text.slice(0, 120)}`;
  if (!uniq.has(k)) uniq.set(k, l);
}

const L = [];
L.push(`# Verification Walkthrough — KUGU Lab`);
L.push(``);
L.push(`Target: ${t.base}`);
L.push(`Run: ${t.when}`);
L.push(`Result: ${pass}/${t.steps.length} steps passed`);
L.push(`Recording: ${t.video || "(none)"}`);
L.push(``);
L.push(`## Step evidence`);
L.push(``);
L.push(`| # | Step | Status | Evidence | Screenshot |`);
L.push(`|---|------|--------|----------|------------|`);
for (const s of t.steps) {
  L.push(
    `| ${s.step} | ${s.name} | ${s.status.toUpperCase()} | ${(s.detail || "").replace(/\|/g, "\\|")} | ${s.screenshot} |`
  );
}
L.push(``);

if (fail.length) {
  L.push(`## Failures`);
  L.push(``);
  for (const s of fail) {
    L.push(`### Step ${s.step}: ${s.name}`);
    L.push(`- URL: ${s.url}`);
    L.push(`- Error: ${s.detail}`);
    L.push(`- Screenshot: ${s.screenshot}`);
    L.push(``);
  }
}

L.push(`## Console / network findings (deduplicated)`);
L.push(``);
if (!uniq.size) {
  L.push(`None.`);
} else {
  for (const l of uniq.values()) {
    L.push(`- [${l.type}] during "${l.step}": ${l.text}`);
  }
}
L.push(``);
L.push(`## Coverage`);
L.push(``);
L.push(`Tested: dashboard, M1 module page, M1 prelab walkthrough, all 4 ReactionExplorer tabs,`);
L.push(`reagent selection -> observation/inference panel update, mobile 390x844 overflow, unknown-route path.`);
L.push(``);
L.push(`Not tested: M2-M6 module pages, notebook/laporan/analisis/referensi/pengajar routes, form submission,`);
L.push(`dark mode, keyboard-only navigation, cross-browser (Chromium only).`);

fs.writeFileSync(path.join(OUT, "WALKTHROUGH.md"), L.join("\n"));
console.log("wrote artifacts/WALKTHROUGH.md");
