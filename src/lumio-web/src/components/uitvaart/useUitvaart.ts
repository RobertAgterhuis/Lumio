"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { useDomainQuery, useInvalidateStatusKeys } from "@/hooks";
import { toast } from "@/stores/toastStore";
import type {
  UitvaartWensen,
  CeremonieDetail,
  UitvaartGenodigde,
  CeremonieDetailFormData,
  GenodigdeFormData,
  UitvaartEditFormData,
  LocatieEditFormData,
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
import {
  emptyDetailForm,
  emptyGenodigdeForm,
  emptyUitvaartEditForm,
  emptyLocatieEditForm,
} from "./constants";

export function useUitvaart() {
  const t = useTranslations("uitvaart");
  const tf = useTranslations("feedback");

  // React Query hooks for data fetching
  const { data, isLoading: loadingData, refetch: refetchData } = useDomainQuery<UitvaartWensen | null>("uitvaart");
  const { data: details = [], isLoading: loadingDetails, refetch: refetchDetails } = useDomainQuery<CeremonieDetail[]>("uitvaart/details");
  const { data: genodigden = [], isLoading: loadingGenodigden, refetch: refetchGenodigden } = useDomainQuery<UitvaartGenodigde[]>("uitvaart/genodigden");

  const loading = loadingData || loadingDetails || loadingGenodigden;
  const sortedDetails = [...details].sort((a, b) => a.volgorde - b.volgorde);

  const refetchAll = useCallback(() => {
    refetchData();
    refetchDetails();
    refetchGenodigden();
  }, [refetchData, refetchDetails, refetchGenodigden]);

  const invalidateStatus = useInvalidateStatusKeys();

  // Ceremonie detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDetailId, setEditDetailId] = useState<string | null>(null);
  const [detailForm, setDetailForm] =
    useState<CeremonieDetailFormData>(emptyDetailForm);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Genodigde dialog state
  const [genDialogOpen, setGenDialogOpen] = useState(false);
  const [editGenId, setEditGenId] = useState<string | null>(null);
  const [genForm, setGenForm] = useState<GenodigdeFormData>(emptyGenodigdeForm);
  const [genError, setGenError] = useState<string | null>(null);

  // Uitvaart edit dialog state
  const [uitvaartEditOpen, setUitvaartEditOpen] = useState(false);
  const [uitvaartEditForm, setUitvaartEditForm] =
    useState<UitvaartEditFormData>(emptyUitvaartEditForm);
  const [uitvaartEditError, setUitvaartEditError] = useState<string | null>(
    null
  );

  // Locatie edit dialog state
  const [locatieEditOpen, setLocatieEditOpen] = useState(false);
  const [locatieEditForm, setLocatieEditForm] =
    useState<LocatieEditFormData>(emptyLocatieEditForm);
  const [locatieEditError, setLocatieEditError] = useState<string | null>(null);

  // Uitvaart edit dialog handlers
  const openUitvaartEdit = useCallback(async () => {
    if (!data) return;
    setUitvaartEditError(null);

    // Start with existing uitvaart data
    let uitvaartOndernemerContactId = data.uitvaartOndernemerContactId ?? null;

    // If no funeral director selected yet, try to load from eigenaar profile
    if (!uitvaartOndernemerContactId) {
      try {
        const eigenaar = await api.get<{ uitvaartOndernemerContactId?: string | null }>("/api/eigenaar");
        if (eigenaar?.uitvaartOndernemerContactId) {
          uitvaartOndernemerContactId = eigenaar.uitvaartOndernemerContactId;
        }
      } catch {
        // Silently fail — show existing saved data or empty field
      }
    }

    setUitvaartEditForm({
      voorkeurType: data.voorkeurType ?? "",
      begraafplaats: data.begraafplaats ?? "",
      uitvaartOndernemerContactId: uitvaartOndernemerContactId,
      heeftUitvaartVerzekering: data.heeftUitvaartVerzekering ?? false,
      uitvaartVerzekeringDetails: data.uitvaartVerzekeringDetails ?? "",
      ceremonieSoort: data.ceremonieSoort ?? "",
      ceremonieLocatie: data.ceremonieLocatie ?? "",
      muziekwensen: data.muziekwensen ?? "",
      sprekers: data.sprekers ?? "",
      bloemen: data.bloemen ?? "",
      kledingwensen: data.kledingwensen ?? "",
      rouwkaartTekst: data.rouwkaartTekst ?? "",
      rouwadvertentieTekst: data.rouwadvertentieTekst ?? "",
      condoleance: data.condoleance ?? "",
      overigeWensen: data.overigeWensen ?? "",
      voorkeurBegraafplaatsNaam: data.voorkeurBegraafplaatsNaam ?? "",
      voorkeurBegraafplaatsAdres: data.voorkeurBegraafplaatsAdres ?? "",
      voorkeurCrematoriumnaam: data.voorkeurCrematoriumnaam ?? "",
      voorkeurCrematoriumAdres: data.voorkeurCrematoriumAdres ?? "",
      voorkeurAulaNaam: data.voorkeurAulaNaam ?? "",
      voorkeurAulaAdres: data.voorkeurAulaAdres ?? "",
      budgetRichting: data.budgetRichting ?? "",
    });
    setUitvaartEditOpen(true);
  }, [data]);

  const saveUitvaartEdit = useCallback(async () => {
    setUitvaartEditError(null);
    try {
      const f = uitvaartEditForm;
      const payload = {
        voorkeurType: f.voorkeurType,
        begraafplaats: f.begraafplaats || null,
        uitvaartOndernemerContactId: f.uitvaartOndernemerContactId || null,
        heeftUitvaartVerzekering: f.heeftUitvaartVerzekering,
        uitvaartVerzekeringDetails: f.uitvaartVerzekeringDetails || null,
        ceremonieSoort: f.ceremonieSoort || null,
        ceremonieLocatie: f.ceremonieLocatie || null,
        muziekwensen: f.muziekwensen || null,
        sprekers: f.sprekers || null,
        bloemen: f.bloemen || null,
        kledingwensen: f.kledingwensen || null,
        rouwkaartTekst: f.rouwkaartTekst || null,
        rouwadvertentieTekst: f.rouwadvertentieTekst || null,
        condoleance: f.condoleance || null,
        overigeWensen: f.overigeWensen || null,
        voorkeurBegraafplaatsNaam: f.voorkeurBegraafplaatsNaam || null,
        voorkeurBegraafplaatsAdres: f.voorkeurBegraafplaatsAdres || null,
        voorkeurCrematoriumnaam: f.voorkeurCrematoriumnaam || null,
        voorkeurCrematoriumAdres: f.voorkeurCrematoriumAdres || null,
        voorkeurAulaNaam: f.voorkeurAulaNaam || null,
        voorkeurAulaAdres: f.voorkeurAulaAdres || null,
        budgetRichting: f.budgetRichting || null,
      };
      const updated = await api.put<UitvaartWensen>("/api/uitvaart", payload);
      refetchData();
      invalidateStatus();
      setUitvaartEditOpen(false);
      toast.success(tf("opgeslagen"));
    } catch (err) {
      setUitvaartEditError(
        err instanceof Error ? err.message : t("opslaanMislukt")
      );
    }
  }, [uitvaartEditForm, t, tf, refetchData]);

  // Locatie edit handlers
  const openLocatieEdit = useCallback(() => {
    if (!data) return;
    setLocatieEditError(null);
    setLocatieEditForm({
      voorkeurBegraafplaatsNaam: data.voorkeurBegraafplaatsNaam ?? "",
      voorkeurBegraafplaatsAdres: data.voorkeurBegraafplaatsAdres ?? "",
      voorkeurCrematoriumnaam: data.voorkeurCrematoriumnaam ?? "",
      voorkeurCrematoriumAdres: data.voorkeurCrematoriumAdres ?? "",
      voorkeurAulaNaam: data.voorkeurAulaNaam ?? "",
      voorkeurAulaAdres: data.voorkeurAulaAdres ?? "",
    });
    setLocatieEditOpen(true);
  }, [data]);

  const saveLocatieEdit = useCallback(async () => {
    if (!data) return;
    setLocatieEditError(null);
    try {
      const d = data;
      const f = locatieEditForm;
      const payload = {
        voorkeurType: d.voorkeurType,
        begraafplaats: d.begraafplaats || null,
        uitvaartOndernemerContactId: d.uitvaartOndernemerContactId || null,
        heeftUitvaartVerzekering: d.heeftUitvaartVerzekering ?? false,
        uitvaartVerzekeringDetails: d.uitvaartVerzekeringDetails || null,
        ceremonieSoort: d.ceremonieSoort || null,
        ceremonieLocatie: d.ceremonieLocatie || null,
        muziekwensen: d.muziekwensen || null,
        sprekers: d.sprekers || null,
        bloemen: d.bloemen || null,
        kledingwensen: d.kledingwensen || null,
        rouwkaartTekst: d.rouwkaartTekst || null,
        rouwadvertentieTekst: d.rouwadvertentieTekst || null,
        condoleance: d.condoleance || null,
        overigeWensen: d.overigeWensen || null,
        voorkeurBegraafplaatsNaam: f.voorkeurBegraafplaatsNaam || null,
        voorkeurBegraafplaatsAdres: f.voorkeurBegraafplaatsAdres || null,
        voorkeurCrematoriumnaam: f.voorkeurCrematoriumnaam || null,
        voorkeurCrematoriumAdres: f.voorkeurCrematoriumAdres || null,
        voorkeurAulaNaam: f.voorkeurAulaNaam || null,
        voorkeurAulaAdres: f.voorkeurAulaAdres || null,
        budgetRichting: d.budgetRichting || null,
      };
      await api.put<UitvaartWensen>("/api/uitvaart", payload);
      refetchData();
      invalidateStatus();
      setLocatieEditOpen(false);
      toast.success(tf("opgeslagen"));
    } catch (err) {
      setLocatieEditError(
        err instanceof Error ? err.message : t("opslaanMislukt")
      );
    }
  }, [data, locatieEditForm, t, tf, refetchData]);

  // Ceremonie detail handlers
  const openDetailDialog = useCallback(
    (detail?: CeremonieDetail) => {
      setDetailError(null);
      if (detail) {
        setEditDetailId(detail.id);
        setDetailForm({
          onderdeel: detail.onderdeel,
          beschrijving: detail.beschrijving ?? "",
          volgorde: detail.volgorde,
          muziek: detail.muziek ?? "",
          spreker: detail.spreker ?? "",
          tekstlezing: detail.tekstlezing ?? "",
          dresscode: detail.dresscode ?? "",
        });
      } else {
        setEditDetailId(null);
        setDetailForm({
          ...emptyDetailForm,
          volgorde: sortedDetails.length + 1,
        });
      }
      setDetailDialogOpen(true);
    },
    [sortedDetails.length]
  );

  const saveDetail = useCallback(async () => {
    setDetailError(null);
    try {
      const payload = {
        onderdeel: detailForm.onderdeel,
        beschrijving: detailForm.beschrijving || null,
        volgorde: detailForm.volgorde,
        muziek: detailForm.muziek || null,
        spreker: detailForm.spreker || null,
        tekstlezing: detailForm.tekstlezing || null,
        dresscode: detailForm.dresscode || null,
      };
      if (editDetailId) {
        await api.put(`/api/uitvaart/details/${editDetailId}`, payload);
        toast.success(tf("opgeslagen"));
      } else {
        await api.post("/api/uitvaart/details", payload);
        toast.success(tf("aangemaakt"));
      }
      setDetailDialogOpen(false);
      refetchDetails();
      invalidateStatus();
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  }, [detailForm, editDetailId, t, tf, refetchDetails]);

  const deleteDetail = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/uitvaart/details/${id}`);
        toast.success(tf("verwijderd"));
        refetchDetails();
        invalidateStatus();
      } catch (err) {
        setDetailError(
          err instanceof Error ? err.message : t("verwijderenMislukt")
        );
      }
    },
    [t, tf, refetchDetails]
  );

  // Genodigde handlers
  const openGenDialog = useCallback(async (g?: UitvaartGenodigde) => {
    setGenError(null);
    if (g) {
      setEditGenId(g.id);
      let form: GenodigdeFormData = {
        naam: g.naam,
        relatie: g.relatie ?? "",
        telefoon: g.telefoon ?? "",
        email: g.email ?? "",
        adres: g.adres ?? "",
        postcode: g.postcode ?? "",
        woonplaats: g.woonplaats ?? "",
        notities: g.notities ?? "",
        erfgenaamId: g.erfgenaamId,
        noodcontactId: g.noodcontactId,
      };
      // M4-5: Auto-sync contact data if linked to a person record
      if (g.erfgenaamId) {
        try {
          const e = await api.get<ErfgenaamSyncResponse>(`/api/erfgenamen/${g.erfgenaamId}`);
          const naam = e.tussenvoegsel ? `${e.voornaam} ${e.tussenvoegsel} ${e.achternaam}` : `${e.voornaam} ${e.achternaam}`;
          form = { ...form, naam, relatie: e.relatie ?? form.relatie, telefoon: e.telefoon ?? form.telefoon, email: e.email ?? form.email, adres: e.adres ?? form.adres, postcode: e.postcode ?? form.postcode, woonplaats: e.woonplaats ?? form.woonplaats };
        } catch { /* silently fail — show existing saved data */ }
      } else if (g.noodcontactId) {
        try {
          const n = await api.get<NoodcontactSyncResponse>(`/api/noodcontacten/${g.noodcontactId}`);
          form = { ...form, naam: n.naam, relatie: n.relatie ?? form.relatie, telefoon: n.telefoon ?? form.telefoon, email: n.email ?? form.email, adres: n.adres ?? form.adres, postcode: n.postcode ?? form.postcode, woonplaats: n.woonplaats ?? form.woonplaats };
        } catch { /* silently fail */ }
      }
      setGenForm(form);
    } else {
      setEditGenId(null);
      setGenForm(emptyGenodigdeForm);
    }
    setGenDialogOpen(true);
  }, []);

  const saveGen = useCallback(async () => {
    setGenError(null);
    try {
      const payload = {
        naam: genForm.naam,
        relatie: genForm.relatie || null,
        telefoon: genForm.telefoon || null,
        email: genForm.email || null,
        adres: genForm.adres || null,
        postcode: genForm.postcode || null,
        woonplaats: genForm.woonplaats || null,
        notities: genForm.notities || null,
        erfgenaamId: genForm.erfgenaamId ?? null,
        noodcontactId: genForm.noodcontactId ?? null,
      };
      if (editGenId) {
        await api.put(`/api/uitvaart/genodigden/${editGenId}`, payload);
        toast.success(tf("opgeslagen"));
      } else {
        await api.post("/api/uitvaart/genodigden", payload);
        toast.success(tf("aangemaakt"));
      }
      setGenDialogOpen(false);
      refetchGenodigden();
      invalidateStatus();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  }, [genForm, editGenId, t, tf, refetchGenodigden]);

  const deleteGen = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/uitvaart/genodigden/${id}`);
        toast.success(tf("verwijderd"));
        refetchGenodigden();
        invalidateStatus();
      } catch (err) {
        setGenError(
          err instanceof Error ? err.message : t("verwijderenMislukt")
        );
      }
    },
    [t, tf, refetchGenodigden]
  );

  return {
    // Data
    data,
    details: sortedDetails,
    genodigden,
    loading,

    // Uitvaart edit dialog
    uitvaartEditOpen,
    setUitvaartEditOpen,
    uitvaartEditForm,
    setUitvaartEditForm,
    uitvaartEditError,
    openUitvaartEdit,
    saveUitvaartEdit,

    // Locatie edit dialog
    locatieEditOpen,
    setLocatieEditOpen,
    locatieEditForm,
    setLocatieEditForm,
    locatieEditError,
    openLocatieEdit,
    saveLocatieEdit,

    // Detail dialog
    detailDialogOpen,
    setDetailDialogOpen,
    editDetailId,
    detailForm,
    setDetailForm,
    detailError,
    openDetailDialog,
    saveDetail,
    deleteDetail,

    // Genodigde dialog
    genDialogOpen,
    setGenDialogOpen,
    editGenId,
    genForm,
    setGenForm,
    genError,
    openGenDialog,
    saveGen,
    deleteGen,
  };
}
