import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState";
import { Users, FileText, Wallet, Shield, Heart, AlertTriangle } from "lucide-react";

const meta: Meta<typeof EmptyState> = {
  title: "UI/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
    status: { type: "stable" },
    governance: {
      maturity: "stable",
      a11yLevel: "AA",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: false,
      description: "Lucide icon component to display",
    },
    title: {
      control: "text",
      description: "Main message displayed to the user",
    },
    description: {
      control: "text",
      description: "Supporting text with additional guidance",
    },
    ctaLabel: {
      control: "text",
      description: "Button label for the call-to-action",
    },
    onCtaClick: {
      action: "clicked",
      description: "Handler for CTA button click",
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: "Nog geen items",
    description: "Voeg uw eerste item toe om te beginnen.",
    ctaLabel: "Item toevoegen",
  },
};

export const Erfgenamen: Story = {
  args: {
    icon: Users,
    title: "Nog geen erfgenamen",
    description:
      "Erfgenamen zijn de personen die uw nalatenschap ontvangen. Voeg minimaal één erfgenaam toe.",
    ctaLabel: "Erfgenaam toevoegen",
  },
};

export const Documenten: Story = {
  args: {
    icon: FileText,
    title: "Nog geen documenten",
    description:
      "Upload belangrijke documenten zoals uw testament, legitimatiebewijs of verzekeringspolissen.",
    ctaLabel: "Document uploaden",
  },
};

export const Boedel: Story = {
  args: {
    icon: Wallet,
    title: "Nog geen bezittingen",
    description:
      "Registreer uw bezittingen, rekeningen, verzekeringen en schulden voor een compleet overzicht.",
    ctaLabel: "Bezit toevoegen",
  },
};

export const DigitaalBezit: Story = {
  args: {
    icon: Shield,
    title: "Nog geen digitale accounts",
    description:
      "Voeg uw online accounts toe zodat nabestaanden weten wat er moet gebeuren.",
    ctaLabel: "Account toevoegen",
  },
};

export const Uitvaart: Story = {
  args: {
    icon: Heart,
    title: "Nog geen uitvaartwensen",
    description:
      "Leg uw wensen vast voor uw uitvaart zodat uw nabestaanden weten wat u wilt.",
    ctaLabel: "Wensen vastleggen",
  },
};

export const WithoutCTA: Story = {
  args: {
    icon: AlertTriangle,
    title: "Er zijn geen zoekresultaten",
    description: "Probeer een andere zoekterm of pas uw filters aan.",
  },
};

export const MinimalWithCTA: Story = {
  args: {
    title: "Geen items",
    ctaLabel: "Toevoegen",
  },
};

export const WithCustomContent: Story = {
  render: () => (
    <EmptyState
      icon={FileText}
      title="Documenten verlopen binnenkort"
      description="De volgende documenten hebben aandacht nodig"
    >
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <p>• Paspoort - verloopt over 30 dagen</p>
        <p>• Rijbewijs - verloopt over 45 dagen</p>
      </div>
    </EmptyState>
  ),
};
