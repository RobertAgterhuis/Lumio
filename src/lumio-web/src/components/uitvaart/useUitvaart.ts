"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";
import { toast } from "@/stores/toastStore";
import type {
  UitvaartWensen,
  CeremonieDetail,
  UitvaartGenodigde,
  CeremonieDetailFormData,
  GenodigdeFormData,
  UitvaartEditFormData,
} from "./types";
import {
  emptyDetailForm,
  emptyGenodigdeForm,
  emptyUitvaartEditForm,
} from "./constants";

export function useUitvaart() {
  const t = useTranslations("uitvaart");
  const tf = useTranslations("feedback");

  // Main data state
  const [data, setData] = useState<UitvaartWensen | null>(null);
  const [details, setDetails] = useState<CeremonieDetail[]>([]);
  const [genodigden, setGenodigden] = useState<UitvaartGenodigde[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Load all data
  const loadData = useCallback(() => {
    Promise.all([
      api.get<UitvaartWensen>("/api/uitvaart").catch((err) => {
        console.error("Failed to load uitvaart:", err);
        return null;
      }),
      api.get<CeremonieDetail[]>("/api/uitvaart/details").catch((err) => {
        console.error("Failed to load details:", err);
        return [];
      }),
      api.get<UitvaartGenodigde[]>("/api/uitvaart/genodigden").catch((err) => {
        console.error("Failed to load genodigden:", err);
        return [];
      }),
    ])
      .then(([u, d, g]) => {
        setData(u);
        setDetails((d ?? []).sort((a, b) => a.volgorde - b.volgorde));
        setGenodigden(g ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Uitvaart edit dialog handlers
  const openUitvaartEdit = useCallback(() => {
    if (!data) return;
    setUitvaartEditError(null);
    setUitvaartEditForm({
      voorkeurType: data.voorkeurType ?? "",
      begraafplaats: data.begraafplaats ?? "",
      uitvaartOndernemer: data.uitvaartOndernemer ?? "",
      uitvaartOndernemerTelefoon: data.uitvaartOndernemerTelefoon ?? "",
      uitvaartOndernemerEmail: data.uitvaartOndernemerEmail ?? "",
      uitvaartOndernemerAdres: data.uitvaartOndernemerAdres ?? "",
      uitvaartOndernemerPostcode: data.uitvaartOndernemerPostcode ?? "",
      uitvaartOndernemerPlaats: data.uitvaartOndernemerPlaats ?? "",
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
        uitvaartOndernemer: f.uitvaartOndernemer || null,
        uitvaartOndernemerTelefoon: f.uitvaartOndernemerTelefoon || null,
        uitvaartOndernemerEmail: f.uitvaartOndernemerEmail || null,
        uitvaartOndernemerAdres: f.uitvaartOndernemerAdres || null,
        uitvaartOndernemerPostcode: f.uitvaartOndernemerPostcode || null,
        uitvaartOndernemerPlaats: f.uitvaartOndernemerPlaats || null,
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
      setData(updated);
      setUitvaartEditOpen(false);
      toast.success(tf("opgeslagen"));
    } catch (err) {
      setUitvaartEditError(
        err instanceof Error ? err.message : t("opslaanMislukt")
      );
    }
  }, [uitvaartEditForm, t, tf]);

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
          volgorde: details.length + 1,
        });
      }
      setDetailDialogOpen(true);
    },
    [details.length]
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
      loadData();
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  }, [detailForm, editDetailId, t, tf, loadData]);

  const deleteDetail = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/uitvaart/details/${id}`);
        toast.success(tf("verwijderd"));
        setDetails((prev) => prev.filter((d) => d.id !== id));
      } catch (err) {
        setDetailError(
          err instanceof Error ? err.message : t("verwijderenMislukt")
        );
      }
    },
    [t, tf]
  );

  // Genodigde handlers
  const openGenDialog = useCallback((g?: UitvaartGenodigde) => {
    setGenError(null);
    if (g) {
      setEditGenId(g.id);
      setGenForm({
        naam: g.naam,
        relatie: g.relatie ?? "",
        telefoon: g.telefoon ?? "",
        email: g.email ?? "",
        adres: g.adres ?? "",
        postcode: g.postcode ?? "",
        woonplaats: g.woonplaats ?? "",
        notities: g.notities ?? "",
      });
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
      };
      if (editGenId) {
        await api.put(`/api/uitvaart/genodigden/${editGenId}`, payload);
        toast.success(tf("opgeslagen"));
      } else {
        await api.post("/api/uitvaart/genodigden", payload);
        toast.success(tf("aangemaakt"));
      }
      setGenDialogOpen(false);
      loadData();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : t("opslaanMislukt"));
    }
  }, [genForm, editGenId, t, tf, loadData]);

  const deleteGen = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/uitvaart/genodigden/${id}`);
        toast.success(tf("verwijderd"));
        setGenodigden((prev) => prev.filter((g) => g.id !== id));
      } catch (err) {
        setGenError(
          err instanceof Error ? err.message : t("verwijderenMislukt")
        );
      }
    },
    [t, tf]
  );

  return {
    // Data
    data,
    details,
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
