// Verify the M3 CellSimulation: animated electrons/ions/bubbles, the
// complexing-agent contrast toggle, pause control, reduced-motion collapse, and
// that the existing hotspot accessibility survived the SVG rewrite.
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/modules/m3-sn-bi-electrodeposition";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1300 } });

const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

let fails = 0;
const check = (ok, label, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!ok) fails++;
};

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

// ---------- animated parts exist and are actually animating ----------
console.log("\n[1] Animated elements");
const anim = await page.evaluate(() => {
  const read = (sel) =>
    [...document.querySelectorAll(sel)].map((el) => {
      const cs = getComputedStyle(el);
      return {
        name: cs.animationName,
        dur: cs.animationDuration,
        state: cs.animationPlayState,
        iter: cs.animationIterationCount,
      };
    });
  return {
    electrons: read("[data-electron]"),
    ions: read("[data-ion]"),
    bubbles: read("[data-bubble]"),
    deposit: read("[data-testid='m3-deposit']"),
  };
});
console.log(`   electrons=${anim.electrons.length} ions=${anim.ions.length} bubbles=${anim.bubbles.length}`);
console.log("   electron animations:", JSON.stringify([...new Set(anim.electrons.map((e) => e.name))]));
console.log("   ion animations:", JSON.stringify([...new Set(anim.ions.map((e) => e.name))]));

check(anim.electrons.length >= 6, "travelling electrons rendered", `${anim.electrons.length}`);
check(anim.ions.length >= 6, "migrating metal ions rendered", `${anim.ions.length}`);
check(anim.bubbles.length >= 3, "H2 bubbles rendered", `${anim.bubbles.length}`);
check(anim.deposit.length === 1, "deposit layer rendered");

const electronNames = new Set(anim.electrons.map((e) => e.name));
check(
  ["m3-e-up", "m3-e-right", "m3-e-down"].every((n) => electronNames.has(n)),
  "electrons animate up the anode wire, across the top, and down into the cathode",
  [...electronNames].join(",")
);
check(anim.ions.every((i) => /m3-ion-(arrive|stall)/.test(i.name)), "ions use the migration keyframes");
check(anim.bubbles.every((b) => b.name === "m3-bubble-rise"), "bubbles use the rise keyframes");
check(
  [...anim.electrons, ...anim.ions, ...anim.bubbles].every((a) => a.iter === "infinite"),
  "animations loop"
);
check(
  [...anim.electrons, ...anim.ions, ...anim.bubbles].every((a) => a.state === "running"),
  "simulation starts running"
);

// Motion must actually change geometry over time, not merely declare a keyframe.
console.log("\n[2] Motion is real (geometry changes over time)");
const samplePos = () =>
  page.evaluate(() => {
    const el = document.querySelector("[data-electron='e-up-1']");
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10 };
  });
const p1 = await samplePos();
await page.waitForTimeout(400);
const p2 = await samplePos();
console.log("   electron position:", JSON.stringify(p1), "->", JSON.stringify(p2));
check(p1.y !== p2.y || p1.x !== p2.x, "an electron physically moves between samples",
  `${JSON.stringify(p1)} vs ${JSON.stringify(p2)}`);

console.log("\nconsole errors:", consoleErrors.length ? consoleErrors : "none");
if (consoleErrors.length) fails++;
console.log(fails === 0 ? "\nPART 1: PASS" : `\nPART 1: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
