// Verify the M4 electrolyte card's inline complexing-agent group.
// The former standalone modal explorer is intentionally no longer rendered.
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/modules/m4-sn-bi-electrodeposition";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, storageState: "tests/e2e/m4-guest-state.json" });
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

let fails = 0;
const check = (ok, label, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) fails++;
};

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const group = page.locator("[data-electrolyte-agents]");
check(await group.count() === 1, "inline electrolyte agent group renders");
check(await group.getByRole("tab").count() === 3, "three agent tabs render");
check(await page.getByRole("dialog").count() === 0, "standalone agent dialog is absent");
check(await page.locator('section[aria-label="Agen dalam beaker"]').count() === 0, "removed beaker detail panel is absent");

const names = await group.getByRole("tab").evaluateAll((tabs) => tabs.map((tab) => tab.textContent.replace(/\s+/g, " ").trim()));
check(names.join("|").includes("EDTA"), "EDTA tab is present", names.join(" | "));
check(names.join("|").includes("Asam Sitrat"), "citric-acid tab is present", names.join(" | "));
check(names.join("|").includes("PEG400"), "PEG400 tab is present", names.join(" | "));

for (const [id, label, needle] of [["edta", "EDTA", "heksadentat"], ["citrate", "Asam Sitrat", "trikarboksilat"], ["peg400", "PEG400", "dendrit"]]) {
  await page.locator(`#electrolyte-agent-tab-${id}`).click();
  await page.waitForTimeout(100);
  const panel = group.locator("[data-active-agent]");
  check(await panel.getAttribute("data-active-agent") === id, `${label}: active panel follows tab`);
  check((await panel.innerText()).toLowerCase().includes(needle.toLowerCase()), `${label}: mechanism/effect content remains`, needle);
  check(await page.getByRole("dialog").count() === 0, `${label}: no modal opens`);
}

const links = await group.evaluate(() => [...document.querySelectorAll('[role="tab"]')].every((tab) => {
  const target = document.getElementById(tab.getAttribute("aria-controls") ?? "");
  return target && target.getAttribute("role") === "tabpanel";
}));
check(links, "all agent tabs point to a mounted panel");

for (const width of [390, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(200);
  const metrics = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  check(metrics.scroll <= metrics.client, `no overflow at ${width}px`, JSON.stringify(metrics));
}

check(errors.length === 0, "no browser console errors", errors.join(" | "));
console.log(fails === 0 ? "\nRESULT: PASS" : `\nRESULT: ${fails} FAILURE(S)`);
await browser.close();
process.exit(fails === 0 ? 0 : 1);
