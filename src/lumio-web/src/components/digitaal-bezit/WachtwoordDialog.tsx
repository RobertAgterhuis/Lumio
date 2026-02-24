"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PasswordGenerator } from "@/components/PasswordGenerator";
import { useTranslations } from "next-intl";
import type { WachtwoordFormData } from "./types";

interface WachtwoordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode: boolean;
  form: WachtwoordFormData;
  onFormChange: (form: WachtwoordFormData) => void;
  onSave: () => void;
  saving: boolean;
}

export function WachtwoordDialog({
  open,
  onOpenChange,
  editMode,
  form,
  onFormChange,
  onSave,
  saving,
}: WachtwoordDialogProps) {
  const t = useTranslations("digitaalBezit");

  const updateField = <K extends keyof WachtwoordFormData>(
    field: K,
    value: WachtwoordFormData[K]
  ) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          {editMode
            ? t("wachtwoordDialog.bewerken")
            : t("wachtwoordDialog.toevoegen")}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t("wachtwoordDialog.naam")}</Label>
          <Input
            value={form.naam}
            onChange={(e) => updateField("naam", e.target.value)}
            placeholder={t("wachtwoordDialog.naamPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("wachtwoordDialog.gebruikersnaam")}</Label>
          <Input
            value={form.gebruikersnaam}
            onChange={(e) => updateField("gebruikersnaam", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>
            {editMode
              ? t("wachtwoordDialog.nieuwWachtwoord")
              : t("wachtwoordDialog.wachtwoord")}
          </Label>
          <Input
            type="password"
            value={form.wachtwoord}
            onChange={(e) => updateField("wachtwoord", e.target.value)}
            placeholder={
              editMode
                ? t("wachtwoordDialog.nieuwWachtwoordPlaceholder")
                : t("wachtwoordDialog.wachtwoordPlaceholder")
            }
          />
          <PasswordGenerator
            onUse={(pw) => updateField("wachtwoord", pw)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("wachtwoordDialog.url")}</Label>
          <Input
            value={form.url}
            onChange={(e) => updateField("url", e.target.value)}
            placeholder={t("wachtwoordDialog.urlPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("wachtwoordDialog.notities")}</Label>
          <Textarea
            value={form.notities}
            onChange={(e) => updateField("notities", e.target.value)}
            rows={2}
            placeholder={t("wachtwoordDialog.notitiesPlaceholder")}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t("annuleren")}
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? t("opslaanBezig") : t("opslaan")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
