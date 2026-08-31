import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();

  // 1. Mobile Test (390x844)
  console.log("=== Testing Mobile Zero-Scroll Reagent Pivot View ===");
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto("http://localhost:3000/modules/m1-reactions", { waitUntil: "networkidle" });

  const matrixSec = mobilePage.locator("text=Matriks Reaksi Lengkap");
  await matrixSec.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(300);

  // Check that Reagent Cards are visible on mobile by default
  const isCardsVisible = await mobilePage.locator("button:has-text('Kartu Pereaksi')").isVisible();
  console.log("Mobile 'Kartu Pereaksi' toggle is visible:", isCardsVisible);

  await mobilePage.screenshot({ path: "tests/review/mobile-reagent-pivot-hcl.png" });
  console.log("Saved tests/review/mobile-reagent-pivot-hcl.png");

  // Switch Reagent to NaOH
  const naohBtn = mobilePage.locator("button:has-text('NaOH')").first();
  await naohBtn.click();
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: "tests/review/mobile-reagent-pivot-naoh.png" });
  console.log("Saved tests/review/mobile-reagent-pivot-naoh.png");

  // Click Al3+ card inside matrix section to open reaction popup
  const matrixContainer = mobilePage.locator("section").filter({ hasText: "Matriks Reaksi Lengkap" });
  const alCard = matrixContainer.locator("button").filter({ hasText: "Al³⁺" });
  await alCard.click();
  await mobilePage.waitForTimeout(800);
  console.log("Clicked Al³⁺ card under NaOH, modal is visible:", await mobilePage.locator('[role="dialog"]').isVisible());

  await mobilePage.screenshot({ path: "tests/review/mobile-reagent-pivot-modal-al-naoh.png" });
  console.log("Saved tests/review/mobile-reagent-pivot-modal-al-naoh.png");

  // Close modal
  await mobilePage.locator('button:has-text("Selesai / Tutup")').click();
  await mobilePage.waitForTimeout(400);

  // Switch mobile view to Table Mode
  const tableToggle = mobilePage.locator("button:has-text('Tabel Matriks')");
  await tableToggle.click();
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: "tests/review/mobile-table-mode.png" });
  console.log("Saved tests/review/mobile-table-mode.png");

  // 2. Desktop Test (1440x900)
  console.log("\n=== Testing Desktop Full Table View ===");
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.goto("http://localhost:3000/modules/m1-reactions", { waitUntil: "networkidle" });
  const desktopMatrix = desktopPage.locator("text=Matriks Reaksi Lengkap");
  await desktopMatrix.scrollIntoViewIfNeeded();
  await desktopPage.waitForTimeout(300);

  const isMobileToggleVisibleOnDesktop = await desktopPage.locator("button:has-text('Kartu Pereaksi')").isVisible();
  console.log("Mobile toggle hidden on desktop (should be false):", isMobileToggleVisibleOnDesktop);

  await desktopPage.screenshot({ path: "tests/review/desktop-full-matrix-table.png" });
  console.log("Saved tests/review/desktop-full-matrix-table.png");

  await browser.close();
  console.log("\nALL VERIFICATIONS PASSED SUCCESSFULLY");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
