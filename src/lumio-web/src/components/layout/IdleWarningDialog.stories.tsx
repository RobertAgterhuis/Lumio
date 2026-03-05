import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { IdleWarningDialog } from "./IdleWarningDialog";
import { NextIntlClientProvider } from "next-intl";
import { storybookMessages } from "@/lib/test-utils/storybook-messages";

const meta: Meta<typeof IdleWarningDialog> = {
  title: "Layout/IdleWarningDialog",
  component: IdleWarningDialog,
  parameters: {
    layout: "centered",
    status: { type: "stable" },
    governance: {
      maturity: "stable",
      a11yLevel: "AA",
    },
  },
  tags: ["autodocs"],
  args: {
    onDismiss: fn(),
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nl" messages={storybookMessages("nl")}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof IdleWarningDialog>;

export const Standaard: Story = {
  name: "Sessiewaarschuwing (30 seconden)",
  args: {
    open: true,
    secondsLeft: 30,
  },
};

export const LaatstWaarschuwing: Story = {
  name: "Laatste waarschuwing (10 seconden)",
  args: {
    open: true,
    secondsLeft: 10,
  },
};

export const Gesloten: Story = {
  name: "Gesloten",
  args: {
    open: false,
    secondsLeft: 30,
  },
};
