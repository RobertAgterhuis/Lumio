import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const meta = {
  title: "Primitives/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "danger", "security"],
    },
    hideIcon: { control: "boolean" },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: "info",
    children: (
      <>
        <AlertTitle>Informatie</AlertTitle>
        <AlertDescription>
          Dit is een informatief bericht voor de gebruiker.
        </AlertDescription>
      </>
    ),
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: (
      <>
        <AlertTitle>Gelukt</AlertTitle>
        <AlertDescription>
          De wijzigingen zijn succesvol opgeslagen.
        </AlertDescription>
      </>
    ),
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: (
      <>
        <AlertTitle>Let op</AlertTitle>
        <AlertDescription>
          Controleer uw gegevens voordat u verdergaat.
        </AlertDescription>
      </>
    ),
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: (
      <>
        <AlertTitle>Fout</AlertTitle>
        <AlertDescription>
          Er is een fout opgetreden bij het opslaan van uw gegevens.
        </AlertDescription>
      </>
    ),
  },
};

export const Security: Story = {
  args: {
    variant: "security",
    children: (
      <>
        <AlertTitle>Beveiligd</AlertTitle>
        <AlertDescription>
          Uw gegevens worden versleuteld opgeslagen.
        </AlertDescription>
      </>
    ),
  },
};

export const WithoutIcon: Story = {
  args: {
    variant: "info",
    hideIcon: true,
    children: (
      <AlertDescription>
        Alert zonder icoon.
      </AlertDescription>
    ),
  },
};

export const DescriptionOnly: Story = {
  args: {
    variant: "warning",
    children: (
      <AlertDescription>
        Een korte waarschuwing zonder titel.
      </AlertDescription>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-lg">
      {(["info", "success", "warning", "danger", "security"] as const).map(
        (variant) => (
          <Alert key={variant} variant={variant}>
            <AlertTitle className="capitalize">{variant}</AlertTitle>
            <AlertDescription>
              Voorbeeld van een {variant} melding.
            </AlertDescription>
          </Alert>
        )
      )}
    </div>
  ),
};
