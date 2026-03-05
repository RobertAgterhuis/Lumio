"use client";


import { PageTransition } from "@/components/ui/transitions";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Phone, Plus, Pencil, Trash2, Share2, Download, Upload } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { NoodkaartQR } from "@/components/noodcontacten/NoodkaartQR";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";
import { PageBanner } from "@/components/layout/PageBanner";
import { PersonSelect } from "@/components/PersonSelect";
import { useNoodcontacten, ROLLEN, ROL_KEYS, PROFESSIONELE_ROLLEN, ROL_CATEGORIE, TABS } from "@/components/noodcontacten/useNoodcontacten";
import type { Noodcontact, TabValue } from "@/components/noodcontacten/useNoodcontacten";
import { HelpButton } from "@/components/help/HelpButton";
import { HelpEmptyState } from "@/components/help/HelpEmptyState";

export default function NoodcontactenPage() {
  const t = useTranslations("noodcontacten");
  const tEnum = useTranslations("enums");

  const {
    contacten,
    filteredContacten,
    activeTab,
    setActiveTab,
    loading,
    gedeeldCount,
    dialogOpen,
    setDialogOpen,
    editId,
    form,
    setForm,
    saving,
    error,
    confirmDeleteId,
    setConfirmDeleteId,
    openDialog,
    save,
    deleteContact,
    exportGedeeld,
    importGedeeld,
  } = useNoodcontacten();

  if (loading) return <PageSkeleton />;

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display flex items-center gap-3">
          <LumioIcon name="noodcontacten" size="lg" className="text-primary" />
          {t("titel")}
          <HelpButton />
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("beschrijving")}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <VoorbeeldDialog domein="noodcontacten" />
        <SectieNotitie sectie="noodcontacten" />
      </div>

      <DomainStatusBanner domein="noodcontacten" />

      <PageBanner id="noodcontacten-tip" variant="info">
        {t.rich("tip", { strong: (chunks) => <strong>{chunks}</strong> })}
      </PageBanner>

      {/* Gedeelde noodcontacten */}
      <div className="rounded-lg border border-accent bg-accent/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-accent">
              <Share2 className="h-4 w-4 inline mr-1" />
              {t("gedeeldeContacten", { aantal: gedeeldCount })}
            </p>
            <p className="text-xs text-accent mt-1">
              {t("gedeeldeBeschrijving")}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <Button size="sm" variant="outline" onClick={exportGedeeld} disabled={gedeeldCount === 0}>
              <Download className="h-3 w-3 mr-1" /> {t("exporteer")}
            </Button>
            <Button size="sm" variant="outline" onClick={importGedeeld}>
              <Upload className="h-3 w-3 mr-1" /> {t("importeer")}
            </Button>
          </div>
        </div>
      </div>

      {contacten.length === 0 ? (
        <HelpEmptyState
          chapterSlug="noodcontacten"
          domeinLabel={t("domeinLabel")}
          addLabel={t("toevoegen")}
          onAdd={() => openDialog()}
        />
      ) : (
      <Card className="overflow-hidden">
        <div className="bg-primary-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
          <Phone className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-primary leading-tight">{t("contactenTitel", { aantal: contacten.length })}</h2>
          </div>
          <div className="flex gap-2">
            <NoodkaartQR contacten={contacten} />
            <Button size="sm" onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <div className="px-4 pt-3 pb-2 border-b border-black/5 dark:border-white/10">
            <TabsList>
              {TABS.map((tab) => {
                const count = tab === "alle"
                  ? contacten.length
                  : contacten.filter((c) => (ROL_CATEGORIE[c.rol] ?? "persoonlijk") === tab).length;
                if (tab !== "alle" && count === 0) return null;
                return (
                  <TabsTrigger key={tab} value={tab}>
                    {t(`tabs.${tab}`)}
                    {count > 0 && <Badge className="ml-1 text-xs">{count}</Badge>}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          <TabsContent value={activeTab}>
            <CardContent className="pt-5">
              <div className="space-y-2">
                {filteredContacten.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{c.naam}</p>
                      <Badge variant="outline">{tEnum(`noodcontactRol.${ROL_KEYS[c.rol] ?? "overig"}`)}</Badge>
                      {c.isGedeeld && (
                        <Badge variant="secondary" className="text-xs">
                          <Share2 className="h-3 w-3 mr-0.5" /> {t("gedeeld")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.relatie}
                      {c.telefoon && (
                        <> — <a href={`tel:${c.telefoon}`} className="hover:underline">{c.telefoon}</a></>
                      )}
                      {c.email && ` — ${c.email}`}
                    </p>
                    {c.instructies && (
                      <p className="text-xs text-muted-foreground italic">
                        {c.instructies}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {c.telefoon && (
                      <a
                        href={`tel:${c.telefoon}`}
                        className="text-xs text-muted-foreground flex items-center gap-1 hover:underline"
                      >
                        <Phone className="h-3 w-3" /> {c.telefoon}
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(c)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDeleteId(c.id)}
                    >
                      <Trash2 className="h-3 w-3 text-danger" />
                    </Button>
                  </div>
                </div>
              ))}
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
      )}

      {error && (
        <div className="rounded-lg border border-danger bg-danger-100 p-3">
          <p className="text-sm text-danger whitespace-pre-line">{error}</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>
            {editId ? t("dialog.bewerken") : t("dialog.toevoegen")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("dialog.naam")}</Label>
              {/* M2-1: PersonSelect allows picking from existing erfgenamen to pre-fill contact fields */}
              <PersonSelect
                source="erfgenamen"
                value={form.naam}
                onChange={(v) => setForm((f) => ({ ...f, naam: v }))}
                onPersonSelect={(p) =>
                  setForm((f) => ({
                    ...f,
                    naam: p.naam,
                    relatie: p.relatie || f.relatie,
                    telefoon: p.telefoon || f.telefoon,
                    email: p.email || f.email,
                    adres: p.adres || f.adres,
                    postcode: p.postcode || f.postcode,
                    woonplaats: p.woonplaats || f.woonplaats,
                  }))
                }
                onClear={() =>
                  setForm((f) => ({
                    ...f,
                    naam: "",
                    relatie: "",
                    telefoon: "",
                    email: "",
                    adres: "",
                    postcode: "",
                    woonplaats: "",
                  }))
                }
                placeholder={t("dialog.naamPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dialog.relatie")}</Label>
              <Input
                value={form.relatie}
                onChange={(e) => setForm((f) => ({ ...f, relatie: e.target.value }))}
                placeholder={t("dialog.relatiePlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("dialog.rol")}</Label>
            <Select
              value={form.rol}
              onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
            >
              <option value="">{t("dialog.rolSelecteer")}</option>
              {ROLLEN.map((rol) => (
                <option key={rol} value={rol}>{tEnum(`noodcontactRol.${ROL_KEYS[rol] ?? "overig"}`)}</option>
              ))}
            </Select>
          </div>
          {PROFESSIONELE_ROLLEN.has(form.rol) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("dialog.bedrijfsNaam")}</Label>
                <Input
                  value={form.bedrijfsNaam}
                  onChange={(e) => setForm((f) => ({ ...f, bedrijfsNaam: e.target.value }))}
                  placeholder={t("dialog.bedrijfsNaamPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dialog.functie")}</Label>
                <Input
                  value={form.functie}
                  onChange={(e) => setForm((f) => ({ ...f, functie: e.target.value }))}
                  placeholder={t("dialog.functiePlaceholder")}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("dialog.telefoon")}</Label>
              <Input
                value={form.telefoon}
                onChange={(e) => setForm((f) => ({ ...f, telefoon: e.target.value }))}
                placeholder={t("dialog.telefoonPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dialog.email")}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder={t("dialog.emailPlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("dialog.adres")}</Label>
            <Input
              value={form.adres}
              onChange={(e) => setForm((f) => ({ ...f, adres: e.target.value }))}
              placeholder={t("dialog.adresPlaceholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("dialog.postcode")}</Label>
              <Input
                value={form.postcode}
                onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
                placeholder={t("dialog.postcodePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("dialog.woonplaats")}</Label>
              <Input
                value={form.woonplaats}
                onChange={(e) => setForm((f) => ({ ...f, woonplaats: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("dialog.instructies")}</Label>
            <Textarea
              value={form.instructies}
              onChange={(e) => setForm((f) => ({ ...f, instructies: e.target.value }))}
              rows={3}
              placeholder={t("dialog.instructiesPlaceholder")}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isGedeeld"
              checked={form.isGedeeld}
              onChange={(e) => setForm((f) => ({ ...f, isGedeeld: e.target.checked }))}
            />
            <Label htmlFor="isGedeeld" className="text-sm font-normal cursor-pointer">
              {t("dialog.isGedeeld")}
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            {t("dialog.annuleren")}
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? t("dialog.opslaanBezig") : t("dialog.opslaan")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
      >
        <DialogHeader>
          <DialogTitle>{t("verwijderenBevestigTitel")}</DialogTitle>
        </DialogHeader>
        <p className="py-4 text-sm text-muted-foreground">
          {t("verwijderenBevestig")}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
            {t("dialog.annuleren")}
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (confirmDeleteId) {
                await deleteContact(confirmDeleteId);
                setConfirmDeleteId(null);
              }
            }}
          >
            {t("verwijderen")}
          </Button>
        </DialogFooter>
      </Dialog>
    </PageTransition>
  );
}
