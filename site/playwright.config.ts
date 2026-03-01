import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke-test config for the static marketing site.
 *
 * The CI e2e job runs `npm run build` first (produces ./out/)
 * then starts a local static server via the `webServer` block.
 *
 * Run locally:
 *   npm run build && npm run test:e2e
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  workers: 1,

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },

  // Serve the Next.js static export out/ directory during tests
  webServer: {
    command: "npx serve ./out --listen 3001 --no-clipboard",
    port: 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
