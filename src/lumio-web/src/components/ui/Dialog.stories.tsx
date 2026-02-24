import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { useState } from "react";
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

/**
 * Interactive dialog with play function test
 */
export const Interactive: Story = {
  args: {
    open: false,
    onOpenChange: fn(),
    children: null,
  },
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    return (
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)} data-testid="open-dialog">
          Open Dialog
        </Button>
        {confirmed && (
          <p className="text-sm text-success" data-testid="confirmed-message">
            Actie bevestigd!
          </p>
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogHeader>
            <DialogTitle>Bevestiging</DialogTitle>
            <DialogDescription>
              Weet u zeker dat u deze actie wilt uitvoeren?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="cancel-button"
            >
              Annuleren
            </Button>
            <Button
              onClick={() => {
                setConfirmed(true);
                setOpen(false);
              }}
              data-testid="confirm-button"
            >
              Bevestigen
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Click button to open dialog
    const openButton = canvas.getByTestId("open-dialog");
    await userEvent.click(openButton);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(body.getByRole("dialog")).toBeInTheDocument();
    });

    // Verify dialog title is visible
    expect(body.getByText("Bevestiging")).toBeInTheDocument();

    // Click confirm button
    const confirmButton = body.getByTestId("confirm-button");
    await userEvent.click(confirmButton);

    // Wait for dialog to close and confirmation message to appear
    await waitFor(() => {
      expect(canvas.getByTestId("confirmed-message")).toBeInTheDocument();
    });
  },
};

/**
 * Test dialog can be cancelled
 */
export const CancelInteraction: Story = {
  args: {
    open: false,
    onOpenChange: fn(),
    children: null,
  },
  render: function Render() {
    const [open, setOpen] = useState(false);

    return (
      <div className="space-y-4">
        <Button onClick={() => setOpen(true)} data-testid="open-dialog">
          Open Dialog
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogHeader>
            <DialogTitle>Annuleer Test</DialogTitle>
            <DialogDescription>
              Test dat annuleren werkt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="cancel-button"
            >
              Annuleren
            </Button>
            <Button data-testid="confirm-button">
              Bevestigen
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Open dialog
    await userEvent.click(canvas.getByTestId("open-dialog"));

    // Wait for dialog
    await waitFor(() => {
      expect(body.getByRole("dialog")).toBeInTheDocument();
    });

    // Click cancel
    await userEvent.click(body.getByTestId("cancel-button"));

    // Dialog should be closed
    await waitFor(() => {
      expect(body.queryByRole("dialog")).not.toBeInTheDocument();
    });
  },
};
