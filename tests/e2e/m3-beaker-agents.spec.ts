import { test, expect } from "@playwright/test";

const route = "/modules/m4-sn-bi-electrodeposition";

test("bound ligand symbols remain inside the beaker liquid at reduction", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  await sim.getByRole("button", { name: "Langkah berikutnya" }).click();
  const geometry = await sim.getByTestId("m3-cell-scene").evaluate((svg) => {
    const liquid = svg.querySelector('[data-cell-component="electrolyte"]')!.getBoundingClientRect();
    return [...svg.querySelectorAll("[data-ligand]")].map((ligand) => {
      const r = ligand.getBoundingClientRect();
      return { left: r.left - liquid.left, top: r.top - liquid.top, right: liquid.right - r.right, bottom: liquid.bottom - r.bottom };
    });
  });
  expect(geometry).toHaveLength(4);
  for (const g of geometry) for (const clearance of Object.values(g)) expect(clearance).toBeGreaterThanOrEqual(-1);
});

test("agent controls do not separate playback controls from the beaker on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  const play = await sim.getByRole("button", { name: "Jalankan Sel", exact: true }).boundingBox();
  const scene = await sim.getByTestId("m3-cell-scene").boundingBox();
  expect(play!.y).toBeLessThan(scene!.y);
  expect(scene!.y + scene!.height - play!.y).toBeLessThan(650);
});

test("in-beaker agent labels remain usable without the removed detail panel", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  const beaker = sim.getByTestId("m3-cell-scene");
  const citrate = beaker.getByRole("button", { name: "Detail Sitrat di beaker", exact: true });
  await expect(citrate).toBeVisible();
  await sim.getByRole("button", { name: "Langkah berikutnya" }).click();
  await citrate.focus();
  await page.keyboard.press("Space");
  await expect(sim.getByRole("button", { name: "Sorot agen Sitrat", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(sim.getByRole("region", { name: "Agen dalam beaker" })).toHaveCount(0);
  await expect(beaker.locator('[data-ligand][data-agent="citrate"]').first()).toHaveAttribute("opacity", "1");
  await expect(sim.getByTestId("m3-agents-closeup").locator('[data-agent="edta"]').first()).toHaveAttribute("opacity", "0.5");

  await beaker.getByRole("button", { name: "Detail EDTA di beaker", exact: true }).click();
  await expect(sim.getByRole("button", { name: "Sorot agen EDTA", exact: true })).toHaveAttribute("aria-pressed", "true");
  await beaker.getByRole("button", { name: "Detail PEG400 di beaker", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(sim.getByRole("button", { name: "Sorot agen PEG400", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(sim.getByRole("slider", { name: "Posisi animasi" })).toHaveValue("25");

  await sim.getByRole("button", { name: "Dengan pengompleks", exact: true }).click();
  await sim.getByRole("button", { name: "Sorot agen EDTA", exact: true }).click();
  await expect(sim.getByRole("button", { name: /^Sorot agen / })).toHaveCount(3);
  await expect(sim).not.toContainText("ligan dan muatan kompleks tidak digambar");
});

test("beaker ligands bind and return to solution on the same seekable timeline", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  const beaker = sim.getByTestId("m3-cell-scene");
  const ligands = beaker.locator("[data-ligand]");
  await expect(ligands).toHaveCount(4);
  const edta = beaker.locator('[data-ligand="edta-0"]');
  await expect(edta).toHaveAttribute("data-phase", "associating");
  const initial = await edta.getAttribute("transform");
  await sim.getByRole("button", { name: "Langkah berikutnya" }).click();
  await expect(edta).toHaveAttribute("data-phase", "bound");
  await expect(edta).not.toHaveAttribute("transform", initial!);
  const bound = await edta.getAttribute("transform");
  await page.waitForTimeout(200);
  await expect(edta).toHaveAttribute("transform", bound!);

  const timeline = sim.getByRole("slider", { name: "Posisi animasi" });
  await timeline.focus();
  await page.keyboard.press("End");
  await expect(edta).toHaveAttribute("data-phase", "released");
  await expect(ligands).toHaveCount(4);
  await expect(beaker.locator('[data-testid="m3-deposit"] [data-ligand]')).toHaveCount(0);
  await expect(beaker.locator('[data-agent-layer="peg400"]')).toHaveAttribute("data-phase", "adsorbed");

  await sim.getByRole("button", { name: "Dengan pengompleks", exact: true }).click();
  await expect(ligands).toHaveCount(0);
  await expect(beaker.locator('[data-agent-layer="peg400"]')).toHaveCount(0);
  await expect(timeline).toHaveValue("100");
  await sim.getByRole("button", { name: "Tanpa pengompleks", exact: true }).click();
  await expect(ligands).toHaveCount(4);
  await sim.getByRole("button", { name: "Ulangi dari awal" }).click();
  await expect(edta).toHaveAttribute("data-phase", "associating");
  await expect(edta).toHaveAttribute("transform", initial!);
});
