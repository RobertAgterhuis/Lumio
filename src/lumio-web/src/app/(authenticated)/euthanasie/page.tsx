"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import { Stethoscope, Pencil } from "lucide-react";
import Link from "next/link";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";

interface Wilsverklaring {
  id: string;
  wilEuthanasie: boolean;
  situatieBeschrijving?: string;
  huisarts?: string;
  huisartsPraktijk?: string;
  huisartsTelefoon?: string;
  huisartsEmail?: string;
  vertegenwoordigerNaam?: string;
  vertegenwoordigerRelatie?: string;
  vertegenwoordigerTelefoon?: string;
  vertegenwoordigerEmail?: string;
  vertegenwoordigerAdres?: string;
  vertegenwoordigerPostcode?: string;
  vertegenwoordigerWoonplaats?: string;
  aanvullendeWensen?: string;
  datumOndertekening?: string;
  dementieClausule: boolean;
  dementieClausuleToelichting?: string;
  behandelVerbod?: string;
}

export default function EuthanasiePage() {
  const [data, setData] = useState<Wilsverklaring | null>(null);
  const [loading, setLoading] = useState(true);

  // P-S5: Direct-edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    wilEuthanasie: false, situatieBeschrijving: "", aanvullendeWensen: "",
    datumOndertekening: "", huisarts: "", huisartsPraktijk: "", huisartsTelefoon: "",
    huisartsEmail: "", vertegenwoordigerNaam: "", vertegenwoordigerRelatie: "",
    vertegenwoordigerTelefoon: "", vertegenwoordigerEmail: "", vertegenwoordigerAdres: "",
    vertegenwoordigerPostcode: "", vertegenwoordigerWoonplaats: "",
    dementieClausule: false, dementieClausuleToelichting: "", behandelVerbod: "",
  });
  const [editError, setEditError] = useState<string | null>(null);

  const openEdit = () => {
    if (!data) return;
    setEditError(null);
    setEditForm({
      wilEuthanasie: data.wilEuthanasie,
      situatieBeschrijving: data.situatieBeschrijving ?? "",
      aanvullendeWensen: data.aanvullendeWensen ?? "",
      datumOndertekening: data.datumOndertekening ?? "",
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
      dementieClausule: data.dementieClausule ?? false,
      dementieClausuleToelichting: data.dementieClausuleToelichting ?? "",
      behandelVerbod: data.behandelVerbod ?? "",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setEditError(null);
    try {
      const payload = {
        wilEuthanasie: editForm.wilEuthanasie,
        datumOndertekening: editForm.datumOndertekening || null,
        situatieBeschrijving: editForm.situatieBeschrijving || null,
        aanvullendeWensen: editForm.aanvullendeWensen || null,
        huisarts: editForm.huisarts || null,
        huisartsPraktijk: editForm.huisartsPraktijk || null,
        huisartsTelefoon: editForm.huisartsTelefoon || null,
        huisartsEmail: editForm.huisartsEmail || null,
        vertegenwoordigerNaam: editForm.vertegenwoordigerNaam || null,
        vertegenwoordigerRelatie: editForm.vertegenwoordigerRelatie || null,
        vertegenwoordigerTelefoon: editForm.vertegenwoordigerTelefoon || null,
        vertegenwoordigerEmail: editForm.vertegenwoordigerEmail || null,
        vertegenwoordigerAdres: editForm.vertegenwoordigerAdres || null,
        vertegenwoordigerPostcode: editForm.vertegenwoordigerPostcode || null,
        vertegenwoordigerWoonplaats: editForm.vertegenwoordigerWoonplaats || null,
        dementieClausule: editForm.dementieClausule,
        dementieClausuleToelichting: editForm.dementieClausuleToelichting || null,
        behandelVerbod: editForm.behandelVerbod || null,
      };
      const updated = await api.put<Wilsverklaring>("/api/euthanasie", payload);
      setData(updated);
      setEditOpen(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Opslaan mislukt.");
    }
  };

  useEffect(() => {
    api
      .get<Wilsverklaring>("/api/euthanasie")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          <h1 className="text-3xl font-bold">Wilsverklaring Euthanasie</h1>
          <p className="text-muted-foreground mt-1">
            Uw wensen conform de WGBO
          </p>
          <VoorbeeldDialog domein="euthanasie" />
          <SectieNotitie sectie="euthanasie" />
        </div>
        <Link href="/euthanasie/wizard">
          <Button>
            <Stethoscope className="h-4 w-4 mr-2" />
            {data ? "Bewerken" : "Wizard starten"}
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <p className="text-sm text-purple-800">
          <strong>Belangrijk:</strong> Een schriftelijke wilsverklaring
          euthanasie is geen garantie dat euthanasie wordt uitgevoerd. De arts
          moet altijd de zorgvuldigheidseisen van de Wet toetsing
          levensbeëindiging (Wtl) toetsen.
        </p>
      </div>

      {!data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nog geen wilsverklaring vastgelegd.
            </p>
            <Link href="/euthanasie/wizard">
              <Button className="mt-4">Wizard starten</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Wilsverklaring</CardTitle>
                <Button variant="ghost" size="sm" onClick={openEdit}><Pencil className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Wil euthanasie:</span>{" "}
                {data.wilEuthanasie ? "Ja" : "Nee"}
              </p>
              {data.datumOndertekening && (
                <p>
                  <span className="text-muted-foreground">
                    Datum ondertekening:
                  </span>{" "}
                  {data.datumOndertekening}
                </p>
              )}
              {data.situatieBeschrijving && (
                <p>
                  <span className="text-muted-foreground">Situatie:</span>{" "}
                  {data.situatieBeschrijving}
                </p>
              )}
              {data.aanvullendeWensen && (
                <p>
                  <span className="text-muted-foreground">
                    Aanvullende wensen:
                  </span>{" "}
                  {data.aanvullendeWensen}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Huisarts & Vertegenwoordiger</CardTitle>
                <Button variant="ghost" size="sm" onClick={openEdit}><Pencil className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {data.huisarts && (
                <p>
                  <span className="text-muted-foreground">Huisarts:</span>{" "}
                  {data.huisarts}
                </p>
              )}
              {data.huisartsPraktijk && (
                <p>
                  <span className="text-muted-foreground">Praktijk:</span>{" "}
                  {data.huisartsPraktijk}
                </p>
              )}
              {data.huisartsTelefoon && (
                <p>
                  <span className="text-muted-foreground">Telefoon huisarts:</span>{" "}
                  {data.huisartsTelefoon}
                </p>
              )}
              {data.huisartsEmail && (
                <p>
                  <span className="text-muted-foreground">E-mail huisarts:</span>{" "}
                  {data.huisartsEmail}
                </p>
              )}
              {data.vertegenwoordigerNaam && (
                <p>
                  <span className="text-muted-foreground">
                    Vertegenwoordiger:
                  </span>{" "}
                  {data.vertegenwoordigerNaam} ({data.vertegenwoordigerRelatie})
                </p>
              )}
              {data.vertegenwoordigerTelefoon && (
                <p>
                  <span className="text-muted-foreground">Tel. vertegenwoordiger:</span>{" "}
                  {data.vertegenwoordigerTelefoon}
                </p>
              )}
              {data.vertegenwoordigerEmail && (
                <p>
                  <span className="text-muted-foreground">E-mail vertegenwoordiger:</span>{" "}
                  {data.vertegenwoordigerEmail}
                </p>
              )}
              {data.vertegenwoordigerAdres && (
                <p>
                  <span className="text-muted-foreground">Adres vertegenwoordiger:</span>{" "}
                  {data.vertegenwoordigerAdres}
                  {data.vertegenwoordigerPostcode ? `, ${data.vertegenwoordigerPostcode}` : ""}
                  {data.vertegenwoordigerWoonplaats ? ` ${data.vertegenwoordigerWoonplaats}` : ""}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {(data.dementieClausule || data.behandelVerbod) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Aanvullende clausules</CardTitle>
                <Button variant="ghost" size="sm" onClick={openEdit}><Pencil className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Dementieclausule:</span> {data.dementieClausule ? "Ja" : "Nee"}</p>
              {data.dementieClausuleToelichting && (
                <p><span className="text-muted-foreground">Toelichting:</span> {data.dementieClausuleToelichting}</p>
              )}
              {data.behandelVerbod && (
                <p><span className="text-muted-foreground">Behandelverbod:</span> {data.behandelVerbod}</p>
              )}
            </CardContent>
          </Card>
        )}
      </>
      )}

      {/* P-S5: Direct-edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogHeader>
          <DialogTitle>Wilsverklaring bewerken</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {editError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2">
              <p className="text-sm text-red-800">{editError}</p>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="wil-euthanasie" checked={editForm.wilEuthanasie} onChange={(e) => setEditForm((f) => ({ ...f, wilEuthanasie: e.target.checked }))} className="h-4 w-4 rounded border-border" />
            <Label htmlFor="wil-euthanasie">Wil euthanasie</Label>
          </div>
          <div className="space-y-2">
            <Label>Datum ondertekening</Label>
            <Input type="date" value={editForm.datumOndertekening} onChange={(e) => setEditForm((f) => ({ ...f, datumOndertekening: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Situatiebeschrijving</Label>
            <Textarea value={editForm.situatieBeschrijving} onChange={(e) => setEditForm((f) => ({ ...f, situatieBeschrijving: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Aanvullende wensen</Label>
            <Textarea value={editForm.aanvullendeWensen} onChange={(e) => setEditForm((f) => ({ ...f, aanvullendeWensen: e.target.value }))} rows={2} />
          </div>
          <hr />
          <p className="text-sm font-medium text-muted-foreground">Huisarts</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Naam huisarts</Label>
              <Input value={editForm.huisarts} onChange={(e) => setEditForm((f) => ({ ...f, huisarts: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Praktijk</Label>
              <Input value={editForm.huisartsPraktijk} onChange={(e) => setEditForm((f) => ({ ...f, huisartsPraktijk: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Telefoon</Label>
              <Input value={editForm.huisartsTelefoon} onChange={(e) => setEditForm((f) => ({ ...f, huisartsTelefoon: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={editForm.huisartsEmail} onChange={(e) => setEditForm((f) => ({ ...f, huisartsEmail: e.target.value }))} />
            </div>
          </div>
          <hr />
          <p className="text-sm font-medium text-muted-foreground">Vertegenwoordiger</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Naam</Label>
              <Input value={editForm.vertegenwoordigerNaam} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerNaam: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Relatie</Label>
              <Input value={editForm.vertegenwoordigerRelatie} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerRelatie: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Telefoon</Label>
              <Input value={editForm.vertegenwoordigerTelefoon} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerTelefoon: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={editForm.vertegenwoordigerEmail} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerEmail: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-2">
              <Label>Adres</Label>
              <Input value={editForm.vertegenwoordigerAdres} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerAdres: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Postcode</Label>
              <Input value={editForm.vertegenwoordigerPostcode} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerPostcode: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Woonplaats</Label>
            <Input value={editForm.vertegenwoordigerWoonplaats} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerWoonplaats: e.target.value }))} />
          </div>
          <hr />
          <p className="text-sm font-medium text-muted-foreground">Aanvullende clausules</p>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="dementie-clausule" checked={editForm.dementieClausule} onChange={(e) => setEditForm((f) => ({ ...f, dementieClausule: e.target.checked }))} className="h-4 w-4 rounded border-border" />
            <Label htmlFor="dementie-clausule">Dementieclausule</Label>
          </div>
          {editForm.dementieClausule && (
            <div className="space-y-2">
              <Label>Toelichting dementieclausule</Label>
              <Textarea value={editForm.dementieClausuleToelichting} onChange={(e) => setEditForm((f) => ({ ...f, dementieClausuleToelichting: e.target.value }))} rows={2} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Behandelverbod</Label>
            <Textarea value={editForm.behandelVerbod} onChange={(e) => setEditForm((f) => ({ ...f, behandelVerbod: e.target.value }))} rows={2} placeholder="Welke behandelingen wilt u weigeren?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditOpen(false)}>Annuleren</Button>
          <Button onClick={saveEdit}>Opslaan</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
