"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, downloadAndSave } from "@/lib/api-client";
import { useDomainQuery, domainKeys, useInvalidateStatusKeys } from "@/hooks";
import { toast } from "@/stores/toastStore";
import { emptyErfgenaamForm, emptyToewijzingForm } from "./constants";
import type {
  AssetItem,
  Erfgenaam,
  ErfgenaamFormData,
  GenereerResponse,
  Toewijzing,
  ToewijzingFormData,
} from "./types";

export interface UseErfgenamenTranslations {
  aangemaakt: string;
  verwijderd: string;
  opslaanMislukt: string;
  verwijderenMislukt: string;
  exportMislukt: string;
  sleuteldelenMislukt: string;
  toewijzingOpslaanMislukt: string;
  toewijzingVerwijderenMislukt: string;
  noodcontactAangemaakt: string;
}

export function useErfgenamen(translations: UseErfgenamenTranslations) {
  const queryClient = useQueryClient();

  // React Query for data loading
  const { data: erfgenamen = [], isLoading: erfgenamenLoading, refetch: refetchErfgenamen } = useDomainQuery<Erfgenaam[]>("erfgenamen");
  const { data: toewijzingen = [], isLoading: toewijzingenLoading, refetch: refetchToewijzingen } = useDomainQuery<Toewijzing[]>("toewijzingen");
  const { data: availableAssets = [], isLoading: assetsLoading, refetch: refetchAssets } = useDomainQuery<AssetItem[]>("toewijzingen/beschikbaar");

  const loading = erfgenamenLoading || toewijzingenLoading || assetsLoading;
  const [error, setError] = useState<string | null>(null);

  const invalidateStatus = useInvalidateStatusKeys();
  const refetchAll = useCallback(() => {
    refetchErfgenamen();
    refetchToewijzingen();
    refetchAssets();
    invalidateStatus();
  }, [refetchErfgenamen, refetchToewijzingen, refetchAssets, invalidateStatus]);

  // Erfgenaam dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ErfgenaamFormData>(emptyErfgenaamForm);
  const [saving, setSaving] = useState(false);

  // Toewijzing dialog state
  const [toewijzingDialogOpen, setToewijzingDialogOpen] = useState(false);
  const [toewijzingForm, setToewijzingForm] = useState<ToewijzingFormData>(emptyToewijzingForm);
  const [toewijzingSaving, setToewijzingSaving] = useState(false);

  // Shamir dialog state
  const [shamirDialogOpen, setShamirDialogOpen] = useState(false);
  const [shamirPassword, setShamirPassword] = useState("");
  const [shamirThreshold, setShamirThreshold] = useState("2");
  const [shamirGenerating, setShamirGenerating] = useState(false);
  const [generatedShares, setGeneratedShares] = useState<GenereerResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // UI state
  const [expandedErfgenaam, setExpandedErfgenaam] = useState<string | null>(null);

  // Delete confirmation state
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Erfgenaam CRUD
  const openDialog = useCallback((existing?: Erfgenaam) => {
    if (existing) {
      setEditId(existing.id);
      setForm({
        voornaam: existing.voornaam,
        tussenvoegsel: existing.tussenvoegsel,
        achternaam: existing.achternaam,
        relatie: existing.relatie,
        email: existing.email,
        telefoon: existing.telefoon,
        geboortedatum: existing.geboortedatum,
        bsn: existing.bsn,
        adres: existing.adres,
        postcode: existing.postcode,
        woonplaats: existing.woonplaats,
        legitimatieSoort: existing.legitimatieSoort,
        legitimatieNummer: existing.legitimatieNummer,
        legitimatieDatumAfgifte: existing.legitimatieDatumAfgifte,
        legitimatieGeldigTot: existing.legitimatieGeldigTot,
        alsNoodcontact: false,
      });
    } else {
      setEditId(null);
      setForm(emptyErfgenaamForm);
    }
    setDialogOpen(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        legitimatieSoort: parseInt(form.legitimatieSoort, 10),
        geboortedatum: form.geboortedatum || null,
        legitimatieDatumAfgifte: form.legitimatieDatumAfgifte || null,
        legitimatieGeldigTot: form.legitimatieGeldigTot || null,
      };

      if (editId) {
        await api.put(`/api/erfgenamen/${editId}`, payload);
        toast.success(translations.aangemaakt);
      } else {
        await api.post("/api/erfgenamen", payload);
        toast.success(translations.aangemaakt);
      }

      // Write-through: also create a noodcontact if the checkbox was checked
      if (form.alsNoodcontact) {
        try {
          await api.post("/api/noodcontacten", {
            naam: [form.voornaam, form.tussenvoegsel, form.achternaam].filter(Boolean).join(" "),
            relatie: form.relatie,
            email: form.email || null,
            telefoon: form.telefoon || null,
            adres: form.adres || null,
            postcode: form.postcode || null,
            woonplaats: form.woonplaats || null,
            rol: "Vertrouwenspersoon",
            instructies: null,
            isGedeeld: false,
          });
          toast.success(translations.noodcontactAangemaakt);
          queryClient.invalidateQueries({ queryKey: domainKeys.all("noodcontacten") });
        } catch (noodcontactErr) {
          // Non-fatal: erfgenaam was saved; log and show warning but continue
          console.error("Could not create noodcontact write-through", noodcontactErr);
        }
      }

      setDialogOpen(false);
      refetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.opslaanMislukt);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await api.delete(`/api/erfgenamen/${id}`);
      toast.success(translations.verwijderd);
      refetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.verwijderenMislukt);
    }
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  const handleExportErfgenaam = async (id: string, voornaam: string) => {
    try {
      const fallback = `lumio-erfgenaam-${voornaam.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      await downloadAndSave(`/api/export/erfgenaam/${id}`, fallback, { method: "POST" });
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.exportMislukt);
    }
  };

  const handleDeelMetErfgenaam = async (id: string, voornaam: string) => {
    try {
      const fallback = `lumio-deel-${voornaam.toLowerCase().replace(/\s+/g, "-")}.html`;
      await downloadAndSave(`/api/export/delen/${id}`, fallback);
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.exportMislukt);
    }
  };

  // Toewijzing CRUD
  const openToewijzingDialog = useCallback((erfgenaamId?: string) => {
    setToewijzingForm({
      erfgenaamId: erfgenaamId ?? "",
      entityType: "",
      entityId: "",
      instructies: "",
    });
    setToewijzingDialogOpen(true);
  }, []);

  const filteredAssets = availableAssets.filter(
    (a) =>
      (!toewijzingForm.entityType || a.type === toewijzingForm.entityType) &&
      !toewijzingen.some(
        (t) => t.entityId === a.id && t.erfgenaamId === toewijzingForm.erfgenaamId
      )
  );

  const handleSaveToewijzing = async () => {
    setToewijzingSaving(true);
    try {
      await api.post("/api/toewijzingen", {
        erfgenaamId: toewijzingForm.erfgenaamId,
        entityType: toewijzingForm.entityType,
        entityId: toewijzingForm.entityId,
        instructies: toewijzingForm.instructies || null,
      });
      toast.success(translations.aangemaakt);
      setToewijzingDialogOpen(false);
      refetchToewijzingen();
      invalidateStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.toewijzingOpslaanMislukt);
    } finally {
      setToewijzingSaving(false);
    }
  };

  const handleDeleteToewijzing = async (id: string) => {
    try {
      await api.delete(`/api/toewijzingen/${id}`);
      toast.success(translations.verwijderd);
      refetchToewijzingen();
      invalidateStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.toewijzingVerwijderenMislukt);
    }
  };

  const getToewijzingenVoorErfgenaam = useCallback(
    (erfgenaamId: string) => toewijzingen.filter((t) => t.erfgenaamId === erfgenaamId),
    [toewijzingen]
  );

  // Shamir secret sharing
  const handleGenerateShares = async () => {
    setShamirGenerating(true);
    try {
      const result = await api.post<GenereerResponse>("/api/shamir/genereer", {
        wachtwoord: shamirPassword,
        aantalDelen: erfgenamen.length,
        drempel: parseInt(shamirThreshold),
      });
      setGeneratedShares(result);
      refetchAll();
    } catch {
      setError(translations.sleuteldelenMislukt);
    } finally {
      setShamirGenerating(false);
    }
  };

  const copyShare = async (index: number, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const closeShamirDialog = useCallback(() => {
    setShamirDialogOpen(false);
    setShamirPassword("");
    setGeneratedShares(null);
    setCopiedIndex(null);
  }, []);

  return {
    // Data
    loading,
    error,
    erfgenamen,
    toewijzingen,
    availableAssets,
    filteredAssets,

    // Erfgenaam dialog
    dialogOpen,
    setDialogOpen,
    editId,
    form,
    setForm,
    saving,
    openDialog,
    handleSave,
    handleDelete,
    pendingDeleteId,
    confirmDelete,
    cancelDelete,
    handleExportErfgenaam,
    handleDeelMetErfgenaam,

    // Toewijzing dialog
    toewijzingDialogOpen,
    setToewijzingDialogOpen,
    toewijzingForm,
    setToewijzingForm,
    toewijzingSaving,
    openToewijzingDialog,
    handleSaveToewijzing,
    handleDeleteToewijzing,
    getToewijzingenVoorErfgenaam,

    // Shamir dialog
    shamirDialogOpen,
    setShamirDialogOpen,
    shamirPassword,
    setShamirPassword,
    shamirThreshold,
    setShamirThreshold,
    shamirGenerating,
    generatedShares,
    copiedIndex,
    handleGenerateShares,
    copyShare,
    closeShamirDialog,

    // UI state
    expandedErfgenaam,
    setExpandedErfgenaam,
  };
}
