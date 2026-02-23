"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("euthanasie");
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
      setEditError(err instanceof Error ? err.message : t("opslaanMislukt"));
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
          <VoorbeeldDialog domein="euthanasie" />
          <SectieNotitie sectie="euthanasie" />
        </div>
        <Link href="/euthanasie/wizard">
          <Button>
            <Stethoscope className="h-4 w-4 mr-2" />
            {data ? t("bewerken") : t("wizardStarten")}
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <p className="text-sm text-purple-800"
          dangerouslySetInnerHTML={{ __html: t.raw("disclaimer") }}
        />
      </div>

      {!data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Stethoscope className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t("geenWilsverklaring")}
            </p>
            <Link href="/euthanasie/wizard">
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
                <CardTitle>{t("wilsverklaringCard.titel")}</CardTitle>
                <Button variant="ghost" size="sm" onClick={openEdit}><Pencil className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">{t("wilsverklaringCard.wilEuthanasie")}</span>{" "}
                {data.wilEuthanasie ? t("ja") : t("nee")}
              </p>
              {data.datumOndertekening && (
                <p>
                  <span className="text-muted-foreground">
                    {t("wilsverklaringCard.datumOndertekening")}
                  </span>{" "}
                  {data.datumOndertekening}
                </p>
              )}
              {data.situatieBeschrijving && (
                <p>
                  <span className="text-muted-foreground">{t("wilsverklaringCard.situatie")}</span>{" "}
                  {data.situatieBeschrijving}
                </p>
              )}
              {data.aanvullendeWensen && (
                <p>
                  <span className="text-muted-foreground">
                    {t("wilsverklaringCard.aanvullendeWensen")}
                  </span>{" "}
                  {data.aanvullendeWensen}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("contactCard.titel")}</CardTitle>
                <Button variant="ghost" size="sm" onClick={openEdit}><Pencil className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {data.huisarts && (
                <p>
                  <span className="text-muted-foreground">{t("contactCard.huisarts")}</span>{" "}
                  {data.huisarts}
                </p>
              )}
              {data.huisartsPraktijk && (
                <p>
                  <span className="text-muted-foreground">{t("contactCard.praktijk")}</span>{" "}
                  {data.huisartsPraktijk}
                </p>
              )}
              {data.huisartsTelefoon && (
                <p>
                  <span className="text-muted-foreground">{t("contactCard.telefoonHuisarts")}</span>{" "}
                  {data.huisartsTelefoon}
                </p>
              )}
              {data.huisartsEmail && (
                <p>
                  <span className="text-muted-foreground">{t("contactCard.emailHuisarts")}</span>{" "}
                  {data.huisartsEmail}
                </p>
              )}
              {data.vertegenwoordigerNaam && (
                <p>
                  <span className="text-muted-foreground">
                    {t("contactCard.vertegenwoordiger")}
                  </span>{" "}
                  {data.vertegenwoordigerNaam} ({data.vertegenwoordigerRelatie})
                </p>
              )}
              {data.vertegenwoordigerTelefoon && (
                <p>
                  <span className="text-muted-foreground">{t("contactCard.telVertegenwoordiger")}</span>{" "}
                  {data.vertegenwoordigerTelefoon}
                </p>
              )}
              {data.vertegenwoordigerEmail && (
                <p>
                  <span className="text-muted-foreground">{t("contactCard.emailVertegenwoordiger")}</span>{" "}
                  {data.vertegenwoordigerEmail}
                </p>
              )}
              {data.vertegenwoordigerAdres && (
                <p>
                  <span className="text-muted-foreground">{t("contactCard.adresVertegenwoordiger")}</span>{" "}
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
                <CardTitle>{t("clausulesCard.titel")}</CardTitle>
                <Button variant="ghost" size="sm" onClick={openEdit}><Pencil className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">{t("clausulesCard.dementieclausule")}</span> {data.dementieClausule ? t("ja") : t("nee")}</p>
              {data.dementieClausuleToelichting && (
                <p><span className="text-muted-foreground">{t("clausulesCard.toelichting")}</span> {data.dementieClausuleToelichting}</p>
              )}
              {data.behandelVerbod && (
                <p><span className="text-muted-foreground">{t("clausulesCard.behandelverbod")}</span> {data.behandelVerbod}</p>
              )}
            </CardContent>
          </Card>
        )}
      </>
      )}

      {/* P-S5: Direct-edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogHeader>
          <DialogTitle>{t("editDialog.titel")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {editError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2">
              <p className="text-sm text-red-800">{editError}</p>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="wil-euthanasie" checked={editForm.wilEuthanasie} onChange={(e) => setEditForm((f) => ({ ...f, wilEuthanasie: e.target.checked }))} className="h-4 w-4 rounded border-border" />
            <Label htmlFor="wil-euthanasie">{t("editDialog.wilEuthanasie")}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.datumOndertekening")}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.situatiebeschrijving")}</Label>
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.aanvullendeWensen")}</Label>
          </div>
          <hr />
          <p className="text-sm font-medium text-muted-foreground">{t("editDialog.sectieHuisarts")}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.naamHuisarts")}</Label>
              <Input value={editForm.huisarts} onChange={(e) => setEditForm((f) => ({ ...f, huisarts: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.praktijk")}</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.telefoon")}</Label>
              <Input value={editForm.huisartsTelefoon} onChange={(e) => setEditForm((f) => ({ ...f, huisartsTelefoon: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.email")}</Label>
            </div>
          </div>
          <hr />
          <p className="text-sm font-medium text-muted-foreground">{t("editDialog.sectieVertegenwoordiger")}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.naam")}</Label>
              <Input value={editForm.vertegenwoordigerNaam} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerNaam: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.relatie")}</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.telefoon")}</Label>
              <Input value={editForm.vertegenwoordigerTelefoon} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerTelefoon: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.email")}</Label>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-2">
              <Label>{t("editDialog.adres")}</Label>
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.postcode")}</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.woonplaats")}</Label>
          </div>
          <hr />
          <p className="text-sm font-medium text-muted-foreground">{t("editDialog.sectieClausules")}</p>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="dementie-clausule" checked={editForm.dementieClausule} onChange={(e) => setEditForm((f) => ({ ...f, dementieClausule: e.target.checked }))} className="h-4 w-4 rounded border-border" />
            <Label htmlFor="dementie-clausule">{t("editDialog.dementieclausule")}</Label>
          </div>
          {editForm.dementieClausule && (
            <div className="space-y-2">
              <Label>{t("editDialog.toelichtingDementie")}</Label>
            </div>
          )}
          <div className="space-y-2">
            <Label>{t("editDialog.behandelverbod")}</Label>
            <Textarea value={editForm.behandelVerbod} onChange={(e) => setEditForm((f) => ({ ...f, behandelVerbod: e.target.value }))} rows={2} placeholder={t("editDialog.behandelverbodPlaceholder")} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditOpen(false)}>{t("annuleren")}</Button>
          <Button onClick={saveEdit}>{t("opslaan")}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
