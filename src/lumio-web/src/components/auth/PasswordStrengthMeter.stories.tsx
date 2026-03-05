import type { Meta, StoryObj } from "@storybook/react";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { NextIntlClientProvider } from "next-intl";
import { storybookMessages } from "@/lib/test-utils/storybook-messages";

const meta: Meta<typeof PasswordStrengthMeter> = {
  title: "Auth/PasswordStrengthMeter",
  component: PasswordStrengthMeter,
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
      <NextIntlClientProvider locale="nl" messages={storybookMessages("nl")}>
        <div className="w-80">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PasswordStrengthMeter>;

export const Leeg: Story = {
  name: "Leeg (geen wachtwoord)",
  args: {
    password: "",
  },
};

export const ZeerZwak: Story = {
  name: "Zeer zwak",
  args: {
    password: "ab",
  },
};

export const Zwak: Story = {
  name: "Zwak",
  args: {
    password: "abc123",
  },
};

export const Matig: Story = {
  name: "Matig",
  args: {
    password: "Abc123",
  },
};

export const Sterk: Story = {
  name: "Sterk",
  args: {
    password: "Abc123!@#",
  },
};

export const ZeerSterk: Story = {
  name: "Zeer sterk",
  args: {
    password: "Abc123!@#xyz456$",
  },
};
