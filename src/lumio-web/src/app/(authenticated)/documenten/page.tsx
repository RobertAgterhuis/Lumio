"use client";

import { useEffect, useState, useRef } from "react";
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
import { FileText, Download, Trash2, Upload, Loader2 } from "lucide-react";

interface PersoonlijkDocument {
  id: string;
  naam: string;
  categorie: string;
  bestandsNaam: string;
  bestandsGrootte: number;
  notities?: string;
  aangemaaktOp: string;
}

export default function DocumentenPage() {
  const [documenten, setDocumenten] = useState<PersoonlijkDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [naam, setNaam] = useState("");
  const [categorie, setCategorie] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      await api.upload("/api/documenten/uploaden", formData);
      setUploadOpen(false);
      setNaam("");
      setCategorie("");
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
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verwijderen mislukt.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documenten</h1>
          <p className="text-muted-foreground mt-1">
            Belangrijke documenten veilig opslaan
          </p>
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
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.naam}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.bestandsNaam} &mdash;{" "}
                        {formatSize(doc.bestandsGrootte)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{doc.categorie}</Badge>
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
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
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
    </div>
  );
}
