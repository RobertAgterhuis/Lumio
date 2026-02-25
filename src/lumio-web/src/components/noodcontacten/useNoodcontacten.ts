"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { useDomainQuery } from "@/hooks";
import { toast } from "@/stores/toastStore";

export interface Noodcontact {
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

export const ROLLEN = [
  "Vertrouwenspersoon",
  "Huisarts",
  "Notaris",
  "Uitvaartondernemer",
  "Advocaat",
  "Financieel adviseur",
  "Overig",
];

export const ROL_KEYS: Record<string, string> = {
  "Vertrouwenspersoon": "vertrouwenspersoon",
  "Huisarts": "huisarts",
  "Notaris": "notaris",
  "Uitvaartondernemer": "uitvaartondernemer",
  "Advocaat": "advocaat",
  "Financieel adviseur": "financieelAdviseur",
  "Overig": "overig",
};

export const emptyNoodcontactForm = {
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

export type NoodcontactForm = typeof emptyNoodcontactForm;

export function useNoodcontacten() {
  const t = useTranslations("noodcontacten");
  const tf = useTranslations("feedback");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NoodcontactForm>(emptyNoodcontactForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: contacten = [], isLoading: loading, refetch } =
    useDomainQuery<Noodcontact[]>("noodcontacten");

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
      setForm(emptyNoodcontactForm);
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
        const contactenData = JSON.parse(text);
        const result = await api.post<{ toegevoegd: number; overgeslagen: number }>(
          "/api/noodcontacten/gedeeld/import",
          contactenData
        );
        refetch();
        toast.success(t("importResultaat", { toegevoegd: result?.toegevoegd ?? 0, overgeslagen: result?.overgeslagen ?? 0 }));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("importMislukt"));
      }
    };
    input.click();
  };

  const gedeeldCount = contacten.filter((c) => c.isGedeeld).length;

  return {
    // Data
    contacten,
    loading,
    gedeeldCount,
    // Dialog state
    dialogOpen,
    setDialogOpen,
    editId,
    form,
    setForm,
    saving,
    error,
    setError,
    confirmDeleteId,
    setConfirmDeleteId,
    // Actions
    openDialog,
    save,
    deleteContact,
    exportGedeeld,
    importGedeeld,
  };
}
