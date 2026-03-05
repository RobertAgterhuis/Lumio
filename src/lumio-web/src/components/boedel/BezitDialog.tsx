"use client";

import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { BezitSchuldRow } from "./BezitSchuldRow";
import { useTranslations } from "next-intl";
import { useDomainQuery } from "@/hooks";
import type { BezitFormData, BezitSchuld } from "./types";
import { useState } from "react";
import { Upload, FileCheck, AlertCircle } from "lucide-react";

interface BezitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
  form: BezitFormData;
  onFormChange: (form: BezitFormData) => void;
  onSave: () => void;
  saving: boolean;
}

interface RdwLookupResult {
  merk: string;
  model: string;
  bouwJaar: number;
  klasse?: string;
  brandstof?: string;
  vermogen?: number;
  aantalCilinders?: number;
  cilinderInhoud?: number;
  lengte?: number;
  breedte?: number;
  hoogte?: number;
  massaRijklaar?: number;
  massaLeligGewicht?: number;
  aantalZitplaatsen?: number;
  kleur?: string;
  transmissie?: string;
  uitvoering?: string;
  typegoedkeuringNummer?: string;
  catalogusWaarde?: number;  // OVI value
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
  const { data: erfgenamen = [] } = useDomainQuery<{ id: string; voornaam: string; tussenvoegsel?: string; achternaam: string }[]>("erfgenamen");
  const [rdwLoading, setRdwLoading] = useState(false);
  const [rdwError, setRdwError] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null)

  const handleKentekenBlur = async () => {
    if (!form.kenteken || form.categorie !== "Voertuig") return;

    setRdwLoading(true);
    setRdwError(null);

    try {
      const response = await fetch("/api/v1/boedel/rdw-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kenteken: form.kenteken }),
      });

      if (!response.ok) {
        const error = await response.json();
        setRdwError(error.error || "RDW lookup failed");
        return;
      }

      const data: RdwLookupResult = await response.json();

      // Dynamically map all RDW data to form fields
      onFormChange({
        ...form,
        merk: data.merk || "",
        model: data.model || "",
        omschrijving: `${data.merk || ""} ${data.model || ""}`.trim(),
        bouwJaar: data.bouwJaar.toString(),
        voertuigklasse: data.klasse || "",
        brandstof: data.brandstof || "",
        vermogen: data.vermogen?.toString() || "",
        aantalCilinders: data.aantalCilinders?.toString() || "",
        cilinderInhoud: data.cilinderInhoud?.toString() || "",
        kleur: data.kleur || "",
        massaRijklaar: data.massaRijklaar?.toString() || "",
        aantalZitplaatsen: data.aantalZitplaatsen?.toString() || "",
        transmissie: data.transmissie || "",
        catalogusWaarde: data.catalogusWaarde?.toString() || "",
        geschatteWaarde: data.catalogusWaarde?.toString() || "",  // Auto-populate geschatteWaarde with OVI value
      });
    } catch (err) {
      setRdwError("Network error during RDW lookup");
    } finally {
      setRdwLoading(false);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !form.kenteken) return;

    setDocLoading(true);
    setDocError(null);

    try {
      const formData = new FormData();
      formData.append("Bestand", file);
      formData.append("Naam", `Kentekenbewijzen-${form.kenteken}`);
      formData.append("Categorie", "Voertuig");
      formData.append("Notities", `Registration documents for vehicle ${form.kenteken}`);

      const response = await fetch("/api/v1/documenten/uploaden", {
        method: "POST",
        body: formData,
        // Note: omit Content-Type header — browser will set it with correct boundary
      });

      if (!response.ok) {
        const error = await response.json();
        setDocError(error.error || "Document upload failed");
        return;
      }

      const data = await response.json();
      if (data && data.DocumentGroepId) {
        onFormChange({
          ...form,
          kentekenBewijsDocumentGroepId: data.DocumentGroepId,
        });
        setUploadedDocName(data.Naam);
      }
    } catch (err) {
      setDocError(err instanceof Error ? err.message : "Network error during document upload");
    } finally {
      setDocLoading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{editId ? t("bezitDialog.bewerken") : t("bezitDialog.toevoegen")}</DialogTitle>
      </DialogHeader>
      <div className="overflow-y-auto flex-1 min-h-0 space-y-4 py-4">
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

        {/* Vehicle-specific fields: Kenteken, RDW lookup results, and related info */}
        {form.categorie === "Voertuig" && (
          <>
            <div className="space-y-2">
              <Label>{t("bezitDialog.kenteken")}</Label>
              <Input
                value={form.kenteken}
                onChange={(e) => onFormChange({ ...form, kenteken: e.target.value })}
                onBlur={handleKentekenBlur}
                placeholder={t("bezitDialog.kentekenPlaceholder")}
                disabled={rdwLoading}
              />
              {rdwError && <p className="text-sm text-red-600">{rdwError}</p>}
              {rdwLoading && <p className="text-sm text-blue-600">RDW lookup in progress...</p>}
            </div>

            {/* Auto-filled RDW data (read-only) */}
            {form.merk && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded border border-blue-200">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">Merk</Label>
                  <Input type="text" value={form.merk} disabled />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">Model</Label>
                  <Input type="text" value={form.model} disabled />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">{t("bezitDialog.bouwJaar") || "Bouwjaar"}</Label>
                  <Input type="number" value={form.bouwJaar} disabled />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">Klasse</Label>
                  <Input type="text" value={form.voertuigklasse} disabled />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">Brandstof</Label>
                  <Input type="text" value={form.brandstof} disabled />
                </div>
              </div>
            )}
          </>
        )}

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

        {/* RestWaarde: read-only calculated field for vehicles */}
        {form.categorie === "Voertuig" && form.restWaarde && (
          <div className="space-y-2 p-2 bg-gray-50 rounded border border-gray-200">
            <Label className="text-sm text-gray-700">{t("bezitDialog.restWaarde") || "Restwaarde (berekend)"}</Label>
            <Input
              type="number"
              value={form.restWaarde}
              disabled
              className="bg-white"
            />
            <p className="text-xs text-gray-500">
              {t("bezitDialog.restWaardeTooltip") || "Berekend op basis van depreciatietabel"}
            </p>
          </div>
        )}

        {/* Kentekenbewijzen document upload for vehicles */}
        {form.categorie === "Voertuig" && (
          <div className="space-y-2 p-3 bg-blue-50 rounded border border-blue-200">
            <Label className="text-sm font-medium text-blue-900">📄 {t("bezitDialog.kentekenBewijzen") || "Kentekenbewijzen (documenten)"}</Label>
            <p className="text-xs text-blue-700">{t("bezitDialog.kentekenBewijzenHelp") || "Upload registratiebewijzen, verzekeringspapieren, en inspectierapporten"}</p>

            <div className="flex items-center gap-2">
              <label className="flex-1 relative cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition">
                <Upload className="w-4 h-4" />
                <span>{t("bezitDialog.kiesBestand") || "Kies bestand"}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  disabled={docLoading || !form.kenteken}
                  className="hidden"
                />
              </label>
            </div>

            {docLoading && <p className="text-xs text-blue-600">⏳ Document aan het uploaden...</p>}
            {docError && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                <span>{docError}</span>
              </div>
            )}
            {form.kentekenBewijsDocumentGroepId && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <FileCheck className="w-3 h-3" />
                <span>{t("bezitDialog.documentGeupload") || "Document geupload"}</span>
              </div>
            )}
          </div>
        )}

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
          <Select value={form.bestemdeErfgenaamId} onChange={(e) => onFormChange({ ...form, bestemdeErfgenaamId: e.target.value })}>
            <option value="">{t("bezitDialog.bestemdeErfgenaamPlaceholder")}</option>
            {erfgenamen.map((erf) => (
              <option key={erf.id} value={erf.id}>
                {[erf.voornaam, erf.tussenvoegsel, erf.achternaam].filter(Boolean).join(" ")}
              </option>
            ))}
          </Select>
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
        {(form.categorie !== "Voertuig" && form.kvKNummer) && (
          <div className="space-y-2">
            <Label>{t("bezitDialog.kvkNummer")}</Label>
            <Input
              value={form.kvKNummer}
              onChange={(e) => onFormChange({ ...form, kvKNummer: e.target.value })}
              placeholder={t("bezitDialog.kvkPlaceholder")}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>{t("bezitDialog.notities")}</Label>
          <Textarea
            value={form.notities}
            onChange={(e) => onFormChange({ ...form, notities: e.target.value })}
            rows={2}
          />
        </div>
        {/* Linked schulden section — only for real estate and vehicles */}
        {(form.categorie === "Onroerend goed" || form.categorie === "Voertuig") && (
          <div className="space-y-3 rounded-md border border-dashed p-3">
            <p className="text-sm font-medium">{t("bezitDialog.schulden.titel")}</p>
            {form.linkedSchulden.map((schuld, idx) => (
              <BezitSchuldRow
                key={idx}
                schuld={schuld}
                bezitCategorie={form.categorie}
                onChange={(updated) => {
                  const next = [...form.linkedSchulden];
                  next[idx] = updated;
                  onFormChange({ ...form, linkedSchulden: next });
                }}
                onDelete={() => {
                  onFormChange({
                    ...form,
                    linkedSchulden: form.linkedSchulden.filter((_, i) => i !== idx),
                  });
                }}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onFormChange({
                  ...form,
                  linkedSchulden: [
                    ...form.linkedSchulden,
                    {
                      schuldeiser: "",
                      type: form.categorie === "Onroerend goed" ? "Hypotheek" : "Lening",
                      bedrag: 0,
                      _isNew: true,
                    } as BezitSchuld,
                  ],
                })
              }
            >
              + {t("bezitDialog.schulden.toevoegen")}
            </Button>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>{t("annuleren")}</Button>
        <Button onClick={onSave} disabled={saving}>{saving ? t("opslaanBezig") : t("opslaan")}</Button>
      </DialogFooter>
    </Dialog>
  );
}
