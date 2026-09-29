import { test, expect } from "@playwright/test";
import {
  coercePresentationState,
  isPresentationState,
  M3_PRESENTATION_VERSION,
  type M3PresentationState,
} from "../../lib/m3-presentation";

const route = "/modules/m3-sn-bi-electrodeposition";

// ── Pure contract validation (no browser) ───────────────────────────────────
test("presentation state validator accepts allowlisted shapes and rejects the rest", () => {
  const ok: M3PresentationState = { version: 1, stageId: "understand", focusId: "complexing-agents", demoOverlay: { kind: "complexing-agent", id: "peg400" } };
  expect(coercePresentationState(ok)).toEqual(ok);
  expect(coercePresentationState({ version: 1, stageId: "brief" })).toEqual({ version: 1, stageId: "brief" });

  // Wrong version / bad stage / bad focus / bad overlay → null.
  expect(coercePresentationState({ version: 2, stageId: "brief" })).toBeNull();
  expect(coercePresentationState({ version: 1, stageId: "nope" })).toBeNull();
  expect(coercePresentationState({ version: 1, stageId: "brief", focusId: "pixels" })).toBeNull();
  expect(coercePresentationState({ version: 1, stageId: "brief", demoOverlay: { kind: "complexing-agent", id: "gold" } })).toBeNull();
  expect(coercePresentationState({ version: 1, stageId: "brief", demoOverlay: { kind: "video" } })).toBeNull();
  expect(coercePresentationState(null)).toBeNull();
  expect(coercePresentationState("understand")).toBeNull();
});

test("validator strips unknown fields — arbitrary client JSON is never forwarded", () => {
  const dirty = {
    version: M3_PRESENTATION_VERSION,
    stageId: "prove",
    // Private/hostile fields that must be dropped:
    nim: "10524001",
    checklist: ["m3a-1"],
    scrollY: 4820,
    cursor: { x: 10, y: 20 },
    demoOverlay: null,
  };
  const clean = coercePresentationState(dirty);
  expect(clean).toEqual({ version: 1, stageId: "prove", demoOverlay: null });
  expect(clean).not.toHaveProperty("nim");
  expect(clean).not.toHaveProperty("checklist");
  expect(clean).not.toHaveProperty("scrollY");
  expect(isPresentationState(dirty)).toBe(true);
});

// ── Local follow prototype (BroadcastChannel, no network) ───────────────────
// A "presenter" is simulated by posting validated snapshots onto the same
// BroadcastChannel the follower subscribes to, from a second tab.

test("a follower applies presenter stage + demo-agent snapshots; a solo tab is undisturbed", async ({ context }) => {
  const follower = await context.newPage();
  await follower.emulateMedia({ reducedMotion: "reduce" });
  await follower.goto(route);

  const solo = await context.newPage();
  await solo.emulateMedia({ reducedMotion: "reduce" });
  await solo.goto(route);

  // Follower opts in.
  await follower.getByRole("button", { name: "Ikuti presentasi", exact: true }).click();
  await expect(follower.getByText("Mengikuti presentasi", { exact: true })).toBeVisible();

  // Presenter publishes: go to Understand and open the PEG400 demo overlay.
  const publish = (page: import("@playwright/test").Page, state: M3PresentationState) =>
    page.evaluate((s) => {
      const channel = new BroadcastChannel("m3-presentation");
      channel.postMessage(s);
      channel.close();
    }, state);

  await publish(follower, { version: 1, stageId: "understand", demoOverlay: { kind: "complexing-agent", id: "peg400" } });

  // Follower's journey jumps to Understand and the workbench selects PEG400.
  await expect
    .poll(async () => follower.locator("#understand").evaluate((el) => Math.round(el.getBoundingClientRect().top)))
    .toBeLessThan(300);
  await expect(follower.getByRole("button", { name: "Sorot agen PEG400", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(follower.getByText("· tahap Pahami")).toBeVisible();

  // The solo tab never moved and never selected the demo agent.
  expect(await solo.locator("#brief").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeGreaterThan(-50);
  await expect(solo.getByRole("button", { name: "Sorot agen PEG400", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(solo.getByText("Mode mandiri", { exact: true })).toBeVisible();

  // Presenter moves to Prove; follower follows.
  await publish(follower, { version: 1, stageId: "prove" });
  await expect
    .poll(async () => follower.locator("#prove").evaluate((el) => Math.round(el.getBoundingClientRect().top)))
    .toBeLessThan(300);

  await follower.close();
  await solo.close();
});

test("leaving follow mode stops remote navigation and preserves the student's own work", async ({ context }) => {
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);

  // Enter a NIM and tick a checklist item (private work).
  await page.getByPlaceholder("10524xxx").fill("10524055");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  const box = page.locator("#rehearse").locator('input[type="checkbox"]').first();
  await box.scrollIntoViewIfNeeded();
  await box.check();
  await expect(box).toBeChecked();

  // Follow, then a presenter pushes a stage.
  await page.getByRole("button", { name: "Ikuti presentasi", exact: true }).click();
  await page.evaluate(() => {
    const c = new BroadcastChannel("m3-presentation");
    c.postMessage({ version: 1, stageId: "ready" });
    c.close();
  });
  await expect.poll(async () => page.locator("#ready").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);

  // Stop following.
  await page.getByRole("button", { name: "Berhenti mengikuti", exact: true }).click();
  await expect(page.getByText("Mode mandiri", { exact: true })).toBeVisible();

  // A further presenter message must NOT move this page now.
  const before = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => {
    const c = new BroadcastChannel("m3-presentation");
    c.postMessage({ version: 1, stageId: "brief" });
    c.close();
  });
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(before, -1);

  // Private work survived leaving follow mode.
  const stillChecked = await page.locator("#rehearse").locator('input[type="checkbox"]:checked').count();
  expect(stillChecked).toBeGreaterThanOrEqual(1);
  await page.close();
});

test("malformed presenter messages are ignored without breaking the follower", async ({ context }) => {
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(route);
  await page.getByRole("button", { name: "Ikuti presentasi", exact: true }).click();

  // Garbage + a hostile private-data payload: neither should move or crash it.
  await page.evaluate(() => {
    const c = new BroadcastChannel("m3-presentation");
    c.postMessage({ version: 99, stageId: "understand" });
    c.postMessage({ hello: "world" });
    c.postMessage("not-an-object");
    c.postMessage({ version: 1, stageId: "prove", nim: "10524001", scrollY: 9999 });
    c.close();
  });
  await page.waitForTimeout(400);

  // The last message was valid apart from the extra fields → applied (stripped),
  // so it should reach Prove; the invalid ones before it did nothing harmful.
  await expect.poll(async () => page.locator("#prove").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);
  expect(errors).toEqual([]);
  await page.close();
});
