import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ConfirmJuridischDialog } from "@/components/security/ConfirmJuridischDialog";

/**
 * ConfirmJuridischDialog — SC 3.3.4 (WCAG 2.1 AA) confirmation gate for legally
 * and medically significant save actions.
 *
 * Sprint 3 (SP-S3-003): Storybook coverage added.
 * Component was implemented in Sprint 1 (SP-ACC1-006) and deployed to 5 pages
 * (euthanasie, testament wizard, donor formulier, uitvaart wizard, euthanasie wizard).
 */
const meta = {
  title: "Security/ConfirmJuridischDialog",
  component: ConfirmJuridischDialog,
  tags: ["autodocs"],
  parameters: {
    status: { type: "stable" },
    governance: { maturity: "stable", a11yLevel: "AA" },
  },
  argTypes: {
    open: { control: "boolean" },
  },
} satisfies Meta<typeof ConfirmJuridischDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Typical use: saving a legally binding wilsverklaring (advance directive). */
export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Wilsverklaring opslaan",
    description:
      "U staat op het punt uw wilsverklaring op te slaan. Controleer uw gegevens zorgvuldig — dit document heeft juridische betekenis.",
    onConfirm: async () => {
      await new Promise((r) => setTimeout(r, 800));
    },
  },
};

/** Saving a donor registration preference. */
export const DonorKeuze: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Donorkeuze opslaan",
    description:
      "Uw donorkeuze wordt opgeslagen. Dit is een medisch significante keuze die door uw nabestaanden geraadpleegd kan worden.",
    confirmLabel: "Ja, keuze opslaan",
    cancelLabel: "Terug",
    onConfirm: async () => {
      await new Promise((r) => setTimeout(r, 800));
    },
  },
};

/** Saving a testament — longest description variant. */
export const Testament: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Testament opslaan",
    description:
      "U staat op het punt uw testament op te slaan. Controleer alle gegevens goed: erfgenamen, verdeelsleutel en eventuele bijzondere wensen. Wijzigingen kunnen later worden aangebracht.",
    confirmLabel: "Testament opslaan",
    cancelLabel: "Controleren",
    onConfirm: async () => {
      await new Promise((r) => setTimeout(r, 1000));
    },
  },
};

/**
 * Shows the error state when `onConfirm` throws.
 * Verifies that the dialog remains open and an accessible error alert is rendered.
 * SC 3.3.1 (WCAG 2.1 AA): error identified + described.
 */
export const ErrorState: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Wilsverklaring opslaan",
    description: "Bevestig de opslag van uw wilsverklaring.",
    onConfirm: async () => {
      await new Promise((r) => setTimeout(r, 400));
      throw new Error("Verbinding verloren. Probeer het opnieuw.");
    },
  },
};

/**
 * Custom labels — confirms all text surfaces are configurable.
 */
export const CustomLabels: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Uitvaartinstructies definitief maken",
    description:
      "Uw uitvaartinstructies worden definitief opgeslagen en zijn zichtbaar voor uw contactpersonen.",
    confirmLabel: "Definitief opslaan",
    cancelLabel: "Nog even wachten",
    onConfirm: async () => {},
  },
};
