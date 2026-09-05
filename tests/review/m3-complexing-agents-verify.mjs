// Verify the M3 ComplexingAgentExplorer: three clickable cards, an animated
// modal per agent, correct chemistry, keyboard/ARIA behaviour, and that the
// data-driven icon names are real Material Symbols ligatures (the icon-names
// spec only sweeps literal names in .tsx, so `{agent.icon}` escapes it).
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/modules/m3-sn-bi-electrodeposition";
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

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const section = page
  .locator("div")
  .filter({ has: page.getByRole("heading", { name: "Peran Agen Pengompleks" }) })
  .last();

// ---------- cards ----------
console.log("\n[1] Three clickable agent cards");
const cards = page.getByRole("button", { name: /Lihat mekanisme/ });
const cardCount = await cards.count();
check(cardCount === 3, "three cards render as buttons", `${cardCount}`);

const cardInfo = await page.evaluate(() => {
  const btns = [...document.querySelectorAll("button")].filter((b) =>
    b.innerText.includes("Lihat mekanisme")
  );
  return btns.map((b) => {
    const cs = getComputedStyle(b);
    return {
      name: b.querySelector("h4")?.innerText.trim() ?? "",
      text: b.innerText.replace(/\n/g, " | ").slice(0, 90),
      gradient: cs.backgroundImage.includes("gradient"),
      borderColor: cs.borderTopColor,
      borderWidth: cs.borderTopWidth,
      hasPopup: b.getAttribute("aria-haspopup"),
      expanded: b.getAttribute("aria-expanded"),
    };
  });
});
for (const c of cardInfo) console.log(`     - ${c.name}: border ${c.borderColor} ${c.borderWidth}`);
check(cardInfo.map((c) => c.name).join(",") === "EDTA,Asam Sitrat,PEG400",
  "cards are EDTA, Asam Sitrat, PEG400", cardInfo.map((c) => c.name).join(","));
check(cardInfo.every((c) => c.gradient), "each card keeps the gradient treatment");
check(new Set(cardInfo.map((c) => c.borderColor)).size === 3, "three distinct hues");
check(cardInfo.every((c) => c.hasPopup === "dialog"), "cards declare aria-haspopup=dialog");
check(cardInfo.every((c) => c.expanded === "false"), "aria-expanded starts false");

// Data-driven icons must be real ligatures, not literal words.
console.log("\n[2] Data-driven icon names are real glyphs");
const iconWidths = await page.evaluate(async () => {
  await document.fonts.ready;
  const probe = (name) => {
    const s = document.createElement("span");
    s.className = "material-symbols-outlined";
    s.textContent = name;
    s.style.position = "absolute";
    s.style.visibility = "hidden";
    s.style.width = "auto";
    s.style.overflow = "visible";
    document.body.appendChild(s);
    const w = s.getBoundingClientRect().width;
    s.remove();
    return w;
  };
  const em = probe("check_circle"); // known-good single glyph
  return { em, hub: probe("hub"), account_tree: probe("account_tree"), layers: probe("layers") };
});
console.log("   widths:", JSON.stringify(iconWidths));
for (const n of ["hub", "account_tree", "layers"]) {
  check(Math.abs(iconWidths[n] - iconWidths.em) < 2,
    `"${n}" renders as a single glyph`, `${iconWidths[n].toFixed(1)}px vs ${iconWidths.em.toFixed(1)}px`);
}

// ---------- modal per agent ----------
console.log("\n[3] Modal opens per agent with correct content");
const expected = {
  EDTA: ["heksadentat", "Nernst", "0,05 M", "1,4612 g", "kodeposisi", "Tsai"],
  "Asam Sitrat": ["trikarboksilat", "0,30 M", "5,7636 g", "buffer", "interactive effects"],
  PEG400: ["teradsorpsi", "dendrit", "0,20 M", "8,0 g", "nominal rata-rata", "10.1149"],
};

