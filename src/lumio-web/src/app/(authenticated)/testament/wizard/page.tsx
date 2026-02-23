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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

export default function TestamentWizardPage() {
  const router = useRouter();
  const t = useTranslations("testamentWizard");
  const [form, setForm] = useState({
    testamentType: "",
    notarisNaam: "",
    notarisKantoor: "",
    notarisTelefoon: "",
    notarisEmail: "",
    notarisAdres: "",
    notarisPostcode: "",
    notarisPlaats: "",
    datumTestament: "",
    testamentLocatie: "",
    ctr_Nummer: "",
    algemeneWensen: "",
    bijzondereBepalingen: "",
    uitsluitingsClausule: "true",
    legaten: "",
  });

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get<Record<string, unknown>>("/api/testament")
      .then((data) => {
        if (data) {
          setForm({
            testamentType: (data.testamentType as string) ?? "",
            notarisNaam: (data.notarisNaam as string) ?? "",
            notarisKantoor: (data.notarisKantoor as string) ?? "",
            notarisTelefoon: (data.notarisTelefoon as string) ?? "",
            notarisEmail: (data.notarisEmail as string) ?? "",
            notarisAdres: (data.notarisAdres as string) ?? "",
            notarisPostcode: (data.notarisPostcode as string) ?? "",
            notarisPlaats: (data.notarisPlaats as string) ?? "",
            datumTestament: data.datumTestament
              ? new Date(data.datumTestament as string).toISOString().split("T")[0]
              : "",
            testamentLocatie: (data.testamentLocatie as string) ?? "",
            ctr_Nummer: (data.ctr_Nummer as string) ?? "",
            algemeneWensen: (data.algemeneWensen as string) ?? "",
            bijzondereBepalingen: (data.bijzondereBepalingen as string) ?? "",
            uitsluitingsClausule: data.uitsluitingsClausule != null ? String(data.uitsluitingsClausule) : "true",
            legaten: (data.legaten as string) ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const downloadConceptPdf = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/export/testament-concept", { method: "POST" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lumio-testament-concept.pdf";
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
      id: "type",
      titel: t("type.titel"),
      beschrijving: t("type.beschrijving"),
      content: (
        <div className="space-y-4">
          <Alert variant="info">
            <AlertDescription>
              <strong>{t("type.wettelijkKader")}</strong> {t("type.wettelijkKaderTekst")}
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label>{t("type.typeLabel")}</Label>
            <HelpTooltip tekst={t("type.typeTooltip")} />
            <Select
              value={form.testamentType}
              onChange={(e) => update("testamentType", e.target.value)}
            >
              <option value="">{t("type.selecteer")}</option>
              <option value="Notarieel">{t("type.notarieel")}</option>
              <option value="Onderhands">{t("type.onderhands")}</option>
              <option value="Nog niet opgesteld">{t("type.nogNietOpgesteld")}</option>
            </Select>
          </div>
        </div>
      ),
    },
    {
      id: "notaris",
      titel: t("notaris.titel"),
      beschrijving: t("notaris.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("notaris.naamNotaris")}</Label>
              <Input value={form.notarisNaam} onChange={(e) => update("notarisNaam", e.target.value)} placeholder={t("notaris.naamNotarisPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("notaris.notarisKantoor")}</Label>
              <Input value={form.notarisKantoor} onChange={(e) => update("notarisKantoor", e.target.value)} placeholder={t("notaris.notarisKantoorPlaceholder")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("notaris.telefoon")}</Label>
              <Input value={form.notarisTelefoon} onChange={(e) => update("notarisTelefoon", e.target.value)} placeholder={t("notaris.telefoonPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("notaris.email")}</Label>
              <Input value={form.notarisEmail} onChange={(e) => update("notarisEmail", e.target.value)} placeholder={t("notaris.emailPlaceholder")} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>{t("notaris.adres")}</Label>
              <Input value={form.notarisAdres} onChange={(e) => update("notarisAdres", e.target.value)} placeholder={t("notaris.adresPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("notaris.postcode")}</Label>
              <Input value={form.notarisPostcode} onChange={(e) => update("notarisPostcode", e.target.value)} placeholder={t("notaris.postcodePlaceholder")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("notaris.plaats")}</Label>
            <Input value={form.notarisPlaats} onChange={(e) => update("notarisPlaats", e.target.value)} placeholder={t("notaris.plaatsPlaceholder")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("notaris.datumTestament")}</Label>
              <Input type="date" value={form.datumTestament} onChange={(e) => update("datumTestament", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("notaris.ctrNummer")}</Label>
              <Input value={form.ctr_Nummer} onChange={(e) => update("ctr_Nummer", e.target.value)} placeholder={t("notaris.ctrNummerPlaceholder")} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "locatie",
      titel: t("locatie.titel"),
      beschrijving: t("locatie.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("locatie.bewaarLocatieLabel")}</Label>
            <Input value={form.testamentLocatie} onChange={(e) => update("testamentLocatie", e.target.value)} placeholder={t("locatie.bewaarLocatiePlaceholder")} />
          </div>
        </div>
      ),
    },
    {
      id: "uitsluitingsclausule",
      titel: t("uitsluitingsclausule.titel"),
      beschrijving: t("uitsluitingsclausule.beschrijving"),
      content: (
        <div className="space-y-4">
          <Alert variant="warning">
            <AlertDescription>
              <strong>{t("uitsluitingsclausule.aanbevolen")}</strong> {t("uitsluitingsclausule.aanbevolenTekst")}
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label>{t("uitsluitingsclausule.label")}</Label>
            <HelpTooltip tekst={t("uitsluitingsclausule.tooltip")} />
            <Select
              value={form.uitsluitingsClausule}
              onChange={(e) => update("uitsluitingsClausule", e.target.value)}
            >
              <option value="true">{t("uitsluitingsclausule.ja")}</option>
              <option value="false">{t("uitsluitingsclausule.nee")}</option>
            </Select>
          </div>
        </div>
      ),
    },
    {
      id: "legaten",
      titel: t("legaten.titel"),
      beschrijving: t("legaten.beschrijving"),
      content: (
        <div className="space-y-4">
          <Alert variant="info">
            <AlertDescription>
              <strong>{t("legaten.legatenInfo")}</strong> {t("legaten.legatenInfoTekst")}
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label>{t("legaten.legatenLabel")}</Label>
            <Textarea
              value={form.legaten}
              onChange={(e) => update("legaten", e.target.value)}
              placeholder={t("legaten.legatenPlaceholder")}
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("legaten.bijzondereBepalingenLabel")}</Label>
            <Textarea
              value={form.bijzondereBepalingen}
              onChange={(e) => update("bijzondereBepalingen", e.target.value)}
              placeholder={t("legaten.bijzondereBepalingenPlaceholder")}
              rows={4}
            />
          </div>
        </div>
      ),
    },
    {
      id: "wensen",
      titel: t("wensen.titel"),
      beschrijving: t("wensen.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("wensen.label")}</Label>
            <Textarea
              value={form.algemeneWensen}
              onChange={(e) => update("algemeneWensen", e.target.value)}
              placeholder={t("wensen.placeholder")}
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
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>{t("samenvatting.disclaimer")}</strong> {t("samenvatting.disclaimerTekst")}
            </p>
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <div><span className="font-medium">{t("samenvatting.summaryType")}</span> {form.testamentType || "—"}</div>
            <div><span className="font-medium">{t("samenvatting.summaryNotaris")}</span> {form.notarisNaam || "—"} ({form.notarisKantoor || "—"})</div>
            {form.notarisTelefoon && <div><span className="font-medium">{t("samenvatting.summaryTelNotaris")}</span> {form.notarisTelefoon}</div>}
            <div><span className="font-medium">{t("samenvatting.summaryDatum")}</span> {form.datumTestament || "—"}</div>
            <div><span className="font-medium">{t("samenvatting.summaryCtr")}</span> {form.ctr_Nummer || "—"}</div>
            <div><span className="font-medium">{t("samenvatting.summaryLocatie")}</span> {form.testamentLocatie || "—"}</div>
            <div><span className="font-medium">{t("samenvatting.summaryUitsluitingsclausule")}</span> {form.uitsluitingsClausule === "true" ? t("samenvatting.summaryJa") : t("samenvatting.summaryNee")}</div>
          </div>
          {form.legaten && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">{t("samenvatting.summaryLegaten")}</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{form.legaten}</div>
            </div>
          )}
          {form.bijzondereBepalingen && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">{t("samenvatting.summaryBijzondereBepalingen")}</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{form.bijzondereBepalingen}</div>
            </div>
          )}
          {form.algemeneWensen && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">{t("samenvatting.summaryAlgemeneWensen")}</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{form.algemeneWensen}</div>
            </div>
          )}
          <div className="pt-2">
            <Button variant="outline" onClick={downloadConceptPdf} disabled={generating}>
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
    await api.put("/api/testament", {
      ...form,
      datumTestament: form.datumTestament || null,
      notarisTelefoon: form.notarisTelefoon || null,
      notarisEmail: form.notarisEmail || null,
      notarisAdres: form.notarisAdres || null,
      notarisPostcode: form.notarisPostcode || null,
      notarisPlaats: form.notarisPlaats || null,
      uitsluitingsClausule: form.uitsluitingsClausule === "true",
      legaten: form.legaten || null,
    });
    router.push("/testament");
  };

  if (loading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">{t("laden")}</p></div>;

  return (
    <WizardShell
      titel={t("titel")}
      stappen={stappen}
      onComplete={handleComplete}
      onCancel={() => router.push("/testament")}
    />
  );
}
