"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Plus, Pencil, History, GitCompareArrows, Scale, Users, UserCheck } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";
import { PageBanner } from "@/components/layout/PageBanner";
import { useTranslations } from "next-intl";
import {
  useTestament,
  JuridischeCheck,
  BegunstigdeItem,
  ExecuteurItem,
  SnapshotItem,
  BegunstigdeDialog,
  ExecuteurDialog,
  TestamentEditDialog,
  SnapshotDialog,
  VergelijkingDialog,
  LegitimairePortieAlert,
} from "@/components/testament";
import { HelpButton } from "@/components/help/HelpButton";
import {
  RelatedModules,
  type RelatedLink,
} from "@/components/layout/RelatedModules";

/** GAP-UX-009: cross-links shown on the Testament page */
const TESTAMENT_RELATED: RelatedLink[] = [
  {
    href: "/erfgenamen",
    labelKey: "erfgenamen",
    reason: "Koppel erfgenamen aan uw testamentaire beschikkingen.",
    icon: "erfgenamen",
  },
  {
    href: "/uitvaart",
    labelKey: "uitvaartwensen",
    reason: "Leg ook uw uitvaartwensen vast naast uw testament.",
    icon: "uitvaart",
  },
];

export default function TestamentPage() {
  const t = useTranslations("testament");
  const {
    testament,
    begunstigden,
    executeurs,
    legitiemaireCheck,
    snapshots,
    loading,
    // Executeur dialog
    execDialogOpen,
    setExecDialogOpen,
    editExecId,
    execForm,
    setExecForm,
    openExecDialog,
    saveExec,
    deleteExec,
    // Begunstigde dialog
    begDialogOpen,
    setBegDialogOpen,
    editBegId,
    begForm,
    setBegForm,
    openBegDialog,
    saveBeg,
    deleteBeg,
    // Testament edit
    testEditOpen,
    setTestEditOpen,
    testEditForm,
    setTestEditForm,
    testEditError,
    openTestEdit,
    saveTestEdit,
    // Snapshot
    snapDialogOpen,
    setSnapDialogOpen,
    snapNotitie,
    setSnapNotitie,
    snapError,
    openSnapDialog,
    createSnapshot,
    deleteSnapshot,
    // Vergelijking
    vergelijking,
    vergelijkOpen,
    setVergelijkOpen,
    vergelijkIds,
    setVergelijkIds,
    loadVergelijking,
  } = useTestament();

  if (loading) {
    return <div className="text-muted-foreground">{t("laden")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LumioIcon name="testament" size="lg" className="text-primary" />
            {t("titel")}
            <HelpButton />
          </h1>
          <p className="text-muted-foreground mt-1">{t("beschrijving")}</p>
          <VoorbeeldDialog domein="testament" />
          <SectieNotitie sectie="testament" />
          <JuridischeCheck />
        </div>
        <Link href="/testament/wizard">
          <Button>
            {testament ? (
              <><Pencil className="h-4 w-4 mr-2" /> {t("bewerken")}</>
            ) : (
              <><Plus className="h-4 w-4 mr-2" /> {t("wizardStarten")}</>
            )}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DomainStatusBanner domein="testament" />
        <PageBanner id="testament-notaris-disclaimer" variant="secure" inline>
          {t.rich("disclaimer", { strong: (chunks) => <strong>{chunks}</strong> })}
        </PageBanner>
      </div>

      {testament ? (
        <>
          <LegitimairePortieAlert check={legitiemaireCheck} />

          <div className="grid gap-4 md:grid-cols-2">
            {/* Notaris card */}
            <Card className="overflow-hidden">
              <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
                <Scale className="h-5 w-5 text-sage shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-sage leading-tight">{t("notaris.titel")}</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={openTestEdit}>
                  <Pencil className="h-4 w-4 text-sage" />
                </Button>
              </div>
              <CardContent className="pt-5 space-y-2 text-sm">
                <div><span className="font-medium">{t("notaris.type")}</span> {testament.testamentType || "—"}</div>
                <div><span className="font-medium">{t("notaris.notaris")}</span> {testament.notarisNaam || "—"}</div>
                <div><span className="font-medium">{t("notaris.kantoor")}</span> {testament.notarisKantoor || "—"}</div>
                {testament.notarisTelefoon && <div><span className="font-medium">{t("notaris.telefoon")}</span> {testament.notarisTelefoon}</div>}
                {testament.notarisEmail && <div><span className="font-medium">{t("notaris.email")}</span> {testament.notarisEmail}</div>}
                {testament.notarisAdres && (
                  <div>
                    <span className="font-medium">{t("notaris.adres")}</span> {testament.notarisAdres}
                    {testament.notarisPostcode ? `, ${testament.notarisPostcode}` : ""}
                    {testament.notarisPlaats ? ` ${testament.notarisPlaats}` : ""}
                  </div>
                )}
                <div><span className="font-medium">{t("notaris.datum")}</span> {testament.datumTestament || "—"}</div>
                <div><span className="font-medium">{t("notaris.ctrNummer")}</span> {testament.ctr_Nummer || "—"}</div>
                {testament.testamentLocatie && <div><span className="font-medium">{t("notaris.locatie")}</span> {testament.testamentLocatie}</div>}
                <div><span className="font-medium">{t("notaris.uitsluitingsclausule")}</span> {testament.uitsluitingsClausule ? t("ja") : t("nee")}</div>
                {testament.legaten && <div><span className="font-medium">{t("notaris.legaten")}</span> {testament.legaten}</div>}
                {testament.algemeneWensen && <div><span className="font-medium">{t("notaris.algemeneWensen")}</span> {testament.algemeneWensen}</div>}
                {testament.bijzondereBepalingen && <div><span className="font-medium">{t("notaris.bijzondereBepalingen")}</span> {testament.bijzondereBepalingen}</div>}
              </CardContent>
            </Card>

            {/* Begunstigden card */}
            <Card className="overflow-hidden">
              <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
                <Users className="h-5 w-5 text-sage shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-sage leading-tight">{t("begunstigden.titel")}</h3>
                </div>
                <HelpTooltip tekst={t("begunstigden.tooltip")} />
                <Badge variant="secondary">{begunstigden.length}</Badge>
                <Button size="sm" onClick={() => openBegDialog()}>
                  <Plus className="h-4 w-4 mr-1" /> {t("begunstigden.toevoegen")}
                </Button>
              </div>
              <CardContent className="pt-5">
                {begunstigden.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("begunstigden.geenBegunstigden")}</p>
                ) : (
                  <ul className="space-y-2">
                    {begunstigden.map((b) => (
                      <BegunstigdeItem
                        key={b.id}
                        begunstigde={b}
                        onEdit={openBegDialog}
                        onDelete={deleteBeg}
                      />
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Executeurs card */}
          <Card className="overflow-hidden">
            <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <UserCheck className="h-5 w-5 text-sage shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-sage leading-tight">{t("executeurs.titel")}</h3>
              </div>
              <HelpTooltip tekst={t("executeurs.tooltip")} />
              <Button size="sm" onClick={() => openExecDialog()}>
                <Plus className="h-4 w-4 mr-1" /> {t("executeurs.toevoegen")}
              </Button>
            </div>
            <CardContent className="pt-5">
              {executeurs.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("executeurs.geenExecuteurs")}</p>
              ) : (
                <ul className="space-y-2">
                  {executeurs.map((e) => (
                    <ExecuteurItem
                      key={e.id}
                      executeur={e}
                      onEdit={openExecDialog}
                      onDelete={deleteExec}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Versiegeschiedenis card */}
          <Card className="overflow-hidden">
            <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <History className="h-5 w-5 text-sage shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-sage leading-tight">{t("versies.titel")}</h3>
              </div>
              <Badge variant="secondary">{snapshots.length}</Badge>
              <Button size="sm" onClick={openSnapDialog}>
                <Plus className="h-4 w-4 mr-1" /> {t("versies.snapshot")}
              </Button>
            </div>
            <CardContent className="pt-5">
              {snapError && (
                <div className="rounded-lg border border-danger bg-danger-100 p-2 mb-3">
                  <p className="text-sm text-danger">{snapError}</p>
                </div>
              )}
              {snapshots.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("versies.geenVersies")}</p>
              ) : (
                <>
                  <ul className="space-y-2 mb-4">
                    {snapshots.map((s) => (
                      <SnapshotItem key={s.id} snapshot={s} onDelete={deleteSnapshot} />
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
            <LumioIcon name="testament" size="xl" className="text-muted-foreground mb-4" />
            <CardDescription className="text-center mb-4">{t("geenTestament")}</CardDescription>
            <Link href="/testament/wizard">
              <Button>{t("wizardStarten")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Related modules — GAP-UX-009 */}
      <RelatedModules links={TESTAMENT_RELATED} />

      {/* Dialogs */}
      <ExecuteurDialog
        open={execDialogOpen}
        onOpenChange={setExecDialogOpen}
        editId={editExecId}
        form={execForm}
        onFormChange={setExecForm}
        onSave={saveExec}
      />

      <BegunstigdeDialog
        open={begDialogOpen}
        onOpenChange={setBegDialogOpen}
        editId={editBegId}
        form={begForm}
        onFormChange={setBegForm}
        onSave={saveBeg}
      />

      <TestamentEditDialog
        open={testEditOpen}
        onOpenChange={setTestEditOpen}
        form={testEditForm}
        onFormChange={setTestEditForm}
        onSave={saveTestEdit}
        error={testEditError}
      />

      <SnapshotDialog
        open={snapDialogOpen}
        onOpenChange={setSnapDialogOpen}
        notitie={snapNotitie}
        onNotitieChange={setSnapNotitie}
        onSave={createSnapshot}
        error={snapError}
      />

      <VergelijkingDialog
        open={vergelijkOpen}
        onOpenChange={setVergelijkOpen}
        vergelijking={vergelijking}
      />
    </div>
  );
}
