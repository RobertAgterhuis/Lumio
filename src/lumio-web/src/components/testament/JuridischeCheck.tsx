"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle, Loader2, ChevronDown, RefreshCw } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);

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

  /* Severity summary badges */
  const severityBadges = () => {
    if (!result || result.aantalWaarschuwingen === 0) return null;
    const counts = { hoog: 0, middel: 0, info: 0 };
    result.waarschuwingen.forEach((w) => { counts[w.ernst] = (counts[w.ernst] || 0) + 1; });
    return (
      <div className="flex items-center gap-1.5">
        {counts.hoog > 0 && <Badge variant="soft-danger">{counts.hoog} {t("ernstHoog")}</Badge>}
        {counts.middel > 0 && <Badge variant="soft-warning">{counts.middel} {t("ernstMiddel")}</Badge>}
        {counts.info > 0 && <Badge variant="soft-info">{counts.info} {t("ernstInfo")}</Badge>}
      </div>
    );
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* ── Compact summary bar ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LumioIcon name="shield-check" size="sm" className="text-primary shrink-0" />
        <span className="text-sm font-semibold flex-1">{t("titel")}</span>

        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {error && <Badge variant="soft-danger">{t("controleMislukt")}</Badge>}
        {result && result.aantalWaarschuwingen === 0 && (
          <Badge variant="soft-success">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("geenWaarschuwingen")}
          </Badge>
        )}
        {severityBadges()}

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 shrink-0"
          onClick={(e) => { e.stopPropagation(); handleCheck(); }}
          disabled={loading}
          aria-label={t("controleUitvoeren")}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>

        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Expandable detail panel ── */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-2 space-y-3 border-t">
            <p className="text-sm text-muted-foreground">{t("beschrijving")}</p>

            {error && (
              <Alert variant="danger">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && result.aantalWaarschuwingen === 0 && (
              <Alert variant="success">
                <AlertTitle>{t("geenWaarschuwingen")}</AlertTitle>
                <AlertDescription>{t("geenWaarschuwingenTekst")}</AlertDescription>
              </Alert>
            )}

            {result && result.aantalWaarschuwingen > 0 && (
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
        </div>
      </div>
    </div>
  );
}
