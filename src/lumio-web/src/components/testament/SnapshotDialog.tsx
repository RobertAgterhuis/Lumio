"use client";

import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

interface SnapshotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notitie: string;
  onNotitieChange: (notitie: string) => void;
  onSave: () => void;
  error: string | null;
}

export function SnapshotDialog({
  open,
  onOpenChange,
  notitie,
  onNotitieChange,
  onSave,
  error
}: SnapshotDialogProps) {
  const t = useTranslations("testament");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t("snapDialog.titel")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <p className="text-sm text-muted-foreground">
          {t("snapDialog.beschrijving")}
        </p>
        {error && (
          <div className="rounded-lg border border-danger bg-danger-100 dark:bg-danger/20 p-2">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}
        <div className="space-y-2">
          <Label>{t("snapDialog.notitie")}</Label>
          <Textarea
            value={notitie}
            onChange={(e) => onNotitieChange(e.target.value)}
            placeholder={t("snapDialog.notitiePlaceholder")}
            rows={2}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>{t("snapDialog.annuleren")}</Button>
        <Button onClick={onSave}>{t("snapDialog.opslaan")}</Button>
      </DialogFooter>
    </Dialog>
  );
}
