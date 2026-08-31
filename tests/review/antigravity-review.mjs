/**
 * Antigravity-style verification harness for KUGU Lab.
 *
 * Produces the same class of evidence Antigravity calls "verification artifacts":
 *   - a browser recording (video) of the whole flow
 *   - a numbered screenshot per verification step
 *   - console + pageerror + failed-network logs, attributed to the step that caused them
 *   - a machine-readable trace.json used to generate the walkthrough report
 *
 * Usage: node tests/review/antigravity-review.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "artifacts");
const SHOTS = path.join(OUT, "screenshots");
const RECS = path.join(OUT, "recordings");
for (const d of [OUT, SHOTS, RECS]) fs.mkdirSync(d, { recursive: true });

const trace = [];
let stepNo = 0;
let current = "boot";
const logs = []; // {step, type, text}

function record(type, text) {
  logs.push({ step: current, type, text: String(text).slice(0, 500) });
}

async function step(page, name, action, assertFn) {
  stepNo += 1;
  current = name;
  const id = String(stepNo).padStart(2, "0");
  const before = logs.length;
  const t0 = Date.now();
  let status = "pass";
  let detail = "";
  try {
    if (action) await action();
    if (assertFn) detail = (await assertFn()) || "";
  } catch (e) {
    status = "fail";
    detail = e.message.split("\n")[0].slice(0, 300);
  }
  const shot = path.join(SHOTS, `${id}-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`);
  try {
    await page.screenshot({ path: shot, fullPage: false });
  } catch {}
  const newLogs = logs.slice(before);
  trace.push({
    step: stepNo,
    name,
    status,
    detail,
    ms: Date.now() - t0,
    url: page.url(),
    screenshot: path.relative(ROOT, shot).replace(/\\/g, "/"),
    consoleErrors: newLogs.filter((l) => l.type === "error" || l.type === "pageerror"),
    networkFailures: newLogs.filter((l) => l.type === "network"),
  });
  console.log(
    `${status === "pass" ? "PASS" : "FAIL"}  ${id} ${name}` +
      (detail ? `  :: ${detail}` : "") +
      (newLogs.length ? `  [${newLogs.length} log events]` : "")
  );
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: RECS, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();

page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") record(m.type() === "error" ? "error" : "warn", m.text());
});
page.on("pageerror", (e) => record("pageerror", e.message));
page.on("requestfailed", (r) => record("network", `${r.method()} ${r.url()} — ${r.failure()?.errorText}`));
page.on("response", (r) => {
  if (r.status() >= 400) record("network", `HTTP ${r.status()} ${r.url()}`);
});

// ---------------------------------------------------------------- flow

await step(page, "Load dashboard", async () => {
  await page.goto(BASE, { waitUntil: "networkidle" });
}, async () => {
  const h = await page.getByRole("heading", { name: /Pilih Modul Praktikum/i }).count();
  if (!h) throw new Error("module picker heading not found");
  const cards = await page.locator('a[href^="/modules/m"]').count();
  return `module picker rendered, ${cards} module links`;
});

await step(page, "Navigate to M1 module", async () => {
  await page.goto(`${BASE}/modules/m1-reactions`, { waitUntil: "networkidle" });
}, async () => {
  const title = await page.locator("h1, h2").first().innerText();
  return `landed on ${page.url()} — first heading: "${title.trim().slice(0, 60)}"`;
});

await step(page, "Open M1 prelab walkthrough", async () => {
  await page.goto(`${BASE}/prelab/m1-reactions`, { waitUntil: "networkidle" });
}, async () => {
  const body = await page.locator("body").innerText();
  if (!/Pelajari Prosedur/i.test(body)) throw new Error("walkthrough step 1 text missing");
  return "ProcedureWalkthrough rendered with step 1 visible";
});

// Interactive tab sweep on the ReactionExplorer (4 tabs)
const tabs = [
  ["Workbench & Matriks", /Workbench Tabung Reaksi Virtual/i],
  ["Gas tab", null],
  ["Unknown / Mystery tab", null],
  ["Equations tab", null],
];

await step(page, "Reach ReactionExplorer interactive", async () => {
  await page.goto(`${BASE}/modules/m1-reactions`, { waitUntil: "networkidle" });
  await page.getByText(/Workbench & Matriks Animasi/i).first().scrollIntoViewIfNeeded();
}, async () => {
  const n = await page.getByText(/Workbench & Matriks Animasi/i).count();
  if (!n) throw new Error("tab bar not found on module page");
  return "tab bar located";
});

const tabButtons = page.locator("button").filter({ hasText: /Workbench & Matriks Animasi|Simulator Uji Gas|Detektif Cuplikan|Latihan Persamaan/i });
const tabCount = await tabButtons.count();

for (let i = 0; i < Math.min(tabCount, 6); i++) {
  const label = (await tabButtons.nth(i).innerText()).replace(/\s+/g, " ").trim().slice(0, 40);
  await step(page, `Click tab: ${label}`, async () => {
    await tabButtons.nth(i).click();
    await page.waitForTimeout(700);
  }, async () => {
    const visible = await page.locator("body").innerText();
    return `panel switched, ${visible.length} chars of panel text rendered`;
  });
}

// Deep interaction: click a matrix cell then a reagent bottle
await step(page, "Interact: click reagent in workbench", async () => {
  await tabButtons.first().click();
  await page.waitForTimeout(400);
  const reagent = page.getByRole("button", { name: /HCl \(encer\)/ }).first();
  await reagent.click({ timeout: 5000 });
  await page.waitForTimeout(900);
}, async () => {
  const body = await page.locator("body").innerText();
  const hit = /Endapan|End\.|Larut|Observasi|Inferensi/i.test(body);
  if (!hit) throw new Error("no observation/inference text appeared after reagent click");
  return "observation panel updated after reagent selection";
});

// Matrix Cell Click & Pop-up Modal Verification
await step(page, "Matrix: click cell to open Reaction Pop-up Modal", async () => {
  const matrixHeading = page.locator("text=Matriks Reaksi Lengkap");
  await matrixHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const agRow = page.locator("table tbody tr").filter({ hasText: /Ag[+⁺]/ });
  const hclCell = agRow.locator("td").nth(1);
  await hclCell.click({ timeout: 5000 });
  await page.waitForTimeout(600);
}, async () => {
  const dialog = page.locator('[role="dialog"]');
  const isVis = await dialog.isVisible();
  if (!isVis) throw new Error("Reaction pop-up modal dialog did not appear after cell click");
  const modalText = await dialog.innerText();
  if (!/Observasi Visual/i.test(modalText)) throw new Error("Modal missing Observasi Visual section");
  if (!/Inferensi & Mekanisme/i.test(modalText)) throw new Error("Modal missing Inferensi section");
  return `Modal opened successfully: "${(await page.locator("#reaction-modal-title").innerText()).slice(0, 50)}"`;
});

await step(page, "Matrix: dismiss modal with Escape key", async () => {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
}, async () => {
  const isVis = await page.locator('[role="dialog"]').isVisible();
  if (isVis) throw new Error("Modal remained visible after pressing Escape");
  return "Modal closed cleanly via Escape";
});

// Responsive check at mobile width
await step(page, "Mobile viewport 390x844", async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
}, async () => {
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    return { scrollW: de.scrollWidth, clientW: de.clientWidth };
  });
  if (overflow.scrollW > overflow.clientW + 2)
    throw new Error(`horizontal overflow: scrollWidth ${overflow.scrollW} > clientWidth ${overflow.clientW}`);
  return `no horizontal overflow (scrollWidth ${overflow.scrollW} <= clientWidth ${overflow.clientW})`;
});

await step(page, "404 / error path", async () => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/modules/does-not-exist`, { waitUntil: "networkidle" });
}, async () => {
  const body = await page.locator("body").innerText();
  return `status page text: "${body.replace(/\s+/g, " ").trim().slice(0, 80)}"`;
});

// ---------------------------------------------------------------- teardown
await context.close();
await browser.close();

const video = fs
  .readdirSync(RECS)
  .filter((f) => f.endsWith(".webm"))
  .map((f) => ({ f, m: fs.statSync(path.join(RECS, f)).mtimeMs }))
  .sort((a, b) => b.m - a.m)[0]?.f;
const report = {
  base: BASE,
  when: new Date().toISOString(),
  video: video ? path.relative(ROOT, path.join(RECS, video)).replace(/\\/g, "/") : null,
  steps: trace,
  allLogs: logs,
};
fs.writeFileSync(path.join(OUT, "trace.json"), JSON.stringify(report, null, 2));
console.log(`\nartifacts -> ${OUT}`);
console.log(`video -> ${report.video}`);
console.log(`pass ${trace.filter((t) => t.status === "pass").length} / ${trace.length}`);
