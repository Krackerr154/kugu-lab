import { chromium, expect } from "@playwright/test";

const URL = process.env.KUGU_PUBLIC_URL || "https://kugu.g-labs.my.id/modules/m4-sn-bi-electrodeposition";
const ROOM = process.env.KUGU_ROOM;
const TICKET = process.env.KUGU_TICKET;
if (!ROOM || !TICKET) throw new Error("KUGU_ROOM and KUGU_TICKET are required");
const browser = await chromium.launch({ args: ["--host-resolver-rules=MAP kugu.g-labs.my.id 103.197.189.138"] });
const presenterContext = await browser.newContext();
const studentContext = await browser.newContext();
const presenter = await presenterContext.newPage();
const student = await studentContext.newPage();
const errors = [];
for (const page of [presenter, student]) page.on("pageerror", (e) => errors.push(e.message));
try {
  await presenter.goto(URL, { waitUntil: "domcontentloaded" });
  await student.goto(URL, { waitUntil: "domcontentloaded" });
  await expect(presenter.locator("[data-presenter-deck]")).toBeVisible();
  await expect(student.getByLabel("Kode ruang presentasi", { exact: true })).toBeVisible();

  const studentNim = student.getByPlaceholder("10524xxx");
  await studentNim.fill("10524077");
  await student.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(student.getByText("NIM 10524077", { exact: true })).toBeVisible();
  await student.getByLabel("Kode ruang presentasi", { exact: true }).fill(ROOM);
  await student.getByRole("button", { name: "Ikuti presentasi", exact: true }).click();

  const presenterDeck = presenter.locator("[data-presenter-deck]");
  await presenterDeck.getByRole("button", { name: "Pembahasan", exact: true }).click();
  await presenterDeck.getByRole("button", { name: "PEG400", exact: true }).click();
  await expect.poll(async () => student.locator("#understand").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);
  await expect(student.getByRole("button", { name: "Sorot agen PEG400", exact: true })).toHaveAttribute("aria-pressed", "true");

  const urlBefore = student.url();
  if (urlBefore.includes("10524077") || urlBefore.includes(TICKET)) throw new Error("private identity/credential leaked into URL");

  await presenterDeck.getByRole("button", { name: "Akhiri presentasi", exact: true }).click();
  await expect(student.getByText("Presentasi berakhir", { exact: true })).toBeVisible();
  await expect(student.getByRole("button", { name: "Kembali ke presenter", exact: true })).toBeVisible();
  if (errors.length) throw new Error(`browser errors: ${errors.join(" | ")}`);
  console.log(JSON.stringify({ ok: true, url: new URL(URL).origin, studentFollowed: true, overlay: "peg400", endedState: true, privateUrlClean: true }));
} finally {
  await presenterContext.close();
  await studentContext.close();
  await browser.close();
}
