// Verify the M3 pre-lab walkthrough page: /prelab/m3-sn-bi-electrodeposition
//  (A) electrolyte worksheet — concentration basis, per-reagent verification
//      arithmetic, PEG400 derivation, gated order of addition, volume budget
//  (B) full walkthrough pass: 11 steps, 5 checks, explanation persists, 100%
//  (C) no console errors, no horizontal overflow at 360px
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/prelab/m3-sn-bi-electrodeposition";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

let fails = 0;
const check = (ok, label, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!ok) fails++;
};

// ---------- (A) electrolyte worksheet ----------
console.log("\n[A] Electrolyte preparation worksheet");
const worksheet = page
  .locator("section")
  .filter({ has: page.getByRole("heading", { name: "Worksheet Preparasi Elektrolit" }) })
  .first();
check(await worksheet.count() > 0, "worksheet section renders");

const wsText = await worksheet.innerText();
check(/Basis konsentrasi: 100 mL akhir/i.test(wsText), "states the 100 mL concentration basis");
check(/bukan volume sub-larutan/i.test(wsText), "explicitly rejects the sub-volume reading");
check(/18/.test(wsText), "quantifies the consequence of misreading the basis");

// Solution tabs
const tabs = await worksheet.getByRole("tab").allInnerTexts();
console.log("   tabs:", JSON.stringify(tabs));
check(tabs.length === 3, "three solution tabs (A, B, C)", `got ${tabs.length}`);
check(tabs.some((t) => /5,5 mL/.test(t)), "tab labels carry sub-solution volumes");

// Per-reagent verification arithmetic, on each tab.
const expected = {
  A: [{ mass: "1,4612", molar: "292,244", mol: "0.00500", molarity: "0,0500" }],
  B: [
    { mass: "3,3846", molar: "225,640", mol: "0.01500", molarity: "0,1500" },
    { mass: "2,4254", molar: "485,067", mol: "0.00500", molarity: "0,0500" },
  ],
  C: [{ mass: "5,7636", molar: "192,123", mol: "0.03000", molarity: "0,3000" }],
};
for (const [id, rows] of Object.entries(expected)) {
  await worksheet.getByRole("tab", { name: new RegExp(`Larutan ${id}`) }).click();
  await page.waitForTimeout(200);
  const panel = await worksheet.getByRole("tabpanel").innerText();
  for (const r of rows) {
    const hasAll =
      panel.includes(r.mass) && panel.includes(r.molar) &&
      panel.includes(r.mol) && panel.includes(r.molarity);
    check(hasAll, `Larutan ${id}: ${r.mass} g ÷ ${r.molar} = ${r.mol} mol → ${r.molarity} M shown`);
  }
  const ticks = (panel.match(/✓ cocok target/g) || []).length;
  check(ticks === rows.length, `Larutan ${id}: every mass verified against target`, `${ticks}/${rows.length}`);
}

// Salt-hydrate caveat
const cPanel = await worksheet.getByRole("tabpanel").innerText();
check(/372,24/.test(cPanel) && /210,14/.test(cPanel),
  "flags Na2H2EDTA·2H2O and citric acid monohydrate alternatives");

// PEG400 derivation
check(/0,0200 mol/.test(wsText), "PEG400: n = 0,0200 mol derived");
check(/8,0 g/.test(wsText), "PEG400: m = 8,0 g derived");
check(/7,09 mL/.test(wsText), "PEG400: V ≈ 7,09 mL derived");
check(/nominal rata-rata/i.test(wsText), "PEG400: nominal average molar mass caveat present");

// Volume budget
check(/27,09 mL/.test(wsText), "volume budget totals 27,09 mL committed");
check(/72,9 mL/.test(wsText), "water to add ≈ 72,9 mL");
check(/labu takar 100 mL/i.test(wsText), "instructs use of a 100 mL volumetric flask");

console.log("\nconsole errors so far:", consoleErrors.length ? consoleErrors : "none");
console.log(fails === 0 ? "\nPART A: PASS" : `\nPART A: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
