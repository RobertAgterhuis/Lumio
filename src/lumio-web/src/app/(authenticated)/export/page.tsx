"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api-client";
import {
  Download,
  ScrollText,
  Stethoscope,
  Heart,
  Globe,
  Wallet,
  Church,
  FileText,
  Loader2,
  Phone,
  ShieldAlert,
  Archive,
  ClipboardList,
  FileJson,
  FileCode,
} from "lucide-react";

const exportOptions = [
  {
    key: "testament",
    label: "Testament",
    icon: ScrollText,
    endpoint: "/api/export/testament",
  },
  {
    key: "euthanasie",
    label: "Wilsverklaring Euthanasie",
    icon: Stethoscope,
    endpoint: "/api/export/euthanasie",
  },
  {
    key: "donor",
    label: "Donorregistratie",
    icon: Heart,
    endpoint: "/api/export/donor",
  },
  {
    key: "digitaal-bezit",
    label: "Digitaal Bezit",
    icon: Globe,
    endpoint: "/api/export/digitaal-bezit",
  },
  {
    key: "boedel",
    label: "Boedel",
    icon: Wallet,
    endpoint: "/api/export/boedel",
  },
  {
    key: "uitvaart",
    label: "Uitvaartwensen",
    icon: Church,
    endpoint: "/api/export/uitvaart",
  },
  {
    key: "documenten",
    label: "Documenten",
    icon: FileText,
    endpoint: "/api/export/documenten",
  },
  {
    key: "noodkaart",
    label: "Noodkaart",
    icon: Phone,
    endpoint: "/api/export/noodkaart",
  },
  {
    key: "testament-concept",
    label: "Testament Concept (wettelijk)",
    icon: ScrollText,
    endpoint: "/api/export/testament-concept",
  },
  {
    key: "wilsverklaring",
    label: "Wilsverklaring Euthanasie (wettelijk)",
    icon: Stethoscope,
    endpoint: "/api/export/wilsverklaring",
  },
  {
    key: "noodprocedure",
    label: "Noodprocedure & Instructie",
    icon: ShieldAlert,
    endpoint: "/api/export/noodprocedure",
  },
  {
    key: "boedelbeschrijving",
    label: "Boedelbeschrijving (wettelijk)",
    icon: ClipboardList,
    endpoint: "/api/export/boedelbeschrijving",
  },
];

export default function ExportPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (key: string, endpoint: string) => {
    setDownloading(key);
    setError(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
      });
      if (response.status === 423) { window.location.href = "/"; return; }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Export mislukt (${response.status})`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lumio-${key}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export mislukt.");
    } finally {
      setDownloading(null);
    }
  };

  const handleCompleteExport = async () => {
    setDownloading("compleet");
    setError(null);
    try {
      const response = await fetch("/api/export/compleet", {
        method: "POST",
      });
      if (response.status === 423) { window.location.href = "/"; return; }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Export mislukt (${response.status})`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lumio-compleet.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export mislukt.");
    } finally {
      setDownloading(null);
    }
  };

  const handleZipExport = async () => {
    setDownloading("zip");
    setError(null);
    try {
      const response = await fetch("/api/export/alles", {
        method: "POST",
      });
      if (response.status === 423) { window.location.href = "/"; return; }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Export mislukt (${response.status})`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `lumio-export-${today}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export mislukt.");
    } finally {
      setDownloading(null);
    }
  };

  const handleStructuredExport = async (format: "json" | "xml") => {
    const key = format;
    setDownloading(key);
    setError(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
      const response = await fetch(`${API_BASE}/api/export/${format}`);
      if (response.status === 423) { window.location.href = "/"; return; }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Export mislukt (${response.status})`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `lumio-export-${today}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export mislukt.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exporteren</h1>
        <p className="text-muted-foreground mt-1">
          Download uw gegevens als PDF-documenten
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" /> Compleet overzicht
          </CardTitle>
          <CardDescription>
            Exporteer alle vastgelegde informatie in één PDF-document.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button
            onClick={handleCompleteExport}
            disabled={downloading !== null}
          >
            {downloading === "compleet" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Alles exporteren als PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleZipExport}
            disabled={downloading !== null}
          >
            {downloading === "zip" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Archive className="h-4 w-4 mr-2" />
            )}
            Compleet pakket (ZIP)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" /> Gestructureerde export
          </CardTitle>
          <CardDescription>
            Exporteer alle gegevens als JSON of XML — ideaal voor overdracht aan
            een notaris of ander systeem. Wachtwoorden en gevoelige gegevens
            worden uitgesloten.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => handleStructuredExport("json")}
            disabled={downloading !== null}
          >
            {downloading === "json" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileJson className="h-4 w-4 mr-2" />
            )}
            Downloaden als JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => handleStructuredExport("xml")}
            disabled={downloading !== null}
          >
            {downloading === "xml" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileCode className="h-4 w-4 mr-2" />
            )}
            Downloaden als XML
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exportOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <Card key={opt.key}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4" /> {opt.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(opt.key, opt.endpoint)}
                  disabled={downloading !== null}
                >
                  {downloading === opt.key ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3 mr-1" />
                  )}
                  PDF downloaden
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
