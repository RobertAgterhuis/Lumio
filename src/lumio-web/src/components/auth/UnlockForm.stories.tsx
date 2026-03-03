/**
 * UnlockForm stories — SP-UX-01-006 (REC-ACC-002)
 *
 * Covers the primary unlock flow and the heir-mode variant introduced in
 * SP-UX-01-004. Both variants are picked up by the existing `a11y` CI job
 * via `npm run test:storybook`.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { NextIntlClientProvider } from "next-intl";
import nlMessages from "../../../messages/nl.json";
import { UnlockForm } from "./UnlockForm";

const meta: Meta<typeof UnlockForm> = {
  title: "Auth/UnlockForm",
  component: UnlockForm,
  parameters: {
    layout: "centered",
    status: { type: "stable" },
    governance: {
      maturity: "stable",
      a11yLevel: "AA",
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nl" messages={nlMessages}>
        <div className="w-full max-w-md">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UnlockForm>;

/** Standaard ontgrendel-formulier zonder erfgenaam-optie. */
export const Standaard: Story = {
  name: "Standaard (wachtwoord invoeren)",
  args: {},
};

/** Met de "Ik ben een erfgenaam"-knop zichtbaar (SP-UX-01-004). */
export const MetErfgenaamOptie: Story = {
  name: "Met erfgenaam-knop (SP-UX-01-004)",
  args: {
    onHeirMode: fn(),
  },
};
