"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { api } from "@/lib/api-client";
import { ScrollText, Plus, Pencil, Trash2, AlertTriangle, History, GitCompareArrows } from "lucide-react";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { JuridischeCheck } from "@/components/testament/JuridischeCheck";
import { useTranslations, useLocale } from "next-intl";

interface LegitimairePortieWaarschuwing {
  naam: string;
  toegewezenPercentage?: number;
  minimumPercentage: number;
}

interface LegitimairePortieCheck {
  heeftWaarschuwing: boolean;
  aantalKinderen: number;
  heeftPartner: boolean;
  minimumPercentagePerKind: number;
  waarschuwingen: LegitimairePortieWaarschuwing[];
}

interface TestamentInfo {
  id: string;
  testamentType?: string;
  notarisNaam?: string;
  notarisKantoor?: string;
  notarisTelefoon?: string;
  notarisEmail?: string;
  notarisAdres?: string;
  notarisPostcode?: string;
  notarisPlaats?: string;
  datumTestament?: string;
  testamentLocatie?: string;
  ctr_Nummer?: string;
  algemeneWensen?: string;
  bijzondereBepalingen?: string;
  uitsluitingsClausule: boolean;
  legaten?: string;
}

interface Begunstigde {
  id: string;
  naam: string;
  relatie: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  percentage?: number;
  isLegitiemePortie: boolean;
}

interface Executeur {
  id: string;
  naam: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  notarieleAkte?: boolean;
}

interface TestamentSnapshot {
  id: string;
  versie: number;
  snapshotDatum: string;
  notitie?: string;
}

interface TestamentVerschil {
  veld: string;
  waardeVersie1?: string;
  waardeVersie2?: string;
}

interface TestamentVergelijking {
  versie1: TestamentSnapshot & { snapshotJson: string };
  versie2: TestamentSnapshot & { snapshotJson: string };
  verschillen: TestamentVerschil[];
}

