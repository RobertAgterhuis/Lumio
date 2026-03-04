"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Home, Landmark, ShieldCheck, TrendingDown } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useBoedel,
  SamenvattingCard,
  BezitItem,
  RekeningItem,
  VerzekeringItem,
  SchuldItem,
  BezitDialog,
  RekeningDialog,
  VerzekeringDialog,
  SchuldDialog,
} from "@/components/boedel";
import { HelpButton } from "@/components/help/HelpButton";

export default function BoedelPage() {
  const t = useTranslations("boedel");
  const tEmpty = useTranslations("legeStaten");

  const {
    tab,
    setTab,
    bezittingen,
    rekeningen,
    verzekeringen,
    schulden,
    samenvatting,
    loading,
    dialogKind,
    editId,
    saving,
    bezitForm,
    setBezitForm,
    rekeningForm,
    setRekeningForm,
    verzekerForm,
    setVerzekerForm,
    schuldForm,
    setSchuldForm,
    openBezit,
    openRekening,
    openVerzekering,
    openSchuld,
    closeDialog,
    saveBezit,
    saveRekening,
    saveVerzekering,
    saveSchuld,
    deleteItem,
  } = useBoedel();

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
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LumioIcon name="boedel" size="lg" className="text-primary" />
          {t("titel")}
          <HelpButton />
        </h1>
        <p className="text-muted-foreground mt-1">{t("beschrijving")}</p>
        <VoorbeeldDialog domein="boedel" />
        <SectieNotitie sectie="boedel" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DomainStatusBanner domein="boedel" />
        {/* Tip */}
        <div className="rounded-lg border border-warning bg-warning-100 dark:bg-warning/20 p-4 flex items-center">
          <p className="text-sm text-warning">
            <strong>{t("tipLabel")}</strong> {t("tip")}
          </p>
        </div>
      </div>

      {/* Samenvatting */}
      {samenvatting && <SamenvattingCard samenvatting={samenvatting} />}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="bezittingen">
            <LumioIcon name="boedel" size="sm" className="mr-1" /> {t("tabs.bezittingen", { aantal: bezittingen.length })}
          </TabsTrigger>
          <TabsTrigger value="rekeningen">
            <LumioIcon name="boedel" size="sm" className="mr-1" /> {t("tabs.rekeningen", { aantal: rekeningen.length })}
          </TabsTrigger>
          <TabsTrigger value="verzekeringen">
            <LumioIcon name="boedel" size="sm" className="mr-1" /> {t("tabs.verzekeringen", { aantal: verzekeringen.length })}
          </TabsTrigger>
          <TabsTrigger value="schulden">
            <LumioIcon name="boedel" size="sm" className="mr-1" /> {t("tabs.schulden", { aantal: schulden.length })}
          </TabsTrigger>
        </TabsList>

        {/* Bezittingen Tab */}
        <TabsContent value="bezittingen">
          <Card className="overflow-hidden">
            <div className="bg-success-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <Home className="h-5 w-5 text-success shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-success leading-tight">{t("bezittingen.titel")}</h2>
              </div>
              <Button size="sm" onClick={() => openBezit()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </div>
            <CardContent className="pt-5">
              {bezittingen.length === 0 ? (
                <EmptyState
                  lumioIcon="boedel"
                  title={tEmpty("bezittingen.titel")}
                  description={tEmpty("bezittingen.beschrijving")}
                  ctaLabel={tEmpty("bezittingen.cta")}
                  onCtaClick={() => openBezit()}
                />
              ) : (
                <div className="space-y-2">
                  {bezittingen.map((b) => (
                    <BezitItem key={b.id} bezit={b} onEdit={openBezit} onDelete={(id) => deleteItem("bezittingen", id)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rekeningen Tab */}
        <TabsContent value="rekeningen">
          <Card className="overflow-hidden">
            <div className="bg-success-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <Landmark className="h-5 w-5 text-success shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-success leading-tight">{t("rekeningen.titel")}</h2>
              </div>
              <Button size="sm" onClick={() => openRekening()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </div>
            <CardContent className="pt-5">
              {rekeningen.length === 0 ? (
                <EmptyState
                  lumioIcon="boedel"
                  title={tEmpty("rekeningen.titel")}
                  description={tEmpty("rekeningen.beschrijving")}
                  ctaLabel={tEmpty("rekeningen.cta")}
                  onCtaClick={() => openRekening()}
                />
              ) : (
                <div className="space-y-2">
                  {rekeningen.map((r) => (
                    <RekeningItem key={r.id} rekening={r} onEdit={openRekening} onDelete={(id) => deleteItem("bankrekeningen", id)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verzekeringen Tab */}
        <TabsContent value="verzekeringen">
          <Card className="overflow-hidden">
            <div className="bg-success-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <ShieldCheck className="h-5 w-5 text-success shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-success leading-tight">{t("verzekeringen.titel")}</h2>
              </div>
              <Button size="sm" onClick={() => openVerzekering()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </div>
            <CardContent className="pt-5">
              {verzekeringen.length === 0 ? (
                <EmptyState
                  lumioIcon="boedel"
                  title={tEmpty("verzekeringen.titel")}
                  description={tEmpty("verzekeringen.beschrijving")}
                  ctaLabel={tEmpty("verzekeringen.cta")}
                  onCtaClick={() => openVerzekering()}
                />
              ) : (
                <div className="space-y-2">
                  {verzekeringen.map((v) => (
                    <VerzekeringItem key={v.id} verzekering={v} onEdit={openVerzekering} onDelete={(id) => deleteItem("verzekeringen", id)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schulden Tab */}
        <TabsContent value="schulden">
          <Card className="overflow-hidden">
            <div className="bg-success-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
              <TrendingDown className="h-5 w-5 text-success shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-success leading-tight">{t("schulden.titel")}</h2>
              </div>
              <Button size="sm" onClick={() => openSchuld()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </div>
            <CardContent className="pt-5">
              {schulden.length === 0 ? (
                <EmptyState
                  lumioIcon="boedel"
                  title={tEmpty("schulden.titel")}
                  description={tEmpty("schulden.beschrijving")}
                  ctaLabel={tEmpty("schulden.cta")}
                  onCtaClick={() => openSchuld()}
                />
              ) : (
                <div className="space-y-2">
                  {schulden.map((s) => (
                    <SchuldItem key={s.id} schuld={s} onEdit={openSchuld} onDelete={(id) => deleteItem("schulden", id)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BezitDialog
        open={dialogKind === "bezit"}
        onOpenChange={(open) => !open && closeDialog()}
        editId={editId}
        form={bezitForm}
        onFormChange={setBezitForm}
        onSave={saveBezit}
        saving={saving}
      />
      <RekeningDialog
        open={dialogKind === "rekening"}
        onOpenChange={(open) => !open && closeDialog()}
        editId={editId}
        form={rekeningForm}
        onFormChange={setRekeningForm}
        onSave={saveRekening}
        saving={saving}
      />
      <VerzekeringDialog
        open={dialogKind === "verzekering"}
        onOpenChange={(open) => !open && closeDialog()}
        editId={editId}
        form={verzekerForm}
        onFormChange={setVerzekerForm}
        onSave={saveVerzekering}
        saving={saving}
      />
      <SchuldDialog
        open={dialogKind === "schuld"}
        onOpenChange={(open) => !open && closeDialog()}
        editId={editId}
        form={schuldForm}
        onFormChange={setSchuldForm}
        onSave={saveSchuld}
        saving={saving}
      />
    </div>
  );
}
