import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ConfirmDestructiveAction } from "@/components/security/ConfirmDestructiveAction";

const meta = {
  title: "Security/ConfirmDestructiveAction",
  component: ConfirmDestructiveAction,
  tags: ["autodocs"],
  parameters: {
    status: { type: "experimental" },
    governance: { maturity: "experimental", a11yLevel: "AA" },
  },
  argTypes: {
    open: { control: "boolean" },
    requirePassword: { control: "boolean" },
  },
} satisfies Meta<typeof ConfirmDestructiveAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Account verwijderen",
    description:
      "Weet u zeker dat u uw account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.",
    confirmLabel: "Verwijderen",
    onConfirm: async () => {
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
};

export const WithPassword: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Alle gegevens wissen",
    description:
      "Alle opgeslagen gegevens worden permanent verwijderd. Voer uw wachtwoord in ter bevestiging.",
    confirmLabel: "Alles wissen",
    requirePassword: true,
    onConfirm: async (password?: string) => {
      if (password !== "test") throw new Error("Ongeldig wachtwoord");
    },
  },
};

export const CustomLabels: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Backup overschrijven",
    description: "De bestaande backup wordt overschreven.",
    confirmLabel: "Overschrijven",
    cancelLabel: "Terug",
    onConfirm: async () => {},
  },
};
