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

export default function EuthanasieWizardPage() {
  const router = useRouter();
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
      titel: "Uw Keuze",
      beschrijving:
        "Wilt u een wilsverklaring euthanasie vastleggen? Dit is conform de Wet toetsing levensbeëindiging (Wtl).",
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Wettelijk kader (Wtl art. 2):</strong> Euthanasie is in Nederland toegestaan wanneer aan alle zorgvuldigheidseisen is voldaan, waaronder een vrijwillig en weloverwogen verzoek en uitzichtloos en ondraaglijk lijden. Een schriftelijke wilsverklaring kan het mondeling verzoek vervangen.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Wilt u euthanasie?</Label>
            <Select
              value={form.wilEuthanasie}
              onChange={(e) => update("wilEuthanasie", e.target.value)}
            >
              <option value="">Selecteer...</option>
              <option value="true">
                Ja, ik wil een wilsverklaring euthanasie
              </option>
              <option value="false">
                Nee, ik wil geen euthanasie
              </option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>In welke situatie?</Label>
            <Textarea
              value={form.situatieBeschrijving}
              onChange={(e) => update("situatieBeschrijving", e.target.value)}
              placeholder="Beschrijf de situatie(s) waarin u euthanasie zou willen, bijv. bij uitzichtloos en ondraaglijk lijden, vergevorderde dementie..."
              rows={4}
            />
          </div>
        </div>
      ),
    },
    {
      id: "dementie",
      titel: "Dementie-clausule",
      beschrijving:
        "Een dementie-clausule specificeert uw wensen bij vergevorderde dementie, wanneer u mogelijk niet meer in staat bent uw wil te uiten.",
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>Let op:</strong> De dementie-clausule is juridisch complex. Artsen zijn niet verplicht hieraan gehoor te geven, maar het geeft wel een duidelijk kader voor uw wensen. Bespreek dit altijd met uw huisarts.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Dementie-clausule opnemen?</Label>
            <HelpTooltip tekst="Een dementie-clausule is een schriftelijke wilsverklaring waarin u aangeeft onder welke omstandigheden bij vergevorderde dementie u euthanasie wenst. Artsen zijn niet verplicht hieraan gehoor te geven, maar het biedt een duidelijk kader." />
            <Select
              value={form.dementieClausule}
              onChange={(e) => update("dementieClausule", e.target.value)}
            >
              <option value="">Selecteer...</option>
              <option value="true">Ja — ik wil een dementie-clausule</option>
              <option value="false">Nee — geen dementie-clausule</option>
            </Select>
          </div>
          {form.dementieClausule === "true" && (
            <div className="space-y-2">
              <Label>Toelichting dementie-clausule</Label>
              <Textarea
                value={form.dementieClausuleToelichting}
                onChange={(e) => update("dementieClausuleToelichting", e.target.value)}
                placeholder="Beschrijf in welke fase van dementie u euthanasie zou willen, bijv:&#10;- Wanneer ik mijn naasten niet meer herken&#10;- Wanneer ik niet meer zelfstandig kan eten of drinken&#10;- Wanneer ik opgenomen moet worden in een verpleeghuis"
                rows={5}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "behandelverbod",
      titel: "Behandelverbod",
      beschrijving:
        "Welke medische behandelingen wilt u weigeren als u niet meer in staat bent zelf te beslissen?",
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>WGBO art. 7:450 BW:</strong> U heeft het recht om medische behandelingen te weigeren. Een voorafgaande schriftelijke verklaring hierover wordt in principe gerespecteerd door zorgverleners.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Behandelverbod</Label>
            <HelpTooltip tekst="Een behandelverbod is een schriftelijke verklaring waarin u vastlegt welke medische behandelingen u weigert als u niet meer zelf kunt beslissen. Op grond van de WGBO (art. 7:450 BW) wordt dit in principe gerespecteerd door zorgverleners." />
            <Textarea
              value={form.behandelVerbod}
              onChange={(e) => update("behandelVerbod", e.target.value)}
              placeholder="Welke behandelingen weigert u? Bijvoorbeeld:&#10;- Reanimatie&#10;- Kunstmatige beademing&#10;- Kunstmatige voeding en vocht&#10;- Antibiotica bij levensbedreigende infectie&#10;- Opname op intensive care"
              rows={5}
            />
          </div>
        </div>
      ),
    },
    {
      id: "huisarts",
      titel: "Huisarts",
      beschrijving:
        "Gegevens van uw huisarts. De arts is degene die de zorgvuldigheidseisen toetst.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Naam huisarts</Label>
            <Input
              value={form.huisarts}
              onChange={(e) => update("huisarts", e.target.value)}
              placeholder="bijv. dr. A. Jansen"
            />
          </div>
          <div className="space-y-2">
            <Label>Praktijk</Label>
            <Input
              value={form.huisartsPraktijk}
              onChange={(e) => update("huisartsPraktijk", e.target.value)}
              placeholder="bijv. Huisartsenpraktijk Centrum"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Telefoon huisarts</Label>
              <Input
                value={form.huisartsTelefoon}
                onChange={(e) => update("huisartsTelefoon", e.target.value)}
                placeholder="Telefoonnummer"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail huisarts</Label>
              <Input
                value={form.huisartsEmail}
                onChange={(e) => update("huisartsEmail", e.target.value)}
                placeholder="E-mailadres"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "vertegenwoordiger",
      titel: "Vertegenwoordiger",
      beschrijving:
        "Wie mag namens u spreken als u dat zelf niet meer kunt? (conform WGBO art. 7:465 BW)",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Naam vertegenwoordiger</Label>
            <Input
              value={form.vertegenwoordigerNaam}
              onChange={(e) => update("vertegenwoordigerNaam", e.target.value)}
              placeholder="bijv. Maria Jansen"
            />
          </div>
          <div className="space-y-2">
            <Label>Relatie</Label>
            <Select
              value={form.vertegenwoordigerRelatie}
              onChange={(e) =>
                update("vertegenwoordigerRelatie", e.target.value)
              }
            >
              <option value="">Selecteer...</option>
              <option value="Partner">Partner</option>
              <option value="Kind">Kind</option>
              <option value="Ouder">Ouder</option>
              <option value="Broer/Zus">Broer/Zus</option>
              <option value="Vriend">Vriend(in)</option>
              <option value="Anders">Anders</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Telefoonnummer</Label>
            <Input
              value={form.vertegenwoordigerTelefoon}
              onChange={(e) =>
                update("vertegenwoordigerTelefoon", e.target.value)
              }
              placeholder="bijv. 06-12345678"
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              value={form.vertegenwoordigerEmail}
              onChange={(e) =>
                update("vertegenwoordigerEmail", e.target.value)
              }
              placeholder="E-mailadres"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-2">
              <Label>Adres</Label>
              <Input
                value={form.vertegenwoordigerAdres}
                onChange={(e) =>
                  update("vertegenwoordigerAdres", e.target.value)
                }
                placeholder="Straat en huisnummer"
              />
            </div>
            <div className="space-y-2">
              <Label>Postcode</Label>
              <Input
                value={form.vertegenwoordigerPostcode}
                onChange={(e) =>
                  update("vertegenwoordigerPostcode", e.target.value)
                }
                placeholder="1234 AB"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Woonplaats</Label>
            <Input
              value={form.vertegenwoordigerWoonplaats}
              onChange={(e) =>
                update("vertegenwoordigerWoonplaats", e.target.value)
              }
              placeholder="Woonplaats"
            />
          </div>
        </div>
      ),
    },
    {
      id: "aanvullend",
      titel: "Aanvullende Wensen",
      beschrijving: "Eventuele aanvullende wensen of opmerkingen.",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Aanvullende wensen</Label>
            <Textarea
              value={form.aanvullendeWensen}
              onChange={(e) => update("aanvullendeWensen", e.target.value)}
              placeholder="Overige wensen omtrent het levenseinde..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Datum ondertekening</Label>
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
      titel: "Samenvatting & Document",
      beschrijving: "Controleer uw gegevens en genereer een wilsverklaring.",
      content: (
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-sm text-purple-800">
              <strong>Disclaimer:</strong> Het gegenereerde document is een <em>schriftelijke wilsverklaring</em> conform de Wtl. Overhandig het aan uw huisarts en bespreek uw wensen. Herbevestig uw wilsverklaring regelmatig.
            </p>
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <div>
              <span className="font-medium">Wil euthanasie:</span>{" "}
              {form.wilEuthanasie === "true"
                ? "Ja"
                : form.wilEuthanasie === "false"
                ? "Nee"
                : "—"}
            </div>
            {form.situatieBeschrijving && (
              <div>
                <span className="font-medium">Situatie:</span>{" "}
                {form.situatieBeschrijving}
              </div>
            )}
            <div>
              <span className="font-medium">Dementie-clausule:</span>{" "}
              {form.dementieClausule === "true"
                ? "Ja"
                : form.dementieClausule === "false"
                ? "Nee"
                : "—"}
            </div>
            {form.dementieClausuleToelichting && (
              <div>
                <span className="font-medium">Toelichting:</span>{" "}
                {form.dementieClausuleToelichting}
              </div>
            )}
            {form.behandelVerbod && (
              <div>
                <span className="font-medium">Behandelverbod:</span>{" "}
                {form.behandelVerbod}
              </div>
            )}
            <div>
              <span className="font-medium">Huisarts:</span>{" "}
              {form.huisarts || "—"} ({form.huisartsPraktijk || "—"})
            </div>
            {(form.huisartsTelefoon || form.huisartsEmail) && (
              <div>
                {form.huisartsTelefoon && <span className="mr-4">Tel: {form.huisartsTelefoon}</span>}
                {form.huisartsEmail && <span>E-mail: {form.huisartsEmail}</span>}
              </div>
            )}
            <div>
              <span className="font-medium">Vertegenwoordiger:</span>{" "}
              {form.vertegenwoordigerNaam || "—"} (
              {form.vertegenwoordigerRelatie || "—"})
            </div>
            {form.vertegenwoordigerAdres && (
              <div>
                <span className="font-medium">Adres:</span>{" "}
                {form.vertegenwoordigerAdres}
                {form.vertegenwoordigerPostcode && `, ${form.vertegenwoordigerPostcode}`}
                {form.vertegenwoordigerWoonplaats && ` ${form.vertegenwoordigerWoonplaats}`}
              </div>
            )}
            {form.datumOndertekening && (
              <div>
                <span className="font-medium">Datum:</span>{" "}
                {form.datumOndertekening}
              </div>
            )}
          </div>
          {form.aanvullendeWensen && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">Aanvullende wensen:</div>
              <div className="text-muted-foreground whitespace-pre-wrap">
                {form.aanvullendeWensen}
              </div>
            </div>
          )}
          <div className="pt-2">
            <Button variant="outline" onClick={downloadWilsverklaringPdf} disabled={generating}>
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Genereren...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> Wilsverklaring downloaden (PDF)</>
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

  if (loading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Laden...</p></div>;

  return (
    <WizardShell
      titel="Wilsverklaring Euthanasie"
      stappen={stappen}
      onComplete={handleComplete}
      onCancel={() => router.push("/euthanasie")}
    />
  );
}
