import { test, expect } from "@playwright/test";
import { bathAgentFrame } from "../../lib/m3-ligands";
import { cellFrame } from "../../lib/m3-simulation";
import { COMPLEXING_AGENTS } from "../../lib/m3-complexing-agents";

const route = "/modules/m4-sn-bi-electrodeposition";

test("shared PEG teaching data qualifies inhibition and identifies the assigned alloy", () => {
  const peg = COMPLEXING_AGENTS.find((agent) => agent.id === "peg400")!;
  expect(peg.reference).toContain("Zn–Cr");
  expect(peg.summary).toContain("bersama");
  expect(peg.mechanism.join(" ")).not.toContain("polimer rantai panjang");
  expect(peg.mechanism.join(" ")).not.toContain("Perannya bukan mengikat ion di larutan");
  expect(peg.concentration).toBe("0,20 M akhir");
});

test("PEG evidence distinguishes the combined bath from a standalone PEG400 claim", async ({ page }) => {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  await sim.getByRole("button", { name: "Sorot agen PEG400", exact: true }).click();
  const lesson = sim.getByRole("region", { name: "PEG400 dan pertumbuhan dendrit" });
  await expect(lesson).toContainText("Model adsorpsi");
  await lesson.getByText("Dasar dan batas penjelasan", { exact: true }).click();
  await expect(lesson).toContainText("bukan hasil uji PEG400 saja");
  await expect(lesson).toContainText("Zn–Cr");
  await expect(lesson.getByRole("link", { name: /Sn–Bi.*2007/ })).toHaveAttribute("href", "https://www.sciencedirect.com/science/article/pii/S0013468607010997");
  await expect(lesson.getByRole("link", { name: /Bi.*2011/ })).toHaveAttribute("href", "https://doi.org/10.1016/j.electacta.2011.06.077");
  await expect(sim.getByRole("button", { name: "Sorot agen PEG400", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("PEG surface marker ignores growth outside its attachment site", () => {
  for (const view of ["cell", "closeup"] as const) {
    const before = bathAgentFrame(cellFrame(3.24, true), view).peg!;
    const after = bathAgentFrame(cellFrame(3.36, true), view).peg!;
    expect(after.phase).toBe("adsorbed");
    expect(after.x).toBe(before.x);
    // PEG is only drawn in the complexed bath; the bare comparison bath omits it.
    expect(bathAgentFrame(cellFrame(3.36, false), view).peg).toBeNull();
  }
});

test("PEG mechanism steps provide keyboard navigation without an independent clock", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route, { waitUntil: "domcontentloaded" });
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  await sim.getByRole("button", { name: "Sorot agen PEG400", exact: true }).click();
  const jump = sim.getByRole("button", { name: "Ke pembesaran PEG400", exact: true });
  await expect(jump).toBeVisible();
  await jump.focus();
  await page.keyboard.press("Enter");
  const lesson = sim.getByRole("region", { name: "PEG400 dan pertumbuhan dendrit" });
  await expect(lesson).toBeFocused();
  await lesson.getByRole("button", { name: "2. Situs terhambat", exact: true }).click();
  await expect(sim.getByRole("slider", { name: "Posisi animasi" })).toHaveValue("50");
  await expect(lesson.getByRole("status")).toContainText("situs pertumbuhan");
  await lesson.getByRole("button", { name: "3. Pertumbuhan tersebar", exact: true }).click();
  await expect(sim.getByRole("slider", { name: "Posisi animasi" })).toHaveValue("100");
  await lesson.getByRole("button", { name: "1. Adsorpsi", exact: true }).click();
  await expect(lesson).toHaveAttribute("data-time", "1.600");
  await expect(lesson.locator("[data-growth-node]")).toHaveCount(0);
  await expect(lesson.locator("[data-peg-site]")).toHaveCount(3);
  await expect(sim.getByRole("button", { name: "Jalankan Sel", exact: true })).toBeDisabled();
});

test("PEG inspection contrasts connected growth on the shared seekable timeline", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route, { waitUntil: "domcontentloaded" });
  const sim = page.getByRole("region", { name: "Simulasi kodeposisi" });
  await sim.getByRole("button", { name: "Langkah berikutnya" }).click();
  await sim.getByRole("button", { name: "Sorot agen PEG400", exact: true }).click();
  const lesson = sim.getByRole("region", { name: "PEG400 dan pertumbuhan dendrit" });
  await expect(lesson).toBeVisible();
  await expect(lesson).toHaveAttribute("data-time", "3.000");
  await expect(lesson.getByRole("img", { name: "Pertumbuhan tanpa PEG400" })).toBeVisible();
  await expect(lesson.getByRole("img", { name: "Pertumbuhan dengan adsorpsi PEG400" })).toBeVisible();
  const slider = sim.getByRole("slider", { name: "Posisi animasi" });
  await slider.focus();
  await page.keyboard.press("End");
  await expect(lesson).toHaveAttribute("data-time", "12.000");
  const shapes = await lesson.locator("[data-morphology]").evaluateAll((plots) => plots.map((plot) => {
    const nodes = [...plot.querySelectorAll("[data-growth-node]")];
    const fronts = new Map<string, number>();
    nodes.forEach((node) => { const row = node.getAttribute("cy")!; fronts.set(row, Math.min(fronts.get(row) ?? 240, Number(node.getAttribute("cx")))); });
    return { count: nodes.length, reach: Math.max(...nodes.map((n) => 240 - Number(n.getAttribute("cx")))), fronts: [...fronts.values()] };
  }));
  expect(shapes).toHaveLength(2);
  expect(shapes[0].count).toBeGreaterThan(0);
  expect(shapes[0].count).toBe(shapes[1].count);
  expect(shapes[0].reach).toBeGreaterThan(shapes[1].reach);
  // Suppression must not be portrayed as a guarantee of a perfectly flat film.
  expect(new Set(shapes[1].fronts).size).toBeGreaterThan(1);
  const end = await lesson.locator("[data-morphology]").first().innerHTML();
  await page.waitForTimeout(200);
  expect(await lesson.locator("[data-morphology]").first().innerHTML()).toBe(end);
  await sim.getByRole("button", { name: "Dengan pengompleks", exact: true }).click();
  await expect(lesson).toHaveAttribute("data-time", "12.000");
  await expect(lesson).toContainText("bukan jaminan bebas dendrit");
  await sim.getByRole("button", { name: "Ulangi dari awal" }).click();
  await expect(lesson.locator("[data-growth-node]")).toHaveCount(0);
  await expect(lesson).toHaveAttribute("data-time", "0.000");
});
