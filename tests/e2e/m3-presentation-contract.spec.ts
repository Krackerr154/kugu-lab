import { test, expect } from "@playwright/test";
import { coercePresentationState, coerceMessage } from "../../lib/m3-presentation";

test("nested overlay fields never carry private data or retained references", () => {
  const overlay = { kind: "complexing-agent", id: "edta", nim: "10524001", notes: "PRIVATE" };
  const clean = coercePresentationState({ version: 1, stageId: "understand", demoOverlay: overlay });
  expect(clean).toEqual({ version: 1, stageId: "understand", demoOverlay: { kind: "complexing-agent", id: "edta" } });
  overlay.id = "citrate";
  expect(clean?.demoOverlay?.id).toBe("edta");
});

test("semantic focus and overlays cannot point outside their stage", () => {
  expect(coercePresentationState({ version: 1, stageId: "ready", focusId: "cell-map" })).toBeNull();
  expect(coercePresentationState({ version: 1, stageId: "brief", demoOverlay: { kind: "complexing-agent", id: "peg400" } })).toBeNull();
  expect(coercePresentationState({ version: 1, stageId: "prove", focusId: "calculator", demoOverlay: null })).not.toBeNull();
});

test("sequence validator rejects imprecise and negative sequence values", () => {
  for (const seq of [Number.MAX_SAFE_INTEGER + 1, -1, 1.5]) {
    expect(coerceMessage({ t: "state", epoch: "e1", seq, state: { version: 1, stageId: "brief" } })).toBeNull();
  }
});

test("student can enter a room without giving a NIM and presenter authority is explicit", async ({ page }) => {
  test.skip(!process.env.NEXT_PUBLIC_M3_RELAY_URL, "relay UI is enabled only in the production relay build");
  await page.goto("/modules/m4-sn-bi-electrodeposition", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Kode ruang presentasi", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Buka kontrol pengajar", exact: true }).click();
  await expect(page.getByLabel("Tiket pengajar", { exact: true })).toHaveAttribute("type", "password");
  await expect(page.getByText(/bukan bukti kehadiran/i).first()).toBeVisible();
});
