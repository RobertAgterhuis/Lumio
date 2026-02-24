"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { useDomainQuery } from "@/hooks";
import { toast } from "@/stores/toastStore";
import { Phone, Plus, Pencil, Trash2, Share2, Download, Upload } from "lucide-react";
import { VoorbeeldDialog } from "@/components/VoorbeeldDialog";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { NoodkaartQR } from "@/components/noodcontacten/NoodkaartQR";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";

interface Noodcontact {
  id: string;
  naam: string;
  relatie: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
  rol: string;
  instructies?: string;
  isGedeeld: boolean;
}

const ROLLEN = [
  "Vertrouwenspersoon",
  "Huisarts",
  "Notaris",
  "Uitvaartondernemer",
  "Advocaat",
  "Financieel adviseur",
  "Overig",
];

const ROL_KEYS: Record<string, string> = {
  "Vertrouwenspersoon": "vertrouwenspersoon",
  "Huisarts": "huisarts",
  "Notaris": "notaris",
  "Uitvaartondernemer": "uitvaartondernemer",
  "Advocaat": "advocaat",
  "Financieel adviseur": "financieelAdviseur",
  "Overig": "overig",
};

const emptyForm = {
  naam: "",
  relatie: "",
  telefoon: "",
  email: "",
  adres: "",
  postcode: "",
  woonplaats: "",
  rol: "",
  instructies: "",
  isGedeeld: false,
};

export default function NoodcontactenPage() {
  const t = useTranslations("noodcontacten");
  const tEnum = useTranslations("enums");
  const tf = useTranslations("feedback");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Query for loading noodcontacten
  const { data: contacten = [], isLoading: loading, refetch } = useDomainQuery<Noodcontact[]>("noodcontacten");

  const openDialog = (c?: Noodcontact) => {
    setError(null);
    if (c) {
      setEditId(c.id);
      setForm({
        naam: c.naam,
        relatie: c.relatie,
        telefoon: c.telefoon ?? "",
        email: c.email ?? "",
        adres: c.adres ?? "",
        postcode: c.postcode ?? "",
        woonplaats: c.woonplaats ?? "",
        rol: c.rol,
        instructies: c.instructies ?? "",
        isGedeeld: c.isGedeeld,
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        naam: form.naam,
        relatie: form.relatie,
        telefoon: form.telefoon || null,
        email: form.email || null,
        adres: form.adres || null,
        postcode: form.postcode || null,
        woonplaats: form.woonplaats || null,
        rol: form.rol,
        instructies: form.instructies || null,
        isGedeeld: form.isGedeeld,
      };
      if (editId) {
        await api.put(`/api/noodcontacten/${editId}`, payload);
        toast.success(tf("opgeslagen"));
      } else {
        await api.post("/api/noodcontacten", payload);
        toast.success(tf("aangemaakt"));
      }
      setDialogOpen(false);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await api.delete(`/api/noodcontacten/${id}`);
      toast.success(tf("verwijderd"));
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  };

  const exportGedeeld = async () => {
    try {
      const { blob, filename } = await api.download("/api/noodcontacten/gedeeld/export");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("exportMislukt"));
    }
  };

  const importGedeeld = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const contacten = JSON.parse(text);
        const result = await api.post<{ toegevoegd: number; overgeslagen: number }>(
          "/api/noodcontacten/gedeeld/import",
          contacten
        );
        refetch();
        alert(t("importResultaat", { toegevoegd: result?.toegevoegd ?? 0, overgeslagen: result?.overgeslagen ?? 0 }));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("importMislukt"));
      }
    };
    input.click();
  };

  const gedeeldCount = contacten.filter((c) => c.isGedeeld).length;

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t("laden")}</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("titel")}</h1>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("contactenTitel", { aantal: contacten.length })}</CardTitle>
          <div className="flex gap-2">
            <NoodkaartQR contacten={contacten} />
            <Button size="sm" onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-1" /> {t("toevoegen")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contacten.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("geenContacten")}
            </p>
          ) : (
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
                      onClick={() => deleteContact(c.id)}
                    >
                      <Trash2 className="h-3 w-3 text-danger" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
            <input
              type="checkbox"
              id="isGedeeld"
              checked={form.isGedeeld}
              onChange={(e) => setForm((f) => ({ ...f, isGedeeld: e.target.checked }))}
              className="h-4 w-4 rounded border-muted"
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
    </div>
  );
}
