// Verify the M3 CellExplorer rebuild:
//   (6) half-reactions with reduction potentials per electrode + the potential gap
//   (8) predict-before-reveal gate
//   (9) full keyboard/ARIA operability of the SVG hotspots
// Also re-checks that fixes 1-3 survived the refactor.
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/modules/m3-sn-bi-electrodeposition";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

let fails = 0;
const check = (ok, label, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!ok) fails++;
};

// ---------- (9) keyboard + ARIA on the diagram ----------
console.log("\n[9] SVG hotspot accessibility");
const a11y = await page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label]");
  const hotspots = [...svg.querySelectorAll('[role="button"]')];
  return {
    hotspotCount: hotspots.length,
    allTabbable: hotspots.every((h) => h.getAttribute("tabindex") === "0"),
    allLabelled: hotspots.every((h) => (h.getAttribute("aria-label") || "").length > 3),
    allHavePressed: hotspots.every((h) => h.hasAttribute("aria-pressed")),
    labels: hotspots.map((h) => h.getAttribute("aria-label")),
  };
});
console.log("   labels:", JSON.stringify(a11y.labels));
check(a11y.hotspotCount >= 5, "every cell component is a role=button hotspot", `got ${a11y.hotspotCount}`);
check(a11y.allTabbable, "all hotspots are keyboard reachable (tabindex=0)");
check(a11y.allLabelled, "all hotspots have a descriptive aria-label");
check(a11y.allHavePressed, "all hotspots expose aria-pressed state");

// Drive it with the keyboard only: focus the cathode hotspot and press Enter.
const activated = await page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label]");
  const cathode = [...svg.querySelectorAll('[role="button"]')]
    .find((h) => /katoda/i.test(h.getAttribute("aria-label")));
  cathode.focus();
  const focused = document.activeElement === cathode;
  cathode.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  return { focused, label: cathode.getAttribute("aria-label") };
});
await page.waitForTimeout(300);
const afterEnter = await page.evaluate(() => document.body.innerText);
check(activated.focused, "hotspot accepts DOM focus", activated.label);
check(/Katoda \(−\) — plat tembaga/.test(afterEnter), "Enter key selects the cathode and renders its detail");

// ---------- (6) half-reactions + potentials ----------
console.log("\n[6] Half-reactions and reduction potentials");
const cathodeDetail = await page.evaluate(() => {
  const t = document.body.innerText;
  const eqs = [...document.querySelectorAll(".katex")].map((e) =>
    (e.querySelector(".katex-html") ?? e).textContent.replace(/\s+/g, " ").trim()
  );
  return { text: t, eqs, katexErrors: document.querySelectorAll(".katex-error").length };
});
console.log("   katex on cathode view:", JSON.stringify(cathodeDetail.eqs.slice(0, 6)));
check(cathodeDetail.katexErrors === 0, "no KaTeX render errors", String(cathodeDetail.katexErrors));
check(cathodeDetail.eqs.some((e) => /Bi3\+.*3e|Bi.*3e−/.test(e.replace(/\s/g, ""))),
  "Bi3+ + 3e- half-reaction rendered", cathodeDetail.eqs.find((e) => /Bi/.test(e)) || "none");
check(cathodeDetail.eqs.some((e) => /Sn2\+/.test(e.replace(/\s/g, ""))), "Sn2+ + 2e- half-reaction rendered");
check(/E° = \+0,31 V/.test(cathodeDetail.text), "Bi potential +0,31 V shown");
check(/E° = −0,14 V/.test(cathodeDetail.text), "Sn potential -0,14 V shown");
check(/E° = 0,00 V/.test(cathodeDetail.text), "H+/H2 side reaction potential shown");
check(/efisiensi arus/i.test(cathodeDetail.text), "cathode note links H2 evolution to current efficiency");

// Anode half-reaction. SVG elements have no HTMLElement.click(), so dispatch a
// real MouseEvent the way a browser would.
await page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label]");
  const anode = [...svg.querySelectorAll('[role="button"]')].find((h) => /anoda/i.test(h.getAttribute("aria-label")));
  anode.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
