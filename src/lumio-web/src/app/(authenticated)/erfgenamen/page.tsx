"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
} from "lucide-react";

interface Erfgenaam {
  id: string;
  voornaam: string;
  achternaam: string;
  tussenvoegsel?: string;
  relatie: string;
  email?: string;
  telefoon?: string;
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

const emptyForm = {
  voornaam: "",
  achternaam: "",
  tussenvoegsel: "",
  relatie: "",
  email: "",
  telefoon: "",
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

  useEffect(() => {
    loadData();
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
              {erfgenamen.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{displayName(e)}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.relatie}
                      {e.email && ` \u2014 ${e.email}`}
                      {e.telefoon && ` \u2014 ${e.telefoon}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {e.heeftShareOntvangen && (
                      <Badge variant="outline">
                        <KeyRound className="h-3 w-3 mr-1" />
                        Share
                      </Badge>
                    )}
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
              ))}
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
