"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell, type WizardStep } from "@/components/wizard/WizardShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useDomainQuery } from "@/hooks";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { ConfirmJuridischDialog } from "@/components/security/ConfirmJuridischDialog";

interface UitvaartData {
  voorkeurType: string;
  begraafplaats: string;
  uitvaartOndernemer: string;
  uitvaartOndernemerTelefoon: string;
  uitvaartOndernemerEmail: string;
  uitvaartOndernemerAdres: string;
  uitvaartOndernemerPostcode: string;
  uitvaartOndernemerPlaats: string;
  heeftUitvaartVerzekering: boolean;
  uitvaartVerzekeringDetails: string;
  ceremonieSoort: string;
  ceremonieLocatie: string;
  muziekwensen: string;
  sprekers: string;
  bloemen: string;
  kledingwensen: string;
  rouwkaartTekst: string;
  rouwadvertentieTekst: string;
  condoleance: string;
  overigeWensen: string;
  voorkeurBegraafplaatsNaam: string;
  voorkeurBegraafplaatsAdres: string;
  voorkeurCrematoriumnaam: string;
  voorkeurCrematoriumAdres: string;
  voorkeurAulaNaam: string;
  voorkeurAulaAdres: string;
  budgetRichting: string;
}

export default function UitvaartWizardPage() {
  const router = useRouter();
  const t = useTranslations("uitvaartWizard");
  const [form, setForm] = useState({
    voorkeurType: "",
    begraafplaats: "",
    uitvaartOndernemer: "",
    uitvaartOndernemerTelefoon: "",
    uitvaartOndernemerEmail: "",
    uitvaartOndernemerAdres: "",
    uitvaartOndernemerPostcode: "",
    uitvaartOndernemerPlaats: "",
    heeftUitvaartVerzekering: false,
    uitvaartVerzekeringDetails: "",
    ceremonieSoort: "",
    ceremonieLocatie: "",
    muziekwensen: "",
    sprekers: "",
    bloemen: "",
    kledingwensen: "",
    rouwkaartTekst: "",
    rouwadvertentieTekst: "",
    condoleance: "",
    overigeWensen: "",
    voorkeurBegraafplaatsNaam: "",
    voorkeurBegraafplaatsAdres: "",
    voorkeurCrematoriumnaam: "",
    voorkeurCrematoriumAdres: "",
    voorkeurAulaNaam: "",
    voorkeurAulaAdres: "",
    budgetRichting: "",
  });

  // Load existing data with React Query
  const { data: existingData, isLoading: loading } = useDomainQuery<UitvaartData | null>("uitvaart");
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);

  // Populate form when data loads
  useEffect(() => {
    if (existingData) {
      setForm({
        voorkeurType: existingData.voorkeurType ?? "",
        begraafplaats: existingData.begraafplaats ?? "",
        uitvaartOndernemer: existingData.uitvaartOndernemer ?? "",
        uitvaartOndernemerTelefoon: existingData.uitvaartOndernemerTelefoon ?? "",
        uitvaartOndernemerEmail: existingData.uitvaartOndernemerEmail ?? "",
        uitvaartOndernemerAdres: existingData.uitvaartOndernemerAdres ?? "",
        uitvaartOndernemerPostcode: existingData.uitvaartOndernemerPostcode ?? "",
        uitvaartOndernemerPlaats: existingData.uitvaartOndernemerPlaats ?? "",
        heeftUitvaartVerzekering: existingData.heeftUitvaartVerzekering ?? false,
        uitvaartVerzekeringDetails: existingData.uitvaartVerzekeringDetails ?? "",
        ceremonieSoort: existingData.ceremonieSoort ?? "",
        ceremonieLocatie: existingData.ceremonieLocatie ?? "",
        muziekwensen: existingData.muziekwensen ?? "",
        sprekers: existingData.sprekers ?? "",
        bloemen: existingData.bloemen ?? "",
        kledingwensen: existingData.kledingwensen ?? "",
        rouwkaartTekst: existingData.rouwkaartTekst ?? "",
        rouwadvertentieTekst: existingData.rouwadvertentieTekst ?? "",
        condoleance: existingData.condoleance ?? "",
        overigeWensen: existingData.overigeWensen ?? "",
        voorkeurBegraafplaatsNaam: existingData.voorkeurBegraafplaatsNaam ?? "",
        voorkeurBegraafplaatsAdres: existingData.voorkeurBegraafplaatsAdres ?? "",
        voorkeurCrematoriumnaam: existingData.voorkeurCrematoriumnaam ?? "",
        voorkeurCrematoriumAdres: existingData.voorkeurCrematoriumAdres ?? "",
        voorkeurAulaNaam: existingData.voorkeurAulaNaam ?? "",
        voorkeurAulaAdres: existingData.voorkeurAulaAdres ?? "",
        budgetRichting: existingData.budgetRichting ?? "",
      });
    }
  }, [existingData]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const stappen: WizardStep[] = [
    {
      id: "type",
      titel: t("type.titel"),
      beschrijving: t("type.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("type.voorkeurLabel")}</Label>
            <Select
              value={form.voorkeurType}
              onChange={(e) => update("voorkeurType", e.target.value)}
            >
              <option value="">{t("type.selecteer")}</option>
              <option value="Begrafenis">{t("type.begrafenis")}</option>
              <option value="Crematie">{t("type.crematie")}</option>
              <option value="Natuurbegraven">{t("type.natuurbegraven")}</option>
              <option value="Resomatie">{t("type.resomatie")}</option>
              <option value="Geen voorkeur">{t("type.geenVoorkeur")}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("type.begraafplaatsLabel")}</Label>
            <Input
              value={form.begraafplaats}
              onChange={(e) => update("begraafplaats", e.target.value)}
              placeholder={t("type.begraafplaatsPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("type.ondernemerLabel")}</Label>
            <Input
              value={form.uitvaartOndernemer}
              onChange={(e) => update("uitvaartOndernemer", e.target.value)}
              placeholder={t("type.ondernemerPlaceholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("type.telefoonLabel")}</Label>
              <Input
                value={form.uitvaartOndernemerTelefoon}
                onChange={(e) => update("uitvaartOndernemerTelefoon", e.target.value)}
                placeholder={t("type.telefoonPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("type.emailLabel")}</Label>
              <Input
                value={form.uitvaartOndernemerEmail}
                onChange={(e) => update("uitvaartOndernemerEmail", e.target.value)}
                placeholder={t("type.emailPlaceholder")}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-2">
              <Label>{t("type.adresLabel")}</Label>
              <Input
                value={form.uitvaartOndernemerAdres}
                onChange={(e) => update("uitvaartOndernemerAdres", e.target.value)}
                placeholder={t("type.adresPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("type.postcodeLabel")}</Label>
              <Input
                value={form.uitvaartOndernemerPostcode}
                onChange={(e) => update("uitvaartOndernemerPostcode", e.target.value)}
                placeholder={t("type.postcodePlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("type.plaatsLabel")}</Label>
            <Input
              value={form.uitvaartOndernemerPlaats}
              onChange={(e) => update("uitvaartOndernemerPlaats", e.target.value)}
              placeholder={t("type.plaatsPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("type.verzekeringsLabel")}</Label>
            <Select
              value={String(form.heeftUitvaartVerzekering)}
              onChange={(e) => setForm((prev) => ({ ...prev, heeftUitvaartVerzekering: e.target.value === "true" }))}
            >
              <option value="false">{t("type.verzekeringsNee")}</option>
              <option value="true">{t("type.verzekeringsJa")}</option>
            </Select>
          </div>
          {form.heeftUitvaartVerzekering && (
            <div className="space-y-2">
              <Label>{t("type.verzekeringsDetailsLabel")}</Label>
              <Input
                value={form.uitvaartVerzekeringDetails}
                onChange={(e) => update("uitvaartVerzekeringDetails", e.target.value)}
                placeholder={t("type.verzekeringsDetailsPlaceholder")}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "locaties",
      titel: t("locaties.titel"),
      beschrijving: t("locaties.beschrijving"),
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("locaties.info")}
          </p>
          <div className="space-y-2">
            <Label>{t("locaties.begraafplaatsNaamLabel")}</Label>
            <Input
              value={form.voorkeurBegraafplaatsNaam}
              onChange={(e) => update("voorkeurBegraafplaatsNaam", e.target.value)}
              placeholder={t("locaties.begraafplaatsNaamPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("locaties.begraafplaatsAdresLabel")}</Label>
            <Input
              value={form.voorkeurBegraafplaatsAdres}
              onChange={(e) => update("voorkeurBegraafplaatsAdres", e.target.value)}
              placeholder={t("locaties.begraafplaatsAdresPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("locaties.crematoriumNaamLabel")}</Label>
            <Input
              value={form.voorkeurCrematoriumnaam}
              onChange={(e) => update("voorkeurCrematoriumnaam", e.target.value)}
              placeholder={t("locaties.crematoriumNaamPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("locaties.crematoriumAdresLabel")}</Label>
            <Input
              value={form.voorkeurCrematoriumAdres}
              onChange={(e) => update("voorkeurCrematoriumAdres", e.target.value)}
              placeholder={t("locaties.crematoriumAdresPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("locaties.aulaNaamLabel")}</Label>
            <Input
              value={form.voorkeurAulaNaam}
              onChange={(e) => update("voorkeurAulaNaam", e.target.value)}
              placeholder={t("locaties.aulaNaamPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("locaties.aulaAdresLabel")}</Label>
            <Input
              value={form.voorkeurAulaAdres}
              onChange={(e) => update("voorkeurAulaAdres", e.target.value)}
              placeholder={t("locaties.aulaAdresPlaceholder")}
            />
          </div>
        </div>
      ),
    },
    {
      id: "ceremonie",
      titel: t("ceremonie.titel"),
      beschrijving: t("ceremonie.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("ceremonie.soortLabel")}</Label>
            <Select
              value={form.ceremonieSoort}
              onChange={(e) => update("ceremonieSoort", e.target.value)}
            >
              <option value="">{t("ceremonie.selecteer")}</option>
              <option value="Kerkelijk">{t("ceremonie.kerkelijk")}</option>
              <option value="Niet-kerkelijk">{t("ceremonie.nietKerkelijk")}</option>
              <option value="Humanistisch">{t("ceremonie.humanistisch")}</option>
              <option value="Persoonlijk">{t("ceremonie.persoonlijk")}</option>
              <option value="Geen ceremonie">{t("ceremonie.geenCeremonie")}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("ceremonie.locatieLabel")}</Label>
            <Input
              value={form.ceremonieLocatie}
              onChange={(e) => update("ceremonieLocatie", e.target.value)}
              placeholder={t("ceremonie.locatiePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("ceremonie.muziekLabel")}</Label>
            <Textarea
              value={form.muziekwensen}
              onChange={(e) => update("muziekwensen", e.target.value)}
              placeholder={t("ceremonie.muziekPlaceholder")}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("ceremonie.bloemenLabel")}</Label>
            <Input
              value={form.bloemen}
              onChange={(e) => update("bloemen", e.target.value)}
              placeholder={t("ceremonie.bloemenPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("ceremonie.kledingLabel")}</Label>
            <Input
              value={form.kledingwensen}
              onChange={(e) => update("kledingwensen", e.target.value)}
              placeholder={t("ceremonie.kledingPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("ceremonie.sprekersLabel")}</Label>
            <Textarea
              value={form.sprekers}
              onChange={(e) => update("sprekers", e.target.value)}
              placeholder={t("ceremonie.sprekersPlaceholder")}
              rows={2}
            />
          </div>
        </div>
      ),
    },
    {
      id: "rouwkaart",
      titel: t("rouwkaart.titel"),
      beschrijving: t("rouwkaart.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("rouwkaart.rouwkaartLabel")}</Label>
            <Textarea
              value={form.rouwkaartTekst}
              onChange={(e) => update("rouwkaartTekst", e.target.value)}
              placeholder={t("rouwkaart.rouwkaartPlaceholder")}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("rouwkaart.condoleanceLabel")}</Label>
            <Textarea
              value={form.condoleance}
              onChange={(e) => update("condoleance", e.target.value)}
              placeholder={t("rouwkaart.condoleancePlaceholder")}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("rouwkaart.rouwadvertentieLabel")}</Label>
            <Textarea
              value={form.rouwadvertentieTekst}
              onChange={(e) => update("rouwadvertentieTekst", e.target.value)}
              placeholder={t("rouwkaart.rouwadvertendiePlaceholder")}
              rows={4}
            />
          </div>
        </div>
      ),
    },
    {
      id: "aanvullend",
      titel: t("aanvullend.titel"),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("aanvullend.budgetLabel")}</Label>
            <Select
              value={form.budgetRichting}
              onChange={(e) => update("budgetRichting", e.target.value)}
            >
              <option value="">{t("aanvullend.geenVoorkeur")}</option>
              <option value="Eenvoudig">{t("aanvullend.eenvoudig")}</option>
              <option value="Gemiddeld">{t("aanvullend.gemiddeld")}</option>
              <option value="Uitgebreid">{t("aanvullend.uitgebreid")}</option>
              <option value="Luxe">{t("aanvullend.luxe")}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("aanvullend.overigeLabel")}</Label>
            <Textarea
              value={form.overigeWensen}
              onChange={(e) => update("overigeWensen", e.target.value)}
              placeholder={t("aanvullend.overigePlaceholder")}
              rows={5}
            />
          </div>
        </div>
      ),
    },
    {
      id: "samenvatting",
      titel: t("samenvatting.titel"),
      beschrijving: t("samenvatting.beschrijving"),
      content: (
        <div className="space-y-3 text-sm">
          <div className="rounded-lg border p-4 space-y-2">
            <div>
              <span className="font-medium">{t("samenvatting.summaryType")}</span>{" "}
              {form.voorkeurType || "—"}
            </div>
            <div>
              <span className="font-medium">{t("samenvatting.summaryBegraafplaats")}</span>{" "}
              {form.begraafplaats || "—"}
            </div>
            <div>
              <span className="font-medium">{t("samenvatting.summaryOndernemer")}</span>{" "}
              {form.uitvaartOndernemer || "—"}
            </div>
            {(form.uitvaartOndernemerTelefoon || form.uitvaartOndernemerEmail) && (
              <div>
                {form.uitvaartOndernemerTelefoon && <span className="mr-4">{t("samenvatting.summaryTel")} {form.uitvaartOndernemerTelefoon}</span>}
                {form.uitvaartOndernemerEmail && <span>{t("samenvatting.summaryEmail")} {form.uitvaartOndernemerEmail}</span>}
              </div>
            )}
            {form.uitvaartOndernemerAdres && (
              <div>
                <span className="font-medium">{t("samenvatting.summaryAdres")}</span>{" "}
                {form.uitvaartOndernemerAdres}
                {form.uitvaartOndernemerPostcode && `, ${form.uitvaartOndernemerPostcode}`}
                {form.uitvaartOndernemerPlaats && ` ${form.uitvaartOndernemerPlaats}`}
              </div>
            )}
            {form.ceremonieSoort && (
              <div>
                <span className="font-medium">{t("samenvatting.summaryCeremonie")}</span>{" "}
                {form.ceremonieSoort}
                {form.ceremonieLocatie && ` — ${form.ceremonieLocatie}`}
              </div>
            )}
            {form.kledingwensen && (
              <div>
                <span className="font-medium">{t("samenvatting.summaryKleding")}</span> {form.kledingwensen}
              </div>
            )}
          </div>
          {form.muziekwensen && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">{t("samenvatting.summaryMuziekwensen")}</div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {form.muziekwensen}
              </div>
            </div>
          )}
          {form.rouwkaartTekst && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">{t("samenvatting.summaryRouwkaart")}</div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {form.rouwkaartTekst}
              </div>
            </div>
          )}
          {form.rouwadvertentieTekst && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">{t("samenvatting.summaryRouwadvertentie")}</div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {form.rouwadvertentieTekst}
              </div>
            </div>
          )}
          {(form.voorkeurBegraafplaatsNaam || form.voorkeurCrematoriumnaam || form.voorkeurAulaNaam) && (
            <div className="rounded-lg border p-4 space-y-1">
              <div className="font-medium mb-1">{t("samenvatting.summaryLocatieVoorkeuren")}</div>
              {form.voorkeurBegraafplaatsNaam && (
                <div className="text-muted-foreground">{t("samenvatting.summaryBegraafplaatsLocatie")} {form.voorkeurBegraafplaatsNaam}{form.voorkeurBegraafplaatsAdres && ` — ${form.voorkeurBegraafplaatsAdres}`}</div>
              )}
              {form.voorkeurCrematoriumnaam && (
                <div className="text-muted-foreground">{t("samenvatting.summaryCrematorium")} {form.voorkeurCrematoriumnaam}{form.voorkeurCrematoriumAdres && ` — ${form.voorkeurCrematoriumAdres}`}</div>
              )}
              {form.voorkeurAulaNaam && (
                <div className="text-muted-foreground">{t("samenvatting.summaryAula")} {form.voorkeurAulaNaam}{form.voorkeurAulaAdres && ` — ${form.voorkeurAulaAdres}`}</div>
              )}
            </div>
          )}
          {form.budgetRichting && (
            <div className="rounded-lg border p-4">
              <span className="font-medium">{t("samenvatting.summaryBudget")}</span> {form.budgetRichting}
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleComplete = () => setConfirmCompleteOpen(true);

  const executeComplete = async () => {
    await api.put("/api/uitvaart", {
      ...form,
      heeftUitvaartVerzekering: form.heeftUitvaartVerzekering,
      begraafplaats: form.begraafplaats || null,
      uitvaartOndernemer: form.uitvaartOndernemer || null,
      uitvaartOndernemerTelefoon: form.uitvaartOndernemerTelefoon || null,
      uitvaartOndernemerEmail: form.uitvaartOndernemerEmail || null,
      uitvaartOndernemerAdres: form.uitvaartOndernemerAdres || null,
      uitvaartOndernemerPostcode: form.uitvaartOndernemerPostcode || null,
      uitvaartOndernemerPlaats: form.uitvaartOndernemerPlaats || null,
      uitvaartVerzekeringDetails: form.uitvaartVerzekeringDetails || null,
      ceremonieSoort: form.ceremonieSoort || null,
      ceremonieLocatie: form.ceremonieLocatie || null,
      muziekwensen: form.muziekwensen || null,
      sprekers: form.sprekers || null,
      bloemen: form.bloemen || null,
      kledingwensen: form.kledingwensen || null,
      rouwkaartTekst: form.rouwkaartTekst || null,
      rouwadvertentieTekst: form.rouwadvertentieTekst || null,
      condoleance: form.condoleance || null,
      overigeWensen: form.overigeWensen || null,
      voorkeurBegraafplaatsNaam: form.voorkeurBegraafplaatsNaam || null,
      voorkeurBegraafplaatsAdres: form.voorkeurBegraafplaatsAdres || null,
      voorkeurCrematoriumnaam: form.voorkeurCrematoriumnaam || null,
      voorkeurCrematoriumAdres: form.voorkeurCrematoriumAdres || null,
      voorkeurAulaNaam: form.voorkeurAulaNaam || null,
      voorkeurAulaAdres: form.voorkeurAulaAdres || null,
      budgetRichting: form.budgetRichting || null,
    });
    router.push("/uitvaart");
  };

  if (loading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">{t("laden")}</p></div>;

  return (
    <>
      <WizardShell
        titel={t("titel")}
        stappen={stappen}
        onComplete={handleComplete}
        onCancel={() => router.push("/uitvaart")}
      />
      <ConfirmJuridischDialog
        open={confirmCompleteOpen}
        onOpenChange={setConfirmCompleteOpen}
        title={t("bevestigenTitel")}
        description={t("bevestigenBeschrijving")}
        onConfirm={executeComplete}
      />
    </>
  );
}
