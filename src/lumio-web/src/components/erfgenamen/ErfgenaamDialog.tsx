"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { LEGITIMATIE_SOORTEN, RELATIE_TYPES } from "./constants";
import type { ErfgenaamFormData } from "./types";

interface ErfgenaamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ErfgenaamFormData;
  onFormChange: (form: ErfgenaamFormData) => void;
  isEditing: boolean;
  saving: boolean;
  onSave: () => void;
  translations: {
    dialogTitel: (isEdit: boolean) => string;
    voornaam: string;
    achternaam: string;
    tussenvoegsel: string;
    tussenvoegselPlaceholder: string;
    relatie: string;
    relatieSelecteer: string;
    email: string;
    telefoon: string;
    geboortedatum: string;
    bsn: string;
    bsnPlaceholder: string;
    bsnTooltip: string;
    adres: string;
    adresPlaceholder: string;
    postcode: string;
    postcodePlaceholder: string;
    woonplaats: string;
    legitimatie: string;
    documentnummer: string;
    datumAfgifte: string;
    geldigTot: string;
    annuleren: string;
    opslaan: string;
    opslaanBezig: string;
    legitimatieLabel: (key: string) => string;
    relatieLabel: (key: string) => string;
  };
}

export function ErfgenaamDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  isEditing,
  saving,
  onSave,
  translations: t,
}: ErfgenaamDialogProps) {
  const updateField = <K extends keyof ErfgenaamFormData>(
    field: K,
    value: ErfgenaamFormData[K]
  ) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t.dialogTitel(isEditing)}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.voornaam}</Label>
            <Input
              value={form.voornaam}
              onChange={(e) => updateField("voornaam", e.target.value)}
              placeholder={t.voornaam}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.achternaam}</Label>
            <Input
              value={form.achternaam}
              onChange={(e) => updateField("achternaam", e.target.value)}
              placeholder={t.achternaam}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t.tussenvoegsel}</Label>
          <Input
            value={form.tussenvoegsel}
            onChange={(e) => updateField("tussenvoegsel", e.target.value)}
            placeholder={t.tussenvoegselPlaceholder}
          />
        </div>
        <div className="space-y-2">
          <Label>{t.relatie}</Label>
          <Select
            value={form.relatie}
            onChange={(e) => updateField("relatie", e.target.value)}
          >
            <option value="">{t.relatieSelecteer}</option>
            {RELATIE_TYPES.map((rel) => (
              <option key={rel} value={rel}>
                {t.relatieLabel(rel)}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.email}</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.telefoon}</Label>
            <Input
              value={form.telefoon}
              onChange={(e) => updateField("telefoon", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t.geboortedatum}</Label>
          <Input
            type="date"
            value={form.geboortedatum}
            onChange={(e) => updateField("geboortedatum", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t.bsn}</Label> <HelpTooltip tekst={t.bsnTooltip} />
          <Input
            value={form.bsn}
            onChange={(e) => updateField("bsn", e.target.value)}
            placeholder={t.bsnPlaceholder}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>{t.adres}</Label>
            <Input
              value={form.adres}
              onChange={(e) => updateField("adres", e.target.value)}
              placeholder={t.adresPlaceholder}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.postcode}</Label>
            <Input
              value={form.postcode}
              onChange={(e) => updateField("postcode", e.target.value)}
              placeholder={t.postcodePlaceholder}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t.woonplaats}</Label>
          <Input
            value={form.woonplaats}
            onChange={(e) => updateField("woonplaats", e.target.value)}
            placeholder={t.woonplaats}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.legitimatie}</Label>
            <Select
              value={form.legitimatieSoort}
              onChange={(e) => updateField("legitimatieSoort", e.target.value)}
            >
              {LEGITIMATIE_SOORTEN.map((leg) => (
                <option key={leg.value} value={leg.value}>
                  {t.legitimatieLabel(leg.key)}
                </option>
              ))}
            </Select>
          </div>
          {form.legitimatieSoort !== "0" && (
            <div className="space-y-2">
              <Label>{t.documentnummer}</Label>
              <Input
                value={form.legitimatieNummer}
                onChange={(e) => updateField("legitimatieNummer", e.target.value)}
                placeholder={t.documentnummer}
              />
            </div>
          )}
        </div>
        {form.legitimatieSoort !== "0" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.datumAfgifte}</Label>
              <Input
                type="date"
                value={form.legitimatieDatumAfgifte}
                onChange={(e) => updateField("legitimatieDatumAfgifte", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.geldigTot}</Label>
              <Input
                type="date"
                value={form.legitimatieGeldigTot}
                onChange={(e) => updateField("legitimatieGeldigTot", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t.annuleren}
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? t.opslaanBezig : t.opslaan}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
