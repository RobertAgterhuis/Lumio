"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Clock, LogOut } from "lucide-react";

export interface SessionTimeoutWarningProps {
  /** Whether the dialog is visible */
  open: boolean;
  /** Seconds remaining before auto-lock */
  secondsLeft: number;
  /** Callback to dismiss/extend the session */
  onDismiss: () => void;
  /** Callback when user chooses to lock now */
  onLock?: () => void;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Dismiss button label */
  dismissLabel?: string;
  /** Lock button label */
  lockLabel?: string;
}

export function SessionTimeoutWarning({
  open,
  secondsLeft,
  onDismiss,
  onLock,
  title = "Sessie verloopt",
  description = "Uw sessie wordt automatisch vergrendeld vanwege inactiviteit.",
  dismissLabel = "Doorgaan",
  lockLabel = "Nu vergrendelen",
}: SessionTimeoutWarningProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onDismiss()}>
      <DialogHeader>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 text-warning">
          <Clock className="h-6 w-6" />
        </div>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <div className="my-4 flex justify-center">
        <span
          className={cn(
            "rounded-lg bg-muted px-6 py-3 text-3xl font-mono font-bold tabular-nums text-foreground",
            secondsLeft <= 30 && "text-danger"
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {timeDisplay}
        </span>
      </div>

      <DialogFooter>
        {onLock && (
          <Button type="button" variant="outline" onClick={onLock}>
            <LogOut className="mr-2 h-4 w-4" />
            {lockLabel}
          </Button>
        )}
        <Button type="button" onClick={onDismiss} autoFocus>
          {dismissLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
