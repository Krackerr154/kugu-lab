// Part 2: the complexing-agent contrast toggle, pause control, reduced-motion
// collapse, hotspot regression, and layout.
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
await page.waitForTimeout(700);

const simState = () =>
  page.evaluate(() => {
    const ions = [...document.querySelectorAll("[data-ion]")].map((el) => ({
      species: el.getAttribute("data-species"),
      arrives: el.getAttribute("data-arrives"),
      anim: getComputedStyle(el).animationName,
    }));
    const dep = document.querySelector("[data-testid='m3-deposit']");
    return {
      ions,
      snArrive: ions.filter((i) => i.species === "sn" && i.arrives === "true").length,
      snStall: ions.filter((i) => i.species === "sn" && i.arrives === "false").length,
      biArrive: ions.filter((i) => i.species === "bi" && i.arrives === "true").length,
      deposit: dep?.getAttribute("data-deposit"),
      depositFill: dep ? getComputedStyle(dep).fill : null,
    };
  });

// ---------- complexing-agent contrast: the core teaching interaction ----------
console.log("\n[3] Complexing-agent contrast toggle");
const withAgents = await simState();
console.log("   with agents:", JSON.stringify({ ...withAgents, ions: undefined }));
check(withAgents.snArrive === 3 && withAgents.snStall === 0,
  "with agents: every Sn2+ ion reaches the cathode",
  `arrive=${withAgents.snArrive} stall=${withAgents.snStall}`);
check(withAgents.biArrive === 4, "with agents: Bi3+ also reaches the cathode", `${withAgents.biArrive}`);
check(withAgents.deposit === "alloy", "with agents: deposit is labelled alloy", String(withAgents.deposit));

// The PEG400 agent card also matches /pengompleks/ ("bukan pengompleks"), so
// anchor on the toggle's exact labels instead.
const toggle = page.getByRole("button", { name: /^(Dengan|Tanpa) pengompleks$/ });
check((await toggle.getAttribute("aria-pressed")) === "true", "toggle starts pressed (agents present)");
await toggle.click();
await page.waitForTimeout(400);

const withoutAgents = await simState();
console.log("   without agents:", JSON.stringify({ ...withoutAgents, ions: undefined }));
check(withoutAgents.snStall === 3 && withoutAgents.snArrive === 0,
  "without agents: every Sn2+ ion stalls before the cathode",
  `arrive=${withoutAgents.snArrive} stall=${withoutAgents.snStall}`);
check(withoutAgents.biArrive === 4,
  "without agents: Bi3+ still reaches the cathode (it deposits first)",
  `${withoutAgents.biArrive}`);
check(withoutAgents.deposit === "bismuth-rich",
  "without agents: deposit is labelled bismuth-rich", String(withoutAgents.deposit));
check(withoutAgents.depositFill !== withAgents.depositFill,
  "deposit colour differs between the two states",
  `${withAgents.depositFill} vs ${withoutAgents.depositFill}`);
check(withoutAgents.ions.filter((i) => i.anim === "m3-ion-stall").length === 3,
  "stalling ions use the stall keyframes");

// The explanation text must change with the state, and be announced.
const explain = await page.evaluate(() => {
  const el = [...document.querySelectorAll("[aria-live='polite']")]
    .find((n) => /pengompleks/i.test(n.innerText));
  return el ? el.innerText.replace(/\s+/g, " ") : null;
});
console.log("   explanation:", explain?.slice(0, 130));
check(/Tanpa pengompleks/i.test(explain ?? ""), "explanation switches to the uncomplexed case");
check(/\+0,31 V/.test(explain ?? "") && /−0,14 V/.test(explain ?? ""),
  "explanation cites both standard potentials");
check(/kaya bismut/i.test(explain ?? ""), "explanation names the bismuth-rich outcome");

await toggle.click();
await page.waitForTimeout(300);
const back = await simState();
check(back.deposit === "alloy" && back.snArrive === 3, "toggling back restores codeposition");

