import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState";
import { AlertTriangle } from "lucide-react";
import type { LumioIconName } from "@/components/ui/lumio-icon";

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
      description: "Lucide icon component (fallback; prefer lumioIcon for domain items)",
    },
    lumioIcon: {
      control: "select",
      options: [
        undefined,
        "dashboard",
        "profiel",
        "testament",
        "wilsverklaring",
        "donor",
        "uitvaart",
        "digitaal-bezit",
        "boedel",
        "documenten",
        "erfgenamen",
        "noodcontacten",
        "tijdlijn",
        "shield",
        "shield-check",
        "shield-alert",
        "shield-x",
      ] satisfies (LumioIconName | undefined)[],
      description: "Custom Lumio icon name (domain icons)",
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
    lumioIcon: "erfgenamen",
    title: "Nog geen erfgenamen",
    description:
      "Erfgenamen zijn de personen die uw nalatenschap ontvangen. Voeg minimaal één erfgenaam toe.",
    ctaLabel: "Erfgenaam toevoegen",
  },
};

export const Documenten: Story = {
  args: {
    lumioIcon: "documenten",
    title: "Nog geen documenten",
    description:
      "Upload belangrijke documenten zoals uw testament, legitimatiebewijs of verzekeringspolissen.",
    ctaLabel: "Document uploaden",
  },
};

export const Boedel: Story = {
  args: {
    lumioIcon: "boedel",
    title: "Nog geen bezittingen",
    description:
      "Registreer uw bezittingen, rekeningen, verzekeringen en schulden voor een compleet overzicht.",
    ctaLabel: "Bezit toevoegen",
  },
};

export const DigitaalBezit: Story = {
  args: {
    lumioIcon: "digitaal-bezit",
    title: "Nog geen digitale accounts",
    description:
      "Voeg uw online accounts toe zodat nabestaanden weten wat er moet gebeuren.",
    ctaLabel: "Account toevoegen",
  },
};

export const Uitvaart: Story = {
  args: {
    lumioIcon: "uitvaart",
    title: "Nog geen uitvaartwensen",
    description:
      "Leg uw wensen vast voor uw uitvaart zodat uw nabestaanden weten wat u wilt.",
    ctaLabel: "Wensen vastleggen",
  },
};

export const Testament: Story = {
  args: {
    lumioIcon: "testament",
    title: "Nog geen testament",
    description:
      "Leg uw laatste wil vast en bepaal zelf wie uw nalatenschap ontvangt.",
    ctaLabel: "Testament opstellen",
  },
};

export const Wilsverklaring: Story = {
  args: {
    lumioIcon: "wilsverklaring",
    title: "Nog geen wilsverklaring",
    description:
      "Leg uw medische wensen vast voor situaties waarin u zelf geen beslissingen meer kunt nemen.",
    ctaLabel: "Wilsverklaring toevoegen",
  },
};

export const Donor: Story = {
  args: {
    lumioIcon: "donor",
    title: "Donorregistratie niet ingesteld",
    description:
      "Geef aan of u organen, weefsels of cellen beschikbaar wilt stellen na uw overlijden.",
    ctaLabel: "Registratie bekijken",
  },
};

export const Noodcontacten: Story = {
  args: {
    lumioIcon: "noodcontacten",
    title: "Nog geen noodcontacten",
    description:
      "Voeg noodcontacten toe zodat nabestaanden weten wie zij kunnen bereiken in geval van nood.",
    ctaLabel: "Noodcontact toevoegen",
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
      lumioIcon="documenten"
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
