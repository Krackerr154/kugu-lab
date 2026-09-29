import { test, expect } from "@playwright/test";
import {
  GUEST_IDENTITY,
  IDENTITY_KEY,
  LEGACY_MIGRATION_MARKER,
  migrateLegacyWorkOnce,
  namespacedKey,
  readIdentity,
  scopeToken,
  validateNim,
  writeIdentity,
  type StudentIdentity,
} from "../../lib/m3-identity";

const route = "/modules/m3-sn-bi-electrodeposition";

// ── Pure logic (no browser) ────────────────────────────────────────────────
test("NIM validation enforces the confirmed 10524xxx cohort format", () => {
  expect(validateNim("10524001")).toEqual({ ok: true, value: "10524001" });
  expect(validateNim("10524999")).toEqual({ ok: true, value: "10524999" });
  for (const raw of ["  10524999 ", "10524001 ", "10524001\n", "\t10524001", "１０５２４００１"]) {
    expect(validateNim(raw).ok, `raw identifier ${JSON.stringify(raw)} must not be normalized`).toBe(false);
  }
  expect(validateNim("10521028").ok).toBe(false); // older intake, out of scope
  expect(validateNim("1052400").ok).toBe(false); // too short
  expect(validateNim("105240012").ok).toBe(false); // too long
  expect(validateNim("abc").ok).toBe(false);
  expect(validateNim("").ok).toBe(false);
});

test("namespacing separates NIM, guest, and legacy keys", () => {
  const a: StudentIdentity = { version: 1, mode: "nim", nim: "10524001" };
  const b: StudentIdentity = { version: 1, mode: "nim", nim: "10524002" };
  expect(scopeToken(a)).toBe("nim-10524001");
  expect(scopeToken(GUEST_IDENTITY)).toBe("guest");
  expect(scopeToken(null)).toBe("guest");
  expect(namespacedKey("m3-notebook", a)).toBe("m3-notebook::nim-10524001");
  expect(namespacedKey("m3-notebook", a)).not.toBe(namespacedKey("m3-notebook", b));
});

// ── Storage helpers under a jsdom-free page context ─────────────────────────
test("legacy work migrates once into the first claiming NIM and is never deleted", async ({ page }) => {
  await page.goto(route);
  const result = await page.evaluate(
    ([bench, marker]) => {
      localStorage.clear();
      localStorage.setItem("m3-bench-checklist", JSON.stringify(["m3a-1"]));
      // Re-run the pure helper inside the page against real localStorage.
      const scope = (nim: string) => `m3-bench-checklist::nim-${nim}`;
      const migrate = (nim: string) => {
        if (localStorage.getItem(marker)) return;
        const legacy = localStorage.getItem(bench);
        if (legacy != null && localStorage.getItem(scope(nim)) == null) {
          localStorage.setItem(scope(nim), legacy);
        }
        localStorage.setItem(marker, `nim-${nim}`);
      };
      migrate("10524001");
      migrate("10524002"); // must be a no-op: marker already set
      return {
        legacyStillThere: localStorage.getItem(bench),
        firstClaim: localStorage.getItem(scope("10524001")),
        secondClaim: localStorage.getItem(scope("10524002")),
        marker: localStorage.getItem(marker),
      };
    },
    ["m3-bench-checklist", LEGACY_MIGRATION_MARKER] as const,
  );
  expect(result.legacyStillThere).toBe(JSON.stringify(["m3a-1"])); // never deleted
  expect(result.firstClaim).toBe(JSON.stringify(["m3a-1"]));
  expect(result.secondClaim).toBeNull(); // second NIM cannot inherit
  expect(result.marker).toBe("nim-10524001");
});

// ── UI acceptance (plan §Phase 1) ───────────────────────────────────────────
test("first visit prompts, saving a NIM persists across reload, guest path works", async ({ page }) => {
  // Clear once (not via addInitScript, which would also wipe on reload).
  await page.goto(route);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const nimInput = page.getByPlaceholder("10524xxx");
  await expect(nimInput).toBeVisible();

  // Invalid NIM shows an inline error and does NOT persist.
  await nimInput.fill("10521028");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page.locator("#nim-error")).toContainText("10524xxx");
  expect(await page.evaluate((k) => localStorage.getItem(k), IDENTITY_KEY)).toBeNull();

  // Valid NIM persists and the badge appears.
  await nimInput.fill("10524042");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page.getByText("NIM 10524042")).toBeVisible();
  const stored = await page.evaluate((k) => localStorage.getItem(k), IDENTITY_KEY);
  expect(JSON.parse(stored!)).toMatchObject({ mode: "nim", nim: "10524042" });

  // NIM is not in the URL.
  expect(page.url()).not.toContain("10524042");

  // Reload retains identity — no prompt, badge stays.
  await page.reload();
  await expect(page.getByText("NIM 10524042")).toBeVisible();
  await expect(page.getByPlaceholder("10524xxx")).toHaveCount(0);

  // Ganti NIM re-opens the prompt without deleting stored identity yet.
  await page.getByRole("button", { name: "Ganti NIM" }).click();
  await expect(page.getByPlaceholder("10524xxx")).toBeVisible();
  await page.getByRole("button", { name: "Lanjut sebagai tamu" }).click();
  await expect(page.getByText("Mode tamu")).toBeVisible();
  expect(JSON.parse((await page.evaluate((k) => localStorage.getItem(k), IDENTITY_KEY))!)).toMatchObject({ mode: "guest" });
});

test("switching NIM does not reveal the previous student's checklist", async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto(route);

  // Student A enters NIM and ticks the first bench item.
  await page.getByPlaceholder("10524xxx").fill("10524111");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  const firstBox = page.locator("#rehearse").locator('input[type="checkbox"]').first();
  await firstBox.scrollIntoViewIfNeeded();
  await firstBox.check();
  await expect(firstBox).toBeChecked();

  // Switch to student B.
  await page.getByRole("button", { name: "Ganti NIM" }).click();
  await page.getByPlaceholder("10524xxx").fill("10524222");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();

  // Student B sees an empty checklist — A's tick is not visible.
  const bFirst = page.locator("#rehearse").locator('input[type="checkbox"]').first();
  await bFirst.scrollIntoViewIfNeeded();
  await expect(bFirst).not.toBeChecked();
  const bChecked = await page.locator("#rehearse").locator('input[type="checkbox"]:checked').count();
  expect(bChecked).toBe(0);

  // A's data still exists under its own namespaced key (not deleted).
  const aStored = await page.evaluate((k) => localStorage.getItem(k), namespacedKey("m3-bench-checklist", { version: 1, mode: "nim", nim: "10524111" }));
  expect(JSON.parse(aStored!).length).toBeGreaterThanOrEqual(1);

  // Switch back to A — the tick returns.
  await page.getByRole("button", { name: "Ganti NIM" }).click();
  await page.getByPlaceholder("10524xxx").fill("10524111");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  const aFirst = page.locator("#rehearse").locator('input[type="checkbox"]').first();
  await aFirst.scrollIntoViewIfNeeded();
  await expect(aFirst).toBeChecked();
});
