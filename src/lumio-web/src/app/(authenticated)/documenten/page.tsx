"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { FileText, Download, Trash2, Upload, Loader2, CloudUpload, History, ChevronDown, ChevronUp, AlertTriangle, Clock } from "lucide-react";
import { SectieNotitie } from "@/components/notities/SectieNotitie";

interface PersoonlijkDocument {
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

interface DocumentVersie {
  id: string;
  versie: number;
  bestandsNaam: string;
  bestandsGrootte: number;
  aangemaaktOp: string;
}

export default function DocumentenPage() {
  const [documenten, setDocumenten] = useState<PersoonlijkDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [naam, setNaam] = useState("");
  const [categorie, setCategorie] = useState("");
  const [verlooptOp, setVerlooptOp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropUploads, setDropUploads] = useState<
    { file: File; naam: string; categorie: string; status: "pending" | "uploading" | "done" | "error"; error?: string }[]
  >([]);
  const [dropDialogOpen, setDropDialogOpen] = useState(false);
  const dragCounter = useRef(0);
  const [expandedVersions, setExpandedVersions] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<DocumentVersie[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const loadData = () => {
    api
      .get<PersoonlijkDocument[]>("/api/documenten")
      .then((d) => setDocumenten(d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

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
        updateDropUpload(i, { status: "error", error: "Naam en categorie zijn verplicht." });
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
          error: err instanceof Error ? err.message : "Upload mislukt.",
        });
      }
    }
    loadData();
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !naam || !categorie) return;

