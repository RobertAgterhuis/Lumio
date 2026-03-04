"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("idle");
  const tc = useTranslations("common");

  return (
    <Dialog open={open} onOpenChange={() => onDismiss()}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-warning animate-pulse" />
          {t("sessieVerloopt")}
        </DialogTitle>
        <DialogDescription>
          {t("sessieWaarschuwing", { seconds: secondsLeft })}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={onDismiss}>{tc("actiefBlijven")}</Button>
      </DialogFooter>
    </Dialog>
  );
}
