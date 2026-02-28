"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PersonSelect } from "@/components/PersonSelect";
import type { GenodigdeFormData } from "./types";

interface GenodigdeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: GenodigdeFormData;
  onFormChange: (form: GenodigdeFormData) => void;
  onSave: () => void;
  isEdit: boolean;
  error: string | null;
}

export function GenodigdeDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  isEdit,
  error,
}: GenodigdeDialogProps) {
  const t = useTranslations("uitvaart");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          {isEdit
            ? t("genodigdeDialog.bewerken")
            : t("genodigdeDialog.toevoegen")}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("genodigdeDialog.naam")}</Label>
            <PersonSelect
              source="both"
              value={form.naam}
              onChange={(v) => onFormChange({ ...form, naam: v })}
              onPersonSelect={(p) =>
                onFormChange({
                  ...form,
                  naam: p.naam,
                  relatie: p.relatie || form.relatie,
                  telefoon: p.telefoon || form.telefoon,
                  email: p.email || form.email,
                  adres: p.adres || form.adres,
                  postcode: p.postcode || form.postcode,
                  woonplaats: p.woonplaats || form.woonplaats,
                  erfgenaamId: p.erfgenaamId,
                  noodcontactId: p.noodcontactId,
                })
              }
              onClear={() =>
                onFormChange({
                  ...form,
                  naam: "",
                  relatie: "",
                  telefoon: "",
                  email: "",
                  adres: "",
                  postcode: "",
                  woonplaats: "",
                  erfgenaamId: undefined,
                  noodcontactId: undefined,
                })
              }
              placeholder={t("genodigdeDialog.naamPlaceholder")}
              showCreateNew
            />
          </div>
          <div className="space-y-2">
            <Label>{t("genodigdeDialog.relatie")}</Label>
            <Input
              value={form.relatie}
              onChange={(e) => onFormChange({ ...form, relatie: e.target.value })}
              placeholder={t("genodigdeDialog.relatiePlaceholder")}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("genodigdeDialog.telefoon")}</Label>
            <Input
              type="tel"
              value={form.telefoon}
              onChange={(e) =>
                onFormChange({ ...form, telefoon: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("genodigdeDialog.email")}</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => onFormChange({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("genodigdeDialog.adres")}</Label>
          <Input
            value={form.adres}
            onChange={(e) => onFormChange({ ...form, adres: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("genodigdeDialog.postcode")}</Label>
            <Input
              value={form.postcode}
              onChange={(e) =>
                onFormChange({ ...form, postcode: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("genodigdeDialog.woonplaats")}</Label>
            <Input
              value={form.woonplaats}
              onChange={(e) =>
                onFormChange({ ...form, woonplaats: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("genodigdeDialog.notities")}</Label>
          <Textarea
            value={form.notities}
            onChange={(e) => onFormChange({ ...form, notities: e.target.value })}
            rows={2}
            placeholder={t("genodigdeDialog.notitiesPlaceholder")}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t("annuleren")}
        </Button>
        <Button onClick={onSave}>{t("opslaan")}</Button>
      </DialogFooter>
    </Dialog>
  );
}
