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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PersonSelect } from "@/components/PersonSelect";
import { useTranslations } from "next-intl";
import type { AccountFormData } from "./types";
import { ACCOUNT_CATEGORIEEN, CATEGORIE_KEYS } from "./constants";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode: boolean;
  form: AccountFormData;
  onFormChange: (form: AccountFormData) => void;
  onSave: () => void;
  saving: boolean;
}

export function AccountDialog({
  open,
  onOpenChange,
  editMode,
  form,
  onFormChange,
  onSave,
  saving,
}: AccountDialogProps) {
  const t = useTranslations("digitaalBezit");
  const tEnum = useTranslations("enums");

  const updateField = <K extends keyof AccountFormData>(
    field: K,
    value: AccountFormData[K]
  ) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          {editMode ? t("accountDialog.bewerken") : t("accountDialog.toevoegen")}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t("accountDialog.platformNaam")}</Label>
          <Input
            value={form.platformNaam}
            onChange={(e) => updateField("platformNaam", e.target.value)}
            placeholder={t("accountDialog.platformPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("accountDialog.categorie")}</Label>
          <Select
            value={form.categorie}
            onChange={(e) => updateField("categorie", e.target.value)}
          >
            <option value="">{tEnum("accountCategorie.selecteer")}</option>
            {ACCOUNT_CATEGORIEEN.map((cat) => (
              <option key={cat} value={cat}>
                {tEnum(`accountCategorie.${CATEGORIE_KEYS[cat]}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("accountDialog.gebruikersnaam")}</Label>
          <Input
            value={form.gebruikersnaam}
            onChange={(e) => updateField("gebruikersnaam", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("accountDialog.email")}</Label>
          <Input
            type="email"
            value={form.emailAdres}
            onChange={(e) => updateField("emailAdres", e.target.value)}
            placeholder={t("accountDialog.emailPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("accountDialog.url")}</Label>
          <Input
            value={form.url}
            onChange={(e) => updateField("url", e.target.value)}
            placeholder={t("accountDialog.urlPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("accountDialog.gewensteActie")}</Label>
          <Select
            value={form.gewensteActie}
            onChange={(e) => updateField("gewensteActie", e.target.value)}
          >
            <option value="">{tEnum("gewensteActie.selecteer")}</option>
            <option value="Verwijderen">{tEnum("gewensteActie.verwijderen")}</option>
            <option value="Herdenkingsstatus">{tEnum("gewensteActie.herdenkingsstatus")}</option>
            <option value="Overdragen">{tEnum("gewensteActie.overdragen")}</option>
            <option value="Geen actie">{tEnum("gewensteActie.geenActie")}</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("accountDialog.overdrachtAan")}</Label>
          <PersonSelect
            value={form.overdrachtAan}
            onChange={(v) => updateField("overdrachtAan", v)}
            source="erfgenamen"
            placeholder={t("accountDialog.overdrachtPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("accountDialog.notities")}</Label>
          <Textarea
            value={form.notities}
            onChange={(e) => updateField("notities", e.target.value)}
            rows={2}
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
