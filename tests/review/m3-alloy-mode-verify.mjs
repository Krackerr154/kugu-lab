// Verify alloy mode on the M3 module calculator (audit item 4).
// Sn and Bi codeposit, so a single (n, M) pair is not defensible. Alloy mode
// derives equivalent n and M from a student-set mole fraction and labels the
// result as an assumption requiring assistant sign-off.
//
// Also re-checks that fixes 1-3 survived: protocol defaults and input guards.
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/modules/m3-sn-bi-electrodeposition";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1300 } });

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

const results = () =>
  page.evaluate(() => {
    const t = document.body.innerText;
    const grab = (re) => { const m = t.match(re); return m ? m[1].trim() : null; };
    return {
      theoretical: grab(/Massa teoretis:\s*(\S+)/),
      molesMetal: grab(/Mol logam teoretis:\s*(\S+)/),
      eta: grab(/η = (\S+)/),
      density: grab(/Rapat arus \(I\/A\):\s*([^\n]+)/),
      alert: /Input belum valid/.test(t),
    };
  });

const fields = () =>
  page.evaluate(() => ({
    valence: document.getElementById("m3-valence")?.value,
    molarMass: document.getElementById("m3-molar-mass")?.value,
    valenceDisabled: document.getElementById("m3-valence")?.disabled,
    molarMassDisabled: document.getElementById("m3-molar-mass")?.disabled,
    metalDisabled: document.getElementById("m3-metal")?.disabled,
  }));

// ---------- baseline: single-metal mode ----------
console.log("\n[1] Single-metal baseline (fixes 1-3 regression)");
const base = await results();
const baseFields = await fields();
console.log("   fields:", JSON.stringify(baseFields));
console.log("   results:", JSON.stringify(base));
check(/14,50 mA\/cm²|14.50 mA\/cm²/.test(base.density || ""),
  "protocol default density 14,50 mA/cm² intact", base.density || "");
check(baseFields.valence === "2" && baseFields.molarMass === "118.71",
  "defaults are Sn (n=2, M=118.71)", JSON.stringify(baseFields));
check(!baseFields.valenceDisabled && !baseFields.metalDisabled,
  "single-metal inputs are editable before alloy mode");
const baseTheoretical = parseFloat(base.theoretical);
check(Number.isFinite(baseTheoretical) && baseTheoretical > 0,
  "theoretical mass is a positive number", base.theoretical);

// ---------- alloy mode toggle ----------
console.log("\n[2] Alloy mode toggle");
const toggle = page.getByRole("button", { name: /Aktifkan mode paduan/ });
check(await toggle.count() > 0, "alloy toggle button present");
check((await toggle.getAttribute("aria-pressed")) === "false", "toggle starts unpressed");
await toggle.click();
await page.waitForTimeout(250);
const onToggle = page.getByRole("button", { name: /Mode paduan aktif/ });
check((await onToggle.getAttribute("aria-pressed")) === "true", "toggle reports pressed when on");

const alloyFields = await fields();
check(alloyFields.valenceDisabled && alloyFields.molarMassDisabled && alloyFields.metalDisabled,
  "n, M and metal select are locked in alloy mode",
  JSON.stringify(alloyFields));

// ---------- equivalent n and M at x_Sn = 0.50 ----------
console.log("\n[3] Equivalent n and M arithmetic");
// n_eq = 0.5*2 + 0.5*3 = 2.5 ; M_eq = 0.5*118.71 + 0.5*208.98 = 163.845,
// which in IEEE-754 is 163.84499999999998, so toFixed(2) renders "163.84".
check(alloyFields.valence === "2.500", "n_eq = 2.500 at x_Sn = 0.50", alloyFields.valence);
check(alloyFields.molarMass === "163.84", "M_eq = 163.84 g/mol at x_Sn = 0.50", alloyFields.molarMass);

const readout = await page.locator("#m3-alloy-readout").innerText();
console.log("   readout:", readout.replace(/\s+/g, " "));
check(/0\.50/.test(readout), "readout shows both mole fractions");

