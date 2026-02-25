"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Plus, Pencil, Users } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t("laden")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("titel")}</h1>
          <p className="text-muted-foreground mt-1">{t("beschrijving")}</p>
          <VoorbeeldDialog domein="uitvaart" />
          <SectieNotitie sectie="uitvaart" />
        </div>
        <Link href="/uitvaart/wizard">
          <Button>
            <LumioIcon name="uitvaart" size="sm" className="mr-2" />
            {data ? t("bewerken") : t("wizardStarten")}
          </Button>
        </Link>
      </div>

      <DomainStatusBanner domein="uitvaart" />

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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("uitvaartCard.titel")}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={openUitvaartEdit}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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
                {data.uitvaartOndernemer && (
                  <p>
                    <span className="text-muted-foreground">{t("uitvaartCard.ondernemer")}</span>{" "}
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
                  <Button variant="ghost" size="sm" onClick={openUitvaartEdit}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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

          {/* Ceremony Details */}
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
    </div>
  );
}
