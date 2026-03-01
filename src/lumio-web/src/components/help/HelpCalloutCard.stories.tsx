import type { Meta, StoryObj } from "@storybook/react";
import { HelpCalloutCard } from "@/components/help/HelpCalloutCard";

const meta = {
  title: "Help/HelpCalloutCard",
  component: HelpCalloutCard,
  parameters: {
    layout: "padded",
    status: { type: "stable" },
    governance: { maturity: "stable", a11yLevel: "AA" },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["tip", "warning", "danger", "security", "info"],
    },
  },
} satisfies Meta<typeof HelpCalloutCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tip: Story = {
  args: {
    type: "tip",
    children: "Sla geregeld een back-up op van uw gegevens voor de beste beveiliging.",
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    children:
      "Controleer uw gegevens zorgvuldig. Wijzigingen na opslaan kunnen invloed hebben op bestaande documenten.",
  },
};

export const Danger: Story = {
  args: {
    type: "danger",
    children:
      "Het verwijderen van uw account is onomkeerbaar. Al uw gegevens worden permanent gewist.",
  },
};

export const Security: Story = {
  args: {
    type: "security",
    children:
      "Uw BSN wordt end-to-end versleuteld opgeslagen en is nooit leesbaar voor medewerkers van Lumio.",
  },
};

export const Info: Story = {
  args: {
    type: "info",
    children:
      "Een notarieel testament is vereist voor juridische geldigheid conform het Burgerlijk Wetboek.",
  },
};

export const WithRichContent: Story = {
  args: {
    type: "tip",
    children: (
      <span>
        Gebruik <strong>Ctrl+S</strong> om uw wijzigingen snel op te slaan, of
        klik op de <em>Opslaan</em>-knop rechtsonder.
      </span>
    ),
  },
};
