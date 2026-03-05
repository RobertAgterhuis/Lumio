"use client";

import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ContactSelector } from "@/components/common/ContactSelector";
import { useTranslations } from "next-intl";
import type { TestamentEditFormData } from "./types";

interface TestamentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: TestamentEditFormData;
  onFormChange: (form: TestamentEditFormData) => void;
  onSave: () => void;
  error: string | null;
  onNotarisSelect?: (contactId: string | null) => void;
}

export function TestamentEditDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  error,
  onNotarisSelect
}: TestamentEditDialogProps) {
  const t = useTranslations("testament");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t("testEditDialog.titel")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
        {error && (
          <div className="rounded-lg border border-danger bg-danger-100 dark:bg-danger/20 p-2">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("testEditDialog.typeTestament")}</Label>
            <Input
              value={form.testamentType}
              onChange={(e) => onFormChange({ ...form, testamentType: e.target.value })}
              placeholder={t("testEditDialog.typePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("testEditDialog.datumTestament")}</Label>
            <Input
              type="date"
              value={form.datumTestament}
              onChange={(e) => onFormChange({ ...form, datumTestament: e.target.value })}
            />
          </div>
        </div>
        <ContactSelector
          label={t("testEditDialog.notaris")}
          contactType={0}
          selectedContactId={form.notarisContactId}
          onSelect={(contactId) => {
            onFormChange({ ...form, notarisContactId: contactId });
            onNotarisSelect?.(contactId);
          }}
          required={false}
          showCreateNew={true}
        />
        <div className="space-y-2">
          <Label>{t("testEditDialog.locatie")}</Label>
          <Input
            value={form.testamentLocatie}
            onChange={(e) => onFormChange({ ...form, testamentLocatie: e.target.value })}
            placeholder={t("testEditDialog.locatiePlaceholder")}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("testEditDialog.ctrNummer")}</Label>
            <Input
              value={form.ctr_Nummer}
              onChange={(e) => onFormChange({ ...form, ctr_Nummer: e.target.value })}
              placeholder={t("testEditDialog.ctrPlaceholder")}
            />
          </div>
        </div>
        <Checkbox
          id="uitsluitingsclausule"
          checked={form.uitsluitingsClausule}
          onChange={(e) => onFormChange({ ...form, uitsluitingsClausule: e.target.checked })}
          label={t("testEditDialog.uitsluitingsclausule")}
        />
        <div className="space-y-2">
          <Label>{t("testEditDialog.legaten")}</Label>
          <Textarea
            value={form.legaten}
            onChange={(e) => onFormChange({ ...form, legaten: e.target.value })}
            placeholder={t("testEditDialog.legatenPlaceholder")}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("testEditDialog.algemeneWensen")}</Label>
          <Textarea
            value={form.algemeneWensen}
            onChange={(e) => onFormChange({ ...form, algemeneWensen: e.target.value })}
            placeholder={t("testEditDialog.algemeneWensenPlaceholder")}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("testEditDialog.bijzondereBepalingen")}</Label>
          <Textarea
            value={form.bijzondereBepalingen}
            onChange={(e) => onFormChange({ ...form, bijzondereBepalingen: e.target.value })}
            placeholder={t("testEditDialog.bijzonderePlaceholder")}
            rows={2}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>{t("testEditDialog.annuleren")}</Button>
        <Button onClick={onSave}>{t("testEditDialog.opslaan")}</Button>
      </DialogFooter>
    </Dialog>
  );
}
