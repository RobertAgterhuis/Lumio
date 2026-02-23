import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/ui/badge";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default", "secondary", "destructive", "outline",
        "success", "warning", "security", "info", "danger",
      ],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Badge" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secundair" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Destructief" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Success: Story = {
  args: { variant: "success", children: "Voltooid" },
};

export const Warning: Story = {
  args: { variant: "warning", children: "Aandacht" },
};

export const Security: Story = {
  args: { variant: "security", children: "Beveiligd" },
};

export const Info: Story = {
  args: { variant: "info", children: "Informatie" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Gevaar" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="security">Security</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="danger">Danger</Badge>
    </div>
  ),
};
