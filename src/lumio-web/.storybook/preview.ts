import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

/**
 * Component maturity levels:
 * - core: Foundation components, API-stable, breaking changes require migration guide
 * - stable: Fully implemented and documented, API may evolve with deprecation notices
 * - experimental: New components, API may change without notice
 */
export type ComponentMaturity = "core" | "stable" | "experimental";

/**
 * Component governance metadata
 */
export interface ComponentGovernance {
  /** Component maturity level */
  maturity: ComponentMaturity;
  /** Owner team or individual */
  owner?: string;
  /** Date of last API review */
  lastReview?: string;
  /** Link to design specs */
  designSpec?: string;
  /** Accessibility compliance level */
  a11yLevel?: "A" | "AA" | "AAA";
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "todo",
    },

    layout: "centered",

    /**
     * Status badge configuration for component maturity
     * These badges appear in the Storybook sidebar and docs
     */
    badges: {
      core: {
        title: "Core",
        styles: {
          backgroundColor: "var(--color-success-500, #22c55e)",
          color: "white",
          borderRadius: "3px",
        },
      },
      stable: {
        title: "Stable",
        styles: {
          backgroundColor: "var(--color-primary-500, #14b8a6)",
          color: "white",
          borderRadius: "3px",
        },
      },
      experimental: {
        title: "Experimental",
        styles: {
          backgroundColor: "var(--color-warning-500, #f59e0b)",
          color: "white",
          borderRadius: "3px",
        },
      },
    },
  },

  tags: ["autodocs"],
};

export default preview;
