"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  KeyRound,
  Copy,
  Check,
  Loader2,
  Package,
  Download,
  Share2,
} from "lucide-react";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { ErfbelastingCalculator } from "@/components/erfgenamen/ErfbelastingCalculator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";

interface Erfgenaam {
  id: string;
  voornaam: string;
  achternaam: string;
  tussenvoegsel?: string;
  relatie: string;
  email?: string;
  telefoon?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  geboortedatum?: string;
  bsn?: string;
  shareIndex?: number;
  heeftShareOntvangen: boolean;
  shareUitgegevenOp?: string;
  legitimatieSoort?: number;
  legitimatieNummer?: string;
  legitimatieDatumAfgifte?: string;
  legitimatieGeldigTot?: string;
}

interface ShareInfo {
  index: number;
  waarde: string;
}

interface GenereerResponse {
  delen: ShareInfo[];
  drempel: number;
  totaalAantalDelen: number;
}

interface Toewijzing {
  id: string;
  erfgenaamId: string;
  erfgenaamNaam: string;
  entityType: string;
  entityId: string;
  entityNaam: string;
  instructies?: string;
}

interface AssetItem {
  id: string;
  naam: string;
  type: string;
}

const ENTITY_TYPE_KEYS = ["FysiekBezit", "Bankrekening", "Verzekering", "DigitaalAccount", "CryptoWallet"] as const;

const emptyForm = {
  voornaam: "",
  achternaam: "",
  tussenvoegsel: "",
  relatie: "",
  email: "",
  telefoon: "",
  adres: "",
  postcode: "",
  woonplaats: "",
  geboortedatum: "",
  bsn: "",
  legitimatieSoort: "0",
  legitimatieNummer: "",
  legitimatieDatumAfgifte: "",
  legitimatieGeldigTot: "",
};

function displayName(e: Erfgenaam): string {
  return e.tussenvoegsel
    ? `${e.voornaam} ${e.tussenvoegsel} ${e.achternaam}`
    : `${e.voornaam} ${e.achternaam}`;
}

