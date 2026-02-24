import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SecurityStatusIndicator } from "@/components/security/SecurityStatusIndicator";

const meta = {
  title: "Security/SecurityStatusIndicator",
  component: SecurityStatusIndicator,
  tags: ["autodocs"],
  parameters: {
    status: { type: "experimental" },
    governance: { maturity: "experimental", a11yLevel: "AA" },
  },
  argTypes: {
    status: {
      control: "select",
      options: ["secure", "warning", "critical", "unknown"],
    },
    label: { control: "text" },
  },
} satisfies Meta<typeof SecurityStatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Secure: Story = {
  args: { status: "secure", label: "Database versleuteld" },
};

export const Warning: Story = {
  args: { status: "warning", label: "Zwak wachtwoord" },
};

export const Critical: Story = {
  args: { status: "critical", label: "Sessie verlopen" },
};

export const Unknown: Story = {
  args: { status: "unknown", label: "Status onbekend" },
};

export const AllStatuses: Story = {
  args: {
    status: "secure",
    label: "Overzicht",
  },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <SecurityStatusIndicator status="secure" label="Versleuteld" />
      <SecurityStatusIndicator status="warning" label="Aandacht nodig" />
      <SecurityStatusIndicator status="critical" label="Kritiek" />
      <SecurityStatusIndicator status="unknown" label="Onbekend" />
    </div>
  ),
};
