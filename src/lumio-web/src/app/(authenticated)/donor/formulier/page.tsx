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

export default function DonorFormulierPage() {
  const router = useRouter();
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
      api.get<{ keuze: string; isGeregistreerdBijDonorregister: boolean; donorregisterReferentie: string; toelichting: string }>("/api/donor").catch(() => null),
      api.get<{ id: string; orgaan: string; welDoneren: boolean }[]>("/api/donor/orgaankeuzes").catch(() => null),
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
      titel: "Uw Donorkeuze",
      beschrijving:
        "Registreer hier uw donorkeuze. Vergeet niet om dit ook officieel te melden bij het Donorregister.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Keuze</Label>
            <HelpTooltip tekst="Uw donorkeuze wordt opgeslagen in Lumio als persoonlijk overzicht. Vergeet niet uw keuze ook officieel te registreren bij het Donorregister (donorregister.nl). Alleen de officiële registratie is juridisch bindend." />
            <Select
              value={form.keuze}
              onChange={(e) => update("keuze", e.target.value)}
            >
              <option value="">Selecteer...</option>
              <option value="Ja, alles">Ja, ik geef alles voor transplantatie</option>
              <option value="Ja, specifiek">Ja, specifieke organen/weefsels</option>
              <option value="Nee">Nee, ik wil geen donor zijn</option>
              <option value="Nabestaanden beslissen">Mijn nabestaanden beslissen</option>
              <option value="Specifiek persoon beslist">Een specifiek persoon beslist</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Geregistreerd bij Donorregister?</Label>
            <Select
              value={form.isGeregistreerdBijDonorregister}
              onChange={(e) =>
                update("isGeregistreerdBijDonorregister", e.target.value)
              }
            >
              <option value="">Selecteer...</option>
              <option value="true">Ja</option>
              <option value="false">Nee</option>
            </Select>
          </div>
          {form.isGeregistreerdBijDonorregister === "true" && (
            <div className="space-y-2">
              <Label>Referentienummer Donorregister</Label>
              <Input
                value={form.donorregisterReferentie}
                onChange={(e) =>
                  update("donorregisterReferentie", e.target.value)
                }
                placeholder="Uw referentienummer"
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "organen",
      titel: "Orgaankeuzes",
      beschrijving:
        "Geef per orgaan/weefsel aan of u dit wilt doneren. (Alleen relevant bij 'specifieke organen')",
      content: (
        <div className="space-y-2">
          {organen.map((orgaan) => (
            <div
              key={orgaan}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <span className="text-sm">{orgaan}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleOrgaan(orgaan, true)}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    orgaanKeuzes[orgaan] === true
                      ? "bg-green-100 text-green-800 ring-1 ring-green-300"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Ja
                </button>
                <button
                  type="button"
                  onClick={() => toggleOrgaan(orgaan, false)}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    orgaanKeuzes[orgaan] === false
                      ? "bg-red-100 text-red-800 ring-1 ring-red-300"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Nee
                </button>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "toelichting",
      titel: "Toelichting",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Toelichting</Label>
            <Textarea
              value={form.toelichting}
              onChange={(e) => update("toelichting", e.target.value)}
              placeholder="Eventuele aanvullende toelichting bij uw donorkeuze..."
              rows={4}
            />
          </div>
        </div>
      ),
    },
    {
      id: "samenvatting",
      titel: "Samenvatting",
      beschrijving: "Controleer uw gegevens voordat u opslaat.",
      content: (
        <div className="space-y-3 text-sm">
          <div className="rounded-lg border p-4 space-y-2">
            <div>
              <span className="font-medium">Keuze:</span>{" "}
              {form.keuze || "—"}
            </div>
            <div>
              <span className="font-medium">Donorregister:</span>{" "}
              {form.isGeregistreerdBijDonorregister === "true"
                ? "Ja"
                : form.isGeregistreerdBijDonorregister === "false"
                ? "Nee"
                : "—"}
            </div>
            {form.donorregisterReferentie && (
              <div>
                <span className="font-medium">Referentie:</span>{" "}
                {form.donorregisterReferentie}
              </div>
            )}
          </div>
          {Object.keys(orgaanKeuzes).length > 0 && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-2">Orgaankeuzes:</div>
              <div className="space-y-1">
                {Object.entries(orgaanKeuzes).map(([orgaan, keuze]) => (
                  <div key={orgaan} className="flex justify-between">
                    <span>{orgaan}</span>
                    <span
                      className={
                        keuze ? "text-green-600" : "text-red-600"
                      }
                    >
                      {keuze ? "Ja" : "Nee"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {form.toelichting && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">Toelichting:</div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {form.toelichting}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleComplete = async () => {
    await api.put("/api/donor", {
      keuze: form.keuze,
      isGeregistreerdBijDonorregister:
        form.isGeregistreerdBijDonorregister === "true",
      donorregisterReferentie: form.donorregisterReferentie || null,
      toelichting: form.toelichting || null,
    });

    // Delete existing orgaankeuzes to prevent duplicates
    const bestaande = await api.get<{ id: string }[]>("/api/donor/orgaankeuzes");
    for (const item of bestaande ?? []) {
      await api.delete(`/api/donor/orgaankeuzes/${item.id}`);
    }

    // Create new orgaankeuzes
    const orgaanEntries = Object.entries(orgaanKeuzes).filter(
      ([, v]) => v !== null
    );
    for (const [orgaan, welDoneren] of orgaanEntries) {
      await api.post("/api/donor/orgaankeuzes", {
        orgaan,
        welDoneren,
      });
    }

    router.push("/donor");
  };

  if (loading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Laden...</p></div>;

  return (
    <WizardShell
      titel="Donorregistratie"
      stappen={stappen}
      onComplete={handleComplete}
      onCancel={() => router.push("/donor")}
    />
  );
}
