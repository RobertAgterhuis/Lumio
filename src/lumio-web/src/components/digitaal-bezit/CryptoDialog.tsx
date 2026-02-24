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
import { useTranslations } from "next-intl";
import type { CryptoFormData } from "./types";
import { CRYPTO_TYPES } from "./constants";

interface CryptoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode: boolean;
  form: CryptoFormData;
  onFormChange: (form: CryptoFormData) => void;
  onSave: () => void;
  saving: boolean;
}

export function CryptoDialog({
  open,
  onOpenChange,
  editMode,
  form,
  onFormChange,
  onSave,
  saving,
}: CryptoDialogProps) {
  const t = useTranslations("digitaalBezit");
  const tEnum = useTranslations("enums");

  const updateField = <K extends keyof CryptoFormData>(
    field: K,
    value: CryptoFormData[K]
  ) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          {editMode ? t("cryptoDialog.bewerken") : t("cryptoDialog.toevoegen")}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t("cryptoDialog.walletNaam")}</Label>
          <Input
            value={form.walletNaam}
            onChange={(e) => updateField("walletNaam", e.target.value)}
            placeholder={t("cryptoDialog.walletPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("cryptoDialog.cryptoType")}</Label>
          <Select
            value={form.cryptoType}
            onChange={(e) => updateField("cryptoType", e.target.value)}
          >
            <option value="">{tEnum("cryptoType.selecteer")}</option>
            {CRYPTO_TYPES.map((type) => (
              <option key={type} value={type}>
                {tEnum(`cryptoType.${type.toLowerCase()}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("cryptoDialog.walletAdres")}</Label>
          <Input
            value={form.walletAdres}
            onChange={(e) => updateField("walletAdres", e.target.value)}
            placeholder={t("cryptoDialog.walletAdresPlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("cryptoDialog.exchange")}</Label>
          <Input
            value={form.exchange}
            onChange={(e) => updateField("exchange", e.target.value)}
            placeholder={t("cryptoDialog.exchangePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("cryptoDialog.seedPhrase")}</Label>
          <Textarea
            value={form.seedPhrase}
            onChange={(e) => updateField("seedPhrase", e.target.value)}
            placeholder={t("cryptoDialog.seedPhrasePlaceholder")}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {t("cryptoDialog.seedPhraseInfo")}
          </p>
        </div>
        <div className="space-y-2">
          <Label>{t("cryptoDialog.notities")}</Label>
          <Textarea
            value={form.notities}
            onChange={(e) => updateField("notities", e.target.value)}
            rows={2}
            placeholder={t("cryptoDialog.notitiesPlaceholder")}
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
