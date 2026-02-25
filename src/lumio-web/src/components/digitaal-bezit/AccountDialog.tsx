"use client";

import { useState } from "react";
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
import { PasswordGenerator } from "@/components/PasswordGenerator";
import { Eye, EyeOff, KeyRound, ChevronDown, ChevronUp } from "lucide-react";
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

  const [showPassword, setShowPassword] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

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
      <div className="overflow-y-auto flex-1 min-h-0 space-y-4 py-4">
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
        {/* Password write-through section */}
        <div className="rounded-md border border-dashed">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setPasswordOpen((v) => !v)}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">{t("accountDialog.wachtwoordOpslaan")}</span>
            {passwordOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {passwordOpen && (
            <div className="space-y-3 border-t px-3 pb-3 pt-3">
              <div className="space-y-2">
                <Label>{t("accountDialog.wachtwoord")}</Label>
                <div className="flex gap-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.wachtwoord}
                    onChange={(e) => updateField("wachtwoord", e.target.value)}
                    placeholder={t("accountDialog.wachtwoordPlaceholder")}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((v) => !v)}
                    title={showPassword ? t("accountDialog.verbergen") : t("accountDialog.tonen")}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <PasswordGenerator onUse={(pw) => updateField("wachtwoord", pw)} />
              </div>
              <div className="space-y-2">
                <Label>{t("accountDialog.wachtwoordOpmerking")}</Label>
                <Input
                  value={form.wachtwoordOpmerking}
                  onChange={(e) => updateField("wachtwoordOpmerking", e.target.value)}
                  placeholder={t("accountDialog.wachtwoordOpmerkingPlaceholder")}
                />
              </div>
            </div>
          )}
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
