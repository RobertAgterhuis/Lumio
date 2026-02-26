"use client";

import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PersonSelect } from "@/components/PersonSelect";
import { useTranslations } from "next-intl";
import type { VerzekeringFormData } from "./types";

interface VerzekeringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
  form: VerzekeringFormData;
  onFormChange: (form: VerzekeringFormData) => void;
  onSave: () => void;
  saving: boolean;
}

export function VerzekeringDialog({
  open,
  onOpenChange,
  editId,
  form,
  onFormChange,
  onSave,
  saving,
}: VerzekeringDialogProps) {
  const t = useTranslations("boedel");
  const tEnum = useTranslations("enums");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{editId ? t("verzekerDialog.bewerken") : t("verzekerDialog.toevoegen")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t("verzekerDialog.verzekeraar")}</Label>
          <Input
            value={form.verzekeraar}
            onChange={(e) => onFormChange({ ...form, verzekeraar: e.target.value })}
            placeholder={t("verzekerDialog.verzekeraarPlaceholder")}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("verzekerDialog.telefoon")}</Label>
            <Input
              value={form.verzekeraarTelefoon}
              onChange={(e) => onFormChange({ ...form, verzekeraarTelefoon: e.target.value })}
              placeholder={t("verzekerDialog.telefoonPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("verzekerDialog.email")}</Label>
            <Input
              type="email"
              value={form.verzekeraarEmail}
              onChange={(e) => onFormChange({ ...form, verzekeraarEmail: e.target.value })}
              placeholder={t("verzekerDialog.emailPlaceholder")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("verzekerDialog.type")}</Label>
          <Select value={form.type} onChange={(e) => onFormChange({ ...form, type: e.target.value })}>
            <option value="">{tEnum("verzekeringsType.selecteer")}</option>
            <option value="Levensverzekering">{tEnum("verzekeringsType.levensverzekering")}</option>
            <option value="Uitvaartverzekering">{tEnum("verzekeringsType.uitvaartverzekering")}</option>
            <option value="Overlijdensrisicoverzekering">{tEnum("verzekeringsType.overlijdensrisicoverzekering")}</option>
            <option value="Woonverzekering">{tEnum("verzekeringsType.woonverzekering")}</option>
            <option value="Autoverzekering">{tEnum("verzekeringsType.autoverzekering")}</option>
            <option value="Zorgverzekering">{tEnum("verzekeringsType.zorgverzekering")}</option>
            <option value="Overig">{tEnum("verzekeringsType.overig")}</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("verzekerDialog.polisNummer")}</Label>
          <Input
            value={form.polisNummer}
            onChange={(e) => onFormChange({ ...form, polisNummer: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("verzekerDialog.verzekerdBedrag")}</Label>
          <Input
            type="number"
            value={form.verzekerdBedrag}
            onChange={(e) => onFormChange({ ...form, verzekerdBedrag: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("verzekerDialog.begunstigde")}</Label>
          <PersonSelect
            value={form.begunstigde}
            onChange={(v) => onFormChange({ ...form, begunstigde: v })}
            onIdChange={(id) => onFormChange({ ...form, begunstigdeErfgenaamId: id ?? "" })}
            source="erfgenamen"
          />
        </div>
        <div className="space-y-2">
          <Label>{t("verzekerDialog.vermogensSoort")}</Label>
          <Select value={form.vermogensSoort} onChange={(e) => onFormChange({ ...form, vermogensSoort: e.target.value })}>
            <option value="0">{tEnum("vermogensSoort.prive")}</option>
            <option value="1">{tEnum("vermogensSoort.gemeenschap")}</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("verzekerDialog.notities")}</Label>
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
