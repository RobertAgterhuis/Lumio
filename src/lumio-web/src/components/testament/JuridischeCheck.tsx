"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Info, CheckCircle, Loader2 } from "lucide-react";
import { LumioIcon } from "@/components/ui/lumio-icon";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/lib/api-client";

interface Waarschuwing {
  ernst: "hoog" | "middel" | "info";
  categorie: string;
  melding: string;
  suggestie: string;
}

interface CheckResult {
  aantalWaarschuwingen: number;
  waarschuwingen: Waarschuwing[];
}

export function JuridischeCheck() {
  const t = useTranslations("juridischeCheck");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // S5-04: Automatisch controleren bij mounten
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { handleCheck(); }, []);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<CheckResult>("/api/testament/juridische-check");
      setResult(data);
    } catch {
      setError(t("foutmelding"));
    } finally {
      setLoading(false);
    }
  };

  const ernstKleur = (ernst: string) => {
    switch (ernst) {
      case "hoog": return "border-danger bg-danger-100";
      case "middel": return "border-warning bg-warning-100";
      case "info": return "border-info bg-info-100";
      default: return "border-muted bg-muted/30";
    }
  };

  const ernstIcon = (ernst: string) => {
    switch (ernst) {
      case "hoog": return <AlertTriangle className="h-4 w-4 text-danger shrink-0" />;
      case "middel": return <AlertTriangle className="h-4 w-4 text-warning shrink-0" />;
      case "info": return <Info className="h-4 w-4 text-info shrink-0" />;
      default: return <Info className="h-4 w-4 shrink-0" />;
    }
  };

  const ernstLabel = (ernst: string) => {
    switch (ernst) {
      case "hoog": return t("ernstHoog");
      case "middel": return t("ernstMiddel");
      case "info": return t("ernstInfo");
      default: return ernst;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LumioIcon name="shield-check" size="md" /> {t("titel")}
        </CardTitle>
        <CardDescription>
          {t("beschrijving")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleCheck} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LumioIcon name="shield-check" size="sm" className="mr-2" />
          )}
          {t("controleUitvoeren")}
        </Button>

        {error && (
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-3">
            {result.aantalWaarschuwingen === 0 ? (
              <Alert variant="success">
                <AlertTitle>{t("geenWaarschuwingen")}</AlertTitle>
                <AlertDescription>{t("geenWaarschuwingenTekst")}</AlertDescription>
              </Alert>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {t("aantalWaarschuwingen", { aantal: result.aantalWaarschuwingen })}
                </p>
                {result.waarschuwingen.map((w, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-4 animate-[fadeSlideIn_300ms_ease-out_both] ${ernstKleur(w.ernst)}`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      {ernstIcon(w.ernst)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium uppercase tracking-wide">
                            {w.categorie}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-white/60">
                            {ernstLabel(w.ernst)}
                          </span>
                        </div>
                        <p className="text-sm">{w.melding}</p>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          💡 {w.suggestie}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            <p className="text-xs text-muted-foreground italic">
              {t("disclaimer")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
