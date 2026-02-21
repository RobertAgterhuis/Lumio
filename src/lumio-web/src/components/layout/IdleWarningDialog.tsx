"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Timer } from "lucide-react";

interface IdleWarningDialogProps {
  open: boolean;
  secondsLeft: number;
  onDismiss: () => void;
}

export function IdleWarningDialog({
  open,
  secondsLeft,
  onDismiss,
}: IdleWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => onDismiss()}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-warning" />
          Sessie verloopt
        </DialogTitle>
        <DialogDescription>
          Uw sessie wordt over{" "}
          <span className="font-semibold text-foreground">{secondsLeft}</span>{" "}
          seconden automatisch vergrendeld wegens inactiviteit.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={onDismiss}>Actief blijven</Button>
      </DialogFooter>
    </Dialog>
  );
}
