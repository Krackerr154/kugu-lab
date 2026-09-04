// Part B: gated order of addition + full walkthrough pass + mobile overflow.
import { chromium } from "@playwright/test";

const URL = "http://localhost:3000/prelab/m3-sn-bi-electrodeposition";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

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

// ---------- gated order of addition ----------
console.log("\n[B1] Order of addition is gated");
const worksheet = page
  .locator("section")
  .filter({ has: page.getByRole("heading", { name: "Worksheet Preparasi Elektrolit" }) })
  .first();

// The checklist buttons are the ones carrying aria-pressed inside the worksheet.
const orderState = () =>
  worksheet.evaluate((el) => {
    const btns = [...el.querySelectorAll("button[aria-pressed]")];
    return btns.map((b) => ({
      text: b.innerText.split("\n")[0].trim().slice(0, 42),
      pressed: b.getAttribute("aria-pressed") === "true",
      disabled: b.disabled,
    }));
  });

let st = await orderState();
console.log("   initial:", JSON.stringify(st, null, 1));
check(st.length === 6, "six addition steps", `got ${st.length}`);
check(!st[0].disabled, "step 1 is open");
check(st.slice(1).every((s) => s.disabled), "steps 2-6 locked before step 1 is ticked",
  `locked=${st.slice(1).filter((s) => s.disabled).length}/5`);

// Tick them in order; each click must unlock exactly the next one.
for (let i = 0; i < 6; i++) {
  await worksheet.evaluate((el, idx) => {
    const btns = [...el.querySelectorAll("button[aria-pressed]")];
    btns[idx].click();
  }, i);
  await page.waitForTimeout(150);
  st = await orderState();
  const nextOk = i === 5 ? true : !st[i + 1].disabled;
  check(st[i].pressed && nextOk, `ticking step ${i + 1} marks it done and unlocks step ${i + 2 <= 6 ? i + 2 : "—"}`);
}
const wsAfter = await worksheet.innerText();
check(/Urutan penggabungan lengkap/i.test(wsAfter), "completion notice appears after all six steps");
check(/deviasi/i.test(wsAfter), "completion notice asks for pH deviation reporting");

// ---------- full walkthrough pass ----------
console.log("\n[B2] Walkthrough: 11 steps, 5 checks");
const wt = page
  .locator("section")
  .filter({ has: page.getByRole("heading", { name: "Walkthrough Prosedur M3" }) })
  .first();

const wtState = () =>
  wt.evaluate((el) => {
    const t = el.innerText;
    const step = t.match(/langkah\s+(\d+)\s+dari\s+(\d+)/i);
    const pct = t.match(/(\d+)%/);
    // Detect the quiz by its option buttons, NOT by the words "cek pemahaman":
    // the walkthrough's own intro paragraph contains that phrase on every step.
    const options = [...el.querySelectorAll("button")].filter((b) =>
      b.className.includes("w-full")
    );
    return {
      step: step ? `${step[1]}/${step[2]}` : "?",
      pct: pct ? pct[1] + "%" : "?",
      title: el.querySelector("h4")?.innerText.trim() ?? null,
      quiz: options.length >= 2,
      // ProcedureWalkthrough disables the options once answered, so an
      // unanswered check is one whose options are still clickable.
      quizUnanswered: options.length >= 2 && options.some((b) => !b.disabled),
      optionCount: options.length,
      // innerText applies CSS text-transform, so the "Penjelasan" heading comes
      // back as "PENJELASAN" — match case-insensitively. (Quiz detection can NOT
      // use text, because the intro paragraph says "cek pemahaman" on every step.)
      explanation: /penjelasan/i.test(t),
      verdict: /Benar — Anda dapat melanjutkan|Jawaban belum tepat/.test(t),
      commitLabel: [...el.querySelectorAll("button")]
        .map((b) => b.innerText.split("\n")[0].trim())
        .find((x) => /^(Lanjut|Jawab cek|Tandai Prosedur)/i.test(x)) ?? null,
      done: /telah menyelesaikan semua langkah prosedur/i.test(t),
    };
  });

let quizCount = 0;
for (let view = 1; view <= 12; view++) {
  let s = await wtState();
  console.log(`\n  view ${view}: step ${s.step} ${s.pct} — ${s.title}`);
  if (s.quizUnanswered) {
    quizCount++;
    // Answer with the correct option (index 1 in every M3 check).
    const answered = await wt.evaluate((el) => {
      const opts = [...el.querySelectorAll("button")].filter((b) => b.className.includes("w-full"));
      if (opts.length < 2) return `only ${opts.length} options`;
      opts[1].click();
      return "ok";
    });
    if (answered !== "ok") { check(false, `could not answer check on view ${view}`, answered); }
    await page.waitForTimeout(300);
    s = await wtState();
    check(s.quiz && s.explanation && s.verdict,
      `check ${quizCount} (step ${s.step}) keeps panel + explanation + verdict after answering`,
      `quiz=${s.quiz} expl=${s.explanation} verdict=${s.verdict}`);
  }
  const clicked = await wt.evaluate((el) => {
    const b = [...el.querySelectorAll("button")]
      .find((x) => /^(Lanjut|Tandai Prosedur)/i.test(x.innerText.trim()));
    if (!b) return "no commit button";
    if (b.disabled) return "commit disabled";
    const label = b.innerText.split("\n")[0].trim();
    b.click();
    return "clicked: " + label;
  });
  console.log("   ", clicked);
  if (clicked.startsWith("no commit") || clicked === "commit disabled") break;
  await page.waitForTimeout(250);
}

const finalState = await wtState();
console.log("\n  FINAL:", JSON.stringify(finalState));
check(quizCount === 5, "five understanding checks encountered", `got ${quizCount}`);
check(finalState.step.endsWith("/11"), "walkthrough has 11 steps", finalState.step);
check(finalState.pct === "100%", "progress reaches 100%", finalState.pct);
check(finalState.done, "completion notice shown");

// ---------- mobile overflow + console ----------
console.log("\n[B3] Mobile and console");
await page.setViewportSize({ width: 360, height: 800 });
await page.waitForTimeout(500);
const widths = await page.evaluate(() => ({
  scroll: document.documentElement.scrollWidth,
  client: document.documentElement.clientWidth,
}));
console.log("   360px:", JSON.stringify(widths));
check(widths.scroll <= widths.client, "no horizontal overflow at 360px", JSON.stringify(widths));

console.log("\nconsole errors:", consoleErrors.length ? consoleErrors : "none");
if (consoleErrors.length) fails++;
console.log(fails === 0 ? "\nPART B: PASS" : `\nPART B: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
