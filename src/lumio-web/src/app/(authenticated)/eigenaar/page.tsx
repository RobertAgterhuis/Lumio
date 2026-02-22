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
import { User, Save, Loader2, Camera, Trash2 } from "lucide-react";
import { Select } from "@/components/ui/select";

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
  notarisTelefoon?: string;
  notarisEmail?: string;
  notarisAdres?: string;
  notarisPostcode?: string;
  notarisPlaats?: string;
  burgerlijkeStaat?: number;
  huwelijksVoorwaarden?: number;
  datumHuwelijk?: string;
  legitimatieSoort?: number;
  legitimatieNummer?: string;
  legitimatieDatumAfgifte?: string;
  legitimatieGeldigTot?: string;
  heeftProfielFoto?: boolean;
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
  notarisTelefoon: "",
  notarisEmail: "",
  notarisAdres: "",
  notarisPostcode: "",
  notarisPlaats: "",
  burgerlijkeStaat: "0",
  huwelijksVoorwaarden: "0",
  datumHuwelijk: "",
  legitimatieSoort: "0",
  legitimatieNummer: "",
  legitimatieDatumAfgifte: "",
  legitimatieGeldigTot: "",
};

export default function EigenaarPage() {
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoUploading, setFotoUploading] = useState(false);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
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
            notarisTelefoon: data.notarisTelefoon ?? "",
            notarisEmail: data.notarisEmail ?? "",
            notarisAdres: data.notarisAdres ?? "",
            notarisPostcode: data.notarisPostcode ?? "",
            notarisPlaats: data.notarisPlaats ?? "",
            burgerlijkeStaat: String(data.burgerlijkeStaat ?? 0),
            huwelijksVoorwaarden: String(data.huwelijksVoorwaarden ?? 0),
            datumHuwelijk: data.datumHuwelijk ?? "",
            legitimatieSoort: String(data.legitimatieSoort ?? 0),
            legitimatieNummer: data.legitimatieNummer ?? "",
            legitimatieDatumAfgifte: data.legitimatieDatumAfgifte ?? "",
            legitimatieGeldigTot: data.legitimatieGeldigTot ?? "",
          });
          if (data.heeftProfielFoto) {
            setFotoUrl(`${API_BASE}/api/eigenaar/foto?t=${Date.now()}`);
          }
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
        notarisTelefoon: form.notarisTelefoon || null,
        notarisEmail: form.notarisEmail || null,
        notarisAdres: form.notarisAdres || null,
        notarisPostcode: form.notarisPostcode || null,
        notarisPlaats: form.notarisPlaats || null,
        burgerlijkeStaat: parseInt(form.burgerlijkeStaat),
        huwelijksVoorwaarden: parseInt(form.huwelijksVoorwaarden),
        datumHuwelijk: form.datumHuwelijk || null,
        legitimatieSoort: parseInt(form.legitimatieSoort),
        legitimatieNummer: form.legitimatieNummer || null,
        legitimatieDatumAfgifte: form.legitimatieDatumAfgifte || null,
        legitimatieGeldigTot: form.legitimatieGeldigTot || null,
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

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("bestand", file);
      await api.upload("/api/eigenaar/foto", fd);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
      setFotoUrl(`${API_BASE}/api/eigenaar/foto?t=${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Foto uploaden mislukt.");
    } finally {
      setFotoUploading(false);
    }
  };

  const handleFotoDelete = async () => {
    setFotoUploading(true);
    setError(null);
    try {
      await api.delete("/api/eigenaar/foto");
      setFotoUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Foto verwijderen mislukt.");
    } finally {
      setFotoUploading(false);
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

      {exists && (
        <Card>
          <CardHeader>
            <CardTitle>Profielfoto</CardTitle>
            <CardDescription>
              Upload een pasfoto, bijvoorbeeld voor de rouwkaart.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-28 w-28 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden shrink-0">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt="Profielfoto"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-10 w-10 text-muted-foreground/50" />
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={fotoUploading}
                    onClick={() =>
                      document.getElementById("foto-input")?.click()
                    }
                  >
                    {fotoUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4 mr-2" />
                    )}
                    {fotoUrl ? "Wijzigen" : "Uploaden"}
                  </Button>
                  {fotoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={fotoUploading}
                      onClick={handleFotoDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Verwijderen
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG of WebP. Maximaal 10 MB.
                </p>
                <input
                  id="foto-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoUpload}
                />
              </div>
            </div>
          </CardContent>
        </Card>
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
          <CardTitle>Burgerlijke staat</CardTitle>
          <CardDescription>
            Uw burgerlijke staat en eventuele huwelijksvoorwaarden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Burgerlijke staat</Label>
                <Select
                  value={form.burgerlijkeStaat}
                  onChange={(e) => update("burgerlijkeStaat", e.target.value)}
                >
                  <option value="0">Ongehuwd</option>
                  <option value="1">Gehuwd</option>
                  <option value="2">Geregistreerd partnerschap</option>
                  <option value="3">Gescheiden</option>
                  <option value="4">Weduwe / Weduwnaar</option>
                </Select>
              </div>
              {(form.burgerlijkeStaat === "1" || form.burgerlijkeStaat === "2") && (
                <div className="space-y-2">
                  <Label>Huwelijksvoorwaarden</Label>
                  <Select
                    value={form.huwelijksVoorwaarden}
                    onChange={(e) => update("huwelijksVoorwaarden", e.target.value)}
                  >
                    <option value="0">Niet van toepassing</option>
                    <option value="1">Gemeenschap van goederen</option>
                    <option value="2">Beperkte gemeenschap</option>
                    <option value="3">Koude uitsluiting</option>
                  </Select>
                </div>
              )}
            </div>
            {(form.burgerlijkeStaat === "1" || form.burgerlijkeStaat === "2") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Datum huwelijk / partnerschap</Label>
                  <Input
                    type="date"
                    value={form.datumHuwelijk}
                    onChange={(e) => update("datumHuwelijk", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identificatie</CardTitle>
          <CardDescription>
            Legitimatiegegevens voor juridische documenten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Soort legitimatie</Label>
                <Select
                  value={form.legitimatieSoort}
                  onChange={(e) => update("legitimatieSoort", e.target.value)}
                >
                  <option value="0">Geen</option>
                  <option value="1">Paspoort</option>
                  <option value="2">Identiteitskaart</option>
                  <option value="3">Rijbewijs</option>
                </Select>
              </div>
              {form.legitimatieSoort !== "0" && (
                <div className="space-y-2">
                  <Label>Documentnummer</Label>
                  <Input
                    value={form.legitimatieNummer}
                    onChange={(e) => update("legitimatieNummer", e.target.value)}
                    placeholder="Documentnummer"
                  />
                </div>
              )}
            </div>
            {form.legitimatieSoort !== "0" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Datum afgifte</Label>
                  <Input
                    type="date"
                    value={form.legitimatieDatumAfgifte}
                    onChange={(e) => update("legitimatieDatumAfgifte", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Geldig tot</Label>
                  <Input
                    type="date"
                    value={form.legitimatieGeldigTot}
                    onChange={(e) => update("legitimatieGeldigTot", e.target.value)}
                  />
                </div>
              </div>
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefoon notaris</Label>
              <Input
                value={form.notarisTelefoon}
                onChange={(e) => update("notarisTelefoon", e.target.value)}
                placeholder="Telefoonnummer"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail notaris</Label>
              <Input
                type="email"
                value={form.notarisEmail}
                onChange={(e) => update("notarisEmail", e.target.value)}
                placeholder="notaris@kantoor.nl"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Adres notaris</Label>
              <Input
                value={form.notarisAdres}
                onChange={(e) => update("notarisAdres", e.target.value)}
                placeholder="Straat en huisnummer"
              />
            </div>
            <div className="space-y-2">
              <Label>Postcode</Label>
              <Input
                value={form.notarisPostcode}
                onChange={(e) => update("notarisPostcode", e.target.value)}
                placeholder="1234 AB"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Plaats</Label>
            <Input
              value={form.notarisPlaats}
              onChange={(e) => update("notarisPlaats", e.target.value)}
              placeholder="Plaats"
            />
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
