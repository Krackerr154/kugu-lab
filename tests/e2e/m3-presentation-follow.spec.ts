import { test, expect, type Page } from "@playwright/test";
import {
  coerceMessage,
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

test("wire-message validator gates the envelope and its sequence", () => {
  expect(coerceMessage({ t: "state", epoch: "e1", seq: 3, state: { version: 1, stageId: "brief" } }))
    .toEqual({ t: "state", epoch: "e1", seq: 3, state: { version: 1, stageId: "brief" } });
  expect(coerceMessage({ t: "hello", clientId: "c1" })).toEqual({ t: "hello", clientId: "c1" });
  expect(coerceMessage({ t: "ended", epoch: "e1" })).toEqual({ t: "ended", epoch: "e1" });
  // Bad envelopes.
  expect(coerceMessage({ t: "state", epoch: "e1", seq: -1, state: { version: 1, stageId: "brief" } })).toBeNull();
  expect(coerceMessage({ t: "state", epoch: "", seq: 1, state: { version: 1, stageId: "brief" } })).toBeNull();
  expect(coerceMessage({ t: "state", epoch: "e1", seq: 1, state: { version: 1, stageId: "x" } })).toBeNull();
  expect(coerceMessage({ t: "state", epoch: "e1", seq: 1.5, state: { version: 1, stageId: "brief" } })).toBeNull();
  expect(coerceMessage({ t: "bogus" })).toBeNull();
  expect(coerceMessage(null)).toBeNull();
});

// ── Local follow prototype (BroadcastChannel envelope, no network) ──────────
// A simulated presenter posts wire envelopes { t:"state", epoch, seq, state }.
const CH = "m3-presentation";
type StatePayload = { epoch: string; seq: number; state: M3PresentationState };
const publishState = (page: Page, p: StatePayload) =>
  page.evaluate(({ ch, epoch, seq, state }) => {
    const c = new BroadcastChannel(ch);
    c.postMessage({ t: "state", epoch, seq, state });
    c.close();
  }, { ch: CH, ...p });

test("a follower applies presenter stage + demo-agent snapshots; a solo tab is undisturbed", async ({ context }) => {
  const follower = await context.newPage();
  await follower.emulateMedia({ reducedMotion: "reduce" });
  await follower.goto(route);
  const solo = await context.newPage();
  await solo.emulateMedia({ reducedMotion: "reduce" });
  await solo.goto(route);

  await follower.getByRole("button", { name: "Ikuti presentasi", exact: true }).click();
  await expect(follower.getByText("Mengikuti presentasi", { exact: true }).or(follower.getByText("Menyambungkan…", { exact: true }))).toBeVisible();

  await publishState(follower, { epoch: "e1", seq: 1, state: { version: 1, stageId: "understand", demoOverlay: { kind: "complexing-agent", id: "peg400" } } });

  await expect.poll(async () => follower.locator("#understand").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);
  await expect(follower.getByRole("button", { name: "Sorot agen PEG400", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(follower.getByText("· tahap Pahami")).toBeVisible();

  expect(await solo.locator("#brief").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeGreaterThan(-50);
  await expect(solo.getByRole("button", { name: "Sorot agen PEG400", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(solo.getByText("Mode mandiri", { exact: true })).toBeVisible();

  await publishState(follower, { epoch: "e1", seq: 2, state: { version: 1, stageId: "prove" } });
  await expect.poll(async () => follower.locator("#prove").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);

  await follower.close();
  await solo.close();
});

test("a follower rejects a stale/duplicate sequence and reloads a snapshot on epoch change", async ({ context }) => {
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  await page.getByRole("button", { name: "Ikuti presentasi", exact: true }).click();

  await publishState(page, { epoch: "e1", seq: 5, state: { version: 1, stageId: "prove" } });
  await expect.poll(async () => page.locator("#prove").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);

  // Older seq within the same epoch must be ignored (stays on Prove).
  await publishState(page, { epoch: "e1", seq: 2, state: { version: 1, stageId: "brief" } });
  await page.waitForTimeout(300);
  await expect.poll(async () => page.locator("#prove").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);

  // New epoch resets the gate: even seq 1 applies.
  await publishState(page, { epoch: "e2", seq: 1, state: { version: 1, stageId: "ready" } });
  await expect.poll(async () => page.locator("#ready").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);
  await page.close();
});

test("leaving follow mode stops remote navigation and preserves the student's own work", async ({ context }) => {
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);

  await page.getByPlaceholder("10524xxx").fill("10524055");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  const box = page.locator("#rehearse").locator('input[type="checkbox"]').first();
  await box.scrollIntoViewIfNeeded();
  await box.check();
  await expect(box).toBeChecked();

  await page.getByRole("button", { name: "Ikuti presentasi", exact: true }).click();
  await publishState(page, { epoch: "e1", seq: 1, state: { version: 1, stageId: "ready" } });
  await expect.poll(async () => page.locator("#ready").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);

  await page.getByRole("button", { name: "Berhenti mengikuti", exact: true }).click();
  await expect(page.getByText("Mode mandiri", { exact: true })).toBeVisible();

  const before = await page.evaluate(() => window.scrollY);
  await publishState(page, { epoch: "e1", seq: 2, state: { version: 1, stageId: "brief" } });
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(before, -1);

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

  await page.evaluate(() => {
    const c = new BroadcastChannel("m3-presentation");
    c.postMessage({ t: "state", epoch: "e1", seq: 1, state: { version: 99, stageId: "understand" } });
    c.postMessage({ hello: "world" });
    c.postMessage("not-an-object");
    c.postMessage({ t: "state", epoch: "e1", seq: 2, state: { version: 1, stageId: "prove", nim: "10524001", scrollY: 9999 } });
    c.close();
  });
  await page.waitForTimeout(400);

  await expect.poll(async () => page.locator("#prove").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);
  expect(errors).toEqual([]);
  await page.close();
});

// ── Phase 3: presenter deck drives followers; snapshot-on-join; end session ──
test("presenter deck publishes stage + overlay to a following student and a late joiner gets the current snapshot", async ({ context }) => {
  const presenter = await context.newPage();
  await presenter.emulateMedia({ reducedMotion: "reduce" });
  await presenter.goto(route);
  const follower = await context.newPage();
  await follower.emulateMedia({ reducedMotion: "reduce" });
  await follower.goto(route);

  // Presenter starts a session (deck lives in the Ready stage).
  await presenter.getByRole("button", { name: "Mulai presentasi", exact: true }).click();
  await expect(presenter.locator("[data-presenter-deck]")).toBeVisible();

  // Follower opts in AFTER the session started, and publishes to Understand+PEG.
  await follower.getByRole("button", { name: "Ikuti presentasi", exact: true }).click();
  const deck = presenter.locator("[data-presenter-deck]");
  await deck.getByRole("button", { name: "Pahami", exact: true }).click();
  await deck.getByRole("button", { name: "PEG400", exact: true }).click();

  await expect.poll(async () => follower.locator("#understand").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);
  await expect(follower.getByRole("button", { name: "Sorot agen PEG400", exact: true })).toHaveAttribute("aria-pressed", "true");

  // A late joiner says hello on follow → presenter replies with current snapshot.
  const late = await context.newPage();
  await late.emulateMedia({ reducedMotion: "reduce" });
  await late.goto(route);
  await late.getByRole("button", { name: "Ikuti presentasi", exact: true }).click();
  await expect.poll(async () => late.locator("#understand").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(300);
  await expect(late.getByRole("button", { name: "Sorot agen PEG400", exact: true })).toHaveAttribute("aria-pressed", "true");

  // Presenter ends the session → followers see an explicit ended state, not "live".
  await presenter.getByRole("button", { name: "Akhiri presentasi", exact: true }).click();
  await expect(follower.getByText("Presentasi berakhir", { exact: true })).toBeVisible();
  await expect(follower.getByRole("button", { name: "Kembali ke presenter", exact: true })).toBeVisible();
  await expect(follower.getByRole("button", { name: "Jelajahi mandiri", exact: true })).toBeVisible();

  await presenter.close();
  await follower.close();
  await late.close();
});
