"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Clock } from "lucide-react";
import { api, downloadAndSave } from "@/lib/api-client";
import { useDomainQuery } from "./useDomainQuery";
import { toast } from "@/stores/toastStore";

export interface PersoonlijkDocument {
  id: string;
  naam: string;
  categorie: string;
  bestandsNaam: string;
  bestandsGrootte: number;
  notities?: string;
  verlooptOp?: string;
  aangemaaktOp: string;
  documentGroepId: string;
  versie: number;
  aantalVersies: number;
}

export interface DocumentVersie {
  id: string;
  versie: number;
  bestandsNaam: string;
  bestandsGrootte: number;
  aangemaaktOp: string;
}

export function useDocumenten() {
  const t = useTranslations("documenten");
  const tf = useTranslations("feedback");

  const {
    data: documenten = [],
    isLoading: loading,
    refetch,
  } = useDomainQuery<PersoonlijkDocument[]>("documenten");

  const [error, setError] = useState<string | null>(null);
  const clearError = () => setError(null);

  const [expandedVersions, setExpandedVersions] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<DocumentVersie[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const handleDownload = async (id: string, bestandsNaam: string) => {
    setError(null);
    try {
      await downloadAndSave(`/api/documenten/${id}/download`, bestandsNaam);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("downloadMislukt"));
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await api.delete(`/api/documenten/${id}`);
      if (expandedVersions === id) setExpandedVersions(null);
      toast.success(tf("verwijderd"));
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  };

  const handleDeleteAllVersions = async (id: string) => {
    setError(null);
    try {
      await api.delete(`/api/documenten/${id}/alle-versies`);
      setExpandedVersions(null);
      toast.success(tf("verwijderd"));
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("verwijderenMislukt"));
    }
  };

  const updateDocument = async (
    id: string,
    data: { verlooptOp?: string | null; notities?: string | null }
  ) => {
    setError(null);
    await api.patch(`/api/documenten/${id}`, data);
    toast.success(tf("opgeslagen"));
    refetch();
  };

  const toggleVersionHistory = async (docId: string) => {
    if (expandedVersions === docId) {
      setExpandedVersions(null);
      setVersionHistory([]);
      return;
    }
    setLoadingVersions(true);
    try {
      const versies = await api.get<DocumentVersie[]>(
        `/api/documenten/${docId}/versies`
      );
      setVersionHistory(versies ?? []);
      setExpandedVersions(docId);
    } catch {
      setError(t("versieLadenMislukt"));
    } finally {
      setLoadingVersions(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getExpiryStatus = (verlooptOp?: string) => {
    if (!verlooptOp) return null;
    const expiry = new Date(verlooptOp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0)
      return { label: t("verlopen"), variant: "destructive" as const, icon: AlertTriangle };
    if (diffDays <= 30)
      return {
        label: t("verlooptOver", { dagen: diffDays }),
        variant: "warning" as const,
        icon: Clock,
      };
    return null;
  };

  return {
    documenten,
    loading,
    refetch,
    error,
    clearError,
    handleDownload,
    handleDelete,
    handleDeleteAllVersions,
    updateDocument,
    expandedVersions,
    versionHistory,
    loadingVersions,
    toggleVersionHistory,
    formatSize,
    getExpiryStatus,
  };
}
