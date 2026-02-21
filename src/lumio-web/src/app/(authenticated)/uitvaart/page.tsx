"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { Church, Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface UitvaartWensen {
  id: string;
  voorkeurType: string;
  begraafplaats?: string;
  uitvaartOndernemer?: string;
  uitvaartOndernemerTelefoon?: string;
  uitvaartOndernemerEmail?: string;
  uitvaartOndernemerAdres?: string;
  uitvaartOndernemerPostcode?: string;
  uitvaartOndernemerPlaats?: string;
  heeftUitvaartVerzekering: boolean;
  uitvaartVerzekeringDetails?: string;
  ceremonieSoort?: string;
  ceremonieLocatie?: string;
  muziekwensen?: string;
  sprekers?: string;
  bloemen?: string;
  kledingwensen?: string;
  rouwkaartTekst?: string;
  condoleance?: string;
  overigeWensen?: string;
}

interface CeremonieDetail {
  id: string;
  onderdeel: string;
  beschrijving?: string;
  volgorde: number;
}

export default function UitvaartPage() {
  const [data, setData] = useState<UitvaartWensen | null>(null);
  const [details, setDetails] = useState<CeremonieDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Ceremonie detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDetailId, setEditDetailId] = useState<string | null>(null);
  const [detailForm, setDetailForm] = useState({
    onderdeel: "",
    beschrijving: "",
    volgorde: 0,
  });
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      api.get<UitvaartWensen>("/api/uitvaart").catch(() => null),
      api
        .get<CeremonieDetail[]>("/api/uitvaart/details")
        .catch(() => []),
    ])
      .then(([u, d]) => {
        setData(u);
        setDetails(
          (d ?? []).sort((a, b) => a.volgorde - b.volgorde)
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDetailDialog = (detail?: CeremonieDetail) => {
    setDetailError(null);
    if (detail) {
      setEditDetailId(detail.id);
      setDetailForm({
        onderdeel: detail.onderdeel,
        beschrijving: detail.beschrijving ?? "",
        volgorde: detail.volgorde,
      });
    } else {
      setEditDetailId(null);
      setDetailForm({
        onderdeel: "",
        beschrijving: "",
        volgorde: details.length + 1,
      });
    }
    setDetailDialogOpen(true);
  };

  const saveDetail = async () => {
    setDetailError(null);
    try {
      const payload = {
        onderdeel: detailForm.onderdeel,
        beschrijving: detailForm.beschrijving || null,
        volgorde: detailForm.volgorde,
      };
      if (editDetailId) {
        await api.put(`/api/uitvaart/details/${editDetailId}`, payload);
      } else {
        await api.post("/api/uitvaart/details", payload);
      }
      setDetailDialogOpen(false);
      loadData();
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : "Opslaan mislukt."
      );
    }
  };

  const deleteDetail = async (id: string) => {
    try {
      await api.delete(`/api/uitvaart/details/${id}`);
      setDetails((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : "Verwijderen mislukt."
      );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Uitvaartwensen</h1>
          <p className="text-muted-foreground mt-1">
            Begrafenis of crematie, ceremonie en rouwkaart
          </p>
        </div>
        <Link href="/uitvaart/wizard">
          <Button>
            <Church className="h-4 w-4 mr-2" />
            {data ? "Bewerken" : "Wizard starten"}
          </Button>
        </Link>
      </div>

      {!data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Church className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nog geen uitvaartwensen vastgelegd.
            </p>
            <Link href="/uitvaart/wizard">
              <Button className="mt-4">Wizard starten</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Uitvaart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <strong>{data.voorkeurType}</strong>
                </p>
                {data.begraafplaats && (
                  <p>
                    <span className="text-muted-foreground">
                      Begraafplaats:
                    </span>{" "}
                    {data.begraafplaats}
                  </p>
                )}
                {data.uitvaartOndernemer && (
                  <p>
                    <span className="text-muted-foreground">
                      Ondernemer:
                    </span>{" "}
                    {data.uitvaartOndernemer}
                  </p>
                )}
                {data.uitvaartOndernemerTelefoon && (
                  <p>
                    <span className="text-muted-foreground">Tel. ondernemer:</span>{" "}
                    {data.uitvaartOndernemerTelefoon}
                  </p>
                )}
                {data.uitvaartOndernemerEmail && (
                  <p>
                    <span className="text-muted-foreground">E-mail ondernemer:</span>{" "}
                    {data.uitvaartOndernemerEmail}
                  </p>
                )}
                {data.uitvaartOndernemerAdres && (
                  <p>
                    <span className="text-muted-foreground">Adres ondernemer:</span>{" "}
                    {data.uitvaartOndernemerAdres}
                    {data.uitvaartOndernemerPostcode ? `, ${data.uitvaartOndernemerPostcode}` : ""}
                    {data.uitvaartOndernemerPlaats ? ` ${data.uitvaartOndernemerPlaats}` : ""}
                  </p>
                )}
                {data.kledingwensen && (
                  <p>
                    <span className="text-muted-foreground">Kleding:</span>{" "}
                    {data.kledingwensen}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ceremonie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {data.ceremonieSoort && (
                  <p>
                    <span className="text-muted-foreground">Soort:</span>{" "}
                    {data.ceremonieSoort}
                    {data.ceremonieLocatie &&
                      ` — ${data.ceremonieLocatie}`}
                  </p>
                )}
                {data.muziekwensen && (
                  <p>
                    <span className="text-muted-foreground">Muziek:</span>{" "}
                    {data.muziekwensen}
                  </p>
                )}
                {data.bloemen && (
                  <p>
                    <span className="text-muted-foreground">Bloemen:</span>{" "}
                    {data.bloemen}
                  </p>
                )}
                {data.rouwkaartTekst && (
                  <p>
                    <span className="text-muted-foreground">
                      Rouwkaart:
                    </span>{" "}
                    {data.rouwkaartTekst}
                  </p>
                )}
                {data.condoleance && (
                  <p>
                    <span className="text-muted-foreground">
                      Condoleance:
                    </span>{" "}
                    {data.condoleance}
                  </p>
                )}
                {data.overigeWensen && (
                  <p>
                    <span className="text-muted-foreground">
                      Aanvullend:
                    </span>{" "}
                    {data.overigeWensen}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ceremonieverloop</CardTitle>
                <Button size="sm" onClick={() => openDetailDialog()}>
                  <Plus className="h-4 w-4 mr-1" /> Toevoegen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {detailError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 mb-3">
                  <p className="text-sm text-red-800">{detailError}</p>
                </div>
              )}
              {details.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nog geen ceremonie-onderdelen toegevoegd.
                </p>
              ) : (
                <div className="space-y-2">
                  {details.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          <span className="text-muted-foreground mr-2">
                            {d.volgorde}.
                          </span>
                          {d.onderdeel}
                        </p>
                        {d.beschrijving && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {d.beschrijving}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailDialog(d)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDetail(d.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogHeader>
          <DialogTitle>
            {editDetailId
              ? "Onderdeel bewerken"
              : "Onderdeel toevoegen"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Onderdeel</Label>
            <Input
              value={detailForm.onderdeel}
              onChange={(e) =>
                setDetailForm((f) => ({
                  ...f,
                  onderdeel: e.target.value,
                }))
              }
              placeholder="bijv. Welkom, Toespraak, Muziek, Afscheid"
            />
          </div>
          <div className="space-y-2">
            <Label>Beschrijving</Label>
            <Textarea
              value={detailForm.beschrijving}
              onChange={(e) =>
                setDetailForm((f) => ({
                  ...f,
                  beschrijving: e.target.value,
                }))
              }
              placeholder="Details over dit onderdeel..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Volgorde</Label>
            <Input
              type="number"
              value={detailForm.volgorde}
              onChange={(e) =>
                setDetailForm((f) => ({
                  ...f,
                  volgorde: parseInt(e.target.value) || 0,
                }))
              }
              min={1}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDetailDialogOpen(false)}
          >
            Annuleren
          </Button>
          <Button onClick={saveDetail}>Opslaan</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
