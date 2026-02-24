"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ENTITY_TYPE_KEYS } from "./constants";
import type { AssetItem, Erfgenaam, ToewijzingFormData } from "./types";

interface ToewijzingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ToewijzingFormData;
  onFormChange: (form: ToewijzingFormData) => void;
  erfgenamen: Erfgenaam[];
  filteredAssets: AssetItem[];
  saving: boolean;
  onSave: () => void;
  displayName: (e: Erfgenaam) => string;
  translations: {
    titel: string;
    beschrijving: string;
    erfgenaam: string;
    erfgenaamSelecteer: string;
    typeBezit: string;
    alleTypes: string;
    bezit: string;
    bezitSelecteer: string;
    instructies: string;
    instructiesPlaceholder: string;
    annuleren: string;
    opslaanBezig: string;
    toewijzen: string;
    entityType: (key: string) => string;
  };
}

export function ToewijzingDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  erfgenamen,
  filteredAssets,
  saving,
  onSave,
  displayName,
  translations: t,
}: ToewijzingDialogProps) {
  const updateField = <K extends keyof ToewijzingFormData>(
    field: K,
    value: ToewijzingFormData[K]
  ) => {
    onFormChange({ ...form, [field]: value });
  };

  const handleAssetChange = (entityId: string) => {
    const selectedAsset = filteredAssets.find((a) => a.id === entityId);
    onFormChange({
      ...form,
      entityId,
      entityType: selectedAsset?.type ?? form.entityType,
    });
  };

  const isValid = form.erfgenaamId && form.entityType && form.entityId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t.titel}</DialogTitle>
        <DialogDescription>{t.beschrijving}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>{t.erfgenaam}</Label>
          <Select
            value={form.erfgenaamId}
            onChange={(e) => updateField("erfgenaamId", e.target.value)}
          >
            <option value="">{t.erfgenaamSelecteer}</option>
            {erfgenamen.map((e) => (
              <option key={e.id} value={e.id}>
                {displayName(e)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t.typeBezit}</Label>
          <Select
            value={form.entityType}
            onChange={(e) =>
              onFormChange({ ...form, entityType: e.target.value, entityId: "" })
            }
          >
            <option value="">{t.alleTypes}</option>
            {ENTITY_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {t.entityType(key)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t.bezit}</Label>
          <Select
            value={form.entityId}
            onChange={(e) => handleAssetChange(e.target.value)}
          >
            <option value="">{t.bezitSelecteer}</option>
            {filteredAssets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.naam} ({t.entityType(a.type)})
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t.instructies}</Label>
          <Textarea
            value={form.instructies}
            onChange={(e) => updateField("instructies", e.target.value)}
            placeholder={t.instructiesPlaceholder}
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t.annuleren}
        </Button>
        <Button onClick={onSave} disabled={saving || !isValid}>
          {saving ? t.opslaanBezig : t.toewijzen}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
