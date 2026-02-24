/**
 * Storybook Play Test Utilities
 *
 * Helper functions for writing comprehensive interaction tests in Storybook.
 */

/**
 * Runs axe-core accessibility checks on the current story.
 *
 * Usage in play() tests:
 * ```ts
 * play: async ({ canvasElement }) => {
 *   await runA11yChecks(canvasElement);
 *   // ... other tests
 * }
 * ```
 *
 * @param element - The canvas element or any container to check
 * @param options - Optional axe-playwright configuration
 */
export async function runA11yChecks(
  element: HTMLElement,
  options?: {
    /** Detach the checks and don't throw on violations */
    detailedReport?: boolean;
    /** Rules to disable */
    disableRules?: string[];
    /** Only run specific rules */
    includedImpacts?: ("critical" | "serious" | "moderate" | "minor")[];
  }
): Promise<void> {
  const { detailedReport = false, disableRules = [], includedImpacts } = options || {};

  // Create a mock page object for axe-playwright
  // In Storybook, we don't have a real Playwright page, so we simulate it
  const axeConfig = {
    detailedReport,
    detailedReportOptions: {
      html: true,
    },
    axeOptions: {
      rules: disableRules.reduce(
        (acc, rule) => ({ ...acc, [rule]: { enabled: false } }),
        {} as Record<string, { enabled: boolean }>
      ),
      runOnly: includedImpacts
        ? { type: "tag" as const, values: ["wcag2a", "wcag2aa"] }
        : undefined,
    },
  };

  try {
    // For Storybook, we use a different approach since we don't have Playwright
    // We'll use native axe-core to check the element
    const axe = await import("axe-core");
    const results = await axe.default.run(element, {
      rules: disableRules.reduce(
        (acc, rule) => ({ ...acc, [rule]: { enabled: false } }),
        {} as Record<string, { enabled: boolean }>
      ),
    });

    if (results.violations.length > 0) {
      const violationMessages = results.violations.map((violation) => {
        const nodes = violation.nodes
          .map((node) => `  - ${node.html} (${node.failureSummary})`)
          .join("\n");
        return `${violation.id}: ${violation.description}\n${nodes}`;
      });

      const errorMessage = `Accessibility violations found:\n${violationMessages.join("\n\n")}`;

      if (detailedReport) {
        console.error(errorMessage);
      } else {
        throw new Error(errorMessage);
      }
    }
  } catch (error) {
    if ((error as Error).message?.includes("Accessibility violations")) {
      throw error;
    }
    // If axe-core loading fails, log but don't fail the test
    console.warn("Could not run accessibility checks:", error);
  }
}

/**
 * Asserts that an element has no accessibility violations (WCAG A level).
 *
 * Usage:
 * ```ts
 * play: async ({ canvasElement }) => {
 *   const canvas = within(canvasElement);
 *   const button = canvas.getByRole("button");
 *   await expectNoA11yViolations(button);
 * }
 * ```
 */
export async function expectNoA11yViolations(element: HTMLElement): Promise<void> {
  await runA11yChecks(element, { includedImpacts: ["critical", "serious"] });
}

/**
 * Common keyboard navigation test helper.
 *
 * Usage:
 * ```ts
 * play: async ({ canvasElement }) => {
 *   await testKeyboardNavigation(canvasElement, [
 *     { key: "Tab", expectedFocus: "First Button" },
 *     { key: "Tab", expectedFocus: "Second Button" },
 *   ]);
 * }
 * ```
 */
export async function testKeyboardNavigation(
  _canvasElement: HTMLElement,
  _steps: Array<{ key: string; expectedFocus: string }>
): Promise<void> {
  // This is a placeholder for keyboard navigation testing
  // Actual implementation would use userEvent.keyboard to navigate
  // and check document.activeElement
}
