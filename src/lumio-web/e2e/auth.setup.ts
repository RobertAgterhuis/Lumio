import { test as setup } from "@playwright/test";

/**
 * Authentication setup for lumio-web e2e tests.
 *
 * SP-2-006 — Runs before authenticated axe tests.
 * Authenticates through the real UI flow and saves the ASP.NET Core
 * session cookie to e2e/auth.json for reuse across all test files.
 *
 * Requires:
 *   • .NET API running at localhost:5123 (or LUMIO_API_URL)
 *   • Next.js dev running at localhost:3000 (or LUMIO_APP_URL)
 *   • LUMIO_TEST_PASSWORD set in .env.test.local
 *   • At least one profile created in the test DB
 */

const AUTH_FILE = "e2e/auth.json";

setup("authenticate and save session", async ({ page }) => {
  const password = process.env.LUMIO_TEST_PASSWORD;
  if (!password) {
    throw new Error(
      "LUMIO_TEST_PASSWORD is not set.\n" +
        "Create .env.test.local with LUMIO_TEST_PASSWORD=<your-pin>\n" +
        "then run: npx playwright test --config playwright.config.ts"
    );
  }

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // If a profile selector is shown, click the first available profile
  const profileCard = page
    .locator("button")
    .filter({ hasText: /\S/ })
    .first();

  const hasProfiles = await profileCard
    .isVisible({ timeout: 3_000 })
    .catch(() => false);

  if (hasProfiles) {
    // Look for a profile card button (role=button in the profile list)
    const profileButtons = page.locator('[class*="cursor-pointer"][class*="rounded"]');
    const firstProfile = profileButtons.first();
    if (await firstProfile.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await firstProfile.click();
      await page.waitForTimeout(500);
    }
  }

  // Fill in the password and submit the unlock form
  const passwordInput = page.locator("#password");
  await passwordInput.waitFor({ state: "visible", timeout: 10_000 });
  await passwordInput.fill(password);

  await page.locator("form button[type='submit']").click();

  // Wait for successful authentication (redirect to /dashboard)
  await page.waitForURL("**/dashboard", { timeout: 20_000 });

  // Save the session state (includes ASP.NET Core session cookie)
  await page.context().storageState({ path: AUTH_FILE });
});
