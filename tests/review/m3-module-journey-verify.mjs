// Verify the M3 module Brief/Understand/Rehearse/Prove/Ready restructure:
//  (A) five staged sections + sticky rail with scroll-spy and click-to-scroll
//  (B) Rehearse bench checklist: correct anode (battery graphite) & resin cure,
//      hold points, and localStorage persistence
//  (C) Ready summary separates digital prep from instructor-only confirmation
//  (D) no console errors, no horizontal overflow
import { chromium, expect } from "@playwright/test";

const URL = "http://localhost:3000/modules/m3-sn-bi-electrodeposition";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

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
console.log("\n[A] Five-stage journey + rail");
const stages = await page.evaluate(() =>
  ["brief", "understand", "rehearse", "prove", "ready"].map((id) => {
    const el = document.getElementById(id);
    return { id, present: !!el, heading: el?.querySelector("h2")?.innerText.trim() ?? null };
  })
);
console.log("   stages:", JSON.stringify(stages.map((s) => `${s.id}:${s.heading}`)));
check(stages.every((s) => s.present), "all five stage sections render");
check(
  stages.map((s) => s.heading).join(",") === "Tinjauan,Pahami,Latih,Buktikan,Siap",
  "stage headings are Tinjauan/Pahami/Latih/Buktikan/Siap"
);

const rail = page.locator('nav[aria-label="Tahap persiapan modul"]');
check((await rail.count()) === 1, "sticky stage rail present");
const railBtns = await rail.getByRole("button").count();
check(railBtns === 5, "rail has five step buttons", `${railBtns}`);

// Click "Buktikan" -> scrolls prove into view + marks aria-current=step
await rail.getByRole("button", { name: /buktikan/i }).click();
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
check(/BUKTIKAN/.test(afterClick.activeLabel), "clicked step becomes aria-current=step", afterClick.activeLabel);

// Scroll-spy: jump to Ready, rail should follow
await page.evaluate(() => document.getElementById("ready").scrollIntoView({ block: "start" }));
await page.waitForTimeout(900);
const spy = await page.evaluate(() => {
  const active = [...document.querySelectorAll('nav[aria-label="Tahap persiapan modul"] button')]
    .find((b) => b.getAttribute("aria-current") === "step");
  return active?.innerText.replace(/\s+/g, " ").trim() ?? "none";
});
check(/SIAP/.test(spy), "scroll-spy activates the Ready step when it enters view", spy);

// ---------- (B) Rehearse bench checklist ----------
console.log("\n[B] Rehearse bench checklist — correct facts + persistence");
const rehearse = page.locator("#rehearse");
const benchText = await rehearse.innerText();
check(/grafit/i.test(benchText) && /baterai bekas/i.test(benchText),
  "anode is battery graphite (not the old 'Sn/Bi atau inert' error)");
check(/2 . 24 jam|2 × 24 jam|2 x 24 jam/i.test(benchText.replace(/\u00d7/g, "x")),
  "resin cure 2×24 jam is present (the cross-session fact)");
check(/CR-06/.test(benchText), "battery disassembly flagged as CR-06 blocker");
check(/14,5 mA\/cm(²|2)/.test(benchText), "electrodeposition protocol 14,5 mA/cm² present");
check(/mirror polishing|200 . 500 . 800 . 1000|200|1000 mesh/i.test(benchText), "mesh polishing sequence present");

const holdPoints = await rehearse.evaluate((el) =>
  [...el.querySelectorAll("*")].filter((n) => /Hold Point/.test(n.textContent) && n.children.length <= 2).length
);
check(holdPoints >= 5, "multiple hold points marked", `${holdPoints}`);

// localStorage persistence: tick the first box, reload, it stays.
const firstBox = rehearse.locator('input[type="checkbox"]').first();
await firstBox.scrollIntoViewIfNeeded();
await firstBox.check();
await page.waitForTimeout(300);
const stored = await page.evaluate(() => localStorage.getItem("m3-bench-checklist"));
check(stored && JSON.parse(stored).length >= 1, "checked item written to localStorage", stored || "null");
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(600);
const persisted = await page.locator("#rehearse").locator('input[type="checkbox"]:checked').count();
check(persisted >= 1, "checked item survives reload", `${persisted} checked`);
// Clean up so re-runs start fresh.
await page.evaluate(() => localStorage.removeItem("m3-bench-checklist"));

// ---------- (C) Ready summary ----------
console.log("\n[C] Ready = honest readiness split");
const ready = page.locator("#ready");
const readyText = await ready.innerText();
check(/Persiapan digital/i.test(readyText), "digital-preparation column present");
check(/Wajib konfirmasi asisten/i.test(readyText), "instructor-confirmation column present");
check(/persiapan digital.*bukan|bukan.*berwenang|tidak menggantikan SOP/is.test(readyText),
  "boundary states digital prep is not authorization");
check(/CR-06|baterai bekas/.test(readyText), "instructor column carries the battery blocker");

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
