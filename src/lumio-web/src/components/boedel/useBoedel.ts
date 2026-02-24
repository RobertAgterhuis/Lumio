"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
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

  const [tab, setTab] = useState("bezittingen");
  const [bezittingen, setBezittingen] = useState<FysiekBezit[]>([]);
  const [rekeningen, setRekeningen] = useState<Bankrekening[]>([]);
  const [verzekeringen, setVerzekeringen] = useState<Verzekering[]>([]);
  const [schulden, setSchulden] = useState<Schuld[]>([]);
  const [samenvatting, setSamenvatting] = useState<Samenvatting | null>(null);
  const [loading, setLoading] = useState(true);

  const [dialogKind, setDialogKind] = useState<DialogKind>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bezitForm, setBezitForm] = useState<BezitFormData>(emptyBezitForm);
  const [rekeningForm, setRekeningForm] = useState<RekeningFormData>(emptyRekeningForm);
  const [verzekerForm, setVerzekerForm] = useState<VerzekeringFormData>(emptyVerzekeringForm);
  const [schuldForm, setSchuldForm] = useState<SchuldFormData>(emptySchuldForm);

  const loadData = useCallback(() => {
    Promise.all([
      api.get<FysiekBezit[]>("/api/boedel/bezittingen").catch((err) => { console.error("Failed to load bezittingen:", err); return []; }),
      api.get<Bankrekening[]>("/api/boedel/bankrekeningen").catch((err) => { console.error("Failed to load bankrekeningen:", err); return []; }),
      api.get<Verzekering[]>("/api/boedel/verzekeringen").catch((err) => { console.error("Failed to load verzekeringen:", err); return []; }),
      api.get<Schuld[]>("/api/boedel/schulden").catch((err) => { console.error("Failed to load schulden:", err); return []; }),
      api.get<Samenvatting>("/api/boedel/samenvatting").catch((err) => { console.error("Failed to load samenvatting:", err); return null; }),
    ])
      .then(([b, r, v, s, sam]) => {
        setBezittingen(b ?? []);
        setRekeningen(r ?? []);
        setVerzekeringen(v ?? []);
        setSchulden(s ?? []);
        setSamenvatting(sam);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Open-dialogs
  const openBezit = useCallback((item?: FysiekBezit) => {
    setError(null);
    setEditId(item?.id ?? null);
    setBezitForm(item ? {
      categorie: item.categorie,
      omschrijving: item.omschrijving,
      geschatteWaarde: item.geschatteWaarde?.toString() ?? "",
      locatie: item.locatie ?? "",
      bestemdeErfgenaam: item.bestemdeErfgenaam ?? "",
      notities: item.notities ?? "",
      vermogensSoort: String(item.vermogensSoort ?? 0),
      kadastraalNummer: item.kadastraalNummer ?? "",
      kenteken: item.kenteken ?? "",
      kvKNummer: item.kvKNummer ?? "",
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
        bestemdeErfgenaam: bezitForm.bestemdeErfgenaam || null,
        notities: bezitForm.notities || null,
        vermogensSoort: parseInt(bezitForm.vermogensSoort),
        kadastraalNummer: bezitForm.kadastraalNummer || null,
        kenteken: bezitForm.kenteken || null,
        kvKNummer: bezitForm.kvKNummer || null,
      };
      if (editId) await api.put(`/api/boedel/bezittingen/${editId}`, payload);
      else await api.post("/api/boedel/bezittingen", payload);
      toast.success(tf(editId ? "opgeslagen" : "aangemaakt"));
      setDialogKind(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  }, [bezitForm, editId, loadData, t, tf]);

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
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  }, [rekeningForm, editId, loadData, t, tf]);

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
        notities: verzekerForm.notities || null,
        vermogensSoort: parseInt(verzekerForm.vermogensSoort),
      };
      if (editId) await api.put(`/api/boedel/verzekeringen/${editId}`, payload);
      else await api.post("/api/boedel/verzekeringen", payload);
      toast.success(tf(editId ? "opgeslagen" : "aangemaakt"));
      setDialogKind(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  }, [verzekerForm, editId, loadData, t, tf]);

  const saveSchuld = useCallback(async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        schuldeiser: schuldForm.schuldeiser,
        schuldeiserTelefoon: schuldForm.schuldeiserTelefoon || null,
        schuldeiserEmail: schuldForm.schuldeiserEmail || null,
        type: schuldForm.type,
        bedrag: parseFloat(schuldForm.bedrag) || 0,
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
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("opslaanMislukt"));
    } finally {
      setSaving(false);
    }
  }, [schuldForm, editId, loadData, t, tf]);

  const deleteItem = useCallback(async (type: string, id: string) => {
    try {
      await api.delete(`/api/boedel/${type}/${id}`);
      toast.success(tf("verwijderd"));
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  }, [loadData, t, tf]);

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
