/**
 * Verify Ruang Pengajar is gone from the UI: no nav entry (desktop rail + mobile drawer),
 * no header notification button, no banner link, and no /pengajar link anywhere.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const ROUTES = ["/", "/modules", "/prelab", "/notebook", "/analisis", "/laporan", "/referensi", "/modules/m1-reactions"];

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));

let bad = 0;
for (const r of ROUTES) {
  const resp = await page.goto(BASE + r, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({
    pengajarLinks: Array.from(document.querySelectorAll('a[href="/pengajar"]')).length,
    ruangText: /Ruang Pengajar/i.test(document.body.innerText),
    notifIcons: Array.from(document.querySelectorAll(".material-symbols-outlined"))
      .filter((e) => e.textContent.trim() === "notifications").length,
  }));
  const ok = info.pengajarLinks === 0 && !info.ruangText && info.notifIcons === 0;
  if (!ok) bad++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${r.padEnd(24)} http=${resp.status()} /pengajar links=${info.pengajarLinks} "Ruang Pengajar" text=${info.ruangText} notif icons=${info.notifIcons}`
  );
}

// mobile drawer must not list it either
const mob = await ctx.newPage();
await mob.setViewportSize({ width: 390, height: 844 });
await mob.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await mob.waitForTimeout(1500);
await mob.getByRole("button", { name: /Buka menu/i }).click();
await mob.waitForTimeout(700);
const drawer = await mob.evaluate(() => {
  const nav = document.getElementById("mobile-navigation");
  return {
    open: !!nav,
    items: nav ? Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href")) : [],
    hasPengajar: nav ? /Ruang Pengajar/i.test(nav.innerText) : false,
  };
});
const drawerOk = drawer.open && !drawer.hasPengajar && !drawer.items.includes("/pengajar");
if (!drawerOk) bad++;
console.log(`\n${drawerOk ? "ok  " : "FAIL"} mobile drawer open=${drawer.open} items=${JSON.stringify(drawer.items)}`);

console.log(`\npageerrors: ${errs.length ? errs.join(" | ") : "none"}`);
await b.close();
if (bad || errs.length) { console.error(`FAILED (${bad} check(s))`); process.exit(1); }
console.log("VERIFY PASSED — Ruang Pengajar removed from all navigation surfaces");
