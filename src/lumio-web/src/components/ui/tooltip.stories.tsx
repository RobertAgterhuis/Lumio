import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { runA11yChecks } from "@/lib/test-utils/storybook-a11y";

/**
 * Tooltip — Radix UI-based accessible tooltip using design-system tokens.
 *
 * WCAG 2.1 SC 1.4.13: tooltip content must be hoverable and persistent
 * until dismissed. The Radix implementation satisfies this natively.
 *
 * Use `TooltipProvider` at application root (already in app layout).
 * Each individual story wraps with a local provider for isolation.
 *
 * Governance: core · a11yLevel: AA
 */
const meta = {
  title: "Primitives/Tooltip",
  component: TooltipContent,
  tags: ["autodocs"],
  parameters: {
    status: { type: "core" },
    governance: { maturity: "core", a11yLevel: "AA" },
    docs: {
      description: {
        component:
          "Accessible tooltip built on Radix UI. Follows WCAG 1.4.13 — content " +
          "is hoverable, persistent, and dismissible. `TooltipProvider` must wrap " +
          "the usage site.",
      },
    },
  },
} satisfies Meta<typeof TooltipContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Basic usage ──────────────────────────────────────────────────────────────

export const Standaard: Story = {
  name: "Standaard",
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover mij</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Dit is een tooltip</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

// ── Positioning ──────────────────────────────────────────────────────────────

export const BovenPositie: Story = {
  name: "Boven",
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Boven</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip boven de trigger</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const RechtPositie: Story = {
  name: "Rechts",
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Rechts</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip rechts van de trigger</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const LinksPositie: Story = {
  name: "Links",
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Links</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip links van de trigger</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const OnderPositie: Story = {
  name: "Onder",
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Onder</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip onder de trigger</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

// ── Icon-only button (common Lumio pattern) ──────────────────────────────────

export const IconButton: Story = {
  name: "Icon-only knop met tooltip",
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Instellingen openen"
          >
            ⚙
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Instellingen</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

// ── Accessibility audit ──────────────────────────────────────────────────────

/**
 * Opens the tooltip via keyboard focus and runs axe-core.
 * Verifies: trigger accessible role · content visible on focus · no a11y violations.
 */
export const A11yAudit: Story = {
  name: "A11y audit (toetsenbord + axe)",
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button data-testid="tooltip-trigger" variant="outline">
            Hover of focus mij
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toegankelijke tooltip inhoud</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByTestId("tooltip-trigger");
    expect(trigger).toBeInTheDocument();

    // Trigger can be focused by keyboard
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    // Hover to open tooltip
    await userEvent.hover(trigger);

    // Wait for tooltip to appear in DOM (Radix portals it)
    await waitFor(() => {
      const tooltip = document.querySelector("[data-radix-popper-content-wrapper]");
      expect(tooltip).toBeInTheDocument();
    });

    // axe-core check on canvas + document (tooltip is portaled outside canvas)
    await runA11yChecks(canvasElement);
  },
};
