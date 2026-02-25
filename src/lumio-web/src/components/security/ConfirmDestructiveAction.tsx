"use client";

import { useState, type ReactNode, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LumioIcon } from "@/components/ui/lumio-icon";

export interface ConfirmDestructiveActionProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Description of what will happen */
  description: string;
  /** Label for the confirm button */
  confirmLabel: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Whether password re-entry is required */
  requirePassword?: boolean;
  /** Password input label */
  passwordLabel?: string;
  /** Password input placeholder */
  passwordPlaceholder?: string;
  /** Callback when user confirms — receives password if required */
  onConfirm: (password?: string) => Promise<void> | void;
  /** Optional extra content in the dialog body */
  children?: ReactNode;
}

export function ConfirmDestructiveAction({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Annuleren",
  requirePassword = false,
  passwordLabel = "Wachtwoord",
  passwordPlaceholder = "Voer uw wachtwoord in ter bevestiging",
  onConfirm,
  children,
}: ConfirmDestructiveActionProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onConfirm(requirePassword ? password : undefined);
      setPassword("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setPassword("");
      setError("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 text-danger">
            <LumioIcon name="shield-alert" size="lg" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4">
          {children}

          {requirePassword && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{passwordLabel}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={passwordPlaceholder}
                required
                autoFocus
              />
            </div>
          )}

          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={loading || (requirePassword && !password)}
          >
            {loading ? "Bezig..." : confirmLabel}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
