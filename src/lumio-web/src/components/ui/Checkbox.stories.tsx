import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "@/components/ui/checkbox";
import { fn } from "storybook/test";

const meta = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
    description: { control: "text" },
  },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Ik ga akkoord" },
};

export const Checked: Story = {
  args: { label: "Geselecteerd", checked: true },
};

export const WithDescription: Story = {
  args: {
    label: "Uitsluitingsclausule",
    description: "Een erfenis kan niet worden aangetast door echtscheiding.",
  },
};

export const Disabled: Story = {
  args: { label: "Niet beschikbaar", disabled: true },
};

export const DisabledChecked: Story = {
  args: { label: "Vergrendeld", disabled: true, checked: true },
};

export const WithoutLabel: Story = {
  args: {},
};
