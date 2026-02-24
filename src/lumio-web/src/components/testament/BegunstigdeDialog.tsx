"use client";

import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonSelect } from "@/components/PersonSelect";
import { useTranslations } from "next-intl";
import type { BegunstigdeFormData } from "./types";

interface BegunstigdeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
  form: BegunstigdeFormData;
  onFormChange: (form: BegunstigdeFormData) => void;
  onSave: () => void;
}

export function BegunstigdeDialog({
  open,
  onOpenChange,
  editId,
  form,
  onFormChange,
  onSave
}: BegunstigdeDialogProps) {
  const t = useTranslations("testament");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{editId ? t("begDialog.bewerken") : t("begDialog.toevoegen")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("begDialog.naam")}</Label>
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
              source="erfgenamen"
              placeholder={t("begDialog.naamPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("begDialog.relatie")}</Label>
            <Input
              value={form.relatie}
              onChange={(e) => onFormChange({ ...form, relatie: e.target.value })}
              placeholder={t("begDialog.relatiePlaceholder")}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("begDialog.telefoon")}</Label>
            <Input
              value={form.telefoon}
              onChange={(e) => onFormChange({ ...form, telefoon: e.target.value })}
              placeholder={t("begDialog.telefoonPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("begDialog.email")}</Label>
            <Input
              value={form.email}
              onChange={(e) => onFormChange({ ...form, email: e.target.value })}
              placeholder={t("begDialog.emailPlaceholder")}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2 col-span-2">
            <Label>{t("begDialog.adres")}</Label>
            <Input
              value={form.adres}
              onChange={(e) => onFormChange({ ...form, adres: e.target.value })}
              placeholder={t("begDialog.adresPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("begDialog.postcode")}</Label>
            <Input
              value={form.postcode}
              onChange={(e) => onFormChange({ ...form, postcode: e.target.value })}
              placeholder={t("begDialog.postcodePlaceholder")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("begDialog.woonplaats")}</Label>
          <Input
            value={form.woonplaats}
            onChange={(e) => onFormChange({ ...form, woonplaats: e.target.value })}
            placeholder={t("begDialog.woonplaatsPlaceholder")}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("begDialog.percentage")}</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={form.percentage}
              onChange={(e) => onFormChange({ ...form, percentage: e.target.value })}
              placeholder={t("begDialog.percentagePlaceholder")}
            />
          </div>
          <div className="flex items-end space-x-2 pb-0.5">
            <input
              type="checkbox"
              id="legitieme-portie"
              checked={form.isLegitiemePortie}
              onChange={(e) => onFormChange({ ...form, isLegitiemePortie: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="legitieme-portie" className="text-sm">{t("begDialog.legitiemePortie")}</Label>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>{t("begDialog.annuleren")}</Button>
        <Button onClick={onSave}>{t("begDialog.opslaan")}</Button>
      </DialogFooter>
    </Dialog>
  );
}
