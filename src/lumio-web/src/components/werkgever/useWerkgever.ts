"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { useDomainQuery, useInvalidateStatusKeys } from "@/hooks";
import { toast } from "@/stores/toastStore";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Werkgever {
  id: string;
  bedrijfsNaam: string;
  kvkNummer?: string;
  adres?: string;
  postcode?: string;
  vestigingsplaats?: string;
  website?: string;
  telefoonHoofdkantoor?: string;
  functietitel?: string;
  afdeling?: string;
  startdatumDienstverband?: string;
  isZzp: boolean;
  pensioenfondNaam?: string;
  pensioenfondTelefoon?: string;
  pensioenfondEmail?: string;
  hrContactNaam?: string;
  hrContactTelefoon?: string;
  hrContactEmail?: string;
  leidinggevendeNaam?: string;
  leidinggevendeTelefoon?: string;
  leidinggevendeEmail?: string;
  notities?: string;
}

export const emptyWerkgeverForm = {
  bedrijfsNaam: "",
  kvkNummer: "",
  adres: "",
  postcode: "",
  vestigingsplaats: "",
  website: "",
  telefoonHoofdkantoor: "",
  functietitel: "",
  afdeling: "",
  startdatumDienstverband: "",
  isZzp: false,
  pensioenfondNaam: "",
  pensioenfondTelefoon: "",
  pensioenfondEmail: "",
  hrContactNaam: "",
  hrContactTelefoon: "",
  hrContactEmail: "",
  leidinggevendeNaam: "",
  leidinggevendeTelefoon: "",
  leidinggevendeEmail: "",
  notities: "",
};

export type WerkgeverForm = typeof emptyWerkgeverForm;

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useWerkgever() {
  const {
    data: werkgevers,
    isLoading: loading,
    refetch: refresh,
  } = useDomainQuery<Werkgever[]>("werkgever");

  const werkgever = werkgevers?.[0] ?? null;

  const invalidateStatus = useInvalidateStatusKeys();

  const [form, setForm] = useState<WerkgeverForm>(emptyWerkgeverForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function startEdit(w?: Werkgever) {
    if (w) {
      setEditId(w.id);
      setForm({
        bedrijfsNaam: w.bedrijfsNaam ?? "",
        kvkNummer: w.kvkNummer ?? "",
        adres: w.adres ?? "",
        postcode: w.postcode ?? "",
        vestigingsplaats: w.vestigingsplaats ?? "",
        website: w.website ?? "",
        telefoonHoofdkantoor: w.telefoonHoofdkantoor ?? "",
        functietitel: w.functietitel ?? "",
        afdeling: w.afdeling ?? "",
        startdatumDienstverband: w.startdatumDienstverband ?? "",
        isZzp: w.isZzp,
        pensioenfondNaam: w.pensioenfondNaam ?? "",
        pensioenfondTelefoon: w.pensioenfondTelefoon ?? "",
        pensioenfondEmail: w.pensioenfondEmail ?? "",
        hrContactNaam: w.hrContactNaam ?? "",
        hrContactTelefoon: w.hrContactTelefoon ?? "",
        hrContactEmail: w.hrContactEmail ?? "",
        leidinggevendeNaam: w.leidinggevendeNaam ?? "",
        leidinggevendeTelefoon: w.leidinggevendeTelefoon ?? "",
        leidinggevendeEmail: w.leidinggevendeEmail ?? "",
        notities: w.notities ?? "",
      });
    } else {
      setEditId(null);
      setForm(emptyWerkgeverForm);
    }
    setDialogOpen(true);
  }

  function cancelEdit() {
    setDialogOpen(false);
    setForm(emptyWerkgeverForm);
    setEditId(null);
  }

  async function save(
    successMsg: string,
    errorMsg: string,
  ) {
    setSaving(true);
    try {
      const payload = {
        bedrijfsNaam: form.bedrijfsNaam,
        kvkNummer: form.kvkNummer || null,
        adres: form.adres || null,
        postcode: form.postcode || null,
        vestigingsplaats: form.vestigingsplaats || null,
        website: form.website || null,
        telefoonHoofdkantoor: form.telefoonHoofdkantoor || null,
        functietitel: form.functietitel || null,
        afdeling: form.afdeling || null,
        startdatumDienstverband: form.startdatumDienstverband || null,
        isZzp: form.isZzp,
        pensioenfondNaam: form.pensioenfondNaam || null,
        pensioenfondTelefoon: form.pensioenfondTelefoon || null,
        pensioenfondEmail: form.pensioenfondEmail || null,
        hrContactNaam: form.hrContactNaam || null,
        hrContactTelefoon: form.hrContactTelefoon || null,
        hrContactEmail: form.hrContactEmail || null,
        leidinggevendeNaam: form.leidinggevendeNaam || null,
        leidinggevendeTelefoon: form.leidinggevendeTelefoon || null,
        leidinggevendeEmail: form.leidinggevendeEmail || null,
        notities: form.notities || null,
      };

      if (editId) {
        await api.put(`/api/werkgever/${editId}`, payload);
      } else {
        await api.post("/api/werkgever", payload);
      }

      refresh();
      invalidateStatus();
      setDialogOpen(false);
      setForm(emptyWerkgeverForm);
      setEditId(null);
      toast.success(successMsg);
    } catch {
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  }

  async function deleteWerkgever(id: string, successMsg: string, errorMsg: string) {
    setDeleting(true);
    try {
      await api.delete(`/api/werkgever/${id}`);
      refresh();
      invalidateStatus();
      toast.success(successMsg);
    } catch {
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  }

  return {
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
  };
}
