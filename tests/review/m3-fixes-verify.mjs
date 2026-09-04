// Verify M3 fixes 1-3:
//  (1) electron-flow arrows both advance anode -> source -> cathode, terminals labelled
//  (2) unphysical inputs (n=0, n<0, I<=0, t<=0, A<=0, M<=0) never produce a number
//  (3) defaults reproduce the manual's 14,5 mA/cm² for 900 s, and the
//      "hitung arus dari luas katoda" button recomputes I from the measured area
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/modules/m3-sn-bi-electrodeposition";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

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
      charge: grab(/Total muatan \(Q = I × t\):\s*(\S+)/),
      molesE: grab(/Mol elektron \(Q\/F\):\s*(\S+)/),
      molesMetal: grab(/Mol logam teoretis:\s*(\S+)/),
      theoretical: grab(/Massa teoretis:\s*(\S+)/),
      density: grab(/Rapat arus \(I\/A\):\s*([^\n]+)/),
      eta: grab(/η = (\S+)/),
      alert: /Input belum valid/.test(t),
      offProtocol: /Berbeda dari titik kerja protokol/.test(t),
    };
  });

// ---------- (3) protocol defaults ----------
console.log("\n[3] Protocol operating point");
const d = await page.evaluate(() => ({
  metal: document.getElementById("m3-metal")?.value,
  current: document.getElementById("m3-current")?.value,
  time: document.getElementById("m3-time")?.value,
  area: document.getElementById("m3-area")?.value,
}));
console.log("   defaults:", JSON.stringify(d));
const r0 = await results();
console.log("   density shown:", r0.density);
check(d.time === "900", "default duration is 900 s (15 min)", `got ${d.time}`);
check(d.metal === "Sn", "default metal is the deposit (Sn), not the Cu substrate", `got ${d.metal}`);
check(/14\.50 mA\/cm²/.test(r0.density || ""), "default density is 14,50 mA/cm²", r0.density || "");
check(!r0.offProtocol, "no off-protocol warning at the protocol point");

// Button recomputes current for a different measured area.
await page.fill("#m3-area", "2.5");
await page.waitForTimeout(150);
const beforeBtn = await results();
check(beforeBtn.offProtocol, "changing area alone flags an off-protocol density", beforeBtn.density || "");
await page.getByRole("button", { name: /Hitung arus dari luas katoda/ }).click();
await page.waitForTimeout(200);
const afterBtn = await page.evaluate(() => ({
  current: document.getElementById("m3-current")?.value,
  time: document.getElementById("m3-time")?.value,
}));
const afterRes = await results();
console.log("   after button (area=2.5):", JSON.stringify(afterBtn), "density:", afterRes.density);
check(Number(afterBtn.current) === 0.0363 || Math.abs(Number(afterBtn.current) - 0.03625) < 0.0002,
  "button sets I = 14,5 mA/cm² × 2,5 cm² ≈ 0,0363 A", `got ${afterBtn.current}`);
check(!afterRes.offProtocol, "off-protocol warning clears after applying");

// ---------- (2) guards against unphysical input ----------
console.log("\n[2] Input guards");
const bad = [
  ["#m3-valence", "0", "valensi = 0"],
  ["#m3-valence", "-2", "valensi = -2"],
  ["#m3-current", "0", "arus = 0"],
  ["#m3-time", "0", "waktu = 0"],
  ["#m3-area", "0", "luas = 0"],
  ["#m3-molar-mass", "0", "massa molar = 0"],
];
for (const [sel, value, label] of bad) {
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.fill(sel, value);
  await page.waitForTimeout(200);
  const r = await results();
  const numeric = [r.charge, r.molesE, r.molesMetal, r.theoretical, r.eta].filter(Boolean).join(" ");
  const leaked = /Infinity|NaN|^-|\s-\d/.test(numeric) || /Infinity|NaN/.test(numeric);
  const negative = /(^|\s)-\d/.test(r.theoretical || "");
  check(r.alert && !leaked && !negative,
    `${label} blocks the calculation`,
    `alert=${r.alert} theoretical=${r.theoretical} eta=${r.eta}`);
  const invalidAttr = await page.getAttribute(sel, "aria-invalid");
  check(invalidAttr === "true", `${label} marks the field aria-invalid`, `got ${invalidAttr}`);
}

// ---------- (1) electron flow direction ----------
console.log("\n[1] Electron flow direction");
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const svg = await page.evaluate(() => {
  // The cell explorer's SVG deliberately has NO role="img": that role makes the
  // subtree presentational, which would hide the interactive role="button"
  // hotspots from assistive tech. Select on the aria-label instead.
  const s = document.querySelector("svg[aria-label]");
  const texts = [...s.querySelectorAll("text")].map((t) => ({
    x: Number(t.getAttribute("x")),
    y: Number(t.getAttribute("y")),
    text: t.textContent.trim(),
  }));
  return { label: s.getAttribute("aria-label"), texts };
});
const eFlow = svg.texts.filter((t) => t.text.includes("e⁻"));
console.log("   e- labels:", JSON.stringify(eFlow));
check(eFlow.length === 2, "two electron-flow labels", `got ${eFlow.length}`);
check(eFlow.every((t) => t.text.includes("→")), "both arrows point the same way around the circuit (anode → source → cathode)",
  eFlow.map((t) => t.text).join(" | "));
check(!eFlow.some((t) => t.text.includes("←")), "no arrow points back into the DC source");

const plus = svg.texts.find((t) => t.text === "+");
const minus = svg.texts.find((t) => t.text === "−" || t.text === "-");
check(!!plus && !!minus, "DC terminals are labelled + and −");
check(!!plus && !!minus && plus.x < minus.x, "+ terminal is on the anode (left) side", `+@${plus?.x} −@${minus?.x}`);
check(/anoda/i.test(svg.label || "") && /katoda/i.test(svg.label || ""), "aria-label describes the circuit");

console.log("\nconsole errors:", errors.length ? errors : "none");
if (errors.length) fails++;
console.log(fails === 0 ? "\nRESULT: PASS" : `\nRESULT: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
