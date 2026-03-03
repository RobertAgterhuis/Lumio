import { defineConfig, devices } from "@playwright/test";

/**
 * E2E accessibility configuration for lumio-web authenticated routes.
 *
 * SP-2-006 — GAP-A11Y-006: Automated axe-core / WCAG 2.1 AA baseline for all
 * 17 authenticated routes and the root auth screen.
 *
 * ── Prerequisites (run locally per DEC-110 — no CI) ─────────────────────────
 *  1. Start the .NET API (default port 5123):
 *       cd src/Lumio.Api && dotnet run
 *
 *  2. Start the Next.js dev server (port 3000):
 *       cd src/lumio-web && npm run dev
 *
 *  3. For authenticated-route tests, create a .env.test.local file:
 *       LUMIO_TEST_PASSWORD=<your-test-profile-pin>
 *     Optionally override the app URL:
 *       LUMIO_APP_URL=http://localhost:3000
 *
 *  4. Run all accessibility tests:
 *       npx playwright test --config playwright.config.ts
 *
 *  5. View report (auto-opens on failure, or manually):
 *       npx playwright show-report e2e/playwright-report
 *
 * ── Auth strategy ────────────────────────────────────────────────────────────
 * A "setup" project (e2e/auth.setup.ts) authenticates once and saves the
 * resulting ASP.NET Core session cookie to e2e/auth.json.
 * Authenticated tests load this state via storageState so that
 * GET /api/auth/status returns isOntgrendeld: true without re-logging in.
 *
 * The auth page tests run without storageState (no session required).
 * ────────────────────────────────────────────────────────────────────────────
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  retries: 0,
  workers: 1,

  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "e2e/playwright-report" }],
  ],

  use: {
    baseURL: process.env.LUMIO_APP_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    // ── 1. Setup: authenticate once and save session cookies ──
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // ── 2. Public / auth screen: no session required ──
    {
      name: "public",
      testMatch: /a11y-public\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // ── 3. Authenticated routes: reuse saved session from setup ──
    {
      name: "authenticated",
      testMatch: /a11y-authenticated\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/auth.json",
      },
    },
  ],
});
