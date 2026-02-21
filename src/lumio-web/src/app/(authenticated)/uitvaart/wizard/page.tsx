"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell, type WizardStep } from "@/components/wizard/WizardShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api-client";

export default function UitvaartWizardPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    voorkeurType: "",
    begraafplaats: "",
    uitvaartOndernemer: "",
    heeftUitvaartVerzekering: "false",
    uitvaartVerzekeringDetails: "",
    ceremonieSoort: "",
    ceremonieLocatie: "",
    muziekwensen: "",
    sprekers: "",
    bloemen: "",
    kledingwensen: "",
    rouwkaartTekst: "",
    condoleance: "",
    overigeWensen: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ voorkeurType: string; begraafplaats: string; uitvaartOndernemer: string; heeftUitvaartVerzekering: boolean; uitvaartVerzekeringDetails: string; ceremonieSoort: string; ceremonieLocatie: string; muziekwensen: string; sprekers: string; bloemen: string; kledingwensen: string; rouwkaartTekst: string; condoleance: string; overigeWensen: string }>("/api/uitvaart")
      .then((data) => {
        if (data) {
          setForm({
            voorkeurType: data.voorkeurType ?? "",
            begraafplaats: data.begraafplaats ?? "",
            uitvaartOndernemer: data.uitvaartOndernemer ?? "",
            heeftUitvaartVerzekering: data.heeftUitvaartVerzekering != null ? String(data.heeftUitvaartVerzekering) : "false",
            uitvaartVerzekeringDetails: data.uitvaartVerzekeringDetails ?? "",
            ceremonieSoort: data.ceremonieSoort ?? "",
            ceremonieLocatie: data.ceremonieLocatie ?? "",
            muziekwensen: data.muziekwensen ?? "",
            sprekers: data.sprekers ?? "",
            bloemen: data.bloemen ?? "",
            kledingwensen: data.kledingwensen ?? "",
            rouwkaartTekst: data.rouwkaartTekst ?? "",
            condoleance: data.condoleance ?? "",
            overigeWensen: data.overigeWensen ?? "",
          });
        }
      })
      .catch(() => {}) // 404 = no data yet
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const stappen: WizardStep[] = [
    {
      id: "type",
      titel: "Type Uitvaart",
      beschrijving: "Wat is uw voorkeur voor de uitvaart?",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Voorkeur type</Label>
            <Select
              value={form.voorkeurType}
              onChange={(e) => update("voorkeurType", e.target.value)}
            >
              <option value="">Selecteer...</option>
              <option value="Begrafenis">Begrafenis</option>
              <option value="Crematie">Crematie</option>
              <option value="Natuurbegraven">Natuurbegraven</option>
              <option value="Resomatie">Resomatie (watercrematie)</option>
              <option value="Geen voorkeur">Geen voorkeur</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Begraafplaats / locatie</Label>
            <Input
              value={form.begraafplaats}
              onChange={(e) => update("begraafplaats", e.target.value)}
              placeholder="bijv. Begraafplaats Zorgvlied, Amsterdam"
            />
          </div>
          <div className="space-y-2">
            <Label>Uitvaartondernemer</Label>
            <Input
              value={form.uitvaartOndernemer}
              onChange={(e) => update("uitvaartOndernemer", e.target.value)}
              placeholder="bijv. Monuta, DELA of een lokale uitvaartondernemer"
            />
          </div>
          <div className="space-y-2">
            <Label>Heeft u een uitvaartverzekering?</Label>
            <Select
              value={form.heeftUitvaartVerzekering}
              onChange={(e) => update("heeftUitvaartVerzekering", e.target.value)}
            >
              <option value="false">Nee</option>
              <option value="true">Ja</option>
            </Select>
          </div>
          {form.heeftUitvaartVerzekering === "true" && (
            <div className="space-y-2">
              <Label>Verzekeringsdetails / polisnummer</Label>
              <Input
                value={form.uitvaartVerzekeringDetails}
                onChange={(e) => update("uitvaartVerzekeringDetails", e.target.value)}
                placeholder="Polisnummer en verzekeraar"
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "ceremonie",
      titel: "Ceremonie",
      beschrijving: "Hoe wilt u dat de ceremonie eruitziet?",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Soort ceremonie</Label>
            <Select
              value={form.ceremonieSoort}
              onChange={(e) => update("ceremonieSoort", e.target.value)}
            >
              <option value="">Selecteer...</option>
              <option value="Kerkelijk">Kerkelijk</option>
              <option value="Niet-kerkelijk">Niet-kerkelijk</option>
              <option value="Humanistisch">Humanistisch</option>
              <option value="Persoonlijk">Persoonlijk / op maat</option>
              <option value="Geen ceremonie">Geen ceremonie</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Locatie ceremonie</Label>
            <Input
              value={form.ceremonieLocatie}
              onChange={(e) => update("ceremonieLocatie", e.target.value)}
              placeholder="bijv. Aula, kerk, thuis"
            />
          </div>
          <div className="space-y-2">
            <Label>Muziekwensen</Label>
            <Textarea
              value={form.muziekwensen}
              onChange={(e) => update("muziekwensen", e.target.value)}
              placeholder="Welke muziek wilt u laten spelen? Bijv. specifieke nummers, live muziek..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Bloemen</Label>
            <Input
              value={form.bloemen}
              onChange={(e) => update("bloemen", e.target.value)}
              placeholder="bijv. Witte rozen, geen bloemen maar donatie aan..."
            />
          </div>
          <div className="space-y-2">
            <Label>Kledingwensen</Label>
            <Input
              value={form.kledingwensen}
              onChange={(e) => update("kledingwensen", e.target.value)}
              placeholder="bijv. Favoriet pak, casual kleding"
            />
          </div>
          <div className="space-y-2">
            <Label>Sprekers</Label>
            <Textarea
              value={form.sprekers}
              onChange={(e) => update("sprekers", e.target.value)}
              placeholder="Wie zou u willen als spreker(s)?"
              rows={2}
            />
          </div>
        </div>
      ),
    },
    {
      id: "rouwkaart",
      titel: "Rouwkaart & Condoleance",
      beschrijving: "Wensen voor de rouwkaart en condoleance.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tekst rouwkaart</Label>
            <Textarea
              value={form.rouwkaartTekst}
              onChange={(e) => update("rouwkaartTekst", e.target.value)}
              placeholder="Gewenste tekst of gedicht op de rouwkaart..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Condoleance</Label>
            <Textarea
              value={form.condoleance}
              onChange={(e) => update("condoleance", e.target.value)}
              placeholder="Wensen voor condoleance (adres, online platform, etc.)"
              rows={2}
            />
          </div>
        </div>
      ),
    },
    {
      id: "aanvullend",
      titel: "Aanvullende Wensen",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Overige wensen</Label>
            <Textarea
              value={form.overigeWensen}
              onChange={(e) => update("overigeWensen", e.target.value)}
              placeholder="Eventuele andere wensen voor uw uitvaart..."
              rows={5}
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
              <span className="font-medium">Type:</span>{" "}
              {form.voorkeurType || "—"}
            </div>
            <div>
              <span className="font-medium">Begraafplaats:</span>{" "}
              {form.begraafplaats || "—"}
            </div>
            <div>
              <span className="font-medium">Ondernemer:</span>{" "}
              {form.uitvaartOndernemer || "—"}
            </div>
            {form.ceremonieSoort && (
              <div>
                <span className="font-medium">Ceremonie:</span>{" "}
                {form.ceremonieSoort}
                {form.ceremonieLocatie && ` — ${form.ceremonieLocatie}`}
              </div>
            )}
            {form.kledingwensen && (
              <div>
                <span className="font-medium">Kleding:</span> {form.kledingwensen}
              </div>
            )}
          </div>
          {form.muziekwensen && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">Muziekwensen:</div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {form.muziekwensen}
              </div>
            </div>
          )}
          {form.rouwkaartTekst && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">Rouwkaart:</div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {form.rouwkaartTekst}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleComplete = async () => {
    await api.put("/api/uitvaart", {
      ...form,
      heeftUitvaartVerzekering: form.heeftUitvaartVerzekering === "true",
      begraafplaats: form.begraafplaats || null,
      uitvaartOndernemer: form.uitvaartOndernemer || null,
      uitvaartVerzekeringDetails: form.uitvaartVerzekeringDetails || null,
      ceremonieSoort: form.ceremonieSoort || null,
      ceremonieLocatie: form.ceremonieLocatie || null,
      muziekwensen: form.muziekwensen || null,
      sprekers: form.sprekers || null,
      bloemen: form.bloemen || null,
      kledingwensen: form.kledingwensen || null,
      rouwkaartTekst: form.rouwkaartTekst || null,
      condoleance: form.condoleance || null,
      overigeWensen: form.overigeWensen || null,
    });
    router.push("/uitvaart");
  };

  if (loading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Laden...</p></div>;

  return (
    <WizardShell
      titel="Uitvaartwensen"
      stappen={stappen}
      onComplete={handleComplete}
      onCancel={() => router.push("/uitvaart")}
    />
  );
}
