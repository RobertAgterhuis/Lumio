import { test, expect } from "@playwright/test";

/**
 * Smoke tests for the Lumio marketing site static export.
 *
 * Each test verifies:
 * - page loads (HTTP 200 equivalent — no navigation error)
 * - a key heading renders to confirm the correct page was served
 *
 * Run after `npm run build` (which outputs to ./out/).
 */

test.describe("Marketing site smoke tests", () => {
  test("home page loads and shows primary headline", async ({ page }) => {
    await page.goto("/");
    await expect(page).not.toHaveURL(/error/);

    // Main heading must be visible
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toBeEmpty();
  });

  test("werkgevers page loads and shows ROI calculator section", async ({ page }) => {
    await page.goto("/werkgevers");
    await expect(page).not.toHaveURL(/error/);

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();

    // ROI calculator must be present (anchor used by internal links)
    const roiSection = page.locator("#roi-calculator");
    await expect(roiSection).toBeVisible();
  });

  test("privacy page loads and shows privacy heading", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).not.toHaveURL(/error/);

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toBeEmpty();
  });

  test("werkgevers one-pager loads and shows printable content", async ({ page }) => {
    await page.goto("/werkgevers/one-pager");
    await expect(page).not.toHaveURL(/error/);

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();

    // Print button must be present (client component rendered)
    const printButton = page.locator("button", { hasText: /print|afdruk/i });
    await expect(printButton).toBeVisible();
  });

  test("product page loads and shows nabestaanden-modus section", async ({ page }) => {
    await page.goto("/product");
    await expect(page).not.toHaveURL(/error/);

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();

    // NabestaandenSection heading must be rendered (GUARD-005 lifted — SP-7-001)
    const nabestaandenHeading = page.locator("h2", {
      hasText: /naasten|nabestaanden/i,
    });
    await expect(nabestaandenHeading.first()).toBeVisible();
  });

  test("404 page renders gracefully for unknown route", async ({ page }) => {
    const response = await page.goto("/does-not-exist-abc123");
    // Static exports produce a 404.html; serve returns 404 status
    expect(response?.status()).toBe(404);
  });
});