export default function TestamentPage() {
  const t = useTranslations("testament");
  const locale = useLocale();
  const [testament, setTestament] = useState<TestamentInfo | null>(null);
  const [begunstigden, setBegunstigden] = useState<Begunstigde[]>([]);
  const [executeurs, setExecuteurs] = useState<Executeur[]>([]);
  const [execDialogOpen, setExecDialogOpen] = useState(false);
  const [editExecId, setEditExecId] = useState<string | null>(null);
  const [execForm, setExecForm] = useState({ naam: "", relatie: "", telefoon: "", email: "", adres: "", postcode: "", woonplaats: "" });
  const [execError, setExecError] = useState<string | null>(null);

  // Begunstigde dialog state
  const [begDialogOpen, setBegDialogOpen] = useState(false);
  const [editBegId, setEditBegId] = useState<string | null>(null);
  const [begForm, setBegForm] = useState({ naam: "", relatie: "", telefoon: "", email: "", adres: "", postcode: "", woonplaats: "", percentage: "", isLegitiemePortie: false });
  const [begError, setBegError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // P-S14: Legitimaire portie signalering
  const [legitiemaireCheck, setLegitimaireCheck] = useState<LegitimairePortieCheck | null>(null);

  // P-S20: Concept-vergelijking (snapshots)
  const [snapshots, setSnapshots] = useState<TestamentSnapshot[]>([]);
  const [snapDialogOpen, setSnapDialogOpen] = useState(false);
  const [snapNotitie, setSnapNotitie] = useState("");
  const [snapError, setSnapError] = useState<string | null>(null);
  const [vergelijking, setVergelijking] = useState<TestamentVergelijking | null>(null);
  const [vergelijkOpen, setVergelijkOpen] = useState(false);
  const [vergelijkIds, setVergelijkIds] = useState<[string, string]>(["", ""]);

  // P-S5: Direct-edit testament dialog
  const [testEditOpen, setTestEditOpen] = useState(false);
  const [testEditForm, setTestEditForm] = useState({
    testamentType: "", notarisNaam: "", notarisKantoor: "", notarisTelefoon: "",
    notarisEmail: "", notarisAdres: "", notarisPostcode: "", notarisPlaats: "",
    datumTestament: "", testamentLocatie: "", ctr_Nummer: "",
    algemeneWensen: "", bijzondereBepalingen: "", uitsluitingsClausule: true, legaten: "",
  });
  const [testEditError, setTestEditError] = useState<string | null>(null);

  const openTestEdit = () => {
    if (!testament) return;
    setTestEditError(null);
    setTestEditForm({
      testamentType: testament.testamentType ?? "",
      notarisNaam: testament.notarisNaam ?? "",
      notarisKantoor: testament.notarisKantoor ?? "",
      notarisTelefoon: testament.notarisTelefoon ?? "",
      notarisEmail: testament.notarisEmail ?? "",
      notarisAdres: testament.notarisAdres ?? "",
      notarisPostcode: testament.notarisPostcode ?? "",
      notarisPlaats: testament.notarisPlaats ?? "",
      datumTestament: testament.datumTestament ?? "",
      testamentLocatie: testament.testamentLocatie ?? "",
      ctr_Nummer: testament.ctr_Nummer ?? "",
      algemeneWensen: testament.algemeneWensen ?? "",
      bijzondereBepalingen: testament.bijzondereBepalingen ?? "",
      uitsluitingsClausule: testament.uitsluitingsClausule ?? true,
      legaten: testament.legaten ?? "",
    });
    setTestEditOpen(true);
  };

  const saveTestEdit = async () => {
    setTestEditError(null);
    try {
      const payload = {
        testamentType: testEditForm.testamentType || null,
        notarisNaam: testEditForm.notarisNaam || null,
        notarisKantoor: testEditForm.notarisKantoor || null,
        notarisTelefoon: testEditForm.notarisTelefoon || null,
        notarisEmail: testEditForm.notarisEmail || null,
        notarisAdres: testEditForm.notarisAdres || null,
        notarisPostcode: testEditForm.notarisPostcode || null,
        notarisPlaats: testEditForm.notarisPlaats || null,
        datumTestament: testEditForm.datumTestament || null,
        testamentLocatie: testEditForm.testamentLocatie || null,
        ctr_Nummer: testEditForm.ctr_Nummer || null,
        algemeneWensen: testEditForm.algemeneWensen || null,
        bijzondereBepalingen: testEditForm.bijzondereBepalingen || null,
        uitsluitingsClausule: testEditForm.uitsluitingsClausule,
        legaten: testEditForm.legaten || null,
      };
      const updated = await api.put<TestamentInfo>("/api/testament", payload);
      setTestament(updated);
      setTestEditOpen(false);
    } catch (err) {
      setTestEditError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [t, b, e, lp, snaps] = await Promise.all([
          api.get<TestamentInfo>("/api/testament").catch(() => null),
          api.get<Begunstigde[]>("/api/testament/begunstigden").catch(() => []),
          api.get<Executeur[]>("/api/testament/executeurs").catch(() => []),
          api.get<LegitimairePortieCheck>("/api/testament/legitimaire-portie-check").catch(() => null),
          api.get<TestamentSnapshot[]>("/api/testament/snapshots").catch(() => []),
        ]);
        setTestament(t);
        setBegunstigden(b);
        setExecuteurs(e ?? []);
        setLegitimaireCheck(lp);
        setSnapshots(snaps ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openExecDialog = (exec?: Executeur) => {
    setExecError(null);
    if (exec) {
      setEditExecId(exec.id);
      setExecForm({
        naam: exec.naam,
        relatie: exec.relatie ?? "",
        telefoon: exec.telefoon ?? "",
        email: exec.email ?? "",
        adres: exec.adres ?? "",
        postcode: exec.postcode ?? "",
        woonplaats: exec.woonplaats ?? "",
      });
    } else {
      setEditExecId(null);
      setExecForm({ naam: "", relatie: "", telefoon: "", email: "", adres: "", postcode: "", woonplaats: "" });
    }
    setExecDialogOpen(true);
  };

  const saveExec = async () => {
    setExecError(null);
    try {
      const payload = {
        naam: execForm.naam,
        relatie: execForm.relatie || null,
        telefoon: execForm.telefoon || null,
        email: execForm.email || null,
        adres: execForm.adres || null,
        postcode: execForm.postcode || null,
        woonplaats: execForm.woonplaats || null,
      };
      if (editExecId) {
        await api.put(`/api/testament/executeurs/${editExecId}`, payload);
      } else {
        await api.post("/api/testament/executeurs", payload);
      }
      setExecDialogOpen(false);
      // Reload executeurs
      const updated = await api.get<Executeur[]>("/api/testament/executeurs").catch(() => []);
      setExecuteurs(updated ?? []);
    } catch (err) {
      setExecError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  };

  const deleteExec = async (id: string) => {
    try {
      await api.delete(`/api/testament/executeurs/${id}`);
      setExecuteurs((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setExecError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  };

  // Begunstigde CRUD
  const openBegDialog = (beg?: Begunstigde) => {
    setBegError(null);
    if (beg) {
      setEditBegId(beg.id);
      setBegForm({
        naam: beg.naam,
        relatie: beg.relatie ?? "",
        telefoon: beg.telefoon ?? "",
        email: beg.email ?? "",
        adres: beg.adres ?? "",
        postcode: beg.postcode ?? "",
        woonplaats: beg.woonplaats ?? "",
        percentage: beg.percentage != null ? String(beg.percentage) : "",
        isLegitiemePortie: beg.isLegitiemePortie,
      });
    } else {
      setEditBegId(null);
      setBegForm({ naam: "", relatie: "", telefoon: "", email: "", adres: "", postcode: "", woonplaats: "", percentage: "", isLegitiemePortie: false });
    }
    setBegDialogOpen(true);
  };

  const saveBeg = async () => {
    setBegError(null);
    try {
      const payload = {
        naam: begForm.naam,
        relatie: begForm.relatie || null,
        telefoon: begForm.telefoon || null,
        email: begForm.email || null,
        adres: begForm.adres || null,
        postcode: begForm.postcode || null,
        woonplaats: begForm.woonplaats || null,
        percentage: begForm.percentage ? Number(begForm.percentage) : null,
        isLegitiemePortie: begForm.isLegitiemePortie,
      };
      if (editBegId) {
        await api.put(`/api/testament/begunstigden/${editBegId}`, payload);
      } else {
        await api.post("/api/testament/begunstigden", payload);
      }
      setBegDialogOpen(false);
      const updated = await api.get<Begunstigde[]>("/api/testament/begunstigden").catch(() => []);
      setBegunstigden(updated ?? []);
      // Herlaad legitimaire portie check na wijziging begunstigden
      const lpCheck = await api.get<LegitimairePortieCheck>("/api/testament/legitimaire-portie-check").catch(() => null);
      setLegitimaireCheck(lpCheck);
    } catch (err) {
      setBegError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  };

  const deleteBeg = async (id: string) => {
    try {
      await api.delete(`/api/testament/begunstigden/${id}`);
      setBegunstigden((prev) => prev.filter((b) => b.id !== id));
      // Herlaad legitimaire portie check na verwijdering
      const lpCheck = await api.get<LegitimairePortieCheck>("/api/testament/legitimaire-portie-check").catch(() => null);
      setLegitimaireCheck(lpCheck);
    } catch (err) {
      setBegError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  };

  // P-S20: Snapshot CRUD
  const createSnapshot = async () => {
    setSnapError(null);
    try {
      await api.post("/api/testament/snapshots", { notitie: snapNotitie || null });
      setSnapDialogOpen(false);
      setSnapNotitie("");
      const updated = await api.get<TestamentSnapshot[]>("/api/testament/snapshots").catch(() => []);
      setSnapshots(updated ?? []);
    } catch (err) {
      setSnapError(err instanceof Error ? err.message : t("versies.snapshotMislukt"));
    }
  };

  const deleteSnapshot = async (id: string) => {
    try {
      await api.delete(`/api/testament/snapshots/${id}`);
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setSnapError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  };

  const loadVergelijking = async () => {
    if (!vergelijkIds[0] || !vergelijkIds[1]) return;
    try {
      const result = await api.get<TestamentVergelijking>(
        `/api/testament/snapshots/vergelijk?versie1Id=${vergelijkIds[0]}&versie2Id=${vergelijkIds[1]}`
      );
      setVergelijking(result);
      setVergelijkOpen(true);
    } catch (err) {
      setSnapError(err instanceof Error ? err.message : t("versies.vergelijkingMislukt"));
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">{t("laden")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ScrollText className="h-8 w-8 text-blue-600" />
            {t("titel")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("beschrijving")}
          </p>
          <VoorbeeldDialog domein="testament" />
          <SectieNotitie sectie="testament" />
          <JuridischeCheck />
        </div>
        <Link href="/testament/wizard">
          <Button>
            {testament ? <><Pencil className="h-4 w-4 mr-2" /> {t("bewerken")}</> : <><Plus className="h-4 w-4 mr-2" /> {t("wizardStarten")}</>}
          </Button>
        </Link>
      </div>

      {testament ? (
        <>
        {/* P-S14: Legitimaire portie waarschuwing */}
        {legitiemaireCheck?.heeftWaarschuwing && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-900">
                  {t("legitimairePortie.titel")}
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  {t("legitimairePortie.beschrijving", {
                    aantalKinderen: legitiemaireCheck.aantalKinderen,
                    heeftPartner: String(legitiemaireCheck.heeftPartner),
                    percentage: legitiemaireCheck.minimumPercentagePerKind,
                  })}
                </p>
                <ul className="mt-2 space-y-1">
                  {legitiemaireCheck.waarschuwingen.map((w, i) => (
                    <li key={i} className="text-sm text-amber-800">
                      <strong>{w.naam}</strong>:{" "}
                      {w.toegewezenPercentage != null
                        ? t("legitimairePortie.toegewezen", { percentage: w.toegewezenPercentage, minimum: w.minimumPercentage })
                        : t("legitimairePortie.nietOpgenomen", { minimum: w.minimumPercentage })}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-amber-700 mt-2">
                  {t("legitimairePortie.disclaimer")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t("notaris.titel")}</CardTitle>
                <Button variant="ghost" size="sm" onClick={openTestEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="font-medium">{t("notaris.type")}</span> {testament.testamentType || "—"}</div>
              <div><span className="font-medium">{t("notaris.notaris")}</span> {testament.notarisNaam || "—"}</div>
              <div><span className="font-medium">{t("notaris.kantoor")}</span> {testament.notarisKantoor || "—"}</div>
              {testament.notarisTelefoon && <div><span className="font-medium">{t("notaris.telefoon")}</span> {testament.notarisTelefoon}</div>}
              {testament.notarisEmail && <div><span className="font-medium">{t("notaris.email")}</span> {testament.notarisEmail}</div>}
              {testament.notarisAdres && <div><span className="font-medium">{t("notaris.adres")}</span> {testament.notarisAdres}{testament.notarisPostcode ? `, ${testament.notarisPostcode}` : ""}{testament.notarisPlaats ? ` ${testament.notarisPlaats}` : ""}</div>}
              <div><span className="font-medium">{t("notaris.datum")}</span> {testament.datumTestament || "—"}</div>
              <div><span className="font-medium">{t("notaris.ctrNummer")}</span> {testament.ctr_Nummer || "—"}</div>
              {testament.testamentLocatie && <div><span className="font-medium">{t("notaris.locatie")}</span> {testament.testamentLocatie}</div>}
              <div><span className="font-medium">{t("notaris.uitsluitingsclausule")}</span> {testament.uitsluitingsClausule ? t("ja") : t("nee")}</div>
              {testament.legaten && <div><span className="font-medium">{t("notaris.legaten")}</span> {testament.legaten}</div>}
              {testament.algemeneWensen && <div><span className="font-medium">{t("notaris.algemeneWensen")}</span> {testament.algemeneWensen}</div>}
              {testament.bijzondereBepalingen && <div><span className="font-medium">{t("notaris.bijzondereBepalingen")}</span> {testament.bijzondereBepalingen}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t("begunstigden.titel")}</CardTitle>
                <HelpTooltip tekst={t("begunstigden.tooltip")} />
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{begunstigden.length}</Badge>
                  <Button size="sm" onClick={() => openBegDialog()}>
                    <Plus className="h-4 w-4 mr-1" /> {t("begunstigden.toevoegen")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {begError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 mb-3">
                  <p className="text-sm text-red-800">{begError}</p>
                </div>
              )}
              {begunstigden.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("begunstigden.geenBegunstigden")}</p>
              ) : (
                <ul className="space-y-2">
                  {begunstigden.map((b) => (
                    <li key={b.id} className="flex items-center justify-between text-sm rounded-md border p-2">
                      <div>
                        <span className="font-medium">{b.naam}</span>
                        <span className="text-muted-foreground ml-2">({b.relatie})</span>
                        {b.percentage != null && (
                          <Badge variant="outline" className="ml-2">{b.percentage}%</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openBegDialog(b)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteBeg(b.id)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t("executeurs.titel")}</CardTitle>
                <HelpTooltip tekst={t("executeurs.tooltip")} />
                <Button size="sm" onClick={() => openExecDialog()}>
                  <Plus className="h-4 w-4 mr-1" /> {t("executeurs.toevoegen")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {execError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 mb-3">
                  <p className="text-sm text-red-800">{execError}</p>
                </div>
              )}
              {executeurs.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("executeurs.geenExecuteurs")}</p>
              ) : (
                <ul className="space-y-2">
                  {executeurs.map((e) => (
                    <li key={e.id} className="flex items-center justify-between text-sm rounded-md border p-2">
                      <div>
                        <span className="font-medium">{e.naam}</span>
                        {e.relatie && <span className="text-muted-foreground ml-2">({e.relatie})</span>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openExecDialog(e)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteExec(e.id)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* P-S20: Versiegeschiedenis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  {t("versies.titel")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{snapshots.length}</Badge>
                  <Button size="sm" onClick={() => { setSnapNotitie(""); setSnapError(null); setSnapDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1" /> {t("versies.snapshot")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {snapError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 mb-3">
                  <p className="text-sm text-red-800">{snapError}</p>
                </div>
              )}
              {snapshots.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("versies.geenVersies")}</p>
              ) : (
                <>
                  <ul className="space-y-2 mb-4">
                    {snapshots.map((s) => (
                      <li key={s.id} className="flex items-center justify-between text-sm rounded-md border p-2">
                        <div>
                          <span className="font-medium">{t("versies.versie", { nummer: s.versie })}</span>
                          <span className="text-muted-foreground ml-2">
                            {new Date(s.snapshotDatum).toLocaleDateString(locale === "en" ? "en-NL" : "nl-NL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {s.notitie && <span className="text-muted-foreground ml-2">— {s.notitie}</span>}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteSnapshot(s.id)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  {snapshots.length >= 2 && (
                    <div className="border-t pt-3 space-y-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <GitCompareArrows className="h-4 w-4" /> {t("versies.vergelijken")}
                      </p>
                      <div className="flex items-end gap-2">
                        <div className="space-y-1 flex-1">
                          <Label className="text-xs">{t("versies.versieA")}</Label>
                          <Select value={vergelijkIds[0]} onChange={(e) => setVergelijkIds([e.target.value, vergelijkIds[1]])}>
                            <option value="">{t("versies.selecteer")}</option>
                            {snapshots.map((s) => (
                              <option key={s.id} value={s.id}>{t("versies.versie", { nummer: s.versie })}</option>
                            ))}
                          </Select>
                        </div>
                        <div className="space-y-1 flex-1">
                          <Label className="text-xs">{t("versies.versieB")}</Label>
                          <Select value={vergelijkIds[1]} onChange={(e) => setVergelijkIds([vergelijkIds[0], e.target.value])}>
                            <option value="">{t("versies.selecteer")}</option>
                            {snapshots.map((s) => (
                              <option key={s.id} value={s.id}>{t("versies.versie", { nummer: s.versie })}</option>
                            ))}
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          disabled={!vergelijkIds[0] || !vergelijkIds[1] || vergelijkIds[0] === vergelijkIds[1]}
                          onClick={loadVergelijking}
                        >
                          {t("versies.vergelijkKnop")}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ScrollText className="h-12 w-12 text-muted-foreground mb-4" />
            <CardDescription className="text-center mb-4">
              {t("geenTestament")}
            </CardDescription>
            <Link href="/testament/wizard">
              <Button>{t("wizardStarten")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Dialog open={execDialogOpen} onOpenChange={setExecDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editExecId ? t("execDialog.bewerken") : t("execDialog.toevoegen")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("execDialog.naam")}</Label>
            <Input
              value={execForm.naam}
              onChange={(e) => setExecForm((f) => ({ ...f, naam: e.target.value }))}
              placeholder={t("execDialog.naamPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("execDialog.relatie")}</Label>
            <Input
              value={execForm.relatie}
              onChange={(e) => setExecForm((f) => ({ ...f, relatie: e.target.value }))}
              placeholder={t("execDialog.relatiePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("execDialog.telefoon")}</Label>
            <Input
              value={execForm.telefoon}
              onChange={(e) => setExecForm((f) => ({ ...f, telefoon: e.target.value }))}
              placeholder={t("execDialog.telefoonPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("execDialog.email")}</Label>
            <Input
              value={execForm.email}
              onChange={(e) => setExecForm((f) => ({ ...f, email: e.target.value }))}
              placeholder={t("execDialog.emailPlaceholder")}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-2">
              <Label>{t("execDialog.adres")}</Label>
              <Input
                value={execForm.adres}
                onChange={(e) => setExecForm((f) => ({ ...f, adres: e.target.value }))}
                placeholder={t("execDialog.adresPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("execDialog.postcode")}</Label>
              <Input
                value={execForm.postcode}
                onChange={(e) => setExecForm((f) => ({ ...f, postcode: e.target.value }))}
                placeholder={t("execDialog.postcodePlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("execDialog.woonplaats")}</Label>
            <Input
              value={execForm.woonplaats}
              onChange={(e) => setExecForm((f) => ({ ...f, woonplaats: e.target.value }))}
              placeholder={t("execDialog.woonplaatsPlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setExecDialogOpen(false)}>{t("execDialog.annuleren")}</Button>
          <Button onClick={saveExec}>{t("execDialog.opslaan")}</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={testEditOpen} onOpenChange={setTestEditOpen}>
        <DialogHeader>
          <DialogTitle>{t("testEditDialog.titel")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {testEditError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2">
              <p className="text-sm text-red-800">{testEditError}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("testEditDialog.typeTestament")}</Label>
              <Input value={testEditForm.testamentType} onChange={(e) => setTestEditForm((f) => ({ ...f, testamentType: e.target.value }))} placeholder={t("testEditDialog.typePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("testEditDialog.datumTestament")}</Label>
              <Input type="date" value={testEditForm.datumTestament} onChange={(e) => setTestEditForm((f) => ({ ...f, datumTestament: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("testEditDialog.notaris")}</Label>
              <Input value={testEditForm.notarisNaam} onChange={(e) => setTestEditForm((f) => ({ ...f, notarisNaam: e.target.value }))} placeholder={t("testEditDialog.notarisPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("testEditDialog.kantoor")}</Label>
              <Input value={testEditForm.notarisKantoor} onChange={(e) => setTestEditForm((f) => ({ ...f, notarisKantoor: e.target.value }))} placeholder={t("testEditDialog.kantoorPlaceholder")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("testEditDialog.telefoon")}</Label>
              <Input value={testEditForm.notarisTelefoon} onChange={(e) => setTestEditForm((f) => ({ ...f, notarisTelefoon: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("testEditDialog.email")}</Label>
              <Input value={testEditForm.notarisEmail} onChange={(e) => setTestEditForm((f) => ({ ...f, notarisEmail: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-2">
              <Label>{t("testEditDialog.adres")}</Label>
              <Input value={testEditForm.notarisAdres} onChange={(e) => setTestEditForm((f) => ({ ...f, notarisAdres: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("testEditDialog.postcode")}</Label>
              <Input value={testEditForm.notarisPostcode} onChange={(e) => setTestEditForm((f) => ({ ...f, notarisPostcode: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("testEditDialog.plaats")}</Label>
              <Input value={testEditForm.notarisPlaats} onChange={(e) => setTestEditForm((f) => ({ ...f, notarisPlaats: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("testEditDialog.ctrNummer")}</Label>
              <Input value={testEditForm.ctr_Nummer} onChange={(e) => setTestEditForm((f) => ({ ...f, ctr_Nummer: e.target.value }))} placeholder={t("testEditDialog.ctrPlaceholder")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("testEditDialog.locatie")}</Label>
            <Input value={testEditForm.testamentLocatie} onChange={(e) => setTestEditForm((f) => ({ ...f, testamentLocatie: e.target.value }))} placeholder={t("testEditDialog.locatiePlaceholder")} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="uitsluitingsclausule" checked={testEditForm.uitsluitingsClausule} onChange={(e) => setTestEditForm((f) => ({ ...f, uitsluitingsClausule: e.target.checked }))} className="h-4 w-4 rounded border-border" />
            <Label htmlFor="uitsluitingsclausule">{t("testEditDialog.uitsluitingsclausule")}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t("testEditDialog.legaten")}</Label>
            <Textarea value={testEditForm.legaten} onChange={(e) => setTestEditForm((f) => ({ ...f, legaten: e.target.value }))} placeholder={t("testEditDialog.legatenPlaceholder")} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>{t("testEditDialog.algemeneWensen")}</Label>
            <Textarea value={testEditForm.algemeneWensen} onChange={(e) => setTestEditForm((f) => ({ ...f, algemeneWensen: e.target.value }))} placeholder={t("testEditDialog.algemeneWensenPlaceholder")} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>{t("testEditDialog.bijzondereBepalingen")}</Label>
            <Textarea value={testEditForm.bijzondereBepalingen} onChange={(e) => setTestEditForm((f) => ({ ...f, bijzondereBepalingen: e.target.value }))} placeholder={t("testEditDialog.bijzonderePlaceholder")} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTestEditOpen(false)}>{t("testEditDialog.annuleren")}</Button>
          <Button onClick={saveTestEdit}>{t("testEditDialog.opslaan")}</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={begDialogOpen} onOpenChange={setBegDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editBegId ? t("begDialog.bewerken") : t("begDialog.toevoegen")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("begDialog.naam")}</Label>
              <Input
                value={begForm.naam}
                onChange={(e) => setBegForm((f) => ({ ...f, naam: e.target.value }))}
                placeholder={t("begDialog.naamPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("begDialog.relatie")}</Label>
              <Input
                value={begForm.relatie}
                onChange={(e) => setBegForm((f) => ({ ...f, relatie: e.target.value }))}
                placeholder={t("begDialog.relatiePlaceholder")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("begDialog.telefoon")}</Label>
              <Input
                value={begForm.telefoon}
                onChange={(e) => setBegForm((f) => ({ ...f, telefoon: e.target.value }))}
                placeholder={t("begDialog.telefoonPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("begDialog.email")}</Label>
              <Input
                value={begForm.email}
                onChange={(e) => setBegForm((f) => ({ ...f, email: e.target.value }))}
                placeholder={t("begDialog.emailPlaceholder")}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-2">
              <Label>{t("begDialog.adres")}</Label>
              <Input
                value={begForm.adres}
                onChange={(e) => setBegForm((f) => ({ ...f, adres: e.target.value }))}
                placeholder={t("begDialog.adresPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("begDialog.postcode")}</Label>
              <Input
                value={begForm.postcode}
                onChange={(e) => setBegForm((f) => ({ ...f, postcode: e.target.value }))}
                placeholder={t("begDialog.postcodePlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("begDialog.woonplaats")}</Label>
            <Input
              value={begForm.woonplaats}
              onChange={(e) => setBegForm((f) => ({ ...f, woonplaats: e.target.value }))}
              placeholder={t("begDialog.woonplaatsPlaceholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("begDialog.percentage")}</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={begForm.percentage}
                onChange={(e) => setBegForm((f) => ({ ...f, percentage: e.target.value }))}
                placeholder={t("begDialog.percentagePlaceholder")}
              />
            </div>
            <div className="flex items-end space-x-2 pb-0.5">
              <input
                type="checkbox"
                id="legitieme-portie"
                checked={begForm.isLegitiemePortie}
                onChange={(e) => setBegForm((f) => ({ ...f, isLegitiemePortie: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="legitieme-portie" className="text-sm">{t("begDialog.legitiemePortie")}</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setBegDialogOpen(false)}>{t("begDialog.annuleren")}</Button>
          <Button onClick={saveBeg}>{t("begDialog.opslaan")}</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={snapDialogOpen} onOpenChange={setSnapDialogOpen}>
        <DialogHeader>
          <DialogTitle>{t("snapDialog.titel")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            {t("snapDialog.beschrijving")}
          </p>
          {snapError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2">
              <p className="text-sm text-red-800">{snapError}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>{t("snapDialog.notitie")}</Label>
            <Textarea
              value={snapNotitie}
              onChange={(e) => setSnapNotitie(e.target.value)}
              placeholder={t("snapDialog.notitiePlaceholder")}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSnapDialogOpen(false)}>{t("snapDialog.annuleren")}</Button>
          <Button onClick={createSnapshot}>{t("snapDialog.opslaan")}</Button>
        </DialogFooter>
      </Dialog>

      {/* P-S20: Vergelijking dialog */}
      <Dialog open={vergelijkOpen} onOpenChange={setVergelijkOpen}>
        <DialogHeader>
          <DialogTitle>
            {t("vergelijkDialog.titel", { versie1: vergelijking?.versie1?.versie ?? 0, versie2: vergelijking?.versie2?.versie ?? 0 })}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {vergelijking && vergelijking.verschillen.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("vergelijkDialog.geenVerschillen")}
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 font-medium">{t("vergelijkDialog.kolomVeld")}</th>
                    <th className="text-left p-2 font-medium">{t("vergelijkDialog.kolomVersie", { nummer: vergelijking?.versie1?.versie ?? 0 })}</th>
                    <th className="text-left p-2 font-medium">{t("vergelijkDialog.kolomVersie", { nummer: vergelijking?.versie2?.versie ?? 0 })}</th>
                  </tr>
                </thead>
                <tbody>
                  {vergelijking?.verschillen.map((v, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 font-medium">{v.veld}</td>
                      <td className="p-2 text-red-700 bg-red-50">{v.waardeVersie1 || "—"}</td>
                      <td className="p-2 text-green-700 bg-green-50">{v.waardeVersie2 || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setVergelijkOpen(false)}>{t("vergelijkDialog.sluiten")}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
