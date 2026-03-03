import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { NextIntlClientProvider } from "next-intl";
import nlMessages from "../../../messages/nl.json";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { runA11yChecks } from "@/lib/test-utils/storybook-a11y";

/**
 * HelpTooltip — click-activated inline tooltip for contextual help.
 *
 * Unlike `<Tooltip>` (hover-only), HelpTooltip is activated by click/tap and
 * dismisses on outside click — making it suitable for touch interfaces.
 *
 * WCAG 2.1 compliance:
 * - SC 2.1.1: trigger button is keyboard-accessible with focus-visible ring.
 * - SC 2.5.3: button accessible name comes from i18n key `common.meerInformatie`.
 * - SC 1.4.13: tooltip persists until user dismisses (outside click / escape).
 * - Info icon is decorative (no explicit aria-hidden — monitor for compliance).
 *
 * Governance: stable · a11yLevel: AA
 */
const meta = {
  title: "Primitives/HelpTooltip",
  component: HelpTooltip,
  tags: ["autodocs"],
  parameters: {
    status: { type: "stable" },
    governance: { maturity: "stable", a11yLevel: "AA" },
    docs: {
      description: {
        component:
          "Click-activated contextual tooltip. Uses the `common.meerInformatie` " +
          "translation key for the trigger aria-label. Designed for touch devices — " +
          "use the hover-based `<Tooltip>` primitive for desktop-only tooltips.",
      },
    },
  },
  args: {
    tekst: "Dit veld bevat aanvullende toelichting voor de gebruiker.",
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nl" messages={nlMessages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof HelpTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Standaard ────────────────────────────────────────────────────────────────

export const Standaard: Story = {
  args: {
    tekst: "Dit veld bevat aanvullende toelichting voor de gebruiker.",
  },
};

// ── Lange tekst ──────────────────────────────────────────────────────────────

export const LangeTekst: Story = {
  name: "Lange hulptekst",
  args: {
    tekst:
      "Uw Burgerservicenummer wordt versleuteld opgeslagen en is nodig voor " +
      "notariële aktes en officiële correspondentie. Het BSN wordt alleen " +
      "gedeeld met uw notaris en/of erfgenamen bij uw overlijden.",
  },
};

// ── Inline naast een label ───────────────────────────────────────────────────

export const NaastLabel: Story = {
  name: "Inline naast label",
  render: (args) => (
    <NextIntlClientProvider locale="nl" messages={nlMessages}>
      <div className="flex items-center gap-2">
        <label htmlFor="demo-field" className="text-sm font-medium">
          BSN
        </label>
        <HelpTooltip {...args} />
        <input
          id="demo-field"
          type="text"
          placeholder="123456789"
          className="border rounded px-2 py-1 text-sm"
        />
      </div>
    </NextIntlClientProvider>
  ),
  args: {
    tekst: "Uw BSN wordt versleuteld opgeslagen.",
  },
};

// ── Open/close interactie ─────────────────────────────────────────────────────

export const OpenSluitenInteractief: Story = {
  name: "Open/sluiten (interactief)",
  args: {
    tekst: "Klik op het icoontje om deze toelichting te openen en sluiten.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Trigger button accessible name is derived from common.meerInformatie
    const trigger = canvas.getByRole("button", { name: /meer informatie/i });
    expect(trigger).toBeInTheDocument();

    // Tooltip should not be visible before click
    const popoverBefore = canvasElement.querySelector(
      '[class*="absolute"][class*="rounded-lg"]'
    );
    expect(popoverBefore).toBeNull();

    // Click to open
    await userEvent.click(trigger);

    // Tooltip text should now be visible
    const popover = canvasElement.querySelector(
      '[class*="absolute"][class*="rounded-lg"]'
    );
    expect(popover).toBeInTheDocument();
    expect(popover?.textContent).toContain("Klik op het icoontje");

    // Click outside to close
    await userEvent.click(document.body);

    // Tooltip should be gone
    const popoverAfter = canvasElement.querySelector(
      '[class*="absolute"][class*="rounded-lg"]'
    );
    expect(popoverAfter).toBeNull();
  },
};

// ── Accessibility audit ──────────────────────────────────────────────────────

export const A11yAudit: Story = {
  name: "A11y audit (gesloten + geopend)",
  args: {
    tekst: "Toegankelijkheidstoelichting — dit is de volledige hulptekst.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // axe check in closed state
    await runA11yChecks(canvasElement);

    // Open the tooltip
    const trigger = canvas.getByRole("button", { name: /meer informatie/i });
    await userEvent.click(trigger);

    // axe check in open state (tooltip content now in DOM)
    await runA11yChecks(canvasElement);

    // Cleanup
    await userEvent.click(document.body);
  },
};