// ---------- pause ----------
console.log("\n[4] Pause control");
const pauseBtn = page.getByRole("button", { name: /Jeda Sel|Jalankan Sel/ });
check(/Jeda Sel/.test(await pauseBtn.innerText()), "button offers pause while running");
await pauseBtn.click();
await page.waitForTimeout(350);

const paused = await page.evaluate(() => {
  const els = [...document.querySelectorAll("[data-electron], [data-ion], [data-bubble]")];
  return {
    allPaused: els.every((el) => getComputedStyle(el).animationPlayState === "paused"),
    label: [...document.querySelectorAll("button")]
      .map((b) => b.innerText.trim())
      .find((t) => /Jalankan Sel|Jeda Sel/.test(t)),
    svgClass: document.querySelector("svg[aria-label]")?.getAttribute("class") ?? "",
  };
});
check(paused.allPaused, "every animation is paused");
check(/Jalankan Sel/.test(paused.label ?? ""), "button switches to resume", String(paused.label));
check(paused.svgClass.includes("m3-sim-paused"), "svg carries the paused class");

// Paused elements must remain visible, not vanish.
const visibleWhilePaused = await page.evaluate(() =>
  [...document.querySelectorAll("[data-ion]")].filter((el) => el.getBoundingClientRect().width > 0).length
);
check(visibleWhilePaused >= 6, "ions stay on screen while paused", `${visibleWhilePaused}`);

await pauseBtn.click();
await page.waitForTimeout(300);
const resumed = await page.evaluate(() =>
  [...document.querySelectorAll("[data-electron]")].every(
    (el) => getComputedStyle(el).animationPlayState === "running"
  )
);
check(resumed, "resume restarts the animation");

// ---------- hotspot regression: the SVG was rewritten ----------
console.log("\n[5] Hotspot accessibility survived the rewrite");
const a11y = await page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label]");
  const hs = [...svg.querySelectorAll('[role="button"]')];
  return {
    count: hs.length,
    tabbable: hs.every((h) => h.getAttribute("tabindex") === "0"),
    labelled: hs.every((h) => (h.getAttribute("aria-label") || "").length > 3),
    pressed: hs.every((h) => h.hasAttribute("aria-pressed")),
  };
});
check(a11y.count === 6, "six hotspots still present", `${a11y.count}`);
check(a11y.tabbable && a11y.labelled && a11y.pressed, "hotspots keep tabindex/aria-label/aria-pressed");

const enterWorks = await page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label]");
  const cathode = [...svg.querySelectorAll('[role="button"]')]
    .find((h) => /katoda/i.test(h.getAttribute("aria-label")));
  cathode.focus();
  const ok = document.activeElement === cathode;
  cathode.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  return ok;
});
await page.waitForTimeout(300);
check(enterWorks, "cathode hotspot accepts focus");
check(/Katoda \(−\) — plat tembaga/.test(await page.evaluate(() => document.body.innerText)),
  "Enter still opens the cathode detail");

// ---------- reduced motion ----------
console.log("\n[6] prefers-reduced-motion");
await page.emulateMedia({ reducedMotion: "reduce" });
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(600);
const reduced = await page.evaluate(() => {
  const els = [...document.querySelectorAll("[data-electron], [data-ion], [data-bubble]")];
  return {
    total: els.length,
    noneAnimated: els.every((el) => getComputedStyle(el).animationName === "none"),
    stillVisible: els.filter((el) => {
      const cs = getComputedStyle(el);
      return cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.3;
    }).length,
  };
});
console.log("   ", JSON.stringify(reduced));
check(reduced.noneAnimated, "all animations disabled under reduced motion");
check(reduced.stillVisible === reduced.total,
  "diagram remains a readable still illustration",
  `${reduced.stillVisible}/${reduced.total}`);
await page.emulateMedia({ reducedMotion: null });

// ---------- layout ----------
console.log("\n[7] Layout");
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
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
console.log(fails === 0 ? "\nPART 2: PASS" : `\nPART 2: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