await page.waitForTimeout(300);
const anodeText = await page.evaluate(() => document.body.innerText);
check(/Anoda \(\+\) — grafit/.test(anodeText), "anode detail renders");
check(/E° = \+1,23 V/.test(anodeText), "anode oxidation potential shown");
check(/dikonfirmasi dengan asisten/.test(anodeText), "anode note defers competing chloride oxidation to the assistant");

// The potential-gap explainer is always visible.
const gap = await page.evaluate(() => document.body.innerText);
check(/≈ 0,45 V/.test(gap), "the ~0,45 V gap between Bi and Sn is stated");
check(/kodeposisi/i.test(gap), "codeposition is named as the goal");
check(/EDTA dan asam sitrat/.test(gap), "complexing agents are tied to the potential shift");
check(/potensial <em>standar<\/em>|potensial standar/i.test(gap) || /standar/.test(gap),
  "caveat that these are STANDARD potentials");

// ---------- (8) predict before reveal ----------
console.log("\n[8] Predict-before-reveal");
const predict = page.locator("text=Pertanyaan Prediksi").locator("..");
const btn = page.getByRole("button", { name: "Tampilkan Penjelasan" });
const disabledEmpty = await btn.isDisabled();
check(disabledEmpty, "reveal button is disabled before a prediction is typed");

const revealedEarly = await page.evaluate(() => /Bismut mengendap lebih dulu/.test(document.body.innerText));
check(!revealedEarly, "answer is hidden before revealing");

const textarea = page.locator('textarea[placeholder*="Bandingkan"]');
await textarea.fill("Bismut dulu karena potensialnya lebih positif");
await page.waitForTimeout(200);
check(!(await btn.isDisabled()), "reveal button enables once a prediction exists");

await btn.click();
await page.waitForTimeout(300);
const revealed = await page.evaluate(() => document.body.innerText);
check(/Bismut mengendap lebih dulu/.test(revealed), "reveal shows the expected answer");
check(/kodeposisi/i.test(revealed) && /H_?2|H₂/.test(revealed), "explanation covers codeposition and the H2 side reaction");

// ---------- regression: fixes 1-3 ----------
console.log("\n[regression] fixes 1-3 survived the refactor");
const svgFlow = await page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label]");
  const eTexts = [...svg.querySelectorAll("text")].map((t) => t.textContent.trim()).filter((t) => t.includes("e⁻"));
  const fills = [...svg.querySelectorAll("rect")].map((r) => r.getAttribute("fill")).filter(Boolean);
  return { eTexts, tokenised: fills.every((f) => f.startsWith("var(") || f === "none") };
});
check(svgFlow.eTexts.length === 2 && svgFlow.eTexts.every((t) => t.includes("→")),
  "electron arrows still both point anode → source → cathode", svgFlow.eTexts.join(" | "));
check(svgFlow.tokenised, "SVG fills now use design tokens, not hardcoded hex");

const density = await page.evaluate(() => {
  const m = document.body.innerText.match(/Rapat arus \(I\/A\):\s*([^\n]+)/);
  return m ? m[1] : "not found";
});
check(/14\.50 mA\/cm²/.test(density), "protocol default density intact", density);

await page.fill("#m3-valence", "0");
await page.waitForTimeout(250);
const guarded = await page.evaluate(() => {
  const t = document.body.innerText;
  return { alert: /Input belum valid/.test(t), theoretical: (t.match(/Massa teoretis:\s*(\S+)/) || [])[1] };
});
check(guarded.alert && guarded.theoretical === "—", "valence guard intact", JSON.stringify(guarded));

// ---------- mobile overflow ----------
await page.setViewportSize({ width: 360, height: 800 });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const ov = await page.evaluate(() => ({
  scroll: document.documentElement.scrollWidth,
  client: document.documentElement.clientWidth,
}));
console.log("\nmobile 360:", JSON.stringify(ov));
check(ov.scroll <= ov.client, "no horizontal overflow at 360px");

console.log("\nconsole errors:", errors.length ? errors : "none");
if (errors.length) fails++;
console.log(fails === 0 ? "\nRESULT: PASS" : `\nRESULT: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
