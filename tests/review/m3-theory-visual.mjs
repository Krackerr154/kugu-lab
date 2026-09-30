// Verify the M3 module's "Understand" (Pahami) stage: the chemistry from the
// manual is preserved, and the section now uses the Academic Precision design
// system instead of the old rainbow gradient cards (the reskin removed in the
// Brief/Understand/Rehearse/Prove/Ready restructure).
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, storageState: "tests/e2e/m4-guest-state.json" });

const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

let fails = 0;
const check = (ok, label, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!ok) fails++;
};

await page.goto("http://localhost:3000/modules/m4-sn-bi-electrodeposition", { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const understand = page.locator("#understand");

// ---------- design-system compliance (the point of the restructure) ----------
console.log("\n[1] Academic Precision, not a rainbow reskin");
const style = await understand.evaluate((el) => {
  // Any descendant using a hardcoded Tailwind rainbow utility or gradient?
  const rainbow = /\b(sky|emerald|amber|indigo|rose|violet|slate|cyan|teal|lime|orange|fuchsia|pink|purple|blue|green|red|yellow)-(50|100|200|300|400|500|600|700|800|900)\b/;
  let rainbowEls = 0;
  let gradientEls = 0;
  for (const node of el.querySelectorAll("*")) {
    const cls = typeof node.className === "string" ? node.className : "";
    if (rainbow.test(cls)) rainbowEls++;
    if (getComputedStyle(node).backgroundImage.includes("gradient")) gradientEls++;
  }
  return { rainbowEls, gradientEls };
});
check(style.rainbowEls === 0, "no hardcoded rainbow Tailwind utilities in Understand", `${style.rainbowEls} found`);
check(style.gradientEls === 0, "no gradient backgrounds in Understand", `${style.gradientEls} found`);

// Real pictographic emoji must be gone (typographic arrows → are allowed).
const emoji = await understand.evaluate((el) =>
  (el.innerText.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu) || []).length
);
check(emoji === 0, "no emoji-as-icon in Understand", `${emoji} found`);

// ---------- three concept blocks ----------
console.log("\n[2] Three theory concept blocks");
const h3s = await understand.evaluate((el) =>
  [...el.querySelectorAll("h3, h4, h5")].map((h) => h.innerText.replace(/\s+/g, " ").trim())
);
console.log("   headings:", JSON.stringify(h3s));
check(h3s.some((h) => /Mengapa paduan/i.test(h)), "concept: why an alloy + how deposition works");
check(h3s.some((h) => /Tantangan Beda Potensial/i.test(h)), "concept: potential-gap challenge");
check(h3s.some((h) => /agen pengompleks/i.test(h)), "concept: complexing agents integrated");

const potentialDiagram = understand.locator("[data-potential-gap-diagram]");
check(await potentialDiagram.count() === 1, "potential-gap diagram is present directly in the challenge concept");
check(/Bi.*0,31.*Sn.*0,14.*0,45.*EDTA.*sitrat/i.test(await potentialDiagram.locator("[role=img]").getAttribute("aria-label") ?? ""),
  "diagram exposes Sn/Bi potentials, gap, and complexing-agent mechanism");

// ---------- chemistry content preserved ----------
console.log("\n[3] Chemistry matches the manual");
// The cell explorer + agent cards live in this stage, so their facts are in-DOM.
const text = await understand.innerText();
const want = [
  ["139", "eutectic Sn-58Bi melting point ~139 °C"],
  ["RoHS", "Pb-free / RoHS rationale"],
  ["0[.,]31 V", "Bi3+/Bi standard potential"],
  ["0[.,]14 V", "Sn2+/Sn standard potential"],
  ["0[.,]45 V", "the ~0,45 V gap is stated"],
  ["standar", "potentials labelled as STANDARD"],
  ["EDTA", "EDTA named"],
  ["sitrat", "citric acid named"],
  ["PEG400", "PEG400 named"],
  ["0,20 M", "PEG400 target concentration on the card face"],
  ["kodeposisi", "codeposition named as the goal"],
];
for (const [needle, label] of want)
  check(new RegExp(needle, "i").test(text), label);

// Subscripts/superscripts via ChemText, not raw unicode.
console.log("\n[4] Formulas rendered via ChemText");
const subs = await understand.evaluate((el) => ({
  subCount: el.querySelectorAll("sub").length,
  supCount: el.querySelectorAll("sup").length,
}));
console.log("   ", JSON.stringify(subs));
check(subs.supCount >= 2, "superscripted charges render as <sup>", `${subs.supCount}`);
check(subs.subCount >= 2, "subscripted formulas render as <sub>", `${subs.subCount}`);

// ---------- layout ----------
console.log("\n[5] Layout");
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
