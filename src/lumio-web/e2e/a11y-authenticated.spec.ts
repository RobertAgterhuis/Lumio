import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility tests for lumio-web — all 17 authenticated routes.
 *
 * SP-2-006 — GAP-A11Y-006: WCAG 2.1 AA axe baseline for the authenticated app.
 *
 * ── How this works ────────────────────────────────────────────────────────────
 * This file is run by the "authenticated" project in playwright.config.ts.
 * That project depends on "setup" (e2e/auth.setup.ts) which authenticates
 * and saves the ASP.NET Core session cookie to e2e/auth.json.
 *
 * Each test loads the saved session.  The authenticated layout calls
 * GET /api/auth/status on mount — the session cookie causes the API to return
 * isOntgrendeld: true, so the route renders without redirect.
 *
 * ── Running ───────────────────────────────────────────────────────────────────
 * See playwright.config.ts Prerequisites.  Quick start:
 *
 *   dotnet run  (src/Lumio.Api)
 *   npm run dev (src/lumio-web)
 *   LUMIO_TEST_PASSWORD=<pin> npx playwright test --config playwright.config.ts
 * ────────────────────────────────────────────────────────────────────────────
 */

// ── All authenticated routes (GAP-A11Y-006) ───────────────────────────────────
const AUTHENTICATED_ROUTES = [
  "/dashboard",
  "/boedel",
  "/digitaal-bezit",
  "/documenten",
  "/donor",
  "/eigenaar",
  "/erfgenamen",
  "/euthanasie",
  "/export",
  "/help",
  "/instellingen",
  "/noodcontacten",
  "/testament",
  "/tijdlijn",
  "/uitvaart",
  "/videoboodschappen",
  "/audit-log",
] as const satisfies string[];

// ── Helper ────────────────────────────────────────────────────────────────────
async function runAxeOnRoute(page: Page, route: string): Promise<void> {
  await page.goto(route);
  // Wait for network + Zustand auth guard to settle
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1_000);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();

  const blocking = results.violations.filter((v) =>
    ["critical", "serious"].includes(v.impact ?? "")
  );

  if (blocking.length > 0) {
    const summary = blocking
      .map((v) => `  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} node(s))`)
      .join("\n");
    throw new Error(
      `axe found ${blocking.length} critical/serious violation(s) on ${route}:\n` + summary
    );
  }

  expect(blocking).toHaveLength(0);
}

// ── Tests ─────────────────────────────────────────────────────────────────────
test.describe("Authenticated routes — WCAG 2.1 AA (GAP-A11Y-006)", () => {
  for (const route of AUTHENTICATED_ROUTES) {
    test(`${route} — 0 critical/serious violations`, async ({ page }) => {
      await runAxeOnRoute(page, route);
    });
  }
});
