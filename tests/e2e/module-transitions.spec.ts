import { test, expect, type Page } from "@playwright/test";

/**
 * Instruments `document.startViewTransition` before app scripts run and records
 * which ::view-transition pseudo-elements animate, plus the keyframe names and
 * durations. Those keyframes are what `app/globals.css` defines for the
 * directional slide, so asserting on them proves the animation is wired end to
 * end rather than falling back to the browser's default crossfade.
 */
async function instrumentViewTransitions(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __vt: {
        calls: number;
        finished: number;
        rootClass: string;
        animations: { name: string; pseudo: string; duration: number }[];
      };
    };
    w.__vt = { calls: 0, finished: 0, rootClass: "", animations: [] };

    const original = document.startViewTransition?.bind(document);
    if (!original) return;

    document.startViewTransition = ((callback: () => void) => {
      w.__vt.calls += 1;
      w.__vt.rootClass = document.documentElement.className;
      const transition = original(callback);

      transition.ready
        .then(() => {
          for (const anim of document.getAnimations()) {
            const effect = anim.effect as KeyframeEffect | null;
            const pseudo =
              (effect as unknown as { pseudoElement?: string })?.pseudoElement ?? "";
            if (!pseudo.startsWith("::view-transition")) continue;
            w.__vt.animations.push({
              name: String((anim as unknown as { animationName?: string }).animationName ?? ""),
              pseudo,
              duration: Number(effect?.getTiming?.().duration ?? 0),
            });
          }
        })
        .catch(() => {});

      transition.finished.then(
        () => {
          w.__vt.finished += 1;
        },
        () => {
          w.__vt.finished += 1;
        }
      );

      return transition;
    }) as typeof document.startViewTransition;
  });
}

type VtState = {
  calls: number;
  finished: number;
  rootClass: string;
  animations: { name: string; pseudo: string; duration: number }[];
};

const readVt = (page: Page) =>
  page.evaluate(() => (window as unknown as { __vt: VtState }).__vt);

test.describe("module navigation transitions", () => {
  test("dashboard → M1 slides forward with our keyframes", async ({ page }) => {
    await instrumentViewTransitions(page);
    await page.goto("/");

    expect(
      await page.evaluate(() => typeof document.startViewTransition === "function")
    ).toBe(true);

    await page.locator('a[href="/modules/m1-reactions"]').first().click();
    await page.waitForURL("**/modules/m1-reactions");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Reaksi");

    await expect.poll(async () => (await readVt(page)).finished).toBeGreaterThan(0);
    const vt = await readVt(page);

    expect(vt.calls).toBe(1);
    // The direction class must be on <html> when the transition starts.
    expect(vt.rootClass).toContain("nav-forward");

    const names = vt.animations.map((a) => a.name);
    expect(names).toContain("vt-slide");
    expect(names).toContain("vt-fade");

    const slide = vt.animations.filter((a) => a.name === "vt-slide");
    expect(slide.length).toBeGreaterThan(0);
    for (const a of slide) expect(a.duration).toBe(320);

    // Class is cleaned up so unrelated navigations stay unstyled.
    await expect
      .poll(async () => page.evaluate(() => document.documentElement.className))
      .not.toContain("nav-forward");
  });

  test("M1 breadcrumb → module list slides back", async ({ page }) => {
    await instrumentViewTransitions(page);
    await page.goto("/modules/m1-reactions");

    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Modul", exact: true })
      .click();
    await page.waitForURL(/\/modules$/);
    await expect(page.getByRole("heading", { name: "Modul Praktikum" })).toBeVisible();

    await expect.poll(async () => (await readVt(page)).finished).toBeGreaterThan(0);
    const vt = await readVt(page);

    expect(vt.calls).toBe(1);
    expect(vt.rootClass).toContain("nav-back");
    expect(vt.animations.map((a) => a.name)).toContain("vt-slide");
  });

  test("next-module button slides forward", async ({ page }) => {
    await instrumentViewTransitions(page);
    await page.goto("/modules/m1-reactions");

    await page.getByRole("link", { name: /^M2/ }).first().click();
    await page.waitForURL("**/modules/m2-mg2sno4");

    await expect.poll(async () => (await readVt(page)).finished).toBeGreaterThan(0);
    const vt = await readVt(page);

    expect(vt.rootClass).toContain("nav-forward");
    expect(vt.animations.map((a) => a.name)).toContain("vt-slide");
  });

  test("content is visibly displaced mid-transition", async ({ page }) => {
    await page.goto("/");

    const offsets = await page.evaluate(async () => {
      const root = document.documentElement;
      const measured: number[] = [];
      const original = document.startViewTransition.bind(document);

      document.startViewTransition = ((cb: () => void) => {
        const t = original(cb);
        t.ready.then(() => {
          for (const anim of document.getAnimations()) {
            const effect = anim.effect as KeyframeEffect | null;
            const pseudo =
              (effect as unknown as { pseudoElement?: string })?.pseudoElement ?? "";
            if (!pseudo.startsWith("::view-transition")) continue;
            anim.pause();
            // Park at the start of the slide, where displacement is largest.
            anim.currentTime = 0;
            const x = Number.parseFloat(getComputedStyle(root, pseudo).translate);
            if (Number.isFinite(x) && x !== 0) measured.push(Math.abs(x));
          }
        });
        return t;
      }) as typeof document.startViewTransition;

      (
        document.querySelector('a[href="/modules/m1-reactions"]') as HTMLElement | null
      )?.click();
      const settled = Promise.withResolvers<void>();
      setTimeout(settled.resolve, 400);
      await settled.promise;
      return measured;
    });

    expect(offsets.length).toBeGreaterThan(0);
    // 48px is the configured offset; require real, visible displacement.
    for (const offset of offsets) expect(offset).toBeGreaterThan(8);
  });

  test("the shell rail and header are anchored", async ({ page }) => {
    await page.goto("/");

    const names = await page.evaluate(() => ({
      rail: getComputedStyle(document.querySelector("aside")!).viewTransitionName,
      header: getComputedStyle(document.querySelector(".app-shell > header")!)
        .viewTransitionName,
      mobileBar: getComputedStyle(document.querySelector("body > header")!)
        .viewTransitionName,
    }));

    expect(names.rail).toBe("app-rail");
    expect(names.header).toBe("app-header");
    expect(names.mobileBar).toBe("app-mobile-bar");
  });

  test("reduced motion collapses the slide to an instant swap", async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    await instrumentViewTransitions(page);
    await page.goto("/");

    await page.locator('a[href="/modules/m1-reactions"]').first().click();
    await page.waitForURL("**/modules/m1-reactions");

    await expect.poll(async () => (await readVt(page)).finished).toBeGreaterThan(0);
    const vt = await readVt(page);

    // Navigation still works; CSS zeroes every animation duration.
    for (const a of vt.animations) expect(a.duration).toBe(0);

    await context.close();
  });
});