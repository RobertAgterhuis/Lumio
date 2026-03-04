"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Lightbulb, Loader2, CheckCircle, Link2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDomainQuery } from "@/hooks";

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
}

export function ProfielSuggesties({ profileIsEmpty }: ProfielSuggestiesProps) {
  // S4-07: Auto-load via useDomainQuery (5-min cache)
  const { data: result, isLoading, isError, refetch, isFetching } = useDomainQuery<SuggestieResult>(
    "status/suggesties",
    { staleTime: 5 * 60 * 1000 }
  );
  const t = useTranslations("dashboard.suggesties");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" /> {t("titel")}
        </CardTitle>
        <CardDescription>
          {t("beschrijving")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => refetch()} disabled={isFetching} variant="outline">
          {isFetching ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {t("analyseren")}
        </Button>

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
                        <p className="text-sm font-medium">
                          {t("profielLeeg")}
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          {t("profielLeegBeschrijving")}
                        </p>
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
                        <p className="text-sm font-medium">
                          {t("geenSuggesties")}
                        </p>
                        <p className="text-xs mt-1">
                          {t("geenSuggestiesBeschrijving")}
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {t("aantalGevonden", { aantal: result.aantalSuggesties })}
                </p>
                {result.suggesties.map((s, i) => (
                  <Alert key={i} variant="info">
                    <AlertDescription>
                      <div className="flex items-start gap-3">
                        <Link2 className="h-4 w-4 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium uppercase tracking-wide">
                            {s.categorie}
                          </span>
                          <p className="text-sm mt-1">{s.melding}</p>
                          {s.actie && (
                            <p className="text-xs mt-2 italic">
                              💡 {s.actie}
                            </p>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

