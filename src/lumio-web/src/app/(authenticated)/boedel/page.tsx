"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet, Building2, Shield, CreditCard, Plus } from "lucide-react";
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
        <h1 className="text-3xl font-bold">{t("titel")}</h1>
        <p className="text-muted-foreground mt-1">{t("beschrijving")}</p>
        <VoorbeeldDialog domein="boedel" />
        <SectieNotitie sectie="boedel" />
      </div>

      <DomainStatusBanner domein="boedel" />

      {/* Tip */}
      <div className="rounded-lg border border-warning bg-warning-100 dark:bg-warning/20 p-4">
        <p className="text-sm text-warning">
          <strong>{t("tipLabel")}</strong> {t("tip")}
        </p>
      </div>

      {/* Samenvatting */}
      {samenvatting && <SamenvattingCard samenvatting={samenvatting} />}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="bezittingen">
            <Wallet className="h-4 w-4 mr-1" /> {t("tabs.bezittingen", { aantal: bezittingen.length })}
          </TabsTrigger>
          <TabsTrigger value="rekeningen">
            <Building2 className="h-4 w-4 mr-1" /> {t("tabs.rekeningen", { aantal: rekeningen.length })}
          </TabsTrigger>
          <TabsTrigger value="verzekeringen">
            <Shield className="h-4 w-4 mr-1" /> {t("tabs.verzekeringen", { aantal: verzekeringen.length })}
          </TabsTrigger>
          <TabsTrigger value="schulden">
            <CreditCard className="h-4 w-4 mr-1" /> {t("tabs.schulden", { aantal: schulden.length })}
          </TabsTrigger>
        </TabsList>

        {/* Bezittingen Tab */}
        <TabsContent value="bezittingen">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("bezittingen.titel")}</CardTitle>
              <Button size="sm" onClick={() => openBezit()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </CardHeader>
            <CardContent>
              {bezittingen.length === 0 ? (
                <EmptyState
                  icon={Building2}
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("rekeningen.titel")}</CardTitle>
              <Button size="sm" onClick={() => openRekening()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </CardHeader>
            <CardContent>
              {rekeningen.length === 0 ? (
                <EmptyState
                  icon={Wallet}
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("verzekeringen.titel")}</CardTitle>
              <Button size="sm" onClick={() => openVerzekering()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </CardHeader>
            <CardContent>
              {verzekeringen.length === 0 ? (
                <EmptyState
                  icon={Shield}
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("schulden.titel")}</CardTitle>
              <Button size="sm" onClick={() => openSchuld()}>
                <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
              </Button>
            </CardHeader>
            <CardContent>
              {schulden.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
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
