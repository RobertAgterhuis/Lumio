"use client";


import { PageTransition } from "@/components/ui/transitions";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api, ApiError, getApiUrl } from "@/lib/api-client";
import { useDomainQuery, domainKeys, useInvalidateStatusKeys } from "@/hooks";
import { User, Save, Loader2, Camera, Trash2, AlertTriangle, Heart, CreditCard, Scale } from "lucide-react";
import { Select } from "@/components/ui/select";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { ContactSelector } from "@/components/common/ContactSelector";
import type { SharedContact } from "@/components/common/ContactSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";
import { toast } from "@/stores/toastStore";
import { useAuthStore } from "@/stores/authStore";
import { LumioIcon } from "@/components/ui/lumio-icon";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { HelpButton } from "@/components/help/HelpButton";
import { WerkgeverCard } from "@/components/werkgever/WerkgeverCard";
import { PageBanner } from "@/components/layout/PageBanner";

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
  notarisContactId?: string | null;
  huisartsContactId?: string | null;
  uitvaartOndernemerContactId?: string | null;
  burgerlijkeStaat?: number;
  huwelijksVoorwaarden?: number;
  datumHuwelijk?: string;
  legitimatieSoort?: number;
  legitimatieNummer?: string;
  legitimatieDatumAfgifte?: string;
  legitimatieGeldigTot?: string;
  heeftProfielFoto?: boolean;
}

interface NoodcontactItem {
  id: string;
  naam: string;
  rol: string;
  telefoon?: string | null;
  email?: string | null;
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
  notarisContactId: null as string | null,
  huisartsContactId: null as string | null,
  uitvaartOndernemerContactId: null as string | null,
  burgerlijkeStaat: "0",
  huwelijksVoorwaarden: "0",
  datumHuwelijk: "",
  legitimatieSoort: "0",
  legitimatieNummer: "",
  legitimatieDatumAfgifte: "",
  legitimatieGeldigTot: "",
};

