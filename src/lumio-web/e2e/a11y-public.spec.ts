import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility tests for lumio-web public pages (no session required).
 *
 * SP-2-006 — GAP-A11Y-006 (partial): WCAG 2.1 AA axe coverage for
 * the root authentication screen.
 *
 * Requires:
 *   • .NET API running (for profile list to load)
 *   • Next.js dev running at localhost:3000 (or LUMIO_APP_URL)
 */

test.describe("Public screens — no session required", () => {
  test("root auth screen (/) — 0 critical/serious violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

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
      throw new Error(`axe found ${blocking.length} critical/serious violation(s) on /:\n${summary}`);
    }

    expect(blocking).toHaveLength(0);
  });
});
