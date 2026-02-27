"use client";

import { Building2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWerkgever } from "./useWerkgever";

// ── Component ──────────────────────────────────────────────────────────────────

export function WerkgeverCard() {
  const t = useTranslations("eigenaar.werkgever");
  const {
    werkgever,
    loading,
    form,
    setForm,
    dialogOpen,
    saving,
    deleting,
    editId,
    startEdit,
    cancelEdit,
    save,
    deleteWerkgever,
  } = useWerkgever();

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      {/* ── Card ── */}
      <Card className="overflow-hidden">
        <div className="bg-primary-100 px-4 py-3 flex items-center justify-between border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-primary leading-tight">{t("titel")}</h3>
              <p className="text-xs text-primary/70 leading-tight mt-0.5">{t("beschrijving")}</p>
            </div>
          </div>
          {werkgever ? (
            <Button size="sm" variant="outline" onClick={() => startEdit(werkgever)}>
              <Pencil className="h-4 w-4 mr-1" />
              {t("bewerken")}
            </Button>
          ) : (
            !loading && (
              <Button size="sm" onClick={() => startEdit()}>
                <Plus className="h-4 w-4 mr-1" />
                {t("toevoegen")}
              </Button>
            )
          )}
        </div>

        <CardContent className="pt-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("laden")}</span>
            </div>
          ) : werkgever ? (
            <div className="space-y-4">
              {/* Summary display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <InfoRow label={t("organisatie.bedrijfsNaam")} value={werkgever.bedrijfsNaam} />
                {werkgever.isZzp ? (
                  <>
                    {werkgever.kvkNummer && (
                      <InfoRow label={t("dienstverband.kvkNummer")} value={werkgever.kvkNummer} />
                    )}
                    {werkgever.website && (
                      <InfoRow label={t("organisatie.website")} value={werkgever.website} />
                    )}
                    <InfoRow label={t("dienstverband.isZzpLabel")} value={t("dienstverband.isZzpJa")} />
                  </>
                ) : (
                  <>
                    {werkgever.functietitel && (
                      <InfoRow label={t("dienstverband.functietitel")} value={werkgever.functietitel} />
                    )}
                    {werkgever.afdeling && (
                      <InfoRow label={t("dienstverband.afdeling")} value={werkgever.afdeling} />
                    )}
                    {werkgever.startdatumDienstverband && (
                      <InfoRow
                        label={t("dienstverband.startdatum")}
                        value={new Date(werkgever.startdatumDienstverband).toLocaleDateString("nl-NL")}
                      />
                    )}
                    {werkgever.telefoonHoofdkantoor && (
                      <InfoRow label={t("organisatie.telefoon")} value={werkgever.telefoonHoofdkantoor} />
                    )}
                  </>
                )}
                {werkgever.pensioenfondNaam && (
                  <InfoRow label={t("pensioenfonds.naam")} value={werkgever.pensioenfondNaam} />
                )}
                {werkgever.hrContactNaam && (
                  <InfoRow label={t("hrContact.naam")} value={werkgever.hrContactNaam} />
                )}
                {werkgever.leidinggevendeNaam && (
                  <InfoRow label={t("leidinggevende.naam")} value={werkgever.leidinggevendeNaam} />
                )}
              </div>
              {/* Delete */}
              <div className="flex justify-end pt-2 border-t mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    deleteWerkgever(werkgever.id, t("verwijderd"), t("verwijderenMislukt"))
                  }
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {t("verwijderen")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("leeg")}</p>
          )}
        </CardContent>
      </Card>

      {/* ── Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={cancelEdit}>
        <DialogHeader>
          <DialogTitle>
            {editId ? t("dialog.bewerken") : t("dialog.toevoegen")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-1">

          {/* ── Organisatie ── */}
          <Section label={t("organisatie.titel")}>
            <div className="space-y-2">
              <Label>{t("organisatie.bedrijfsNaamVerplicht")}</Label>
              <Input
                value={form.bedrijfsNaam}
                onChange={(e) => update("bedrijfsNaam", e.target.value)}
                placeholder={t("organisatie.bedrijfsNaamPlaceholder")}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("organisatie.adres")}</Label>
                <Input
                  value={form.adres}
                  onChange={(e) => update("adres", e.target.value)}
                  placeholder={t("organisatie.adresPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("organisatie.postcode")}</Label>
                <Input
                  value={form.postcode}
                  onChange={(e) => update("postcode", e.target.value)}
                  placeholder={t("organisatie.postcodePlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("organisatie.vestigingsplaats")}</Label>
              <Input
                value={form.vestigingsplaats}
                onChange={(e) => update("vestigingsplaats", e.target.value)}
                placeholder={t("organisatie.vestigingsplaatsPlaceholder")}
              />
            </div>
          </Section>

          {/* ── Dienstverband ── */}
          <Section label={t("dienstverband.titel")}>
            <Checkbox
              label={t("dienstverband.isZzp")}
              checked={form.isZzp}
              onChange={(e) => update("isZzp", e.target.checked)}
            />

            {form.isZzp ? (
              <>
                <Alert variant="warning">
                  <AlertDescription>{t("zzpMelding")}</AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("dienstverband.kvkNummer")}</Label>
                    <Input
                      value={form.kvkNummer}
                      onChange={(e) => update("kvkNummer", e.target.value)}
                      placeholder={t("dienstverband.kvkNummerPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("organisatie.website")}</Label>
                    <Input
                      value={form.website}
                      onChange={(e) => update("website", e.target.value)}
                      placeholder={t("organisatie.websitePlaceholder")}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("dienstverband.functietitel")}</Label>
                    <Input
                      value={form.functietitel}
                      onChange={(e) => update("functietitel", e.target.value)}
                      placeholder={t("dienstverband.functietitelPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("dienstverband.afdeling")}</Label>
                    <Input
                      value={form.afdeling}
                      onChange={(e) => update("afdeling", e.target.value)}
                      placeholder={t("dienstverband.afdelingPlaceholder")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("dienstverband.startdatum")}</Label>
                    <Input
                      type="date"
                      value={form.startdatumDienstverband}
                      onChange={(e) => update("startdatumDienstverband", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("organisatie.telefoon")}</Label>
                    <Input
                      value={form.telefoonHoofdkantoor}
                      onChange={(e) => update("telefoonHoofdkantoor", e.target.value)}
                      placeholder={t("organisatie.telefoonPlaceholder")}
                    />
                  </div>
                </div>
              </>
            )}
          </Section>

          {/* ── Pensioenfonds ── */}
          <Section label={t("pensioenfonds.titel")}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("pensioenfonds.naam")}</Label>
                <Input
                  value={form.pensioenfondNaam}
                  onChange={(e) => update("pensioenfondNaam", e.target.value)}
                  placeholder={t("pensioenfonds.naamPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("pensioenfonds.telefoon")}</Label>
                <Input
                  value={form.pensioenfondTelefoon}
                  onChange={(e) => update("pensioenfondTelefoon", e.target.value)}
                  placeholder={t("pensioenfonds.telefoonPlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("pensioenfonds.email")}</Label>
              <Input
                type="email"
                value={form.pensioenfondEmail}
                onChange={(e) => update("pensioenfondEmail", e.target.value)}
                placeholder={t("pensioenfonds.emailPlaceholder")}
              />
            </div>
          </Section>

          {/* ── HR Contact ── */}
          <Section label={t("hrContact.titel")}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("hrContact.naam")}</Label>
                <Input
                  value={form.hrContactNaam}
                  onChange={(e) => update("hrContactNaam", e.target.value)}
                  placeholder={t("hrContact.naamPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("hrContact.telefoon")}</Label>
                <Input
                  value={form.hrContactTelefoon}
                  onChange={(e) => update("hrContactTelefoon", e.target.value)}
                  placeholder={t("hrContact.telefoonPlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("hrContact.email")}</Label>
              <Input
                type="email"
                value={form.hrContactEmail}
                onChange={(e) => update("hrContactEmail", e.target.value)}
                placeholder={t("hrContact.emailPlaceholder")}
              />
            </div>
          </Section>

          {/* ── Leidinggevende ── */}
          <Section label={t("leidinggevende.titel")}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("leidinggevende.naam")}</Label>
                <Input
                  value={form.leidinggevendeNaam}
                  onChange={(e) => update("leidinggevendeNaam", e.target.value)}
                  placeholder={t("leidinggevende.naamPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("leidinggevende.telefoon")}</Label>
                <Input
                  value={form.leidinggevendeTelefoon}
                  onChange={(e) => update("leidinggevendeTelefoon", e.target.value)}
                  placeholder={t("leidinggevende.telefoonPlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("leidinggevende.email")}</Label>
              <Input
                type="email"
                value={form.leidinggevendeEmail}
                onChange={(e) => update("leidinggevendeEmail", e.target.value)}
                placeholder={t("leidinggevende.emailPlaceholder")}
              />
            </div>
          </Section>

          {/* ── Notities ── */}
          <div className="space-y-2">
            <Label>{t("notities")}</Label>
            <Textarea
              value={form.notities}
              onChange={(e) => update("notities", e.target.value)}
              placeholder={t("notitiesPlaceholder")}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={cancelEdit} disabled={saving}>
            {t("dialog.annuleren")}
          </Button>
          <Button
            onClick={() => save(t("dialog.opgeslagen"), t("dialog.opslaanMislukt"))}
            disabled={saving || !form.bedrijfsNaam}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("dialog.opslaan")}
              </>
            ) : (
              t("dialog.opslaan")
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground border-b pb-1">{label}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
