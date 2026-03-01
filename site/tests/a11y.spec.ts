import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility tests for the Lumio marketing site.
 *
 * SP-S2-003 (Sprint 2) — axe-core/playwright checks on all public marketing pages.
 * WCAG 2.1 AA target — zero critical or serious violations on any page.
 *
 * Runs as part of the CI e2e job after `npm run build`.
 */

test.describe("Accessibility (axe-core / WCAG 2.1 AA)", () => {
  test("home page — 0 critical/serious violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      // Exclude known third-party embeds (none currently) or colour contrast
      // items tracked separately under SP-ACC1-007 (all tokens fixed).
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

  test("werkgevers page — 0 critical/serious violations", async ({ page }) => {
    await page.goto("/werkgevers");
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
      throw new Error(`axe found ${blocking.length} critical/serious violation(s) on /werkgevers:\n${summary}`);
    }

    expect(blocking).toHaveLength(0);
  });

  test("product page — 0 critical/serious violations", async ({ page }) => {
    await page.goto("/product");
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
      throw new Error(`axe found ${blocking.length} critical/serious violation(s) on /product:\n${summary}`);
    }

    expect(blocking).toHaveLength(0);
  });

  test("privacy page — 0 critical/serious violations", async ({ page }) => {
    await page.goto("/privacy");
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
      throw new Error(`axe found ${blocking.length} critical/serious violation(s) on /privacy:\n${summary}`);
    }

    expect(blocking).toHaveLength(0);
  });

  test("prijzen page — 0 critical/serious violations", async ({ page }) => {
    await page.goto("/prijzen");
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
      throw new Error(`axe found ${blocking.length} critical/serious violation(s) on /prijzen:\n${summary}`);
    }

    expect(blocking).toHaveLength(0);
  });
});
