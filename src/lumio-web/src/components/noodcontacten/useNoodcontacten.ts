"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { api, ApiError } from "@/lib/api-client";
import { useDomainQuery, useInvalidateStatusKeys } from "@/hooks";
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
  bedrijfsNaam?: string;
  functie?: string;
  prioriteit: number;
  isGedeeld: boolean;
}

export const ROLLEN = [
  // Persoonlijk
  "Vertrouwenspersoon",
  // Medisch
  "Huisarts",
  "Behandelend arts / Specialist",
  "Tandarts",
  "Thuiszorg / Zorgverlener",
  // Professioneel
  "Leidinggevende / Manager",
  "HR Afdeling / P&O",
  "Pensioencontact",
  "Boekhouder / Accountant",
  // Juridisch & Financieel
  "Notaris",
  "Advocaat",
  "Financieel adviseur",
  // Uitvaart
  "Uitvaartondernemer",
  "Kerkelijk contactpersoon",
  // Overig
  "Overig",
];

export const ROL_KEYS: Record<string, string> = {
  "Vertrouwenspersoon": "vertrouwenspersoon",
  "Huisarts": "huisarts",
  "Behandelend arts / Specialist": "behandelendArts",
  "Tandarts": "tandarts",
  "Thuiszorg / Zorgverlener": "thuiszorg",
  "Leidinggevende / Manager": "leidinggevende",
  "HR Afdeling / P&O": "hrAfdeling",
  "Pensioencontact": "pensioencontact",
  "Boekhouder / Accountant": "boekhouder",
  "Notaris": "notaris",
  "Advocaat": "advocaat",
  "Financieel adviseur": "financieelAdviseur",
  "Uitvaartondernemer": "uitvaartondernemer",
  "Kerkelijk contactpersoon": "kerkelijkContactpersoon",
  "Overig": "overig",
};

/** Rollen waarbij bedrijfsnaam en functie relevant zijn */
export const PROFESSIONELE_ROLLEN = new Set([
  "Leidinggevende / Manager",
  "HR Afdeling / P&O",
  "Pensioencontact",
  "Boekhouder / Accountant",
  "Notaris",
  "Advocaat",
  "Financieel adviseur",
  "Uitvaartondernemer",
  "Kerkelijk contactpersoon",
]);

export const ROL_CATEGORIE: Record<string, string> = {
  "Vertrouwenspersoon": "persoonlijk",
  "Huisarts": "medisch",
  "Behandelend arts / Specialist": "medisch",
  "Tandarts": "medisch",
  "Thuiszorg / Zorgverlener": "medisch",
  "Leidinggevende / Manager": "professioneel",
  "HR Afdeling / P&O": "professioneel",
  "Pensioencontact": "professioneel",
  "Boekhouder / Accountant": "professioneel",
  "Notaris": "juridisch",
  "Advocaat": "juridisch",
  "Financieel adviseur": "juridisch",
  "Uitvaartondernemer": "uitvaart",
  "Kerkelijk contactpersoon": "uitvaart",
  "Overig": "persoonlijk",
};

export const TABS = ["alle", "persoonlijk", "medisch", "professioneel", "juridisch", "uitvaart"] as const;
export type TabValue = typeof TABS[number];

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
  bedrijfsNaam: "",
  functie: "",
  prioriteit: 3,
  isGedeeld: false,
};

export type NoodcontactForm = typeof emptyNoodcontactForm;

function formatApiError(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.errors && Object.keys(err.errors).length > 0) {
    const fieldLabels: Record<string, string> = {
      naam: "Naam",
      relatie: "Relatie",
      telefoon: "Telefoon (formaat: +31612345678 of 0612345678)",
      email: "E-mail (formaat: naam@domein.nl)",
      postcode: "Postcode (formaat: 1234AB)",
      rol: "Rol",
    };

    const lines = Object.entries(err.errors).flatMap(([field, messages]) => {
      const label = fieldLabels[field.toLowerCase()] ?? field;
      return messages.map((message) => `${label}: ${message}`);
    });

    return lines.join("\n");
  }

  return err instanceof Error ? err.message : fallback;
}

export function useNoodcontacten() {
  const t = useTranslations("noodcontacten");
  const tf = useTranslations("feedback");

  const searchParams = useSearchParams();
  const validTabValues = [...TABS] as string[];
  const initialTab = searchParams.get("tab") ?? "alle";
  const [activeTab, setActiveTab] = useState<TabValue>(
    validTabValues.includes(initialTab) ? (initialTab as TabValue) : "alle"
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NoodcontactForm>(emptyNoodcontactForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: contacten = [], isLoading: loading, refetch } =
    useDomainQuery<Noodcontact[]>("noodcontacten");

  const invalidateStatus = useInvalidateStatusKeys();

  const filteredContacten = activeTab === "alle"
    ? contacten
    : contacten.filter((c) => (ROL_CATEGORIE[c.rol] ?? "persoonlijk") === activeTab);

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
        bedrijfsNaam: c.bedrijfsNaam ?? "",
        functie: c.functie ?? "",
        prioriteit: c.prioriteit ?? 3,
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
        bedrijfsNaam: form.bedrijfsNaam || null,
        functie: form.functie || null,
        prioriteit: form.prioriteit,
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
      invalidateStatus();
    } catch (err) {
      setError(formatApiError(err, t("opslaanMislukt")));
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await api.delete(`/api/noodcontacten/${id}`);
      toast.success(tf("verwijderd"));
      refetch();
      invalidateStatus();
    } catch (err) {
      setError(formatApiError(err, t("verwijderenMislukt")));
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
      setError(formatApiError(err, t("exportMislukt")));
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
        setError(formatApiError(err, t("importMislukt")));
      }
    };
    input.click();
  };

  const gedeeldCount = contacten.filter((c) => c.isGedeeld).length;

  return {
    // Data
    contacten,
    filteredContacten,
    activeTab,
    setActiveTab,
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
