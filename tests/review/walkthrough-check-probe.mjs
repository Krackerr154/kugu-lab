// Full pass through the M1 ProcedureWalkthrough: answers every check, commits the
// final step, and asserts the check panel persists, the explanation is readable,
// and progress reaches 100%.
// NOTE: innerText applies CSS text-transform, so uppercase labels must be matched
// case-insensitively ("Langkah 1 dari 8" renders as "LANGKAH 1 DARI 8").
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
await page.goto("http://localhost:3000/prelab/m1-reactions", { waitUntil: "networkidle" });

const root = page
  .locator("section")
  .filter({ has: page.getByRole("heading", { name: "Walkthrough Prosedur M1" }) })
  .first();

const state = () =>
  root.evaluate((el) => {
    const t = el.innerText;
    const step = t.match(/langkah\s+(\d+)\s+dari\s+(\d+)/i);
    const pct = t.match(/(\d+)%/);
    const labels = [...el.querySelectorAll("button")].map((b) => ({
      text: b.innerText.split("\n")[0].trim(),
      disabled: b.disabled,
    }));
    // Detect the quiz by its option buttons, NOT by the phrase "Cek pemahaman" —
    // the walkthrough intro paragraph contains that phrase on every step.
    const options = [...el.querySelectorAll("button")].filter((b) => b.className.includes("w-full"));
    return {
      step: step ? `${step[1]}/${step[2]}` : "?",
      pct: pct ? pct[1] + "%" : "?",
      title: el.querySelector("h4")?.innerText.trim() ?? null,
      quiz: options.length >= 2,
      options: options.length,
      explanation: /penjelasan/i.test(t),
      verdict: /Benar — Anda dapat melanjutkan|Jawaban belum tepat/.test(t),
      commit: labels.find((l) => /^(Lanjut|Jawab cek|Tandai Prosedur)/i.test(l.text)) ?? null,
      completionNotice: /telah menyelesaikan semua langkah prosedur/i.test(t),
    };
  });

let failures = 0;
for (let view = 1; view <= 9; view++) {
  let s = await state();
  console.log(`\nview ${view}: step ${s.step} ${s.pct} — ${s.title}`);
  console.log(`  quiz=${s.quiz} explanation=${s.explanation} verdict=${s.verdict} btn=${JSON.stringify(s.commit)}`);

  if (s.quiz) {
    // Options are the full-width buttons rendered inside the quiz card.
    const answered = await root.evaluate((el) => {
      const opts = [...el.querySelectorAll("button")].filter((b) => b.className.includes("w-full"));
      if (opts.length < 2) return `only ${opts.length} options`;
      opts[1].click();
      return "ok";
    });
    if (answered !== "ok") { console.log("  ! could not answer:", answered); failures++; }
    await page.waitForTimeout(350);
    s = await state();
    console.log(`  after answer: quiz=${s.quiz} explanation=${s.explanation} verdict=${s.verdict} btn=${JSON.stringify(s.commit)}`);
    if (!s.quiz) { console.log("  ! FAIL quiz panel unmounted after answering"); failures++; }
    if (!s.explanation || !s.verdict) { console.log("  ! FAIL feedback missing"); failures++; }
  }

  const clicked = await root.evaluate((el) => {
    const b = [...el.querySelectorAll("button")].find((x) => /^(Lanjut|Tandai Prosedur)/i.test(x.innerText.trim()));
    if (!b) return "no commit button";
    if (b.disabled) return "commit disabled";
    const label = b.innerText.split("\n")[0].trim();
    b.click();
    return "clicked: " + label;
  });
  console.log("  ", clicked);
  if (clicked.startsWith("no commit") || clicked === "commit disabled") break;
  await page.waitForTimeout(350);
}

const final = await state();
console.log("\nFINAL:", JSON.stringify(final, null, 1));
if (final.pct !== "100%") { console.log("! FAIL progress did not reach 100%"); failures++; }
if (!final.completionNotice) { console.log("! FAIL completion notice missing"); failures++; }

console.log(failures === 0 ? "\nRESULT: PASS" : `\nRESULT: ${failures} FAILURE(S)`);
await browser.close();
process.exit(failures === 0 ? 0 : 1);
