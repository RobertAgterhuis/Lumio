import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Home, Settings, AlertTriangle, Check, X, Search, User, Bell } from "lucide-react";
import { Icon } from "@/components/ui/icon";

const meta = {
  title: "Primitives/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: {
    status: { type: "core" },
    governance: { maturity: "core", a11yLevel: "AA" },
    docs: {
      description: {
        component:
          "Icon wrapper with accessibility and size presets. Icons are decorative (aria-hidden) by default. Provide a `label` prop for screen reader visibility.",
      },
    },
  },
  argTypes: {
    icon: {
      control: false,
      description: "Lucide icon component to render",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
      description: "Size preset",
    },
    label: {
      control: "text",
      description: "Accessible label (makes icon visible to screen readers)",
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: Home,
    size: "md",
  },
};

export const Sizes: Story = {
  args: {
    icon: Home,
  },
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Home} size="sm" />
        <span className="text-xs text-muted-foreground">sm (16px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Home} size="md" />
        <span className="text-xs text-muted-foreground">md (20px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Home} size="lg" />
        <span className="text-xs text-muted-foreground">lg (24px)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Icon icon={Home} size="xl" />
        <span className="text-xs text-muted-foreground">xl (32px)</span>
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  args: {
    icon: AlertTriangle,
    size: "lg",
    label: "Waarschuwing",
    className: "text-warning",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When a `label` is provided, the icon becomes accessible to screen readers with role='img' and aria-label.",
      },
    },
  },
};

export const CommonIcons: Story = {
  args: {
    icon: Home,
  },
  render: () => (
    <div className="flex flex-wrap gap-6">
      {[
        { icon: Home, name: "Home" },
        { icon: Settings, name: "Settings" },
        { icon: User, name: "User" },
        { icon: Bell, name: "Bell" },
        { icon: Search, name: "Search" },
        { icon: Check, name: "Check" },
        { icon: X, name: "X" },
        { icon: AlertTriangle, name: "AlertTriangle" },
      ].map(({ icon, name }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <div className="p-3 border rounded-md">
            <Icon icon={icon} size="lg" />
          </div>
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const ColorVariants: Story = {
  args: {
    icon: Home,
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={Check} size="lg" className="text-success" />
      <Icon icon={AlertTriangle} size="lg" className="text-warning" />
      <Icon icon={X} size="lg" className="text-danger" />
      <Icon icon={Bell} size="lg" className="text-info" />
      <Icon icon={Home} size="lg" className="text-primary" />
      <Icon icon={Settings} size="lg" className="text-muted-foreground" />
    </div>
  ),
};
