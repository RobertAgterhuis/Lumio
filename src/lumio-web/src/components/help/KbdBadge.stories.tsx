import type { Meta, StoryObj } from "@storybook/react";
import { KbdBadge } from "@/components/help/KbdBadge";

const meta = {
  title: "Help/KbdBadge",
  component: KbdBadge,
  parameters: {
    layout: "centered",
    status: { type: "stable" },
    governance: { maturity: "stable", a11yLevel: "AA" },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof KbdBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleKey: Story = {
  args: { children: "Esc" },
};

export const Enter: Story = {
  args: { children: "Enter" },
};

export const FunctionKey: Story = {
  args: { children: "F1" },
};

export const ModifierPlusKey: Story = {
  args: { children: "Ctrl+S" },
};

export const TripleModifier: Story = {
  args: { children: "Ctrl+Shift+K" },
};

export const MetaKey: Story = {
  args: { children: "Cmd+Z" },
};

export const SequenceDan: Story = {
  name: "Sequence (G dan D)",
  args: { children: "G dan D" },
};

export const SequenceThen: Story = {
  name: "Sequence (G then D)",
  args: { children: "G then D" },
};