export default function EigenaarPage() {
  const bumpProfileFoto = useAuthStore((s) => s.bumpProfileFoto);
  const queryClient = useQueryClient();
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
  // S9-08: track photo load to prevent pop-in
  const [fotoLoaded, setFotoLoaded] = useState(false);
  // S9-07: dirty state — track the form at last save/load
  const originalFormRef = useRef(emptyForm);
  // Selected notaris contact ID
  const [selectedNotarisContactId, setSelectedNotarisContactId] = useState<string | null>(null);
  // S9-06: Selected notaris contact details (from SharedContact)
  const [selectedNotarisContact, setSelectedNotarisContact] = useState<SharedContact | null>(null);

  // Selected huisarts contact ID
  const [selectedHuisartsContactId, setSelectedHuisartsContactId] = useState<string | null>(null);
  // Selected huisarts contact details (from SharedContact)
  const [selectedHuisartsContact, setSelectedHuisartsContact] = useState<SharedContact | null>(null);

  // Selected uitvaartondernemer contact ID
  const [selectedUitvaartOndernemerContactId, setSelectedUitvaartOndernemerContactId] = useState<string | null>(null);
  // Selected uitvaartondernemer contact details (from SharedContact)
  const [selectedUitvaartOndernemerContact, setSelectedUitvaartOndernemerContact] = useState<SharedContact | null>(null);

  // React Query for loading eigenaar data
  const { data: eigenaarData, isLoading: loading } = useDomainQuery<Eigenaar | null>("eigenaar");
  const invalidateStatus = useInvalidateStatusKeys();

  // Populate form when data loads
  useEffect(() => {
    if (eigenaarData) {
      setExists(true);
      const loaded = {
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
        notarisContactId: eigenaarData.notarisContactId ?? null,
        huisartsContactId: eigenaarData.huisartsContactId ?? null,
        uitvaartOndernemerContactId: eigenaarData.uitvaartOndernemerContactId ?? null,
        burgerlijkeStaat: String(eigenaarData.burgerlijkeStaat ?? 0),
        huwelijksVoorwaarden: String(eigenaarData.huwelijksVoorwaarden ?? 0),
        datumHuwelijk: eigenaarData.datumHuwelijk ?? "",
        legitimatieSoort: String(eigenaarData.legitimatieSoort ?? 0),
        legitimatieNummer: eigenaarData.legitimatieNummer ?? "",
        legitimatieDatumAfgifte: eigenaarData.legitimatieDatumAfgifte ?? "",
        legitimatieGeldigTot: eigenaarData.legitimatieGeldigTot ?? "",
      };
      setForm(loaded);
      // Set selected contact IDs
      setSelectedNotarisContactId(eigenaarData.notarisContactId ?? null);
      setSelectedHuisartsContactId(eigenaarData.huisartsContactId ?? null);
      setSelectedUitvaartOndernemerContactId(eigenaarData.uitvaartOndernemerContactId ?? null);
      // S9-07: snapshot the loaded form so we can detect dirty state
      originalFormRef.current = loaded;
      if (eigenaarData.heeftProfielFoto) {
        setFotoUrl(`${getApiUrl("/api/eigenaar/foto")}?t=${Date.now()}`);
      }
    }
  }, [eigenaarData]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const ensureNoodcontactFromSharedContact = async (
    selectedContactId: string | null,
    selectedContact: SharedContact | null,
    rol: "Notaris" | "Huisarts" | "Uitvaartondernemer"
  ) => {
    if (!selectedContactId) return;

    let sourceContact = selectedContact;
    if (!sourceContact) {
      try {
        sourceContact = await api.get<SharedContact>(`/api/v1/shared-contacts/${selectedContactId}`);
      } catch {
        return;
      }
    }

    if (!sourceContact?.naam?.trim()) return;

    const existing = await api.get<NoodcontactItem[]>("/api/noodcontacten");
    const duplicate = existing.some((n) =>
      n.rol.toLowerCase() === rol.toLowerCase() &&
      n.naam.trim().toLowerCase() === sourceContact.naam.trim().toLowerCase() &&
      (n.email ?? "").trim().toLowerCase() === (sourceContact.email ?? "").trim().toLowerCase() &&
      (n.telefoon ?? "").trim() === (sourceContact.telefoon ?? "").trim()
    );

    if (duplicate) return;

    await api.post("/api/noodcontacten", {
      naam: sourceContact.naam,
      relatie: sourceContact.relatie || rol,
      telefoon: sourceContact.telefoon || null,
      email: sourceContact.email || null,
      adres: sourceContact.adres || null,
      postcode: sourceContact.postcode || null,
      woonplaats: sourceContact.woonplaats || null,
      rol,
      instructies: null,
      bedrijfsNaam: sourceContact.bedrijfsNaam || null,
      functie: sourceContact.functie || null,
      prioriteit: 3,
      isGedeeld: true,
    });
  };

  // S9-06: Auto-save geselecteerde shared contacts op profiel + sync naar noodcontacten
  useEffect(() => {
    if ((!selectedNotarisContactId && !selectedHuisartsContactId && !selectedUitvaartOndernemerContactId) || !form.voornaam || !form.achternaam || !form.geboortedatum) {
      return; // Don't auto-save if no contacts selected or required fields missing
    }

    const autoSaveContacts = async () => {
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
          notarisContactId: selectedNotarisContactId || null,
          huisartsContactId: selectedHuisartsContactId || null,
          uitvaartOndernemerContactId: selectedUitvaartOndernemerContactId || null,
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
        invalidateStatus();

        try {
          await ensureNoodcontactFromSharedContact(selectedNotarisContactId, selectedNotarisContact, "Notaris");
          await ensureNoodcontactFromSharedContact(selectedHuisartsContactId, selectedHuisartsContact, "Huisarts");
          await ensureNoodcontactFromSharedContact(selectedUitvaartOndernemerContactId, selectedUitvaartOndernemerContact, "Uitvaartondernemer");
          // Invalidate caches voor alle domeinen die eigenaar ContactIds gebruiken
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: domainKeys.all("noodcontacten") }),
            queryClient.invalidateQueries({ queryKey: domainKeys.all("testament") }),
            queryClient.invalidateQueries({ queryKey: domainKeys.all("uitvaart") }),
          ]);
        } catch (err) {
          console.debug("Auto-sync shared contact naar noodcontacten mislukt (non-critical):", err);
        }
      } catch (err) {
        console.error("Auto-save contacts failed:", err);
      }
    };

    autoSaveContacts();
  }, [selectedNotarisContactId, selectedNotarisContact, selectedHuisartsContactId, selectedHuisartsContact, selectedUitvaartOndernemerContactId, selectedUitvaartOndernemerContact, form.voornaam, form.achternaam, form.geboortedatum, exists, invalidateStatus, queryClient]);

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
        notarisContactId: selectedNotarisContactId || null,
        huisartsContactId: selectedHuisartsContactId || null,
        uitvaartOndernemerContactId: selectedUitvaartOndernemerContactId || null,
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
      invalidateStatus();
      setSuccess(t("profielOpgeslagen"));
      toast.success(tf("opgeslagen"));
      // S9-07: reset dirty state
      originalFormRef.current = form;
    } catch (err) {
      // S3-31 — parse ValidationProblemDetails for per-field messages
      if (err instanceof ApiError && err.errors && Object.keys(err.errors).length > 0) {
        const fieldMessages = Object.entries(err.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
          .join("\n");
        setError(fieldMessages);
      } else {
        setError(err instanceof Error ? err.message : t("opslaanMislukt"));
      }
    } finally {
      setSaving(false);
    }
  };

  // S9-06: add notaris as emergency contact (now auto-handled in useEffect above)
  // Keeping this function removed as it's superseded by auto-save + auto-add in useEffect

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("bestand", file);
      await api.upload("/api/eigenaar/foto", fd);
      setFotoUrl(`${getApiUrl("/api/eigenaar/foto")}?t=${Date.now()}`);
      queryClient.invalidateQueries({ queryKey: domainKeys.all("eigenaar") });
      bumpProfileFoto();
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
      queryClient.invalidateQueries({ queryKey: domainKeys.all("eigenaar") });
      bumpProfileFoto();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("foto.verwijderenMislukt"));
    } finally {
      setFotoUploading(false);
    }
  };

  // S9-08: reset fotoLoaded when the URL changes to prevent pop-in
  useEffect(() => { setFotoLoaded(false); }, [fotoUrl]);

  if (loading) return <PageSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <PageBanner id="eigenaar-profiel-aanmaken" show={!exists && !loading}>
        <strong>{t("belangrijk")}</strong> {t("eersteProfielMelding")}
      </PageBanner>
      <div>
        <h1 className="text-3xl font-bold font-display flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          {t("titel")}
          <HelpButton />
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("beschrijving")}
        </p>
        <VoorbeeldDialog domein="eigenaar" />
      </div>

      <DomainStatusBanner domein="eigenaar" />

      {exists && (
        <Card className="overflow-hidden">
          {/* Coloured header — matches domain card style, primary palette */}
          <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:bg-primary-100 dark:border-white/10">
            <LumioIcon name="profiel" size="md" className="text-primary shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-primary leading-tight">{t("foto.titel")}</h2>
              <p className="text-xs text-primary/70 leading-tight mt-0.5">{t("foto.beschrijving")}</p>
            </div>
          </div>
          <CardContent className="pt-5">
            <div className="flex items-center gap-6">
              <div className="h-28 w-28 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden shrink-0">
                {!fotoUrl && <Camera className="h-10 w-10 text-muted-foreground/50" />}
                {fotoUrl && (
                  <Image
                    src={fotoUrl}
                    alt={t("foto.alt")}
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                    onLoad={() => setFotoLoaded(true)}
                    onError={() => {
                      setFotoLoaded(false);
                      setFotoUrl(null);
                    }}
                  />
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

      <Card className="overflow-hidden">
          <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
            <User className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-primary leading-tight">{t("persoon.titel")}</h2>
              <p className="text-xs text-primary/70 leading-tight mt-0.5">{t("persoon.beschrijving")}</p>
            </div>
          </div>
        <CardContent className="pt-5">
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

      <Card className="overflow-hidden">
          <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
            <Heart className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-primary leading-tight">{t("burgerlijkeStaat.titel")}</h2>
              <p className="text-xs text-primary/70 leading-tight mt-0.5">{t("burgerlijkeStaat.beschrijving")}</p>
            </div>
          </div>
        <CardContent className="pt-5">
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

      <Card className="overflow-hidden">
          <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
            <CreditCard className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-primary leading-tight">{t("identificatie.titel")}</h2>
              <p className="text-xs text-primary/70 leading-tight mt-0.5">{t("identificatie.beschrijving")}</p>
            </div>
          </div>
        <CardContent className="pt-5">
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

      <Card className="overflow-hidden">
          <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
            <Scale className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-primary leading-tight">{t("notaris.titel")}</h2>
              <p className="text-xs text-primary/70 leading-tight mt-0.5">{t("notaris.beschrijving")}</p>
            </div>
          </div>
        <CardContent className="pt-5">
          <ContactSelector
            label={t("notaris.naam")}
            contactType={0}
            selectedContactId={selectedNotarisContactId}
            onSelect={setSelectedNotarisContactId}
            onContactDetailsSelect={setSelectedNotarisContact}
            required={false}
            showCreateNew={true}
          />
          {/* S9-06: Auto-add notaris as emergency contact (no button needed) */}
          {selectedNotarisContactId && (
            <div className="pt-2 border-t mt-4 text-xs text-muted-foreground">
              ✓ {t("notaris.automatischToegevoegdAlsNoodcontact")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
          <div className="bg-info-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
            <LumioIcon name="noodcontacten" className="h-5 w-5 text-info shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-info leading-tight">{t("huisarts.titel")}</h2>
              <p className="text-xs text-info/70 leading-tight mt-0.5">{t("huisarts.beschrijving")}</p>
            </div>
          </div>
        <CardContent className="pt-5">
          <ContactSelector
            label={t("huisarts.naam")}
            contactType={1}
            selectedContactId={selectedHuisartsContactId}
            onSelect={setSelectedHuisartsContactId}
            onContactDetailsSelect={setSelectedHuisartsContact}
            required={false}
            showCreateNew={true}
          />
          {/* S9-06: Auto-add huisarts as emergency contact */}
          {selectedHuisartsContactId && (
            <div className="pt-2 border-t mt-4 text-xs text-muted-foreground">
              ✓ {t("huisarts.automatischToegevoegdAlsNoodcontact")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
          <div className="bg-warning-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
            <LumioIcon name="uitvaart" className="h-5 w-5 text-warning shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-warning leading-tight">{t("uitvaartondernemer.titel")}</h2>
              <p className="text-xs text-warning/70 leading-tight mt-0.5">{t("uitvaartondernemer.beschrijving")}</p>
            </div>
          </div>
        <CardContent className="pt-5">
          <ContactSelector
            label={t("uitvaartondernemer.naam")}
            contactType={2}
            selectedContactId={selectedUitvaartOndernemerContactId}
            onSelect={setSelectedUitvaartOndernemerContactId}
            onContactDetailsSelect={setSelectedUitvaartOndernemerContact}
            required={false}
            showCreateNew={true}
          />
          {/* Auto-add uitvaartondernemer info feedback */}
          {selectedUitvaartOndernemerContactId && (
            <div className="pt-2 border-t mt-4 text-xs text-muted-foreground">
              ✓ {t("uitvaartondernemer.geselecteerd")}
            </div>
          )}
        </CardContent>
      </Card>

      <WerkgeverCard />

      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="animate-[fadeSlideIn_300ms_ease-out_both]">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-end gap-3">
        {/* S9-07: dirty state indicator */}
        {JSON.stringify(form) !== JSON.stringify(originalFormRef.current) && (
          <span className="flex items-center gap-1 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" />
            {t("ongeslagenWijzigingen")}
          </span>
        )}
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
    </PageTransition>
  );
}
