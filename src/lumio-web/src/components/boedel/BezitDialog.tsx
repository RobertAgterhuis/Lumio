"use client";

import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { PersonSelect } from "@/components/PersonSelect";
import { useTranslations } from "next-intl";
import type { BezitFormData } from "./types";

interface BezitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
  form: BezitFormData;
  onFormChange: (form: BezitFormData) => void;
  onSave: () => void;
  saving: boolean;
}

export function BezitDialog({
  open,
  onOpenChange,
  editId,
  form,
  onFormChange,
  onSave,
  saving,
}: BezitDialogProps) {
  const t = useTranslations("boedel");
  const tEnum = useTranslations("enums");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{editId ? t("bezitDialog.bewerken") : t("bezitDialog.toevoegen")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t("bezitDialog.categorie")}</Label>
          <Select value={form.categorie} onChange={(e) => onFormChange({ ...form, categorie: e.target.value })}>
            <option value="">{tEnum("bezitCategorie.selecteer")}</option>
            <option value="Onroerend goed">{tEnum("bezitCategorie.onroerendGoed")}</option>
            <option value="Voertuig">{tEnum("bezitCategorie.voertuig")}</option>
            <option value="Sieraden">{tEnum("bezitCategorie.sieraden")}</option>
            <option value="Kunst">{tEnum("bezitCategorie.kunst")}</option>
            <option value="Elektronica">{tEnum("bezitCategorie.elektronica")}</option>
            <option value="Meubels">{tEnum("bezitCategorie.meubels")}</option>
            <option value="Overig">{tEnum("bezitCategorie.overig")}</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("bezitDialog.omschrijving")}</Label>
          <Input
            value={form.omschrijving}
            onChange={(e) => onFormChange({ ...form, omschrijving: e.target.value })}
            placeholder={t("bezitDialog.omschrijvingPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("bezitDialog.geschatteWaarde")}</Label>
          <Input
            type="number"
            value={form.geschatteWaarde}
            onChange={(e) => onFormChange({ ...form, geschatteWaarde: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("bezitDialog.locatie")}</Label>
          <Input
            value={form.locatie}
            onChange={(e) => onFormChange({ ...form, locatie: e.target.value })}
            placeholder={t("bezitDialog.locatiePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("bezitDialog.bestemdeErfgenaam")}</Label>
          <PersonSelect
            value={form.bestemdeErfgenaam}
            onChange={(v) => onFormChange({ ...form, bestemdeErfgenaam: v })}
            source="erfgenamen"
            placeholder={t("bezitDialog.bestemdeErfgenaamPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("bezitDialog.vermogensSoort")}</Label>
          <HelpTooltip tekst={t("bezitDialog.vermogensSoortTooltip")} />
          <Select value={form.vermogensSoort} onChange={(e) => onFormChange({ ...form, vermogensSoort: e.target.value })}>
            <option value="0">{tEnum("vermogensSoort.prive")}</option>
            <option value="1">{tEnum("vermogensSoort.gemeenschap")}</option>
          </Select>
        </div>
        {/* P-S3: Registerreferenties */}
        {(form.categorie === "Onroerend goed" || form.kadastraalNummer) && (
          <div className="space-y-2">
            <Label>{t("bezitDialog.kadastraalNummer")}</Label>
            <Input
              value={form.kadastraalNummer}
              onChange={(e) => onFormChange({ ...form, kadastraalNummer: e.target.value })}
              placeholder={t("bezitDialog.kadastraalPlaceholder")}
            />
          </div>
        )}
        {(form.categorie === "Voertuig" || form.kenteken) && (
          <div className="space-y-2">
            <Label>{t("bezitDialog.kenteken")}</Label>
            <Input
              value={form.kenteken}
              onChange={(e) => onFormChange({ ...form, kenteken: e.target.value })}
              placeholder={t("bezitDialog.kentekenPlaceholder")}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>{t("bezitDialog.kvkNummer")}</Label>
          <Input
            value={form.kvKNummer}
            onChange={(e) => onFormChange({ ...form, kvKNummer: e.target.value })}
            placeholder={t("bezitDialog.kvkPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("bezitDialog.notities")}</Label>
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
