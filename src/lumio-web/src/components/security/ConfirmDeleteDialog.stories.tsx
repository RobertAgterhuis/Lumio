import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NextIntlClientProvider } from "next-intl";
import { storybookMessages } from "@/lib/test-utils/storybook-messages";

const meta: Meta<typeof ConfirmDeleteDialog> = {
  title: "Security/ConfirmDeleteDialog",
  component: ConfirmDeleteDialog,
  parameters: {
    layout: "centered",
    status: { type: "stable" },
    governance: {
      maturity: "stable",
      a11yLevel: "AA",
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="nl" messages={storybookMessages("nl")}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConfirmDeleteDialog>;

// Interactive wrapper to demonstrate usage
function InteractiveDemo({
  itemType,
  itemName,
}: {
  itemType: "erfgenaam" | "bezit" | "document" | "account";
  itemName: string;
}) {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleConfirm = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setDeleted(true);
  };

  if (deleted) {
    return (
      <div className="text-center p-4">
        <p className="text-success font-medium">✓ {itemName} verwijderd</p>
        <Button variant="outline" className="mt-2" onClick={() => setDeleted(false)}>
          Reset demo
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Verwijderen
      </Button>
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        itemType={itemType}
        itemName={itemName}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export const DeleteErfgenaam: Story = {
  render: () => <InteractiveDemo itemType="erfgenaam" itemName="Jan de Vries" />,
};

export const DeleteBezit: Story = {
  render: () => <InteractiveDemo itemType="bezit" itemName="Appartement Amsterdam" />,
};

export const DeleteDocument: Story = {
  render: () => <InteractiveDemo itemType="document" itemName="Testament 2024.pdf" />,
};

export const DeleteAccount: Story = {
  render: () => <InteractiveDemo itemType="account" itemName="LinkedIn (jan@example.com)" />,
};

// All item types showcase component
function AllTypesShowcase() {
  const itemTypes = [
    { type: "erfgenaam", name: "Jan de Vries" },
    { type: "bezit", name: "Auto - Tesla Model 3" },
    { type: "rekening", name: "ING Betaalrekening" },
    { type: "verzekering", name: "Levensverzekering Aegon" },
    { type: "schuld", name: "Hypotheek ABN AMRO" },
    { type: "document", name: "Paspoort.pdf" },
    { type: "account", name: "Google Account" },
    { type: "wachtwoord", name: "Bankieren" },
    { type: "wallet", name: "Bitcoin Wallet" },
    { type: "noodcontact", name: "Huisarts - Dr. Janssen" },
    { type: "begunstigde", name: "Rode Kruis" },
    { type: "executeur", name: "Mr. P. Advocaat" },
  ] as const;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {itemTypes.map((item, index) => (
        <div key={item.type} className="flex items-center gap-2">
          <span className="w-32 text-sm text-muted-foreground">{item.type}:</span>
          <Button variant="outline" size="sm" onClick={() => setOpenIndex(index)}>
            Delete &quot;{item.name}&quot;
          </Button>
          <ConfirmDeleteDialog
            open={openIndex === index}
            onOpenChange={(open) => !open && setOpenIndex(null)}
            itemType={item.type}
            itemName={item.name}
            onConfirm={() => setOpenIndex(null)}
          />
        </div>
      ))}
    </div>
  );
}

export const AllItemTypes: Story = {
  render: () => <AllTypesShowcase />,
};
