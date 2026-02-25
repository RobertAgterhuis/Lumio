"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, downloadAndSave } from "@/lib/api-client";
import {
  Download,
  Loader2,
  Archive,
  ClipboardList,
  FileJson,
  FileCode,
  Sheet,
  Flower2,
  Users,
} from "lucide-react";
import { LumioIcon, type LumioIconName } from "@/components/ui/lumio-icon";
import type { LucideIcon } from "lucide-react";
import { useDomainQuery } from "@/hooks";
import type { Erfgenaam } from "@/components/erfgenamen/types";

const exportOptions: Array<{
  key: string;
  endpoint: string;
  lumioIcon?: LumioIconName;
  icon?: LucideIcon;
}> = [
  { key: "testament",             lumioIcon: "testament",       endpoint: "/api/export/testament" },
  { key: "euthanasie",            lumioIcon: "wilsverklaring",  endpoint: "/api/export/euthanasie" },
  { key: "donor",                 lumioIcon: "donor",           endpoint: "/api/export/donor" },
  { key: "digitaal-bezit",        lumioIcon: "digitaal-bezit",  endpoint: "/api/export/digitaal-bezit" },
  { key: "boedel",                lumioIcon: "boedel",          endpoint: "/api/export/boedel" },
  { key: "uitvaart",              lumioIcon: "uitvaart",         endpoint: "/api/export/uitvaart" },
  { key: "documenten",            lumioIcon: "documenten",       endpoint: "/api/export/documenten" },
  { key: "noodkaart",             lumioIcon: "noodcontacten",   endpoint: "/api/export/noodkaart" },
  { key: "testament-concept",     lumioIcon: "testament",       endpoint: "/api/export/testament-concept" },
  { key: "wilsverklaring",        lumioIcon: "wilsverklaring",  endpoint: "/api/export/wilsverklaring" },
  { key: "noodprocedure",         lumioIcon: "shield-alert",    endpoint: "/api/export/noodprocedure" },
  { key: "boedelbeschrijving",    icon: ClipboardList,          endpoint: "/api/export/boedelbeschrijving" },
  { key: "executeur-rapport",     icon: ClipboardList,          endpoint: "/api/export/executeur-rapport" },
  { key: "notaris",               lumioIcon: "testament",       endpoint: "/api/export/notaris" },
];

export default function ExportPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("exporteren");

  const { data: erfgenamen = [] } = useDomainQuery<Erfgenaam[]>("erfgenamen");

  const handleExport = async (key: string, endpoint: string) => {
    setDownloading(key);
    setError(null);
    try {
      await downloadAndSave(endpoint, `lumio-${key}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("exportMislukt"));
    } finally {
      setDownloading(null);
    }
  };

  const handleCompleteExport = async () => {
    setDownloading("compleet");
    setError(null);
    try {
      await downloadAndSave("/api/export/compleet", "lumio-compleet.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("exportMislukt"));
    } finally {
      setDownloading(null);
    }
  };

  const handleZipExport = async () => {
    setDownloading("zip");
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await downloadAndSave("/api/export/alles", `lumio-export-${today}.zip`, { method: "POST" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("exportMislukt"));
    } finally {
      setDownloading(null);
    }
  };

  const handleStructuredExport = async (format: "json" | "xml") => {
    const key = format;
    setDownloading(key);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await downloadAndSave(`/api/export/${format}`, `lumio-export-${today}.${format}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("exportMislukt"));
    } finally {
      setDownloading(null);
    }
  };

  const handleCsvExport = async (naam: string) => {
    const key = `csv-${naam}`;
    setDownloading(key);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await downloadAndSave(`/api/export/csv/${naam}`, `lumio-${naam}-${today}.csv`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("exportMislukt"));
    } finally {
      setDownloading(null);
    }
  };

  const handleDeelErfgenaam = async (erfgenaamId: string, voornaam: string) => {
    const key = `deel-${erfgenaamId}`;
    setDownloading(key);
    setError(null);
    try {
      await downloadAndSave(`/api/export/delen/${erfgenaamId}`, `lumio-erfgenaam-${voornaam.toLowerCase()}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("exportMislukt"));
    } finally {
      setDownloading(null);
    }
  };

  const csvOptions = [
    { naam: "erfgenamen" },
    { naam: "bezittingen" },
    { naam: "bankrekeningen" },
    { naam: "verzekeringen" },
    { naam: "schulden" },
    { naam: "noodcontacten" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("titel")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("beschrijving")}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger bg-danger-100 p-3">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" /> {t("compleetOverzicht")}
          </CardTitle>
          <CardDescription>
            {t("compleetBeschrijving")}
          </CardDescription>
          <p className="text-xs text-muted-foreground">{t("videosUitgesloten")}</p>
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
            {t("allesExporteren")}
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
            {t("compleetPakket")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" /> {t("gestructureerdeExport")}
          </CardTitle>
          <CardDescription>
            {t("gestructureerdeBeschrijving")}
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
            {t("downloadenAlsJson")}
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
            {t("downloadenAlsXml")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sheet className="h-5 w-5" /> {t("csvExport")}
          </CardTitle>
          <CardDescription>
            {t("csvBeschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          {csvOptions.map((opt) => (
            <Button
              key={opt.naam}
              variant="outline"
              size="sm"
              onClick={() => handleCsvExport(opt.naam)}
              disabled={downloading !== null}
            >
              {downloading === `csv-${opt.naam}` ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Sheet className="h-3 w-3 mr-1" />
              )}
              {t(`csvOpties.${opt.naam}`)}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flower2 className="h-5 w-5" /> {t("nuvExport")}
          </CardTitle>
          <CardDescription>
            {t("nuvBeschrijving")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={async () => {
              setDownloading("nuv");
              setError(null);
              try {
                const today = new Date().toISOString().slice(0, 10);
                await downloadAndSave("/api/export/nuv", `lumio-nuv-export-${today}.xml`);
              } catch (err) {
                setError(err instanceof Error ? err.message : t("exportMislukt"));
              } finally {
                setDownloading(null);
              }
            }}
            disabled={downloading !== null}
          >
            {downloading === "nuv" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Flower2 className="h-4 w-4 mr-2" />
            )}
            {t("nuvDownloaden")}
          </Button>
        </CardContent>
      </Card>

      {erfgenamen.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> {t("deelMetErfgenaam")}
            </CardTitle>
            <CardDescription>
              {t("deelMetErfgenaamBeschrijving")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {erfgenamen.map((e) => {
                const volNaam = e.tussenvoegsel
                  ? `${e.voornaam} ${e.tussenvoegsel} ${e.achternaam}`
                  : `${e.voornaam} ${e.achternaam}`;
                const key = `deel-${e.id}`;
                return (
                  <Button
                    key={e.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeelErfgenaam(e.id, e.voornaam)}
                    disabled={downloading !== null}
                  >
                    {downloading === key ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    {volNaam}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exportOptions.map((opt) => {
          const LucideOptIcon = opt.icon;
          return (
            <Card key={opt.key}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {opt.lumioIcon ? (
                    <LumioIcon name={opt.lumioIcon} size="sm" />
                  ) : LucideOptIcon ? (
                    <LucideOptIcon className="h-4 w-4" />
                  ) : null}
                  {t(`opties.${opt.key}`)}
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
                  {t("pdfDownloaden")}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
