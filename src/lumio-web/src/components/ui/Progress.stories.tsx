import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Progress } from "@/components/ui/progress";

const meta = {
  title: "Primitives/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    status: { type: "stable" },
    governance: { maturity: "stable", a11yLevel: "AA" },
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    max: { control: "number" },
    label: { control: "text" },
    showValue: { control: "boolean" },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 60 },
};

export const WithLabel: Story = {
  args: { value: 75, label: "Profiel compleetheid" },
};

export const WithValue: Story = {
  args: { value: 42, label: "Voortgang", showValue: true },
};

export const Empty: Story = {
  args: { value: 0, label: "Nog niet gestart" },
};

export const Complete: Story = {
  args: { value: 100, label: "Voltooid", showValue: true },
};

export const CustomMax: Story = {
  args: { value: 3, max: 8, label: "Stap 3 van 8", showValue: true },
};
