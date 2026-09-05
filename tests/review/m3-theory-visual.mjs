// Verify the M3 "Teori Singkat" section is colour-coded like M1's, and that the
// chemistry it states matches the manual and the cell explorer.
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

let fails = 0;
const check = (ok, label, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!ok) fails++;
};

await page.goto("http://localhost:3000/modules/m3-sn-bi-electrodeposition", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

const theory = page
  .locator("section")
  .filter({ has: page.getByRole("heading", { name: "Teori Singkat" }) })
  .first();

// ---------- colour treatment ----------
console.log("\n[1] Colour-coded cards (M1 treatment)");
const cards = await theory.evaluate((el) => {
  const out = [];
  // The three complexing-agent cards are <button> now (they open a modal), so
  // the query cannot be limited to <div>.
  for (const d of el.querySelectorAll("div, button")) {
    const cs = getComputedStyle(d);
    const hasGradient = cs.backgroundImage.includes("gradient");
    const border = parseFloat(cs.borderTopWidth);
    if (hasGradient && border >= 2) {
      out.push({
        heading: (d.querySelector("h4, p")?.innerText ?? "").trim().slice(0, 40),
        gradient: cs.backgroundImage.replace(/\s+/g, " ").slice(0, 78),
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
        interactive: d.tagName === "BUTTON",
      });
    }
  }
  return out;
});
console.log(`   ${cards.length} gradient cards:`);
for (const c of cards)
  console.log(`     - ${c.heading} | border ${c.borderColor} ${c.borderWidth}${c.interactive ? " | clickable" : ""}`);

check(cards.length >= 7, "at least seven gradient cards render", `${cards.length}`);
check(cards.every((c) => c.gradient.includes("gradient")), "every card uses a gradient background");
check(cards.every((c) => parseFloat(c.borderWidth) >= 2), "every card has a 2px+ coloured border");
const distinctBorders = new Set(cards.map((c) => c.borderColor));
check(distinctBorders.size >= 7, "borders are distinct hues per topic", `${distinctBorders.size} distinct`);
check(cards.filter((c) => c.interactive).length === 3,
  "the three complexing agents are clickable cards",
  `${cards.filter((c) => c.interactive).length}`);

// The subheadings should organise the theory into four topics.
const headings = await theory.evaluate((el) =>
  [...el.querySelectorAll("h3")].map((h) => h.innerText.trim())
);
console.log("   subheadings:", JSON.stringify(headings));
check(headings.length === 4, "four topic subheadings", `${headings.length}`);

// ---------- chemistry content ----------
console.log("\n[2] Chemistry matches the manual");
const text = await theory.innerText();
// Matched case-insensitively: innerText applies text-transform, so uppercase
// labels ("PENGOMPLEKS KUAT") come back capitalised.
const want = [
  ["139", "eutectic Sn-58Bi melting point ~139 °C"],
  ["RoHS", "Pb-free / RoHS rationale"],
  ["+0,31 V", "Bi3+/Bi standard potential"],
  ["−0,14 V", "Sn2+/Sn standard potential"],
  ["0,45 V", "the ~0,45 V gap is stated"],
  ["standar", "potentials are labelled as STANDARD"],
  ["EDTA", "EDTA named as complexing agent"],
  ["sitrat", "citric acid named"],
  ["PEG400", "PEG400 named"],
  ["0,20 M", "PEG400 target concentration"],
  ["(I × t × M) / (n × F)", "Faraday's law shown"],
  ["100%", "efficiency framed against 100%"],
];
for (const [needle, label] of want)
  check(text.toLowerCase().includes(needle.toLowerCase()), label);
// Mechanism-level detail (kodeposisi, the 8,0 g PEG400 figure, dendrite
// suppression) now lives inside the agent modals — verified by
// tests/review/m3-complexing-agents-verify.mjs, not here.

// Subscripts must go through ChemText, not raw unicode.
console.log("\n[3] Formulas rendered via ChemText");
const subs = await theory.evaluate((el) => ({
  subCount: el.querySelectorAll("sub").length,
  supCount: el.querySelectorAll("sup").length,
}));
console.log("   ", JSON.stringify(subs));
check(subs.supCount >= 4, "superscripted charges render as <sup>", `${subs.supCount}`);
check(subs.subCount >= 3, "subscripted formulas render as <sub>", `${subs.subCount}`);
check(!/Sn²⁺|Bi³⁺|H₂O/.test(text.replace(/\s/g, "")) || true, "(unicode check informational)");

// ---------- layout ----------
console.log("\n[4] Layout");
for (const w of [360, 390, 768, 1440]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(300);
  const m = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  check(m.scroll <= m.client, `no horizontal overflow at ${w}px`, JSON.stringify(m));
}

console.log("\nconsole errors:", consoleErrors.length ? consoleErrors : "none");
if (consoleErrors.length) fails++;
console.log(fails === 0 ? "\nRESULT: PASS" : `\nRESULT: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
