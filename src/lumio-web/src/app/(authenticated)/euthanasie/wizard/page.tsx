"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell, type WizardStep } from "@/components/wizard/WizardShell";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { PersonSelect } from "@/components/PersonSelect";
import type { PersonDetails } from "@/components/PersonSelect";
import { useDomainQuery, useInvalidateStatusKeys } from "@/hooks";
import { api, downloadAndSave } from "@/lib/api-client";
import { Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConfirmJuridischDialog } from "@/components/security/ConfirmJuridischDialog";

export default function EuthanasieWizardPage() {
  const router = useRouter();
  const t = useTranslations("euthanasieWizard");
  const [form, setForm] = useState({
    wilEuthanasie: "",
    // S2.2: Structured situatie fields (replace free-text situatieBeschrijving)
    situatieOpties: [] as string[],
    situatieNotitie: "",
    // Legacy field kept for backward-compat load
    situatieBeschrijving: "",
    huisarts: "",
    huisartsPraktijk: "",
    huisartsTelefoon: "",
    huisartsEmail: "",
    // Primary vertegenwoordiger (existing fields — auto-filled by PersonSelect)
    vertegenwoordigerNaam: "",
    vertegenwoordigerRelatie: "",
    vertegenwoordigerTelefoon: "",
    vertegenwoordigerEmail: "",
    vertegenwoordigerAdres: "",
    vertegenwoordigerPostcode: "",
    vertegenwoordigerWoonplaats: "",
    // S2.3: Secondary vertegenwoordiger
    vertegenwoordiger2Naam: "",
    vertegenwoordiger2Relatie: "",
    vertegenwoordiger2Telefoon: "",
    vertegenwoordiger2Email: "",
    aanvullendeWensen: "",
    datumOndertekening: "",
    dementieClausule: "",
    dementieClausuleToelichting: "",
    behandelVerbod: "",
  });

  const [generating, setGenerating] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);

  // Load existing data with React Query
  const { data: existingData, isLoading: loading } = useDomainQuery<Record<string, unknown> | null>("euthanasie");
  const invalidateStatus = useInvalidateStatusKeys();

  // Populate form when data loads
  useEffect(() => {
    if (existingData) {
      // S2.2: load situatieOpties from JSON string, or fall through to legacy field
      let situatieOpties: string[] = [];
      let situatieNotitie = "";
      const rawOpties = existingData.situatieOpties;
      if (typeof rawOpties === "string" && rawOpties.length > 0) {
        try { situatieOpties = JSON.parse(rawOpties) as string[]; } catch { /* ignore */ }
      }
      const legacyBeschrijving = (existingData.situatieBeschrijving as string) ?? "";
      // Migrate legacy free-text into the notes field if no structured data yet
      situatieNotitie = (existingData.situatieNotitie as string) ?? (situatieOpties.length === 0 ? legacyBeschrijving : "");

      setForm({
        wilEuthanasie: existingData.wilEuthanasie != null ? String(existingData.wilEuthanasie) : "",
        situatieOpties,
        situatieNotitie,
        situatieBeschrijving: legacyBeschrijving,
        huisarts: (existingData.huisarts as string) ?? "",
        huisartsPraktijk: (existingData.huisartsPraktijk as string) ?? "",
        huisartsTelefoon: (existingData.huisartsTelefoon as string) ?? "",
        huisartsEmail: (existingData.huisartsEmail as string) ?? "",
        vertegenwoordigerNaam: (existingData.vertegenwoordigerNaam as string) ?? "",
        vertegenwoordigerRelatie: (existingData.vertegenwoordigerRelatie as string) ?? "",
        vertegenwoordigerTelefoon: (existingData.vertegenwoordigerTelefoon as string) ?? "",
        vertegenwoordigerEmail: (existingData.vertegenwoordigerEmail as string) ?? "",
        vertegenwoordigerAdres: (existingData.vertegenwoordigerAdres as string) ?? "",
        vertegenwoordigerPostcode: (existingData.vertegenwoordigerPostcode as string) ?? "",
        vertegenwoordigerWoonplaats: (existingData.vertegenwoordigerWoonplaats as string) ?? "",
        vertegenwoordiger2Naam: (existingData.vertegenwoordiger2Naam as string) ?? "",
        vertegenwoordiger2Relatie: (existingData.vertegenwoordiger2Relatie as string) ?? "",
        vertegenwoordiger2Telefoon: (existingData.vertegenwoordiger2Telefoon as string) ?? "",
        vertegenwoordiger2Email: (existingData.vertegenwoordiger2Email as string) ?? "",
        aanvullendeWensen: (existingData.aanvullendeWensen as string) ?? "",
        datumOndertekening: existingData.datumOndertekening
          ? new Date(existingData.datumOndertekening as string).toISOString().split("T")[0]
          : "",
        dementieClausule: existingData.dementieClausule != null ? String(existingData.dementieClausule) : "",
        dementieClausuleToelichting: (existingData.dementieClausuleToelichting as string) ?? "",
        behandelVerbod: (existingData.behandelVerbod as string) ?? "",
      });
    }
  }, [existingData]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // S2.2: Toggle a situatie option in/out of the array
  const toggleSituatie = (key: string) => {
    setForm((prev) => {
      const current = prev.situatieOpties;
      const next = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];
      return { ...prev, situatieOpties: next };
    });
  };

  const SITUATIE_OPTIES = [
    { key: "ongeneeslijkZiek", labelKey: "keuze.situatieOngeneeslijkZiek", tooltipKey: "keuze.situatieOngeneeslijkZiekTooltip" },
    { key: "ernstigLetsel", labelKey: "keuze.situatieErnstigLetsel", tooltipKey: "keuze.situatieErnstigLetselTooltip" },
    { key: "psychiatrischLijden", labelKey: "keuze.situatiePsychiatrischLijden", tooltipKey: "keuze.situatiePsychiatrischLijdenTooltip" },
    { key: "dementieVroegstadium", labelKey: "keuze.situatieDementieVroegstadium", tooltipKey: "keuze.situatieDementieVroegstadiumTooltip" },
    { key: "andereSituatie", labelKey: "keuze.situatieAndereSituatie", tooltipKey: "keuze.situatieAndereSituatieTooltip" },
  ] as const;

  // S2.3: Autofill primary vertegenwoordiger from PersonSelect
  const handleVertegenwoordigerSelect = (person: PersonDetails) => {
    setForm((prev) => ({
      ...prev,
      vertegenwoordigerNaam: person.naam,
      vertegenwoordigerRelatie: person.relatie ?? prev.vertegenwoordigerRelatie,
      vertegenwoordigerTelefoon: person.telefoon ?? prev.vertegenwoordigerTelefoon,
      vertegenwoordigerEmail: person.email ?? prev.vertegenwoordigerEmail,
      vertegenwoordigerAdres: person.adres ?? prev.vertegenwoordigerAdres,
      vertegenwoordigerPostcode: person.postcode ?? prev.vertegenwoordigerPostcode,
      vertegenwoordigerWoonplaats: person.woonplaats ?? prev.vertegenwoordigerWoonplaats,
    }));
  };

  // S2.3: Autofill secondary vertegenwoordiger from PersonSelect
  const handleVertegenwoordiger2Select = (person: PersonDetails) => {
    setForm((prev) => ({
      ...prev,
      vertegenwoordiger2Naam: person.naam,
      vertegenwoordiger2Relatie: person.relatie ?? prev.vertegenwoordiger2Relatie,
      vertegenwoordiger2Telefoon: person.telefoon ?? prev.vertegenwoordiger2Telefoon,
      vertegenwoordiger2Email: person.email ?? prev.vertegenwoordiger2Email,
    }));
  };

  const downloadWilsverklaringPdf = async () => {
    setGenerating(true);
    try {
      await downloadAndSave("/api/export/wilsverklaring", "lumio-wilsverklaring.pdf", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  };

  const stappen: WizardStep[] = [
    {
      id: "keuze",
      titel: t("keuze.titel"),
      beschrijving: t("keuze.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-info bg-info-100 dark:bg-info/20 p-4">
            <p className="text-sm text-info">
              <strong>{t("keuze.wettelijkKader")}</strong> {t("keuze.wettelijkKaderTekst")}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t("keuze.wilEuthanasieLabel")}</Label>
            <Select
              value={form.wilEuthanasie}
              onChange={(e) => update("wilEuthanasie", e.target.value)}
            >
              <option value="">{t("keuze.selecteer")}</option>
              <option value="true">
                {t("keuze.jaWilsverklaring")}
              </option>
              <option value="false">
                {t("keuze.neeGeenEuthanasie")}
              </option>
            </Select>
          </div>
          {/* S2.2: Structured situation checkboxes */}
          <div className="space-y-3">
            <Label>{t("keuze.situatieLabel")}</Label>
            <div className="space-y-2 rounded-md border p-3">
              {SITUATIE_OPTIES.map(({ key, labelKey, tooltipKey }) => (
                <div key={key} className="flex items-center gap-3">
                  <Checkbox
                    id={`situatie-${key}`}
                    checked={form.situatieOpties.includes(key)}
                    onChange={() => toggleSituatie(key)}
                  />
                  <Label
                    htmlFor={`situatie-${key}`}
                    className="font-normal cursor-pointer flex-1"
                  >
                    {t(labelKey)}
                  </Label>
                  <HelpTooltip tekst={t(tooltipKey)} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className={form.situatieOpties.includes("andereSituatie") ? undefined : "text-muted-foreground text-sm"}>
              {form.situatieOpties.includes("andereSituatie")
                ? <>{t("keuze.andereSituatieLabel")} <span className="text-danger">*</span></>
                : t("keuze.notitiesLabel")}
            </Label>
            <Textarea
              value={form.situatieNotitie}
              onChange={(e) => update("situatieNotitie", e.target.value)}
              placeholder={form.situatieOpties.includes("andereSituatie")
                ? t("keuze.andereSituatiePlaceholder")
                : t("keuze.notitiesPlaceholder")}
              rows={3}
            />
          </div>
        </div>
      ),
    },
    {
      id: "dementie",
      titel: t("dementie.titel"),
      beschrijving: t("dementie.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-warning bg-warning-100 dark:bg-warning/20 p-4">
            <p className="text-sm text-warning">
              <strong>{t("dementie.letOp")}</strong> {t("dementie.letOpTekst")}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t("dementie.label")}</Label>
            <HelpTooltip tekst={t("dementie.tooltip")} />
            <Select
              value={form.dementieClausule}
              onChange={(e) => update("dementieClausule", e.target.value)}
            >
              <option value="">{t("keuze.selecteer")}</option>
              <option value="true">{t("dementie.ja")}</option>
              <option value="false">{t("dementie.nee")}</option>
            </Select>
          </div>
          {form.dementieClausule === "true" && (
            <div className="space-y-2">
              <Label>{t("dementie.toelichtingLabel")}</Label>
              <Textarea
                value={form.dementieClausuleToelichting}
                onChange={(e) => update("dementieClausuleToelichting", e.target.value)}
                placeholder={t("dementie.toelichtingPlaceholder")}
                rows={5}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "behandelverbod",
      titel: t("behandelverbod.titel"),
      beschrijving: t("behandelverbod.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-info bg-info-100 dark:bg-info/20 p-4">
            <p className="text-sm text-info">
              <strong>{t("behandelverbod.wettelijkKader")}</strong> {t("behandelverbod.wettelijkKaderTekst")}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t("behandelverbod.label")}</Label>
            <HelpTooltip tekst={t("behandelverbod.tooltip")} />
            <Textarea
              value={form.behandelVerbod}
              onChange={(e) => update("behandelVerbod", e.target.value)}
              placeholder={t("behandelverbod.placeholder")}
              rows={5}
            />
          </div>
        </div>
      ),
    },
    {
      id: "huisarts",
      titel: t("huisarts.titel"),
      beschrijving: t("huisarts.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("huisarts.naamLabel")}</Label>
            <Input
              value={form.huisarts}
              onChange={(e) => update("huisarts", e.target.value)}
              placeholder={t("huisarts.naamPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("huisarts.praktijkLabel")}</Label>
            <Input
              value={form.huisartsPraktijk}
              onChange={(e) => update("huisartsPraktijk", e.target.value)}
              placeholder={t("huisarts.praktijkPlaceholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("huisarts.telefoonLabel")}</Label>
              <Input
                value={form.huisartsTelefoon}
                onChange={(e) => update("huisartsTelefoon", e.target.value)}
                placeholder={t("huisarts.telefoonPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("huisarts.emailLabel")}</Label>
              <Input
                value={form.huisartsEmail}
                onChange={(e) => update("huisartsEmail", e.target.value)}
                placeholder={t("huisarts.emailPlaceholder")}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "vertegenwoordiger",
      titel: t("vertegenwoordiger.titel"),
      beschrijving: t("vertegenwoordiger.beschrijving"),
      content: (
        <div className="space-y-6">
          {/* S2.3: Primary vertegenwoordiger via PersonSelect */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{t("vertegenwoordiger.primaireLabel")} <span className="text-danger">*</span></Label>
              <PersonSelect
                source="both"
                value={form.vertegenwoordigerNaam}
                onChange={(v) => update("vertegenwoordigerNaam", v)}
                onPersonSelect={handleVertegenwoordigerSelect}
                placeholder={t("vertegenwoordiger.naamPlaceholder")}
              />
            </div>
            {form.vertegenwoordigerNaam && (
              <div className="space-y-3 rounded-md border p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("vertegenwoordiger.telefoonLabel")}</Label>
                    <Input
                      value={form.vertegenwoordigerTelefoon}
                      onChange={(e) => update("vertegenwoordigerTelefoon", e.target.value)}
                      placeholder={t("vertegenwoordiger.telefoonPlaceholder")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("vertegenwoordiger.emailLabel")}</Label>
                    <Input
                      value={form.vertegenwoordigerEmail}
                      onChange={(e) => update("vertegenwoordigerEmail", e.target.value)}
                      placeholder={t("vertegenwoordiger.emailPlaceholder")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs text-muted-foreground">{t("vertegenwoordiger.adresLabel")}</Label>
                    <Input
                      value={form.vertegenwoordigerAdres}
                      onChange={(e) => update("vertegenwoordigerAdres", e.target.value)}
                      placeholder={t("vertegenwoordiger.adresPlaceholder")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("vertegenwoordiger.postcodeLabel")}</Label>
                    <Input
                      value={form.vertegenwoordigerPostcode}
                      onChange={(e) => update("vertegenwoordigerPostcode", e.target.value)}
                      placeholder={t("vertegenwoordiger.postcodePlaceholder")}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t("vertegenwoordiger.woonplaatsLabel")}</Label>
                  <Input
                    value={form.vertegenwoordigerWoonplaats}
                    onChange={(e) => update("vertegenwoordigerWoonplaats", e.target.value)}
                    placeholder={t("vertegenwoordiger.woonplaatsPlaceholder")}
                  />
                </div>
              </div>
            )}
          </div>

          {/* S2.3: Secondary vertegenwoordiger */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">{t("vertegenwoordiger.secundaireLabel")}</Label>
              <PersonSelect
                source="both"
                value={form.vertegenwoordiger2Naam}
                onChange={(v) => update("vertegenwoordiger2Naam", v)}
                onPersonSelect={handleVertegenwoordiger2Select}
                placeholder={t("vertegenwoordiger.secundairePlaceholder")}
              />
            </div>
            {form.vertegenwoordiger2Naam && (
              <div className="space-y-3 rounded-md border border-dashed p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("vertegenwoordiger.telefoonLabel")}</Label>
                    <Input
                      value={form.vertegenwoordiger2Telefoon}
                      onChange={(e) => update("vertegenwoordiger2Telefoon", e.target.value)}
                      placeholder={t("vertegenwoordiger.telefoonPlaceholder")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{t("vertegenwoordiger.emailLabel")}</Label>
                    <Input
                      value={form.vertegenwoordiger2Email}
                      onChange={(e) => update("vertegenwoordiger2Email", e.target.value)}
                      placeholder={t("vertegenwoordiger.emailPlaceholder")}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "aanvullend",
      titel: t("aanvullend.titel"),
      beschrijving: t("aanvullend.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("aanvullend.wensenLabel")}</Label>
            <Textarea
              value={form.aanvullendeWensen}
              onChange={(e) => update("aanvullendeWensen", e.target.value)}
              placeholder={t("aanvullend.wensenPlaceholder")}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("aanvullend.datumLabel")}</Label>
            <Input
              type="date"
              value={form.datumOndertekening}
              onChange={(e) => update("datumOndertekening", e.target.value)}
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
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-accent bg-accent/10 dark:bg-accent/20 p-4">
            <p className="text-sm text-accent">
              <strong>{t("samenvatting.disclaimer")}</strong> {t("samenvatting.disclaimerTekst")}
            </p>
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <div>
              <span className="font-medium">{t("samenvatting.summaryWilEuthanasie")}</span>{" "}
              {form.wilEuthanasie === "true"
                ? t("samenvatting.summaryJa")
                : form.wilEuthanasie === "false"
                ? t("samenvatting.summaryNee")
                : "—"}
            </div>
            {(form.situatieOpties.length > 0 || form.situatieNotitie) && (
              <div>
                <span className="font-medium">{t("samenvatting.summarySituatie")}</span>{" "}
                {form.situatieOpties.length > 0 && (
                  <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-0.5">
                    {form.situatieOpties.map((key) => (
                      <li key={key}>{t(`keuze.situatie${key.charAt(0).toUpperCase()}${key.slice(1)}` as Parameters<typeof t>[0])}</li>
                    ))}
                  </ul>
                )}
                {form.situatieNotitie && (
                  <p className="text-muted-foreground mt-1">{form.situatieNotitie}</p>
                )}
              </div>
            )}
            {/* S8-14: dementie-samenvatting alleen tonen als gebruiker euthanasie wil */}
            {form.wilEuthanasie !== "false" && (
              <>
                <div>
                  <span className="font-medium">{t("samenvatting.summaryDementie")}</span>{", "}
                  {form.dementieClausule === "true"
                    ? t("samenvatting.summaryJa")
                    : form.dementieClausule === "false"
                    ? t("samenvatting.summaryNee")
                    : "—"}
                </div>
                {form.dementieClausuleToelichting && (
                  <div>
                    <span className="font-medium">{t("samenvatting.summaryToelichting")}</span>{", "}
                    {form.dementieClausuleToelichting}
                  </div>
                )}
              </>
            )}
            {form.behandelVerbod && (
              <div>
                <span className="font-medium">{t("samenvatting.summaryBehandelverbod")}</span>{" "}
                {form.behandelVerbod}
              </div>
            )}
            <div>
              <span className="font-medium">{t("samenvatting.summaryHuisarts")}</span>{" "}
              {form.huisarts || "—"} ({form.huisartsPraktijk || "—"})
            </div>
            {(form.huisartsTelefoon || form.huisartsEmail) && (
              <div>
                {form.huisartsTelefoon && <span className="mr-4">{t("samenvatting.summaryTel")} {form.huisartsTelefoon}</span>}
                {form.huisartsEmail && <span>{t("samenvatting.summaryEmail")} {form.huisartsEmail}</span>}
              </div>
            )}
            <div>
              <span className="font-medium">{t("samenvatting.summaryVertegenwoordiger")}</span>{" "}
              {form.vertegenwoordigerNaam || "—"} (
              {form.vertegenwoordigerRelatie || "—"})
            </div>
            {form.vertegenwoordiger2Naam && (
              <div>
                <span className="font-medium">{t("samenvatting.summaryVertegenwoordiger2")}</span>{" "}
                {form.vertegenwoordiger2Naam}
                {form.vertegenwoordiger2Relatie && ` (${form.vertegenwoordiger2Relatie})`}
              </div>
            )}
            {form.vertegenwoordigerAdres && (
              <div>
                <span className="font-medium">{t("samenvatting.summaryAdres")}</span>{" "}
                {form.vertegenwoordigerAdres}
                {form.vertegenwoordigerPostcode && `, ${form.vertegenwoordigerPostcode}`}
                {form.vertegenwoordigerWoonplaats && ` ${form.vertegenwoordigerWoonplaats}`}
              </div>
            )}
            {form.datumOndertekening && (
              <div>
                <span className="font-medium">{t("samenvatting.summaryDatum")}</span>{" "}
                {form.datumOndertekening}
              </div>
            )}
          </div>
          {form.aanvullendeWensen && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">{t("samenvatting.summaryAanvullendeWensen")}</div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {form.aanvullendeWensen}
              </div>
            </div>
          )}
          <div className="pt-2">
            <Button variant="outline" onClick={downloadWilsverklaringPdf} disabled={generating}>
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("samenvatting.genereren")}</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> {t("samenvatting.downloadPdf")}</>
              )}
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const handleComplete = () => setConfirmCompleteOpen(true);

  const executeComplete = async () => {
    await api.put("/api/euthanasie", {
      ...form,
      wilEuthanasie: form.wilEuthanasie === "true",
      // S2.2: send serialized situatie options alongside legacy field for compat
      situatieOpties: JSON.stringify(form.situatieOpties),
      situatieNotitie: form.situatieNotitie || null,
      situatieBeschrijving: form.situatieNotitie || form.situatieBeschrijving || null,
      datumOndertekening: form.datumOndertekening || null,
      dementieClausule: form.dementieClausule === "true",
      dementieClausuleToelichting: form.dementieClausuleToelichting || null,
      behandelVerbod: form.behandelVerbod || null,
      // S2.3: secondary vertegenwoordiger
      vertegenwoordiger2Naam: form.vertegenwoordiger2Naam || null,
      vertegenwoordiger2Relatie: form.vertegenwoordiger2Relatie || null,
      vertegenwoordiger2Telefoon: form.vertegenwoordiger2Telefoon || null,
      vertegenwoordiger2Email: form.vertegenwoordiger2Email || null,
    });
    invalidateStatus();
    router.push("/euthanasie");
  };

  // S8-14: sla de 'dementie'-stap over als de gebruiker geen euthanasie wil
  const gefilterdStappen = stappen.filter((s) =>
    s.id !== "dementie" || form.wilEuthanasie !== "false"
  );

  if (loading) return <PageSkeleton />;

  return (
    <>
      <WizardShell
        titel={t("titel")}
        stappen={gefilterdStappen}
        onComplete={handleComplete}
        onCancel={() => router.push("/euthanasie")}
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
