"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

export interface ConfirmJuridischDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Description of what will be saved / the legal consequence */
  description: string;
  /** Label for the confirm button (default: "Ja, opslaan") */
  confirmLabel?: string;
  /** Label for the cancel button (default: "Terug") */
  cancelLabel?: string;
  /** Callback executed when user confirms — dialog closes automatically on success */
  onConfirm: () => Promise<void> | void;
}

/**
 * ConfirmJuridischDialog — confirmation gate for legally/medically significant saves.
 *
 * SC 3.3.4 (WCAG 2.1 AA): Provides a review-and-confirm step before irreversible
 * or legally binding data submissions, giving users the opportunity to correct
 * mistakes before the action is committed.
 *
 * Usage:
 * ```tsx
 * <ConfirmJuridischDialog
 *   open={confirmOpen}
 *   onOpenChange={setConfirmOpen}
 *   title="Wilsverklaring opslaan"
 *   description="U staat op het punt uw wilsverklaring op te slaan. Controleer uw gegevens voordat u bevestigt."
 *   onConfirm={saveEdit}
 * />
 * ```
 */
export function ConfirmJuridischDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Ja, opslaan",
  cancelLabel = "Terug",
  onConfirm,
}: ConfirmJuridischDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setError("");
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) setError("");
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
          <DialogTitle>{title}</DialogTitle>
        </div>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => handleClose(false)}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button onClick={handleConfirm} disabled={loading}>
          {loading ? "Bezig…" : confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
