import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for KUGU Lab UI checks.
 * Chromium only: the View Transitions API assertions require Chromium 125+.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});