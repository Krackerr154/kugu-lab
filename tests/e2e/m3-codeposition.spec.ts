import { test, expect } from "@playwright/test";
import { cellFrame, ILLUSTRATION_SECONDS } from "../../lib/m3-simulation";

test("deposits grow outward from copper with no unsupported gaps in either bath", () => {
  for (const complexed of [true, false]) {
    const frame = cellFrame(ILLUSTRATION_SECONDS, complexed);
    for (const row of new Set(frame.deposited.map((atom) => atom.row))) {
      const layers = frame.deposited.filter((atom) => atom.row === row).map((atom) => atom.layer).sort();
      expect(layers).toEqual(layers.map((_, index) => index));
    }
  }
});

const route = "/modules/m3-sn-bi-electrodeposition";

test("reaction focus connects particle identity to reduction and compares baths without rewinding", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  const timeline = sim.getByRole("slider", { name: "Posisi animasi" });
  await timeline.focus();
  await page.keyboard.press("End");
  await sim.getByRole("button", { name: "Sorot Sn", exact: true }).click();
  await expect(sim).toHaveAttribute("data-focus", "sn");
  const reaction = sim.getByRole("region", { name: "Reaksi yang diamati" });
  await expect(reaction).toContainText("Reduksi timah");
  await expect(reaction.locator(".katex-html")).toContainText("2e");
  const snAtoms = sim.locator('[data-deposited-atom][data-species="sn"]');
  expect(await snAtoms.count()).toBeGreaterThan(0);
  await expect(sim.locator('[data-deposited-atom][data-species="bi"]').first()).toHaveAttribute("opacity", "0.2");
  await expect(sim.locator('[data-testid="m3-deposit"] [data-species="bi"]').first()).toHaveAttribute("opacity", "0.2");

  await sim.getByRole("button", { name: "Dengan pengompleks", exact: true }).click();
  await expect(timeline).toHaveValue("100");
  await expect(snAtoms).toHaveCount(0);
  expect(await sim.locator('[data-deposited-atom][data-species="bi"]').count()).toBeGreaterThan(0);
  await expect(sim.locator('[data-ion][data-species="sn"]').first()).toHaveAttribute("data-transport", "1.000");
  await expect(reaction).toContainText("belum ikut tereduksi");
  await expect(sim).toContainText("kaya bismut");
  await sim.getByRole("button", { name: "Sorot H2", exact: true }).click();
  await expect(reaction).toContainText("tanpa menambah massa deposit");
  await expect(reaction.locator(".katex-html")).toContainText("2e");
  await sim.getByRole("button", { name: "Tanpa pengompleks", exact: true }).click();
  await expect(timeline).toHaveValue("100");
  expect(await snAtoms.count()).toBeGreaterThan(0);
});

test("codeposition can be stepped, played, paused, scrubbed, and replayed without losing the deposit", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(route);
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  await expect(sim).toBeVisible();
  const timeline = sim.getByRole("slider", { name: "Posisi animasi" });
  const atoms = sim.locator("[data-deposited-atom]");
  await expect(timeline).toHaveValue("0");
  await expect(atoms).toHaveCount(0);
  await sim.getByRole("button", { name: "Langkah berikutnya" }).click();
  await sim.getByRole("button", { name: "Langkah berikutnya" }).click();
  await expect(timeline).toHaveValue("50");
  const halfway = await atoms.count();
  expect(halfway).toBeGreaterThan(0);

  await sim.getByRole("button", { name: "Jalankan Sel", exact: true }).click();
  await expect.poll(async () => Number(await timeline.inputValue())).toBeGreaterThan(52);
  const electron = sim.locator('[data-electron="e-up-1"]');
  const before = await electron.getAttribute("cy");
  await expect.poll(() => electron.getAttribute("cy")).not.toBe(before);
  await sim.getByRole("button", { name: "Jeda Sel", exact: true }).click();
  const paused = await timeline.inputValue();
  const still = await electron.getAttribute("cy");
  await page.waitForTimeout(250);
  await expect(timeline).toHaveValue(paused);
  await expect(electron).toHaveAttribute("cy", still!);

  await timeline.focus();
  await page.keyboard.press("End");
  await expect(timeline).toHaveValue("100");
  expect(await atoms.count()).toBeGreaterThan(halfway);
  const finished = await atoms.count();
  await page.waitForTimeout(250);
  await expect(atoms).toHaveCount(finished);
  await expect(sim).toContainText("Ilustrasi selesai");
  await expect(sim).toContainText("bukan prediksi komposisi");
  await sim.getByRole("button", { name: "Ulangi dari awal" }).click();
  await expect(timeline).toHaveValue("0");
  await expect(atoms).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(sim.getByRole("button", { name: "Jalankan Sel", exact: true })).toBeDisabled();
  await sim.getByRole("button", { name: "Langkah berikutnya" }).click();
  await expect(timeline).toHaveValue("25");
  await expect(sim).toContainText("Gerak dikurangi");
});
