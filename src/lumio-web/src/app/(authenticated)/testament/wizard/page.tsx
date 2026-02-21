"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell, type WizardStep } from "@/components/wizard/WizardShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { Download, Loader2 } from "lucide-react";

export default function TestamentWizardPage() {
  const router = useRouter();
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
      titel: "Type Testament",
      beschrijving: "Wat voor type testament heeft u of wilt u laten opstellen?",
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Wettelijk kader (Boek 4 BW):</strong> Nederland kent het <strong>notarieel testament</strong> (opgesteld door notaris, rechtsgeldig) en het <strong>codicil</strong> (eigenhandig geschreven, alleen voor legaten van roerende goederen). Lumio genereert een <em>concept-document</em> als voorbereiding op uw notarisbezoek.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Type testament</Label>
            <Select
              value={form.testamentType}
              onChange={(e) => update("testamentType", e.target.value)}
            >
              <option value="">Selecteer...</option>
              <option value="Notarieel">Notarieel testament</option>
              <option value="Onderhands">Onderhands (codicil)</option>
              <option value="Nog niet opgesteld">Nog niet opgesteld</option>
            </Select>
          </div>
        </div>
      ),
    },
    {
      id: "notaris",
      titel: "Notaris Gegevens",
      beschrijving: "Gegevens van uw notaris (indien van toepassing)",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Naam notaris</Label>
              <Input value={form.notarisNaam} onChange={(e) => update("notarisNaam", e.target.value)} placeholder="bijv. mr. J. de Vries" />
            </div>
            <div className="space-y-2">
              <Label>Notariskantoor</Label>
              <Input value={form.notarisKantoor} onChange={(e) => update("notarisKantoor", e.target.value)} placeholder="bijv. De Vries & Partners" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefoon</Label>
              <Input value={form.notarisTelefoon} onChange={(e) => update("notarisTelefoon", e.target.value)} placeholder="Telefoonnummer notaris" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={form.notarisEmail} onChange={(e) => update("notarisEmail", e.target.value)} placeholder="E-mailadres notaris" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Adres</Label>
              <Input value={form.notarisAdres} onChange={(e) => update("notarisAdres", e.target.value)} placeholder="Straat en huisnummer" />
            </div>
            <div className="space-y-2">
              <Label>Postcode</Label>
              <Input value={form.notarisPostcode} onChange={(e) => update("notarisPostcode", e.target.value)} placeholder="1234 AB" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Plaats</Label>
            <Input value={form.notarisPlaats} onChange={(e) => update("notarisPlaats", e.target.value)} placeholder="Plaats" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Datum testament</Label>
              <Input type="date" value={form.datumTestament} onChange={(e) => update("datumTestament", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CTR Nummer</Label>
              <Input value={form.ctr_Nummer} onChange={(e) => update("ctr_Nummer", e.target.value)} placeholder="Centraal Testamentenregister" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "locatie",
      titel: "Bewaarlocatie",
      beschrijving: "Waar wordt het fysieke testament bewaard?",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Bewaarlocatie testament</Label>
            <Input value={form.testamentLocatie} onChange={(e) => update("testamentLocatie", e.target.value)} placeholder="bijv. Kluis bij notariskantoor" />
          </div>
        </div>
      ),
    },
    {
      id: "uitsluitingsclausule",
      titel: "Uitsluitingsclausule",
      beschrijving: "Een uitsluitingsclausule voorkomt dat erfenissen in een gemeenschap van goederen vallen bij scheiding.",
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>Aanbevolen:</strong> De uitsluitingsclausule is een veelgebruikte bepaling. Zonder deze clausule kan de erfenis bij een scheiding van uw erfgenaam worden verdeeld met diens ex-partner.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Uitsluitingsclausule opnemen?</Label>
            <Select
              value={form.uitsluitingsClausule}
              onChange={(e) => update("uitsluitingsClausule", e.target.value)}
            >
              <option value="true">Ja — erfenis valt buiten gemeenschap van goederen (aanbevolen)</option>
              <option value="false">Nee — geen uitsluitingsclausule</option>
            </Select>
          </div>
        </div>
      ),
    },
    {
      id: "legaten",
      titel: "Legaten & Bijzondere Bepalingen",
      beschrijving: "Specifieke goederen of bedragen toewijzen aan personen of organisaties",
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Legaten</strong> zijn specifieke toewijzingen van goederen of geldbedragen aan bepaalde personen of organisaties, los van de algemene erfverdeling. Bijvoorbeeld: &quot;Mijn horloge gaat naar mijn kleinzoon&quot; of &quot;€ 5.000 aan het Rode Kruis&quot;.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Legaten</Label>
            <Textarea
              value={form.legaten}
              onChange={(e) => update("legaten", e.target.value)}
              placeholder="Beschrijf specifieke legaten, bijv:&#10;- Mijn horloge aan Jan Jansen&#10;- € 5.000 aan Stichting X&#10;- De schilderijen aan mijn dochter Maria"
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label>Bijzondere bepalingen</Label>
            <Textarea
              value={form.bijzondereBepalingen}
              onChange={(e) => update("bijzondereBepalingen", e.target.value)}
              placeholder="Overige bijzondere bepalingen, voorwaarden of vruchtgebruik..."
              rows={4}
            />
          </div>
        </div>
      ),
    },
    {
      id: "wensen",
      titel: "Algemene Wensen",
      beschrijving: "Uw algemene wensen voor de nalatenschap",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Algemene wensen</Label>
            <Textarea
              value={form.algemeneWensen}
              onChange={(e) => update("algemeneWensen", e.target.value)}
              placeholder="Beschrijf hier uw algemene wensen voor de nalatenschap..."
              rows={5}
            />
          </div>
        </div>
      ),
    },
    {
      id: "samenvatting",
      titel: "Samenvatting & Document",
      beschrijving: "Controleer uw gegevens en genereer een concept-document",
      content: (
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>Disclaimer:</strong> Het gegenereerde document is een <em>concept</em>. Een notarieel testament is alleen rechtsgeldig als het door een notaris wordt opgesteld en ondertekend. Raadpleeg altijd uw notaris voor officiële vastlegging.
            </p>
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <div><span className="font-medium">Type:</span> {form.testamentType || "—"}</div>
            <div><span className="font-medium">Notaris:</span> {form.notarisNaam || "—"} ({form.notarisKantoor || "—"})</div>
            {form.notarisTelefoon && <div><span className="font-medium">Tel. notaris:</span> {form.notarisTelefoon}</div>}
            <div><span className="font-medium">Datum:</span> {form.datumTestament || "—"}</div>
            <div><span className="font-medium">CTR Nummer:</span> {form.ctr_Nummer || "—"}</div>
            <div><span className="font-medium">Locatie:</span> {form.testamentLocatie || "—"}</div>
            <div><span className="font-medium">Uitsluitingsclausule:</span> {form.uitsluitingsClausule === "true" ? "Ja" : "Nee"}</div>
          </div>
          {form.legaten && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">Legaten:</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{form.legaten}</div>
            </div>
          )}
          {form.bijzondereBepalingen && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">Bijzondere bepalingen:</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{form.bijzondereBepalingen}</div>
            </div>
          )}
          {form.algemeneWensen && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">Algemene wensen:</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{form.algemeneWensen}</div>
            </div>
          )}
          <div className="pt-2">
            <Button variant="outline" onClick={downloadConceptPdf} disabled={generating}>
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Genereren...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> Concept-testament downloaden (PDF)</>
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

  if (loading) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">Laden...</p></div>;

  return (
    <WizardShell
      titel="Testament Informatie"
      stappen={stappen}
      onComplete={handleComplete}
      onCancel={() => router.push("/testament")}
    />
  );
}
