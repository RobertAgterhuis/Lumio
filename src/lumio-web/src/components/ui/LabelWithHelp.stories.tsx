import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { NextIntlClientProvider } from "next-intl";
import nlMessages from "../../../messages/nl.json";
import { LabelWithHelp } from "@/components/ui/LabelWithHelp";
import { runA11yChecks } from "@/lib/test-utils/storybook-a11y";

/**
 * LabelWithHelp — drop-in `<Label>` replacement that conditionally renders a
 * help tooltip when a `hulpteksten.[domain].[field]` i18n key exists.
 *
 * When no key is found the component renders as a plain `<Label>`, making it
 * safe to use on every form field without carrying tooltip state.
 *
 * WCAG 2.1 compliance:
 * - SC 1.3.5 (Identify Input Purpose): label is still present without tooltip.
 * - SC 2.1.1: tooltip trigger is keyboard-focusable.
 * - SC 2.5.3: visible label matches accessible name.
 * - Tooltip trigger has `aria-label="Uitleg bij dit veld"`.
 *
 * Governance: stable · a11yLevel: AA
 */
const meta = {
  title: "Primitives/LabelWithHelp",
  component: LabelWithHelp,
  tags: ["autodocs"],
  parameters: {
    status: { type: "stable" },
    governance: { maturity: "stable", a11yLevel: "AA" },
    docs: {
      description: {
        component:
          "Extends `<Label>` with an optional contextual tooltip. The tooltip " +
          "only appears when a matching `hulpteksten.[domain].[field]` translation " +
          "key is present. Fields without a key render as a plain label, so this " +
          "component is always safe to use as the default label in forms.",
      },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nl" messages={nlMessages}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof LabelWithHelp>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Without help text (plain label fallback) ─────────────────────────────────

export const ZonderHulptekst: Story = {
  name: "Zonder hulptekst (plain label)",
  args: {
    domain: "onbekend",
    field: "onbekend",
    htmlFor: "input-plain",
    children: "Veldnaam",
  },
  render: (args) => (
    <div className="flex flex-col gap-1">
      <LabelWithHelp {...args} />
      <input id="input-plain" type="text" className="border rounded px-2 py-1" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should render as a plain label — no tooltip trigger present
    const label = canvas.getByText("Veldnaam");
    expect(label.tagName).toBe("LABEL");

    // No help button should be present
    const helpButtons = canvas.queryAllByRole("button");
    expect(helpButtons).toHaveLength(0);
  },
};

// ── With help text (tooltip rendered) ───────────────────────────────────────

export const MetHulptekst: Story = {
  name: "Met hulptekst (tooltip actief)",
  args: {
    // eigenaar.bsn has a real help text in nl.json:hulpteksten
    domain: "eigenaar",
    field: "bsn",
    htmlFor: "input-bsn",
    children: "BSN",
  },
  render: (args) => (
    <div className="flex flex-col gap-1">
      <LabelWithHelp {...args} />
      <input id="input-bsn" type="text" className="border rounded px-2 py-1" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Label must be present
    const label = canvas.getByText("BSN");
    expect(label).toBeInTheDocument();

    // Tooltip trigger button must be present with correct aria-label
    const trigger = canvas.getByRole("button", {
      name: /uitleg bij dit veld/i,
    });
    expect(trigger).toBeInTheDocument();
  },
};

// ── Multiple fields demonstrating mixed behaviour ────────────────────────────

export const FormVoorbeeld: Story = {
  name: "Formulier voorbeeld",
  args: {
    domain: "eigenaar",
    field: "bsn",
    children: "BSN",
  },
  render: () => (
    <NextIntlClientProvider locale="nl" messages={nlMessages}>
      <div className="flex flex-col gap-4 w-72">
        {/* Has help text → tooltip rendered */}
        <div className="flex flex-col gap-1">
          <LabelWithHelp domain="eigenaar" field="bsn" htmlFor="bsn">
            BSN
          </LabelWithHelp>
          <input id="bsn" type="text" className="border rounded px-2 py-1" />
        </div>
        {/* Has help text → tooltip rendered */}
        <div className="flex flex-col gap-1">
          <LabelWithHelp domain="eigenaar" field="burgerlijkeStaat" htmlFor="staat">
            Burgerlijke staat
          </LabelWithHelp>
          <input id="staat" type="text" className="border rounded px-2 py-1" />
        </div>
        {/* No matching key → plain label */}
        <div className="flex flex-col gap-1">
          <LabelWithHelp domain="onbekend" field="veld" htmlFor="plain">
            Gewoon veld
          </LabelWithHelp>
          <input id="plain" type="text" className="border rounded px-2 py-1" />
        </div>
      </div>
    </NextIntlClientProvider>
  ),
};

// ── Accessibility audit ──────────────────────────────────────────────────────

export const A11yAudit: Story = {
  name: "A11y audit (axe)",
  args: {
    domain: "eigenaar",
    field: "bsn",
    children: "BSN",
  },
  render: () => (
    <NextIntlClientProvider locale="nl" messages={nlMessages}>
      <div className="flex flex-col gap-4 w-72">
        <div className="flex flex-col gap-1">
          <LabelWithHelp domain="eigenaar" field="bsn" htmlFor="a11y-bsn">
            BSN
          </LabelWithHelp>
          <input id="a11y-bsn" type="text" className="border rounded px-2 py-1" />
        </div>
        <div className="flex flex-col gap-1">
          <LabelWithHelp domain="onbekend" field="veld" htmlFor="a11y-plain">
            Gewoon label
          </LabelWithHelp>
          <input id="a11y-plain" type="text" className="border rounded px-2 py-1" />
        </div>
      </div>
    </NextIntlClientProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Both labels must be in the DOM
    expect(canvas.getByText("BSN")).toBeInTheDocument();
    expect(canvas.getByText("Gewoon label")).toBeInTheDocument();

    // The field with help has an accessible trigger
    const helpTrigger = canvas.getByRole("button", {
      name: /uitleg bij dit veld/i,
    });
    expect(helpTrigger).toBeInTheDocument();

    // axe-core WCAG 2.1 AA check
    await runA11yChecks(canvasElement);
  },
};
