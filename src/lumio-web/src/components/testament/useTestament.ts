"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api-client";
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

export function useTestament() {
  const t = useTranslations("testament");
  const tf = useTranslations("feedback");

  // Data state
  const [testament, setTestament] = useState<TestamentInfo | null>(null);
  const [begunstigden, setBegunstigden] = useState<Begunstigde[]>([]);
  const [executeurs, setExecuteurs] = useState<Executeur[]>([]);
  const [legitiemaireCheck, setLegitimaireCheck] = useState<LegitimairePortieCheck | null>(null);
  const [snapshots, setSnapshots] = useState<TestamentSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Load all data
  useEffect(() => {
    const load = async () => {
      try {
        const [t, b, e, lp, snaps] = await Promise.all([
          api.get<TestamentInfo>("/api/testament").catch((err) => { console.error("Failed to load testament:", err); return null; }),
          api.get<Begunstigde[]>("/api/testament/begunstigden").catch((err) => { console.error("Failed to load begunstigden:", err); return []; }),
          api.get<Executeur[]>("/api/testament/executeurs").catch((err) => { console.error("Failed to load executeurs:", err); return []; }),
          api.get<LegitimairePortieCheck>("/api/testament/legitimaire-portie-check").catch((err) => { console.error("Failed to load LP check:", err); return null; }),
          api.get<TestamentSnapshot[]>("/api/testament/snapshots").catch((err) => { console.error("Failed to load snapshots:", err); return []; }),
        ]);
        setTestament(t);
        setBegunstigden(b);
        setExecuteurs(e ?? []);
        setLegitimaireCheck(lp);
        setSnapshots(snaps ?? []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Executeur CRUD
  const openExecDialog = useCallback((exec?: Executeur) => {
    if (exec) {
      setEditExecId(exec.id);
      setExecForm({
        naam: exec.naam,
        relatie: exec.relatie ?? "",
        telefoon: exec.telefoon ?? "",
        email: exec.email ?? "",
        adres: exec.adres ?? "",
        postcode: exec.postcode ?? "",
        woonplaats: exec.woonplaats ?? "",
      });
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
      };
      if (editExecId) {
        await api.put(`/api/testament/executeurs/${editExecId}`, payload);
        toast.success(tf("opgeslagen"));
      } else {
        await api.post("/api/testament/executeurs", payload);
        toast.success(tf("aangemaakt"));
      }
      setExecDialogOpen(false);
      const updated = await api.get<Executeur[]>("/api/testament/executeurs").catch(() => []);
      setExecuteurs(updated ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  }, [execForm, editExecId, t, tf]);

  const deleteExec = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/testament/executeurs/${id}`);
      toast.success(tf("verwijderd"));
      setExecuteurs((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  }, [t, tf]);

  // Begunstigde CRUD
  const openBegDialog = useCallback((beg?: Begunstigde) => {
    if (beg) {
      setEditBegId(beg.id);
      setBegForm({
        naam: beg.naam,
        relatie: beg.relatie ?? "",
        telefoon: beg.telefoon ?? "",
        email: beg.email ?? "",
        adres: beg.adres ?? "",
        postcode: beg.postcode ?? "",
        woonplaats: beg.woonplaats ?? "",
        percentage: beg.percentage != null ? String(beg.percentage) : "",
        isLegitiemePortie: beg.isLegitiemePortie,
      });
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
      };
      if (editBegId) {
        await api.put(`/api/testament/begunstigden/${editBegId}`, payload);
        toast.success(tf("opgeslagen"));
      } else {
        await api.post("/api/testament/begunstigden", payload);
        toast.success(tf("aangemaakt"));
      }
      setBegDialogOpen(false);
      const updated = await api.get<Begunstigde[]>("/api/testament/begunstigden").catch(() => []);
      setBegunstigden(updated ?? []);
      // Reload legitimaire portie check
      const lpCheck = await api.get<LegitimairePortieCheck>("/api/testament/legitimaire-portie-check").catch(() => null);
      setLegitimaireCheck(lpCheck);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  }, [begForm, editBegId, t, tf]);

  const deleteBeg = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/testament/begunstigden/${id}`);
      toast.success(tf("verwijderd"));
      setBegunstigden((prev) => prev.filter((b) => b.id !== id));
      // Reload legitimaire portie check
      const lpCheck = await api.get<LegitimairePortieCheck>("/api/testament/legitimaire-portie-check").catch(() => null);
      setLegitimaireCheck(lpCheck);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  }, [t, tf]);

  // Testament edit
  const openTestEdit = useCallback(() => {
    if (!testament) return;
    setTestEditError(null);
    setTestEditForm({
      testamentType: testament.testamentType ?? "",
      notarisNaam: testament.notarisNaam ?? "",
      notarisKantoor: testament.notarisKantoor ?? "",
      notarisTelefoon: testament.notarisTelefoon ?? "",
      notarisEmail: testament.notarisEmail ?? "",
      notarisAdres: testament.notarisAdres ?? "",
      notarisPostcode: testament.notarisPostcode ?? "",
      notarisPlaats: testament.notarisPlaats ?? "",
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
        notarisNaam: testEditForm.notarisNaam || null,
        notarisKantoor: testEditForm.notarisKantoor || null,
        notarisTelefoon: testEditForm.notarisTelefoon || null,
        notarisEmail: testEditForm.notarisEmail || null,
        notarisAdres: testEditForm.notarisAdres || null,
        notarisPostcode: testEditForm.notarisPostcode || null,
        notarisPlaats: testEditForm.notarisPlaats || null,
        datumTestament: testEditForm.datumTestament || null,
        testamentLocatie: testEditForm.testamentLocatie || null,
        ctr_Nummer: testEditForm.ctr_Nummer || null,
        algemeneWensen: testEditForm.algemeneWensen || null,
        bijzondereBepalingen: testEditForm.bijzondereBepalingen || null,
        uitsluitingsClausule: testEditForm.uitsluitingsClausule,
        legaten: testEditForm.legaten || null,
      };
      const updated = await api.put<TestamentInfo>("/api/testament", payload);
      setTestament(updated);
      setTestEditOpen(false);
      toast.success(tf("opgeslagen"));
    } catch (err) {
      setTestEditError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  }, [testEditForm, t, tf]);

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
      const updated = await api.get<TestamentSnapshot[]>("/api/testament/snapshots").catch(() => []);
      setSnapshots(updated ?? []);
    } catch (err) {
      setSnapError(err instanceof Error ? err.message : t("versies.snapshotMislukt"));
    }
  }, [snapNotitie, t, tf]);

  const deleteSnapshot = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/testament/snapshots/${id}`);
      toast.success(tf("verwijderd"));
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setSnapError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  }, [t, tf]);

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
