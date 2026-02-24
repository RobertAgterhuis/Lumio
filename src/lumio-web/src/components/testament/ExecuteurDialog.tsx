"use client";

import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonSelect } from "@/components/PersonSelect";
import { useTranslations } from "next-intl";
import type { ExecuteurFormData } from "./types";

interface ExecuteurDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
  form: ExecuteurFormData;
  onFormChange: (form: ExecuteurFormData) => void;
  onSave: () => void;
}

export function ExecuteurDialog({
  open,
  onOpenChange,
  editId,
  form,
  onFormChange,
  onSave
}: ExecuteurDialogProps) {
  const t = useTranslations("testament");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{editId ? t("execDialog.bewerken") : t("execDialog.toevoegen")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t("execDialog.naam")}</Label>
          <PersonSelect
            value={form.naam}
            onChange={(v) => onFormChange({ ...form, naam: v })}
            onPersonSelect={(p) => onFormChange({
              ...form,
              naam: p.naam,
              relatie: p.relatie ?? form.relatie,
              telefoon: p.telefoon ?? form.telefoon,
              email: p.email ?? form.email,
              adres: p.adres ?? form.adres,
              postcode: p.postcode ?? form.postcode,
              woonplaats: p.woonplaats ?? form.woonplaats
            })}
            source="both"
            placeholder={t("execDialog.naamPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("execDialog.relatie")}</Label>
          <Input
            value={form.relatie}
            onChange={(e) => onFormChange({ ...form, relatie: e.target.value })}
            placeholder={t("execDialog.relatiePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("execDialog.telefoon")}</Label>
          <Input
            value={form.telefoon}
            onChange={(e) => onFormChange({ ...form, telefoon: e.target.value })}
            placeholder={t("execDialog.telefoonPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("execDialog.email")}</Label>
          <Input
            value={form.email}
            onChange={(e) => onFormChange({ ...form, email: e.target.value })}
            placeholder={t("execDialog.emailPlaceholder")}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2 col-span-2">
            <Label>{t("execDialog.adres")}</Label>
            <Input
              value={form.adres}
              onChange={(e) => onFormChange({ ...form, adres: e.target.value })}
              placeholder={t("execDialog.adresPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("execDialog.postcode")}</Label>
            <Input
              value={form.postcode}
              onChange={(e) => onFormChange({ ...form, postcode: e.target.value })}
              placeholder={t("execDialog.postcodePlaceholder")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("execDialog.woonplaats")}</Label>
          <Input
            value={form.woonplaats}
            onChange={(e) => onFormChange({ ...form, woonplaats: e.target.value })}
            placeholder={t("execDialog.woonplaatsPlaceholder")}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>{t("execDialog.annuleren")}</Button>
        <Button onClick={onSave}>{t("execDialog.opslaan")}</Button>
      </DialogFooter>
    </Dialog>
  );
}
