"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell, type WizardStep } from "@/components/wizard/WizardShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { api } from "@/lib/api-client";
import { Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function EuthanasieWizardPage() {
  const router = useRouter();
  const t = useTranslations("euthanasieWizard");
  const [form, setForm] = useState({
    wilEuthanasie: "",
    situatieBeschrijving: "",
    huisarts: "",
    huisartsPraktijk: "",
    huisartsTelefoon: "",
    huisartsEmail: "",
    vertegenwoordigerNaam: "",
    vertegenwoordigerRelatie: "",
    vertegenwoordigerTelefoon: "",
    vertegenwoordigerEmail: "",
    vertegenwoordigerAdres: "",
    vertegenwoordigerPostcode: "",
    vertegenwoordigerWoonplaats: "",
    aanvullendeWensen: "",
    datumOndertekening: "",
    dementieClausule: "",
    dementieClausuleToelichting: "",
    behandelVerbod: "",
  });

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get<Record<string, unknown>>("/api/euthanasie")
      .then((data) => {
        if (data) {
          setForm({
            wilEuthanasie: data.wilEuthanasie != null ? String(data.wilEuthanasie) : "",
            situatieBeschrijving: (data.situatieBeschrijving as string) ?? "",
            huisarts: (data.huisarts as string) ?? "",
            huisartsPraktijk: (data.huisartsPraktijk as string) ?? "",
            huisartsTelefoon: (data.huisartsTelefoon as string) ?? "",
            huisartsEmail: (data.huisartsEmail as string) ?? "",
            vertegenwoordigerNaam: (data.vertegenwoordigerNaam as string) ?? "",
            vertegenwoordigerRelatie: (data.vertegenwoordigerRelatie as string) ?? "",
            vertegenwoordigerTelefoon: (data.vertegenwoordigerTelefoon as string) ?? "",
            vertegenwoordigerEmail: (data.vertegenwoordigerEmail as string) ?? "",
            vertegenwoordigerAdres: (data.vertegenwoordigerAdres as string) ?? "",
            vertegenwoordigerPostcode: (data.vertegenwoordigerPostcode as string) ?? "",
            vertegenwoordigerWoonplaats: (data.vertegenwoordigerWoonplaats as string) ?? "",
            aanvullendeWensen: (data.aanvullendeWensen as string) ?? "",
            datumOndertekening: data.datumOndertekening
              ? new Date(data.datumOndertekening as string).toISOString().split("T")[0]
              : "",
            dementieClausule: data.dementieClausule != null ? String(data.dementieClausule) : "",
            dementieClausuleToelichting: (data.dementieClausuleToelichting as string) ?? "",
            behandelVerbod: (data.behandelVerbod as string) ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const downloadWilsverklaringPdf = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/export/wilsverklaring", { method: "POST" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lumio-wilsverklaring.pdf";
      a.click();
      URL.revokeObjectURL(url);
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
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
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
          <div className="space-y-2">
            <Label>{t("keuze.situatieLabel")}</Label>
            <Textarea
              value={form.situatieBeschrijving}
              onChange={(e) => update("situatieBeschrijving", e.target.value)}
              placeholder={t("keuze.situatiePlaceholder")}
              rows={4}
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
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
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
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
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
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("vertegenwoordiger.naamLabel")}</Label>
            <Input
              value={form.vertegenwoordigerNaam}
              onChange={(e) => update("vertegenwoordigerNaam", e.target.value)}
              placeholder={t("vertegenwoordiger.naamPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("vertegenwoordiger.relatieLabel")}</Label>
            <Select
              value={form.vertegenwoordigerRelatie}
              onChange={(e) =>
                update("vertegenwoordigerRelatie", e.target.value)
              }
            >
              <option value="">{t("vertegenwoordiger.selecteer")}</option>
              <option value="Partner">{t("vertegenwoordiger.partner")}</option>
              <option value="Kind">{t("vertegenwoordiger.kind")}</option>
              <option value="Ouder">{t("vertegenwoordiger.ouder")}</option>
              <option value="Broer/Zus">{t("vertegenwoordiger.broerZus")}</option>
              <option value="Vriend">{t("vertegenwoordiger.vriend")}</option>
              <option value="Anders">{t("vertegenwoordiger.anders")}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("vertegenwoordiger.telefoonLabel")}</Label>
            <Input
              value={form.vertegenwoordigerTelefoon}
              onChange={(e) =>
                update("vertegenwoordigerTelefoon", e.target.value)
              }
              placeholder={t("vertegenwoordiger.telefoonPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("vertegenwoordiger.emailLabel")}</Label>
            <Input
              value={form.vertegenwoordigerEmail}
              onChange={(e) =>
                update("vertegenwoordigerEmail", e.target.value)
              }
              placeholder={t("vertegenwoordiger.emailPlaceholder")}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-2">
              <Label>{t("vertegenwoordiger.adresLabel")}</Label>
              <Input
                value={form.vertegenwoordigerAdres}
                onChange={(e) =>
                  update("vertegenwoordigerAdres", e.target.value)
                }
                placeholder={t("vertegenwoordiger.adresPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("vertegenwoordiger.postcodeLabel")}</Label>
              <Input
                value={form.vertegenwoordigerPostcode}
                onChange={(e) =>
                  update("vertegenwoordigerPostcode", e.target.value)
                }
                placeholder={t("vertegenwoordiger.postcodePlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("vertegenwoordiger.woonplaatsLabel")}</Label>
            <Input
              value={form.vertegenwoordigerWoonplaats}
              onChange={(e) =>
                update("vertegenwoordigerWoonplaats", e.target.value)
              }
              placeholder={t("vertegenwoordiger.woonplaatsPlaceholder")}
            />
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
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-sm text-purple-800">
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
            {form.situatieBeschrijving && (
              <div>
                <span className="font-medium">{t("samenvatting.summarySituatie")}</span>{" "}
                {form.situatieBeschrijving}
              </div>
            )}
            <div>
              <span className="font-medium">{t("samenvatting.summaryDementie")}</span>{" "}
              {form.dementieClausule === "true"
                ? t("samenvatting.summaryJa")
                : form.dementieClausule === "false"
                ? t("samenvatting.summaryNee")
                : "—"}
            </div>
            {form.dementieClausuleToelichting && (
              <div>
                <span className="font-medium">{t("samenvatting.summaryToelichting")}</span>{" "}
                {form.dementieClausuleToelichting}
              </div>
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

  const handleComplete = async () => {
    await api.put("/api/euthanasie", {
      ...form,
      wilEuthanasie: form.wilEuthanasie === "true",
      datumOndertekening: form.datumOndertekening || null,
      dementieClausule: form.dementieClausule === "true",
      dementieClausuleToelichting: form.dementieClausuleToelichting || null,
      behandelVerbod: form.behandelVerbod || null,
    });
    router.push("/euthanasie");
  };

  if (loading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">{t("laden")}</p></div>;

  return (
    <WizardShell
      titel={t("titel")}
      stappen={stappen}
      onComplete={handleComplete}
      onCancel={() => router.push("/euthanasie")}
    />
  );
}