// Endpoints must reduce to the pure metals.
const setSn = async (pct) => {
  await page.fill("#m3-alloy-sn", String(pct));
  await page.waitForTimeout(200);
  return fields();
};
const pureSn = await setSn(100);
check(pureSn.valence === "2.000" && pureSn.molarMass === "118.71",
  "x_Sn = 1.00 reduces to pure Sn (n=2, M=118.71)", JSON.stringify(pureSn));
const pureBi = await setSn(0);
check(pureBi.valence === "3.000" && pureBi.molarMass === "208.98",
  "x_Sn = 0.00 reduces to pure Bi (n=3, M=208.98)", JSON.stringify(pureBi));

// ---------- the equivalents actually drive the calculation ----------
console.log("\n[4] Equivalents feed the theoretical mass");
await setSn(100);
const atSn = await results();
await setSn(0);
const atBi = await results();
console.log("   x_Sn=1.00:", atSn.theoretical, " x_Sn=0.00:", atBi.theoretical);
const mSn = parseFloat(atSn.theoretical);
const mBi = parseFloat(atBi.theoretical);
check(Number.isFinite(mSn) && Number.isFinite(mBi) && Math.abs(mSn - mBi) > 1e-5,
  "theoretical mass changes with composition", `${mSn} vs ${mBi}`);
// Pure-Sn alloy mode must match the single-metal Sn baseline.
check(Math.abs(mSn - baseTheoretical) < 1e-6,
  "alloy mode at x_Sn = 1.00 equals the single-metal Sn result",
  `${mSn} vs ${baseTheoretical}`);
// Bi: n=3, M=208.98 -> m = Q/F/3*208.98. Sn: Q/F/2*118.71. Ratio = (208.98/3)/(118.71/2).
const expectedRatio = (208.98 / 3) / (118.71 / 2);
check(Math.abs(mBi / mSn - expectedRatio) < 1e-3,
  "Bi/Sn theoretical-mass ratio matches Faraday's law", `${(mBi / mSn).toFixed(4)} vs ${expectedRatio.toFixed(4)}`);

// ---------- assumption is labelled, not asserted ----------
console.log("\n[5] Composition is presented as an assumption");
const bodyText = await page.evaluate(() => document.body.innerText);
check(/tidak menetapkan komposisi target/i.test(bodyText),
  "states the manual sets no target composition");
check(/asumsi Anda/i.test(bodyText), "labels the value as the student's assumption");
check(/dikonfirmasi asisten/i.test(bodyText), "requires assistant confirmation");
check(/XRD\/EDS|karakterisasi/i.test(bodyText),
  "points at characterisation as the real determination");

// ---------- guards still hold in alloy mode ----------
console.log("\n[6] Input guards survive alloy mode");
await page.fill("#m3-current", "0");
await page.waitForTimeout(200);
const guarded = await results();
check(guarded.alert && guarded.theoretical === "—",
  "arus = 0 still blocks the calculation in alloy mode",
  `alert=${guarded.alert} theoretical=${guarded.theoretical}`);

// Out-of-range composition is rejected.
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Aktifkan mode paduan/ }).click();
await page.waitForTimeout(200);
await page.fill('input[aria-label="Fraksi mol Sn dalam persen"]', "150");
await page.waitForTimeout(250);
const badAlloy = await results();
const badAlloyText = await page.evaluate(() => document.body.innerText);
check(badAlloy.alert && badAlloy.theoretical === "—",
  "x_Sn = 150% blocks the calculation",
  `alert=${badAlloy.alert} theoretical=${badAlloy.theoretical}`);
check(/Fraksi mol Sn harus berada antara 0% dan 100%/.test(badAlloyText),
  "out-of-range composition shows a specific message");

// ---------- mobile ----------
console.log("\n[7] Mobile");
await page.setViewportSize({ width: 360, height: 900 });
await page.waitForTimeout(400);
const w = await page.evaluate(() => ({
  scroll: document.documentElement.scrollWidth,
  client: document.documentElement.clientWidth,
}));
check(w.scroll <= w.client, "no horizontal overflow at 360px", JSON.stringify(w));

console.log("\nconsole errors:", consoleErrors.length ? consoleErrors : "none");
if (consoleErrors.length) fails++;
console.log(fails === 0 ? "\nRESULT: PASS" : `\nRESULT: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
