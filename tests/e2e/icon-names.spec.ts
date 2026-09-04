import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Material Symbols is a ligature font: an icon name that does not exist in the
 * font renders as literal wide text (e.g. "notebook" -> 48px, "log_in" -> 144px)
 * instead of a glyph, which silently breaks layout on narrow viewports.
 * This test collects every icon name used in the codebase and asserts each one
 * resolves to a single-glyph advance in the loaded font.
 */

// Playwright compiles specs as CommonJS, so `import.meta` is unavailable here.
// Tests run with the project root as cwd (see playwright.config), so resolve from there.
const ROOT = process.cwd();

function collectTsxFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git", "test-results"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectTsxFiles(full, acc);
    else if (entry.name.endsWith(".tsx")) acc.push(full);
  }
  return acc;
}

function collectIconNames(): Map<string, Set<string>> {
  const files = [
    ...collectTsxFiles(path.join(ROOT, "app")),
    ...collectTsxFiles(path.join(ROOT, "components")),
  ];
  const names = new Map<string, Set<string>>();
  const add = (name: string, file: string) => {
    if (!names.has(name)) names.set(name, new Set());
    names.get(name)!.add(path.relative(ROOT, file).replace(/\\/g, "/"));
  };

  for (const file of files) {
    const src = fs.readFileSync(file, "utf-8");
    // <span className="material-symbols-outlined ...">icon_name</span>
    for (const m of src.matchAll(/material-symbols-outlined[^>]*>\s*([a-z0-9_]+)\s*</g)) add(m[1], file);
    // data objects: { icon: "icon_name" }
    for (const m of src.matchAll(/\bicon:\s*"([a-z0-9_]+)"/g)) add(m[1], file);
  }
  return names;
}

test("every Material Symbols icon name resolves to a real glyph", async ({ page }) => {
  const names = collectIconNames();
  const list = [...names.keys()].sort();
  expect(list.length, "expected to find icon names in the source").toBeGreaterThan(10);

  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const fontLoaded = await page.evaluate(() => document.fonts.check('24px "Material Symbols Outlined"'));
  expect(fontLoaded, "Material Symbols font must be loaded before measuring").toBe(true);

  const widths = await page.evaluate((icons: string[]) => {
    const host = document.createElement("div");
    host.style.cssText = "position:absolute;left:-9999px;top:0;";
    document.body.appendChild(host);
    const out: Record<string, number> = {};
    for (const name of icons) {
      const span = document.createElement("span");
      // Measure the font's natural advance — do NOT use the clamped
      // .material-symbols-outlined class, which forces width to 1em.
      span.style.cssText =
        'font-family:"Material Symbols Outlined";font-size:24px;white-space:nowrap;display:inline-block;';
      span.textContent = name;
      host.appendChild(span);
      out[name] = Math.round(span.getBoundingClientRect().width);
    }
    host.remove();
    return out;
  }, list);

  // A real ligature collapses to one 24px glyph; anything wider is literal text.
  const invalid = Object.entries(widths)
    .filter(([, w]) => w > 26)
    .map(([name, w]) => `${name} (${w}px, used in ${[...names.get(name)!].join(", ")})`);

  expect(invalid, `Invalid Material Symbols icon name(s):\n${invalid.join("\n")}`).toEqual([]);
});
