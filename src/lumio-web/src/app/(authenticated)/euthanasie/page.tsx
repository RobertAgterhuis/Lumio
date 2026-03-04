"use client";


import { PageTransition } from "@/components/ui/transitions";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import { useDomainQuery } from "@/hooks";
import { toast } from "@/stores/toastStore";
import { useTranslations } from "next-intl";
import { Pencil, ScrollText, Stethoscope, ShieldCheck } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";
import Link from "next/link";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { PersonSelect } from "@/components/PersonSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";
import { PageBanner } from "@/components/layout/PageBanner";
import { HelpButton } from "@/components/help/HelpButton";
import { ConfirmJuridischDialog } from "@/components/security/ConfirmJuridischDialog";

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
  vertegenwoordiger2Naam?: string;
  vertegenwoordiger2Relatie?: string;
  vertegenwoordiger2Telefoon?: string;
  vertegenwoordiger2Email?: string;
  situatieOpties?: string;
  situatieNotitie?: string;
}

export default function EuthanasiePage() {
  const t = useTranslations("euthanasie");
  const tf = useTranslations("feedback");

  // React Query for data fetching
  const { data, isLoading: loading, refetch } = useDomainQuery<Wilsverklaring | null>("euthanasie");

  // P-S5: Direct-edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    wilEuthanasie: false, situatieBeschrijving: "", aanvullendeWensen: "",
    datumOndertekening: "", huisarts: "", huisartsPraktijk: "", huisartsTelefoon: "",
    huisartsEmail: "", vertegenwoordigerNaam: "", vertegenwoordigerRelatie: "",
    vertegenwoordigerTelefoon: "", vertegenwoordigerEmail: "", vertegenwoordigerAdres: "",
    vertegenwoordigerPostcode: "", vertegenwoordigerWoonplaats: "",
    dementieClausule: false, dementieClausuleToelichting: "", behandelVerbod: "",
    vertegenwoordiger2Naam: "", vertegenwoordiger2Relatie: "", vertegenwoordiger2Telefoon: "",
    vertegenwoordiger2Email: "", situatieOpties: "", situatieNotitie: "",
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

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
      vertegenwoordiger2Naam: data.vertegenwoordiger2Naam ?? "",
      vertegenwoordiger2Relatie: data.vertegenwoordiger2Relatie ?? "",
      vertegenwoordiger2Telefoon: data.vertegenwoordiger2Telefoon ?? "",
      vertegenwoordiger2Email: data.vertegenwoordiger2Email ?? "",
      situatieOpties: data.situatieOpties ?? "",
      situatieNotitie: data.situatieNotitie ?? "",
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
        vertegenwoordiger2Naam: editForm.vertegenwoordiger2Naam || null,
        vertegenwoordiger2Relatie: editForm.vertegenwoordiger2Relatie || null,
        vertegenwoordiger2Telefoon: editForm.vertegenwoordiger2Telefoon || null,
        vertegenwoordiger2Email: editForm.vertegenwoordiger2Email || null,
        situatieOpties: editForm.situatieOpties || null,
        situatieNotitie: editForm.situatieNotitie || null,
      };
      const updated = await api.put<Wilsverklaring>("/api/euthanasie", payload);
      refetch();
      setEditOpen(false);
      toast.success(tf("opgeslagen"));
    } catch (err) {
      setEditError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <LumioIcon name="wilsverklaring" size="lg" className="text-primary" />
            <span className="text-primary">{t("titel")}</span>
            <HelpButton />
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("beschrijving")}
          </p>
          <VoorbeeldDialog domein="euthanasie" />
          <SectieNotitie sectie="euthanasie" />
        </div>
        <Link href="/euthanasie/wizard">
          <Button>
            <LumioIcon name="wilsverklaring" size="sm" className="mr-2" />
            {data ? t("bewerken") : t("wizardStarten")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DomainStatusBanner domein="euthanasie" />
        <PageBanner id="euthanasie-disclaimer" variant="secure" inline>
          {t.rich("disclaimer", { strong: (chunks) => <strong>{chunks}</strong> })}
        </PageBanner>
      </div>

      {!data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LumioIcon name="wilsverklaring" size="xl" className="text-muted-foreground mb-4" />
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
          <Card className="overflow-hidden">
            <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <ScrollText className="h-5 w-5 text-sage shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-sage leading-tight">{t("wilsverklaringCard.titel")}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={openEdit}><Pencil className="h-4 w-4 text-sage" /></Button>
            </div>
            <CardContent className="pt-5 space-y-2 text-sm">
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
          <Card className="overflow-hidden">
            <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <Stethoscope className="h-5 w-5 text-sage shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-sage leading-tight">{t("contactCard.titel")}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={openEdit}><Pencil className="h-4 w-4 text-sage" /></Button>
            </div>
            <CardContent className="pt-5 space-y-2 text-sm">
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
          <Card className="overflow-hidden">
            <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <ShieldCheck className="h-5 w-5 text-sage shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-sage leading-tight">{t("clausulesCard.titel")}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={openEdit}><Pencil className="h-4 w-4 text-sage" /></Button>
            </div>
            <CardContent className="pt-5 space-y-2 text-sm">
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
            <div className="rounded-lg border border-danger bg-danger-100 dark:bg-danger/20 p-2">
              <p className="text-sm text-danger">{editError}</p>
            </div>
          )}
          <Checkbox id="wil-euthanasie" checked={editForm.wilEuthanasie} onChange={(e) => setEditForm((f) => ({ ...f, wilEuthanasie: e.target.checked }))} label={t("editDialog.wilEuthanasie")} />
          <div className="space-y-2">
            <Label>{t("editDialog.datumOndertekening")}</Label>
            <Input type="date" value={editForm.datumOndertekening} onChange={(e) => setEditForm((f) => ({ ...f, datumOndertekening: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.situatiebeschrijving")}</Label>
            <Textarea value={editForm.situatieBeschrijving} onChange={(e) => setEditForm((f) => ({ ...f, situatieBeschrijving: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.aanvullendeWensen")}</Label>
            <Textarea value={editForm.aanvullendeWensen} onChange={(e) => setEditForm((f) => ({ ...f, aanvullendeWensen: e.target.value }))} rows={2} />
          </div>
          <hr />
          <p className="text-sm font-medium text-muted-foreground">{t("editDialog.sectieHuisarts")}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.naamHuisarts")}</Label>
              <PersonSelect
                value={editForm.huisarts}
                onChange={(v) => setEditForm((f) => ({ ...f, huisarts: v }))}
                onPersonSelect={(p) => setEditForm((f) => ({ ...f, huisarts: p.naam, huisartsTelefoon: p.telefoon ?? f.huisartsTelefoon, huisartsEmail: p.email ?? f.huisartsEmail }))}
                source={{ noodcontactRol: "Huisarts" }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.praktijk")}</Label>
              <Input value={editForm.huisartsPraktijk} onChange={(e) => setEditForm((f) => ({ ...f, huisartsPraktijk: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.telefoon")}</Label>
              <Input value={editForm.huisartsTelefoon} onChange={(e) => setEditForm((f) => ({ ...f, huisartsTelefoon: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.email")}</Label>
              <Input type="email" value={editForm.huisartsEmail} onChange={(e) => setEditForm((f) => ({ ...f, huisartsEmail: e.target.value }))} />
            </div>
          </div>
          <hr />
          <p className="text-sm font-medium text-muted-foreground">{t("editDialog.sectieVertegenwoordiger")}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.naam")}</Label>
              <PersonSelect
                value={editForm.vertegenwoordigerNaam}
                onChange={(v) => setEditForm((f) => ({ ...f, vertegenwoordigerNaam: v }))}
                onPersonSelect={(p) => setEditForm((f) => ({ ...f, vertegenwoordigerNaam: p.naam, vertegenwoordigerRelatie: p.relatie ?? f.vertegenwoordigerRelatie, vertegenwoordigerTelefoon: p.telefoon ?? f.vertegenwoordigerTelefoon, vertegenwoordigerEmail: p.email ?? f.vertegenwoordigerEmail, vertegenwoordigerAdres: p.adres ?? f.vertegenwoordigerAdres, vertegenwoordigerPostcode: p.postcode ?? f.vertegenwoordigerPostcode, vertegenwoordigerWoonplaats: p.woonplaats ?? f.vertegenwoordigerWoonplaats }))}
                source="both"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.relatie")}</Label>
              <Input value={editForm.vertegenwoordigerRelatie} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerRelatie: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.telefoon")}</Label>
              <Input value={editForm.vertegenwoordigerTelefoon} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerTelefoon: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.email")}</Label>
              <Input type="email" value={editForm.vertegenwoordigerEmail} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerEmail: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-2">
              <Label>{t("editDialog.adres")}</Label>
              <Input value={editForm.vertegenwoordigerAdres} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerAdres: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.postcode")}</Label>
              <Input value={editForm.vertegenwoordigerPostcode} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerPostcode: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.woonplaats")}</Label>
            <Input value={editForm.vertegenwoordigerWoonplaats} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordigerWoonplaats: e.target.value }))} />
          </div>
          <hr />
          <p className="text-sm font-medium text-muted-foreground">{t("editDialog.sectieVertegenwoordiger2")}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.naam")}</Label>
              <PersonSelect
                value={editForm.vertegenwoordiger2Naam}
                onChange={(v) => setEditForm((f) => ({ ...f, vertegenwoordiger2Naam: v }))}
                onPersonSelect={(p) => setEditForm((f) => ({ ...f, vertegenwoordiger2Naam: p.naam, vertegenwoordiger2Relatie: p.relatie ?? f.vertegenwoordiger2Relatie, vertegenwoordiger2Telefoon: p.telefoon ?? f.vertegenwoordiger2Telefoon, vertegenwoordiger2Email: p.email ?? f.vertegenwoordiger2Email }))}
                source="both"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.relatie")}</Label>
              <Input value={editForm.vertegenwoordiger2Relatie} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordiger2Relatie: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>{t("editDialog.telefoon")}</Label>
              <Input value={editForm.vertegenwoordiger2Telefoon} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordiger2Telefoon: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("editDialog.email")}</Label>
              <Input type="email" value={editForm.vertegenwoordiger2Email} onChange={(e) => setEditForm((f) => ({ ...f, vertegenwoordiger2Email: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.situatieOpties")}</Label>
            <Textarea value={editForm.situatieOpties} onChange={(e) => setEditForm((f) => ({ ...f, situatieOpties: e.target.value }))} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.situatieNotitie")}</Label>
            <Textarea value={editForm.situatieNotitie} onChange={(e) => setEditForm((f) => ({ ...f, situatieNotitie: e.target.value }))} rows={3} />
          </div>
          <hr />
          <p className="text-sm font-medium text-muted-foreground">{t("editDialog.sectieClausules")}</p>
          <Checkbox id="dementie-clausule" checked={editForm.dementieClausule} onChange={(e) => setEditForm((f) => ({ ...f, dementieClausule: e.target.checked }))} label={t("editDialog.dementieclausule")} />
          {editForm.dementieClausule && (
            <div className="space-y-2">
              <Label>{t("editDialog.toelichtingDementie")}</Label>
              <Textarea value={editForm.dementieClausuleToelichting} onChange={(e) => setEditForm((f) => ({ ...f, dementieClausuleToelichting: e.target.value }))} rows={2} />
            </div>
          )}
          <div className="space-y-2">
            <Label>{t("editDialog.behandelverbod")}</Label>
            <Textarea value={editForm.behandelVerbod} onChange={(e) => setEditForm((f) => ({ ...f, behandelVerbod: e.target.value }))} rows={2} placeholder={t("editDialog.behandelverbodPlaceholder")} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditOpen(false)}>{t("annuleren")}</Button>
          <Button onClick={() => setConfirmSaveOpen(true)}>{t("opslaan")}</Button>
        </DialogFooter>
      </Dialog>

      {/* SP-ACC1-006: SC 3.3.4 confirmation gate before legally significant save */}
      <ConfirmJuridischDialog
        open={confirmSaveOpen}
        onOpenChange={setConfirmSaveOpen}
        title={t("editDialog.bevestigenTitel")}
        description={t("editDialog.bevestigenBeschrijving")}
        onConfirm={saveEdit}
      />
    </PageTransition>
  );
}
