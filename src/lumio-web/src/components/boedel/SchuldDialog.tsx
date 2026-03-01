"use client";

import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PersonSelect } from "@/components/PersonSelect";
import { useTranslations } from "next-intl";
import type { SchuldFormData } from "./types";

interface SchuldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
  form: SchuldFormData;
  onFormChange: (form: SchuldFormData) => void;
  onSave: () => void;
  saving: boolean;
}

export function SchuldDialog({
  open,
  onOpenChange,
  editId,
  form,
  onFormChange,
  onSave,
  saving,
}: SchuldDialogProps) {
  const t = useTranslations("boedel");
  const tEnum = useTranslations("enums");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{editId ? t("schuldDialog.bewerken") : t("schuldDialog.toevoegen")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t("schuldDialog.schuldeiser")}</Label>
          {/* M2-2: PersonSelect allows picking from noodcontacten (e.g. Notaris, Bank) to pre-fill contact fields */}
          <PersonSelect
            source="noodcontacten"
            value={form.schuldeiser}
            onChange={(v) => onFormChange({ ...form, schuldeiser: v })}
            onPersonSelect={(p) =>
              onFormChange({
                ...form,
                schuldeiser: p.naam,
                schuldeiserTelefoon: p.telefoon || form.schuldeiserTelefoon,
                schuldeiserEmail: p.email || form.schuldeiserEmail,
              })
            }
            onClear={() =>
              onFormChange({
                ...form,
                schuldeiser: "",
                schuldeiserTelefoon: "",
                schuldeiserEmail: "",
              })
            }
            placeholder={t("schuldDialog.schuldeiserPlaceholder")}
            showCreateNew
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("schuldDialog.telefoon")}</Label>
            <Input
              value={form.schuldeiserTelefoon}
              onChange={(e) => onFormChange({ ...form, schuldeiserTelefoon: e.target.value })}
              placeholder={t("schuldDialog.telefoonPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("schuldDialog.email")}</Label>
            <Input
              type="email"
              value={form.schuldeiserEmail}
              onChange={(e) => onFormChange({ ...form, schuldeiserEmail: e.target.value })}
              placeholder={t("schuldDialog.emailPlaceholder")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("schuldDialog.type")}</Label>
          <Select value={form.type} onChange={(e) => onFormChange({ ...form, type: e.target.value })}>
            <option value="">{tEnum("schuldType.selecteer")}</option>
            <option value="Hypotheek">{tEnum("schuldType.hypotheek")}</option>
            <option value="Persoonlijke lening">{tEnum("schuldType.persoonlijkeLening")}</option>
            <option value="Studielening">{tEnum("schuldType.studielening")}</option>
            <option value="Creditcard">{tEnum("schuldType.creditcard")}</option>
            <option value="Zakelijke lening">{tEnum("schuldType.zakelijkeLening")}</option>
            <option value="Overig">{tEnum("schuldType.overig")}</option>
          </Select>
        </div>
        {form.type === "Hypotheek" && (
          <div className="rounded-lg border border-info bg-info-100 dark:bg-info/20 p-3 space-y-4">
            <p className="text-xs font-medium text-info">{t("schuldDialog.hypotheekDetails")}</p>
            <div className="space-y-2">
              <Label>{t("schuldDialog.hypotheekVorm")}</Label>
              <Select value={form.hypotheekVorm} onChange={(e) => onFormChange({ ...form, hypotheekVorm: e.target.value })}>
                <option value="">{tEnum("hypotheekVorm.selecteer")}</option>
                <option value="Aflossingsvrij">{tEnum("hypotheekVorm.aflossingsvrij")}</option>
                <option value="Lineair">{tEnum("hypotheekVorm.lineair")}</option>
                <option value="Annuïteit">{tEnum("hypotheekVorm.annuitair")}</option>
                <option value="Spaarhypotheek">{tEnum("hypotheekVorm.spaarhypotheek")}</option>
                <option value="Beleggingshypotheek">{tEnum("hypotheekVorm.beleggingshypotheek")}</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>{t("schuldDialog.rentepercentage")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.rentepercentage}
                  onChange={(e) => onFormChange({ ...form, rentepercentage: e.target.value })}
                  placeholder="bijv. 3.5"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("schuldDialog.maandelijkseRente")}</Label>
                <Input
                  type="number"
                  value={form.maandelijkseRente}
                  onChange={(e) => onFormChange({ ...form, maandelijkseRente: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>{t("schuldDialog.einddatum")}</Label>
                <Input
                  type="date"
                  value={form.einddatum}
                  onChange={(e) => onFormChange({ ...form, einddatum: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("schuldDialog.restschuld")}</Label>
                <Input
                  type="number"
                  value={form.restschuld}
                  onChange={(e) => onFormChange({ ...form, restschuld: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label>{t("schuldDialog.bedrag")}</Label>
          <Input
            type="number"
            value={form.bedrag}
            onChange={(e) => onFormChange({ ...form, bedrag: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("schuldDialog.maandelijkseAflossing")}</Label>
          <Input
            type="number"
            value={form.maandelijkseAflossing}
            onChange={(e) => onFormChange({ ...form, maandelijkseAflossing: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("schuldDialog.referentie")}</Label>
          <Input
            value={form.referentie}
            onChange={(e) => onFormChange({ ...form, referentie: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("schuldDialog.vermogensSoort")}</Label>
          <Select value={form.vermogensSoort} onChange={(e) => onFormChange({ ...form, vermogensSoort: e.target.value })}>
            <option value="0">{tEnum("vermogensSoort.prive")}</option>
            <option value="1">{tEnum("vermogensSoort.gemeenschap")}</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("schuldDialog.notities")}</Label>
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
