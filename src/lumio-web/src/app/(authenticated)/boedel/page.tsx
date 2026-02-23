"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
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
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { PersonSelect } from "@/components/PersonSelect";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";

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
  hypotheekVorm?: string;
  rentepercentage?: number;
  maandelijkseRente?: number;
  einddatum?: string;
  restschuld?: number;
}

type DialogKind = "bezit" | "rekening" | "verzekering" | "schuld" | null;

export default function BoedelPage() {
  const t = useTranslations("boedel");
  const tEnum = useTranslations("enums");
  const locale = useLocale();
  const currencyLocale = locale === "en" ? "en-NL" : "nl-NL";
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
  const [schuldForm, setSchuldForm] = useState({ schuldeiser: "", schuldeiserTelefoon: "", schuldeiserEmail: "", type: "", bedrag: "", maandelijkseAflossing: "", referentie: "", notities: "", vermogensSoort: "0", hypotheekVorm: "", rentepercentage: "", maandelijkseRente: "", einddatum: "", restschuld: "" });

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
      hypotheekVorm: item.hypotheekVorm ?? "",
      rentepercentage: item.rentepercentage?.toString() ?? "",
      maandelijkseRente: item.maandelijkseRente?.toString() ?? "",
      einddatum: item.einddatum ? item.einddatum.substring(0, 10) : "",
      restschuld: item.restschuld?.toString() ?? "",
    } : { schuldeiser: "", schuldeiserTelefoon: "", schuldeiserEmail: "", type: "", bedrag: "", maandelijkseAflossing: "", referentie: "", notities: "", vermogensSoort: "0", hypotheekVorm: "", rentepercentage: "", maandelijkseRente: "", einddatum: "", restschuld: "" });
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
    } catch (err) { setError(err instanceof Error ? err.message : t("opslaanMislukt")); }
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
    } catch (err) { setError(err instanceof Error ? err.message : t("opslaanMislukt")); }
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
    } catch (err) { setError(err instanceof Error ? err.message : t("opslaanMislukt")); }
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
        hypotheekVorm: schuldForm.type === "Hypotheek" ? (schuldForm.hypotheekVorm || null) : null,
        rentepercentage: schuldForm.type === "Hypotheek" && schuldForm.rentepercentage ? parseFloat(schuldForm.rentepercentage) : null,
        maandelijkseRente: schuldForm.type === "Hypotheek" && schuldForm.maandelijkseRente ? parseFloat(schuldForm.maandelijkseRente) : null,
        einddatum: schuldForm.type === "Hypotheek" && schuldForm.einddatum ? schuldForm.einddatum : null,
        restschuld: schuldForm.type === "Hypotheek" && schuldForm.restschuld ? parseFloat(schuldForm.restschuld) : null,
      };
      if (editId) await api.put(`/api/boedel/schulden/${editId}`, payload);
      else await api.post("/api/boedel/schulden", payload);
      setDialogKind(null); loadData();
    } catch (err) { setError(err instanceof Error ? err.message : t("opslaanMislukt")); }
    finally { setSaving(false); }
  };

  const deleteItem = async (type: string, id: string) => {
    try {
      await api.delete(`/api/boedel/${type}/${id}`);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("verwijderenMislukt"));
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
        <h1 className="text-3xl font-bold">{t("titel")}</h1>
        <p className="text-muted-foreground mt-1">{t("beschrijving")}</p>
        <VoorbeeldDialog domein="boedel" />
        <SectieNotitie sectie="boedel" />
      </div>

      <DomainStatusBanner domein="boedel" />

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>{t("tipLabel")}</strong> {t("tip")}
        </p>
      </div>

      {samenvatting && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> {t("overzicht.titel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t("overzicht.bezittingen", { aantal: samenvatting.aantalBezittingen })}</p>
                <p className="text-lg font-semibold">&euro; {samenvatting.totaalBezittingen.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("overzicht.saldi", { aantal: samenvatting.aantalRekeningen })}</p>
                <p className="text-lg font-semibold">&euro; {samenvatting.totaalSaldi.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("overzicht.verzekeringen", { aantal: samenvatting.aantalVerzekeringen })}</p>
                <p className="text-lg font-semibold">&euro; {samenvatting.totaalVerzekeringen.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("overzicht.schulden", { aantal: samenvatting.aantalSchulden })}</p>
                <p className="text-lg font-semibold text-red-600">&euro; {samenvatting.totaalSchulden.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("overzicht.brutoNalatenschap")}</p>
                <p className="text-lg font-semibold">&euro; {samenvatting.brutoNalatenschap.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("overzicht.nettoNalatenschap")}</p>
                <p className={`text-lg font-bold ${samenvatting.nettoNalatenschap >= 0 ? "text-green-600" : "text-red-600"}`}>&euro; {samenvatting.nettoNalatenschap.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="bezittingen"><Wallet className="h-4 w-4 mr-1" /> {t("tabs.bezittingen", { aantal: bezittingen.length })}</TabsTrigger>
          <TabsTrigger value="rekeningen"><Building2 className="h-4 w-4 mr-1" /> {t("tabs.rekeningen", { aantal: rekeningen.length })}</TabsTrigger>
          <TabsTrigger value="verzekeringen"><Shield className="h-4 w-4 mr-1" /> {t("tabs.verzekeringen", { aantal: verzekeringen.length })}</TabsTrigger>
          <TabsTrigger value="schulden"><CreditCard className="h-4 w-4 mr-1" /> {t("tabs.schulden", { aantal: schulden.length })}</TabsTrigger>
        </TabsList>

        <TabsContent value="bezittingen">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("bezittingen.titel")}</CardTitle>
              <Button size="sm" onClick={() => openBezit()}><Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}</Button>
            </CardHeader>
            <CardContent>
              {bezittingen.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t("bezittingen.geenBezittingen")}</p>
              ) : (
                <div className="space-y-2">
                  {bezittingen.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={b.vermogensSoort === 1 ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">{b.vermogensSoort === 1 ? t("bezittingen.gemeenschap") : t("bezittingen.prive")}</Badge>
                        <div>
                          <p className="text-sm font-medium">{b.omschrijving}</p>
                          <p className="text-xs text-muted-foreground">{b.categorie}{b.locatie ? ` \u2014 ${b.locatie}` : ""}{b.kadastraalNummer ? ` \u2014 ${t("bezittingen.kadLabel")} ${b.kadastraalNummer}` : ""}{b.kenteken ? ` \u2014 ${b.kenteken}` : ""}{b.kvKNummer ? ` \u2014 ${t("bezittingen.kvkLabel")} ${b.kvKNummer}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {b.geschatteWaarde != null && <span className="text-sm font-medium">&euro; {b.geschatteWaarde.toLocaleString(currencyLocale)}</span>}
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
              <CardTitle>{t("rekeningen.titel")}</CardTitle>
              <Button size="sm" onClick={() => openRekening()}><Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}</Button>
            </CardHeader>
            <CardContent>
              {rekeningen.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t("rekeningen.geenRekeningen")}</p>
              ) : (
                <div className="space-y-2">
                  {rekeningen.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={r.vermogensSoort === 1 ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">{r.vermogensSoort === 1 ? t("bezittingen.gemeenschap") : t("bezittingen.prive")}</Badge>
                        <div>
                          <p className="text-sm font-medium">{r.bankNaam}</p>
                          <p className="text-xs text-muted-foreground">{r.rekeningType} &mdash; {r.iban}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.saldo != null && <span className="text-sm font-medium">&euro; {r.saldo.toLocaleString(currencyLocale, { minimumFractionDigits: 2 })}</span>}
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
              <CardTitle>{t("verzekeringen.titel")}</CardTitle>
              <Button size="sm" onClick={() => openVerzekering()}><Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}</Button>
            </CardHeader>
            <CardContent>
              {verzekeringen.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t("verzekeringen.geenVerzekeringen")}</p>
              ) : (
                <div className="space-y-2">
                  {verzekeringen.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={v.vermogensSoort === 1 ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">{v.vermogensSoort === 1 ? t("bezittingen.gemeenschap") : t("bezittingen.prive")}</Badge>
                        <div>
                          <p className="text-sm font-medium">{v.verzekeraar}</p>
                          <p className="text-xs text-muted-foreground">{v.type} &mdash; {t("verzekeringen.polisLabel")} {v.polisNummer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {v.verzekerdBedrag != null && <span className="text-sm font-medium">&euro; {v.verzekerdBedrag.toLocaleString(currencyLocale)}</span>}
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
              <CardTitle>{t("schulden.titel")}</CardTitle>
              <Button size="sm" onClick={() => openSchuld()}><Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}</Button>
            </CardHeader>
            <CardContent>
              {schulden.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t("schulden.geenSchulden")}</p>
              ) : (
                <div className="space-y-2">
                  {schulden.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={s.vermogensSoort === 1 ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">{s.vermogensSoort === 1 ? t("bezittingen.gemeenschap") : t("bezittingen.prive")}</Badge>
                        <div>
                          <p className="text-sm font-medium">{s.schuldeiser}</p>
                          <p className="text-xs text-muted-foreground">{s.type}{s.referentie ? ` \u2014 ${s.referentie}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-600">&euro; {s.bedrag.toLocaleString(currencyLocale)}</span>
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
        <DialogHeader><DialogTitle>{editId ? t("bezitDialog.bewerken") : t("bezitDialog.toevoegen")}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>{t("bezitDialog.categorie")}</Label>
            <Select value={bezitForm.categorie} onChange={(e) => setBezitForm((f) => ({ ...f, categorie: e.target.value }))}>
              <option value="">{tEnum("bezitCategorie.selecteer")}</option>
              <option value="Onroerend goed">{tEnum("bezitCategorie.onroerendGoed")}</option>
              <option value="Voertuig">{tEnum("bezitCategorie.voertuig")}</option>
              <option value="Sieraden">{tEnum("bezitCategorie.sieraden")}</option>
              <option value="Kunst">{tEnum("bezitCategorie.kunst")}</option>
              <option value="Elektronica">{tEnum("bezitCategorie.elektronica")}</option>
              <option value="Meubels">{tEnum("bezitCategorie.meubels")}</option>
              <option value="Overig">{tEnum("bezitCategorie.overig")}</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>{t("bezitDialog.omschrijving")}</Label><Input value={bezitForm.omschrijving} onChange={(e) => setBezitForm((f) => ({ ...f, omschrijving: e.target.value }))} placeholder={t("bezitDialog.omschrijvingPlaceholder")} /></div>
          <div className="space-y-2"><Label>{t("bezitDialog.geschatteWaarde")}</Label><Input type="number" value={bezitForm.geschatteWaarde} onChange={(e) => setBezitForm((f) => ({ ...f, geschatteWaarde: e.target.value }))} /></div>
          <div className="space-y-2"><Label>{t("bezitDialog.locatie")}</Label><Input value={bezitForm.locatie} onChange={(e) => setBezitForm((f) => ({ ...f, locatie: e.target.value }))} placeholder={t("bezitDialog.locatiePlaceholder")} /></div>
          <div className="space-y-2"><Label>{t("bezitDialog.bestemdeErfgenaam")}</Label><PersonSelect value={bezitForm.bestemdeErfgenaam} onChange={(v) => setBezitForm((f) => ({ ...f, bestemdeErfgenaam: v }))} source="erfgenamen" placeholder={t("bezitDialog.bestemdeErfgenaamPlaceholder")} /></div>
          <div className="space-y-2"><Label>{t("bezitDialog.vermogensSoort")}</Label> <HelpTooltip tekst={t("bezitDialog.vermogensSoortTooltip")} />
            <Select value={bezitForm.vermogensSoort} onChange={(e) => setBezitForm((f) => ({ ...f, vermogensSoort: e.target.value }))}>
              <option value="0">{tEnum("vermogensSoort.prive")}</option>
              <option value="1">{tEnum("vermogensSoort.gemeenschap")}</option>
            </Select>
          </div>
          {/* P-S3: Registerreferenties */}
          {(bezitForm.categorie === "Onroerend goed" || bezitForm.kadastraalNummer) && (
            <div className="space-y-2"><Label>{t("bezitDialog.kadastraalNummer")}</Label><Input value={bezitForm.kadastraalNummer} onChange={(e) => setBezitForm((f) => ({ ...f, kadastraalNummer: e.target.value }))} placeholder={t("bezitDialog.kadastraalPlaceholder")} /></div>
          )}
          {(bezitForm.categorie === "Voertuig" || bezitForm.kenteken) && (
            <div className="space-y-2"><Label>{t("bezitDialog.kenteken")}</Label><Input value={bezitForm.kenteken} onChange={(e) => setBezitForm((f) => ({ ...f, kenteken: e.target.value }))} placeholder={t("bezitDialog.kentekenPlaceholder")} /></div>
          )}
          <div className="space-y-2"><Label>{t("bezitDialog.kvkNummer")}</Label><Input value={bezitForm.kvKNummer} onChange={(e) => setBezitForm((f) => ({ ...f, kvKNummer: e.target.value }))} placeholder={t("bezitDialog.kvkPlaceholder")} /></div>
          <div className="space-y-2"><Label>{t("bezitDialog.notities")}</Label><Textarea value={bezitForm.notities} onChange={(e) => setBezitForm((f) => ({ ...f, notities: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogKind(null)}>{t("annuleren")}</Button>
          <Button onClick={saveBezit} disabled={saving}>{saving ? t("opslaanBezig") : t("opslaan")}</Button>
        </DialogFooter>
      </Dialog>

      {/* Rekening Dialog */}
      <Dialog open={dialogKind === "rekening"} onOpenChange={() => setDialogKind(null)}>
        <DialogHeader><DialogTitle>{editId ? t("rekeningDialog.bewerken") : t("rekeningDialog.toevoegen")}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>{t("rekeningDialog.bank")}</Label><Input value={rekeningForm.bankNaam} onChange={(e) => setRekeningForm((f) => ({ ...f, bankNaam: e.target.value }))} placeholder={t("rekeningDialog.bankPlaceholder")} /></div>
          <div className="space-y-2"><Label>{t("rekeningDialog.type")}</Label>
            <Select value={rekeningForm.rekeningType} onChange={(e) => setRekeningForm((f) => ({ ...f, rekeningType: e.target.value }))}>
              <option value="">{tEnum("rekeningType.selecteer")}</option>
              <option value="Betaalrekening">{tEnum("rekeningType.betaalrekening")}</option>
              <option value="Spaarrekening">{tEnum("rekeningType.spaarrekening")}</option>
              <option value="Beleggingsrekening">{tEnum("rekeningType.beleggingsrekening")}</option>
              <option value="Deposito">{tEnum("rekeningType.deposito")}</option>
              <option value="Overig">{tEnum("rekeningType.overig")}</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>{t("rekeningDialog.iban")}</Label><Input value={rekeningForm.iban} onChange={(e) => setRekeningForm((f) => ({ ...f, iban: e.target.value }))} placeholder={t("rekeningDialog.ibanPlaceholder")} /></div>
          <div className="space-y-2"><Label>{t("rekeningDialog.saldo")}</Label><Input type="number" value={rekeningForm.saldo} onChange={(e) => setRekeningForm((f) => ({ ...f, saldo: e.target.value }))} placeholder={t("rekeningDialog.saldoPlaceholder")} /></div>
          <div className="space-y-2"><Label>{t("rekeningDialog.vermogensSoort")}</Label>
            <Select value={rekeningForm.vermogensSoort} onChange={(e) => setRekeningForm((f) => ({ ...f, vermogensSoort: e.target.value }))}>
              <option value="0">{tEnum("vermogensSoort.prive")}</option>
              <option value="1">{tEnum("vermogensSoort.gemeenschap")}</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>{t("rekeningDialog.notities")}</Label><Textarea value={rekeningForm.notities} onChange={(e) => setRekeningForm((f) => ({ ...f, notities: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogKind(null)}>{t("annuleren")}</Button>
          <Button onClick={saveRekening} disabled={saving}>{saving ? t("opslaanBezig") : t("opslaan")}</Button>
        </DialogFooter>
      </Dialog>

      {/* Verzekering Dialog */}
      <Dialog open={dialogKind === "verzekering"} onOpenChange={() => setDialogKind(null)}>
        <DialogHeader><DialogTitle>{editId ? t("verzekerDialog.bewerken") : t("verzekerDialog.toevoegen")}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>{t("verzekerDialog.verzekeraar")}</Label><Input value={verzekerForm.verzekeraar} onChange={(e) => setVerzekerForm((f) => ({ ...f, verzekeraar: e.target.value }))} placeholder={t("verzekerDialog.verzekeraarPlaceholder")} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><Label>{t("verzekerDialog.telefoon")}</Label><Input value={verzekerForm.verzekeraarTelefoon} onChange={(e) => setVerzekerForm((f) => ({ ...f, verzekeraarTelefoon: e.target.value }))} placeholder={t("verzekerDialog.telefoonPlaceholder")} /></div>
            <div className="space-y-2"><Label>{t("verzekerDialog.email")}</Label><Input type="email" value={verzekerForm.verzekeraarEmail} onChange={(e) => setVerzekerForm((f) => ({ ...f, verzekeraarEmail: e.target.value }))} placeholder={t("verzekerDialog.emailPlaceholder")} /></div>
          </div>
          <div className="space-y-2"><Label>{t("verzekerDialog.type")}</Label>
            <Select value={verzekerForm.type} onChange={(e) => setVerzekerForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="">{tEnum("verzekeringsType.selecteer")}</option>
              <option value="Levensverzekering">{tEnum("verzekeringsType.levensverzekering")}</option>
              <option value="Uitvaartverzekering">{tEnum("verzekeringsType.uitvaartverzekering")}</option>
              <option value="Overlijdensrisicoverzekering">{tEnum("verzekeringsType.overlijdensrisicoverzekering")}</option>
              <option value="Woonverzekering">{tEnum("verzekeringsType.woonverzekering")}</option>
              <option value="Autoverzekering">{tEnum("verzekeringsType.autoverzekering")}</option>
              <option value="Zorgverzekering">{tEnum("verzekeringsType.zorgverzekering")}</option>
              <option value="Overig">{tEnum("verzekeringsType.overig")}</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>{t("verzekerDialog.polisNummer")}</Label><Input value={verzekerForm.polisNummer} onChange={(e) => setVerzekerForm((f) => ({ ...f, polisNummer: e.target.value }))} /></div>
          <div className="space-y-2"><Label>{t("verzekerDialog.verzekerdBedrag")}</Label><Input type="number" value={verzekerForm.verzekerdBedrag} onChange={(e) => setVerzekerForm((f) => ({ ...f, verzekerdBedrag: e.target.value }))} /></div>
          <div className="space-y-2"><Label>{t("verzekerDialog.begunstigde")}</Label><PersonSelect value={verzekerForm.begunstigde} onChange={(v) => setVerzekerForm((f) => ({ ...f, begunstigde: v }))} source="erfgenamen" /></div>
          <div className="space-y-2"><Label>{t("verzekerDialog.vermogensSoort")}</Label>
            <Select value={verzekerForm.vermogensSoort} onChange={(e) => setVerzekerForm((f) => ({ ...f, vermogensSoort: e.target.value }))}>
              <option value="0">{tEnum("vermogensSoort.prive")}</option>
              <option value="1">{tEnum("vermogensSoort.gemeenschap")}</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>{t("verzekerDialog.notities")}</Label><Textarea value={verzekerForm.notities} onChange={(e) => setVerzekerForm((f) => ({ ...f, notities: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogKind(null)}>{t("annuleren")}</Button>
          <Button onClick={saveVerzekering} disabled={saving}>{saving ? t("opslaanBezig") : t("opslaan")}</Button>
        </DialogFooter>
      </Dialog>

      {/* Schuld Dialog */}
      <Dialog open={dialogKind === "schuld"} onOpenChange={() => setDialogKind(null)}>
        <DialogHeader><DialogTitle>{editId ? t("schuldDialog.bewerken") : t("schuldDialog.toevoegen")}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>{t("schuldDialog.schuldeiser")}</Label><Input value={schuldForm.schuldeiser} onChange={(e) => setSchuldForm((f) => ({ ...f, schuldeiser: e.target.value }))} placeholder={t("schuldDialog.schuldeiserPlaceholder")} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><Label>{t("schuldDialog.telefoon")}</Label><Input value={schuldForm.schuldeiserTelefoon} onChange={(e) => setSchuldForm((f) => ({ ...f, schuldeiserTelefoon: e.target.value }))} placeholder={t("schuldDialog.telefoonPlaceholder")} /></div>
            <div className="space-y-2"><Label>{t("schuldDialog.email")}</Label><Input type="email" value={schuldForm.schuldeiserEmail} onChange={(e) => setSchuldForm((f) => ({ ...f, schuldeiserEmail: e.target.value }))} placeholder={t("schuldDialog.emailPlaceholder")} /></div>
          </div>
          <div className="space-y-2"><Label>{t("schuldDialog.type")}</Label>
            <Select value={schuldForm.type} onChange={(e) => setSchuldForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="">{tEnum("schuldType.selecteer")}</option>
              <option value="Hypotheek">{tEnum("schuldType.hypotheek")}</option>
              <option value="Persoonlijke lening">{tEnum("schuldType.persoonlijkeLening")}</option>
              <option value="Studielening">{tEnum("schuldType.studielening")}</option>
              <option value="Creditcard">{tEnum("schuldType.creditcard")}</option>
              <option value="Zakelijke lening">{tEnum("schuldType.zakelijkeLening")}</option>
              <option value="Overig">{tEnum("schuldType.overig")}</option>
            </Select>
          </div>
          {schuldForm.type === "Hypotheek" && (
            <>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-4">
                <p className="text-xs font-medium text-blue-800">{t("schuldDialog.hypotheekDetails")}</p>
                <div className="space-y-2">
                  <Label>{t("schuldDialog.hypotheekVorm")}</Label>
                  <Select value={schuldForm.hypotheekVorm} onChange={(e) => setSchuldForm((f) => ({ ...f, hypotheekVorm: e.target.value }))}>
                    <option value="">{tEnum("hypotheekVorm.selecteer")}</option>
                    <option value="Aflossingsvrij">{tEnum("hypotheekVorm.aflossingsvrij")}</option>
                    <option value="Lineair">{tEnum("hypotheekVorm.lineair")}</option>
                    <option value="Annuïteit">{tEnum("hypotheekVorm.annuitair")}</option>
                    <option value="Spaarhypotheek">{tEnum("hypotheekVorm.spaarhypotheek")}</option>
                    <option value="Beleggingshypotheek">{tEnum("hypotheekVorm.beleggingshypotheek")}</option>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>{t("schuldDialog.rentepercentage")}</Label>
                    <Input type="number" step="0.01" value={schuldForm.rentepercentage} onChange={(e) => setSchuldForm((f) => ({ ...f, rentepercentage: e.target.value }))} placeholder="bijv. 3.5" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("schuldDialog.maandelijkseRente")}</Label>
                    <Input type="number" value={schuldForm.maandelijkseRente} onChange={(e) => setSchuldForm((f) => ({ ...f, maandelijkseRente: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>{t("schuldDialog.einddatum")}</Label>
                    <Input type="date" value={schuldForm.einddatum} onChange={(e) => setSchuldForm((f) => ({ ...f, einddatum: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("schuldDialog.restschuld")}</Label>
                    <Input type="number" value={schuldForm.restschuld} onChange={(e) => setSchuldForm((f) => ({ ...f, restschuld: e.target.value }))} />
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="space-y-2"><Label>{t("schuldDialog.bedrag")}</Label><Input type="number" value={schuldForm.bedrag} onChange={(e) => setSchuldForm((f) => ({ ...f, bedrag: e.target.value }))} /></div>
          <div className="space-y-2"><Label>{t("schuldDialog.maandelijkseAflossing")}</Label><Input type="number" value={schuldForm.maandelijkseAflossing} onChange={(e) => setSchuldForm((f) => ({ ...f, maandelijkseAflossing: e.target.value }))} /></div>
          <div className="space-y-2"><Label>{t("schuldDialog.referentie")}</Label><Input value={schuldForm.referentie} onChange={(e) => setSchuldForm((f) => ({ ...f, referentie: e.target.value }))} /></div>
          <div className="space-y-2"><Label>{t("schuldDialog.vermogensSoort")}</Label>
            <Select value={schuldForm.vermogensSoort} onChange={(e) => setSchuldForm((f) => ({ ...f, vermogensSoort: e.target.value }))}>
              <option value="0">{tEnum("vermogensSoort.prive")}</option>
              <option value="1">{tEnum("vermogensSoort.gemeenschap")}</option>
            </Select>
          </div>
          <div className="space-y-2"><Label>{t("schuldDialog.notities")}</Label><Textarea value={schuldForm.notities} onChange={(e) => setSchuldForm((f) => ({ ...f, notities: e.target.value }))} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogKind(null)}>{t("annuleren")}</Button>
          <Button onClick={saveSchuld} disabled={saving}>{saving ? t("opslaanBezig") : t("opslaan")}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
