"use client";

import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import type { RekeningFormData } from "./types";

interface RekeningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
  form: RekeningFormData;
  onFormChange: (form: RekeningFormData) => void;
  onSave: () => void;
  saving: boolean;
}

export function RekeningDialog({
  open,
  onOpenChange,
  editId,
  form,
  onFormChange,
  onSave,
  saving,
}: RekeningDialogProps) {
  const t = useTranslations("boedel");
  const tEnum = useTranslations("enums");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{editId ? t("rekeningDialog.bewerken") : t("rekeningDialog.toevoegen")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t("rekeningDialog.bank")}</Label>
          <Input
            value={form.bankNaam}
            onChange={(e) => onFormChange({ ...form, bankNaam: e.target.value })}
            placeholder={t("rekeningDialog.bankPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("rekeningDialog.type")}</Label>
          <Select value={form.rekeningType} onChange={(e) => onFormChange({ ...form, rekeningType: e.target.value })}>
            <option value="">{tEnum("rekeningType.selecteer")}</option>
            <option value="Betaalrekening">{tEnum("rekeningType.betaalrekening")}</option>
            <option value="Spaarrekening">{tEnum("rekeningType.spaarrekening")}</option>
            <option value="Beleggingsrekening">{tEnum("rekeningType.beleggingsrekening")}</option>
            <option value="Deposito">{tEnum("rekeningType.deposito")}</option>
            <option value="Overig">{tEnum("rekeningType.overig")}</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("rekeningDialog.iban")}</Label>
          <Input
            value={form.iban}
            onChange={(e) => onFormChange({ ...form, iban: e.target.value })}
            placeholder={t("rekeningDialog.ibanPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("rekeningDialog.saldo")}</Label>
          <Input
            type="number"
            value={form.saldo}
            onChange={(e) => onFormChange({ ...form, saldo: e.target.value })}
            placeholder={t("rekeningDialog.saldoPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("rekeningDialog.vermogensSoort")}</Label>
          <Select value={form.vermogensSoort} onChange={(e) => onFormChange({ ...form, vermogensSoort: e.target.value })}>
            <option value="0">{tEnum("vermogensSoort.prive")}</option>
            <option value="1">{tEnum("vermogensSoort.gemeenschap")}</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("rekeningDialog.notities")}</Label>
          <Textarea
            value={form.notities}
            onChange={(e) => onFormChange({ ...form, notities: e.target.value })}
            rows={2}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>{t("annuleren")}</Button>
        <Button onClick={onSave} disabled={saving}>{saving ? t("opslaanBezig") : t("opslaan")}</Button>
      </DialogFooter>
    </Dialog>
  );
}