for (const [name, needles] of Object.entries(expected)) {
  await page.getByRole("button", { name: new RegExp(`^${name}`) }).first().click();
  await page.waitForTimeout(450);

  const dialog = page.getByRole("dialog");
  check(await dialog.count() === 1, `${name}: dialog opens`);

  const state = await dialog.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      title: el.querySelector("h3")?.innerText.trim() ?? "",
      ariaModal: el.getAttribute("aria-modal"),
      labelledby: el.getAttribute("aria-labelledby"),
      animation: cs.animationName,
      duration: cs.animationDuration,
      text: el.innerText,
      focusedIsClose:
        document.activeElement?.getAttribute("aria-label")?.startsWith("Tutup penjelasan") ?? false,
      bodyLocked: getComputedStyle(document.body).overflow === "hidden",
      sections: [...el.querySelectorAll("section")].length,
    };
  });

  check(state.title === name, `${name}: dialog title matches`, state.title);
  check(state.ariaModal === "true" && state.labelledby === "m3-agent-modal-title",
    `${name}: dialog has aria-modal and a label`);
  check(state.animation === "popup-enter", `${name}: popup-enter animation applied`, state.animation);
  check(state.focusedIsClose, `${name}: focus moves into the dialog`);
  check(state.bodyLocked, `${name}: page behind is scroll-locked`);
  check(state.sections === 3, `${name}: mechanism + effect + open-question sections`, `${state.sections}`);

  // innerText applies CSS text-transform, so the uppercase `kind` line comes back
  // as "PENGOMPLEKS PENDAMPING (TRIKARBOKSILAT)" — match case-insensitively.
  for (const n of needles)
    check(state.text.toLowerCase().includes(n.toLowerCase()), `${name}: content mentions "${n}"`);

  // Backdrop must animate too.
  const backdrop = await page.evaluate(() => {
    const el = document.querySelector(".animate-backdrop-enter");
    return el ? getComputedStyle(el).animationName : null;
  });
  check(backdrop === "backdrop-enter", `${name}: backdrop animation applied`, String(backdrop));

  // Escape closes and focus returns to the card that opened it.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(350);
  const closed = await page.evaluate(() => ({
    dialogs: document.querySelectorAll('[role="dialog"]').length,
    bodyOverflow: getComputedStyle(document.body).overflow,
    activeIsCard: document.activeElement?.innerText?.includes("Lihat mekanisme") ?? false,
  }));
  check(closed.dialogs === 0, `${name}: Escape closes the dialog`);
  check(closed.bodyOverflow !== "hidden", `${name}: scroll lock released`);
  check(closed.activeIsCard, `${name}: focus returns to the originating card`);
}

// ---------- close affordances ----------
console.log("\n[4] Other close paths");
await page.getByRole("button", { name: /^EDTA/ }).first().click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Tutup penjelasan EDTA/ }).click();
await page.waitForTimeout(300);
check(await page.getByRole("dialog").count() === 0, "close button dismisses the dialog");

await page.getByRole("button", { name: /^PEG400/ }).first().click();
await page.waitForTimeout(400);
// Click the backdrop itself (top-left corner, outside the centred panel).
await page.mouse.click(8, 8);
await page.waitForTimeout(300);
check(await page.getByRole("dialog").count() === 0, "backdrop click dismisses the dialog");

// PEG400 has no equilibrium, so it must say so rather than inventing one.
console.log("\n[5] PEG400 does not fake an equilibrium");
await page.getByRole("button", { name: /^PEG400/ }).first().click();
await page.waitForTimeout(400);
const pegText = await page.getByRole("dialog").innerText();
check(/Tanpa persamaan kesetimbangan/i.test(pegText), "PEG400 explicitly has no equation card");
check(!/⇌/.test(pegText), "no equilibrium arrow shown for PEG400");
await page.keyboard.press("Escape");
await page.waitForTimeout(250);

// ---------- layout ----------
console.log("\n[6] Layout");
for (const w of [360, 390, 768, 1440]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(300);
  const m = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  check(m.scroll <= m.client, `no overflow at ${w}px (cards)`, JSON.stringify(m));

  await page.getByRole("button", { name: /^EDTA/ }).first().click();
  await page.waitForTimeout(400);
  const mm = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  check(mm.scroll <= mm.client, `no overflow at ${w}px (modal open)`, JSON.stringify(mm));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
}

console.log("\nconsole errors:", consoleErrors.length ? consoleErrors : "none");
if (consoleErrors.length) fails++;
console.log(fails === 0 ? "\nRESULT: PASS" : `\nRESULT: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
