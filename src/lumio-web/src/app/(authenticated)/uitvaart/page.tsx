"use client";


import { PageTransition } from "@/components/ui/transitions";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Plus, Pencil, Users, Flower2, Music, MapPin, ListOrdered } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";
import {
  useUitvaart,
  CeremonieDetailItem,
  CeremonieDetailDialog,
  GenodigdeItem,
  GenodigdeDialog,
  UitvaartEditDialog,
} from "@/components/uitvaart";
import { HelpButton } from "@/components/help/HelpButton";

export default function UitvaartPage() {
  const t = useTranslations("uitvaart");
  const {
    data,
    details,
    genodigden,
    loading,
    uitvaartEditOpen,
    setUitvaartEditOpen,
    uitvaartEditForm,
    setUitvaartEditForm,
    uitvaartEditError,
    openUitvaartEdit,
    saveUitvaartEdit,
    locatieEditOpen,
    setLocatieEditOpen,
    locatieEditForm,
    setLocatieEditForm,
    locatieEditError,
    openLocatieEdit,
    saveLocatieEdit,
    detailDialogOpen,
    setDetailDialogOpen,
    editDetailId,
    detailForm,
    setDetailForm,
    detailError,
    openDetailDialog,
    saveDetail,
    deleteDetail,
    genDialogOpen,
    setGenDialogOpen,
    editGenId,
    genForm,
    setGenForm,
    genError,
    openGenDialog,
    saveGen,
    deleteGen,
  } = useUitvaart();

  if (loading) return <PageSkeleton />;

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <LumioIcon name="uitvaart" size="lg" className="text-primary" />
            {t("titel")}
            <HelpButton />
          </h1>
          <p className="text-muted-foreground mt-1">{t("beschrijving")}</p>
        </div>
        <Link href="/uitvaart/wizard">
          <Button>
            <LumioIcon name="uitvaart" size="sm" className="mr-2" />
            {data ? t("bewerken") : t("wizardStarten")}
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <VoorbeeldDialog domein="uitvaart" />
        <SectieNotitie sectie="uitvaart" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DomainStatusBanner domein="uitvaart" />
        <div className="rounded-lg border border-muted bg-muted/30 p-4 flex items-center">
          <p className="text-sm text-muted-foreground">
            {t.rich("disclaimer", { strong: (chunks) => <strong>{chunks}</strong> })}
          </p>
        </div>
      </div>

      {!data ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LumioIcon name="uitvaart" size="xl" className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("geenWensen")}</p>
            <Link href="/uitvaart/wizard">
              <Button className="mt-4">{t("wizardStarten")}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
                <LumioIcon name="uitvaart" className="h-5 w-5 text-sage shrink-0" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-sage leading-tight">{t("uitvaartCard.titel")}</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={openUitvaartEdit}>
                  <Pencil className="h-4 w-4 text-sage" />
                </Button>
              </div>
              <CardContent className="pt-5 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("uitvaartCard.type")}</span>{" "}
                  <strong>{data.voorkeurType}</strong>
                </p>
                {data.begraafplaats && (
                  <p>
                    <span className="text-muted-foreground">{t("uitvaartCard.begraafplaats")}</span>{" "}
                    {data.begraafplaats}
                  </p>
                )}
                {data.uitvaartOndernemerContactId && (
                  <p>
                    <span className="text-muted-foreground">{t("uitvaartCard.ondernemer")}</span>{" "}
                    ✓ {t("common.selected")}
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

            <Card className="overflow-hidden">
              <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
                <Music className="h-5 w-5 text-sage shrink-0" />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-sage leading-tight">{t("ceremonieCard.titel")}</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={openUitvaartEdit}>
                  <Pencil className="h-4 w-4 text-sage" />
                </Button>
              </div>
              <CardContent className="pt-5 space-y-2 text-sm">
                {data.ceremonieSoort && (
                  <p>
                    <span className="text-muted-foreground">{t("ceremonieCard.soort")}</span>{" "}
                    {data.ceremonieSoort}
                    {data.ceremonieLocatie && ` — ${data.ceremonieLocatie}`}
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
                    <span className="text-muted-foreground">{t("ceremonieCard.rouwkaart")}</span>{" "}
                    {data.rouwkaartTekst}
                  </p>
                )}
                {data.rouwadvertentieTekst && (
                  <p>
                    <span className="text-muted-foreground">{t("ceremonieCard.rouwadvertentie")}</span>{" "}
                    {data.rouwadvertentieTekst}
                  </p>
                )}
                {data.condoleance && (
                  <p>
                    <span className="text-muted-foreground">{t("ceremonieCard.condoleance")}</span>{" "}
                    {data.condoleance}
                  </p>
                )}
                {data.overigeWensen && (
                  <p>
                    <span className="text-muted-foreground">{t("ceremonieCard.aanvullend")}</span>{" "}
                    {data.overigeWensen}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Location Card */}
          <Card className="overflow-hidden">
            <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <MapPin className="h-5 w-5 text-sage shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-sage leading-tight">{t("locatieCard.titel")}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={openLocatieEdit}>
                <Pencil className="h-4 w-4 text-sage" />
              </Button>
            </div>
            <CardContent className="pt-5 space-y-2 text-sm">
              {!data.voorkeurBegraafplaatsNaam && !data.voorkeurCrematoriumnaam && !data.voorkeurAulaNaam ? (
                <p className="text-muted-foreground">{t("locatieCard.locatieNietIngevuld")}</p>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Ceremony Details */}
          <Card className="overflow-hidden">
            <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <ListOrdered className="h-5 w-5 text-sage shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-sage leading-tight">{t("verloop.titel")}</h2>
              </div>
              <Button size="sm" onClick={() => openDetailDialog()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </div>
            <CardContent className="pt-5">
              {detailError && (
                <Alert variant="danger" className="mb-3">
                  <AlertDescription>{detailError}</AlertDescription>
                </Alert>
              )}
              {details.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("verloop.geenOnderdelen")}</p>
              ) : (
                <div className="space-y-2">
                  {details.map((d) => (
                    <CeremonieDetailItem
                      key={d.id}
                      detail={d}
                      onEdit={openDetailDialog}
                      onDelete={deleteDetail}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guests */}
          <Card className="overflow-hidden">
            <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <Users className="h-5 w-5 text-sage shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-sage leading-tight">{t("genodigden.titel")}</h2>
              </div>
              <Badge variant="secondary">{genodigden.length}</Badge>
              <Button size="sm" onClick={() => openGenDialog()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </div>
            <CardContent className="pt-5">
              {genodigden.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("genodigden.geenGenodigden")}
                </p>
              ) : (
                <div className="space-y-2">
                  {genodigden.map((g) => (
                    <GenodigdeItem
                      key={g.id}
                      genodigde={g}
                      onEdit={openGenDialog}
                      onDelete={deleteGen}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Dialogs */}
      <CeremonieDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        form={detailForm}
        onFormChange={setDetailForm}
        onSave={saveDetail}
        isEdit={!!editDetailId}
      />

      <GenodigdeDialog
        open={genDialogOpen}
        onOpenChange={setGenDialogOpen}
        form={genForm}
        onFormChange={setGenForm}
        onSave={saveGen}
        isEdit={!!editGenId}
        error={genError}
      />

      <UitvaartEditDialog
        open={uitvaartEditOpen}
        onOpenChange={setUitvaartEditOpen}
        form={uitvaartEditForm}
        onFormChange={setUitvaartEditForm}
        onSave={saveUitvaartEdit}
        error={uitvaartEditError}
      />

      {/* Locatie Edit Dialog */}
      <Dialog open={locatieEditOpen} onOpenChange={setLocatieEditOpen}>
          <DialogHeader>
            <DialogTitle>{t("locatieCard.dialog.titel")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {locatieEditError && (
              <Alert variant="danger">
                <AlertDescription>{locatieEditError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>{t("locatieCard.dialog.begraafplaatsNaam")}</Label>
              <Input
                value={locatieEditForm.voorkeurBegraafplaatsNaam}
                onChange={(e) => setLocatieEditForm((f) => ({ ...f, voorkeurBegraafplaatsNaam: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("locatieCard.dialog.begraafplaatsAdres")}</Label>
              <Input
                value={locatieEditForm.voorkeurBegraafplaatsAdres}
                onChange={(e) => setLocatieEditForm((f) => ({ ...f, voorkeurBegraafplaatsAdres: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("locatieCard.dialog.crematoriumNaam")}</Label>
              <Input
                value={locatieEditForm.voorkeurCrematoriumnaam}
                onChange={(e) => setLocatieEditForm((f) => ({ ...f, voorkeurCrematoriumnaam: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("locatieCard.dialog.crematoriumAdres")}</Label>
              <Input
                value={locatieEditForm.voorkeurCrematoriumAdres}
                onChange={(e) => setLocatieEditForm((f) => ({ ...f, voorkeurCrematoriumAdres: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("locatieCard.dialog.aulaNaam")}</Label>
              <Input
                value={locatieEditForm.voorkeurAulaNaam}
                onChange={(e) => setLocatieEditForm((f) => ({ ...f, voorkeurAulaNaam: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("locatieCard.dialog.aulaAdres")}</Label>
              <Input
                value={locatieEditForm.voorkeurAulaAdres}
                onChange={(e) => setLocatieEditForm((f) => ({ ...f, voorkeurAulaAdres: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocatieEditOpen(false)}>
              {t("locatieCard.dialog.annuleren")}
            </Button>
            <Button onClick={saveLocatieEdit}>
              {t("locatieCard.dialog.opslaan")}
            </Button>
          </DialogFooter>
      </Dialog>
    </PageTransition>
  );
}
