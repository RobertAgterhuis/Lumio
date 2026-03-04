"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { useDomainQuery, useInvalidateStatusKeys } from "@/hooks";
import { toast } from "@/stores/toastStore";
import {
  emptyBezitForm,
  emptyRekeningForm,
  emptyVerzekeringForm,
  emptySchuldForm,
} from "./constants";
import type {
  Samenvatting,
  FysiekBezit,
  Bankrekening,
  Verzekering,
  Schuld,
  DialogKind,
  BezitFormData,
  RekeningFormData,
  VerzekeringFormData,
  SchuldFormData,
} from "./types";

export function useBoedel() {
  const tf = useTranslations("feedback");
  const t = useTranslations("boedel");

  const searchParams = useSearchParams();
  const validTabs = ["bezittingen", "rekeningen", "verzekeringen", "schulden"];
  const initialTab = searchParams.get("tab") ?? "bezittingen";
  const [tab, setTab] = useState(
    validTabs.includes(initialTab) ? initialTab : "bezittingen"
  );

  // React Query for data loading
  const { data: bezittingen = [], isLoading: bezittingenLoading, refetch: refetchBezittingen } = useDomainQuery<FysiekBezit[]>("boedel/bezittingen");
  const { data: rekeningen = [], isLoading: rekeningenLoading, refetch: refetchRekeningen } = useDomainQuery<Bankrekening[]>("boedel/bankrekeningen");
  const { data: verzekeringen = [], isLoading: verzekeringenLoading, refetch: refetchVerzekeringen } = useDomainQuery<Verzekering[]>("boedel/verzekeringen");
  const { data: schulden = [], isLoading: schuldenLoading, refetch: refetchSchulden } = useDomainQuery<Schuld[]>("boedel/schulden");
  const { data: samenvatting = null, isLoading: samenvattingLoading, refetch: refetchSamenvatting } = useDomainQuery<Samenvatting | null>("boedel/samenvatting");

  const loading = bezittingenLoading || rekeningenLoading || verzekeringenLoading || schuldenLoading || samenvattingLoading;

  const invalidateStatus = useInvalidateStatusKeys();
  const refetchAll = useCallback(() => {
    refetchBezittingen();
    refetchRekeningen();
    refetchVerzekeringen();
    refetchSchulden();
    refetchSamenvatting();
    invalidateStatus();
  }, [refetchBezittingen, refetchRekeningen, refetchVerzekeringen, refetchSchulden, refetchSamenvatting, invalidateStatus]);

  const [dialogKind, setDialogKind] = useState<DialogKind>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bezitForm, setBezitForm] = useState<BezitFormData>(emptyBezitForm);
  const [rekeningForm, setRekeningForm] = useState<RekeningFormData>(emptyRekeningForm);
  const [verzekerForm, setVerzekerForm] = useState<VerzekeringFormData>(emptyVerzekeringForm);
  const [schuldForm, setSchuldForm] = useState<SchuldFormData>(emptySchuldForm);

  // Open-dialogs
  const openBezit = useCallback((item?: FysiekBezit) => {
    setError(null);
    setEditId(item?.id ?? null);
    setBezitForm(item ? {
      categorie: item.categorie,
      omschrijving: item.omschrijving,
      geschatteWaarde: item.geschatteWaarde?.toString() ?? "",
      locatie: item.locatie ?? "",
      bestemdeErfgenaamId: item.bestemdeErfgenaamId ?? "",
      notities: item.notities ?? "",
      vermogensSoort: String(item.vermogensSoort ?? 0),
      kadastraalNummer: item.kadastraalNummer ?? "",
      kenteken: item.kenteken ?? "",
      kvKNummer: item.kvKNummer ?? "",
      linkedSchulden: item.linkedSchulden ?? [],
    } : { ...emptyBezitForm });
    setDialogKind("bezit");
  }, []);

  const openRekening = useCallback((item?: Bankrekening) => {
    setError(null);
    setEditId(item?.id ?? null);
    setRekeningForm(item ? {
      bankNaam: item.bankNaam,
      rekeningType: item.rekeningType,
      iban: item.iban,
      notities: item.notities ?? "",
      saldo: item.saldo?.toString() ?? "",
      vermogensSoort: String(item.vermogensSoort ?? 0),
    } : { ...emptyRekeningForm });
    setDialogKind("rekening");
  }, []);

  const openVerzekering = useCallback((item?: Verzekering) => {
    setError(null);
    setEditId(item?.id ?? null);
    setVerzekerForm(item ? {
      verzekeraar: item.verzekeraar,
      verzekeraarTelefoon: item.verzekeraarTelefoon ?? "",
      verzekeraarEmail: item.verzekeraarEmail ?? "",
      type: item.type,
      polisNummer: item.polisNummer,
      verzekerdBedrag: item.verzekerdBedrag?.toString() ?? "",
      begunstigde: item.begunstigde ?? "",
      begunstigdeErfgenaamId: item.begunstigdeErfgenaamId ?? "",
      notities: item.notities ?? "",
      vermogensSoort: String(item.vermogensSoort ?? 0),
    } : { ...emptyVerzekeringForm });
    setDialogKind("verzekering");
  }, []);

  const openSchuld = useCallback((item?: Schuld) => {
    setError(null);
    setEditId(item?.id ?? null);
    setSchuldForm(item ? {
      schuldeiser: item.schuldeiser,
      schuldeiserTelefoon: item.schuldeiserTelefoon ?? "",
      schuldeiserEmail: item.schuldeiserEmail ?? "",
      type: item.type,
      bedrag: item.bedrag.toString(),
      maandelijkseAflossing: item.maandelijkseAflossing?.toString() ?? "",
      referentie: item.referentie ?? "",
      notities: item.notities ?? "",
      vermogensSoort: String(item.vermogensSoort ?? 0),
      hypotheekVorm: item.hypotheekVorm ?? "",
      rentepercentage: item.rentepercentage?.toString() ?? "",
      maandelijkseRente: item.maandelijkseRente?.toString() ?? "",
      einddatum: item.einddatum ? item.einddatum.substring(0, 10) : "",
      restschuld: item.restschuld?.toString() ?? "",
    } : { ...emptySchuldForm });
    setDialogKind("schuld");
  }, []);

  const closeDialog = useCallback(() => setDialogKind(null), []);

  // Save handlers
  const saveBezit = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        categorie: bezitForm.categorie,
        omschrijving: bezitForm.omschrijving,
        geschatteWaarde: bezitForm.geschatteWaarde ? parseFloat(bezitForm.geschatteWaarde) : null,
        locatie: bezitForm.locatie || null,
        bestemdeErfgenaamId: bezitForm.bestemdeErfgenaamId || null,
        notities: bezitForm.notities || null,
        vermogensSoort: parseInt(bezitForm.vermogensSoort),
        kadastraalNummer: bezitForm.kadastraalNummer || null,
        kenteken: bezitForm.kenteken || null,
        kvKNummer: bezitForm.kvKNummer || null,
      };
      let bezitId: string;
      if (editId) {
        await api.put(`/api/boedel/bezittingen/${editId}`, payload);
        bezitId = editId;
      } else {
        const created = await api.post<FysiekBezit>("/api/boedel/bezittingen", payload);
        bezitId = created.id;
      }
      // S7-05: Atomische batch-aanmaak om sequential API-calls te vermijden
      const nieuweSchulden = bezitForm.linkedSchulden.filter((s) => s._isNew && s.schuldeiser);
      if (nieuweSchulden.length > 0) {
        await api.post(`/api/boedel/bezittingen/${bezitId}/schulden/batch`, nieuweSchulden.map((schuld) => ({
          schuldeiser: schuld.schuldeiser,
          type: schuld.type,
          bedrag: schuld.bedrag,
          maandelijkseAflossing: schuld.maandelijkseAflossing ?? null,
          leaseMaatschappij: schuld.leaseMaatschappij || null,
          rentepercentage: schuld.rentepercentage ?? null,
          einddatum: schuld.einddatum || null,
        })));
      }
      toast.success(tf(editId ? "opgeslagen" : "aangemaakt"));
      setDialogKind(null);
      refetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  }, [bezitForm, editId, refetchAll, t, tf]);

  const saveRekening = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        bankNaam: rekeningForm.bankNaam,
        iban: rekeningForm.iban,
        rekeningType: rekeningForm.rekeningType,
        notities: rekeningForm.notities || null,
        saldo: rekeningForm.saldo ? parseFloat(rekeningForm.saldo) : null,
        vermogensSoort: parseInt(rekeningForm.vermogensSoort),
      };
      if (editId) await api.put(`/api/boedel/bankrekeningen/${editId}`, payload);
      else await api.post("/api/boedel/bankrekeningen", payload);
      toast.success(tf(editId ? "opgeslagen" : "aangemaakt"));
      setDialogKind(null);
      refetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  }, [rekeningForm, editId, refetchAll, t, tf]);

  const saveVerzekering = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        verzekeraar: verzekerForm.verzekeraar,
        verzekeraarTelefoon: verzekerForm.verzekeraarTelefoon || null,
        verzekeraarEmail: verzekerForm.verzekeraarEmail || null,
        polisNummer: verzekerForm.polisNummer,
        type: verzekerForm.type,
        verzekerdBedrag: verzekerForm.verzekerdBedrag ? parseFloat(verzekerForm.verzekerdBedrag) : null,
        begunstigde: verzekerForm.begunstigde || null,
        begunstigdeErfgenaamId: verzekerForm.begunstigdeErfgenaamId || null,
        notities: verzekerForm.notities || null,
        vermogensSoort: parseInt(verzekerForm.vermogensSoort),
      };
      if (editId) await api.put(`/api/boedel/verzekeringen/${editId}`, payload);
      else await api.post("/api/boedel/verzekeringen", payload);
      toast.success(tf(editId ? "opgeslagen" : "aangemaakt"));
      setDialogKind(null);
      refetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  }, [verzekerForm, editId, refetchAll, t, tf]);

  const saveSchuld = useCallback(async () => {
    setError(null);
    // S3-30: guard against empty / non-numeric bedrag instead of silently sending 0
    const bedragValue = parseFloat(schuldForm.bedrag);
    if (!schuldForm.bedrag || isNaN(bedragValue) || bedragValue <= 0) {
      setError(t("bedragVerplicht"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        schuldeiser: schuldForm.schuldeiser,
        schuldeiserTelefoon: schuldForm.schuldeiserTelefoon || null,
        schuldeiserEmail: schuldForm.schuldeiserEmail || null,
        type: schuldForm.type,
        bedrag: bedragValue,
        maandelijkseAflossing: schuldForm.maandelijkseAflossing ? parseFloat(schuldForm.maandelijkseAflossing) : null,
        referentie: schuldForm.referentie || null,
        notities: schuldForm.notities || null,
        vermogensSoort: parseInt(schuldForm.vermogensSoort),
        hypotheekVorm: schuldForm.type === "Hypotheek" ? (schuldForm.hypotheekVorm || null) : null,
        rentepercentage: schuldForm.type === "Hypotheek" && schuldForm.rentepercentage ? parseFloat(schuldForm.rentepercentage) : null,
        maandelijkseRente: schuldForm.type === "Hypotheek" && schuldForm.maandelijkseRente ? parseFloat(schuldForm.maandelijkseRente) : null,
        einddatum: schuldForm.type === "Hypotheek" && schuldForm.einddatum ? schuldForm.einddatum : null,
        restschuld: schuldForm.type === "Hypotheek" && schuldForm.restschuld ? parseFloat(schuldForm.restschuld) : null,
      };
      if (editId) await api.put(`/api/boedel/schulden/${editId}`, payload);
      else await api.post("/api/boedel/schulden", payload);
      toast.success(tf(editId ? "opgeslagen" : "aangemaakt"));
      setDialogKind(null);
      refetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  }, [schuldForm, editId, refetchAll, t, tf]);

  const deleteItem = useCallback(async (type: string, id: string) => {
    try {
      await api.delete(`/api/boedel/${type}/${id}`);
      toast.success(tf("verwijderd"));
      refetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  }, [refetchAll, t, tf]);

  return {
    // Data
    tab,
    setTab,
    bezittingen,
    rekeningen,
    verzekeringen,
    schulden,
    samenvatting,
    loading,
    error,

    // Dialog state
    dialogKind,
    editId,
    saving,

    // Forms
    bezitForm,
    setBezitForm,
    rekeningForm,
    setRekeningForm,
    verzekerForm,
    setVerzekerForm,
    schuldForm,
    setSchuldForm,

    // Actions
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
  };
}
