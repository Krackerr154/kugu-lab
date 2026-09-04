// Verify the M2 pre-lab walkthrough end to end: 10 steps, 5 checks that persist
// their explanation, 100% progress, KaTeX rendering, no console errors, and no
// horizontal overflow at 390x844.
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto("http://localhost:3000/prelab/m2-mg2sno4", { waitUntil: "networkidle" });

const h1 = await page.locator("h1").first().innerText();
console.log("h1:", h1.replace(/\s+/g, " "));

const eqs = await page.evaluate(() =>
  [...document.querySelectorAll(".katex")].map((e) => (e.querySelector(".katex-html") ?? e).textContent.replace(/\s+/g, " ").trim())
);
console.log("katex:", JSON.stringify(eqs));
console.log("katex errors:", await page.locator(".katex-error").count());

const root = page
  .locator("section")
  .filter({ has: page.getByRole("heading", { name: "Walkthrough Prosedur M2" }) })
  .first();

const state = () =>
  root.evaluate((el) => {
    const t = el.innerText;
    const step = t.match(/langkah\s+(\d+)\s+dari\s+(\d+)/i);
    const pct = t.match(/(\d+)%/);
    const options = [...el.querySelectorAll("button")].filter((b) => b.className.includes("w-full"));
    const commit = [...el.querySelectorAll("button")].find((b) => /^(Lanjut|Jawab cek|Tandai Prosedur)/i.test(b.innerText.trim()));
    return {
      step: step ? `${step[1]}/${step[2]}` : "?",
      pct: pct ? pct[1] + "%" : "?",
      title: el.querySelector("h4")?.innerText.trim() ?? null,
      options: options.length,
      explanation: /penjelasan/i.test(t),
      verdict: /Benar — Anda dapat melanjutkan|Jawaban belum tepat/.test(t),
      commit: commit ? { text: commit.innerText.split("\n")[0].trim(), disabled: commit.disabled } : null,
      completionNotice: /telah menyelesaikan semua langkah prosedur/i.test(t),
    };
  });

let fails = 0;
let quizzesSeen = 0;

for (let view = 1; view <= 12; view++) {
  let s = await state();
  console.log(`\nview ${view}: ${s.step} ${s.pct} — ${s.title}  [options=${s.options}]`);

  if (s.options >= 2) {
    quizzesSeen++;
    if (!s.commit || !s.commit.disabled) { console.log("  ! FAIL next not gated by the check"); fails++; }
    await root.evaluate((el) => {
      const opts = [...el.querySelectorAll("button")].filter((b) => b.className.includes("w-full"));
      opts[1].click();
    });
    await page.waitForTimeout(300);
    s = await state();
    console.log(`  after answer: explanation=${s.explanation} verdict=${s.verdict} commit=${JSON.stringify(s.commit)}`);
    if (!s.explanation || !s.verdict) { console.log("  ! FAIL feedback did not stay visible"); fails++; }
    if (s.options < 2) { console.log("  ! FAIL quiz unmounted"); fails++; }
  }

  const clicked = await root.evaluate((el) => {
    const b = [...el.querySelectorAll("button")].find((x) => /^(Lanjut|Tandai Prosedur)/i.test(x.innerText.trim()));
    if (!b) return "no commit";
    if (b.disabled) return "disabled";
    const label = b.innerText.split("\n")[0].trim();
    b.click();
    return "clicked: " + label;
  });
  console.log("  ", clicked);
  if (!clicked.startsWith("clicked")) break;
  await page.waitForTimeout(300);
}

const final = await state();
console.log("\nFINAL:", JSON.stringify(final));
if (final.step !== "10/10") { console.log("! FAIL expected 10 steps, got " + final.step); fails++; }
if (final.pct !== "100%") { console.log("! FAIL progress not 100%"); fails++; }
if (!final.completionNotice) { console.log("! FAIL no completion notice"); fails++; }
if (quizzesSeen !== 5) { console.log(`! FAIL expected 5 checks, saw ${quizzesSeen}`); fails++; }

// Mobile overflow check.
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:3000/prelab/m2-mg2sno4", { waitUntil: "networkidle" });
const overflow = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));
console.log("\nmobile 390:", JSON.stringify(overflow));
if (overflow.scrollWidth > overflow.clientWidth) { console.log("! FAIL horizontal overflow at 390px"); fails++; }

console.log("\nconsole errors:", errors.length ? errors : "none");
if (errors.length) fails++;
console.log(fails === 0 ? "\nRESULT: PASS" : `\nRESULT: ${fails} FAILURE(S)`);

await browser.close();
process.exit(fails === 0 ? 0 : 1);
