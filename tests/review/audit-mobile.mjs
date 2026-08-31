import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  
  const viewports = [
    { name: "iphone-14", width: 390, height: 844 },
    { name: "android-compact", width: 360, height: 800 },
  ];

  for (const vp of viewports) {
    console.log(`\n=== AUDITING VIEWPORT: ${vp.name} (${vp.width}x${vp.height}) ===`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto("http://localhost:3000/modules/m1-reactions", { waitUntil: "networkidle" });
    
    // Check page horizontal overflow
    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log("Root horizontal overflow:", pageOverflow ? "FAIL (overflows)" : "PASS (no overflow)");

    // 1. Tab 1: Workbench
    console.log("--- Checking Tab 1: Workbench & Matrix ---");
    await page.screenshot({ path: `tests/review/mobile-${vp.name}-tab1-workbench.png` });

    // Scroll to Matrix
    const matrixHeading = page.locator("text=Matriks Reaksi Lengkap");
    await matrixHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `tests/review/mobile-${vp.name}-tab1-matrix.png` });

    // Open Modal for Ag+ + HCl
    const agRow = page.locator("table tbody tr").filter({ hasText: /Ag[+⁺]/ });
    const agHclCell = agRow.locator("td").nth(1);
    await agHclCell.click();
    await page.waitForTimeout(1000);

    // Modal bounding box check
    const modalBox = await page.locator('[role="dialog"] > div').boundingBox();
    console.log("Modal Ag+ Bounding Box:", modalBox);
    const modalOverflow = modalBox.width > vp.width || modalBox.x < 0;
    console.log("Modal fits on screen horizontally:", !modalOverflow);

    await page.screenshot({ path: `tests/review/mobile-${vp.name}-modal-ag-hcl.png` });

    // Close modal
    await page.locator('button:has-text("Selesai / Tutup")').click();
    await page.waitForTimeout(400);

    // Open Modal for Pb2+ + HCl (has Panaskan button)
    const pbRow = page.locator("table tbody tr").filter({ hasText: /Pb[2²][+⁺]/ });
    const pbHclCell = pbRow.locator("td").nth(1);
    await pbHclCell.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `tests/review/mobile-${vp.name}-modal-pb-hcl.png` });
    await page.locator('button:has-text("Selesai / Tutup")').click();
    await page.waitForTimeout(400);

    // 2. Tab 2: Gas Simulator
    console.log("--- Checking Tab 2: Gas Simulator ---");
    const tab2 = page.locator('button:has-text("Simulator Uji Gas")');
    await tab2.scrollIntoViewIfNeeded();
    await tab2.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `tests/review/mobile-${vp.name}-tab2-gas.png` });

    // 3. Tab 3: Mystery Challenge
    console.log("--- Checking Tab 3: Mystery Detective ---");
    const tab3 = page.locator('button:has-text("Detektif Cuplikan")');
    await tab3.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `tests/review/mobile-${vp.name}-tab3-mystery.png` });

    // 4. Tab 4: Net Ionic Equations
    console.log("--- Checking Tab 4: Net Ionic Equations ---");
    const tab4 = page.locator('button:has-text("Latihan Persamaan")');
    await tab4.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `tests/review/mobile-${vp.name}-tab4-equations.png` });

    await page.close();
  }

  await browser.close();
  console.log("\n=== MOBILE AUDIT COMPLETE ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
