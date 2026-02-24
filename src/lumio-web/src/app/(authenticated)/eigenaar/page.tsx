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
import { useDomainQuery } from "@/hooks";
import { User, Save, Loader2, Camera, Trash2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";
import { toast } from "@/stores/toastStore";

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
  const t = useTranslations("eigenaar");
  const te = useTranslations("enums");
  const tf = useTranslations("feedback");
  const [exists, setExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoUploading, setFotoUploading] = useState(false);

  // React Query for loading eigenaar data
  const { data: eigenaarData, isLoading: loading } = useDomainQuery<Eigenaar | null>("eigenaar");

  // Populate form when data loads
  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
    if (eigenaarData) {
      setExists(true);
      setForm({
        voornaam: eigenaarData.voornaam,
        achternaam: eigenaarData.achternaam,
        tussenvoegsel: eigenaarData.tussenvoegsel ?? "",
        geboortedatum: eigenaarData.geboortedatum ?? "",
        bsn: eigenaarData.bsn ?? "",
        adres: eigenaarData.adres ?? "",
        postcode: eigenaarData.postcode ?? "",
        woonplaats: eigenaarData.woonplaats ?? "",
        telefoon: eigenaarData.telefoon ?? "",
        email: eigenaarData.email ?? "",
        notaris: eigenaarData.notaris ?? "",
        notarisKantoor: eigenaarData.notarisKantoor ?? "",
        notarisTelefoon: eigenaarData.notarisTelefoon ?? "",
        notarisEmail: eigenaarData.notarisEmail ?? "",
        notarisAdres: eigenaarData.notarisAdres ?? "",
        notarisPostcode: eigenaarData.notarisPostcode ?? "",
        notarisPlaats: eigenaarData.notarisPlaats ?? "",
        burgerlijkeStaat: String(eigenaarData.burgerlijkeStaat ?? 0),
        huwelijksVoorwaarden: String(eigenaarData.huwelijksVoorwaarden ?? 0),
        datumHuwelijk: eigenaarData.datumHuwelijk ?? "",
        legitimatieSoort: String(eigenaarData.legitimatieSoort ?? 0),
        legitimatieNummer: eigenaarData.legitimatieNummer ?? "",
        legitimatieDatumAfgifte: eigenaarData.legitimatieDatumAfgifte ?? "",
        legitimatieGeldigTot: eigenaarData.legitimatieGeldigTot ?? "",
      });
      if (eigenaarData.heeftProfielFoto) {
        setFotoUrl(`${API_BASE}/api/eigenaar/foto?t=${Date.now()}`);
      }
    }
  }, [eigenaarData]);

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
      setSuccess(t("profielOpgeslagen"));
      toast.success(tf("opgeslagen"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
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
      setError(err instanceof Error ? err.message : t("foto.uploadMislukt"));
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
      setError(err instanceof Error ? err.message : t("foto.verwijderenMislukt"));
    } finally {
      setFotoUploading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t("laden")}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          {t("titel")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("beschrijving")}
        </p>
        <VoorbeeldDialog domein="eigenaar" />
      </div>

      <DomainStatusBanner domein="eigenaar" />

      {!exists && (
        <div className="rounded-lg border border-warning bg-warning-100 p-4">
          <p className="text-sm text-warning">
            <strong>{t("belangrijk")}</strong> {t("eersteProfielMelding")}
          </p>
        </div>
      )}

      {exists && (
        <Card>
          <CardHeader>
            <CardTitle>{t("foto.titel")}</CardTitle>
            <CardDescription>
              {t("foto.beschrijving")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-28 w-28 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden shrink-0">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt={t("foto.alt")}
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
                    {fotoUrl ? t("foto.wijzigen") : t("foto.uploaden")}
                  </Button>
                  {fotoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={fotoUploading}
                      onClick={handleFotoDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> {t("foto.verwijderen")}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("foto.formaat")}
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
          <CardTitle>{t("persoon.titel")}</CardTitle>
          <CardDescription>
            {t("persoon.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("persoon.voornaamVerplicht")}</Label>
                <Input
                  value={form.voornaam}
                  onChange={(e) => update("voornaam", e.target.value)}
                  placeholder={t("persoon.voornaam")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("persoon.tussenvoegsel")}</Label>
                <Input
                  value={form.tussenvoegsel}
                  onChange={(e) => update("tussenvoegsel", e.target.value)}
                  placeholder={t("persoon.tussenvoegselPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("persoon.achternaamVerplicht")}</Label>
                <Input
                  value={form.achternaam}
                  onChange={(e) => update("achternaam", e.target.value)}
                  placeholder={t("persoon.achternaam")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("persoon.geboortedatumVerplicht")}</Label>
                <Input
                  type="date"
                  value={form.geboortedatum}
                  onChange={(e) => update("geboortedatum", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("persoon.bsn")}</Label>
                <Input
                  value={form.bsn}
                  onChange={(e) => update("bsn", e.target.value)}
                  placeholder={t("persoon.bsnPlaceholder")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>{t("persoon.adres")}</Label>
                <Input
                  value={form.adres}
                  onChange={(e) => update("adres", e.target.value)}
                  placeholder={t("persoon.adresPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("persoon.postcode")}</Label>
                <Input
                  value={form.postcode}
                  onChange={(e) => update("postcode", e.target.value)}
                  placeholder={t("persoon.postcodePlaceholder")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("persoon.woonplaats")}</Label>
                <Input
                  value={form.woonplaats}
                  onChange={(e) => update("woonplaats", e.target.value)}
                  placeholder={t("persoon.woonplaats")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("persoon.telefoon")}</Label>
                <Input
                  value={form.telefoon}
                  onChange={(e) => update("telefoon", e.target.value)}
                  placeholder={t("persoon.telefoonPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("persoon.email")}</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder={t("persoon.emailPlaceholder")}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("burgerlijkeStaat.titel")}</CardTitle>
          <CardDescription>
            {t("burgerlijkeStaat.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("burgerlijkeStaat.label")}</Label>
                <Select
                  value={form.burgerlijkeStaat}
                  onChange={(e) => update("burgerlijkeStaat", e.target.value)}
                >
                  <option value="0">{te("burgerlijkeStaat.ongehuwd")}</option>
                  <option value="1">{te("burgerlijkeStaat.gehuwd")}</option>
                  <option value="2">{te("burgerlijkeStaat.geregistreerdPartnerschap")}</option>
                  <option value="3">{te("burgerlijkeStaat.gescheiden")}</option>
                  <option value="4">{te("burgerlijkeStaat.weduwWeduwnaar")}</option>
                </Select>
              </div>
              {(form.burgerlijkeStaat === "1" || form.burgerlijkeStaat === "2") && (
                <div className="space-y-2">
                  <Label>{t("burgerlijkeStaat.huwelijksVoorwaarden")}</Label>
                  <Select
                    value={form.huwelijksVoorwaarden}
                    onChange={(e) => update("huwelijksVoorwaarden", e.target.value)}
                  >
                    <option value="0">{te("huwelijksVoorwaarden.nietVanToepassing")}</option>
                    <option value="1">{te("huwelijksVoorwaarden.gemeenschapVanGoederen")}</option>
                    <option value="2">{te("huwelijksVoorwaarden.beperktGemeenschap")}</option>
                    <option value="3">{te("huwelijksVoorwaarden.koudeUitsluiting")}</option>
                  </Select>
                </div>
              )}
            </div>
            {(form.burgerlijkeStaat === "1" || form.burgerlijkeStaat === "2") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("burgerlijkeStaat.datumHuwelijk")}</Label>
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
          <CardTitle>{t("identificatie.titel")}</CardTitle>
          <CardDescription>
            {t("identificatie.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("identificatie.soort")}</Label>
                <Select
                  value={form.legitimatieSoort}
                  onChange={(e) => update("legitimatieSoort", e.target.value)}
                >
                  <option value="0">{te("legitimatie.geen")}</option>
                  <option value="1">{te("legitimatie.paspoort")}</option>
                  <option value="2">{te("legitimatie.identiteitskaart")}</option>
                  <option value="3">{te("legitimatie.rijbewijs")}</option>
                </Select>
              </div>
              {form.legitimatieSoort !== "0" && (
                <div className="space-y-2">
                  <Label>{t("identificatie.documentnummer")}</Label>
                  <Input
                    value={form.legitimatieNummer}
                    onChange={(e) => update("legitimatieNummer", e.target.value)}
                    placeholder={t("identificatie.documentnummer")}
                  />
                </div>
              )}
            </div>
            {form.legitimatieSoort !== "0" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("identificatie.datumAfgifte")}</Label>
                  <Input
                    type="date"
                    value={form.legitimatieDatumAfgifte}
                    onChange={(e) => update("legitimatieDatumAfgifte", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("identificatie.geldigTot")}</Label>
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
          <CardTitle>{t("notaris.titel")}</CardTitle>
          <CardDescription>
            {t("notaris.beschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("notaris.naam")}</Label>
              <Input
                value={form.notaris}
                onChange={(e) => update("notaris", e.target.value)}
                placeholder={t("notaris.naamPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("notaris.kantoor")}</Label>
              <Input
                value={form.notarisKantoor}
                onChange={(e) => update("notarisKantoor", e.target.value)}
                placeholder={t("notaris.kantoorPlaceholder")}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("notaris.telefoon")}</Label>
              <Input
                value={form.notarisTelefoon}
                onChange={(e) => update("notarisTelefoon", e.target.value)}
                placeholder={t("notaris.telefoonPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("notaris.email")}</Label>
              <Input
                type="email"
                value={form.notarisEmail}
                onChange={(e) => update("notarisEmail", e.target.value)}
                placeholder={t("notaris.emailPlaceholder")}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>{t("notaris.adres")}</Label>
              <Input
                value={form.notarisAdres}
                onChange={(e) => update("notarisAdres", e.target.value)}
                placeholder={t("notaris.adresPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("notaris.postcode")}</Label>
              <Input
                value={form.notarisPostcode}
                onChange={(e) => update("notarisPostcode", e.target.value)}
                placeholder={t("notaris.postcodePlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("notaris.plaats")}</Label>
            <Input
              value={form.notarisPlaats}
              onChange={(e) => update("notarisPlaats", e.target.value)}
              placeholder={t("notaris.plaats")}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="success">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !form.voornaam || !form.achternaam || !form.geboortedatum}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("opslaanBezig")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> {t("opslaan")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