    setUploading(true);
    setError(null);
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
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uploaden mislukt.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id: string, bestandsNaam: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/documenten/${id}/download`);
      if (!response.ok) throw new Error(`Download mislukt (${response.status})`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = bestandsNaam;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download mislukt.");
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await api.delete(`/api/documenten/${id}`);
      if (expandedVersions === id) setExpandedVersions(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verwijderen mislukt.");
    }
  };

  const handleDeleteAllVersions = async (id: string) => {
    setError(null);
    try {
      await api.delete(`/api/documenten/${id}/alle-versies`);
      setExpandedVersions(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verwijderen mislukt.");
    }
  };

  const toggleVersions = async (docId: string) => {
    if (expandedVersions === docId) {
      setExpandedVersions(null);
      setVersionHistory([]);
      return;
    }
    setLoadingVersions(true);
    try {
      const versies = await api.get<DocumentVersie[]>(`/api/documenten/${docId}/versies`);
      setVersionHistory(versies ?? []);
      setExpandedVersions(docId);
    } catch {
      setError("Versiegeschiedenis laden mislukt.");
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
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: "Verlopen", variant: "destructive" as const, icon: AlertTriangle };
    if (diffDays <= 30) return { label: `Verloopt over ${diffDays} dag${diffDays !== 1 ? "en" : ""}`, variant: "warning" as const, icon: Clock };
    return null;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );

  return (
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
              Bestanden hier loslaten
            </p>
            <p className="text-sm text-muted-foreground">
              Sleep bestanden hierheen om te uploaden
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documenten</h1>
          <p className="text-muted-foreground mt-1">
            Belangrijke documenten veilig opslaan
          </p>
          <SectieNotitie sectie="documenten" />
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" /> Document uploaden
        </Button>
      </div>

      <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
        <p className="text-sm text-cyan-800">
          <strong>Let op:</strong> Documenten worden versleuteld opgeslagen in de
          database. Upload hier kopieën van belangrijke documenten zoals uw
          testament, paspoort of verzekeringspapieren.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {documenten.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nog geen documenten geüpload.
            </p>
            <Button className="mt-4" onClick={() => setUploadOpen(true)}>
              Document uploaden
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Opgeslagen documenten ({documenten.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documenten.map((doc) => (
                <div key={doc.id}>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.naam}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.bestandsNaam} &mdash;{" "}
                          {formatSize(doc.bestandsGrootte)}
                          {doc.versie > 1 && ` — versie ${doc.versie}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{doc.categorie}</Badge>
                      {(() => {
                        const expiry = getExpiryStatus(doc.verlooptOp);
                        if (!expiry) return null;
                        const Icon = expiry.icon;
                        return (
                          <Badge variant={expiry.variant === "destructive" ? "destructive" : "secondary"} className={expiry.variant === "warning" ? "bg-amber-100 text-amber-800 border-amber-200" : ""}>
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
                          title="Versiegeschiedenis"
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
                        onClick={() =>
                          doc.aantalVersies > 1
                            ? handleDeleteAllVersions(doc.id)
                            : handleDelete(doc.id)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {/* Version history panel */}
                  {expandedVersions === doc.id && versionHistory.length > 0 && (
                    <div className="ml-8 mt-1 mb-2 space-y-1 border-l-2 border-muted pl-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Versiegeschiedenis
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
                              {new Date(v.aangemaaktOp).toLocaleDateString("nl-NL")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleDownload(v.id, v.bestandsNaam)}
                              title={`Download versie ${v.versie}`}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            {v.id !== doc.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDelete(v.id)}
                                title={`Verwijder versie ${v.versie}`}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
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
          <DialogTitle>Document uploaden</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Naam</Label>
            <Input
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder="bijv. Kopie testament, Paspoort"
            />
          </div>
          <div className="space-y-2">
            <Label>Categorie</Label>
            <Select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
              <option value="">Selecteer...</option>
              <option value="Testament">Testament</option>
              <option value="Identiteitsbewijs">Identiteitsbewijs</option>
              <option value="Akte">Akte</option>
              <option value="Verzekeringspolis">Verzekeringspolis</option>
              <option value="Medisch">Medisch document</option>
              <option value="Financieel">Financieel document</option>
              <option value="Overig">Overig</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bestand</Label>
            <Input ref={fileRef} type="file" />
          </div>
          <div className="space-y-2">
            <Label>Verloopdatum <span className="text-muted-foreground text-xs font-normal">(optioneel)</span></Label>
            <Input
              type="date"
              value={verlooptOp}
              onChange={(e) => setVerlooptOp(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Stel een verloopdatum in om een herinnering te ontvangen wanneer dit document vernieuwd moet worden.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setUploadOpen(false)}>
            Annuleren
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || !naam || !categorie}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploaden...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" /> Uploaden
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Drag & Drop multi-file dialog */}
      <Dialog open={dropDialogOpen} onOpenChange={setDropDialogOpen}>
        <DialogHeader>
          <DialogTitle>
            {dropUploads.length} bestand{dropUploads.length !== 1 ? "en" : ""} uploaden
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4 max-h-80 overflow-y-auto">
          {dropUploads.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-md border p-3 space-y-2",
                item.status === "done" && "border-green-200 bg-green-50",
                item.status === "error" && "border-red-200 bg-red-50"
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
                      placeholder="Naam"
                      disabled={item.status === "uploading"}
                    />
                  </div>
                  <div>
                    <Select
                      value={item.categorie}
                      onChange={(e) => updateDropUpload(idx, { categorie: e.target.value })}
                      disabled={item.status === "uploading"}
                    >
                      <option value="Testament">Testament</option>
                      <option value="Identiteitsbewijs">Identiteitsbewijs</option>
                      <option value="Akte">Akte</option>
                      <option value="Verzekeringspolis">Verzekeringspolis</option>
                      <option value="Medisch">Medisch document</option>
                      <option value="Financieel">Financieel document</option>
                      <option value="Overig">Overig</option>
                    </Select>
                  </div>
                </div>
              )}
              {item.status === "uploading" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploaden...
                </div>
              )}
              {item.status === "done" && (
                <p className="text-xs text-green-700">Geüpload</p>
              )}
              {item.status === "error" && (
                <p className="text-xs text-red-700">{item.error}</p>
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDropDialogOpen(false)}>
            Sluiten
          </Button>
          <Button
            onClick={handleDropUploadAll}
            disabled={dropUploads.some((u) => u.status === "uploading") || dropUploads.every((u) => u.status === "done")}
          >
            <Upload className="h-4 w-4 mr-2" />
            {dropUploads.every((u) => u.status === "done")
              ? "Klaar"
              : `Alles uploaden (${dropUploads.filter((u) => u.status !== "done").length})`}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
