import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SecureValueReveal } from "@/components/security/SecureValueReveal";

const meta = {
  title: "Security/SecureValueReveal",
  component: SecureValueReveal,
  tags: ["autodocs"],
  argTypes: {
    autoHideMs: { control: "number" },
    maskedText: { control: "text" },
  },
} satisfies Meta<typeof SecureValueReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "geheim-wachtwoord-123",
  },
};

export const CustomMask: Story = {
  args: {
    value: "ABC-DEF-GHI-JKL",
    maskedText: "****-****-****-****",
  },
};

export const NoAutoHide: Story = {
  args: {
    value: "Blijft zichtbaar totdat je op het oog klikt",
    autoHideMs: 0,
  },
};

export const QuickAutoHide: Story = {
  args: {
    value: "Verdwijnt na 3 seconden",
    autoHideMs: 3000,
  },
};
