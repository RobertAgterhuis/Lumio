"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api-client";
import { useDomainQuery, useInvalidateStatusKeys } from "@/hooks";
import { toast } from "@/stores/toastStore";
import { useTranslations } from "next-intl";
import {
  emptyExecuteurForm,
  emptyBegunstigdeForm,
  emptyTestamentEditForm
} from "./constants";
import type {
  TestamentInfo,
  Begunstigde,
  Executeur,
  LegitimairePortieCheck,
  TestamentSnapshot,
  TestamentVergelijking,
  ExecuteurFormData,
  BegunstigdeFormData,
  TestamentEditFormData
} from "./types";

// M4-5: Minimal response shapes for person auto-sync when re-opening a linked dialog
interface ErfgenaamSyncResponse {
  voornaam: string;
  achternaam: string;
  tussenvoegsel?: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
}
interface NoodcontactSyncResponse {
  naam: string;
  relatie?: string;
  telefoon?: string;
  email?: string;
  adres?: string;
  postcode?: string;
  woonplaats?: string;
}

export function useTestament() {
  const t = useTranslations("testament");
  const tf = useTranslations("feedback");

  // React Query for data loading
  const { data: testament = null, refetch: refetchTestament } = useDomainQuery<TestamentInfo | null>("testament");
  const { data: begunstigden = [], refetch: refetchBegunstigden } = useDomainQuery<Begunstigde[]>("testament/begunstigden");
  const { data: executeurs = [], isLoading: execLoading, refetch: refetchExecuteurs } = useDomainQuery<Executeur[]>("testament/executeurs");
  const { data: legitiemaireCheck = null, refetch: refetchLegitiemaire } = useDomainQuery<LegitimairePortieCheck | null>("testament/legitimaire-portie-check");
  const { data: snapshots = [], isLoading: snapsLoading, refetch: refetchSnapshots } = useDomainQuery<TestamentSnapshot[]>("testament/snapshots");

  const loading = execLoading || snapsLoading;

  const invalidateStatus = useInvalidateStatusKeys();

  const refetchAll = useCallback(() => {
    refetchTestament();
    refetchBegunstigden();
    refetchExecuteurs();
    refetchLegitiemaire();
    refetchSnapshots();
  }, [refetchTestament, refetchBegunstigden, refetchExecuteurs, refetchLegitiemaire, refetchSnapshots]);

  // Executeur dialog state
  const [execDialogOpen, setExecDialogOpen] = useState(false);
  const [editExecId, setEditExecId] = useState<string | null>(null);
  const [execForm, setExecForm] = useState<ExecuteurFormData>(emptyExecuteurForm);

  // Begunstigde dialog state
  const [begDialogOpen, setBegDialogOpen] = useState(false);
  const [editBegId, setEditBegId] = useState<string | null>(null);
  const [begForm, setBegForm] = useState<BegunstigdeFormData>(emptyBegunstigdeForm);

  // Testament edit dialog state
  const [testEditOpen, setTestEditOpen] = useState(false);
  const [testEditForm, setTestEditForm] = useState<TestamentEditFormData>(emptyTestamentEditForm);
  const [testEditError, setTestEditError] = useState<string | null>(null);

  // Snapshot dialog state
  const [snapDialogOpen, setSnapDialogOpen] = useState(false);
  const [snapNotitie, setSnapNotitie] = useState("");
  const [snapError, setSnapError] = useState<string | null>(null);

  // Vergelijking state
  const [vergelijking, setVergelijking] = useState<TestamentVergelijking | null>(null);
  const [vergelijkOpen, setVergelijkOpen] = useState(false);
  const [vergelijkIds, setVergelijkIds] = useState<[string, string]>(["", ""]);

  // Executeur CRUD
  const openExecDialog = useCallback(async (exec?: Executeur) => {
    if (exec) {
      setEditExecId(exec.id);
      let form: ExecuteurFormData = {
        naam: exec.naam,
        relatie: exec.relatie ?? "",
        telefoon: exec.telefoon ?? "",
        email: exec.email ?? "",
        adres: exec.adres ?? "",
        postcode: exec.postcode ?? "",
        woonplaats: exec.woonplaats ?? "",
        erfgenaamId: exec.erfgenaamId,
        noodcontactId: exec.noodcontactId,
      };
      // M4-5: Auto-sync contact data if linked to a person record
      if (exec.erfgenaamId) {
        try {
          const e = await api.get<ErfgenaamSyncResponse>(`/api/erfgenamen/${exec.erfgenaamId}`);
          const naam = e.tussenvoegsel ? `${e.voornaam} ${e.tussenvoegsel} ${e.achternaam}` : `${e.voornaam} ${e.achternaam}`;
          form = { ...form, naam, relatie: e.relatie ?? form.relatie, telefoon: e.telefoon ?? form.telefoon, email: e.email ?? form.email, adres: e.adres ?? form.adres, postcode: e.postcode ?? form.postcode, woonplaats: e.woonplaats ?? form.woonplaats };
        } catch { /* silently fail — show existing saved data */ }
      } else if (exec.noodcontactId) {
        try {
          const n = await api.get<NoodcontactSyncResponse>(`/api/noodcontacten/${exec.noodcontactId}`);
          form = { ...form, naam: n.naam, relatie: n.relatie ?? form.relatie, telefoon: n.telefoon ?? form.telefoon, email: n.email ?? form.email, adres: n.adres ?? form.adres, postcode: n.postcode ?? form.postcode, woonplaats: n.woonplaats ?? form.woonplaats };
        } catch { /* silently fail */ }
      }
      setExecForm(form);
    } else {
      setEditExecId(null);
      setExecForm(emptyExecuteurForm);
    }
    setExecDialogOpen(true);
  }, []);

  const saveExec = useCallback(async () => {
    try {
      const payload = {
        naam: execForm.naam,
        relatie: execForm.relatie || null,
        telefoon: execForm.telefoon || null,
        email: execForm.email || null,
        adres: execForm.adres || null,
        postcode: execForm.postcode || null,
        woonplaats: execForm.woonplaats || null,
        erfgenaamId: execForm.erfgenaamId ?? null,
        noodcontactId: execForm.noodcontactId ?? null,
      };
      if (editExecId) {
        await api.put(`/api/testament/executeurs/${editExecId}`, payload);
        toast.success(tf("opgeslagen"));
      } else {
        await api.post("/api/testament/executeurs", payload);
        toast.success(tf("aangemaakt"));
      }
      setExecDialogOpen(false);
      refetchExecuteurs();
      invalidateStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  }, [execForm, editExecId, t, tf, refetchExecuteurs]);

  const deleteExec = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/testament/executeurs/${id}`);
      toast.success(tf("verwijderd"));
      refetchExecuteurs();
      invalidateStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  }, [t, tf, refetchExecuteurs]);

  // Begunstigde CRUD
  const openBegDialog = useCallback(async (beg?: Begunstigde) => {
    if (beg) {
      setEditBegId(beg.id);
      let form: BegunstigdeFormData = {
        naam: beg.naam,
        relatie: beg.relatie ?? "",
        telefoon: beg.telefoon ?? "",
        email: beg.email ?? "",
        adres: beg.adres ?? "",
        postcode: beg.postcode ?? "",
        woonplaats: beg.woonplaats ?? "",
        percentage: beg.percentage != null ? String(beg.percentage) : "",
        isLegitiemePortie: beg.isLegitiemePortie,
        erfgenaamId: beg.erfgenaamId,
        noodcontactId: beg.noodcontactId,
      };
      // M4-5: Auto-sync contact data if linked to a person record
      if (beg.erfgenaamId) {
        try {
          const e = await api.get<ErfgenaamSyncResponse>(`/api/erfgenamen/${beg.erfgenaamId}`);
          const naam = e.tussenvoegsel ? `${e.voornaam} ${e.tussenvoegsel} ${e.achternaam}` : `${e.voornaam} ${e.achternaam}`;
          form = { ...form, naam, relatie: e.relatie ?? form.relatie, telefoon: e.telefoon ?? form.telefoon, email: e.email ?? form.email, adres: e.adres ?? form.adres, postcode: e.postcode ?? form.postcode, woonplaats: e.woonplaats ?? form.woonplaats };
        } catch { /* silently fail — show existing saved data */ }
      } else if (beg.noodcontactId) {
        try {
          const n = await api.get<NoodcontactSyncResponse>(`/api/noodcontacten/${beg.noodcontactId}`);
          form = { ...form, naam: n.naam, relatie: n.relatie ?? form.relatie, telefoon: n.telefoon ?? form.telefoon, email: n.email ?? form.email, adres: n.adres ?? form.adres, postcode: n.postcode ?? form.postcode, woonplaats: n.woonplaats ?? form.woonplaats };
        } catch { /* silently fail */ }
      }
      setBegForm(form);
    } else {
      setEditBegId(null);
      setBegForm(emptyBegunstigdeForm);
    }
    setBegDialogOpen(true);
  }, []);

  const saveBeg = useCallback(async () => {
    try {
      const payload = {
        naam: begForm.naam,
        relatie: begForm.relatie || null,
        telefoon: begForm.telefoon || null,
        email: begForm.email || null,
        adres: begForm.adres || null,
        postcode: begForm.postcode || null,
        woonplaats: begForm.woonplaats || null,
        percentage: begForm.percentage ? Number(begForm.percentage) : null,
        isLegitiemePortie: begForm.isLegitiemePortie,
        erfgenaamId: begForm.erfgenaamId ?? null,
        noodcontactId: begForm.noodcontactId ?? null,
      };
      if (editBegId) {
        await api.put(`/api/testament/begunstigden/${editBegId}`, payload);
        toast.success(tf("opgeslagen"));
      } else {
        await api.post("/api/testament/begunstigden", payload);
        toast.success(tf("aangemaakt"));
      }
      setBegDialogOpen(false);
      refetchBegunstigden();
      refetchLegitiemaire();
      invalidateStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  }, [begForm, editBegId, t, tf, refetchBegunstigden, refetchLegitiemaire]);

  const deleteBeg = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/testament/begunstigden/${id}`);
      toast.success(tf("verwijderd"));
      refetchBegunstigden();
      refetchLegitiemaire();
      invalidateStatus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  }, [t, tf, refetchBegunstigden, refetchLegitiemaire]);

  // Testament edit
  const openTestEdit = useCallback(async () => {
    if (!testament) return;
    setTestEditError(null);

    // Start with testament data
    let notarisContactId = testament.notarisContactId ?? null;

    // If no notaris selected yet, try to load from eigenaar profile
    if (!notarisContactId) {
      try {
        const eigenaar = await api.get<{ notarisContactId?: string | null }>("/api/eigenaar");
        if (eigenaar?.notarisContactId) {
          notarisContactId = eigenaar.notarisContactId;
        }
      } catch {
        // Silently fail — show existing saved data or empty field
      }
    }

    setTestEditForm({
      testamentType: testament.testamentType ?? "",
      notarisContactId: notarisContactId,
      datumTestament: testament.datumTestament ?? "",
      testamentLocatie: testament.testamentLocatie ?? "",
      ctr_Nummer: testament.ctr_Nummer ?? "",
      algemeneWensen: testament.algemeneWensen ?? "",
      bijzondereBepalingen: testament.bijzondereBepalingen ?? "",
      uitsluitingsClausule: testament.uitsluitingsClausule ?? true,
      legaten: testament.legaten ?? "",
    });
    setTestEditOpen(true);
  }, [testament]);

  const saveTestEdit = useCallback(async () => {
    setTestEditError(null);
    try {
      const payload = {
        testamentType: testEditForm.testamentType || null,
        notarisContactId: testEditForm.notarisContactId || null,
        datumTestament: testEditForm.datumTestament || null,
        testamentLocatie: testEditForm.testamentLocatie || null,
        ctr_Nummer: testEditForm.ctr_Nummer || null,
        algemeneWensen: testEditForm.algemeneWensen || null,
        bijzondereBepalingen: testEditForm.bijzondereBepalingen || null,
        uitsluitingsClausule: testEditForm.uitsluitingsClausule,
        legaten: testEditForm.legaten || null,
      };
      const updated = await api.put<TestamentInfo>("/api/testament", payload);
      refetchTestament();
      invalidateStatus();
      setTestEditOpen(false);
      toast.success(tf("opgeslagen"));
    } catch (err) {
      setTestEditError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  }, [testEditForm, t, tf, refetchTestament]);

  // Snapshot CRUD
  const openSnapDialog = useCallback(() => {
    setSnapNotitie("");
    setSnapError(null);
    setSnapDialogOpen(true);
  }, []);

  const createSnapshot = useCallback(async () => {
    setSnapError(null);
    try {
      await api.post("/api/testament/snapshots", { notitie: snapNotitie || null });
      toast.success(tf("aangemaakt"));
      setSnapDialogOpen(false);
      setSnapNotitie("");
      refetchSnapshots();
      invalidateStatus();
    } catch (err) {
      setSnapError(err instanceof Error ? err.message : t("versies.snapshotMislukt"));
    }
  }, [snapNotitie, t, tf, refetchSnapshots]);

  const deleteSnapshot = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/testament/snapshots/${id}`);
      toast.success(tf("verwijderd"));
      refetchSnapshots();
      invalidateStatus();
    } catch (err) {
      setSnapError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  }, [t, tf, refetchSnapshots]);

  // Vergelijking
  const loadVergelijking = useCallback(async () => {
    if (!vergelijkIds[0] || !vergelijkIds[1]) return;
    try {
      const result = await api.get<TestamentVergelijking>(
        `/api/testament/snapshots/vergelijk?versie1Id=${vergelijkIds[0]}&versie2Id=${vergelijkIds[1]}`
      );
      setVergelijking(result);
      setVergelijkOpen(true);
    } catch (err) {
      setSnapError(err instanceof Error ? err.message : t("versies.vergelijkingMislukt"));
    }
  }, [vergelijkIds, t]);

  return {
    // Data
    testament,
    begunstigden,
    executeurs,
    legitiemaireCheck,
    snapshots,
    loading,

    // Executeur dialog
    execDialogOpen,
    setExecDialogOpen,
    editExecId,
    execForm,
    setExecForm,
    openExecDialog,
    saveExec,
    deleteExec,

    // Begunstigde dialog
    begDialogOpen,
    setBegDialogOpen,
    editBegId,
    begForm,
    setBegForm,
    openBegDialog,
    saveBeg,
    deleteBeg,

    // Testament edit dialog
    testEditOpen,
    setTestEditOpen,
    testEditForm,
    setTestEditForm,
    testEditError,
    openTestEdit,
    saveTestEdit,

    // Snapshot dialog
    snapDialogOpen,
    setSnapDialogOpen,
    snapNotitie,
    setSnapNotitie,
    snapError,
    openSnapDialog,
    createSnapshot,
    deleteSnapshot,

    // Vergelijking
    vergelijking,
    vergelijkOpen,
    setVergelijkOpen,
    vergelijkIds,
    setVergelijkIds,
    loadVergelijking,
  };
}
