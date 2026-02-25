"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell, type WizardStep } from "@/components/wizard/WizardShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";

const organen = [
  "Hart",
  "Longen",
  "Lever",
  "Nieren",
  "Alvleesklier",
  "Dunne darm",
  "Hoornvliezen",
  "Huid",
  "Botweefsel",
  "Hartkleppen",
  "Bloedvaten",
];

const organenKeys: Record<string, string> = {
  "Hart": "hart",
  "Longen": "longen",
  "Lever": "lever",
  "Nieren": "nieren",
  "Alvleesklier": "alvleesklier",
  "Dunne darm": "dunneDarm",
  "Hoornvliezen": "hoornvliezen",
  "Huid": "huid",
  "Botweefsel": "botweefsel",
  "Hartkleppen": "hartkleppen",
  "Bloedvaten": "bloedvaten",
};

export default function DonorFormulierPage() {
  const router = useRouter();
  const t = useTranslations("donorWizard");
  const [form, setForm] = useState({
    keuze: "",
    isGeregistreerdBijDonorregister: "",
    donorregisterReferentie: "",
    toelichting: "",
  });
  const [orgaanKeuzes, setOrgaanKeuzes] = useState<
    Record<string, boolean | null>
  >({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ keuze: string; isGeregistreerdBijDonorregister: boolean; donorregisterReferentie: string; toelichting: string }>("/api/donor").catch((err) => { console.error("Failed to load donor:", err); return null; }),
      api.get<{ id: string; orgaan: string; welDoneren: boolean }[]>("/api/donor/orgaankeuzes").catch((err) => { console.error("Failed to load orgaankeuzes:", err); return null; }),
    ])
      .then(([donorData, orgaanData]) => {
        if (donorData) {
          setForm({
            keuze: donorData.keuze ?? "",
            isGeregistreerdBijDonorregister: donorData.isGeregistreerdBijDonorregister != null ? String(donorData.isGeregistreerdBijDonorregister) : "",
            donorregisterReferentie: donorData.donorregisterReferentie ?? "",
            toelichting: donorData.toelichting ?? "",
          });
        }
        if (Array.isArray(orgaanData)) {
          const mapped: Record<string, boolean> = {};
          for (const item of orgaanData) {
            mapped[item.orgaan] = item.welDoneren;
          }
          setOrgaanKeuzes(mapped);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleOrgaan = (orgaan: string, value: boolean) => {
    setOrgaanKeuzes((prev) => ({ ...prev, [orgaan]: value }));
  };

  const stappen: WizardStep[] = [
    {
      id: "keuze",
      titel: t("keuze.titel"),
      beschrijving: t("keuze.beschrijving"),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("keuze.keuzeLabel")}</Label>
            <HelpTooltip tekst={t("keuze.keuzeTooltip")} />
            <Select
              value={form.keuze}
              onChange={(e) => update("keuze", e.target.value)}
            >
              <option value="">{t("keuze.selecteer")}</option>
              <option value="Ja, alles">{t("keuze.jaAlles")}</option>
              <option value="Ja, specifiek">{t("keuze.jaSpecifiek")}</option>
              <option value="Nee">{t("keuze.nee")}</option>
              <option value="Nabestaanden beslissen">{t("keuze.nabestaanden")}</option>
              <option value="Specifiek persoon beslist">{t("keuze.specifiekPersoon")}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("keuze.donorregisterLabel")}</Label>
            <Select
              value={form.isGeregistreerdBijDonorregister}
              onChange={(e) =>
                update("isGeregistreerdBijDonorregister", e.target.value)
              }
            >
              <option value="">{t("keuze.selecteer")}</option>
              <option value="true">{t("keuze.donorregisterJa")}</option>
              <option value="false">{t("keuze.donorregisterNee")}</option>
            </Select>
          </div>
          {form.isGeregistreerdBijDonorregister === "true" && (
            <div className="space-y-2">
              <Label>{t("keuze.referentieLabel")}</Label>
              <Input
                value={form.donorregisterReferentie}
                onChange={(e) =>
                  update("donorregisterReferentie", e.target.value)
                }
                placeholder={t("keuze.referentiePlaceholder")}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "organen",
      titel: t("orgaankeuzes.titel"),
      beschrijving: t("orgaankeuzes.beschrijving"),
      content: (
        <div className="space-y-2">
          {organen.map((orgaan) => (
            <div
              key={orgaan}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <span className="text-sm">{t(`organen.${organenKeys[orgaan]}`)}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleOrgaan(orgaan, true)}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    orgaanKeuzes[orgaan] === true
                      ? "bg-success-100 dark:bg-success/20 text-success ring-1 ring-success"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("orgaankeuzes.ja")}
                </button>
                <button
                  type="button"
                  onClick={() => toggleOrgaan(orgaan, false)}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    orgaanKeuzes[orgaan] === false
                      ? "bg-danger-100 dark:bg-danger/20 text-danger ring-1 ring-danger"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("orgaankeuzes.nee")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "toelichting",
      titel: t("toelichting.titel"),
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("toelichting.label")}</Label>
            <Textarea
              value={form.toelichting}
              onChange={(e) => update("toelichting", e.target.value)}
              placeholder={t("toelichting.placeholder")}
              rows={4}
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
              <span className="font-medium">{t("samenvatting.summaryKeuze")}</span>{" "}
              {form.keuze || "—"}
            </div>
            <div>
              <span className="font-medium">{t("samenvatting.summaryDonorregister")}</span>{" "}
              {form.isGeregistreerdBijDonorregister === "true"
                ? t("samenvatting.summaryJa")
                : form.isGeregistreerdBijDonorregister === "false"
                ? t("samenvatting.summaryNee")
                : "—"}
            </div>
            {form.donorregisterReferentie && (
              <div>
                <span className="font-medium">{t("samenvatting.summaryReferentie")}</span>{" "}
                {form.donorregisterReferentie}
              </div>
            )}
          </div>
          {Object.keys(orgaanKeuzes).length > 0 && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-2">{t("samenvatting.summaryOrgaankeuzes")}</div>
              <div className="space-y-1">
                {Object.entries(orgaanKeuzes).map(([orgaan, keuze]) => (
                  <div key={orgaan} className="flex justify-between">
                    <span>{t(`organen.${organenKeys[orgaan]}`)}</span>
                    <span
                      className={
                        keuze ? "text-success" : "text-danger"
                      }
                    >
                      {keuze ? t("samenvatting.summaryJa") : t("samenvatting.summaryNee")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {form.toelichting && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">{t("samenvatting.summaryToelichting")}</div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {form.toelichting}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ].filter(
    // S5-08: Verberg organen-stap tenzij de keuze 'Ja, specifiek' is
    (stap) => !(stap.id === "organen" && form.keuze !== "Ja, specifiek")
  );

  const handleComplete = async () => {
    await api.put("/api/donor", {
      keuze: form.keuze,
      isGeregistreerdBijDonorregister:
        form.isGeregistreerdBijDonorregister === "true",
      donorregisterReferentie: form.donorregisterReferentie || null,
      toelichting: form.toelichting || null,
    });

    // Atomically replace all orgaankeuzes via batch endpoint
    const orgaanEntries = Object.entries(orgaanKeuzes).filter(
      ([, v]) => v !== null
    );
    const batchKeuzes = orgaanEntries.map(([orgaan, welDoneren]) => ({
      orgaan,
      welDoneren,
    }));
    await api.put("/api/donor/orgaankeuzes/batch", batchKeuzes);

    router.push("/donor");
  };

  if (loading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">{t("laden")}</p></div>;

  return (
    <WizardShell
      titel={t("titel")}
      stappen={stappen}
      onComplete={handleComplete}
      onCancel={() => router.push("/donor")}
    />
  );
}
