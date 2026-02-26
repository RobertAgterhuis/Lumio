"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useNoodcontacten, ROLLEN, ROL_KEYS } from "@/components/noodcontacten/useNoodcontacten";
import type { Noodcontact } from "@/components/noodcontacten/useNoodcontacten";
import { HelpButton } from "@/components/help/HelpButton";
import { HelpEmptyState } from "@/components/help/HelpEmptyState";

export default function NoodcontactenPage() {
  const t = useTranslations("noodcontacten");
  const tEnum = useTranslations("enums");

  const {
    contacten,
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

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t("laden")}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LumioIcon name="noodcontacten" size="lg" className="text-primary" />
          {t("titel")}
          <HelpButton />
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("beschrijving")}
        </p>
        <VoorbeeldDialog domein="noodcontacten" />
        <SectieNotitie sectie="noodcontacten" />
      </div>

      <DomainStatusBanner domein="noodcontacten" />

      <div className="rounded-lg border border-info bg-info-100 p-4">
        <p className="text-sm text-info">{t.rich("tip", { strong: (chunks) => <strong>{chunks}</strong> })}</p>
      </div>

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
            <h3 className="text-sm font-semibold text-primary leading-tight">{t("contactenTitel", { aantal: contacten.length })}</h3>
          </div>
          <div className="flex gap-2">
            <NoodkaartQR contacten={contacten} />
            <Button size="sm" onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
            </Button>
          </div>
        </div>
        <CardContent className="pt-5">
          <div className="space-y-2">
              {contacten.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md border p-3"
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
                      {c.telefoon && ` — ${c.telefoon}`}
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
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {c.telefoon}
                      </span>
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
      </Card>
      )}

      {error && (
        <div className="rounded-lg border border-danger bg-danger-100 p-3">
          <p className="text-sm text-danger">{error}</p>
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
              <Input
                value={form.naam}
                onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))}
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
    </div>
  );
}
