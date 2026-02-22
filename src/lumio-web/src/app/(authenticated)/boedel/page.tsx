"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";
import {
  Wallet,
  Building2,
  Shield,
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";

interface Samenvatting {
  totaalBezittingen: number;
  totaalSaldi: number;
  totaalVerzekeringen: number;
  totaalSchulden: number;
  brutoNalatenschap: number;
  nettoNalatenschap: number;
  aantalBezittingen: number;
  aantalRekeningen: number;
  aantalVerzekeringen: number;
  aantalSchulden: number;
}

interface FysiekBezit {
  id: string;
  categorie: string;
  omschrijving: string;
  geschatteWaarde?: number;
  locatie?: string;
  bestemdeErfgenaam?: string;
  notities?: string;
  vermogensSoort: number;
  kadastraalNummer?: string;
  kenteken?: string;
  kvKNummer?: string;
}
interface Bankrekening {
  id: string;
  bankNaam: string;
  iban: string;
  rekeningType: string;
  notities?: string;
  saldo?: number;
  vermogensSoort: number;
}
interface Verzekering {
  id: string;
  verzekeraar: string;
  verzekeraarTelefoon?: string;
  verzekeraarEmail?: string;
  polisNummer: string;
  type: string;
  verzekerdBedrag?: number;
  begunstigde?: string;
  notities?: string;
  vermogensSoort: number;
}
interface Schuld {
  id: string;
  schuldeiser: string;
  schuldeiserTelefoon?: string;
  schuldeiserEmail?: string;
  type: string;
  bedrag: number;
  maandelijkseAflossing?: number;
  referentie?: string;
  notities?: string;
  vermogensSoort: number;
}

type DialogKind = "bezit" | "rekening" | "verzekering" | "schuld" | null;

export default function BoedelPage() {
  const [tab, setTab] = useState("bezittingen");
  const [bezittingen, setBezittingen] = useState<FysiekBezit[]>([]);
  const [rekeningen, setRekeningen] = useState<Bankrekening[]>([]);
  const [verzekeringen, setVerzekeringen] = useState<Verzekering[]>([]);
  const [schulden, setSchulden] = useState<Schuld[]>([]);
  const [samenvatting, setSamenvatting] = useState<Samenvatting | null>(null);
  const [loading, setLoading] = useState(true);

  const [dialogKind, setDialogKind] = useState<DialogKind>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bezitForm, setBezitForm] = useState({ categorie: "", omschrijving: "", geschatteWaarde: "", locatie: "", bestemdeErfgenaam: "", notities: "", vermogensSoort: "0", kadastraalNummer: "", kenteken: "", kvKNummer: "" });
  const [rekeningForm, setRekeningForm] = useState({ bankNaam: "", rekeningType: "", iban: "", notities: "", saldo: "", vermogensSoort: "0" });
  const [verzekerForm, setVerzekerForm] = useState({ verzekeraar: "", verzekeraarTelefoon: "", verzekeraarEmail: "", type: "", polisNummer: "", verzekerdBedrag: "", begunstigde: "", notities: "", vermogensSoort: "0" });
  const [schuldForm, setSchuldForm] = useState({ schuldeiser: "", schuldeiserTelefoon: "", schuldeiserEmail: "", type: "", bedrag: "", maandelijkseAflossing: "", referentie: "", notities: "", vermogensSoort: "0" });

  const loadData = () => {
    Promise.all([
      api.get<FysiekBezit[]>("/api/boedel/bezittingen").catch(() => []),
      api.get<Bankrekening[]>("/api/boedel/bankrekeningen").catch(() => []),
      api.get<Verzekering[]>("/api/boedel/verzekeringen").catch(() => []),
      api.get<Schuld[]>("/api/boedel/schulden").catch(() => []),
      api.get<Samenvatting>("/api/boedel/samenvatting").catch(() => null),
    ])
      .then(([b, r, v, s, sam]) => {
        setBezittingen(b ?? []);
        setRekeningen(r ?? []);
        setVerzekeringen(v ?? []);
        setSchulden(s ?? []);
        setSamenvatting(sam);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const openBezit = (item?: FysiekBezit) => {
    setError(null);
    setEditId(item?.id ?? null);
    setBezitForm(item ? {
      categorie: item.categorie,
      omschrijving: item.omschrijving,
      geschatteWaarde: item.geschatteWaarde?.toString() ?? "",
      locatie: item.locatie ?? "",
      bestemdeErfgenaam: item.bestemdeErfgenaam ?? "",
      notities: item.notities ?? "",
      vermogensSoort: String(item.vermogensSoort ?? 0),
      kadastraalNummer: item.kadastraalNummer ?? "",
      kenteken: item.kenteken ?? "",
      kvKNummer: item.kvKNummer ?? "",
    } : { categorie: "", omschrijving: "", geschatteWaarde: "", locatie: "", bestemdeErfgenaam: "", notities: "", vermogensSoort: "0", kadastraalNummer: "", kenteken: "", kvKNummer: "" });
    setDialogKind("bezit");
  };
  const openRekening = (item?: Bankrekening) => {
    setError(null);
    setEditId(item?.id ?? null);
    setRekeningForm(item ? {
      bankNaam: item.bankNaam,
      rekeningType: item.rekeningType,
      iban: item.iban,
      notities: item.notities ?? "",
      saldo: item.saldo?.toString() ?? "",
      vermogensSoort: String(item.vermogensSoort ?? 0),
    } : { bankNaam: "", rekeningType: "", iban: "", notities: "", saldo: "", vermogensSoort: "0" });
    setDialogKind("rekening");
  };
  const openVerzekering = (item?: Verzekering) => {
    setError(null);
    setEditId(item?.id ?? null);
    setVerzekerForm(item ? {
      verzekeraar: item.verzekeraar,
      verzekeraarTelefoon: item.verzekeraarTelefoon ?? "",
      verzekeraarEmail: item.verzekeraarEmail ?? "",
      type: item.type,
      polisNummer: item.polisNummer,
      verzekerdBedrag: item.verzekerdBedrag?.toString() ?? "",
      begunstigde: item.begunstigde ?? "",
      notities: item.notities ?? "",
      vermogensSoort: String(item.vermogensSoort ?? 0),
    } : { verzekeraar: "", verzekeraarTelefoon: "", verzekeraarEmail: "", type: "", polisNummer: "", verzekerdBedrag: "", begunstigde: "", notities: "", vermogensSoort: "0" });
    setDialogKind("verzekering");
  };
  const openSchuld = (item?: Schuld) => {
    setError(null);
    setEditId(item?.id ?? null);
    setSchuldForm(item ? {
      schuldeiser: item.schuldeiser,
      schuldeiserTelefoon: item.schuldeiserTelefoon ?? "",
      schuldeiserEmail: item.schuldeiserEmail ?? "",
      type: item.type,
      bedrag: item.bedrag.toString(),
      maandelijkseAflossing: item.maandelijkseAflossing?.toString() ?? "",
      referentie: item.referentie ?? "",
      notities: item.notities ?? "",
      vermogensSoort: String(item.vermogensSoort ?? 0),
    } : { schuldeiser: "", schuldeiserTelefoon: "", schuldeiserEmail: "", type: "", bedrag: "", maandelijkseAflossing: "", referentie: "", notities: "", vermogensSoort: "0" });
    setDialogKind("schuld");
  };

  const saveBezit = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        categorie: bezitForm.categorie,
        omschrijving: bezitForm.omschrijving,
        geschatteWaarde: bezitForm.geschatteWaarde ? parseFloat(bezitForm.geschatteWaarde) : null,
        locatie: bezitForm.locatie || null,
        bestemdeErfgenaam: bezitForm.bestemdeErfgenaam || null,
        notities: bezitForm.notities || null,
        vermogensSoort: parseInt(bezitForm.vermogensSoort),
        kadastraalNummer: bezitForm.kadastraalNummer || null,
        kenteken: bezitForm.kenteken || null,
        kvKNummer: bezitForm.kvKNummer || null,
      };
      if (editId) await api.put(`/api/boedel/bezittingen/${editId}`, payload);
      else await api.post("/api/boedel/bezittingen", payload);
      setDialogKind(null); loadData();
    } catch (err) { setError(err instanceof Error ? err.message : "Opslaan mislukt."); }
    finally { setSaving(false); }
  };
  const saveRekening = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        bankNaam: rekeningForm.bankNaam,
        iban: rekeningForm.iban,
        rekeningType: rekeningForm.rekeningType,
        notities: rekeningForm.notities || null,
        saldo: rekeningForm.saldo ? parseFloat(rekeningForm.saldo) : null,
        vermogensSoort: parseInt(rekeningForm.vermogensSoort),
      };
      if (editId) await api.put(`/api/boedel/bankrekeningen/${editId}`, payload);
      else await api.post("/api/boedel/bankrekeningen", payload);
      setDialogKind(null); loadData();
    } catch (err) { setError(err instanceof Error ? err.message : "Opslaan mislukt."); }
    finally { setSaving(false); }
  };
  const saveVerzekering = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        verzekeraar: verzekerForm.verzekeraar,
        verzekeraarTelefoon: verzekerForm.verzekeraarTelefoon || null,
        verzekeraarEmail: verzekerForm.verzekeraarEmail || null,
        polisNummer: verzekerForm.polisNummer,
        type: verzekerForm.type,
        verzekerdBedrag: verzekerForm.verzekerdBedrag ? parseFloat(verzekerForm.verzekerdBedrag) : null,
        begunstigde: verzekerForm.begunstigde || null,
        notities: verzekerForm.notities || null,
        vermogensSoort: parseInt(verzekerForm.vermogensSoort),
      };
      if (editId) await api.put(`/api/boedel/verzekeringen/${editId}`, payload);
      else await api.post("/api/boedel/verzekeringen", payload);
      setDialogKind(null); loadData();
    } catch (err) { setError(err instanceof Error ? err.message : "Opslaan mislukt."); }
    finally { setSaving(false); }
  };
  const saveSchuld = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        schuldeiser: schuldForm.schuldeiser,
        schuldeiserTelefoon: schuldForm.schuldeiserTelefoon || null,
        schuldeiserEmail: schuldForm.schuldeiserEmail || null,
        type: schuldForm.type,
        bedrag: parseFloat(schuldForm.bedrag) || 0,
        maandelijkseAflossing: schuldForm.maandelijkseAflossing ? parseFloat(schuldForm.maandelijkseAflossing) : null,
        referentie: schuldForm.referentie || null,
        notities: schuldForm.notities || null,
        vermogensSoort: parseInt(schuldForm.vermogensSoort),
      };
      if (editId) await api.put(`/api/boedel/schulden/${editId}`, payload);
      else await api.post("/api/boedel/schulden", payload);
      setDialogKind(null); loadData();
    } catch (err) { setError(err instanceof Error ? err.message : "Opslaan mislukt."); }
    finally { setSaving(false); }
  };

  const deleteItem = async (type: string, id: string) => {
    try {
      await api.delete(`/api/boedel/${type}/${id}`);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verwijderen mislukt.");
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
        <h1 className="text-3xl font-bold">Boedel</h1>
        <p className="text-muted-foreground mt-1">Bezittingen, bankrekeningen, verzekeringen en schulden</p>
        <VoorbeeldDialog domein="boedel" />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Tip:</strong> Een volledig overzicht van uw boedel helpt erfgenamen bij de afwikkeling conform BW Boek 4.
        </p>
      </div>

      {samenvatting && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Financieel overzicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Bezittingen ({samenvatting.aantalBezittingen})</p>
                <p className="text-lg font-semibold">&euro; {samenvatting.totaalBezittingen.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldi ({samenvatting.aantalRekeningen})</p>
                <p className="text-lg font-semibold">&euro; {samenvatting.totaalSaldi.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Verzekeringen ({samenvatting.aantalVerzekeringen})</p>
                <p className="text-lg font-semibold">&euro; {samenvatting.totaalVerzekeringen.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Schulden ({samenvatting.aantalSchulden})</p>
                <p className="text-lg font-semibold text-red-600">&euro; {samenvatting.totaalSchulden.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bruto nalatenschap</p>
                <p className="text-lg font-semibold">&euro; {samenvatting.brutoNalatenschap.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Netto nalatenschap</p>
                <p className={`text-lg font-bold ${samenvatting.nettoNalatenschap >= 0 ? "text-green-600" : "text-red-600"}`}>&euro; {samenvatting.nettoNalatenschap.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="bezittingen"><Wallet className="h-4 w-4 mr-1" /> Bezittingen ({bezittingen.length})</TabsTrigger>
          <TabsTrigger value="rekeningen"><Building2 className="h-4 w-4 mr-1" /> Rekeningen ({rekeningen.length})</TabsTrigger>
          <TabsTrigger value="verzekeringen"><Shield className="h-4 w-4 mr-1" /> Verzekeringen ({verzekeringen.length})</TabsTrigger>
          <TabsTrigger value="schulden"><CreditCard className="h-4 w-4 mr-1" /> Schulden ({schulden.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="bezittingen">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bezittingen</CardTitle>
              <Button size="sm" onClick={() => openBezit()}><Plus className="h-4 w-4 mr-1" /> Toevoegen</Button>
            </CardHeader>
            <CardContent>
              {bezittingen.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nog geen bezittingen. Klik op Toevoegen.</p>
              ) : (
                <div className="space-y-2">
                  {bezittingen.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={b.vermogensSoort === 1 ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">{b.vermogensSoort === 1 ? "G" : "P"}</Badge>
                        <div>
                          <p className="text-sm font-medium">{b.omschrijving}</p>
                          <p className="text-xs text-muted-foreground">{b.categorie}{b.locatie ? ` \u2014 ${b.locatie}` : ""}{b.kadastraalNummer ? ` \u2014 Kad: ${b.kadastraalNummer}` : ""}{b.kenteken ? ` \u2014 ${b.kenteken}` : ""}{b.kvKNummer ? ` \u2014 KvK: ${b.kvKNummer}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {b.geschatteWaarde != null && <span className="text-sm font-medium">&euro; {b.geschatteWaarde.toLocaleString("nl-NL")}</span>}
                        <Button variant="ghost" size="sm" onClick={() => openBezit(b)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteItem("bezittingen", b.id)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rekeningen">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bankrekeningen</CardTitle>
              <Button size="sm" onClick={() => openRekening()}><Plus className="h-4 w-4 mr-1" /> Toevoegen</Button>
            </CardHeader>
            <CardContent>
              {rekeningen.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nog geen rekeningen. Klik op Toevoegen.</p>
              ) : (
                <div className="space-y-2">
                  {rekeningen.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={r.vermogensSoort === 1 ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">{r.vermogensSoort === 1 ? "G" : "P"}</Badge>
                        <div>
                          <p className="text-sm font-medium">{r.bankNaam}</p>
                          <p className="text-xs text-muted-foreground">{r.rekeningType} &mdash; {r.iban}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.saldo != null && <span className="text-sm font-medium">&euro; {r.saldo.toLocaleString("nl-NL", { minimumFractionDigits: 2 })}</span>}
                        <Button variant="ghost" size="sm" onClick={() => openRekening(r)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteItem("bankrekeningen", r.id)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verzekeringen">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Verzekeringen</CardTitle>
              <Button size="sm" onClick={() => openVerzekering()}><Plus className="h-4 w-4 mr-1" /> Toevoegen</Button>
            </CardHeader>
            <CardContent>
              {verzekeringen.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nog geen verzekeringen. Klik op Toevoegen.</p>
              ) : (
                <div className="space-y-2">
                  {verzekeringen.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={v.vermogensSoort === 1 ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">{v.vermogensSoort === 1 ? "G" : "P"}</Badge>
                        <div>
                          <p className="text-sm font-medium">{v.verzekeraar}</p>
                          <p className="text-xs text-muted-foreground">{v.type} &mdash; Polis: {v.polisNummer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {v.verzekerdBedrag != null && <span className="text-sm font-medium">&euro; {v.verzekerdBedrag.toLocaleString("nl-NL")}</span>}
                        <Button variant="ghost" size="sm" onClick={() => openVerzekering(v)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteItem("verzekeringen", v.id)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schulden">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Schulden</CardTitle>
              <Button size="sm" onClick={() => openSchuld()}><Plus className="h-4 w-4 mr-1" /> Toevoegen</Button>
            </CardHeader>
            <CardContent>
              {schulden.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nog geen schulden. Klik op Toevoegen.</p>
              ) : (
                <div className="space-y-2">
                  {schulden.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={s.vermogensSoort === 1 ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">{s.vermogensSoort === 1 ? "G" : "P"}</Badge>
                        <div>
                          <p className="text-sm font-medium">{s.schuldeiser}</p>
                          <p className="text-xs text-muted-foreground">{s.type}{s.referentie ? ` \u2014 ${s.referentie}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-600">&euro; {s.bedrag.toLocaleString("nl-NL")}</span>
                        <Button variant="ghost" size="sm" onClick={() => openSchuld(s)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteItem("schulden", s.id)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Bezit Dialog */}
      <Dialog open={dialogKind === "bezit"} onOpenChange={() => setDialogKind(null)}>
        <DialogHeader><DialogTitle>{editId ? "Bezit bewerken" : "Bezit toevoegen"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>Categorie</Label>
            <Select value={bezitForm.categorie} onChange={(e) => setBezitForm((f) => ({ ...f, categorie: e.target.value }))}>
              <option value="">Selecteer...</option>
              <option value="Onroerend goed">Onroerend goed</option>
              <option value="Voertuig">Voertuig</option>
              <option value="Sieraden">Sieraden</option>
              <option value="Kunst">Kunst</option>
              <option value="Elektronica">Elektronica</option>
              <option value="Meubels">Meubels</option>
              <option value="Overig">Overig</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>Omschrijving</Label><Input value={bezitForm.omschrijving} onChange={(e) => setBezitForm((f) => ({ ...f, omschrijving: e.target.value }))} placeholder="bijv. Woning aan de Keizersgracht, BMW 3-serie" /></div>
          <div className="space-y-2"><Label>Geschatte waarde (&euro;)</Label><Input type="number" value={bezitForm.geschatteWaarde} onChange={(e) => setBezitForm((f) => ({ ...f, geschatteWaarde: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Locatie</Label><Input value={bezitForm.locatie} onChange={(e) => setBezitForm((f) => ({ ...f, locatie: e.target.value }))} placeholder="Waar bevindt dit zich?" /></div>
          <div className="space-y-2"><Label>Bestemde erfgenaam</Label><Input value={bezitForm.bestemdeErfgenaam} onChange={(e) => setBezitForm((f) => ({ ...f, bestemdeErfgenaam: e.target.value }))} placeholder="Wie moet dit ontvangen?" /></div>
          <div className="space-y-2"><Label>Vermogenssoort</Label> <HelpTooltip tekst="Privévermogen is eigendom van één persoon. Gemeenschapsvermogen valt in de gemeenschap van goederen en wordt bij scheiding of overlijden verdeeld. Dit onderscheid is belangrijk voor de erfbelasting en verdeling." />
            <Select value={bezitForm.vermogensSoort} onChange={(e) => setBezitForm((f) => ({ ...f, vermogensSoort: e.target.value }))}>
              <option value="0">Privé</option>
              <option value="1">Gemeenschap</option>
            </Select>
          </div>
          {/* P-S3: Registerreferenties */}
          {(bezitForm.categorie === "Onroerend goed" || bezitForm.kadastraalNummer) && (
            <div className="space-y-2"><Label>Kadastraal nummer</Label><Input value={bezitForm.kadastraalNummer} onChange={(e) => setBezitForm((f) => ({ ...f, kadastraalNummer: e.target.value }))} placeholder="bijv. ASD02 K 1234" /></div>
          )}
          {(bezitForm.categorie === "Voertuig" || bezitForm.kenteken) && (
            <div className="space-y-2"><Label>Kenteken</Label><Input value={bezitForm.kenteken} onChange={(e) => setBezitForm((f) => ({ ...f, kenteken: e.target.value }))} placeholder="bijv. AB-123-CD" /></div>
          )}
          <div className="space-y-2"><Label>KvK-nummer</Label><Input value={bezitForm.kvKNummer} onChange={(e) => setBezitForm((f) => ({ ...f, kvKNummer: e.target.value }))} placeholder="Kamer van Koophandel nummer (indien van toepassing)" /></div>
          <div className="space-y-2"><Label>Notities</Label><Textarea value={bezitForm.notities} onChange={(e) => setBezitForm((f) => ({ ...f, notities: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogKind(null)}>Annuleren</Button>
          <Button onClick={saveBezit} disabled={saving}>{saving ? "Opslaan..." : "Opslaan"}</Button>
        </DialogFooter>
      </Dialog>

      {/* Rekening Dialog */}
      <Dialog open={dialogKind === "rekening"} onOpenChange={() => setDialogKind(null)}>
        <DialogHeader><DialogTitle>{editId ? "Rekening bewerken" : "Rekening toevoegen"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>Bank</Label><Input value={rekeningForm.bankNaam} onChange={(e) => setRekeningForm((f) => ({ ...f, bankNaam: e.target.value }))} placeholder="bijv. ING, ABN AMRO, Rabobank" /></div>
          <div className="space-y-2"><Label>Type</Label>
            <Select value={rekeningForm.rekeningType} onChange={(e) => setRekeningForm((f) => ({ ...f, rekeningType: e.target.value }))}>
              <option value="">Selecteer...</option>
              <option value="Betaalrekening">Betaalrekening</option>
              <option value="Spaarrekening">Spaarrekening</option>
              <option value="Beleggingsrekening">Beleggingsrekening</option>
              <option value="Deposito">Deposito</option>
              <option value="Overig">Overig</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>IBAN</Label><Input value={rekeningForm.iban} onChange={(e) => setRekeningForm((f) => ({ ...f, iban: e.target.value }))} placeholder="NL00 BANK 0000 0000 00" /></div>
          <div className="space-y-2"><Label>Saldo (&euro;)</Label><Input type="number" value={rekeningForm.saldo} onChange={(e) => setRekeningForm((f) => ({ ...f, saldo: e.target.value }))} placeholder="Huidig saldo" /></div>
          <div className="space-y-2"><Label>Vermogenssoort</Label>
            <Select value={rekeningForm.vermogensSoort} onChange={(e) => setRekeningForm((f) => ({ ...f, vermogensSoort: e.target.value }))}>
              <option value="0">Privé</option>
              <option value="1">Gemeenschap</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>Notities</Label><Textarea value={rekeningForm.notities} onChange={(e) => setRekeningForm((f) => ({ ...f, notities: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogKind(null)}>Annuleren</Button>
          <Button onClick={saveRekening} disabled={saving}>{saving ? "Opslaan..." : "Opslaan"}</Button>
        </DialogFooter>
      </Dialog>

      {/* Verzekering Dialog */}
      <Dialog open={dialogKind === "verzekering"} onOpenChange={() => setDialogKind(null)}>
        <DialogHeader><DialogTitle>{editId ? "Verzekering bewerken" : "Verzekering toevoegen"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>Verzekeraar</Label><Input value={verzekerForm.verzekeraar} onChange={(e) => setVerzekerForm((f) => ({ ...f, verzekeraar: e.target.value }))} placeholder="bijv. Nationale-Nederlanden, Aegon" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><Label>Telefoon verzekeraar</Label><Input value={verzekerForm.verzekeraarTelefoon} onChange={(e) => setVerzekerForm((f) => ({ ...f, verzekeraarTelefoon: e.target.value }))} placeholder="Telefoonnummer" /></div>
            <div className="space-y-2"><Label>E-mail verzekeraar</Label><Input type="email" value={verzekerForm.verzekeraarEmail} onChange={(e) => setVerzekerForm((f) => ({ ...f, verzekeraarEmail: e.target.value }))} placeholder="info@verzekeraar.nl" /></div>
          </div>
          <div className="space-y-2"><Label>Type</Label>
            <Select value={verzekerForm.type} onChange={(e) => setVerzekerForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="">Selecteer...</option>
              <option value="Levensverzekering">Levensverzekering</option>
              <option value="Uitvaartverzekering">Uitvaartverzekering</option>
              <option value="Overlijdensrisicoverzekering">Overlijdensrisicoverzekering</option>
              <option value="Woonverzekering">Woonverzekering</option>
              <option value="Autoverzekering">Autoverzekering</option>
              <option value="Zorgverzekering">Zorgverzekering</option>
              <option value="Overig">Overig</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>Polisnummer</Label><Input value={verzekerForm.polisNummer} onChange={(e) => setVerzekerForm((f) => ({ ...f, polisNummer: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Verzekerd bedrag (&euro;)</Label><Input type="number" value={verzekerForm.verzekerdBedrag} onChange={(e) => setVerzekerForm((f) => ({ ...f, verzekerdBedrag: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Begunstigde</Label><Input value={verzekerForm.begunstigde} onChange={(e) => setVerzekerForm((f) => ({ ...f, begunstigde: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Vermogenssoort</Label>
            <Select value={verzekerForm.vermogensSoort} onChange={(e) => setVerzekerForm((f) => ({ ...f, vermogensSoort: e.target.value }))}>
              <option value="0">Privé</option>
              <option value="1">Gemeenschap</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>Notities</Label><Textarea value={verzekerForm.notities} onChange={(e) => setVerzekerForm((f) => ({ ...f, notities: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogKind(null)}>Annuleren</Button>
          <Button onClick={saveVerzekering} disabled={saving}>{saving ? "Opslaan..." : "Opslaan"}</Button>
        </DialogFooter>
      </Dialog>

      {/* Schuld Dialog */}
      <Dialog open={dialogKind === "schuld"} onOpenChange={() => setDialogKind(null)}>
        <DialogHeader><DialogTitle>{editId ? "Schuld bewerken" : "Schuld toevoegen"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>Schuldeiser</Label><Input value={schuldForm.schuldeiser} onChange={(e) => setSchuldForm((f) => ({ ...f, schuldeiser: e.target.value }))} placeholder="bijv. ING, DUO, Rabobank" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><Label>Telefoon schuldeiser</Label><Input value={schuldForm.schuldeiserTelefoon} onChange={(e) => setSchuldForm((f) => ({ ...f, schuldeiserTelefoon: e.target.value }))} placeholder="Telefoonnummer" /></div>
            <div className="space-y-2"><Label>E-mail schuldeiser</Label><Input type="email" value={schuldForm.schuldeiserEmail} onChange={(e) => setSchuldForm((f) => ({ ...f, schuldeiserEmail: e.target.value }))} placeholder="info@schuldeiser.nl" /></div>
          </div>
          <div className="space-y-2"><Label>Type</Label>
            <Select value={schuldForm.type} onChange={(e) => setSchuldForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="">Selecteer...</option>
              <option value="Hypotheek">Hypotheek</option>
              <option value="Persoonlijke lening">Persoonlijke lening</option>
              <option value="Studielening">Studielening</option>
              <option value="Creditcard">Creditcard</option>
              <option value="Zakelijke lening">Zakelijke lening</option>
              <option value="Overig">Overig</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>Bedrag (&euro;)</Label><Input type="number" value={schuldForm.bedrag} onChange={(e) => setSchuldForm((f) => ({ ...f, bedrag: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Maandelijkse aflossing (&euro;)</Label><Input type="number" value={schuldForm.maandelijkseAflossing} onChange={(e) => setSchuldForm((f) => ({ ...f, maandelijkseAflossing: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Referentie / contractnummer</Label><Input value={schuldForm.referentie} onChange={(e) => setSchuldForm((f) => ({ ...f, referentie: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Vermogenssoort</Label>
            <Select value={schuldForm.vermogensSoort} onChange={(e) => setSchuldForm((f) => ({ ...f, vermogensSoort: e.target.value }))}>
              <option value="0">Privé</option>
              <option value="1">Gemeenschap</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>Notities</Label><Textarea value={schuldForm.notities} onChange={(e) => setSchuldForm((f) => ({ ...f, notities: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogKind(null)}>Annuleren</Button>
          <Button onClick={saveSchuld} disabled={saving}>{saving ? "Opslaan..." : "Opslaan"}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
