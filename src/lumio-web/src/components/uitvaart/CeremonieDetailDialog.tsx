"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { CeremonieDetailFormData } from "./types";

interface CeremonieDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CeremonieDetailFormData;
  onFormChange: (form: CeremonieDetailFormData) => void;
  onSave: () => void;
  isEdit: boolean;
}

export function CeremonieDetailDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  isEdit,
}: CeremonieDetailDialogProps) {
  const t = useTranslations("uitvaart");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          {isEdit ? t("detailDialog.bewerken") : t("detailDialog.toevoegen")}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t("detailDialog.onderdeel")}</Label>
          <Input
            value={form.onderdeel}
            onChange={(e) =>
              onFormChange({ ...form, onderdeel: e.target.value })
            }
            placeholder={t("detailDialog.onderdeelPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("detailDialog.beschrijving")}</Label>
          <Textarea
            value={form.beschrijving}
            onChange={(e) =>
              onFormChange({ ...form, beschrijving: e.target.value })
            }
            placeholder={t("detailDialog.beschrijvingPlaceholder")}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("detailDialog.volgorde")}</Label>
          <Input
            type="number"
            value={form.volgorde}
            onChange={(e) =>
              onFormChange({
                ...form,
                volgorde: parseInt(e.target.value) || 0,
              })
            }
            min={1}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("detailDialog.muziek")}</Label>
          <Input
            value={form.muziek}
            onChange={(e) => onFormChange({ ...form, muziek: e.target.value })}
            placeholder={t("detailDialog.muziekPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("detailDialog.spreker")}</Label>
          <Input
            value={form.spreker}
            onChange={(e) => onFormChange({ ...form, spreker: e.target.value })}
            placeholder={t("detailDialog.sprekerPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("detailDialog.tekstlezing")}</Label>
          <Input
            value={form.tekstlezing}
            onChange={(e) =>
              onFormChange({ ...form, tekstlezing: e.target.value })
            }
            placeholder={t("detailDialog.tekstlezingPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("detailDialog.dresscode")}</Label>
          <Input
            value={form.dresscode}
            onChange={(e) =>
              onFormChange({ ...form, dresscode: e.target.value })
            }
            placeholder={t("detailDialog.dresscodePlaceholder")}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t("annuleren")}
        </Button>
        <Button onClick={onSave}>{t("opslaan")}</Button>
      </DialogFooter>
    </Dialog>
  );
}
