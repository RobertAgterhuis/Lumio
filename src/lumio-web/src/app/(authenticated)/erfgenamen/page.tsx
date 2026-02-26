"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { ErfbelastingCalculator } from "@/components/erfgenamen/ErfbelastingCalculator";
import { KeyRound, Plus, Users } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";
import {
  ErfgenaamDialog,
  ErfgenaamItem,
  ShamirDialog,
  ToewijzingDialog,
  useErfgenamen,
  type Erfgenaam,
} from "@/components/erfgenamen";
import { useAuthStore } from "@/stores/authStore";
import { HelpButton } from "@/components/help/HelpButton";
import { HelpEmptyState } from "@/components/help/HelpEmptyState";

function displayName(e: Erfgenaam): string {
  return e.tussenvoegsel
    ? `${e.voornaam} ${e.tussenvoegsel} ${e.achternaam}`
    : `${e.voornaam} ${e.achternaam}`;
}

export default function ErfgenamenPage() {
  const t = useTranslations("erfgenamen");
  const te = useTranslations("enums");
  const tf = useTranslations("feedback");
  const { isReadOnly } = useAuthStore();

  const hookTranslations = {
    aangemaakt: tf("aangemaakt"),
    verwijderd: tf("verwijderd"),
    opslaanMislukt: t("opslaanMislukt"),
    verwijderenMislukt: t("verwijderenMislukt"),
    exportMislukt: t("exportMislukt"),
    sleuteldelenMislukt: t("sleuteldelenMislukt"),
    toewijzingOpslaanMislukt: t("toewijzingOpslaanMislukt"),
    toewijzingVerwijderenMislukt: t("toewijzingVerwijderenMislukt"),
    noodcontactAangemaakt: t("noodcontactAangemaakt"),
  };

  const state = useErfgenamen(hookTranslations);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t("laden")}</p>
      </div>
    );
  }

  const itemTranslations = {
    relatie: (key: string) => te(`relatie.${key}`),
    entityType: (key: string) => te(`entityType.${key}`),
    geenBezittingen: t("geenBezittingen"),
    toewijzenKnop: t("toewijzenKnop"),
    toegewezenBezittingen: t("toegewezenBezittingen"),
    bezitToewijzen: t("bezitToewijzen"),
    pdfDownloaden: t("pdfDownloaden"),
    deelOverzicht: t("deelOverzicht"),
  };

  const dialogTranslations = {
    dialogTitel: (isEdit: boolean) => (isEdit ? t("dialog.bewerken") : t("dialog.toevoegen")),
    voornaam: t("dialog.voornaam"),
    achternaam: t("dialog.achternaam"),
    tussenvoegsel: t("dialog.tussenvoegsel"),
    tussenvoegselPlaceholder: t("dialog.tussenvoegselPlaceholder"),
    relatie: t("dialog.relatie"),
    relatieSelecteer: te("relatie.selecteer"),
    email: t("dialog.email"),
    telefoon: t("dialog.telefoon"),
    geboortedatum: t("dialog.geboortedatum"),
    bsn: t("dialog.bsn"),
    bsnPlaceholder: t("dialog.bsnPlaceholder"),
    bsnTooltip: t("dialog.bsnTooltip"),
    adres: t("dialog.adres"),
    adresPlaceholder: t("dialog.adresPlaceholder"),
    postcode: t("dialog.postcode"),
    postcodePlaceholder: t("dialog.postcodePlaceholder"),
    woonplaats: t("dialog.woonplaats"),
    legitimatie: t("dialog.legitimatie"),
    documentnummer: t("dialog.documentnummer"),
    datumAfgifte: t("dialog.datumAfgifte"),
    geldigTot: t("dialog.geldigTot"),
    annuleren: t("dialog.annuleren"),
    opslaan: t("dialog.opslaan"),
    opslaanBezig: t("dialog.opslaanBezig"),
    legitimatieLabel: (key: string) => te(`legitimatie.${key}`),
    relatieLabel: (key: string) => te(`relatie.${key}`),
    alsNoodcontact: t("dialog.alsNoodcontact"),
    alsNoodcontactTooltip: t("dialog.alsNoodcontactTooltip"),
  };

  const toewijzingTranslations = {
    titel: t("toewijzingDialog.titel"),
    beschrijving: t("toewijzingDialog.beschrijving"),
    erfgenaam: t("toewijzingDialog.erfgenaam"),
    erfgenaamSelecteer: t("toewijzingDialog.erfgenaamSelecteer"),
    typeBezit: t("toewijzingDialog.typeBezit"),
    alleTypes: t("toewijzingDialog.alleTypes"),
    bezit: t("toewijzingDialog.bezit"),
    bezitSelecteer: t("toewijzingDialog.bezitSelecteer"),
    instructies: t("toewijzingDialog.instructies"),
    instructiesPlaceholder: t("toewijzingDialog.instructiesPlaceholder"),
    annuleren: t("toewijzingDialog.annuleren"),
    opslaanBezig: t("toewijzingDialog.opslaanBezig"),
    toewijzen: t("toewijzingDialog.toewijzen"),
    entityType: (key: string) => te(`entityType.${key}`),
  };

  const shamirTranslations = {
    titel: t("shamir.titel"),
    beschrijving: (aantal: number) => t("shamir.beschrijving", { aantal }),
    waarschuwing: t("shamir.waarschuwing"),
    waarschuwingTekst: t("shamir.waarschuwingTekst"),
    wachtwoord: t("shamir.wachtwoord"),
    wachtwoordPlaceholder: t("shamir.wachtwoordPlaceholder"),
    drempel: t("shamir.drempel"),
    drempelTooltip: t("shamir.drempelTooltip"),
    drempelOptie: (n: number, totaal: number) => t("shamir.drempelOptie", { n, totaal }),
    delenInfo: ({ aantal, drempel }: { aantal: number; drempel: string }) =>
      t.rich("shamir.delenInfo", {
        aantal,
        drempel,
        strong: (chunks) => <strong>{chunks}</strong>,
      }),
    annuleren: t("shamir.annuleren"),
    genererenBezig: t("shamir.genererenBezig"),
    genereren: t("shamir.genereren"),
    succes: t("shamir.succes"),
    succesTekst: (aantal: number, drempel: number) => t("shamir.succesTekst", { aantal, drempel }),
    deel: (index: number) => t("shamir.deel", { index }),
    erfgenaamFallback: (nummer: number) => t("shamir.erfgenaamFallback", { nummer }),
    gekopieerd: t("shamir.gekopieerd"),
    kopieren: t("shamir.kopieren"),
    sluiten: t("shamir.sluiten"),
  };

  const pendingErfgenaam = state.pendingDeleteId
    ? state.erfgenamen.find((e) => e.id === state.pendingDeleteId)
    : null;
  const pendingToewijzingenCount = state.pendingDeleteId
    ? state.getToewijzingenVoorErfgenaam(state.pendingDeleteId).length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LumioIcon name="erfgenamen" size="lg" className="text-primary" />
            {t("titel")}
            <HelpButton />
          </h1>
          <p className="text-muted-foreground mt-1">{t("beschrijving")}</p>
          <VoorbeeldDialog domein="erfgenamen" />
          <SectieNotitie sectie="erfgenamen" />
        </div>
        <div className="flex gap-2">
          {state.erfgenamen.length >= 2 && !isReadOnly && (
            <Button variant="outline" onClick={() => state.setShamirDialogOpen(true)}>
              <KeyRound className="h-4 w-4 mr-2" /> {t("noodcodesVerdelen")}
            </Button>
          )}
          <Button onClick={() => state.openDialog()}>
            <Plus className="h-4 w-4 mr-2" /> {t("toevoegen")}
          </Button>
        </div>
      </div>

      <DomainStatusBanner domein="erfgenamen" />

      <div className="rounded-lg border border-secure bg-secure-100 p-4">
        <p className="text-sm text-secure">
          <strong>{t("noodcodesInfoLabel")}</strong> {t("noodcodesInfo")}
        </p>
      </div>

      {state.erfgenamen.length > 0 && <ErfbelastingCalculator />}

      {state.error && (
        <div className="rounded-lg border border-danger bg-danger-100 p-3">
          <p className="text-sm text-danger">{state.error}</p>
        </div>
      )}

      {state.erfgenamen.length === 0 ? (
        <HelpEmptyState
          chapterSlug="erfgenamen"
          domeinLabel="erfgenamen"
          addLabel={t("toevoegen")}
          onAdd={() => state.openDialog()}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-primary leading-tight">{t("aantal", { aantal: state.erfgenamen.length })}</h3>
            </div>
          </div>
          <CardContent className="pt-5">
            <div className="space-y-3">
              {state.erfgenamen.map((e) => (
                <ErfgenaamItem
                  key={e.id}
                  erfgenaam={e}
                  toewijzingen={state.getToewijzingenVoorErfgenaam(e.id)}
                  isExpanded={state.expandedErfgenaam === e.id}
                  displayName={displayName}
                  onToggleExpand={() =>
                    state.setExpandedErfgenaam(state.expandedErfgenaam === e.id ? null : e.id)
                  }
                  onEdit={() => state.openDialog(e)}
                  onDelete={() => state.handleDelete(e.id)}
                  onExport={() => state.handleExportErfgenaam(e.id, e.voornaam)}
                  onShare={() => state.handleDeelMetErfgenaam(e.id, e.voornaam)}
                  onAssignAsset={() => state.openToewijzingDialog(e.id)}
                  onDeleteToewijzing={state.handleDeleteToewijzing}
                  translations={itemTranslations}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ErfgenaamDialog
        open={state.dialogOpen}
        onOpenChange={state.setDialogOpen}
        form={state.form}
        onFormChange={state.setForm}
        isEditing={!!state.editId}
        saving={state.saving}
        onSave={state.handleSave}
        translations={dialogTranslations}
      />

      <ToewijzingDialog
        open={state.toewijzingDialogOpen}
        onOpenChange={state.setToewijzingDialogOpen}
        form={state.toewijzingForm}
        onFormChange={state.setToewijzingForm}
        erfgenamen={state.erfgenamen}
        filteredAssets={state.filteredAssets}
        saving={state.toewijzingSaving}
        onSave={state.handleSaveToewijzing}
        displayName={displayName}
        translations={toewijzingTranslations}
      />

      <ShamirDialog
        open={state.shamirDialogOpen}
        onClose={state.closeShamirDialog}
        erfgenamen={state.erfgenamen}
        password={state.shamirPassword}
        onPasswordChange={state.setShamirPassword}
        threshold={state.shamirThreshold}
        onThresholdChange={state.setShamirThreshold}
        generating={state.shamirGenerating}
        onGenerate={state.handleGenerateShares}
        generatedShares={state.generatedShares}
        copiedIndex={state.copiedIndex}
        onCopyShare={state.copyShare}
        displayName={displayName}
        translations={shamirTranslations}
      />

      {/* S8-05: Delete confirmation dialog */}
      <Dialog open={!!state.pendingDeleteId} onOpenChange={(open) => { if (!open) state.cancelDelete(); }}>
        <DialogHeader>
          <DialogTitle>{t("verwijderBevestiging.titel")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {pendingErfgenaam && t("verwijderBevestiging.vraag", { naam: displayName(pendingErfgenaam) })}
        </p>
        {pendingToewijzingenCount > 0 && (
          <p className="text-sm text-warning mt-1">
            {t("verwijderBevestiging.bezittingenWaarschuwing", { aantal: pendingToewijzingenCount })}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={state.cancelDelete}>
            {t("verwijderBevestiging.annuleren")}
          </Button>
          <Button variant="destructive" onClick={state.confirmDelete}>
            {t("verwijderBevestiging.verwijderen")}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
