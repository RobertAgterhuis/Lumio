"use client";

import { PageTransition } from "@/components/ui/transitions";
import { PageSkeleton } from "@/components/ui/skeleton";
import { useState, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { useDocumenten, useInvalidateStatusKeys, type PersoonlijkDocument } from "@/hooks";
import { cn } from "@/lib/utils";
import { FileText, Download, Trash2, Upload, Loader2, CloudUpload, History, ChevronDown, ChevronUp, AlertTriangle, Pencil } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";
import { SectieNotitie } from "@/components/notities/SectieNotitie";
import { DomainStatusBanner } from "@/components/domain/DomainStatusBanner";
import { PageBanner } from "@/components/layout/PageBanner";
import { toast } from "@/stores/toastStore";
import { HelpButton } from "@/components/help/HelpButton";
import { HelpEmptyState } from "@/components/help/HelpEmptyState";

const CATEGORIE_KEYS: Record<string, string> = {
  "Testament": "testament",
  "Identiteitsbewijs": "identiteitsbewijs",
  "Akte": "akte",
  "Verzekeringspolis": "verzekeringspolis",
  "Medisch": "medisch",
  "Financieel": "financieel",
  "Overig": "overig",
};

export default function DocumentenPage() {
  const t = useTranslations("documenten");
  const tEnum = useTranslations("enums");
  const tf = useTranslations("feedback");
  const locale = useLocale();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [naam, setNaam] = useState("");
  const [categorie, setCategorie] = useState("");
  const [verlooptOp, setVerlooptOp] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropUploads, setDropUploads] = useState<
    { file: File; naam: string; categorie: string; status: "pending" | "uploading" | "done" | "error"; error?: string }[]
  >([]);
  const [dropDialogOpen, setDropDialogOpen] = useState(false);
  const dragCounter = useRef(0);
  const [confirmDeleteAllId, setConfirmDeleteAllId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // S3-33: Edit dialog for verlooptOp and notities
  const [editDocOpen, setEditDocOpen] = useState(false);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [editDocForm, setEditDocForm] = useState({ verlooptOp: "", notities: "" });
  const [editDocError, setEditDocError] = useState<string | null>(null);

  const {
    documenten,
    loading,
    refetch,
    error,
    handleDownload,
    handleDelete,
    handleDeleteAllVersions,
    updateDocument,
    expandedVersions,
    versionHistory,
    loadingVersions,
    toggleVersionHistory: toggleVersions,
    formatSize,
    getExpiryStatus,
  } = useDocumenten();

  const invalidateStatus = useInvalidateStatusKeys();

  const openEditDoc = (doc: PersoonlijkDocument) => {
    setEditDocId(doc.id);
    setEditDocForm({
      verlooptOp: doc.verlooptOp ?? "",
      notities: doc.notities ?? "",
    });
    setEditDocError(null);
    setEditDocOpen(true);
  };

  const saveEditDoc = async () => {
    if (!editDocId) return;
    setEditDocError(null);
    try {
      await updateDocument(editDocId, {
        verlooptOp: editDocForm.verlooptOp || null,
        notities: editDocForm.notities || null,
      });
      setEditDocOpen(false);
    } catch (err) {
      setEditDocError(err instanceof Error ? err.message : t("editDialog.opslaanMislukt"));
    }
  };

  // --- Drag & Drop handlers ---
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setDropUploads(
      files.map((file) => ({
        file,
        naam: file.name.replace(/\.[^.]+$/, ""),
        categorie: "Overig",
        status: "pending" as const,
      }))
    );
    setDropDialogOpen(true);
  }, []);

  const updateDropUpload = (index: number, updates: Partial<typeof dropUploads[0]>) => {
    setDropUploads((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const handleDropUploadAll = async () => {
    for (let i = 0; i < dropUploads.length; i++) {
      const item = dropUploads[i];
      if (item.status === "done") continue;
      if (!item.naam || !item.categorie) {
        updateDropUpload(i, { status: "error", error: t("naamCategorieVerplicht") });
        continue;
      }

      updateDropUpload(i, { status: "uploading" });
      try {
        const formData = new FormData();
        formData.append("bestand", item.file);
        formData.append("naam", item.naam);
        formData.append("categorie", item.categorie);
        await api.upload("/api/documenten/uploaden", formData);
        updateDropUpload(i, { status: "done" });
      } catch (err) {
        updateDropUpload(i, {
          status: "error",
          error: err instanceof Error ? err.message : t("uploadMislukt"),
        });
      }
    }
    refetch();
    invalidateStatus();
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !naam || !categorie) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("bestand", file);
      formData.append("naam", naam);
      formData.append("categorie", categorie);
      if (verlooptOp) formData.append("verlooptOp", verlooptOp);
      await api.upload("/api/documenten/uploaden", formData);
      setUploadOpen(false);
      setNaam("");
      setCategorie("");
      setVerlooptOp("");
      if (fileRef.current) fileRef.current.value = "";
      toast.success(tf("aangemaakt"));
      refetch();
      invalidateStatus();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t("uploadenMislukt"));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <PageTransition>
    <div
      className="space-y-6 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drop zone overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <CloudUpload className="h-12 w-12 text-primary" />
            <p className="text-lg font-semibold text-primary">
              {t("dropzone.titel")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("dropzone.beschrijving")}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <LumioIcon name="documenten" size="lg" className="text-primary" />
            {t("titel")}
            <HelpButton />
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("beschrijving")}
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" /> {t("uploaden")}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <SectieNotitie sectie="documenten" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DomainStatusBanner domein="documenten" />
        <PageBanner id="documenten-letop" variant="info" inline>
          {t.rich("letOp", { strong: (chunks) => <strong>{chunks}</strong> })}
        </PageBanner>
      </div>

      {(error || uploadError) && (
        <div className="rounded-lg border border-danger bg-danger-100 p-3">
          <p className="text-sm text-danger">{error ?? uploadError}</p>
        </div>
      )}

      {documenten.length === 0 ? (
        <HelpEmptyState
          chapterSlug="documenten"
          domeinLabel="documenten"
          addLabel={t("uploaden")}
          onAdd={() => setUploadOpen(true)}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="bg-sage-100 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
            <FileText className="h-5 w-5 text-sage shrink-0" />
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-sage leading-tight">
                {t("opgeslagenDocumenten", { aantal: documenten.length })}
              </h2>
            </div>
          </div>
          <CardContent className="pt-5">
            <div className="space-y-2">
              {documenten.map((doc) => (
                <div key={doc.id}>
                  <div className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.naam}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.bestandsNaam} &mdash;{" "}
                          {formatSize(doc.bestandsGrootte)}
                          {doc.versie > 1 && ` — ${t("versie", { nummer: doc.versie })}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{tEnum(`documentCategorie.${CATEGORIE_KEYS[doc.categorie] ?? "overig"}`)}</Badge>
                      {(() => {
                        const expiry = getExpiryStatus(doc.verlooptOp);
                        if (!expiry) return null;
                        const Icon = expiry.icon;
                        return (
                          <Badge variant={expiry.variant === "destructive" ? "destructive" : "secondary"} className={expiry.variant === "warning" ? "bg-warning-100 text-warning border-warning" : ""}>
                            <Icon className="h-3 w-3 mr-1" />
                            {expiry.label}
                          </Badge>
                        );
                      })()}
                      {doc.aantalVersies > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVersions(doc.id)}
                          disabled={loadingVersions}
                          title={t("versiegeschiedenis")}
                        >
                          <History className="h-4 w-4 mr-1" />
                          <span className="text-xs">{doc.aantalVersies}</span>
                          {expandedVersions === doc.id ? (
                            <ChevronUp className="h-3 w-3 ml-0.5" />
                          ) : (
                            <ChevronDown className="h-3 w-3 ml-0.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc.id, doc.bestandsNaam)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDoc(doc)}
                        title={t("editDialog.bewerken")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          doc.aantalVersies > 1
                            ? setConfirmDeleteAllId(doc.id)
                            : setConfirmDeleteId(doc.id)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </div>
                  {/* Version history panel */}
                  {expandedVersions === doc.id && versionHistory.length > 0 && (
                    <div className="ml-8 mt-1 mb-2 space-y-1 border-l-2 border-muted pl-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {t("versiegeschiedenis")}
                      </p>
                      {versionHistory.map((v) => (
                        <div
                          key={v.id}
                          className={cn(
                            "flex items-center justify-between rounded px-3 py-1.5 text-sm",
                            v.id === doc.id
                              ? "bg-primary/10 font-medium"
                              : "hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={v.id === doc.id ? "default" : "secondary"}
                              className="text-xs px-1.5 py-0"
                            >
                              v{v.versie}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {v.bestandsNaam} — {formatSize(v.bestandsGrootte)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(v.aangemaaktOp).toLocaleDateString(locale)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleDownload(v.id, v.bestandsNaam)}
                              title={t("versieDownload", { versie: v.versie })}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            {v.id !== doc.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDelete(v.id)}
                                title={t("versieVerwijder", { versie: v.versie })}
                              >
                                <Trash2 className="h-3 w-3 text-danger" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {/* S9-05: Upload nieuwe versie */}
                      <div className="pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            setNaam(doc.naam);
                            setCategorie(doc.categorie);
                            setVerlooptOp("");
                            setUploadOpen(true);
                          }}
                        >
                          <Upload className="h-3 w-3" />
                          {t("nieuweVersieUploaden")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogHeader>
          <DialogTitle>{t("uploadDialog.titel")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("uploadDialog.naam")}</Label>
            <Input
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder={t("uploadDialog.naamPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("uploadDialog.categorie")}</Label>
            <Select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
              <option value="">{tEnum("documentCategorie.selecteer")}</option>
              <option value="Testament">{tEnum("documentCategorie.testament")}</option>
              <option value="Identiteitsbewijs">{tEnum("documentCategorie.identiteitsbewijs")}</option>
              <option value="Akte">{tEnum("documentCategorie.akte")}</option>
              <option value="Verzekeringspolis">{tEnum("documentCategorie.verzekeringspolis")}</option>
              <option value="Medisch">{tEnum("documentCategorie.medisch")}</option>
              <option value="Financieel">{tEnum("documentCategorie.financieel")}</option>
              <option value="Overig">{tEnum("documentCategorie.overig")}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("uploadDialog.bestand")}</Label>
            <Input ref={fileRef} type="file" />
          </div>
          <div className="space-y-2">
            <Label>{t("uploadDialog.verloopdatum")} <span className="text-muted-foreground text-xs font-normal">{t("uploadDialog.optioneel")}</span></Label>
            <Input
              type="date"
              value={verlooptOp}
              onChange={(e) => setVerlooptOp(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("uploadDialog.verloopdatumHint")}
            </p>
            {verlooptOp && new Date(verlooptOp) < new Date(new Date().toDateString()) && (
              <p className="text-sm text-warning flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {t("uploadDialog.verloopdatumVerleden")}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setUploadOpen(false)}>
            {t("uploadDialog.annuleren")}
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || !naam || !categorie}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("uploadDialog.uploadenBezig")}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" /> {t("uploadDialog.uploaden")}
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Drag & Drop multi-file dialog */}
      <Dialog open={dropDialogOpen} onOpenChange={setDropDialogOpen}>
        <DialogHeader>
          <DialogTitle>
            {t("dropDialog.titel", { aantal: dropUploads.length })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4 max-h-80 overflow-y-auto">
          {dropUploads.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-md border p-3 space-y-2",
                item.status === "done" && "border-success bg-success-100 dark:bg-success/20",
                item.status === "error" && "border-danger bg-danger-100 dark:bg-danger/20"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                <span className="text-xs text-muted-foreground">{formatSize(item.file.size)}</span>
              </div>
              {item.status !== "done" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      value={item.naam}
                      onChange={(e) => updateDropUpload(idx, { naam: e.target.value })}
                      placeholder={t("dropDialog.naamPlaceholder")}
                      disabled={item.status === "uploading"}
                    />
                  </div>
                  <div>
                    <Select
                      value={item.categorie}
                      onChange={(e) => updateDropUpload(idx, { categorie: e.target.value })}
                      disabled={item.status === "uploading"}
                    >
                      <option value="Testament">{tEnum("documentCategorie.testament")}</option>
                      <option value="Identiteitsbewijs">{tEnum("documentCategorie.identiteitsbewijs")}</option>
                      <option value="Akte">{tEnum("documentCategorie.akte")}</option>
                      <option value="Verzekeringspolis">{tEnum("documentCategorie.verzekeringspolis")}</option>
                      <option value="Medisch">{tEnum("documentCategorie.medisch")}</option>
                      <option value="Financieel">{tEnum("documentCategorie.financieel")}</option>
                      <option value="Overig">{tEnum("documentCategorie.overig")}</option>
                    </Select>
                  </div>
                </div>
              )}
              {item.status === "uploading" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> {t("dropDialog.uploadenBezig")}
                </div>
              )}
              {item.status === "done" && (
                <p className="text-xs text-success">{t("dropDialog.geupload")}</p>
              )}
              {item.status === "error" && (
                <p className="text-xs text-danger">{item.error}</p>
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDropDialogOpen(false)}>
            {t("dropDialog.sluiten")}
          </Button>
          <Button
            onClick={handleDropUploadAll}
            disabled={dropUploads.some((u) => u.status === "uploading") || dropUploads.every((u) => u.status === "done")}
          >
            <Upload className="h-4 w-4 mr-2" />
            {dropUploads.every((u) => u.status === "done")
              ? t("dropDialog.klaar")
              : t("dropDialog.allesUploaden", { aantal: dropUploads.filter((u) => u.status !== "done").length })}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Confirm delete single version dialog */}
      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
      >
        <DialogHeader>
          <DialogTitle>{t("verwijderenTitel")}</DialogTitle>
        </DialogHeader>
        <p className="py-4 text-sm text-muted-foreground">
          {t("verwijderenBevestig")}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
            {t("uploadDialog.annuleren")}
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (confirmDeleteId) {
                await handleDelete(confirmDeleteId);
                setConfirmDeleteId(null);
              }
            }}
          >
            {t("verwijderen")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Confirm delete all versions dialog */}
      <Dialog
        open={confirmDeleteAllId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteAllId(null); }}
      >
        <DialogHeader>
          <DialogTitle>{t("verwijderenAlleVersiesTitel")}</DialogTitle>
        </DialogHeader>
        <p className="py-4 text-sm text-muted-foreground">
          {t("verwijderenAlleVersiesBevestig")}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmDeleteAllId(null)}>
            {t("uploadDialog.annuleren")}
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (confirmDeleteAllId) {
                await handleDeleteAllVersions(confirmDeleteAllId);
                setConfirmDeleteAllId(null);
              }
            }}
          >
            {t("verwijderenAlleVersies")}
          </Button>
        </DialogFooter>
      </Dialog>
      {/* S3-33: Edit document dialog (verlooptOp + notities) */}
      <Dialog open={editDocOpen} onOpenChange={setEditDocOpen}>
        <DialogHeader>
          <DialogTitle>{t("editDialog.titel")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {editDocError && (
            <div className="rounded-lg border border-danger bg-danger-100 dark:bg-danger/20 p-2">
              <p className="text-sm text-danger">{editDocError}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>{t("uploadDialog.verloopdatum")} <span className="text-muted-foreground text-xs font-normal">{t("uploadDialog.optioneel")}</span></Label>
            <Input
              type="date"
              value={editDocForm.verlooptOp}
              onChange={(e) => setEditDocForm((f) => ({ ...f, verlooptOp: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("editDialog.notities")} <span className="text-muted-foreground text-xs font-normal">{t("uploadDialog.optioneel")}</span></Label>
            <Textarea
              value={editDocForm.notities}
              onChange={(e) => setEditDocForm((f) => ({ ...f, notities: e.target.value }))}
              rows={3}
              placeholder={t("editDialog.notitiesPlaceholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditDocOpen(false)}>{t("uploadDialog.annuleren")}</Button>
          <Button onClick={saveEditDoc}>{t("editDialog.opslaan")}</Button>
        </DialogFooter>
      </Dialog>

    </div>
    </PageTransition>
  );
}
