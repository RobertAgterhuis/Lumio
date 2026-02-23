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
import { useTranslations } from "next-intl";
import { Church, Plus, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { PersonSelect } from "@/components/PersonSelect";

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
  rouwadvertentieTekst?: string;
  condoleance?: string;
  overigeWensen?: string;
  voorkeurBegraafplaatsNaam?: string;
  voorkeurBegraafplaatsAdres?: string;
  voorkeurCrematoriumnaam?: string;
  voorkeurCrematoriumAdres?: string;
  voorkeurAulaNaam?: string;
  voorkeurAulaAdres?: string;
  budgetRichting?: string;
}

interface CeremonieDetail {
  id: string;
  onderdeel: string;
  beschrijving?: string;
  volgorde: number;
  muziek?: string;
  spreker?: string;
  tekstlezing?: string;
  dresscode?: string;
}

interface UitvaartGenodigde {
  id: string;
  naam: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  notities?: string;
}

export default function UitvaartPage() {
  const t = useTranslations("uitvaart");
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
    muziek: "",
    spreker: "",
    tekstlezing: "",
    dresscode: "",
  });
  const [detailError, setDetailError] = useState<string | null>(null);

  // P-S18: Genodigdenlijst
  const [genodigden, setGenodigden] = useState<UitvaartGenodigde[]>([]);
  const [genDialogOpen, setGenDialogOpen] = useState(false);
  const [editGenId, setEditGenId] = useState<string | null>(null);
  const [genForm, setGenForm] = useState({
    naam: "", relatie: "", telefoon: "", email: "", adres: "", postcode: "", woonplaats: "", notities: "",
  });
  const [genError, setGenError] = useState<string | null>(null);

  // P-S5: Direct-edit uitvaart dialog
  const [uitvaartEditOpen, setUitvaartEditOpen] = useState(false);
  const [uitvaartEditForm, setUitvaartEditForm] = useState({
    voorkeurType: "", begraafplaats: "", uitvaartOndernemer: "", uitvaartOndernemerTelefoon: "",
    uitvaartOndernemerEmail: "", uitvaartOndernemerAdres: "", uitvaartOndernemerPostcode: "", uitvaartOndernemerPlaats: "",
    heeftUitvaartVerzekering: false, uitvaartVerzekeringDetails: "",
    ceremonieSoort: "", ceremonieLocatie: "", muziekwensen: "", sprekers: "", bloemen: "",
    kledingwensen: "", rouwkaartTekst: "", rouwadvertentieTekst: "", condoleance: "", overigeWensen: "",
    voorkeurBegraafplaatsNaam: "", voorkeurBegraafplaatsAdres: "",
    voorkeurCrematoriumnaam: "", voorkeurCrematoriumAdres: "",
    voorkeurAulaNaam: "", voorkeurAulaAdres: "", budgetRichting: "",
  });
  const [uitvaartEditError, setUitvaartEditError] = useState<string | null>(null);

  const openUitvaartEdit = () => {
    if (!data) return;
    setUitvaartEditError(null);
    setUitvaartEditForm({
      voorkeurType: data.voorkeurType ?? "",
      begraafplaats: data.begraafplaats ?? "",
      uitvaartOndernemer: data.uitvaartOndernemer ?? "",
      uitvaartOndernemerTelefoon: data.uitvaartOndernemerTelefoon ?? "",
      uitvaartOndernemerEmail: data.uitvaartOndernemerEmail ?? "",
      uitvaartOndernemerAdres: data.uitvaartOndernemerAdres ?? "",
      uitvaartOndernemerPostcode: data.uitvaartOndernemerPostcode ?? "",
      uitvaartOndernemerPlaats: data.uitvaartOndernemerPlaats ?? "",
      heeftUitvaartVerzekering: data.heeftUitvaartVerzekering ?? false,
      uitvaartVerzekeringDetails: data.uitvaartVerzekeringDetails ?? "",
      ceremonieSoort: data.ceremonieSoort ?? "",
      ceremonieLocatie: data.ceremonieLocatie ?? "",
      muziekwensen: data.muziekwensen ?? "",
      sprekers: data.sprekers ?? "",
      bloemen: data.bloemen ?? "",
      kledingwensen: data.kledingwensen ?? "",
      rouwkaartTekst: data.rouwkaartTekst ?? "",
      rouwadvertentieTekst: data.rouwadvertentieTekst ?? "",
      condoleance: data.condoleance ?? "",
      overigeWensen: data.overigeWensen ?? "",
      voorkeurBegraafplaatsNaam: data.voorkeurBegraafplaatsNaam ?? "",
      voorkeurBegraafplaatsAdres: data.voorkeurBegraafplaatsAdres ?? "",
      voorkeurCrematoriumnaam: data.voorkeurCrematoriumnaam ?? "",
      voorkeurCrematoriumAdres: data.voorkeurCrematoriumAdres ?? "",
      voorkeurAulaNaam: data.voorkeurAulaNaam ?? "",
      voorkeurAulaAdres: data.voorkeurAulaAdres ?? "",
      budgetRichting: data.budgetRichting ?? "",
    });
    setUitvaartEditOpen(true);
  };

  const saveUitvaartEdit = async () => {
    setUitvaartEditError(null);
    try {
      const f = uitvaartEditForm;
      const payload = {
        voorkeurType: f.voorkeurType,
        begraafplaats: f.begraafplaats || null,
        uitvaartOndernemer: f.uitvaartOndernemer || null,
        uitvaartOndernemerTelefoon: f.uitvaartOndernemerTelefoon || null,
        uitvaartOndernemerEmail: f.uitvaartOndernemerEmail || null,
        uitvaartOndernemerAdres: f.uitvaartOndernemerAdres || null,
        uitvaartOndernemerPostcode: f.uitvaartOndernemerPostcode || null,
        uitvaartOndernemerPlaats: f.uitvaartOndernemerPlaats || null,
        heeftUitvaartVerzekering: f.heeftUitvaartVerzekering,
        uitvaartVerzekeringDetails: f.uitvaartVerzekeringDetails || null,
        ceremonieSoort: f.ceremonieSoort || null,
        ceremonieLocatie: f.ceremonieLocatie || null,
        muziekwensen: f.muziekwensen || null,
        sprekers: f.sprekers || null,
        bloemen: f.bloemen || null,
        kledingwensen: f.kledingwensen || null,
        rouwkaartTekst: f.rouwkaartTekst || null,
        rouwadvertentieTekst: f.rouwadvertentieTekst || null,
        condoleance: f.condoleance || null,
        overigeWensen: f.overigeWensen || null,
        voorkeurBegraafplaatsNaam: f.voorkeurBegraafplaatsNaam || null,
        voorkeurBegraafplaatsAdres: f.voorkeurBegraafplaatsAdres || null,
        voorkeurCrematoriumnaam: f.voorkeurCrematoriumnaam || null,
        voorkeurCrematoriumAdres: f.voorkeurCrematoriumAdres || null,
        voorkeurAulaNaam: f.voorkeurAulaNaam || null,
        voorkeurAulaAdres: f.voorkeurAulaAdres || null,
        budgetRichting: f.budgetRichting || null,
      };
      const updated = await api.put<UitvaartWensen>("/api/uitvaart", payload);
      setData(updated);
      setUitvaartEditOpen(false);
    } catch (err) {
      setUitvaartEditError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  };

  const loadData = () => {
    Promise.all([
      api.get<UitvaartWensen>("/api/uitvaart").catch(() => null),
      api.get<CeremonieDetail[]>("/api/uitvaart/details").catch(() => []),
      api.get<UitvaartGenodigde[]>("/api/uitvaart/genodigden").catch(() => []),
    ])
      .then(([u, d, g]) => {
        setData(u);
        setDetails(
          (d ?? []).sort((a, b) => a.volgorde - b.volgorde)
        );
        setGenodigden(g ?? []);
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
        muziek: detail.muziek ?? "",
        spreker: detail.spreker ?? "",
        tekstlezing: detail.tekstlezing ?? "",
        dresscode: detail.dresscode ?? "",
      });
    } else {
      setEditDetailId(null);
      setDetailForm({
        onderdeel: "",
        beschrijving: "",
        volgorde: details.length + 1,
        muziek: "",
        spreker: "",
        tekstlezing: "",
        dresscode: "",
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
        muziek: detailForm.muziek || null,
        spreker: detailForm.spreker || null,
        tekstlezing: detailForm.tekstlezing || null,
        dresscode: detailForm.dresscode || null,
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
        err instanceof Error ? err.message : t("opslaanMislukt")
      );
    }
  };

  const deleteDetail = async (id: string) => {
    try {
      await api.delete(`/api/uitvaart/details/${id}`);
      setDetails((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : t("verwijderenMislukt")
      );
    }
  };

  // P-S18: Genodigden CRUD
  const openGenDialog = (g?: UitvaartGenodigde) => {
    setGenError(null);
    if (g) {
      setEditGenId(g.id);
      setGenForm({
        naam: g.naam,
        relatie: g.relatie ?? "",
        telefoon: g.telefoon ?? "",
        email: g.email ?? "",
        adres: g.adres ?? "",
        postcode: g.postcode ?? "",
        woonplaats: g.woonplaats ?? "",
        notities: g.notities ?? "",
      });
    } else {
      setEditGenId(null);
      setGenForm({ naam: "", relatie: "", telefoon: "", email: "", adres: "", postcode: "", woonplaats: "", notities: "" });
    }
    setGenDialogOpen(true);
  };

  const saveGen = async () => {
    setGenError(null);
    try {
      const payload = {
        naam: genForm.naam,
        relatie: genForm.relatie || null,
        telefoon: genForm.telefoon || null,
        email: genForm.email || null,
        adres: genForm.adres || null,
        postcode: genForm.postcode || null,
        woonplaats: genForm.woonplaats || null,
        notities: genForm.notities || null,
      };
      if (editGenId) {
        await api.put(`/api/uitvaart/genodigden/${editGenId}`, payload);
      } else {
        await api.post("/api/uitvaart/genodigden", payload);
      }
      setGenDialogOpen(false);
      loadData();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  };

  const deleteGen = async (id: string) => {
    try {
      await api.delete(`/api/uitvaart/genodigden/${id}`);
      setGenodigden((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setGenError(err instanceof Error ? err.message : t("verwijderenMislukt"));
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("titel")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("beschrijving")}
          </p>
          <VoorbeeldDialog domein="uitvaart" />
          <SectieNotitie sectie="uitvaart" />
        </div>
        <Link href="/uitvaart/wizard">
          <Button>
            <Church className="h-4 w-4 mr-2" />
            {data ? t("bewerken") : t("wizardStarten")}
          </Button>
        </Link>
      </div>

      {!data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Church className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t("geenWensen")}
            </p>
            <Link href="/uitvaart/wizard">
              <Button className="mt-4">{t("wizardStarten")}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("uitvaartCard.titel")}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={openUitvaartEdit}><Pencil className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("uitvaartCard.type")}</span>{" "}
                  <strong>{data.voorkeurType}</strong>
                </p>
                {data.begraafplaats && (
                  <p>
                    <span className="text-muted-foreground">
                      {t("uitvaartCard.begraafplaats")}
                    </span>{" "}
                    {data.begraafplaats}
                  </p>
                )}
                {data.uitvaartOndernemer && (
                  <p>
                    <span className="text-muted-foreground">
                      {t("uitvaartCard.ondernemer")}
                    </span>{" "}
                    {data.uitvaartOndernemer}
                  </p>
                )}
                {data.uitvaartOndernemerTelefoon && (
                  <p>
                    <span className="text-muted-foreground">{t("uitvaartCard.telOndernemer")}</span>{" "}
                    {data.uitvaartOndernemerTelefoon}
                  </p>
                )}
                {data.uitvaartOndernemerEmail && (
                  <p>
                    <span className="text-muted-foreground">{t("uitvaartCard.emailOndernemer")}</span>{" "}
                    {data.uitvaartOndernemerEmail}
                  </p>
                )}
                {data.uitvaartOndernemerAdres && (
                  <p>
                    <span className="text-muted-foreground">{t("uitvaartCard.adresOndernemer")}</span>{" "}
                    {data.uitvaartOndernemerAdres}
                    {data.uitvaartOndernemerPostcode ? `, ${data.uitvaartOndernemerPostcode}` : ""}
                    {data.uitvaartOndernemerPlaats ? ` ${data.uitvaartOndernemerPlaats}` : ""}
                  </p>
                )}
                {data.kledingwensen && (
                  <p>
                    <span className="text-muted-foreground">{t("uitvaartCard.kleding")}</span>{" "}
                    {data.kledingwensen}
                  </p>
                )}
                {data.budgetRichting && (
                  <p>
                    <span className="text-muted-foreground">{t("uitvaartCard.budget")}</span>{" "}
                    {data.budgetRichting}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("ceremonieCard.titel")}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={openUitvaartEdit}><Pencil className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {data.ceremonieSoort && (
                  <p>
                    <span className="text-muted-foreground">{t("ceremonieCard.soort")}</span>{" "}
                    {data.ceremonieSoort}
                    {data.ceremonieLocatie &&
                      ` — ${data.ceremonieLocatie}`}
                  </p>
                )}
                {data.muziekwensen && (
                  <p>
                    <span className="text-muted-foreground">{t("ceremonieCard.muziek")}</span>{" "}
                    {data.muziekwensen}
                  </p>
                )}
                {data.bloemen && (
                  <p>
                    <span className="text-muted-foreground">{t("ceremonieCard.bloemen")}</span>{" "}
                    {data.bloemen}
                  </p>
                )}
                {data.rouwkaartTekst && (
                  <p>
                    <span className="text-muted-foreground">
                      {t("ceremonieCard.rouwkaart")}
                    </span>{" "}
                    {data.rouwkaartTekst}
                  </p>
                )}
                {data.rouwadvertentieTekst && (
                  <p>
                    <span className="text-muted-foreground">
                      {t("ceremonieCard.rouwadvertentie")}
                    </span>{" "}
                    {data.rouwadvertentieTekst}
                  </p>
                )}
                {data.condoleance && (
                  <p>
                    <span className="text-muted-foreground">
                      {t("ceremonieCard.condoleance")}
                    </span>{" "}
                    {data.condoleance}
                  </p>
                )}
                {data.overigeWensen && (
                  <p>
                    <span className="text-muted-foreground">
                      {t("ceremonieCard.aanvullend")}
                    </span>{" "}
                    {data.overigeWensen}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {(data.voorkeurBegraafplaatsNaam || data.voorkeurCrematoriumnaam || data.voorkeurAulaNaam) && (
            <Card>
              <CardHeader>
                <CardTitle>{t("locatieCard.titel")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {data.voorkeurBegraafplaatsNaam && (
                  <p>
                    <span className="text-muted-foreground">{t("locatieCard.begraafplaats")}</span>{" "}
                    {data.voorkeurBegraafplaatsNaam}
                    {data.voorkeurBegraafplaatsAdres && ` \u2014 ${data.voorkeurBegraafplaatsAdres}`}
                  </p>
                )}
                {data.voorkeurCrematoriumnaam && (
                  <p>
                    <span className="text-muted-foreground">{t("locatieCard.crematorium")}</span>{" "}
                    {data.voorkeurCrematoriumnaam}
                    {data.voorkeurCrematoriumAdres && ` \u2014 ${data.voorkeurCrematoriumAdres}`}
                  </p>
                )}
                {data.voorkeurAulaNaam && (
                  <p>
                    <span className="text-muted-foreground">{t("locatieCard.aula")}</span>{" "}
                    {data.voorkeurAulaNaam}
                    {data.voorkeurAulaAdres && ` \u2014 ${data.voorkeurAulaAdres}`}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("verloop.titel")}</CardTitle>
                <Button size="sm" onClick={() => openDetailDialog()}>
                  <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
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
                  {t("verloop.geenOnderdelen")}
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
                        {(d.muziek || d.spreker || d.tekstlezing || d.dresscode) && (
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            {d.muziek && <span className="text-xs text-muted-foreground">♫ {d.muziek}</span>}
                            {d.spreker && <span className="text-xs text-muted-foreground">🗣 {d.spreker}</span>}
                            {d.tekstlezing && <span className="text-xs text-muted-foreground">📖 {d.tekstlezing}</span>}
                            {d.dresscode && <span className="text-xs text-muted-foreground">👔 {d.dresscode}</span>}
                          </div>
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

          {/* P-S18: Genodigdenlijst */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t("genodigden.titel")}
                <Badge variant="secondary">{genodigden.length}</Badge>
              </CardTitle>
              <Button size="sm" onClick={() => openGenDialog()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </CardHeader>
            <CardContent>
              {genodigden.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("genodigden.geenGenodigden")}
                </p>
              ) : (
                <div className="space-y-2">
                  {genodigden.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{g.naam}</p>
                        <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                          {g.relatie && <span>{g.relatie}</span>}
                          {g.telefoon && <span>📞 {g.telefoon}</span>}
                          {g.email && <span>✉ {g.email}</span>}
                          {g.woonplaats && <span>📍 {g.woonplaats}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openGenDialog(g)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteGen(g.id)}>
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
              ? t("detailDialog.bewerken")
              : t("detailDialog.toevoegen")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("detailDialog.onderdeel")}</Label>
            <Input
              value={detailForm.onderdeel}
              onChange={(e) =>
                setDetailForm((f) => ({
                  ...f,
                  onderdeel: e.target.value,
                }))
              }
              placeholder={t("detailDialog.onderdeelPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("detailDialog.beschrijving")}</Label>
            <Textarea
              value={detailForm.beschrijving}
              onChange={(e) =>
                setDetailForm((f) => ({
                  ...f,
                  beschrijving: e.target.value,
                }))
              }
              placeholder={t("detailDialog.beschrijvingPlaceholder")}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("detailDialog.volgorde")}</Label>
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
          <div className="space-y-2">
            <Label>{t("detailDialog.muziek")}</Label>
            <Input
              value={detailForm.muziek}
              onChange={(e) =>
                setDetailForm((f) => ({
                  ...f,
                  muziek: e.target.value,
                }))
              }
              placeholder={t("detailDialog.muziekPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("detailDialog.spreker")}</Label>
            <Input
              value={detailForm.spreker}
              onChange={(e) =>
                setDetailForm((f) => ({
                  ...f,
                  spreker: e.target.value,
                }))
              }
              placeholder={t("detailDialog.sprekerPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("detailDialog.tekstlezing")}</Label>
            <Input
              value={detailForm.tekstlezing}
              onChange={(e) =>
                setDetailForm((f) => ({
                  ...f,
                  tekstlezing: e.target.value,
                }))
              }
              placeholder={t("detailDialog.tekstlezingPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("detailDialog.dresscode")}</Label>
            <Input
              value={detailForm.dresscode}
              onChange={(e) =>
                setDetailForm((f) => ({
                  ...f,
                  dresscode: e.target.value,
                }))
              }
              placeholder={t("detailDialog.dresscodePlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDetailDialogOpen(false)}
          >
            {t("annuleren")}
          </Button>
          <Button onClick={saveDetail}>{t("opslaan")}</Button>
        </DialogFooter>
      </Dialog>

      {/* P-S18: Genodigde Dialog */}
      <Dialog open={genDialogOpen} onOpenChange={setGenDialogOpen}>
        <DialogHeader>
          <DialogTitle>
            {editGenId ? t("genodigdeDialog.bewerken") : t("genodigdeDialog.toevoegen")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("genodigdeDialog.naam")}</Label>
              <PersonSelect
                source="both"
                value={genForm.naam}
                onChange={(v) => setGenForm((f) => ({ ...f, naam: v }))}
                onPersonSelect={(p) => setGenForm((f) => ({ ...f, relatie: p.relatie || f.relatie, telefoon: p.telefoon || f.telefoon, email: p.email || f.email, adres: p.adres || f.adres, postcode: p.postcode || f.postcode, woonplaats: p.woonplaats || f.woonplaats }))}
                placeholder={t("genodigdeDialog.naamPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("genodigdeDialog.relatie")}</Label>
              <Input
                value={genForm.relatie}
                onChange={(e) => setGenForm((f) => ({ ...f, relatie: e.target.value }))}
                placeholder={t("genodigdeDialog.relatiePlaceholder")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("genodigdeDialog.telefoon")}</Label>
              <Input
                type="tel"
                value={genForm.telefoon}
                onChange={(e) => setGenForm((f) => ({ ...f, telefoon: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("genodigdeDialog.email")}</Label>
              <Input
                type="email"
                value={genForm.email}
                onChange={(e) => setGenForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("genodigdeDialog.adres")}</Label>
            <Input
              value={genForm.adres}
              onChange={(e) => setGenForm((f) => ({ ...f, adres: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("genodigdeDialog.postcode")}</Label>
              <Input
                value={genForm.postcode}
                onChange={(e) => setGenForm((f) => ({ ...f, postcode: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("genodigdeDialog.woonplaats")}</Label>
              <Input
                value={genForm.woonplaats}
                onChange={(e) => setGenForm((f) => ({ ...f, woonplaats: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("genodigdeDialog.notities")}</Label>
            <Textarea
              value={genForm.notities}
              onChange={(e) => setGenForm((f) => ({ ...f, notities: e.target.value }))}
              rows={2}
              placeholder={t("genodigdeDialog.notitiesPlaceholder")}
            />
          </div>
          {genError && <p className="text-sm text-red-500">{genError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setGenDialogOpen(false)}>
            {t("annuleren")}
          </Button>
          <Button onClick={saveGen}>{t("opslaan")}</Button>
        </DialogFooter>
      </Dialog>

      {/* P-S5: Direct-edit uitvaart dialog */}
      <Dialog open={uitvaartEditOpen} onOpenChange={setUitvaartEditOpen}>
        <DialogHeader>
          <DialogTitle>{t("editDialog.titel")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {uitvaartEditError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2">
              <p className="text-sm text-red-800">{uitvaartEditError}</p>
            </div>
          )}
          <p className="text-sm font-medium text-muted-foreground">{t("editDialog.sectieUitvaart")}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.type")}</Label>
              <Input value={uitvaartEditForm.voorkeurType} onChange={(e) => setUitvaartEditForm((f) => ({ ...f, voorkeurType: e.target.value }))} placeholder={t("editDialog.typePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.budget")}</Label>
              <Input value={uitvaartEditForm.budgetRichting} onChange={(e) => setUitvaartEditForm((f) => ({ ...f, budgetRichting: e.target.value }))} placeholder={t("editDialog.budgetPlaceholder")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.ondernemer")}</Label>
              <PersonSelect
                source={{ noodcontactRol: "Uitvaartondernemer" }}
                value={uitvaartEditForm.uitvaartOndernemer}
                onChange={(v) => setUitvaartEditForm((f) => ({ ...f, uitvaartOndernemer: v }))}
                onPersonSelect={(p) => setUitvaartEditForm((f) => ({ ...f, uitvaartOndernemerTelefoon: p.telefoon || f.uitvaartOndernemerTelefoon, uitvaartOndernemerEmail: p.email || f.uitvaartOndernemerEmail, uitvaartOndernemerAdres: p.adres || f.uitvaartOndernemerAdres, uitvaartOndernemerPostcode: p.postcode || f.uitvaartOndernemerPostcode, uitvaartOndernemerPlaats: p.woonplaats || f.uitvaartOndernemerPlaats }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.telOndernemer")}</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.emailOndernemer")}</Label>
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.kleding")}</Label>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="verzekering" checked={uitvaartEditForm.heeftUitvaartVerzekering} onChange={(e) => setUitvaartEditForm((f) => ({ ...f, heeftUitvaartVerzekering: e.target.checked }))} className="h-4 w-4 rounded border-border" />
            <Label htmlFor="verzekering">{t("editDialog.heeftVerzekering")}</Label>
          </div>
          {uitvaartEditForm.heeftUitvaartVerzekering && (
            <div className="space-y-2">
              <Label>{t("editDialog.verzekeringsdetails")}</Label>
            </div>
          )}
          <hr />
          <p className="text-sm font-medium text-muted-foreground">{t("editDialog.sectieCeremonie")}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.soort")}</Label>
              <Input value={uitvaartEditForm.ceremonieSoort} onChange={(e) => setUitvaartEditForm((f) => ({ ...f, ceremonieSoort: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.locatie")}</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.muziekwensen")}</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.bloemen")}</Label>
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.sprekers")}</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.rouwkaarttekst")}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.rouwadvertentietekst")}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.condoleance")}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.overigeWensen")}</Label>
          </div>
          <hr />
          <p className="text-sm font-medium text-muted-foreground">{t("editDialog.sectieLocatie")}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.begraafplaats")}</Label>
              <Input value={uitvaartEditForm.voorkeurBegraafplaatsNaam} onChange={(e) => setUitvaartEditForm((f) => ({ ...f, voorkeurBegraafplaatsNaam: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.adresBegraafplaats")}</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.crematorium")}</Label>
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.adresCrematorium")}</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.aula")}</Label>
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.adresAula")}</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setUitvaartEditOpen(false)}>{t("annuleren")}</Button>
          <Button onClick={saveUitvaartEdit}>{t("opslaan")}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
