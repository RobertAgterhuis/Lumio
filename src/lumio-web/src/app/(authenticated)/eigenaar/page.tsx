"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { User, Save, Loader2 } from "lucide-react";

interface Eigenaar {
  id: string;
  voornaam: string;
  achternaam: string;
  tussenvoegsel?: string;
  geboortedatum: string;
  bsn?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  telefoon?: string;
  email?: string;
  notaris?: string;
  notarisKantoor?: string;
}

const emptyForm = {
  voornaam: "",
  achternaam: "",
  tussenvoegsel: "",
  geboortedatum: "",
  bsn: "",
  adres: "",
  postcode: "",
  woonplaats: "",
  telefoon: "",
  email: "",
  notaris: "",
  notarisKantoor: "",
};

export default function EigenaarPage() {
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Eigenaar>("/api/eigenaar")
      .then((data) => {
        if (data) {
          setExists(true);
          setForm({
            voornaam: data.voornaam,
            achternaam: data.achternaam,
            tussenvoegsel: data.tussenvoegsel ?? "",
            geboortedatum: data.geboortedatum ?? "",
            bsn: data.bsn ?? "",
            adres: data.adres ?? "",
            postcode: data.postcode ?? "",
            woonplaats: data.woonplaats ?? "",
            telefoon: data.telefoon ?? "",
            email: data.email ?? "",
            notaris: data.notaris ?? "",
            notarisKantoor: data.notarisKantoor ?? "",
          });
        }
      })
      .catch(() => {
        // 404 = no profile yet
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        voornaam: form.voornaam,
        achternaam: form.achternaam,
        tussenvoegsel: form.tussenvoegsel || null,
        geboortedatum: form.geboortedatum,
        bsn: form.bsn || null,
        adres: form.adres || null,
        postcode: form.postcode || null,
        woonplaats: form.woonplaats || null,
        telefoon: form.telefoon || null,
        email: form.email || null,
        notaris: form.notaris || null,
        notarisKantoor: form.notarisKantoor || null,
      };
      if (exists) {
        await api.put("/api/eigenaar", payload);
      } else {
        await api.post("/api/eigenaar", payload);
        setExists(true);
      }
      setSuccess("Profiel opgeslagen.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          Mijn Profiel
        </h1>
        <p className="text-muted-foreground mt-1">
          Uw persoonsgegevens als eigenaar van deze nalatenschap
        </p>
      </div>

      {!exists && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Belangrijk:</strong> U moet eerst uw profiel aanmaken voordat
            u andere gegevens kunt opslaan. Vul onderstaand formulier in en klik
            op Opslaan.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Persoonsgegevens</CardTitle>
          <CardDescription>
            Deze gegevens worden gebruikt in uw nalatenschap en PDF-exports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Voornaam *</Label>
                <Input
                  value={form.voornaam}
                  onChange={(e) => update("voornaam", e.target.value)}
                  placeholder="Voornaam"
                />
              </div>
              <div className="space-y-2">
                <Label>Tussenvoegsel</Label>
                <Input
                  value={form.tussenvoegsel}
                  onChange={(e) => update("tussenvoegsel", e.target.value)}
                  placeholder="bijv. van, de"
                />
              </div>
              <div className="space-y-2">
                <Label>Achternaam *</Label>
                <Input
                  value={form.achternaam}
                  onChange={(e) => update("achternaam", e.target.value)}
                  placeholder="Achternaam"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Geboortedatum *</Label>
                <Input
                  type="date"
                  value={form.geboortedatum}
                  onChange={(e) => update("geboortedatum", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>BSN</Label>
                <Input
                  value={form.bsn}
                  onChange={(e) => update("bsn", e.target.value)}
                  placeholder="Burgerservicenummer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Adres</Label>
                <Input
                  value={form.adres}
                  onChange={(e) => update("adres", e.target.value)}
                  placeholder="Straat en huisnummer"
                />
              </div>
              <div className="space-y-2">
                <Label>Postcode</Label>
                <Input
                  value={form.postcode}
                  onChange={(e) => update("postcode", e.target.value)}
                  placeholder="1234 AB"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Woonplaats</Label>
                <Input
                  value={form.woonplaats}
                  onChange={(e) => update("woonplaats", e.target.value)}
                  placeholder="Woonplaats"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefoon</Label>
                <Input
                  value={form.telefoon}
                  onChange={(e) => update("telefoon", e.target.value)}
                  placeholder="06-12345678"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="uw@email.nl"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notaris</CardTitle>
          <CardDescription>
            Gegevens van uw notaris (optioneel).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Naam notaris</Label>
              <Input
                value={form.notaris}
                onChange={(e) => update("notaris", e.target.value)}
                placeholder="bijv. mr. J. de Vries"
              />
            </div>
            <div className="space-y-2">
              <Label>Notariskantoor</Label>
              <Input
                value={form.notarisKantoor}
                onChange={(e) => update("notarisKantoor", e.target.value)}
                placeholder="bijv. De Vries & Partners Notarissen"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !form.voornaam || !form.achternaam || !form.geboortedatum}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Opslaan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Opslaan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
