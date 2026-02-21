"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell, type WizardStep } from "@/components/wizard/WizardShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api-client";

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
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ wilEuthanasie: boolean; situatieBeschrijving: string; huisarts: string; huisartsPraktijk: string; huisartsTelefoon: string; huisartsEmail: string; vertegenwoordigerNaam: string; vertegenwoordigerRelatie: string; vertegenwoordigerTelefoon: string; vertegenwoordigerEmail: string; vertegenwoordigerAdres: string; vertegenwoordigerPostcode: string; vertegenwoordigerWoonplaats: string; aanvullendeWensen: string; datumOndertekening: string }>("/api/euthanasie")
      .then((data) => {
        if (data) {
          setForm({
            wilEuthanasie: data.wilEuthanasie != null ? String(data.wilEuthanasie) : "",
            situatieBeschrijving: data.situatieBeschrijving ?? "",
            huisarts: data.huisarts ?? "",
            huisartsPraktijk: data.huisartsPraktijk ?? "",
            huisartsTelefoon: data.huisartsTelefoon ?? "",
            huisartsEmail: data.huisartsEmail ?? "",
            vertegenwoordigerNaam: data.vertegenwoordigerNaam ?? "",
            vertegenwoordigerRelatie: data.vertegenwoordigerRelatie ?? "",
            vertegenwoordigerTelefoon: data.vertegenwoordigerTelefoon ?? "",
            vertegenwoordigerEmail: data.vertegenwoordigerEmail ?? "",
            vertegenwoordigerAdres: data.vertegenwoordigerAdres ?? "",
            vertegenwoordigerPostcode: data.vertegenwoordigerPostcode ?? "",
            vertegenwoordigerWoonplaats: data.vertegenwoordigerWoonplaats ?? "",
            aanvullendeWensen: data.aanvullendeWensen ?? "",
            datumOndertekening: data.datumOndertekening
              ? new Date(data.datumOndertekening).toISOString().split("T")[0]
              : "",
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
      id: "keuze",
      titel: "Uw Keuze",
      beschrijving:
        "Wilt u een wilsverklaring euthanasie vastleggen? Dit is conform de Wet toetsing levensbeëindiging (Wtl).",
      content: (
        <div className="space-y-4">
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
      titel: "Samenvatting",
      beschrijving: "Controleer uw gegevens voordat u opslaat.",
      content: (
        <div className="space-y-3 text-sm">
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
        </div>
      ),
    },
  ];

  const handleComplete = async () => {
    await api.put("/api/euthanasie", {
      ...form,
      wilEuthanasie: form.wilEuthanasie === "true",
      datumOndertekening: form.datumOndertekening || null,
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
