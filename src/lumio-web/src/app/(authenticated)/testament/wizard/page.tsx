"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell, type WizardStep } from "@/components/wizard/WizardShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";

export default function TestamentWizardPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    testamentType: "",
    notarisNaam: "",
    notarisKantoor: "",
    datumTestament: "",
    testamentLocatie: "",
    ctr_Nummer: "",
    algemeneWensen: "",
    bijzondereBepalingen: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ testamentType: string; notarisNaam: string; notarisKantoor: string; datumTestament: string; testamentLocatie: string; ctr_Nummer: string; algemeneWensen: string; bijzondereBepalingen: string }>("/api/testament")
      .then((data) => {
        if (data) {
          setForm({
            testamentType: data.testamentType ?? "",
            notarisNaam: data.notarisNaam ?? "",
            notarisKantoor: data.notarisKantoor ?? "",
            datumTestament: data.datumTestament
              ? new Date(data.datumTestament).toISOString().split("T")[0]
              : "",
            testamentLocatie: data.testamentLocatie ?? "",
            ctr_Nummer: data.ctr_Nummer ?? "",
            algemeneWensen: data.algemeneWensen ?? "",
            bijzondereBepalingen: data.bijzondereBepalingen ?? "",
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
      titel: "Type Testament",
      beschrijving: "Wat voor type testament heeft u of wilt u laten opstellen?",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type testament</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.testamentType}
              onChange={(e) => update("testamentType", e.target.value)}
            >
              <option value="">Selecteer...</option>
              <option value="Notarieel">Notarieel testament</option>
              <option value="Onderhands">Onderhands (codicil)</option>
              <option value="Nog niet opgesteld">Nog niet opgesteld</option>
            </select>
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
          <div className="space-y-2">
            <Label>Naam notaris</Label>
            <Input value={form.notarisNaam} onChange={(e) => update("notarisNaam", e.target.value)} placeholder="bijv. mr. J. de Vries" />
          </div>
          <div className="space-y-2">
            <Label>Notariskantoor</Label>
            <Input value={form.notarisKantoor} onChange={(e) => update("notarisKantoor", e.target.value)} placeholder="bijv. De Vries & Partners Notarissen" />
          </div>
          <div className="space-y-2">
            <Label>Datum testament</Label>
            <Input type="date" value={form.datumTestament} onChange={(e) => update("datumTestament", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>CTR Nummer</Label>
            <Input value={form.ctr_Nummer} onChange={(e) => update("ctr_Nummer", e.target.value)} placeholder="Centraal Testamentenregister nummer" />
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
      id: "wensen",
      titel: "Algemene Wensen",
      beschrijving: "Uw algemene wensen voor de nalatenschap",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Algemene wensen</Label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.algemeneWensen}
              onChange={(e) => update("algemeneWensen", e.target.value)}
              placeholder="Beschrijf hier uw algemene wensen..."
            />
          </div>
          <div className="space-y-2">
            <Label>Bijzondere bepalingen</Label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.bijzondereBepalingen}
              onChange={(e) => update("bijzondereBepalingen", e.target.value)}
              placeholder="Legaten, voorwaarden of andere bijzondere bepalingen..."
            />
          </div>
        </div>
      ),
    },
    {
      id: "samenvatting",
      titel: "Samenvatting",
      beschrijving: "Controleer uw gegevens voordat u opslaat",
      content: (
        <div className="space-y-3 text-sm">
          <div className="rounded-lg border p-4 space-y-2">
            <div><span className="font-medium">Type:</span> {form.testamentType || "—"}</div>
            <div><span className="font-medium">Notaris:</span> {form.notarisNaam || "—"}</div>
            <div><span className="font-medium">Kantoor:</span> {form.notarisKantoor || "—"}</div>
            <div><span className="font-medium">Datum:</span> {form.datumTestament || "—"}</div>
            <div><span className="font-medium">CTR Nummer:</span> {form.ctr_Nummer || "—"}</div>
            <div><span className="font-medium">Locatie:</span> {form.testamentLocatie || "—"}</div>
          </div>
          {form.algemeneWensen && (
            <div className="rounded-lg border p-4">
              <div className="font-medium mb-1">Algemene wensen:</div>
              <div className="text-muted-foreground whitespace-pre-wrap">{form.algemeneWensen}</div>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleComplete = async () => {
    await api.put("/api/testament", {
      ...form,
      datumTestament: form.datumTestament || null,
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
