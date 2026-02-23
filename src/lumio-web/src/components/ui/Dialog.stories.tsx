import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Primitives/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    children: (
      <>
        <DialogHeader>
          <DialogTitle>Bevestiging</DialogTitle>
          <DialogDescription>
            Weet u zeker dat u deze actie wilt uitvoeren?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Annuleren</Button>
          <Button>Bevestigen</Button>
        </DialogFooter>
      </>
    ),
  },
};

export const WithContent: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    children: (
      <>
        <DialogHeader>
          <DialogTitle>Profiel bewerken</DialogTitle>
          <DialogDescription>
            Pas uw persoonlijke gegevens aan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Formulierinhoud wordt hier getoond.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline">Annuleren</Button>
          <Button>Opslaan</Button>
        </DialogFooter>
      </>
    ),
  },
};
