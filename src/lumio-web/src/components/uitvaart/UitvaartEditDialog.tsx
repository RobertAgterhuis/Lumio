"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PersonSelect } from "@/components/PersonSelect";
import type { UitvaartEditFormData } from "./types";

interface UitvaartEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UitvaartEditFormData;
  onFormChange: (form: UitvaartEditFormData) => void;
  onSave: () => void;
  error: string | null;
}

export function UitvaartEditDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  error,
}: UitvaartEditDialogProps) {
  const t = useTranslations("uitvaart");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{t("editDialog.titel")}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
        {error && (
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Uitvaart Section */}
        <p className="text-sm font-medium text-muted-foreground">
          {t("editDialog.sectieUitvaart")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("editDialog.type")}</Label>
            <Input
              value={form.voorkeurType}
              onChange={(e) =>
                onFormChange({ ...form, voorkeurType: e.target.value })
              }
              placeholder={t("editDialog.typePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.budget")}</Label>
            <Input
              value={form.budgetRichting}
              onChange={(e) =>
                onFormChange({ ...form, budgetRichting: e.target.value })
              }
              placeholder={t("editDialog.budgetPlaceholder")}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("editDialog.ondernemer")}</Label>
            <PersonSelect
              source={{ noodcontactRol: "Uitvaartondernemer" }}
              value={form.uitvaartOndernemer}
              onChange={(v) =>
                onFormChange({ ...form, uitvaartOndernemer: v })
              }
              onPersonSelect={(p) =>
                onFormChange({
                  ...form,
                  uitvaartOndernemerTelefoon:
                    p.telefoon || form.uitvaartOndernemerTelefoon,
                  uitvaartOndernemerEmail:
                    p.email || form.uitvaartOndernemerEmail,
                  uitvaartOndernemerAdres:
                    p.adres || form.uitvaartOndernemerAdres,
                  uitvaartOndernemerPostcode:
                    p.postcode || form.uitvaartOndernemerPostcode,
                  uitvaartOndernemerPlaats:
                    p.woonplaats || form.uitvaartOndernemerPlaats,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.telOndernemer")}</Label>
            <Input
              value={form.uitvaartOndernemerTelefoon}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  uitvaartOndernemerTelefoon: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("editDialog.emailOndernemer")}</Label>
            <Input
              value={form.uitvaartOndernemerEmail}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  uitvaartOndernemerEmail: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.kleding")}</Label>
            <Input
              value={form.kledingwensen}
              onChange={(e) =>
                onFormChange({ ...form, kledingwensen: e.target.value })
              }
            />
          </div>
        </div>
        <Checkbox
          id="verzekering"
          checked={form.heeftUitvaartVerzekering}
          onChange={(e) =>
            onFormChange({
              ...form,
              heeftUitvaartVerzekering: e.target.checked,
            })
          }
          label={t("editDialog.heeftVerzekering")}
        />
        {form.heeftUitvaartVerzekering && (
          <div className="space-y-2">
            <Label>{t("editDialog.verzekeringsdetails")}</Label>
            <Textarea
              value={form.uitvaartVerzekeringDetails}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  uitvaartVerzekeringDetails: e.target.value,
                })
              }
              rows={2}
            />
          </div>
        )}

        <hr />

        {/* Ceremonie Section */}
        <p className="text-sm font-medium text-muted-foreground">
          {t("editDialog.sectieCeremonie")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("editDialog.soort")}</Label>
            <Input
              value={form.ceremonieSoort}
              onChange={(e) =>
                onFormChange({ ...form, ceremonieSoort: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.locatie")}</Label>
            <Input
              value={form.ceremonieLocatie}
              onChange={(e) =>
                onFormChange({ ...form, ceremonieLocatie: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("editDialog.muziekwensen")}</Label>
          <Textarea
            value={form.muziekwensen}
            onChange={(e) =>
              onFormChange({ ...form, muziekwensen: e.target.value })
            }
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("editDialog.bloemen")}</Label>
            <Input
              value={form.bloemen}
              onChange={(e) =>
                onFormChange({ ...form, bloemen: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.sprekers")}</Label>
            <Input
              value={form.sprekers}
              onChange={(e) =>
                onFormChange({ ...form, sprekers: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("editDialog.rouwkaarttekst")}</Label>
          <Textarea
            value={form.rouwkaartTekst}
            onChange={(e) =>
              onFormChange({ ...form, rouwkaartTekst: e.target.value })
            }
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("editDialog.rouwadvertentietekst")}</Label>
          <Textarea
            value={form.rouwadvertentieTekst}
            onChange={(e) =>
              onFormChange({ ...form, rouwadvertentieTekst: e.target.value })
            }
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("editDialog.condoleance")}</Label>
          <Textarea
            value={form.condoleance}
            onChange={(e) =>
              onFormChange({ ...form, condoleance: e.target.value })
            }
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("editDialog.overigeWensen")}</Label>
          <Textarea
            value={form.overigeWensen}
            onChange={(e) =>
              onFormChange({ ...form, overigeWensen: e.target.value })
            }
            rows={2}
          />
        </div>

        <hr />

        {/* Location Section */}
        <p className="text-sm font-medium text-muted-foreground">
          {t("editDialog.sectieLocatie")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("editDialog.begraafplaats")}</Label>
            <Input
              value={form.voorkeurBegraafplaatsNaam}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  voorkeurBegraafplaatsNaam: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.adresBegraafplaats")}</Label>
            <Input
              value={form.voorkeurBegraafplaatsAdres}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  voorkeurBegraafplaatsAdres: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("editDialog.crematorium")}</Label>
            <Input
              value={form.voorkeurCrematoriumnaam}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  voorkeurCrematoriumnaam: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.adresCrematorium")}</Label>
            <Input
              value={form.voorkeurCrematoriumAdres}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  voorkeurCrematoriumAdres: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("editDialog.aula")}</Label>
            <Input
              value={form.voorkeurAulaNaam}
              onChange={(e) =>
                onFormChange({ ...form, voorkeurAulaNaam: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.adresAula")}</Label>
            <Input
              value={form.voorkeurAulaAdres}
              onChange={(e) =>
                onFormChange({ ...form, voorkeurAulaAdres: e.target.value })
              }
            />
          </div>
        </div>
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
