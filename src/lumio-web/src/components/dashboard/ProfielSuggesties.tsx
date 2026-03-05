"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Lightbulb, Loader2, CheckCircle, Link2, RefreshCw, ChevronDown, ChevronUp, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDomainQuery } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Suggestie {
  categorie: string;
  melding: string;
  actie?: string;
}

interface SuggestieResult {
  aantalSuggesties: number;
  suggesties: Suggestie[];
}

interface ProfielSuggestiesProps {
  profileIsEmpty?: boolean;
  onHide?: () => void;
}

export function ProfielSuggesties({ profileIsEmpty, onHide }: ProfielSuggestiesProps) {
  // S4-07: Auto-load via useDomainQuery (5-min cache)
  const { data: result, isLoading, isError, refetch, isFetching } = useDomainQuery<SuggestieResult>(
    "status/suggesties",
    { staleTime: 5 * 60 * 1000 }
  );
  const t = useTranslations("dashboard.suggesties");
  const tDash = useTranslations("dashboard");
  const [expanded, setExpanded] = useState(false);

  const badge = (() => {
    if (isLoading || isFetching) {
      return (
        <Badge variant="secondary">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          {t("laden")}
        </Badge>
      );
    }

    if (isError) {
      return <Badge variant="soft-danger">{t("analyseMislukt")}</Badge>;
    }

    if (!result) return null;

    if (result.aantalSuggesties === 0) {
      return (
        <Badge variant="soft-success">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t("geenSuggesties")}
        </Badge>
      );
    }

    return <Badge variant="soft-info">{t("aantalGevonden", { aantal: result.aantalSuggesties })}</Badge>;
  })();

  return (
    <Card className={cn("overflow-hidden", !expanded && "h-14") }>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full h-14 px-4 flex items-center gap-2 text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Lightbulb className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold flex-1">{t("titel")}</span>
        {badge}
        {onHide && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onHide();
            }}
            aria-label={tDash("verbergen")}
          >
            <EyeOff className="h-3.5 w-3.5 mr-1" />
            {tDash("verbergen")}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            refetch();
          }}
          disabled={isFetching}
          aria-label={t("analyseren")}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <CardContent className="pt-4 space-y-3 animate-[fadeSlideIn_220ms_ease-out_both]">
          <CardDescription>{t("beschrijving")}</CardDescription>

          {isLoading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="h-5 w-5 rounded bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <Alert variant="danger">
              <AlertDescription>{t("fout")}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-3">
              {result.aantalSuggesties === 0 ? (
                profileIsEmpty ? (
                  <Alert>
                    <AlertDescription>
                      <div className="flex items-center gap-3">
                        <Lightbulb className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{t("profielLeeg")}</p>
                          <p className="text-xs mt-1 text-muted-foreground">{t("profielLeegBeschrijving")}</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="success">
                    <AlertDescription>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{t("geenSuggesties")}</p>
                          <p className="text-xs mt-1">{t("geenSuggestiesBeschrijving")}</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )
              ) : (
                result.suggesties.map((s, i) => (
                  <Alert key={i} variant="info" className="animate-[fadeSlideIn_300ms_ease-out_both]" style={{ animationDelay: `${i * 80}ms` }}>
                    <AlertDescription>
                      <div className="flex items-start gap-3">
                        <Link2 className="h-4 w-4 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium uppercase tracking-wide">{s.categorie}</span>
                          <p className="text-sm mt-1">{s.melding}</p>
                          {s.actie && <p className="text-xs mt-2 italic">💡 {s.actie}</p>}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

