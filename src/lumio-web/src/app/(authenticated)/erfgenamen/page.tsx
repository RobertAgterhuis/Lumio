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
} from "lucide-react";

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
  shareIndex?: number;
  heeftShareOntvangen: boolean;
  shareUitgegevenOp?: string;
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

const ENTITY_TYPE_LABELS: Record<string, string> = {
  FysiekBezit: "Bezitting",
  Bankrekening: "Bankrekening",
  Verzekering: "Verzekering",
  DigitaalAccount: "Digitaal Account",
  CryptoWallet: "Crypto Wallet",
};

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
};

function displayName(e: Erfgenaam): string {
  return e.tussenvoegsel
    ? `${e.voornaam} ${e.tussenvoegsel} ${e.achternaam}`
    : `${e.voornaam} ${e.achternaam}`;
}

export default function ErfgenamenPage() {
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
      };
      if (editId) {
        await api.put(`/api/erfgenamen/${editId}`, payload);
      } else {
        await api.post("/api/erfgenamen", payload);
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/erfgenamen/${id}`);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verwijderen mislukt.");
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
      setError("Sleuteldelen genereren mislukt.");
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
      setError(err instanceof Error ? err.message : "Toewijzing opslaan mislukt.");
    } finally {
      setToewijzingSaving(false);
    }
  };

  const handleDeleteToewijzing = async (id: string) => {
    try {
      await api.delete(`/api/toewijzingen/${id}`);
      loadToewijzingen();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toewijzing verwijderen mislukt.");
    }
  };

  const getToewijzingenVoorErfgenaam = (erfgenaamId: string) =>
    toewijzingen.filter((t) => t.erfgenaamId === erfgenaamId);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Erfgenamen</h1>
          <p className="text-muted-foreground mt-1">
            Erfgenamen beheren en sleuteldelen verdelen
          </p>
        </div>
        <div className="flex gap-2">
          {erfgenamen.length >= 2 && (
            <Button
              variant="outline"
              onClick={() => setShamirDialogOpen(true)}
            >
              <KeyRound className="h-4 w-4 mr-2" /> Sleuteldelen genereren
            </Button>
          )}
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" /> Erfgenaam toevoegen
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-sm text-indigo-800">
          <strong>Shamir&apos;s Secret Sharing:</strong> Verdeel uw
          hoofdwachtwoord in delen onder erfgenamen. Een minimum aantal personen
          (drempel) kan samen het wachtwoord reconstrueren. Individuele delen
          zijn waardeloos — pas als genoeg personen samenwerken wordt het geheim
          onthuld.
        </p>
      </div>

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
              Nog geen erfgenamen toegevoegd.
            </p>
            <Button className="mt-4" onClick={() => openDialog()}>
              Erfgenaam toevoegen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Erfgenamen ({erfgenamen.length})</CardTitle>
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
                        {e.relatie}
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
                        title="Bezit toewijzen"
                      >
                        <Package className="h-3 w-3" />
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
                          Nog geen bezittingen toegewezen.{" "}
                          <button
                            className="underline text-primary"
                            onClick={() => openToewijzingDialog(e.id)}
                          >
                            Toewijzen
                          </button>
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Toegewezen bezittingen:</p>
                          {erfToewijzingen.map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center justify-between rounded bg-muted/50 px-3 py-2"
                            >
                              <div>
                                <p className="text-sm">{t.entityNaam}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ENTITY_TYPE_LABELS[t.entityType] ?? t.entityType}
                                  {t.instructies && ` — ${t.instructies}`}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteToewijzing(t.id)}
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
            {editId ? "Erfgenaam bewerken" : "Erfgenaam toevoegen"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Voornaam</Label>
              <Input
                value={form.voornaam}
                onChange={(e) =>
                  setForm((f) => ({ ...f, voornaam: e.target.value }))
                }
                placeholder="Voornaam"
              />
            </div>
            <div className="space-y-2">
              <Label>Achternaam</Label>
              <Input
                value={form.achternaam}
                onChange={(e) =>
                  setForm((f) => ({ ...f, achternaam: e.target.value }))
                }
                placeholder="Achternaam"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tussenvoegsel</Label>
            <Input
              value={form.tussenvoegsel}
              onChange={(e) =>
                setForm((f) => ({ ...f, tussenvoegsel: e.target.value }))
              }
              placeholder="bijv. van, de, van der"
            />
          </div>
          <div className="space-y-2">
            <Label>Relatie</Label>
            <Select
              value={form.relatie}
              onChange={(e) =>
                setForm((f) => ({ ...f, relatie: e.target.value }))
              }
            >
              <option value="">Selecteer...</option>
              <option value="Partner">Partner</option>
              <option value="Kind">Kind</option>
              <option value="Ouder">Ouder</option>
              <option value="Broer/Zus">Broer/Zus</option>
              <option value="Kleinkind">Kleinkind</option>
              <option value="Neef/Nicht">Neef/Nicht</option>
              <option value="Vriend">Vriend(in)</option>
              <option value="Organisatie">Organisatie</option>
              <option value="Anders">Anders</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Telefoon</Label>
              <Input
                value={form.telefoon}
                onChange={(e) =>
                  setForm((f) => ({ ...f, telefoon: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Geboortedatum</Label>
            <Input
              type="date"
              value={form.geboortedatum}
              onChange={(e) =>
                setForm((f) => ({ ...f, geboortedatum: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Adres</Label>
              <Input
                value={form.adres}
                onChange={(e) =>
                  setForm((f) => ({ ...f, adres: e.target.value }))
                }
                placeholder="Straat en huisnummer"
              />
            </div>
            <div className="space-y-2">
              <Label>Postcode</Label>
              <Input
                value={form.postcode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, postcode: e.target.value }))
                }
                placeholder="1234 AB"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Woonplaats</Label>
            <Input
              value={form.woonplaats}
              onChange={(e) =>
                setForm((f) => ({ ...f, woonplaats: e.target.value }))
              }
              placeholder="Woonplaats"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Opslaan..." : "Opslaan"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Toewijzing Dialog */}
      <Dialog open={toewijzingDialogOpen} onOpenChange={setToewijzingDialogOpen}>
        <DialogHeader>
          <DialogTitle>Bezit toewijzen aan erfgenaam</DialogTitle>
          <DialogDescription>
            Wijs een bezitting, rekening of account toe aan een erfgenaam.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Erfgenaam</Label>
            <Select
              value={toewijzingForm.erfgenaamId}
              onChange={(e) =>
                setToewijzingForm((f) => ({ ...f, erfgenaamId: e.target.value }))
              }
            >
              <option value="">Selecteer erfgenaam...</option>
              {erfgenamen.map((e) => (
                <option key={e.id} value={e.id}>
                  {displayName(e)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type bezit</Label>
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
              <option value="">Alle types...</option>
              {Object.entries(ENTITY_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bezit</Label>
            <Select
              value={toewijzingForm.entityId}
              onChange={(e) =>
                setToewijzingForm((f) => ({ ...f, entityId: e.target.value }))
              }
            >
              <option value="">Selecteer bezit...</option>
              {filteredAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.naam} ({ENTITY_TYPE_LABELS[a.type] ?? a.type})
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Instructies (optioneel)</Label>
            <Textarea
              value={toewijzingForm.instructies}
              onChange={(e) =>
                setToewijzingForm((f) => ({ ...f, instructies: e.target.value }))
              }
              placeholder="Bijv. 'Bewaar dit als aandenken' of 'Verkopen en opbrengst verdelen'"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setToewijzingDialogOpen(false)}>
            Annuleren
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
            {toewijzingSaving ? "Opslaan..." : "Toewijzen"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Shamir Generate Dialog */}
      <Dialog open={shamirDialogOpen} onOpenChange={closeShamirDialog}>
        <DialogHeader>
          <DialogTitle>Shamir Sleuteldelen Genereren</DialogTitle>
          <DialogDescription>
            Verdeel uw hoofdwachtwoord in {erfgenamen.length} delen. Alleen
            wanneer het minimum aantal personen (drempel) hun deel samenvoegt,
            kan het wachtwoord worden gereconstrueerd.
          </DialogDescription>
        </DialogHeader>

        {!generatedShares ? (
          <>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  <strong>Waarschuwing:</strong> De sleuteldelen worden NIET
                  opgeslagen in Lumio. Noteer ze zorgvuldig of druk ze af.
                  Verloren delen kunnen niet worden hersteld.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Uw hoofdwachtwoord</Label>
                <Input
                  type="password"
                  value={shamirPassword}
                  onChange={(e) => setShamirPassword(e.target.value)}
                  placeholder="Voer uw Lumio hoofdwachtwoord in"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Drempel (minimum aantal delen voor reconstructie)
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
                      {n} van {erfgenamen.length} personen
                    </option>
                  ))}
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  Er worden <strong>{erfgenamen.length}</strong> delen
                  gegenereerd, waarvan er minimaal{" "}
                  <strong>{shamirThreshold}</strong> nodig zijn.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeShamirDialog}>
                Annuleren
              </Button>
              <Button
                onClick={handleGenerateShares}
                disabled={shamirGenerating || !shamirPassword}
              >
                {shamirGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Genereren...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    Genereren
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-800">
                  <strong>Succes!</strong> Er zijn{" "}
                  {generatedShares.totaalAantalDelen} delen gegenereerd met een
                  drempel van {generatedShares.drempel}. Kopieer elk deel en
                  geef het aan de betreffende erfgenaam.
                </p>
              </div>
              <div className="space-y-3">
                {generatedShares.delen.map((share, i) => (
                  <div
                    key={share.index}
                    className="rounded-md border p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Deel {share.index} &mdash;{" "}
                        {erfgenamen[i] ? displayName(erfgenamen[i]) : `Erfgenaam ${i + 1}`}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyShare(share.index, share.waarde)}
                      >
                        {copiedIndex === share.index ? (
                          <>
                            <Check className="h-3 w-3 mr-1" /> Gekopieerd
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" /> Kopiëren
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
              <Button onClick={closeShamirDialog}>Sluiten</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
}
