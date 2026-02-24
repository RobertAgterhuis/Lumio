import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ActivityLogItem } from "@/components/security/ActivityLogItem";
import { LogIn, Shield, FileText, Trash2, Key } from "lucide-react";

const meta = {
  title: "Security/ActivityLogItem",
  component: ActivityLogItem,
  tags: ["autodocs"],
  parameters: {
    status: { type: "experimental" },
    governance: { maturity: "experimental", a11yLevel: "AA" },
  },
  argTypes: {
    severity: {
      control: "select",
      options: ["info", "success", "warning", "danger"],
    },
  },
} satisfies Meta<typeof ActivityLogItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    icon: LogIn,
    action: "Ingelogd via wachtwoord",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    severity: "info",
  },
};

export const Success: Story = {
  args: {
    icon: Shield,
    action: "Wachtwoord succesvol gewijzigd",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: "success",
  },
};

export const Warning: Story = {
  args: {
    icon: Key,
    action: "Shamir sleutels opnieuw gegenereerd",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    severity: "warning",
    detail: "3 van 5 sleutels verdeeld",
  },
};

export const Danger: Story = {
  args: {
    icon: Trash2,
    action: "Account verwijderingspoging",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    severity: "danger",
    detail: "Geblokkeerd — wachtwoord onjuist",
  },
};

export const WithDetail: Story = {
  args: {
    icon: FileText,
    action: "Document geüpload",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    severity: "info",
    detail: "testament-scan.pdf (2.4 MB)",
  },
};

export const AllSeverities: Story = {
  args: { icon: LogIn, action: "Alle severities", timestamp: new Date() },
  render: () => (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <ActivityLogItem
        icon={LogIn}
        action="Ingelogd"
        timestamp={new Date(Date.now() - 5 * 60 * 1000)}
        severity="info"
      />
      <ActivityLogItem
        icon={Shield}
        action="Wachtwoord gewijzigd"
        timestamp={new Date(Date.now() - 60 * 60 * 1000)}
        severity="success"
      />
      <ActivityLogItem
        icon={Key}
        action="Nieuwe sleutels aangemaakt"
        timestamp={new Date(Date.now() - 24 * 60 * 60 * 1000)}
        severity="warning"
      />
      <ActivityLogItem
        icon={Trash2}
        action="Account verwijderingspoging"
        timestamp={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        severity="danger"
        detail="Geblokkeerd"
      />
    </div>
  ),
};