export default function ErfgenamenPage() {
  const t = useTranslations("erfgenamen");
  const te = useTranslations("enums");
  const [erfgenamen, setErfgenamen] = useState<Erfgenaam[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toewijzing state
  const [toewijzingen, setToewijzingen] = useState<Toewijzing[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AssetItem[]>([]);
  const [toewijzingDialogOpen, setToewijzingDialogOpen] = useState(false);
  const [toewijzingForm, setToewijzingForm] = useState({
    erfgenaamId: "",
    entityType: "",
    entityId: "",
    instructies: "",
  });
  const [toewijzingSaving, setToewijzingSaving] = useState(false);
  const [expandedErfgenaam, setExpandedErfgenaam] = useState<string | null>(null);

  // Shamir state
  const [shamirDialogOpen, setShamirDialogOpen] = useState(false);
  const [shamirPassword, setShamirPassword] = useState("");
  const [shamirThreshold, setShamirThreshold] = useState("2");
  const [shamirGenerating, setShamirGenerating] = useState(false);
  const [generatedShares, setGeneratedShares] =
    useState<GenereerResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const loadData = () => {
    api
      .get<Erfgenaam[]>("/api/erfgenamen")
      .then((d) => setErfgenamen(d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadToewijzingen = () => {
    api
      .get<Toewijzing[]>("/api/toewijzingen")
      .then((d) => setToewijzingen(d ?? []))
      .catch(() => {});
  };

  const loadAvailableAssets = async () => {
    try {
      const [bezittingen, bankrekeningen, verzekeringen, accounts, crypto] =
        await Promise.all([
          api.get<{ id: string; omschrijving: string }[]>("/api/boedel/bezittingen").catch(() => []),
          api.get<{ id: string; bankNaam: string }[]>("/api/boedel/bankrekeningen").catch(() => []),
          api.get<{ id: string; verzekeraar: string }[]>("/api/boedel/verzekeringen").catch(() => []),
          api.get<{ id: string; platformNaam: string }[]>("/api/digitaal-bezit/accounts").catch(() => []),
          api.get<{ id: string; walletNaam: string }[]>("/api/digitaal-bezit/crypto").catch(() => []),
        ]);
      const assets: AssetItem[] = [
        ...(bezittingen ?? []).map((b) => ({ id: b.id, naam: b.omschrijving, type: "FysiekBezit" })),
        ...(bankrekeningen ?? []).map((b) => ({ id: b.id, naam: b.bankNaam, type: "Bankrekening" })),
        ...(verzekeringen ?? []).map((v) => ({ id: v.id, naam: v.verzekeraar, type: "Verzekering" })),
        ...(accounts ?? []).map((a) => ({ id: a.id, naam: a.platformNaam, type: "DigitaalAccount" })),
        ...(crypto ?? []).map((c) => ({ id: c.id, naam: c.walletNaam, type: "CryptoWallet" })),
      ];
      setAvailableAssets(assets);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
    loadToewijzingen();
    loadAvailableAssets();
  }, []);

  const openDialog = (item?: Erfgenaam) => {
    setError(null);
    if (item) {
      setEditId(item.id);
      setForm({
        voornaam: item.voornaam,
        achternaam: item.achternaam,
        tussenvoegsel: item.tussenvoegsel ?? "",
        relatie: item.relatie,
        email: item.email ?? "",
        telefoon: item.telefoon ?? "",
        adres: item.adres ?? "",
        postcode: item.postcode ?? "",
        woonplaats: item.woonplaats ?? "",
        geboortedatum: item.geboortedatum ?? "",
        bsn: item.bsn ?? "",
        legitimatieSoort: String(item.legitimatieSoort ?? 0),
        legitimatieNummer: item.legitimatieNummer ?? "",
        legitimatieDatumAfgifte: item.legitimatieDatumAfgifte ?? "",
        legitimatieGeldigTot: item.legitimatieGeldigTot ?? "",
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        tussenvoegsel: form.tussenvoegsel || null,
        email: form.email || null,
        telefoon: form.telefoon || null,
        adres: form.adres || null,
        postcode: form.postcode || null,
        woonplaats: form.woonplaats || null,
        geboortedatum: form.geboortedatum || null,
        bsn: form.bsn || null,
        legitimatieSoort: parseInt(form.legitimatieSoort),
        legitimatieNummer: form.legitimatieNummer || null,
        legitimatieDatumAfgifte: form.legitimatieDatumAfgifte || null,
        legitimatieGeldigTot: form.legitimatieGeldigTot || null,
      };
      if (editId) {
        await api.put(`/api/erfgenamen/${editId}`, payload);
      } else {
        await api.post("/api/erfgenamen", payload);
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/erfgenamen/${id}`);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  };

  const handleExportErfgenaam = async (id: string, voornaam: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
      const response = await fetch(`${API_BASE}/api/export/erfgenaam/${id}`, {
        method: "POST",
      });
      if (response.status === 423) { window.location.href = "/"; return; }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || t("exportMisluktCode", { code: response.status }));
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lumio-erfgenaam-${voornaam.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("exportMislukt"));
    }
  };

  const handleDeelMetErfgenaam = async (id: string, voornaam: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
      const response = await fetch(`${API_BASE}/api/export/delen/${id}`);
      if (response.status === 423) { window.location.href = "/"; return; }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || t("exportMisluktCode", { code: response.status }));
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lumio-deel-${voornaam.toLowerCase().replace(/\s+/g, "-")}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("exportMislukt"));
    }
  };

  const handleGenerateShares = async () => {
    setShamirGenerating(true);
    try {
      const result = await api.post<GenereerResponse>("/api/shamir/genereer", {
        wachtwoord: shamirPassword,
        aantalDelen: erfgenamen.length,
        drempel: parseInt(shamirThreshold),
      });
      setGeneratedShares(result);
      loadData();
    } catch (err) {
      setError(t("sleuteldelenMislukt"));
    } finally {
      setShamirGenerating(false);
    }
  };

  const copyShare = async (index: number, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const closeShamirDialog = () => {
    setShamirDialogOpen(false);
    setShamirPassword("");
    setGeneratedShares(null);
    setCopiedIndex(null);
  };

  const openToewijzingDialog = (erfgenaamId?: string) => {
    setToewijzingForm({
      erfgenaamId: erfgenaamId ?? "",
      entityType: "",
      entityId: "",
      instructies: "",
    });
    setToewijzingDialogOpen(true);
  };

  const filteredAssets = availableAssets.filter(
    (a) =>
      (!toewijzingForm.entityType || a.type === toewijzingForm.entityType) &&
      !toewijzingen.some(
        (t) =>
          t.entityId === a.id &&
          t.erfgenaamId === toewijzingForm.erfgenaamId
      )
  );

  const handleSaveToewijzing = async () => {
    setToewijzingSaving(true);
    try {
      await api.post("/api/toewijzingen", {
        erfgenaamId: toewijzingForm.erfgenaamId,
        entityType: toewijzingForm.entityType,
        entityId: toewijzingForm.entityId,
        instructies: toewijzingForm.instructies || null,
      });
      setToewijzingDialogOpen(false);
      loadToewijzingen();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("toewijzingOpslaanMislukt"));
    } finally {
      setToewijzingSaving(false);
    }
  };

  const handleDeleteToewijzing = async (id: string) => {
    try {
      await api.delete(`/api/toewijzingen/${id}`);
      loadToewijzingen();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("toewijzingVerwijderenMislukt"));
    }
  };

  const getToewijzingenVoorErfgenaam = (erfgenaamId: string) =>
    toewijzingen.filter((t) => t.erfgenaamId === erfgenaamId);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t("laden")}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("titel")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("beschrijving")}
          </p>
          <VoorbeeldDialog domein="erfgenamen" />
          <SectieNotitie sectie="erfgenamen" />
        </div>
        <div className="flex gap-2">
          {erfgenamen.length >= 2 && (
            <Button
              variant="outline"
              onClick={() => setShamirDialogOpen(true)}
            >
              <KeyRound className="h-4 w-4 mr-2" /> {t("noodcodesVerdelen")}
            </Button>
          )}
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" /> {t("toevoegen")}
          </Button>
        </div>
      </div>

      <DomainStatusBanner domein="erfgenamen" />

      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-sm text-indigo-800">
          <strong>{t("noodcodesInfoLabel")}</strong> {t("noodcodesInfo")}
        </p>
      </div>

      {/* Erfbelasting calculator */}
      {erfgenamen.length > 0 && <ErfbelastingCalculator />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {erfgenamen.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t("geenErfgenamen")}
            </p>
            <Button className="mt-4" onClick={() => openDialog()}>
              {t("toevoegen")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("aantal", { aantal: erfgenamen.length })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {erfgenamen.map((e) => {
                const erfToewijzingen = getToewijzingenVoorErfgenaam(e.id);
                const isExpanded = expandedErfgenaam === e.id;
                return (
                <div
                  key={e.id}
                  className="rounded-md border p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => setExpandedErfgenaam(isExpanded ? null : e.id)}>
                      <p className="text-sm font-medium">{displayName(e)}</p>
                      <p className="text-xs text-muted-foreground">
                        {te(`relatie.${e.relatie}`)}
                        {e.email && ` \u2014 ${e.email}`}
                        {e.telefoon && ` \u2014 ${e.telefoon}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {erfToewijzingen.length > 0 && (
                        <Badge variant="outline">
                          <Package className="h-3 w-3 mr-1" />
                          {erfToewijzingen.length}
                        </Badge>
                      )}
                      {e.heeftShareOntvangen && (
                        <Badge variant="outline">
                          <KeyRound className="h-3 w-3 mr-1" />
                          Share
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openToewijzingDialog(e.id)}
                        title={t("bezitToewijzen")}
                      >
                        <Package className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportErfgenaam(e.id, e.voornaam)}
                        title={t("pdfDownloaden")}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeelMetErfgenaam(e.id, e.voornaam)}
                        title={t("deelOverzicht")}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(e)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(e.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 border-t pt-3">
                      {erfToewijzingen.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">
                          {t("geenBezittingen")}{" "}
                          <button
                            className="underline text-primary"
                            onClick={() => openToewijzingDialog(e.id)}
                          >
                            {t("toewijzenKnop")}
                          </button>
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">{t("toegewezenBezittingen")}</p>
                          {erfToewijzingen.map((tw) => (
                            <div
                              key={tw.id}
                              className="flex items-center justify-between rounded bg-muted/50 px-3 py-2"
                            >
                              <div>
                                <p className="text-sm">{tw.entityNaam}</p>
                                <p className="text-xs text-muted-foreground">
                                  {te(`entityType.${tw.entityType}`)}
                                  {tw.instructies && ` — ${tw.instructies}`}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteToewijzing(tw.id)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erfgenaam Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>
            {editId ? t("dialog.bewerken") : t("dialog.toevoegen")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("dialog.voornaam")}</Label>
              <Input
                value={form.voornaam}
                onChange={(e) =>
                  setForm((f) => ({ ...f, voornaam: e.target.value }))
                }
                placeholder={t("dialog.voornaam")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dialog.achternaam")}</Label>
              <Input
                value={form.achternaam}
                onChange={(e) =>
                  setForm((f) => ({ ...f, achternaam: e.target.value }))
                }
                placeholder={t("dialog.achternaam")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("dialog.tussenvoegsel")}</Label>
            <Input
              value={form.tussenvoegsel}
              onChange={(e) =>
                setForm((f) => ({ ...f, tussenvoegsel: e.target.value }))
              }
              placeholder={t("dialog.tussenvoegselPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("dialog.relatie")}</Label>
            <Select
              value={form.relatie}
              onChange={(e) =>
                setForm((f) => ({ ...f, relatie: e.target.value }))
              }
            >
              <option value="">{te("relatie.selecteer")}</option>
              <option value="Partner">{te("relatie.Partner")}</option>
              <option value="Kind">{te("relatie.Kind")}</option>
              <option value="Ouder">{te("relatie.Ouder")}</option>
              <option value="Broer/Zus">{te("relatie.Broer/Zus")}</option>
              <option value="Kleinkind">{te("relatie.Kleinkind")}</option>
              <option value="Neef/Nicht">{te("relatie.Neef/Nicht")}</option>
              <option value="Vriend">{te("relatie.Vriend")}</option>
              <option value="Organisatie">{te("relatie.Organisatie")}</option>
              <option value="Anders">{te("relatie.Anders")}</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("dialog.email")}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dialog.telefoon")}</Label>
              <Input
                value={form.telefoon}
                onChange={(e) =>
                  setForm((f) => ({ ...f, telefoon: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("dialog.geboortedatum")}</Label>
            <Input
              type="date"
              value={form.geboortedatum}
              onChange={(e) =>
                setForm((f) => ({ ...f, geboortedatum: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("dialog.bsn")}</Label> <HelpTooltip tekst={t("dialog.bsnTooltip")} />
            <Input
              value={form.bsn}
              onChange={(e) =>
                setForm((f) => ({ ...f, bsn: e.target.value }))
              }
              placeholder={t("dialog.bsnPlaceholder")}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>{t("dialog.adres")}</Label>
              <Input
                value={form.adres}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adres: e.target.value }))
                }
                placeholder={t("dialog.adresPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dialog.postcode")}</Label>
              <Input
                value={form.postcode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, postcode: e.target.value }))
                }
                placeholder={t("dialog.postcodePlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("dialog.woonplaats")}</Label>
            <Input
              value={form.woonplaats}
              onChange={(e) =>
                setForm((f) => ({ ...f, woonplaats: e.target.value }))
              }
              placeholder={t("dialog.woonplaats")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("dialog.legitimatie")}</Label>
              <Select
                value={form.legitimatieSoort}
                onChange={(e) =>
                  setForm((f) => ({ ...f, legitimatieSoort: e.target.value }))
                }
              >
                <option value="0">{te("legitimatie.geen")}</option>
                <option value="1">{te("legitimatie.paspoort")}</option>
                <option value="2">{te("legitimatie.identiteitskaart")}</option>
                <option value="3">{te("legitimatie.rijbewijs")}</option>
              </Select>
            </div>
            {form.legitimatieSoort !== "0" && (
              <div className="space-y-2">
                <Label>{t("dialog.documentnummer")}</Label>
                <Input
                  value={form.legitimatieNummer}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, legitimatieNummer: e.target.value }))
                  }
                  placeholder={t("dialog.documentnummer")}
                />
              </div>
            )}
          </div>
          {form.legitimatieSoort !== "0" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("dialog.datumAfgifte")}</Label>
                <Input
                  type="date"
                  value={form.legitimatieDatumAfgifte}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, legitimatieDatumAfgifte: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dialog.geldigTot")}</Label>
                <Input
                  type="date"
                  value={form.legitimatieGeldigTot}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, legitimatieGeldigTot: e.target.value }))
                  }
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            {t("dialog.annuleren")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("dialog.opslaanBezig") : t("dialog.opslaan")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Toewijzing Dialog */}
      <Dialog open={toewijzingDialogOpen} onOpenChange={setToewijzingDialogOpen}>
        <DialogHeader>
          <DialogTitle>{t("toewijzingDialog.titel")}</DialogTitle>
          <DialogDescription>
            {t("toewijzingDialog.beschrijving")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("toewijzingDialog.erfgenaam")}</Label>
            <Select
              value={toewijzingForm.erfgenaamId}
              onChange={(e) =>
                setToewijzingForm((f) => ({ ...f, erfgenaamId: e.target.value }))
              }
            >
              <option value="">{t("toewijzingDialog.erfgenaamSelecteer")}</option>
              {erfgenamen.map((e) => (
                <option key={e.id} value={e.id}>
                  {displayName(e)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("toewijzingDialog.typeBezit")}</Label>
            <Select
              value={toewijzingForm.entityType}
              onChange={(e) =>
                setToewijzingForm((f) => ({
                  ...f,
                  entityType: e.target.value,
                  entityId: "",
                }))
              }
            >
              <option value="">{t("toewijzingDialog.alleTypes")}</option>
              {ENTITY_TYPE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {te(`entityType.${key}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("toewijzingDialog.bezit")}</Label>
            <Select
              value={toewijzingForm.entityId}
              onChange={(e) => {
                const selectedAsset = filteredAssets.find(a => a.id === e.target.value);
                setToewijzingForm((f) => ({
                  ...f,
                  entityId: e.target.value,
                  entityType: selectedAsset?.type ?? f.entityType,
                }));
              }}
            >
              <option value="">{t("toewijzingDialog.bezitSelecteer")}</option>
              {filteredAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.naam} ({te(`entityType.${a.type}`)})
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("toewijzingDialog.instructies")}</Label>
            <Textarea
              value={toewijzingForm.instructies}
              onChange={(e) =>
                setToewijzingForm((f) => ({ ...f, instructies: e.target.value }))
              }
              placeholder={t("toewijzingDialog.instructiesPlaceholder")}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setToewijzingDialogOpen(false)}>
            {t("toewijzingDialog.annuleren")}
          </Button>
          <Button
            onClick={handleSaveToewijzing}
            disabled={
              toewijzingSaving ||
              !toewijzingForm.erfgenaamId ||
              !toewijzingForm.entityType ||
              !toewijzingForm.entityId
            }
          >
            {toewijzingSaving ? t("toewijzingDialog.opslaanBezig") : t("toewijzingDialog.toewijzen")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Shamir Generate Dialog */}
      <Dialog open={shamirDialogOpen} onOpenChange={closeShamirDialog}>
        <DialogHeader>
          <DialogTitle>{t("shamir.titel")}</DialogTitle>
          <DialogDescription>
            {t("shamir.beschrijving", { aantal: erfgenamen.length })}
          </DialogDescription>
        </DialogHeader>

        {!generatedShares ? (
          <>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  <strong>{t("shamir.waarschuwing")}</strong> {t("shamir.waarschuwingTekst")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("shamir.wachtwoord")}</Label>
                <Input
                  type="password"
                  value={shamirPassword}
                  onChange={(e) => setShamirPassword(e.target.value)}
                  placeholder={t("shamir.wachtwoordPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t("shamir.drempel")}
                  <HelpTooltip tekst={t("shamir.drempelTooltip")} />
                </Label>
                <Select
                  value={shamirThreshold}
                  onChange={(e) => setShamirThreshold(e.target.value)}
                >
                  {Array.from(
                    { length: Math.max(erfgenamen.length - 1, 1) },
                    (_, i) => i + 2
                  ).map((n) => (
                    <option key={n} value={n.toString()}>
                      {t("shamir.drempelOptie", { n, totaal: erfgenamen.length })}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  {t.rich("shamir.delenInfo", {
                    aantal: erfgenamen.length,
                    drempel: shamirThreshold,
                    strong: (chunks) => <strong>{chunks}</strong>
                  })}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeShamirDialog}>
                {t("shamir.annuleren")}
              </Button>
              <Button
                onClick={handleGenerateShares}
                disabled={shamirGenerating || !shamirPassword}
              >
                {shamirGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("shamir.genererenBezig")}
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    {t("shamir.genereren")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <Alert variant="success">
                <AlertDescription>
                  <strong>{t("shamir.succes")}</strong> {t("shamir.succesTekst", { aantal: generatedShares.totaalAantalDelen, drempel: generatedShares.drempel })}
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                {generatedShares.delen.map((share, i) => (
                  <div
                    key={share.index}
                    className="rounded-md border p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t("shamir.deel", { index: share.index })} &mdash;{" "}
                        {erfgenamen[i] ? displayName(erfgenamen[i]) : t("shamir.erfgenaamFallback", { nummer: i + 1 })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyShare(share.index, share.waarde)}
                      >
                        {copiedIndex === share.index ? (
                          <>
                            <Check className="h-3 w-3 mr-1" /> {t("shamir.gekopieerd")}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" /> {t("shamir.kopieren")}
                          </>
                        )}
                      </Button>
                    </div>
                    <code className="block w-full rounded bg-muted p-2 text-xs break-all font-mono">
                      {share.waarde}
                    </code>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={closeShamirDialog}>{t("shamir.sluiten")}</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}
