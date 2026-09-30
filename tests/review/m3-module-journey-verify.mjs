// Verify the M4 module purpose/discussion/data/report restructure:
//  (A) four staged sections + sticky rail with scroll-spy and click-to-scroll
//  (B) Data-processing formulas, interpretation, and checklist removal
//  (C) Ready summary separates digital prep from instructor-only confirmation
//  (D) no console errors, no horizontal overflow
import { chromium, expect } from "@playwright/test";

const URL = "http://localhost:3000/modules/m4-sn-bi-electrodeposition";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, storageState: "tests/e2e/m4-guest-state.json" });

const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

let fails = 0;
const check = (ok, label, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!ok) fails++;
};

// ---------- (A) staged journey ----------
console.log("\n[A] Four-stage journey + rail");
const stages = await page.evaluate(() =>
  ["brief", "understand", "prove", "ready"].map((id) => {
    const el = document.getElementById(id);
    return { id, present: !!el, heading: el?.querySelector("h2")?.innerText.trim() ?? null };
  })
);
console.log("   stages:", JSON.stringify(stages.map((s) => `${s.id}:${s.heading}`)));
check(stages.every((s) => s.present), "all four stage sections render");
check(
  stages.map((s) => s.heading).join(",") === "Tujuan Praktikum,Pembahasan,Pengolahan Data,Format Laporan",
  "stage headings are Tujuan Praktikum/Pembahasan/Pengolahan Data/Format Laporan"
);

const rail = page.locator('nav[aria-label="Tahap persiapan modul"]');
check((await rail.count()) === 1, "sticky stage rail present");
const railBtns = await rail.getByRole("button").count();
check(railBtns === 4, "rail has four step buttons", `${railBtns}`);

// Click "Pengolahan Data" -> scrolls prove into view + marks aria-current=step
await rail.getByRole("button", { name: /pengolahan data/i }).click();
await expect.poll(() => page.locator("#prove").evaluate((el) =>
  Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop))
)).toBeLessThanOrEqual(2);
const afterClick = await page.evaluate(() => {
  const prove = document.getElementById("prove").getBoundingClientRect();
  const active = [...document.querySelectorAll('nav[aria-label="Tahap persiapan modul"] button')]
    .find((b) => b.getAttribute("aria-current") === "step");
  return { proveTop: Math.round(prove.top), activeLabel: active?.innerText.replace(/\s+/g, " ").trim() ?? "none" };
});
check(afterClick.proveTop < 320 && afterClick.proveTop > -60, "clicking a rail step scrolls that stage into view", `top=${afterClick.proveTop}`);
check(/PENGOLAHAN DATA/.test(afterClick.activeLabel), "clicked step becomes aria-current=step", afterClick.activeLabel);

// Scroll-spy: jump to Ready, rail should follow
await page.evaluate(() => document.getElementById("ready").scrollIntoView({ block: "start" }));
await page.waitForTimeout(900);
const spy = await page.evaluate(() => {
  const active = [...document.querySelectorAll('nav[aria-label="Tahap persiapan modul"] button')]
    .find((b) => b.getAttribute("aria-current") === "step");
  return active?.innerText.replace(/\s+/g, " ").trim() ?? "none";
});
check(/FORMAT LAPORAN/.test(spy), "scroll-spy activates the report-format step when it enters view", spy);

// ---------- (B) Data-processing formulas ----------
console.log("\n[B] Data-processing formulas and interpretation");
const prove = page.locator("#prove");
const benchText = await prove.innerText();
check(await prove.locator("[data-m4-data-formulas]").count() === 1, "formula block is present in Pengolahan Data");
const equationLabels = await prove.locator("[data-m4-data-formulas] [aria-label]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("aria-label")));
check(equationLabels.some((label) => /Q = I/.test(label ?? "")), "charge formula is rendered");
check(equationLabels.some((label) => /m_\{teoretis\}/.test(label ?? "")), "theoretical-mass formula is rendered");
check(equationLabels.some((label) => /eta|m_\{aktual\}/i.test(label ?? "")), "current-efficiency formula is rendered");
check(/Mengapa perlu dibandingkan|H\+|H₂|H_2/i.test(benchText), "reason for efficiency comparison is explained");
check(/Batas asumsi Sn|komposisi Sn:Bi/i.test(benchText), "Sn:Bi assumption boundary is explained");
check(await prove.locator('input[type="checkbox"]').count() === 0, "bench checklist session is removed from Pengolahan Data");

// ---------- (C) Ready placeholder ----------
console.log("\n[C] Ready = report-format placeholder only");
const ready = page.locator("#ready");
const readyText = await ready.innerText();
check(await ready.locator("[data-report-format-placeholder]").count() === 1, "report-format placeholder remains");
check(!/Persiapan digital|Wajib konfirmasi asisten|Log Elektrodeposisi M4|Menyelesaikan tahap-tahap di atas/i.test(readyText),
  "removed readiness and M4 log content is absent");
check(!/CR-06|baterai bekas/i.test(readyText), "obsolete battery language remains absent");

// ---------- (D) layout ----------
console.log("\n[D] Layout");
for (const w of [360, 390, 768, 1440]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(300);
  const m = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  check(m.scroll <= m.client + 1, `no horizontal overflow at ${w}px`, JSON.stringify(m));
}

console.log("\nconsole errors:", consoleErrors.length ? consoleErrors : "none");
if (consoleErrors.length) fails++;
console.log(fails === 0 ? "\nRESULT: PASS" : `\nRESULT: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
