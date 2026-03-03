import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { StatusBadge } from "@/components/ui/status-badge";
import { runA11yChecks } from "@/lib/test-utils/storybook-a11y";

/**
 * StatusBadge — semantic status indicator using design-system tokens.
 *
 * WCAG 2.1 AA: status meaning must never be conveyed by colour alone.
 * Enable `showIcon` to add an icon alongside the label — required for
 * colour-blind users.
 *
 * Governance: core · a11yLevel: AA
 */
const meta = {
  title: "Primitives/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  parameters: {
    status: { type: "core" },
    governance: { maturity: "core", a11yLevel: "AA" },
    docs: {
      description: {
        component:
          "Semantic badge for representing status across the Lumio app. " +
          "Use `showIcon={true}` everywhere colour alone is insufficient to convey meaning (WCAG 1.4.1).",
      },
    },
  },
  argTypes: {
    status: {
      control: "select",
      options: [
        "complete",
        "success",
        "warning",
        "attention",
        "info",
        "pending",
        "error",
        "danger",
        "inactive",
        "neutral",
      ],
    },
    showIcon: { control: "boolean" },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Single variants (icon off) ──────────────────────────────────────────────

export const Complete: Story = {
  args: { status: "complete", children: "Volledig" },
};

export const Success: Story = {
  args: { status: "success", children: "Gelukt" },
};

export const Warning: Story = {
  args: { status: "warning", children: "Let op" },
};

export const Attention: Story = {
  args: { status: "attention", children: "Aandacht vereist" },
};

export const Info: Story = {
  args: { status: "info", children: "Informatie" },
};

export const Pending: Story = {
  args: { status: "pending", children: "In behandeling" },
};

export const Error: Story = {
  args: { status: "error", children: "Fout" },
};

export const Danger: Story = {
  args: { status: "danger", children: "Kritiek" },
};

export const Inactive: Story = {
  args: { status: "inactive", children: "Niet actief" },
};

export const Neutral: Story = {
  args: { status: "neutral", children: "Neutraal" },
};

// ── With icons (WCAG 1.4.1 compliant) ───────────────────────────────────────

export const CompleteWithIcon: Story = {
  name: "Complete (met icoon)",
  args: { status: "complete", showIcon: true, children: "Volledig" },
};

export const ErrorWithIcon: Story = {
  name: "Error (met icoon)",
  args: { status: "error", showIcon: true, children: "Mislukt" },
};

export const WarningWithIcon: Story = {
  name: "Warning (met icoon)",
  args: { status: "warning", showIcon: true, children: "Let op" },
};

export const PendingWithIcon: Story = {
  name: "Pending (met icoon)",
  args: { status: "pending", showIcon: true, children: "In behandeling" },
};

// ── All variants overview ────────────────────────────────────────────────────

export const AlleVarianten: Story = {
  name: "Alle varianten",
  render: () => (
    <div className="flex flex-wrap gap-3">
      <StatusBadge status="complete" showIcon>Volledig</StatusBadge>
      <StatusBadge status="warning" showIcon>Let op</StatusBadge>
      <StatusBadge status="error" showIcon>Fout</StatusBadge>
      <StatusBadge status="pending" showIcon>In behandeling</StatusBadge>
      <StatusBadge status="info" showIcon>Informatie</StatusBadge>
      <StatusBadge status="inactive">Niet actief</StatusBadge>
      <StatusBadge status="neutral">Neutraal</StatusBadge>
    </div>
  ),
};

// ── Accessibility audit ──────────────────────────────────────────────────────

/**
 * A11y play function — verifies:
 * 1. Every badge has accessible text content
 * 2. axe-core finds no violations (WCAG 2.1 AA)
 */
export const A11yAudit: Story = {
  name: "A11y audit (alle varianten)",
  render: () => (
    <div className="flex flex-wrap gap-3">
      <StatusBadge status="complete" showIcon>Volledig</StatusBadge>
      <StatusBadge status="warning" showIcon>Let op</StatusBadge>
      <StatusBadge status="error" showIcon>Fout</StatusBadge>
      <StatusBadge status="pending" showIcon>In behandeling</StatusBadge>
      <StatusBadge status="info" showIcon>Informatie</StatusBadge>
      <StatusBadge status="inactive">Niet actief</StatusBadge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Every badge must have a non-empty text label
    const badges = canvas.getAllByRole("generic");
    for (const badge of badges) {
      expect(badge.textContent?.trim().length).toBeGreaterThan(0);
    }

    // axe-core WCAG 2.1 AA check — icon aria-hidden must be set (done in component)
    await runA11yChecks(canvasElement);
  },
};
